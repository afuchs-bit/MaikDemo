// assets/js/config.js
// Zentrale Basis-Pfad-Auflösung – an GENAU dieser Stelle festgelegt.
// Funktioniert unter /MaikDemo/ (GitHub-Pages-Projektpfad) UND unter / (eigene Domain),
// weil der Base-Pfad aus document.baseURI abgeleitet wird. Kein hartkodiertes /MaikDemo/.

export const SITE_BASE = new URL('.', document.baseURI).href;

const isAbsolute = (p) => /^https?:\/\//i.test(p);

// Bild-/Asset-Pfad auflösen. Absolute (CDN-)URLs bleiben unverändert;
// im Content gespeicherte "/assets/…"-Pfade werden auf SITE_BASE rebasiert.
export const assetUrl = (p) =>
  isAbsolute(p) ? p : new URL(String(p).replace(/^\/+/, ''), SITE_BASE).href;

// Datenpfad (z. B. "data/projekte-index.json") auf SITE_BASE auflösen.
export const dataUrl = (p) =>
  new URL(String(p).replace(/^\/+/, ''), SITE_BASE).href;
