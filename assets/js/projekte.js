// assets/js/projekte.js
// Rendert die #projekte-Sektion der Startseite aus data/projekte-index.json.
// Progressive Enhancement: Das hartkodierte Fallback-Markup bleibt sichtbar,
// falls der fetch fehlschlägt. main.js bleibt unangetastet.
// Kartenoptik/Reveal kommen aus dem gemeinsamen Modul projekte-card.js.

import { dataUrl, SITE_BASE } from './config.js';
// Versionierter Import: projekte-card.js traegt sonst kein ?v= und wuerde aus dem
// Browser-Cache in einer aelteren Fassung geladen.
import { buildCard, revealCards } from './projekte-card.js?v=20260807b';

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

  const cards = featured.map((p) => {
    const card = buildCard(p);
    // Ganze Karte als echter Link auf die statische Projektseite (AP-15, crawlbar).
    const link = document.createElement('a');
    link.className = 'card-open';
    link.href = new URL(`projekte/${encodeURIComponent(p.slug || '')}/`, SITE_BASE).href;
    link.setAttribute('aria-label', `Projekt „${p.titel || ''}“ ansehen`);
    card.appendChild(link);
    return card;
  });
  grid.replaceChildren(...cards);
  revealCards(cards);
}
