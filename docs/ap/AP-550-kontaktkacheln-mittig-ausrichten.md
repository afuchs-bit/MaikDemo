# AP-550 — Kontaktkacheln neben dem Formular zentrieren (02.10.2026)

Die drei Kontaktwege der Startseiten-Kurzanfrage waren am oberen Rand der
deutlich längeren Eingabespalte ausgerichtet. Auf Desktop ab 901 px und im
Handy-Querformat stehen sie jetzt als gemeinsame Gruppe vertikal mittig neben
der rechten Formularspalte. CSS Grid richtet die Gruppe mit `align-self: center`
an deren natürlicher Inhaltshöhe aus; es gibt keinen festen Versatz, keine feste
Höhe und keine zusätzliche Scroll- oder Layoutlogik.

Die vorhandenen Spaltenbreiten und fließenden Abstände bleiben erhalten. Bei
höchstens 560 px Containerbreite stehen Kontaktwege und Eingabe weiter
untereinander, dort ausdrücklich mit `align-self: start`. Die Änderung betrifft
nur die Startseiten-Kurzanfrage im Desktop-/Querformat-Medienblock. Hochkant,
Bauteilgestaltung, Formular-HTML, Controls, Kontaktziele und JavaScript bleiben
erhalten.

Anfrage-CSS-Version `20261002b` zentral nachgeführt: 39 veröffentlichte
Einbindungen sowie die Leistungsseitenvorlage. Globale CSS-Version bleibt
`20261002l`.

## Prüfung

- Querformat 568×320, 667×375, 768×432, 844×390, 874×402, 900×420;
  Desktop 901×600, 1024×768, 1280×900, 1440×1000, 1920×1080, 2560×1440.
  Kontakttexte und Felder ohne horizontalen Inhaltsüberlauf; Seitenüberlauf 0.
  In sämtlichen zweispaltigen Ansichten sind beide vertikalen Mittelachsen
  innerhalb von 0,004 px gleich. Bei 1440 px wandert die Gruppe um 152,34 px
  nach unten: linke und rechte Mitte jeweils 645,30 px im abgenommenen Bild.
- Simulation von 62 px Sicherheitsrand pro Seite bei 568, 667, 844, 874,
  900 und 437 px: keine Überläufe; 568/667/437 px stapeln, größere Breiten
  bleiben zweispaltig zentriert. CSS-Reflow 437×201 geprüft. Kein physischer
  Safari-/iPhone-Test und kein tatsächlicher Browserzoom.
- Hochkant 320, 390, 430, 768, 900 px: berechnete Größen, Abstände,
  Raster, Schriften und Ausrichtung vor/nachher verglichen, ohne strukturelle
  Abweichungen. Rechtecke der `display: contents`-Wrapper haben keine eigene
  Box; deren scrollabhängige Position und laufende Hover-Farbübergänge wurden
  aus dem Vergleich ausgenommen.
- Nachrichteneingang im Querformat per Maus fokussiert: sichtbarer 2-px-Ring,
  Eingabefläche unterhalb des Headers sichtbar. Tab gelangt anschließend zum
  Fotoeingang mit sichtbarem Fokus. Kein Versand und kein Datei-Upload.
- Desktop und 874×402 visuell abgenommen. Browser ohne Warnungen/Fehler.
  Vorschau-CSS bytegleich mit der bearbeiteten Datei; alle 40 Einbindungen
  einschließlich Vorlage verwenden `20261002b`. Zweiter Generatorlauf:
  0 Änderungen. `git diff --check` erfolgreich.
- Kein Commit oder Push.

Messwerte, Vergleich und Screenshots: `tmp/contact-alignment-20261002/`.
