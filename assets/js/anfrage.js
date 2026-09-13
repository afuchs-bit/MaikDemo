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

  // --- AP-307: E-Mail-Kachel fuehrt ins Formular ---
  // Den Sprung macht der Anker selbst, also auch ohne JavaScript. Hier kommt
  // nur der Cursor dazu: preventScroll, damit der Fokus die Bewegung des Ankers
  // nicht unterbricht. Auf iOS oeffnet sich dabei die Tastatur - gewollt, der
  // Besucher soll sofort tippen koennen. Kein preventDefault, kein
  // synthetischer Klick: die Lehre aus AP-301 gilt weiter.
  const zumFormular = kurzForm.querySelector('[data-anf-zum-formular]');
  if (zumFormular) {
    zumFormular.addEventListener('click', () => {
      const feld = kurzForm.querySelector('#anf-name');
      if (feld) feld.focus({ preventScroll: true });
    });
  }

})();
