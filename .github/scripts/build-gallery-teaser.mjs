#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { access, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { constants as FS } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const SOURCE = path.join(ROOT, 'content', 'galerie-teaser.json');
const OUTPUT = path.join(ROOT, 'data', 'galerie-teaser.json');
const GENERATED_DIR = path.join(ROOT, 'assets', 'img', 'galerie-teaser', 'generated');
const WIDTHS = [480, 960, 1440, 1600];
const FOCUS_PATTERN = /^(?:100|\d{1,2})% (?:100|\d{1,2})%$/;
const expectedGeneratedFiles = new Set();

const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));

async function exists(file) {
  try { await access(file, FS.R_OK); return true; } catch { return false; }
}

const byteBudget = (width, format) => {
  if (width <= 480) return 90 * 1024;
  if (width <= 960) return 160 * 1024;
  return (format === 'webp' ? 320 : 260) * 1024;
};

async function writeCompressed(pipeline, output, format, quality, maxBytes) {
  let currentQuality = quality;
  let buffer;
  do {
    buffer = await pipeline.clone()[format]({ quality: currentQuality, effort: format === 'avif' ? 4 : 6 }).toBuffer();
    currentQuality -= 6;
  } while (buffer.length > maxBytes && currentQuality >= 6);
  if (buffer.length > maxBytes) {
    throw new Error(`Bildvariante überschreitet ${Math.round(maxBytes / 1024)} KB: ${path.relative(ROOT, output)}`);
  }
  await writeFile(output, buffer);
}

function safeStem(source, index, content = '') {
  const stem = path.basename(source, path.extname(source))
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `bild-${index + 1}`;
  const hash = createHash('sha1').update(source).update('\0').update(content).digest('hex').slice(0, 7);
  return `${stem}-${hash}`;
}

async function createVariants(source, index) {
  const sourcePath = path.join(ROOT, source.replace(/^\/+/, ''));
  if (!await exists(sourcePath)) throw new Error(`Bild fehlt: ${source}`);
  const sourceBuffer = await readFile(sourcePath);
  const metadata = await sharp(sourceBuffer, { failOn: 'none' }).metadata();
  if (!metadata.width || !metadata.height) throw new Error(`Bildmaße nicht lesbar: ${source}`);

  // Der Inhalts-Hash im Dateinamen verhindert, dass Browser nach einem
  // redaktionellen Bildaustausch eine ältere Variante aus dem Cache zeigen.
  const stem = safeStem(source, index, sourceBuffer);
  const maximumWidth = metadata.height > metadata.width ? 960 : metadata.width;
  const widths = WIDTHS.filter((width) => width <= metadata.width && width <= maximumWidth);
  if (!widths.length) widths.push(metadata.width);
  await mkdir(GENERATED_DIR, { recursive: true });

  for (const width of widths) {
    const pipeline = sharp(sourceBuffer, { failOn: 'none' }).resize({ width, withoutEnlargement: true });
    const avifOutput = path.join(GENERATED_DIR, `${stem}-${width}.avif`);
    const webpOutput = path.join(GENERATED_DIR, `${stem}-${width}.webp`);
    expectedGeneratedFiles.add(path.basename(avifOutput));
    expectedGeneratedFiles.add(path.basename(webpOutput));
    if (!await exists(avifOutput)) await writeCompressed(pipeline, avifOutput, 'avif', 52, byteBudget(width, 'avif'));
    if (!await exists(webpOutput)) await writeCompressed(pipeline, webpOutput, 'webp', 76, byteBudget(width, 'webp'));
  }

  const fallbackWidth = Math.min(960, Math.max(...widths));
  const fallbackOutput = path.join(GENERATED_DIR, `${stem}.webp`);
  expectedGeneratedFiles.add(path.basename(fallbackOutput));
  if (!await exists(fallbackOutput)) {
    await writeCompressed(
      sharp(sourceBuffer, { failOn: 'none' }).resize({ width: fallbackWidth, withoutEnlargement: true }),
      fallbackOutput,
      'webp',
      74,
      byteBudget(fallbackWidth, 'webp'),
    );
  }

  return {
    id: stem,
    base: `/assets/img/galerie-teaser/generated/${stem}`,
    widths,
    width: fallbackWidth,
    height: Math.round(fallbackWidth * metadata.height / metadata.width),
  };
}

