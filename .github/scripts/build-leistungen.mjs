#!/usr/bin/env node
// .github/scripts/build-leistungen.mjs  (AP-16)
//
// Erzeugt die statischen Leistungsseiten aus content/leistungen/*.json:
//   /leistungen/<slug>/index.html   – je Leistung
//   /leistungen/index.html          – Übersicht aller Leistungen
//
// - Validiert jede Datei gegen content/taxonomie.json (Slug muss existieren) und
//   auf Pflichtfelder. Fehler => exit 1, es wird nichts geschrieben.
// - Referenzprojekte werden AUTOMATISCH aus content/projekte/*.json ermittelt
//   (Projekte, deren leistungen den Slug enthalten). Ohne Treffer: die neuesten
//   Projekte als allgemeine Beispiele. So bleibt "mindestens ein Referenzprojekt"
//   wahr, ohne etwas zu erfinden.
// - Verwaiste generierte Ordner (Sentinel im Kopf) werden entfernt.
//
// Inhalt = Daten (content/leistungen), Struktur = Template (.github/scripts/templates),
// Chrome geteilt mit den Projektseiten. Kein CMS – dev-gepflegt, danach committen.

import { readFile, readdir, writeFile, mkdir, rm, access } from 'node:fs/promises';
import { constants as FS } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderLeistungPage, renderLeistungenOverview, renderNavSubmenu, renderFooterLeistungen, LEISTUNGEN_NAV } from './lib/render.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const CONTENT_DIR = path.join(REPO_ROOT, 'content', 'leistungen');
const PROJEKTE_DIR = path.join(REPO_ROOT, 'content', 'projekte');
const TAXONOMIE = path.join(REPO_ROOT, 'content', 'taxonomie.json');
const OUT_DIR = path.join(REPO_ROOT, 'leistungen');
const INDEX_HTML = path.join(REPO_ROOT, 'index.html');
const GEN_SENTINEL = 'AUTO-GENERIERT von .github/scripts/build-leistungen.mjs';

// Anzeige-Reihenfolge der Übersicht (fachliche Priorität, nicht alphabetisch).
const ORDER = [
  'baumkontrolle', 'baumarbeiten', 'gartengestaltung', 'vorgarten', 'teichbau',
  'gartenpflege', 'aussenanlagenpflege', 'terrasse-pflasterarbeiten', 'bepflanzung',
  'dachbegruenung', 'palmen-winterfest', 'pool-whirlpool-umfeld', 'sturmnotdienst', 'holzverkauf',
];

const KUNDENTYPEN = ['privat', 'gewerbe'];
const errors = [];

// AP-18: Handseiten, in die Header-Submenu und Footer-Leistungen injiziert werden.
const HAND_PAGES = [
  { file: 'index.html', base: '' },
  { file: 'privatkunden/index.html', base: '../' },
  { file: 'gewerbekunden/index.html', base: '../' },
  { file: 'projekte/index.html', base: '../' },
];

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;
const isFilledArray = (v) => Array.isArray(v) && v.length > 0;

async function readJson(file) { return JSON.parse(await readFile(file, 'utf8')); }
async function fileExists(p) { try { await access(p, FS.R_OK); return true; } catch { return false; } }
function fail(msg) { console.error(`\n❌ ${msg}\n`); process.exit(1); }

function validate(slug, d, validSlugs) {
  const where = `content/leistungen/${slug}.json`;
  if (!validSlugs.has(slug)) errors.push(`${where}: Slug "${slug}" ist nicht in content/taxonomie.json definiert.`);
  for (const f of ['h1', 'navLabel', 'title', 'metaDescription', 'serviceType', 'intro']) {
    if (!isNonEmptyString(d[f])) errors.push(`${where}: Pflichtfeld "${f}" fehlt oder ist leer.`);
  }
  if (!isFilledArray(d.eignung)) errors.push(`${where}: "eignung" muss ein nicht-leeres Array sein.`);
  for (const f of ['ablauf', 'aufwand', 'fehleinschaetzungen']) {
    if (!isFilledArray(d[f])) { errors.push(`${where}: "${f}" muss ein nicht-leeres Array sein.`); continue; }
    d[f].forEach((it, i) => {
      if (!isNonEmptyString(it?.titel) || !isNonEmptyString(it?.text)) {
        errors.push(`${where}: ${f}[${i}] braucht "titel" und "text".`);
      }
    });
  }
  if (!Array.isArray(d.faq) || d.faq.length < 3) {
    errors.push(`${where}: "faq" braucht mindestens 3 Einträge.`);
  } else {
    d.faq.forEach((it, i) => {
      if (!isNonEmptyString(it?.frage) || !isNonEmptyString(it?.antwort)) {
        errors.push(`${where}: faq[${i}] braucht "frage" und "antwort".`);
      }
    });
  }
  if (!isFilledArray(d.kundengruppe) || d.kundengruppe.some((k) => !KUNDENTYPEN.includes(k))) {
    errors.push(`${where}: "kundengruppe" muss ein Array aus ${KUNDENTYPEN.join('/')} sein.`);
  }
  if (!Array.isArray(d.nachbarn)) errors.push(`${where}: "nachbarn" muss ein Array sein.`);
}

