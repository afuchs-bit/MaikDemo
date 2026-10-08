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

const MOBILE_KEEP_WORDS = new Set([
  'am', 'an', 'auf', 'aus', 'bei', 'für', 'im', 'in', 'je', 'mit', 'nach',
  'so', 'um', 'und', 'von', 'vor', 'zu', 'zum', 'zur',
]);

function rangesOverlap(a, b) {
  return a.start < b.end && b.start < a.end;
}

// Mobile Textgruppen bleiben nur per CSS zusammen. Der sichtbare Text und die
// Desktop-Umbrueche bleiben dadurch unveraendert; Screenreader lesen weiterhin
// genau den Inhalt aus den Quelldaten.
function escMobileCopy(s, {
  minTailLength = 18,
  maxTailLength = 30,
  maxTailWords = 4,
  accentPhone = false,
} = {}) {
  const copy = String(s ?? '');
  const ranges = [];
  const words = [...copy.matchAll(/\S+/gu)].map((match) => ({
    start: match.index,
    end: match.index + match[0].length,
    value: match[0],
  }));

  for (const match of copy.matchAll(/(?:\+49|0)\d{2,4}(?:[ \u00a0./-]\d{2,}){2,}/gu)) {
    if (match[0].length <= 30) ranges.push({
      start: match.index,
      end: match.index + match[0].length,
      kind: accentPhone ? 'phone' : 'keep',
    });
  }

  const tailCandidates = [];
  for (let count = 2; count <= Math.min(maxTailWords, words.length); count += 1) {
    const startWord = words[words.length - count];
    const endWord = words[words.length - 1];
    const candidate = { start: startWord.start, end: endWord.end };
    const length = copy.slice(candidate.start, candidate.end).replace(/\s+/gu, ' ').length;
    if (length <= maxTailLength) tailCandidates.push({ ...candidate, length });
  }
  const tailTarget = (minTailLength + maxTailLength) / 2;
  const preferredTailCandidates = tailCandidates.filter((candidate) => candidate.length >= minTailLength);
  const tailRange = (preferredTailCandidates.length ? preferredTailCandidates : tailCandidates)
    .sort((a, b) => Math.abs(a.length - tailTarget) - Math.abs(b.length - tailTarget) || b.length - a.length)[0] || null;

  if (tailRange) {
    const overlaps = ranges.filter((range) => rangesOverlap(range, tailRange));
    const overlapsAccentedPhone = overlaps.some((range) => range.kind === 'phone');
    const merged = overlaps.reduce((range, current) => ({
      start: Math.min(range.start, current.start),
      end: Math.max(range.end, current.end),
    }), tailRange);
    if (overlapsAccentedPhone) {
      // Die hervorgehobene Telefonnummer bleibt eine eigene, präzise Spanne.
    } else if (copy.slice(merged.start, merged.end).replace(/\s+/gu, ' ').length <= maxTailLength + 4) {
      for (const overlap of overlaps) ranges.splice(ranges.indexOf(overlap), 1);
      ranges.push(merged);
    } else if (!overlaps.length) {
      ranges.push(tailRange);
    }
  }

  for (let index = 0; index < words.length - 1; index += 1) {
    const word = words[index].value.toLocaleLowerCase('de-DE').replace(/[^\p{L}]/gu, '');
    if (!MOBILE_KEEP_WORDS.has(word)) continue;
    const candidate = { start: words[index].start, end: words[index + 1].end };
    const length = copy.slice(candidate.start, candidate.end).replace(/\s+/gu, ' ').length;
    if (length <= 26 && !ranges.some((range) => rangesOverlap(range, candidate))) ranges.push(candidate);
  }

  if (!ranges.length) return esc(copy);
  ranges.sort((a, b) => a.start - b.start);
  let cursor = 0;
  const output = [];
  for (const range of ranges) {
    if (range.start < cursor) continue;
    output.push(esc(copy.slice(cursor, range.start)));
    const className = range.kind === 'phone'
      ? 'lpv2-mobile-keep lpv2-mobile-phone'
      : 'lpv2-mobile-keep';
    output.push(`<span class="${className}">${esc(copy.slice(range.start, range.end))}</span>`);
    cursor = range.end;
  }
  output.push(esc(copy.slice(cursor)));
  return output.join('');
}

function lpv2MobileParagraphs(source = [], override, naturalWrapIndexes = [], accentPhoneIndexes = []) {
  const paragraphs = Array.isArray(override) ? override : source;
  const naturalIndexes = new Set(Array.isArray(naturalWrapIndexes) ? naturalWrapIndexes : []);
  const phoneIndexes = new Set(Array.isArray(accentPhoneIndexes) ? accentPhoneIndexes : []);
  return paragraphs.map((paragraph, index) => `<p>${naturalIndexes.has(index)
    ? esc(paragraph)
    : escMobileCopy(paragraph, {
      minTailLength: 22,
      maxTailLength: 34,
      maxTailWords: 5,
      accentPhone: phoneIndexes.has(index),
    })}</p>`).join('');
}

