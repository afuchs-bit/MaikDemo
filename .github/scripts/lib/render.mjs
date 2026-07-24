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

// AP-22 – optionale Fachtext-Vertiefung (z. B. Verkehrssicherungspflicht).
// Nur Seiten mit "fachtext" bekommen den Block; Quelle/Stand werden ausgewiesen.
function lpFachtext(f) {
  if (!f || !f.titel) return '';
  const intro = f.intro ? `\n      <p class="lp-fachtext-intro">${esc(f.intro)}</p>` : '';
  const bloecke = (f.bloecke || [])
    .map((b) => `      <h3>${esc(b.h3)}</h3>\n      <p>${esc(b.text)}</p>`)
    .join('\n');
  const hinweis = f.hinweis ? `\n      <p class="lp-fachtext-hinweis">${esc(f.hinweis)}</p>` : '';
  return `<section class="lp-block lp-fachtext" aria-labelledby="lp-fachtext-title">
      <h2 id="lp-fachtext-title">${esc(f.titel)}</h2>${intro}
${bloecke}${hinweis}
    </section>`;
}

// AP-24 – optionaler Pool-Rechner (nur auf Seiten mit "rechner": true).
// Qualitative Einordnung OHNE Preise; Berechnung clientseitig (pool-rechner.js).
const POOL_RECHNER_VERSION = '20260724a';
function lpRechner(rechner, base) {
  if (!rechner) return '';
  const waDefault = 'https://wa.me/491712345678?text=' +
    encodeURIComponent('Hallo Herr Rohdich, ich interessiere mich für mein Pool- oder Whirlpool-Umfeld und würde das gern besprechen.');
  return `<section class="lp-block pool-rechner" id="pool-rechner" aria-labelledby="pr-title">
      <h2 id="pr-title">Ihr Vorhaben grob einordnen</h2>
      <p class="lp-note">Diese Einordnung ist eine erste Orientierung – <strong>keine Preisauskunft</strong>. Eine belastbare Einschätzung geben wir nach der Besichtigung. Die Berechnung läuft ausschließlich in Ihrem Browser; erst wenn Sie die Anfrage abschicken, werden Ihre Angaben übermittelt. Eine Budgetangabe ist eine persönliche Angabe – Näheres in der Datenschutzerklärung.</p>

      <form class="pr-form" id="prForm" novalidate>
        <fieldset class="pr-field">
          <legend>Um was geht es?</legend>
          <div class="pr-segs">
            <label class="seg"><input type="radio" name="art" value="Whirlpool-Umfeld" checked><span>Whirlpool-Umfeld</span></label>
            <label class="seg"><input type="radio" name="art" value="Pool bis ca. 24 m²"><span>Pool bis ca.&nbsp;24&nbsp;m²</span></label>
            <label class="seg"><input type="radio" name="art" value="Pool über ca. 24 m²"><span>Pool über ca.&nbsp;24&nbsp;m²</span></label>
          </div>
        </fieldset>

        <fieldset class="pr-field">
          <legend>Was soll dazugehören?</legend>
          <div class="pr-segs">
            <label class="seg"><input type="checkbox" name="scope" value="Ausschachtung & Erdarbeiten"><span>Ausschachtung &amp; Erdarbeiten</span></label>
            <label class="seg"><input type="checkbox" name="scope" value="Terrasse / Belag"><span>Terrasse / Belag</span></label>
            <label class="seg"><input type="checkbox" name="scope" value="Sichtschutz"><span>Sichtschutz</span></label>
            <label class="seg"><input type="checkbox" name="scope" value="Bepflanzung / Umfeld"><span>Bepflanzung / Umfeld</span></label>
            <label class="seg"><input type="checkbox" name="scope" value="Technikbereich"><span>Technikbereich</span></label>
          </div>
        </fieldset>

        <fieldset class="pr-field">
          <legend>Zugänglichkeit für Maschinen</legend>
          <div class="pr-segs">
            <label class="seg"><input type="radio" name="zugang" value="gut zugänglich" checked><span>gut zugänglich</span></label>
            <label class="seg"><input type="radio" name="zugang" value="eingeschränkt"><span>eingeschränkt</span></label>
            <label class="seg"><input type="radio" name="zugang" value="nur von Hand"><span>nur von Hand</span></label>
          </div>
        </fieldset>

        <div class="pr-field pr-budget">
          <label for="prBudget">Grober Budgetrahmen (optional)</label>
          <input type="text" id="prBudget" name="budget" autocomplete="off" placeholder="optional – Ihre Vorstellung">
        </div>
      </form>

      <div class="pr-result" id="prResult" role="status" aria-live="polite"></div>

      <div class="pr-actions">
        <a class="btn btn-primary" id="prSend" href="${waDefault}" target="_blank" rel="noopener">Mit diesen Angaben anfragen <span aria-hidden="true">→</span></a>
        <a class="btn btn-outline" href="${base}#kontakt">Zum Kontakt</a>
      </div>

      <script src="${base}assets/js/pool-rechner.js?v=${POOL_RECHNER_VERSION}" defer></script>
    </section>`;
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
    header: fill(header, { base, leistungenSubmenu: renderNavSubmenu(base) }).trim(),
    footer: fill(footer, { base, leistungenFooter: renderFooterLeistungen(base) }).trim(),
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

// ============================================================
// AP-16 – Leistungsseiten (/leistungen/<slug>/ und /leistungen/)
// ============================================================

export const BASE_LEISTUNG = '../../'; // /leistungen/<slug>/ liegt zwei Ebenen unter dem Root
export const AREA_SERVED = ['Herne', 'Bochum', 'Castrop-Rauxel', 'Recklinghausen', 'Gelsenkirchen-Buer'];

const KUNDENGRUPPE_META = {
  privat: { href: 'privatkunden/', label: 'Für Privatkunden' },
  gewerbe: { href: 'gewerbekunden/', label: 'Für Gewerbekunden' },
};

// AP-18 – EINZIGE Quelle der Navigations-Leistungsliste (Header-Dropdown + Footer).
// Reihenfolge = fachliche Priorität (wie die Übersicht). Labels = navLabel der
// content/leistungen/*.json; build-leistungen.mjs warnt bei Abweichung.
export const LEISTUNGEN_NAV = [
  { slug: 'baumkontrolle', label: 'Baumkontrolle & Gutachten' },
  { slug: 'baumarbeiten', label: 'Baumfällung & Baumarbeiten' },
  { slug: 'gartengestaltung', label: 'Gartengestaltung' },
  { slug: 'vorgarten', label: 'Vorgartengestaltung' },
  { slug: 'teichbau', label: 'Teichanlagen' },
  { slug: 'gartenpflege', label: 'Gartenpflege' },
  { slug: 'aussenanlagenpflege', label: 'Außenanlagenpflege' },
  { slug: 'terrasse-pflasterarbeiten', label: 'Terrassen & Pflaster' },
  { slug: 'bepflanzung', label: 'Bepflanzung' },
  { slug: 'dachbegruenung', label: 'Dachbegrünung' },
  { slug: 'palmen-winterfest', label: 'Palmen & winterfest' },
  { slug: 'pool-whirlpool-umfeld', label: 'Pool- & Whirlpool-Umfeld' },
  { slug: 'sturmnotdienst', label: 'Sturmnotdienst' },
  { slug: 'holzverkauf', label: 'Brennholz & Stammholz' },
];

// Header-Dropdown: <ul> mit den 14 Leistungen (base = Pfadpräfix zum Root).
export function renderNavSubmenu(base) {
  const items = LEISTUNGEN_NAV
    .map((l) => `<li><a href="${base}leistungen/${l.slug}/">${esc(l.label)}</a></li>`)
    .join('\n            ');
  return `<ul class="nav-submenu" id="submenu-leistungen">
            ${items}
          </ul>`;
}

// Footer-Spalte: alle 14 Leistungen direkt erreichbar.
export function renderFooterLeistungen(base) {
  const items = LEISTUNGEN_NAV
    .map((l) => `<li><a href="${base}leistungen/${l.slug}/">${esc(l.label)}</a></li>`)
    .join('\n        ');
  return `<ul class="footer-list footer-leistungen">
        ${items}
      </ul>`;
}

// AP-19 – Startseiten-FAQ aus content/faq-startseite.json.
// Sichtbare <details>-Liste UND FAQPage-Schema aus DERSELBEN Quelle → identischer Text.
export function renderFaqDetails(faq) {
  return faq
    .map((f) => `<details>
        <summary><span>${esc(f.frage)}</span><span class="chev" aria-hidden="true"></span></summary>
        <div class="faq-body"><p>${esc(f.antwort)}</p></div>
      </details>`)
    .join('\n      ');
}

export function renderFaqSchema(faq) {
  const json = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.frage,
      acceptedAnswer: { '@type': 'Answer', text: f.antwort },
    })),
  }, null, 2);
  return `<script type="application/ld+json">\n${json}\n</script>`;
}

