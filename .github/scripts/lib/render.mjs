// .github/scripts/lib/render.mjs
//
// Reine Render-Funktionen für AP-15: erzeugt aus einem validierten Projekt-Datensatz
// die statische Detailseite /projekte/<slug>/index.html und die crawlbare Galerie-Liste.
// KEIN Datei-I/O außer dem Laden der HTML-Templates – Validierung/Schreiben bleibt in
// build-index.mjs. Design lebt in ../templates/, nicht hier.

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { imageManifest, widthsFor, fallbackSrc } from './images.mjs';

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

// Baut <picture> mit AVIF+WebP-srcset aus dem Manifest. `bild` ist der kanonische
// Pfad (…/name.webp). Pfade werden mit `base` auf die Seitentiefe rebasiert (relativ),
// damit die Seite sowohl unter /MaikDemo/ als auch unter / funktioniert. Fällt auf ein
// einfaches <img> zurück, wenn das Bild nicht im Manifest steht (noch nicht lokalisiert).
//
// AP-77: Das <img src> zeigt auf `<base>.webp`, nicht auf `bild`. Bei den Bildern aus
// build-images.mjs ist das derselbe Pfad; bei denen aus build-hero-images.mjs liegt unter
// `bild` das grosse Original (bis 1,2 MB), das nie ausgeliefert werden soll.
export function renderPicture(bild, { alt = '', sizes = '100vw', className = '', priority = false, width, height, base = '' } = {}) {
  const m = imageManifest()[bild];
  const cls = className ? ` class="${escAttr(className)}"` : '';
  const load = priority ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"';
  const rel = (p) => escAttr(relAsset(p, base));
  if (!m) {
    const wh = width && height ? ` width="${width}" height="${height}"` : '';
    return `<img${cls} src="${rel(bild)}" alt="${escAttr(alt)}"${wh} ${load}>`;
  }
  const set = (ext) => widthsFor(m, ext).map((w) => `${rel(`${m.base}-${w}.${ext}`)} ${w}w`).join(', ');
  return `<picture>
        <source type="image/avif" sizes="${escAttr(sizes)}" srcset="${set('avif')}">
        <source type="image/webp" sizes="${escAttr(sizes)}" srcset="${set('webp')}">
        <img${cls} src="${rel(fallbackSrc(m))}" alt="${escAttr(alt)}" width="${width || m.width}" height="${height || m.height}" ${load}>
      </picture>`;
}

// Preload-Link fuer das LCP-Bild einer Seite (AVIF-srcset, relativ zur Seitentiefe).
function lcpPreloadFor(bild, sizes = '100vw', base = '') {
  const m = bild ? imageManifest()[bild] : null;
  if (m) {
    const srcset = widthsFor(m, 'avif').map((w) => `${escAttr(relAsset(`${m.base}-${w}.avif`, base))} ${w}w`).join(', ');
    return `<link rel="preload" as="image" type="image/avif" imagesizes="${escAttr(sizes)}" imagesrcset="${srcset}" />`;
  }
  return bild ? `<link rel="preload" as="image" href="${escAttr(relAsset(bild, base))}" fetchpriority="high" />` : '';
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
      // Erstes Bild = LCP: hohe Priorität. Rest: lazy. Volle Spaltenbreite bis 900px.
      const pic = renderPicture(b.bild, {
        alt: b.alt || '',
        sizes: '(max-width: 1000px) 100vw, 900px',
        priority: i === 0,
        base,
      });
      return `<figure class="projekt-figure">
        ${pic}
      </figure>`;
    })
    .join('\n      ');
}

