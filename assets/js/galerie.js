// assets/js/galerie.js
// Öffentliche Projektgalerie (/projekte/): Tabs (Aktuell/Alle), Filter-Chips
// (Kundentyp, Leistung) mit Trefferzahl + Deaktivierung, URL-Sync, Lightbox.
// Kartenoptik/Reveal kommen aus dem gemeinsamen Modul projekte-card.js.

import { assetUrl, dataUrl } from './config.js';
import { buildCard, revealCards } from './projekte-card.js';

// Slug (Taxonomie) → exakter Option-Text des Kontakt-Dropdowns (#contactForm),
// für die Bereich-Vorbefüllung des CTA. Nur eindeutige Zuordnungen (baumarbeiten
// hat kein exaktes Pendant → kein Prefill).
const BEREICH_BY_LEISTUNG = {
  gartengestaltung: 'Garten / Vorgarten',
  vorgarten: 'Garten / Vorgarten',
  teichbau: 'Teich / Wasser im Garten',
  bepflanzung: 'Bepflanzung',
  dachbegruenung: 'Dachbegrünung',
  baumkontrolle: 'Baumkontrolle / Gutachten',
  sturmnotdienst: 'Sturmschaden / Sturmnotdienst',
  holzverkauf: 'Holzverkauf',
  aussenanlagenpflege: 'Gewerbliche Pflege',
};
const BEREICH_BY_TYP = { privat: 'Garten / Vorgarten', gewerbe: 'Gewerbliche Pflege' };

const TYP_OPTIONS = [
  { value: 'alle', label: 'Alle' },
  { value: 'privat', label: 'Privatkunde' },
  { value: 'gewerbe', label: 'Gewerbekunde' },
];

const state = { tab: 'aktuell', typ: 'alle', leistungen: new Set() };

let allProjekte = [];
let taxonomie = []; // [{ slug, label }]
let validSlugs = new Set();

const grid = document.getElementById('galleryGrid');
const emptyEl = document.getElementById('galleryEmpty');
const errorEl = document.getElementById('galleryError');
const ctaEl = document.getElementById('galleryCta');
const typGroup = document.querySelector('.filter-group[data-filter="typ"]');
const leistungGroup = document.querySelector('.filter-group[data-filter="leistung"]');
const tabInputs = Array.from(document.querySelectorAll('.gallery-tabs input[name="tab"]'));

// Chip-Referenzen: value → button
const typChips = new Map();
const leistungChips = new Map();

init();

async function init() {
  try {
    const [idxRes, taxRes] = await Promise.all([
      fetch(dataUrl('data/projekte-index.json'), { cache: 'no-cache' }),
      fetch(dataUrl('content/taxonomie.json'), { cache: 'no-cache' }),
    ]);
    if (!idxRes.ok) throw new Error(`Index HTTP ${idxRes.status}`);
    if (!taxRes.ok) throw new Error(`Taxonomie HTTP ${taxRes.status}`);
    const idxData = await idxRes.json();
    const taxData = await taxRes.json();
    allProjekte = Array.isArray(idxData) ? idxData : (idxData && Array.isArray(idxData.projekte) ? idxData.projekte : []);
    taxonomie = (taxData && Array.isArray(taxData.leistungen)) ? taxData.leistungen : [];
    validSlugs = new Set(taxonomie.map((l) => l.slug));
  } catch (err) {
    console.error('[galerie] Daten nicht ladbar.', err);
    showError();
    return;
  }

  readStateFromUrl();
  buildChips();
  bindControls();
  applyStateToControls();
  render();
}

function showError() {
  if (grid) { grid.hidden = true; grid.setAttribute('aria-busy', 'false'); }
  if (emptyEl) emptyEl.hidden = true;
  if (errorEl) errorEl.hidden = false;
}

// ---------- Filter-Logik ----------
function baseList() {
  const list = state.tab === 'aktuell' ? allProjekte.filter((p) => p && p.featured) : allProjekte.slice();
  return list.sort((a, b) => String(b.datum).localeCompare(String(a.datum)));
}
const matchTyp = (p, typ) => typ === 'alle' || (Array.isArray(p.kundentyp) && p.kundentyp.includes(typ));
const matchLeistung = (p, set) => set.size === 0 || (Array.isArray(p.leistungen) && p.leistungen.some((l) => set.has(l)));

