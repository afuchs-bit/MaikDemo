// assets/js/anfrage.js
// Kurzanfrage auf der Startseite. Es gibt bewusst keine Auswahl mehr zwischen
// kurzem Formular und Assistent: Das kurze Formular ist der einzige sichtbare
// und erreichbare Anfrageweg.
//
// AP-304: Die Leistungsauswahl (Chips) ist entfernt, und das Freitextfeld steht
// dauerhaft offen. Damit entfaellt die gesamte Chip- und Aufklapp-Logik aus
// AP-246; das Formular braucht hier nur noch Zeitstempel und Submit-Hinweis.

(() => {
  'use strict';

  const kurzForm = document.querySelector('form[data-anf-form]');
  if (!kurzForm) return;

  document.querySelectorAll('[data-anf-modus]').forEach((bereich) => {
    const istKurz = bereich === kurzForm;
    bereich.hidden = !istKurz;
    if (istKurz) {
      bereich.removeAttribute('inert');
      bereich.removeAttribute('aria-hidden');
    } else {
      bereich.setAttribute('inert', '');
      bereich.setAttribute('aria-hidden', 'true');
    }
  });

  // --- Zeitstempel fuer die spaetere serverseitige Zeitfalle ---
  if (kurzForm) {
    const stempel = kurzForm.querySelector('[data-anf-zeitstempel]');
    if (stempel) stempel.value = String(Date.now());
  }

  // --- Foto aufbereiten: verkleinern und von Metadaten befreien ----------------
  // AP-327: In den EXIF-Daten eines Handyfotos stehen GPS-Koordinaten, Aufnahmezeit
  // und Geraetekennung. Ein Gartenfoto verriete damit die Wohnadresse, bevor der
  // Kunde sie selbst genannt hat. Wird das Bild ueber ein Canvas neu gezeichnet,
  // entstehen die Bytes neu - es gibt keinen Weg, die Metadaten versehentlich doch
  // mitzuschicken, weil sie schlicht nicht mehr existieren.
  //
  // Zweiter Grund: Vercel nimmt hoechstens 4,5 MB Request-Body an. Ein Handyfoto hat
  // heute 3-6 MB. Ohne diesen Schritt scheitert schon das erste Bild.
  //
  // Warum ein <img> und nicht createImageBitmap: Browser wenden die EXIF-Drehung auf
  // <img> von sich aus an (image-orientation: from-image ist der Ausgangswert), und
  // drawImage uebernimmt das gedrehte Ergebnis. Bei createImageBitmap haengt das an
  // einer Option, die aeltere Fassungen ignorieren - dann laegen Hochkantfotos quer
  // im Anhang. Ein Pfad, der ueberall stimmt, ist zwei Pfaden mit Fallunterscheidung
  // vorzuziehen. HEIC von iPhones dekodiert Safari dabei ueber den Systemcodec.

  const GROESSTE_KANTE = 1600;
  const ZIEL_BYTES = 1200000;
  const MAX_FOTOS = 3;

  const bildLaden = (datei) => new Promise((erfuellen, ablehnen) => {
    const adresse = URL.createObjectURL(datei);
    const bild = new Image();
    bild.onload = () => { URL.revokeObjectURL(adresse); erfuellen(bild); };
    bild.onerror = () => { URL.revokeObjectURL(adresse); ablehnen(new Error('dekodieren')); };
    bild.src = adresse;
  });

  const fotoAufbereiten = async (datei, index) => {
    const bild = await bildLaden(datei);
    const kante = Math.max(bild.naturalWidth, bild.naturalHeight);
    if (!kante) throw new Error('dekodieren');

    const faktor = Math.min(1, GROESSTE_KANTE / kante);
    const flaeche = document.createElement('canvas');
    flaeche.width = Math.max(1, Math.round(bild.naturalWidth * faktor));
    flaeche.height = Math.max(1, Math.round(bild.naturalHeight * faktor));
    flaeche.getContext('2d').drawImage(bild, 0, 0, flaeche.width, flaeche.height);

    // Absteigende Guete, bis das Bild unter die Zielgroesse passt. Der Abbruch bei
    // 0.3 ist Absicht: darunter wird aus einem Foto ein Klotzmuster, und ein
    // unbrauchbares Bild hilft bei der Einschaetzung des Gartens niemandem.
    let guete = 0.72;
    let klecks = null;
    for (;;) {
      klecks = await new Promise((f) => flaeche.toBlob(f, 'image/jpeg', guete));
      if (!klecks) throw new Error('kodieren');
      if (klecks.size <= ZIEL_BYTES || guete <= 0.3) break;
      guete -= 0.12;
    }

    // Der Originalname wird verworfen. Er traegt oft den Kundennamen ("Garten
    // Mueller.jpg"), manchmal Pfadzeichen, und er wird spaeter zum Dateinamen eines
    // E-Mail-Anhangs - eine Stelle, an der man nichts Ungeprueftes durchreichen will.
    return new File([klecks], 'foto-' + (index + 1) + '.jpg', {
      type: 'image/jpeg',
      lastModified: Date.now()
    });
  };

  // --- Versand: es gibt keinen Endpunkt, also gibt es keinen Erfolgszustand ---
  // Das Formular bleibt stehen und nennt die Wege, die tatsaechlich funktionieren.
  // [OFFEN: Wortlaut des Hinweises durch den Auftraggeber bestaetigen lassen.
  //  Er darf nicht nach "gesendet" klingen. Siehe docs/offene-punkte.md.]
  const HINWEIS =
    'Der Formularversand ist noch nicht aktiv. Ihre Anfrage erreicht uns bis dahin ' +
    'telefonisch unter <a href="tel:+491711738943">0171 / 173 89 43</a>, ' +
    'per <a href="https://wa.me/491711738943" target="_blank" rel="noopener">WhatsApp</a> ' +
    'oder per E-Mail an <a href="mailto:maik@rohdich.de">maik@rohdich.de</a>.';

  const DANK =
    'Vielen Dank \u2014 Ihre Anfrage ist eingegangen. Maik Rohdich sieht sie sich ' +
    'pers\u00f6nlich an und meldet sich bei Ihnen.';

  // --- Bedienteile -------------------------------------------------------------
  const status = kurzForm.querySelector('[data-anf-status]');
  const knopf = kurzForm.querySelector('[data-anf-senden]');
  const knopfText = kurzForm.querySelector('.anf-senden__label');
  const fotoEingang = kurzForm.querySelector('[data-anf-fotos]');
  const fotoAuswahl = kurzForm.querySelector('[data-anf-foto-auswahl]');
  const freigabeZeile = kurzForm.querySelector('[data-anf-foto-freigabe]');
  const freigabeHaken = freigabeZeile && freigabeZeile.querySelector('input');
  const fotoHuelle = fotoEingang && fotoEingang.closest('.anf__foto');

  // AP-330: Der Endpunkt entscheidet ueber alles. Ohne ihn bleibt die Seite genau
  // so, wie sie heute ist - samt Hinweis auf Telefon, WhatsApp und E-Mail. Der
  // Foto-Block wird erst aufgedeckt, wenn es jemanden gibt, der ihn entgegennimmt.
  const endpunkt = (kurzForm.dataset.endpoint || '').trim();

  // AP-350: Die Kachel steht immer im Markup - der Auftraggeber will die Seite so
  // sehen, wie sie fertig aussieht. Am Endpunkt haengt nur noch, ob tatsaechlich
  // versendet wird.
  // AP-351: Der Hinweis auf WhatsApp ist aus der Rechtszeile entfernt; damit
  // entfaellt auch das Aufraeumen, das hier stand.

  // --- Fotoauswahl -------------------------------------------------------------
  let vorbereitet = [];

  const inKB = (bytes) => bytes >= 1048576
    ? (bytes / 1048576).toFixed(1).replace('.', ',') + ' MB'
    : Math.ceil(bytes / 1024) + ' KB';

  // Leerer Text heisst: nichts zu melden, Zeile verschwindet. Der erklaerende
  // Satz steht seit AP-350 unten bei den rechtlichen Angaben, nicht mehr hier.
  const fotoMeldung = (text, fehlerhaft) => {
    if (fotoAuswahl) {
      fotoAuswahl.textContent = text;
      fotoAuswahl.hidden = !text;
    }
    if (fotoHuelle) fotoHuelle.classList.toggle('is-invalid', Boolean(fehlerhaft));
  };

  const freigabeZeigen = (sichtbar) => {
    if (!freigabeZeile) return;
    freigabeZeile.hidden = !sichtbar;
    freigabeZeile.classList.remove('is-invalid');
    // Ein stehengebliebener Haken duerfte sonst fuer Bilder gelten, die es
    // gar nicht mehr gibt.
    if (!sichtbar && freigabeHaken) freigabeHaken.checked = false;
  };

  const fotosZuruecksetzen = () => {
    vorbereitet = [];
    if (fotoEingang) fotoEingang.value = '';
    fotoMeldung('', false);
    freigabeZeigen(false);
  };

  if (fotoEingang) {
    fotoEingang.addEventListener('change', async () => {
      const gewaehlt = Array.from(fotoEingang.files || []);
      vorbereitet = [];

      if (!gewaehlt.length) { fotosZuruecksetzen(); return; }

      if (gewaehlt.length > MAX_FOTOS) {
        fotoMeldung('Bitte höchstens ' + MAX_FOTOS + ' Bilder auswählen.', true);
        freigabeZeigen(false);
        return;
      }

      fotoMeldung('Bilder werden vorbereitet …', false);
      try {
        for (let i = 0; i < gewaehlt.length; i++) {
          vorbereitet.push(await fotoAufbereiten(gewaehlt[i], i));
        }
      } catch (fehler) {
        vorbereitet = [];
        fotoMeldung('Ein Bild ließ sich nicht lesen. Bitte ein anderes Format wählen ' +
          'oder das Foto per WhatsApp schicken.', true);
        freigabeZeigen(false);
        return;
      }

      const gesamt = vorbereitet.reduce((summe, datei) => summe + datei.size, 0);
      fotoMeldung(vorbereitet.map((d) => d.name).join(', ') + ' · ' + inKB(gesamt), false);
      freigabeZeigen(true);
    });
  }

  // --- Versand -----------------------------------------------------------------
  const melden = (art, html) => {
    if (!status) return;
    status.setAttribute('data-art', art);
    status.innerHTML = html;
  };

  const knopfSperren = (gesperrt, beschriftung) => {
    if (knopf) knopf.disabled = gesperrt;
    if (knopfText && beschriftung) knopfText.textContent = beschriftung;
  };

  kurzForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (!status) return;

    // AP-350: Die Einwilligung wird vor dem Endpunkt geprueft. Sonst zeigte die
    // Vorschau nur den Hinweis, ohne das Haekchen je zu verlangen - und genau
    // dieses Verhalten soll schon jetzt aussehen wie spaeter.
    if (vorbereitet.length && freigabeHaken && !freigabeHaken.checked) {
      freigabeZeile.classList.add('is-invalid');
      freigabeHaken.focus({ preventScroll: true });
      freigabeZeile.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }

    // Ohne Endpunkt wird nichts gesendet, also gibt es auch keinen Erfolgszustand.
    // Der Honeypot-Pfad fuehrt bewusst auf denselben Hinweis: ein echter Mensch mit
    // Browser-Autofill darf nicht faelschlich hoeren, seine Anfrage sei eingegangen.
    if (!endpunkt) { melden('hinweis', HINWEIS); return; }

    const daten = new FormData(kurzForm);
    // Die Originale muessen raus: im Formular haengen die unbearbeiteten Dateien
    // mit ihren Metadaten. Nur die aufbereiteten Fassungen duerfen das Geraet
    // verlassen.
    daten.delete('fotos');
    vorbereitet.forEach((datei) => daten.append('fotos', datei));

    const ursprung = knopfText ? knopfText.textContent : '';
    knopfSperren(true, 'Wird gesendet …');
    melden('', '');

    try {
      const antwort = await fetch(endpunkt, {
        method: 'POST',
        body: daten,
        headers: { Accept: 'application/json' }
      });
      const ergebnis = await antwort.json().catch(() => null);
      if (!antwort.ok || !ergebnis || ergebnis.ok !== true) throw new Error('abgelehnt');

      kurzForm.reset();
      fotosZuruecksetzen();
      const stempel = kurzForm.querySelector('[data-anf-zeitstempel]');
      if (stempel) stempel.value = String(Date.now());
      knopfSperren(false, ursprung);
      melden('erfolg', DANK);
    } catch (fehler) {
      knopfSperren(false, ursprung);
      // Der Weg darf nicht an der Technik enden: die drei Kanaele, die sicher
      // funktionieren, stehen hier noch einmal.
      melden('hinweis', HINWEIS);
    }
  });

})();
