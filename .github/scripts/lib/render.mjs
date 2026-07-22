// .github/scripts/lib/render.mjs
//
// Reine Render-Funktionen für AP-15: erzeugt aus einem validierten Projekt-Datensatz
// die statische Detailseite /projekte/<slug>/index.html und die crawlbare Galerie-Liste.
// KEIN Datei-I/O außer dem Laden der HTML-Templates – Validierung/Schreiben bleibt in
// build-index.mjs. Design lebt in ../templates/, nicht hier.

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TPL_DIR = path.join(__dirname, '..', 'templates');

export const SITE = 'https://rohdich.de';
export const BASE_PROJEKT = '../../'; // /projekte/<slug>/ liegt zwei Ebenen unter dem Root
export const BASE_GALLERY = '../';     // /projekte/ liegt eine Ebene unter dem Root

// ---------- Escaping ----------
export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
export function escAttr(s) {
  return esc(s).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ---------- URL-/Pfad-Auflösung ----------
const isRemote = (p) => /^https?:\/\//i.test(String(p));

// Für <img src>: Remote-URLs unverändert; lokale "/assets/…" auf die Seitentiefe rebasen.
export function relAsset(p, base) {
  const s = String(p || '');
  if (isRemote(s)) return s;
  return base + s.replace(/^\/+/, '');
}

// Für JSON-LD/og:image: Remote-URLs unverändert; lokale Pfade absolut auf die Zieldomain.
export function absUrl(p) {
  const s = String(p || '');
  if (isRemote(s)) return s;
  return SITE + '/' + s.replace(/^\/+/, '');
}

// ---------- Textwerkzeuge ----------
export function truncate(s, n = 155) {
  const str = String(s || '').trim().replace(/\s+/g, ' ');
  if (str.length <= n) return str;
  const cut = str.slice(0, n - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trimEnd() + '…';
}

// ---------- Badge-Regel (identisch zu projekte-card.js) ----------
export function badge(kundentyp) {
  const gewerbe = Array.isArray(kundentyp) && kundentyp.includes('gewerbe');
  return gewerbe
    ? { cls: 'warn', label: 'Gewerbekunde' }
    : { cls: '', label: 'Privatkunde' };
}

// ---------- Template-Laden (einmalig gecacht) ----------
let _partials = null;
async function partials() {
  if (_partials) return _partials;
  const [page, header, footer, logo] = await Promise.all([
    readFile(path.join(TPL_DIR, 'projekt.html'), 'utf8'),
    readFile(path.join(TPL_DIR, '_header.html'), 'utf8'),
    readFile(path.join(TPL_DIR, '_footer.html'), 'utf8'),
    readFile(path.join(TPL_DIR, '_logo.html'), 'utf8'),
  ]);
  _partials = { page, header, footer, logo };
  return _partials;
}

function fill(tpl, map) {
  return tpl.replace(/\{\{(\w+)\}\}/g, (m, key) =>
    Object.prototype.hasOwnProperty.call(map, key) ? map[key] : m,
  );
}

// ---------- Bild-Block der Detailseite ----------
function renderImages(bilder, base) {
  return bilder
    .map((b, i) => {
      const src = escAttr(relAsset(b.bild, base));
      const alt = escAttr(b.alt || '');
      // Erstes Bild = LCP: eager + hohe Priorität. Rest: lazy.
      const attrs = i === 0
        ? 'fetchpriority="high" decoding="async"'
        : 'loading="lazy" decoding="async"';
      return `<figure class="projekt-figure">
        <img src="${src}" alt="${alt}" width="1600" height="1200" ${attrs}>
      </figure>`;
    })
    .join('\n      ');
}

// ---------- Leistungs-/Kundengruppen-Links ----------
function leistungLinks(slugs, base, taxLabels, leistungPagesExist) {
  return slugs
    .map((slug) => {
      const label = esc(taxLabels.get(slug) || slug);
      const href = leistungPagesExist.has(slug)
        ? `${base}leistungen/${encodeURIComponent(slug)}/`
        : `${base}projekte/?tab=alle&leistung=${encodeURIComponent(slug)}`;
      return `<li><a class="tag-link" href="${escAttr(href)}">${label}</a></li>`;
    })
    .join('\n          ');
}

function kundengruppeLinks(kundentyp, base) {
  const out = [];
  if (kundentyp.includes('privat')) {
    out.push(`<li><a class="tag-link" href="${base}privatkunden/">Privatkunden</a></li>`);
  }
  if (kundentyp.includes('gewerbe')) {
    out.push(`<li><a class="tag-link" href="${base}gewerbekunden/">Gewerbekunden</a></li>`);
  }
  return out.join('\n          ');
}

// ---------- Optionaler gegliederter Text (nur falls im JSON vorhanden) ----------
function optionalText(p) {
  const parts = [];
  if (p.ausgangslage) parts.push(['Ausgangslage', p.ausgangslage]);
  if (p.umsetzung) parts.push(['Umsetzung', p.umsetzung]);
  if (p.ergebnis) parts.push(['Ergebnis', p.ergebnis]);
  if (!parts.length) return '';
  const blocks = parts
    .map(([h, t]) => `<h2>${esc(h)}</h2>\n      <p>${esc(t)}</p>`)
    .join('\n      ');
  return `<div class="projekt-text">\n      ${blocks}\n    </div>`;
}

// ---------- JSON-LD ----------
function breadcrumbJsonLd(titel, canonical) {
  return JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Startseite', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Projekte', item: `${SITE}/projekte/` },
        { '@type': 'ListItem', position: 3, name: titel, item: canonical },
      ],
    },
    null,
    2,
  );
}

