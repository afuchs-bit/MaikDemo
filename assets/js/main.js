// Maik Rohdich – Frontend Interactions
(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Footer year ---
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // --- Sticky header condense on scroll ---
  const header = document.getElementById('siteHeader');
  let lastY = 0;
  const onScroll = () => {
    const sc = window.scrollY > 12;
    header.classList.toggle('is-scrolled', sc);
    lastY = window.scrollY;
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --- Mobile nav toggle (AP-39) ---
  // Das Menue ist aufgeklappt hoeher als der Viewport und sitzt in einem
  // sticky Header. Ohne eigenen Scrollbereich waren die unteren Eintraege
  // nicht erreichbar. Dazu: Scroll-Lock, Escape, Tap ausserhalb, Fokusfuehrung.
  const navToggle = document.getElementById('navToggle');
  const primaryNav = document.querySelector('.primary-nav');

  // Headerhoehe fuer die max-height-Rechnung des Menues bereitstellen.
  // Der Header aendert seine Hoehe beim Scrollen (.is-scrolled), deshalb
  // nachfuehren statt einmalig setzen.
  // Wichtig: nur im geschlossenen Zustand messen. Die Navigation liegt INNERHALB
  // des Headers – bei offenem Menue wuerde der Header sich selbst samt Menue
  // messen (gemessen: 526px statt 73px) und die max-height-Rechnung waere zirkulaer.
  const setHeaderHeight = () => {
    if (!header) return;
    if (primaryNav && primaryNav.classList.contains('is-open')) return;
    document.documentElement.style.setProperty(
      '--header-h', Math.round(header.getBoundingClientRect().height) + 'px');
  };
  setHeaderHeight();
  window.addEventListener('resize', setHeaderHeight);
  document.addEventListener('scroll', setHeaderHeight, { passive: true });

  if (navToggle && primaryNav) {
    // Scroll-Lock: `overflow: hidden` am body reicht auf iOS nicht zuverlaessig.
    // `position: fixed` haelt zuverlaessig, verliert aber die Scrollposition –
    // die wird gemerkt und beim Schliessen wiederhergestellt.
    let gemerkteScrollPosition = 0;
    const sperreScroll = () => {
      gemerkteScrollPosition = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = '-' + gemerkteScrollPosition + 'px';
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
    };
    const gibScrollFrei = () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
    };

    // Das Menue sitzt nicht direkt unter der Headerkante: .primary-nav ist eine
    // eigene Rasterzeile in .header-inner, dazwischen liegt deren row-gap. Die
    // CSS-Rechnung mit --header-h trifft die Oberkante daher um einige Pixel
    // zu hoch. Hier wird die tatsaechliche Oberkante gemessen und die Hoehe
    // exakt gesetzt; die CSS-Regel bleibt als No-JS-Fallback bestehen.
    const menuEl = primaryNav.querySelector('.menu');
    const aktionsleiste = document.querySelector('.mobile-actions');
    const passeMenuhoeheAn = () => {
      if (!menuEl || !primaryNav.classList.contains('is-open')) return;
      menuEl.style.maxHeight = '';
      const oben = menuEl.getBoundingClientRect().top;
      // Unten steht die fixierte Action-Bar (Anrufen / WhatsApp). Ohne sie
      // abzuziehen laegen die letzten Menueeintraege dahinter und waeren zwar
      // erreichbar, aber verdeckt.
      let unten = 12;
      if (aktionsleiste && getComputedStyle(aktionsleiste).display !== 'none') {
        unten = Math.round(window.innerHeight - aktionsleiste.getBoundingClientRect().top) + 8;
      }
      menuEl.style.maxHeight = Math.max(120, window.innerHeight - oben - unten) + 'px';
    };

    const navOffen = () => primaryNav.classList.contains('is-open');

    const oeffneNav = () => {
      setHeaderHeight();                  // muss VOR dem Aufklappen passieren
      // Reihenfolge ist hier wesentlich: erst sperren, dann aufklappen.
      // Das Menue liegt im Header und macht ihn beim Aufklappen ~450px hoeher.
      // Der gesamte Inhalt darunter rutscht mit, worauf das Scroll-Anchoring
      // des Browsers die Scrollposition um dieselben ~450px nachzieht. Wird
      // erst danach gemerkt, merkt man sich den verschobenen Wert und die
      // Seite steht nach dem Schliessen zu weit unten.
      sperreScroll();
      primaryNav.classList.add('is-open');
      navToggle.setAttribute('aria-expanded', 'true');
      passeMenuhoeheAn();
      // Fokus in das Menue setzen, damit Tastatur und Screenreader dort landen.
      // preventScroll: sonst scrollt der Browser das Ziel in den Blick und
      // verschiebt die gemerkte Position.
      primaryNav.querySelector('.menu a')?.focus({ preventScroll: true });
    };

    const schliesseNav = (fokusZurueck) => {
      if (!navOffen()) return;
      primaryNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      if (menuEl) menuEl.style.maxHeight = '';
      gibScrollFrei();
      // Erst fokussieren, dann die Position wiederherstellen - focus() kann
      // das Ziel in den Blick scrollen und wuerde die Position sonst zerstoeren.
      if (fokusZurueck) navToggle.focus({ preventScroll: true });
      // `behavior: instant` ist hier wesentlich: html traegt
      // `scroll-behavior: smooth`, eine gemerkte Position wuerde sonst
      // animiert angefahren und unterwegs von anderen Scrolls ueberholt.
      window.scrollTo({ top: gemerkteScrollPosition, behavior: 'instant' });
    };

    navToggle.addEventListener('click', () => {
      if (navOffen()) schliesseNav(false); else oeffneNav();
    });

    // Klick auf einen Link schliesst weiter – jetzt inklusive Scroll-Freigabe.
    // Der Sprung zum Anker muss NACH dem Aufheben von `position: fixed`
    // passieren, sonst landet die Seite an der gemerkten alten Position.
    primaryNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', (e) => {
        if (!navOffen()) return;
        const ziel = a.getAttribute('href') || '';
        const anker = ziel.startsWith('#') ? document.querySelector(ziel) : null;
        primaryNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        if (menuEl) menuEl.style.maxHeight = '';
        gibScrollFrei();
        // Erst zurueck an die gemerkte Stelle, damit der Sprung zum Anker von
        // dort ausgeht und nicht sichtbar ueber den Seitenanfang huepft.
        window.scrollTo({ top: gemerkteScrollPosition, behavior: 'instant' });
        if (anker) {
          e.preventDefault();
          anker.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
        }
      });
    });

    // Tap ausserhalb schliesst. navToggle liegt innerhalb von .primary-nav,
    // sein eigener Handler hat dann schon umgeschaltet.
    document.addEventListener('click', (e) => {
      if (navOffen() && !e.target.closest('.primary-nav')) schliesseNav(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') schliesseNav(true);
    });

    // Wechselt der Viewport auf Desktop, waehrend das Menue offen ist,
    // muss der Scroll-Lock weg – sonst haengt die Seite fest.
    const desktopAb = window.matchMedia('(min-width: 901px)');
    const aufDesktopWechsel = (ev) => { if (ev.matches) schliesseNav(false); };
    if (desktopAb.addEventListener) desktopAb.addEventListener('change', aufDesktopWechsel);
    else desktopAb.addListener(aufDesktopWechsel);
  }

  // --- Leistungen-Untermenü (AP-18) ---
  const closeSubmenus = () => {
    document.querySelectorAll('.menu-item--sub.is-open').forEach(li => {
      li.classList.remove('is-open');
      li.querySelector('.submenu-toggle')?.setAttribute('aria-expanded', 'false');
    });
  };
  document.querySelectorAll('.submenu-toggle').forEach(btn => {
    const li = btn.closest('.menu-item--sub');
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const open = li.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.menu-item--sub')) closeSubmenus();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSubmenus(); });

  // --- Call popover ---
  const callBtn = document.getElementById('callBtn');
  const callPop = document.getElementById('callPopover');
  if (callBtn && callPop) {
    const close = () => {
      callPop.hidden = true;
      callBtn.setAttribute('aria-expanded', 'false');
    };
    const open = () => {
      callPop.hidden = false;
      callBtn.setAttribute('aria-expanded', 'true');
    };
    callBtn.addEventListener('click', e => {
      e.stopPropagation();
      callPop.hidden ? open() : close();
    });
    document.addEventListener('click', e => {
      if (!callPop.contains(e.target) && e.target !== callBtn) close();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') close();
    });
  }

  // --- Scroll reveal ---
  const els = document.querySelectorAll('.reveal');
  if (!reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // stagger siblings slightly
          const idx = Array.from(entry.target.parentNode?.children || []).indexOf(entry.target);
          entry.target.style.transitionDelay = (Math.max(0, idx) * 60) + 'ms';
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    els.forEach(el => io.observe(el));
  } else {
    els.forEach(el => el.classList.add('is-in'));
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

  // --- Subtle parallax on hero dots ---
  if (!reduced) {
    const hero = document.querySelector('.hero');
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

  // --- Sonderthemen-CTA: Bereich im Kontaktformular vorbefüllen ---
  document.querySelectorAll('[data-prefill-bereich]').forEach((a) => {
    a.addEventListener('click', () => {
      const sel = document.querySelector('#contactForm select[name="bereich"]');
      if (sel) sel.value = a.getAttribute('data-prefill-bereich');
    });
  });

  // --- Bereich aus URL vorbefüllen (Deep-Link von der Galerie: ?bereich=<Option-Text>) ---
  // Ergänzt den Same-Page-Mechanismus oben um seitenübergreifende Vorbefüllung.
  // Der Wert muss exakt einem <option>-Text entsprechen, sonst no-op.
  {
    const bereich = new URLSearchParams(location.search).get('bereich');
    if (bereich) {
      const sel = document.querySelector('#contactForm select[name="bereich"]');
      if (sel) sel.value = bereich;
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

  // --- Ablauf: horizontaler Scroll-Zeitstrahl (Pin + Fortschritt) ---
  // Progressive Enhancement: nur Desktop (>=1024px) und ohne prefers-reduced-motion.
  // Sonst bleibt der vertikale CSS-Zeitstrahl (Basis) aktiv – kein Scroll-Listener.
  (function () {
    const scroller = document.querySelector('[data-process-scroller]');
    if (!scroller) return;
    const section = scroller.closest('.section-process');
    const stage = scroller.querySelector('.process-stage');
    const track = scroller.querySelector('[data-process-track]');
    if (!section || !stage || !track) return;

    const steps = Array.from(track.querySelectorAll('.step'));
    const mq = window.matchMedia('(min-width: 1024px)');

    let active = false, ticking = false, maxShift = 0, lastIndex = -1;

    const measure = () => {
      maxShift = Math.max(0, track.scrollWidth - stage.clientWidth);
      section.style.setProperty('--max-shift', maxShift + 'px');
      // Buehnenhoehe (nicht innerHeight) – nur so faellt das Pin-Ende
      // exakt mit progress === 1 zusammen; sonst entsteht am Ende tote
      // Scroll-Strecke, in der sich nichts mehr bewegt.
      scroller.style.height = (maxShift + stage.getBoundingClientRect().height) + 'px';
    };

    const update = () => {
      ticking = false;
      const top = scroller.getBoundingClientRect().top;
      const progress = maxShift > 0 ? Math.min(1, Math.max(0, -top / maxShift)) : 0;
      section.style.setProperty('--progress', progress.toFixed(4));
      const idx = Math.round(progress * (steps.length - 1));
      if (idx !== lastIndex) {
        steps.forEach((s, i) => s.classList.toggle('is-active', i === idx));
        lastIndex = idx;
      }
    };

    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    };

    const enable = () => {
      if (active) return;
      active = true;
      section.classList.add('is-scrollytelling');
      requestAnimationFrame(() => { measure(); update(); });
      document.addEventListener('scroll', onScroll, { passive: true });
    };

    const disable = () => {
      if (!active) return;
      active = false;
      document.removeEventListener('scroll', onScroll);
      section.classList.remove('is-scrollytelling');
      scroller.style.height = '';
      section.style.removeProperty('--progress');
      section.style.removeProperty('--max-shift');
      steps.forEach((s) => s.classList.remove('is-active'));
      lastIndex = -1;
    };

    const apply = () => { (mq.matches && !reduced) ? enable() : disable(); };

    let rt = null;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      // apply() zuerst: sonst prueft dieser Pfad bei aktivem Pin nur noch
      // Geometrie und nie den Zustand – die Umschaltung haengt dann allein
      // am mq-change-Listener. enable()/disable() sind idempotent.
      rt = setTimeout(() => { apply(); if (active) { measure(); update(); } }, 150);
    }, { passive: true });

    if (mq.addEventListener) mq.addEventListener('change', apply);
    else if (mq.addListener) mq.addListener(apply);

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

  // --- Fachliche Autorität: Bestandsplan in 4 Stufen aufbauen + Hover-Stepping ---
  // Progressive Enhancement: ohne JS/bei reduzierter Bewegung ist der Plan komplett sichtbar.
  (function () {
    const plan   = document.getElementById('bpPlan');
    const visual = document.getElementById('authVisual');
    const steps  = document.getElementById('authSteps');
    const cap    = document.getElementById('bpCap');
    if (!plan || !visual || !steps) return;

    const items = Array.from(steps.querySelectorAll('.ap'));
    const CAPS = {
      1: 'Aufnahme vor Ort – nur das Grundstück.',
      2: 'Bestand: Haus, Bäume, Boden, Hanglage.',
      3: 'Baumkontrolle durch den Sachverständigen.',
      4: 'Erst jetzt wird gestaltet.'
    };

    const render = (stage) => {
      plan.classList.remove('s1', 's2', 's3', 's4');
      for (let n = 1; n <= stage; n++) plan.classList.add('s' + n);
      visual.classList.toggle('plan-on4', stage >= 4);
      items.forEach((li) => {
        const s = +li.dataset.s;
        li.classList.toggle('is-on', s <= stage);
        li.classList.toggle('is-cur', s === stage);
      });
      if (cap) cap.textContent = CAPS[stage] || '';
    };

    // Reduzierte Bewegung: sofort Endzustand, keine Sequenz.
    if (reduced) { render(4); return; }

    // Sequenz-Modus aktivieren (blendet Layer/Fakt-Karte zunächst aus).
    plan.classList.add('is-seq');
    visual.classList.add('is-seq');
    steps.classList.add('is-seq');

    // Kontur für den Zeichen-Effekt vorbereiten (wie bei der Einzugsgebiet-Karte).
    const edge = document.getElementById('bpEdge');
    if (edge && edge.getTotalLength) {
      const L = edge.getTotalLength();
      edge.style.strokeDasharray = L;
      edge.style.strokeDashoffset = L;
    }

    let locked = false; // true = Sequenz gelaufen, Hover übernimmt
    const play = () => {
      [1, 2, 3, 4].forEach((s, i) => setTimeout(() => render(s), 300 + i * 1250));
      setTimeout(() => { locked = true; }, 300 + 3 * 1250 + 900);
    };

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { play(); obs.unobserve(e.target); }
        });
      }, { threshold: 0.4 });
      io.observe(plan);
    } else {
      render(4); locked = true;
    }

    // Nach der Sequenz: Schritte per Hover/Fokus durchsteppen.
    items.forEach((li) => {
      const go = () => { if (locked) render(+li.dataset.s); };
      li.addEventListener('mouseenter', go);
      li.addEventListener('focusin', go);
      li.tabIndex = 0;
    });
    steps.addEventListener('mouseleave', () => { if (locked) render(4); });
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
