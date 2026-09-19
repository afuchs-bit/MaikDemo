# AP-355 — „4,9/5" einen Pixel tiefer in der KPI-Signaturzeile

**Auftrag:** „die 4,9 / 5 sollen horizontal auf einer linie mittig mit den sternen
sein, verschiebe die 4,9/5"

## Befund

**Rechnerisch stand die Zahl schon mittig.** Gemessen wurde nicht an den Kästen,
sondern an den gemalten Pixeln (Tintenschwerpunkt, gewichtet nach Deckung, bei
vierfacher Auflösung):

| | Schwerpunkt | Kastenmitte der Tinte |
|---|---|---|
| Sterne | 1933,06 | 1932,38 |
| Ziffern | 1933,45 | 1933,75 |

0,4 px Unterschied. Auch `align-items: center` an `.mobile-kpi-signature__rating`
stand längst richtig, und die beiden Kästen begannen auf demselben Pixel.

Den Eindruck macht die **Form**: Die Sternspitzen ragen oben über die Ziffern hinaus,
die Sternbeine unten darunter. Die Zahl steckt beidseitig eingerückt in der Sternhöhe
und liest sich dadurch hochgesetzt.

Ein Verschieben war deshalb keine Korrektur auf einen berechneten Wert, sondern eine
Geschmacksentscheidung um ein bis zwei Pixel. Dem Auftraggeber wurden drei Varianten
im achtfachen Zoom vorgelegt; gewählt wurde **B, ein Pixel tiefer**.

## Diff

[assets/css/mobile-social-proof.css](../../assets/css/mobile-social-proof.css), an
`.gate-welcome--iphone .mobile-kpi-signature__rating strong`:

```css
transform: translateY(.07em);
```

**`em`, nicht `px`:** Die Schriftgrößen dieser Zeile skalieren mit dem Fenster — von
11,1 px bei 320 px Breite bis 15,0 px bei 430 px. Ein fester Pixelwert wäre auf
kleinen Geräten anteilig fast doppelt so viel. `.07em` hält das Verhältnis konstant.

**Cache-Busting:** `mobile-social-proof.css` `?v=20260919a` → `?v=20260919b`.

## QA

| Breite | Schriftgröße | Versatz | Anteil |
|---|---|---|---|
| 320 px | 11,14 px | 0,78 px | 0,07 em |
| 360 px | 12,54 px | 0,88 px | 0,07 em |
| 390 px | 13,58 px | 0,95 px | 0,07 em |
| 430 px | 14,98 px | 1,05 px | 0,07 em |

Tintenschwerpunkt der Ziffern danach: 1934,45 statt 1933,45 — genau der eine Pixel.
Die Sterne sind unberührt (1933,06). Klammernbilanz der Datei ausgeglichen,
`index.html` weiterhin 2722 Zeilen.

## Anmerkung zur Messung

Unter `file://` laden die Schriften nicht (die `@font-face`-Pfade sind absolut), und
`Nunito` fällt auf eine Ersatzschrift mit anderen Metriken zurück. Gemessen wurde
deshalb über den Vorschau-Server auf Port 8189, mit `document.fonts.check` als Beleg,
dass Nunito wirklich stand.

## Nicht angefasst

Die Sterne, die Google-Grafik, die Zeile „68 Google-Bewertungen", alles aus AP-348
bis AP-354.
