# AP-532 — Willkommenssektion im Querformat (01.10.2026)

## Auftrag und Umsetzung

Auf `codex/homepage-review` stehen Poolgarten und Leitsatz ab 901 px sowie bis
900 px ausschließlich im Querformat nebeneinander. Die Bild-Text-Zeile ist
zentriert, am Desktop höchstens 1120 px breit und in zwei gleiche Spalten geteilt. Die
gemeinsamen Regeln stehen direkt bei der Komponente in `home-dark.css`.

- Spaltenabstand: mobil `clamp(24px, 4vw, 48px)`, Desktop
  `clamp(48px, calc(22vw - 150px), 160px)`.
- Abstand unter der Willkommen-Wortmarke: `clamp(56px, 5vw, 72px)`.
- Bild: vollständiges 4:3-Motiv, weiterhin `object-fit: contain`, bestehende
  Rundungen und Farbwirkung. Die Blumendekoration skaliert mit der kleineren
  Bildfläche; ihre Überlappung in den Spaltenabstand beträgt nur 8 px.
- Text: unveränderter Wortlaut, Baloo 2/600, Desktop fließend 30–36 px,
  mobiles Querformat 17–28 px nach tatsächlicher Containerbreite, Zeilenhöhe 1,4,
  linksbündig und vertikal zentriert. Keine festen Höhen oder manuellen Umbrüche;
  `overflow-wrap: break-word` schützt sehr schmale Querformatfenster.
- Mobiles Querformat: 32 px Außenabstand zusätzlich zu den seitlichen
  `safe-area-inset`-Werten. Eckdaten und Qualifikationen bleiben höchstens
  34 rem breit; am Desktop unverändert 640 px einschließlich `zoom: 1.25`.

Die mobile Hochkant-Komposition bleibt unverändert. Das bestehende DOM und die
Skripte bleiben erhalten; die Reihenfolge und Verzögerungen der Einblendungen
ändern sich nicht. Das `sizes`-Attribut des Fotos berücksichtigt die neue
Spaltenbreite und bewahrt die bisherige Hochkant-Bedingung. Die gemeinsame
CSS-Version ist `20261001g`, die JavaScript-Version bleibt `20261001b`.

Die Nachkorrektur anhand von `IMG_5258.PNG` verteilt die beiden Inhalte auf
großen Desktopflächen weiter nach außen. Im mobilen Querformat bestimmt
zusätzlich `3.6cqw` die Schriftgröße: Display-Sicherheitsabstände verkleinern
die Textspalte und jetzt entsprechend auch die Schrift. Eine vw-basierte
Fallback-Deklaration bleibt erhalten. `text-size-adjust: 100%` verhindert
zusätzliche automatische Schriftvergrößerung beim Drehen ausschließlich
in diesem Textblock; die Hochkantdarstellung und Browser-Vergrößerung bleiben
erhalten.

## Prüfung in der lokalen Vorschau

Geprüft im In-App-Browser unter `http://127.0.0.1:8080/`:

| CSS-Viewport | Bildhöhe | Texthöhe | Seitlicher Überlauf |
|---|---:|---:|---:|
| 568 × 320 | 180 px | 143 px | 0 px |
| 667 × 375 | 216 px | 174 px | 0 px |
| 844 × 390 | 280 px | 233 px | 0 px |
| 900 × 420 | 300 px | 235 px | 0 px |
| 901 × 900 | 293 px | 294 px | 0 px |
| 1024 × 900 | 325 px | 270 px | 0 px |
| 1440 × 900 | 360 px | 302 px | 0 px |
| 1920 × 1080 | 360 px | 302 px | 0 px |
| 2560 × 1440 | 360 px | 302 px | 0 px |

- Alle Ansichten visuell kontrolliert: gleiche Spalten, vollständiges Motiv,
  keine Berührung zwischen Text und Blumendekoration. Die Textfläche erreicht
  in den regulären Größen ungefähr 78–101 % der Bildhöhe.
- Lokale Testseite bei 874 × 402 px mit simulierten seitlichen
  Sicherheitsabständen von je 59 px: Bild 246,39 px hoch, Text 244,13 px,
  Schrift 24,91 px. Keine Berührung mit der Blumendekoration und kein Überlauf.
- Nach der Nachkorrektur erneut bei 320, 390, 430, 768 und 900 px Hochkant
  geprüft: alle elf Komponenten behalten ihre Dokumentpositionen, Abmessungen,
  Schriftgrößen, Zeilenhöhen und Bilddarstellung.
- Hochkantvergleich bei 320, 390, 430, 768 und 900 px: alle elf erfassten
  Komponenten haben nach abgeschlossenen Animationen identische berechnete
  Stile und Dokumentpositionen wie vor der Änderung. Die Screenshots bei
  320 und 390 px sind zusätzlich pixelgleich. Die anderen Screenshotpaare
  besitzen unterschiedliche Scrollpositionen; dort wurde der vollständige
  Stil- und Geometrievergleich verwendet.
- 200-%-Reflow wurde mit dem entsprechenden CSS-Viewport 720 × 450 px
  geprüft (1440 × 900 px bei doppelter Vergrößerung): zwei Spalten, kein
  seitlicher Überlauf. Ein nativer Zoom-Shortcut änderte im In-App-Browser
  die Zoomstufe nicht; eine tatsächliche Browser-Zoomstufe wird daher nicht
  als geprüft behauptet.
- Bei 320 × 200 px bleiben beide Spalten erhalten und der Text wird höher
  als das Bild. Lange Wörter können umbrechen; kein seitlicher Überlauf.
- „Sachverständiger“ per Tastatur geöffnet und bei 390 → 844 → 1024 → 390 px
  geprüft: geöffnetes Panel und `aria-expanded` bleiben synchron, die
  Detailbreite folgt dem jeweiligen Modul. Anschließend per Tastatur geschlossen.
- Bestehende reduzierte-Bewegung-Regeln statisch kontrolliert: kein Masken-,
  Transform- oder Übergangseffekt für die Willkommen-Einblendung. CSS und
  JavaScript dieses Pfads wurden nicht verändert; eine Browser-Emulation
  dieser Systemeinstellung steht im verwendeten Werkzeug nicht bereit.
- Foto geladen, Wortlaut unverändert, keine Konsolenfehler.
- Header-Generator: erster Lauf aktualisiert die CSS-Version auf allen
  51 Seiten mit Header; zweiter Lauf 0 Änderungen. Auf Unterseiten wurde
  gegenüber dem Ausgangsstand ausschließlich die CSS-Version angehoben.

Messwerte, Screenshots und lokale Ausgangsstände liegen in
`tmp/welcome-landscape-20261001/`; die Nachkorrektur und die lokale Notch-Testseite
in `tmp/welcome-spacing-20261001/`. Sie sind keine veröffentlichten Inhalte.
Keine neuen Assets, Abhängigkeiten, URLs oder Schnittstellen. Kein Commit
oder Push für dieses Paket ausgeführt.