// Einzelne Templates on demand laden und cachen.
const _tplCache = new Map();
async function loadTpl(name) {
  if (_tplCache.has(name)) return _tplCache.get(name);
  const t = await readFile(path.join(TPL_DIR, name), 'utf8');
  _tplCache.set(name, t);
  return t;
}

function firstSentence(s, max = 170) {
  const str = String(s || '').trim().replace(/\s+/g, ' ');
  const m = str.match(/^(.*?[.!?])(\s|$)/);
  const sent = m ? m[1] : str;
  return sent.length > max ? truncate(sent, max) : sent;
}

// ---------- Abschnitts-Renderer ----------
function lpEignung(arr) {
  return `<ul class="lp-list">
        ${arr.map((s) => `<li>${esc(s)}</li>`).join('\n        ')}
      </ul>`;
}

function lpAblauf(arr) {
  const items = arr.map((s) => `<li>
          <h3>${esc(s.titel)}</h3>
          <p>${esc(s.text)}</p>
        </li>`).join('\n        ');
  return `<ol class="lp-steps">
        ${items}
      </ol>`;
}

function lpAufwand(arr) {
  const items = arr.map((s) => `<div class="lp-driver">
          <dt>${esc(s.titel)}</dt>
          <dd>${esc(s.text)}</dd>
        </div>`).join('\n        ');
  return `<dl class="lp-drivers">
        ${items}
      </dl>`;
}

