# AP-353 — Rand der Rezensionskachel im Grün des Aufklapp-Kastens

**Auftrag:** „mach den rand von der markierten kachel in der farbe wie der rand von der
Kachel ‚Vollständige bewertung lesen'". Entschieden: **nur der Außenrand**, die
Querlinien im Inneren bleiben neutral.

**Dieses Paket löst die Randentscheidung aus [AP-348](AP-348-rezensionskachel-flaeche-und-rand.md) ab.**
Dort war der Rand ausdrücklich auf den neutralen Ton der Ablauf-Kachel gestellt worden.
Fläche und Bänder bleiben, wie AP-348 sie gesetzt hat.

## Diagnose

Gemessen bei 390 px:

| | Rand |
|---|---|
| Rezensionskachel | `rgba(255,255,255,.12)` |
| `.private-review-details` („Vollständige Bewertung lesen") | `rgba(140,198,63,.2)` |

Der Wert wurde nicht geraten — er steht im selben Medienblock am Kasten. (Die
Basisregel der Wischkarte trägt dort `rgba(140,198,63,.28)`, ein drittes, kräftigeres
Grün; maßgeblich ist der Wert des Kastens.)

## Diff

[assets/css/privat-form.css](../../assets/css/privat-form.css), die AP-348-Regel
`html.home-theme-dark .private-proof-bento .private-review-carousel.has-review-swipe`
im `@media (max-width: 480px)`-Block:

```css
border-color: rgba(140, 198, 63, .2);   /* statt var(--home-surface-border) */
```

Bewusst ein fester Wert statt des Tokens: `--home-surface-border` färbt auch die
beiden Querlinien in Kopf und Fuß, und die sollen neutral bleiben. Das Token steht
deshalb unverändert auf `rgba(255,255,255,.12)`.

**Cache-Busting:** `privat-form.css` `?v=20260919c` → `?v=20260919d`.

## QA

| Prüfung | Ergebnis |
|---|---|
| Kachelrand 390 px, alle vier Seiten | `rgba(140, 198, 63, 0.2)` |
| Rand des Kastens im selben Lauf | `rgba(140, 198, 63, 0.2)` — deckungsgleich |
| Querlinien Kopf und Fuß | `rgba(255, 255, 255, 0.12)` — unverändert neutral |
| Fläche und Radius der Kachel | `rgb(37, 43, 34)`, `20px` — unverändert |
| Gemalte Randpixel | `57,74,40` auf allen vier Seiten (vorher `63,68,60`) — ähnlich hell, der Rahmen bleibt gleich gut erkennbar |
| Gegenprobe 481 px und 1280 px | `rgba(49, 82, 0, 0.14)`, helle Fassung der Karte — unberührt |
| Klammernbilanz, `index.html` 2722 Zeilen | ok |

## Nicht angefasst

Fläche und Bänder der Kachel (AP-348), die Querlinien, der Grünton der Inhalte
(AP-349), die Wischpunkte (AP-351), der Fußzeilen-Link (AP-352), alles ab 481 px.
