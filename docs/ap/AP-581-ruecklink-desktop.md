# AP-581 — Rücklink „← Startseite“ auch am Desktop

## Anlass

Ansage des Auftraggebers am 02.10.2026: Die Navigationsleiste über dem Seitentitel ist
auf dem Handy ein kompakter Rücklink. Er besteht aus einem grünen Pfeil nach links und
dem unterstrichenen Wort „Startseite“, der Name der aktuellen Seite steht nur für
Screenreader da. Diese Fassung soll auf der ganzen Website auch am Desktop gelten. Dort
stand bisher der Krümelpfad „Startseite › Über uns“.

## Bestand

| Seiten | Handy | Desktop vorher | Desktop jetzt |
|---|---|---|---|
| 38 Leistungsseiten | Rücklink | Rücklink (seit AP-512, `@media all`) | unverändert |
| Kontakt, Galerie, Impressum, Datenschutz | Rücklink, `.breadcrumbs--home-back` | Pfad | Rücklink |
| Über uns | Rücklink, eigene `.ueber-hero__*`-Regeln | Pfad | Rücklink |
| 6 Projektdetailseiten | Pfad | Pfad | unverändert (Ansage) |

## Umsetzung

- **`assets/css/styles.css`:** Die `.breadcrumbs--home-back`-Regeln standen bisher in
  `@media (max-width: 480px)` und stehen jetzt in `@media all`. Sie tragen nur das
  Aussehen, die Lage bleibt die der jeweiligen Seite, also links am Container.
- **`assets/css/ueber-uns.css`:** Über uns hat eine eigene Handy-Fassung mit 13,6 px aus
  `.breadcrumbs ol` in `--ink-mute`. Die anderen Seiten nutzen 12,16 px in
  `--home-on-dark-2`. Die geteilten Klassen hätten das Handy verändert. Deshalb steht
  das Aussehen aus dem 480er-Block jetzt wörtlich als Grundregel auf allen Breiten,
  einschließlich Pfeil-Icon und versteckter aktueller Seite. Der 480er-Block behält die
  Lage im Foto. Die alte Regel `.ueber-hero__breadcrumb-back img { display:none }` ist
  entfallen.
- **`.github/scripts/templates/rechtstext.html`:** Die Vorlage trug noch den alten Pfad.
  Impressum und Datenschutz waren von Hand umgestellt, und `build-rechtstexte.mjs` hätte
  den Rücklink zurückgedreht. Die Vorlage hat jetzt dasselbe Markup mit `{{base}}`.
- **Cache-Busting:** `CSS_VERSION` in `build-headers.mjs` steht auf `20261002zb`.
  `20261002za` war durch `projekte.css` aus AP-538 belegt. Der Header-Lauf hebt alle
  zentral geführten CSS-Dateien auf allen 52 Seiten an. `build-leistungen.mjs` und
  `build-rechtstexte.mjs` ändern danach nichts mehr, auch ein zweiter Lauf aller drei
  nicht.

## Maße

Die Maße entsprechen 1:1 dem Handy:
- Pfeil 18 px, Abstand 9 px
- Trefffläche 34 px hoch
- Nunito 750

Am Desktop rückt das H1 dadurch um 12 px tiefer, weil die Pfadzeile vorher 16 px hoch war.
Das Band von 481 bis 900 px zeigt den Rücklink ebenfalls, gemäß der Zwei-Welten-Regel.

## Prüfung (Chrome 154, headless)

- **1280, 901 und 768 px**, auf allen fünf Seiten:
  - Pfeil sichtbar (18 px), „Startseite“ unterstrichen, kein „›“.
  - Aktuelle Seite unsichtbar, kein Überlauf.
  - Schrift: Über uns 13,6 px in rgb(174,181,170), die übrigen 12,16 px in
    rgb(217,222,213), jeweils wie auf dem Handy.
- **375 und 402 px:** alle fünf Seiten pixelgleich zu HEAD. Der Galerie-Ausreißer bei
  402 px, eine abweichende Seitenhöhe, war in der Wiederholung identisch.
- **Balkonkasten bei 1280 px:** zwei von drei Scheiben identisch. In der ersten weichen
  223 px im Text des Knopfes „JETZT ANFRAGEN“ ab, das ist Kantenglättung während der
  Knopf-Animation und ohne Bezug zur Änderung.
