# AP-535 — Über uns: Querformat am Handy

Stand 02.10.2026 · Branch `codex/homepage-review` · Seite `/ueber-uns/`
Nur das Band 481–900 px. Hochformat (≤ 480 px) und Desktop (≥ 901 px) bleiben unverändert.

## Auftrag

Der Auftraggeber hat die Seite auf dem Handy quer geprüft (iPhone 16 Pro, 874 × 402) und Folgendes angesagt:

- Das erste Foto wird kleiner. Der Text unter „Das Team hinter dem Betrieb.“ steht mittig.
- Zitat und Titel bleiben unverändert.
- Die beiden Absätze unter „Ehrlich beraten, sauber gebaut“ stehen mittig und dürfen breiter werden.
- Die Zusage-Kachel bleibt. Das Foto darunter wird zentriert.
- „Alles aus einer Hand“ und „Für wen wir arbeiten“ bleiben.
- Die drei Projekte werden kleiner.

Auf Rückfrage entschieden: Das Foto wird **440 px** breit, die Projekte bleiben ein **Karussell mit kleineren Karten**.

## Messwerte bei 874 × 402 (Chromium)

| Element | vorher | nachher |
|---|---|---|
| Startfoto `.ueber-hero .ueber-hero__foto` | 760 × 570, x 57 | 440 × 330, x 217 (mittig) |
| `.ueber-inhaber__text` | 804 px, `start` | 600 px, `center`, x 137 |
| `.ueber-betrieb__fakten` | 416 px, `start`, x 35 | 600 px, `center`, x 137 |
| `.ueber-betrieb__wort .lead` | 587 px, `start`, x 35 | 600 px, `center`, x 137 |
| `.ueber-betrieb__bild` | 440 px, x 35 | 440 px, x 217 (mittig) |
| Projektkarte | 627 × 600 | 320 × 390 |

## Umsetzung

- `assets/css/ueber-uns.css`: neuer Block `@media (min-width: 481px) and (max-width: 900px)` am Dateiende. Er gewinnt bei gleicher Spezifität gegen die 900er- und 481er-Regeln weiter oben.
- `ueber-uns/index.html`: `ueber-uns.css?v=20261002b` → `?v=20261002c`.

Tablets im Hochformat (768 px) liegen im selben Band und bekommen dieselbe Anordnung.

## Prüfung

- Aufnahmen bei 874 × 402 und 667 × 375: Foto, Texte und Hebeaktion-Foto stehen mittig. Zwei Karten sind ganz zu sehen, die dritte angeschnitten. Keine Konsolen- oder Netzfehler.
- `stil-schnappschuss.mjs` und `stil-vergleich.mjs` über `main` bei 402, 480 und 1280 px, vorher gegen nachher: jeweils 124 Elemente, **0 Abweichungen**.
