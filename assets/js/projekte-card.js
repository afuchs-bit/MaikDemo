// assets/js/projekte-card.js
// Gemeinsamer Karten-Renderer für die Startseite (#projekte) UND die Galerie (/projekte/).
// Eine einzige Quelle für Kartenoptik/Badge-Regel/Reveal – nicht duplizieren.

import { assetUrl } from './config.js';

// Baut eine Projektkarte (optisch identisch zum statischen Startseiten-Markup).
// opts.badge: 'kundentyp' (Default) | 'leistung' – auf reinen Zielgruppenseiten ist der
// Kundentyp redundant, dort trägt die Leistung die Information (opts.labelFor liefert das Label).
export function buildCard(p, opts = {}) {
  const gewerbe = Array.isArray(p.kundentyp) && p.kundentyp.includes('gewerbe');
  const cover = (Array.isArray(p.bilder) && p.bilder[0]) || {};

  const article = el('article', 'project-card reveal');

  const media = el('div', 'project-media');
  media.appendChild(buildMedia(cover));

  const tag = el('span', gewerbe ? 'project-tag warn' : 'project-tag');
  if (opts.badge === 'leistung') {
    tag.className = 'project-tag';
    tag.textContent = opts.labelFor ? (opts.labelFor(p) || '') : '';
  } else {
    tag.textContent = gewerbe ? 'Gewerbekunde' : 'Privatkunde';
  }
  if (tag.textContent) media.appendChild(tag);

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

// Baut das Karten-Medium: <picture> mit AVIF+WebP/srcset (AP-25), falls das Bild
// Varianten im Index hat; sonst einfaches <img>. width/height = 4:3 → kein Layout-Shift.
//
// AP-77: Ohne Varianten laedt die Karte cover.bild – bei einigen Projekten ist das
// das unskalierte Original (bis 1,2 MB). Mit Varianten zeigt auch das <img src> auf
// `<base>.webp` (< 200 KB) statt auf cover.bild, damit Browser ohne <picture>- oder
// WebP-/AVIF-Unterstuetzung nicht doch das Original ziehen.
function buildMedia(cover) {
  const v = cover.variants;
  const hasVariants = v && Array.isArray(v.widths) && v.widths.length;

  const mkImg = () => {
    const img = document.createElement('img');
    img.src = assetUrl(hasVariants ? `${v.base}.webp` : (cover.bild || ''));
    img.alt = cover.alt || '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.width = 800;
    img.height = 600;
    return img;
  };

  if (!hasVariants) return mkImg();

  // AVIF komprimiert besser und deckt gelegentlich eine Breite mehr ab als WebP.
  const widthsFor = (ext) => (ext === 'webp' && Array.isArray(v.webpWidths) ? v.webpWidths : v.widths);
  const sizes = '(max-width: 700px) 90vw, 30vw';
  const picture = document.createElement('picture');
  for (const ext of ['avif', 'webp']) {
    const source = document.createElement('source');
    source.type = `image/${ext}`;
    source.sizes = sizes;
    source.srcset = widthsFor(ext).map((w) => `${assetUrl(`${v.base}-${w}.${ext}`)} ${w}w`).join(', ');
    picture.appendChild(source);
  }
  picture.appendChild(mkImg());
  return picture;
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
