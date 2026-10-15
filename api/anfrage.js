// api/anfrage.js
// AP-329 - Empfaenger fuer das Kurzanfrageformular der Startseite.
//
// Die Funktion nimmt das Formular entgegen, prueft es und schickt es als E-Mail
// an das vorhandene Postfach weiter. Danach ist nichts mehr da: keine Datenbank,
// kein Dateispeicher, kein Schreibzugriff nach /tmp, keine Aufbewahrungsfrist.
// Bei SMTP ist das Postfach der einzige Ablageort. Fuer die lokale Vorschau
// steht alternativ FormSubmit bereit; dessen Aufbewahrung ist im README erwaehnt.
//
// Signatur: der fetch-Web-Standard-Export. Der klassische (request, response)-
// Handler von Vercel fuellt request.body nur bei JSON, urlencoded, text/plain und
// octet-stream - multipart/form-data steht nicht in der Liste. Ueber das
// Web-Request-Objekt gibt es request.formData() ohne jede Zusatzabhaengigkeit.
//
// Laufzeit: Node.js, zwingend. Die Edge-Laufzeit hat kein net und kein tls, also
// kein SMTP.

import nodemailer from 'nodemailer';

// --- Grenzen -----------------------------------------------------------------
// Vercel nimmt hoechstens 4,5 MB Request-Body an und antwortet darueber mit 413.
// Die Gesamtgrenze liegt bewusst darunter: der Rest ist Puffer fuer Formularfelder
// und den multipart-Rahmen.
const MAX_DATEIEN = 6;
const MAX_JE_DATEI = 1_500_000;
const MAX_GESAMT = 3_500_000;

// Zeitfalle: wer in unter drei Sekunden ausfuellt und absendet, tippt nicht.
// Nach oben eine Grenze, damit ein uralter Zeitstempel nicht ewig gueltig bleibt.
const MIN_VERWEILDAUER_MS = 3_000;
const MAX_ALTER_MS = 24 * 60 * 60 * 1000;

const LAENGEN = { name: 120, kontakt: 160, nachricht: 4000 };

// Die ersten Bytes, nicht die Dateiendung. Die Endung ist eine Behauptung des
// Absenders; diese Bytes sind es nicht.
//
// HEIC fehlt hier mit Absicht: der Browser wandelt jedes Bild in JPEG um, bevor es
// losgeht (anfrage.js, fotoAufbereiten). Was hier ankommt, ist JPEG - PNG und WebP
// stehen nur fuer den Fall, dass jemand am Browser vorbei sendet.
const MAGIE = {
  'image/jpeg': (b) => b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF,
  'image/png': (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47,
  'image/webp': (b) =>
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
};

const EMAIL_MUSTER = /^[^\s@,;:<>"]+@[^\s@,;:<>"]+\.[A-Za-z]{2,}$/;
const kontaktGueltig = (wert) => EMAIL_MUSTER.test(wert) ||
  (/^\+?[\d\s().\/-]+$/.test(wert) && (wert.match(/\d/g) || []).length >= 6 && (wert.match(/\d/g) || []).length <= 20);

// --- Werkzeuge ---------------------------------------------------------------

// Einzeilig: alle Steuerzeichen raus, auch Zeilenumbrueche. Diese Werte landen in
// Betreff und Reply-To - mit einem eingeschmuggelten \r\n liessen sich dort eigene
// Kopfzeilen anhaengen.
const einzeilig = (wert, maximal) =>
  String(wert ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maximal);

// Mehrzeilig: Zeilenumbrueche bleiben, der Rest faellt weg.
const mehrzeilig = (wert, maximal) =>
  String(wert ?? '').replace(/\r\n?/g, '\n').replace(/[\u0000-	\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, maximal);

const antwort = (ok, status = 200, code, fields) =>
  new Response(JSON.stringify({ ok, ...(code ? { code } : {}), ...(fields ? { fields } : {}) }), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  });

// Der Versender haengt am Modul, nicht am Aufruf: eine warme Instanz benutzt die
// bestehende Verbindung weiter. Beim Kaltstart wird neu verbunden - deshalb die
// Zeitgrenzen, damit ein toter Host schnell aufgibt statt die Funktion auszusitzen.
let versender = null;
const versenderHolen = () => {
  if (versender) return versender;
  const port = Number(process.env.SMTP_PORT || 587);
  versender = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,          // 465 implizites TLS, 587 STARTTLS. Port 25 ist bei Vercel gesperrt.
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 8_000,
    greetingTimeout: 8_000,
    socketTimeout: 12_000
  });
  return versender;
};

// --- Handler -----------------------------------------------------------------