- **Projektdetailseite bei 1280 px:** identisch.

## Nachtrag (06.10.2026): am Desktop überall gleich

Ansage des Auftraggebers: Der Rücklink soll auf allen Unterseiten identisch aussehen und
identisch sitzen. Gestaltet wird er wie auf dem Handy, platziert wie jetzt auf der Galerie
am Desktop. Die Projektdetailseiten behalten auf Ansage ihren Pfad. Auf den
Leistungsseiten bleibt die Beschriftung „Alle Leistungen“, mit der Leistungsübersicht als
Ziel. Das alles gilt nur ab 901 px.

**Befund vorher (1440 px)**

- **Galerie, Impressum, Datenschutz:** x = Containerkante, y = Kopf +
  `--space-section-compact`, Variante A (12,16 px, #d9ded5).
- **Über uns:** Lage gleich, aber Variante B (13,6 px, grau). Den Wert setzt
  `.breadcrumbs ol` durch.
- **Kontakt:** Variante A, der obere Abstand ist aber `clamp(28px, 3.8vw, 52px)`, der Link
  sitzt daher 16 px höher.
- **Leistungsseiten:** Die Leiste steht im Held in der mittigen Spalte mit `zoom: 1.25`.
  Sie liegt bei x = 425 und y = 109,5 und ist auf 17 px vergrößert.

**Umsetzung**

- **`ueber-uns.css`:** Ab 901 px bekommt `.ueber-hero__breadcrumb-back a` die Werte
  `font-size: .76rem` und `color: var(--home-on-dark-2)`. Das Handy bleibt bei seiner
  eigenen Fassung.
- **`kontakt.css`:** Ab 901 px gilt `.contact-hero { padding-top:
  var(--space-section-compact); }`, wie bei `.projects-overview`.
- **Leistungsseiten:**
  - **Vorlage:** In `leistung-v2.html` steht zwischen Kopf und `<main>` der neue
    Platzhalter `{{desktopBackLink}}`.
  - **Build:** `render.mjs` erzeugt daraus einen Rücklink im Markup der Galerie
    (`.breadcrumbs--home-back`). Er liegt außerhalb der gezoomten Spalte und hat dasselbe
    Ziel wie bisher.
  - **CSS:** `leistung-mobile.css` steht hinter dem AP-512-Desktopblock, nicht am
    Dateiende, weil dort parallel AP-568 arbeitet.
    - Ab 901 px wird der Rücklink angezeigt, mit der Geometrie von `.container`. Die ist
      ausgeschrieben, weil `.lpv2-page .container` auf diesen Seiten überschrieben ist.
    - Oben `--space-section-compact`, unten `clamp(28px, 3vw, 40px)` bis zum Titel.
    - Die Leiste im Held wird ausgeblendet, und der Titel verliert sein oberes Polster.
  - Neu gebaut wurden alle 38 Seiten. Ihr Diff gegen den Stand vorher enthält nur den
    neuen Block und die Versionszeilen.

**Prüfung (Chrome 154, headless)**

- **Gleichheit:** Galerie, Über uns, Kontakt, Impressum, Datenschutz, Baumpflege,
  Balkonkasten und Außenanlagenpflege bei 901, 1280, 1440 und 1920 px:
  - x, y, Höhe (34 px), Schrift (Nunito 12,16 px 750), Farbe (217,222,213), Unterstrich,
    Pfeil (18 × 5,4 px) und Textabstand (27 px) sind identisch.
  - 1440 px: x 100, y 180 (der Kopf aus AP-583 schiebt alles um 20 px). 901 px: x 36,
    y 159,8.
- **Abstand zum Titel:** Galerie, Über uns und die Leistungsseiten haben 40 px
  (28 px bei 901 px). Kontakt hat 60 px und die Rechtstexte 20 px wie zuvor. Das gehört
  zum Aufbau dieser Seiten und ist nicht Teil des Auftrags.
- **Handy und Tablet bei 375, 402 und 768 px:** pixelgleich zum Stand vorher.
  Ausreißer an Animationsstellen kamen genauso zwischen zwei Referenzaufnahmen vor.
