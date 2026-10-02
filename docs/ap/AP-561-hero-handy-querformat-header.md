# AP-561 — Handy-Querformat an den Hochkant-Hero angleichen (02.10.2026)

Die Rückmeldung zu `IMG_5272.PNG` betrifft den Startseiten-Hero im Querformat,
besonders das zusätzliche Instagram-Icon in der schwebenden Header-Kachel.
Die tatsächliche iPhone-Hochkantfassung dient als Referenz: Im Einstieg sind
WhatsApp und Menü sichtbar, beim Scrollen erscheint Telefon im kompakten Kopf.

## Umsetzung

- Instagram im Startseiten-Header bis 900 px ausschließlich im Querformat
  ausblenden. Derselbe Header, dieselben Assets, Farben, Radien und Zustände
  wie hochkant; keine zusätzlichen Aktionen oder duplizierten Inhalte.
  Instagram bleibt als bestehender „Einblicke Live“-Nachweis im Hero erhalten.
- Schwebende Kachel mit mindestens 32 px symmetrischem Seitenabstand; größere
  Displayaussparungen erweitern beide Abstände gleichmäßig. Die niedrige
  Queransicht behält eine kompakte, mindestens 82 px hohe Kachel. Das Logo
  verkleinert sich nur, wenn der verfügbare Raum bei starkem Zoom knapp wird.
- Hero-Titel beginnt bei 122 px statt 110 px. Die Schrift verwendet
  `clamp(26px, 3.8vw, 34px)`; bei den üblichen Quergrößen sind rund 21 px Luft
  unter dem Header. Kontaktgruppe, Nachweise, Bild und schräge Gestaltung
  verwenden weiterhin die vorhandenen Hochkant-Elemente aus AP-560.
- Lange Wörter der Projektaktion dürfen in besonders schmalen Fenstern
  umbrechen. Natürliche Inhaltshöhen ermöglichen normales Scrollen.
- Änderung ausschließlich im vorhandenen Querformat-Media-Block von
  `assets/css/home-dark.css`. Hochkant-/Desktop-CSS außerhalb dieses Blocks,
  HTML-Struktur und JavaScript unverändert. CSS-Version `20261002w` über den
  Header-Generator nachgeführt, JavaScript bleibt `20261002e`.

## Prüfung

- Querformat 568×320, 667×375, 844×390, 874×402, 900×420 und 844×300:
  keine horizontalen Überläufe, Instagram im Header ausgeblendet, rund 21 px
  Titelabstand. Bei sehr niedrigen Fenstern bleiben alle Inhalte durch normales
  Scrollen erreichbar. Sichtprüfung bei 568 und 874 px.
- Sechs Hochkantansichten (320, 390, 402, 430, 768 und 900 px) sowie Desktop
  bei 901, 1024, 1440 und 2560 px mit der unmittelbaren Vorher-Fassung
  verglichen: Geometrie und berechnete Gestaltung identisch.
- Wechsel von 402×874 auf 874×402 ohne Neuladen übernimmt die richtigen
  Header-Aktionen. Nach Scrollen: WhatsApp, Telefon und Menü jeweils 44×44 px.
- Menü im Querformat innerhalb des Viewports; Leistungs-Dropdown und Escape
  geprüft. Escape führt den Fokus zum jeweiligen Auslöser zurück.
  Wechsel mit offenem Menü auf Desktop schließt es und gibt die Scrollsperre
  frei. Telefon-Popover 272×158 px vollständig im Viewport; beide Nummern
  einzeilig, Escape führt zum Telefonknopf zurück.
- Reflow-Geometrie bei 437×201 und 320×201 sowie Prüfstand mit symmetrischen
  62 px Displayaussparungen: kein horizontaler Seitenüberlauf. Bei 320 px
  bleibt der gesamte Text der Projektaktion innerhalb seiner Fläche.
- Fünf Höhenwechsel 330/360/402/350/402 px bei 874 px Breite behalten die
  Scrollposition bei 181 px. Keine neuen Scroll-Skripte.
- Lokale und LAN-Vorschau antworten mit HTTP 200; die LAN-CSS-Datei stimmt
  bytegenau mit dem bearbeiteten Stand überein. Zweiter Generatorlauf:
  0 Änderungen. Syntaxprüfung und `git diff --check` erfolgreich.

Messwerte und Screenshots: `tmp/hero-landscape-20261002/`. Geprüft in der lokalen
In-App-Vorschau; ein physischer Safari-Gerätetest wurde nicht durchgeführt.
Kein Commit oder Push.
