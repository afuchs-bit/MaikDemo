# AP-350 / AP-351 — Wischpunkte: weißer Ring raus und wieder rein

**Auftrag AP-350:** „sind die seitenpunkte in der sektion das selbe grün wie #8CC63F,
wenn nicht passe es an"
**Auftrag AP-351:** „mach den weißen ring wieder rein"

## Befund

Die **Füllung** der Punkte war seit AP-349 richtig. Aufgehellt wurden sie durch etwas
anderes: `box-shadow: inset 0 0 0 1px #fff` an jedem Punkt. Bei 7 px Durchmesser
frisst dieser 1-px-Ring den Rand.

Am gemalten Bild bei 390 px:

| | Mitte | Rand |
|---|---|---|
| aktiver Punkt | `140,198,63` | `255,255,255` |
| inaktive Punkte | `70,93,43` | `247,248,246` |

Die Punkte lesen sich deshalb heller als das Markengrün, das unter ihnen liegt.

## Verlauf

**AP-350** hat den Ring entfernt. Danach trug der aktive Punkt durchgehend
`140,198,63`, Mitte wie Rand. Die Deckkraft der inaktiven Punkte musste dabei von
`.32` auf `.6` steigen: Ohne den hellen Ring kamen sie nur noch auf 1,98 : 1 gegen den
Kartengrund; mit `.6` auf 3,52 : 1, die 3 : 1, die ein Bedienelement braucht.

**AP-351** hat beides zurückgenommen — der Ring ist gestalterisch gewollt. Die
Deckkraft geht mit auf `.32` zurück, denn `.6` war nur der Ausgleich für den
fehlenden Ring; mit Ring übernimmt er die Sichtbarkeit wieder.

Der Stand entspricht damit wieder dem vor AP-350, mit dem Grünton aus AP-349.

## Diff

[assets/css/privat-form.css](../../assets/css/privat-form.css), im
`@media (max-width: 480px)`-Block: `box-shadow: inset 0 0 0 1px #fff` an beiden
Punktzuständen, `box-shadow` wieder in der `transition`, inaktive Punkte auf
`rgba(140,198,63,.32)`.

**Cache-Busting:** `privat-form.css` `?v=20260918s` → `?v=20260919a` (AP-350) →
`?v=20260919b` (AP-351).

## QA nach AP-351

| Prüfung | Ergebnis |
|---|---|
| Aktiver Punkt | Füllung `rgb(140, 198, 63)`, Ring `255,255,255` |
| Inaktive Punkte | `rgba(140, 198, 63, 0.32)`, Ring `247,248,246` |
| `box-shadow` | `rgb(255,255,255) 0px 0px 0px 1px inset` an allen vier |
| Stand | identisch zu vor AP-350 |

## Zwischenfall beim Cache-Busting (AP-350)

Ein Einzeiler der Form `open(f,"w").write(open(f).read().replace(...))` hat
**index.html geleert**: Python wertet das Dateiobjekt vor dem Argument aus, `"w"`
kürzt die Datei also auf null, gelesen wurde anschließend die leere Datei. Die Seite
wurde aus `HEAD` zurückgeholt (2722 Zeilen, vollständig) und der Parameter mit
getrenntem Lesen und Schreiben neu gesetzt.

**Regel:** erst vollständig lesen, prüfen (`assert s.count(alt) == 1` und
`assert len(s) > 1000`), dann schreiben. Nie verschachtelt.

## Nicht angefasst

Fläche und Rand aus AP-348, der Grünton aus AP-349, der gelbe Fokusring der Punkte,
alles außerhalb von 480 px.