function mobileTitleLengthClass(text, threshold, className) {
  return Array.from(String(text ?? '').trim()).length >= threshold ? ` ${className}` : '';
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
export function renderPicture(bild, { alt = '', sizes = '100vw', className = '', priority = false, width, height, base = '', objectPosition = '', desktopBild = '', desktopSizes = '460px', desktopMedia = '(min-width: 901px)' } = {}) {
  const m = imageManifest()[bild];
  // AP-565: zweites Motiv ab Desktop (Hochkant im Rahmenbild-Held). Eigene <source>-Zeilen
  // mit media-Attribut VOR den normalen Quellen; ohne Manifest-Eintrag entfaellt es still.
  const dm = desktopBild ? imageManifest()[desktopBild] : null;
  const cls = className ? ` class="${escAttr(className)}"` : '';
  const position = /^\d{1,3}% \d{1,3}%$/.test(objectPosition)
    ? ` style="object-position:${escAttr(objectPosition)}"` : '';
  const load = priority ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"';
  const rel = (p) => escAttr(relAsset(p, base));
  if (!m) {
    const wh = width && height ? ` width="${width}" height="${height}"` : '';
    return `<img${cls}${position} src="${rel(bild)}" alt="${escAttr(alt)}"${wh} ${load}>`;
  }
  const set = (ext, entry = m) => widthsFor(entry, ext).map((w) => `${rel(`${entry.base}-${w}.${ext}`)} ${w}w`).join(', ');
  const desktopSources = dm
    ? `<source media="${escAttr(desktopMedia)}" type="image/avif" sizes="${escAttr(desktopSizes)}" srcset="${set('avif', dm)}">
        <source media="${escAttr(desktopMedia)}" type="image/webp" sizes="${escAttr(desktopSizes)}" srcset="${set('webp', dm)}">
        `
    : '';
  return `<picture>
        ${desktopSources}<source type="image/avif" sizes="${escAttr(sizes)}" srcset="${set('avif')}">
        <source type="image/webp" sizes="${escAttr(sizes)}" srcset="${set('webp')}">
        <img${cls}${position} src="${rel(fallbackSrc(m))}" alt="${escAttr(alt)}" width="${width || m.width}" height="${height || m.height}" ${load}>
      </picture>`;
}

// Preload-Link fuer das LCP-Bild einer Seite (AVIF-srcset, relativ zur Seitentiefe).
function lcpPreloadFor(bild, sizes = '100vw', base = '', media = '') {
  const m = bild ? imageManifest()[bild] : null;
  const mediaAttr = media ? ` media="${escAttr(media)}"` : '';
  if (m) {
    const srcset = widthsFor(m, 'avif').map((w) => `${escAttr(relAsset(`${m.base}-${w}.avif`, base))} ${w}w`).join(', ');
    return `<link rel="preload" as="image" type="image/avif"${mediaAttr} imagesizes="${escAttr(sizes)}" imagesrcset="${srcset}" />`;
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
    // AP-F17: Ziel ist die Startseite, nicht privatkunden/ - der Hub ist seit AP-F8
    // geloescht. Dieselbe Regel wie in KUNDENGRUPPE_META.privat.href, die damals
    // bereits umgestellt wurde; diese Stelle war uebersehen worden und hat den
    // toten Link bei jedem Build neu erzeugt.
    out.push(`<li><a class="tag-link" href="${base}">Privatkunden</a></li>`);
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
  return `<section class="lp-block lp-fachtext reveal" aria-labelledby="lp-fachtext-title">
      <h2 class="type-subsection-title" id="lp-fachtext-title">${esc(f.titel)}</h2>${intro}
${bloecke}${hinweis}
    </section>`;
}

// AP-24 – optionaler Pool-Rechner (nur auf Seiten mit "rechner": true).
// Qualitative Einordnung OHNE Preise; Berechnung clientseitig (pool-rechner.js).
// AP-F18: War '20260725a' und haette bei jedem Build den Wert der ausgelieferten
// Seite zurueckgestuft. Der hoehere Wert stammt aus fc930cd "Safari-Cache mit neuen
// Asset-Versionen leeren" - dort wurde nur das HTML angefasst, nicht diese Konstante.
const POOL_RECHNER_VERSION = '20260812n';
function lpRechner(rechner, base) {
  if (!rechner) return '';
  const waDefault = 'https://wa.me/491711738943?text=' +
    encodeURIComponent('Hallo Herr Rohdich, ich interessiere mich für mein Pool- oder Whirlpool-Umfeld und würde das gern besprechen.');
  return `<section class="lp-block pool-rechner reveal" id="pool-rechner" aria-labelledby="pr-title">
      <h2 class="type-subsection-title" id="pr-title">Ihr Vorhaben grob einordnen</h2>
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
  return `<div class="projekt-text reveal">\n      ${blocks}\n    </div>`;
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
    footer: fill(footer, footerTemplateData(base)).trim(),
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
// AP-531: In der Galerie entfaellt das Etikett "Privatkunde" (Ansage des Auftraggebers,
// wie galerie.js mit opts.ohnePrivatEtikett); "Gewerbekunde" (cls 'warn') bleibt.
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
      return `      <article class="project-card reveal">
        <div class="project-media">
          ${pic}${b.cls ? `
          <span class="project-tag ${b.cls}">${esc(b.label)}</span>` : ''}
        </div>
        <div class="project-body">
          <span class="project-location">${esc(p.ort)}</span>
          <h3>${esc(p.titel)}</h3>
          <p>${esc(p.beschreibung)}</p>
          <span class="card-more" aria-hidden="true">Projekt ansehen →</span>
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

// Die beiden Leistungswelten. Einzige Quelle für Pfade, Labels und Zugehörigkeit.

export const WELTEN = {
  privat: {
    key: 'privat',
    pfad: 'privatkunden/',
    // Die Hubseite /privatkunden/ ist entfallen, ihre Inhalte stehen auf der
    // Startseite. Die Leistungsseiten bleiben unter /privatkunden/leistungen/.
    hubEntfaellt: true,
    weltLabel: 'Privatkunde',
    navLabel: 'Für Privatkunden',
    base: '../../../',        // /privatkunden/leistungen/<slug>/
    slugs: [
      'aussergewoehnliches-garten', 'balkonkastenbepflanzung', 'baumarbeiten',
      'baumkontrolle', 'baumpflege', 'beleuchtung', 'bonsai-formgehoelze',
      'dachbegruenung', 'entwaesserung', 'erd-baggerarbeiten',
      'ersatz-ausgleichspflanzungen', 'feuerstellen',
      'findlinge-natursteineinfassungen', 'gartengestaltung', 'gartenpflege',
      'holzverkauf', 'nassschneidearbeiten', 'palmen-winterfest', 'bepflanzung',
      'terrasse-pflasterarbeiten', 'pflasterreinigung-fugenreinigung',
      'pool-whirlpool-umfeld', 'rodungsarbeiten', 'rohdichs-grubengold',
      'rollrasen', 'saisonbepflanzung', 'schredderarbeiten',
      'sichtschutzbepflanzung', 'stubbenfraeseneinsatz', 'teichbau',
      'terrassenbau', 'verkehrssicherheit', 'vermessung-lasertechnik',
      'vorgarten', 'wurzelentfernung', 'zaeune-sichtschutz',
      // Nicht Teil der A–Z-Redaktion, bleibt als bestehende Sonderseite erhalten.
      'sturmnotdienst',
    ],
    // AP-341: Das Dropdown spiegelt die A-Z-Liste der Startseite
    // (index.html, Abschnitt #leistungen) zeichengleich - Reihenfolge, Wortlaut
    // und Ziele. Mehrere Themen zeigen deshalb auf dieselbe Seite:
    // gartengestaltung fuenfmal, terrasse-pflasterarbeiten viermal,
    // bepflanzung dreimal.
    //
    // Das kann `slugs` nicht abbilden: dieselbe Liste steuert, welche
    // Leistungsseiten gebaut werden - ein fuenffaches 'gartengestaltung' darin
    // wuerde fuenfmal dieselbe Seite erzeugen. Deshalb diese eigene Liste, die
    // NUR die Navigation fuellt.
    //
    // Die <wbr> der Startseiten-Kacheln sind hier nicht uebernommen: sie sind
    // ein Umbruchhinweis fuer die schmalen Kacheln, die Menuezeile ist breit
    // genug - und esc() gaebe sie ohnehin als Text aus.
    //
    // Wer hier etwas aendert, muss die Startseite mitziehen; die beiden Listen
    // sollen zeichengleich bleiben.
    navListe: [
      { slug: 'aussergewoehnliches-garten', label: 'Außergewöhnliches für den Garten', mobilOnly: true },
      { slug: 'balkonkastenbepflanzung', label: 'Balkonkastenbepflanzung', mobilOnly: true },
      { slug: 'baumarbeiten', label: 'Baumfällung' },
      { slug: 'baumkontrolle', label: 'Baumkontrolle' },
      { slug: 'baumpflege', label: 'Baumpflege' },
      { slug: 'beleuchtung', label: 'Beleuchtung' },
      { slug: 'bonsai-formgehoelze', label: 'Bonsai / Formgehölze', mobilOnly: true },
      { slug: 'dachbegruenung', label: 'Dachbegrünung' },
      { slug: 'entwaesserung', label: 'Entwässerung' },
      { slug: 'erd-baggerarbeiten', label: 'Erd- & Baggerarbeiten' },
      { slug: 'ersatz-ausgleichspflanzungen', label: 'Ersatz- & Ausgleichspflanzungen', mobilOnly: true },
      { slug: 'feuerstellen', label: 'Feuerstellen', mobilOnly: true },
      { slug: 'findlinge-natursteineinfassungen', label: 'Findlinge und Natursteineinfassungen' },
      { slug: 'gartengestaltung', label: 'Gartengestaltung' },
      { slug: 'gartenpflege', label: 'Gartenpflege' },
      { slug: 'holzverkauf', label: 'Kaminholz' },
      { slug: 'nassschneidearbeiten', label: 'Nassschneidearbeiten' },
      // Einziger Eintrag, der aus der Privatwelt herausfuehrt: die Leistung gibt
      // es nur als Gewerbeseite. Deshalb ein ausgeschriebenes Ziel statt eines
      // Slugs - siehe renderNavSubmenu weiter unten.
      { href: 'gewerbekunden/leistungen/aussenanlagenpflege/', label: 'Objekt- & Grünflächenpflege' },
      { slug: 'palmen-winterfest', label: 'Palmen winterfest' },
      { slug: 'bepflanzung', label: 'Pflanzarbeiten' },
      { slug: 'terrasse-pflasterarbeiten', label: 'Pflasterarbeiten' },
      { slug: 'pflasterreinigung-fugenreinigung', label: 'Pflasterreinigung / Fugenreinigung', mobilOnly: true },
      { slug: 'pool-whirlpool-umfeld', label: 'Pool- & Whirlpoolumfeld' },
      { slug: 'rodungsarbeiten', label: 'Rodungsarbeiten' },
      { slug: 'rohdichs-grubengold', label: 'Rohdichs Grubengold' },
      { slug: 'rollrasen', label: 'Rollrasen' },
      { slug: 'saisonbepflanzung', label: 'Saisonbepflanzung', mobilOnly: true },
      { slug: 'schredderarbeiten', label: 'Schredderarbeiten', mobilOnly: true },
      { slug: 'sichtschutzbepflanzung', label: 'Sichtschutzbepflanzung' },
      { slug: 'stubbenfraeseneinsatz', label: 'Stubbenfräseneinsatz', mobilOnly: true },
      { slug: 'teichbau', label: 'Teichbau & -technik' },
      { slug: 'terrassenbau', label: 'Terrassenbau' },
      { slug: 'verkehrssicherheit', label: 'Verkehrssicherheit herstellen' },
      { slug: 'vermessung-lasertechnik', label: 'Vermessungs- & Lasertechnik' },
      { slug: 'vorgarten', label: 'Vorgartengestaltung' },
      { slug: 'wurzelentfernung', label: 'Wurzelentfernung', mobilOnly: true },
      { slug: 'zaeune-sichtschutz', label: 'Zäune & Sichtschutz' },
    ],
  },
  gewerbe: {
    key: 'gewerbe',
    pfad: 'gewerbekunden/',
    weltLabel: 'Gewerbekunde',
    navLabel: 'Für Gewerbekunden',
    base: '../../../',
    // Aktuell veröffentlichte Gewerbeleistung.
    slugs: ['aussenanlagenpflege'],
    navLabels: {
      'aussenanlagenpflege': 'Pflege & Instandhaltung',
    },
  },
};

// AP-33: Standard-Welt für Links aus weltfremdem Kontext (Projektseiten).
// Slugs, die es nur in der Gewerbe-Welt gibt, zeigen dorthin – sonst liefe der Link ins Leere.
const NUR_GEWERBE = new Set(
  WELTEN.gewerbe.slugs.filter((s) => !WELTEN.privat.slugs.includes(s)),
);
export function weltPfadFuerSlug(slug) {
  return NUR_GEWERBE.has(slug) ? WELTEN.gewerbe.pfad : WELTEN.privat.pfad;
}

export const AREA_SERVED = ['Herne', 'Bochum', 'Essen', 'Castrop-Rauxel', 'Recklinghausen', 'Gelsenkirchen'];

const KUNDENGRUPPE_META = {
  privat: { href: '', label: 'Für Privatkunden' },   // Hub entfallen -> Startseite
  gewerbe: { href: 'gewerbekunden/', label: 'Für Gewerbekunden' },
};

// AP-18 – EINZIGE Quelle der Navigations-Leistungsliste im Header-Dropdown.
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
  { slug: 'sturmnotdienst', label: '24h Baum- & Sturmnotdienst' },
  { slug: 'holzverkauf', label: 'Brennholz & Stammholz' },
  // AP-360: Labels der vier neuen Seiten. Sie muessen mit navLabel in
  // content/leistungen/privat/<slug>.json uebereinstimmen - build-leistungen.mjs
  // warnt sonst bei jedem Lauf.
  { slug: 'nassschneidearbeiten', label: 'Nassschneidearbeiten' },
  { slug: 'rodungsarbeiten', label: 'Rodungsarbeiten' },
  { slug: 'verkehrssicherheit', label: 'Verkehrssicherheit' },
  { slug: 'vermessung-lasertechnik', label: 'Vermessungs- & Lasertechnik' },
];

// AP-33: Dropdown nach Welten getrennt. Der Besucher wählt beim Einstieg seine Welt
// und bleibt dann darin. Labels kommen weiterhin aus LEISTUNGEN_NAV.
export function renderNavSubmenu(base) {
  const labelBySlug = new Map(LEISTUNGEN_NAV.map((l) => [l.slug, l.label]));
  const welt = WELTEN.privat;
  const eintraege = welt.navListe || welt.slugs.map((slug) => ({ slug }));
  const gruppen = new Map();

  // Das Dropdown spiegelt die A-Z-Liste der Startseite. Der sichtbare
  // Anfangsbuchstabe wird aus dem fertigen Label gewonnen, sodass neue
  // Eintraege automatisch in derselben alphabetischen Gruppe landen.
  for (const { slug, label, href } of eintraege) {
    const text = label || welt.navLabels?.[slug] || labelBySlug.get(slug) || slug;
    const buchstabe = text.trim().charAt(0).toLocaleUpperCase('de-DE');
    const ziel = href || `${welt.pfad}leistungen/${slug}/`;
    if (!gruppen.has(buchstabe)) gruppen.set(buchstabe, []);
    gruppen.get(buchstabe).push(`<li><a href="${base}${ziel}">${esc(text)}</a></li>`);
  }

  const gruppenHtml = [...gruppen.entries()]
    .map(([buchstabe, items]) => `<li class="nav-letter-group">
            <img class="nav-letter-mark" src="${base}assets/img/icons/leistung-${buchstabe.toLocaleLowerCase('de-DE')}.png" alt="" aria-hidden="true" width="16" height="16" loading="lazy" />
            <ul aria-label="${esc(buchstabe)}">
              ${items.join('\n              ')}
            </ul>
          </li>`)
    .join('\n          ');

  return `<ul class="nav-submenu nav-submenu--welten" id="submenu-leistungen">
          ${gruppenHtml}
          </ul>`;
}

// Der Footer bleibt in allen Seitengeneratoren identisch.
// Bausteine, die nur die Handy-Ansicht bestimmter Seiten tragen.
//
// build-footers.mjs schreibt den Footer JEDER Seite aus templates/_footer.html neu.
// Wer einen Baustein von Hand in eine Seite schreibt, verliert ihn beim naechsten
// Action-Lauf - genau so verschwanden die mobilen Footer-Bausteine der Startseite
// im Commit 5932af2, der sich "Projekt-Index & Sitemap" nannte.
//
// AP-339: Bis dahin gab es die drei Bausteine ausschliesslich auf der Startseite.
// Zwei Gruende hielten sie dort, beide sind aufgeloest:
//   - der Formular-Link zeigt auf #anfrage, und dieses Ziel gibt es nur dort.
//     Er bekommt sein Praefix jetzt aus base; von /ueber-uns/ aus wird
//     "../#anfrage" daraus, auf der Startseite bleibt es zeichengleich "#anfrage".
//   - die Gestaltung stand in home-dark.css, die nur index.html laedt. Sie liegt
//     jetzt in assets/css/footer-kontakt.css.
// (Bis AP-515 musste eine weitere Seite in HANDY_FOOTER_SEITEN eingetragen werden;
// die Liste gibt es nicht mehr, siehe unten.)
//
// AP-385: Galerie und Kontakt sind auf demselben Weg dazugekommen. Beide laden
// footer-kontakt.css seit dem gleich nach styles.css; der Formular-Link zeigt von
// dort aus auf "../#anfrage", genau wie die Privatkunden-Kachel der Kontaktseite.
//
// AP-515 (30.09.2026): Die Bausteine gelten jetzt fuer JEDE Seite mit Footer. Bis
// hierher bekamen sie nur die Seiten aus HANDY_FOOTER_SEITEN und die
// Leistungsseiten; Impressum, Datenschutz, die Projektdetailseiten und 404.html
// zeigten auch auf dem Handy den alten Footer. Auf Ansage des Auftraggebers ist der
// Footer ueberall derselbe - die Liste und istLeistungsseite() sind entfallen.
// Jede Seite mit Footer muss deshalb footer-kontakt.css laden; ohne die Datei
// stehen Formular-Kachel und Social-Zeile auf display:none.
//
// Die Platzhalter stehen im Template ohne eigene Zeile, damit der Footer-Text
// zeichengleich zum bisherigen Handy-Footer bleibt.
const handyFormularLink = (base) => `
          <a class="footer-contact-link footer-contact-link--iphone-form" href="${base}#anfrage" aria-label="Kontaktformular öffnen und Kontakt aufnehmen">
            <span class="footer-contact-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h6M8 16h4"/></svg></span>
            <span><small>Kontaktformular</small><strong>Kontakt aufnehmen</strong></span>
          </a>`;

/* AP-395: Die Zeile hiess bis hierher "Jederzeit erreichbar - Auch an Feiertagen und
   Wochenenden". Auf der Kontaktseite steht keine 400 Pixel darueber "Sonntag
   geschlossen" (Mo-Fr 09:00-17:00, Sa 09:00-12:00) - beides zugleich sichtbar, und
   zwar genau unter 481px, wo diese Zeile die Oeffnungszeiten aus .footer-hours
   ersetzt. Der Widerspruch betraf jede Seite, nicht nur die Kontaktseite.

   "WhatsApp jederzeit" sagt dasselbe, ohne die Oeffnungszeiten zu bestreiten, und
   deckt sich mit content/stammdaten.json: WhatsApp ist rund um die Uhr fuer
   Nachrichten erreichbar, beantwortet wird zu den Geschaeftszeiten. Genau so steht
   es auch in der Kontaktkarte und in .footer-hours oberhalb 480px. */
const handySocial = (base) => `
        <div class="footer-social-iphone" aria-label="Weitere Kontaktmöglichkeiten">
          <p class="footer-social-availability"><span class="footer-social-line">WhatsApp jederzeit <span class="footer-social-dot">·</span> Auch an Feiertagen und</span> <span class="footer-social-line">Wochenenden <span class="footer-social-dot">·</span> Mustergarten nur nach Vereinbarung</span></p>
          <a class="footer-social-link footer-social-link--whatsapp" href="https://wa.me/491711738943?text=Hallo%20Herr%20Rohdich%2C%20ich%20habe%20eine%20Anfrage." target="_blank" rel="noopener" aria-label="Maik Rohdich über WhatsApp schreiben">
            <span class="footer-social-icon footer-social-icon--whatsapp maik-whatsapp-tile" aria-hidden="true"><img class="maik-whatsapp-glyph" src="${base}assets/img/icons/whatsapp-glyph-white.svg" alt="" width="32" height="32" decoding="async" aria-hidden="true"></span>
          </a>
          <a class="footer-social-link footer-social-link--instagram" href="https://www.instagram.com/rohdich_garten_landschaftsbau/" target="_blank" rel="noopener noreferrer" aria-label="Maik Rohdich auf Instagram ansehen">
            <span class="footer-social-icon footer-social-icon--instagram maik-instagram-tile" aria-hidden="true"><img class="maik-instagram-glyph" src="${base}assets/img/icons/instagram-glyph-white.svg" alt="" width="32" height="32" decoding="async" aria-hidden="true"></span>
          </a>
        </div>`;

// AP-515: stundenZusatz ist mit .footer-hours entfallen - die Oeffnungszeiten
// stehen auf Ansage des Auftraggebers nicht mehr im Footer (sie bleiben im JSON-LD).
// seitenPfad wird nicht mehr gebraucht; der Parameter bleibt, damit die Aufrufer
// unveraendert bleiben.
export function footerTemplateData(base, seitenPfad = '') { // eslint-disable-line no-unused-vars
  return {
    base,
    handyFormularLink: handyFormularLink(base),
    handySocial: handySocial(base),
  };
}

// AP-19 – Startseiten-FAQ aus content/faq-startseite.json.
// Sichtbare Liste UND FAQPage-Schema aus DERSELBEN Quelle → identischer Text.
//
// AP-F9: Die Fragen stehen in Gruppen mit Zwischentiteln, Aufbau und Klassen wie in
// der fruheren Privatkunden-FAQ (.private-faq-groups > .private-faq-group). Die
// Akkordeon-Animation in privat-form.js haengt an [data-private-faq-group].
//
// AP-94: Ab "sichtbareGruppen" wandert der Rest in einen Ausklapper. Bewusst ein
// verschachteltes <details> und kein JS: alle Fragen bleiben serverseitig im HTML
// und damit fuer Suchmaschinen wie fuer Antwortmaschinen lesbar - eingeklappter
// Inhalt wird indexiert, per Klick nachgeladener nicht. Das FAQPage-Schema unten
// listet unveraendert ALLE Fragen; es darf nichts enthalten, was nicht auf der
// Seite steht, und eingeklappt zaehlt als vorhanden.

const faqItem = (f) => `<details>
            <summary><span>${esc(f.frage)}</span><span class="chev" aria-hidden="true"></span></summary>
            <div class="faq-body"><p>${esc(f.antwort)}</p></div>
          </details>`;

const faqGruppe = (g) => {
  const titelId = `faq-gruppe-${g.id}-title`;
  return `<section class="private-faq-group" aria-labelledby="${titelId}">
        <h3 id="${titelId}">${esc(g.titel)}</h3>
        <div class="faq-list private-faq-list" data-private-faq-group>
          ${g.faq.map(faqItem).join('\n          ')}
        </div>
      </section>`;
};

const faqRaster = (gruppen) => `<div class="private-faq-groups reveal">
      ${gruppen.map(faqGruppe).join('\n      ')}
    </div>`;

export function renderFaqDetails(gruppen, sichtbareGruppen = gruppen.length) {
  const offen = gruppen.slice(0, sichtbareGruppen);
  const verdeckt = gruppen.slice(sichtbareGruppen);
  if (!verdeckt.length) return faqRaster(gruppen);

  const anzahl = verdeckt.reduce((n, g) => n + g.faq.length, 0);
  const label = anzahl === 1
    ? 'Eine weitere Frage anzeigen'
    : `Weitere ${anzahl} Fragen anzeigen`;

  return `${faqRaster(offen)}

    <details class="faq-more faq-more--gruppen">
      <summary>
        <span class="faq-more-open">${label}</span>
        <span class="faq-more-close">Weniger anzeigen</span>
        <span class="chev" aria-hidden="true"></span>
      </summary>
      ${faqRaster(verdeckt)}
    </details>`;
}

export function renderFaqSchema(gruppen) {
  const json = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: gruppen.flatMap((g) => g.faq).map((f) => ({
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

function lpFaq(arr, mobileCopy = false, gruppenTitel = '') {
  const renderQuestion = mobileCopy ? escMobileCopy : esc;
  const renderAnswer = mobileCopy
    ? (copy) => escMobileCopy(copy, { minTailLength: 28, maxTailLength: 44, maxTailWords: 6 })
    : esc;
  const items = arr.map((f) => `<details>
          <summary><span>${renderQuestion(f.frage)}</span><span class="chev" aria-hidden="true"></span></summary>
          <div class="faq-body"><p>${renderAnswer(f.antwort)}</p></div>
        </details>`).join('\n        ');
  // AP-584: Mit gruppenTitel wie eine Gruppe der Startseiten-FAQ (privat-form.css .private-faq-group):
  // Huelle + gruene Ueberschrift (Name der Leistung) + Haken fuer die Animation in privat-form.js.
  // Bis 900px loest sich die Huelle auf und die Ueberschrift ist aus (leistung-mobile.css).
  if (gruppenTitel) {
    return `<div class="lpv2-faq-gruppe">
        <h3 class="lpv2-faq-gruppe__titel">${esc(gruppenTitel)}</h3>
        <div class="faq-list" data-private-faq-group>
        ${items}
        </div>
      </div>`;
  }
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
            <span class="card-more" aria-hidden="true">Projekt ansehen →</span>
          </div>
          <a class="card-open" href="${href}" aria-label="${label}"></a>
        </article>`;
  }).join('\n        ');
  return `<div class="projects-grid lp-refs">
        ${cards}
      </div>`;
}

const PRIVATE_FORM_PREFILL = {
  gartengestaltung: ['garten', 'komplett'],
  vorgarten: ['vorgarten', 'komplett'],
  teichbau: ['wasser', 'teich_neu'],
  'terrasse-pflasterarbeiten': ['baulich', 'pflaster'],
  bepflanzung: ['bepflanzung_pflege', 'neupflanzung'],
  dachbegruenung: ['weitere', 'dach'],
  gartenpflege: ['bepflanzung_pflege', 'regelmaessig'],
  'palmen-winterfest': ['bepflanzung_pflege', 'palmen'],
  baumarbeiten: ['baeume', 'faellung'],
  baumkontrolle: ['baeume', 'verkehrssicherheit'],
  sturmnotdienst: ['sturmschaden', ''],
  holzverkauf: ['weitere', 'holz'],
  'pool-whirlpool-umfeld': ['wasser', 'poolumfeld'],
};

function leistungContactHref(slug, base, welt) {
  if (welt.key !== 'privat') return `${base}#kontakt`;
  const [path, service] = PRIVATE_FORM_PREFILL[slug] || ['unsicher', ''];
  const query = new URLSearchParams({ pfad: path });
  if (service) query.set('leistung', service);
  // AP-F17: Ziel ist die Startseite, nicht privatkunden/ - der Hub ist seit AP-F8
  // geloescht und das Anfrageformular steht dort. Die ausgelieferten Seiten trugen
  // das richtige Ziel bereits, diese Stelle haette es bei jedem Build wieder auf
  // den toten Hub zurueckgesetzt - 39 Links auf einen Schlag.
  return `${base}?${query.toString()}#anfrage`;
}

function lpVerlinkung(leistung, serviceIndex, base, welt, contactHref) {
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

  // Strukturierte Verweise unterstützen dieselben kuratierten Ergänzungen wie
  // editorial-v2 und erlauben dabei ausdrücklich begründete Weltwechsel.
  const nb = (leistung.related || []).map((ref) => {
    const target = serviceIndex.get(`${ref.welt}:${ref.slug}`);
    const targetWelt = WELTEN[ref.welt];
    if (!target || !targetWelt) return '';
    const label = target.navLabel || target.h1 || ref.slug;
    const href = `${base}${targetWelt.pfad}leistungen/${encodeURIComponent(ref.slug)}/`;
    return `<li><a class="tag-link" href="${escAttr(href)}">${esc(label)}</a></li>`;
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
            <li><a class="tag-link" href="${contactHref}">Kontakt aufnehmen</a></li>
          </ul>
        </div>`);

  return `<div class="lp-links">
        ${groups.join('\n        ')}
      </div>`;
}

// ---------- JSON-LD ----------
// Die Verteilerseite ist entfallen: Startseite, Kundenwelt und Detailleistung.
function leistungBreadcrumb(h1, canonical, welt) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Startseite', item: `${SITE}/` },
      ...(welt.hubEntfaellt
        ? []
        : [{ '@type': 'ListItem', position: 2, name: welt.weltLabel, item: `${SITE}/${welt.pfad}` }]),
      { '@type': 'ListItem', position: welt.hubEntfaellt ? 2 : 3, name: h1, item: canonical },
    ],
  }, null, 2);
}

// AP-33: sichtbare Breadcrumb-Kette (Template-Platzhalter {{breadcrumbTrail}}).
function breadcrumbTrail(welt, base, h1) {
  const mitte = welt.hubEntfaellt
    ? ''
    : `\n        <li><a href="${base}${welt.pfad}">${esc(welt.weltLabel)}</a></li>`;
  return `<li><a href="${base}">Startseite</a></li>${mitte}
        <li aria-current="page">${esc(h1)}</li>`;
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

// ---------- Editorial-v2: mobile Leistungsseiten ----------
function lpv2Cta(label, base, href = '#anfrage', extraClass = '') {
  const className = extraClass ? ` ${escAttr(extraClass)}` : '';
  return `<a class="lpv2-cta${className} reveal" href="${escAttr(href)}">
          <svg class="lpv2-cta__frame" viewBox="0 0 360 64" preserveAspectRatio="none" aria-hidden="true"><use href="#maik-cta-shape"/></svg>
          <svg class="lpv2-cta__shape" viewBox="0 0 360 64" preserveAspectRatio="none" aria-hidden="true"><use href="#maik-cta-shape"/></svg>
          <span class="lpv2-cta__label">${esc(label)}</span>
          <span class="lpv2-cta__arrow" aria-hidden="true"><img src="${base}assets/img/icons/maik-rohdich-cta-pfeil-rechts.svg" alt="" width="1883" height="567" decoding="async"></span>
        </a>`;
}

function lpv2DecisionTree() {
  return `<div class="lpv2-decision" aria-label="Entscheidungsweg der Baumkontrolle">
          <ol class="lpv2-decision-list">
            <li class="lpv2-decision-step"><span class="lpv2-decision-number">01</span><strong>Grunderfassung / Bestandsaufnahme</strong><span>Der Baum und sein Umfeld werden erstmals vollständig erfasst.</span></li>
            <li class="lpv2-decision-step"><span class="lpv2-decision-number">02</span><strong>Regelkontrolle</strong><span>Sichtprüfung in einem fachlich festgelegten Intervall von einem halben bis drei Jahren.</span></li>
            <li class="lpv2-decision-step"><span class="lpv2-decision-number">03</span><strong>Besteht Handlungsbedarf?</strong><span>Ohne Befund folgt die nächste Regelkontrolle. Bei Auffälligkeiten wird genauer untersucht.</span></li>
            <li class="lpv2-decision-step"><span class="lpv2-decision-number">04</span><strong>Eingehende Untersuchung</strong><span>Verdachtsmomente werden mit geeigneten fachlichen Verfahren geprüft.</span></li>
            <li class="lpv2-decision-step"><span class="lpv2-decision-number">05</span><strong>Erforderliche Maßnahme</strong><span>Die Untersuchung mündet in eine fachlich begründete Entscheidung.</span><span class="lpv2-decision-branches"><span class="lpv2-decision-branch">Baumpflege</span><span class="lpv2-decision-branch">Fällung</span></span></li>
          </ol>
        </div>`;
}

function lpv2DecisionGraphic(base) {
  return `<figure class="lpv2-decision-graphic">
          <img src="${base}assets/img/leistungen-mobile/baumkontrolle-ablaufdiagramm.png" alt="Ablauf der Baumkontrolle: Grunderfassung, Regelkontrolle, Prüfung auf Handlungsbedarf, eingehende Untersuchung sowie Baumpflege oder Fällung." width="1343" height="1171" loading="lazy" decoding="async">
        </figure>`;
}

function lpv2Content(leistung) {
  return (leistung.inhalt || []).map((block, index) => {
    const heading = block.heading ? `<h3>${esc(block.heading)}</h3>` : '';
    const paragraphs = (block.paragraphs || []).map((p) => `<p>${esc(p)}</p>`).join('\n          ');
    const bullets = (block.bullets || []).length
      ? `<ul class="lpv2-list">${block.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`
      : '';
    const diagram = leistung.diagram === 'baumkontrolle' && block.heading === 'Von der Kontrolle zur passenden Maßnahme'
      ? lpv2DecisionTree()
      : '';
    return `<section class="lpv2-copy-block reveal">${heading}${paragraphs}${bullets}${diagram}</section>`;
  }).join('\n        ');
}

function lpv2Gallery(leistung, base) {
  const items = (leistung.bilder?.gallery || []).map((bild, i) => `<figure class="lpv2-photo">
          ${renderPicture(bild.bild, { alt: bild.alt || '', sizes: '78vw', width: bild.width, height: bild.height, base })}
          <figcaption>${String(i + 1).padStart(2, '0')}</figcaption>
        </figure>`).join('\n        ');
  return `<div class="lpv2-photo-rail" role="region" aria-label="Bildergalerie, horizontal scrollbar" tabindex="0">${items}</div>`;
}

function lpv2GallerySection(leistung, base) {
  if (leistung.galleryVariant === 'grid-teaser') {
    const gallery = leistung.bilder?.gallery || [];
    const showAllWithoutToggle = gallery.length <= 4;
    const items = gallery.map((bild) => {
      const focus = bild.fokusMobil || bild.fokusDesktop || '';
      const focusStyle = focus ? ` style="--gallery-focus-mobile:${escAttr(focus)}"` : '';
      return `<figure class="lpv2-gallery-grid-photo"${focusStyle}>
            ${renderPicture(bild.bild, { alt: bild.alt || '', sizes: '(max-width: 480px) calc((100vw - 52px) / 2), 220px', width: bild.width, height: bild.height, base })}
          </figure>`;
    }).join('\n          ');
    const fade = showAllWithoutToggle ? '' : '\n          <span class="lpv2-gallery-grid-fade" aria-hidden="true"></span>';
    const toggle = showAllWithoutToggle ? '' : `\n        <button class="lpv2-gallery-grid-more maik-cta maik-cta--compact maik-cta--gallery reveal" type="button" aria-expanded="false" aria-controls="lpv2-gallery-grid" aria-label="Alle Bilder anzeigen" data-lpv2-gallery-toggle data-label-collapsed="${escAttr(leistung.galleryCtaLabel || 'Mehr anzeigen')}" data-label-expanded="${escAttr(leistung.galleryCollapseLabel || 'Weniger')}">
          <svg class="maik-cta__frame" viewBox="0 0 360 64" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path vector-effect="non-scaling-stroke" d="M14 0H316Q322 0 328 3L352 13Q360 16 360 24V50Q360 64 346 64H14Q0 64 0 50V14Q0 0 14 0Z"/></svg>
          <svg class="maik-cta__shape" viewBox="0 0 360 64" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path vector-effect="non-scaling-stroke" d="M14 0H316Q322 0 328 3L352 13Q360 16 360 24V50Q360 64 346 64H14Q0 64 0 50V14Q0 0 14 0Z"/></svg>
          <span class="maik-cta__label" data-lpv2-gallery-toggle-label>${esc(leistung.galleryCtaLabel || 'Mehr anzeigen')}</span>
          <span class="maik-cta__arrow" aria-hidden="true"><span class="lpv2-gallery-grid-symbol"></span></span>
        </button>`;
    const completeClass = showAllWithoutToggle ? ' lpv2-gallery-grid-window--complete' : '';
    return `<section class="lpv2-gallery-grid-section section" aria-label="Einblicke in unsere Arbeit">
      <div class="container">
        <div class="lpv2-gallery-grid-window${completeClass} reveal" id="lpv2-gallery-grid" data-lpv2-gallery-window>
          <div class="lpv2-gallery-grid">${items}</div>${fade}
        </div>${toggle}
      </div>
    </section>`;
  }
  return `<section class="lpv2-gallery section" aria-labelledby="lpv2-gallery-title">
      <div class="container lpv2-gallery-head">
        <header class="lpv2-section-head reveal">
          <p class="lpv2-section-index" aria-hidden="true">02</p>
          <h2 id="lpv2-gallery-title">Einblicke in unsere Arbeit</h2>
        </header>
        <p class="lpv2-gallery-hint">Seitlich wischen</p>
      </div>
      ${lpv2Gallery(leistung, base)}
    </section>`;
}

function lpv2MobileCtaLabelClass(label) {
  const length = Array.from(String(label || '').trim()).length;
  if (length <= 22) return 'maik-cta__label--large';
  if (length <= 31) return 'maik-cta__label--medium';
  return 'maik-cta__label--compact';
}

function lpv2HomepageCta(label, base, extraClass = '', href = '#kontakt', attention = true, labelClass = '', icon = 'arrow', attrs = '') {
  const classes = [extraClass, 'maik-cta', attention ? 'maik-cta--attention' : '', 'reveal'].filter(Boolean).join(' ');
  const labelClasses = ['maik-cta__label', labelClass].filter(Boolean).join(' ');
  const iconHtml = icon === 'phone'
    ? `<img class="maik-cta__phone-icon" src="${base}assets/img/icons/phone-header-mobile.png?v=20260902a" alt="" width="24" height="24" decoding="async">`
    : `<svg viewBox="0 0 24 24" focusable="false"><path d="M5 12h14M13 6l6 6-6 6"/></svg><img class="maik-cta__arrow-image" src="${base}assets/img/icons/maik-rohdich-cta-pfeil-rechts.svg" alt="" width="1883" height="567" decoding="async">`;
  return `<a class="${escAttr(classes)}" href="${escAttr(href)}"${attrs}>
          <svg class="maik-cta__halo" viewBox="0 0 360 64" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path class="maik-cta__halo-line--wide" d="M14 0H316Q322 0 328 3L352 13Q360 16 360 24V50Q360 64 346 64H14Q0 64 0 50V14Q0 0 14 0Z" vector-effect="non-scaling-stroke"/><path class="maik-cta__halo-line--medium" d="M14 0H316Q322 0 328 3L352 13Q360 16 360 24V50Q360 64 346 64H14Q0 64 0 50V14Q0 0 14 0Z" vector-effect="non-scaling-stroke"/><path class="maik-cta__halo-line--core" d="M14 0H316Q322 0 328 3L352 13Q360 16 360 24V50Q360 64 346 64H14Q0 64 0 50V14Q0 0 14 0Z" vector-effect="non-scaling-stroke"/></svg>
          <svg class="maik-cta__frame" viewBox="0 0 360 64" preserveAspectRatio="none" aria-hidden="true" focusable="false"><use href="#maik-cta-shape"/></svg>
          <svg class="maik-cta__shape" viewBox="0 0 360 64" preserveAspectRatio="none" aria-hidden="true" focusable="false"><use href="#maik-cta-shape"/></svg>
          <span class="${escAttr(labelClasses)}">${esc(label)}</span>
          <span class="maik-cta__arrow" aria-hidden="true">${iconHtml}</span>
        </a>`;
}

function lpv2Closing(leistung, base) {
  const text = esc(leistung.abschluss || '');
  if (leistung.closingVariant !== 'homepage-cta') {
    return `<p class="lpv2-closing reveal">${text}</p>`;
  }
  const configuredLines = Array.isArray(leistung.closingLines) ? leistung.closingLines.filter(Boolean) : [];
  const copy = configuredLines.length
    ? configuredLines.map((line) => `<span>${esc(line)}</span>`).join('\n          ')
    : text;
  const label = leistung.closingCtaLabel || 'Beratung vereinbaren';
  // AP-534: Am Rechner (Trichter-Layout) erscheinen Abschluss und Knopf erst bei 72 %
  // Fensterhoehe (data-reveal-late, main.js). Auf dem Handy wirkt das Attribut nicht.
  const late = leistung.desktopLayout === 'trichter' ? ' data-reveal-late' : '';
  return `<div class="lpv2-closing-block">
        <p class="lpv2-closing lpv2-closing-lines reveal"${late}>${copy}</p>
        ${lpv2HomepageCta(label, base, 'lpv2-closing-cta', leistung.ctaHref || '#kontakt', true, '', leistung.ctaIcon || 'arrow', late)}
      </div>`;
}

function lpv2ContentSection(leistung, base) {
  if (leistung.contentVariant !== 'editorial') return '';
  // AP-534: Trichter-Layout am Rechner - Listenpunkte und Hinweistext erscheinen einzeln
  // beim Scrollen. Nur diese Seiten tragen die Klasse reveal an den Punkten; die
  // Handy-Fassung neutralisiert sie (leistung-mobile.css, Block AP-534).
  const late = leistung.desktopLayout === 'trichter';
  const liAttrs = late ? ' class="reveal" data-reveal-late' : '';
  const copyAttrs = late ? ' reveal" data-reveal-late' : '"';
  // AP-566: leeres Element fuer die Trennlinie am Desktop (Fuellung + Lichtpunkt, CSS).
  const dividerHtml = late ? '<span class="lpv2-divider-fill" aria-hidden="true"></span>' : '';
  const intro = lpv2MobileParagraphs(leistung.einstieg || [], leistung.mobileEinstieg);
  const contentBlocks = (leistung.inhalt || []).map((block) => {
    const paragraphs = lpv2MobileParagraphs(
      block.paragraphs || [],
      block.mobileParagraphs,
      block.mobileNaturalWrapParagraphs,
      block.mobileAccentPhoneParagraphs,
    );
    const bullets = (block.bullets || []).map((item) => `<li${liAttrs}>${escMobileCopy(item)}</li>`).join('');
    const heading = block.heading ? `<h3>${esc(block.heading)}</h3>` : '';
    const list = bullets ? `<ul class="lpv2-list lpv2-content-list">${bullets}</ul>` : '';
    const copy = paragraphs ? `<div class="lpv2-content-service-copy${copyAttrs}>${paragraphs}</div>` : '';
    const diagram = leistung.diagram === 'baumkontrolle' && block.heading === 'Von der Kontrolle zur passenden Maßnahme'
      ? lpv2DecisionGraphic(base)
      : '';
    if (!heading) {
      return paragraphs ? `<div class="lpv2-content-context reveal">${paragraphs}</div>` : '';
    }
    const modifier = bullets ? '' : ' lpv2-content-service--no-list';
    return `<section class="lpv2-content-service${modifier} reveal">${heading}${list}${diagram}${copy}</section>`;
  }).join('');
  return `<section class="lpv2-content-feature section" aria-labelledby="lpv2-content-title">
      <div class="container">${dividerHtml}
        <article class="lpv2-content-editorial">
          <header class="lpv2-content-lead reveal"><h2 class="lpv2-content-title${mobileTitleLengthClass(leistung.unterzeile, 48, 'lpv2-content-title--long')}" id="lpv2-content-title">${esc(leistung.unterzeile)}</h2><div class="lpv2-content-flow-copy lpv2-content-flow-copy--intro">${intro}</div></header>
          ${contentBlocks}
        </article>
        <div class="lpv2-content-closing">${lpv2Closing(leistung, base)}</div>
      </div>
    </section>

`;
}

const LPV2_PROCESS = [
  ['termin-vor-ort-640.webp', 'maik-rohdich-schritt-1.png', '333', '589', 'Termin vor Ort', 'Wir lernen Ihr Grundstück und Ihre Vorstellungen in Ruhe kennen. Anschließend beraten wir Sie persönlich und erstellen ein präzises Aufmaß.', 'Firmenfahrzeug von Maik Rohdich an einem Kundengrundstück'],
  ['../../ueber/mustergarten-standbild-960.webp', 'maik-rohdich-schritt-2.png', '673', '589', 'Termin bei uns in der Ausstellung', 'Wir helfen Ihnen bei der Materialauswahl und klären Ihre Rückfragen.', 'Blick über den Mustergarten am Firmensitz'],
  ['kostenermittlung-640.webp', 'maik-rohdich-schritt-3.png', '577', '589', 'Ausarbeitung Individualangebot', 'Wir stellen Ihnen die passende Lösung vor.', 'Verschiedene Palmen und Pflanzgefäße als Auswahlmöglichkeiten'],
  ['umsetzung-koordination-640.webp', 'maik-rohdich-schritt-4.png', '591', '589', 'Auftragserteilung & Ausführung', 'Wir starten gemeinsam mit Ihnen.', 'Bagger setzt einen großen Naturstein in eine Gartenanlage'],
  ['pflege-640.webp', 'maik-rohdich-schritt-5.png', '681', '613', 'Erhaltungspflege', 'Erhaltungspflege nach Wunsch und Absprache.', 'Bewässerung eines gepflegten Rasens'],
];

function lpv2Process(base) {
  const cards = LPV2_PROCESS.map((s) => {
    const image = s[0].startsWith('../../') ? `${base}assets/img/${s[0].slice(6)}` : `${base}assets/img/projektablauf/${s[0]}`;
    return `<li class="lpv2-process-card reveal"><img class="lpv2-process-number" src="${base}assets/img/projektablauf/${s[1]}" alt="" aria-hidden="true" width="${s[2]}" height="${s[3]}" loading="lazy" decoding="async"><span class="lpv2-process-media"><img src="${image}" alt="${escAttr(s[6])}" width="640" height="480" loading="lazy" decoding="async"></span><span class="lpv2-process-body"><h3>${esc(s[4])}</h3><p>${esc(s[5])}</p></span></li>`;
  }).join('\n          ');
  return `<ol class="lpv2-process-list">${cards}</ol>${lpv2Cta('Projekt anfragen', base)}`;
}

function lpv2Contact(leistung, base, homepageExact = false) {
  const formCopy = leistung.contactForm && typeof leistung.contactForm === 'object'
    ? leistung.contactForm
    : {};
  const copy = (key, fallback) => typeof formCopy[key] === 'string' && formCopy[key].trim()
    ? formCopy[key].trim()
    : fallback;
  const confirmationCopy = copy('confirmationCopy', homepageExact
    ? 'Ihre Angaben sind bei uns eingegangen. Wir sehen uns Ihr Vorhaben an und melden uns persönlich bei Ihnen, um die nächsten Schritte zu besprechen.'
    : 'Ihre Angaben sind bei uns eingegangen. Wir sehen uns Ihr Vorhaben an und melden uns persönlich bei Ihnen.');
  const confirmationExtras = homepageExact
    ? '<dl class="private-confirmation-summary" id="privateConfirmationSummary" aria-label="Zusammenfassung Ihrer Anfrage" hidden></dl>'
    : '';
  const confirmationNoteText = copy('confirmationNote', homepageExact
    ? 'Mit der Anfrage ist noch kein Auftrag und kein Vor-Ort-Termin zustande gekommen. Beides stimmen wir erst persönlich mit Ihnen ab.'
    : '');
  const confirmationNote = confirmationNoteText
    ? `<p class="b2b-confirmation-note">${esc(confirmationNoteText)}</p>`
    : '';
  const confirmationStep = copy('confirmationStep', 'Anfrage übermittelt');
  const confirmationTitle = copy('confirmationTitle', 'Vielen Dank für Ihre Anfrage.');
  const phoneEyebrow = copy('phoneEyebrow', 'Anrufen');
  const whatsappAction = copy('whatsappAction', 'Fotos senden oder direkt anfragen');
  const whatsappMessage = copy('whatsappMessage', 'Hallo Herr Rohdich, ich habe eine Anfrage.');
  const emailSubject = copy('emailSubject', 'Gartenanfrage');
  const confirmationEmailSubject = copy('confirmationEmailSubject', 'Ergänzung zu meiner Gartenanfrage');
  const separator = copy('separator', 'Anfrageformular hier absenden');
  const nameLabel = copy('nameLabel', 'Wie möchten Sie angesprochen werden?');
  const namePlaceholder = copy('namePlaceholder', 'Vor- und Nachname');
  const contactLabel = copy('contactLabel', 'Wie erreichen wir Sie?');
  const contactPlaceholder = copy('contactPlaceholder', 'Telefonnummer oder E-Mail');
  const messageLabel = copy('messageLabel', 'Worum geht es?');
  const messagePlaceholder = copy('messagePlaceholder', 'Eine kurze Beschreibung genügt — was ist zu tun, und wo?');
  const photoLabel = copy('photoLabel', 'Foto auswählen');
  const submitLabel = copy('submitLabel', 'Anfrage senden');
  const unavailableIntro = copy('unavailableIntro', '');
  const unavailableTemplate = unavailableIntro
    ? `\n              <template data-anf-unavailable-copy>${esc(unavailableIntro)} telefonisch unter <a href="tel:+491711738943">0171 / 173 89 43</a> oder per <a href="https://wa.me/491711738943?text=${encodeURIComponent(whatsappMessage)}" target="_blank" rel="noopener">WhatsApp</a>.</template>`
    : '';
  const whatsappHref = `https://wa.me/491711738943?text=${encodeURIComponent(whatsappMessage)}`;
  const emailHref = `mailto:maik@rohdich.de?subject=${encodeURIComponent(emailSubject)}`;
  const confirmationEmailHref = `mailto:maik@rohdich.de?subject=${encodeURIComponent(confirmationEmailSubject)}`;
  const submitArtwork = homepageExact
    ? '<svg class="maik-cta__halo" viewBox="0 0 360 64" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path class="maik-cta__halo-line--wide" d="M14 0H316Q322 0 328 3L352 13Q360 16 360 24V50Q360 64 346 64H14Q0 64 0 50V14Q0 0 14 0Z" vector-effect="non-scaling-stroke"/><path class="maik-cta__halo-line--medium" d="M14 0H316Q322 0 328 3L352 13Q360 16 360 24V50Q360 64 346 64H14Q0 64 0 50V14Q0 0 14 0Z" vector-effect="non-scaling-stroke"/><path class="maik-cta__halo-line--core" d="M14 0H316Q322 0 328 3L352 13Q360 16 360 24V50Q360 64 346 64H14Q0 64 0 50V14Q0 0 14 0Z" vector-effect="non-scaling-stroke"/></svg><svg class="anf-senden__frame maik-cta__frame" viewBox="0 0 360 64" preserveAspectRatio="none" aria-hidden="true" focusable="false"><use href="#maik-cta-shape"/></svg><svg class="anf-senden__shape maik-cta__shape" viewBox="0 0 360 64" preserveAspectRatio="none" aria-hidden="true" focusable="false"><use href="#maik-cta-shape"/></svg>'
    : '<svg class="maik-cta__halo" viewBox="0 0 360 64" preserveAspectRatio="none" aria-hidden="true"><use href="#maik-cta-shape"/></svg><svg class="anf-senden__shape maik-cta__shape" viewBox="0 0 360 64" preserveAspectRatio="none" aria-hidden="true"><use href="#maik-cta-shape"/></svg>';
  return `<div class="private-contact-layout">
        <div class="b2b-form-column reveal">
          <section class="b2b-form-confirmation" id="anfrage-erfolg" tabindex="-1" aria-labelledby="anfrage-erfolg-title"><span class="b2b-confirmation-mark" aria-hidden="true">✓</span><span class="b2b-form-step">${esc(confirmationStep)}</span><h3 id="anfrage-erfolg-title">${esc(confirmationTitle)}</h3><p>${esc(confirmationCopy)}</p>${confirmationExtras}<div class="b2b-confirmation-links"><a href="tel:+491711738943"><span>Dringende Ergänzungen telefonisch mitteilen</span><strong>0171 / 173 89 43</strong></a><a href="${escAttr(confirmationEmailHref)}"><span>Weitere Fotos oder Unterlagen nachreichen</span><strong>maik@rohdich.de</strong></a></div>${confirmationNote}</section>
          <div class="anf">
            <form class="anf__form anf__karte" id="anfrage" data-anf-modus="kurz" data-anf-form data-endpoint="/api/anfrage" novalidate>
              <div class="anf__honeypot" aria-hidden="true"><label for="anf-hp">Firmenwebsite (bitte frei lassen)</label><input type="text" id="anf-hp" name="_hp_website" tabindex="-1" autocomplete="off"></div>
              <input type="hidden" name="modus" value="kurz" data-anf-modus-feld><input type="hidden" name="geladen_um" value="" data-anf-zeitstempel><input class="anf__leistung" type="hidden" name="leistung" value="${escAttr(leistung.h1)}">${unavailableTemplate}
              <div class="anf__kanaele"><a class="anf__kanal" href="tel:+491711738943"><span class="anf__kanal-icon anf__kanal-icon--tel" aria-hidden="true"></span><span><small>${esc(phoneEyebrow)}</small><strong>0171 / 173 89 43</strong></span></a><a class="anf__kanal" href="${escAttr(whatsappHref)}" target="_blank" rel="noopener"><span class="anf__kanal-icon anf__kanal-icon--wa maik-whatsapp-tile" aria-hidden="true"><img class="maik-whatsapp-glyph" src="${base}assets/img/icons/whatsapp-glyph-white.svg" alt="" width="32" height="32" decoding="async" aria-hidden="true"></span><span><small>WhatsApp</small><strong>${esc(whatsappAction)}</strong></span></a><a class="anf__kanal anf__kanal--mail" href="${escAttr(emailHref)}"><span class="anf__kanal-icon anf__kanal-icon--mail" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" focusable="false"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg></span><span><small>E-Mail</small><strong>maik@rohdich.de</strong></span></a></div>
              <!-- AP-568: Huellen wie im Kurzformular der Startseite (index.html, #anfrage).
                   Bis 900px loesen sie sich per display: contents auf (anfrage.css), ab 901px
                   tragen sie die Startseiten-Anordnung (AP-555). Beide Stellen gleich halten. -->
              <div class="anf__eingabe">
              <p class="anf__oder"><span>${esc(separator)}</span></p>
              <div class="anf__kontaktfelder">
              <p class="anf__feld"><label for="anf-name">${esc(nameLabel)}</label><input type="text" id="anf-name" name="name" required maxlength="120" autocomplete="name" placeholder="${escAttr(namePlaceholder)}"></p>
              <p class="anf__feld"><label for="anf-kontakt">${esc(contactLabel)}</label><input type="text" id="anf-kontakt" name="kontakt" required maxlength="160" autocomplete="tel" placeholder="${escAttr(contactPlaceholder)}" inputmode="text"></p>
              </div>
              <p class="anf__feld anf__feld--frei" id="anf-nachricht-feld"><label for="anf-nachricht">${esc(messageLabel)}</label><textarea id="anf-nachricht" name="nachricht" required maxlength="4000" rows="4" placeholder="${escAttr(messagePlaceholder)}"></textarea></p>
              <div class="anf__aktionen">
              <div class="anf__foto-gruppe">
              <p class="anf__feld anf__feld--foto" data-anf-foto-feld><label class="anf__foto"><input type="file" id="anf-fotos" name="fotos" accept="image/jpeg,image/png,image/webp,.heic,.heif" multiple data-anf-fotos><span class="anf__foto-kachel"><span class="anf__foto-plus" aria-hidden="true"></span><span class="anf__foto-wort">${esc(photoLabel)}</span></span></label><small class="anf__foto-stand" data-anf-foto-auswahl role="status" hidden></small></p>
              <p class="anf__einwilligung" data-anf-foto-freigabe hidden><label><input type="checkbox" name="foto_freigabe" value="1"><span>Ich darf diese Aufnahmen weitergeben. Personen, die nicht gefragt wurden, sind darauf nicht zu erkennen.</span></label></p>
              </div>
              <div class="anf__abschluss"><button type="submit" class="btn btn-primary maik-cta maik-cta--attention" data-anf-senden>${submitArtwork}<span class="anf-senden__label maik-cta__label">${esc(submitLabel)}</span><span class="anf-senden__arrow maik-cta__arrow" aria-hidden="true"><img class="anf-senden__arrow-bild maik-cta__arrow-image" src="${base}assets/img/icons/maik-rohdich-cta-pfeil-rechts.svg" alt="" width="1883" height="567" decoding="async"></span></button><p class="anf__status" data-anf-status role="status" aria-live="polite"></p></div>
              <p class="anf__rechtliches">Wie wir Ihre Angaben verarbeiten, steht in der <a href="${base}datenschutz/">Datenschutzerklärung</a>.</p>
              </div>
              </div>
            </form>
          </div>
        </div>
      </div>`;
}

function lpv2Related(leistung, serviceIndex, base, homepageExact = false) {
  const items = (leistung.related || []).map((ref) => {
    const target = serviceIndex.get(`${ref.welt}:${ref.slug}`);
    if (!target) return '';
    const welt = WELTEN[ref.welt];
    const href = `${base}${welt.pfad}leistungen/${encodeURIComponent(ref.slug)}/`;
    const thumb = target.thumbnail || target.bilder?.hero?.bild || '';
    if (homepageExact) {
      const pic = renderPicture(thumb, { alt: '', sizes: '88px', width: 88, height: 88, base });
      const initial = (ref.letter || target.h1.trim().charAt(0)).toLocaleLowerCase('de-DE');
      const subtitle = ref.subtitle ? `<small>${esc(ref.subtitle)}</small>` : '';
      return `<li class="iphone-service-row iphone-service-row--start"><a class="iphone-service-card" href="${escAttr(href)}" aria-label="${escAttr(`${target.h1} ansehen`)}"><span class="iphone-service-card__letter${subtitle ? ' iphone-service-card__letter--title-line' : ''}" aria-hidden="true"><img src="${base}assets/img/icons/leistung-${escAttr(initial)}.png" alt="" width="192" height="192" loading="lazy" decoding="async"></span><span class="iphone-service-card__title"><strong>${esc(ref.label || target.h1)}</strong>${subtitle}</span><span class="iphone-service-card__media" aria-hidden="true">${pic}</span></a></li>`;
    }
    const pic = renderPicture(thumb, { alt: '', sizes: '58px', width: 58, height: 58, base });
    return `<li class="lpv2-related-item"><a class="lpv2-related-link" href="${escAttr(href)}"><span class="lpv2-related-thumb" aria-hidden="true">${pic}</span><span class="lpv2-related-copy"><small>Leistung</small><strong>${esc(target.h1)}</strong></span><img class="lpv2-related-arrow" src="${base}assets/img/icons/maik-rohdich-cta-pfeil-rechts.svg" alt="" width="1883" height="567" loading="lazy" decoding="async"></a></li>`;
  }).join('');
  if (homepageExact) return `<ul class="iphone-service-grid lpv2-related-home-list" aria-label="Passende Leistungen">${items}</ul>`;
  return `<ul class="lpv2-related-list">${items}</ul>`;
}

function lpv2LegacyContent(leistung) {
  return (leistung.inhalt || []).map((block) => {
    const heading = block.heading ? `<h3>${esc(block.heading)}</h3>` : '';
    const paragraphs = (block.paragraphs || []).map((p) => `<p>${esc(p)}</p>`).join('');
    const bullets = (block.bullets || []).length ? `<ul class="lp-list">${block.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : '';
    return `${heading}${paragraphs}${bullets}`;
  }).join('');
}

// ---------- Leistungs-Detailseite ----------
export async function renderLeistungPage(opts) {
  const { leistung, slug, welt, cssVersion, jsVersion, refProjects = [], serviceIndex = new Map() } = opts;
  const seitenPfad = `${welt.pfad}leistungen/${slug}/index.html`;
  if (leistung.layout === 'editorial-v2') {
    const [page, header, footer, logo] = await Promise.all([
      loadTpl('leistung-v2.html'), loadTpl('_header.html'), loadTpl('_footer.html'), loadTpl('_logo.html'),
    ]);
    const base = welt.base;
    const canonical = `${SITE}/${welt.pfad}leistungen/${slug}/`;
    const mobileBalkonkasten = leistung.mobileVariant === 'balkonkasten';
    const presented = mobileBalkonkasten ? {
      ...leistung,
      hideProcess: true,
      contactVariant: 'homepage',
      galleryVariant: 'grid-teaser',
      faqVariant: 'homepage',
      relatedVariant: 'homepage',
      closingVariant: 'homepage-cta',
      contentVariant: 'editorial',
      closingCtaLabel: leistung.closingCtaLabel || 'JETZT ANFRAGEN',
      heroVariant: 'image-first',
      heroTitlePlacement: 'above-image',
      themeColor: leistung.themeColor || '#171916',
      // AP-586: Das Balkonkasten-Design am Desktop (Rahmenbild-Held AP-565, Textbereich
      // "Trichter" mit Blickfuehrung AP-566/567) gilt fuer alle Leistungsseiten. Eine Seite kann
      // per JSON abweichen, z. B. "desktopLayout": "spalte" (Baumkontrolle: drei Bloecke mit
      // Diagramm passen nicht ins Zwei-Spalten-Raster).
      desktopHero: leistung.desktopHero || 'rahmenbild',
      desktopLayout: leistung.desktopLayout || 'trichter',
      // Kompakter Held (Ansage 08.10.2026, zuerst Baumfaellung, dann alle): Foto mittig zwischen
      // Kopf und Fensterkante, Textbereich erst nach dem Scrollen. Abwahl per "desktopHeldKompakt": false.
      desktopHeldKompakt: leistung.desktopHeldKompakt !== false,
    } : leistung;
    const hero = presented.bilder.hero;
    const imageFirstHero = presented.heroVariant === 'image-first';
    const heroTitleAbove = presented.heroTitlePlacement === 'above-image';
    const heroTitleGraphic = presented.heroTitleGraphic?.bild ? presented.heroTitleGraphic : null;
    const splitHeroTitle = Array.isArray(presented.heroTitleLines)
      && presented.heroTitleLines.length >= 1
      && presented.heroTitleLines.length <= 3;
    // AP-586: titelTrennung (z. B. ["Nassschneide|arbeiten"]) setzt im Held-Titel ein weiches
    // Trennzeichen - es wirkt nur, wenn das Wort sonst nicht in die Zeile passt (am Desktop bei
    // 80px). Steht eine Titelzeile im h1 ohne Leerzeichen vor der naechsten, ist der Umbruch eine
    // Wortfuge ("Balkonkasten" / "bepflanzung"): Klasse lpv2-title-line--join, am Desktop mit
    // Bindestrich. "Zaeune &" / "Sichtschutz" oder "Bonsai /" bleiben ohne.
    const titelTrennung = (Array.isArray(presented.titelTrennung) ? presented.titelTrennung : [])
      .filter((t) => typeof t === 'string' && t.includes('|'));
    const softHyphen = (text) => titelTrennung.reduce((html, t) => html.split(esc(t.replace(/\|/g, ''))).join(esc(t).replace(/\|/g, '&shy;')), esc(text));
    const heroLines = splitHeroTitle ? presented.heroTitleLines : [];
    const heroTitleHtml = splitHeroTitle
      ? `<span class="lpv2-title-full">${esc(presented.h1)}</span><span class="lpv2-title-lines" aria-hidden="true">${heroLines.map((line, i) => `<span${heroLines[i + 1] && String(presented.h1).includes(`${line}${heroLines[i + 1]}`) ? ' class="lpv2-title-line--join"' : ''}>${softHyphen(line)}</span>`).join('')}</span>`
      : softHyphen(presented.h1);
    // AP-565: Rahmenbild-Held am Desktop (desktopHero "rahmenbild"). Schriftzug als Titel und
    // Hochkant-Motiv; unter 901px per CSS ausgeblendet. Herkunftszeile, Anruf-Knopf, Nachweise
    // und Karten-Reiter aus dem Entwurf hat der Auftraggeber gestrichen (06.10.2026).
    const rahmenbild = presented.desktopHero === 'rahmenbild';
    const heroGraphic = rahmenbild && presented.desktopHeroGraphic?.bild ? presented.desktopHeroGraphic : null;
    const assetPath = (p) => escAttr(`${base}${String(p).replace(/^\/+/, '')}`);
    const heroGraphicHtml = heroGraphic
      ? `<img class="lpv2-title-graphic-desktop" src="${assetPath(heroGraphic.bild)}"${heroGraphic.bild1x ? ` srcset="${assetPath(heroGraphic.bild1x)} 1x, ${assetPath(heroGraphic.bild)} 2x"` : ''} alt="" aria-hidden="true" width="${Number(heroGraphic.width) || 1400}" height="${Number(heroGraphic.height) || 508}" fetchpriority="high" decoding="async">`
      : '';
    const hideProcess = presented.hideProcess === true;
    const homepageContact = presented.contactVariant === 'homepage';
    const processSection = hideProcess ? '' : `<section class="lpv2-process section" id="ablauf" aria-labelledby="lpv2-process-title">
      <div class="container">
        <header class="lpv2-section-head reveal">
          <p class="lpv2-section-index" aria-hidden="true">03</p>
          <h2 id="lpv2-process-title">In fünf Schritten zu Ihrem Projekt</h2>
        </header>
        ${lpv2Process(base)}
      </div>
    </section>`;
    const contactTitle = presented.contactTitle || 'Der erste Schritt zu Ihrem Gartenprojekt';
    const contactIntro = presented.contactIntro
      ? `\n          <p class="lead">${esc(presented.contactIntro)}</p>`
      : '';
    const contactSection = homepageContact
      ? `<section class="section private-contact lpv2-home-contact" id="kontakt" aria-labelledby="anfrage-title">
      <div class="container">
        <header class="private-contact-intro reveal">
          <h2 class="type-section-title maik-section-title" id="anfrage-title">${esc(contactTitle)}</h2>${contactIntro}
        </header>
        ${lpv2Contact(presented, base, true)}
      </div>
    </section>`
      : `<section class="lpv2-contact section private-contact" id="kontakt" aria-labelledby="anfrage-title">
      <div class="container">
        <header class="lpv2-section-head private-contact-intro reveal">
          <p class="lpv2-section-index" aria-hidden="true">${hideProcess ? '04' : '05'}</p>
          <h2 id="anfrage-title">${esc(contactTitle)}</h2>${contactIntro}
        </header>
        ${lpv2Contact(presented, base)}
      </div>
    </section>`;
    const allServicesHref = mobileBalkonkasten || welt.hubEntfaellt
      ? `${base}#leistungen`
      : `${base}${welt.pfad}`;
    const heroBreadcrumbTrail = `<li class="lpv2-breadcrumb-back"><a href="${allServicesHref}"><img src="${base}assets/img/icons/maik-rohdich-cta-pfeil-rechts.svg" alt="" width="1883" height="567" aria-hidden="true" decoding="async"><span>Alle Leistungen</span></a></li>
        <li class="lpv2-breadcrumb-current" aria-current="page">${esc(presented.h1)}</li>`;
    const mobileHeroBreadcrumb = `<nav class="breadcrumbs lpv2-breadcrumbs lpv2-breadcrumbs--bar lpv2-breadcrumbs--mobile reveal" aria-label="Zur Leistungsübersicht">
          <ol>${heroBreadcrumbTrail}</ol>
        </nav>`;
    const desktopHeroBreadcrumb = `<nav class="breadcrumbs lpv2-breadcrumbs lpv2-breadcrumbs--desktop reveal" aria-label="Sie sind hier">
          <ol>${breadcrumbTrail(welt, base, presented.h1)}</ol>
        </nav>`;
    const standardHeroBreadcrumb = `<nav class="breadcrumbs lpv2-breadcrumbs${imageFirstHero ? ' lpv2-breadcrumbs--bar' : ''} reveal" aria-label="Sie sind hier">
          <ol>${imageFirstHero ? heroBreadcrumbTrail : breadcrumbTrail(welt, base, presented.h1)}</ol>
        </nav>`;
    // AP-581 Nachtrag: Ruecklink am Desktop ausserhalb der gezoomten Spalte, im Markup
    // und Satz der Galerie (.breadcrumbs--home-back). leistung-mobile.css zeigt ihn erst
    // ab 901px und blendet dort die Leiste im Held aus; bis 900px bleibt alles wie bisher.
    const desktopBackLink = `<div class="lpv2-ruecklink-desktop">
  <nav class="breadcrumbs breadcrumbs--home-back" aria-label="Zur Leistungsübersicht">
    <ol>
      <li class="breadcrumbs__back"><a href="${allServicesHref}"><img class="breadcrumbs__back-icon" src="${base}assets/img/icons/maik-rohdich-cta-pfeil-rechts.svg" alt="" width="1883" height="567" aria-hidden="true" decoding="async"><span>Alle Leistungen</span></a></li>
      <li class="breadcrumbs__current" aria-current="page">${esc(presented.h1)}</li>
    </ol>
  </nav>
</div>`;
    return fill(page, {
      base, slug: esc(slug), cssVersion: escAttr(cssVersion), jsVersion: escAttr(jsVersion),
      anfrageJsVersion: '20261004c',
      themeColor: escAttr(presented.themeColor || '#1b1e19'),
      mobileCssVersion: escAttr(cssVersion),
      ctaFamilyVersion: escAttr(presented.ctaFamilyVersion || '20260919a'),
      heroVariantClass: `${imageFirstHero ? ' lpv2-page--image-first' : ''}${heroTitleAbove ? ' lpv2-page--title-above' : ''}${heroTitleGraphic ? ' lpv2-page--title-graphic' : ''}`,
      pageVariantClass: `${presented.relatedVariant === 'homepage' ? ' lpv2-page--homepage-unified' : ''}${presented.contentVariant === 'editorial' ? ' lpv2-page--content-feature' : ''}${presented.desktopLayout === 'trichter' ? ' lpv2-page--desktop-trichter' : ''}${rahmenbild ? ' lpv2-page--desktop-rahmenbild' : ''}${rahmenbild && presented.desktopHeldKompakt === true ? ' lpv2-page--held-kompakt' : ''}`,
      title: esc(presented.title), ogTitle: escAttr(presented.title),
      description: escAttr(truncate(presented.metaDescription, 160)), canonical: escAttr(canonical),
      ogImage: escAttr(absUrl(hero.bild)), heroPreload: rahmenbild && presented.desktopHeroPortrait
        ? lcpPreloadFor(hero.bild, heroTitleAbove ? '(max-width: 480px) calc(100vw - 64px), 100vw' : '100vw', base, '(max-width: 900px)') + lcpPreloadFor(presented.desktopHeroPortrait, '460px', base, '(min-width: 901px)')
        : lcpPreloadFor(hero.bild, heroTitleAbove ? '(max-width: 480px) calc(100vw - 64px), 100vw' : '100vw', base),
      breadcrumbJsonLd: leistungBreadcrumb(presented.h1, canonical, welt),
      heroBreadcrumbBefore: mobileBalkonkasten ? mobileHeroBreadcrumb : imageFirstHero ? standardHeroBreadcrumb : '',
      heroBreadcrumbInside: mobileBalkonkasten ? desktopHeroBreadcrumb : imageFirstHero ? '' : standardHeroBreadcrumb,
      desktopBackLink: imageFirstHero ? desktopBackLink : '',
      serviceJsonLd: serviceJsonLd(presented, canonical), faqJsonLd: faqJsonLd(presented.faq),
      logo: logo.trim(), header: fill(header, { base, leistungenSubmenu: renderNavSubmenu(base) }).trim(),
      footer: fill(footer, footerTemplateData(base, seitenPfad)).trim(),
      h1: heroTitleHtml + heroGraphicHtml, titleAria: splitHeroTitle ? ` aria-label="${escAttr(presented.h1)}"` : '', titleClass: `${splitHeroTitle ? ' lpv2-title--split' : ''}${heroTitleGraphic ? ' lpv2-title--visually-hidden' : ''}`,
      subheading: esc(presented.unterzeile),
      introHtml: presented.einstieg.map((p) => `<p>${esc(p)}</p>`).join(''),
      heroCta: lpv2Cta(presented.ctaLabel, base, presented.ctaHref || '#anfrage'),
      heroPicture: renderPicture(hero.bild, { alt: hero.alt || '', sizes: heroTitleAbove ? '(max-width: 480px) calc(100vw - 64px), 100vw' : '100vw', priority: true, width: hero.width, height: hero.height, base, objectPosition: hero.objectPosition, desktopBild: rahmenbild ? presented.desktopHeroPortrait || '' : '' }),
      heroBrand: imageFirstHero
        ? `<img class="lpv2-hero-brand" src="${base}assets/img/logo/maik-rohdich-bluetengruppe-header-transparent.png" alt="" width="359" height="295" aria-hidden="true" decoding="async">`
        : '',
      heroEdge: imageFirstHero
        ? `<svg class="lpv2-hero-edge" viewBox="0 0 100 14" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path class="lpv2-hero-edge__fill" d="M0 1.5L100 12.5V14H0Z"/><path class="lpv2-hero-edge__line" d="M0 1.5L100 12.5" vector-effect="non-scaling-stroke"/></svg>`
        : '',
      heroTitleGraphic: heroTitleGraphic
        ? `<div class="lpv2-hero-title-graphic reveal" aria-hidden="true"><img src="${escAttr(`${base}${heroTitleGraphic.bild.replace(/^\/+/, '')}`)}" alt="" width="${Number(heroTitleGraphic.width) || 2172}" height="${Number(heroTitleGraphic.height) || 724}" decoding="async"></div>`
        : '',
      contentHtml: lpv2Content(presented), closingHtml: lpv2Closing(presented, base),
      mobileHeroCta: presented.contentVariant === 'editorial'
        ? `<div class="lpv2-mobile-hero-cta">${lpv2HomepageCta(presented.ctaLabel, base, 'lpv2-mobile-hero-cta__button', presented.ctaHref || '#kontakt', true, lpv2MobileCtaLabelClass(presented.ctaLabel), presented.ctaIcon || 'arrow')}</div>`
        : '',
      mobileContentSection: lpv2ContentSection(presented, base), gallerySection: lpv2GallerySection(presented, base),
      galleryGridScript: presented.galleryVariant === 'grid-teaser'
        ? `<script src="${base}assets/js/leistung-gallery-grid.js?v=20260930a" defer></script>\n`
        : '',
      processSection,
      faqVariantClass: presented.faqVariant === 'homepage' ? ' lpv2-faq--homepage' : '',
      relatedVariantClass: presented.relatedVariant === 'homepage' ? ' lpv2-related--homepage' : '',
      faqIndex: hideProcess ? '03' : '04',
      relatedIndex: hideProcess ? '05' : '06',
      faqHtml: lpFaq(presented.faq || [], mobileBalkonkasten, presented.h1), contactSection,
      relatedHtml: lpv2Related(presented, serviceIndex, base, presented.relatedVariant === 'homepage'),
      relatedAllServices: mobileBalkonkasten
        ? `<div class="lpv2-breadcrumb-back lpv2-related-all reveal"><a href="${escAttr(allServicesHref)}"><span>Alle Leistungen</span><img src="${base}assets/img/icons/maik-rohdich-cta-pfeil-rechts.svg" alt="" width="1883" height="567" aria-hidden="true" loading="lazy" decoding="async"></a></div>`
        : '',
    });
  }
  if (leistung.layout === 'legacy-document') {
    const [page, header, footer, logo] = await Promise.all([
      loadTpl('leistung-legacy-document.html'), loadTpl('_header.html'), loadTpl('_footer.html'), loadTpl('_logo.html'),
    ]);
    const base = welt.base;
    const canonical = `${SITE}/${welt.pfad}leistungen/${slug}/`;
    const contactHref = `${base}#anfrage`;
    return fill(page, {
      base, slug: esc(slug), cssVersion: escAttr(cssVersion), jsVersion: escAttr(jsVersion),
      title: esc(leistung.title), ogTitle: escAttr(leistung.title), description: escAttr(truncate(leistung.metaDescription, 160)),
      canonical: escAttr(canonical), ogImage: escAttr(absUrl(leistung.bilder?.hero?.bild || 'assets/img/hero/hero-garten-herne-1600.webp')),
      breadcrumbJsonLd: leistungBreadcrumb(leistung.h1, canonical, welt), breadcrumbTrail: breadcrumbTrail(welt, base, leistung.h1),
      serviceJsonLd: serviceJsonLd(leistung, canonical), faqJsonLd: faqJsonLd(leistung.faq),
      logo: logo.trim(), header: fill(header, { base, leistungenSubmenu: renderNavSubmenu(base) }).trim(), footer: fill(footer, footerTemplateData(base, seitenPfad)).trim(),
      h1: esc(leistung.h1), subheading: esc(leistung.unterzeile), introHtml: leistung.einstieg.map((p) => `<p>${esc(p)}</p>`).join(''),
      contactHref: escAttr(contactHref), ctaLabel: esc(leistung.ctaLabel), contentHtml: lpv2LegacyContent(leistung),
      faqHtml: lpFaq(leistung.faq || []), closing: esc(leistung.abschluss),
    });
  }
  const [page, header, footer, logo] = await Promise.all([
    loadTpl('leistung.html'), loadTpl('_header.html'), loadTpl('_footer.html'), loadTpl('_logo.html'),
  ]);
  const base = welt.base;
  const canonical = `${SITE}/${welt.pfad}leistungen/${slug}/`;
  const contactHref = leistungContactHref(slug, base, welt);
  const ogImage = refProjects[0]?.cover?.bild ? absUrl(refProjects[0].cover.bild) : `${SITE}/assets/img/hero/hero-garten-herne-1600.webp`;

  return fill(page, {
    base,
    slug: esc(slug),
    cssVersion: escAttr(cssVersion),
    jsVersion: escAttr(jsVersion),
    ctaFamilyVersion: '20260926b',
    mobileCssVersion: escAttr(cssVersion),
    title: esc(leistung.title),
    ogTitle: escAttr(leistung.title),
    description: escAttr(truncate(leistung.metaDescription, 160)),
    canonical: escAttr(canonical),
    ogImage: escAttr(ogImage),
    breadcrumbJsonLd: leistungBreadcrumb(leistung.h1, canonical, welt),
    breadcrumbTrail: breadcrumbTrail(welt, base, leistung.h1),
    weltHref: welt.hubEntfaellt ? `${base}#leistungen` : `${base}${welt.pfad}`,
    weltCtaLabel: welt.key === 'privat' ? 'Zu den Leistungen für Privatkunden' : 'Zum Gewerbekundenbereich',
    contactHref: escAttr(contactHref),
    serviceJsonLd: serviceJsonLd(leistung, canonical),
    faqJsonLd: faqJsonLd(leistung.faq),
    logo: logo.trim(),
    header: fill(header, { base, leistungenSubmenu: renderNavSubmenu(base) }).trim(),
    footer: fill(footer, footerTemplateData(base, seitenPfad)).trim(),
    h1: esc(leistung.h1),
    titleClass: mobileTitleLengthClass(leistung.h1, 50, 'lp-service-title--long'),
    intro: esc(leistung.intro),
    fachtext: lpFachtext(leistung.fachtext),
    rechner: lpRechner(leistung.rechner, base),
    eignung: lpEignung(leistung.eignung || []),
    ablauf: lpAblauf(leistung.ablauf || []),
    aufwand: lpAufwand(leistung.aufwand || []),
    fehleinschaetzungen: lpMyths(leistung.fehleinschaetzungen || []),
    referenzprojekte: lpRefs(refProjects, base),
    faqHtml: lpFaq(leistung.faq || []),
    verlinkung: lpVerlinkung(leistung, serviceIndex, base, welt, contactHref),
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
    footer: fill(footer, footerTemplateData(base)).trim(),
    h1: esc(data.h1),
    body: bodyHtml, // vertrauenswürdiges HTML-Fragment, bewusst NICHT escaped
  });
}
