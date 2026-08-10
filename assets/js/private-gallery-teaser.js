(() => {
  'use strict';

  const section = document.querySelector('[data-gallery-teaser]');
  if (!section) return;

  const grid = section.querySelector('[data-gallery-grid]');
  const slots = Array.from(section.querySelectorAll('[data-gallery-slot]'));
  const previousButton = section.querySelector('[data-gallery-prev]');
  const nextButton = section.querySelector('[data-gallery-next]');
  const announcement = section.querySelector('[data-gallery-announcement]');
  const heading = section.querySelector('h2');
  const intro = section.querySelector('.private-gallery-teaser-head p');
  if (!grid || !slots.length || !previousButton || !nextButton || !announcement) return;

  const rootUrl = new URL('../', document.baseURI);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const transitionDuration = 480;
  const featuredIds = [
    'poolgarten-am-abend-8538a06',
    'bluehender-vorgarten-mit-formgehoelz-2b30d84',
    'moderne-aussenanlage-mit-pflasterung-e5cd55a'
  ];

  let images = [];
  let currentStart = 0;
  let currentVisibleCount = 0;
  let swapping = false;
  let resizeTimer = 0;

  const assetUrl = (value) => new URL(String(value || '').replace(/^\/+/, ''), rootUrl).href;
  const galleryUrl = (image) => new URL(`projekte/?galerie-bild=${encodeURIComponent(image.id)}`, rootUrl).href;

  const createExpandHint = () => {
    const hint = document.createElement('span');
    hint.className = 'private-gallery-expand';
    hint.setAttribute('aria-hidden', 'true');
    hint.innerHTML = '<svg viewBox="0 0 24 24"><path d="m15 3h6v6M14 10l7-7M9 21H3v-6M10 14l-7 7"/></svg><span>Vergrößern</span>';
    return hint;
  };

  const createMedia = (image, eager = false) => {
    const media = document.createElement('span');
    media.className = 'private-gallery-media';
    media.dataset.galleryMedia = '';
    media.style.setProperty('--gallery-focus-desktop', image.fokusDesktop || '50% 50%');
    media.style.setProperty('--gallery-focus-mobile', image.fokusMobil || image.fokusDesktop || '50% 50%');

    const picture = document.createElement('picture');
    const variants = image.variants;
    const sizes = '(max-width:700px) calc(100vw - 40px), (max-width:1099px) calc((100vw - 54px) / 2), calc((min(100vw - 40px, 1180px) - 28px) / 3)';

    if (variants && Array.isArray(variants.widths) && variants.widths.length) {
      const avif = document.createElement('source');
      avif.type = 'image/avif';
      avif.sizes = sizes;
      avif.srcset = variants.widths.map((width) => `${assetUrl(`${variants.base}-${width}.avif`)} ${width}w`).join(', ');
      picture.append(avif);

      const webp = document.createElement('source');
      webp.type = 'image/webp';
      webp.sizes = sizes;
      webp.srcset = variants.widths.map((width) => `${assetUrl(`${variants.base}-${width}.webp`)} ${width}w`).join(', ');
      picture.append(webp);
    }

    const img = document.createElement('img');
    img.src = variants?.base ? assetUrl(`${variants.base}.webp`) : assetUrl(image.bild);
    img.alt = image.alt;
    img.width = variants?.width || 960;
    img.height = variants?.height || 720;
    img.loading = eager ? 'eager' : 'lazy';
    img.decoding = 'async';
    picture.append(img);
    media.append(picture);
    return media;
  };

  const updateLink = (slot, image) => {
    const link = slot.querySelector('a');
    if (!link) return;
    link.href = galleryUrl(image);
    link.setAttribute('aria-label', `${image.alt} – in der Galerie vergrößern`);
  };

  const setSlotImmediately = (slot, image, imageIndex) => {
    const link = slot.querySelector('a');
    if (!link) return;
    link.replaceChildren(createMedia(image), createExpandHint());
    slot.dataset.imageIndex = String(imageIndex);
    updateLink(slot, image);
  };

  const visibleSlots = () => slots.filter((slot) => getComputedStyle(slot).display !== 'none');
  const visibleCount = () => Math.max(1, visibleSlots().length);

  const sortFeaturedFirst = (items) => {
    const byId = new Map(items.map((image) => [image.id, image]));
    const featured = featuredIds.map((id) => byId.get(id)).filter(Boolean);
    const featuredSet = new Set(featured.map((image) => image.id));
    return featured.concat(items.filter((image) => !featuredSet.has(image.id)));
  };

  const normalizeStart = (count) => {
    if (!images.length) return;
    currentStart = Math.floor(currentStart / count) * count;
    if (currentStart >= images.length) currentStart = 0;
  };

  const renderCurrentSet = () => {
    if (!images.length) return;
    slots.forEach((slot, slotIndex) => {
      const imageIndex = (currentStart + slotIndex) % images.length;
      setSlotImmediately(slot, images[imageIndex], imageIndex);
    });
  };

  const announceSelection = () => {
    const count = visibleCount();
    const total = Math.ceil(images.length / count);
    const current = Math.min(total, Math.floor(currentStart / count) + 1);
    announcement.textContent = `Auswahl ${current} von ${total} angezeigt.`;
  };

  const setControlsDisabled = (disabled) => {
    previousButton.disabled = disabled;
    nextButton.disabled = disabled;
  };

  const decodeMedia = async (media) => {
    const img = media.querySelector('img');
    if (!img) throw new Error('Galeriebild fehlt.');
    if (typeof img.decode === 'function') await img.decode();
    else if (!img.complete) await new Promise((resolve, reject) => {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', reject, { once: true });
    });
    if (!img.naturalWidth) throw new Error('Galeriebild konnte nicht geladen werden.');
  };

  const finishInstantSwap = (nextStart) => {
    currentStart = nextStart;
    renderCurrentSet();
    swapping = false;
    setControlsDisabled(false);
    announceSelection();
  };

  const rotateSet = async (direction) => {
    if (swapping || !images.length) return;

    const activeSlots = visibleSlots();
    const count = activeSlots.length;
    if (!count || images.length <= count) return;

    const nextStart = direction > 0
      ? (currentStart + count) % images.length
      : (currentStart - count + images.length) % images.length;

    swapping = true;
    setControlsDisabled(true);

    if (reducedMotion.matches) {
      finishInstantSwap(nextStart);
      return;
    }

    const entries = activeSlots.map((slot, slotIndex) => {
      const link = slot.querySelector('a');
      const oldMedia = link?.querySelector('[data-gallery-media]:not(.is-incoming)');
      const imageIndex = (nextStart + slotIndex) % images.length;
      const incoming = createMedia(images[imageIndex], true);
      incoming.classList.add('is-incoming');
      link?.append(incoming);
      return { slot, oldMedia, incoming, imageIndex };
    });

    try {
      await Promise.all(entries.map(({ incoming }) => decodeMedia(incoming)));
    } catch (error) {
      entries.forEach(({ incoming }) => incoming.remove());
      swapping = false;
      setControlsDisabled(false);
      console.warn('[galerie-teaser] Das gewählte Bildset konnte nicht vollständig vorgeladen werden.', error);
      return;
    }

    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      entries.forEach(({ slot }) => slot.classList.add('is-swapping'));
    }));

    window.setTimeout(() => {
      entries.forEach(({ slot, oldMedia, incoming, imageIndex }) => {
        oldMedia?.remove();
        incoming.classList.remove('is-incoming');
        slot.classList.remove('is-swapping');
        slot.dataset.imageIndex = String(imageIndex);
        updateLink(slot, images[imageIndex]);
      });
      currentStart = nextStart;
      swapping = false;
      setControlsDisabled(false);
      announceSelection();
    }, transitionDuration + 40);
  };

  const handleBreakpointChange = () => {
    if (!images.length) return;
    if (swapping) {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(handleBreakpointChange, transitionDuration + 80);
      return;
    }

    const nextVisibleCount = visibleCount();
    if (nextVisibleCount === currentVisibleCount) return;
    currentVisibleCount = nextVisibleCount;
    normalizeStart(currentVisibleCount);
    renderCurrentSet();
  };

  previousButton.addEventListener('click', () => rotateSet(-1));
  nextButton.addEventListener('click', () => rotateSet(1));
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(handleBreakpointChange, 140);
  }, { passive: true });

  fetch(new URL('data/galerie-teaser.json', rootUrl), { cache: 'no-cache' })
    .then((response) => {
      if (!response.ok) throw new Error(`Galerie-Teaser: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      if (!Array.isArray(data.bilder)) throw new Error('Galerie-Bilder fehlen.');
      images = sortFeaturedFirst(data.bilder.filter((image) => image?.id && image?.bild && image?.alt && image?.imTeaser === true));
      if (images.length < slots.length) throw new Error('Galerie-Bilder unvollständig.');
      if (typeof data.titel === 'string' && data.titel.trim() && heading) heading.textContent = data.titel.trim();
      if (typeof data.intro === 'string' && data.intro.trim() && intro) intro.textContent = data.intro.trim();
      currentVisibleCount = visibleCount();
      normalizeStart(currentVisibleCount);
      renderCurrentSet();
      section.classList.add('is-enhanced');
    })
    .catch((error) => {
      console.warn('[galerie-teaser] Kuratierte Bilder nicht ladbar – statische Auswahl bleibt sichtbar.', error);
    });
})();
