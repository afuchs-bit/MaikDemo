// assets/js/galerie.js
// Öffentliche Projektgalerie (/projekte/): Tabs (Alle/Highlights), Filter-Chips
// (Kundentyp, Leistung) mit Trefferzahl + Deaktivierung, URL-Sync, Lightbox.
// Kartenoptik/Reveal kommen aus dem gemeinsamen Modul projekte-card.js.

import { assetUrl, dataUrl } from './config.js';
// Versionierter Import: projekte-card.js traegt sonst kein ?v= und wuerde aus dem
// Browser-Cache in einer aelteren Fassung geladen.
import { buildCard, revealCards } from './projekte-card.js?v=20260807b';

// AP-100: Der CTA fuehrt direkt in das passende Anfrageformular. Leistungs-Slug →
// anliegen-Radiowert des Gewerbeformulars (nur eindeutige Zuordnungen; baumarbeiten
// laeuft dort unter der Baumkontrolle-Option).
const GEWERBE_ANLIEGEN = {
  aussenanlagenpflege: 'objektpflege',
  baumkontrolle: 'baumkontrolle',
  baumarbeiten: 'baumkontrolle',
  dachbegruenung: 'begruenung',
  sturmnotdienst: 'sturmnotdienst',
};
// Leistungen, die es nur im Privatbereich gibt. baumkontrolle, baumarbeiten,
// sturmnotdienst und dachbegruenung existieren in beiden Welten — bei Kundentyp
// "Alle" entscheidet dort die Kontakt-Weiche der Startseite statt einer Vermutung.
const PRIVAT_ONLY = new Set([
  'gartengestaltung', 'vorgarten', 'teichbau', 'bepflanzung', 'gartenpflege',
  'holzverkauf', 'terrasse-pflasterarbeiten', 'palmen-winterfest', 'pool-whirlpool-umfeld',
]);

const TYP_OPTIONS = [
  { value: 'alle', label: 'Alle' },
  { value: 'privat', label: 'Privatkunde' },
  { value: 'gewerbe', label: 'Gewerbekunde' },
];

const state = { view: 'galerie', tab: 'alle', typ: 'alle', leistungen: new Set() };

let allProjekte = [];
let taxonomie = []; // [{ slug, label }]
let validSlugs = new Set();
let galleryTeaserImages = [];
let galleryTeaserTitle = 'Garteneindrücke';

const grid = document.getElementById('galleryGrid');
const photoGrid = document.getElementById('galleryPhotoGrid');
const projectControls = document.querySelector('[data-project-controls]');
const emptyEl = document.getElementById('galleryEmpty');
const errorEl = document.getElementById('galleryError');
const ctaEl = document.getElementById('galleryCta');
const typGroup = document.querySelector('.filter-group[data-filter="typ"]');
const leistungGroup = document.querySelector('.filter-group[data-filter="leistung"]');
const tabInputs = Array.from(document.querySelectorAll('.gallery-tabs input[name="tab"]'));
const viewInputs = Array.from(document.querySelectorAll('input[name="gallery-mode"]'));

// Chip-Referenzen: value → button
const typChips = new Map();
const leistungChips = new Map();

init();

