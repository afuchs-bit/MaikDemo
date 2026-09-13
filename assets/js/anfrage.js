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

  // --- AP-307/309: Das Formular erscheint erst auf Wunsch ---
  // Eingeklappt wird nur hier, nicht im Markup: ohne JavaScript steht das
  // Formular offen da und bleibt benutzbar. [hidden] setzt sich dank
  // ".anf [hidden] { display: none }" (anfrage.css) gegen das Grid der Felder
  // durch - die niedrige Prioritaet der Browser-Regel war schon in AP-248 die
  // Falle. Kein preventDefault und kein synthetischer Klick: die Lehre aus
  // AP-301 gilt weiter, der Anker macht den Sprung selbst.
  const eingabe = kurzForm.querySelector('[data-anf-eingabe]');
  const zumFormular = kurzForm.querySelector('[data-anf-zum-formular]');

  if (eingabe && zumFormular) {
    eingabe.hidden = true;
    zumFormular.setAttribute('aria-controls', 'anf-eingabe');
    zumFormular.setAttribute('aria-expanded', 'false');

    const aufklappen = () => {
      if (!eingabe.hidden) return;
      eingabe.hidden = false;
      zumFormular.setAttribute('aria-expanded', 'true');
    };

    zumFormular.addEventListener('click', () => {
      aufklappen();
      const feld = kurzForm.querySelector('#anf-name');
      // preventScroll, damit der Fokus die Bewegung des Ankers nicht
      // unterbricht. Auf iOS geht dabei die Tastatur auf - gewollt.
      if (feld) feld.focus({ preventScroll: true });
    });

    // Jeder andere Weg zum Formular klappt es ebenfalls auf: die CTAs auf
    // #anfrage, der Footer-Link und die Anfrage-Links der Leistungsseiten.
    // Nur aufklappen, nicht scrollen - das Scrollen erledigen die vorhandenen
    // Handler in privat-form.js und mobile-social-proof-gallery.js. Weil die
    // Sichtbarkeit hier synchron im selben Klick gesetzt wird, misst deren
    // scrollIntoView im naechsten Frame bereits das aufgeklappte Formular.
    const zeigtAufsFormular = (adresse) => {
      try {
        const url = new URL(adresse, location.href);
        return url.pathname === location.pathname
          && (url.hash === '#anfrage' || url.hash === '#anf-name-feld');
      } catch (fehler) {
        return false;
      }
    };

    document.addEventListener('click', (ereignis) => {
      const link = ereignis.target instanceof Element ? ereignis.target.closest('a[href]') : null;
      if (link && zeigtAufsFormular(link.href)) aufklappen();
    });

    // Wer von einer anderen Seite mit #anfrage hereinkommt, soll das Formular
    // offen vorfinden. Das laeuft noch im selben Durchlauf wie der Aufruf von
    // scrollToRequestForm() in privat-form.js, dessen Sprung erst zwei Frames
    // spaeter faellt.
    if (zeigtAufsFormular(location.href)) aufklappen();
  }

})();
