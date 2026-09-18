# AP-340 — Instagram als Meta-Zeile im Mobilmenü

**Datum:** 18.09.2026 · **Auftrag:** Den Instagram-Link im geöffneten Mobilmenü aus der
farbigen Gradient-Kachel in eine abgesetzte Meta-Zeile am Ende der Menükarte überführen.

## Diagnose

Der Instagram-Link kam einen Tag zuvor als Gradient-Kachel ins Hauptmenü. Drei Befunde
sprachen dagegen:

1. **Er brach die linke Textkante.** Alle Menüpunkte setzen bei 25 px vom Kartenrand an
   (9 px Elementkante + 16 px Innenabstand). Die Kachel begann bei 9 px — ein sichtbarer
   Versatz in einer sonst streng gesetzten Spalte.
2. **Kein Label.** Ein Icon ohne Text ist in einer reinen Textliste ein Fremdkörper; das
   Ziel erschloss sich nur über das `aria-label`.
3. **Farbstärkstes Element im Overlay.** Der fünfstufige Instagram-Verlauf zog in einer
   ruhigen, einfarbigen Liste die gesamte Aufmerksamkeit auf den nachrangigsten Eintrag.

Dazu eine Fundsache aus dem Umbau: Die mobile Touchziel-Regel (`AP-39`,
`.primary-nav.is-open .menu a`, Spezifität 0,3,1) stach die Kachelregel und zog den
Verlauf über die **volle Zeilenbreite** — aus dem 32-px-Quadrat wurde ein durchgehendes
Farbband. Das war bereits per Sonderregel geflickt; mit der Meta-Zeile entfällt der Flick.

## Entscheidung zum Desktop

Kachel und Overlay-Eintrag waren **dasselbe Element**. „Gradient restlos entfernen" und
„keine Änderung an der Desktop-Navigation" widersprachen sich deshalb. Entscheidung des
Auftraggebers: **am Desktop ganz raus.** Die Desktop-Pille steht damit wieder exakt auf
ihrem Stand vor der Instagram-Ergänzung (sechs Einträge, 37 px Luft zu den Kopf-Knöpfen
bei 901 px — derselbe Messwert wie vor AP-339/2). Die Instagram-Kachel der
Startseiten-Kopfzeile (`.header-instagram`), die Hero-Leiste und der Footer-Baustein
bleiben unberührt; ihren Verlauf gibt es dort weiterhin.

## Diff

**Markup** — in 38 Dateien (37 ausgelieferte Seiten + `templates/_header.html`), je eine
Zeile ersetzt:

```diff
-<li><a class="menu-instagram" href="…" target="_blank" rel="noopener"
-       aria-label="Maik Rohdich auf Instagram ansehen"><svg …/></a></li>
+<li class="menu-meta"><a class="menu-meta__link" href="…" target="_blank"
+   rel="noopener noreferrer" aria-label="Maik Rohdich auf Instagram">
+   <span class="menu-meta__text">Folgen Sie uns</span>
+   <span class="menu-meta__glyphe"><svg … aria-hidden="true" focusable="false"/></span>
+ </a></li>
```

Der `href` ist unverändert übernommen (`https://www.instagram.com/rohdich_garten_landschaftsbau/`)
— dieselbe URL, die Kopfzeile und Hero-Leiste der Startseite schon führen.

**CSS** (`assets/css/styles.css`):

- entfernt: `.menu a.menu-instagram`, `.menu a.menu-instagram:hover`,
  `.menu-instagram svg` und die mobile Sonderregel — samt beider
  `radial-gradient`-Definitionen. Im Menü-CSS ist kein Verlauf mehr übrig.
- neu: `.menu-meta { display: none }` (Desktop) und im bestehenden
  `@media (max-width: 900px)`-Block die Regeln für Trennlinie, Zeile, Glyphenspalte
  und Fokusring.

Zwei Konstruktionsentscheidungen, die ohne Kommentar später rätselhaft wären:

