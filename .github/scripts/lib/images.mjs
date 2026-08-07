// .github/scripts/lib/images.mjs (AP-77)
//
// Eine Quelle fuer das Bild-Manifest. Es gibt zwei Erzeuger, die sich bewusst
// nicht in die Quere kommen sollen:
//
//   data/images.json       <- build-images.mjs   (Originale aus assets/img/_src/)
//   data/images-repo.json  <- build-hero-images.mjs (Quellen liegen im Repo)
//
// Getrennte Dateien, weil ein Lauf von build-images.mjs data/images.json
// vollstaendig neu schreibt und die Eintraege des anderen Skripts sonst still
// verschwinden wuerden. Beide Dateien tragen "AUTO-GENERIERT" und werden nicht
// von Hand editiert.
//
// Eintrag (Schluessel = kanonischer Bildpfad aus content/projekte/*.json):
//   base       Praefix der Derivate, ohne "-<breite>.<ext>"
//   widths     verfuegbare AVIF-Breiten
//   webpWidths verfuegbare WebP-Breiten (fehlt = identisch zu widths)
//   width/height/aspect  Masse des Fallbacks
//
// Der Fallback fuer <img src> ist immer `<base>.webp` — bei build-images.mjs ist
// das der kanonische Pfad selbst, bei build-hero-images.mjs das Derivat neben
// dem (grossen) Original. So landet nie eine Datei ueber 200 KB im <img src>.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '..', '..', '..');

const FILES = ['images.json', 'images-repo.json'];

let _cache;

// Gemischtes Manifest beider Erzeuger. Fehlende Dateien sind kein Fehler –
// dann faellt renderPicture auf ein einfaches <img> zurueck.
export function imageManifest() {
  if (_cache) return _cache;
  _cache = {};
  for (const file of FILES) {
    try {
      const raw = readFileSync(path.join(REPO_ROOT, 'data', file), 'utf8');
      Object.assign(_cache, JSON.parse(raw).bilder || {});
    } catch {
      // Datei fehlt oder ist kaputt – die andere kann trotzdem greifen.
    }
  }
  return _cache;
}

// Verfuegbare Breiten je Format. AVIF komprimiert besser und deckt deshalb
// gelegentlich eine Breite mehr ab als WebP (siehe build-hero-images.mjs).
export function widthsFor(entry, ext) {
  return (ext === 'webp' && Array.isArray(entry.webpWidths)) ? entry.webpWidths : entry.widths;
}

// Auszuliefernde Fallback-Datei fuer <img src> – nie das Original.
export function fallbackSrc(entry) {
  return `${entry.base}.webp`;
}
