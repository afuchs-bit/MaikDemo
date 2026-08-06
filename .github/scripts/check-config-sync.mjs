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
//
// AP-74: prüft zusätzlich, dass zu jeder in WELTEN[*].slugs gelisteten Leistung eine
// Quelldatei content/leistungen/<welt>/<slug>.json existiert – und umgekehrt keine
// verwaiste Quelldatei herumliegt. build-leistungen.mjs prüft dieselbe Invariante, läuft
// aber nicht in der Action; ohne diese Vorprüfung fällt eine vergessene Quelldatei erst
// beim nächsten lokalen Build auf. Genau so waren vier Gewerbe-Leistungen mit live
// verlinkten Seiten unterwegs, deren Quelldateien nie committet wurden (AP-73).

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { WELTEN } from './lib/render.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const TAXONOMIE = path.join(REPO_ROOT, 'content', 'taxonomie.json');
const CONFIG = path.join(REPO_ROOT, 'admin', 'config.yml');
const LEISTUNGEN_ROOT = path.join(REPO_ROOT, 'content', 'leistungen');

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

  // AP-74: Vollständigkeit der Leistungs-Quelldateien je Welt. Reine Existenzprüfung –
  // die inhaltliche Validierung bleibt bei build-leistungen.mjs. Geprüft wird das
  // Dateisystem: in der Action ist das gleichbedeutend mit "committet", weil der Checkout
  // nur versionierte Dateien enthält. Lokal kann eine untracked Datei die Prüfung
  // passieren lassen – die Action ist das Tor.
  const contentErrors = [];
  for (const welt of Object.values(WELTEN)) {
    const dir = path.join(LEISTUNGEN_ROOT, welt.key);
    let vorhanden;
    try {
      const dateien = (await readdir(dir)).filter((f) => f.endsWith('.json'));
      vorhanden = new Set(dateien.map((f) => f.replace(/\.json$/, '')));
    } catch (err) {
      contentErrors.push(`content/leistungen/${welt.key}/ konnte nicht gelesen werden: ${err.message}`);
      continue;
    }
    for (const slug of welt.slugs) {
      if (!vorhanden.has(slug)) {
        contentErrors.push(`content/leistungen/${welt.key}/${slug}.json fehlt (in WELTEN.${welt.key}.slugs gelistet).`);
      }
    }
    const erwartet = new Set(welt.slugs);
    for (const slug of vorhanden) {
      if (!erwartet.has(slug)) {
        contentErrors.push(`content/leistungen/${welt.key}/${slug}.json ist nicht in WELTEN.${welt.key}.slugs gelistet.`);
      }
    }
  }

  if (contentErrors.length) {
    console.error('\n❌ Leistungs-Quelldateien unvollständig:\n');
    for (const e of contentErrors) console.error(`  • ${e}`);
    console.error('\n  WELTEN[*].slugs in .github/scripts/lib/render.mjs und die Dateien in');
    console.error('  content/leistungen/<welt>/ müssen sich exakt decken – sonst bricht');
    console.error('  build-leistungen.mjs, und generierte Seiten sind nicht reproduzierbar.\n');
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

  const weltSummary = Object.values(WELTEN).map((w) => `${w.key} ${w.slugs.length}`).join(', ');
  console.log(`✅ Taxonomie-Sync ok: ${taxSlugs.size} leistungen-Slugs stimmen zwischen taxonomie.json und config.yml überein.`);
  console.log(`✅ Leistungs-Quelldateien vollständig (${weltSummary}).`);
  if (labelWarnings.length) {
    console.log('\n⚠️  Abweichende Labels (nur Hinweis, kein Fehler):');
    for (const w of labelWarnings) console.log(w);
  }
}

await main();
