# AP-562 — Neues Hero- und Leistungsfoto für Baumkontrolle (02.10.2026)

Das vom Auftraggeber gelieferte Foto
`WhatsApp Image 2026-10-01 at 21.50.40.jpeg` ersetzt das bisherige
Baumkontrolle-Leitmotiv. Es zeigt einen Baumstamm mit Wurzelanlauf und
ausgelegten Werkzeugen.

## Umsetzung

- Original unverändert und bytegleich als
  `assets/img/leistungen-mobile/originale/baumkontrolle-wurzelanlauf-20261002.jpg`
  gesichert, 1536×1024 px, ohne EXIF/XMP. Hero-Derivate bewahren das
  Seitenverhältnis 3:2. Die vorhandene Bildfläche und Gestaltung bleiben erhalten.
- Separater mittiger 1024×1024-Ausschnitt für die quadratischen Leistungsbilder,
  ohne Retusche, Verzerrung oder Farbänderung. Das Nutzeroriginal bleibt erhalten.
- Zwei Quellen im bestehenden `build-hero-images.mjs` ergänzt. Responsive
  AVIF/WebP-Derivate: Hero 480/800/1200/1536 px, Vorschau 240/480/640 px.
  WebP-Fallbacks, sämtliche 16 ausgelieferten Derivate unter 200 KB und
  ohne EXIF/XMP. Vorhandene Manifesteinträge unverändert.
- Zentrale Zuordnung in `content/leistungen/privat/baumkontrolle.json`:
  neues Hero und Thumbnail. Leistungsseite aus der bestehenden Render-Funktion
  neu erzeugt, einschließlich Preload, Alt-Text und Open-Graph-Bild.
- Baumkontrolle-Bild der Homepage aktualisiert; deren responsive Größenangaben
  und Darstellung erhalten. Die drei Verweise auf Baumpflege, Verkehrssicherheit
  und Sturmnotdienst ebenfalls aus der gemeinsamen Zuordnung neu erzeugt.
- Keine aktiven HTML-Verweise auf `baumkontrolle-ahorn` mehr. Fachliche
  Detailfotos und Ablaufdiagramm der Baumkontrolle bleiben erhalten.
  CSS, JavaScript, Menüziele und öffentliche Seiten-URLs unverändert.

## Prüfung

- Hero bei 320×700, 402×874, 874×402, 901×700, 1440×900 und 1920×1080:
  neue AVIF-Datei geladen, kein horizontaler Überlauf. Bildflächen behalten ihre
  Größen; Hochkant-Sichtprüfung bestätigt passenden Ausschnitt mit Werkzeugen.
- Homepage-Bild bei 1280×720, 402×874 und 874×402 geladen; neue Vorschau,
  korrekter Leistungslink, kein horizontaler Überlauf.
- Bildreferenzen auf allen fünf geänderten Seiten auf Existenz geprüft;
  passende Ergänzung beim Sturmnotdienst zusätzlich sichtbar kontrolliert.
- Hero-Master bytegleich mit dem Nutzerfoto; alle 16 Webderivate auf Größe,
  Abmessungen und Metadaten kontrolliert. Zweiter Bild-/Seitenlauf bytegleich
  für 22 Dateien, Header-Generator mit 0 Änderungen.
- LAN-Vorschau von Homepage und Baumkontrolle liefert den neuen Stand mit
  HTTP 200. Syntaxprüfung des Bildgenerators und `git diff --check` erfolgreich.

Prüfdaten/Screenshots: `tmp/baumkontrolle-20261002/`. Kein Commit oder Push.
