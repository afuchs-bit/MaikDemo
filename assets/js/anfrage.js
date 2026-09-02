// assets/js/anfrage.js
// AP-F15 – Vorwahl vor dem Anfrageformular.
//
// Portiert aus der Vorlage anfrage.ts, reduziert auf das, was diese Bauform
// braucht. Uebernommen: die generische Modus-Umschaltung ueber [data-anf-modus]
// und die Wertuebernahme beim Wechsel. Nicht uebernommen: Schrittnavigation
// (die traegt der bestehende Assistent), Pflichtfeldpruefung (es gibt keine
// Pflichtfelder) und der fetch-Versand (es gibt keinen Endpunkt).
//
// WICHTIG – Unterschied zur Vorlage: Kurzformular und Assistent sind zwei
// getrennte <form>-Elemente. Die Vorlage deaktiviert die Felder des inaktiven
// Modus, damit sie nicht im selben Formular mitgesendet werden; getrennte
// Formulare senden ohnehin nur ihre eigenen Felder. Deshalb wird hier NICHT
// pauschal disabled gesetzt: der Assistent verwaltet seinen eigenen
// disabled-Zustand (Akutpfad), und ein Massen-disabled darueber wuerde genau
// den Fehler erzeugen, vor dem die Vorlage warnt – die Anfrage sieht im
// Browser vollstaendig aus und kaeme halb leer an.

(() => {
  'use strict';

  const vorwahl = document.querySelector('[data-anf-vorwahl]');
  if (!vorwahl) return;

  const bereiche = Array.from(document.querySelectorAll('[data-anf-modus]'));
  if (!bereiche.length) return;

  const kurzForm = document.querySelector('form[data-anf-form]');

  // Felder, die beim Moduswechsel mitwandern. Kurzformular und Assistent
  // fuehren dieselben name-Attribute, der Abgleich ist deshalb ein reiner
  // Namensvergleich – nicht geraten, im Markup nachgesehen.
  const UEBERNAHME = ['name', 'email', 'telefon', 'ort'];

  let aktuell = null;

  function werteUebernehmen(vonEl, nachEl) {
    if (!vonEl || !nachEl) return;
    UEBERNAHME.forEach((feldname) => {
      const quelle = vonEl.querySelector(`[name="${feldname}"]`);
      const ziel = nachEl.querySelector(`[name="${feldname}"]`);
      if (!quelle || !ziel) return;
      if (!quelle.value) return;
      if (ziel.value) return;          // Bereits Eingetipptes nicht ueberschreiben.
      ziel.value = quelle.value;
    });
  }

  function setzeModus(modus, opt = {}) {
    const vorher = aktuell;
    const vonEl = vorher ? bereiche.find((el) => el.dataset.anfModus === vorher) : null;
    const nachEl = bereiche.find((el) => el.dataset.anfModus === modus);
    if (!nachEl) return;

    if (opt.uebernehmen !== false && vorher && vorher !== modus) {
      werteUebernehmen(vonEl, nachEl);
    }

    bereiche.forEach((el) => { el.hidden = el.dataset.anfModus !== modus; });
    aktuell = modus;

    const radio = vorwahl.querySelector(`input[name="_vorwahl"][value="${modus}"]`);
    if (radio && !radio.checked) radio.checked = true;
  }

  vorwahl.addEventListener('change', (ev) => {
    const radio = ev.target;
    if (radio && radio.name === '_vorwahl' && radio.checked) setzeModus(radio.value);
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

  // --- Startzustand: immer "kurz" ---
  setzeModus('kurz', { uebernehmen: false });

  // --- Deep-Links oeffnen den Assistenten ---
  // Wer aus einer Leistungsseite oder der Galerie mit ?pfad= oder ?leistung=
  // kommt, hat den Kontext schon. Die Vorwahl bleibt sichtbar und umschaltbar.
  const params = new URLSearchParams(location.search);
  if (params.has('pfad') || params.has('leistung')) setzeModus('detail', { uebernehmen: false });
})();
