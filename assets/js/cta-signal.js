// AP-290/AP-291/AP-301: Signal und Einrasten der mobilen Haupt-CTAs (C2).
// Der Puls laeuft einmal, sobald ein CTA gut sichtbar im Bild ist, und danach
// nie wieder - endlose Bewegung neben Inhalt waere ein Verstoss gegen WCAG 2.2.2.
// (Bis AP-297 waren es drei Durchlaeufe, seit AP-298 einer.)
(() => {
  'use strict';

  const ctas = document.querySelectorAll('.mobile-proof-request');
  if (!ctas.length) return;

  // AP-301: Rueckmeldung am Finger, nicht am Klick.
  //
  // AP-291 hat den Klick abgefangen, .is-pressed gesetzt, 180 ms gewartet und
  // dann per cta.click() einen zweiten, synthetischen Klick ausgeloest. In
  // Chromium funktioniert das - auf dem echten iPhone fuehrte es dazu, dass die
  // Buttons nicht mehr zum Formular navigieren und die Einrast-Bewegung
  // mehrfach kurz hintereinander wirkte. Der synthetische Klick laeuft aus
  // einem Zeitgeber, also ausserhalb der Nutzergeste; WebKit ist dort strenger.
  //
  // Der Klick wird jetzt gar nicht mehr angefasst. Navigation, das Prefill in
  // privat-form.js und der Galerie-Sprung laufen wieder unveraendert. Das
  // Einrasten haengt am pointerdown und ist damit sogar frueher zu sehen als
  // vorher - im Moment der Beruehrung statt nach dem Loslassen.
  //
  // Auch :active steuert die Bewegung nicht mehr mit (siehe
  // mobile-social-proof.css): Zwei Quellen fuer dieselbe Transform sind je nach
  // Engine unterschiedlich getaktet - WebKit setzt :active beim Aufsetzen des
  // Fingers, Chromium erst rund 160 ms spaeter.
  const HALTEN_MS = 200;

  ctas.forEach((cta) => {
    let zeitgeber = 0;
    const los = () => {
      window.clearTimeout(zeitgeber);
      cta.classList.remove('is-pressed');
    };
    cta.addEventListener('pointerdown', () => {
      cta.classList.add('is-pressed');
      window.clearTimeout(zeitgeber);
      zeitgeber = window.setTimeout(los, HALTEN_MS);
    }, { passive: true });
    // Scrollen mit dem Finger auf dem Button darf nicht einrasten lassen.
    cta.addEventListener('pointercancel', los);
    cta.addEventListener('pointerleave', los);
  });

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  // AP-291: Erst ausloesen, wenn der Button ganz im Bild ist und nicht mehr im
  // untersten Fuenftel klebt - dort schaut beim Scrollen niemand hin.
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-pulsing');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.95, rootMargin: '0px 0px -20% 0px' });

  ctas.forEach((cta) => observer.observe(cta));
})();
