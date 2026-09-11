// assets/js/anfrage.js
// Kurzanfrage auf der Startseite. Es gibt bewusst keine Auswahl mehr zwischen
// kurzem Formular und Assistent: Das kurze Formular ist der einzige sichtbare
// und erreichbare Anfrageweg.

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

  // --- AP-246: Chips und Freitextfeld im Kurzformular ---
  // Ohne JavaScript bleiben die Chips sichtbar, aber wirkungslos, und das
  // Freitextfeld bleibt zu - die uebrigen Angaben sind trotzdem absendbar.
  const chipGruppe = kurzForm ? kurzForm.querySelector('[data-anf-chips]') : null;
  const themenFeld = kurzForm ? kurzForm.querySelector('[data-anf-themen]') : null;
  const mehrKnopf = kurzForm ? kurzForm.querySelector('[data-anf-mehr]') : null;
  const freiFeld = kurzForm ? kurzForm.querySelector('#anf-nachricht-feld') : null;

  function freitextZeigen(zeigen) {
    if (!mehrKnopf || !freiFeld) return;
    freiFeld.hidden = !zeigen;
    mehrKnopf.setAttribute('aria-expanded', zeigen ? 'true' : 'false');
  }

  // Die Auswahl wandert in ein verstecktes Feld, damit sie im Datensatz steht,
  // sobald es einen Endpunkt gibt. Heute wird nichts versendet.
  function themenSchreiben() {
    if (!chipGruppe || !themenFeld) return;
    const gewaehlt = Array.from(chipGruppe.querySelectorAll('[aria-pressed="true"]'))
      .map((chip) => chip.dataset.anfChip || chip.textContent.trim());
    themenFeld.value = gewaehlt.join(', ');
  }

  if (chipGruppe) {
    chipGruppe.addEventListener('click', (ev) => {
      const chip = ev.target.closest('.anf__chip');
      if (!chip || !chipGruppe.contains(chip)) return;
      const an = chip.getAttribute('aria-pressed') === 'true';
      chip.setAttribute('aria-pressed', an ? 'false' : 'true');
      themenSchreiben();
      // "Etwas anderes" oeffnet das Freitextfeld, weil die Chips dafuer keine
      // Kachel haben. Beim Abwaehlen bleibt es offen - wer schon getippt hat,
      // soll seinen Text nicht verlieren.
      if (chip.hasAttribute('data-anf-chip-frei') && !an) freitextZeigen(true);
    });
  }

  if (mehrKnopf) {
    mehrKnopf.addEventListener('click', () => {
      freitextZeigen(freiFeld ? freiFeld.hidden : true);
      if (freiFeld && !freiFeld.hidden) {
        const feld = freiFeld.querySelector('textarea');
        if (feld) feld.focus();
      }
    });
  }

})();