async function init() {
  try {
    const [idxRes, taxRes, teaserRes] = await Promise.all([
      fetch(dataUrl('data/projekte-index.json'), { cache: 'no-cache' }),
      fetch(dataUrl('content/taxonomie.json'), { cache: 'no-cache' }),
      fetch(dataUrl('data/galerie-teaser.json'), { cache: 'no-cache' }).catch(() => null),
    ]);
    if (!idxRes.ok) throw new Error(`Index HTTP ${idxRes.status}`);
    if (!taxRes.ok) throw new Error(`Taxonomie HTTP ${taxRes.status}`);
    const idxData = await idxRes.json();
    const taxData = await taxRes.json();
    allProjekte = Array.isArray(idxData) ? idxData : (idxData && Array.isArray(idxData.projekte) ? idxData.projekte : []);
    taxonomie = (taxData && Array.isArray(taxData.leistungen)) ? taxData.leistungen : [];
    validSlugs = new Set(taxonomie.map((l) => l.slug));
    if (teaserRes?.ok) {
      const teaserData = await teaserRes.json();
      galleryTeaserImages = Array.isArray(teaserData?.bilder) ? teaserData.bilder : [];
      galleryTeaserTitle = typeof teaserData?.titel === 'string' ? teaserData.titel : galleryTeaserTitle;
    }
  } catch (err) {
    console.error('[galerie] Daten nicht ladbar.', err);
    showError();
    return; // Fehlerfall: statische Liste (#galleryStatic) bleibt als Fallback sichtbar.
  }

  // Daten geladen → statische Crawler-Liste ausblenden, interaktives Grid übernimmt (AP-15).
  document.getElementById('galleryStatic')?.setAttribute('hidden', '');

  readStateFromUrl();
  const pendingSlug = readPendingProjekt();
  const pendingGalleryImage = readPendingGalleryImage();
  if (pendingGalleryImage) state.view = 'galerie';
  buildChips();
  bindControls();
  applyStateToControls();
  gateTabs(); // AP-31
  render();
  // Deep-Link von der Startseite: Lightbox des Projekts direkt öffnen.
  if (pendingSlug) openProjektDeepLink(pendingSlug);
  else if (pendingGalleryImage) openGalleryImageDeepLink(pendingGalleryImage);
}

// Liest ?projekt=<slug>. Schaltet immer auf die „Alle"-Ansicht, damit das Zielprojekt
// garantiert im Grid liegt (Typ- und Leistungsfilter bleiben unberührt).
function readPendingProjekt() {
  const params = new URLSearchParams(location.search);
  const slug = params.get('projekt');
  if (!slug) return null;
  state.view = 'projekte';
  state.tab = 'alle';
  return slug;
}

function openProjektDeepLink(slug) {
  const project = allProjekte.find((p) => p && p.slug === slug);
  if (!project) return; // unbekannter Slug (z. B. gelöscht) → ignorieren, Galerie normal
  const opener = grid.querySelector(`.card-open[data-slug="${CSS.escape(slug)}"]`);
  openLightbox(project, opener);
  // render() hat die URL bereits ohne ?projekt geschrieben → Reload öffnet nicht erneut.
}

function readPendingGalleryImage() {
  return new URLSearchParams(location.search).get('galerie-bild');
}

function galleryImageKeys(image) {
  const filename = String(image?.bild || '').split('/').pop() || '';
  const basename = filename.replace(/\.[^.]+$/, '');
  return new Set([String(image?.id || ''), basename].filter(Boolean));
}

function openGalleryImageDeepLink(key) {
  if (!galleryTeaserImages.length) return;
  const index = galleryTeaserImages.findIndex((image) => galleryImageKeys(image).has(key));
  if (index < 0) return;
  const fallbackFocus = photoGrid?.querySelector(`.gallery-photo:nth-child(${index + 1})`) || viewInputs[0];
  openLightbox({ titel: galleryTeaserTitle, bilder: galleryTeaserImages }, fallbackFocus, index);
}

function showError() {
  if (grid) { grid.hidden = true; grid.setAttribute('aria-busy', 'false'); }
  if (photoGrid) { photoGrid.hidden = true; photoGrid.setAttribute('aria-busy', 'false'); }
  if (emptyEl) emptyEl.hidden = true;
  if (errorEl) errorEl.hidden = false;
}

// ---------- Filter-Logik ----------
function baseList() {
  const list = state.tab === 'highlights' ? allProjekte.filter((p) => p && p.featured) : allProjekte.slice();
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
  viewInputs.forEach((input) => {
    input.addEventListener('change', () => {
      if (input.checked) { state.view = input.value === 'galerie' ? 'galerie' : 'projekte'; render(); }
    });
  });
  tabInputs.forEach((input) => {
    input.addEventListener('change', () => {
      if (input.checked) { state.tab = input.value; render(); }
    });
  });
  document.getElementById('galleryReset')?.addEventListener('click', resetFilters);
  initLightbox();
}

