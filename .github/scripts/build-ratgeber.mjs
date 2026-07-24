#!/usr/bin/env node
// .github/scripts/build-ratgeber.mjs  (AP-22)
//
// Erzeugt die Ratgeber-Seiten aus content/ratgeber/*.json:
//   /ratgeber/<slug>/index.html   – je Artikel (Article + Breadcrumb + FAQPage-JSON-LD)
//   /ratgeber/index.html          – Übersicht
//
// Fachinhalte für Antwortmaschinen (AEO): Leitfrage im ersten Absatz, Rechtsangaben
// mit Quelle und Stand. Validierung => exit 1, es wird nichts geschrieben.
// Dev-gepflegt und committet – keine Workflow-Änderung nötig (wie die Leistungsseiten).

import { readFile, readdir, writeFile, mkdir, rm, access } from 'node:fs/promises';
import { constants as FS } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderRatgeberPage, renderRatgeberOverview } from './lib/render.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const CONTENT_DIR = path.join(REPO_ROOT, 'content', 'ratgeber');
const OUT_DIR = path.join(REPO_ROOT, 'ratgeber');
const INDEX_HTML = path.join(REPO_ROOT, 'index.html');
const GEN_SENTINEL = 'AUTO-GENERIERT von .github/scripts/build-ratgeber.mjs';

const errors = [];
const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

async function readJson(file) { return JSON.parse(await readFile(file, 'utf8')); }
async function fileExists(p) { try { await access(p, FS.R_OK); return true; } catch { return false; } }

function validate(slug, d) {
  const where = `content/ratgeber/${slug}.json`;
  for (const f of ['h1', 'title', 'metaDescription', 'intro', 'quelle', 'stand', 'datum']) {
    if (!isNonEmptyString(d[f])) errors.push(`${where}: Pflichtfeld "${f}" fehlt oder ist leer.`);
  }
  if (!Array.isArray(d.sections) || !d.sections.length) {
    errors.push(`${where}: "sections" muss ein nicht-leeres Array sein.`);
  } else {
    d.sections.forEach((s, i) => {
      if (!isNonEmptyString(s?.h2) || !Array.isArray(s?.absaetze) || !s.absaetze.length) {
        errors.push(`${where}: sections[${i}] braucht "h2" und ein nicht-leeres "absaetze"-Array.`);
      }
    });
  }
  if (d.faq && !Array.isArray(d.faq)) errors.push(`${where}: "faq" muss ein Array sein.`);
}

async function main() {
  let files;
  try {
    files = (await readdir(CONTENT_DIR)).filter((f) => f.endsWith('.json'));
  } catch {
    console.log('Kein content/ratgeber/ – nichts zu tun.');
    return;
  }
  if (!files.length) { console.log('Keine Ratgeber-Artikel gefunden.'); return; }

  const artikel = [];
  for (const f of files) {
    const slug = f.replace(/\.json$/, '');
    let d;
    try { d = await readJson(path.join(CONTENT_DIR, f)); }
    catch (e) { errors.push(`content/ratgeber/${f}: ungültiges JSON – ${e.message}`); continue; }
    validate(slug, d);
    artikel.push({ slug, ...d });
  }

  if (errors.length) {
    console.error('\n❌ Validierung fehlgeschlagen:\n');
    for (const e of errors) console.error(`  • ${e}`);
    console.error('\nEs wurde nichts geschrieben.\n');
    process.exit(1);
  }

  // CSS-/JS-Version aus index.html (eine Quelle).
  const indexHtml = await readFile(INDEX_HTML, 'utf8');
  const cssVersion = (indexHtml.match(/styles\.css\?v=([\w.-]+)/) || [])[1] || '1';
  const jsVersion = (indexHtml.match(/main\.js\?v=([\w.-]+)/) || [])[1] || '1';

  await mkdir(OUT_DIR, { recursive: true });

  // Artikel schreiben.
  artikel.sort((a, b) => String(b.datum).localeCompare(String(a.datum)));
  for (const a of artikel) {
    const html = await renderRatgeberPage({ article: a, slug: a.slug, cssVersion, jsVersion });
    const dir = path.join(OUT_DIR, a.slug);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.html'), html, 'utf8');
  }

  // Übersicht.
  const overview = await renderRatgeberOverview({ artikel, cssVersion, jsVersion });
  await writeFile(path.join(OUT_DIR, 'index.html'), overview, 'utf8');

  // Verwaiste generierte Ordner entfernen (nur mit Sentinel).
  const slugs = new Set(artikel.map((a) => a.slug));
  const entries = await readdir(OUT_DIR, { withFileTypes: true });
  for (const e of entries) {
    if (!e.isDirectory() || slugs.has(e.name)) continue;
    const idx = path.join(OUT_DIR, e.name, 'index.html');
    if (await fileExists(idx) && (await readFile(idx, 'utf8')).includes(GEN_SENTINEL)) {
      await rm(path.join(OUT_DIR, e.name), { recursive: true, force: true });
      console.log(`  – veralteten Ratgeber-Artikel entfernt: ratgeber/${e.name}/`);
    }
  }

  console.log(`✅ Ratgeber-Übersicht /ratgeber/ und ${artikel.length} Artikel generiert:`);
  for (const a of artikel) console.log(`   /ratgeber/${a.slug}/`);
}

await main();
