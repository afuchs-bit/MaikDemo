# AP-535 — Über-uns-Sektion der Startseite im Querformat (01.10.2026)

## Ergebnis

Auf `codex/homepage-review` übernimmt die Startseite in `#ueber` den aktuellen
Handy-Stand für Desktop ab 901 px und für Handy-Breiten bis 900 px im Querformat.
Die mobile Hochkantansicht bleibt unverändert, einschließlich der bestehenden
Tablet-Darstellung.

- Mustergarten-Video links, drei aktuelle Aussagen mit den mobilen PNG-Icons
  rechts. Die älteren Desktop-Symbole und Langfassungen sind dort ausgeblendet.
- Gemeinsamer Rahmen von maximal 1120 px, zwei gleiche Spalten und 48–160 px
  Abstand wie in der Willkommenssektion. Beide Spalten sind vertikal zentriert.
- Das Video zeigt sein vollständiges natives 720:544-Motiv. Rundungen,
  Markenblume, Poster und bestehende Wiedergabe bleiben erhalten. Größe und
  Besuchshinweis stehen unter dem Film.
- Die Aussagen verwenden die vorhandene Baloo-2-Gestaltung. Die Bild-Icons
  stehen in 42-px-Flächen neben den Texten; die bestehenden Motivskalierungen
  bleiben gleich. Der Button übernimmt Blüte, Kurztext „Mehr über uns“,
  gefüllte Kontur, versetzten Rahmen, Pfeilkapsel und Puls aus der Handy-Familie.
- Die NRW-Karte steht mittig unter der gesamten Zeile. Sie übernimmt die mobile
  Karte mit Kreisgrenzen, Ortsnamen, rotem Herne-Punkt und der Kurzfassung
  „In ganz NRW für Sie da.“. Ortsliste und Kartennachweis bleiben aufklappbar.
- Im mobilen Querformat: 32 px Randabstand zusätzlich zu Safe-Area-Insets,
  24–36 px Spaltenabstand, kleinere Icons und abgestimmte Texte. Bei höchstens
  440 px verfügbarer Inhaltsbreite folgen die beiden Spalten untereinander,
  damit stark vergrößerte oder besonders schmale Fenster bedienbar bleiben.

Ein neuer Wrapper gruppiert die vorhandenen Video- und Aussageblöcke. Hochkant
verwendet er `display: contents`; Inhalt, Reihenfolge, IDs und beobachtete
Animationselemente bleiben bestehen. Ein DOM, keine neuen Bilder oder Skripte.
Die passenden vorhandenen Handy-Regeln für Aussagen, Mustergarten-Beschriftung
und Karte gelten nun auch für die beiden neuen Layoutbereiche.

Dateien: `index.html`, `assets/css/home-dark.css`,
`assets/css/cta-family-home.css`, `.github/scripts/build-headers.mjs`.
Gemeinsame CSS-Version `20261001j`, durch den Generator in den 51 Seiten mit
Header nachgeführt. JavaScript-Versionen und öffentliche Navigationsziele
bleiben gleich.

## Prüfung

| CSS-Viewport | Spaltenbreite links / rechts | Karte zentriert | Seitlicher Überlauf |
|---|---:|---|---:|
| 568 × 320 | 240 / 240 px | ja | 0 px |
| 667 × 375 | 288 / 288 px | ja | 0 px |
| 844 × 390 | 373 / 373 px | ja | 0 px |
| 900 × 420 | 400 / 400 px | ja | 0 px |
| 901 × 900 | 390 / 390 px | ja | 0 px |
| 1024 × 900 | 433 / 433 px | ja | 0 px |
| 1440 × 1100 | 480 / 480 px | ja | 0 px |
| 1920 × 1080 | 480 / 480 px | ja | 0 px |
| 2560 × 1440 | 480 / 480 px | ja | 0 px |

- Vorher/nachher bei 320, 390, 430, 768 und 900 px Hochkant: identische
  Schriftregeln, Innenabstände, Außenabstände, Spalten, Größen und Positionen
  der sichtbaren Komponenten. Laufende CTA-Pulsflächen sind kein statischer
  Pixelvergleich. Messwerte unter `tmp/about-responsive-20261001/`.
- Alle drei PNG-Icons und die CTA-Blüte laden korrekt. Im neuen Layout sind
  ausschließlich die drei aktuellen Kurzfassungen und der neue Buttontext
  sichtbar und im Accessibility-Baum vorhanden.
- 720 × 450 px als CSS-Reflow eines 1440×900-Fensters bei 200 % sowie
  320 × 200 px geprüft: keine abgeschnittene Beschriftung, kein seitlicher
  Überlauf. Eine tatsächliche Browser-Zoomstufe wurde nicht emuliert.
- Simulierte Safe Areas bei 874 × 402 px: 91 px Seitenabstand (32 + 59 px),
  329 px je Spalte, vollständige Buttonbeschriftung, kein seitlicher Überlauf.
- „Mehr über uns“ per Enter geöffnet: Ziel `/ueber-uns/`, richtige Unterseite.
  Tab führt danach zu „Orte ansehen“; Fokus liegt unter dem festen Header.
- Beide Kartendetails per Enter geöffnet und geschlossen. Bei 901, 844 und
  320 px kein Überlauf im offenen Zustand; Ortsliste und Nachweis bleiben lesbar.
- Film im Sichtbereich geladen und laufend, stumm mit Geschwindigkeit 0,6.
  Bestehendes Verhalten für reduzierte Bewegung bleibt erhalten; das Werkzeug
  bietet keine Emulation der Systemeinstellung.
- Sichtprüfung bei 568, 844, 901 und 1440 px; vollständige Desktop-Abnahme
  einschließlich Karte als `tmp/about-responsive-20261001/final-desktop.png`.
- Header-Generator wiederholt: zweiter Lauf 0 Änderungen. `git diff --check`
  erfolgreich. Kein Commit oder Push für dieses Paket.
