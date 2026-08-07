#!/usr/bin/env node
// .github/scripts/build-hero-images.mjs (AP-76)
//
// Leitet responsive Derivate aus Bilddateien ab, die BEREITS IM REPO unter
// assets/img/projekte/ liegen - im Gegensatz zu build-images.mjs, dessen
// SOURCES auf die Originale in assets/img/_src/ zeigen (per .gitignore
// ausgeschlossen und damit nicht Teil des Repos).
//
// Bewusst ein eigenes Skript statt zusaetzlicher SOURCES-Eintraege in
// build-images.mjs:
//   - die drei Quellen liegen nicht in _src, sondern im Repo selbst;
//   - ein Lauf von build-images.mjs schriebe saemtliche Derivate UND
//     data/images.json neu und blaehte den Commit mit sachfremden
//     Aenderungen auf.
//
// data/images.json bleibt unangetastet. Stattdessen schreibt dieses Skript sein
// EIGENES Manifest nach data/images-repo.json (AP-77). Beide Dateien liest
// lib/images.mjs zusammen ein - fuer die generierten Seiten (render.mjs) und fuer
// die Karten-Varianten in data/projekte-index.json (build-index.mjs).
//
// Idempotent: mehrfaches Ausfuehren erzeugt dieselben Dateien neu.
//
//   cd .github/scripts && npm ci
//   node build-hero-images.mjs

import sharp from 'sharp';
import { mkdir, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');

// Identisch zu build-images.mjs, damit die Derivate beider Skripte gleich aussehen.
const AVIF = { quality: 50, effort: 4 };
const WEBP = { quality: 74, effort: 6 };
const MAX_BYTES = 200 * 1024;
const QUALITY_STEP = 6;   // Absenkung je Versuch, bis < 200 KB
const QUALITY_FLOOR = 28; // untere Grenze, darunter nicht mehr

// src = Quelle im Repo; dir = Zielordner; name = Basisname der Ausgabe;
// widths = gewuenschte Breiten (groessere als das Original werden verworfen);
// webpWidths = abweichende Breiten fuer WebP (optional, sonst wie widths).
const SOURCES = [
  {
    src: 'assets/img/projekte/gartengestaltung-herne/03ff56b1-b6e3-4d40-a9f7-4c613914ffa7.webp',
    dir: 'assets/img/projekte/gartengestaltung-herne',
    name: 'gartengestaltung-herne-hero',
    widths: [480, 960, 1440],
    // Kein 1440er WebP: das Motiv (Rasen, Kies, Laub) komprimiert schlecht und
    // bleibt selbst an der Qualitaetsuntergrenze bei ~318 KB, also weit ueber
    // dem 200-KB-Budget. AVIF deckt 1440 ab; Browser ohne AVIF-Unterstuetzung
    // bekommen den 960er WebP hochskaliert - eine verschwindende Minderheit.
    webpWidths: [480, 960],
  },
  {
    src: 'assets/img/projekte/moderne-vorgartengestaltung-mit-naturstein-und-stilvoller-bepflanzung-bochum/img_7043.webp',
    dir: 'assets/img/projekte/moderne-vorgartengestaltung-mit-naturstein-und-stilvoller-bepflanzung-bochum',
    name: 'vorgarten-bochum',
    widths: [480, 960],
  },
  {
    src: 'assets/img/projekte/poolbau-mit-individueller-gartengestaltung-herne/img_5012-1.webp',
    dir: 'assets/img/projekte/poolbau-mit-individueller-gartengestaltung-herne',
    name: 'poolumfeld-herne',
    widths: [480, 960],
  },
];

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
  let over = 0;
  const manifest = {};

  for (const s of SOURCES) {
    const srcAbs = path.join(ROOT, s.src);
    try {
      await stat(srcAbs);
    } catch {
      console.error(`\n❌ Quelle fehlt: ${s.src}\n`);
      process.exit(1);
    }

    const outDir = path.join(ROOT, s.dir);
    await mkdir(outDir, { recursive: true });

    const meta = await sharp(srcAbs, { failOn: 'none' }).metadata();
    const srcW = meta.width;

    // Nur Breiten <= Originalbreite; ist das Original kleiner, nimm die Originalbreite.
    const fit = (list) => {
      const w = list.filter((x) => x <= srcW);
      return w.length ? w : [srcW];
    };
    const widths = fit(s.widths);
    const webpWidths = fit(s.webpWidths ?? s.widths);

    for (const w of [...new Set([...widths, ...webpWidths])].sort((a, b) => a - b)) {
      const base = sharp(srcAbs, { failOn: 'none' })
        .resize({ width: w, withoutEnlargement: true });
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
        else console.log(`  ${kb.padStart(4)} KB  ${path.relative(ROOT, p)}`);
      }
    }

    // Fallback <name>.webp fuer das <img>-Element in <picture>.
    const fbW = Math.min(960, Math.max(...webpWidths));
    const fb = await writeVariant(
      sharp(srcAbs, { failOn: 'none' }).resize({ width: fbW, withoutEnlargement: true }),
      path.join(outDir, `${s.name}.webp`), 'webp', WEBP,
    );
    console.log(`  ${(fb / 1024).toFixed(0).padStart(4)} KB  ${s.dir}/${s.name}.webp (Fallback)`);

    // Schluessel ist der Originalpfad, wie ihn content/projekte/*.json fuehrt -
    // die UUID-Dateinamen bleiben also referenzierbar, ausgeliefert werden aber
    // die Derivate unter `base`.
    const fbH = Math.round((meta.height / srcW) * fbW);
    manifest[`/${s.src}`] = {
      base: `/${s.dir}/${s.name}`,
      widths,
      ...(webpWidths.join() === widths.join() ? {} : { webpWidths }),
      width: fbW,
      height: fbH,
      aspect: Number((fbH / fbW).toFixed(4)),
    };

    console.log(`✅ ${s.name}: ${widths.join('/')} px  (Original ${srcW}×${meta.height})`);
  }

  if (over) { console.error(`\n❌ ${over} Datei(en) über 200 KB.`); process.exit(1); }

  const outManifest = path.join(ROOT, 'data', 'images-repo.json');
  await mkdir(path.dirname(outManifest), { recursive: true });
  await writeFile(outManifest, JSON.stringify({
    _hinweis: 'AUTO-GENERIERT von .github/scripts/build-hero-images.mjs – NICHT von Hand editieren.',
    bilder: manifest,
  }, null, 2) + '\n', 'utf8');

  console.log(`\n✅ Manifest: data/images-repo.json (${Object.keys(manifest).length} Bilder).`);
  console.log('   data/images.json wurde bewusst NICHT verändert.');
}

await main();
