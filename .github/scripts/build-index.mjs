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

import { readFile, readdir, writeFile, access, mkdir } from 'node:fs/promises';
import { constants as FS } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const CONTENT_DIR = path.join(REPO_ROOT, 'content', 'projekte');
const TAXONOMIE = path.join(REPO_ROOT, 'content', 'taxonomie.json');
const OUT_FILE = path.join(REPO_ROOT, 'data', 'projekte-index.json');

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
  try {
    const tax = await readJson(TAXONOMIE);
    if (!tax || !Array.isArray(tax.leistungen)) {
      throw new Error('taxonomie.json: Feld "leistungen" fehlt oder ist kein Array.');
    }
    validSlugs = new Set(tax.leistungen.map((l) => l.slug));
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

  const out = {
    _hinweis: 'AUTO-GENERIERT von .github/scripts/build-index.mjs – NICHT von Hand editieren.',
    projekte,
  };

  await mkdir(path.dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log(`✅ ${projekte.length} Projekte validiert und nach data/projekte-index.json geschrieben.`);
  if (warnings.length) {
    console.log('\n⚠️  Warnungen:');
    for (const w of warnings) console.log(`  • ${w}`);
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
