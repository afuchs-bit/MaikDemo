# AP-356 — Notdienst-Kachel zurück auf den alten Stand, drei Stellen in Rot

**Auftrag:** „mach den alten wieder rein und verändere bei dem alten nur die
telefonnummer in rot und den pfeil und das rund um die uhr erreichbar"

**Dieses Paket löst [AP-354](AP-354-notdienst-kachel-in-rot.md) ab.** Dort war die
ganze Kachel auf Rot gestellt worden. AP-354 bleibt als Protokoll stehen; der Code
entspricht ihm nicht mehr.

Nach Rückfrage entschieden: Die Pille bleibt dunkel wie früher, nur der Pfeil darin
wird rot. Der Kachelrand geht zurück auf Grün — er gehörte nicht zu den drei genannten
Stellen.

## Zurückgenommen

AP-354 war nicht committet, der alte Stand stand vollständig im Diff. Sieben Stellen
tragen wieder ihre alten Werte:

| | zurück auf |
|---|---|
| Kachelrand | `rgba(151, 206, 32, .24)` |
| Pillen-Fläche | `#0e100d` |
| Pillen-Innenring | `inset 0 0 0 1px rgba(151, 206, 32, .2)` |
| Fokusring | `var(--home-lime, #97ce20)` |
| `:active` Rand / Ring / Pfeil | `rgba(151,206,32,.8)` / `.28` / `filter: none` |

## Ein Rot, nicht zwei

Alle drei roten Stellen bekommen `--coral-700` (#F2937A):

| | `--coral` #E22219 | `--coral-700` #F2937A |
|---|---|---|
| Vorzeile und Nummer auf der Kachel #252B22 | 3,09 : 1 — zu wenig für 10–12 px Schrift | **6,38 : 1** |
| Pfeil auf der Pille #0E100D | 4,07 : 1 | **8,40 : 1** |

Das kräftige `--coral` wäre auf der Pille möglich, auf der Kachelfläche aber nicht.
Dann stünden zwei verschiedene Rot in einem Bauteil — deshalb durchgehend der
aufgehellte Ton.

## Diff

[assets/css/privat-form.css](../../assets/css/privat-form.css), iPhone-Block:

- `…__eyebrow` und `…__meta` auf `var(--coral-700)`.
- Der Pfeil über eine **Maske**: Die Grafik trägt `fill="#56E607"` fest im SVG — an
  einem `<img>` greift weder `color` noch `background`, und eine Filterkette träfe die
  Zielfarbe nur ungefähr. Mit `mask` gibt die Grafik nur noch die Form vor, die Farbe
  kommt aus `background`. Dieselbe Technik steht in `mobile-social-proof.css` am
  Knopfrahmen.

```css
@supports ((mask-image: url("")) or (-webkit-mask-image: url(""))) {
  … b img { display: none; }
  … b::after {
    content: "";
    width: 2.875rem;
    aspect-ratio: 1883 / 567;
    background: var(--coral-700);
    -webkit-mask: url("../img/icons/maik-rohdich-cta-pfeil-rechts.svg") center / contain no-repeat;
            mask: url("../img/icons/maik-rohdich-cta-pfeil-rechts.svg") center / contain no-repeat;
  }
}
```

Das `@supports` ist der Sicherheitsgurt: Ohne Maskenunterstützung bleibt das `<img>`
stehen und der Pfeil ist grün statt verschwunden — eine leere Pille wäre der
schlechtere Ausgang.

**Cache-Busting:** `privat-form.css` `?v=20260919e` → `?v=20260919f`.

## QA

| Prüfung | Ergebnis |
|---|---|
| Kachelrand | `rgba(151, 206, 32, 0.24)` — alter Wert |
| Pille | `rgb(14, 16, 13)`, Innenring `rgba(151, 206, 32, 0.2)` — alter Wert |
| Fokusring (erzwungenes `:focus-visible`) | `rgb(140, 198, 63)` = `--home-lime` — alter Wert |
| Vorzeile und Telefonnummer | `rgb(242, 147, 122)` |
| **Gemalte Pixel in der Pille** | `14,16,13` (1271 px) und `242,147,122` (110 px); **kein** `86,230,7` mehr — die Maske sitzt |
| Pfeilgeometrie | `::after` misst 44,625 × 13,42 px, das alte `<img>` maß 44,6 × 13,4 px; die Pille steht unverändert bei 60,1 × 38,8 px |
| Grün in der Kachel | nur noch Rand und Pillen-Innenring — genau die beiden gewollten Stellen |
| Gegenprobe Leistungszeilen, Rezensionskachel | unverändert |
| Klammernbilanz | ok |

## Nicht angefasst

Kachelhintergrund, Schriftart, Text, die Leistungszeilen darunter, alles aus AP-348
bis AP-353 und AP-355, alles ab 481 px.