- **Die Trennlinie ist ein Pseudoelement**, kein `border-top`: Links liegt sie auf der
  Textkante der Menüpunkte (16 px), rechts endet sie bündig mit der Kachel. Ein
  `border-top` liefe stattdessen bis an beide Kartenkanten.
  Der rechte Wert ist nicht eingetippt, sondern gerechnet:
  `calc((var(--menu-meta-spalte) - var(--menu-meta-kachel)) / 2)`. Spaltenbreite und
  Kachelgröße stehen als Variablen am `<li>`, weil drei Stellen sie gemeinsam brauchen —
  Kachel, Ausrichtungsspalte und Linienende. Die Kachelgröße ist in diesem Arbeitspaket
  dreimal gewandert (42 → 36 → 30); mit der Rechnung bleibt die Linie von allein bündig,
  statt bei jedem Schritt nachgezogen werden zu müssen.
- **Die Glyphe sitzt in einer 44-px-Spalte mit `margin-left: auto`** — exakt der Aufbau
  von `.submenu-toggle`. Dadurch liegt sie ohne geratene Pixelzahl genau unter dem
  Chevron von „Leistungen" (gemessen: Abweichung 0 px bei 360/390/430 px).
- **Das Zeichen ist die Footer-Kachel, zwei Stufen kleiner** (Nachtrag vom 18.09.2026):
  Verlauf, Form und weisse Glyphe wie `footer-kontakt.css:171/189/193`, aber 30px statt
  42px. Die Verhaeltnisse des Vorbilds sind mitskaliert - Radius 9px und Glyphe 18px
  stehen zur Kante wie dort 12px und 25px zu 42px. Ohne diese Mitskalierung wirkt eine
  verkleinerte Kachel klobiger als das Original.
  Dafuer eine Ebene mehr als im Footer: `.menu-meta__glyphe` ist die 44px-Spalte fuer
  die Chevron-Ausrichtung, `.menu-meta__kachel` die Kachel darin. Ohne diese Trennung
  laege die Kachelmitte neben dem Chevron.
- **`padding-top: 8px` am `<li>`** ist das Gegenstueck zum 8px-Polster der Menuekarte,
  das unterhalb dieser letzten Zeile ohnehin steht. Ohne das klebte die Kachel mit 6px
  an der Trennlinie, waehrend sie unten 14px vom Kartenrand entfernt stand. Jetzt sind
  beide Abstaende 17px. Die Gleichheit haengt nicht an der gewaehlten Kachelgroesse -
  wird sie spaeter geaendert, bleibt sie erhalten. Das Polster sitzt am `<li>` und nicht
  am Link, weil die Trennlinie als `::before` mit `top: 0` am Polsterrand des `<li>`
  haengt und so liegen bleibt, wo sie ist; der Link behaelt seine mittige 48px-Zeile.

**Cache-Busting:** `styles.css?v=20260918c` → `?v=20260918d` in allen 37 ausgelieferten
Seiten. Die drei Vorlagen tragen `{{cssVersion}}` und bleiben unangetastet.

## QA

Gemessen im Overlay (`/ueber-uns/`, headless Chrome, echte Tastatur- und Mausereignisse):

| Prüfung | 360 px | 390 px | 430 px |
|---|---|---|---|
| Waagerechter Überlauf | 0 | 0 | 0 |
| Zeilenumbruch im Text | nein | nein | nein |
| Tap-Target-Höhe | 48 px | 48 px | 48 px |
| Textkante vs. „Kontakt" | 0 px | 0 px | 0 px |
| Glyphenmitte vs. Chevron | 0 px | 0 px | 0 px |
| Trennlinie, Einzug je Seite | 16 px | 16 px | 16 px |

- **Kontrast** Zeilentext `--ink-mute` #AEB5AA auf Kartenfläche `--bg-elev` #20241D:
  relative Leuchtdichten 0,4325 und 0,0157 → (0,4325 + 0,05) / (0,0157 + 0,05) =
  **7,50 : 1** ≥ 4,5 : 1. Die Glyphe in `--home-lime` #8CC63F kommt auf 7,71 : 1.
- **Fokus:** per echter Tab-Navigation erreicht, `:focus-visible` greift, Ring 2 px
  `--home-lime`. `outline-offset: -2px` liegt nach innen — die Menükarte scrollt
  (`overflow-y: auto`, AP-39), ein nach außen versetzter Ring würde an ihrer Kante
  beschnitten. Geometrisch geprüft: Ring vollständig innerhalb der Karte.
