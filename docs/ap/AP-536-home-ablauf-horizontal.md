# AP-536 — Mobile Ablauf-Kacheln als horizontale Desktop-Journey (01.10.2026)

Auf `codex/homepage-review` übernimmt `#ablauf` ab 901 px die mobilen
Bildkarten einschließlich Fotos, Kurzfassungen, Marken-Ziffern, Farben,
4:3-Bildausschnitten, asymmetrischen Rundungen und dem Anfrage-Button.
Bis 900 px bleibt die bestehende vertikale Darstellung erhalten.

Die fünf Schritte folgen waagerecht von links nach rechts. Beim normalen
Seitenscrollen bewegt sich die Kartenreihe weiter; die Blume wandert auf der
Fortschrittslinie nach rechts. Linie und Blume verwenden dieselben gemessenen
Knotenmittelpunkte wie die Karten. Die aktuelle Station erhält die vorhandene
mobile Hervorhebung. Die Karten stehen in einem gemeinsamen Rahmen von maximal
1120 px, passend zu den bereits bearbeiteten Startseiten-Sektionen.

Die Bühne haftet unter dem bestehenden Header. Der Scrollweg endet mit Schritt
5; die Blume wechselt anschließend wie mobil in den Anfrage-Button. Dieser steht
nach der Bühne und bleibt mit Tab erreichbar. Pfeiltasten sowie Home und End
bedienen die fokussierte Reihe. Kein Abfangen des Mausrads, kein Scroll-Lock.

Bei zu geringer Fensterhöhe oder reduzierter Bewegung entfällt die Anheftung.
Die gleiche Reihe ist dann nativ seitlich scrollbar und per Tastatur erreichbar.
Ohne Ablauf-JavaScript stehen alle Bildkarten in einer vollständig lesbaren
vertikalen Liste. Größenwechsel räumen Höhen, Fortschritt, Abschlusszustand und
den zusätzlichen Desktop-Fokuspunkt auf. ResizeObserver und geladene Schriften
lösen auf Desktop eine neue Geometrieprüfung aus.

Technik: `assets/css/home-process.css` ist ausschließlich auf der Startseite und
zuletzt eingebunden. Die bestehenden mobilen Bildkarten-/CTA-Regeln in
`privat-form.css` gelten zusätzlich ab 901 px. Die überholten privaten Desktop-
Pin-Regeln und die alte Ausnahme für die Ablauf-Überschrift sind entfernt.
`main.js` erweitert nur die Startseiten-Journey; die gewerbliche Journey behält
ihren bisherigen Breakpoint und Aufbau. Ein DOM, dieselben Assets und Ziele.
Die Bildattribute `sizes` berücksichtigen die Desktop-Kartenbreite von 290–320 px.
CSS-Version `20261001k`, gemeinsame JavaScript-Version `20261001c`; Generator und
Seitenvorlage führen die Einbindungen konsistent nach.

## Prüfung

- Desktop bei 901, 1024, 1440, 1920 und 2560 px mit 768 px Höhe: korrekt angeheftet,
  Kartenbreiten 290/320 px, Rahmen maximal 1120 px, kein Seitenüberlauf. Bei allen
  Breiten liegen die Knoten auf derselben 30-px-Linienhöhe.
- Mobile Vorher/Nachher bei 320, 390, 430, 768 und 900 px Hochkant: identische
  Sektionshöhen, Karten- und Knotenmaße, Schriftgrößen sowie tatsächliche Position
  von Bühne und Abschluss-CTA. Gesicherte Messwerte unter
  `tmp/process-horizontal-20261001/mobile-geometry-{before,after}.json`.
- 844 × 390 px: bestehende vertikale mobile Journey und kein Seitenüberlauf.
  720 × 450 px als CSS-Reflow eines 1440×900-Fensters bei 200 %: sämtliche Karten
  erreichbar, kein Überlauf. Eine tatsächliche Browser-Zoomstufe wurde nicht gesetzt.
- 1024 × 600 px: native horizontale Reihe ohne feste Scroller-Höhe; End erreicht
  Karte 5 und übergibt die Blume korrekt. Wechsel zurück auf Desktop sowie über
  die 900/901-px-Grenze geprüft.
- Normales Vorwärts-/Rückwärtsscrollen, Anfang, Zwischenstand und Abschluss geprüft.
  Blume und Knoten bleiben auf einer Linie. Alle fünf Fotos und Zahlengrafiken
  verwenden die vorhandenen mobilen Dateien. Karten bleiben vollständig lesbar.
- Home, End, Pfeiltaste links und Tab zum Anfrage-Button geprüft; sichtbarer Fokus
  unter dem Header. Enter auf „Projekt anfragen“ führt zum bestehenden `#anfrage`.
- Lokale Diagnose mit reduzierter Bewegung im JavaScript: keine Anheftung, alle
  Karten seitlich erreichbar. Wechsel vom abgeschlossenen Desktop auf Mobil
  entfernt Abschlusszustand und zusätzlichen Fokuspunkt. Keine Emulation der
  Betriebssystem-Einstellung; dazugehörige CSS-Regeln geprüft.
- Lokale Diagnose ohne Skripte: Überschrift und alle fünf Bildkarten sichtbar,
  keine versteckten Karten oder horizontaler Seitenüberlauf.
- HTML-Verschachtelung, JavaScript-Syntax und `git diff --check` geprüft.
  Zweiter Header-Generatorlauf: 0 Änderungen. Kein Commit oder Push.

Visuelle Abnahme: `tmp/process-horizontal-20261001/final-desktop.png`.
