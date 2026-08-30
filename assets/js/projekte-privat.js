// assets/js/projekte-privat.js
// Rendert die Sektion #projekte-privat auf der Startseite aus data/projekte-index.json.
// Zeigt die 3 neuesten Projekte mit kundentyp "privat".
// Progressive Enhancement: Das statische Fallback-Markup bleibt sichtbar, falls der
// fetch fehlschlägt. Kartenoptik/Reveal kommen aus projekte-card.js.

import { dataUrl, SITE_BASE } from './config.js';
// Versionierter Import: projekte-card.js traegt sonst kein ?v= und wuerde aus dem
// Browser-Cache in einer aelteren Fassung geladen (Badge-Option fehlt dann).
import { buildCard, revealCards } from './projekte-card.js?v=20260807b';

const grid = document.querySelector('[data-projekte-privat]');
if (grid) init(grid);

async function init(grid) {
  let projekte, labels;
  try {
    const [idxRes, taxRes] = await Promise.all([
      fetch(dataUrl('data/projekte-index.json'), { cache: 'no-cache' }),
      fetch(dataUrl('content/taxonomie.json'), { cache: 'no-cache' }),
    ]);
    if (!idxRes.ok) throw new Error(`Index HTTP ${idxRes.status}`);
    if (!taxRes.ok) throw new Error(`Taxonomie HTTP ${taxRes.status}`);
    const idxData = await idxRes.json();
    const taxData = await taxRes.json();
    projekte = Array.isArray(idxData) ? idxData : (idxData && Array.isArray(idxData.projekte) ? idxData.projekte : null);
    labels = new Map((taxData.leistungen || []).map((l) => [l.slug, l.label]));
  } catch (err) {
    console.warn('[projekte-privat] Daten nicht ladbar – statisches Fallback bleibt bestehen.', err);
    return;
  }
  if (!projekte) return;

  const privat = projekte
    .filter((p) => p && Array.isArray(p.kundentyp) && p.kundentyp.includes('privat'))
    .sort((a, b) => String(b.datum).localeCompare(String(a.datum)))
    .slice(0, 3);

  if (!privat.length) return; // nichts zu rendern → Fallback behalten

  const labelFor = (p) => labels.get((p.leistungen || [])[0]) || '';

  const cards = privat.map((p) => {
    const summary = firstSentence(p.beschreibung);
    const card = buildCard({ ...p, beschreibung: summary }, { badge: 'leistung', labelFor });
    enhancePrivateCard(card, p);
    const link = document.createElement('a');
    link.className = 'card-open';
    link.href = new URL(`projekte/?projekt=${encodeURIComponent(p.slug || '')}`, SITE_BASE).href;
    link.setAttribute('aria-label', `Projekt „${p.titel || ''}“ in der Galerie ansehen`);
    card.appendChild(link);
    return card;
  });
  grid.replaceChildren(...cards);
  revealCards(cards);
}

function firstSentence(value) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  if ('Segmenter' in Intl) {
    const segment = new Intl.Segmenter('de', { granularity: 'sentence' }).segment(text)[Symbol.iterator]().next().value;
    if (segment?.segment) return segment.segment.trim();
  }
  return text.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() || text;
}

function projectMonth(value) {
  const match = /^(\d{4})-(\d{2})/.exec(String(value || ''));
  if (!match) return null;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));
  return {
    datetime: `${match[1]}-${match[2]}`,
    label: new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date),
  };
}

function enhancePrivateCard(card, project) {
  const body = card.querySelector('.project-body');
  const location = body?.querySelector('.project-location');
  if (body && location) {
    const meta = document.createElement('div');
    meta.className = 'private-project-meta';
    location.before(meta);
    meta.appendChild(location);
    const month = projectMonth(project.datum);
    if (month) {
      const time = document.createElement('time');
      time.className = 'private-project-date';
      time.dateTime = month.datetime;
      time.textContent = month.label;
      meta.appendChild(time);
    }
  }

  const more = body?.querySelector('.card-more');
  if (more) {
    const label = document.createElement('span');
    label.textContent = 'Projekt ansehen';
    const arrow = document.createElement('b');
    arrow.textContent = '→';
    arrow.setAttribute('aria-hidden', 'true');
    more.replaceChildren(label, arrow);
  }
}