function resetFilters() {
  state.tab = 'alle';
  state.typ = 'alle';
  state.leistungen.clear();
  applyStateToControls();
  render();
}

// AP-31: Tab-Leiste (Aktuell/Alle) nur einblenden, wenn es nicht-featured Projekte gibt.
// Sonst wären beide Tabs identisch. Erscheint automatisch wieder, sobald kuratiert wird.
function gateTabs() {
  const tabsWrap = document.querySelector('.gallery-tabs');
  if (!tabsWrap) return;
  tabsWrap.hidden = !allProjekte.some((p) => p && !p.featured);
}

function applyStateToControls() {
  viewInputs.forEach((i) => { i.checked = i.value === state.view; });
  tabInputs.forEach((i) => { i.checked = i.value === state.tab; });
}

// ---------- Rendern ----------
function render() {
  applyStateToControls();
  const imageView = state.view === 'galerie';
  if (projectControls) projectControls.hidden = imageView;
  if (photoGrid) photoGrid.hidden = !imageView;
  if (imageView) {
    grid.hidden = true;
    emptyEl.hidden = true;
    renderPhotoGrid();
    updateCta();
    writeStateToUrl();
    return;
  }

  if (photoGrid) photoGrid.hidden = true;
  const results = currentResults();
  updateChipStates();
  renderGrid(results);
  updateCta();
  writeStateToUrl();
}

function renderPhotoGrid() {
  if (!photoGrid) return;
  photoGrid.setAttribute('aria-busy', 'false');
  if (photoGrid.dataset.rendered === 'true') return;

  const cards = galleryTeaserImages.map((image, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'gallery-photo';
    button.style.setProperty('--gallery-focus-desktop', image.fokusDesktop || '50% 50%');
    button.style.setProperty('--gallery-focus-mobile', image.fokusMobil || image.fokusDesktop || '50% 50%');
    button.setAttribute('aria-label', `${image.alt} – Bild vergrößern`);

    const picture = document.createElement('picture');
    const variants = image.variants;
    const sizes = '(max-width:740px) 46vw, (max-width:1050px) 31vw, 23vw';
    if (variants?.base && Array.isArray(variants.widths) && variants.widths.length) {
      const avif = document.createElement('source');
      avif.type = 'image/avif';
      avif.sizes = sizes;
      avif.srcset = variants.widths.map((width) => `${assetUrl(`${variants.base}-${width}.avif`)} ${width}w`).join(', ');
      picture.append(avif);

      const webp = document.createElement('source');
      webp.type = 'image/webp';
      webp.sizes = sizes;
      webp.srcset = variants.widths.map((width) => `${assetUrl(`${variants.base}-${width}.webp`)} ${width}w`).join(', ');
      picture.append(webp);
    }

    const img = document.createElement('img');
    img.src = variants?.base ? assetUrl(`${variants.base}.webp`) : assetUrl(image.bild);
    img.alt = image.alt;
    img.width = variants?.width || 960;
    img.height = variants?.height || 720;
    img.loading = 'lazy';
    img.decoding = 'async';
    picture.append(img);
    button.append(picture);
    button.addEventListener('click', () => openLightbox({ titel: galleryTeaserTitle, bilder: galleryTeaserImages }, button, index));
    return button;
  });

  photoGrid.replaceChildren(...cards);
  photoGrid.dataset.rendered = 'true';
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
    setChip(btn, n, active, true); // AP-31: leere Leistungs-Chips ausblenden
  });
}

