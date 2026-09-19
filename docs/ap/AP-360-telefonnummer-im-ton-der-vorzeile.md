# AP-360 — Telefonnummer im Ton der Vorzeile

**Auftrag:** „mach die telefonnummer wieder in dem Ton wie beim ‚Rund um die Uhr
erreichbar'"

## Diff

[assets/css/privat-form.css](../../assets/css/privat-form.css), an
`.iphone-service-feature--emergency .iphone-service-feature__meta`:
`color: var(--ink-mute)` statt `var(--coral-700)`.

Rot trägt die Kachel damit nur noch an Rand, Überschrift und Pfeil; Vorzeile und
Nummer treten gemeinsam zurück.

**Cache-Busting:** `privat-form.css` `?v=20260919i` → `?v=20260919j`.

## Warum die Nummer eine Spur heller ist

Die Vorzeile trägt zusätzlich `opacity: .84`. Dieselbe Dämpfung an der Nummer wäre
ein Fehler gewesen: Sie liegt am Elternelement, und in derselben Zeile hängt das `<b>`
mit der Pille — die Pille samt rotem Pfeil wäre mit abgedunkelt worden.

Gemessen an der gemalten Schrift:

| | hellste Tinte | Kontrast auf der Kachel |
|---|---|---|
| Vorzeile (mit `.84`) | `153,160,148` | 5,34 : 1 |
| Telefonnummer (ohne) | `174,181,170` | 6,90 : 1 |

Derselbe Farbton, ein Hauch heller. Wer sie exakt gleich haben will: die `.84` an der
Vorzeile streichen — dann stehen beide auf `174,181,170`, und die Vorzeile wird dabei
sogar etwas lesbarer.

## QA

| Prüfung | Ergebnis |
|---|---|
| Telefonnummer | `rgb(174, 181, 170)`, `opacity: 1` |
| Vorzeile | `rgb(174, 181, 170)`, `opacity: 0.84` — unverändert |
| **Pille nicht mitgedimmt** | `opacity: 1`, Fläche `rgb(14, 16, 13)`, Kasten 60 × 39 px |
| Überschrift, Rand, Pfeil | `rgb(226, 34, 25)` / `rgba(226,34,25,.5)` / rot — unverändert |
| Klammernbilanz | ok |

## Nicht angefasst

Vorzeile, Überschrift, Rand, Pille, Pfeil, Fokusring; alles aus AP-348 bis AP-353,
AP-355, AP-358 und AP-359; alles ab 481 px.