async function main() {
  const source = await readJson(SOURCE);
  if (typeof source.titel !== 'string' || !source.titel.trim()) throw new Error('Titel fehlt.');
  if (typeof source.intro !== 'string' || !source.intro.trim()) throw new Error('Einleitung fehlt.');
  if (!Array.isArray(source.bilder) || source.bilder.length < 6 || source.bilder.length > 36) {
    throw new Error('Die Bildergalerie benötigt 6 bis 36 Ergebnisbilder.');
  }

  const teaserCount = source.bilder.filter((item) => item?.imTeaser === true).length;
  const leadCount = source.bilder.filter((item) => item?.imTeaser === true && item?.leitbildGeeignet === true).length;
  if (teaserCount < 6 || teaserCount > 12) throw new Error('Für den Teaser müssen 6 bis 12 Bilder ausgewählt sein.');
  if (leadCount < 4) throw new Error('Mindestens vier Teaserbilder müssen als Leitbild geeignet sein.');

  const usedPaths = new Set();
  const images = [];
  await mkdir(GENERATED_DIR, { recursive: true });
  for (const [index, item] of source.bilder.entries()) {
    if (!item || typeof item.bild !== 'string' || !item.bild.startsWith('/assets/img/')) {
      throw new Error(`Bild ${index + 1}: ungültiger lokaler Bildpfad.`);
    }
    if (usedPaths.has(item.bild)) throw new Error(`Bild doppelt eingetragen: ${item.bild}`);
    if (typeof item.alt !== 'string' || !item.alt.trim()) throw new Error(`Bild ${index + 1}: Alt-Text fehlt.`);
    if (typeof item.fokusDesktop !== 'string' || !FOCUS_PATTERN.test(item.fokusDesktop)) {
      throw new Error(`Bild ${index + 1}: Desktop-Fokus muss als "X% Y%" angegeben sein.`);
    }
    if (typeof item.fokusMobil !== 'string' || !FOCUS_PATTERN.test(item.fokusMobil)) {
      throw new Error(`Bild ${index + 1}: Mobil-Fokus muss als "X% Y%" angegeben sein.`);
    }
    usedPaths.add(item.bild);
    const variants = await createVariants(item.bild, index);
    images.push({
      id: variants.id,
      bild: item.bild,
      alt: item.alt.trim(),
      imTeaser: item.imTeaser === true,
      leitbildGeeignet: item.imTeaser === true && item.leitbildGeeignet === true,
      fokusDesktop: item.fokusDesktop,
      fokusMobil: item.fokusMobil,
      variants: {
        base: variants.base,
        widths: variants.widths,
        width: variants.width,
        height: variants.height,
      },
    });
  }

  // Inhaltsgehashte, unveränderte Varianten wiederverwenden und erst nach
  // erfolgreicher Verarbeitung nicht mehr referenzierte Dateien entfernen.
  for (const entry of await readdir(GENERATED_DIR, { withFileTypes: true })) {
    if (entry.isFile() && !expectedGeneratedFiles.has(entry.name)) {
      await rm(path.join(GENERATED_DIR, entry.name), { force: true });
    }
  }

  await mkdir(path.dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, `${JSON.stringify({
    _hinweis: 'AUTO-GENERIERT von .github/scripts/build-gallery-teaser.mjs – NICHT von Hand editieren.',
    titel: source.titel.trim(),
    intro: source.intro.trim(),
    bilder: images,
  }, null, 2)}\n`, 'utf8');
  console.log(`✅ Bildergalerie: ${images.length} Ergebnisbilder, davon ${teaserCount} im Teaser, validiert und optimiert.`);
}

await main();
