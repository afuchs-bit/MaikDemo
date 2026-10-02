# AP-545 — Footer am Desktop und im Querformat angleichen (02.10.2026)

Die mobile Hochkantfassung bleibt unverändert. Desktop ab 901 px und mobiles
Querformat übernehmen ihre Logo-, Kontakt-, Telefon-, WhatsApp- und Instagram-
Bausteine in einer fast seitenbreiten, abgerundeten Fläche ohne Außenkontur.
Die Proportion orientiert sich an der freigegebenen Referenz
https://simplydelegate.github.io/Vitja-Website/: 12 px Außenabstand und ein
separat begrenzter Inhalt mit höchstens 1440 px Breite.

Schmale Desktopfenster und Querformat zeigen Logo/Adresse links und die vier
Kontaktkacheln rechts. Social-Icons und Erreichbarkeit bilden darunter eine
flache Zeile. Ab 1200 px steht der Social-Bereich als dritte Spalte rechts.
Im Querformat sind Zwischenräume und Kachelhöhen kompakter; Kontakt-, Social-
und Rechtslinks bleiben mindestens 44 px hoch. Die tatsächliche Inhaltshöhe
bleibt flexibel. Bei schmalem Querformat unter 561 px stapelt das Raster für
Reflow; Texte und Links bleiben vollständig erreichbar.

Die Sicherheitsabstände werden einmal auf Ebene des Footer-Inhalts angewendet;
der größere linke oder rechte Displayrand hält die Gruppe symmetrisch. Safari-
Textvergrößerung beim Drehen ist im Querformat auf 100 % gesetzt. Die Hochkant-
Regeln samt Abständen und Schriftgrößen werden davon nicht berührt.

Die Gestaltung liegt ausschließlich in `assets/css/footer-kontakt.css`.
Gezielte Selektoren überstimmen die vorhandenen Footer-Container-Regeln der
Leistungsseiten. HTML-Struktur, Linkziele, Icons und JavaScript sind erhalten.
Footer-CSS-Version `20261002a` in Generator, allen 51 veröffentlichten Seiten
mit Footer und den fünf Seitenvorlagen nachgeführt.

## Prüfung

- Hochkant 320, 390, 430, 768 und 900 px: vollständiger Vergleich der Footer-
  Elementgeometrie und berechneten Schrift-/Raster-/Abstandswerte vor/nachher
  identisch, einschließlich Footerhöhe.
- Querformat 568×320, 667×375, 844×390, 874×402 und 900×420: Footer rund 287 px
  hoch, keine abgeschnittenen Texte oder horizontaler Überlauf. Bei 844×390
  vorher 542 px, jetzt 287 px.
- Simulierte iPhone-Sicherheitsränder von 62 px bei 874×402: weiterhin 287 px
  Höhe, vollständige Nummern und Beschriftungen, Kontaktflächen 44 px,
  Social-Flächen 55,2 px. Kein Test auf einem physischen iPhone/Safari.
- Desktop 901, 1024, 1200, 1440, 1920 und 2560 px: Karte mit 12 px Außenabstand,
  keine Außenkontur, vollständige Nummern und Kontakttexte, kein Überlauf.
  Rund 340 px Footerhöhe bei 1440 px, 347 px auf großen Bildschirmen.
- Reflow 437×201: gestapelter Aufbau vollständig erreichbar und ohne Überlauf;
  dies ist eine CSS-Reflow-Prüfung, kein tatsächlicher Browserzoom.
- Kontakt, Über uns, Galerie, Leistungsseite Bonsai/Formgehölze, Projektdetail,
  Impressum und 404 bei 844, 901 und 1440 px: identische Footer-Geometrie.
- Alle 51 veröffentlichten Footer auf Einbindung, aktuelle CSS-Version,
  Kontaktkanäle und korrekte relative/wurzelabsolute Rechts- und Formularlinks
  geprüft. Formular- und Impressumsnavigation im Browser ausgeführt.
- Tastaturfokus bleibt sichtbar (3 px Ring, 3 px Abstand), kein Beschneiden
  durch den Footer. Zweiter Header-Generatorlauf: 0 Änderungen.
- `git diff --check` erfolgreich. Kein Commit oder Push.

Abnahme und Messwerte: `tmp/footer-review-20261002/`.
