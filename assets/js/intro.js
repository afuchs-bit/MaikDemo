/* AP-139: Logo-Intro und Header-Reveal der Startseite.
   Laeuft nur, wenn das Head-Bootstrap data-intro am <html> gesetzt hat
   (= JS aktiv, nur index.html). Zustandsmodell und CSS: styles.css,
   Abschnitt "Vollbild-Hero mit Logo-Intro". */
(function () {
  'use strict';

  var de = document.documentElement;
  if (!de.hasAttribute('data-intro')) return;

  var header = document.getElementById('siteHeader');
  var logoBox = document.getElementById('heroIntroLogo');
  var photo = document.getElementById('heroIntroPhoto');
  var sentinel = document.getElementById('introSentinel');
  var headerLogo = header ? header.querySelector('.brand-logo') : null;

  // Signal an das Bootstrap-Sicherheitsnetz: Datei ist geladen.
  window.__introReady = true;

  var showHeader = function (visible) {
    de.setAttribute('data-header', visible ? 'visible' : 'hidden');
    if (!header) return;
    header.setAttribute('aria-hidden', visible ? 'false' : 'true');
    if (visible) header.removeAttribute('inert');
    else header.setAttribute('inert', '');
  };

  if (!header || !logoBox || !photo || !sentinel || !headerLogo) {
    de.setAttribute('data-intro', 'done');
    showHeader(true);
    return;
  }

  var EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finished = false;

  // Zielgeometrie = exakte Position des Header-Logos, gemessen ohne die
  // translateY(-100%)-Verschiebung des versteckten Headers. So stimmen
  // Uebergabeposition und -groesse auch responsiv, ohne doppelte CSS-Werte.
  var cornerRect = function () {
    // Transition waehrend der Messung abschalten: sonst interpoliert die
    // laufende transform-Transition und getBoundingClientRect liest den
    // alten (verschobenen) Wert statt der Zielposition.
    var prevTransform = header.style.transform;
    var prevTransition = header.style.transition;
    header.style.transition = 'none';
    header.style.transform = 'none';
    var r = headerLogo.getBoundingClientRect();
    header.style.transform = prevTransform;
    void header.offsetHeight;              // Reflow, bevor die Transition zurueckkommt
    header.style.transition = prevTransition;
    return r;
  };

  var placeInCorner = function () {
    var r = cornerRect();
    logoBox.getAnimations().forEach(function (a) { a.cancel(); });
    logoBox.style.top = r.top + 'px';
    logoBox.style.left = r.left + 'px';
    logoBox.style.width = r.width + 'px';
    logoBox.style.transform = 'none';
    logoBox.style.opacity = '1';
  };

  var finishNow = function () {
    if (finished) return;
    finished = true;
    de.setAttribute('data-intro', 'done');
    placeInCorner();
  };

  // Header-Reveal ueber 1px-Sentinel bei 55 % der Hero-Hoehe. Kein
  // Scroll-Listener mit Layout-Reads.
  var io = new IntersectionObserver(function (entries) {
    // Bei schnellem Scrollen koennen mehrere Eintraege gebatcht ankommen -
    // nur der letzte beschreibt den aktuellen Zustand.
    var entry = entries[entries.length - 1];
    var passed = entry.boundingClientRect.top < 0;
    showHeader(passed);
    if (passed) finishNow();
  }, { threshold: 0 });
  io.observe(sentinel);

  // Abbruch bei jeder Interaktion: Animation springt in den Endzustand,
  // der Header kommt ueber den normalen Scroll-Weg. Kein Scroll-Lock.
  var onInteract = function () {
    if (!finished) finishNow();
  };
  ['wheel', 'touchmove', 'keydown', 'pointerdown'].forEach(function (type) {
    addEventListener(type, onInteract, { passive: true });
  });
  addEventListener('scroll', function () {
    if (!finished && window.scrollY > 0) finishNow();
  }, { passive: true });

  // Ecke folgt dem Header-Logo bei Groessenwechseln (Breakpoints 860/768).
  addEventListener('resize', function () {
    if (finished && de.getAttribute('data-header') === 'hidden') placeInCorner();
  });

  // Reload mitten auf der Seite (Browser stellt Scrollposition wieder her),
  // Session-Wiederkehr oder Reduced Motion: kein Intro, Logo direkt in die
  // Ecke, Header je nach Scrollposition.
  if (window.scrollY > 0) {
    finishNow();
    showHeader(true);
    return;
  }
  if (de.getAttribute('data-intro') === 'done' || reduced) {
    finishNow();
    return;
  }

  var run = function () {
    if (finished) return;
    try { sessionStorage.setItem('introPlayed', '1'); } catch (e) { /* Privatmodus */ }
    de.setAttribute('data-intro', 'playing');

    // Phase 1: Logo faedt zentriert ein (Schleier kommt per CSS-Transition mit).
    var fade = logoBox.animate(
      [
        { opacity: 0, transform: 'translate(-50%, -50%) scale(0.94)' },
        { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' }
      ],
      { duration: 600, easing: EASE, fill: 'forwards' }
    );

    fade.finished.then(function () {
      if (finished) return;
      // Hold: Logo steht gross auf dunklem Grund.
      setTimeout(function () {
        if (finished) return;

        // Phase 2 (FLIP): aktuelle Mitte in feste Pixel einfrieren, dann per
        // transform in die Ecke - nur transform/opacity, nichts layoutendes.
        var from = logoBox.getBoundingClientRect();
        var to = cornerRect();
        logoBox.style.top = from.top + 'px';
        logoBox.style.left = from.left + 'px';
        logoBox.style.width = from.width + 'px';
        logoBox.style.transformOrigin = '0 0';
        logoBox.style.transform = 'none';

        de.setAttribute('data-intro', 'done'); // Schleier-Wechsel parallel zur Bewegung

        var move = logoBox.animate(
          [
            { transform: 'translate(0, 0) scale(1)' },
            {
              transform: 'translate(' + (to.left - from.left) + 'px, ' +
                (to.top - from.top) + 'px) scale(' + (to.width / from.width) + ')'
            }
          ],
          { duration: 800, easing: EASE, fill: 'forwards' }
        );
        move.finished.then(function () {
          finished = true;
          placeInCorner();
        }).catch(function () { /* durch finishNow beendet */ });
      }, 500);
    }).catch(function () { /* durch finishNow beendet */ });
  };

  // Startbedingung: Foto dekodiert UND Webfont da (das Logo-SVG nutzt Outfit
  // fuer den Schriftzug) - mit Timeout, damit eine langsame Verbindung das
  // Intro nicht ewig aufhaelt. Erfuellt den Testfall "Foto zuerst, Logo
  // danach - nie umgekehrt".
  var ready = Promise.all([
    photo.decode ? photo.decode().catch(function () {}) : Promise.resolve(),
    document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()
  ]);
  var timeout = new Promise(function (res) { setTimeout(res, 2500); });
  Promise.race([ready, timeout]).then(function () {
    // Kurzer Beat nach dem ersten Paint des Fotos (t ~ 0,15 s im Konzept).
    setTimeout(run, 150);
  });
})();
