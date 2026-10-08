// Maik Rohdich – Frontend Interactions
(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Footer year ---
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // --- Footer navigation disclosures ---
  // Im HTML bleiben beide Gruppen geoeffnet: So sind ohne JavaScript alle
  // Links erreichbar. Erst mit JavaScript werden sie auf kleinen Viewports
  // kompakt geschlossen; eine bewusste Nutzerwahl bleibt beim Resize erhalten.
  const footerDisclosures = Array.from(document.querySelectorAll('[data-footer-disclosure]'));
  if (footerDisclosures.length) {
    const footerMobile = window.matchMedia('(max-width: 720px)');
    const footerStates = new WeakMap();
    let syncingFooter = false;

    const syncFooterDisclosures = () => {
      syncingFooter = true;
      footerDisclosures.forEach((details) => {
        const summary = details.querySelector('summary');
        if (footerMobile.matches) {
          details.open = footerStates.has(details) ? footerStates.get(details) : false;
          if (summary) summary.tabIndex = 0;
        } else {
          details.open = true;
          if (summary) summary.tabIndex = -1;
        }
      });
      requestAnimationFrame(() => { syncingFooter = false; });
    };

    footerDisclosures.forEach((details) => {
      details.addEventListener('toggle', () => {
        if (!syncingFooter && footerMobile.matches) footerStates.set(details, details.open);
      });
    });
    if (typeof footerMobile.addEventListener === 'function') {
      footerMobile.addEventListener('change', syncFooterDisclosures);
    } else {
      footerMobile.addListener(syncFooterDisclosures);
    }
    syncFooterDisclosures();
  }

  // --- Gemeinsamer Header: Navigation, Leistungen und Telefon ---
  const header = document.getElementById('siteHeader');
  const primaryNav = header?.querySelector('.primary-nav');
  const navToggle = document.getElementById('navToggle');
  const callBtn = document.getElementById('callBtn');
  const callPop = document.getElementById('callPopover');
  const menuEl = primaryNav?.querySelector('.menu');
  const mobileHeader = window.matchMedia('(max-width: 900px)');
  const hoverHeader = window.matchMedia('(hover: hover) and (pointer: fine)');
  const submenus = Array.from(header?.querySelectorAll('.menu-item--sub') || []);
  const hoverSubmenus = new WeakSet();
  let lastHeaderFocus = null;
  const navIsOpen = () => Boolean(primaryNav?.classList.contains('is-open'));
  document.addEventListener('focusin', event => {
    if (event.target === document.body) return;
    lastHeaderFocus = header?.contains(event.target) ? event.target : null;
  });
  document.addEventListener('pointerdown', event => {
    if (!header?.contains(event.target)) lastHeaderFocus = null;
  });

  const setHeaderHeight = () => {
    if (!header || navIsOpen()) return;
    document.documentElement.style.setProperty('--header-h',
      Math.round(header.getBoundingClientRect().height) + 'px');
  };
  const closeSubmenu = (item, restoreFocus = false) => {
    hoverSubmenus.delete(item);
    const button = item.querySelector('.submenu-toggle');
    item.classList.remove('is-open');
    button?.setAttribute('aria-expanded', 'false');
    if (restoreFocus) button?.focus({ preventScroll: true });
  };
  const closeSubmenus = () => submenus.forEach(item => closeSubmenu(item));
  const closeCall = (restoreFocus = false) => {
    if (!callPop || !callBtn || callPop.hidden) return;
    callPop.hidden = true;
    callBtn.setAttribute('aria-expanded', 'false');
    if (restoreFocus) callBtn.focus({ preventScroll: true });
  };
  const closeNav = (restoreFocus = false) => {
    if (!navIsOpen()) return;
    primaryNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Menü öffnen');
    closeSubmenus();
    if (menuEl) menuEl.style.maxHeight = '';
    // Root-Scroll-Lock behaelt Dokumenthoehe und iOS-Scrollposition bei.
    document.documentElement.style.overflow = '';
    document.documentElement.style.overscrollBehavior = '';
    if (restoreFocus) navToggle.focus({ preventScroll: true });
    setHeaderHeight();
  };
  const ensureVisibleHeaderFocus = () => {
    // Safari kann den Fokus schon beim CSS-Wechsel auf body setzen. Ein Klick
    // ausserhalb oder der Fokus auf einem anderen Element loescht die Merkhilfe.
    const active = document.activeElement === document.body && lastHeaderFocus
      ? lastHeaderFocus : document.activeElement;
    const available = element => {
      if (!element?.getClientRects().length || element.closest('[hidden], [inert]')) return false;
      const panel = element.closest('.nav-submenu');
      if (panel && !panel.closest('.menu-item--sub')?.classList.contains('is-open')) return false;
      return getComputedStyle(element).visibility !== 'hidden';
    };
    if (!header?.contains(active) || available(active)) return;
    const trigger = active.closest('.call-wrap') ? callBtn
      : active.closest('.menu-item--sub')?.querySelector('.submenu-toggle');
    const target = [trigger, mobileHeader.matches ? navToggle
      : primaryNav?.querySelector('.menu > li > button, .menu > li > a'),
    header.querySelector('.btn-whatsapp'), header.querySelector('.brand')].find(available);
    target?.focus({ preventScroll: true });
  };
  // Auch der Startseiten-Morph kann eine gerade fokussierte Aktion ausblenden.
  if (header && 'MutationObserver' in window) {
    new MutationObserver(ensureVisibleHeaderFocus)
      .observe(header, { attributes: true, attributeFilter: ['class'] });
  }
  const sizeOpenMenu = () => {
    if (!menuEl || !navIsOpen()) return;
    menuEl.style.maxHeight = '';
    menuEl.style.maxHeight = Math.max(0,
      window.innerHeight - menuEl.getBoundingClientRect().top - 12) + 'px';
  };
  const openNav = () => {
    if (!primaryNav || !navToggle || !mobileHeader.matches) return;
    closeCall();
    closeSubmenus();
    setHeaderHeight();
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.overscrollBehavior = 'none';
    primaryNav.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Menü schließen');
    if (menuEl) menuEl.scrollTop = 0;
    sizeOpenMenu();
    primaryNav.querySelector('.menu > li > button, .menu > li > a')?.focus({ preventScroll: true });
  };

  navToggle?.addEventListener('click', () => navIsOpen() ? closeNav() : openNav());
  primaryNav?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', event => {
      const wasOpen = navIsOpen();
      closeNav();
      closeSubmenus();
      const href = link.getAttribute('href') || '';
      const anchor = href.startsWith('#') ? document.querySelector(href) : null;
      if (wasOpen && anchor) {
        event.preventDefault();
        anchor.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
      }
    });
  });
  primaryNav?.addEventListener('focusout', event => {
    // Die Navigation ist eine Disclosure, kein Fokusfang. Beim Weiter-Tabben
    // in die Seite muss deshalb auch die mobile Scrollsperre verschwinden.
    if (mobileHeader.matches && navIsOpen() && event.relatedTarget
      && !primaryNav.contains(event.relatedTarget) && event.relatedTarget !== navToggle) closeNav();
  });
  document.addEventListener('touchmove', event => {
    if (navIsOpen() && !menuEl?.contains(event.target)) event.preventDefault();
  }, { passive: false });

  submenus.forEach(item => {
    const button = item.querySelector('.submenu-toggle');
    if (!button) return;
    const open = () => {
      closeCall();
      closeSubmenus();
      item.classList.add('is-open');
      button.setAttribute('aria-expanded', 'true');
      const panel = item.querySelector('.nav-submenu');
      if (panel) panel.scrollTop = 0;
    };
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      // Ein Klick nach Pointerenter bestaetigt das bereits sichtbare Panel.
      if (event.detail > 0 && hoverSubmenus.has(item)) { hoverSubmenus.delete(item); return; }
      item.classList.contains('is-open') ? closeSubmenu(item) : open();
    });
    item.addEventListener('pointerenter', event => {
      if (!mobileHeader.matches && hoverHeader.matches && event.pointerType === 'mouse'
        && !item.classList.contains('is-open')) {
        open();
        hoverSubmenus.add(item);
      }
    });
    item.addEventListener('pointerleave', () => {
      if (!mobileHeader.matches && !item.contains(document.activeElement)) closeSubmenu(item);
    });
    item.addEventListener('focusout', event => {
      if (!item.contains(event.relatedTarget)) closeSubmenu(item);
    });
  });

  callBtn?.addEventListener('click', event => {
    if (!callPop) return;
    event.stopPropagation();
    if (!callPop.hidden) { closeCall(); return; }
    closeNav();
    closeSubmenus();
    callPop.hidden = false;
    callBtn.setAttribute('aria-expanded', 'true');
  });
  header?.querySelector('.call-wrap')?.addEventListener('focusout', event => {
    if (!event.currentTarget.contains(event.relatedTarget)) closeCall();
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.primary-nav, .nav-toggle')) closeNav();
    if (!event.target.closest('.menu-item--sub')) closeSubmenus();
    if (!event.target.closest('.call-wrap')) closeCall();
  });
  // Escape schliesst zuerst die innere Ebene; ein weiterer Druck das Handy-Menue.
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (callPop && !callPop.hidden) closeCall(true);
    else {
      const openItem = submenus.find(item => item.classList.contains('is-open'));
      if (openItem) closeSubmenu(openItem, true);
      else if (navIsOpen()) closeNav(true);
      else return;
    }
    event.preventDefault();
  });

  const syncHeaderLayout = () => {
    if (!mobileHeader.matches) closeNav();
    closeCall();
    closeSubmenus();
    setHeaderHeight();
    ensureVisibleHeaderFocus();
  };
  if (mobileHeader.addEventListener) mobileHeader.addEventListener('change', syncHeaderLayout);
  else mobileHeader.addListener(syncHeaderLayout);
  window.addEventListener('resize', () => {
    setHeaderHeight();
    sizeOpenMenu();
    ensureVisibleHeaderFocus();
  });
  document.addEventListener('scroll', () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 12);
    setHeaderHeight();
  }, { passive: true });
  header?.classList.toggle('is-scrolled', window.scrollY > 12);
  setHeaderHeight();

  // Rubrik anhand der echten Linkziele bestimmen, auch unter einem Hosting-Praefix.
  const syncCurrentHeaderLink = () => {
    const normalizePath = path => path.replace(/index\.html$/, '').replace(/\/?$/, '/');
    const currentPath = normalizePath(window.location.pathname);
    primaryNav?.querySelectorAll('.menu > li > a').forEach(link => {
      const target = new URL(link.href);
      const targetPath = normalizePath(target.pathname);
      const current = target.origin === window.location.origin && (target.hash
        ? currentPath === targetPath && window.location.hash === target.hash
        : currentPath.startsWith(targetPath));
      link.classList.toggle('is-current', current);
      link.removeAttribute('aria-current');
      if (current && currentPath === targetPath) link.setAttribute('aria-current', target.hash ? 'location' : 'page');
    });
    submenus.forEach(item => {
      const current = Array.from(item.querySelectorAll('.nav-submenu a'))
        .some(link => normalizePath(new URL(link.href).pathname) === currentPath);
      item.querySelector('.submenu-toggle')?.classList.toggle('is-current', current);
    });
  };
  syncCurrentHeaderLink();
  window.addEventListener('hashchange', syncCurrentHeaderLink);

  // --- Scroll reveal ---
  const revealElements = new Set();
  const registeredRevealElements = new WeakSet();
  const revealDelayMs = (el) => {
    const siblings = Array.from(el.parentElement?.children || []);
    const index = siblings.indexOf(el);
    // Auch lange Galerie- und Kartenraster sollen ohne sekundenlange Wartezeit
    // reagieren. Der Gewerbe-Stagger bleibt erhalten, wird aber sinnvoll begrenzt.
    return Math.min(4, Math.max(0, index)) * 55;
  };
  const revealDelay = (el) => `${revealDelayMs(el)}ms`;
  const revealNow = (el) => {
    if (!el || revealElements.has(el)) return;
    revealElements.add(el);
    el.style.transitionDelay = revealDelay(el);
    el.classList.add('is-in');
  };

  // AP-552: Einmalige Reveals brauchen keine ScrollTrigger-Neuberechnung.
  // Deren Refresh setzt den Viewport vorübergehend auf 0; Safari löst ihn
  // auch beim Ein-/Ausblenden der Browserleisten während des Scrollens aus.
  const gsapRevealEnabled = !reduced && Boolean(window.gsap)
    && 'IntersectionObserver' in window;
  if (gsapRevealEnabled) {
    document.documentElement.classList.add('gsap-reveal-active');
  }

  const revealWithGsap = (el) => {
    // Der gelbe Willkommensstempel besitzt eine eigene Markenanimation.
    if (el.classList.contains('gate-welcome-kicker')) {
      revealNow(el);
      return;
    }

    const isWelcomePhoto = el.classList.contains('gate-welcome-photo');

    window.gsap.fromTo(el, {
      autoAlpha: 0,
      y: isWelcomePhoto ? 14 : 18
    }, {
      autoAlpha: 1,
      y: 0,
      duration: isWelcomePhoto ? 0.64 : 0.72,
      delay: isWelcomePhoto ? 0 : revealDelayMs(el) / 1000,
      ease: 'power2.out',
      onStart: () => {
        revealElements.add(el);
        el.classList.add('is-in');
      },
      onComplete: () => {
        window.gsap.set(el, { clearProps: 'opacity,visibility,transform' });
      }
    });
  };

  let revealObserver = null;
  let photoRevealObserver = null;
  let revealObserverLate = null;
  // Die Leistungsseiten erhalten ihren spaeteren Einstieg ebenfalls ueber
  // IntersectionObserver. ScrollTrigger bleibt wegen des Safari-Scrollsprungs aus.
  const lateRevealMedia = window.matchMedia('(min-width: 901px)');
  const isLateReveal = (el) => lateRevealMedia.matches && el.hasAttribute('data-reveal-late');
  const observerForReveal = (el) => isLateReveal(el) ? revealObserverLate
    : (gsapRevealEnabled && el.classList.contains('gate-welcome-photo')
      ? photoRevealObserver : revealObserver);
  const pendingReveals = new Set();
  const enterReveals = (entries, observer) => {
    entries.forEach((entry) => {
      const alreadyPassed = gsapRevealEnabled && entry.boundingClientRect.top < 0;
      if ((!entry.isIntersecting && !alreadyPassed) || !pendingReveals.has(entry.target)) return;
      pendingReveals.delete(entry.target);
      observer.unobserve(entry.target);
      gsapRevealEnabled ? revealWithGsap(entry.target) : revealNow(entry.target);
    });
  };
  const createRevealObserver = () => new IntersectionObserver(enterReveals, gsapRevealEnabled ? {
    // Pixel statt Prozent: rootMargin-Prozentwerte beziehen sich auf die
    // Breite. So bleibt der bisherige Start bei 88 % der sichtbaren Höhe.
    rootMargin: `0px 0px ${-window.innerHeight * .12}px 0px`,
    threshold: 0
  } : { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
  const createLateRevealObserver = () => new IntersectionObserver(enterReveals, {
    rootMargin: `0px 0px ${-window.innerHeight * .28}px 0px`, threshold: 0.08
  });
  if (!reduced && 'IntersectionObserver' in window) {
    revealObserver = createRevealObserver();
    revealObserverLate = createLateRevealObserver();
    if (gsapRevealEnabled) {
      photoRevealObserver = new IntersectionObserver(enterReveals, {
        rootMargin: '0px 0px 72px 0px', threshold: 0
      });
    }
    let revealHeight = window.innerHeight;
    let revealDesktop = lateRevealMedia.matches;
    let revealResizeFrame = 0;
    window.addEventListener('resize', () => {
      if (revealResizeFrame) return;
      revealResizeFrame = requestAnimationFrame(() => {
        revealResizeFrame = 0;
        if (revealHeight === window.innerHeight && revealDesktop === lateRevealMedia.matches) return;
        revealHeight = window.innerHeight;
        revealDesktop = lateRevealMedia.matches;
        revealObserver.disconnect();
        revealObserverLate.disconnect();
        photoRevealObserver?.disconnect();
        revealObserver = createRevealObserver();
        revealObserverLate = createLateRevealObserver();
        pendingReveals.forEach((el) => observerForReveal(el).observe(el));
      });
    }, { passive: true });
  }

  const registerReveal = (root = document) => {
    const candidates = [];
    if (root.nodeType === Node.ELEMENT_NODE && root.matches('.reveal')) candidates.push(root);
    root.querySelectorAll?.('.reveal').forEach((el) => candidates.push(el));
    candidates.forEach((el) => {
      if (registeredRevealElements.has(el)) return;
      registeredRevealElements.add(el);
      if (!revealObserver) revealNow(el);
      else {
        pendingReveals.add(el);
        observerForReveal(el).observe(el);
      }
    });
  };
  registerReveal();

  // --- AP-566/567: Blickfuehrung der Textsektion am Desktop (Balkonkasten, Mockup F2 A+B) ---
  // Wort-Aufstieg der Ueberschriften, Trennlinie fuellt sich, Listenpunkte werden nacheinander
  // hell - als feste Sequenz beim Eintritt, unabhaengig vom Scrollen (Zeiten in
  // leistung-mobile.css). Nur ab 901px, nur auf Seiten mit lpv2-page--desktop-trichter.
  // lpv2-js am body schaltet die Ausgangszustaende (gedimmt/unsichtbar) erst mit JS ein.
  // Bei reduced-motion steht alles sofort.
  (() => {
    const container = document.querySelector('.lpv2-page--desktop-trichter .lpv2-content-feature > .container');
    if (!container || !lateRevealMedia.matches) return;
    document.body.classList.add('lpv2-js');
    // AP-586: Die Liste steht 18px unter der H3. Die H3 ist je Seite und Breite ein- bis
    // dreizeilig - ihre Unterkante wird gemessen und als --lpv2-list-top am Container gesetzt
    // (leistung-mobile.css). Ohne ResizeObserver greift der CSS-Ersatzwert.
    // Baumkontrolle hat zusaetzlich Abschnitte ohne Liste (unter der Linie) - gemeint ist die H3 ueber der Liste.
    const serviceTitle = container.querySelector('.lpv2-content-service:not(.lpv2-content-service--no-list) h3');
    if (serviceTitle && 'ResizeObserver' in window) {
      const setListTop = () => {
        const top = serviceTitle.getBoundingClientRect().bottom - container.getBoundingClientRect().top + 18;
        container.style.setProperty('--lpv2-list-top', `${Math.round(top * 10) / 10}px`);
      };
      new ResizeObserver(setListTop).observe(serviceTitle);
      setListTop();
    }
    const items = [...container.querySelectorAll('.lpv2-content-list li')];
    const light = (li, d) => { li.style.setProperty('--lpv2-d', d); li.classList.add('lpv2-seq'); };
    if (reduced) {
      container.classList.add('is-live');
      items.forEach((li) => light(li, '0s'));
      return;
    }

    const split = (el) => {
      if (!el || el.classList.contains('lpv2-split')) return;
      const words = el.textContent.trim().split(/\s+/);
      el.textContent = '';
      words.forEach((w, i) => {
        const outer = document.createElement('span');
        outer.className = 'lpv2-w';
        outer.style.setProperty('--lpv2-wi', i);
        const inner = document.createElement('span');
        inner.textContent = w;
        outer.appendChild(inner);
        el.appendChild(outer);
        if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
      });
      el.classList.add('lpv2-split');
    };
    split(container.querySelector('.lpv2-content-lead h2'));
    split(serviceTitle);

    // Kette statt fester Zeiten: Punkt i schaltet fruehestens BASE nach dem Eintritt und STEP
    // nach Punkt i-1 - und erst, wenn er ueber 92 % Fensterhoehe steht. Die Sektion kommt beim
    // Scrollen von unten ins Bild; mit festen Zeiten schalteten die noch verdeckten Punkte
    // sonst gemeinsam, sobald sie auftauchen. So nie zwei auf einmal, Reihenfolge fest.
    const BASE = 1800, STEP = 180;
    const startSequence = () => {
      const t0 = performance.now();
      let i = 0;
      let last = -Infinity;
      const next = () => {
        if (i >= items.length) return;
        const li = items[i];
        const wait = Math.max(BASE, last + STEP) - (performance.now() - t0);
        if (wait > 0) { setTimeout(next, wait); return; }
        if (li.getBoundingClientRect().top < window.innerHeight * 0.92) {
          light(li, '0s');
          last = performance.now() - t0;
          i += 1;
          next();
          return;
        }
        const obs = new IntersectionObserver((entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          obs.disconnect();
          next();
        }, { rootMargin: '0px 0px -8% 0px' });
        obs.observe(li);
      };
      next();
    };

    if (!('IntersectionObserver' in window)) {
      container.classList.add('is-live');
      items.forEach((li) => light(li, '0s'));
      return;
    }
    const live = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      container.classList.add('is-live');
      startSequence();
      live.disconnect();
    }, { threshold: 0.15 });
    live.observe(container);
  })();

  // Galeriebilder und Projektkarten entstehen erst nach dem Datenabruf. Neue
  // Reveal-Elemente werden ueber dieselbe zentrale Bewegung registriert.
  if ('MutationObserver' in window) {
    const revealMutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) registerReveal(node);
      }));
    });
    revealMutationObserver.observe(document.body, { childList: true, subtree: true });
  }

  // --- Hero video: reduced-motion fallback + fade-in when playing ---
  const heroVideo = document.getElementById('heroVideo');
  if (heroVideo) {
    if (reduced) {
      heroVideo.removeAttribute('autoplay');
      heroVideo.remove();
    } else {
      heroVideo.addEventListener('playing', () => {
        heroVideo.style.opacity = '1';
      }, { once: true });
      // ensure play after metadata loads (Safari/iOS)
      heroVideo.addEventListener('loadeddata', () => {
        const p = heroVideo.play();
        if (p && p.catch) p.catch(() => {});
      }, { once: true });
    }
  }

  // --- Subtle parallax on hero dots (nicht im ruhigen Startseiten-Gate) ---
  if (!reduced) {
    const hero = document.querySelector('.hero:not(.hero--gate)');
    if (hero) {
      document.addEventListener('scroll', () => {
        const y = window.scrollY;
        if (y < window.innerHeight) {
          hero.style.setProperty('--p', y + 'px');
          hero.style.backgroundPosition = `center ${y * 0.15}px`;
        }
      }, { passive: true });
    }
  }

  // --- Smooth anchor focus ---
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id && id.length > 1 && document.querySelector(id)) {
        // browser handles scroll via CSS smooth scroll; just close popovers
        if (callPop) {
          callPop.hidden = true;
          callBtn?.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });

  // AP-F15: Hier standen zwei Handler fuer select[name="bereich"] - Klick-Vorbelegung
  // und ?bereich=<Option-Text> aus der URL. Das Select existiert seit dem Merge der
  // Startseite nicht mehr; beide Bloecke liefen ins Leere. Die Vorbelegung uebernimmt
  // privat-form.js ueber [data-prefill-bereich] und ?pfad=/?leistung= mit Taxonomie-Slugs.

  // --- Bevorzugter Kontaktweg: passendes Detailfeld einblenden ---
  // Die <option>s tragen keine value-Attribute, der Wert ist also der Optionstext
  // ("Telefon (mobil)", "Telefon (Festnetz)", "E-Mail").
  {
    const weg = document.querySelector('#contactForm select[name="weg"]');
    const details = document.querySelectorAll('#contactForm [data-weg-detail]');
    if (weg && details.length) {
      const sync = () => {
        const gewuenscht = weg.value.startsWith('Telefon') ? 'telefon' : 'email';
        details.forEach((d) => {
          d.hidden = d.getAttribute('data-weg-detail') !== gewuenscht;
        });
      };
      weg.addEventListener('change', sync);
      sync(); // deckt Browser-Restore der Auswahl beim Zurueck-Navigieren ab
    }
  }

  // --- Count-up stats (Social Proof) ---
  // DOM always holds the final value, so no-JS / reduced-motion users see it directly.
  const counters = document.querySelectorAll('[data-countup]');
  if (counters.length && !reduced && 'IntersectionObserver' in window) {
    const fmt = (val, dec) => (dec > 0 ? val.toFixed(dec) : String(Math.round(val))).replace('.', ',');
    const run = (el) => {
      const target = parseFloat(el.getAttribute('data-countup'));
      const dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
      if (isNaN(target)) return;
      const dur = 1100, t0 = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
        el.textContent = fmt(target * eased, dec);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = fmt(target, dec);
      };
      requestAnimationFrame(tick);
    };
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { run(entry.target); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => cio.observe(el));
  }

  // --- Vorher/Nachher-Slider (Privatkunden) ---
  // Drag per Pointer-Events + synchronisiertes range-Input für Tastatur/Screenreader.
  document.querySelectorAll('[data-beforeafter]').forEach((ba) => {
    const frame = ba.querySelector('.ba-frame');
    const range = ba.querySelector('.ba-range');
    if (!frame || !range) return;

    const set = (pct) => {
      const v = Math.min(100, Math.max(0, pct));
      frame.style.setProperty('--pos', v + '%');
      const rounded = String(Math.round(v));
      if (range.value !== rounded) range.value = rounded;
    };
    const fromPointer = (e) => {
      const r = frame.getBoundingClientRect();
      set(((e.clientX - r.left) / r.width) * 100);
    };

    let dragging = false;
    frame.addEventListener('pointerdown', (e) => {
      if (e.target === range) return; // range bedient sich selbst
      dragging = true;
      frame.classList.add('is-dragging');
      frame.setPointerCapture(e.pointerId);
      fromPointer(e);
    });
    frame.addEventListener('pointermove', (e) => {
      if (dragging) fromPointer(e);
    });
    const stopDrag = () => {
      dragging = false;
      frame.classList.remove('is-dragging');
    };
    frame.addEventListener('pointerup', stopDrag);
    frame.addEventListener('pointercancel', stopDrag);

    range.addEventListener('input', () => set(parseFloat(range.value)));

    // Auto-Sweep "Invite": einmaliges Hin-und-Her beim ersten Sichtbarwerden,
    // damit klar wird, dass man ziehen kann. Progressive Enhancement.
    if (!reduced && 'IntersectionObserver' in window) {
      const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      // Keyframes: [Zeitpunkt ms, Position %]
      const keys = [[0, 50], [650, 18], [1350, 82], [2050, 50]];
      const dur = keys[keys.length - 1][0];
      const play = () => {
        const start = performance.now();
        const step = (now) => {
          if (dragging) return;                 // User-Eingabe hat Vorrang
          const el = Math.min(now - start, dur);
          let a = keys[0], b = keys[keys.length - 1];
          for (let i = 0; i < keys.length - 1; i++) {
            if (el >= keys[i][0] && el <= keys[i + 1][0]) { a = keys[i]; b = keys[i + 1]; break; }
          }
          const span = b[0] - a[0];
          const t = span ? easeInOut((el - a[0]) / span) : 1;
          set(a[1] + (b[1] - a[1]) * t);
          if (el < dur) requestAnimationFrame(step);
          else set(50);
        };
        requestAnimationFrame(step);
      };
      const sweepIO = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { sweepIO.disconnect(); play(); }
        });
      }, { threshold: 0.5 });
      sweepIO.observe(frame);
    }
  });

  // --- Testimonial rotator (Social Proof) ---
  // Activates only with 2+ real quotes; a single quote stays static.
  document.querySelectorAll('[data-rotator]').forEach((rot) => {
    const quotes = Array.from(rot.querySelectorAll('.proof-quote'));
    if (quotes.length < 2) return;
    let idx = quotes.findIndex((q) => q.classList.contains('is-active'));
    if (idx < 0) { idx = 0; quotes[0].classList.add('is-active'); }

    const dots = document.createElement('div');
    dots.className = 'proof-dots';
    quotes.forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'proof-dot' + (i === idx ? ' is-active' : '');
      b.setAttribute('aria-label', 'Bewertung ' + (i + 1) + ' von ' + quotes.length);
      b.addEventListener('click', () => { show(i); restart(); });
      dots.appendChild(b);
    });
    rot.appendChild(dots);

    const show = (i) => {
      quotes[idx].classList.remove('is-active');
      dots.children[idx].classList.remove('is-active');
      idx = (i + quotes.length) % quotes.length;
      quotes[idx].classList.add('is-active');
      dots.children[idx].classList.add('is-active');
    };

    let timer = null;
    const start = () => { if (!reduced && !timer) timer = setInterval(() => show(idx + 1), 6000); };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    const restart = () => { stop(); start(); };
    rot.addEventListener('mouseenter', stop);
    rot.addEventListener('mouseleave', start);
    rot.addEventListener('focusin', stop);
    rot.addEventListener('focusout', start);
    start();
  });

  // --- Ablauf: Scroll-Zeitstrahl (Fortschritt entlang der Stationen) ---
  // Progressive Enhancement in zwei Ausbaustufen, beide ueber dieselbe
  // CSS-Variable --progress (0..1); den Rest erledigt styles.css.
  //   'h'  allgemeiner Desktop-Zeitstrahl auf Seiten, die ihn noch verwenden
  //   'v'  Startseite auf allen Breiten und Mobile/Tablet – ohne Pin
  // Bei prefers-reduced-motion laeuft keiner von beiden; dann bleibt der
  // statische vertikale CSS-Zeitstrahl (Basis) stehen – vollstaendig
  // sichtbar, gefuellte Linie, kein Scroll-Listener.
  (function () {
    const scroller = document.querySelector('[data-process-scroller]');
    if (!scroller) return;
    const section = scroller.closest('.section-process');
    const stage = scroller.querySelector('.process-stage');
    const path = scroller.querySelector('.process-path');
    const pin = scroller.querySelector('[data-process-pin]') || stage;
    const track = scroller.querySelector('[data-process-track]');
    if (!section || !stage || !path || !pin || !track) return;

    const steps = Array.from(track.querySelectorAll('.step'));
    if (!steps.length) return;
    const homeProcess = section.matches('.private-process-updated')
      && document.documentElement.classList.contains('home-theme-dark');
    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    // (hover: hover) schliesst Touch-Geraete aus, die breit genug fuer den
    // Pin waeren – vor allem das iPad im Querformat (genau 1024px). Ein Pin
    // auf Touch bricht Momentum-Scrolling und kollidiert mit Pull-to-Refresh;
    // diese Geraete bekommen dort deshalb die vertikale Journey. Die neue
    // Startseiten-Reihe verwendet bei wenig Höhe und auf Touch natives Scrollen.
    const mq = window.matchMedia(homeProcess
      ? '(min-width: 901px), (max-width: 900px) and (orientation: landscape)'
      : '(min-width: 1024px) and (hover: hover)');
    const iphoneMq = window.matchMedia('(max-width: 480px)');

    let mode = null;                    // null | 'h' | 'v'
    let ticking = false, lastIndex = -1;
    // Seiten duerfen nur den physischen Scrollweg verkuerzen; die visuelle
    // Verschiebung des Tracks bleibt immer bei der vollstaendigen maxShift.
    const requestedScrollFactor = Number.parseFloat(scroller.dataset.processScrollFactor || '1');
    const horizontalScrollFactor = Number.isFinite(requestedScrollFactor)
      ? Math.min(1, Math.max(.5, requestedScrollFactor))
      : 1;
    let maxShift = 0, scrollTravel = 0, scrollStart = 0; // nur 'h'
    let nodeTops = [], travel = 0;      // nur 'v'

    const setActive = (idx) => {
      if (idx === lastIndex) return;
      steps.forEach((s, i) => s.classList.toggle('is-active', i === idx));
      lastIndex = idx;
    };

    // ---- 'h': horizontaler Pin (Desktop) ----
    const measureH = () => {
      maxShift = Math.max(0, track.scrollWidth - stage.clientWidth);
      scrollTravel = maxShift * horizontalScrollFactor;
      section.style.setProperty('--max-shift', maxShift + 'px');
      // Hoehe der angehefteten Gesamtflaeche (nicht innerHeight) – nur so
      // faellt das Pin-Ende
      // exakt mit progress === 1 zusammen; sonst entsteht am Ende tote
      // Scroll-Strecke, in der sich nichts mehr bewegt.
      const scrollerTop = window.scrollY + scroller.getBoundingClientRect().top;
      scroller.style.height = (scrollTravel + pin.getBoundingClientRect().height) + 'px';
      scrollStart = scrollerTop;
    };

    const updateH = () => {
      let progress = scrollTravel > 0
        ? Math.min(1, Math.max(0, (window.scrollY - scrollStart) / scrollTravel))
        : 0;
      section.style.setProperty('--progress', progress.toFixed(4));
      setActive(Math.round(progress * (steps.length - 1)));
    };

    // ---- 'v': vertikale Journey (Mobile/Tablet) ----
    // Bezugspunkte sind die Knotenmittelpunkte. AP-554: Die breiten Startseiten-
    // Karten haben mittige Nummern; ihre Reise reicht wie auf dem iPhone
    // ueber Knoten 5 hinaus bis zum vorhandenen Linienende.
    // Gemessen wird die Station, nicht die beim Reveal verschobene Karte.
    // Breite Karten behalten Subpixel; Hochkant nutzt die bisherige Messung.
    const measureV = () => {
      const broadHome = homeProcess && mq.matches;
      const stageTop = broadHome ? stage.getBoundingClientRect().top : 0;
      nodeTops = steps.map((s) => {
        const node = s.querySelector('.step-node');
        // top:50% + translateY(-50%) setzt den Mittelpunkt auf die halbe
        // Kartenhoehe. offsetTop + halbe Knotengroesse waere zu weit unten.
        if (broadHome) {
          const rect = s.getBoundingClientRect();
          return rect.top - stageTop + rect.height / 2;
        }
        return node ? s.offsetTop + node.offsetTop + node.offsetHeight / 2
                    : s.offsetTop + s.offsetHeight / 2;
      });
      const lineEnd = broadHome ? path.getBoundingClientRect().bottom - stageTop
        : path.offsetTop + path.offsetHeight;
      const journeyEnd = iphoneMq.matches || broadHome
        ? lineEnd : nodeTops[nodeTops.length - 1];
      travel = Math.max(0, journeyEnd - nodeTops[0]);
      section.style.setProperty('--node-start', nodeTops[0].toFixed(2) + 'px');
      section.style.setProperty('--travel', travel.toFixed(2) + 'px');
    };

    const updateV = () => {
      // innerHeight bewusst in jedem Frame gelesen: klappt Safari die
      // Adressleiste ein, wandert der Anker mit, statt zu springen.
      // 0.62 statt 0.5 – die Station wird aktiv, kurz bevor sie die Mitte
      // erreicht, sonst wirkt der Effekt verzoegert.
      const vh = window.innerHeight;
      const anchor = vh * 0.62;
      const stageTop = stage.getBoundingClientRect().top;
      const progress = travel > 0
        ? Math.min(1, Math.max(0, (anchor - stageTop - nodeTops[0]) / travel))
        : 0;
      section.style.setProperty('--progress', progress.toFixed(4));
      const completesAtEnd = homeProcess && (iphoneMq.matches || mq.matches);
      section.classList.toggle('is-process-complete', completesAtEnd && progress >= 1);

      // Aktiv ist der letzte Knoten, der den Anker bereits passiert hat.
      // Math.round(progress * (n-1)) wie im Horizontal-Zweig taugt hier
      // nicht: die Karten sind unterschiedlich hoch, die Knoten also
      // ungleich ueber die Strecke verteilt.
      // .is-seen bleibt gesetzt – die Karten sollen beim Zurueckscrollen
      // nicht wieder verschwinden.
      let idx = 0;
      for (let i = 0; i < nodeTops.length; i++) {
        const y = stageTop + nodeTops[i];
        if (y <= anchor) idx = i;
        if (y <= vh * 0.92) steps[i].classList.add('is-seen');
      }
      setActive(idx);
    };

    const measure = () => { if (mode === 'h') measureH(); else if (mode === 'v') measureV(); };
    const update = () => {
      ticking = false;
      if (mode === 'h') updateH(); else if (mode === 'v') updateV();
    };

    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    };

    const stop = () => {
      mode = null;
      document.removeEventListener('scroll', onScroll);
      section.classList.remove('is-scrollytelling', 'is-landscape-scrollytelling', 'is-vertical-journey');
      section.classList.remove('is-process-complete');
      scroller.style.height = '';
      section.style.removeProperty('--progress');
      section.style.removeProperty('--max-shift');
      section.style.removeProperty('--node-start');
      section.style.removeProperty('--travel');
      section.style.removeProperty('--path-y');
      steps.forEach((s) => s.classList.remove('is-active', 'is-seen'));
      lastIndex = -1;
    };

    const start = (next) => {
      if (mode === next) return;
      stop();                            // Zustandswechsel raeumt den anderen Zweig ab
      mode = next;
      section.classList.add(next === 'h' ? 'is-scrollytelling' : 'is-vertical-journey');
      // Erst im naechsten Frame messen: die eben gesetzte Klasse aendert
      // Buehnenhoehe bzw. Knotenpositionen.
      requestAnimationFrame(() => { if (mode === next) { measure(); update(); } });
      document.addEventListener('scroll', onScroll, { passive: true });
    };

    const apply = () => {
      if (homeProcess) {
        // Die Startseite bleibt auch auf Desktop und im Handy-Querformat im
        // normalen Dokumentfluss. Das vermeidet einen zweiten Scrollkontext
        // und macht alle fuenf breiten Bildkarten direkt erreichbar.
        section.classList.remove('has-horizontal-process');
        stage.removeAttribute('tabindex');
        stage.removeAttribute('role');
        stage.removeAttribute('aria-label');
        stage.scrollLeft = 0;
        motionMq.matches ? stop() : start('v');
        return;
      }
      reduced ? stop() : start(mq.matches ? 'h' : 'v');
    };

    let rt = null;
    const remeasure = () => {
      clearTimeout(rt);
      // apply() zuerst: sonst prueft dieser Pfad bei aktivem Pin nur noch
      // Geometrie und nie den Zustand – die Umschaltung haengt dann allein
      // am mq-change-Listener. start()/stop() sind idempotent.
      rt = setTimeout(() => { apply(); if (mode) { measure(); update(); } }, 150);
    };
    window.addEventListener('resize', remeasure, { passive: true });
    // Beim Drehen feuert resize nicht auf allen iOS-Versionen zuverlaessig.
    window.addEventListener('orientationchange', remeasure, { passive: true });

    if (mq.addEventListener) mq.addEventListener('change', apply);
    else if (mq.addListener) mq.addListener(apply);

    if (homeProcess) {
      if (motionMq.addEventListener) motionMq.addEventListener('change', remeasure);
      else if (motionMq.addListener) motionMq.addListener(remeasure);
      if ('ResizeObserver' in window) {
        const observer = new ResizeObserver(() => { if (mq.matches) remeasure(); });
        observer.observe(stage);
        observer.observe(pin.querySelector('.container'));
      }
      if (document.fonts) document.fonts.ready.then(() => { if (mq.matches) remeasure(); });
    }
    apply();
  })();

  // --- Einzugsgebiet-Karte: Outline zeichnen + Marker staggern ---
  // Setzt stroke-dasharray/-offset vor dem Reveal; die Animationen selbst
  // laufen per CSS, sobald der .reveal-Observer .is-in an .proof-map setzt.
  (function () {
    const map = document.querySelector('.proof-map .map');
    if (!map || reduced) return;
    const outline = map.querySelector('.m-outline');
    if (outline) {
      const L = outline.getTotalLength();
      outline.style.strokeDasharray = L;
      outline.style.strokeDashoffset = L;
    }
    map.querySelectorAll('.m-node').forEach((n) => {
      const i = parseFloat(n.style.getPropertyValue('--i')) || 0;
      n.style.animationDelay = (1050 + i * 70) + 'ms';
    });
    map.querySelectorAll('.m-label').forEach((n) => {
      const i = parseFloat(n.style.getPropertyValue('--i')) || 0;
      n.style.animationDelay = (1180 + i * 70) + 'ms';
    });
  })();

  // --- Leistungen (Privat): roter Faden hinter den Karten ---
  // Karteninhalte (inkl. Langtext und Link) sind dauerhaft per CSS sichtbar;
  // dieses JS zeichnet nur den dekorativen Faden. Ohne JS fehlt schlicht der Faden.
  (function () {
    const flow = document.getElementById('svcFlow');
    if (!flow) return;
    const grid = document.getElementById('svcGrid');
    const svg  = document.getElementById('svcThread');
    const cta  = document.getElementById('svcCta');
    if (!grid || !svg || !cta) return;

    const DUR = 1200;
    let played = false;

    // Geometrie aus dem tatsaechlichen Layout (4 / 2 / 1 Spalten).
    // Bewusst ueber getBoundingClientRect statt offsetTop/-Left: die Karten und
    // der CTA haengen an unterschiedlichen offsetParents (.svc-cta ist relativ
    // positioniert), offset* wuerde die beiden in verschiedene Koordinaten-
    // systeme legen und den Schlussbogen an den oberen Rand setzen.
    const geometry = () => {
      const cardEls = Array.from(grid.querySelectorAll('.svc-card'));
      if (!cardEls.length) return null;
      const origin = flow.getBoundingClientRect();
      const box = (el) => {
        const r = el.getBoundingClientRect();
        return { left: r.left - origin.left, top: r.top - origin.top, width: r.width, height: r.height };
      };
      const cards = cardEls.map(box);
      const rowMap = new Map();
      cards.forEach((c) => {
        const t = Math.round(c.top);
        if (!rowMap.has(t)) rowMap.set(t, []);
        rowMap.get(t).push(c);
      });
      const rows = [...rowMap.entries()].sort((a, b) => a[0] - b[0]).map((e) => e[1]);
      const cols = Math.max(...rows.map((r) => r.length));
      const ctaBox = box(cta);
      const ctaX = ctaBox.left + ctaBox.width / 2;
      const ctaY = ctaBox.top + 4;
      let d = '';
      const dots = [], knots = [];

      if (cols === 1) {
        // Mobil: schlanke Spine links NEBEN den Karten. (Innerhalb der Karten
        // laege sie hinter deren Hintergrund und waere unsichtbar.)
        const x = Math.max(4, cards[0].left - 12);
        const yFirst = cards[0].top + cards[0].height / 2;
        const lastCard = cards[cards.length - 1];
        const yLast = lastCard.top + lastCard.height / 2;
        d = 'M ' + x + ' ' + yFirst + ' L ' + x + ' ' + yLast;
        const bendY = ctaY - 24;
        d += ' L ' + x + ' ' + bendY + ' L ' + ctaX + ' ' + bendY + ' L ' + ctaX + ' ' + ctaY;
        cards.forEach((c) => dots.push([x, c.top + c.height / 2]));
        knots.push([x, yFirst], [ctaX, ctaY]);
      } else {
        // Schlangenlinie durch die Zeilen, Punkte sitzen in den Fugen
        let pX = 0, pY = 0;
        rows.forEach((row, i) => {
          const yc = row[0].top + row[0].height / 2;
          const leftX = row[0].left;
          const last = row[row.length - 1];
          const rightX = last.left + last.width;
          const goRight = (i % 2 === 0);
          const sX = goRight ? leftX - 12 : rightX + 12;
          const eX = goRight ? rightX + 12 : leftX - 12;
          if (i === 0) { d += 'M ' + sX + ' ' + yc; knots.push([sX, yc]); }
          else { d += ' C ' + pX + ' ' + (pY + 34) + ', ' + sX + ' ' + (yc - 34) + ', ' + sX + ' ' + yc; }
          d += ' L ' + eX + ' ' + yc;
          for (let k = 0; k < row.length - 1; k++) {
            dots.push([(row[k].left + row[k].width + row[k + 1].left) / 2, yc]);
          }
          pX = eX; pY = yc;
        });
        // Eckiger Abschluss: senkrecht unter die letzte Zeile, waagerecht bis
        // zur CTA-Mitte, senkrecht in den Button.
        const bendY = ctaY - 28;
        d += ' L ' + pX + ' ' + bendY + ' L ' + ctaX + ' ' + bendY + ' L ' + ctaX + ' ' + ctaY;
        knots.push([ctaX, ctaY]);
      }
      return { d, dots, knots };
    };

    const render = (animate) => {
      const g = geometry();
      if (!g) return;
      const W = flow.clientWidth, H = flow.clientHeight;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      svg.setAttribute('width', W);
      svg.setAttribute('height', H);

      let html = '<path d="' + g.d + '" class="svc-thread-line"/>';
      g.dots.forEach((p) => { html += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3" class="svc-thread-dot"/>'; });
      g.knots.forEach((p) => { html += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="4.5" class="svc-thread-knot"/>'; });
      svg.innerHTML = html;

      const line = svg.querySelector('.svc-thread-line');
      if (!animate || reduced || !line.getTotalLength) {
        svg.classList.remove('is-seq');
        return;
      }

      // Einmalig: Linie zeichnen. Punkte und Knoten blendet .is-seq per CSS ein.
      svg.classList.add('is-seq');
      const L = line.getTotalLength();
      line.style.strokeDasharray = L;
      line.style.strokeDashoffset = L;
      line.getBoundingClientRect(); // Reflow erzwingen
      line.style.transition = 'stroke-dashoffset ' + (DUR / 1000) + 's cubic-bezier(.45,.05,.2,1)';
      line.style.strokeDashoffset = '0';
    };

    if (!reduced && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach((e) => {
          if (!e.isIntersecting || played) return;
          played = true;
          render(true);
          obs.unobserve(e.target);
        });
      }, { threshold: 0.25 });
      io.observe(flow);
    } else {
      render(false);
    }

    // Resize/Fonts: Geometrie neu, aber nie erneut animieren.
    let t;
    window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => render(false), 120); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => render(false));
    setTimeout(() => { if (!played) render(false); }, 300);
  })();

})();

