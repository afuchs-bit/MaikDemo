# AP-556 — Querformat-Dialog und kompakte Aktionsbuttons (02.10.2026)

Im Handy-Querformat steht der Gartenpflege-Dialog in einer mittigen Gruppe
mit höchstens 640 px Breite. Der Spaltenabstand sinkt auf 12–18 px. Frage,
Antwortfläche und Blume behalten ihre Gestaltung und Schriftverhältnisse.
Die Desktop-Textanordnung aus AP-553 bleibt erhalten.

„Gartenwunsch besprechen“ erhält eine eigene Aktionszeile über die gesamte
Dialogbreite. Flex-Zentrierung richtet den Button unabhängig vom inneren
Textraster aus; seitlich werden Displayaussparungen mit dem jeweils größeren
Sicherheitsrand symmetrisch berücksichtigt. Im Hochkantlayout erzeugt der
zusätzliche Wrapper durch `display: contents` keine Layoutbox.

Die fünf großen Aktionsbuttons der Startseite teilen auf Desktop und im
Handy-Querformat jetzt die gemessenen iPhone-16-Pro-Hochkantmaße von 362 × 64 px:
„Gartenwunsch besprechen“, „Mehr über uns“, „Zum Kontaktformular“,
„Projekt anfragen“ und „Anfrage senden“. Bei weniger Platz schrumpft die Breite
auf die verfügbare Fläche; die Höhe bleibt 64 px. Die Fotoauswahl folgt weiterhin
dem gemeinsamen Anfrage-Token. Kleinere Galerie- und Bedienbuttons behalten
ihre bisherigen Größen. Die bestehende Laschenform, Kontur, Pfeile, Fokus- und
Pulsreaktionen bleiben erhalten. Die Hochkant-Maße werden nicht überschrieben.

CSS-Version `20261002r` auf allen 51 veröffentlichten Seiten mit Header
nachgeführt. Anfrage-CSS bleibt `20261002c`, JavaScript `20261002e`.
Die Seitenvorlagen beziehen die gemeinsame CSS-Version aus den aktualisierten
Seiten. Keine neue Layoutlogik, Bibliothek oder Änderung an Formularskripten.

## Prüfung

- 19 Ansichten: Hochkant 320×700, 390×844, 402×874, 430×932, 768×1024,
  900×1200; Querformat 437×201, 480×320, 568×320, 667×375, 768×375,
  844×390, 874×402, 900×420; Desktop 901×600, 1024×768, 1440×900,
  1920×1080 und 2560×1440. Kein horizontaler Seitenüberlauf.
- Gartenwunsch-Button in sämtlichen Querformat- und Desktopansichten mittig;
  Rundungsabweichung höchstens 0,00002 px. Die übrigen Buttons bleiben in ihrer
  jeweiligen Sektion beziehungsweise Spalte zentriert. Schmale Über-uns-Spalten
  begrenzen die Breite ohne Textüberlauf.
- Beschriftungen und Pfeile bei acht Querformat-/Desktopgrößen geprüft:
  keine Textabschneidung, kein vertikaler Überstand und keine Überlappung.
  Der Gartenwunsch-Pfeil verwendet auch im Querformat die 62×40-px-Kapsel der
  Hochkantreferenz; das Pfeilmotiv misst 46 px Breite.
- Lokale Prüffassung mit 62 px symmetrischem Sicherheitsrand bei 437, 568,
  667 und 874 px: Button mittig, vollständige Beschriftung, kein Überlauf.
  Bei besonders schmaler Fläche stapeln Frage und Antwort wie bisher.
  Dies ist eine CSS-Simulation, kein physischer iPhone-/Safari-Test oder
  tatsächlicher Browserzoom.
- Hochkant 320, 390, 430, 768 und 900 px direkt vor/nachher verglichen:
  identische berechnete Breiten, Höhen, Raster, Schriften, Innen- und
  Außenabstände der Dialogelemente und Buttons. Die iPhone-Referenz bei
  402 px zeigt weiterhin fünf Buttons mit 362×64 px. Laufende Pulsphasen
  und scrollabhängige Positionen gelten nicht als Layoutunterschied.
- Desktop-Textgeometrie bei 901, 1024 und 1440 px vor/nachher identisch.
  Visuelle Abnahme in der HTTP-Vorschau bei 874×402 und 1440×900.
- Tastaturfokus am Gartenwunsch-Button sichtbar: 2-px-Ring mit 9 px Abstand.
  Nach abgeschlossenem Scrollen liegt der Button unterhalb des Headers.
  Enter erreicht `#anfrage`; im Querformat fokussiert ein Klick das einzige
  sichtbare Anfrageformular. Keine Anfrage abgesendet.
- Gartenwunsch-Linkattribute und SVG-Inhalt gegenüber dem vorherigen HTML
  unverändert; nur Layout-Wrapper und Einrückung ergänzt. Keine Browserwarnung
  oder JavaScriptfehler im Prüftab.
- Ausgelieferte drei geänderte Stylesheets bytegleich mit den lokalen Dateien;
  gemeinsame Versionsparameter auf allen 51 Header-Seiten konsistent.
  Zweiter Headergeneratorlauf: 0 Änderungen.
- Kein Commit oder Push.

Messwerte, Vergleich, lokale Prüffassung und Screenshots:
`tmp/buttons-chat-20261002/`.