function lpMyths(arr) {
  const items = arr.map((s) => `<li>
          <h3>${esc(s.titel)}</h3>
          <p>${esc(s.text)}</p>
        </li>`).join('\n        ');
  return `<ul class="lp-myths">
        ${items}
      </ul>`;
}

function lpFaq(arr) {
  const items = arr.map((f) => `<details>
          <summary><span>${esc(f.frage)}</span><span class="chev" aria-hidden="true"></span></summary>
          <div class="faq-body"><p>${esc(f.antwort)}</p></div>
        </details>`).join('\n        ');
  return `<div class="faq-list">
        ${items}
      </div>`;
}

function lpRefs(refProjects, base) {
  if (!refProjects.length) {
    return `<p class="lp-note"><a class="tag-link" href="${base}projekte/">Alle Projekte in der Galerie ansehen</a></p>`;
  }
  const cards = refProjects.map((p) => {
    const b = badge(p.kundentyp);
    const cover = p.cover || {};
    const src = escAttr(relAsset(cover.bild || '', base));
    const alt = escAttr(cover.alt || '');
    const href = `${base}projekte/${encodeURIComponent(p.slug)}/`;
    const label = escAttr(`Projekt „${p.titel}“ in ${p.ort} ansehen`);
    return `<article class="project-card">
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
  }).join('\n        ');
  return `<div class="projects-grid lp-refs">
        ${cards}
      </div>`;
}

function lpVerlinkung(leistung, labelBySlug, base) {
  const groups = [];
  const kg = (leistung.kundengruppe || []).map((k) => {
    const m = KUNDENGRUPPE_META[k];
    return m ? `<li><a class="tag-link" href="${base}${m.href}">${esc(m.label)}</a></li>` : '';
  }).filter(Boolean).join('\n            ');
  if (kg) groups.push(`<div class="lp-linkgroup">
          <h3>Kundengruppe</h3>
          <ul class="tag-list">
            ${kg}
          </ul>
        </div>`);

  const nb = (leistung.nachbarn || []).map((slug) => {
    const label = labelBySlug.get(slug) || slug;
    return `<li><a class="tag-link" href="${base}leistungen/${encodeURIComponent(slug)}/">${esc(label)}</a></li>`;
  }).join('\n            ');
  if (nb) groups.push(`<div class="lp-linkgroup">
          <h3>Verwandte Leistungen</h3>
          <ul class="tag-list">
            ${nb}
          </ul>
        </div>`);

  groups.push(`<div class="lp-linkgroup">
          <h3>Direkt anfragen</h3>
          <ul class="tag-list">
            <li><a class="tag-link" href="${base}#kontakt">Kontakt aufnehmen</a></li>
          </ul>
        </div>`);

  return `<div class="lp-links">
        ${groups.join('\n        ')}
      </div>`;
}

// ---------- JSON-LD ----------
function leistungBreadcrumb(h1, canonical) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Startseite', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Leistungen', item: `${SITE}/leistungen/` },
      { '@type': 'ListItem', position: 3, name: h1, item: canonical },
    ],
  }, null, 2);
}

function serviceJsonLd(leistung, canonical) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${canonical}#service`,
    name: leistung.h1,
    serviceType: leistung.serviceType || leistung.h1,
    url: canonical,
    provider: { '@id': `${SITE}/#business` },
    areaServed: AREA_SERVED,
  }, null, 2);
}

