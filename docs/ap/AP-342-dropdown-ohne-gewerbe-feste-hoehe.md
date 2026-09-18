# AP-342 — Leistungs-Dropdown: nur noch die A–Z-Liste, feste Panelhöhe

**Datum:** 18.09.2026 · **Auftrag:** Die Gruppe „Für Gewerbekunden" aus dem
Leistungs-Dropdown entfernen; das Panel soll immer gleich groß bleiben, lieber scrollen.

## Diagnose

Der Höhendeckel aus AP-341 (`max-height: calc(100vh - 96px)`) hing am Fenster:

| Fensterhöhe | Panelhöhe vorher |
|---|---|
| 700 px | 604 px |
| 900 px | 804 px |
| 1080 px | 924 px (ungekürzt) |

Also bei jeder Fenstergröße eine andere. Gewünscht ist ein fester Wert.

**Die sieben Gewerbe-Leistungsseiten verwaisen durch die Streichung nicht** —
programmatisch geprüft, sie bleiben von der Startseite, `404.html`, `/kontakt/`,
`/ueber-uns/` und `/datenschutz/` aus verlinkt. Der Menüpunkt „Gewerbekunden" in der
obersten Ebene bleibt ebenfalls stehen.

## Diff

**[lib/render.mjs](.github/scripts/lib/render.mjs)** — `renderNavSubmenu` gibt nur noch
`block(WELTEN.privat)` aus. **`WELTEN.gewerbe` bleibt vollständig erhalten**: Der Eintrag
steuert weiterhin die Seitengenerierung, die Brotkrumen und `weltPfadFuerSlug`. Nur aus
dem Dropdown fällt er heraus.

**[assets/css/styles.css](assets/css/styles.css)** — vier Stellen:

1. **Feste Höhe** statt Deckel: `height: 480px` (weiterhin nur ab 901 px, `overflow-y:
   auto`, `overscroll-behavior: contain`). 480 px zeigt rund 10 der 21 Einträge
   (Zeilenhöhe 41 px, Köpfe und Polster zusammen 71 px) und endet bei höchstens
   `61 + 480 = 541 px` — passt damit auch auf kleine Notebook-Fenster.
2. **Eine Spalte:** `.nav-submenu--welten { grid-template-columns: 1fr }`. Die Basisregel
   setzt zwei; mit nur einer Gruppe wäre die zweite leer geblieben und das Dropdown
   doppelt so breit wie nötig. Gemessen: Panelbreite von 669 px auf 284 px.
3. **`align-self: stretch` entfällt.** Diese Zeile sollte „beide Panels gleich hoch"
   machen. Mit einer Gruppe und fester Panelhöhe hätte sie geschadet: Die Gruppe hätte
   sich auf die sichtbaren 464 px gestreckt, während ihr Inhalt 861 px hoch ist — der
   grüne Gruppenhintergrund wäre beim Scrollen nach rund zehn Einträgen ausgelaufen und
   der Rest hätte auf dem nackten Panel gestanden. Die Zeile fiel beim Lesen auf, nicht
   im Bild; ohne sie ist die Gruppe 906 px hoch und trägt alle 21 Einträge.
4. Die tote Regel `.nav-submenu-group:nth-child(2) { background: var(--bg-soft) }`
   (Gewerbe-Panel) ist weg, die beiden Kommentare über „beide Panels" sind nachgezogen.

**Die 37 ausgelieferten Seiten:** Block ersetzt wie in AP-341 — sechs über die
`BUILD`-Marker, 31 über ausgeglichene `<ul>`-Zählung, Pfadpräfix je Datei aus dem
vorhandenen Block gelesen. Kein `build-leistungen.mjs`-Lauf im Arbeitsbaum.

**Cache-Busting:** `styles.css?v=20260918k` → `?v=20260918l` in allen 37 Seiten.

## QA

- **Höhe konstant**, gemessen mit geöffnetem Panel:

  | Fenster | Panelhöhe | Unterkante | ragt heraus |
  |---|---|---|---|
  | 901 × 700 | 480 px | 532 px | 0 |
  | 1280 × 900 | 480 px | 538 px | 0 |
  | 1440 × 1080 | 480 px | 541 px | 0 |

- Eine Gruppe, 21 Einträge, eine Spalte (Spur 266 px), Panelbreite 284 px.
- **Probe auf Punkt 3:** Gruppenhöhe 906 px bei 922 px Inhalt, der letzte Eintrag liegt
  innerhalb des grünen Gruppenhintergrunds — beim Scrollen ans Ende bleibt der Grund
  erhalten.
- **Tastatur:** Tab-Kette erreicht „Zäune & Sichtschutz", das Panel scrollt den Eintrag
  selbst ins Bild (`scrollTop` 444), `:focus-visible` greift, der Eintrag liegt
  vollständig im sichtbaren Bereich.
- **Handy (390 × 844):** Untermenü klappt in der Karte auf (`display: grid`, Höhe 1012 px
  im Fluss, `overflow: visible` — kein verschachtelter Scrollbereich), 21 Einträge, Karte
  scrollt, Instagram-Zeile erreichbar, kein waagerechter Überlauf.
- **Rebuild-Trockenlauf** in einer Wegwerf-Kopie: erzeugter Block auf vier Stichproben
  zeichengleich mit dem handgesetzten.
- „Für Gewerbekunden" im Dropdown auf **0** Seiten übrig, A–Z-Kopf auf 37 Seiten.
  Zwei generierte Leistungsseiten stichprobenartig geprüft, `check-config-sync.mjs`
  Exit 0.

## Bezug zu AP-341

Der dort eingeführte Höhendeckel `max-height: calc(100vh - 96px)` ist durch die feste
Höhe ersetzt. Der Grund für die Regel bleibt derselbe: 21 Zeilen passen nicht ungekürzt
auf ein 900-px-Fenster.
