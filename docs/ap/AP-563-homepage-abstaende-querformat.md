# AP-563 — Luft und gleichmäßige Abstände auf der Homepage

## Umsetzung

Die Homepage übernimmt den vertikalen Rhythmus der Hochkantfassung für Desktop
und Handy-Querformat, mit großzügigeren Stufen für die breiteren Inhalte.
`assets/css/home-spacing.css` wird ausschließlich in `index.html` nach den
Komponenten geladen. Alle Regeln gelten ab 901 px oder bis 900 px im Querformat.

- Gleiche obere und untere Sektionsränder: Desktop 72–112 px, Handy-Querformat
  56–64 px. Zusammen ergeben sie 144–224 bzw. 112–128 px zwischen den Inhalten
  zweier benachbarter Sektionen. Willkommen erhält diese Ränder als Margin
  im vorhandenen Hero-Raster.
- Überschrift zum Inhalt: Desktop 56–80 px, Handy-Querformat 40–48 px.
  Weitere Stufen verbinden größere Gruppen, einzelne Blöcke und Listeneinträge.
- Hero, Willkommen, Kennzahlen, Qualifikationen, Galerie, Einladung, Über uns,
  Einsatzgebiet, Leistungen, Ablauf, Bewertungen, Formular und FAQ verwenden
  den gemeinsamen Maßstab. Leistungszeilen erhalten mehr Innenraum.
- Frage und Antwort bleiben nah beieinander. Der mittige CTA bekommt mehr
  Abstand nach oben. Subgrid koppelt weiterhin den Abstand unter Bild und
  Aussagen in Über uns. Ablauf und Formular behalten ihre Anordnung.
- Hochkantlayout, Bildausschnitte, Schriftgrößen, Aktionsbuttonmaße,
  Footerkarte, JavaScript und Unterseiten bleiben erhalten.

Die Version der neuen Datei wird im Header-Generator zentral als
`HOME_SPACING_CSS_VERSION = '20261002b'` geführt. Andere Assetversionen bleiben
unverändert. Der erste abschließende Lauf aktualisierte nur `index.html`,
der zweite erzeugte keine weiteren Änderungen.

## Prüfung

- Querformat 568×320, 667×375, 844×390, 874×402 und 900×420; Desktop
  901×700, 1024×768, 1440×900, 1920×1080 und 2560×1440.
  Zusätzlich Reflow-Geometrie bei 437×201 und 320×201. Alle sieben
  Hauptsektionen besitzen bei jeder Größe gleiche obere und untere Ränder;
  kein horizontaler Seitenüberlauf.
- Hochkant 320×700, 402×874, 768×1024 und 900×1200 vor/nachher verglichen:
  Positionen und Abmessungen der jeweils 2.000 erfassten DOM-Elemente
  unverändert. Die neuen Media Queries greifen dort nicht. Kurzzeitig
  abweichende berechnete Auto-Margins und interpolierte Farben verändern
  die Geometrie nicht.
- Sichtprüfung von Über uns, Leistungen, Ablauf und Formular am Desktop;
  Galerie, Chat und FAQ im Handy-Querformat. Alle drei Galeriebilder geladen.
  Die fünf großen Aktionsbuttons behalten 362×64 px und die bisherige
  Breitenbegrenzung in schmalen Flächen.
- FAQ-Frage per Klick, weitere Gruppen per Enter geöffnet und geschlossen.
  Inhalte bleiben einspaltig ohne Überlauf; Fokus liegt unterhalb des Headers.
- Desktop-Ablauflinie beginnt am Mittelpunkt der ersten Zahl. Handy-Querformat:
  durch alle fünf Schritte gescrollt; Fortschritt steigt von 0 auf 1, Schritt
  fünf wird aktiv und die Blume erreicht das Linienende unterhalb der Zahl.
- Generator-Syntax und `git diff --check` erfolgreich. Lokale und LAN-Vorschau
  HTTP 200; LAN-CSS bytegleich zum bearbeiteten Stand.

Messwerte/Screenshots: `tmp/home-spacing-20261002/`. Geprüft in der In-App-Vorschau,
ohne physischen Safari-Gerätetest. Kein Commit oder Push.
