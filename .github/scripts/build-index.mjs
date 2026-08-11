#!/usr/bin/env node
// .github/scripts/build-index.mjs
//
// Liest alle Projektdateien aus content/projekte/*.json, validiert sie gegen
// content/taxonomie.json und schreibt den zusammengefassten, datum-absteigend
// sortierten Index nach data/projekte-index.json.
//
// - Validierungsfehler (fehlende Pflichtfelder, unbekannte leistungen-Slugs,
//   ungültige kundentyp-Werte, nicht existierende lokale Bildpfade) => exit 1
//   mit klarer Meldung. So kann der Kunde die Seite nicht kaputt speichern.
// - GPS-EXIF in lokalen Bildern => WARNUNG (DSGVO-Hinweis), kein harter Abbruch.
// - Remote-Bild-URLs (http/https) werden bei der Existenzprüfung übersprungen
//   und als "noch nicht lokalisiert" vermerkt.

import { readFile, readdir, writeFile, access, mkdir, rm } from 'node:fs/promises';
import { constants as FS } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderProjektPage, renderGalleryList } from './lib/render.mjs';
import { imageManifest } from './lib/images.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const CONTENT_DIR = path.join(REPO_ROOT, 'content', 'projekte');
const TAXONOMIE = path.join(REPO_ROOT, 'content', 'taxonomie.json');
const OUT_FILE = path.join(REPO_ROOT, 'data', 'projekte-index.json');

// AP-09: Sitemap im Root.
const SITE = 'https://rohdich.de';
const SITEMAP_FILE = path.join(REPO_ROOT, 'sitemap.xml');
// Ordner, die nie oeffentliche Seiten enthalten oder dauerhaft noindex sind.
const SITEMAP_SKIP_DIRS = new Set([
  '.git', '.github', '.claude', 'admin', 'node_modules',
  'assets', 'content', 'data', 'docs', 'scripts',
]);

// AP-15: Ziel-Ablage der statisch generierten Seiten.
const PROJEKTE_DIR = path.join(REPO_ROOT, 'projekte');
const GALLERY_INDEX = path.join(PROJEKTE_DIR, 'index.html');
const LEISTUNGEN_DIR = path.join(REPO_ROOT, 'leistungen');
const GEN_SENTINEL = 'AUTO-GENERIERT von .github/scripts/build-index.mjs aus content/projekte/';
const GAL_START = '<!-- BUILD:gallery-list:start -->';
const GAL_END = '<!-- BUILD:gallery-list:end -->';

const KUNDENTYPEN = ['privat', 'gewerbe'];

const errors = [];
const warnings = [];

// exifr ist optional: fehlt es (lokaler Lauf ohne npm install), wird der
// GPS-Check übersprungen statt den Build zu blockieren.
let exifr = null;
try {
  ({ default: exifr } = await import('exifr'));
} catch {
  warnings.push('Modul "exifr" nicht installiert – GPS-EXIF-Check wird übersprungen. (npm ci in .github/scripts)');
}

async function readJson(file) {
  const raw = await readFile(file, 'utf8');
  return JSON.parse(raw);
}

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function isValidDate(v) {
  if (!isNonEmptyString(v)) return false;
  const t = Date.parse(v);
  return !Number.isNaN(t);
}

async function fileExists(p) {
  try {
    await access(p, FS.R_OK);
    return true;
  } catch {
    return false;
  }
}

const isRemote = (p) => /^https?:\/\//i.test(String(p));