export default {
  async fetch(request) {
    if (request.method !== 'POST') return antwort(false, 405, 'method');

    const art = request.headers.get('content-type') || '';
    if (!art.toLowerCase().startsWith('multipart/form-data')) return antwort(false, 415, 'request_format');

    let daten;
    try {
      daten = await request.formData();
    } catch {
      return antwort(false, 400, 'request_format');
    }

    // --- Spamfallen ----------------------------------------------------------
    // Der Honeypot verraet Bots nicht, woran sie gescheitert sind.
    if (einzeilig(daten.get('_hp_website'), 200)) return antwort(true);

    // --- Textfelder ----------------------------------------------------------
    const name = einzeilig(daten.get('name'), LAENGEN.name + 1);
    const kontakt = einzeilig(daten.get('kontakt'), LAENGEN.kontakt + 1);
    const nachricht = mehrzeilig(daten.get('nachricht'), LAENGEN.nachricht + 1);
    const felder = {};
    if (!name) felder.name = 'Bitte geben Sie Ihren Namen ein.';
    else if (name.length > LAENGEN.name) felder.name = 'Bitte kürzen Sie Ihren Namen auf höchstens 120 Zeichen.';
    if (!kontakt) felder.kontakt = 'Bitte geben Sie eine Telefonnummer oder E-Mail-Adresse an, damit wir Sie erreichen können.';
    else if (kontakt.length > LAENGEN.kontakt || !kontaktGueltig(kontakt)) felder.kontakt = 'Bitte geben Sie eine gültige Telefonnummer oder E-Mail-Adresse ein.';
    if (!nachricht) felder.nachricht = 'Bitte beschreiben Sie kurz Ihr Vorhaben. Fotos ergänzen die Beschreibung.';
    else if (nachricht.length > LAENGEN.nachricht) felder.nachricht = 'Bitte kürzen Sie Ihre Beschreibung auf höchstens 4.000 Zeichen.';
    if (Object.keys(felder).length) return antwort(false, 422, 'validation', felder);

    // Autofill kann schneller als die Zeitfalle sein. Echte Anfragen duerfen dann
    // keinen vorgetaeuschten Erfolg erhalten, sondern koennen erneut senden.
    const geladen = Number(daten.get('geladen_um'));
    const verweilt = Number.isFinite(geladen) && geladen > 0 ? Date.now() - geladen : null;
    if (verweilt === null || verweilt > MAX_ALTER_MS || verweilt < 0) return antwort(false, 422, 'form_expired');
    if (verweilt < MIN_VERWEILDAUER_MS) return antwort(false, 422, 'form_too_fast');

    // --- Dateien -------------------------------------------------------------
    // AP-603: Der Browser sendet fotos[] (fuer PHP); fotos bleibt fuer alte Seitenstaende.
    const roh = [...daten.getAll('fotos'), ...daten.getAll('fotos[]')].filter((f) => typeof f === 'object' && f && typeof f.arrayBuffer === 'function' && f.size > 0);
    if (roh.length > MAX_DATEIEN) return antwort(false, 422, 'validation', { fotos: 'Bitte wählen Sie höchstens sechs Fotos aus.' });

    let gesamt = 0;
    const anhaenge = [];
    for (let i = 0; i < roh.length; i++) {
      const datei = roh[i];
      if (datei.size > MAX_JE_DATEI) return antwort(false, 413, 'validation', { fotos: 'Foto ' + (i + 1) + ' ist zu groß. Bitte wählen Sie eine kleinere Datei aus.' });
      gesamt += datei.size;
      if (gesamt > MAX_GESAMT) return antwort(false, 413, 'validation', { fotos: 'Die Fotos sind zusammen zu groß. Bitte entfernen Sie ein Foto oder wählen Sie kleinere Dateien aus.' });

      const typ = String(datei.type || '').toLowerCase();
      const pruefer = MAGIE[typ];
      if (!pruefer) return antwort(false, 415, 'validation', { fotos: 'Foto ' + (i + 1) + ' hat kein unterstütztes Bildformat. Bitte wählen Sie JPG, PNG oder WebP.' });

      const bytes = Buffer.from(await datei.arrayBuffer());
      if (bytes.length < 12 || !pruefer(bytes)) return antwort(false, 415, 'validation', { fotos: 'Foto ' + (i + 1) + ' konnte nicht gelesen werden. Bitte entfernen Sie es und wählen Sie eine andere Bilddatei aus.' });

      // Der Dateiname wird hier vergeben, nicht uebernommen: der mitgeschickte
      // Name ist eine Eingabe des Absenders und wird gleich zum Anhangsnamen.
      const endung = typ === 'image/png' ? 'png' : typ === 'image/webp' ? 'webp' : 'jpg';
      anhaenge.push({ filename: `foto-${i + 1}.${endung}`, content: bytes, contentType: typ });
    }

    // Wer Bilder schickt, bestaetigt die Rechte daran. Ohne Bilder gibt es nichts
    // zu bestaetigen - dann wird auch nicht gefragt.
    if (anhaenge.length && daten.get('foto_freigabe') !== '1') return antwort(false, 422, 'validation', { foto_freigabe: 'Bitte bestätigen Sie, dass Sie die ausgewählten Fotos weitergeben dürfen.' });

    // --- Versand -------------------------------------------------------------
    const empfaenger = process.env.EMPFAENGER;
    const absender = process.env.SMTP_ABSENDER || process.env.SMTP_USER;
    const testDienst = process.env.MAIL_TRANSPORT === 'formsubmit';
    if (!EMAIL_MUSTER.test(empfaenger || '') || (!testDienst && (!absender || !process.env.SMTP_HOST))) {
      console.error('anfrage: Umgebungsvariablen unvollstaendig');
      return antwort(false, 503, 'mail_unconfigured');
    }

    const zeilen = [
      `Name:    ${name || '(keine Angabe)'}`,
      `Kontakt: ${kontakt || '(keine Angabe)'}`,
      `Leistung: ${einzeilig(daten.get('leistung'), 200) || 'Allgemeine Gartenanfrage'}`,
      '',
      'Anliegen:',
      nachricht || '(keine Angabe)',
      '',
      anhaenge.length
        ? `${anhaenge.length} Foto${anhaenge.length > 1 ? 's' : ''} im Anhang. Ortsangaben wurden im Browser entfernt.`
        : 'Keine Fotos.',
      '',
      'Gesendet ueber das Anfrageformular auf rohdich.de.'
    ];

    try {
      if (testDienst) {
        // Der Testdienst bekommt nur dieselben geprueften Angaben und neu
        // kodierten Bilder wie der SMTP-Versand. Die Zieladresse bleibt serverseitig.
        const formular = new FormData();
        formular.set('Name', name || '(keine Angabe)');
        formular.set('Kontakt', kontakt || '(keine Angabe)');
        formular.set('Leistung', einzeilig(daten.get('leistung'), 200) || 'Allgemeine Gartenanfrage');
        formular.set('Anliegen', nachricht || '(keine Angabe)');
        formular.set('_subject', name ? `Gartenanfrage von ${name}` : 'Gartenanfrage über die Website');
        formular.set('_template', 'table');
        formular.set('_captcha', 'false');
        const formularURL = process.env.FORMULAR_URL || new URL(request.url).origin + '/';
        const rueckweg = new URL('?anfrage=gesendet', formularURL).href;
        formular.set('_url', formularURL);
        formular.set('_next', rueckweg);
        if (EMAIL_MUSTER.test(kontakt)) formular.set('_replyto', kontakt);
        anhaenge.forEach((anhang, i) => formular.append('attachment' + (i + 1), new Blob([anhang.content], { type: anhang.contentType }), anhang.filename));
        // Der native Endpunkt ist fuer multipart-Dateianhaenge dokumentiert.
        // Die Weiterleitung wird hier ausgewertet, der Browser bleibt im Formular.
        const result = await fetch('https://formsubmit.co/' + encodeURIComponent(empfaenger), {
          method: 'POST', body: formular, headers: { Accept: 'application/json', Referer: formularURL }, redirect: 'manual',
          signal: AbortSignal.timeout(12_000)
        });
        if ([302, 303].includes(result.status) && result.headers.get('location') === rueckweg) return antwort(true);
        const text = await result.text();
        if (/check\s+your\s+(?:inbox|email)|activate\s+(?:the|your)\s+form|confirm\s+your\s+email/i.test(text)) return antwort(false, 409, 'mail_activation_required');
        return antwort(false, 502, 'mail_failed');
      }
      // Abwarten ist Pflicht: sobald die Funktion antwortet, wird sie angehalten -
      // ein nicht abgewarteter Versand bliebe auf der Strecke.
      await versenderHolen().sendMail({
        // Absender ist immer das eigene Postfach. Stuende hier die Kundenadresse,
        // scheiterte SPF und die Anfrage landete im Spam-Ordner.
        from: absender,
        to: empfaenger,
        replyTo: EMAIL_MUSTER.test(kontakt) ? kontakt : undefined,
        subject: name ? `Gartenanfrage von ${name}` : 'Gartenanfrage über die Website',
        text: zeilen.join('\n'),
        attachments: anhaenge
      });
    } catch (fehler) {
      // Nur die Fehlerart ins Log, nie der Inhalt. Ein Funktionslog ist kein Ort
      // fuer den Namen, die Telefonnummer oder das Anliegen eines Kunden.
      console.error('anfrage: Versand fehlgeschlagen', fehler && fehler.code);
      return antwort(false, 502, 'mail_failed');
    }

    return antwort(true);
  }
};
