# AP-538 — Über uns im Handy-Querformat an Willkommen angleichen (01.10.2026)

Nach der Rückmeldung zu `IMG_5259.PNG` erhält das Mustergarten-Video bis 900 px
im Querformat genau denselben 4:3-Rahmen wie das Poolfoto der Willkommenssektion.
Die vorhandenen gleich breiten Spalten, 32 px Außenabstand zusätzlich zu den
Display-Sicherheitsrändern und die gemeinsamen Rasterzeilen bleiben erhalten.
Der Spaltenabstand verwendet ebenfalls `clamp(24px, 4vw, 48px)`; die Eckblume
skaliert wie am Poolfoto mit 52–80 px.

Der Film bleibt über `object-fit: contain` vollständig sichtbar. Seine native
720:544-Proportion passt mit minimalem seitlichem Freiraum in den gemeinsamen
4:3-Rahmen. Die Aussagen nehmen die gesamte rechte Rasterfläche neben dem Video
ein und bleiben in drei gleich hohen Reihen mit Abstand zu den Medienkanten.
Mustergarten-Beschriftung samt Besuchshinweis und „Mehr über uns“ behalten ihre
gemeinsame, vertikal zentrierte Abschlusszeile mit 32–40 px Abstand zum Video.

`text-size-adjust: 100%` einschließlich WebKit-Präfix ist auf den Querformat-
Überblick begrenzt. Damit vergrößert Safari Aussagen, Beschriftung und Button
beim Drehen nicht unabhängig vom Raster. Manueller Zoom bleibt erlaubt.
Mobile Hochkantdarstellung und Desktop sind unverändert. Keine Änderungen an
Markup, Texten, Icon-Dateien, Video, JavaScript oder Navigationszielen.

CSS-Version zentral auf `20261001m` aktualisiert und mit `build-headers.mjs`
in allen 51 Seiten mit Header nachgeführt; JavaScript bleibt `20261001c`.

## Prüfung

- 568×320, 667×375, 844×390, 874×402 und 900×420 px: Video und Poolfoto haben
  identische Breite/Höhe, die rechte Spalte dieselbe Breite. Die Aussagenfläche
  ist genauso hoch wie der Medienrahmen. Kein horizontaler Überlauf.
- Bei simulierten Display-Sicherheitsrändern von 59 px je Seite auf 874×402 px:
  beide Medien 328,52×246,39 px, rechte Spalte ebenfalls 328,52 px breit;
  Aussagen-Schrift 15,57 px, alle drei Aussagen auf jeweils zwei Zeilen.
- Gleichmäßige Aussagen-Mittelpunkte mit unter 0,02 px Rundungsabweichung;
  Button und Beschriftung haben dieselbe vertikale Mitte, Abweichung unter
  0,01 px außerhalb der bestehenden Button-Pulsanimation.
- Hochkant 320, 390, 430, 768 und 900 px sowie Desktop 901, 1440 und 2560 px:
  identische Größen, Positionen, Schriftgrößen und Abstände im direkten
  Vergleich mit dem vorherigen CSS. Vergleichsdateien lösen die relativen
  Schrift- und Bildpfade korrekt auf und deaktivieren nur Einblendungen.
- 437×201 px mit simulierten Aussparungen: vorhandener schmaler Querformat-
  Fallback vollständig lesbar und ohne Überlauf. Dies prüft CSS-Reflow,
  keinen tatsächlichen Safari-/Browser-Zoom.
- Reale Vorschau mit laufendem Video (0,6-fache Wiedergabe), geladenen mobilen
  Icon-Dateien und den vorhandenen Einblendungen geprüft. Gerätewechsel über
  die Hochkant-/Querformat-Bedingung kontrolliert.
- Abnahme der Abschlusszeile bei 874×500 px mit denselben seitlichen
  Sicherheitsrändern, damit Video, Aussagen, Beschriftung und Button in einem
  Screenshot sichtbar sind. Keine Prüfung auf einem physischen iPhone;
  Display-Sicherheitsränder wurden in einer lokalen Quelldatei simuliert.
- Zweiter Generatorlauf: 0 Änderungen. `git diff --check` erfolgreich.
  Kein Commit oder Push.

Messwerte und Abnahme: `tmp/about-landscape-20261001/`.
