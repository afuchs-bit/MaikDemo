// assets/js/config.js
// Zentrale Basis-Pfad-Auflösung – an GENAU dieser Stelle festgelegt.
// Funktioniert unter /MaikDemo/ (GitHub-Pages-Projektpfad) UND unter / (eigene Domain),
// UND auf Unterseiten (z. B. /MaikDemo/projekte/). Kein hartkodiertes /MaikDemo/.
//
// Der Site-Root wird aus der URL DIESES Moduls abgeleitet: config.js liegt fix unter
// <root>/assets/js/config.js, also ist <root> = ../../ relativ zur Modul-URL. Das ist
// seiten-unabhängig – anders als document.baseURI, das je nach Unterseite variieren würde.
export const SITE_BASE = new URL('../../', import.meta.url).href;

const isAbsolute = (p) => /^https?:\/\//i.test(p);

// Bild-/Asset-Pfad auflösen. Absolute (CDN-)URLs bleiben unverändert;
// im Content gespeicherte "/assets/…"-Pfade werden auf SITE_BASE rebasiert.
export const assetUrl = (p) =>
  isAbsolute(p) ? p : new URL(String(p).replace(/^\/+/, ''), SITE_BASE).href;

// Datenpfad (z. B. "data/projekte-index.json") auf SITE_BASE auflösen.
export const dataUrl = (p) =>
  new URL(String(p).replace(/^\/+/, ''), SITE_BASE).href;
