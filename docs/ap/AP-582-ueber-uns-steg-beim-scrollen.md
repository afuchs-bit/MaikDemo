# AP-582 — Über uns: Steg erst beim Scrollen

## Anlass

Ansage des Auftraggebers am 02.10.2026: Beim Öffnen von Über uns soll der Steg über dem
Zitat „Kein Auftrag ist uns zu klein.“ noch nicht zu sehen sein. Er erscheint erst, wenn
man scrollt. Der Steg ist die waagerechte Linie mit der Blüte in der Lücke.

Der Steg existiert nur am Desktop, bis 900 px ist er `display:none` und dort steht die
Handy-Blüte. Bisher war die Linie eine feste Hintergrundgrafik und beim Laden immer
sichtbar. Die Blüte gehörte schon zur Zitat-Animation (AP-490). Auf Fenstern ab etwa
1190 px Höhe löste die Animation trotz AP-580 schon beim Laden aus.

## Umsetzung

- **`assets/css/ueber-uns.css`, ab 901 px:**
  - Der Linienverlauf liegt jetzt auf `.ueber-inhaber__steg::before` statt im
    Hintergrund des Stegs. Verlauf und Lage sind dieselben, die Blüte liegt mit
    `z-index: 1` darüber.
  - Ein neuer Block `@media (min-width: 901px) and (prefers-reduced-motion:
    no-preference)` startet die Linie bei `opacity: 0; transform: scaleX(0)`.
  - Mit `.is-in` zieht sie sich gleichzeitig mit der Blüte in 0,65 s aus der Lücke nach
    außen auf, mit derselben Kurve wie der Strich unter „zu klein.“.
- **`assets/js/main.js`, Block AP-490/564:** Am Desktop setzt das Skript `.is-in` erst
  nach dem ersten `scroll`-Ereignis, und auch dann nur, wenn das Zitat über der
  72-%-Linie steht. Bis 900 px bleibt alles wie bisher.
- **Cache-Busting:** `CSS_VERSION` → `20261002zc`, `JS_VERSION` → `20261002h`
  (`build-headers.mjs`). Die Folgeläufe von `build-leistungen` und `build-rechtstexte`
  ändern nichts.

## Prüfung (Chrome 154, headless)

**Beim Laden, Stand nach 3 s ohne Scrollen**

Linie, Blüte, Wörter und Signatur stehen auf Deckkraft 0, `.is-in` fehlt. Das gilt bei
1280×800, 1512×860, 1920×1080 und auch im hohen Fenster 1920×1440.

**Auslösung beim Scrollen**

| Fenster | ausgelöst bei scrollY |
|---|---|
| 1280×800 | 320 |
| 1512×860 | 280 |
| 1920×1080 | 120 |
| 1920×1440 (hohes Fenster) | schon nach 1 px Scrollen |

Gegenüber AP-580 liegen die Werte 40 px später. Das ist ein Messschritt und kommt vom
Rücklink aus AP-581, der die Seite um 12 px nach unten schiebt.

**Weitere Prüfungen**

- **Ablauf im hohen Fenster:** Nach 120 ms stehen Linie und Blüte halb, nach 1 s ganz.
  Danach folgen die Wörter.
- **Endzustand:** Der Steg samt Zitat ist bei 1280 und 1600 px pixelgleich zum Stand
  vorher.
- **Reduzierte Bewegung:** Alles steht sofort.
- **Handy bei 375 und 402 px:** pixelgleich zu HEAD. Die Auslösung liegt unverändert bei
  scrollY 360 und 160.

## Nachtrag: Scroll-Pfeil (02.10.2026)

Ansage des Auftraggebers: Wenn Steg und Zitat erst beim Scrollen erscheinen, soll unten
mittig ein pulsierender Pfeil das Scrollen anzeigen. Beim Scrollen verschwindet er.

**Umsetzung**

- **`ueber-uns/index.html`:** Nach der Hero-Sektion steht
  `<button class="ueber-scrollpfeil" data-ueber-scrollpfeil aria-label="Weiter nach unten" hidden>`.
  Darin liegt der Markenpfeil `maik-rohdich-cta-pfeil-rechts.svg`, derselbe wie beim
  Rücklink.
- **`ueber-uns.css`:**
  - Ab 901 px liegt der Knopf `fixed` unten mittig, 24 px über der Unterkante plus
    Safe Area.
  - Er ist ein Kreis von 52 px mit dunklem, unscharf hinterlegtem Grund und `--line`-Rand,
    `z-index` 40 und damit unter dem Kopf mit 50.
  - Der Pfeil ist 28 px lang, grün gefiltert und um 90° gedreht.
  - Das Pulsieren läuft über `ueber-scrollpfeil-puls`: 1,6 s, 7 px nach unten,
    Deckkraft 0,65 bis 1.
  - Ein-/Ausblenden über `.is-da` mit einer Opacity-Transition von 0,4 s.
  - Bis 900 px ist der Knopf `display:none !important`.
- **`main.js`, eigener Block nach der Zitat-Animation:**
  - Nur ab 901 px, nur wenn die Seite oben geöffnet wird (`scrollY == 0`) und nur ohne
    reduzierte Bewegung.
  - Der Pfeil erscheint nach 600 ms und verschwindet beim ersten Scrollen endgültig.
  - Ein Klick scrollt sanft zum Zitat.
  - Bei reduzierter Bewegung gibt es keinen Pfeil: Steg und Zitat stehen dann sofort, und
    die Blüte läge bei 1280 × 800 direkt hinter dem Pfeil.
- **Cache-Busting:** `CSS_VERSION` → `20261002zd`, `JS_VERSION` → `20261002i`. Folgeläufe
  der drei Builds ändern nichts.

**Prüfung (Chrome 154, headless)**

| Fall | Ergebnis |
|---|---|
| Laden bei 1280×800 und 1920×1080 | nach 300 ms unsichtbar, nach 1,5 s sichtbar; Mitte bei innerWidth/2, 24 px über der Unterkante, 52 × 52; Animation läuft |
| 1 px scrollen | nach 150 ms Deckkraft 0,42, nach 550 ms `hidden` |
| Zurück nach oben scrollen | Pfeil bleibt weg |
| Klick bei 1920×1080 | scrollt auf scrollY 264, `.is-in` gesetzt, Pfeil weg |
| Tastatur | 10. Tab-Schritt nach dem Rücklink; Fokusring 2 px in rgb(86,230,7); `aria-label` „Weiter nach unten“ |
| Reduzierte Bewegung | kein Pfeil |
| 402 und 768 px | `display:none` |
| Darstellung bei 1× und 2× | sauber; eine erste vergrößerte Ausschnittsaufnahme mitten im Pulsieren zeigte einen Kasten, das war ein Fehler der Aufnahme |
