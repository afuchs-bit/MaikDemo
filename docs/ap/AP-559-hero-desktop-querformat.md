# AP-559 — Hero für Desktop und Handy-Querformat (02.10.2026)

Der neue Hero folgt dem Aufbau der gelieferten Inspiration: breites Foto,
schwebender dunkler Kopf, diagonaler Übergang in eine dunkle Textfläche und
eine rechts stehende Kontaktkarte. Alle sichtbaren Texte, Logos, Schriften,
Farben und Kontakt-Icons stammen aus dem vorhandenen Handy-Hochkant-Hero.
Die Inspiration liefert keine neuen Menüeinträge oder Geschäftsaussagen.

Ab 901 px und bis 900 px ausschließlich im Querformat ist das gelieferte
Foto `Unknown.png` eingebunden. Der Schriftzug „Ihr Partner für alles rund um
den Garten“, die originale Garten-Grafik, Instagram, Standort-Pin mit Blume
und Mustergarten-Hinweis werden sichtbar. Die vorhandene Kontaktkarte behält
ihre beiden getrennten Links: Projekt zum Anfrageformular und Direktanruf.
Im Desktop-Kopf bleiben die bisherigen Navigationsziele erhalten. Beim
Scrollen wird wieder die gewohnte durchgehende Leiste verwendet.

## Umsetzung

- Ein gemeinsames CSS Grid in `assets/css/home-dark.css` ordnet vorhandene
  Elemente an. Die beiden bestehenden Hero-Hüllen nehmen über `display:
  contents` am Raster teil. Titel, Nachweise und Kontaktkarte folgen natürlichen
  Zeilenhöhen; der Willkommenbereich liegt im normalen Fluss darunter.
  Es gibt keine neuen Layout-Skripte, Kopien der Inhalte oder absoluten Textboxen.
- Fotobühne über die gesamte Breite; Inhalte auf maximal 1440 px begrenzt.
  Zwei dekorative Gridflächen erzeugen die feine grüne Diagonale und den
  dunklen Bereich mit dem vorhandenen Blumen-Wasserzeichen. Das Bild wird
  im Browser passend zur Bühne beschnitten; die abgeleiteten Dateien enthalten
  das vollständige Motiv. Der Fokus bleibt bei Fahrzeug und Pflanzenausstellung.
- Das Handy-Querformat verwendet eine kompaktere Bühne von 220–300 px Höhe,
  kleinere Typografie und die vorhandenen mobilen Icons. Nachweise können bei
  wenig Breite umbrechen. Symmetrische Sicherheitsränder berücksichtigen die
  größere der beiden seitlichen Displayaussparungen. `text-size-adjust: 100%`
  verhindert zusätzliche Safari-Schriftvergrößerung in dieser Komposition.
- Hero und vorhandener Header reagieren ohne neue Scrollberechnung. Die neue
  breite Textfläche erscheint direkt; die Hochkant-Einblendung bleibt erhalten.
  Tastaturfokus und reduzierte Bewegung sind berücksichtigt.
- Das unveränderte Original liegt lokal unter
  `assets/img/_src/home/hero-fahrzeug-palmengarten-wide.png` (gemäß bestehender
  Gitignore-Regel). `prepare-home-wide-hero.mjs` erzeugt ausschließlich skalierte
  AVIF-/WebP-Dateien mit 800, 1200 und 1672 px Breite. Kein Upscaling, Retusche
  oder generativer Eingriff. Größte AVIF-Datei rund 328 KiB, WebP rund 473 KiB.
- Responsive Bildquellen und Preload sind nach Orientierung getrennt. Hochkant
  lädt weiterhin die bisherige mobile Bildfamilie. Baloo 2 wird auch am Desktop
  vorab geladen. CSS `20261002u` auf allen 51 Header-Seiten nachgeführt;
  Anfrage-CSS `20261002c`, JavaScript `20261002e` unverändert.

## Prüfung

- Hochkant vor/nachher bei 320×700, 390×844, 402×874, 430×932, 768×1024 und
  900×1200 geometrisch identisch: Header, Bild, Titel, Kontaktkarte, Hinweise
  und Willkommenbereich. Bestehendes CSS außerhalb des neuen Hero-Blocks
  bytegleich zur vorherigen Fassung.
- Querformat 568×320, 667×375, 844×390, 874×402, 900×420 und 844×300;
  Desktop 901×700, 1024×768, 1280×800, 1440×900, 1920×1080 und 2560×1440.
  Kein horizontaler Seitenüberlauf, keine Überschneidung zwischen Titel,
  Nachweisen und Kontaktkarte. Alle zwölf Bildquellen geladen. Zusätzlich
  schmale Reflow-Darstellung 437×201 ohne Überlauf geprüft.
- Visuelle Abnahme der Fotobühne, Diagonale, Schrift und Kontaktkarte bei
  901 px, 1440 px, 1920 px sowie 874×402. Schmale Desktop-Navigation hält
  beidseitig rund 25,2 px Abstand zu Logo und Kontakt-Icons.
- Lokale Sicherheitsrand-Prüffassung mit 62 px auf beiden Seiten bei 874×402:
  Titel und Header beginnen bei x=62, Kontaktkarte endet bei x=812.
  Inhalte bleiben vollständig erreichbar. Das ist eine Browser-Simulation,
  kein physischer iPhone-/Safari-Test.
- Desktop-Dropdown und Telefonauswahl öffnen innerhalb des Viewports und
  schließen mit Escape. Mobiles Menü bei 874×402: Panel von y=108 bis y=390,
  Escape setzt `aria-expanded=false`, Fokus zurück zum Menüknopf und
  Scrollsperre frei. Wechsel mit offenem Menü auf Desktop schließt es ebenfalls
  und gibt das Scrollen frei.
- Hero-Telefonlink per Tastatur mit sichtbarem gelbem 3-px-Ring erreichbar;
  Telefonnummer und Projektziel unverändert. Projektlink erreicht `#anfrage`
  unterhalb der kompakten Leiste. Kein Formular abgesendet oder Anruf ausgelöst.
- Nach dem Formularsprung vier Höhenwechsel zwischen 330, 360 und 402 px bei
  874 px Breite: Scrollposition jeweils unverändert 9849 px. Keine Warnung
  oder JavaScriptfehler im Prüftab.
- Orientierungswechsel ohne Neuladen von 402×874 auf 874×402: Die Bildquelle
  wechselt automatisch auf das Querformatfoto; Scrollposition bleibt 0.
  Die gemessene Headerhöhe und ihr CSS-Token werden von 127 auf 102 px
  korrekt nachgeführt.
- Original bytegleich zum gelieferten Foto, ausgeliefertes CSS bytegleich zur
  bearbeiteten Datei. Gemeinsame CSS-Version auf allen Header-Seiten konsistent.
  Zweiter Bildgeneratorlauf: alle sechs SHA-256-Prüfsummen identisch.
  Zweiter Headergeneratorlauf: 0 Änderungen. Syntaxprüfungen und
  `git diff --check` erfolgreich. Kein Commit oder Push.

Prüfwerte, Vergleich, Sicherheitsrand-Prüffassung und Screenshots:
`tmp/hero-wide-20261002/`.