function currentResults() {
  return baseList().filter((p) => matchTyp(p, state.typ) && matchLeistung(p, state.leistungen));
}

// ---------- Chips aufbauen ----------
function buildChips() {
  TYP_OPTIONS.forEach((opt) => {
    const btn = makeChip(opt.label);
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      state.typ = opt.value;
      render();
    });
    typGroup.appendChild(btn);
    typChips.set(opt.value, btn);
  });

  taxonomie.forEach((l) => {
    const btn = makeChip(l.label);
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      if (state.leistungen.has(l.slug)) state.leistungen.delete(l.slug);
      else state.leistungen.add(l.slug);
      render();
    });
    leistungGroup.appendChild(btn);
    leistungChips.set(l.slug, btn);
  });
}

function makeChip(label) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'filter-chip';
  btn.setAttribute('aria-pressed', 'false');
  const text = document.createElement('span');
  text.className = 'chip-label';
  text.textContent = label;
  const count = document.createElement('span');
  count.className = 'chip-count';
  btn.append(text, count);
  return btn;
}

// ---------- Controls binden ----------
function bindControls() {
  tabInputs.forEach((input) => {
    input.addEventListener('change', () => {
      if (input.checked) { state.tab = input.value; render(); }
    });
  });
  document.getElementById('galleryReset')?.addEventListener('click', resetFilters);
  initLightbox();
}

function resetFilters() {
  state.tab = 'aktuell';
  state.typ = 'alle';
  state.leistungen.clear();
  applyStateToControls();
  render();
}

function applyStateToControls() {
  tabInputs.forEach((i) => { i.checked = i.value === state.tab; });
}

// ---------- Rendern ----------
function render() {
  const results = currentResults();
  updateChipStates();
  renderGrid(results);
  updateCta();
  writeStateToUrl();
}

function updateChipStates() {
  const base = baseList();

  // Kundentyp-Zähler: Basis(tab) + aktiver Leistungsfilter, gezählt je Typ.
  const typBase = base.filter((p) => matchLeistung(p, state.leistungen));
  TYP_OPTIONS.forEach((opt) => {
    const n = opt.value === 'alle' ? typBase.length : typBase.filter((p) => matchTyp(p, opt.value)).length;
    const btn = typChips.get(opt.value);
    const active = state.typ === opt.value;
    setChip(btn, n, active);
  });

  // Leistungs-Zähler: Basis(tab) + aktiver Typfilter, gezählt je Slug.
  const leistBase = base.filter((p) => matchTyp(p, state.typ));
  taxonomie.forEach((l) => {
    const n = leistBase.filter((p) => Array.isArray(p.leistungen) && p.leistungen.includes(l.slug)).length;
    const btn = leistungChips.get(l.slug);
    const active = state.leistungen.has(l.slug);
    setChip(btn, n, active);
  });
}

function setChip(btn, n, active) {
  btn.querySelector('.chip-count').textContent = `(${n})`;
  btn.setAttribute('aria-pressed', String(active));
  // Deaktivieren, wenn keine Treffer – aber aktive Chips bleiben abwählbar.
  btn.disabled = n === 0 && !active;
}

function renderGrid(results) {
  grid.setAttribute('aria-busy', 'false');
  if (!results.length) {
    grid.replaceChildren();
    grid.hidden = true;
    emptyEl.hidden = false;
    return;
  }
  emptyEl.hidden = true;
  grid.hidden = false;

  const cards = results.map((p) => {
    const card = buildCard(p);
    // Interaktive Overlay-Schaltfläche (ein <h3> darf nicht in einem <button> stehen).
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'card-open';
    const anzahl = Array.isArray(p.bilder) ? p.bilder.length : 0;
    btn.setAttribute('aria-label', `Projekt „${p.titel}“ in ${p.ort} – ${anzahl} ${anzahl === 1 ? 'Bild' : 'Bilder'} ansehen`);
    btn.addEventListener('click', () => openLightbox(p, btn));
    card.appendChild(btn);
    return card;
  });
  grid.replaceChildren(...cards);
  revealCards(cards);
}

