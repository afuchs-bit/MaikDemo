# AP-534 — Galerie und Einladung im Querformat (01.10.2026)

## Umsetzung

Auf `codex/homepage-review` folgt die Sektion `#social-proof` derselben Breite
und Ausrichtung wie die vorangehenden Willkommen-Bausteine. Die Regeln gelten
ab 901 px sowie bis 900 px ausschließlich im Querformat.

- Galerie und Einladung sind am Desktop höchstens 1120 px breit. Frage und
  Antwort nutzen zwei gleiche Spalten mit dem Willkommen-Abstand von 48–160 px.
- Im mobilen Querformat stehen drei Fotos in einer kompakten festen Reihe.
  Der Seitenabstand beträgt 32 px zusätzlich zu den Display-Sicherheitsabständen.
  Frage und Antwort erhalten 24–36 px Spaltenabstand und passende Schriftgrößen.
- Die drei vorhandenen Motive behalten ihr vollständiges 4:3-Format und die
  Rundungen. Die Blumendekoration ist kleiner und ragt nur 8 px seitlich hinaus.
  Das `sizes`-Attribut berücksichtigt die tatsächlichen Bildspalten.
- „Zur Galerie“ bleibt mittig unter den Bildern. Der Anfrageknopf steht unter
  der Antwort, innerhalb ihrer Spalte. Seine Beschriftung darf umbrechen.
- Bei höchstens 440 px verfügbarer Einladungsbreite im Querformat stehen Frage,
  Antwort und Anfrageknopf untereinander. Das verhindert überlappende Texte
  in sehr schmalen Fenstern beziehungsweise bei starkem Zoom.
- Mobile Hochkantansicht, Inhalte, Bildmotive, Reihenfolge und CTA-Gestaltung
  bleiben unverändert. Das bestehende Karussell bleibt dort mit seinen Punkten,
  Tastaturbefehlen und Wischbedienung bestehen. Kein zweites DOM, keine neue Bibliothek.
- Gemeinsame CSS-Version `20261001i`; die geänderte `cta-family-home.css` wird
  ebenfalls zentral durch den Header-Generator versioniert. Galerie-JavaScript
  `20261001a`, übrige JavaScript-Versionen unverändert.

## Ursache und Korrektur der unsichtbaren Galerie

Nach einem Ladefehler blendete das Skript den gesamten Bildrahmen per `hidden`
aus. Der Wechsel auf Desktop verließ den Fehlerzustand vorzeitig, weil `ready`
falsch war. So konnte der Rahmen verborgen bleiben, obwohl inzwischen Bilder
verfügbar waren. Die Bilddateien selbst wurden mit AP-533 wiederhergestellt.

Jetzt wird beim Wechsel zwischen Karussell und fester Reihe der gesamte
Darstellungszustand synchronisiert: Rahmen, Folien, Punkte, Klone, Beschriftung
und `aria-hidden`. Ein Größenwechsel während des Bildladens erzeugt keine
Karussell-Klone in der festen Reihe. Erfolgreich geladene Bilder stellen den
Rahmen wieder her. Ein erneuter Versuch des Basis-WebP umgeht auch einen
gespeicherten Ladefehler; die ursprünglichen Motive bleiben gleich.

Bei einem tatsächlich fehlenden Foto bleiben erreichbare Nachbarn sichtbar:
Hochkant als Standbild, in der festen Reihe in gleich breiten Spalten. Sind
alle Fotos wirklich nicht erreichbar, bleiben die beiden Links bedienbar.

## Prüfung

Lokale Vorschau unter `http://127.0.0.1:8080/#social-proof`:

| CSS-Viewport | Inhaltsbreite | Feste Fotos | Seitlicher Überlauf |
|---|---:|---:|---:|
| 568 × 320 | 504 px | 3 | 0 px |
| 667 × 375 | 603 px | 3 | 0 px |
| 844 × 390 | 780 px | 3 | 0 px |
| 900 × 420 | 836 px | 3 | 0 px |
| 901 × 900 | 829 px | 3 | 0 px |
| 1024 × 900 | 942 px | 3 | 0 px |
| 1440 × 1000 | 1120 px | 3 | 0 px |
| 1920 × 1080 | 1120 px | 3 | 0 px |
| 2560 × 1440 | 1120 px | 3 | 0 px |

- Hochkant bei 320, 390, 430, 768 und 900 px vor und nach der Änderung verglichen:
  gleiche Komponentenpositionen und Größen, Schriftgrößen, Zeilenhöhen,
  Innenabstände und Layoutregeln. Bewegte CTA-Pulsflächen werden nicht als
  statische Pixelreferenz gewertet. Alle drei Fotos geladen, Karussell aktiv.
- 720 × 450 px als CSS-Reflow bei 200 % eines 1440×900-Fensters sowie 320 × 200 px:
  kein seitlicher Überlauf. In der kleinsten Darstellung nutzt die Einladung
  eine Spalte; auch die CTA-Beschriftung läuft nicht über. Eine tatsächliche
  Browser-Zoomstufe ist mit dem Werkzeug nicht bestätigt.
- Gezielter Wiederherstellungstest auf einer lokalen Testseite: zunächst alle
  drei Fotos nicht erreichbar und Rahmen verborgen. Dateien bereitgestellt,
  dann 390 → 844 → 1440 → 390 px: drei sichtbare Fotos in der festen Reihe,
  danach wieder korrektes Karussell. Kein Neuladen der Testseite notwendig.
- Testseite mit einem dauerhaft fehlenden Motiv: gültiges Standbild im
  Hochkantformat, zwei gleich große Fotos in der festen Querformat-Reihe.
  Kein defektes Bildsymbol und kein horizontaler Überlauf.
- Simulierte Displayaussparungen bei 874 × 402 px: 59 px Sicherheitsabstand
  zusätzlich zu 32 px Randabstand auf beiden Seiten; 692 px Inhaltsbreite,
  drei sichtbare Fotos und kein seitlicher Überlauf.
- Galerie-Steuerung, Größenwechsel und beide Navigationsziele in der lokalen
  Vorschau geprüft. Keine Konsolenfehler auf der regulären Website.
  Home und End wählen das erste beziehungsweise letzte Bild; nach mehrfachem
  Drehen bleibt genau ein Karussellbild aktiv. Der Galerie-Link öffnet die
  Bildergalerie, der Anfrage-Link erreicht das vorhandene Formular.
- Bestehende Regeln für reduzierte Bewegung bleiben erhalten. Eine Emulation
  der Systemeinstellung steht im verwendeten Werkzeug nicht zur Verfügung.
- Header-Generator zweimal ausgeführt, zweiter Lauf 0 Änderungen.
  `git diff --check` und JavaScript-Syntaxprüfung erfolgreich.

Referenzen, Messwerte und lokale Ausfall-Testseiten liegen ausschließlich unter
`tmp/gallery-invitation-20261001/`. Kein Commit oder Push für dieses Paket.
