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
  // Privat-Tuer im Hero. Quelle 1440x1080 (4:3), Tuer ist ~3:2 - daher leichter
  // Zuschnitt (nur ~11 % Hoehe). focusY 0.65 laesst oben etwas Himmel stehen und
  // behaelt unten die Natursteinmauer als Bildbasis.
  { src: 'assets/img/_src/51FE5CE2-95A1-43F9-A555-963573FFD55C.JPG', dir: 'assets/img/hero', name: 'gate-privat',
    widths: [480, 960, 1200], crop: { aspect: 3 / 2, focusY: 0.65 } },
  { src: 'assets/img/_src/vorgarten-herne.png',              dir: 'assets/img/projekte/vorgarten-herne-2026',    name: 'vorgarten-herne' },
  { src: 'assets/img/_src/teichanlage-bochum.png',           dir: 'assets/img/projekte/teichanlage-bochum-2026', name: 'teichanlage-bochum' },
  { src: 'assets/img/_src/aussenanlagen-recklinghausen.png', dir: 'assets/img/projekte/aussenanlagen-recklinghausen-2026', name: 'aussenanlagen-recklinghausen' },
  { src: 'assets/img/_src/baumarbeiten-herne.webp', dir: 'assets/img/projekte/baumarbeiten-herne', name: 'baumarbeiten-herne' },
  { src: 'assets/img/_src/ueber-1.jpg', dir: 'assets/img/ueber', name: 'ueber-1' },
  { src: 'assets/img/_src/ueber-2.jpg', dir: 'assets/img/ueber', name: 'ueber-2' },
  { src: 'assets/img/_src/ueber-3.jpg', dir: 'assets/img/ueber', name: 'ueber-3' },
  // Hochformat-Original (1440x1800, 4:5) fuer die Gewerbe-Tuer im Hero, die ein
  // liegendes Fenster von rund 3:2 ist. focusY 0.45 zeigt 21-74 % der Bildhoehe:
  // Strasse, Gebaeude und fremde Fahrzeuge fallen oben heraus, der Helm des
  // vorderen Arbeiters behaelt Luft nach oben (Helmkante liegt bei ca. 24 %).
  { src: 'assets/img/_src/baumarbeiten-gewerbe.jpg', dir: 'assets/img/hero', name: 'gate-gewerbe-baumarbeiten',
    widths: [480, 960, 1200], webpWidths: [480, 960],   // 1200er WebP sprengt mit dichtem Laub das 200-KB-Budget
    crop: { aspect: 3 / 2, focusY: 0.45 } },
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
    const fit = (list) => {
      const w = list.filter((x) => x <= srcW);
      return w.length ? w : [srcW];
    };
    const widths = fit(s.widths ?? WIDTHS);
    // webpWidths: abweichende Breiten fuer WebP, wenn eine Stufe nur in AVIF
    // unter das 200-KB-Budget passt (Mechanik und Manifest-Feld wie in
    // build-hero-images.mjs, lib/images.mjs liest es bereits aus).
    const webpWidths = fit(s.webpWidths ?? s.widths ?? WIDTHS);

    for (const w of [...new Set([...widths, ...webpWidths])].sort((a, b) => a - b)) {
      const base = pipelineFor(srcAbs, meta, w, s.crop);
      const written = [];
      if (widths.includes(w)) {
        const out = path.join(outDir, `${s.name}-${w}.avif`);
        written.push([out, await writeVariant(base, out, 'avif', AVIF)]);
      }
      if (webpWidths.includes(w)) {
        const out = path.join(outDir, `${s.name}-${w}.webp`);
        written.push([out, await writeVariant(base, out, 'webp', WEBP)]);
      }
      for (const [p, n] of written) {
        const kb = (n / 1024).toFixed(0);
        if (n > MAX_BYTES) { over++; console.log(`  ⚠ ${kb} KB  ${path.relative(ROOT, p)} (> 200 KB!)`); }
        else console.log(`  ${kb.padStart(3)} KB  ${path.relative(ROOT, p)}`);
      }
    }

    // Fallback <name>.webp (fuer das <img>-Element in <picture>).
    const fbW = Math.min(960, Math.max(...webpWidths));
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
      ...(webpWidths.join() === widths.join() ? {} : { webpWidths }),
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