function faqJsonLd(faq) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (faq || []).map((f) => ({
      '@type': 'Question',
      name: f.frage,
      acceptedAnswer: { '@type': 'Answer', text: f.antwort },
    })),
  }, null, 2);
}

// ---------- Leistungs-Detailseite ----------
export async function renderLeistungPage(opts) {
  const { leistung, slug, cssVersion, jsVersion, refProjects = [], labelBySlug = new Map() } = opts;
  const [page, header, footer, logo] = await Promise.all([
    loadTpl('leistung.html'), loadTpl('_header.html'), loadTpl('_footer.html'), loadTpl('_logo.html'),
  ]);
  const base = BASE_LEISTUNG;
  const canonical = `${SITE}/leistungen/${slug}/`;
  const ogImage = refProjects[0]?.cover?.bild ? absUrl(refProjects[0].cover.bild) : `${SITE}/assets/img/ueber/ueber-1.jpg`;

  return fill(page, {
    base,
    slug: esc(slug),
    cssVersion: escAttr(cssVersion),
    jsVersion: escAttr(jsVersion),
    title: esc(leistung.title),
    ogTitle: escAttr(leistung.title),
    description: escAttr(truncate(leistung.metaDescription, 160)),
    canonical: escAttr(canonical),
    ogImage: escAttr(ogImage),
    breadcrumbJsonLd: leistungBreadcrumb(leistung.h1, canonical),
    serviceJsonLd: serviceJsonLd(leistung, canonical),
    faqJsonLd: faqJsonLd(leistung.faq),
    logo: logo.trim(),
    header: fill(header, { base, leistungenSubmenu: renderNavSubmenu(base) }).trim(),
    footer: fill(footer, { base, leistungenFooter: renderFooterLeistungen(base) }).trim(),
    h1: esc(leistung.h1),
    intro: esc(leistung.intro),
    fachtext: lpFachtext(leistung.fachtext),
    rechner: lpRechner(leistung.rechner, base),
    eignung: lpEignung(leistung.eignung || []),
    ablauf: lpAblauf(leistung.ablauf || []),
    aufwand: lpAufwand(leistung.aufwand || []),
    fehleinschaetzungen: lpMyths(leistung.fehleinschaetzungen || []),
    referenzprojekte: lpRefs(refProjects, base),
    faqHtml: lpFaq(leistung.faq || []),
    verlinkung: lpVerlinkung(leistung, labelBySlug, base),
  });
}

