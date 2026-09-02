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

  let condensed = false;
  let appliedState = null;
  let frame = 0;

  const navigationIsOpen = () => primaryNav?.classList.contains('is-open');

  const syncNavigationLabel = () => {
    navToggle?.setAttribute('aria-label', navigationIsOpen() ? 'Menü schließen' : 'Menü öffnen');
  };

  const setCallAvailability = (available) => {
    if (!callWrap) return;
    callWrap.toggleAttribute('inert', !available);
    if (available) {
      callWrap.removeAttribute('aria-hidden');
      return;
    }

    callWrap.setAttribute('aria-hidden', 'true');
    if (callPopover) callPopover.hidden = true;
    callButton?.setAttribute('aria-expanded', 'false');
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
      condensed = false;
      appliedState = null;
      header.classList.remove('is-home-condensed');
      setCallAvailability(true);
      updateMeasuredHeaderHeight();
      return;
    }

    if (navigationIsOpen()) return;

    /* Hysterese verhindert Flackern beim iOS-Overscroll am Seitenanfang. */
    const next = condensed ? window.scrollY > 6 : window.scrollY > 28;
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

  if (typeof mobile.addEventListener === 'function') {
    mobile.addEventListener('change', scheduleSync);
  } else {
    mobile.addListener(scheduleSync);
  }

  syncNavigationLabel();
  sync();
}());
