// assets/js/projekte-card.js
// Gemeinsamer Karten-Renderer für die Startseite (#projekte) UND die Galerie (/projekte/).
// Eine einzige Quelle für Kartenoptik/Badge-Regel/Reveal – nicht duplizieren.

import { assetUrl } from './config.js';

// Baut eine Projektkarte (optisch identisch zum statischen Startseiten-Markup).
export function buildCard(p) {
  const gewerbe = Array.isArray(p.kundentyp) && p.kundentyp.includes('gewerbe');
  const cover = (Array.isArray(p.bilder) && p.bilder[0]) || {};

  const article = el('article', 'project-card reveal');

  const media = el('div', 'project-media');
  const img = document.createElement('img');
  img.src = assetUrl(cover.bild || '');
  img.alt = cover.alt || '';
  img.loading = 'lazy';
  img.decoding = 'async';
  img.width = 800;   // 4:3-Verhältnis passend zu .project-media aspect-ratio → kein Layout-Shift
  img.height = 600;
  media.appendChild(img);

  const tag = el('span', gewerbe ? 'project-tag warn' : 'project-tag');
  tag.textContent = gewerbe ? 'Gewerbekunde' : 'Privatkunde';
  media.appendChild(tag);

  const body = el('div', 'project-body');
  const loc = el('span', 'project-location');
  loc.textContent = p.ort || '';
  const h3 = document.createElement('h3');
  h3.textContent = p.titel || '';
  const desc = document.createElement('p');
  desc.textContent = p.beschreibung || '';
  body.append(loc, h3, desc);

  article.append(media, body);
  return article;
}

// Reveal-on-Scroll wie in main.js – nötig, weil main.js nur die beim Laden
// vorhandenen .reveal-Elemente beobachtet und .reveal mit opacity:0 startet.
export function revealCards(cards) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) {
    cards.forEach((c) => c.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const idx = Array.from(entry.target.parentNode?.children || []).indexOf(entry.target);
        entry.target.style.transitionDelay = (Math.max(0, idx) * 60) + 'ms';
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
  cards.forEach((c) => io.observe(c));
}

export function el(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}
