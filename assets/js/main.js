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

  // --- Mobile nav toggle ---
  const navToggle = document.getElementById('navToggle');
  const primaryNav = document.querySelector('.primary-nav');
  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', () => {
      const open = primaryNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    primaryNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        primaryNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

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

})();