// ---------- Leistungs-Übersichtsseite ----------
export async function renderLeistungenOverview(opts) {
  const { leistungen, cssVersion, jsVersion } = opts;
  const [page, header, footer, logo] = await Promise.all([
    loadTpl('leistungen-index.html'), loadTpl('_header.html'), loadTpl('_footer.html'), loadTpl('_logo.html'),
  ]);
  const base = BASE_GALLERY; // /leistungen/ liegt eine Ebene unter dem Root
  const canonical = `${SITE}/leistungen/`;

  const cards = leistungen.map((l) => {
    const href = `${encodeURIComponent(l.slug)}/`;
    const kg = (l.kundengruppe || []).map((k) => (k === 'gewerbe' ? 'Gewerbe' : 'Privat')).join(' · ');
    return `<a class="lpx-card" href="${href}">
          <span class="lpx-tag">${esc(kg)}</span>
          <h2>${esc(l.h1)}</h2>
          <p>${esc(firstSentence(l.intro))}</p>
          <span class="lpx-more">Mehr erfahren <span aria-hidden="true">→</span></span>
        </a>`;
  }).join('\n        ');

  const breadcrumb = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Startseite', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Leistungen', item: canonical },
    ],
  }, null, 2);

  const itemList = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: leistungen.map((l, i) => ({
      '@type': 'ListItem', position: i + 1, name: l.h1, url: `${SITE}/leistungen/${l.slug}/`,
    })),
  }, null, 2);

  return fill(page, {
    base,
    cssVersion: escAttr(cssVersion),
    jsVersion: escAttr(jsVersion),
    title: esc('Leistungen im Garten- und Landschaftsbau in Herne, Bochum & Recklinghausen | Maik Rohdich'),
    ogTitle: escAttr('Leistungen – Maik Rohdich Garten- und Landschaftsbau'),
    description: escAttr('Alle Leistungen von Maik Rohdich Garten- und Landschaftsbau: Gartengestaltung, Teichanlagen, Pflasterarbeiten, Baumkontrolle, Pflege und mehr in Herne, Bochum und Recklinghausen.'),
    canonical: escAttr(canonical),
    ogImage: escAttr(`${SITE}/assets/img/ueber/ueber-1.jpg`),
    breadcrumbJsonLd: breadcrumb,
    itemListJsonLd: itemList,
    logo: logo.trim(),
    header: fill(header, { base, leistungenSubmenu: renderNavSubmenu(base) }).trim(),
    footer: fill(footer, { base, leistungenFooter: renderFooterLeistungen(base) }).trim(),
    cards,
  });
}

// ============================================================
// AP-22 – Ratgeber (/ratgeber/<slug>/ und /ratgeber/)
// ============================================================

const LEISTUNG_LABEL = new Map(LEISTUNGEN_NAV.map((l) => [l.slug, l.label]));

function rgSections(sections) {
  return (sections || [])
    .map((s) => {
      const paras = (s.absaetze || []).map((a) => `      <p>${esc(a)}</p>`).join('\n');
      return `      <h2>${esc(s.h2)}</h2>\n${paras}`;
    })
    .join('\n\n');
}

function rgVerwandte(slugs, base) {
  return (slugs || [])
    .map((slug) => {
      const label = esc(LEISTUNG_LABEL.get(slug) || slug);
      return `<li><a class="tag-link" href="${base}leistungen/${encodeURIComponent(slug)}/">${label}</a></li>`;
    })
    .join('\n            ');
}

function articleJsonLd(a, canonical) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.h1,
    description: a.metaDescription,
    inLanguage: 'de-DE',
    datePublished: a.datum,
    dateModified: a.datum,
    author: { '@id': `${SITE}/#maik-rohdich` },
    publisher: { '@id': `${SITE}/#business` },
    mainEntityOfPage: canonical,
  }, null, 2);
}

