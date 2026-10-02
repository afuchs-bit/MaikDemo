// AP-559: Nur responsive Groessen aus dem gelieferten Querformatfoto ableiten.
// Original bleibt lokal in assets/img/_src/; kein Beschnitt oder Retusche.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const source = path.join(root, 'assets/img/_src/home/hero-fahrzeug-palmengarten-wide.png');
const target = path.join(root, 'assets/img/hero');
const metadata = await sharp(source).metadata();
await mkdir(target, { recursive: true });

for (const width of [800, 1200, metadata.width]) {
  for (const format of ['avif', 'webp']) {
    const file = path.join(target, `hero-fahrzeug-palmengarten-wide-${width}.${format}`);
    await sharp(source).resize({ width, withoutEnlargement: true })
      .toFormat(format, format === 'avif' ? { quality: 68, effort: 6 } : { quality: 88, effort: 6 })
      .toFile(file);
  }
}
console.log(`Querformat-Hero: ${metadata.width} × ${metadata.height}, 6 responsive Dateien.`);
