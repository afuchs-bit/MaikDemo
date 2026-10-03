# AP-564 — Baumkontrolle-Foto mit Warnschild (03.10.2026)

Das Nutzerfoto `WhatsApp Image 2026-10-01 at 21.53.44.jpeg` ersetzt das
Leitmotiv aus AP-562 auf der Homepage, im Baumkontrolle-Hero und in allen
drei passenden Ergänzungen (Baumpflege, Verkehrssicherheit, Sturmnotdienst).

## Umsetzung

- Original bytegleich unter `assets/img/leistungen-mobile/originale/`
  als `baumkontrolle-warnschild-20261003.jpg` gesichert, 1536×1024 px.
- Quadratische Vorschau aus dem linken 1024×1024-Ausschnitt, damit die
  Beschriftung auf dem Warnschild erhalten bleibt. Keine Retusche/Farbänderung.
- Bestehender Bildgenerator: Hero 480/800/1200/1536 px und Vorschau
  240/480/640 px, jeweils AVIF/WebP und WebP-Fallback. Alle 16 Webdateien
  unter 200 KiB (größte 199,3 KiB), ohne EXIF/XMP.
- Zentrale Hero-/Thumbnail-Zuordnung in `baumkontrolle.json` aktualisiert.
  Optionaler `objectPosition`-Wert im vorhandenen Renderer erhält die
  Schildbeschriftung innerhalb der bisherigen 4:3-Herofläche (`0% 50%`).
  Preload, Open Graph und responsive Quellen ebenfalls neu erzeugt.
- Neue Dateinamen verhindern die Wiederverwendung alter Bilddateien aus dem
  Browser-Cache. CSS/JavaScript und fachliche Galerie/Diagramm bleiben erhalten.

## Prüfung

- Hero bei 402×874, 874×402 und 1440×900: neue AVIF-Datei geladen,
  Beschriftung lesbar, kein horizontaler Überlauf.
- Homepage-Vorschau bei 1440×900 und passende Ergänzung beim Sturmnotdienst
  bei 874×402 sichtbar geprüft.
- Alle Bildreferenzen auf den fünf betroffenen Seiten vorhanden; keine
  aktiven Verweise auf das vorherige Baumkontrolle-Leitmotiv.
- Originalvergleich, Derivatgrößen/Metadaten, Konfigurationsabgleich,
  Renderer-Syntax und `git diff --check` erfolgreich.
- Zweiter Bild-/Seiten-/Headerlauf bytegleich für die 22 betroffenen
  Ausgabedateien; Header mit 0 Änderungen.

Prüfdaten/Screenshots: `tmp/baumkontrolle-20261003/`. Lokal umgesetzt.
