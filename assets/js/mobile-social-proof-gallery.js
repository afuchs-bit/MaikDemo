// AP-181: Native mobile Bildfolge, ohne Abhaengigkeit von der Bestands-Galerie.
(() => {
  'use strict';

  const section = document.querySelector('.mobile-social-proof');
  if (!section) return;
  const mobile = window.matchMedia('(max-width: 900px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Nur dieser CTA: Der bestehende globale Handler zielt auf den Assistenten,
  // der bei aktiver Kurzanfrage verborgen ist. Auswahl und Eingaben bleiben bestehen.
  const requestLink = section.querySelector('.mobile-proof-invitation__cta');
  // Ohne dieses Modul bleibt #kontakt als sichtbares natives Sprungziel nutzbar.
  if (requestLink) requestLink.href = '#anfrage';
  requestLink?.addEventListener('click', (event) => {
    if (!mobile.matches || event.defaultPrevented || event.button !== 0
        || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const entry = document.querySelector('[data-anf-vorwahl]');
    if (!entry) return;
    event.preventDefault();
    if (location.hash !== '#anfrage') history.pushState(null, '', event.currentTarget.href);
    entry.tabIndex = -1;
    entry.focus({ preventScroll: true });
    entry.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
  });

  const gallery = section.querySelector('[data-mobile-proof-gallery]');
  if (!gallery) return;
  const track = gallery.querySelector('.mobile-proof-gallery__track');
  const originals = Array.from(gallery.querySelectorAll('[data-proof-slide]'));
  const dots = gallery.querySelector('.mobile-proof-gallery__dots');
  const buttons = Array.from(dots.querySelectorAll('button'));
  const caption = gallery.querySelector('.mobile-proof-gallery__caption');
  const announcement = gallery.querySelector('[data-proof-announcement]');
  let slides = originals;
  let current = 0;
  let started = false;
  let ready = false;
  let touching = false;
  let settleTimer = 0;
  let lastWidth = 0;

  const logicalIndex = (slot) => (slot - 1 + originals.length) % originals.length;
  const position = (slot) => slides[slot].offsetLeft;

  function update(index, announce = true) {
    const changed = current !== index;
    current = index;
    caption.textContent = originals[index].dataset.caption;
    originals.forEach((slide, i) => slide.setAttribute('aria-hidden', String(i !== index)));
    buttons.forEach((button, i) => {
      if (i === index) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
    if (announce && changed) {
      announcement.textContent = `Bild ${index + 1} von ${originals.length}: ${caption.textContent}`;
    }
  }

  // Identisches Randbild gegen sein echtes Gegenstueck tauschen, ohne Animation.
  function jump(slot) {
    clearTimeout(settleTimer);
    track.classList.add('is-jumping');
    track.scrollLeft = position(slot);
    requestAnimationFrame(() => requestAnimationFrame(() => track.classList.remove('is-jumping')));
  }

  function settle() {
    if (!ready || touching || !mobile.matches || track.classList.contains('is-jumping')) return;
    const slot = slides.reduce((nearest, slide, i) =>
      Math.abs(slide.offsetLeft - track.scrollLeft) < Math.abs(position(nearest) - track.scrollLeft) ? i : nearest, 0);
    update(logicalIndex(slot));
    if (slot === 0) jump(originals.length);
    else if (slot === slides.length - 1) jump(1);
  }

  function select(index) {
    if (!ready) return;
    let slot = index + 1;
    if (current === originals.length - 1 && index === 0) slot = slides.length - 1;
    if (current === 0 && index === originals.length - 1) slot = 0;
    track.scrollTo({ left: position(slot), behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  }

  buttons.forEach((button, i) => {
    button.addEventListener('click', () => select(i));
    button.addEventListener('keydown', (event) => {
      let next;
      if (event.key === 'ArrowRight') next = (i + 1) % buttons.length;
      if (event.key === 'ArrowLeft') next = (i - 1 + buttons.length) % buttons.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = buttons.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      buttons[next].focus({ preventScroll: true });
      select(next);
    });
  });

  track.addEventListener('scroll', () => {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(settle, 180);
  }, { passive: true });
  track.addEventListener('scrollend', settle);
  track.addEventListener('pointerdown', () => { touching = true; }, { passive: true });
  const release = () => {
    touching = false;
    clearTimeout(settleTimer);
    settleTimer = setTimeout(settle, 180);
  };
  window.addEventListener('pointerup', release, { passive: true });
  track.addEventListener('pointercancel', release, { passive: true });

  // Ein kaputtes Format darf nicht das funktionierende Standbild ersetzen.
  // Bei Fehlern in AVIF/srcset wird zuerst das vorhandene Basis-WebP versucht.
  async function load(slide) {
    const img = slide.querySelector('img');
    img.loading = 'eager';
    try {
      await img.decode();
    } catch {
      slide.querySelectorAll('source').forEach((source) => source.remove());
      try { await img.decode(); } catch { return false; }
    }
    return img.naturalWidth > 0;
  }

  function useStatic() {
    ready = false;
    gallery.classList.remove('is-ready');
    dots.hidden = true;
    slides.filter((slide) => !originals.includes(slide)).forEach((slide) => slide.remove());
    const fallback = originals.find((slide) => {
      const img = slide.querySelector('img');
      return img.complete && img.naturalWidth > 0;
    });
    originals.forEach((slide) => {
      slide.hidden = slide !== fallback;
      slide.removeAttribute('aria-hidden');
    });
    track.scrollLeft = 0;
    caption.hidden = !fallback;
    if (fallback) caption.textContent = fallback.dataset.caption;
    // Wenn gar kein Foto erreichbar ist, bleiben die beiden Wege zur Anfrage
    // und Galerie erhalten, ohne leere Bildflaeche oder defektes Bildsymbol.
    gallery.querySelector('.mobile-proof-gallery__frame').hidden = !fallback;
  }

  async function enhance() {
    if (started || !mobile.matches) return;
    started = true;
    let firstFailed = false;
    const loaded = await Promise.all(originals.map(async (slide, i) => {
      const ok = await load(slide);
      if (!ok && i === 0) firstFailed = true;
      // Ein defektes Einstiegsbild wartet nicht auf die langsamste Verbindung:
      // Sobald ein anderes Motiv bereit ist, uebernimmt dieses das Standbild.
      if (firstFailed) useStatic();
      return ok;
    }));
    if (loaded.some((ok) => !ok)) {
      useStatic();
      return;
    }

    originals.forEach((slide, i) => {
      slide.hidden = false;
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'Bild');
      slide.setAttribute('aria-label', `${i + 1} von ${originals.length}`);
    });
    const duplicate = (slide) => {
      const copy = slide.cloneNode(true);
      copy.removeAttribute('data-proof-slide');
      copy.setAttribute('aria-hidden', 'true');
      copy.inert = true;
      return copy;
    };
    track.prepend(duplicate(originals[originals.length - 1]));
    track.append(duplicate(originals[0]));
    slides = Array.from(track.children);
    gallery.setAttribute('aria-roledescription', 'Karussell');
    gallery.classList.add('is-ready');
    ready = true;
    update(0, false);
    jump(1);
    dots.hidden = false;
    lastWidth = track.clientWidth;

    // Auch ein spaeterer Fehler nach einem srcset-Wechsel beim Drehen des
    // Handys faellt auf ein bereits geladenes Foto zurueck.
    slides.forEach((slide) => slide.querySelector('img').addEventListener('error', useStatic, { once: true }));
  }

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting) && mobile.matches) {
      observer.disconnect();
      enhance();
    }
  }, { rootMargin: '300px' });
  observer.observe(gallery);
  mobile.addEventListener('change', () => {
    if (mobile.matches && !started) observer.observe(gallery);
  });

  new ResizeObserver(() => {
    const width = track.clientWidth;
    if (!ready || !mobile.matches || !width || width === lastWidth) return;
    lastWidth = width;
    jump(current + 1);
  }).observe(track);
})();
