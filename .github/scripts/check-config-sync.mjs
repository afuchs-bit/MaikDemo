#!/usr/bin/env node
// .github/scripts/check-config-sync.mjs
//
// Stellt sicher, dass die "leistungen"-Optionen in admin/config.yml nicht von der
// Quelle der Wahrheit content/taxonomie.json abweichen.
//
// - Werte (values) der leistungen-Optionen != Slugs in taxonomie.json => exit 1 (klare Diff).
// - Abweichende Labels => nur Warnung (Slugs sind das Verbindliche).
//
// So bleibt taxonomie.json die einzige Quelle für gültige Leistungen, während config.yml
// handeditierbar bleibt (Labels, Hints, Widgets). Läuft in der GitHub Action vor dem Index-Build.

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const TAXONOMIE = path.join(REPO_ROOT, 'content', 'taxonomie.json');
const CONFIG = path.join(REPO_ROOT, 'admin', 'config.yml');

function fail(msg) {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

async function main() {
  // Taxonomie laden
  let taxonomie;
  try {
    taxonomie = JSON.parse(await readFile(TAXONOMIE, 'utf8'));
  } catch (err) {
    fail(`content/taxonomie.json konnte nicht gelesen werden: ${err.message}`);
  }
  if (!taxonomie || !Array.isArray(taxonomie.leistungen)) {
    fail('content/taxonomie.json: Feld "leistungen" fehlt oder ist kein Array.');
  }
  const taxBySlug = new Map(taxonomie.leistungen.map((l) => [l.slug, l.label]));

  // config.yml laden
  let config;
  try {
    config = parseYaml(await readFile(CONFIG, 'utf8'));
  } catch (err) {
    fail(`admin/config.yml konnte nicht als YAML gelesen werden: ${err.message}`);
  }

  // Collection "projekte" → Feld "leistungen" → options finden
  const collection = (config?.collections || []).find((c) => c.name === 'projekte');
  if (!collection) fail('admin/config.yml: Collection "projekte" nicht gefunden.');
  const leistungenField = (collection.fields || []).find((f) => f.name === 'leistungen');
  if (!leistungenField) fail('admin/config.yml: Feld "leistungen" in Collection "projekte" nicht gefunden.');
  const options = leistungenField.options;
  if (!Array.isArray(options) || options.length === 0) {
    fail('admin/config.yml: "leistungen".options fehlt oder ist leer.');
  }

  const configBySlug = new Map(options.map((o) => [o.value, o.label]));

  const taxSlugs = new Set(taxBySlug.keys());
  const cfgSlugs = new Set(configBySlug.keys());

  const missingInConfig = [...taxSlugs].filter((s) => !cfgSlugs.has(s)); // in Taxonomie, fehlt in config
  const extraInConfig = [...cfgSlugs].filter((s) => !taxSlugs.has(s));   // in config, nicht in Taxonomie

  const errors = [];
  if (missingInConfig.length) {
    errors.push(`In taxonomie.json, aber NICHT in config.yml: ${missingInConfig.join(', ')}`);
  }
  if (extraInConfig.length) {
    errors.push(`In config.yml, aber NICHT in taxonomie.json (Tippfehler?): ${extraInConfig.join(', ')}`);
  }

  if (errors.length) {
    console.error('\n❌ Taxonomie-Sync fehlgeschlagen: leistungen-Slugs weichen ab.\n');
    for (const e of errors) console.error(`  • ${e}`);
    console.error('\n  Quelle der Wahrheit ist content/taxonomie.json – admin/config.yml angleichen.\n');
    process.exit(1);
  }

  // Slugs stimmen überein – Labels nur als Warnung prüfen.
  const labelWarnings = [];
  for (const [slug, taxLabel] of taxBySlug) {
    const cfgLabel = configBySlug.get(slug);
    if (cfgLabel !== taxLabel) {
      labelWarnings.push(`  • "${slug}": taxonomie="${taxLabel}" vs. config="${cfgLabel}"`);
    }
  }

  console.log(`✅ Taxonomie-Sync ok: ${taxSlugs.size} leistungen-Slugs stimmen zwischen taxonomie.json und config.yml überein.`);
  if (labelWarnings.length) {
    console.log('\n⚠️  Abweichende Labels (nur Hinweis, kein Fehler):');
    for (const w of labelWarnings) console.log(w);
  }
}

await main();