async function loadProjekte() {
  // Rohdaten direkt aus content/projekte lesen – unabhängig von build-index.mjs.
  let files = [];
  try { files = (await readdir(PROJEKTE_DIR)).filter((f) => f.endsWith('.json')); } catch { return []; }
  const list = [];
  for (const f of files) {
    try {
      const d = await readJson(path.join(PROJEKTE_DIR, f));
      const cover = (Array.isArray(d.bilder) && d.bilder[0]) || {};
      list.push({
        slug: f.replace(/\.json$/, ''),
        titel: d.titel, ort: d.ort, beschreibung: d.beschreibung,
        kundentyp: d.kundentyp || [], leistungen: d.leistungen || [],
        datum: d.datum || '', featured: !!d.featured,
        cover: { bild: cover.bild || '', alt: cover.alt || '' },
      });
    } catch { /* defekte Projektdatei ignorieren – build-index meldet sie */ }
  }
  return list.sort((a, b) => String(b.datum).localeCompare(String(a.datum)));
}

function refProjectsFor(slug, projekte) {
  const direct = projekte.filter((p) => p.leistungen.includes(slug)).slice(0, 3);
  if (direct.length) return direct;
  // Kein direkt zugeordnetes Projekt → die neuesten als allgemeine Beispiele (ehrlich, nicht erfunden).
  return projekte.slice(0, 2);
}

// AP-18: Inhalt zwischen zwei Markern ersetzen (idempotent).
function injectBetween(html, startMarker, endMarker, content) {
  const s = html.indexOf(startMarker);
  const e = html.indexOf(endMarker);
  if (s === -1 || e === -1 || e < s) return null;
  return html.slice(0, s + startMarker.length) + '\n          ' + content + '\n          ' + html.slice(e);
}

// AP-18: Header-Submenu und Footer-Leistungen aus der EINEN Quelle in die Handseiten
// injizieren – identisch zu den generierten Seiten (die dieselben render-Funktionen füllen).
async function injectNav() {
  for (const { file, base } of HAND_PAGES) {
    const p = path.join(REPO_ROOT, file);
    let html;
    try { html = await readFile(p, 'utf8'); } catch { console.warn(`  ⚠ ${file}: nicht gefunden`); continue; }
    const sub = injectBetween(html, '<!-- BUILD:leistungen-submenu:start -->', '<!-- BUILD:leistungen-submenu:end -->', renderNavSubmenu(base));
    if (sub) html = sub; else console.warn(`  ⚠ ${file}: Submenu-Marker fehlen`);
    const foot = injectBetween(html, '<!-- BUILD:leistungen-footer:start -->', '<!-- BUILD:leistungen-footer:end -->', renderFooterLeistungen(base));
    if (foot) html = foot; else console.warn(`  ⚠ ${file}: Footer-Leistungen-Marker fehlen`);
    await writeFile(p, html, 'utf8');
  }
  console.log('✅ Header-Submenu und Footer-Leistungen in die Handseiten injiziert.');
}

