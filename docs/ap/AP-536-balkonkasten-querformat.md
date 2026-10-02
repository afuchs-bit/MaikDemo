# AP-536 — Balkonkasten-Seite im Querformat: Foto kleiner, Texte breiter

Stand 02.10.2026 · Branch `codex/homepage-review` (Basis `6200536f`, AP-534) ·
Seite `/privatkunden/leistungen/balkonkastenbepflanzung/` · nur 481–900 px.
Handy hochkant (≤ 480 px), Desktop (≥ 901 px) und die übrigen Leistungsseiten bleiben unverändert.

## Auftrag

Ansage des Auftraggebers, mit dem Handy quer geprüft (iPhone 16 Pro, 874 × 402):

- Das erste Foto soll etwas kleiner werden, aber nicht viel. Der Knopf darunter bleibt bündig mit dem Foto.
- Der Text unter „Ein Stück Garten vor Ihrem Fenster“ darf breiter werden.
- „Wir achten darauf, dass die Pflanzen …“ bekommt dieselbe Breite.
- Alles andere bleibt, wie es ist.

Auf Rückfrage entschieden: nur das Querformat, nur diese Seite, Breite 470 px. AP-534 wurde vorher einzeln committet (`6200536f`).

## Messwerte bei 874 × 402 (Chromium)

| Element | vorher | nachher |
|---|---|---|
| Startfoto `.lpv2-hero-media` | 504 × 378 | 470 × 353 |
| Knopf `.lpv2-mobile-hero-cta__button` | 504 | 470, linke Kante wie beim Foto (x 202) |
| Einstieg (`.lpv2-content-lead p`) | 367 (34ch bei 18 px) | 470, x 202 |
| „Sonne, Schatten …“ (`.lpv2-content-context p`) | 367 | 470, x 202 |
| „Wir achten darauf …“ (`.lpv2-content-service-copy`) | 326 (34ch bei 16 px) | 470, x 202 |
| Liste, Abschluss-Kachel | 326 / 384 | unverändert |

Den Absatz „Sonne, Schatten …“ habe ich mitgezogen. Er steht im Querformat direkt unter dem Einstieg, sonst lägen zwei Breiten untereinander. Bei 667 × 375 sind es dieselben 470 px.

Die Wortgruppen `.lpv2-mobile-keep` (`nowrap`) sind für die 34ch-Spalte im Hochformat gesetzt. Bei 470 px erzwangen sie frühe Umbrüche, zum Beispiel stand „zur Bewässerung“ allein in einer Zeile. In diesen drei Absätzen gilt deshalb im Band `white-space: normal`. Am Desktop macht AP-534 dasselbe.

## Umsetzung

- `assets/css/leistung-mobile.css`: neuer Block `@media (min-width:481px) and (max-width:900px)` am Dateiende. Er hängt an der Seitenklasse `lpv2-page--desktop-trichter` aus AP-534, der einzigen seitenspezifischen Klasse.
- `content/leistungen/privat/balkonkastenbepflanzung.json`: `mobileCssVersion` von `20261002g` auf `20261002i` gesetzt (Zwischenstand `h`).
- Build `node build-leistungen.mjs`: In der Balkonkasten-Seite ändert sich nur `leistung-mobile.css?v=`. Bei den übrigen 37 Seiten hat der Build nur die `main.js`-Version nachgezogen. Sie sind wie in AP-534 auf HEAD zurückgesetzt.

## Prüfung

- `stil-schnappschuss.mjs`/`stil-vergleich.mjs` über `main` vorher und nachher, Balkonkasten bei 402, 480 und 1280 px: je 263 Elemente, **0 Abweichungen**.
- Baumpflege als Stichprobe einer anderen Leistungsseite, bei 874 px: 250 Elemente, **0 Abweichungen**.
- Aufnahme bei 874 × 402 ohne Konsolen- oder Netzfehler.

## Nachtrag: Blocksatz (02.10.2026)

Ansage mit Screenshot vom iPhone quer: Die Absätze sollen rechts genauso weit über die Überschrift „Ein Stück Garten vor Ihrem Fenster“ hinausragen wie links, und sie sollen im Blocksatz stehen. Die Box war schon symmetrisch, im Flattersatz endeten die Zeilen rechts aber früher. Jetzt gilt für alle drei Absätze `text-align: justify`, die letzte Zeile steht links, dazu `hyphens: auto`. Das ist dieselbe Regel wie am Desktop (AP-534).

Gemessen an der Schrift selbst (Range-Rects) bei 874 px: Die Überschrift reicht von 246 bis 628, die Absätze von 202 bis 672. Damit stehen sie links und rechts je **44 px** über.

Die Schriftgröße ist im CSS unverändert (18 px / Zeile 30,6 px, Chromium vorher und nachher). Ob Safari die Texte im Querformat je nach Blockbreite unterschiedlich vergrößert (Text-Autosizing, `-webkit-text-size-adjust` ist im Projekt nicht gesetzt), ist auf dem Gerät noch nicht gemessen. Dafür gibt es einen Diagnose-Server im Scratchpad (`/vorher/` und `/jetzt/` mit Plakette), der nicht im Repo liegt.

Stilvergleich bei 402, 480 und 1280 px: weiterhin **0 Abweichungen**.
