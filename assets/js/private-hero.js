(() => {
  'use strict';

  const hero = document.querySelector('[data-private-hero]');
  if (!hero) return;

  const dataNode = hero.querySelector('[data-private-hero-data]');
  const slides = hero.querySelector('[data-private-hero-slides]');
  if (!dataNode || !slides) return;

  let images;
  try {
    images = JSON.parse(dataNode.textContent);
  } catch {
    return;
  }
  if (!Array.isArray(images) || images.length < 2) return;

  const INTERVAL = 5000;
  const TRANSITION = 650;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const landscapeLayout = window.matchMedia('(max-width: 900px)');
  let current = 0;
  let timer = 0;
  let timerStartedAt = 0;
  let remaining = INTERVAL;
  let changing = false;
  let visible = !document.hidden;
  let inView = true;

  hero.classList.add('is-enhanced');

  function canAutoplay() {
    return !reducedMotion.matches && visible && inView && !changing;
  }

  function stopTimer() {
    if (!timer) return;
    const elapsed = performance.now() - timerStartedAt;
    remaining = Math.max(0, remaining - elapsed);
    window.clearTimeout(timer);
    timer = 0;
  }

  function startTimer() {
    if (!canAutoplay() || timer) return;
    if (remaining <= 0) remaining = INTERVAL;
    timerStartedAt = performance.now();
    timer = window.setTimeout(() => {
      timer = 0;
      remaining = INTERVAL;
      select((current + 1) % images.length);
    }, remaining);
  }

  function reconcileTimer() {
    if (canAutoplay()) startTimer();
    else stopTimer();
  }

  function activeBase(image) {
    return landscapeLayout.matches ? image.landscapeBase : image.desktopBase;
  }

  function sourceSet(base, image, format) {
    const formatWidths = format === 'webp' ? image.webpWidths : null;
    const widths = Array.isArray(formatWidths) && formatWidths.length
      ? formatWidths
      : Array.isArray(image.widths) && image.widths.length
      ? image.widths
      : [480, 800, 1200];
    return widths.map((width) => `${base}-${width}.${format} ${width}w`).join(', ');
  }

  function preload(image) {
    return new Promise((resolve, reject) => {
      const probe = new Image();
      probe.onload = resolve;
      probe.onerror = reject;
      probe.src = `${activeBase(image)}-800.webp`;
    });
  }

  function makePicture(image) {
    const picture = document.createElement('picture');
    picture.className = 'private-hero-slide';
    picture.setAttribute('data-private-hero-slide', '');
    picture.setAttribute('aria-hidden', 'true');

    const landscapeSizes = '(max-width: 760px) calc(100vw - 40px), calc(100vw - 64px)';

    const landscapeAvif = document.createElement('source');
    landscapeAvif.media = '(max-width: 900px)';
    landscapeAvif.type = 'image/avif';
    landscapeAvif.sizes = landscapeSizes;
    landscapeAvif.srcset = sourceSet(image.landscapeBase, image, 'avif');

    const landscapeWebp = document.createElement('source');
    landscapeWebp.media = '(max-width: 900px)';
    landscapeWebp.type = 'image/webp';
    landscapeWebp.sizes = landscapeSizes;
    landscapeWebp.srcset = sourceSet(image.landscapeBase, image, 'webp');

    const desktopAvif = document.createElement('source');
    desktopAvif.type = 'image/avif';
    desktopAvif.sizes = '38vw';
    desktopAvif.srcset = sourceSet(image.desktopBase, image, 'avif');

    const desktopWebp = document.createElement('source');
    desktopWebp.type = 'image/webp';
    desktopWebp.sizes = '38vw';
    desktopWebp.srcset = sourceSet(image.desktopBase, image, 'webp');

    const img = document.createElement('img');
    img.src = `${image.desktopBase}.webp`;
    img.alt = image.alt;
    img.width = 800;
    img.height = 1000;
    img.decoding = 'async';

    picture.append(landscapeAvif, landscapeWebp, desktopAvif, desktopWebp, img);
    return { picture, img };
  }

  async function findLoadable(start, direction) {
    for (let attempt = 0; attempt < images.length; attempt += 1) {
      const index = (start + (attempt * direction) + images.length) % images.length;
      if (index === current) continue;
      try {
        await preload(images[index]);
        return index;
      } catch {
        // Fehlerhafte Motive werden uebersprungen; das sichtbare Bild bleibt.
      }
    }
    return -1;
  }

  async function select(requested) {
    if (changing || requested === current) {
      remaining = INTERVAL;
      reconcileTimer();
      return;
    }

    stopTimer();
    changing = true;

    const direction = requested < current ? -1 : 1;
    const next = await findLoadable(requested, direction);
    if (next < 0) {
      changing = false;
      remaining = INTERVAL;
      reconcileTimer();
      return;
    }

    const oldSlide = slides.querySelector('.private-hero-slide.is-active');
    const { picture, img } = makePicture(images[next]);
    slides.append(picture);

    try {
      if (img.decode) await img.decode();
    } catch {
      // Ein erfolgreich vorgeladenes WebP bleibt als Fallback verfuegbar.
    }

    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const transitionStarted = performance.now();
    picture.classList.add('is-active');
    picture.removeAttribute('aria-hidden');
    if (oldSlide) {
      oldSlide.classList.remove('is-active');
      oldSlide.classList.add('is-outgoing');
      oldSlide.setAttribute('aria-hidden', 'true');
    }

    current = next;

    if (reducedMotion.matches) {
      oldSlide?.remove();
    } else {
      await new Promise((resolve) => window.setTimeout(resolve, TRANSITION + 30));
      oldSlide?.remove();
    }

    picture.classList.remove('is-outgoing');
    changing = false;
    remaining = Math.max(250, INTERVAL - (performance.now() - transitionStarted));
    reconcileTimer();
  }

  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden;
    reconcileTimer();
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting && entry.intersectionRatio >= 0.2;
      reconcileTimer();
    }, { threshold: [0, 0.2] });
    observer.observe(hero);
  }

  function applyMotionPreference() {
    remaining = INTERVAL;
    reconcileTimer();
  }
  reducedMotion.addEventListener?.('change', applyMotionPreference);
  applyMotionPreference();

  // Folgeinhalte erst nach dem initialen Seitenaufbau in den Browsercache legen.
  window.addEventListener('load', () => {
    window.setTimeout(() => { preload(images[1]).catch(() => {}); }, 250);
  }, { once: true });
})();
