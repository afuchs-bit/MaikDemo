#!/usr/bin/env node
// .github/scripts/build-rechtstexte.mjs  (AP-11)
//
// Erzeugt die Rechtstextseiten aus content/rechtstexte/:
//   <slug>.json       – Metadaten (h1, title, metaDescription, navLabel)
//   <slug>.body.html  – vertrauenswürdiges HTML-Fragment (der eigentliche Rechtstext)
// → /<slug>/index.html   (z. B. /impressum/, /datenschutz/)
//
// Chrome (Header/Footer/Logo, Navigation) kommt aus den geteilten Partials.
// Der Rechtstext wird als HTML-Fragment unveraendert eingebettet – so kann der
// Anbieter seinen Text (auch groessere HTML-Bloecke) einfach in die .body.html
// einsetzen, ohne JSON-Escaping. Dev-gepflegt, danach committen.

import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderRechtstextPage } from './lib/render.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const CONTENT_DIR = path.join(REPO_ROOT, 'content', 'rechtstexte');
const INDEX_HTML = path.join(REPO_ROOT, 'index.html');

function fail(msg) { console.error(`\n❌ ${msg}\n`); process.exit(1); }

async function main() {
  let files;
  try {
    files = (await readdir(CONTENT_DIR)).filter((f) => f.endsWith('.json'));
  } catch (e) {
    fail(`content/rechtstexte konnte nicht gelesen werden: ${e.message}`);
  }
  if (!files.length) fail('Keine Rechtstext-Dateien in content/rechtstexte/ gefunden.');

  const indexHtml = await readFile(INDEX_HTML, 'utf8');
  const cssVersion = (indexHtml.match(/styles\.css\?v=([\w.-]+)/) || [])[1] || '1';
  const jsVersion = (indexHtml.match(/main\.js\?v=([\w.-]+)/) || [])[1] || '1';

  const errors = [];
  const done = [];
  for (const f of files) {
    const slug = f.replace(/\.json$/, '');
    let data;
    try { data = JSON.parse(await readFile(path.join(CONTENT_DIR, f), 'utf8')); }
    catch (e) { errors.push(`content/rechtstexte/${f}: ungültiges JSON – ${e.message}`); continue; }
    for (const k of ['h1', 'title', 'metaDescription']) {
      if (typeof data[k] !== 'string' || !data[k].trim()) errors.push(`content/rechtstexte/${f}: Pflichtfeld "${k}" fehlt.`);
    }
    let bodyHtml = '';
    try { bodyHtml = await readFile(path.join(CONTENT_DIR, `${slug}.body.html`), 'utf8'); }
    catch { errors.push(`content/rechtstexte/${slug}.body.html fehlt.`); continue; }

    const html = await renderRechtstextPage({ data, slug, bodyHtml: bodyHtml.trim(), cssVersion, jsVersion });
    const dir = path.join(REPO_ROOT, slug);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.html'), html, 'utf8');
    done.push(`/${slug}/`);
  }

  if (errors.length) {
    console.error('\n❌ Fehler:\n');
    for (const e of errors) console.error(`  • ${e}`);
    process.exit(1);
  }

  console.log(`✅ ${done.length} Rechtstextseiten generiert:`);
  for (const u of done) console.log(`   ${u}`);
}

await main();
