# AP-549 — Navigation im schmalen Desktop-Header verteilen (02.10.2026)

Die Hauptnavigation verteilt ihren freien Raum nun mit `space-evenly` auch vor
„Leistungen A bis Z“ und nach „Kontakt“. Bisher lag dieser Platz durch
`space-between` ausschließlich zwischen den fünf Einträgen, während die
äußeren Links direkt an den schmalen Grid-Abständen zu Logo und Icons endeten.

Die vorhandene mittlere Rasterspalte bleibt erhalten. Beide äußeren Abstände
sind symmetrisch; das Menü bleibt darin zentriert und auf maximal 720 px
begrenzt. Es gibt keine zusätzliche Zwischenstufe, keine festen Verschiebungen
und keine Größenänderung an Logo, Kontakt-Icons oder Schrift. Die Navigation
passt ihre Abstände kontinuierlich an die verfügbare Breite an.

Nur die Desktop-Regel ab 901 px in `header-home.css` wurde geändert. Mobile
Hochkant- und Querformatregeln sowie Header-Morph, Dropdown, Telefon-Popover
und JavaScript bleiben erhalten. CSS-Version `20261002l` ist auf allen 51
veröffentlichten Header-Seiten nachgeführt.

## Prüfung

- 901, 920, 960, 1024, 1100, 1180, 1280, 1440, 1600, 1920 und 2560 px:
  fünf einzeilige Navigationseinträge, positive Zwischenräume und keine
  Überlappung mit Logo oder Kontaktgruppe. Die Linkgruppe ist mittig zwischen
  diesen beiden Gruppen, Rundungsabweichung unter 0,02 px.
- Gemessene Abstände der Linkflächen zu Logo und Kontaktgruppe:
  bei 901 px von 14 auf 30,5 px, bei 1024 px von 15,4 auf 39 px,
  bei 1180 px von 17,7 auf 62,5 px. Beide Seiten jeweils gleich.
- Logo-, Icon- und Schriftgrößen sowie die 50-px-Linkflächen bleiben erhalten.
  Visuelle Abnahme bei 1024×768 px; keine neue Menü-Kachel.
- Mobile Größen 320, 390, 768, 874 Querformat und 900 px betrachtet.
  Der Quelldatei-Vergleich bestätigt keine Änderung bis 900 px;
  Messunterschiede der Startseitenleiste beim schnellen Größenwechsel betreffen
  die Zwischenzustände des bestehenden animierten Header-Morphs.
- Leistungs-Dropdown bei 901 px: vollständig innerhalb des Fensters,
  vertikal scrollbar. Escape schließt und hält den Fokus am Auslöser.
- Telefon-Popover bei 901 px: 272 px breit, beide Nummern einzeilig,
  vollständig innerhalb des Fensters. Escape schließt, `aria-expanded=false`,
  Fokus auf `callBtn`.
- Zweiter Generatorlauf: 0 Änderungen. `git diff --check` erfolgreich.
- Kein Commit oder Push.

Messwerte und Screenshot: `tmp/header-spacing-20261002/`.
