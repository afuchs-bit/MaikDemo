# AP-349 — Rezensionskachel auf das Grün des Anfrage-Knopfes

**Auftrag:** „Verändere den Grünton zu dem grünton welcher in dem Button ‚Projekt
anfragen' benutzt wird" (markiert: die Kategoriezeile „VORGARTEN-NEUGESTALTUNG" und die
Punkte der Wischleiste).

## Diagnose

Der mobile Knopf „Projekt anfragen" ist eine SVG-Form; ihre Füllung ist
`rgb(140, 198, 63)` = **#8CC63F**, also `--home-lime`, das Markengrün.

Die Rezensionskachel definierte für sich ein aufgehelltes **#B6D97A**
(`--green-500` im `@media (max-width: 480px)`-Block von `privat-form.css`), dazu elf
Flächen und Linien in `rgba(182,217,122, …)`. **Gleichzeitig** trug dieselbe Karte an
Rahmen und Lichtschimmer schon `rgba(140,198,63, …)` — es standen also zwei Grün im
selben Bauteil nebeneinander.

## Diff

Eine Datei, [assets/css/privat-form.css](../../assets/css/privat-form.css), alles im
`@media (max-width: 480px)`-Block:

- `--green-500: #b6d97a` → `#8cc63f`. Damit folgen die Kategoriezeile, der aktive
  Punkt und „In dieser Karte öffnen" automatisch.
- Das verbliebene feste `#b6d97a` (Glyphe des Aufklapp-Pfeils) auf `#8cc63f`.
- Elf `rgba(182,217,122, …)` auf `rgba(140,198,63, …)` — dieselben Deckkräfte,
  nur der Grundton. Betroffen: die Punkte der Wischleiste, die Trennlinien in Kopf
  und Fuß, Rahmen und Fläche des Aufklapp-Kastens, der Zitatstrich und das große
  Wasserzeichen.

`--green-700` stand bereits auf `#8cc63f` und bleibt.

**Cache-Busting:** `privat-form.css` `?v=20260918r` → `?v=20260918s`.

## QA

| Prüfung | Ergebnis |
|---|---|
| Füllung „Projekt anfragen" (390 px) | `rgb(140, 198, 63)` |
| Kategoriezeile | `rgb(140, 198, 63)` |
| Aktiver Punkt | `rgb(140, 198, 63)` |
| Inaktive Punkte | `rgba(140, 198, 63, 0.32)` |
| Kontrast der Kategoriezeile | #8CC63F auf Kartengrund #252B22 = **7,09 : 1**; die Zeile ist klein (10 px, 800), gefordert sind 4,5 : 1. Vorher 9,12 : 1 — der Ton wird also dunkler, bleibt aber deutlich über der Grenze |
| Reste von #B6D97A / rgba(182,217,122) im Stylesheet | 0 |
| Gegenprobe 481 px | Kategoriezeile weiterhin `rgb(49, 82, 0)` — der Block gilt nur bis 480 px |
| Fläche und Rand aus AP-348 | unverändert `rgb(37, 43, 34)` / `rgba(255, 255, 255, 0.12)` |
| Klammernbilanz | ausgeglichen |

## Nicht angefasst

Der Knopf selbst, die Sterne (gelb), die Kachelfläche und der Rand aus AP-348,
alles außerhalb von 480 px.