// ---------- Leistungs-/Kundengruppen-Links ----------
function leistungLinks(slugs, base, taxLabels, leistungPagesExist) {
  return slugs
    .map((slug) => {
      const label = esc(taxLabels.get(slug) || slug);
      // AP-33: Leistungsseiten liegen jetzt je Welt. Aus dem weltfremden Kontext einer
      // Projektseite zeigen wir in die Standard-Welt (Privat; nur-Gewerbe-Slugs dorthin).
      const href = leistungPagesExist.has(slug)
        ? `${base}${weltPfadFuerSlug(slug)}leistungen/${encodeURIComponent(slug)}/`
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
const POOL_RECHNER_VERSION = '20260725a';
function lpRechner(rechner, base) {
  if (!rechner) return '';
  const waDefault = 'https://wa.me/491711738943?text=' +
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
        { '@type': 'ListItem', position: 2, name: 'Galerie', item: `${SITE}/projekte/` },
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
  const lcpPreload = lcpPreloadFor(cover.bild, '(max-width: 1000px) 100vw, 900px', base);

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
      const pic = renderPicture(cover.bild || '', {
        alt: cover.alt || '', sizes: '(max-width: 700px) 90vw, 30vw', width: 800, height: 600, base,
      });
      const href = `${encodeURIComponent(p.slug)}/`;
      const label = escAttr(`Projekt „${p.titel}“ in ${p.ort} ansehen`);
      return `      <article class="project-card">
        <div class="project-media">
          ${pic}
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

export const BASE_LEISTUNG = '../../'; // Alt-Pfad /leistungen/<slug>/ (nur noch Weiche)

// AP-33: Die beiden Leistungswelten. Einzige Quelle für Pfade, Labels und Zugehörigkeit.
// Breadcrumb-Knoten der Leistungsübersicht – weltunabhängig „Leistungen"; die Welt
// steht schon im vorherigen Knoten (weltLabel). uebersichtLabel bleibt weltspezifisch
// für den ogTitle (Social-Share-Title je Welt eindeutig).
const LEISTUNGEN_CRUMB = 'Leistungen';

export const WELTEN = {
  privat: {
    key: 'privat',
    pfad: 'privatkunden/',
    weltLabel: 'Privatkunde',
    navLabel: 'Für Privatkunden',
    uebersichtLabel: 'Leistungen – Privatkunde',
    h1: 'Leistungen für Privatkunden',
    lead: 'Von der Gartengestaltung über Teichanlagen und Pflasterarbeiten bis zur Baumkontrolle und laufenden Pflege – für private Gärten in Herne, Bochum, Castrop-Rauxel, Recklinghausen und Gelsenkirchen-Buer.',
    base: '../../../',        // /privatkunden/leistungen/<slug>/
    baseUebersicht: '../../', // /privatkunden/leistungen/
    slugs: [
      'baumkontrolle', 'baumarbeiten', 'sturmnotdienst', 'holzverkauf',
      'gartengestaltung', 'vorgarten', 'teichbau', 'terrasse-pflasterarbeiten',
      'bepflanzung', 'dachbegruenung', 'gartenpflege', 'palmen-winterfest',
      'pool-whirlpool-umfeld',
    ],
  },
  gewerbe: {
    key: 'gewerbe',
    pfad: 'gewerbekunden/',
    weltLabel: 'Gewerbekunde',
    navLabel: 'Für Gewerbekunden',
    uebersichtLabel: 'Leistungen – Gewerbekunde',
    h1: 'Leistungen für Gewerbekunden',
    lead: 'Außenanlagenpflege, Baumkontrolle, Baumarbeiten, Dachbegrünung und Sturmnotdienst für gewerbliche Objekte in Herne, Bochum, Castrop-Rauxel, Recklinghausen und Gelsenkirchen-Buer.',
    base: '../../../',
    baseUebersicht: '../../',
    slugs: ['baumkontrolle', 'baumarbeiten', 'sturmnotdienst', 'dachbegruenung', 'aussenanlagenpflege'],
  },
};

// AP-33: Standard-Welt für Links aus weltfremdem Kontext (Projekt-/Ratgeberseiten).
// Slugs, die es nur in der Gewerbe-Welt gibt, zeigen dorthin – sonst liefe der Link ins Leere.
const NUR_GEWERBE = new Set(
  WELTEN.gewerbe.slugs.filter((s) => !WELTEN.privat.slugs.includes(s)),
);
export function weltPfadFuerSlug(slug) {
  return NUR_GEWERBE.has(slug) ? WELTEN.gewerbe.pfad : WELTEN.privat.pfad;
}

// AP-33: Gruppierung der Übersicht. Pro Welt wird auf die vorhandenen Slugs gefiltert;
// leere Gruppen entfallen. Slugs ohne Gruppe landen in "Weitere Leistungen".
export const LEISTUNGS_GRUPPEN = [
  { label: 'Bäume & Sicherheit', slugs: ['baumkontrolle', 'baumarbeiten', 'sturmnotdienst', 'holzverkauf'] },
  { label: 'Gartengestaltung', slugs: ['gartengestaltung', 'vorgarten', 'teichbau', 'terrasse-pflasterarbeiten', 'bepflanzung', 'dachbegruenung'] },
  { label: 'Pflege & Sonderleistungen', slugs: ['gartenpflege', 'aussenanlagenpflege', 'palmen-winterfest', 'pool-whirlpool-umfeld'] },
];
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

// AP-33: Dropdown nach Welten getrennt. Der Besucher wählt beim Einstieg seine Welt
// und bleibt dann darin. Labels kommen weiterhin aus LEISTUNGEN_NAV.
export function renderNavSubmenu(base) {
  const labelBySlug = new Map(LEISTUNGEN_NAV.map((l) => [l.slug, l.label]));
  const block = (welt) => {
    const items = welt.slugs
      .map((s) => `<li><a href="${base}${welt.pfad}leistungen/${s}/">${esc(labelBySlug.get(s) || s)}</a></li>`)
      .join('\n              ');
    return `<li class="nav-submenu-group">
            <a class="nav-submenu-head" href="${base}${welt.pfad}leistungen/">${esc(welt.navLabel)}</a>
            <ul>
              ${items}
            </ul>
          </li>`;
  };
  return `<ul class="nav-submenu nav-submenu--welten" id="submenu-leistungen">
          ${block(WELTEN.privat)}
          ${block(WELTEN.gewerbe)}
          </ul>`;
}

// Footer-Spalte: nur Signatur-Leistungen als Quick-Links (Differenzierer + hohe
// Kaufabsicht). Die vollstaendige Liste bleibt ueber die Hub-Seiten erreichbar
// (Nav-Dropdown, Bereiche-Spalte, "Alle Leistungen im Ueberblick"), daher hier
// bewusst kurz. Die ersten fuenf zeigen in die Privat-Welt (Standard-Publikum der
// Startseite); Aussenanlagenpflege haelt die Gewerbe-Welt praesent (reine
// Gewerbe-Leistung, existiert nur dort).
const FOOTER_SIGNATUR = [
  { slug: 'baumkontrolle', pfad: WELTEN.privat.pfad },
  { slug: 'baumarbeiten', pfad: WELTEN.privat.pfad },
  { slug: 'sturmnotdienst', pfad: WELTEN.privat.pfad },
  { slug: 'gartengestaltung', pfad: WELTEN.privat.pfad },
  { slug: 'gartenpflege', pfad: WELTEN.privat.pfad },
  { slug: 'aussenanlagenpflege', pfad: WELTEN.gewerbe.pfad },
];
export function renderFooterLeistungen(base) {
  const labelBySlug = new Map(LEISTUNGEN_NAV.map((l) => [l.slug, l.label]));
  const items = FOOTER_SIGNATUR
    .map(({ slug, pfad }) => `<li><a href="${base}${pfad}leistungen/${slug}/">${esc(labelBySlug.get(slug) || slug)}</a></li>`)
    .join('\n        ');
  return `<ul class="footer-list">
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
    const pic = renderPicture(cover.bild || '', {
      alt: cover.alt || '', sizes: '(max-width: 700px) 90vw, 30vw', width: 800, height: 600, base,
    });
    const href = `${base}projekte/${encodeURIComponent(p.slug)}/`;
    const label = escAttr(`Projekt „${p.titel}“ in ${p.ort} ansehen`);
    return `<article class="project-card">
          <div class="project-media">
            ${pic}
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

function lpVerlinkung(leistung, labelBySlug, base, welt) {
  const groups = [];
  // AP-33: nur die EIGENE Welt verlinken. Ein Link auf die andere Welt würde den
  // Besucher aus seiner Welt herausführen – genau das soll nicht passieren.
  const m = KUNDENGRUPPE_META[welt.key];
  const kg = m ? `<li><a class="tag-link" href="${base}${m.href}">${esc(m.label)}</a></li>` : '';
  if (kg) groups.push(`<div class="lp-linkgroup">
          <h3>Kundengruppe</h3>
          <ul class="tag-list">
            ${kg}
          </ul>
        </div>`);

  // AP-33: Nachbarn zeigen auf die Leistung innerhalb DERSELBEN Welt.
  const nb = (leistung.nachbarn || []).map((slug) => {
    const label = labelBySlug.get(slug) || slug;
    return `<li><a class="tag-link" href="${base}${welt.pfad}leistungen/${encodeURIComponent(slug)}/">${esc(label)}</a></li>`;
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
// AP-33: vierstufig, weltabhängig. Muss mit der sichtbaren Breadcrumb übereinstimmen.
function leistungBreadcrumb(h1, canonical, welt) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Startseite', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: welt.weltLabel, item: `${SITE}/${welt.pfad}` },
      { '@type': 'ListItem', position: 3, name: LEISTUNGEN_CRUMB, item: `${SITE}/${welt.pfad}leistungen/` },
      { '@type': 'ListItem', position: 4, name: h1, item: canonical },
    ],
  }, null, 2);
}

// AP-33: sichtbare Breadcrumb-Kette (Template-Platzhalter {{breadcrumbTrail}}).
function breadcrumbTrail(welt, base, h1) {
  return `<li><a href="${base}">Startseite</a></li>
        <li><a href="${base}${welt.pfad}">${esc(welt.weltLabel)}</a></li>
        <li><a href="${base}${welt.pfad}leistungen/">${esc(LEISTUNGEN_CRUMB)}</a></li>
        <li aria-current="page">${esc(h1)}</li>`;
}

// AP-33: Breadcrumb der Welt-Übersicht (dreistufig).
function uebersichtBreadcrumbTrail(welt, base) {
  return `<li><a href="${base}">Startseite</a></li>
        <li><a href="${base}${welt.pfad}">${esc(welt.weltLabel)}</a></li>
        <li aria-current="page">${esc(LEISTUNGEN_CRUMB)}</li>`;
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
  const { leistung, slug, welt, cssVersion, jsVersion, refProjects = [], labelBySlug = new Map() } = opts;
  const [page, header, footer, logo] = await Promise.all([
    loadTpl('leistung.html'), loadTpl('_header.html'), loadTpl('_footer.html'), loadTpl('_logo.html'),
  ]);
  const base = welt.base;
  const canonical = `${SITE}/${welt.pfad}leistungen/${slug}/`;
  const ogImage = refProjects[0]?.cover?.bild ? absUrl(refProjects[0].cover.bild) : `${SITE}/assets/img/hero/hero-garten-herne-1600.webp`;

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
    breadcrumbJsonLd: leistungBreadcrumb(leistung.h1, canonical, welt),
    breadcrumbTrail: breadcrumbTrail(welt, base, leistung.h1),
    weltLeistungenHref: `${base}${welt.pfad}leistungen/`,
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
    verlinkung: lpVerlinkung(leistung, labelBySlug, base, welt),
  });
}

// ---------- Leistungs-Übersichtsseite ----------
export async function renderLeistungenOverview(opts) {
  const { leistungen, welt, cssVersion, jsVersion } = opts;
  const [page, header, footer, logo] = await Promise.all([
    loadTpl('leistungen-index.html'), loadTpl('_header.html'), loadTpl('_footer.html'), loadTpl('_logo.html'),
  ]);
  const base = welt.baseUebersicht;
  const canonical = `${SITE}/${welt.pfad}leistungen/`;

  // AP-33: Kein Kundentyp-Tag mehr – die Welt ist durch die Seite bereits eindeutig.
  const renderCard = (l) => `<a class="lpx-card" href="${encodeURIComponent(l.slug)}/">
          <h2>${esc(l.h1)}</h2>
          <p>${esc(firstSentence(l.intro))}</p>
          <span class="lpx-more">Mehr erfahren <span aria-hidden="true">→</span></span>
        </a>`;

  // AP-33: Gruppierung, auf die Leistungen dieser Welt gefiltert. Leere Gruppen entfallen,
  // nicht zugeordnete Slugs landen gesammelt in "Weitere Leistungen" – nichts verschwindet.
  const vorhanden = new Map(leistungen.map((l) => [l.slug, l]));
  const gruppen = LEISTUNGS_GRUPPEN
    .map((g) => ({ label: g.label, items: g.slugs.map((s) => vorhanden.get(s)).filter(Boolean) }))
    .filter((g) => g.items.length);
  const zugeordnet = new Set(LEISTUNGS_GRUPPEN.flatMap((g) => g.slugs));
  const rest = leistungen.filter((l) => !zugeordnet.has(l.slug));
  if (rest.length) gruppen.push({ label: 'Weitere Leistungen', items: rest });

  const cards = gruppen.map((g) => `<div class="lpx-group">
      <h3 class="lpx-group-label">${esc(g.label)}</h3>
      <div class="lpx-grid">
        ${g.items.map(renderCard).join('\n        ')}
      </div>
    </div>`).join('\n    ');

  const breadcrumb = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Startseite', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: welt.weltLabel, item: `${SITE}/${welt.pfad}` },
      { '@type': 'ListItem', position: 3, name: LEISTUNGEN_CRUMB, item: canonical },
    ],
  }, null, 2);

  const itemList = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: leistungen.map((l, i) => ({
      '@type': 'ListItem', position: i + 1, name: l.h1, url: `${SITE}/${welt.pfad}leistungen/${l.slug}/`,
    })),
  }, null, 2);

  const titel = `Leistungen für ${welt.weltLabel}n in Herne, Bochum & Recklinghausen | Maik Rohdich`;

  return fill(page, {
    base,
    cssVersion: escAttr(cssVersion),
    jsVersion: escAttr(jsVersion),
    title: esc(titel),
    ogTitle: escAttr(`${welt.uebersichtLabel} – Maik Rohdich Garten- und Landschaftsbau`),
    description: escAttr(truncate(`Alle Leistungen von Maik Rohdich Garten- und Landschaftsbau für ${welt.weltLabel}n in Herne, Bochum, Castrop-Rauxel und Recklinghausen im Überblick.`, 160)),
    canonical: escAttr(canonical),
    ogImage: escAttr(`${SITE}/assets/img/hero/hero-garten-herne-1600.webp`),
    breadcrumbJsonLd: breadcrumb,
    breadcrumbTrail: uebersichtBreadcrumbTrail(welt, base),
    h1: esc(welt.h1),
    lead: esc(welt.lead),
    logo: logo.trim(),
    header: fill(header, { base, leistungenSubmenu: renderNavSubmenu(base) }).trim(),
    footer: fill(footer, { base, leistungenFooter: renderFooterLeistungen(base) }).trim(),
    itemListJsonLd: itemList,
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
      // AP-33: wie leistungLinks – Ratgeberartikel gehören keiner Welt an, daher Standard-Welt.
      return `<li><a class="tag-link" href="${base}${weltPfadFuerSlug(slug)}leistungen/${encodeURIComponent(slug)}/">${label}</a></li>`;
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
    ogImage: escAttr(`${SITE}/assets/img/hero/hero-garten-herne-1600.webp`),
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
    ogImage: escAttr(`${SITE}/assets/img/hero/hero-garten-herne-1600.webp`),
    breadcrumbJsonLd: breadcrumb,
    logo: logo.trim(),
    header: fill(header, { base, leistungenSubmenu: renderNavSubmenu(base) }).trim(),
    footer: fill(footer, { base, leistungenFooter: renderFooterLeistungen(base) }).trim(),
    cards,
  });
}

// AP-11 – Rechtstextseiten (/impressum/, /datenschutz/). Grundgerüst mit Chrome;
// der eigentliche Rechtstext kommt als vertrauenswürdiges HTML-Fragment (bodyHtml)
// aus content/rechtstexte/<slug>.body.html und wird unverändert eingebettet.
export async function renderRechtstextPage(opts) {
  const { data, slug, bodyHtml, cssVersion, jsVersion } = opts;
  const [page, header, footer, logo] = await Promise.all([
    loadTpl('rechtstext.html'), loadTpl('_header.html'), loadTpl('_footer.html'), loadTpl('_logo.html'),
  ]);
  const base = BASE_GALLERY; // /impressum/ bzw. /datenschutz/ liegt eine Ebene unter dem Root
  const canonical = `${SITE}/${slug}/`;

  const breadcrumb = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Startseite', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: data.h1, item: canonical },
    ],
  }, null, 2);

  return fill(page, {
    base,
    slug: esc(slug),
    cssVersion: escAttr(cssVersion),
    jsVersion: escAttr(jsVersion),
    title: esc(data.title),
    ogTitle: escAttr(data.title),
    description: escAttr(truncate(data.metaDescription, 160)),
    canonical: escAttr(canonical),
    ogImage: escAttr(`${SITE}/assets/img/hero/hero-garten-herne-1600.webp`),
    breadcrumbJsonLd: breadcrumb,
    logo: logo.trim(),
    header: fill(header, { base, leistungenSubmenu: renderNavSubmenu(base) }).trim(),
    footer: fill(footer, { base, leistungenFooter: renderFooterLeistungen(base) }).trim(),
    h1: esc(data.h1),
    body: bodyHtml, // vertrauenswürdiges HTML-Fragment, bewusst NICHT escaped
  });
}