/* ===== AP-411: Schreibmaschine "Alles aus einer Hand" =======================
   Nur auf der Ueber-uns-Seite. main.js ist seitenweit, deshalb der fruehe
   return, wenn .ueber-betrieb fehlt.

   Vier Eigenschaften, die Absicht sind:
   - Die Woerter kommen aus dem DOM, nicht aus einem Array hier. Aendert jemand
     die Kette im HTML, laeuft die Animation automatisch mit; zwei Quellen fuer
     dieselbe Liste driften sonst auseinander.
   - Der return bei prefers-reduced-motion steht VOR allem anderen. Die Kette
     bleibt dann voellig unberuehrt.
   - Start erst bei Sichtbarkeit, danach disconnect(). Sonst waere der Durchlauf
     bei MODE 'once' vorbei, bevor jemand hinsieht.
   - done-Flag, damit 'once' bei erneutem Hineinscrollen nicht neu anlaeuft.

   Geschrieben wird ausschliesslich in textContent. Der Cursor ist ein
   ::after-Pseudoelement in ueber-uns.css - es gibt keinen Pfad, ueber den Text
   als Markup interpretiert werden koennte. */
(function () {
  'use strict';

  var MODE = 'once';        // 'once' = einmal durch, danach bleibt die Liste stehen
                            // 'loop' = Dauerschleife (dann ist der Pause-Knopf zwingend,
                            //          WCAG 2.2.2 - er steht im Markup bereit)
  /* AP-446: Auf Ansage des Auftraggebers deutlich langsamer. Die Werte aus
     AP-411 waren 58 / 28 / 1100 / 260 / 420; gemessen lief der Durchlauf damit
     11,2 Sekunden. 95ms je Buchstabe liegen im Bereich, in dem das Schreiben
     wie von Hand getippt wirkt statt wie ein Aufbau.
     Das Loeschen bleibt bewusst schneller als das Schreiben - rueckwaerts liest
     niemand mit, und gleich lange Loeschzeiten wirken zaeh. Das Verhaeltnis von
     rund 1:2 ist das aus AP-411, nur beide Werte angehoben. */
  var TYPE_MS = 95, DELETE_MS = 45, HOLD_MS = 1400, GAP_MS = 340, START_MS = 520;

  var sec = document.querySelector('.ueber-betrieb');
  if (!sec) return;

  var chain = sec.querySelector('.ueber-betrieb__kette');
  var typer = sec.querySelector('.ueber-betrieb__typer');
  var out   = sec.querySelector('.ueber-betrieb__typer-out');
  var pause = sec.querySelector('.ueber-betrieb__typer-pause');
  if (!chain || !typer || !out) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var STEPS = Array.prototype.map.call(chain.querySelectorAll('li'), function (li) {
    return li.textContent.trim();
  }).filter(Boolean);
  if (STEPS.length < 2) return;

  var timer = null, paused = false, running = false, done = false;
  var i = 0, pos = 0, deleting = false;

  function draw(text) { out.textContent = text; }
  function stop() { if (timer) { clearTimeout(timer); timer = null; } }

  function settle() {
    stop();
    running = false;
    done = true;
    sec.classList.remove('is-typing');
    typer.hidden = true;
    if (pause) pause.hidden = true;
  }

  function tick() {
    if (paused) { timer = setTimeout(tick, 220); return; }
    var word = STEPS[i];

    if (!deleting) {
      pos += 1;
      draw(word.slice(0, pos));
      if (pos === word.length) {
        if (MODE === 'once' && i === STEPS.length - 1) {
          timer = setTimeout(settle, HOLD_MS);
          return;
        }
        deleting = true;
        timer = setTimeout(tick, HOLD_MS);
        return;
      }
      timer = setTimeout(tick, TYPE_MS);
    } else {
      pos -= 1;
      draw(word.slice(0, pos));
      if (pos === 0) {
        deleting = false;
        i = (i + 1) % STEPS.length;
        timer = setTimeout(tick, GAP_MS);
        return;
      }
      timer = setTimeout(tick, DELETE_MS);
    }
  }

  function start() {
    if (running || done) return;
    running = true;
    sec.classList.add('is-typing');
    typer.hidden = false;
    if (MODE === 'loop' && pause) pause.hidden = false;
    draw('');
    timer = setTimeout(tick, START_MS);
  }

  if (pause) {
    pause.addEventListener('click', function () {
      paused = !paused;
      pause.textContent = paused ? 'Weiter' : 'Pause';
      pause.setAttribute('aria-pressed', String(paused));
    });
  }

  // Kein Timer im versteckten Tab.
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { stop(); }
    else if (running && !timer) { timer = setTimeout(tick, GAP_MS); }
  });

  /* Beobachtet wird die KETTE, nicht der Typer. Der Typer startet hidden, ist
     damit display:none und hat ein Rechteck von 0x0 - ein IntersectionObserver
     meldet darauf dauerhaft ratio 0 und isIntersecting false, die Animation
     kaeme nie in Gang. Gemessen: auf dem Typer ratio 0, auf der Kette ratio 1.
     Die Kette steht an derselben Stelle und ist sichtbar, bis start() sie
     wegklappt - danach ist der Observer ohnehin schon getrennt. */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries, obs) {
      for (var n = 0; n < entries.length; n++) {
        if (entries[n].isIntersecting) { obs.disconnect(); start(); return; }
      }
    }, { threshold: 0.4 });
    io.observe(chain);
  } else {
    start();
  }
})();

