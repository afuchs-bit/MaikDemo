#!/usr/bin/env node
// Bestehende Originalbluete in Safari-/Browser-Formaten, ohne neue Bildinhalte.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { FAVICON_VERSION } from './lib/favicons.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dir = path.join(root, 'assets/img/logo');
// Das bereits abgenommene 64-px-Icon bleibt bytegleich.
const png64 = await readFile(path.join(dir, 'favicon.png'));
const png32 = await sharp(png64).resize(32, 32).png().toBuffer();
await writeFile(path.join(dir, `favicon-32-${FAVICON_VERSION}.png`), png32);
await writeFile(path.join(dir, `favicon-64-${FAVICON_VERSION}.png`), png64);

// ICO-Verzeichnis mit vier PNG-Bildern: keine weitere Encoder-Abhaengigkeit.
const sizes = [16, 32, 48, 64];
const images = await Promise.all(sizes.map(size => sharp(png64).resize(size, size).png().toBuffer()));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((size, i) => {
  const entry = 6 + 16 * i;
  header[entry] = header[entry + 1] = size;
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(images[i].length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += images[i].length;
});
const ico = Buffer.concat([header, ...images]);
await writeFile(path.join(dir, `favicon-${FAVICON_VERSION}.ico`), ico);
await writeFile(path.join(root, 'favicon.ico'), ico);

// Apple-Symbol aus dem hochaufgeloesten Original; opak mit etwas Innenabstand.
const dark = '#171916';
const apple = await sharp(path.join(root, 'assets/img/icons/maik-rohdich-bluete-original.png'))
  .resize(148, 148, { fit: 'contain', background: dark })
  .extend({ top: 16, bottom: 16, left: 16, right: 16, background: dark })
  .flatten({ background: dark }).png().toBuffer();
await writeFile(path.join(dir, `apple-touch-icon-${FAVICON_VERSION}.png`), apple);
await writeFile(path.join(root, 'apple-touch-icon.png'), apple);
console.log(`Favicons ${FAVICON_VERSION}: PNG 32/64, ICO 16/32/48/64, Apple 180 und Root-Fallbacks.`);
