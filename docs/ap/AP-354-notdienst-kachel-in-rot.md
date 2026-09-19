# AP-354 — Notdienst-Kachel: grüne Akzente werden rot, Pfeil weiß auf Rot

**Auftrag:** „mach die grünen aktzente zu roten aktzenten (Telefonnummer, rand der
kachel), aber mach bei dem pfeil den hintergrund welcher gerade schwarz ist in rot und
mach den pfeil weiß"

Betroffen ist `.iphone-service-feature--emergency` — die einzige Kachel dieser Art auf
der Seite (gemessen: 1 × `.iphone-service-feature`).

## Rot ohne Erfindung

Das Projekt führt `--coral: #E22219` und `--coral-700: #F2937A`; der zweite ist seit
AP-F26 ausdrücklich der aufgehellte Ton für dunkle Flächen (`anfrage.css:33`). Welcher
wo steht, entscheidet der Kontrast auf dem Kachelgrund #252B22:

| | Ton | Kontrast |
|---|---|---|
| Telefonnummer | `--coral-700` | **6,38 : 1** — `--coral` käme auf 3,09 : 1 und läge bei 11,7 px Schrift unter den geforderten 4,5 : 1 |
| Weißer Pfeil auf roter Pille | `--coral` | **4,69 : 1** |

## Diff

Sieben Stellen in [assets/css/privat-form.css](../../assets/css/privat-form.css), alle
im iPhone-Block:

| Element | vorher | nachher |
|---|---|---|
| Kachelrand | `rgba(151,206,32,.24)` | `rgba(226,34,25,.5)` |
| Telefonnummer | `var(--mobile-logo-green, #56e607)` | `var(--coral-700)` |
| Pillen-Fläche | `#0e100d` | `var(--coral)` |
| Pillen-Innenring | `inset 0 0 0 1px rgba(151,206,32,.2)` | entfällt |
| Pfeil | `filter: none` | `filter: brightness(0) invert(1)` |
| Fokusring | `var(--home-lime, #97ce20)` | `var(--coral-700)` |
| `:active` Rand / Ring / Pfeil | grün / `filter: none` | rot / derselbe Weiß-Filter |

**Zur Deckkraft des Rands:** 50 % statt 24 % ist kein Versehen. `#E22219` ist deutlich
dunkler als das bisherige `#97CE20`; bei gleicher Deckkraft käme der Rahmen nur noch
auf 1,17 : 1 gegen die Kachel statt 1,69 : 1 und wäre kaum noch zu sehen. Mit 50 %
sind es 1,57 : 1.

**Zum weißen Pfeil:** Die Grafik ist ein `<img>` mit fest eingebautem `fill="#56E607"`
— `color` greift dort nicht. `brightness(0) invert(1)` macht daraus reines Weiß,
unabhängig von der Quellfarbe, ohne zweites Asset. Die `:active`-Regel setzte den
Filter auf `none` zurück; ohne Nachziehen hätte der Pfeil beim Tippen wieder grün
aufgeblitzt.

**Der Innenring der Pille** entfällt: Er war nötig, solange die Pille fast schwarz auf
dunkler Kachel saß. Die rote Fläche setzt sich von allein ab.

**Cache-Busting:** `privat-form.css` `?v=20260919d` → `?v=20260919e`.

## QA

| Prüfung | Ergebnis |
|---|---|
| Rand (390 px) | `rgba(226, 34, 25, 0.5)` |
| Telefonnummer | `rgb(242, 147, 122)` |
| Pille | `rgb(226, 34, 25)`, `box-shadow: none` |
| **Gemalte Pixel in der Pille** | häufigste Farbe `226,34,25` (1325 px), zweithäufigste `255,255,255` (109 px) — die Fläche ist rot, der Pfeil weiß; nicht nur der Filterwert, sondern das Bild belegt es |
| Fokusring (erzwungenes `:focus-visible` über CDP) | `rgb(242, 147, 122)`, 3 px solid, Versatz 3 px |
| Grüne Reste in der Kachel und allen Kindern | **0** (gesucht nach `#56E607`, `#97CE20`, `#8CC63F` und ihren rgb-Formen über alle Farb-, Rahmen-, Schatten- und Umriss-Eigenschaften) |
| Gegenprobe Leistungszeilen und Rezensionskachel | unverändert |
| Klammernbilanz, `index.html` 2722 Zeilen | ok |

## Nicht angefasst

Schriftart und Text der Kachel, die Leistungszeilen darunter, alles aus AP-348 bis
AP-353, alles ab 481 px.
