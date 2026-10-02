# AP-557 — Zahlen und Ablaufkacheln gemeinsam zentrieren (02.10.2026)

Die fünf Ablaufkacheln und die links stehende Zahlenspur bilden auf Desktop
und im Handy-Querformat jetzt eine gemeinsam zentrierte Gruppe. Bisher waren
nur die Kacheln mittig; die Zahlen ragten links über die Bühnenbreite hinaus.
Dadurch lag die Mitte der sichtbaren Gruppe 36,5 px am Desktop beziehungsweise
28 px im Querformat links neben der Seitenmitte.

Die gemeinsame Breite berücksichtigt jetzt die gesamte Zahlenspur, ihren
Abstand zur Karte und die Karte selbst. Die Zahlen liegen innerhalb der
zentrierten Bühne; die Karten nutzen deren verbleibende Breite. Linie und
Blume folgen weiterhin exakt der Mitte der Zahlenkreise. Keine zusätzliche
Verschiebung per Transform oder JavaScript.

Kachelbreiten, Höhen, Bildfächer, Textflächen, Rundungen und vertikale Abstände
bleiben erhalten. Der Abstand vom Zahlenkreis zur Kachel beträgt weiterhin
19 px am Desktop und 16 px im Handy-Querformat. Die Hochkantregeln werden
nicht verändert; HTML, Bilder, Texte und JavaScript bleiben erhalten.

CSS-Version `20261002s` über den bestehenden Headergenerator auf allen
51 veröffentlichten Header-Seiten nachgeführt. Anfrage-CSS bleibt
`20261002c`, JavaScript `20261002e`.

## Prüfung

- Vorher/Nachher in 16 Ansichten verglichen: Hochkant 320×700, 390×844,
  402×874, 430×932, 768×1024 und 900×1200; Querformat 568×320, 667×375,
  844×390, 874×402 und 900×420; Desktop 901×600, 1024×768, 1440×900,
  1920×1080 und 2560×1440. Alle fünf Gruppen liegen auf der Mittelachse;
  Rundungsabweichung höchstens 0,004 px. Kein horizontaler Seitenüberlauf.
- Kachel- und Bildfachgrößen, Spaltenraster, Innenabstände und Rundungen aller
  fünf Schritte vor/nachher identisch. In den sechs Hochkantansichten ist
  zusätzlich die gesamte gemessene Geometrie der Zahlen und Kacheln identisch.
- Visuelle Abnahme bei 1440×900 und 874×402: vollständige Bilder, saubere
  Gruppierung unter der mittigen Überschrift. Zahlen, Grundlinie und Blume
  teilen dieselbe Achse: x=236,5 px am Desktop, x=85 px im Querformat.
- Vorwärtsscrollen im Querformat geprüft: Blume und grüne Spur bewegen sich
  weiterhin über die fünfte Zahl hinaus auf derselben Achse. Keine Änderung
  an der vorhandenen Scrollberechnung.
- Lokale Prüffassung mit 94 px seitlichem Sicherheitsabstand bei 874×402:
  Gruppe weiterhin exakt mittig, Abstand zur Zahl 16 px, kein Überlauf.
  Diese Prüfung simuliert Displayaussparungen per CSS und ersetzt keinen
  physischen iPhone-/Safari-Test.
- Startseiten-HTML gegenüber der vorherigen Fassung bis auf die CSS-Version
  identisch. Ausgeliefertes Stylesheet bytegleich mit der bearbeiteten Datei.
  Gemeinsame CSS-Version auf allen 51 Header-Seiten konsistent. Keine Warnung
  oder JavaScriptfehler im Prüftab.
- Zweiter Generatorlauf: 0 Änderungen. Generator-Syntaxprüfung und
  `git diff --check` erfolgreich.
- Kein Commit oder Push.

Messwerte, Vergleich, Sicherheitsrand-Prüffassung und Screenshots:
`tmp/process-center-20261002/`.