function imageJsonLd(bilder) {
  const arr = bilder.map((b, i) => {
    const obj = {
      '@context': 'https://schema.org',
      '@type': 'ImageObject',
      contentUrl: absUrl(b.bild),
      description: b.alt || '',
    };
    if (i === 0) obj.representativeOfPage = true;
    return obj;
  });
  return JSON.stringify(arr, null, 2);
}

// ---------- Detailseite ----------
export async function renderProjektPage(opts) {
  const { project, slug, taxLabels, cssVersion, jsVersion, leistungPagesExist } = opts;
  const { page, header, footer, logo } = await partials();

  const base = BASE_PROJEKT;
  const titel = project.titel;
  const ort = project.ort;
  const h1 = `${titel} in ${ort}`;
  const canonical = `${SITE}/projekte/${slug}/`;
  const b = badge(project.kundentyp);
  const bilder = Array.isArray(project.bilder) ? project.bilder : [];
  const cover = bilder[0] || {};
  const lcpPreload = cover.bild
    ? `<link rel="preload" as="image" href="${escAttr(relAsset(cover.bild, base))}" fetchpriority="high" />`
    : '';

  const body = fill(page, {
    base,
    slug: esc(slug),
    cssVersion: escAttr(cssVersion),
    jsVersion: escAttr(jsVersion),
    title: esc(`${h1} — Maik Rohdich Garten- und Landschaftsbau`),
    ogTitle: escAttr(`${h1} — Maik Rohdich Garten- und Landschaftsbau`),
    description: escAttr(truncate(project.beschreibung, 155)),
    canonical: escAttr(canonical),
    ogImage: escAttr(absUrl(cover.bild || '')),
    lcpPreload,
    breadcrumbJsonLd: breadcrumbJsonLd(titel, canonical),
    imageJsonLd: imageJsonLd(bilder),
    logo: logo.trim(),
    header: fill(header, { base }).trim(),
    footer: fill(footer, { base }).trim(),
    titel: esc(titel),
    ort: esc(ort),
    h1: esc(h1),
    beschreibung: esc(project.beschreibung),
    badgeClass: b.cls,
    badgeLabel: esc(b.label),
    optionalText: optionalText(project),
    images: renderImages(bilder, base),
    leistungLinks: leistungLinks(project.leistungen || [], base, taxLabels, leistungPagesExist),
    kundengruppeLinks: kundengruppeLinks(project.kundentyp || [], base),
  });

  return body;
}

// ---------- Statische Galerie-Liste (für /projekte/, zwischen den BUILD-Markern) ----------
export function renderGalleryList(projekte, base = BASE_GALLERY) {
  const cards = projekte
    .map((p) => {
      const b = badge(p.kundentyp);
      const cover = (Array.isArray(p.bilder) && p.bilder[0]) || {};
      const src = escAttr(relAsset(cover.bild || '', base));
      const alt = escAttr(cover.alt || '');
      const href = `${encodeURIComponent(p.slug)}/`;
      const label = escAttr(`Projekt „${p.titel}“ in ${p.ort} ansehen`);
      return `      <article class="project-card">
        <div class="project-media">
          <img src="${src}" alt="${alt}" loading="lazy" decoding="async" width="800" height="600">
          <span class="project-tag ${b.cls}">${esc(b.label)}</span>
        </div>
        <div class="project-body">
          <span class="project-location">${esc(p.ort)}</span>
          <h3>${esc(p.titel)}</h3>
          <p>${esc(p.beschreibung)}</p>
        </div>
        <a class="card-open" href="${href}" aria-label="${label}"></a>
      </article>`;
    })
    .join('\n');

  return `<div id="galleryStatic" class="projects-grid projects-grid--gallery">
${cards}
    </div>`;
}
