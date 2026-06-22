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

})();
