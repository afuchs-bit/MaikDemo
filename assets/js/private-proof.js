(() => {
  const carousel = document.querySelector('[data-review-pair-rotator]');
  if (!carousel) return;

  const pairs = Array.from(carousel.querySelectorAll('[data-review-pair]'));
  const controls = carousel.querySelector('[data-review-controls]');
  const previous = carousel.querySelector('[data-review-prev]');
  const next = carousel.querySelector('[data-review-next]');
  const status = carousel.querySelector('[data-review-status]');
  const autoplay = carousel.querySelector('[data-review-autoplay]');
  const viewport = carousel.querySelector('[data-review-viewport]');
  const autoplayIcon = carousel.querySelector('.private-review-autoplay-icon');
  const autoplayLabel = carousel.querySelector('[data-review-autoplay-label]');
  const details = Array.from(carousel.querySelectorAll('.private-review-details'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionDuration = 280;
  const motionEasing = 'cubic-bezier(.22,.61,.36,1)';
  const detailStates = new WeakMap();

  if (pairs.length < 2 || !controls || !previous || !next || !status || !autoplay || !viewport) return;

  const interval = 15000;
  let index = Math.max(0, pairs.findIndex((pair) => pair.classList.contains('is-active')));
  let timer = null;
  let isVisible = !('IntersectionObserver' in window);
  let pointerInside = false;
  let focusInside = false;
  let manuallyPaused = false;
  let viewportScrollFrame = null;

  const getDetailState = (item) => {
    if (!detailStates.has(item)) {
      detailStates.set(item, {
        animation: null,
        contentAnimation: null,
        excerptAnimation: null,
        settleFrame: null,
        targetOpen: item.open
      });
    }
    return detailStates.get(item);
  };

  const hasOpenReview = () => details.some((item) => {
    const state = getDetailState(item);
    return item.open || state.targetOpen || state.animation || state.excerptAnimation;
  });

  const stopViewportMotion = () => {
    if (viewportScrollFrame === null) return;
    window.cancelAnimationFrame(viewportScrollFrame);
    viewportScrollFrame = null;
  };

  const resetViewport = () => {
    stopViewportMotion();
    viewport.scrollTop = 0;
  };

  const animateViewportHome = () => {
    stopViewportMotion();
    const start = viewport.scrollTop;
    if (start <= 0) return;
    if (reducedMotion.matches) {
      viewport.scrollTop = 0;
      return;
    }

    const startedAt = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - startedAt) / motionDuration);
      const eased = 1 - Math.pow(1 - progress, 3);
      viewport.scrollTop = start * (1 - eased);
      if (progress < 1) viewportScrollFrame = window.requestAnimationFrame(step);
      else viewportScrollFrame = null;
    };
    viewportScrollFrame = window.requestAnimationFrame(step);
  };

  const stopTimer = () => {
    if (timer === null) return;
    window.clearTimeout(timer);
    timer = null;
  };

  const canAutoplay = () => (
    !reducedMotion.matches &&
    !manuallyPaused &&
    isVisible &&
    !pointerInside &&
    !focusInside &&
    !hasOpenReview() &&
    !document.hidden
  );

  const updateAutoplayControl = () => {
    autoplay.setAttribute('aria-pressed', String(manuallyPaused));
    if (manuallyPaused) {
      autoplay.setAttribute('aria-label', 'Automatischen Wechsel starten');
      if (autoplayIcon) autoplayIcon.textContent = '▶';
      if (autoplayLabel) autoplayLabel.textContent = 'Start';
    } else {
      autoplay.setAttribute('aria-label', 'Automatischen Wechsel pausieren');
      if (autoplayIcon) autoplayIcon.textContent = 'Ⅱ';
      if (autoplayLabel) autoplayLabel.textContent = 'Pause';
    }
  };

  const clearDetailMotion = (item) => {
    const review = item.closest('.private-review-item');
    review?.classList.remove('is-review-opening', 'is-review-closing');
    review?.style.removeProperty('height');
    review?.style.removeProperty('overflow');
    item.querySelector(':scope > blockquote')?.style.removeProperty('opacity');
    review?.querySelector(':scope > .private-review-excerpt')?.style.removeProperty('opacity');
  };

  const finishDetailImmediately = (item, shouldOpen) => {
    const state = getDetailState(item);
    state.animation?.cancel();
    state.contentAnimation?.cancel();
    state.excerptAnimation?.cancel();
    if (state.settleFrame !== null) window.cancelAnimationFrame(state.settleFrame);
    state.animation = null;
    state.contentAnimation = null;
    state.excerptAnimation = null;
    state.settleFrame = null;
    state.targetOpen = shouldOpen;
    item.open = shouldOpen;
    clearDetailMotion(item);
  };

  const measureReviewHeight = (item, shouldOpen) => {
    const review = item.closest('.private-review-item');
    if (!review) return 0;
    item.open = shouldOpen;
    review.style.removeProperty('height');
    return review.getBoundingClientRect().height;
  };

  const animateDetail = (item, shouldOpen) => {
    const state = getDetailState(item);
    const review = item.closest('.private-review-item');
    const content = item.querySelector(':scope > blockquote');
    const excerpt = review?.querySelector(':scope > .private-review-excerpt');
    if (!review || !content || !excerpt) {
      finishDetailImmediately(item, shouldOpen);
      schedule();
      return;
    }

    state.targetOpen = shouldOpen;
    schedule();

    if (reducedMotion.matches || typeof review.animate !== 'function') {
      finishDetailImmediately(item, shouldOpen);
      if (!shouldOpen && !hasOpenReview()) resetViewport();
      schedule();
      return;
    }

    const currentHeight = review.getBoundingClientRect().height;
    const parsedOpacity = Number.parseFloat(getComputedStyle(content).opacity);
    const currentOpacity = item.open && Number.isFinite(parsedOpacity) ? parsedOpacity : 0;

    stopViewportMotion();
    state.animation?.cancel();
    state.contentAnimation?.cancel();
    state.excerptAnimation?.cancel();
    if (state.settleFrame !== null) window.cancelAnimationFrame(state.settleFrame);
    state.animation = null;
    state.contentAnimation = null;
    state.excerptAnimation = null;
    state.settleFrame = null;
    clearDetailMotion(item);

    const targetHeight = measureReviewHeight(item, shouldOpen);
    if (!shouldOpen) item.open = true;

    review.style.height = `${currentHeight}px`;
    review.style.overflow = 'clip';
    review.classList.toggle('is-review-opening', shouldOpen);
    review.classList.toggle('is-review-closing', !shouldOpen);

    state.animation = review.animate(
      { height: [`${currentHeight}px`, `${targetHeight}px`] },
      { duration: motionDuration, easing: motionEasing }
    );
    state.contentAnimation = content.animate(
      { opacity: [currentOpacity, shouldOpen ? 1 : 0] },
      { duration: Math.round(motionDuration * .72), easing: motionEasing, fill: 'forwards' }
    );
    if (!shouldOpen) animateViewportHome();

    const activeAnimation = state.animation;
    activeAnimation.addEventListener('finish', () => {
      if (state.animation !== activeAnimation) return;
      state.animation = null;
      state.contentAnimation?.cancel();
      state.contentAnimation = null;

      if (shouldOpen) {
        clearDetailMotion(item);
        schedule();
        return;
      }

      review.style.height = `${targetHeight}px`;
      review.style.overflow = 'clip';
      excerpt.style.opacity = '0';
      item.open = false;
      review.classList.remove('is-review-opening', 'is-review-closing');

      state.settleFrame = window.requestAnimationFrame(() => {
        state.settleFrame = null;
        review.style.removeProperty('height');
        review.style.removeProperty('overflow');
        content.style.removeProperty('opacity');
        state.excerptAnimation = excerpt.animate(
          { opacity: [0, 1] },
          { duration: Math.round(motionDuration * .52), easing: motionEasing, fill: 'forwards' }
        );
        const activeExcerptAnimation = state.excerptAnimation;
        activeExcerptAnimation.addEventListener('finish', () => {
          if (state.excerptAnimation !== activeExcerptAnimation) return;
          state.excerptAnimation = null;
          excerpt.style.removeProperty('opacity');
          schedule();
        }, { once: true });
      });
    }, { once: true });
  };

  const render = (nextIndex, closeExpanded = false) => {
    const previousIndex = index;
    index = (nextIndex + pairs.length) % pairs.length;

    if (closeExpanded) {
      details.forEach((item) => {
        finishDetailImmediately(item, false);
      });
    }

    pairs.forEach((pair, pairIndex) => {
      const active = pairIndex === index;
      pair.classList.toggle('is-active', active);
      pair.toggleAttribute('inert', !active);
      if (active) pair.removeAttribute('aria-hidden');
      else pair.setAttribute('aria-hidden', 'true');

    });

    status.textContent = `${index + 1} / ${pairs.length}`;
    status.setAttribute('aria-label', `Bewertungsgruppe ${index + 1} von ${pairs.length}`);
    if (previousIndex !== index || closeExpanded) resetViewport();
  };

  const schedule = () => {
    stopTimer();
    if (!canAutoplay()) return;
    timer = window.setTimeout(() => {
      render(index + 1);
      schedule();
    }, interval);
  };

  const showManually = (nextIndex) => {
    render(nextIndex, true);
    schedule();
  };

  carousel.classList.add('has-review-rotator');
  carousel.classList.add('has-review-motion');
  carousel.classList.toggle('is-reduced-motion', reducedMotion.matches);
  details.forEach(getDetailState);
  controls.hidden = false;
  render(index);
  updateAutoplayControl();

  previous.addEventListener('click', () => showManually(index - 1));
  next.addEventListener('click', () => showManually(index + 1));

  autoplay.addEventListener('click', () => {
    manuallyPaused = !manuallyPaused;
    updateAutoplayControl();
    schedule();
  });

  carousel.addEventListener('mouseenter', () => {
    pointerInside = true;
    schedule();
  });
  carousel.addEventListener('mouseleave', () => {
    pointerInside = false;
    schedule();
  });
  carousel.addEventListener('focusin', () => {
    focusInside = true;
    schedule();
  });
  carousel.addEventListener('focusout', () => {
    window.requestAnimationFrame(() => {
      focusInside = carousel.contains(document.activeElement);
      schedule();
    });
  });

  details.forEach((item) => {
    const summary = item.querySelector('summary');
    if (!summary) return;

    summary.addEventListener('click', (event) => {
      event.preventDefault();
      const state = getDetailState(item);
      const shouldOpen = !state.targetOpen;

      if (shouldOpen) {
        details.forEach((other) => {
          if (other === item) return;
          if (getDetailState(other).targetOpen) animateDetail(other, false);
        });
      }

      animateDetail(item, shouldOpen);
    });
  });
  document.addEventListener('visibilitychange', schedule);

  const onReducedMotionChange = () => {
    carousel.classList.toggle('is-reduced-motion', reducedMotion.matches);
    if (reducedMotion.matches) {
      stopViewportMotion();
      details.forEach((item) => finishDetailImmediately(item, getDetailState(item).targetOpen));
      if (!hasOpenReview()) resetViewport();
    }
    schedule();
  };
  if (typeof reducedMotion.addEventListener === 'function') {
    reducedMotion.addEventListener('change', onReducedMotionChange);
  } else if (typeof reducedMotion.addListener === 'function') {
    reducedMotion.addListener(onReducedMotionChange);
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      isVisible = entries.some((entry) => entry.isIntersecting);
      schedule();
    }, { threshold: 0.22 });
    observer.observe(carousel);
  }

  schedule();
})();
