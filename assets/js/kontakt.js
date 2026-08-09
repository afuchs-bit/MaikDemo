(function () {
  'use strict';

  const shell = document.querySelector('[data-map-shell]');
  const button = shell && shell.querySelector('[data-map-load]');
  if (!shell || !button) return;

  button.addEventListener('click', function () {
    const source = shell.dataset.mapSrc;
    if (!source || shell.querySelector('iframe')) return;

    button.disabled = true;
    button.textContent = 'Karte wird geladen …';
    shell.setAttribute('aria-busy', 'true');

    const frame = document.createElement('iframe');
    frame.src = source;
    frame.title = 'Google Maps: Maik Rohdich Garten- und Landschaftsbau, Hülsstraße 5 in Herne';
    frame.loading = 'lazy';
    frame.referrerPolicy = 'no-referrer-when-downgrade';
    frame.tabIndex = 0;
    frame.allowFullscreen = true;

    frame.addEventListener('load', function () {
      shell.removeAttribute('aria-busy');
      frame.focus();
    }, { once: true });

    shell.replaceChildren(frame);
  });
})();
