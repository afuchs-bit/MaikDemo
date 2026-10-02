# AP-560 — Seitlicher Hero für Desktop und Handy-Querformat (02.10.2026)

Die neue Richtung ersetzt die breite Fotobühne aus AP-559. Die Inspiration
`Unknown-3.png` liefert die grobe Anordnung: dunkle Textseite links, Foto rechts
und eine schräge Grenze. Texte, Garten-Schriftzug, Blumen-Wasserzeichen,
Instagram-Icon, Standort-Pin und Kontaktaktionen stammen aus dem bestehenden
Hochkant-Hero. Keine neuen Geschäftsaussagen oder Menüziele.

## Umsetzung

- Ab 901 px sowie bis 900 px ausschließlich im Querformat ordnet ein gemeinsames
  CSS Grid die vorhandenen Inhalte seitlich an. Ein DOM, keine duplizierten
  Inhalte und keine neuen Skripte. Titel, Kontaktaktionen und Nachweise haben
  natürliche Zeilenhöhen; Willkommen folgt im normalen Dokumentfluss.
- Die dunkle Seite verwendet den Seitengrund und ein dezentes vorhandenes
  Blumen-Wasserzeichen. Eine 2 px feine grüne Diagonale trennt sie vom Foto.
  Inhalt maximal 1680 px breit, Typografie fließend von 44 bis 80 px am Desktop.
- Die mobile Kontaktlasche wird horizontal mit zwei getrennten Zielen:
  Projekt zum bestehenden Formular, Telefon zum bestehenden Direktanruf.
  Mobile Farben, Telefonasset und asymmetrische Rundungen bleiben erhalten.
  Beide Inhalte sind vertikal zentriert; Tastaturfokus bleibt deutlich sichtbar.
- Das bisherige **Hochkantfoto** wird auch rechts im neuen Hero verwendet:
  `hero-fahrzeug-palmengarten-v9-mobile-q95.webp` und die vorhandene doppelte
  Auflösung `hero-fahrzeug-palmengarten-v10-mobile-2046-q92.webp`.
  Bilddateien unverändert. `sizes` und Preload entsprechen 55 vw Fotobreite.
  Der Browser komponiert das Motiv per `object-fit: cover` mit Fokus auf
  Fahrzeug und Pflanzen. Die AP-559-Querformatdateien sind nicht mehr aktiv.
- Handy-Querformat erhält kleinere Schrift, eine 56 px hohe Kontaktgruppe,
  kompakte Nachweise und symmetrische Safe-Area-Abstände. `svh` vermeidet eine
  zusätzliche Abhängigkeit von der ein-/ausblendenden Werkzeugleiste.
  Sehr niedrige Fenster dürfen natürlich höher werden und normal scrollen.
- Der vorhandene schwebende Header und sein Scrollzustand bleiben erhalten.
  Hochkant-Regeln und CSS außerhalb des ersetzten Hero-Blocks sind bytegleich.
  CSS `20261002v` konsistent nachgeführt; JavaScript `20261002e` und Anfrage-CSS
  `20261002c` unverändert. Reduzierte Bewegung ist im breiten Hero berücksichtigt.

## Prüfung

- Sechs Hochkantansichten unmittelbar mit einer lokalen Vorher-Fassung
  verglichen: 320×700, 390×844, 402×874, 430×932, 768×1024 und 900×1200.
  Layout und berechnete Gestaltung von Header, Foto, Titel, Kontaktgruppe,
  Nachweisen und Willkommenbereich identisch. Vorher-Fassung verwendet
  dieselben absoluten Font-/Bildpfade, damit der Vergleich keine Ersatzfonts misst.
- Querformat 568×320, 667×375, 844×390, 874×402, 900×420 und 844×300;
  Desktop 901×700, 1024×768, 1280×800, 1440×900, 1920×1080 und 2560×1440.
  Alle Fotos geladen, kein horizontaler Seitenüberlauf, Inhalt vollständig
  erreichbar. Sichtprüfung besonders bei 568, 874, 901, 1440 und 2560 px.
- Schmale Darstellung 437×201 als Reflow-Prüfung; zusätzlich lokaler Safe-Area-
  Prüfstand mit 62 px beidseitigen Insets. Keine Überlappungen oder Überläufe.
- Hochkant/Querformat-Wechsel ohne Reload; Formularsprung endet unterhalb des
  Headers. Fünf Höhenwechsel bei 874 px Breite behalten die Scrollposition
  9799 px bei. Neuer Hero verwendet weder Scroll-Pins noch ScrollTrigger.
- Tastaturwechsel von Projekt zu Direktanruf mit sichtbarem 3 px Fokusring.
  Menü öffnet innerhalb des Querformat-Viewports, Escape führt den Fokus
  zurück zum Auslöser, Wechsel auf Desktop schließt das Menü.
- Keine JavaScript-Fehler im finalen Vorschauzustand. Header-Generator erneut
  ausgeführt: 0 Änderungen. Syntaxprüfung des Generators und `git diff --check`
  erfolgreich. Kein Commit oder Push.

Messwerte und Screenshots: `tmp/hero-split-20261002/`. Die Prüfung erfolgte
in der lokalen In-App-Vorschau; ein physischer Safari-Gerätetest wird dadurch
nicht ersetzt. CSS-Regeln für reduzierte Bewegung wurden kontrolliert;
437×201 prüft die Geometrie bei effektiv halbierter Bildschirmgröße.
