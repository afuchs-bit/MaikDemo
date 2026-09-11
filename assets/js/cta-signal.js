// AP-290/AP-291: Signal und Einrasten der mobilen Haupt-CTAs (Variante C2).
// Der Puls laeuft dreimal, sobald ein CTA gut sichtbar im Bild ist, und danach
// nie wieder - endlose Bewegung neben Inhalt waere ein Verstoss gegen WCAG 2.2.2.
(() => {
  'use strict';

  const ctas = document.querySelectorAll('.mobile-proof-request');
  if (!ctas.length) return;

  // iOS Safari setzt :active nur, wenn am Element ein Touch-Listener haengt.
  ctas.forEach((cta) => cta.addEventListener('touchstart', () => {}, { passive: true }));

  // AP-291: Einrasten sichtbar machen. Ein Tipp ist kuerzer als die Transition,
  // danach springt die Seite zum Formular - man sah das Einrasten nie. Deshalb:
  // Klick abfangen (Capture auf document, also vor allen anderen Handlern),
  // .is-pressed setzen, 180 ms warten, dann denselben Klick erneut ausloesen.
  // Der zweite Klick laeuft unveraendert durch alle bestehenden Handler
  // (Galerie-Sprung, Prefill in privat-form.js, native Ankernavigation).
  const PRESS_MS = 180;
  const passThrough = new WeakSet();

  document.addEventListener('click', (event) => {
    const cta = event.target instanceof Element ? event.target.closest('.mobile-proof-request') : null;
    if (!cta) return;
    if (passThrough.has(cta)) {
      passThrough.delete(cta);
      return;
    }
    if (event.defaultPrevented || event.button !== 0
        || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    // Nur wo die C2-Form sichtbar ist; die Desktop-Pill (#3 ab 481 px) klickt sofort.
    const frame = cta.querySelector('.mobile-proof-request__frame');
    if (!frame || getComputedStyle(frame).display === 'none') return;

    event.preventDefault();
    event.stopImmediatePropagation();
    if (cta.classList.contains('is-pressed')) return;
    cta.classList.add('is-pressed');
    window.setTimeout(() => {
      passThrough.add(cta);
      cta.click();
      window.setTimeout(() => cta.classList.remove('is-pressed'), 60);
    }, PRESS_MS);
  }, true);

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
