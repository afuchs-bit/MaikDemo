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
//   (Projekte, deren leistungen den Slug enthalten). Ohne Treffer bleibt die Liste
//   leer und lpRefs() rendert einen ehrlichen Galerie-Link statt fachfremder
//   Projekte als vermeintliche Beispiele (AP-32).
// - Verwaiste generierte Ordner (Sentinel im Kopf) werden entfernt.
//
// Inhalt = Daten (content/leistungen), Struktur = Template (.github/scripts/templates),
// Chrome geteilt mit den Projektseiten. Kein CMS – dev-gepflegt, danach committen.

import { readFile, readdir, writeFile, mkdir, rm, access } from 'node:fs/promises';
import { constants as FS } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderLeistungPage, renderNavSubmenu, renderFooterLeistungen, renderFaqDetails, renderFaqSchema, LEISTUNGEN_NAV, WELTEN } from './lib/render.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const CONTENT_ROOT = path.join(REPO_ROOT, 'content', 'leistungen');
const PROJEKTE_DIR = path.join(REPO_ROOT, 'content', 'projekte');
const TAXONOMIE = path.join(REPO_ROOT, 'content', 'taxonomie.json');
const OUT_ROOT = REPO_ROOT; // Ziel je Welt: <welt.pfad>leistungen/
const INDEX_HTML = path.join(REPO_ROOT, 'index.html');
const GEN_SENTINEL = 'AUTO-GENERIERT von .github/scripts/build-leistungen.mjs';

// Reihenfolge und Zugehörigkeit kommen aus WELTEN[*].slugs (render.mjs).

const KUNDENTYPEN = ['privat', 'gewerbe'];
const errors = [];

// AP-18: Handseiten, in die das Header-Submenu injiziert wird.
const HAND_PAGES = [
  { file: 'index.html', base: '' },
  { file: 'privatkunden/index.html', base: '../' },
  { file: 'gewerbekunden/index.html', base: '../' },
  { file: 'projekte/index.html', base: '../' },
  // AP-33: 404 trug die Leistungs-Nav fest verdrahtet – jetzt ebenfalls aus einer Quelle.
  { file: '404.html', base: '' },
  // AP-108: kontakt/ und leistungen/ trugen das Dropdown ebenfalls fest verdrahtet
  // und drifteten bei jeder Nav-Änderung still weg – jetzt aus derselben Quelle.
  { file: 'kontakt/index.html', base: '../' },
  { file: 'leistungen/index.html', base: '../' },
];

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;
const isFilledArray = (v) => Array.isArray(v) && v.length > 0;

async function readJson(file) { return JSON.parse(await readFile(file, 'utf8')); }
async function fileExists(p) { try { await access(p, FS.R_OK); return true; } catch { return false; } }
function fail(msg) { console.error(`\n❌ ${msg}\n`); process.exit(1); }