async function main() {
  // Taxonomie laden
  let validSlugs;
  let taxLabels; // slug → label (für die generierten Seiten, AP-15)
  try {
    const tax = await readJson(TAXONOMIE);
    if (!tax || !Array.isArray(tax.leistungen)) {
      throw new Error('taxonomie.json: Feld "leistungen" fehlt oder ist kein Array.');
    }
    validSlugs = new Set(tax.leistungen.map((l) => l.slug));
    taxLabels = new Map(tax.leistungen.map((l) => [l.slug, l.label]));
  } catch (err) {
    fail(`Taxonomie konnte nicht gelesen werden: ${err.message}`);
  }

  // Projektdateien einlesen
  let files;
  try {
    files = (await readdir(CONTENT_DIR)).filter((f) => f.endsWith('.json')).sort();
  } catch (err) {
    fail(`content/projekte konnte nicht gelesen werden: ${err.message}`);
  }

  if (!files.length) {
    fail('Keine Projektdateien in content/projekte/ gefunden.');
  }

  const projekte = [];

  for (const file of files) {
    const slug = file.replace(/\.json$/, '');
    const where = `content/projekte/${file}`;
    let data;
    try {
      data = await readJson(path.join(CONTENT_DIR, file));
    } catch (err) {
      errors.push(`${where}: ungültiges JSON – ${err.message}`);
      continue;
    }

    await validateProjekt(data, where, slug, validSlugs);
    projekte.push({ slug, ...data });
  }

  if (errors.length) {
    console.error('\n❌ Validierung fehlgeschlagen:\n');
    for (const e of errors) console.error(`  • ${e}`);
    if (warnings.length) {
      console.error('\n⚠️  Warnungen:');
      for (const w of warnings) console.error(`  • ${w}`);
    }
    console.error('\nIndex wurde NICHT geschrieben.\n');
    process.exit(1);
  }

  // Sortierung: datum absteigend (neueste zuerst)
  projekte.sort((a, b) => String(b.datum).localeCompare(String(a.datum)));

  // AP-25: Bild-Varianten aus dem Manifest an jedes bild haengen, damit die
  // JS-gerenderten Karten (projekte-card.js) ein <picture>/srcset bauen koennen.
  enrichBilder(projekte);

  const out = {
    _hinweis: 'AUTO-GENERIERT von .github/scripts/build-index.mjs – NICHT von Hand editieren.',
    projekte,
  };

  await mkdir(path.dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log(`✅ ${projekte.length} Projekte validiert und nach data/projekte-index.json geschrieben.`);

  // AP-15: statische Projektseiten + Galerie-Liste erzeugen (nur nach erfolgreicher Validierung).
  try {
    await generatePages(projekte, taxLabels);
  } catch (err) {
    fail(`Seiten-Generierung fehlgeschlagen: ${err.message}`);
  }

  // AP-09: sitemap.xml aus allen real existierenden Seiten erzeugen.
  try {
    await generateSitemap(projekte);
  } catch (err) {
    fail(`Sitemap-Generierung fehlgeschlagen: ${err.message}`);
  }

  if (warnings.length) {
    console.log('\n⚠️  Warnungen:');
    for (const w of warnings) console.log(`  • ${w}`);
  }
}

// AP-15: erzeugt /projekte/<slug>/index.html je Projekt, aktualisiert die statische
// Galerie-Liste in projekte/index.html und entfernt verwaiste generierte Ordner.
async function generatePages(projekte, taxLabels) {
  // CSS-/JS-Version aus der Galerie-Seite ziehen – eine Quelle, kein zweiter Truth.
  const galleryHtml = await readFile(GALLERY_INDEX, 'utf8');
  const cssVersion = (galleryHtml.match(/styles\.css\?v=([\w.-]+)/) || [])[1] || '1';
  const jsVersion = (galleryHtml.match(/main\.js\?v=([\w.-]+)/) || [])[1] || '1';

  // Welche Leistungsseiten existieren bereits? (AP-16 folgt → Rebuild hebt die Links.)
  const leistungPagesExist = new Set();
  for (const slug of taxLabels.keys()) {
    if (await fileExists(path.join(LEISTUNGEN_DIR, slug, 'index.html'))) {
      leistungPagesExist.add(slug);
    }
  }

  const slugs = new Set(projekte.map((p) => p.slug));

  // Detailseiten schreiben.
  const urls = [];
  for (const p of projekte) {
    const html = await renderProjektPage({
      project: p, slug: p.slug, taxLabels, cssVersion, jsVersion, leistungPagesExist,
    });
    const dir = path.join(PROJEKTE_DIR, p.slug);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.html'), html, 'utf8');
    urls.push(`/projekte/${p.slug}/`);
  }

  // Verwaiste generierte Ordner entfernen – nur solche mit unserem Sentinel.
  const entries = await readdir(PROJEKTE_DIR, { withFileTypes: true });
  for (const e of entries) {
    if (!e.isDirectory() || slugs.has(e.name)) continue;
    const idx = path.join(PROJEKTE_DIR, e.name, 'index.html');
    if (await fileExists(idx)) {
      const content = await readFile(idx, 'utf8');
      if (content.includes(GEN_SENTINEL)) {
        await rm(path.join(PROJEKTE_DIR, e.name), { recursive: true, force: true });
        console.log(`  – veraltete Projektseite entfernt: projekte/${e.name}/`);
      }
    }
  }

  // Statische Galerie-Liste zwischen den Markern ersetzen (idempotent).
  const si = galleryHtml.indexOf(GAL_START);
  const ei = galleryHtml.indexOf(GAL_END);
  if (si !== -1 && ei !== -1 && ei > si) {
    const before = galleryHtml.slice(0, si + GAL_START.length);
    const after = galleryHtml.slice(ei);
    const next = `${before}\n    ${renderGalleryList(projekte)}\n    ${after}`;
    if (next !== galleryHtml) {
      await writeFile(GALLERY_INDEX, next, 'utf8');
      console.log('✅ Statische Galerie-Liste in projekte/index.html aktualisiert.');
    }
  } else {
    warnings.push('projekte/index.html: BUILD:gallery-list-Marker nicht gefunden – statische Liste NICHT aktualisiert.');
  }

  console.log(`✅ ${urls.length} Projektseiten generiert:`);
  for (const u of urls) console.log(`   ${u}`);
}

// AP-09: erzeugt sitemap.xml aus allen real existierenden index.html im Repo.
//
// Bewusst On-Disk-Discovery statt Rekonstruktion aus taxonomie.json/content:
// die deployten Dateien sind die einzige Wahrheit darueber, welche URLs es gibt,
// und neue statische Seiten landen automatisch in der Sitemap.
//
// Demo-Phase: Solange die Vorschau laeuft, tragen alle Seiten ein Blanket-noindex
// (AP-01) und robots.txt sperrt alles. Die Sitemap listet trotzdem die Go-Live-URLs
// — sie ist fuer den Go-Live vorbereitet, das Blanket-noindex faellt dann weg.
// Dauerhaft-noindex (admin/) bleibt ueber SITEMAP_SKIP_DIRS ausgeschlossen.
async function generateSitemap(projekte) {
  const datumBySlug = new Map(projekte.map((p) => [p.slug, p.datum]));

  const dirs = await collectPageDirs(REPO_ROOT);

  const entries = [];
  for (const rel of dirs) {
    // rel = Repo-relativer Ordnerpfad mit '/'-Trennern; '' = Root-index.html.
    const loc = rel === '' ? `${SITE}/` : `${SITE}/${rel}/`;
    let lastmod;
    const m = rel.match(/^projekte\/([^/]+)$/);
    if (m && datumBySlug.has(m[1])) {
      lastmod = String(datumBySlug.get(m[1])).slice(0, 10); // W3C-Datum YYYY-MM-DD
    }
    entries.push({ loc, lastmod });
  }

  entries.sort((a, b) => a.loc.localeCompare(b.loc)); // stabile Diffs

  const body = entries
    .map(({ loc, lastmod }) => {
      const inner = lastmod
        ? `    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>`
        : `    <loc>${loc}</loc>`;
      return `  <url>\n${inner}\n  </url>`;
    })
    .join('\n');

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    `${body}\n` +
    '</urlset>\n';

  await writeFile(SITEMAP_FILE, xml, 'utf8');
  console.log(`✅ sitemap.xml mit ${entries.length} URLs geschrieben.`);
}

// Sammelt Repo-relative Ordnerpfade, die eine index.html enthalten ('' = Root).
// Versteckte Ordner (.*) und SITEMAP_SKIP_DIRS werden uebersprungen.
async function collectPageDirs(rootDir) {
  const found = [];
  async function walk(absDir, rel) {
    const entries = await readdir(absDir, { withFileTypes: true });
    if (entries.some((e) => e.isFile() && e.name === 'index.html')) {
      found.push(rel);
    }
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      if (e.name.startsWith('.') || SITEMAP_SKIP_DIRS.has(e.name)) continue;
      const childRel = rel === '' ? e.name : `${rel}/${e.name}`;
      await walk(path.join(absDir, e.name), childRel);
    }
  }
  await walk(rootDir, '');
  return found;
}

