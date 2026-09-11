// AP-290: Einmaliges Signal der mobilen Haupt-CTAs (Variante C2).
// Der Puls laeuft dreimal, sobald ein CTA fast ganz im Bild ist, und danach nie
// wieder - endlose Bewegung neben Inhalt waere ein Verstoss gegen WCAG 2.2.2.
(() => {
  'use strict';

  const ctas = document.querySelectorAll('.mobile-proof-request');
  if (!ctas.length) return;

  // iOS Safari setzt :active nur, wenn am Element ein Touch-Listener haengt.
  // Ohne ihn fehlt auf dem iPhone das Einrasten in den Rahmen.
  ctas.forEach((cta) => cta.addEventListener('touchstart', () => {}, { passive: true }));

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-pulsing');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.9 });

  ctas.forEach((cta) => observer.observe(cta));
})();
