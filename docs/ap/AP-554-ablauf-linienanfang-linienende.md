# AP-554 — Ablauf-Linie an Anfang und Ende korrigieren (02.10.2026)

Am Desktop und im mobilen Querformat ragte die Grundlinie sichtbar über
den ersten Zahlenkreis hinaus. Unterhalb der fünften Station blieb die
Blume stehen, während der sichtbare Rest der Linie grau blieb.

## Umsetzung

- Die Grundlinie beginnt im Mittelpunkt der ersten Nummer, unter deren
  geschlossener Kreisfläche. Oberhalb des Kreises ist keine Linie mehr sichtbar.
  Der Anfang funktioniert mit JavaScript, ohne JavaScript und bei reduzierter
  Bewegung. Ein gemeinsamer Wert für die bestehende Kartenhöhe liefert den
  statischen Start; sämtliche bisherigen Kartenhöhen bleiben gleich.
- Die Messung der breiten Stationen berücksichtigt ihre mittig ausgerichteten
  Zahlenkreise. Bisher wurde zusätzlich eine halbe Knotenhöhe addiert, obwohl
  `top: 50%` mit `translateY(-50%)` den Mittelpunkt bereits festlegt.
  Am 1440-px-Desktop lag der berechnete Beginn deshalb bei 157 statt 130 px.
- Die berechnete Reise reicht nun auch am Desktop und im mobilen Querformat
  bis zum vorhandenen unteren Linienende. Blume und grüne Fortschrittsspur
  bewegen sich gemeinsam über die fünfte Nummer hinaus. Am Ende bleibt der
  vorhandene Übergang der Blume in den Anfragebutton erhalten. Beim
  Zurückscrollen kehrt die Blume auf die Linie zurück.
- Für die breiten Stationen werden die unverformten Stationsflächen und das
  Linienende mit Subpixeln gemessen. Die beim Einblenden verschobene Karte
  ist nicht der Messpunkt. Hochkant verwendet weiterhin die bisherige Messung.
- Hochkantregeln, Inhalte, Kartengeometrie, Bilder und Anfrageziele bleiben
  erhalten. Kein Pinning oder zusätzlicher Scrollbereich. CSS-Version
  `20261002p`, JavaScript `20261002e` auf allen 51 veröffentlichten
  Header-Seiten nachgeführt.

## Prüfung

- Querformat: 568×320, 667×375, 844×390, 874×402, 900×420.
  Desktop: 901×600, 1024×768, 1440×900, 1920×1080, 2560×1440.
  Linienstart und Mittelpunkt der ersten Nummer stimmen überein; berechnetes
  Reiseende und sichtbares Linienende weichen höchstens 0,006 px ab.
  Kein horizontaler Seitenüberlauf.
- Am 1440-px-Desktop reicht die Reise von 130 bis 1470 px. Die fünfte Nummer
  liegt bei 1346 px; die verbleibenden 124 px werden nun ebenfalls durchlaufen.
  Native Scrollpunkte unterhalb der fünften Nummer zeigen zunehmende
  Markerpositionen und eine genau bis zur Blume reichende grüne Spur.
  Bei Fortschritt 1 erreicht die Spur das Linienende und die bestehende
  Abschlussklasse wird gesetzt.
- Im 874×402-Querformat läuft die Blume ebenfalls durch das Reststück nach
  Nummer 5: Fortschritt 0,9278 → 0,9682 → 0,9953 → 1. Nach Zurückscrollen
  auf 0,9543 sind Blume und Spur wieder auf der Linie, die Abschlussklasse
  ist entfernt. Farbe der Spur bleibt die bestehende grüne Verlaufsfarbe.
- Hochkant 320×700, 390×844, 430×932, 768×1024 und 900×1200 direkt vor/nachher
  verglichen: Kartenabmessungen, Bühnenhöhe und Grundliniengeometrie unverändert.
- Prüffassung mit erzwungener JavaScript-Präferenz für reduzierte Bewegung
  bei 874×402: kein Journey-Modus, kein beweglicher Marker, vollständig
  grüne statische Linie mit korrektem Anfang. Ohne JavaScript bei 1440×900
  ebenfalls korrekter statischer Anfang bei 130 px.
- Desktop-Anfang und Abschnitt unter Nummer 5 visuell abgenommen.
  Größenwechsel im In-App-Browser simuliert; kein physischer Safari-/iPhone-Test.
- JavaScript-Syntax, `git diff --check` und aktuelle Vorschau-Dateien geprüft.
  CSS, JavaScript und HTML werden bytegleich aus dem Arbeitsstand ausgeliefert.
  Die ScrollTrigger-Entfernung aus AP-552 bleibt erhalten. Zweiter
  Header-Generatorlauf: 0 Änderungen.
- Branch `codex/homepage-review`, kein Commit oder Push.

Prüfdaten, Fallback-Fassungen und Screenshots:
`tmp/process-line-20261002/`.
