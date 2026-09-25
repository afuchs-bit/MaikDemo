// Mobile Galerie-Vorschau auf Leistungsseiten: alle vorhandenen Rasterbilder
// aufklappen, ohne die Seite zu verlassen. Neue Bilder funktionieren automatisch.
(() => {
  'use strict';

  const button = document.querySelector('[data-lpv2-gallery-toggle]');
  if (!button) return;

  const windowElement = document.getElementById(button.getAttribute('aria-controls'));
  const grid = windowElement?.querySelector('.lpv2-gallery-grid');
  const label = button.querySelector('[data-lpv2-gallery-toggle-label]');
  if (!windowElement || !grid || !label) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const collapsedLabel = button.dataset.labelCollapsed || 'Mehr anzeigen';
  const expandedLabel = button.dataset.labelExpanded || 'Weniger';
  let transitionEnd = null;

  function finish(expanded) {
    windowElement.style.height = expanded ? 'auto' : '';
    transitionEnd = null;
  }

  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') !== 'true';
    const startHeight = windowElement.getBoundingClientRect().height;
    let endHeight;

    if (transitionEnd) windowElement.removeEventListener('transitionend', transitionEnd);

    if (expanded) {
      windowElement.style.height = `${startHeight}px`;
      windowElement.classList.add('is-expanded');
      endHeight = grid.scrollHeight;
    } else {
      windowElement.classList.remove('is-expanded');
      windowElement.style.height = '';
      endHeight = windowElement.getBoundingClientRect().height;
      windowElement.style.height = `${startHeight}px`;
    }

    button.setAttribute('aria-expanded', String(expanded));
    button.setAttribute('aria-label', expanded ? 'Weniger Bilder anzeigen' : 'Alle Bilder anzeigen');
    label.textContent = expanded ? expandedLabel : collapsedLabel;

    if (reducedMotion.matches) {
      finish(expanded);
      return;
    }

    // Der Startwert muss vor dem Zielwert gerendert sein, damit die Hoehe
    // weich bis zur tatsaechlichen Anzahl vorhandener Bilder animiert.
    windowElement.getBoundingClientRect();
    requestAnimationFrame(() => {
      windowElement.style.height = `${endHeight}px`;
    });

    transitionEnd = (event) => {
      if (event.propertyName !== 'height') return;
      windowElement.removeEventListener('transitionend', transitionEnd);
      finish(expanded);
    };
    windowElement.addEventListener('transitionend', transitionEnd);
  });
})();