async function main() {
  const tax = await readJson(TAXONOMIE).catch((e) => fail(`taxonomie.json: ${e.message}`));
  if (!tax || !Array.isArray(tax.leistungen)) fail('taxonomie.json: "leistungen" fehlt.');
  const validSlugs = new Set(tax.leistungen.map((l) => l.slug));

  let files;
  try {
    files = (await readdir(CONTENT_DIR)).filter((f) => f.endsWith('.json'));
  } catch (e) {
    fail(`content/leistungen konnte nicht gelesen werden: ${e.message}`);
  }
  if (!files.length) fail('Keine Leistungsdateien in content/leistungen/ gefunden.');

  const bySlug = new Map();
  for (const f of files) {
    const slug = f.replace(/\.json$/, '');
    let d;
    try { d = await readJson(path.join(CONTENT_DIR, f)); }
    catch (e) { errors.push(`content/leistungen/${f}: ungültiges JSON – ${e.message}`); continue; }
    validate(slug, d, validSlugs);
    bySlug.set(slug, d);
  }

  // Nachbar-Slugs müssen auf existierende Leistungen zeigen.
  for (const [slug, d] of bySlug) {
    for (const nb of d.nachbarn || []) {
      if (!bySlug.has(nb)) errors.push(`content/leistungen/${slug}.json: nachbarn-Slug "${nb}" hat keine Leistungsdatei.`);
    }
  }

  // AP-18: Navigations-Liste (LEISTUNGEN_NAV in render.mjs) gegen die Leistungsdateien prüfen.
  const navSlugs = new Set(LEISTUNGEN_NAV.map((l) => l.slug));
  const navMissing = [...bySlug.keys()].filter((s) => !navSlugs.has(s));
  const navExtra = [...navSlugs].filter((s) => !bySlug.has(s));
  if (navMissing.length) console.warn(`⚠ Fehlt in LEISTUNGEN_NAV (render.mjs), taucht nicht in der Navigation auf: ${navMissing.join(', ')}`);
  if (navExtra.length) console.warn(`⚠ LEISTUNGEN_NAV verweist auf fehlende Leistung: ${navExtra.join(', ')}`);

  if (errors.length) {
    console.error('\n❌ Validierung fehlgeschlagen:\n');
    for (const e of errors) console.error(`  • ${e}`);
    console.error('\nEs wurde nichts geschrieben.\n');
    process.exit(1);
  }

  const projekte = await loadProjekte();
  const labelBySlug = new Map([...bySlug].map(([slug, d]) => [slug, d.navLabel]));

  const indexHtml = await readFile(INDEX_HTML, 'utf8');
  const cssVersion = (indexHtml.match(/styles\.css\?v=([\w.-]+)/) || [])[1] || '1';
  const jsVersion = (indexHtml.match(/main\.js\?v=([\w.-]+)/) || [])[1] || '1';

  await mkdir(OUT_DIR, { recursive: true });

  // Detailseiten schreiben.
  const generated = [];
  for (const [slug, leistung] of bySlug) {
    const html = await renderLeistungPage({
      leistung, slug, cssVersion, jsVersion,
      refProjects: refProjectsFor(slug, projekte),
      labelBySlug,
    });
    const dir = path.join(OUT_DIR, slug);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.html'), html, 'utf8');
    generated.push(slug);
  }

  // Übersicht in fachlicher Reihenfolge.
  const ordered = [...bySlug.keys()].sort((a, b) => {
    const ia = ORDER.indexOf(a); const ib = ORDER.indexOf(b);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  }).map((slug) => ({ slug, ...bySlug.get(slug) }));
  const overview = await renderLeistungenOverview({ leistungen: ordered, cssVersion, jsVersion });
  await writeFile(path.join(OUT_DIR, 'index.html'), overview, 'utf8');

  // Verwaiste generierte Ordner entfernen (nur mit Sentinel, nie die Übersicht).
  const slugs = new Set(bySlug.keys());
  const entries = await readdir(OUT_DIR, { withFileTypes: true });
  for (const e of entries) {
    if (!e.isDirectory() || slugs.has(e.name)) continue;
    const idx = path.join(OUT_DIR, e.name, 'index.html');
    if (await fileExists(idx) && (await readFile(idx, 'utf8')).includes(GEN_SENTINEL)) {
      await rm(path.join(OUT_DIR, e.name), { recursive: true, force: true });
      console.log(`  – veraltete Leistungsseite entfernt: leistungen/${e.name}/`);
    }
  }

  // AP-18: Navigation in die Handseiten injizieren.
  await injectNav();

  console.log(`✅ Leistungsübersicht /leistungen/ und ${generated.length} Leistungsseiten generiert:`);
  for (const slug of ordered.map((l) => l.slug)) console.log(`   /leistungen/${slug}/`);
}

await main();