function setChip(btn, n, active, hideWhenEmpty = false) {
  btn.querySelector('.chip-count').textContent = `(${n})`;
  btn.setAttribute('aria-pressed', String(active));
  const empty = n === 0 && !active;
  // Leistungs-Chips ohne Treffer ausblenden (aufgeräumte Optik, skaliert mit dem Bestand).
  // Kundentyp-Segmente bleiben sichtbar, ohne Treffer aber nicht klickbar.
  if (hideWhenEmpty) {
    btn.hidden = empty;
    btn.disabled = false;
  } else {
    btn.disabled = empty;
    btn.hidden = false;
  }
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
    btn.dataset.slug = p.slug || '';
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
  const sel = [...state.leistungen];
  const slug = sel.length === 1 ? sel[0] : '';
  if (state.typ === 'gewerbe') {
    const anliegen = GEWERBE_ANLIEGEN[slug];
    ctaEl.href = anliegen
      ? `../gewerbekunden/?anliegen=${encodeURIComponent(anliegen)}#anfrage`
      : '../gewerbekunden/#anfrage';
  } else if (state.typ === 'privat') {
    ctaEl.href = slug
      ? `../privatkunden/?leistung=${encodeURIComponent(slug)}#anfrage`
      : '../privatkunden/#anfrage';
  } else if (slug === 'aussenanlagenpflege') {
    ctaEl.href = `../gewerbekunden/?anliegen=${GEWERBE_ANLIEGEN[slug]}#anfrage`;
  } else if (PRIVAT_ONLY.has(slug)) {
    ctaEl.href = `../privatkunden/?leistung=${encodeURIComponent(slug)}#anfrage`;
  } else {
    ctaEl.href = '../#kontakt';
  }
}

// ---------- URL-Sync ----------
function readStateFromUrl() {
  const params = new URLSearchParams(location.search);
  const requestedView = params.get('ansicht');
  const hasProjectFilter = params.has('tab') || params.has('typ') || params.has('leistung');
  state.view = requestedView === 'projekte' || (requestedView !== 'galerie' && hasProjectFilter)
    ? 'projekte'
    : 'galerie';
  state.tab = params.get('tab') === 'highlights' ? 'highlights' : 'alle';
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
  if (state.view === 'projekte') {
    params.set('ansicht', 'projekte');
    if (state.tab === 'highlights') params.set('tab', 'highlights');
    if (state.typ !== 'alle') params.set('typ', state.typ);
    if (state.leistungen.size) params.set('leistung', [...state.leistungen].join(','));
  }
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

function openLightbox(project, opener, startIndex = 0) {
  lb.images = Array.isArray(project.bilder) ? project.bilder : [];
  if (!lb.images.length) return;
  lb.project = project;
  lb.index = Math.max(0, Math.min(Number(startIndex) || 0, lb.images.length - 1));
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
  setLightboxSrc(bild);
  lbImg.alt = bild.alt || '';
  lbTitle.textContent = lb.project?.titel || '';
  lbCaption.textContent = bild.alt || '';
  lbCounter.textContent = `${lb.index + 1} / ${lb.images.length}`;
  const single = lb.images.length <= 1;
  lbPrev.hidden = single;
  lbNext.hidden = single;
}

// AP-77: Die Lightbox zeigte bisher immer bild.bild – bei einigen Projekten ist das
// das unskalierte Original (bis 1,2 MB). Liegen Varianten vor, wird stattdessen das
// WebP-Set ausgeliefert (breitenabhaengig und nach Groesse budgetiert). Bewusst nur WebP und
// kein AVIF: srcset kennt keine Format-Aushandlung, und das feste <img id="lightboxImg">
// im Markup laesst sich nicht in ein <picture> mit <source> umbauen.
// srcset/sizes muessen zurueckgesetzt werden – das Element wird wiederverwendet.
function setLightboxSrc(bild) {
  const v = bild.variants;
  if (v && Array.isArray(v.widths) && v.widths.length) {
    const widths = Array.isArray(v.webpWidths) ? v.webpWidths : v.widths;
    lbImg.srcset = widths.map((w) => `${assetUrl(`${v.base}-${w}.webp`)} ${w}w`).join(', ');
    lbImg.sizes = '100vw';
    lbImg.src = assetUrl(`${v.base}.webp`);
    return;
  }
  lbImg.removeAttribute('srcset');
  lbImg.removeAttribute('sizes');
  lbImg.src = assetUrl(bild.bild || '');
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