function validate(slug, d, validSlugs, weltKey) {
  const where = `content/leistungen/${weltKey}/${slug}.json`;
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

function refProjectsFor(slug, projekte, welt) {
  // Nur Projekte, die diesen Leistungs-Slug tatsächlich tragen (AP-32) UND zur
  // Welt der Seite gehören (AP-33) – ein Gewerbeobjekt ist kein Beispiel für den
  // privaten Garten und umgekehrt. Kein Treffer → leeres Array; lpRefs() rendert
  // dann die ehrliche "Alle Projekte ansehen"-Empty-State.
  return projekte
    .filter((p) => p.leistungen.includes(slug) && (p.kundentyp || []).includes(welt.key))
    .slice(0, 3);
}

// AP-18: Inhalt zwischen zwei Markern ersetzen (idempotent).
function injectBetween(html, startMarker, endMarker, content) {
  const s = html.indexOf(startMarker);
  const e = html.indexOf(endMarker);
  if (s === -1 || e === -1 || e < s) return null;
  return html.slice(0, s + startMarker.length) + '\n          ' + content + '\n          ' + html.slice(e);
}

// AP-19: Startseiten-FAQ (sichtbare Liste + FAQPage-Schema) aus content/faq-startseite.json
// in index.html injizieren – beide aus derselben Quelle, also garantiert identischer Text.
async function injectFaq() {
  const FAQ_FILE = path.join(REPO_ROOT, 'content', 'faq-startseite.json');
  let data;
  try { data = await readJson(FAQ_FILE); } catch { console.warn('  ⚠ content/faq-startseite.json fehlt – FAQ nicht injiziert.'); return; }
  const faq = Array.isArray(data?.faq) ? data.faq : [];
  if (!faq.length) { console.warn('  ⚠ faq-startseite.json: leeres "faq"-Array.'); return; }
  const p = path.join(REPO_ROOT, 'index.html');
  let html = await readFile(p, 'utf8');
  const vis = injectBetween(html, '<!-- BUILD:faq:start -->', '<!-- BUILD:faq:end -->', renderFaqDetails(faq));
  if (vis) html = vis; else console.warn('  ⚠ index.html: FAQ-Marker fehlen');
  const sch = injectBetween(html, '<!-- BUILD:faq-schema:start -->', '<!-- BUILD:faq-schema:end -->', renderFaqSchema(faq));
  if (sch) html = sch; else console.warn('  ⚠ index.html: FAQ-Schema-Marker fehlen');
  await writeFile(p, html, 'utf8');
  console.log(`✅ FAQ (${faq.length} Fragen) in index.html injiziert – sichtbar + Schema aus einer Quelle.`);
}

// AP-18: Header-Submenu aus der EINEN Quelle in die Handseiten injizieren.
// Der gemeinsame Footer wird separat von build-footers.mjs gepflegt.
async function injectNav() {
  for (const { file, base } of HAND_PAGES) {
    const p = path.join(REPO_ROOT, file);
    let html;
    try { html = await readFile(p, 'utf8'); } catch { console.warn(`  ⚠ ${file}: nicht gefunden`); continue; }
    const sub = injectBetween(html, '<!-- BUILD:leistungen-submenu:start -->', '<!-- BUILD:leistungen-submenu:end -->', renderNavSubmenu(base));
    if (sub) html = sub; else console.warn(`  ⚠ ${file}: Submenu-Marker fehlen`);
    await writeFile(p, html, 'utf8');
  }
  console.log('✅ Header-Submenu in die Handseiten injiziert.');
}

async function main() {
  const tax = await readJson(TAXONOMIE).catch((e) => fail(`taxonomie.json: ${e.message}`));
  if (!tax || !Array.isArray(tax.leistungen)) fail('taxonomie.json: "leistungen" fehlt.');
  const validSlugs = new Set(tax.leistungen.map((l) => l.slug));

  // AP-33: Je Welt einlesen und validieren. bySlug bleibt strikt pro Welt getrennt –
  // nur so kann die nachbarn-Prüfung Links erkennen, die aus der Welt herausführen.
  const weltDaten = new Map();
  for (const welt of Object.values(WELTEN)) {
    const contentDir = path.join(CONTENT_ROOT, welt.key);
    let files;
    try {
      files = (await readdir(contentDir)).filter((f) => f.endsWith('.json'));
    } catch (e) {
      fail(`content/leistungen/${welt.key} konnte nicht gelesen werden: ${e.message}`);
    }
    if (!files.length) fail(`Keine Leistungsdateien in content/leistungen/${welt.key}/ gefunden.`);

    const bySlug = new Map();
    for (const f of files) {
      const slug = f.replace(/\.json$/, '');
      let d;
      try { d = await readJson(path.join(contentDir, f)); }
      catch (e) { errors.push(`content/leistungen/${welt.key}/${f}: ungültiges JSON – ${e.message}`); continue; }
      validate(slug, d, validSlugs, welt.key);
      bySlug.set(slug, d);
    }

    // Nachbar-Slugs müssen in DERSELBEN Welt existieren, sonst führt der Link hinaus.
    for (const [slug, d] of bySlug) {
      for (const nb of d.nachbarn || []) {
        if (!bySlug.has(nb)) {
          errors.push(`content/leistungen/${welt.key}/${slug}.json: nachbarn-Slug "${nb}" existiert nicht in der Welt ${welt.key}.`);
        }
      }
    }

    // Vollständigkeit: WELTEN[*].slugs und die Dateien müssen sich exakt decken –
    // fängt vergessene Migrationsschritte sofort ab.
    const erwartet = new Set(welt.slugs);
    for (const s of erwartet) {
      if (!bySlug.has(s)) errors.push(`content/leistungen/${welt.key}/${s}.json fehlt (in WELTEN.${welt.key}.slugs gelistet).`);
    }
    for (const s of bySlug.keys()) {
      if (!erwartet.has(s)) errors.push(`content/leistungen/${welt.key}/${s}.json ist nicht in WELTEN.${welt.key}.slugs gelistet.`);
    }

    weltDaten.set(welt.key, bySlug);
  }

  // AP-18/AP-33: LEISTUNGEN_NAV gegen die Vereinigungsmenge beider Welten prüfen.
  const alleSlugs = new Set([...weltDaten.values()].flatMap((m) => [...m.keys()]));
  const navSlugs = new Set(LEISTUNGEN_NAV.map((l) => l.slug));
  const navMissing = [...alleSlugs].filter((s) => !navSlugs.has(s));
  const navExtra = [...navSlugs].filter((s) => !alleSlugs.has(s));
  if (navMissing.length) console.warn(`⚠ Fehlt in LEISTUNGEN_NAV (render.mjs), taucht nicht in der Navigation auf: ${navMissing.join(', ')}`);
  if (navExtra.length) console.warn(`⚠ LEISTUNGEN_NAV verweist auf fehlende Leistung: ${navExtra.join(', ')}`);

  if (errors.length) {
    console.error('\n❌ Validierung fehlgeschlagen:\n');
    for (const e of errors) console.error(`  • ${e}`);
    console.error('\nEs wurde nichts geschrieben.\n');
    process.exit(1);
  }

  const projekte = await loadProjekte();

  const indexHtml = await readFile(INDEX_HTML, 'utf8');
  const cssVersion = (indexHtml.match(/styles\.css\?v=([\w.-]+)/) || [])[1] || '1';
  const jsVersion = (indexHtml.match(/main\.js\?v=([\w.-]+)/) || [])[1] || '1';

  // AP-33: pro Welt einen kompletten Seitenbaum + eigene Übersicht schreiben.
  for (const welt of Object.values(WELTEN)) {
    const bySlug = weltDaten.get(welt.key);
    const outDir = path.join(OUT_ROOT, welt.pfad.replace(/\/$/, ''), 'leistungen');
    await mkdir(outDir, { recursive: true });

    // Labels nur aus dieser Welt – Nachbar-Links zeigen ausschließlich hierhin.
    const labelBySlug = new Map([...bySlug].map(([slug, d]) => [slug, d.navLabel]));

    for (const [slug, leistung] of bySlug) {
      const html = await renderLeistungPage({
        leistung, slug, welt, cssVersion, jsVersion,
        refProjects: refProjectsFor(slug, projekte, welt),
        labelBySlug,
      });
      const dir = path.join(outDir, slug);
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, 'index.html'), html, 'utf8');
    }

    // Keine Verteilerseite: Im Header führt das Hover-Menü direkt zu den Details.
    await rm(path.join(outDir, 'index.html'), { force: true });

    // Verwaiste generierte Ordner entfernen (nur mit Sentinel, nie die Übersicht).
    const entries = await readdir(outDir, { withFileTypes: true });
    for (const e of entries) {
      if (!e.isDirectory() || bySlug.has(e.name)) continue;
      const idx = path.join(outDir, e.name, 'index.html');
      if (await fileExists(idx) && (await readFile(idx, 'utf8')).includes(GEN_SENTINEL)) {
        await rm(path.join(outDir, e.name), { recursive: true, force: true });
        console.log(`  – veraltete Leistungsseite entfernt: ${welt.pfad}leistungen/${e.name}/`);
      }
    }

    console.log(`✅ ${welt.navLabel}: ${bySlug.size} direkte Leistungsseiten generiert:`);
    for (const slug of welt.slugs) console.log(`   /${welt.pfad}leistungen/${slug}/`);
  }

  // AP-18: Navigation in die Handseiten injizieren.
  await injectNav();
  // AP-19: Startseiten-FAQ injizieren (nach injectNav, das index.html ebenfalls schreibt).
  await injectFaq();
}

await main();
