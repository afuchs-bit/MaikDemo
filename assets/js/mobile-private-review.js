// AP-208: Einzelne, nativ wischbare Rezensionen für alle schmalen Hochformate.
(() => {
  'use strict';

  const iphoneProof = window.matchMedia('(max-width: 480px) and (orientation: portrait)');
  if (!iphoneProof.matches) return;

  const carousel = document.querySelector('[data-review-pair-rotator]');
  if (!carousel) return;

  const viewport = carousel.querySelector('[data-review-viewport]');
  const groups = Array.from(carousel.querySelectorAll('[data-review-pair]'));
  const controls = carousel.querySelector('[data-review-controls]');
  const reviews = groups.flatMap((group) => Array.from(group.querySelectorAll(':scope > .private-review-item')));
  if (!viewport || !controls || reviews.length < 2) return;

  carousel.dataset.iphoneReviewSwipe = 'true';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fragment = document.createDocumentFragment();
  reviews.forEach((review) => fragment.append(review));
  groups.forEach((group) => group.remove());
  viewport.append(fragment);

  reviews.forEach((review, reviewIndex) => {
    review.setAttribute('role', 'group');
    review.setAttribute('aria-roledescription', 'Bewertung');
    review.setAttribute('aria-label', `Bewertung ${reviewIndex + 1} von ${reviews.length}`);
    review.dataset.reviewSlide = String(reviewIndex);
  });

  const duplicate = (review) => {
    const copy = review.cloneNode(true);
    copy.removeAttribute('data-review-slide');
    copy.setAttribute('aria-hidden', 'true');
    copy.inert = true;
    copy.querySelectorAll('details').forEach((detail) => { detail.open = false; });
    return copy;
  };

  viewport.prepend(duplicate(reviews[reviews.length - 1]));
  viewport.append(duplicate(reviews[0]));
  const slides = Array.from(viewport.children);

  const dots = document.createElement('div');
  dots.className = 'private-review-swipe-dots';
  dots.setAttribute('role', 'group');
  dots.setAttribute('aria-label', 'Bewertung auswählen');

  const announcement = document.createElement('span');
  announcement.className = 'b2b-visually-hidden';
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');

  const buttons = reviews.map((review, reviewIndex) => {
    const button = document.createElement('button');
    const dot = document.createElement('span');
    button.type = 'button';
    button.setAttribute('aria-label', `Bewertung ${reviewIndex + 1} von ${reviews.length} anzeigen`);
    button.append(dot);
    dots.append(button);
    return button;
  });

  controls.replaceChildren(dots, announcement);
  controls.hidden = false;
  controls.classList.add('private-review-swipe-controls');
  carousel.classList.add('has-review-swipe');

  let current = 0;
  let touching = false;
  let settleTimer = 0;
  let lastWidth = 0;

  const position = (slot) => slides[slot].offsetLeft;
  const logicalIndex = (slot) => (slot - 1 + reviews.length) % reviews.length;

  const update = (reviewIndex, announce = true) => {
    const changed = current !== reviewIndex;
    current = reviewIndex;
    reviews.forEach((review, index) => {
      const active = index === current;
      review.inert = !active;
      if (active) review.removeAttribute('aria-hidden');
      else review.setAttribute('aria-hidden', 'true');
      if (!active) review.querySelectorAll('details[open]').forEach((detail) => { detail.open = false; });
    });
    buttons.forEach((button, index) => {
      if (index === current) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
    if (announce && changed) announcement.textContent = `Bewertung ${current + 1} von ${reviews.length}`;
  };

  const jump = (slot) => {
    window.clearTimeout(settleTimer);
    viewport.classList.add('is-jumping');
    viewport.scrollLeft = position(slot);
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => viewport.classList.remove('is-jumping')));
  };

  const settle = () => {
    if (touching || viewport.classList.contains('is-jumping')) return;
    const slot = slides.reduce((nearest, slide, index) => (
      Math.abs(slide.offsetLeft - viewport.scrollLeft) < Math.abs(position(nearest) - viewport.scrollLeft)
        ? index
        : nearest
    ), 0);
    update(logicalIndex(slot));
    if (slot === 0) jump(reviews.length);
    else if (slot === slides.length - 1) jump(1);
  };

  const select = (reviewIndex) => {
    let slot = reviewIndex + 1;
    if (current === reviews.length - 1 && reviewIndex === 0) slot = slides.length - 1;
    if (current === 0 && reviewIndex === reviews.length - 1) slot = 0;
    viewport.scrollTo({
      left: position(slot),
      behavior: reducedMotion.matches ? 'instant' : 'smooth'
    });
  };

  buttons.forEach((button, index) => {
    button.addEventListener('click', () => select(index));
    button.addEventListener('keydown', (event) => {
      let nextIndex;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % buttons.length;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + buttons.length) % buttons.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = buttons.length - 1;
      if (nextIndex === undefined) return;
      event.preventDefault();
      buttons[nextIndex].focus({ preventScroll: true });
      select(nextIndex);
    });
  });

  viewport.addEventListener('scroll', () => {
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(settle, 160);
  }, { passive: true });
  viewport.addEventListener('scrollend', settle);
  viewport.addEventListener('pointerdown', () => { touching = true; }, { passive: true });
  const release = () => {
    touching = false;
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(settle, 160);
  };
  window.addEventListener('pointerup', release, { passive: true });
  viewport.addEventListener('pointercancel', release, { passive: true });

  update(0, false);
  jump(1);
  lastWidth = viewport.clientWidth;

  new ResizeObserver(() => {
    const width = viewport.clientWidth;
    if (!width || width === lastWidth) return;
    lastWidth = width;
    jump(current + 1);
  }).observe(viewport);
})();
