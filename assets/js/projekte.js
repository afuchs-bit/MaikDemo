// assets/js/projekte.js
// Rendert die #projekte-Sektion der Startseite aus data/projekte-index.json.
// Progressive Enhancement: Das hartkodierte Fallback-Markup bleibt sichtbar,
// falls der fetch fehlschlägt. main.js bleibt unangetastet.

import { assetUrl, dataUrl } from './config.js';

const grid = document.querySelector('#projekte .projects-grid');
if (grid) init(grid);

async function init(grid) {
  let data;
  try {
    const res = await fetch(dataUrl('data/projekte-index.json'), { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch (err) {
    // Fallback: statisches Markup der 3 Projekte bleibt im HTML sichtbar.
    console.warn('[projekte] Index nicht ladbar – statisches Fallback bleibt bestehen.', err);
    return;
  }

  // Index ist { _hinweis, projekte: [...] }; ältere/pure Array-Form wird toleriert.
  const projekte = Array.isArray(data) ? data : (data && Array.isArray(data.projekte) ? data.projekte : null);
  if (!projekte) return;

  // Die 3 neuesten mit featured:true (Index ist bereits datum-absteigend sortiert;
  // hier zur Sicherheit erneut sortiert).
  const featured = projekte
    .filter((p) => p && p.featured)
    .sort((a, b) => String(b.datum).localeCompare(String(a.datum)))
    .slice(0, 3);

  if (!featured.length) return; // nichts zu rendern → Fallback behalten

  const cards = featured.map(buildCard);
  grid.replaceChildren(...cards);
  revealCards(cards);
}

function buildCard(p) {
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
function revealCards(cards) {
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

function el(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}
