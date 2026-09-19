# AP-359 — „24h Baum- & Sturmnotdienst" im Rot von „Route planen"

**Auftrag:** „mach das 24h .. mal in dem ‚Route planen' rot"

## Diff

[assets/css/privat-form.css](../../assets/css/privat-form.css), an
`.iphone-service-feature--emergency .iphone-service-feature__body > strong`:
`color: var(--coral)` (#E22219). Vorher erbte die Zeile das Fast-Weiß des Links.

**Cache-Busting:** `privat-form.css` `?v=20260919h` → `?v=20260919i`.

## Der Preis, offengelegt

| | Kontrast auf der Kachelfläche #252B22 |
|---|---|
| vorher (`#FAFAF6`) | **13,87 : 1** |
| jetzt (`--coral` #E22219) | **3,09 : 1** |

Die Zeile misst 13,5 px bei 320 px Breite bis 18,2 px bei 430 px, mager und kursiv in
einer Comic-Sans-Schrift. Als „große Schrift" im Sinne der Richtlinie (ab 18,66 px
fett oder 24 px mager) zählt sie damit nicht — gefordert wären 4,5 : 1.

Sie war vorher das am besten lesbare Element der Kachel und ist jetzt das am
schlechtesten lesbare. Umgesetzt auf ausdrückliche Ansage nach Offenlegung dieser
Zahlen; im Code-Kommentar steht es ebenfalls, damit es beim nächsten Aufräumen nicht
als Versehen korrigiert wird.

Wer den Effekt behalten, aber die Lesbarkeit zurückhaben will: `--coral-700` (#F2937A)
trägt denselben Farbeindruck bei 6,38 : 1 — das ist der Ton, den die Telefonnummer
darunter schon hat.

## QA

| Prüfung | Ergebnis |
|---|---|
| Überschrift | `rgb(226, 34, 25)` |
| **Gemaltes Pixel** | kräftigster Wert `226,34,25` — der Ton kommt voll durch |
| Rand, Vorzeile, Nummer, Pille, Pfeil | unverändert (`rgba(226,34,25,.5)`, `rgb(174,181,170)`, `rgb(242,147,122)`, schwarz, rot) |
| Kastenmaße der Zeile | 234 × 19 px — unverändert, eine reine Farbänderung |
| Klammernbilanz | ok |

## Nicht angefasst

Alles andere an der Kachel, alles aus AP-348 bis AP-353, AP-355 und AP-358, alles ab
481 px.
