# AP-553 — Gartenpflege-Dialog näher zusammenrücken (02.10.2026)

Die Frage „Keine Zeit für den Garten?“ und die grüne Antwortfläche in
`#social-proof` stehen auf Desktop und im mobilen Querformat enger zusammen.
Der Button „Gartenwunsch besprechen“ bildet den mittigen Abschluss unter
beiden Texten. Die Hochkantgestaltung bleibt unverändert.

## Umsetzung

- Die Einladung ist am Desktop auf 1000 px statt 1120 px begrenzt. Ihr
  Spaltenabstand beträgt nun `clamp(24px, 3vw, 40px)` statt 48–96 px.
  Im mobilen Querformat beträgt der Abstand 20–28 px statt 24–36 px.
- Beide Textspalten bleiben gleich breit und vertikal zentriert. Das
  Schriftverhältnis aus AP-551, Farben, Antwortfläche, Markenblume und
  automatische Textumbrüche bleiben erhalten.
- Das äußere Raster hat eine Spalte für den gesamten Dialog und dessen
  Abschluss. Der Button steht mittig über die volle Rasterbreite, mit
  höchstens 560 px Breite und weiterhin 24–32 px Abstand zur Textgruppe.
  Lasche, Versatzrahmen, Pfeilkapsel, Fokus und Animationen bleiben erhalten.
- Die Regeln sind auf Desktop ab 901 px und mobiles Querformat bis 900 px
  beschränkt. Der bestehende Umbruch der Texte bei höchstens 440 px verfügbarer
  Containerbreite bleibt erhalten. HTML, JavaScript und Kontaktziel bleiben gleich.
- Zentrale CSS-Version `20261002o` auf den 51 veröffentlichten Header-Seiten
  nachgeführt. JavaScript bleibt `20261002c`.

## Prüfung

- Querformat: 568×320, 667×375, 768×432, 844×390, 874×402, 900×420.
  Desktop: 901×600, 1024×768, 1280×800, 1440×1000, 1920×1080, 2560×1440.
  Zusätzlich schmaler Reflow bei 640×400 und 437×201. Keine horizontalen
  Seiten- oder Textüberläufe. Der Button ist über alle Größen auf der
  Mittelachse der Gruppe, mit maximal 0,004 px Rundungsabweichung während
  seiner bestehenden Pulsanimation.
- Bei 1440 px: Einladung 1000 px, Textspalten je 480 px mit 40 px Abstand,
  Button 560 px mittig. Vorher: 1120 px, Spalten je 512 px mit 96 px Abstand,
  Button unter der rechten Spalte. Desktop und 874×402 visuell abgenommen.
- Sicherheitsrand-Prüffassung mit 62 px je Seite zusätzlich zu den bestehenden
  32 px Seitenabstand bei 568, 667, 844, 874, 900 und 437 px: keine Überläufe.
  Bei 380 bzw. 249 px verfügbarer Breite stehen Frage und Antwort untereinander;
  der Button bleibt mittig und vollständig bedienbar.
- Hochkant 320×700, 390×844, 430×932, 768×1024, 900×1200 vor/nachher direkt
  verglichen: identische Geometrie, Schriften, Abstände, Farben und Gestaltung
  der Einladung einschließlich ihres Buttons.
- Tastatur: Tab vom Galerie-Link erreicht den Anfragebutton. Sichtbarer
  2-px-Fokusring mit 9 px Abstand. Enter erreicht weiterhin `#anfrage` und
  das vorhandene Formular. Kein Formularversand oder externer Kontakt.
- In-App-Browser ohne Fehler oder Warnungen. Vorschau-CSS und Startseiten-HTML
  bytegleich zu den bearbeiteten Dateien. Zweiter Header-Generatorlauf:
  0 Änderungen. `git diff --check` erfolgreich.
- Sicherheitsränder und Reflow im Browser simuliert; kein physischer
  Safari-/iPhone-Test und kein tatsächlicher Browserzoom. Branch
  `codex/homepage-review`, kein Commit oder Push.

Prüfdaten und Screenshots: `tmp/chat-layout-20261002/`.
