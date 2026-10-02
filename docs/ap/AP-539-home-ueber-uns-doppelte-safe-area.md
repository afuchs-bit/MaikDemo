# AP-539 — Doppelte Display-Sicherheitsränder in Über uns entfernen (01.10.2026)

Die Rückmeldung aus Safari auf dem iPhone 16 Pro bestätigt eine verbleibende
Verkleinerung von Video und Aussagen im Handy-Querformat. Der Fehler stammt aus
der allgemeinen `.container`-Regel in `styles.css`: Sie setzt links und rechts
`env(safe-area-inset-*)` als Innenabstand. Die Über-uns-Sektion berücksichtigt
dieselben Sicherheitsränder bereits über ihre äußere Breite und die Seitenränder.
Die inneren `.container`-Spalten ziehen die Sicherheitsränder daher erneut ab.

Mit nachgebildeten 62 px je Seite bei 874×402 px ergibt sich exakt der gemeldete
Aufbau: äußere Spalte 325,52 px, tatsächliche Video-/Textbreite nur 201,52 px,
Video 151,14 px hoch. Alle Aussagen umbrechen auf drei Zeilen und machen die
rechte Fläche höher als das Video. Das Video sitzt mit x=156 px zusätzlich
nach innen versetzt. Die bisherige AP-538-Simulation bildete nur die äußeren
Sicherheitsränder nach; die allgemeine Container-Innenpolsterung fehlte.

Die Korrektur entfernt ausschließlich bis 900 px im Querformat das zusätzliche
linke und rechte Padding aus Kopf, Mustergarten-Spalte, Aussagen-Spalte und
Kartencontainer dieser Sektion. Die äußeren Sicherheitsränder bleiben vollständig
erhalten. Keine Änderung an allgemeinem `.container`, Hochkant, Desktop, Assets,
Markup, Texten, Video, Animationen oder JavaScript.

Gemeinsame CSS-Version `20261001n`; JavaScript bleibt `20261001c`.

## Prüfung

- Vorher/Nachher mit derselben Simulation einschließlich allgemeiner Container-
  Innenränder: Video und Poolfoto jetzt jeweils 325,52×244,14 px, Aussagenfläche
  ebenfalls 325,52×244,14 px; inneres Padding 0. Aussagen jeweils zwei Zeilen.
- 568×320 und 667×375 ohne Displayaussparungen; 844×390, 874×402 und 900×420
  mit simulierten 62 px je Seite: gleiche Mediengrößen und rechte Spaltenflächen,
  gleichmäßige Aussagenverteilung, kein horizontaler Überlauf. Button und
  Beschriftung haben dieselbe vertikale Mitte, Rundungsabweichung unter 0,01 px
  bei abgeschlossenen Einblendungen und ohne Button-Puls.
- Asymmetrische Sicherheitsränder (62 px links, 0 rechts) auf 874×402 geprüft.
  Dieselbe Innenbreite wie bei Willkommen, Sicherheitsrand nur einmal angewendet.
- Hochkant 320, 390, 430, 768 und 900 px; Desktop 901, 1440 und 2560 px:
  identische Maße, Positionen, Abstände und Schriftgrößen zum vorherigen CSS.
  Quelldateien behalten korrekt aufgelöste Font-/Bildpfade; für den direkten
  Geometrievergleich sind lediglich die Einblendungen deaktiviert.
- 437×201 mit simulierten Sicherheitsrändern: bestehender schmaler Querformat-
  Fallback ohne horizontalen Überlauf. Dies prüft CSS-Reflow, keinen echten
  Browser-Zoom.
- Visuelle Abnahme mit laufenden Einblendungen bei 874×402 und Abschlusszeile
  bei 874×500. Die größere Höhe dient nur dazu, Bild, Aussagen, Beschriftung
  und Button in einer Aufnahme zu zeigen. Kein Zugriff auf das physische iPhone;
  die Sicherheitsränder werden vollständig in lokalen Quelldateien nachgebildet.
- Zweiter Header-Generatorlauf: 0 Änderungen; `git diff --check` erfolgreich.
  Vorschau über `192.168.1.188:8080` liefert Version n und dieselben CSS-Bytes
  wie das Repository. Kein Commit oder Push.

Messwerte, Fehler-Reproduktion und Abnahme: `tmp/about-safearea-20261001/`.
