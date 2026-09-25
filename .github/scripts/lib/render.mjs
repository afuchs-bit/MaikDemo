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
    // AP-341: Eigene Ueberschrift fuers Dropdown. Bewusst nicht navLabel
    // ueberschrieben - das ist auch die Kennung der Welt im Build-Protokoll
    // (build-leistungen.mjs:277, "Für Privatkunden: 13 direkte Leistungsseiten
    // generiert"), und dort waere der A-Z-Satz schlicht falsch.
    navKopf: 'Unsere Leistungen von A bis Z',
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
    // AP-108: Reihenfolge = Kachel-Reihenfolge auf /gewerbekunden/.
    slugs: [
      'aussenanlagenpflege', 'umgestaltung-aussenanlagen', 'dachbegruenung',
      'baumkontrolle', 'baumarbeiten', 'sturmnotdienst', 'begutachtung',
    ],
    // AP-108: Gewerbe-eigene Nav-Labels. Fallback bleibt LEISTUNGEN_NAV
    // (z. B. Sturmnotdienst, Baumkontrolle, Baumarbeiten).
    navLabels: {
      'aussenanlagenpflege': 'Pflege & Instandhaltung',
      'umgestaltung-aussenanlagen': 'Umgestaltung & Außenanlagen',
      'dachbegruenung': 'Dach-, Fassaden- & Stellplatzbegrünung',
      'begutachtung': 'Fachliche Begutachtung',
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
  { slug: 'sturmnotdienst', label: 'Sturmnotdienst' },
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
  const block = (welt) => {
    // AP-341: navListe hat Vorrang - sie kann Mehrfachziele und eigene
    // Beschriftungen, was die slugs-Liste nicht kann. Ohne navListe bleibt
    // alles beim Alten (Gewerbe-Welt).
    const eintraege = welt.navListe || welt.slugs.map((slug) => ({ slug }));
    // AP-361: Ein Eintrag darf ein eigenes Ziel mitbringen. Ohne das liesse sich
    // nur "<welt>/leistungen/<slug>/" bilden - die A-Z-Liste der Startseite
    // enthaelt aber auch eine Leistung, die es nur in der Gewerbewelt gibt.
    // base wird in beiden Faellen vorangestellt, damit die Pfade auf den sechs
    // Handseiten stimmen (index.html und 404.html liegen an der Wurzel, die
    // uebrigen eine Ebene tiefer).
    const items = eintraege
      .map(({ slug, label, href, mobilOnly }) => {
        const ziel = href || `${welt.pfad}leistungen/${slug}/`;
        const klasse = mobilOnly ? ' class="nav-entry--mobile-only"' : '';
        return `<li${klasse}><a href="${base}${ziel}">${esc(label || welt.navLabels?.[slug] || labelBySlug.get(slug) || slug)}</a></li>`;
      })
      .join('\n              ');
    const kopfText = welt.navKopf || welt.navLabel;
    const kopf = welt.hubEntfaellt
      ? `<span class="nav-submenu-head">${esc(kopfText)}</span>`
      : `<a class="nav-submenu-head" href="${base}${welt.pfad}">${esc(kopfText)}</a>`;
    return `<li class="nav-submenu-group">
            ${kopf}
            <ul>
              ${items}
            </ul>
          </li>`;
  };
  // AP-342: Nur noch die Privatwelt im Dropdown. WELTEN.gewerbe bleibt
  // vollstaendig erhalten - der Eintrag steuert weiterhin die Seitengenerierung,
  // die Brotkrumen und weltPfadFuerSlug. Die sieben Gewerbe-Leistungsseiten sind
  // weiter verlinkt: Startseite, 404.html, /kontakt/, /ueber-uns/, /datenschutz/
  // sowie ueber den Menuepunkt "Gewerbekunden" in der obersten Ebene.
  return `<ul class="nav-submenu nav-submenu--welten" id="submenu-leistungen">
          ${block(WELTEN.privat)}
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
// Wer eine weitere Seite aufnimmt, traegt sie unten ein UND bindet dort
// footer-kontakt.css ein - ohne die Datei stehen beide Bausteine auf display:none.
//
// AP-385: Galerie und Kontakt sind auf demselben Weg dazugekommen. Beide laden
// footer-kontakt.css seit dem gleich nach styles.css; der Formular-Link zeigt von
// dort aus auf "../#anfrage", genau wie die Privatkunden-Kachel der Kontaktseite.
//
// Die Platzhalter stehen im Template ohne eigene Zeile, damit der Footer aller
// uebrigen Seiten zeichengleich bleibt.
const HANDY_FOOTER_SEITEN = new Set([
  'index.html', 'ueber-uns/index.html', 'projekte/index.html', 'kontakt/index.html',
]);

const istLeistungsseite = (pfad) =>
  /^(?:privatkunden|gewerbekunden)\/leistungen\/[^/]+\/index\.html$/.test(pfad);

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
            <span class="footer-social-icon footer-social-icon--whatsapp" aria-hidden="true"><img src="${base}assets/img/icons/whatsapp-glyph-white.svg" alt="" width="32" height="32" loading="lazy" decoding="async"></span>
          </a>
          <a class="footer-social-link footer-social-link--instagram" href="https://www.instagram.com/rohdich_garten_landschaftsbau/" target="_blank" rel="noopener noreferrer" aria-label="Maik Rohdich auf Instagram ansehen">
            <span class="footer-social-icon footer-social-icon--instagram" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.7" r="1" fill="currentColor" stroke="none"/></svg></span>
          </a>
        </div>`;

const STUNDEN_ZUSATZ_HANDY = '<span class="footer-hours-whatsapp">WhatsApp jederzeit <span aria-hidden="true">\u00b7</span> </span>Besuche nach Vereinbarung';
const STUNDEN_ZUSATZ = 'WhatsApp jederzeit <span aria-hidden="true">\u00b7</span> Besuche nach Vereinbarung';

export function footerTemplateData(base, seitenPfad = '') {
  // Nicht ueber base pruefen: 404.html liegt ebenfalls in der Wurzel und haette
  // die Bausteine sonst mitbekommen. Windows-Trennzeichen vorher angleichen.
  const pfad = seitenPfad.split('\\').join('/');
  const handy = HANDY_FOOTER_SEITEN.has(pfad) || istLeistungsseite(pfad);
  return {
    base,
    handyFormularLink: handy ? handyFormularLink(base) : '',
    handySocial: handy ? handySocial(base) : '',
    stundenZusatz: handy ? STUNDEN_ZUSATZ_HANDY : STUNDEN_ZUSATZ,
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

function lpVerlinkung(leistung, labelBySlug, base, welt, contactHref) {
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
    const items = (leistung.bilder?.gallery || []).map((bild) => {
      const focus = bild.fokusMobil || bild.fokusDesktop || '';
      const focusStyle = focus ? ` style="--gallery-focus-mobile:${escAttr(focus)}"` : '';
      return `<figure class="lpv2-gallery-grid-photo"${focusStyle}>
            ${renderPicture(bild.bild, { alt: bild.alt || '', sizes: '(max-width: 480px) calc((100vw - 52px) / 2), 220px', width: bild.width, height: bild.height, base })}
          </figure>`;
    }).join('\n          ');
    return `<section class="lpv2-gallery-grid-section section" aria-label="Einblicke in unsere Arbeit">
      <div class="container">
        <div class="lpv2-gallery-grid-window reveal" id="lpv2-gallery-grid" data-lpv2-gallery-window>
          <div class="lpv2-gallery-grid">${items}</div>
          <span class="lpv2-gallery-grid-fade" aria-hidden="true"></span>
        </div>
        <button class="lpv2-gallery-grid-more maik-cta maik-cta--compact maik-cta--gallery reveal" type="button" aria-expanded="false" aria-controls="lpv2-gallery-grid" aria-label="Alle Bilder anzeigen" data-lpv2-gallery-toggle data-label-collapsed="${escAttr(leistung.galleryCtaLabel || 'Mehr anzeigen')}" data-label-expanded="${escAttr(leistung.galleryCollapseLabel || 'Weniger')}">
          <svg class="maik-cta__frame" viewBox="0 0 360 64" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path vector-effect="non-scaling-stroke" d="M14 0H316Q322 0 328 3L352 13Q360 16 360 24V50Q360 64 346 64H14Q0 64 0 50V14Q0 0 14 0Z"/></svg>
          <svg class="maik-cta__shape" viewBox="0 0 360 64" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path vector-effect="non-scaling-stroke" d="M14 0H316Q322 0 328 3L352 13Q360 16 360 24V50Q360 64 346 64H14Q0 64 0 50V14Q0 0 14 0Z"/></svg>
          <span class="maik-cta__label" data-lpv2-gallery-toggle-label>${esc(leistung.galleryCtaLabel || 'Mehr anzeigen')}</span>
          <span class="maik-cta__arrow" aria-hidden="true"><span class="lpv2-gallery-grid-symbol"></span></span>
        </button>
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

function lpv2HomepageCta(label, base, extraClass = '', href = '#kontakt', attention = true) {
  const classes = [extraClass, 'maik-cta', attention ? 'maik-cta--attention' : '', 'reveal'].filter(Boolean).join(' ');
  return `<a class="${escAttr(classes)}" href="${escAttr(href)}">
          <svg class="maik-cta__halo" viewBox="0 0 360 64" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path class="maik-cta__halo-line--wide" d="M14 0H316Q322 0 328 3L352 13Q360 16 360 24V50Q360 64 346 64H14Q0 64 0 50V14Q0 0 14 0Z" vector-effect="non-scaling-stroke"/><path class="maik-cta__halo-line--medium" d="M14 0H316Q322 0 328 3L352 13Q360 16 360 24V50Q360 64 346 64H14Q0 64 0 50V14Q0 0 14 0Z" vector-effect="non-scaling-stroke"/><path class="maik-cta__halo-line--core" d="M14 0H316Q322 0 328 3L352 13Q360 16 360 24V50Q360 64 346 64H14Q0 64 0 50V14Q0 0 14 0Z" vector-effect="non-scaling-stroke"/></svg>
          <svg class="maik-cta__frame" viewBox="0 0 360 64" preserveAspectRatio="none" aria-hidden="true" focusable="false"><use href="#maik-cta-shape"/></svg>
          <svg class="maik-cta__shape" viewBox="0 0 360 64" preserveAspectRatio="none" aria-hidden="true" focusable="false"><use href="#maik-cta-shape"/></svg>
          <span class="maik-cta__label">${esc(label)}</span>
          <span class="maik-cta__arrow" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M5 12h14M13 6l6 6-6 6"/></svg><img class="maik-cta__arrow-image" src="${base}assets/img/icons/maik-rohdich-cta-pfeil-rechts.svg" alt="" width="1883" height="567" decoding="async"></span>
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
  return `<div class="lpv2-closing-block">
        <p class="lpv2-closing lpv2-closing-lines reveal">${copy}</p>
        ${lpv2HomepageCta(label, base, 'lpv2-closing-cta')}
      </div>`;
}

function lpv2ContentSection(leistung, base) {
  if (leistung.contentVariant !== 'editorial') return '';
  const [context = {}, service = {}] = leistung.inhalt || [];
  const intro = (leistung.mobileEinstieg || leistung.einstieg || []).map((paragraph) => `<p>${esc(paragraph)}</p>`).join('');
  const contextCopy = (context.mobileParagraphs || context.paragraphs || []).map((paragraph) => `<p>${esc(paragraph)}</p>`).join('');
  const serviceCopy = (service.mobileParagraphs || service.paragraphs || []).map((paragraph) => `<p>${esc(paragraph)}</p>`).join('');
  const listItems = (service.bullets || []).map((item) => `<li>${esc(item)}</li>`).join('');
  const serviceHeading = esc(service.heading || '');
  return `<section class="lpv2-content-feature section" aria-labelledby="lpv2-content-title">
      <div class="container">
        <article class="lpv2-content-editorial">
          <header class="lpv2-content-lead reveal"><h2 id="lpv2-content-title">${esc(leistung.unterzeile)}</h2><div class="lpv2-content-flow-copy lpv2-content-flow-copy--intro">${intro}</div></header>
          <div class="lpv2-content-context reveal">${contextCopy}</div>
          <section class="lpv2-content-service reveal"><h3>${serviceHeading}</h3><div class="lpv2-content-service-copy">${serviceCopy}</div><ul class="lpv2-list lpv2-content-list">${listItems}</ul></section>
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
  const confirmationCopy = homepageExact
    ? 'Ihre Angaben sind bei uns eingegangen. Wir sehen uns Ihr Vorhaben an und melden uns persönlich bei Ihnen, um die nächsten Schritte zu besprechen.'
    : 'Ihre Angaben sind bei uns eingegangen. Wir sehen uns Ihr Vorhaben an und melden uns persönlich bei Ihnen.';
  const confirmationExtras = homepageExact
    ? '<dl class="private-confirmation-summary" id="privateConfirmationSummary" aria-label="Zusammenfassung Ihrer Anfrage" hidden></dl>'
    : '';
  const confirmationNote = homepageExact
    ? '<p class="b2b-confirmation-note">Mit der Anfrage ist noch kein Auftrag und kein Vor-Ort-Termin zustande gekommen. Beides stimmen wir erst persönlich mit Ihnen ab.</p>'
    : '';
  const submitArtwork = homepageExact
    ? '<svg class="maik-cta__halo" viewBox="0 0 360 64" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path class="maik-cta__halo-line--wide" d="M14 0H316Q322 0 328 3L352 13Q360 16 360 24V50Q360 64 346 64H14Q0 64 0 50V14Q0 0 14 0Z" vector-effect="non-scaling-stroke"/><path class="maik-cta__halo-line--medium" d="M14 0H316Q322 0 328 3L352 13Q360 16 360 24V50Q360 64 346 64H14Q0 64 0 50V14Q0 0 14 0Z" vector-effect="non-scaling-stroke"/><path class="maik-cta__halo-line--core" d="M14 0H316Q322 0 328 3L352 13Q360 16 360 24V50Q360 64 346 64H14Q0 64 0 50V14Q0 0 14 0Z" vector-effect="non-scaling-stroke"/></svg><svg class="anf-senden__frame maik-cta__frame" viewBox="0 0 360 64" preserveAspectRatio="none" aria-hidden="true" focusable="false"><use href="#maik-cta-shape"/></svg><svg class="anf-senden__shape maik-cta__shape" viewBox="0 0 360 64" preserveAspectRatio="none" aria-hidden="true" focusable="false"><use href="#maik-cta-shape"/></svg>'
    : '<svg class="maik-cta__halo" viewBox="0 0 360 64" preserveAspectRatio="none" aria-hidden="true"><use href="#maik-cta-shape"/></svg><svg class="anf-senden__shape maik-cta__shape" viewBox="0 0 360 64" preserveAspectRatio="none" aria-hidden="true"><use href="#maik-cta-shape"/></svg>';
  return `<div class="private-contact-layout">
        <div class="b2b-form-column reveal">
          <section class="b2b-form-confirmation" id="anfrage-erfolg" tabindex="-1" aria-labelledby="anfrage-erfolg-title"><span class="b2b-confirmation-mark" aria-hidden="true">✓</span><span class="b2b-form-step">Anfrage übermittelt</span><h3 id="anfrage-erfolg-title">Vielen Dank für Ihre Anfrage.</h3><p>${confirmationCopy}</p>${confirmationExtras}<div class="b2b-confirmation-links"><a href="tel:+491711738943"><span>Dringende Ergänzungen telefonisch mitteilen</span><strong>0171 / 173 89 43</strong></a><a href="mailto:maik@rohdich.de?subject=Erg%C3%A4nzung%20zu%20meiner%20Gartenanfrage"><span>Weitere Fotos oder Unterlagen nachreichen</span><strong>maik@rohdich.de</strong></a></div>${confirmationNote}</section>
          <div class="anf">
            <form class="anf__form anf__karte" id="anfrage" data-anf-modus="kurz" data-anf-form data-endpoint="" novalidate>
              <div class="anf__honeypot" aria-hidden="true"><label for="anf-hp">Firmenwebsite (bitte frei lassen)</label><input type="text" id="anf-hp" name="_hp_website" tabindex="-1" autocomplete="off"></div>
              <input type="hidden" name="modus" value="kurz" data-anf-modus-feld><input type="hidden" name="geladen_um" value="" data-anf-zeitstempel><input class="anf__leistung" type="hidden" name="leistung" value="${escAttr(leistung.h1)}">
              <div class="anf__kanaele"><a class="anf__kanal" href="tel:+491711738943"><span class="anf__kanal-icon anf__kanal-icon--tel" aria-hidden="true"></span><span><small>Anrufen</small><strong>0171 / 173 89 43</strong></span></a><a class="anf__kanal" href="https://wa.me/491711738943?text=Hallo%20Herr%20Rohdich%2C%20ich%20habe%20eine%20Anfrage." target="_blank" rel="noopener"><span class="anf__kanal-icon anf__kanal-icon--wa" aria-hidden="true"></span><span><small>WhatsApp</small><strong>Fotos senden oder direkt anfragen</strong></span></a><a class="anf__kanal anf__kanal--mail" href="mailto:maik@rohdich.de?subject=Gartenanfrage"><span class="anf__kanal-icon anf__kanal-icon--mail" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg></span><span><small>E-Mail</small><strong>maik@rohdich.de</strong></span></a></div>
              <p class="anf__oder"><span>Anfrageformular hier absenden</span></p>
              <p class="anf__feld"><label for="anf-name">Wie möchten Sie angesprochen werden?</label><input type="text" id="anf-name" name="name" autocomplete="name" placeholder="Vor- und Nachname"></p>
              <p class="anf__feld"><label for="anf-kontakt">Wie erreichen wir Sie?</label><input type="text" id="anf-kontakt" name="kontakt" autocomplete="tel" placeholder="Telefonnummer oder E-Mail" inputmode="text"></p>
              <p class="anf__feld anf__feld--frei" id="anf-nachricht-feld"><label for="anf-nachricht">Worum geht es?</label><textarea id="anf-nachricht" name="nachricht" rows="4" placeholder="Eine kurze Beschreibung genügt — was ist zu tun, und wo?"></textarea></p>
              <p class="anf__feld anf__feld--foto" data-anf-foto-feld><label class="anf__foto"><input type="file" id="anf-fotos" name="fotos" accept="image/jpeg,image/png,image/webp,.heic,.heif" multiple data-anf-fotos><span class="anf__foto-kachel"><span class="anf__foto-plus" aria-hidden="true"></span><span class="anf__foto-wort">Foto auswählen</span></span></label><small class="anf__foto-stand" data-anf-foto-auswahl role="status" hidden></small></p>
              <p class="anf__einwilligung" data-anf-foto-freigabe hidden><label><input type="checkbox" name="foto_freigabe" value="1"><span>Ich darf diese Aufnahmen weitergeben. Personen, die nicht gefragt wurden, sind darauf nicht zu erkennen.</span></label></p>
              <div class="anf__abschluss"><button type="submit" class="btn btn-primary maik-cta maik-cta--attention" data-anf-senden>${submitArtwork}<span class="anf-senden__label maik-cta__label">Anfrage senden</span><span class="anf-senden__arrow maik-cta__arrow" aria-hidden="true"><img class="anf-senden__arrow-bild maik-cta__arrow-image" src="${base}assets/img/icons/maik-rohdich-cta-pfeil-rechts.svg" alt="" width="1883" height="567" decoding="async"></span></button><p class="anf__status" data-anf-status role="status" aria-live="polite"></p></div>
              <p class="anf__rechtliches">Wie wir Ihre Angaben verarbeiten, steht in der <a href="${base}datenschutz/">Datenschutzerklärung</a>.</p>
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
  const { leistung, slug, welt, cssVersion, jsVersion, refProjects = [], labelBySlug = new Map(), serviceIndex = new Map() } = opts;
  const seitenPfad = `${welt.pfad}leistungen/${slug}/index.html`;
  if (leistung.layout === 'editorial-v2') {
    const [page, header, footer, logo] = await Promise.all([
      loadTpl('leistung-v2.html'), loadTpl('_header.html'), loadTpl('_footer.html'), loadTpl('_logo.html'),
    ]);
    const base = welt.base;
    const canonical = `${SITE}/${welt.pfad}leistungen/${slug}/`;
    const hero = leistung.bilder.hero;
    const imageFirstHero = leistung.heroVariant === 'image-first';
    const heroTitleAbove = leistung.heroTitlePlacement === 'above-image';
    const heroTitleGraphic = leistung.heroTitleGraphic?.bild ? leistung.heroTitleGraphic : null;
    const splitHeroTitle = Array.isArray(leistung.heroTitleLines) && leistung.heroTitleLines.length === 2;
    const heroTitleHtml = splitHeroTitle
      ? leistung.heroTitleLines.map((line) => `<span>${esc(line)}</span>`).join('')
      : esc(leistung.h1);
    const hideProcess = leistung.hideProcess === true;
    const homepageContact = leistung.contactVariant === 'homepage';
    const processSection = hideProcess ? '' : `<section class="lpv2-process section" id="ablauf" aria-labelledby="lpv2-process-title">
      <div class="container">
        <header class="lpv2-section-head reveal">
          <p class="lpv2-section-index" aria-hidden="true">03</p>
          <h2 id="lpv2-process-title">In fünf Schritten zu Ihrem Projekt</h2>
        </header>
        ${lpv2Process(base)}
      </div>
    </section>`;
    const contactTitle = leistung.contactTitle || 'Der erste Schritt zu Ihrem Projekt';
    const contactSection = homepageContact
      ? `<section class="section private-contact lpv2-home-contact" id="kontakt" aria-labelledby="anfrage-title">
      <div class="container">
        <header class="private-contact-intro reveal">
          <h2 class="type-section-title maik-section-title" id="anfrage-title">${esc(contactTitle)}</h2>
        </header>
        ${lpv2Contact(leistung, base, true)}
      </div>
    </section>`
      : `<section class="lpv2-contact section private-contact" id="kontakt" aria-labelledby="anfrage-title">
      <div class="container">
        <header class="lpv2-section-head private-contact-intro reveal">
          <p class="lpv2-section-index" aria-hidden="true">${hideProcess ? '04' : '05'}</p>
          <h2 id="anfrage-title">${esc(contactTitle)}</h2>
        </header>
        ${lpv2Contact(leistung, base)}
      </div>
    </section>`;
    const heroBreadcrumbTrail = imageFirstHero
      ? `<li class="lpv2-breadcrumb-back"><a href="${welt.hubEntfaellt ? `${base}#leistungen` : `${base}${welt.pfad}`}"><img src="${base}assets/img/icons/maik-rohdich-cta-pfeil-rechts.svg" alt="" width="1883" height="567" aria-hidden="true" decoding="async"><span>Alle Leistungen</span></a></li>
        <li class="lpv2-breadcrumb-current" aria-current="page">${esc(leistung.h1)}</li>`
      : breadcrumbTrail(welt, base, leistung.h1);
    const heroBreadcrumb = `<nav class="breadcrumbs lpv2-breadcrumbs${imageFirstHero ? ' lpv2-breadcrumbs--bar' : ''} reveal" aria-label="Sie sind hier">
          <ol>${heroBreadcrumbTrail}</ol>
        </nav>`;
    return fill(page, {
      base, slug: esc(slug), cssVersion: escAttr(cssVersion), jsVersion: escAttr(jsVersion),
      themeColor: escAttr(leistung.themeColor || '#1b1e19'),
      mobileCssVersion: escAttr(leistung.mobileCssVersion || '20260924z6'),
      ctaFamilyVersion: escAttr(leistung.ctaFamilyVersion || '20260919a'),
      heroVariantClass: `${imageFirstHero ? ' lpv2-page--image-first' : ''}${heroTitleAbove ? ' lpv2-page--title-above' : ''}${heroTitleGraphic ? ' lpv2-page--title-graphic' : ''}`,
      pageVariantClass: `${leistung.relatedVariant === 'homepage' ? ' lpv2-page--homepage-unified' : ''}${leistung.contentVariant === 'editorial' ? ' lpv2-page--content-feature' : ''}`,
      title: esc(leistung.title), ogTitle: escAttr(leistung.title),
      description: escAttr(truncate(leistung.metaDescription, 160)), canonical: escAttr(canonical),
      ogImage: escAttr(absUrl(hero.bild)), heroPreload: lcpPreloadFor(hero.bild, heroTitleAbove ? '(max-width: 480px) calc(100vw - 64px), 100vw' : '100vw', base),
      breadcrumbJsonLd: leistungBreadcrumb(leistung.h1, canonical, welt),
      heroBreadcrumbBefore: imageFirstHero ? heroBreadcrumb : '',
      heroBreadcrumbInside: imageFirstHero ? '' : heroBreadcrumb,
      serviceJsonLd: serviceJsonLd(leistung, canonical), faqJsonLd: faqJsonLd(leistung.faq),
      logo: logo.trim(), header: fill(header, { base, leistungenSubmenu: renderNavSubmenu(base) }).trim(),
      footer: fill(footer, footerTemplateData(base, seitenPfad)).trim(),
      h1: heroTitleHtml, titleClass: `${splitHeroTitle ? ' lpv2-title--split' : ''}${heroTitleGraphic ? ' lpv2-title--visually-hidden' : ''}`,
      subheading: esc(leistung.unterzeile),
      introHtml: leistung.einstieg.map((p) => `<p>${esc(p)}</p>`).join(''),
      heroCta: lpv2Cta(leistung.ctaLabel, base),
      heroPicture: renderPicture(hero.bild, { alt: hero.alt || '', sizes: heroTitleAbove ? '(max-width: 480px) calc(100vw - 64px), 100vw' : '100vw', priority: true, width: hero.width, height: hero.height, base }),
      heroBrand: imageFirstHero
        ? `<img class="lpv2-hero-brand" src="${base}assets/img/logo/maik-rohdich-bluetengruppe-header-transparent.png" alt="" width="210" height="180" aria-hidden="true" decoding="async">`
        : '',
      heroEdge: imageFirstHero
        ? `<svg class="lpv2-hero-edge" viewBox="0 0 100 14" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path class="lpv2-hero-edge__fill" d="M0 1.5L100 12.5V14H0Z"/><path class="lpv2-hero-edge__line" d="M0 1.5L100 12.5" vector-effect="non-scaling-stroke"/></svg>`
        : '',
      heroTitleGraphic: heroTitleGraphic
        ? `<div class="lpv2-hero-title-graphic reveal" aria-hidden="true"><img src="${escAttr(`${base}${heroTitleGraphic.bild.replace(/^\/+/, '')}`)}" alt="" width="${Number(heroTitleGraphic.width) || 2172}" height="${Number(heroTitleGraphic.height) || 724}" decoding="async"></div>`
        : '',
      contentHtml: lpv2Content(leistung), closingHtml: lpv2Closing(leistung, base),
      mobileHeroCta: leistung.contentVariant === 'editorial'
        ? `<div class="lpv2-mobile-hero-cta">${lpv2HomepageCta(leistung.ctaLabel, base, 'lpv2-mobile-hero-cta__button')}</div>`
        : '',
      mobileContentSection: lpv2ContentSection(leistung, base), gallerySection: lpv2GallerySection(leistung, base),
      galleryGridScript: leistung.galleryVariant === 'grid-teaser'
        ? `<script src="${base}assets/js/leistung-gallery-grid.js?v=20260925a1" defer></script>\n`
        : '',
      processSection,
      faqVariantClass: leistung.faqVariant === 'homepage' ? ' lpv2-faq--homepage' : '',
      relatedVariantClass: leistung.relatedVariant === 'homepage' ? ' lpv2-related--homepage' : '',
      faqIndex: hideProcess ? '03' : '04',
      relatedIndex: hideProcess ? '05' : '06',
      faqHtml: lpFaq(leistung.faq || []), contactSection,
      relatedHtml: lpv2Related(leistung, serviceIndex, base, leistung.relatedVariant === 'homepage'),
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
    intro: esc(leistung.intro),
    fachtext: lpFachtext(leistung.fachtext),
    rechner: lpRechner(leistung.rechner, base),
    eignung: lpEignung(leistung.eignung || []),
    ablauf: lpAblauf(leistung.ablauf || []),
    aufwand: lpAufwand(leistung.aufwand || []),
    fehleinschaetzungen: lpMyths(leistung.fehleinschaetzungen || []),
    referenzprojekte: lpRefs(refProjects, base),
    faqHtml: lpFaq(leistung.faq || []),
    verlinkung: lpVerlinkung(leistung, labelBySlug, base, welt, contactHref),
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