// AP-25: haengt Bild-Varianten (base + verfuegbare Breiten) aus dem Bild-Manifest
// an jedes bild, damit projekte-card.js daraus <picture>/srcset bauen kann.
// Fehlt das Manifest, bleibt alles beim einfachen <img> (kein harter Fehler).
//
// AP-77: webpWidths wird mitgeschrieben, wenn WebP weniger Breiten hat als AVIF –
// ohne das Feld baute die Karte ein srcset auf nicht existierende Dateien.
// Bilder ohne Varianten werden gemeldet: dort liefe die Karte auf das (u. U.
// mehrere hundert KB grosse) Original hinaus.
function enrichBilder(projekte) {
  const manifest = imageManifest();
  if (!Object.keys(manifest).length) {
    warnings.push('Bild-Manifest leer – Karten ohne srcset (build-images / build-hero-images ausführen).');
    return;
  }
  const ohne = [];
  for (const p of projekte) {
    if (!Array.isArray(p.bilder)) continue;
    for (const b of p.bilder) {
      const m = manifest[b.bild];
      if (!m) { ohne.push(`${p.slug}: ${b.bild}`); continue; }
      b.variants = {
        base: m.base,
        widths: m.widths,
        ...(Array.isArray(m.webpWidths) ? { webpWidths: m.webpWidths } : {}),
        w: m.width,
        h: m.height,
      };
    }
  }
  for (const o of ohne) {
    warnings.push(`ohne Bild-Varianten – Original wird ausgeliefert (${o}). In build-hero-images.mjs unter SOURCES ergänzen.`);
  }
}