function ratgeberBreadcrumb(kurz, canonical) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Startseite', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Ratgeber', item: `${SITE}/ratgeber/` },
      { '@type': 'ListItem', position: 3, name: kurz, item: canonical },
    ],
  }, null, 2);
}

// ---------- Ratgeber-Artikel ----------
export async function renderRatgeberPage(opts) {
  const { article, slug, cssVersion, jsVersion } = opts;
  const [page, header, footer, logo] = await Promise.all([
    loadTpl('ratgeber.html'), loadTpl('_header.html'), loadTpl('_footer.html'), loadTpl('_logo.html'),
  ]);
  const base = BASE_LEISTUNG;
  const canonical = `${SITE}/ratgeber/${slug}/`;
  const kurz = article.kurz || article.h1;

  return fill(page, {
    base,
    slug: esc(slug),
    cssVersion: escAttr(cssVersion),
    jsVersion: escAttr(jsVersion),
    title: esc(article.title),
    ogTitle: escAttr(article.title),
    description: escAttr(truncate(article.metaDescription, 160)),
    canonical: escAttr(canonical),
    ogImage: escAttr(`${SITE}/assets/img/ueber/ueber-1.jpg`),
    breadcrumbJsonLd: ratgeberBreadcrumb(kurz, canonical),
    articleJsonLd: articleJsonLd(article, canonical),
    faqJsonLd: faqJsonLd(article.faq || []),
    logo: logo.trim(),
    header: fill(header, { base, leistungenSubmenu: renderNavSubmenu(base) }).trim(),
    footer: fill(footer, { base, leistungenFooter: renderFooterLeistungen(base) }).trim(),
    h1: esc(article.h1),
    kurz: esc(kurz),
    intro: esc(article.intro),
    sections: rgSections(article.sections),
    quelle: esc(article.quelle),
    stand: esc(article.stand),
    faqHtml: lpFaq(article.faq || []),
    verwandteLinks: rgVerwandte(article.verwandteLeistungen, base),
  });
}

// ---------- Ratgeber-Übersicht ----------
export async function renderRatgeberOverview(opts) {
  const { artikel, cssVersion, jsVersion } = opts;
  const [page, header, footer, logo] = await Promise.all([
    loadTpl('ratgeber-index.html'), loadTpl('_header.html'), loadTpl('_footer.html'), loadTpl('_logo.html'),
  ]);
  const base = BASE_GALLERY;
  const canonical = `${SITE}/ratgeber/`;

  const cards = artikel.map((a) => {
    const href = `${encodeURIComponent(a.slug)}/`;
    return `<a class="lpx-card" href="${href}">
          <span class="lpx-tag">Ratgeber</span>
          <h2>${esc(a.h1)}</h2>
          <p>${esc(firstSentence(a.intro))}</p>
          <span class="lpx-more">Weiterlesen <span aria-hidden="true">→</span></span>
        </a>`;
  }).join('\n        ');

  const breadcrumb = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Startseite', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Ratgeber', item: canonical },
    ],
  }, null, 2);

  return fill(page, {
    base,
    cssVersion: escAttr(cssVersion),
    jsVersion: escAttr(jsVersion),
    title: esc('Ratgeber rund um den Garten | Maik Rohdich Garten- und Landschaftsbau'),
    ogTitle: escAttr('Ratgeber – Maik Rohdich Garten- und Landschaftsbau'),
    description: escAttr('Fachlich fundierte Antworten auf häufige Gartenfragen – Fristen, Recht und Praxis, verständlich erklärt von Maik Rohdich aus Herne.'),
    canonical: escAttr(canonical),
    ogImage: escAttr(`${SITE}/assets/img/ueber/ueber-1.jpg`),
    breadcrumbJsonLd: breadcrumb,
    logo: logo.trim(),
    header: fill(header, { base, leistungenSubmenu: renderNavSubmenu(base) }).trim(),
    footer: fill(footer, { base, leistungenFooter: renderFooterLeistungen(base) }).trim(),
    cards,
  });
}
