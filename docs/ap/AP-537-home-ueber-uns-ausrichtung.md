# AP-537 — Über-uns-Zeilen und Aussagen harmonisch ausrichten (01.10.2026)

Auf `codex/homepage-review` teilen sich Video und Aussagen im breiten Aufbau
zwei gemeinsame Rasterzeilen. In der ersten steht links das Mustergarten-Video,
rechts stehen die drei Aussagen in gleich großen Reihen mit vertikal zentrierten
Inhalten. Die zweite Zeile verbindet den Mustergarten-Hinweis mit dem Button
„Mehr über uns“. Der Button ist zur gesamten Beschriftung einschließlich des
Besichtigungshinweises vertikal zentriert.

- Desktop ab 901 px: 40–56 px Abstand zwischen Video und Beschriftungszeile,
  gegenüber zuvor 32 px. Die Aussagen erhalten 24–40 px Raster-Innenabstand;
  ihre tatsächlichen Textflächen stehen zusätzlich mittig in den drei Reihen.
- Handy-Querformat bis 900 px: derselbe Aufbau mit 32–40 px Zeilenabstand,
  gegenüber zuvor 28 px, und 12–18 px Raster-Innenabstand. Schriftgrößen, Icons,
  Safe-Area-Ränder und Spaltenbreiten bleiben wie in AP-535.
- Sehr schmales Querformat: die vorhandene gestapelte Anordnung bleibt bedienbar;
  die beiden Gruppen verwenden natürliche Zeilenhöhen und überlappen nicht.
- Hochkant bis 900 px: bestehende Anordnung und Abstände unverändert.

CSS Subgrid synchronisiert die Zeilen ohne feste Medien-/Texthöhen, zusätzliche
Wrapper oder Layout-JavaScript. Die Änderung ist über `@supports` begrenzt:
Browser ohne Subgrid behalten den bisherigen lesbaren Aufbau. Videoausschnitt,
Inhalte, Icon-Dateien, Button-Gestaltung, Kartenfunktion und Einblendanimationen
bleiben bestehen. Der zentrierte Kartenblock folgt weiterhin unter beiden Spalten.

Dateien: `assets/css/home-dark.css`, erläuternder Kommentar in `index.html`,
Cache-Version in `.github/scripts/build-headers.mjs` und generierte Einbindungen.
Gemeinsame CSS-Version `20261001l`; JavaScript bleibt `20261001c`.

## Prüfung

- Querformat: 568×320, 667×375, 844×390 und 900×420 px.
- Desktop: 901, 1024, 1440, 1920 und 2560 px.
- In allen zweispaltigen Prüffällen gleiche Abstände zwischen den Mittelpunkten
  der drei Aussagen, Abweichung durch Rundung unter 0,02 px. Keine Aussage liegt
  an den oberen/unteren Videokanten. Kein Überlappen und kein Seitenüberlauf.
- Mittelpunkt des Buttons und der gesamten Mustergarten-Beschriftung in allen
  Fällen deckungsgleich, Rundungsabweichung unter 0,01 px. Videos behalten ihr
  vollständiges 720:544-Format.
- Bei 1440 px: Video 480×362,7 px, Aussagen-Mittelpunkte im Abstand von 98,2 px,
  rund 51,2 px Luft zwischen Textflächen und Videokanten; Beschriftungszeile
  56 px unter dem Video. Derselbe Aufbau bei 1920 und 2560 px.
- Hochkant 320, 390, 430, 768 und 900 px vor/nachher: identische Sektionshöhe,
  Größen und Positionen von Video, Beschriftung, Aussagen, Button und Karte;
  Schriftgrößen, Abstände und Innenabstände identisch.
- 320×200 px: bestehender schmaler Querformat-Fallback gestapelt, ohne Überlauf.
  720×450 px als CSS-Reflow bei 200 % geprüft; tatsächlicher Browser-Zoom wurde
  nicht emuliert.
- Gerätewechsel Hochkant/Querformat und 900/901-px-Grenze geprüft. Natürliche
  Textumbrüche passen die gemeinsamen Zeilen an. Bestehende Einblendungen und
  Video-Wiedergabe bleiben funktionsfähig.
- Generator erneut ausgeführt: 0 weitere Änderungen. `git diff --check` erfolgreich.
  Kein Commit oder Push.

Messwerte und visuelle Abnahme: `tmp/about-alignment-20261001/`.