function updateCta() {
  let bereich = '';
  const sel = [...state.leistungen];
  if (sel.length === 1 && BEREICH_BY_LEISTUNG[sel[0]]) {
    bereich = BEREICH_BY_LEISTUNG[sel[0]];
  } else if (state.typ !== 'alle' && BEREICH_BY_TYP[state.typ]) {
    bereich = BEREICH_BY_TYP[state.typ];
  }
  ctaEl.href = bereich ? `../?bereich=${encodeURIComponent(bereich)}#kontakt` : '../#kontakt';
}

// ---------- URL-Sync ----------
function readStateFromUrl() {
  const params = new URLSearchParams(location.search);
  state.tab = params.get('tab') === 'alle' ? 'alle' : 'aktuell';
  const typ = params.get('typ');
  state.typ = (typ === 'privat' || typ === 'gewerbe') ? typ : 'alle';
  state.leistungen = new Set(
    (params.get('leistung') || '')
      .split(',')
      .map((s) => s.trim())
      .filter((s) => validSlugs.has(s)),
  );
}

function writeStateToUrl() {
  const params = new URLSearchParams();
  if (state.tab === 'alle') params.set('tab', 'alle');
  if (state.typ !== 'alle') params.set('typ', state.typ);
  if (state.leistungen.size) params.set('leistung', [...state.leistungen].join(','));
  const qs = params.toString();
  const url = location.pathname + (qs ? `?${qs}` : '') + location.hash;
  history.replaceState(null, '', url);
}

// ---------- Lightbox ----------
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lightboxImg');
const lbTitle = document.getElementById('lightboxTitle');
const lbCaption = document.getElementById('lightboxCaption');
const lbCounter = document.getElementById('lightboxCounter');
const lbPrev = lightbox?.querySelector('[data-lightbox-prev]');
const lbNext = lightbox?.querySelector('[data-lightbox-next]');
const lbPanel = lightbox?.querySelector('.lightbox-panel');
const lb = { images: [], index: 0, project: null, opener: null };

function initLightbox() {
  if (!lightbox) return;
  lightbox.querySelectorAll('[data-lightbox-close]').forEach((el) => el.addEventListener('click', closeLightbox));
  lbPrev?.addEventListener('click', () => step(-1));
  lbNext?.addEventListener('click', () => step(1));
}

function openLightbox(project, opener) {
  lb.images = Array.isArray(project.bilder) ? project.bilder : [];
  if (!lb.images.length) return;
  lb.project = project;
  lb.index = 0;
  lb.opener = opener || null;
  updateLightbox();
  lightbox.hidden = false;
  document.body.classList.add('has-lightbox');
  document.addEventListener('keydown', onLightboxKeydown, true);
  // Fokus auf die erste bedienbare Schaltfläche.
  (lightbox.querySelector('.lightbox-close')).focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  document.body.classList.remove('has-lightbox');
  document.removeEventListener('keydown', onLightboxKeydown, true);
  lb.opener?.focus();
}

function step(dir) {
  const n = lb.images.length;
  if (n <= 1) return;
  lb.index = (lb.index + dir + n) % n;
  updateLightbox();
}

function updateLightbox() {
  const bild = lb.images[lb.index] || {};
  lbImg.src = assetUrl(bild.bild || '');
  lbImg.alt = bild.alt || '';
  lbTitle.textContent = lb.project?.titel || '';
  lbCaption.textContent = bild.alt || '';
  lbCounter.textContent = `${lb.index + 1} / ${lb.images.length}`;
  const single = lb.images.length <= 1;
  lbPrev.hidden = single;
  lbNext.hidden = single;
}

function onLightboxKeydown(e) {
  if (lightbox.hidden) return;
  if (e.key === 'Escape') { e.preventDefault(); closeLightbox(); return; }
  if (e.key === 'ArrowRight') { e.preventDefault(); step(1); return; }
  if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); return; }
  if (e.key === 'Tab') trapFocus(e);
}

// Fokus-Trap innerhalb des Dialogs.
function trapFocus(e) {
  const focusables = lbPanel.querySelectorAll('button:not([hidden]):not([disabled])');
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}