- **Desktop** (901 px, 1280 px): `.menu-meta` steht auf `display: none`, sichtbar sind
  wieder genau die sechs ursprünglichen Einträge, kein Überlauf.
- **Zeichen:** Kachel 30x30 / Radius 9px / Glyphe 18px weiss - die Footer-Kachel in
  kleinerer Stufe, Verhaeltnisse mitskaliert. `aria-hidden`/`focusable="false"`.
  Auf beiden Stichprobenseiten gegengeprueft.
- **Abstaende der Kachel** bei 360/390/430 px: 17px zur Trennlinie, 17px zum unteren
  Kartenrand, 15px zum rechten. Die 15px sind gewollt: Die Kachel sitzt in der
  44px-Spalte, die ihre Mitte unter den Chevron zwingt - eine schmalere Spalte
  wuerde die Ausrichtung brechen. Gleichstand auf allen drei Seiten gaebe es nur
  bei 34px Kachelgroesse, also kaum kleiner als der Stand davor.
- **Linienende und Kachelkante** stehen beide 7px vor dem Zeilenrand — auf allen drei
  Breiten und auf beiden Stichprobenseiten gemessen gleich.

## Rebuild statt Rebuild: Trockenlauf

`build-leistungen.mjs` wurde **nicht** im Arbeitsbaum ausgeführt, sondern in einer
Wegwerf-Kopie. Der Vergleich zeigt, warum:

- Der Lauf hätte `saved-gewerbe-link` aus `index.html:272` gelöscht — die bekannte Falle,
  hier erstmals schwarz auf weiß belegt.
- Er hätte auf 20+ generierten Seiten `main.js?v=20260902a` → `?v=20260911a` gezogen: eine
  aufgelaufene Drift, die mit diesem Arbeitspaket nichts zu tun hat und nicht in seinen
  Commit gehört.
- Die Meta-Zeile **übersteht einen Rebuild unbeschädigt** (in beiden Stichproben genau
  einmal vorhanden), weil `templates/_header.html` zeichengleich mitgepflegt wurde.

Stichprobe im Arbeitsbaum, `/privatkunden/leistungen/teichbau/` und
`/gewerbekunden/leistungen/baumkontrolle/`: Zeile vorhanden, `rel="noopener noreferrer"`,
`target="_blank"`, `aria-label` gesetzt, Tap-Target 48 px, Glyphe 0 px vom Chevron,
kein Überlauf.

## Abweichungen von der Aufgabenstellung

Drei Annahmen der Vorgabe treffen auf dieses Repo nicht zu:

1. **„Fünf handgeschriebene Seiten + Template."** Das Menü ist auf **allen 37**
   ausgelieferten Seiten handgepflegt, auch auf den erzeugten — weil der Generator
   handgesetzte Klassen mitreißt (siehe Trockenlauf). Ersetzt wurde deshalb in 38 Dateien.
2. **„Das Build-Skript verteilt den Cache-Busting-String."** Nur, wenn man es laufen
   lässt — was hier aus dem genannten Grund unterbleibt. Der String wurde wie gehabt über
   alle 37 Seiten gezogen.
3. **`--rd-marke` existiert nicht.** Das Markentoken dieses Projekts ist `--home-lime`
   (`#8CC63F`, wertgleich mit `--green-500`). Es traegt den Fokusring. Das Zeichen selbst
   steht auf Wunsch des Auftraggebers nicht einfarbig da, sondern wie im Footer. Kein
   neues Farbtoken angelegt.

**Zwei Zwischenstaende, verworfen auf Ansage des Auftraggebers:**

- Die Trennlinie trug kurzzeitig das Verlaufsmuster der Zierstriche neben dem
  Google-Siegel (`linear-gradient(90deg, transparent, rgb(164 206 91 / 34%), transparent)`,
  auslaufende Enden). Zurueck auf die durchgehende Linie in `var(--line)`.
- Das Zeichen war kurzzeitig eine Kontur mit Verlauf im SVG selbst
  (`<radialGradient>` + `stroke="url(...)"`), also farbig ohne Kachel. Ersetzt durch die
  Footer-Kachel, damit beide Zeichen gleich aussehen.