/* AP-490: Zitat-Animation auf der Ueber-uns-Seite ("Kein Auftrag ist uns zu
   klein."). Setzt einmal .is-in am Raster, sobald das Zitat zu 60 Prozent
   sichtbar ist - die Bewegung selbst steht komplett in ueber-uns.css.
   Beobachtet wird das Zitat, nicht das Raster: das ist auf dem Handy so hoch,
   dass 60 Prozent davon nicht in jeden Bildschirm passen. Ohne
   IntersectionObserver sofort der Endzustand.
   AP-580 (02.10.2026): Am Desktop steht das Zitat beim Laden 789px unter der
   Fensterkante - ab gut 850px Fensterhoehe (Chrome am Mac) war es damit schon
   zu 60 Prozent sichtbar, die Animation lief beim Laden am unteren Rand ab und
   war beim Hinscrollen vorbei. Ab 901px zaehlt deshalb nur das Fenster bis zur
   72-Prozent-Linie, wie bei data-reveal-late (AP-534). Handy unveraendert.
   AP-582 (02.10.2026): Am Desktop ausserdem erst nach dem ersten Scrollen - auf
   hohen Fenstern (ab ~1190px) steht das Zitat sonst schon beim Laden ueber der
   Linie, und Steg wie Zitat sollen beim Oeffnen der Seite noch nicht da sein. */
