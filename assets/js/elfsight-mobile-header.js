/**
 * MaikDemo: Elfsight-Popups unter dem bedienbaren mobilen Seitenkopf.
 * Stand: 06.10.2026; Grundlage: aktuell geladene Text- und Fotopopups.
 *
 * Einbau mit Codex:
 * 1. Diese Datei als assets/js/elfsight-mobile-header.js ablegen.
 * 2. In index.html NACH den vorhandenen Header-Skripten einbinden:
 *    <script src="assets/js/elfsight-mobile-header.js?v=20261006d" defer></script>
 * 3. Bestehendes Elfsight-CSS fuer Farben unveraendert beibehalten.
 *
 * Kein Eintrag im Elfsight-Editor erforderlich. Keine neue Abhaengigkeit.
 * Die Anpassung nutzt die derzeit offenen Shadow Roots des Widgets.
 * Nach Elfsight-Updates die Popup-Klassen und die Bedienung erneut pruefen.
 *
 * Validierung: Syntax, DOM-Verhalten und Browserbedienung geprueft.
 * Mobil: 393/402px, Querformat: 852/874px, Desktop: 1280/1440px.
 * Der Test auf einem echten iPhone ist davon getrennt zu betrachten.
 */
(function () {
  'use strict';

  const header = document.getElementById('siteHeader');
  const primaryNav = header?.querySelector('.primary-nav');
  const widgetId = 'd265013d-d9f3-4b6b-8ab8-d050171ce838';
  const portalSelector = '.es-portal-root.eapps-google-reviews-' + widgetId + '-custom-css-root';
  const mobile = window.matchMedia('(max-width: 900px)');
  const activeClass = 'maik-reviews-panel-open';
  const activeAttribute = 'data-maik-reviews-mobile';
  const suspendedAttribute = 'data-maik-reviews-suspended';
  const offsetVariable = '--maik-reviews-top';
  const heightVariable = '--maik-reviews-height';
  const root = document.documentElement;
  const styleId = 'maik-reviews-header-style';
  if (!header || document.getElementById(styleId)) return;

  const pageStyle = document.createElement('style');
  pageStyle.id = styleId;
  pageStyle.textContent = `
    @media (max-width: 900px) {
      html.${activeClass}, html.${activeClass} body {
        overflow: hidden !important;
        overscroll-behavior: none !important;
      }
      html.${activeClass} #siteHeader { z-index: 2000000010 !important; }
    }
  `;
  document.head.append(pageStyle);

  // Nur aeussere Popup-Container verschieben: Die Fotodetails enthalten
  // einen WEITEREN .es-popup-container, der weiterhin relativ bleiben muss.
  const popupCSS = `
    @media (max-width: 900px) {
      .es-popup-wrapper[${suspendedAttribute}] > .es-backdrop-container,
      .es-popup-wrapper[${suspendedAttribute}] > .es-popup-container {
        /* Sichtbar hinter dem Menue halten; inert sperrt auch Tastatur/Touch. */
        pointer-events: none !important;
      }
      .es-popup-wrapper[${activeAttribute}] > .es-backdrop-container,
      .es-popup-wrapper[${activeAttribute}] > .es-popup-container {
        position: fixed !important;
        top: var(${offsetVariable}) !important;
        right: 0 !important;
        bottom: auto !important;
        left: 0 !important;
        height: var(${heightVariable}) !important;
      }
      .es-popup-wrapper[${activeAttribute}] > .es-popup-container {
        overflow: hidden !important;
      }
      .es-popup-wrapper[${activeAttribute}] > .es-popup-container > .es-popup-scrollable-wrapper {
        height: 100% !important;
        max-height: 100% !important;
        overscroll-behavior: none;
      }
      .es-popup-wrapper[${activeAttribute}] .es-scrollable-container {
        overscroll-behavior: none !important;
      }
      .es-popup-wrapper[${activeAttribute}] .es-popup-close-button {
        /* Auch bei kurzen Displays ausserhalb des scrollenden Inhalts halten. */
        position: fixed !important;
        top: calc(var(${offsetVariable}) + 8px) !important;
        right: 8px !important;
        bottom: auto !important;
        left: auto !important;
      }
      .es-popup-wrapper[${activeAttribute}] .es-popup-inner {
        box-sizing: border-box;
        height: 100% !important;
        min-height: 0 !important;
        padding: 0 !important;
      }
      .es-popup-wrapper[${activeAttribute}] .es-popup-inner > .es-popup-content {
        /* Elfsights Flex-Basis 0% wuerde das Fotopopup trotz height: 100% einklappen. */
        flex: 0 0 auto !important;
        width: 100% !important;
        max-width: 100% !important;
        height: 100% !important;
        max-height: 100% !important;
        min-height: 0 !important;
        margin: 0 !important;
        border-radius: 0 !important;
      }
      .es-popup-wrapper[${activeAttribute}] .es-reviews-popup-content-container,
      .es-popup-wrapper[${activeAttribute}] .es-popup-content > .es-popup-container {
        height: 100% !important;
        max-height: 100% !important;
        min-height: 0 !important;
      }
    }
  `;

  const shadowRecords = new Map();
  const modalAttributes = new Map();
  const suspendedAttributes = new Map();
  const inertAttributes = new Map();
  const originalOffset = root.style.getPropertyValue(offsetVariable);
  const originalOffsetPriority = root.style.getPropertyPriority(offsetVariable);
  const originalHeight = root.style.getPropertyValue(heightVariable);
  const originalHeightPriority = root.style.getPropertyPriority(heightVariable);
  let portal = null;
  let portalObserver = null;
  let frame = 0;
  let active = false;
  let allowBackground = false;
  let retryTimer = 0;
  let retryCount = 0;
  let pagePosition = null;
  let openingPosition = null;
  let touchPosition = null;

  function restoreAttribute(element, name, previous) {
    if (previous === null) element.removeAttribute(name);
    else element.setAttribute(name, previous);
  }

  function restoreBackground() {
    for (const [element, previous] of inertAttributes) {
      restoreAttribute(element, 'inert', previous);
    }
    inertAttributes.clear();
  }

  const menuIsOpen = () => Boolean(primaryNav?.classList.contains('is-open'));

  function suspendForMenu(currentSet) {
    const suspend = mobile.matches && menuIsOpen();
    for (const [dialog, previous] of suspendedAttributes) {
      if (suspend && currentSet.has(dialog)) continue;
      restoreAttribute(dialog, 'inert', previous.inert);
      restoreAttribute(dialog, 'aria-hidden', previous.hidden);
      dialog.removeAttribute(suspendedAttribute);
      // Bei einer Drehung kann der Browser die verdeckten Scrollbereiche
      // begrenzen. Erst nach der neuen Popup-Geometrie wiederherstellen.
      for (const position of previous.scroll) {
        if (!dialog.isConnected || !position.element.isConnected) continue;
        position.element.scrollTop = position.top;
        position.element.scrollLeft = position.left;
      }
      suspendedAttributes.delete(dialog);
    }
    if (!suspend) return;
    for (const dialog of currentSet) {
      if (!suspendedAttributes.has(dialog)) {
        suspendedAttributes.set(dialog, {
          inert: dialog.getAttribute('inert'), hidden: dialog.getAttribute('aria-hidden'),
          scroll: [...dialog.querySelectorAll('.es-popup-scrollable-wrapper, .es-scrollable-container')]
            .map(element => ({ element, top: element.scrollTop, left: element.scrollLeft }))
        });
      }
      dialog.setAttribute(suspendedAttribute, '');
      dialog.setAttribute('inert', '');
      dialog.setAttribute('aria-hidden', 'true');
    }
  }

  function updateOffset() {
    if (!active) return;
    // Nur die obere Kante einfrieren: Das Menue vergroessert den Header,
    // die Popup-Hoehe muss trotzdem dem sichtbaren Bildschirm folgen.
    // bottom statt fixer 82px: inklusive Safe Area und Header-Morph.
    const bottom = menuIsOpen()
      ? Math.max(0, Number.parseFloat(root.style.getPropertyValue(offsetVariable)
        || root.style.getPropertyValue('--header-h')) || 0)
      : Math.max(0, Math.ceil(header.getBoundingClientRect().bottom));
    const value = bottom + 'px';
    if (root.style.getPropertyValue(offsetVariable) !== value) {
      root.style.setProperty(offsetVariable, value);
    }
    // iOS-Browserleisten aendern den sichtbaren Ausschnitt unabhaengig von vh.
    const viewport = window.visualViewport;
    const visibleBottom = Math.max(0, viewport?.offsetTop || 0)
      + (viewport?.height || window.innerHeight);
    const height = Math.max(0, Math.ceil(visibleBottom) - bottom) + 'px';
    if (root.style.getPropertyValue(heightVariable) !== height) {
      root.style.setProperty(heightVariable, height);
    }
  }

  function dialogs() {
    return [...shadowRecords.keys()].flatMap(shadow =>
      [...shadow.querySelectorAll('.es-popup-wrapper[role="dialog"]')]
        .filter(dialog => dialog.isConnected)
    );
  }

  function rememberOpeningPosition(event) {
    if (!mobile.matches || active) return;
    const widget = document.querySelector('.elfsight-app-' + widgetId);
    if (!widget?.contains(event.target)) return;
    openingPosition = { x: window.scrollX, y: window.scrollY, time: Date.now() };
  }

  function keepPagePosition() {
    if (!active || !mobile.matches || allowBackground || !pagePosition) return;
    if (Math.abs(window.scrollX - pagePosition.x) < 1
      && Math.abs(window.scrollY - pagePosition.y) < 1) return;
    // Manche iOS-Gesten bleiben trotz overflow:hidden am Dokument haengen.
    // Sofort korrigieren; smooth wuerde die Webseite sichtbar durchschieben.
    const previous = root.style.getPropertyValue('scroll-behavior');
    const priority = root.style.getPropertyPriority('scroll-behavior');
    root.style.setProperty('scroll-behavior', 'auto', 'important');
    window.scrollTo(pagePosition.x, pagePosition.y);
    if (previous) root.style.setProperty('scroll-behavior', previous, priority);
    else root.style.removeProperty('scroll-behavior');
  }

  function canScroll(event, deltaY) {
    const currentDialogs = dialogs();
    const path = event.composedPath();
    if (!path.includes(header) && !path.some(element => currentDialogs.includes(element))) return false;
    return path.some(element => {
      if (!(element instanceof Element) || element === root || element === document.body) return false;
      if (!/auto|scroll/.test(getComputedStyle(element).overflowY)) return false;
      const limit = element.scrollHeight - element.clientHeight;
      if (limit <= 1) return false;
      return deltaY > 0 ? element.scrollTop < limit - 1 : element.scrollTop > 1;
    });
  }

  function guardTouchScroll(event) {
    if (!mobile.matches || allowBackground || !dialogs().length
      || event.touches.length !== 1 || !touchPosition) return;
    const point = event.touches[0];
    if (point.identifier !== touchPosition.id) return;
    const deltaX = touchPosition.x - point.clientX;
    const deltaY = touchPosition.y - point.clientY;
    touchPosition = { id: point.identifier, x: point.clientX, y: point.clientY };
    // Horizontales Blaettern und Pinch-Zoom bleiben beim Widget.
    if (!deltaY || Math.abs(deltaX) > Math.abs(deltaY)) return;
    if (!canScroll(event, deltaY) && event.cancelable) event.preventDefault();
  }

  function guardWheelScroll(event) {
    if (!mobile.matches || allowBackground || !dialogs().length || event.ctrlKey
      || !event.deltaY || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    if (!canScroll(event, event.deltaY) && event.cancelable) event.preventDefault();
  }

  function sync() {
    frame = 0;
    const currentDialogs = dialogs();
    const enabled = mobile.matches && currentDialogs.length > 0;
    const currentSet = new Set(enabled ? currentDialogs : []);
    if (enabled && !pagePosition) {
      pagePosition = openingPosition && Date.now() - openingPosition.time < 1000
        ? openingPosition : { x: window.scrollX, y: window.scrollY };
    }
    if (enabled) openingPosition = null;

    for (const [dialog, previous] of modalAttributes) {
      if (currentSet.has(dialog)) continue;
      restoreAttribute(dialog, 'aria-modal', previous);
      dialog.removeAttribute(activeAttribute);
      modalAttributes.delete(dialog);
    }
    for (const dialog of currentSet) {
      if (!modalAttributes.has(dialog)) {
        modalAttributes.set(dialog, dialog.getAttribute('aria-modal'));
      }
      // Header und Dialog sind bedienbar: kein modaler Gesamtdialog.
      if (dialog.getAttribute('aria-modal') !== 'false') {
        dialog.setAttribute('aria-modal', 'false');
      }
      dialog.setAttribute(activeAttribute, '');
    }

    active = enabled;
    root.classList.toggle(activeClass, enabled);
    if (enabled) {
      keepPagePosition();
      updateOffset();
      if (!allowBackground) {
        // Portal und Header sind direkte body-Kinder, ausserhalb von main.
        for (const element of document.querySelectorAll('main, footer.site-footer')) {
          if (element.contains(portal) || element.contains(header)) continue;
          if (!inertAttributes.has(element)) {
            inertAttributes.set(element, element.getAttribute('inert'));
          }
          element.setAttribute('inert', '');
        }
      }
    } else {
      restoreBackground();
      allowBackground = false;
      pagePosition = null;
      touchPosition = null;
      if (originalOffset) root.style.setProperty(offsetVariable, originalOffset, originalOffsetPriority);
      else root.style.removeProperty(offsetVariable);
      if (originalHeight) root.style.setProperty(heightVariable, originalHeight, originalHeightPriority);
      else root.style.removeProperty(heightVariable);
    }
    suspendForMenu(currentSet);
  }

  function schedule() {
    // Den ersten Wisch nach dem Oeffnen schon vor dem naechsten Frame sperren.
    if (!active && mobile.matches && dialogs().length) {
      if (frame) window.cancelAnimationFrame(frame);
      sync();
      return;
    }
    if (!frame) frame = window.requestAnimationFrame(sync);
  }

  function discover() {
    const nextPortal = document.querySelector(portalSelector);
    if (nextPortal !== portal) {
      portalObserver?.disconnect();
      portal = nextPortal;
      if (portal) {
        portalObserver = new MutationObserver(discover);
        portalObserver.observe(portal, { childList: true, subtree: true });
      }
    }
    for (const [shadow, record] of shadowRecords) {
      if (shadow.host.isConnected && portal?.contains(shadow.host)) continue;
      record.observer.disconnect();
      record.style.remove();
      shadowRecords.delete(shadow);
    }
    let waitingForShadow = false;
    for (const host of portal?.children || []) {
      const shadow = host.shadowRoot;
      if (!shadow) { waitingForShadow = true; continue; }
      if (shadowRecords.has(shadow)) continue;
      const style = document.createElement('style');
      style.textContent = popupCSS;
      shadow.append(style);
      // Den Hintergrund vor dem Schliessen des letzten Popups freigeben,
      // damit Elfsight den Fokus auf den urspruenglichen Ausloeser legen kann.
      const releaseForClose = event => {
        if (!active || dialogs().length !== 1) return;
        const target = event.target instanceof Element ? event.target : null;
        if (event.type === 'keydown' && event.key !== 'Escape') return;
        if (event.type === 'click'
          && !target?.closest('button.es-popup-close-button, .es-backdrop-container')) return;
        allowBackground = true;
        restoreBackground();
      };
      shadow.addEventListener('click', releaseForClose, true);
      shadow.addEventListener('keydown', releaseForClose, true);
      const observer = new MutationObserver(schedule);
      observer.observe(shadow, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['aria-modal']
      });
      shadowRecords.set(shadow, { style, observer });
    }
    // attachShadow selbst erzeugt keinen normalen DOM-Mutationseintrag.
    if (waitingForShadow && !retryTimer && retryCount < 20) {
      retryCount++;
      retryTimer = window.setTimeout(() => { retryTimer = 0; discover(); }, 100);
    }
    if (!waitingForShadow) retryCount = 0;
    schedule();
  }

  header.addEventListener('click', event => {
    if (!active || !mobile.matches) return;
    const control = event.target instanceof Element
      ? event.target.closest('#navToggle, a[href]') : null;
    if (!control) return;
    // Der Menueknopf pausiert nur; Navigation und Kontaktlinks verlassen
    // die Bewertung. Vor der urspruenglichen Linkaktion alles freigeben.
    if (control.id === 'navToggle') return;
    allowBackground = true;
    restoreBackground();
    for (const dialog of dialogs().reverse()) {
      dialog.querySelector('button.es-popup-close-button')?.click();
    }
    schedule();
  }, true);

  const headerObserver = new ResizeObserver(updateOffset);
  headerObserver.observe(header);
  if (primaryNav) {
    new MutationObserver(() => {
      if (!active && !suspendedAttributes.size) return;
      if (frame) window.cancelAnimationFrame(frame);
      sync();
    }).observe(primaryNav, { attributes: true, attributeFilter: ['class'] });
  }
  const bodyObserver = new MutationObserver(discover);
  bodyObserver.observe(document.body, { childList: true });
  mobile.addEventListener('change', schedule);
  document.addEventListener('click', rememberOpeningPosition, true);
  document.addEventListener('touchstart', event => {
    rememberOpeningPosition(event);
    const point = event.touches.length === 1 ? event.touches[0] : null;
    touchPosition = point ? { id: point.identifier, x: point.clientX, y: point.clientY } : null;
  }, { passive: true, capture: true });
  document.addEventListener('touchmove', guardTouchScroll, { passive: false, capture: true });
  document.addEventListener('touchend', () => { touchPosition = null; }, { passive: true });
  document.addEventListener('touchcancel', () => { touchPosition = null; }, { passive: true });
  document.addEventListener('wheel', guardWheelScroll, { passive: false, capture: true });
  window.addEventListener('scroll', keepPagePosition, { passive: true });
  window.addEventListener('resize', updateOffset, { passive: true });
  window.visualViewport?.addEventListener('resize', updateOffset, { passive: true });
  window.visualViewport?.addEventListener('scroll', updateOffset, { passive: true });
  discover();
}());
