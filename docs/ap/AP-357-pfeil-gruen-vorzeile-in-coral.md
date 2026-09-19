# AP-357 — Pfeil wieder grün, Vorzeile im Rot von „Route planen"

**Auftrag:** „mach den pfeil grün wieder wie davor und mach den Text ‚Rund um die Uhr
erreichbar' in dem rot wie ‚Route planen'"

**Löst die Pfeil- und Vorzeilen-Entscheidung aus
[AP-356](AP-356-notdienst-kachel-drei-rote-stellen.md) ab.** Die Telefonnummer bleibt
nach Ansage auf `--coral-700`; in der Kachel stehen damit bewusst zwei Rottöne.

## Messung, und was dabei herauskam

`--coral` ist auf dieser Fläche schlechter lesbar als das, was dort stand:

| | Kontrast |
|---|---|
| Vorbild „Route planen": `#E22219` auf dem Footer `#171916` | 3,77 : 1 |
| Vorzeile vorher: `--coral-700` mit `opacity: .84` | 4,92 : 1 |
| Vorzeile mit `--coral` **und** `opacity: .84` | 2,49 : 1 |
| Vorzeile mit `--coral`, **ohne** die Deckkraft | **3,09 : 1** |

Die Zeile ist 10,5 px groß, in Versalien und gesperrt — die am schwersten lesbare der
Kachel; gefordert wären 4,5 : 1. Nach Offenlegung dieser Zahlen hat der Auftraggeber
die Variante **ohne die Deckkraft** gewählt: so nah am Vorbild wie möglich, und der
Ton kommt wenigstens voll durch statt zusätzlich gedämpft.

Dass das Vorbild selbst unter der Vorgabe liegt, ist offengelegt und bleibt außerhalb
dieses Pakets.

## Diff

[assets/css/privat-form.css](../../assets/css/privat-form.css), iPhone-Block:

- Der `@supports`-Block mit der Maske aus AP-356 ist **ersatzlos entfallen**. Damit
  wird das `<img>` mit seinem eingebauten `fill="#56E607"` wieder sichtbar — der
  Pfeil ist wie davor grün.
- `…__eyebrow`: `color: var(--coral)` statt `var(--coral-700)`, `opacity: .84`
  gestrichen. Die Messwerte und die Entscheidung stehen im Kommentar, damit die
  3,09 : 1 später nicht für ein Versehen gehalten werden.

**Cache-Busting:** `privat-form.css` `?v=20260919f` → `?v=20260919g`.

## QA

| Prüfung | Ergebnis |
|---|---|
| Vorzeile | `color: rgb(226, 34, 25)`, `opacity: 1` |
| **Gemaltes Pixel der Vorzeile** | kräftigster Wert `226,34,25` — der Ton kommt voll durch, keine gedämpfte Mischung |
| Telefonnummer | `rgb(242, 147, 122)` — unverändert |
| Pfeil | `img` wieder `display: block`, `filter: none`, `b::after` ohne `content` |
| **Gemalte Pixel in der Pille** | `14,16,13` (1269 px) und `86,230,7` (109 px); `242,147,122` verschwunden |
| Geometrie | Pille 60,1 × 38,8 px, Pfeil 44,6 × 13,4 px — exakt wie vor AP-356 |
| Rand, Pille, Innenring, Fokusring | `rgba(151,206,32,.24)`, `rgb(14,16,13)`, grüner Innenring, `rgb(140,198,63)` — alter Stand |
| Gegenprobe ab 481 px | Vorzeile `rgb(250, 250, 246)`, Leistungszeilen und Rezensionskachel unverändert |
| Klammernbilanz | ok |

## Nicht angefasst

Die Telefonnummer, der Kachelrand, die Pille, der Fokusring, „Route planen" im
Footer, alles aus AP-348 bis AP-353 und AP-355, alles ab 481 px.
