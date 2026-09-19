# AP-348 — Rezensionskachel bekommt Fläche und Rand der Ablauf-Kachel

**Auftrag:** „Mach die Kachelfarbe innen und den Kachelfarbe rand genauso wie bei der
Kachel ‚Erhaltungspflege'" (markiert: die Google-Rezensionskachel auf der mobilen
Startseite).

## Diagnose

Gemessen bei 390 px, `html.home-theme-dark`:

| | Rezensionen | Erhaltungspflege |
|---|---|---|
| Grundfläche | `#252B22` | `#252B22` — **schon identisch** |
| Rand | `rgba(183,203,160,.18)` grünlich | `rgba(255,255,255,.12)` neutral |
| Kopfband „Google Rezensionen" | `#2B3327` (heller) | — eine durchgehende Fläche |
| Fußband (Punkte) | `#22271F` (dunkler) | — |

Den sichtbaren Unterschied trugen also **die beiden Bänder und der Rand**, nicht die
Kachelfläche. Die Bänder kommen aus `--home-surface-high` und `--home-surface-low`,
der Rand aus `--home-surface-border` — drei Token, die im `@media (max-width: 480px)`-
Block von `privat-form.css` für die ganze iPhone-Welt gesetzt werden.

Die Ablauf-Kachel nimmt dagegen `--line` der dunklen Welt, `rgba(255,255,255,.12)`.

## Diff

Eine Regel in [assets/css/privat-form.css](../../assets/css/privat-form.css),
`html.home-theme-dark .private-proof-bento .private-review-carousel.has-review-swipe`:

```css
--home-surface-border: rgba(255, 255, 255, .12);
--home-surface-high: var(--home-surface-card);
--home-surface-low:  var(--home-surface-card);
```

Die beiden Folgeregeln für Kopf- und Fußband bleiben unberührt — sie lesen diese Token
ohnehin und flachen dadurch von selbst auf die Kachelfläche ab. Die Trennlinien
zwischen Kopf, Inhalt und Fuß bleiben stehen und wechseln auf denselben neutralen Ton
wie der Rand.

Die Umdefinition an der Karte statt an den Einzelregeln ist bewusst: Innerhalb dieses
Stylesheets liest die drei Token sonst niemand, der unter der Karte hängt — die
weiteren Vorkommen gehören zu Kontakt und FAQ und liegen außerhalb. `var(--line)` war
nicht nutzbar, weil die Karte `--line` für ihren hellen Ursprung selbst auf einen
dunklen Wert setzt, der auf dunklem Grund unsichtbar wäre.

**Cache-Busting:** `privat-form.css` `?v=20260918q` → `?v=20260918r` (steht nur in
`index.html`).

## QA

| Prüfung | Ergebnis |
|---|---|
| 390 px: Karte, Kopfband, Fußband | alle `rgb(37, 43, 34)` |
| 390 px: Rand und beide Trennlinien | `rgba(255, 255, 255, 0.12)` |
| Erhaltungspflege-Kachel im selben Lauf | `rgb(37, 43, 34)` / `rgba(255, 255, 255, 0.12)` — deckungsgleich |
| Eckenradius der Karte | weiterhin `20px` (Form war nicht beauftragt) |
| Gegenprobe 481 px und 1280 px | unverändert — die Regel liegt im `max-width: 480px`-Block |
| Gegenprobe `.private-contact .anf__kanal`, 390 px | Rand weiterhin `rgba(183, 203, 160, 0.18)` — die Token-Umdefinition ist lokal geblieben |
| Klammernbilanz `privat-form.css` | ausgeglichen |

**Hinweis zum Beleg-Screenshot:** Im Ausschnitt stehen zwei Rezensionen
nebeneinander. Das ist ein Artefakt der Aufnahme — das Karussell setzt seine Position
erst bei der ersten Bedienung, die es im Messlauf nie gibt. Im Browser steht die
aktive Rezension mittig. Mit dieser Änderung hat es nichts zu tun.

## Nicht angefasst

Eckenform und Schlagschatten der Rezensionskachel, die Ablauf-Kacheln, die hellen
Ursprungsregeln der Karte, alles außerhalb von 480 px.