async function validateProjekt(data, where, slug, validSlugs) {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    errors.push(`${where}: Wurzel muss ein Objekt sein.`);
    return;
  }

  if (!isNonEmptyString(data.titel)) errors.push(`${where}: Pflichtfeld "titel" fehlt oder ist leer.`);
  if (!isNonEmptyString(data.ort)) errors.push(`${where}: Pflichtfeld "ort" fehlt oder ist leer.`);
  if (!isNonEmptyString(data.beschreibung)) errors.push(`${where}: Pflichtfeld "beschreibung" fehlt oder ist leer.`);
  if (typeof data.featured !== 'boolean') errors.push(`${where}: Pflichtfeld "featured" muss true oder false sein.`);
  if (!isValidDate(data.datum)) errors.push(`${where}: Pflichtfeld "datum" fehlt oder ist kein gültiges Datum (erwartet z. B. "2026-05-01").`);

  // kundentyp: Array aus privat/gewerbe
  if (!Array.isArray(data.kundentyp) || data.kundentyp.length === 0) {
    errors.push(`${where}: "kundentyp" muss ein nicht-leeres Array sein (z. B. ["privat"]).`);
  } else {
    for (const k of data.kundentyp) {
      if (!KUNDENTYPEN.includes(k)) {
        errors.push(`${where}: unbekannter kundentyp "${k}" (erlaubt: ${KUNDENTYPEN.join(', ')}).`);
      }
    }
  }

  // leistungen: Array aus Taxonomie-Slugs
  if (!Array.isArray(data.leistungen) || data.leistungen.length === 0) {
    errors.push(`${where}: "leistungen" muss ein nicht-leeres Array sein.`);
  } else {
    for (const l of data.leistungen) {
      if (!validSlugs.has(l)) {
        errors.push(`${where}: unbekannter leistungen-Slug "${l}" – nicht in content/taxonomie.json definiert.`);
      }
    }
  }

  // bilder: Array aus {bild, alt}; erstes Bild = Cover
  if (!Array.isArray(data.bilder) || data.bilder.length === 0) {
    errors.push(`${where}: "bilder" muss ein nicht-leeres Array sein (erstes Bild = Cover).`);
    return;
  }

  for (let i = 0; i < data.bilder.length; i++) {
    const b = data.bilder[i];
    const at = `${where}: bilder[${i}]`;
    if (typeof b !== 'object' || b === null) {
      errors.push(`${at}: muss ein Objekt { "bild": …, "alt": … } sein.`);
      continue;
    }
    if (!isNonEmptyString(b.bild)) errors.push(`${at}: Feld "bild" fehlt oder ist leer.`);
    if (!isNonEmptyString(b.alt)) errors.push(`${at}: Feld "alt" fehlt oder ist leer (barrierefreier Alternativtext).`);

    if (isNonEmptyString(b.bild)) {
      if (isRemote(b.bild)) {
        warnings.push(`${at}: Remote-Bild-URL – noch nicht nach assets/img/projekte/ lokalisiert (${b.bild}).`);
      } else {
        const rel = String(b.bild).replace(/^\/+/, '');
        const abs = path.join(REPO_ROOT, rel);
        if (!(await fileExists(abs))) {
          errors.push(`${at}: Bilddatei existiert nicht: ${b.bild}`);
        } else {
          await checkGps(abs, at);
        }
      }
    }
  }
}

async function checkGps(absPath, at) {
  if (!exifr) return;
  try {
    const gps = await exifr.gps(absPath);
    if (gps && (gps.latitude != null || gps.longitude != null)) {
      warnings.push(`${at}: GPS-EXIF gefunden (${gps.latitude}, ${gps.longitude}) – bitte entfernen (DSGVO), z. B. neu als WebP speichern.`);
    }
  } catch {
    // EXIF nicht lesbar / kein unterstütztes Format – kein Fehler.
  }
}

function fail(msg) {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

await main();
