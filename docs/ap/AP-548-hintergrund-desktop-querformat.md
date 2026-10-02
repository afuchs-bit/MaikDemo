# AP-548 — Einheitlicher Seitengrund für alle Ansichten (02.10.2026)

Der Grundton der mobilen Hochkantfassung ist `#1B1E19`. Die Prüfung ergab,
dass AP-526 diesen Ton bereits auf den meisten Seiten- und Sektionsflächen
auch in breiten Ansichten setzte. Mehrere Dateien definierten ihn jedoch
unabhängig voneinander. `styles.css` führt jetzt `--page-background` als
gemeinsame Quelle; `--home-page-background`, `--bg-hero` und die Leistungsseiten-
Variable `--lp-bg` greifen darauf zurück.

Seitengrund und Sektionsflächen der Startseite, Galerie samt klebendem
Umschalter, Kontakt, Über uns und Leistungsseiten verwenden diese Quelle.
Der bisherige Hero-Verlauf in der Basisregel entfällt. Im mobilen Querformat
entfällt zusätzlich die verbliebene Trennlinie zwischen Willkommen und Galerie;
das Hero-Wasserzeichen läuft wie auf dem Handy weich in den Seitengrund aus.

Header und Footer behalten ihren dunkleren Ton aus der Hochkantfassung.
Karten, Eingabefelder, Icons, Fotos und Interaktionszustände behalten ihre
eigenen Oberflächen. Der Auftrag betrifft den Seiten- und Sektionsgrund.
Die Hochkantregeln für Layout, Schrift und Abstände werden nicht verändert.

CSS-Version `20261002k` zentral nachgeführt. Der Header-Generator aktualisiert
nun auch die Einbindungen von `kontakt.css`, `ueber-uns.css` und `projekte.css`.
Alle 51 veröffentlichten Seiten mit Header laden die neue gemeinsame Version.
Die bisherigen kritischen Inline-Hintergründe für die erste Darstellung bleiben
mit demselben Farbwert bestehen.

## Prüfung

- Alle 51 Seiten bei 390×844, 874×402 und 1440×1000 px geprüft (153 Ansichten):
  html/body durchgehend `rgb(27, 30, 25)`; die Hauptsektionen zeigen denselben
  Grund oder einen transparenten Hintergrund darüber, keine abweichenden Verläufe.
- Startseiten-Sektionsflächen zusätzlich bei 320, 430, 900 px Hochkant,
  568×320, 667×375, 844×390, 900×420 Querformat und 901, 1024, 1920, 2560 px
  Desktop geprüft. Alle Hauptsektionen farbgleich. Die Willkommens-Trennlinie
  fehlt im Querformat und Desktop; die bestehende Tablet-Hochkantlinie bleibt.
- Vorher/nachher bei 390 und 768 px Hochkant über sieben Seitentypen verglichen:
  Farben, Hintergründe, Breiten, Abstände, Schriften, Rahmen und Schatten identisch.
  Beim Bonsai-Galerieraster schwanken die beim Laden erfassten Höhen unabhängig
  von diesen Eigenschaften; die Änderung betrifft dort ausschließlich Farbvariablen.
- Desktop-Galerie und Handy-Querformat-Willkommen visuell abgenommen.
- Zweiter Generatorlauf: 0 Änderungen. `git diff --check` erfolgreich.
- Kein Commit oder Push.

Messwerte und Screenshots: `tmp/background-review-20261002/`.
