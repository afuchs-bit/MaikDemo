(function () {
  'use strict';

  const root = document.documentElement;
  const header = document.getElementById('siteHeader');
  const primaryNav = document.querySelector('.primary-nav');
  const navToggle = document.getElementById('navToggle');
  const callWrap = header?.querySelector('.call-wrap');
  const callButton = document.getElementById('callBtn');
  const callPopover = document.getElementById('callPopover');
  const mobile = window.matchMedia('(max-width: 900px)');

  if (!header || !root.classList.contains('home-theme-dark')) {
    root.classList.remove('home-header-morph');
    return;
  }

  let condensed = header.classList.contains('is-home-condensed');
  const entryHash = window.location.hash;
  // Der Browser setzt den Ankersprung erst nach dem Einlesen der Seite.
  // Bis dahin bleibt der bereits vor dem ersten Zeichnen kompakte Kopf stabil.
  let pendingEntryAnchor = false;
  try {
    pendingEntryAnchor = condensed && Boolean(document.getElementById(decodeURIComponent(entryHash.slice(1))));
  } catch (_) { /* Ein ungueltiger Hash ist kein Sprungziel. */ }
  let appliedState = null;
  let frame = 0;

  const navigationIsOpen = () => primaryNav?.classList.contains('is-open');

  const syncNavigationLabel = () => {
    navToggle?.setAttribute('aria-label', navigationIsOpen() ? 'Menü schließen' : 'Menü öffnen');
  };

  const setCallAvailability = (available) => {
    if (!callWrap) return;
    const hadFocus = callWrap.contains(document.activeElement);
    callWrap.toggleAttribute('inert', !available);
    if (available) {
      callWrap.removeAttribute('aria-hidden');
      return;
    }

    callWrap.setAttribute('aria-hidden', 'true');
    if (callPopover) callPopover.hidden = true;
    callButton?.setAttribute('aria-expanded', 'false');
    if (hadFocus) header.querySelector('.btn-whatsapp')?.focus({ preventScroll: true });
  };

  const updateMeasuredHeaderHeight = () => {
    if (navigationIsOpen()) return;
    root.style.setProperty('--header-h', Math.round(header.getBoundingClientRect().height) + 'px');
  };

  const setCondensed = (next) => {
    condensed = next;
    if (appliedState === next && header.classList.contains('is-home-condensed') === next) return;
    appliedState = next;
    header.classList.toggle('is-home-condensed', next);
    setCallAvailability(next);
    window.requestAnimationFrame(updateMeasuredHeaderHeight);
  };

  const sync = () => {
    frame = 0;

    if (!mobile.matches) {
      pendingEntryAnchor = false;
      condensed = false;
      appliedState = null;
      header.classList.remove('is-home-condensed');
      setCallAvailability(true);
      updateMeasuredHeaderHeight();
      return;
    }

    if (navigationIsOpen()) return;

    if (window.scrollY > 28 || window.location.hash !== entryHash) pendingEntryAnchor = false;

    /* Hysterese verhindert Flackern beim iOS-Overscroll am Seitenanfang. */
    const next = pendingEntryAnchor || (condensed ? window.scrollY > 6 : window.scrollY > 28);
    setCondensed(next);
  };

  const scheduleSync = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(sync);
  };

  const navigationObserver = primaryNav
    ? new MutationObserver(() => {
        syncNavigationLabel();
        if (!navigationIsOpen()) scheduleSync();
        window.requestAnimationFrame(updateMeasuredHeaderHeight);
      })
    : null;

  navigationObserver?.observe(primaryNav, { attributes: true, attributeFilter: ['class'] });

  header.addEventListener('transitionend', (event) => {
    if (event.target === header || event.target.classList?.contains('header-inner')) {
      updateMeasuredHeaderHeight();
    }
  });

  document.addEventListener('scroll', scheduleSync, { passive: true });
  window.addEventListener('resize', scheduleSync, { passive: true });
  window.addEventListener('pageshow', scheduleSync);
  window.addEventListener('hashchange', scheduleSync);

  if (typeof mobile.addEventListener === 'function') {
    mobile.addEventListener('change', scheduleSync);
  } else {
    mobile.addListener(scheduleSync);
  }

  syncNavigationLabel();
  sync();
  window.requestAnimationFrame(() => {
    updateMeasuredHeaderHeight();
    root.classList.add('home-header-ready');
  });
}());