(function () {
  'use strict';
  var zitat = document.querySelector('[data-ueber-q]');
  var ziel = zitat && zitat.closest('.ueber-q');
  if (!ziel) return;
  if (!('IntersectionObserver' in window)) { ziel.classList.add('is-in'); return; }
  var spaet = window.matchMedia && window.matchMedia('(min-width: 901px)').matches;
  var gescrollt = !spaet || window.scrollY > 0, bereit = false;
  if (!gescrollt) {
    window.addEventListener('scroll', function () {
      gescrollt = true;
      if (bereit) ziel.classList.add('is-in');
    }, { once: true, passive: true });
  }
  var io = new IntersectionObserver(function (entries) {
    for (var n = 0; n < entries.length; n++) {
      /* Nicht isIntersecting allein: das ist schon bei der ersten Meldung nach
         observe() wahr, sobald das Zitat ueberhaupt angeschnitten ist. .599
         statt .6 nur gegen Rundung der Flaechenquote genau am Schwellwert. */
      if (entries[n].intersectionRatio >= 0.599) {
        io.disconnect();
        bereit = true;
        if (gescrollt) ziel.classList.add('is-in');
        return;
      }
    }
  }, { threshold: 0.6, rootMargin: spaet ? '0px 0px -28% 0px' : '0px' });
  io.observe(zitat);
})();

