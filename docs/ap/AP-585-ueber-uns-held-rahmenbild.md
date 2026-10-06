# AP-585 — Über uns: Held am Desktop wie der Rahmenbild-Held der Leistungsseite

Stand 06.10.2026 · Seite `/ueber-uns/` · nur ab 901 px. Handy bis 900 px pixelgleich.

## Auftrag

Ansage: „Ich möchte das Hero-Design für die Leistungsunterseite auch so bei der Über-uns-Hero
haben.“ Vorbild ist der Rahmenbild-Held der Balkonkasten-Seite (AP-565, Stand nach AP-584).

Entscheidungen 06.10.2026:
1. Das Startfoto wandert in den Held. In „Das Team“ entfällt es am Desktop (das zweite
   Exemplar aus AP-532 ist aus dem Markup entfernt).
2. Titel als Ersatz in Baloo 700, „Über“ weiß, „uns“ grün – ein Schriftzug-PNG kann später
   eingesetzt werden.
3. Kein Knopf im Held.

## Umsetzung

- `ueber-uns/index.html`:
  - `<span>` um „uns“ in der H1.
  - Zwei `<source media="(min-width: 901px)">` (AVIF/WebP, Hochkant-Zuschnitt) im Held-`<picture>`.
  - Preload des Hochkant-Bilds nur ab 901 px.
  - Zweites Foto-Exemplar in `.ueber-inhaber` entfernt.
- `assets/css/ueber-uns.css`:
  - Block AP-585 am Dateiende, nur ab 901 px:
    - Raster mit Randspalten und 52/48 wie AP-565, Mindesthöhe fensterhoch.
    - Wasserzeichen.
    - Rücklink in Zeile 1, Titel links und senkrecht mittig zur Karte.
    - Karte 3:4, höchstens 460 px, Hausecken 26/7, Rahmen 12 px versetzt, Stempel 140 px.
    - „Das Team“ einspaltig 600 px.
  - Aus dem AP-532-Block die Regeln des entfallenen Foto-Exemplars entfernt.
- `.github/scripts/build-headers.mjs`: eigener Schlüssel `UEBER_CSS_VERSION` (bisher hing
  `ueber-uns.css?v` an `CSS_VERSION`, ein Heben hätte `styles.css?v` überall geändert).
- Neue Bilder `assets/img/ueber/ueber-baumarbeiten-hoch-{480,844}.{avif,webp}`, mittig auf 3:4
  zugeschnitten aus `_src/ueber-baumarbeiten.jpg` (900 × 1125), sharp, WebP q70 / AVIF q48.

**Abweichung vom Entwurf:** Titelgröße `clamp(64px, 7vw, 120px)` statt `clamp(44px, 4.4vw, 80px)`.
Bei 1440 px stand „Über uns“ sonst nur 240 px breit neben einer 436 px breiten Karte; jetzt 382 px.

## Messwerte (headless Chrome)

| Fenster | Held | Titel | Karte | Titel-Mitte − Karten-Mitte | Bild |
|---|---|---|---|---|---|
| 901 × 900 | 788 px hoch | 64 px, 243 px breit | 391 × 521 | 0,0 | hoch-480.avif |
| 1024 × 768 | 656 | 72 px, 272 | 355 × 473 | −0,1 | hoch-480.avif |
| 1280 × 800 | 688 | 90 px, 340 | 363 × 484 | 0,0 | hoch-480.avif |
| 1440 × 900 | 788 | 101 px, 382 | 437 × 582 | 0,0 | hoch-480.avif |
| 1920 × 1080 | 968 | 120 px, 455 | 460 × 613 | 0,0 | hoch-480.avif |

- Rahmen `translate(12px, 12px)`, Karte rechtsbündig an der Containerkante.
- „uns“ in rgb(86, 230, 7).
- Kein Überlauf, keine Konsolenfehler, keine 404.
- Scroll-Pfeil (AP-582) erscheint unten mittig und überschneidet die Karte nicht.
- „Das Team“ steht mittig in 600 px, Steg und Zitat darunter wie bisher.
- Handy und Tablet 375/390/402/480/768/874: Element-Vergleich gegen den Stand davor ergibt
  0 Abweichungen; geladen wird dasselbe Bild wie vorher.

## Nachtrag 06.10.2026: „Das Team“ im Held unter dem Titel

Ansage: Überschrift „Das Team hinter dem Betrieb.“ und Absatz direkt unter dem Titel, mittig
darunter; der Titel mittig zwischen Containerkante und linker Fotokante.

- **Markup:** Kopie des Team-Blocks als `.ueber-hero__team` nach der H1.
  - Bis 900 px ist die Kopie `display:none`, ab 901 px ist das Original
    (`.ueber-inhaber__textblock`) aus. Je Breite gibt es genau eine sichtbare H2.
  - Beide Exemplare gleich halten.
- **Raster:** Spalten `Rand / 1fr / auto / Rand`. Spalte 3 ist so breit wie die Karte, Spalte 2
  endet an der Fotokante. Titel und Team-Block stehen darin mittig, zusammen senkrecht mittig zur
  Karte.
- **Kartenbreite:** `min(460px, (frei − 64) · .75, 44vw)`. Bei 901 px sind das 396 statt 391 px,
  sonst gleich.
- **Team-Block:** 480 px breit, Schrift und Blocksatz aus den vorhandenen Klassenregeln.
- **„Das Team“-Sektion am Desktop:** nur noch Steg und Zitat.

Gemessen bei 901/1024/1280/1440/1920:
- Titelmitte gegen die Mitte zwischen Kante und Foto: 0,0 px.
- Team-Block gegen Titel: 0,0 px.
- Block gegen Kartenmitte (senkrecht): 0,0 px.
- Abstand Text → Foto mindestens 18 px (bei 901).
- Kein Überlauf, keine Konsolenfehler.
- Handy und Tablet 375–874: 0 Abweichungen.
