# AP-558 — Leistungsübersicht am Desktop großzügiger gestalten (02.10.2026)

Die Leistungsübersicht verwendet ab 901 px eine bis zu 1240 px breite,
zentrierte Fläche statt bisher 960 px. Zwei gleich breite Spalten stehen
mit fließenden 56–112 px Abstand nebeneinander. Eine 1 px feine grüne Linie
im Zwischenraum läuft an beiden Enden transparent aus. Sie ist rein dekorativ
und nimmt keinen Platz im Raster ein.

Fotos wachsen von den bisherigen 88 px auf 96–120 px, Leistungsnamen von
15 px auf 16–20 px. Buchstaben, Innenabstände, Anfrage-Blume und kleinere
Unterzeilen folgen dieser Desktopgestaltung. Die vorhandene Schriftfamilie,
Bildmotive und die asymmetrischen Rundungen bleiben erhalten. Die mittige
Notdienst-Kachel erhält passend dazu etwas mehr Breite und größere Schrift;
der Kontaktbutton behält die gemeinsame Größe von 362 × 64 px.

Die vorhandenen Desktopregeln in `assets/css/privat-form.css` sind gezielt
angepasst. Die Listenreihenfolge bleibt A–O links und P–Z rechts, jeweils
19 Einträge. Alle Inhalte, Ziele, Bilddateien und JavaScriptfunktionen bleiben
erhalten. Die 74 `source`-Größenangaben der 37 Leistungsbilder in `index.html`
entsprechen nun den Desktopmaßen; bis 900 px bleibt ihr bisheriger Wert 88 px.

CSS-Version `20261002t` über den bestehenden Generator auf allen 51
veröffentlichten Header-Seiten nachgeführt. Anfrage-CSS bleibt `20261002c`,
JavaScript `20261002e`.

## Prüfung

- Vorher/Nachher in 17 Ansichten: Hochkant 320×700, 390×844, 402×874,
  430×932, 768×1024 und 900×1200; Querformat 568×320, 667×375, 844×390,
  874×402 und 900×420; Desktop 901×700, 1024×768, 1280×900, 1440×900,
  1920×1080 und 2560×1440. Kein horizontaler Seitenüberlauf oder abgeschnittener
  Titel. Alle 11 Handyansichten geometrisch identisch zur vorherigen Fassung.
- Desktopbreiten gemessen: 829 px Inhalt bei 901 px, 942 px bei 1024 px,
  1178 px bei 1280 px und 1240 px ab 1440 px. Fotos 96–120 px, Schrift
  16–20 px, keine festen Texthöhen. Lange Namen dürfen natürlich umbrechen.
- Visuelle Abnahme bei 901×800, 1440×1000 und 1920×1080. Keine Überschneidung
  zwischen Text, Anfragepfeil und Bild; die Anfragezeile passt auch bei 901 px.
  Sichtbare Leistungsbilder einschließlich Bonsai/Formgehölze geladen.
- Tastaturfokus bei 901 px geprüft: sichtbarer gelber 3-px-Ring, fokussierter
  Eintrag vollständig unter dem Header. Leistungslink öffnet die richtige
  Detailseite; Rückkehr zur Übersicht funktioniert. Keine Warnung oder
  JavaScriptfehler im Prüftab.
- Sektions-HTML gegenüber der vorherigen Fassung bis auf die Bild-
  Größenangaben identisch. Alle 162 referenzierten Bild-/Icondateien vorhanden.
  Ausgeliefertes Stylesheet bytegleich mit der bearbeiteten Datei; gemeinsame
  CSS-Version auf allen 51 Header-Seiten konsistent.
- Zweiter Generatorlauf: 0 Änderungen. Generator-Syntaxprüfung und
  `git diff --check` erfolgreich. Kein Commit oder Push.

Messwerte, Vergleich und Screenshots: `tmp/services-desktop-20261002/`.
