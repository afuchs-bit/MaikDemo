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

  if (kurzForm) {
    kurzForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const status = kurzForm.querySelector('[data-anf-status]');
      if (!status) return;
      // Der Honeypot-Pfad fuehrt bewusst auf denselben Hinweis, nicht auf eine
      // Erfolgsmeldung: ein echter Mensch mit Browser-Autofill darf nicht
      // faelschlich hoeren, seine Anfrage sei eingegangen.
      status.setAttribute('data-art', 'hinweis');
      status.innerHTML = HINWEIS;
    });
  }

})();
