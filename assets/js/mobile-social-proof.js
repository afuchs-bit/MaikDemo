// AP-175: Eine gerundete Kontur fuer die gesamte KPI-Gruppe.
// Die Diagonale erinnert an den Hero; die Hoehe folgt dem Textinhalt.
(() => {
  const panels = document.querySelectorAll('.mobile-social-proof__panel');
  if (!panels.length || !('ResizeObserver' in window)) return;
  const ns = 'http://www.w3.org/2000/svg';

  const shape = (width, height, inset = 0) => {
    const left = inset;
    const top = inset;
    const right = width - inset;
    const bottom = height - inset;
    const radius = 22 - inset;
    const start = right - 120;
    return `M ${left + radius} ${top}
      H ${start - 8} Q ${start} ${top} ${start + 8} ${top + 2.27}
      L ${right - 12} ${top + 30.6} Q ${right} ${top + 34} ${right} ${top + 46}
      V ${bottom - radius} Q ${right} ${bottom} ${right - radius} ${bottom}
      H ${left + radius} Q ${left} ${bottom} ${left} ${bottom - radius}
      V ${top + radius} Q ${left} ${top} ${left + radius} ${top} Z`;
  };

  panels.forEach((panel, index) => {
    const clipId = `mobile-kpi-clip-${index + 1}`;
    const frame = document.createElementNS(ns, 'svg');
    frame.classList.add('mobile-social-proof__frame');
    frame.setAttribute('aria-hidden', 'true');
    frame.setAttribute('focusable', 'false');
    const defs = document.createElementNS(ns, 'defs');
    const clip = document.createElementNS(ns, 'clipPath');
    clip.id = clipId;
    clip.setAttribute('clipPathUnits', 'userSpaceOnUse');
    const clipPath = document.createElementNS(ns, 'path');
    const borderPath = document.createElementNS(ns, 'path');
    const accentPath = document.createElementNS(ns, 'path');
    accentPath.classList.add('mobile-social-proof__accent');
    clip.append(clipPath);
    defs.append(clip);
    frame.append(defs, borderPath, accentPath);
    panel.prepend(frame);

    let previousSize = '';
    const update = () => {
      const { width, height } = panel.getBoundingClientRect();
      if (!width || !height) return;
      const size = `${width} ${height}`;
      if (size === previousSize) return;
      previousSize = size;
      frame.setAttribute('viewBox', `0 0 ${size}`);
      clipPath.setAttribute('d', shape(width, height));
      borderPath.setAttribute('d', shape(width, height, .7));
      accentPath.setAttribute('d', `M ${width - 110} 3.97 L ${width - 17} 30.32`);
      panel.style.clipPath = `url(#${clipId})`;
      panel.classList.add('mobile-social-proof__panel--shaped');
    };
    new ResizeObserver(update).observe(panel);
    update();
  });
})();
