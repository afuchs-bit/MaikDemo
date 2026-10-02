# AP-541 — Ablauf-Kacheln im Querformat und mittige Endpunkte (02.10.2026)

Die neue Bildkartenansicht von AP-536 gilt zusätzlich auf Handy-Breiten bis
900 px im Querformat. Fotos, Marken-Ziffern, Texte, Rundungen, Fortschrittsblume
und Anfrage-Button verwenden dieselben vorhandenen Elemente wie auf dem Handy
hochkant und am Desktop. Die alte Querformat-Darstellung und ihre Tablet-Pill
entfallen. Die Hochkantansicht bleibt unverändert.

Die horizontale Reihe erhält an beiden Enden einen Innenabstand von einer
halben Bühnenbreite abzüglich einer halben Kartenbreite. So beginnt Karte 1
genau in der Mitte und Karte 5 endet dort ebenfalls. Die bestehende Messung von
Linie, Blume und Scrollweg berücksichtigt diese Abstände automatisch. Während
der Desktop-Anheftung laufen die Karten unter dem mittigen Fortschrittspunkt
hindurch. Home, End und Pfeiltasten verwenden denselben vollständigen Weg.

Auf Touch-Geräten, bei geringer Fensterhöhe und reduzierter Bewegung läuft
die Reihe als native horizontale Scrollfläche mit mittigen Einrastpunkten.
Die Seite bleibt vertikal scrollbar; keine Scrollsperre und kein Abfangen
von Touch- oder Radereignissen. Bei genügend Höhe bleibt die Desktop-Animation
beim normalen Seitenscrollen erhalten.

Der Rahmen bleibt maximal 1120 px breit. Symmetrische Seitenabstände betragen
mindestens 32 px plus die größere Displayaussparung. Der innere Container
erhält keine zusätzlichen Safe-Area-Abstände. Bei besonders schmalem Reflow
schrumpfen die Karten innerhalb der verfügbaren Bühne. Eine lokale
`text-size-adjust: 100%`-Regel verhindert zusätzliche Safari-Textvergrößerung
beim Drehen, ohne Zoom zu sperren. Ohne Skripte bleibt die neue Bildkartenliste
vertikal vollständig lesbar.

Die Änderungen betreffen `home-process.css`, die bestehende gemeinsame
Bildkarten-Regel in `privat-form.css`, den Startseiten-Zweig in `main.js`
und die zehn `sizes`-Angaben der Ablauf-Fotos. Der gewerbliche Ablauf bleibt
unverändert. CSS-Version `20261001q`, gemeinsame JS-Version `20261001d`;
Einbindungen durch den Header-Generator konsistent nachgeführt.

## Prüfung

- Querformat 568×320, 667×375, 844×390, 874×402 und 900×420: alle neuen Fotos
  und Zahlengrafiken sichtbar, alte Textvarianten ausgeblendet, erster
  Kartenmittelpunkt auf der Bühnen- und Fenstermitte. Keine Seitenüberläufe.
- Safe Areas von 62 px je Seite einschließlich der allgemeinen Container-
  Innenränder als lokale Quelldiagnose nachgebildet. Bei 874 px beträgt die
  Bühne 686 px; erste und letzte Karte liegen bei x=437 px, Rundungsabweichung
  unter 0,25 px. Kein Zugriff auf das physische iPhone oder seine Safari-Version.
- Desktop 901, 1024, 1440, 1920 und 2560 px: Anfang und Ende geometrisch mittig,
  Rundungsabweichung höchstens 0,5 px, Rahmen maximal 1120 px, kein Überlauf.
  Tatsächlicher Home-/End-Scroll bei 1440×900: erste und letzte Karte x=720 px,
  Fortschritt 0 beziehungsweise 1, Abschlusszustand und Blume korrekt.
- Native seitliche Bedienung im Querformat: Karte 2 rastet mittig ein;
  Home/End erreichen die äußeren Karten. Alle fünf Fotodateien geladen.
- Wechsel vom abgeschlossenen Querformat auf 402×874: vertikale Journey,
  keine feste Scroller-Höhe, zusätzlicher Fokuspunkt und Abschlusszustand entfernt.
  Rückkehr ins Querformat aktiviert wieder die neue Reihe.
- Hochkant 320, 390, 430, 768 und 900 px: Kartenmaße, Positionen, Bildanzeige,
  Schriftgrößen, Bühnenbreite und Journey-Klasse vor/nachher identisch.
- 437×201 mit nachgebildeten Safe Areas als schmaler Reflow: 233-px-Karten
  innerhalb der 249-px-Bühne, beide Endpunkte mittig, kein Seitenüberlauf.
  Dies ist eine CSS-Reflow-Prüfung, keine tatsächliche Browser-Zoomstufe.
- Quelldiagnose mit reduziertem Bewegungszustand: keine Anheftung, End erreicht
  Karte 5 mittig. Ohne Skripte: alle fünf Fotos und Karten sichtbar, kein Überlauf.
- JavaScript-Syntax und `git diff --check` erfolgreich. Zweiter Generatorlauf:
  0 Änderungen. Netzwerk-Vorschau unter `192.168.1.188:8080` erreichbar.
  Kein Commit oder Push.

Messwerte und Aufnahmen: `tmp/process-centered-20261001/`.
