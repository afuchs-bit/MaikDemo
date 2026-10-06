/**
 * MaikDemo: Elfsight-Popups unter dem bedienbaren mobilen Seitenkopf.
 * Stand: 06.10.2026; Grundlage: aktuell geladene Text- und Fotopopups.
 *
 * Einbau mit Codex:
 * 1. Diese Datei als assets/js/elfsight-mobile-header.js ablegen.
 * 2. In index.html NACH den vorhandenen Header-Skripten einbinden:
 *    <script src="assets/js/elfsight-mobile-header.js?v=20261006a" defer></script>
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
  const widgetId = 'd265013d-d9f3-4b6b-8ab8-d050171ce838';
  const portalSelector = '.es-portal-root.eapps-google-reviews-' + widgetId + '-custom-css-root';
  const mobile = window.matchMedia('(max-width: 900px)');
  const activeClass = 'maik-reviews-panel-open';
  const activeAttribute = 'data-maik-reviews-mobile';
  const offsetVariable = '--maik-reviews-top';
  const root = document.documentElement;
  const styleId = 'maik-reviews-header-style';
  if (!header || document.getElementById(styleId)) return;

  const pageStyle = document.createElement('style');
  pageStyle.id = styleId;
  pageStyle.textContent = `
    @media (max-width: 900px) {
      html.${activeClass} #siteHeader { z-index: 2000000010 !important; }
    }
  `;
  document.head.append(pageStyle);

  // Nur aeussere Popup-Container verschieben: Die Fotodetails enthalten
  // einen WEITEREN .es-popup-container, der weiterhin relativ bleiben muss.
  const popupCSS = `
    @media (max-width: 900px) {
      .es-popup-wrapper[${activeAttribute}] > .es-backdrop-container,
      .es-popup-wrapper[${activeAttribute}] > .es-popup-container {
        top: var(${offsetVariable}) !important;
        right: 0 !important;
        bottom: 0 !important;
        left: 0 !important;
        height: auto !important;
      }
      .es-popup-wrapper[${activeAttribute}] > .es-popup-container {
        overflow: hidden !important;
      }
      .es-popup-wrapper[${activeAttribute}] > .es-popup-container > .es-popup-scrollable-wrapper {
        height: 100% !important;
        max-height: 100% !important;
        overscroll-behavior: contain;
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
  const inertAttributes = new Map();
  const originalOffset = root.style.getPropertyValue(offsetVariable);
  const originalOffsetPriority = root.style.getPropertyPriority(offsetVariable);
  let portal = null;
  let portalObserver = null;
  let frame = 0;
  let active = false;
  let allowBackground = false;
  let retryTimer = 0;
  let retryCount = 0;

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

  function updateOffset() {
    if (!active) return;
    // bottom statt fixer 82px: inklusive Safe Area und Header-Morph.
    const bottom = Math.max(0, Math.ceil(header.getBoundingClientRect().bottom));
    const value = bottom + 'px';
    if (root.style.getPropertyValue(offsetVariable) !== value) {
      root.style.setProperty(offsetVariable, value);
    }
  }

  function dialogs() {
    return [...shadowRecords.keys()].flatMap(shadow =>
      [...shadow.querySelectorAll('.es-popup-wrapper[role="dialog"]')]
        .filter(dialog => dialog.isConnected)
    );
  }

  function sync() {
    frame = 0;
    const currentDialogs = dialogs();
    const enabled = mobile.matches && currentDialogs.length > 0;
    const currentSet = new Set(enabled ? currentDialogs : []);

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
      if (originalOffset) root.style.setProperty(offsetVariable, originalOffset, originalOffsetPriority);
      else root.style.removeProperty(offsetVariable);
    }
  }

  function schedule() {
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
    // Capture: schliessen, bevor main.js das Menue oeffnet oder ein Link
    // scrollt. Default-Aktionen (auch WhatsApp/tel) werden nicht verhindert.
    allowBackground = true;
    restoreBackground();
    for (const dialog of dialogs().reverse()) {
      dialog.querySelector('button.es-popup-close-button')?.click();
    }
    schedule();
  }, true);

  const headerObserver = new ResizeObserver(updateOffset);
  headerObserver.observe(header);
  const bodyObserver = new MutationObserver(discover);
  bodyObserver.observe(document.body, { childList: true });
  mobile.addEventListener('change', schedule);
  window.addEventListener('resize', updateOffset, { passive: true });
  window.visualViewport?.addEventListener('resize', updateOffset, { passive: true });
  discover();
}());
