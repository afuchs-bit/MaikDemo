#!/usr/bin/env node
// .github/scripts/build-images.mjs (AP-25)
//
// Erzeugt aus den Original-Bildern in assets/img/_src/ (und einzelnen
// bestehenden Dateien) responsive Derivate:
//   <name>-480.avif/.webp, <name>-960..., <name>-1600...  (nur Breiten <= Original)
//   <name>.webp  = Fallback (min(960, maxBreite))
// und schreibt ein Manifest nach data/images.json, das render.mjs und die
// Handseiten fuer <picture>/srcset nutzen.
//
// Ziel: jede Ausgabedatei < 200 KB (AP-25). Original-PNG/JPG bleiben unter
// assets/img/_src/ und werden per .gitignore NICHT deployt.

import sharp from 'sharp';
import { mkdir, writeFile, readdir, unlink, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');

const WIDTHS = [480, 960, 1600];
const AVIF = { quality: 50, effort: 4 };
const WEBP = { quality: 74, effort: 6 };
const MAX_BYTES = 200 * 1024;
const QUALITY_STEP = 6;   // Absenkung je Versuch, bis < 200 KB
const QUALITY_FLOOR = 28; // untere Grenze, darunter nicht mehr

// name = Basisname der Ausgabedateien; dir = Zielordner (relativ zum Repo-Root);
// src = Quelldatei (relativ zum Repo-Root).
const SOURCES = [
  { src: 'assets/img/_src/hero-garten-herne.png',            dir: 'assets/img/hero',                              name: 'hero-garten-herne' },
  { src: 'assets/img/_src/hero-pool.jpg',                     dir: 'assets/img/hero',                              name: 'hero-pool' },
  { src: 'assets/img/_src/vorgarten-herne.png',              dir: 'assets/img/projekte/vorgarten-herne-2026',    name: 'vorgarten-herne' },
  { src: 'assets/img/_src/teichanlage-bochum.png',           dir: 'assets/img/projekte/teichanlage-bochum-2026', name: 'teichanlage-bochum' },
  { src: 'assets/img/_src/aussenanlagen-recklinghausen.png', dir: 'assets/img/projekte/aussenanlagen-recklinghausen-2026', name: 'aussenanlagen-recklinghausen' },
  { src: 'assets/img/_src/baumarbeiten-herne.webp', dir: 'assets/img/projekte/baumarbeiten-herne', name: 'baumarbeiten-herne' },
  { src: 'assets/img/_src/ueber-1.jpg', dir: 'assets/img/ueber', name: 'ueber-1' },
  { src: 'assets/img/_src/ueber-2.jpg', dir: 'assets/img/ueber', name: 'ueber-2' },
  { src: 'assets/img/_src/ueber-3.jpg', dir: 'assets/img/ueber', name: 'ueber-3' },
  // Original ist 1448 px breit; 1200 statt 1600 als groesste Stufe.
  { src: 'assets/img/_src/Gewerbe_Foto_Homepage_Hero.png', dir: 'assets/img/hero', name: 'gate-gewerbe', widths: [480, 960, 1200] },
];

async function fileSize(p) {
  try { return (await stat(p)).size; } catch { return 0; }
}

// Liefert die Resize-Pipeline fuer eine Zielbreite. Ohne crop: reines
// Breiten-Resize (Originalverhalten). Mit crop: schneidet zusaetzlich auf ein
// festes Seitenverhaeltnis zu, focusY (0-1) verschiebt das Fenster vertikal
// wie CSS object-position. Portiert aus build-hero-images.mjs (AP-83) - dort
// fuer ein Hochformat-Handyfoto in einer Querformat-Kachel. Bewusst dupliziert
// statt nach lib/ ausgelagert: lib/images.mjs wird von build-index.mjs
// importiert, das in der Action ohne sharp laeuft.
function pipelineFor(srcAbs, meta, w, crop) {
  const base = sharp(srcAbs, { failOn: 'none' });
  if (!crop) return base.resize({ width: w, withoutEnlargement: true });
  const scaledH = Math.round(w * (meta.height / meta.width));
  const targetH = Math.round(w / crop.aspect);
  const top = Math.max(0, Math.min(scaledH - targetH, Math.round((scaledH - targetH) * crop.focusY)));
  return base
    .resize({ width: w, height: scaledH, withoutEnlargement: true })
    .extract({ left: 0, top, width: w, height: targetH });
}

// Schreibt eine Breite in einem Format; senkt die Qualitaet schrittweise,
// bis die Datei < 200 KB ist oder die untere Qualitaetsgrenze erreicht ist.
async function writeVariant(pipeline, outPath, format, baseOpts) {
  let opts = { ...baseOpts };
  let last;
  while (true) {
    last = await pipeline.clone()[format](opts).toBuffer();
    if (last.length <= MAX_BYTES || opts.quality <= QUALITY_FLOOR) break;
    opts = { ...opts, quality: opts.quality - QUALITY_STEP };
  }
  await writeFile(outPath, last);
  return last.length;
}

async function main() {
  const manifest = {};
  let over = 0;

  for (const s of SOURCES) {
    const srcAbs = path.join(ROOT, s.src);
    const outDir = path.join(ROOT, s.dir);
    await mkdir(outDir, { recursive: true });

    const img = sharp(srcAbs, { failOn: 'none' });
    const meta = await img.metadata();
    const srcW = meta.width;
    const srcH = meta.height;
    const aspect = srcH / srcW;

    // Nur Breiten <= Originalbreite; ist das Original kleiner als 480, nimm die Originalbreite.
    let widths = (s.widths ?? WIDTHS).filter((w) => w <= srcW);
    if (!widths.length) widths = [srcW];

    for (const w of widths) {
      const base = pipelineFor(srcAbs, meta, w, s.crop);
      const avifOut = path.join(outDir, `${s.name}-${w}.avif`);
      const webpOut = path.join(outDir, `${s.name}-${w}.webp`);
      const a = await writeVariant(base, avifOut, 'avif', AVIF);
      const b = await writeVariant(base, webpOut, 'webp', WEBP);
      for (const [p, n] of [[avifOut, a], [webpOut, b]]) {
        const kb = (n / 1024).toFixed(0);
        if (n > MAX_BYTES) { over++; console.log(`  ⚠ ${kb} KB  ${path.relative(ROOT, p)} (> 200 KB!)`); }
        else console.log(`  ${kb.padStart(3)} KB  ${path.relative(ROOT, p)}`);
      }
    }

    // Fallback <name>.webp (fuer das <img>-Element in <picture>).
    const fbW = Math.min(960, Math.max(...widths));
    const fbOut = path.join(outDir, `${s.name}.webp`);
    await writeVariant(pipelineFor(srcAbs, meta, fbW, s.crop), fbOut, 'webp', WEBP);
    const fbH = s.crop ? Math.round(fbW / s.crop.aspect) : Math.round(fbW * aspect);

    const canonical = `/${s.dir}/${s.name}.webp`;
    manifest[canonical] = {
      base: `/${s.dir}/${s.name}`,
      widths,
      width: fbW,
      height: fbH,
      aspect: Math.round((s.crop ? 1 / s.crop.aspect : aspect) * 10000) / 10000,
    };
    console.log(`✅ ${s.name}: ${widths.join('/')} px  (Original ${srcW}×${srcH})`);
  }

  const outManifest = path.join(ROOT, 'data', 'images.json');
  await mkdir(path.dirname(outManifest), { recursive: true });
  await writeFile(outManifest, JSON.stringify({
    _hinweis: 'AUTO-GENERIERT von .github/scripts/build-images.mjs – NICHT von Hand editieren.',
    bilder: manifest,
  }, null, 2) + '\n', 'utf8');

  console.log(`\n✅ Manifest: data/images.json (${Object.keys(manifest).length} Bilder).`);
  if (over) { console.error(`\n❌ ${over} Datei(en) über 200 KB.`); process.exit(1); }
}

await main();
