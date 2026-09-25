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
import { mkdir, readFile, writeFile, readdir, unlink, stat } from 'node:fs/promises';
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
const ONLY = new Set(process.argv.slice(2));

// name = Basisname der Ausgabedateien; dir = Zielordner (relativ zum Repo-Root);
// src = Quelldatei (relativ zum Repo-Root).
//
// AP-443: avif / webp uebersteuern die globalen Kodiervorgaben FUER DIESEN
// EINTRAG. Gedacht fuer Bilder, die gross ausgespielt werden und bei denen die
// Vorgabe sichtbar zu weich kodiert - ohne alle anderen Bilder anzufassen. Die
// 200-KB-Grenze gilt unveraendert weiter: writeVariant senkt von hier aus ab,
// wenn es nicht passt.
const SOURCES = [
  { src: 'assets/img/_src/hero-garten-herne.png',            dir: 'assets/img/hero',                              name: 'hero-garten-herne' },
  // Privat-Tuer im Hero. Quelle 1440x1080 (4:3), Tuer ist ~3:2 - daher leichter
  // Zuschnitt (nur ~11 % Hoehe). focusY 0.65 laesst oben etwas Himmel stehen und
  // behaelt unten die Natursteinmauer als Bildbasis.
  { src: 'assets/img/_src/51FE5CE2-95A1-43F9-A555-963573FFD55C.JPG', dir: 'assets/img/hero', name: 'gate-privat',
    widths: [480, 960, 1200], crop: { aspect: 3 / 2, focusY: 0.65 } },
  // AP-374: vorgarten-herne-2026, teichanlage-bochum-2026 und
  // aussenanlagen-recklinghausen-2026 sind im CMS geloescht. Ihre Eintraege sind
  // hier entfernt, sonst legt der naechste Lauf die abgeleiteten Bilder wieder
  // an. Die Originale liegen unveraendert in assets/img/_src/ - wer die Projekte
  // zurueckholt, traegt sie hier wieder ein.
  { src: 'assets/img/_src/baumarbeiten-herne.webp', dir: 'assets/img/projekte/baumarbeiten-herne', name: 'baumarbeiten-herne' },
  // AP-441: Foto der Baumarbeiten unter dem Zitat der Person. Original 900x1125
  // (4:5, hochkant); angezeigt wird es liegend im Verhaeltnis 4:3 - auf Ansage
  // des Auftraggebers, weil hochkant bei 390px Fensterbreite 487px hoch waere,
  // gut die halbe Schirmhoehe. focusY 0.45 zeigt 18-78 % der Bildhoehe: oben
  // fallen Strasse und fremde Fahrzeuge weitgehend heraus, der Helm des vorderen
  // Arbeiters behaelt Luft nach oben, unten bleibt das Schnittgut als Bildbasis.
  // widths ausdruecklich: die Standardliste ist [480, 960, 1600], und 960 faellt
  // bei einer 900px breiten Vorlage heraus - uebrig blieben sonst allein 480px.
  // 900 ist alles, was die Vorlage hergibt.
  //
  // AP-443: Die Vorgabe (AVIF Qualitaet 50) kodierte dieses Bild sichtbar zu
  // weich - dichtes Laub und Saegespaene sind das Schlimmste, was ein Codec
  // bekommen kann. Gemessen am verlustfreien Ausschnitt:
  //   q50 effort 4 (Vorgabe)  124 KB   PSNR 27,16 dB
  //   q65 effort 6            195 KB   PSNR 32,16 dB
  //   q68 effort 6            227 KB   PSNR 34,60 dB   ueber der 200-KB-Grenze
  // Genommen ist q65/effort 6 - das Beste, was ins Budget passt. Das Bild wird
  // randlos ueber die ganze Schirmbreite ausgespielt und traegt jeden Fehler
  // gross mit; bei kleinen Kacheln lohnt der Aufschlag nicht.
  { src: 'assets/img/_src/ueber-baumarbeiten.jpg', dir: 'assets/img/ueber',
    name: 'ueber-baumarbeiten', widths: [480, 900], crop: { aspect: 4 / 3, focusY: 0.45 },
    avif: { quality: 65, effort: 6 } },
  { src: 'assets/img/_src/ueber-1.jpg', dir: 'assets/img/ueber', name: 'ueber-1' },
  { src: 'assets/img/_src/ueber-2.jpg', dir: 'assets/img/ueber', name: 'ueber-2' },
  { src: 'assets/img/_src/ueber-3.jpg', dir: 'assets/img/ueber', name: 'ueber-3' },
  // AP-160: kompakte Arbeitsbeispiele fuer die Vertrauensleiste im Homepage-Hero.
  // Die hochaufloesenden Originale bleiben in _src und werden nicht deployt.
  { src: 'assets/img/_src/rasengarten-forsythie.jpeg', dir: 'assets/img/home-proof', name: 'rasengarten-forsythie', widths: [160, 240, 320] },
  { src: 'assets/img/_src/gartenteich-palmen.jpeg', dir: 'assets/img/home-proof', name: 'gartenteich-palmen', widths: [160, 240, 320] },
  { src: 'assets/img/_src/kiesgarten-naturstein.jpeg', dir: 'assets/img/home-proof', name: 'kiesgarten-naturstein', widths: [160, 240, 320] },
  // AP-127: Leitfoto und zweites Kleinbild der neuen Ueber-Sektion.
  // OFFEN: Beide Quellen sind bisher nur 560 px breite Vorschauen aus dem
  // Mockup. Das Leitfoto wird ~390 px breit angezeigt, fuer 2x-Displays
  // braeuchte es ~780 px. Sobald die Originale vorliegen: hier nichts
  // aendern, nur die Datei in _src ersetzen und build-images neu laufen
  // lassen - die Breitenliste passt sich per fit() selbst an.
  { src: 'assets/img/_src/ueber-team.jpg', dir: 'assets/img/ueber', name: 'ueber-team' },
  // AP-310/AP-319: Der Eintrag 'ueber-hund' war entfallen, weil das Foto auf
  // keiner Seite mehr stand. AP-327 holt es zurueck - es steht jetzt im Fotoband
  // der Ueber-uns-Unterseite. Die fuenf Ableitungen sind byte-genau aus der
  // Historie zurueckgeholt (git show 9a5354f^:...), nicht neu gerechnet; dieser
  // Eintrag sorgt dafuer, dass ein spaeterer Lauf sie wieder erzeugt.
  { src: 'assets/img/_src/ueber-hund.jpg', dir: 'assets/img/ueber', name: 'ueber-hund', widths: [480, 960] },
  // AP-326: 'ueber-hebeaktion' ist nach build-hero-images.mjs umgezogen. Das
  // Original in _src ist nur 560 px breit (AP-127); dieselbe Aufnahme liegt
  // als 1440er Master IM Repo unter assets/img/gewerbe/partner/. Bliebe der
  // Eintrag hier stehen, wuerde ein lokaler Lauf dieses Skripts die 960er
  // Derivate wieder auf 480 zurueckschreiben.
  // AP-217: Standbild des Mustergarten-Videos, dient als poster und traegt die
  // Medienkachel. Quelle ist ein Einzelbild aus mustergarten.mp4 (960x725) - auf
  // diesem Rechner liegt kein ffmpeg, der Frame kam fertig aus dem Entwurf.
  // KEIN crop: die Kachel ist am Desktop 21:9 und auf dem Telefon 4:3, den
  // Ausschnitt macht object-fit im CSS. Mehr als 960 px gibt die Quelle nicht her.
  { src: 'assets/img/_src/mustergarten-standbild.jpg', dir: 'assets/img/ueber', name: 'mustergarten-standbild', widths: [480, 960] },
  // AP-280: Handschrift-Bildunterschrift der Ueber-uns-Sektion. Lag als 2,17-MB-PNG
  // ungerechnet im Deploy und ist zweimal eingebunden (zwei SVGs zeigen per viewBox
  // je die halbe Bildbreite). 1600 statt der ueblichen 480/960: das figcaption ist
  // 360 CSS-px breit, jedes SVG zeigt rund die halbe Breite - bei DPR 2 werden also
  // rund 1440 Geraetepixel ueber die volle Bildbreite gebraucht, 960 waere weich.
  { src: 'assets/img/_src/feierabend-im-mustergarten.png', dir: 'assets/img/ueber',
    name: 'feierabend-im-mustergarten', widths: [1600] },
  // Hochformat-Original (1440x1800, 4:5) fuer die Gewerbe-Tuer im Hero, die ein
  // liegendes Fenster von rund 3:2 ist. focusY 0.45 zeigt 21-74 % der Bildhoehe:
  // Strasse, Gebaeude und fremde Fahrzeuge fallen oben heraus, der Helm des
  // vorderen Arbeiters behaelt Luft nach oben (Helmkante liegt bei ca. 24 %).
  { src: 'assets/img/_src/baumarbeiten-gewerbe.jpg', dir: 'assets/img/hero', name: 'gate-gewerbe-baumarbeiten',
    widths: [480, 960, 1200], webpWidths: [480, 960],   // 1200er WebP sprengt mit dichtem Laub das 200-KB-Budget
    crop: { aspect: 3 / 2, focusY: 0.45 } },
  // Rezertifizierungs-Bescheinigung LWK-Baumkontrolleur (AP-274), Quelle 1131x1600 (Portrait).
  { src: 'assets/img/_src/zertifikat-lwk-baumkontrolleur.png', dir: 'assets/img/zertifikate', name: 'zertifikat-lwk-baumkontrolleur' },
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
  const outManifest = path.join(ROOT, 'data', 'images.json');
  let manifest = {};
  if (ONLY.size) {
    try {
      const current = JSON.parse(await readFile(outManifest, 'utf8'));
      manifest = current.bilder ?? {};
    } catch {
      // Ein gefilterter Erstlauf darf auch ohne vorhandenes Manifest starten.
    }
  }
  let over = 0;

  for (const s of SOURCES) {
    if (ONLY.size && !ONLY.has(s.name)) continue;
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
        written.push([out, await writeVariant(base, out, 'avif', { ...AVIF, ...s.avif })]);
      }
      if (webpWidths.includes(w)) {
        const out = path.join(outDir, `${s.name}-${w}.webp`);
        written.push([out, await writeVariant(base, out, 'webp', { ...WEBP, ...s.webp })]);
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
    await writeVariant(pipelineFor(srcAbs, meta, fbW, s.crop), fbOut, 'webp', { ...WEBP, ...s.webp });
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

  await mkdir(path.dirname(outManifest), { recursive: true });
  await writeFile(outManifest, JSON.stringify({
    _hinweis: 'AUTO-GENERIERT von .github/scripts/build-images.mjs – NICHT von Hand editieren.',
    bilder: manifest,
  }, null, 2) + '\n', 'utf8');

  console.log(`\n✅ Manifest: data/images.json (${Object.keys(manifest).length} Bilder).`);
  if (over) { console.error(`\n❌ ${over} Datei(en) über 200 KB.`); process.exit(1); }
}

await main();
