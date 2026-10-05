// assets/js/anfrage.js
// Gemeinsame Kurzanfrage auf Start- und Leistungsseiten. Keine Auswahl zwischen
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
  const ZIEL_BYTES = 550000;
  const MAX_FOTOS = 6;

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
    // Sehr detailreiche Bilder koennen selbst bei kleiner Qualitaet zu gross
    // bleiben. Dann die Flaeche verkleinern, statt einen zu grossen Anhang senden.
    while (klecks.size > ZIEL_BYTES) {
      const kleiner = document.createElement('canvas');
      kleiner.width = Math.max(1, Math.round(flaeche.width * 0.8));
      kleiner.height = Math.max(1, Math.round(flaeche.height * 0.8));
      kleiner.getContext('2d').drawImage(flaeche, 0, 0, kleiner.width, kleiner.height);
      flaeche.width = kleiner.width;
      flaeche.height = kleiner.height;
      flaeche.getContext('2d').drawImage(kleiner, 0, 0);
      klecks = await new Promise((f) => flaeche.toBlob(f, 'image/jpeg', 0.6));
      if (!klecks) throw new Error('kodieren');
    }
    return new File([klecks], 'foto-' + (index + 1) + '.jpg', {
      type: 'image/jpeg',
      lastModified: Date.now()
    });
  };

  // Fallback fuer Seiten, auf denen kein Versandendpunkt eingetragen ist.
  const standardHinweis =
    'Der Formularversand ist noch nicht aktiv. Ihre Anfrage erreicht uns bis dahin ' +
    'telefonisch unter <a href="tel:+491711738943">0171 / 173 89 43</a>, ' +
    'per <a href="https://wa.me/491711738943" target="_blank" rel="noopener">WhatsApp</a> ' +
    'oder per E-Mail an <a href="mailto:maik@rohdich.de">maik@rohdich.de</a>.';
  const eigenerHinweis = kurzForm.querySelector('[data-anf-unavailable-copy]');
  const HINWEIS = eigenerHinweis && eigenerHinweis.innerHTML.trim()
    ? eigenerHinweis.innerHTML.trim()
    : standardHinweis;

  // --- Bedienteile -------------------------------------------------------------
  const status = kurzForm.querySelector('[data-anf-status]');
  const knopf = kurzForm.querySelector('[data-anf-senden]');
  const knopfText = kurzForm.querySelector('.anf-senden__label');
  const fotoEingang = kurzForm.querySelector('[data-anf-fotos]');
  const fotoAuswahl = kurzForm.querySelector('[data-anf-foto-auswahl]');
  const freigabeZeile = kurzForm.querySelector('[data-anf-foto-freigabe]');
  const freigabeHaken = freigabeZeile && freigabeZeile.querySelector('input');
  const fotoHuelle = fotoEingang && fotoEingang.closest('.anf__foto');
  const fotoWort = fotoHuelle && fotoHuelle.querySelector('.anf__foto-wort');
  const fotoStartWort = fotoWort ? fotoWort.textContent : 'Foto auswählen';

  // Der Empfaenger wird im Handler konfiguriert, niemals im Browser.
  const endpunkt = (kurzForm.dataset.endpoint || '').trim();

  // AP-350: Die Kachel steht immer im Markup - der Auftraggeber will die Seite so
  // sehen, wie sie fertig aussieht. Am Endpunkt haengt nur noch, ob tatsaechlich
  // versendet wird.
  // AP-351: Der Hinweis auf WhatsApp ist aus der Rechtszeile entfernt; damit
  // entfaellt auch das Aufraeumen, das hier stand.

  // --- Fotoauswahl -------------------------------------------------------------
  let vorbereitet = [];
  let fotosInArbeit = false;
  let versandLaeuft = false;
  let fotoGeneration = 0;
  const fotoVorschauen = fotoEingang && document.createElement('span');
  if (fotoVorschauen) {
    fotoVorschauen.className = 'anf__foto-vorschauen';
    fotoVorschauen.setAttribute('role', 'list');
    fotoVorschauen.setAttribute('aria-label', 'Ausgewählte Fotos');
    fotoVorschauen.hidden = true;
    fotoHuelle.after(fotoVorschauen);
    if (fotoAuswahl && fotoAuswahl.id === '') fotoAuswahl.id = fotoEingang.id + '-status';
    if (fotoAuswahl) fotoEingang.setAttribute('aria-describedby', fotoAuswahl.id);
  }

  const inKB = (bytes) => bytes >= 1048576
    ? (bytes / 1048576).toFixed(1).replace('.', ',') + ' MB'
    : Math.ceil(bytes / 1024) + ' KB';

  // Leerer Text heisst: nichts zu melden, Zeile verschwindet. Der erklaerende
  // Satz steht seit AP-350 unten bei den rechtlichen Angaben, nicht mehr hier.
  const fotoMeldung = (text, fehlerhaft) => {
    if (fotoAuswahl) {
      fotoAuswahl.textContent = text;
      fotoAuswahl.hidden = !text;
      fotoAuswahl.setAttribute('aria-invalid', String(Boolean(fehlerhaft)));
    }
    if (fotoHuelle) fotoHuelle.classList.toggle('is-invalid', Boolean(fehlerhaft));
    if (fotoEingang) fotoEingang.setAttribute('aria-invalid', String(Boolean(fehlerhaft)));
  };

  const freigabeZeigen = (sichtbar) => {
    if (!freigabeZeile) return;
    freigabeZeile.hidden = !sichtbar;
    if (!sichtbar) freigabeZeile.classList.remove('is-invalid');
    if (freigabeHaken) freigabeHaken.required = sichtbar;
    // Ein stehengebliebener Haken duerfte sonst fuer Bilder gelten, die es
    // gar nicht mehr gibt.
    if (!sichtbar && freigabeHaken) freigabeHaken.checked = false;
  };

  const fotoBedienung = () => {
    const gesperrt = fotosInArbeit || versandLaeuft;
    if (fotoEingang) fotoEingang.disabled = gesperrt;
    if (knopf) knopf.disabled = gesperrt;
    if (fotoHuelle) {
      fotoHuelle.classList.toggle('is-busy', gesperrt);
      fotoHuelle.setAttribute('aria-busy', String(fotosInArbeit));
    }
    if (fotoVorschauen) fotoVorschauen.querySelectorAll('button').forEach((b) => { b.disabled = gesperrt; });
  };

  const fotoStand = () => vorbereitet.length
    ? vorbereitet.length + ' von ' + MAX_FOTOS + ' Fotos · ' + inKB(vorbereitet.reduce((s, foto) => s + foto.datei.size, 0))
    : '';

  const fotosZeigen = () => {
    if (!fotoVorschauen) return;
    fotoVorschauen.replaceChildren();
    fotoVorschauen.hidden = !vorbereitet.length;
    if (fotoWort) fotoWort.textContent = vorbereitet.length ? 'Weitere Fotos hinzufügen' : fotoStartWort;
    vorbereitet.forEach((foto, index) => {
      const kachel = document.createElement('span');
      kachel.className = 'anf__foto-vorschau';
      kachel.setAttribute('role', 'listitem');
      const bild = document.createElement('img');
      bild.src = foto.adresse;
      bild.alt = 'Ausgewähltes Foto ' + (index + 1);
      bild.width = 160;
      bild.height = 120;
      const entfernen = document.createElement('button');
      entfernen.type = 'button';
      entfernen.className = 'anf__foto-entfernen';
      entfernen.setAttribute('aria-label', 'Foto ' + (index + 1) + ' entfernen');
      entfernen.title = 'Foto entfernen';
      entfernen.textContent = '×';
      entfernen.addEventListener('click', () => {
        if (fotosInArbeit || versandLaeuft) return;
        URL.revokeObjectURL(foto.adresse);
        vorbereitet = vorbereitet.filter((f) => f !== foto);
        fotosZeigen();
        kurzForm.dispatchEvent(new Event('anf:fotos-geaendert'));
        fotoMeldung(fotoStand() || 'Foto entfernt.', false);
        freigabeZeigen(Boolean(vorbereitet.length));
        // Nach dem Entfernen bleibt die Tastatur an derselben Stelle der Liste.
        const knoepfe = fotoVorschauen.querySelectorAll('button');
        (knoepfe[Math.min(index, knoepfe.length - 1)] || fotoEingang).focus({ preventScroll: true });
      });
      const beschriftung = document.createElement('span');
      beschriftung.className = 'anf__foto-name';
      beschriftung.textContent = 'Foto ' + (index + 1);
      kachel.append(bild, entfernen, beschriftung);
      fotoVorschauen.append(kachel);
    });
    fotoBedienung();
  };

  const fotosZuruecksetzen = () => {
    fotoGeneration++;
    vorbereitet.forEach((foto) => URL.revokeObjectURL(foto.adresse));
    vorbereitet = [];
    fotosInArbeit = false;
    if (fotoEingang) fotoEingang.value = '';
    fotosZeigen();
    fotoMeldung('', false);
    freigabeZeigen(false);
  };
  kurzForm.addEventListener('reset', fotosZuruecksetzen);

  if (fotoEingang) {
    fotoEingang.addEventListener('change', async () => {
      const gewaehlt = Array.from(fotoEingang.files || []);
      // Der Eingang ist nur der Dateiwaehler. Die Sammlung lebt unabhaengig
      // davon; so funktionieren Abbrechen und erneutes Auswaehlen derselben Datei.
      fotoEingang.value = '';
      if (!gewaehlt.length || fotosInArbeit || versandLaeuft) return;
      const schluessel = (datei) => [datei.name, datei.size, datei.lastModified].join(':');
      const bekannte = new Set(vorbereitet.map((foto) => foto.schluessel));
      const neue = gewaehlt.filter((datei) => {
        const key = schluessel(datei);
        if (bekannte.has(key)) return false;
        bekannte.add(key);
        return true;
      });
      if (!neue.length) { fotoMeldung('Diese Fotos sind bereits ausgewählt.', false); return; }
      if (vorbereitet.length + neue.length > MAX_FOTOS) {
        fotoMeldung('Bis zu ' + MAX_FOTOS + ' Fotos sind möglich. Bitte weniger auswählen oder ein Foto entfernen.', true);
        return;
      }

      const generation = fotoGeneration;
      fotosInArbeit = true;
      fotoBedienung();
      fotoMeldung('Bilder werden vorbereitet …', false);
      let fehlerAnzahl = 0;
      for (const original of neue) {
        try {
          const datei = await fotoAufbereiten(original, vorbereitet.length);
          if (generation !== fotoGeneration) return;
          vorbereitet.push({ datei, schluessel: schluessel(original), adresse: URL.createObjectURL(datei) });
        } catch (fehler) {
          if (generation !== fotoGeneration) return;
          fehlerAnzahl++;
        }
      }
      fotosInArbeit = false;
      fotosZeigen();
      kurzForm.dispatchEvent(new Event('anf:fotos-geaendert'));
      fotoMeldung(fehlerAnzahl
        ? fehlerAnzahl + ' Bild' + (fehlerAnzahl > 1 ? 'er konnten' : ' konnte') + ' nicht gelesen werden. Bitte JPG, PNG oder WebP verwenden. Bereits ausgewählte Fotos bleiben erhalten.'
        : fotoStand(), Boolean(fehlerAnzahl));
      freigabeZeigen(Boolean(vorbereitet.length));
    });
  }

  // --- Versand -----------------------------------------------------------------
  const melden = (art, html) => {
    if (!status) return;
    status.classList.remove('anf__status--karte');
    status.setAttribute('data-art', art);
    status.setAttribute('role', art === 'fehler' ? 'alert' : 'status');
    status.setAttribute('aria-live', art === 'fehler' ? 'assertive' : 'polite');
    status.innerHTML = html;
  };

  const statusKarte = (art, titel, text) => {
    melden(art, '');
    status.classList.add('anf__status--karte');
    const icon = document.createElement('span');
    icon.className = 'anf__status-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = art === 'fehler' ? '!' : art === 'erfolg' ? '✓' : 'i';
    const inhalt = document.createElement('span');
    inhalt.className = 'anf__status-inhalt';
    const kopf = document.createElement('strong');
    kopf.className = 'anf__status-titel';
    kopf.textContent = titel;
    inhalt.append(kopf);
    if (text) {
      const absatz = document.createElement('span');
      absatz.className = 'anf__status-text';
      absatz.textContent = text;
      inhalt.append(absatz);
    }
    status.append(icon, inhalt);
    return inhalt;
  };

  // Pflichtangaben und konkrete Feldhinweise werden vor dem Versand geprueft.
  // Der Handler wiederholt die Pruefung fuer Anfragen ohne Browservalidierung.
  const emailMuster = /^[^\s@,;:<>"]+@[^\s@,;:<>"]+\.[A-Za-z]{2,}$/;
  const kontaktGueltig = (wert) => emailMuster.test(wert) ||
    (/^\+?[\d\s().\/-]+$/.test(wert) && (wert.match(/\d/g) || []).length >= 6 && (wert.match(/\d/g) || []).length <= 20);
  const pflichtfelder = { name: 120, kontakt: 160, nachricht: 4000 };
  const feldElemente = {};
  const feldHinweise = {};
  let feldFehler = {};
  let statusIstValidierung = false;

  Object.entries(pflichtfelder).forEach(([name, maximal]) => {
    const eingabe = kurzForm.elements.namedItem(name);
    if (!eingabe) return;
    feldElemente[name] = eingabe;
    eingabe.required = true;
    eingabe.maxLength = maximal;
    const label = kurzForm.querySelector('label[for="' + eingabe.id + '"]');
    if (label) {
      const pflicht = document.createElement('span');
      pflicht.className = 'anf__pflicht';
      pflicht.textContent = ' (Pflichtfeld)';
      label.append(pflicht);
    }
    const hinweis = document.createElement('small');
    hinweis.className = 'anf__fehler';
    hinweis.id = eingabe.id + '-fehler';
    hinweis.hidden = true;
    eingabe.after(hinweis);
    const beschrieben = new Set((eingabe.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
    beschrieben.add(hinweis.id);
    eingabe.setAttribute('aria-describedby', [...beschrieben].join(' '));
    feldHinweise[name] = hinweis;
  });
  if (fotoEingang) feldElemente.fotos = fotoEingang;
  if (freigabeHaken) {
    feldElemente.foto_freigabe = freigabeHaken;
    const hinweis = document.createElement('small');
    hinweis.className = 'anf__fehler';
    hinweis.id = (freigabeHaken.id || 'anf-foto-freigabe') + '-fehler';
    hinweis.hidden = true;
    freigabeZeile.append(hinweis);
    freigabeHaken.setAttribute('aria-describedby', hinweis.id);
    feldHinweise.foto_freigabe = hinweis;
  }

  const feldPruefen = (name) => {
    const eingabe = feldElemente[name];
    const wert = eingabe ? eingabe.value.trim() : '';
    if (name === 'name') {
      if (!wert) return 'Bitte geben Sie Ihren Namen ein.';
      if (wert.length > 120) return 'Bitte kürzen Sie Ihren Namen auf höchstens 120 Zeichen.';
    }
    if (name === 'kontakt') {
      if (!wert) return 'Bitte geben Sie eine Telefonnummer oder E-Mail-Adresse an, damit wir Sie erreichen können.';
      if (wert.length > 160 || !kontaktGueltig(wert)) return 'Bitte geben Sie eine gültige Telefonnummer oder E-Mail-Adresse ein.';
    }
    if (name === 'nachricht') {
      if (!wert) return 'Bitte beschreiben Sie kurz Ihr Vorhaben. Fotos ergänzen die Beschreibung.';
      if (wert.length > 4000) return 'Bitte kürzen Sie Ihre Beschreibung auf höchstens 4.000 Zeichen.';
    }
    if (name === 'foto_freigabe' && vorbereitet.length && freigabeHaken && !freigabeHaken.checked) {
      return 'Bitte bestätigen Sie, dass Sie die ausgewählten Fotos weitergeben dürfen.';
    }
    return '';
  };

  const feldMarkieren = (name, text) => {
    const eingabe = feldElemente[name];
    if (!eingabe) return;
    if (text) eingabe.setAttribute('aria-invalid', 'true');
    else eingabe.removeAttribute('aria-invalid');
    if (feldHinweise[name]) {
      feldHinweise[name].textContent = text || '';
      feldHinweise[name].hidden = !text;
    }
    if (name === 'fotos') fotoMeldung(text || fotoStand(), Boolean(text));
    if (name === 'foto_freigabe' && freigabeZeile) freigabeZeile.classList.toggle('is-invalid', Boolean(text));
  };

  const fehlerZusammenfassen = () => {
    statusIstValidierung = true;
    const inhalt = statusKarte('fehler', 'Bitte prüfen Sie Ihre Angaben.');
    const liste = document.createElement('span');
    liste.className = 'anf__status-liste';
    liste.setAttribute('role', 'list');
    Object.entries(feldFehler).forEach(([name, text]) => {
      const punkt = document.createElement('span');
      punkt.className = 'anf__status-punkt';
      punkt.setAttribute('role', 'listitem');
      const link = document.createElement('a');
      link.href = '#' + (feldElemente[name].id || 'anf-fotos');
      link.textContent = text;
      link.addEventListener('click', (ev) => {
        ev.preventDefault();
        feldElemente[name].focus({ preventScroll: true });
        feldElemente[name].scrollIntoView({ block: 'center', behavior: 'auto' });
      });
      punkt.append(link);
      liste.append(punkt);
    });
    inhalt.append(liste);
  };

  const fehlerZeigen = (fehler) => {
    feldFehler = Object.fromEntries(Object.entries(fehler).filter(([name, text]) => feldElemente[name] && typeof text === 'string' && text));
    Object.keys(feldElemente).forEach((name) => feldMarkieren(name, feldFehler[name]));
    fehlerZusammenfassen();
    const zuerst = feldElemente[Object.keys(feldFehler)[0]];
    if (zuerst) {
      zuerst.focus({ preventScroll: true });
      zuerst.scrollIntoView({ block: 'center', behavior: 'auto' });
    }
  };

  const feldNeuPruefen = (name) => {
    if (!feldFehler[name]) return;
    const text = feldPruefen(name);
    if (text === feldFehler[name]) return;
    if (text) feldFehler[name] = text;
    else delete feldFehler[name];
    feldMarkieren(name, text);
    if (statusIstValidierung) {
      if (Object.keys(feldFehler).length) fehlerZusammenfassen();
      else { statusIstValidierung = false; melden('', ''); }
    }
  };
  Object.entries(feldElemente).forEach(([name, eingabe]) => {
    if (name === 'fotos') return;
    eingabe.addEventListener(name === 'foto_freigabe' ? 'change' : 'input', () => feldNeuPruefen(name));
  });
  kurzForm.addEventListener('anf:fotos-geaendert', () => {
    feldNeuPruefen('fotos');
    feldNeuPruefen('foto_freigabe');
  });
  kurzForm.addEventListener('reset', () => {
    feldFehler = {};
    statusIstValidierung = false;
    Object.keys(feldElemente).forEach((name) => feldMarkieren(name, ''));
    melden('', '');
  });

  const knopfSperren = (gesperrt, beschriftung) => {
    if (knopf) knopf.disabled = gesperrt;
    if (knopfText && beschriftung) knopfText.textContent = beschriftung;
  };

  kurzForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (!status) return;
    if (fotosInArbeit || versandLaeuft) return;

    const fehler = {};
    ['name', 'kontakt', 'nachricht', 'foto_freigabe'].forEach((name) => {
      const text = feldPruefen(name);
      if (text) fehler[name] = text;
    });
    if (Object.keys(fehler).length) { fehlerZeigen(fehler); return; }
    feldFehler = {};
    statusIstValidierung = false;
    Object.keys(feldElemente).forEach((name) => feldMarkieren(name, ''));

    // Ohne Endpunkt wird nichts gesendet, also gibt es auch keinen Erfolgszustand.
    // Der Honeypot-Pfad fuehrt bewusst auf denselben Hinweis: ein echter Mensch mit
    // Browser-Autofill darf nicht faelschlich hoeren, seine Anfrage sei eingegangen.
    if (!endpunkt) { melden('hinweis', HINWEIS); return; }

    const daten = new FormData(kurzForm);
    // Die Originale muessen raus: im Formular haengen die unbearbeiteten Dateien
    // mit ihren Metadaten. Nur die aufbereiteten Fassungen duerfen das Geraet
    // verlassen.
    daten.delete('fotos');
    vorbereitet.forEach((foto, index) => daten.append('fotos', foto.datei, 'foto-' + (index + 1) + '.jpg'));

    const ursprung = knopfText ? knopfText.textContent : '';
    versandLaeuft = true;
    fotoBedienung();
    knopfSperren(true, 'Wird gesendet …');
    melden('', '');

    try {
      const antwort = await fetch(endpunkt, {
        method: 'POST',
        body: daten,
        headers: { Accept: 'application/json' }
      });
      const ergebnis = await antwort.json().catch(() => null);
      if (!antwort.ok || !ergebnis || ergebnis.ok !== true) {
        const fehler = new Error('abgelehnt');
        fehler.code = ergebnis && ergebnis.code;
        fehler.fields = ergebnis && ergebnis.fields;
        fehler.status = antwort.status;
        throw fehler;
      }

      versandLaeuft = false;
      kurzForm.reset();
      const stempel = kurzForm.querySelector('[data-anf-zeitstempel]');
      if (stempel) stempel.value = String(Date.now());
      knopfSperren(false, ursprung);
      statusKarte('erfolg', 'Vielen Dank für Ihre Anfrage.', 'Ihre Anfrage wurde übermittelt. Unser Fachpersonal wird sich persönlich bei Ihnen melden.');
    } catch (fehler) {
      versandLaeuft = false;
      fotoBedienung();
      knopfSperren(false, ursprung);
      // Bei Fehlern bleibt die gesamte Anfrage zum erneuten Senden erhalten.
      if (fehler.fields && Object.keys(fehler.fields).some((name) => feldElemente[name])) {
        fehlerZeigen(fehler.fields);
      } else if (fehler.status === 413) {
        fehlerZeigen({ fotos: 'Die Fotos sind zusammen zu groß. Bitte entfernen Sie ein Foto oder wählen Sie kleinere Dateien aus.' });
      } else if (fehler.code === 'form_too_fast') {
        statusKarte('hinweis', 'Einen Moment bitte.', 'Bitte warten Sie kurz und klicken Sie dann noch einmal auf „Anfrage senden“. Ihre Angaben und Fotos bleiben erhalten.');
      } else if (fehler.code === 'form_expired') {
        const stempel = kurzForm.querySelector('[data-anf-zeitstempel]');
        if (stempel) stempel.value = String(Date.now() - 3000);
        statusKarte('hinweis', 'Das Formular war länger geöffnet.', 'Ihre Angaben und Fotos bleiben erhalten. Bitte klicken Sie noch einmal auf „Anfrage senden“.');
      } else if (fehler.code === 'mail_unconfigured') {
        statusKarte('hinweis', 'Der Formularversand ist noch nicht eingerichtet.', 'Ihre Angaben sind vollständig. Der E-Mail-Versand muss noch eingerichtet werden; Ihre Angaben und Fotos bleiben erhalten.');
      } else if (fehler.code === 'mail_activation_required') {
        statusKarte('hinweis', 'Der Testempfänger muss noch bestätigt werden.', 'Bitte bestätigen Sie die Aktivierungsmail im Postfach des Testempfängers. Ihre Angaben und Fotos bleiben erhalten.');
      } else if (!fehler.status) {
        statusKarte('fehler', 'Die Verbindung wurde unterbrochen.', 'Ihre Angaben und Fotos bleiben erhalten. Bitte prüfen Sie Ihre Internetverbindung und senden Sie die Anfrage anschließend erneut.');
      } else {
        statusKarte('fehler', 'Der Versand ist momentan nicht möglich.', 'Ihre Angaben sind vollständig, konnten aber vom Versanddienst nicht übermittelt werden. Ihre Angaben und Fotos bleiben erhalten. Bitte senden Sie die Anfrage etwas später erneut.');
      }
    }
  });

})();
