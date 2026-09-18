# AP-343 — Handy-Menü: Karte bleibt gleich groß, Leistungen scrollen darin

**Datum:** 18.09.2026 · **Auftrag:** Die Menükarte soll beim Aufklappen der Leistungen
ihre Größe behalten. Galerie, Über uns und Kontakt treten zurück, an ihrer Stelle
erscheinen die Leistungen und lassen sich dort scrollen. Über den Pfeil geht es zurück.

## Diagnose

Gemessen bei 390 × 844:

| | vorher |
|---|---|
| Karte zugeklappt | 396 px |
| Karte aufgeklappt | 746 px (am Deckel `100dvh − Kopfzeile − 16px`) |
| Inhalt aufgeklappt | 1406 px, die Karte selbst scrollte |

Beim Aufklappen wuchs die Karte also auf fast das Doppelte und schob sich über den halben
Bildschirm. Die 396 px sind über die Breiten stabil (360, 390, 430 px gemessen, kein
Zeilenumbruch in den Beschriftungen): 8 + 8 Polster, sechs Einträge à 47 px, die
Instagram-Zeile 56 px, sechs Abstände à 6 px.

## Diff

Alles in **[assets/css/styles.css](assets/css/styles.css)**, im `@media (max-width: 900px)`-Block.

**1. Feste Kartenhöhe.** Aus dem Deckel wird ein Wert:

```css
--menue-karte: 396px;
height: min(var(--menue-karte), calc(100dvh - var(--header-h, 76px) - 16px));
```

`min()` behält den bisherigen Deckel als Sicherung für kleine Geräte. Wer Menüpunkte
hinzunimmt oder streicht, muss den Wert mitziehen — sonst bleibt Leerraum unter dem
letzten Eintrag oder die Karte scrollt selbst.

**2. Der Leistungen-Eintrag ist ein Raster statt einer umbrechenden Flexzeile.**

```css
.menu-item--sub {
  display: grid;
  grid-template-columns: 1fr auto;      /* Beschriftung | Pfeil */
  grid-template-rows: auto minmax(0, 1fr);  /* Zeile | Untermenü */
}
```

Mit der früheren `flex-wrap`-Zeile ging das nicht: In einem umbrechenden Flexcontainer
verteilt `align-content` die Resthöhe auf **beide** Zeilen — die Beschriftungszeile wäre
mitgewachsen. Das Raster gibt die ganze Resthöhe gezielt der zweiten Zeile.

**3. Aufgeklappt nimmt der Eintrag den freien Platz, die folgenden treten zurück.**

```css
.menu-item--sub.is-open { flex: 1 1 auto; min-height: 0; }
.menu-item--sub.is-open ~ li:not(.menu-meta) { display: none; }
```

`~` trifft genau die Einträge **nach** Leistungen — Gewerbekunden darüber bleibt stehen.
Die Instagram-Zeile ist ausgenommen: Sie ist kein Menüpunkt, sondern der Fuß der Karte.
Das `:not()` sagt das ausdrücklich; ohne es bliebe sie zwar auch stehen, aber nur, weil
ihre eigene Regel vier Klassen trägt und damit stärker ist. Auf so einen Zufall soll sich
niemand verlassen müssen.

**4. Das Untermenü scrollt in seinem Rasterfeld.**

```css
.menu-item--sub > .nav-submenu { grid-column: 1 / -1; align-self: stretch; }
.menu-item--sub.is-open > .nav-submenu { display: grid; min-height: 0; overflow-y: auto; overscroll-behavior: contain; }
```

**`align-self: stretch` ist der Kern und fiel erst in der Messung auf.** Das Raster trägt
`align-items: center`, damit Beschriftung und Pfeil in Zeile 1 auf einer Linie sitzen —
das galt aber auch für das Untermenü in Zeile 2: Es blieb auf seiner vollen Inhaltshöhe
stehen und lief mittig aus der Zeile heraus. Gemessen im Zwischenstand: Rasterzeile
212 px, Untermenü 1012 px, Karte scrollte statt Untermenü. Mit `align-self: stretch`
füllt es die Zeile, und erst dadurch greift `overflow-y: auto`.

`min-height: 0` an beiden Stellen ist die übliche Notwendigkeit, damit Flex- und
Rasterelemente unter ihre Inhaltshöhe schrumpfen dürfen.

**Cache-Busting:** `styles.css?v=20260918l` → `?v=20260918n` in allen 37 Seiten
(zwei Durchgänge: Grundumbau, dann die beiden Korrekturen).

## QA

Gemessen bei 360, 390 und 430 px Breite, jeweils voller Zyklus zu → auf → zu:

| | 360 | 390 | 430 |
|---|---|---|---|
| Karte zugeklappt | 396 px | 396 px | 396 px |
| Karte aufgeklappt | 396 px | 396 px | 396 px |
| Karte wieder zugeklappt | 396 px | 396 px | 396 px |
| Karte scrollt selbst | nein | nein | nein |
| Untermenü sichtbar / Inhalt | 212 / 1012 px | 212 / 1012 px | 212 / 1012 px |
| Untermenü scrollt | ja | ja | ja |
| letzter Eintrag erreichbar | ja | ja | ja |
| waagerechter Überlauf | 0 | 0 | 0 |

- **Aufgeklappt sichtbar:** Gewerbekunden, Leistungen, Instagram-Zeile. Galerie, Über uns,
  FAQ und Kontakt treten zurück und kommen nach dem Einklappen vollständig wieder.
- **Desktop unberührt:** bei 901 und 1280 px weiterhin `display: flex` am Eintrag,
  Dropdown 480 × 284 px, sechs Menüpunkte, kein Überlauf. Alle Änderungen liegen im
  900-px-Block.
- Generierte Leistungsseite stichprobenartig (Handy): 396 px in beiden Zuständen,
  Untermenü scrollt. `check-config-sync.mjs` Exit 0.

## Bezug

AP-342 hat die feste Höhe für das **Desktop-Dropdown** eingeführt (480 px). Dieses
Arbeitspaket macht dasselbe für die **Handy-Karte** — andere Mechanik, gleiches Ziel:
keine springenden Größen, lieber scrollen.
