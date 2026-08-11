#!/usr/bin/env node
// Erstellt dokumentarisch bearbeitete, metadatenfreie Publikationsmaster fuer
// den rotierenden Privatkunden-Hero. Die Download-Originale bleiben
// unveraendert; der Quellordner kann ueber PRIVATE_HERO_SOURCE_DIR angepasst
// werden.

import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const SOURCE_DIR = process.env.PRIVATE_HERO_SOURCE_DIR
  ? path.resolve(process.env.PRIVATE_HERO_SOURCE_DIR)
  : path.join(process.env.HOME ?? '', 'Downloads');
const OUT_DIR = path.join(ROOT, 'assets', 'img', 'privat', 'hero', 'originale');

const IMAGES = [
  {
    input: 'IMG_3432.jpg',
    output: 'teichgarten-mit-palmen',
    crops: {
      desktop: { left: 0, top: 178, width: 4284, height: 5355 },
      landscape: { left: 0, top: 1540, width: 4284, height: 2678 },
    },
    saturation: 0.9,
    brightness: 0.99,
  },
  {
    input: 'IMG_9840.jpg',
    output: 'privatgarten-mit-rasen-und-terrasse',
    crops: {
      desktop: { left: 78, top: 310, width: 4000, height: 5000 },
      landscape: { left: 0, top: 900, width: 4284, height: 2678 },
    },
    saturation: 0.86,
    brightness: 0.98,
  },
  {
    input: '607AD8A7-5A43-47CF-9EA0-7032105324F6.jpeg',
    output: 'olivenbaum-im-kiesgarten',
    crops: {
      desktop: { left: 0, top: 0, width: 1440, height: 1800 },
      landscape: { left: 0, top: 250, width: 1440, height: 900 },
    },
    saturation: 0.84,
    brightness: 0.98,
    // Hausnummer an der Klinkerwand. Der kleine lokale Bereich wird weich
    // unkenntlich gemacht, ohne Garten- oder Bauelemente zu veraendern.
    redact: { left: 1018, top: 864, width: 132, height: 112, blur: 14 },
  },
  {
    input: 'IMG_2316.jpeg',
    output: 'kiesgarten-mit-naturstein',
    crops: {
      desktop: { left: 0, top: 102, width: 2448, height: 3060 },
      landscape: { left: 0, top: 500, width: 2448, height: 1530 },
    },
    saturation: 0.9,
    brightness: 1.08,
  },
  {
    input: 'IMG_3447.jpg',
    output: 'palmengarten-mit-teich',
    crops: {
      desktop: { left: 0, top: 176, width: 4284, height: 5355 },
      landscape: { left: 0, top: 1540, width: 4284, height: 2678 },
    },
    saturation: 0.83,
    brightness: 0.96,
    linear: { a: 1.04, b: -4 },
  },
];

async function prepare(image) {
  const src = path.join(SOURCE_DIR, image.input);
  let pipeline = sharp(src, { failOn: 'error' })
    .rotate()
    .toColourspace('srgb')
    .modulate({
      brightness: image.brightness,
      saturation: image.saturation,
    });

  if (image.linear) pipeline = pipeline.linear(image.linear.a, image.linear.b);

  // Die Redaktionskoordinaten beziehen sich auf das ausgerichtete Original
  // und werden vor beiden Zuschnitten angewendet.
  if (image.redact) {
    const base = await pipeline.clone().toBuffer();
    const featherMask = Buffer.from(`
      <svg width="${image.redact.width}" height="${image.redact.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="feather">
            <stop offset="0%" stop-color="white" stop-opacity="1"/>
            <stop offset="48%" stop-color="white" stop-opacity="1"/>
            <stop offset="100%" stop-color="white" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="50%" cy="50%" rx="50%" ry="50%" fill="url(#feather)"/>
      </svg>
    `);
    const patch = await sharp(base)
      .extract({
        left: image.redact.left,
        top: image.redact.top,
        width: image.redact.width,
        height: image.redact.height,
      })
      .blur(image.redact.blur)
      .ensureAlpha()
      .composite([{ input: featherMask, blend: 'dest-in' }])
      .png()
      .toBuffer();
    pipeline = sharp(base).composite([{ input: patch, left: image.redact.left, top: image.redact.top }]);
  }

  const corrected = await pipeline.toBuffer();

  for (const [variant, crop] of Object.entries(image.crops)) {
    const variantDir = path.join(OUT_DIR, variant);
    const out = path.join(variantDir, `${image.output}.jpg`);
    const maxHeight = variant === 'landscape' ? 1500 : 3000;
    await mkdir(variantDir, { recursive: true });
    await sharp(corrected)
      .extract(crop)
      .resize({ width: 2400, height: maxHeight, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 88, chromaSubsampling: '4:4:4', mozjpeg: true })
      .toFile(out);

    const meta = await sharp(out).metadata();
    if (meta.exif || meta.xmp) throw new Error(`Metadaten wurden nicht vollstaendig entfernt: ${out}`);
    console.log(`OK ${path.relative(ROOT, out)} (${meta.width}x${meta.height})`);
  }
}

await mkdir(OUT_DIR, { recursive: true });
for (const image of IMAGES) await prepare(image);
