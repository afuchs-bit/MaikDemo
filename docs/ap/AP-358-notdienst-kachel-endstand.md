# AP-358 — Notdienst-Kachel: roter Rand, roter Pfeil, Vorzeile zurück in Grau

**Auftrag:** roter Rand, Telefonnummer unverändert, Vorzeile „in den Ton wie er davor
war" (nach Rückfrage: das ursprüngliche Grau), schwarze Pille mit rotem Pfeil im
kräftigen Rot von „Route planen".

## Wo die Kachel jetzt steht

| Element | Wert | Kontrast |
|---|---|---|
| Rand | `rgba(226, 34, 25, .5)` | 1,57 : 1 gegen die Kachel — so präsent wie der grüne zuvor |
| Vorzeile „Rund um die Uhr erreichbar" | `var(--ink-mute)` #AEB5AA, `opacity: .84` | Ausgangszustand |
| Telefonnummer | `var(--coral-700)` #F2937A | 6,38 : 1 |
| Pille | `#0e100d` mit grünem Innenring | unverändert |
| Pfeil | `var(--coral)` #E22219 | 4,07 : 1 auf der Pille |
| Fokusring | `var(--home-lime)` | unverändert, nicht Teil des Auftrags |

**Zwei Rottöne, und das mit Absicht:** Rand und Pfeil tragen `--coral`, die
Telefonnummer `--coral-700`. Der Grund ist der Untergrund. Die Nummer steht auf der
Kachelfläche, wo das kräftige Rot nur 3,09 : 1 erreicht und bei 12 px Schrift unter
den geforderten 4,5 : 1 läge. Der Pfeil steht auf der fast schwarzen Pille, wo dasselbe
Rot 4,07 : 1 bringt — als Grafik braucht er 3 : 1.

## Diff

[assets/css/privat-form.css](../../assets/css/privat-form.css), iPhone-Block:

- **Rand** auf `rgba(226, 34, 25, .5)`. Die 50 % statt der grünen 24 % sind kein
  Versehen: `#E22219` ist deutlich dunkler als `#97CE20`; bei gleicher Deckkraft käme
  der Rahmen nur auf 1,17 : 1 statt 1,69 : 1 und wäre kaum zu sehen.
- **Vorzeile** zurück auf `var(--ink-mute)` mit `opacity: .84`.
- **Pfeil** über eine Maske mit `background: var(--coral)`. Die Grafik trägt
  `fill="#56E607"` fest im SVG — an einem `<img>` greift weder `color` noch
  `background`, und eine Filterkette träfe die Zielfarbe nur ungefähr. Das `@supports`
  bleibt der Sicherheitsgurt: ohne Maskenunterstützung bleibt das Bild stehen (grüner
  Pfeil) statt zu verschwinden.
- **`:active`-Rückmeldung** auf die rote Entsprechung. **Nicht ausdrücklich
  beauftragt**, aber notwendig: Sonst blitzte beim Antippen ein grüner Rahmen an einer
  rot umrandeten Kachel auf.

**Cache-Busting:** `privat-form.css` `?v=20260919g` → `?v=20260919h`.

## QA

| Prüfung | Ergebnis |
|---|---|
| Rand | `rgba(226, 34, 25, 0.5)` |
| Vorzeile | `rgb(174, 181, 170)`, `opacity: 0.84` |
| Telefonnummer | `rgb(242, 147, 122)` — unverändert |
| Pille | `rgb(14, 16, 13)`, grüner Innenring — unverändert |
| **Gemalte Pixel in der Pille** | `14,16,13` (1271 px) und `226,34,25` (110 px); weder `86,230,7` noch `242,147,122` |
| Geometrie | `b::after` 44,625 × 13,42 px, Pille 60,1 × 38,8 px — wie in allen Ständen davor |
| Fokusring | `rgb(140, 198, 63)` — unverändert |
| Gegenprobe ab 481 px, Leistungszeilen, Rezensionskachel | unverändert |
| Klammernbilanz | ok |

## Die vier Durchgänge an dieser Kachel

Die Einzeldokumente sind allein nicht mehr zu überblicken:

| Paket | was es tat | Stand heute |
|---|---|---|
| AP-354 | alles auf Rot, Pille rot, Pfeil weiß | abgelöst |
| AP-356 | zurück auf den alten Stand, drei rote Stellen (Vorzeile, Nummer, Pfeil in `--coral-700`) | teils abgelöst |
| AP-357 | Pfeil zurück auf Grün, Vorzeile auf `--coral` | abgelöst |
| **AP-358** | Rand rot, Vorzeile zurück in Grau, Pfeil rot in `--coral` | **gültig** |

Aus AP-356 gilt weiter: die Telefonnummer in `--coral-700` und die Maskentechnik für
den Pfeil.

## Nicht angefasst

Die Telefonnummer, Pille und Innenring, der Fokusring, Kachelhintergrund, Schriftart
und Text, die Leistungszeilen darunter, „Route planen" im Footer, alles aus AP-348 bis
AP-353 und AP-355, alles ab 481 px.
