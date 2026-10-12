#!/usr/bin/env node
// Static production check: local font files, licences and published font paths.
// This does not inspect third-party widget traffic or the browser's glyph font.
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const required = [
  'nunito-latin.woff2', 'nunito-italic-latin.woff2',
  'baloo2-variable-latin.woff2', 'baloo2-700-latin.woff2',
  'comic-neue-italic-400.woff2', 'comic-neue-italic-700.woff2',
];
const errors = [];
const sources = new Set();
let faces = 0;
let preloads = 0;
const comicFaces = new Map();
const skipped = new Set(['.git', 'node_modules', 'tmp', 'docs', 'admin']);

async function walk(dir) {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (skipped.has(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...await walk(file));
    else if (entry.isFile() && /\.(?:css|html|svg)$/.test(entry.name)) result.push(file);
  }
  return result;
}

async function checkPath(url, file) {
  if (/^(?:https?:|\/\/|data:)/i.test(url)) {
    errors.push(`${path.relative(root, file)}: externe oder eingebettete Font-Quelle ${url}`);
    return;
  }
  const clean = url.replace(/^\{\{base\}\}/, '/').split(/[?#]/)[0];
  const target = clean.startsWith('/')
    ? path.join(root, clean.slice(1))
    : path.resolve(path.dirname(file), clean);
  try {
    if (!(await stat(target)).isFile()) throw new Error('keine Datei');
    sources.add(path.relative(root, target));
  } catch {
    errors.push(`${path.relative(root, file)}: Font-Pfad fehlt: ${url}`);
  }
}

for (const name of required) {
  try {
    const bytes = await readFile(path.join(root, 'assets/fonts', name));
    if (bytes.subarray(0, 4).toString() !== 'wOF2') errors.push(`${name}: kein WOFF2`);
  } catch { errors.push(`${name}: erforderliche Datei fehlt`); }
}
for (const family of ['nunito', 'baloo2', 'comic-neue']) {
  try {
    const licence = await readFile(path.join(root, 'assets/fonts', `${family}-OFL.txt`), 'utf8');
    if (!/Copyright/i.test(licence) || !/SIL OPEN FONT LICENSE Version 1\.1/i.test(licence)) {
      errors.push(`${family}: Copyright oder OFL-Text fehlt`);
    }
  } catch { errors.push(`${family}: Lizenzdatei fehlt`); }
}
// The pinned hashes also preserve the independently inspected glyph coverage,
// genuine italic outlines and weight metadata; this script is not a font parser.
try {
  const manifest = JSON.parse(await readFile(path.join(root, 'assets/fonts/comic-neue-provenance.json'), 'utf8'));
  for (const asset of [...manifest.fonts, manifest.license]) {
    const bytes = await readFile(path.join(root, 'assets/fonts', asset.file));
    if (createHash('sha256').update(bytes).digest('hex') !== asset.sha256) {
      errors.push(`${asset.file}: SHA-256 stimmt nicht mit dem Herkunftsnachweis überein`);
    }
  }
  const licence = await readFile(path.join(root, 'assets/fonts', manifest.license.file), 'utf8');
  if (!licence.includes(manifest.license.copyright)
    || !licence.includes('TERMINATION') || !licence.includes('DISCLAIMER')) {
    errors.push('Comic Neue: vollständiger zugeordneter Copyright-/OFL-Text fehlt');
  }
} catch (error) { errors.push(`Comic-Neue-Herkunftsnachweis: ${error.message}`); }
for (const name of await readdir(path.join(root, 'assets/fonts'))) {
  if (/^(?:inter|outfit).*\.(?:woff2?|ttf|otf)$/i.test(name)) errors.push(`Ungenutzter Altbestand: ${name}`);
}

for (const file of await walk(root)) {
  const text = (await readFile(file, 'utf8'))
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '');
  if (/font-family\s*[:=]\s*["']?\s*(?:Inter|Outfit)\b/i.test(text)
    || /fonts\/(?:inter|outfit)[\w.-]*\.(?:woff2?|ttf|otf)/i.test(text)) {
    errors.push(`${path.relative(root, file)}: alte Font-Einbindung`);
  }
  if (/font-family\s*:[^;}\n]*(?:Comic Sans|Chalkboard)/i.test(text)) {
    errors.push(`${path.relative(root, file)}: frühere System-Handschrift in aktiver Schriftregel`);
  }
  if (/fonts\.(?:googleapis|gstatic)\.com/i.test(text)) {
    errors.push(`${path.relative(root, file)}: externe Google-Fonts-Referenz`);
  }
  for (const match of text.matchAll(/@font-face\s*\{([^}]+)\}/g)) {
    faces++;
    if (/\blocal\s*\(/i.test(match[1])) errors.push(`${path.relative(root, file)}: local() verdeckt den Webfont`);
    if (/font-family\s*:\s*["']Maik Comic Neue["']/i.test(match[1])) {
      const weight = /font-weight\s*:\s*(400|700)\s*;/i.exec(match[1])?.[1];
      if (!weight || !/font-style\s*:\s*italic\s*;/i.test(match[1])
        || !/font-display\s*:\s*swap\s*;/i.test(match[1])
        || !match[1].includes(`../fonts/comic-neue-italic-${weight}.woff2`)) {
        errors.push(`${path.relative(root, file)}: Comic-Neue-Schnitt/Quelle/Display falsch zugeordnet`);
      } else comicFaces.set(weight, (comicFaces.get(weight) || 0) + 1);
    }
    for (const source of match[1].matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/g)) {
      await checkPath(source[1], file);
    }
  }
  for (const tag of text.matchAll(/<link\b[^>]*>/g)) {
    if (!/\bas=["']font["']/.test(tag[0])) continue;
    const href = /\bhref=["']([^"']+)["']/.exec(tag[0]);
    if (href) { preloads++; await checkPath(href[1], file); }
  }
}
for (const weight of ['400', '700']) {
  if (comicFaces.get(weight) !== 1) errors.push(`Comic Neue italic ${weight}: genau eine gemeinsame @font-face-Regel erforderlich`);
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Font-Prüfung erfolgreich: ${required.length} lokale WOFF2, 3 OFL-Texte, ${faces} @font-face und ${preloads} Font-Preloads geprüft; Comic-Neue-Schnitte und SHA-256 stimmen.`);
  console.log([...sources].sort().join('\n'));
}
