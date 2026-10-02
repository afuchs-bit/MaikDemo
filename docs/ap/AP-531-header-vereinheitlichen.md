# AP-531 — Header auf allen Bildschirmgrößen vereinheitlichen

Stand 01.10.2026 · Branch `codex/homepage-review` · Basis `c211c1f0`

## Ergebnis

Die kompakte mobile Leiste ist die gemeinsame Gestaltung für alle 51 Seiten mit
Header. Desktop ab 901 px: Logo, fünf frei verteilte Textlinks, WhatsApp und Telefon
in einer Zeile. Auf anschließenden Wunsch des Auftraggebers hat der Desktop-Header
wie die Referenz unter `https://simplydelegate.github.io/Vitja-Website/` eine feste
Höhe von 92 px, auch beim Scrollen. Container höchstens 1600 px, Navigation höchstens
720 px, Logo bis zu 256 × 79 px, Kontaktflächen 60 × 60 px mit 19 px Radius. Nahe
901 px skaliert die Logobreite auf rund 220 px. Die mobile Leiste behält 82 px Höhe,
44 × 44 px große Kontaktflächen und 14 px Radius. Assets und Farben bleiben gemeinsam;
die Desktop-Icons übernehmen die mobilen Proportionen im größeren Maßstab.
Nunito 600 mit 14–16 px großen Navigationslabels. Hover, aktuelle
Rubrik und Tastaturfokus sind sichtbar; die Linkziele bleiben unverändert.

Die mobile Startseiten-Markenkachel samt Scroll-Morph und das alphabetische
Leistungs-Dropdown bleiben erhalten. Bei 320 px beträgt der Kontaktabstand wie
in der schmalen mobilen Grundregel 4 px; darüber 6 px. Die gemeinsame Logoableitung
enthält auf allen Breiten die vollständige Blumengruppe.

## Pflege

- `assets/css/header-home.css` besitzt die gemeinsamen Header-Regeln. Alle Seiten
  laden sie ohne Media-Einschränkung. Die Kopien der Kontakt-Iconregeln in
  `styles.css` und die Container-Overrides der Leistungsseiten sind entfernt.
- `.github/scripts/templates/_header.html` ist die Quelle für den gesamten Header.
  Der Header-Build ersetzt markierte und ältere unmarkierte Header; relative Pfade
  und wurzelabsolute 404-Verweise werden berücksichtigt. Versteckte Verzeichnisse,
  Quellen, Admin und temporäre Dateien werden nicht durchsucht.
- Header-, Haupt-, Startseiten- und Leistungs-CSS tragen Cache-Version `20261001e`;
  Haupt-JavaScript und Scroll-Morph-Skript tragen `20261001b`. Generierte Leistungsseiten übernehmen die gemeinsame
  CSS-Version auch für `leistung-mobile.css`.
- `main.js` führt Dropdown-, Telefon- und Mobilmenüzustände gemeinsam nach.
  Escape schließt die innere Ebene zuerst und führt den Fokus zurück. Desktop-Hover
  aktualisiert den ARIA-Zustand; Escape kann auch unter dem Mauszeiger schließen.
  Ein Klick nach dem Hover bestätigt das geöffnete Dropdown.

## Prüfung

- JavaScript-Syntaxprüfung von Hauptskript, Header-Generator und Render-Bibliothek bestanden.
- Alle 51 Header: ein vollständiger Markerblock, genau ein Untermenü, gemeinsame
  CSS-Einbindung ohne Media-Attribut, WhatsApp vor Telefon im DOM, gültige Assets und
  relative Navigationsziele, korrekte Telefon-Disclosure-Verknüpfung.
- Startseite bei 320, 390, 768, 900, 901, 1024, 1440, 1920 und 2560 px geprüft.
  Desktop nach der Vergrößerung erneut gemessen: 92 px; alle fünf Textlinks bleiben
  einzeilig und besitzen 50 px hohe Berührungsflächen.
- Kontakt, Über uns, Galerie, Leistungsseite Baumfällung, Projektdetail Baumarbeiten,
  Impressum und 404 bei 320, 390 und 901 px: gleicher Header, keine Überschneidung,
  kein horizontaler Überlauf. Aktive Rubriken stimmen mit den Seiten überein.
- Desktop-Dropdown: alle 37 Links vorhanden; 480-px-Panel bleibt scrollbar.
  Öffnen, Scrollen, Escape und Fokus-Rückkehr geprüft.
- Telefon: Öffnen, Tab auf Festnetz-Link, Escape und Fokus-Rückkehr geprüft.
- Mobil: große Startseiten-Markenkachel, kompakter Scrollzustand, 480-px-Menü,
  Leistungs-Untermenü, gestuftes Escape und unveränderte Scrollposition geprüft.
  Wechsel mit offenem Mobilmenü auf Desktop gibt die Scrollsperre frei.
- Reflow zusätzlich bei 720 × 450 CSS-Pixeln geprüft (verfügbarer Bereich eines
  1440 × 900 Fensters bei 200 % Browser-Zoom): Menü passt bis zum unteren Rand und
  bleibt bedienbar. Der In-App-Browser bietet keinen steuerbaren tatsächlichen Zoom;
  der Zoom-Tastaturbefehl verändert dort den Maßstab nicht. Kein Test auf einem
  physischen iOS-/Android-Gerät durchgeführt.
- Zweiter Header-Build: 0 weitere Änderungen. Seiteninhalte außerhalb des Headers
  sind bis auf die erforderlichen Asset-Versionen unverändert.

Lokale Messwerte und Screenshots liegen unter `tmp/header-review-20261001/`.

## Kritische Nachprüfung anhand der Screenshots

- Die erste Funktionsprüfung hat den visuellen Umbruch der Festnetznummer übersehen.
  Das Telefon-Popover ist jetzt 272 px breit. Beschriftung und Nummer stehen mit
  klarer Hierarchie untereinander; beide Nummern bleiben einzeilig. Auf Mobilansichten
  endet es an der rechten Kante der Aktionsgruppe und passt auch bei 320 px ins Fenster.
  Die Links besitzen einen sichtbaren Tastaturfokus.
- Die Desktop-Navigation lag durch unterschiedlich breite Außenbereiche 54,5 px
  rechts der Seitenmitte. Gleich breite Außenbereiche zentrieren die Navigation
  tatsächlich zur Seite. Ihre maximale Breite beträgt nach der Vergrößerung 720 px.
  Bei 901 px bleiben alle fünf Einträge einzeilig und innerhalb der Menüfläche.
- Die mobile erste Headerzeile behält beim Öffnen des Menüs ihre Höhe; der
  kleine 320-px-Logostand lässt die Icons nicht mehr nach oben springen. Beim
  Startseiten-Morph berücksichtigen die Regeln die zwei transparenten Rahmenpixel.
- Desktop-Dropdown und Telefon-Popover begrenzen ihre Höhe nach dem sichtbaren
  Fenster. Das Leistungs-Dropdown wurde zusätzlich bei 901 × 320 px und das
  Mobilmenü bei 320 × 420 px bis zu den letzten Einträgen gescrollt.
- Beim erneuten Öffnen beginnt die Leistungsliste wieder oben. Weiter-Tabben aus
  dem Mobilmenü schließt es und gibt die Scrollsperre frei. Fokus auf ausgeblendeten
  Leistungslinks, Telefonlinks, Menüknopf oder Instagram-Einträgen wird beim
  Größenwechsel auf einen sichtbaren Auslöser zurückgeführt. Safari kann den Fokus
  schon vor dem Media-Query-Ereignis verlieren; dieser Fall wird berücksichtigt.
  Beim Rückscrollen zum großen Startseiten-Einstieg führt Telefonfokus zu WhatsApp.
- Alle 51 Seiten zusätzlich im Browser bei 901 und 320 px geprüft. Headerhöhe,
  Zentrierung, Kontaktmaße und Telefon-Popover stimmen über alle Seitentypen überein.
  Vier vorbestehende Überläufe durch lange Projekt- und Datenschutzüberschriften
  bei 320 px wurden mit deutscher Silbentrennung und einem Umbruch-Fallback behoben.
- Telefon-Popover und Leistungsmenü bei 320, 390, 768, 900, 901, 1024, 1440, 1920
  und 2560 px visuell geprüft; keine abgeschnittenen Headerinhalte oder
  überlappenden Navigationselemente. Startseiten-Einstieg und Scroll-Morph auf
  denselben Breiten geprüft. Die oben genannten Grenzen zu echtem Browser-Zoom
  und physischen Geräten gelten weiterhin.

Die zusätzliche Prüfung ist in den Dateien `recheck-*` im genannten QA-Verzeichnis
dokumentiert. Die Messungen während des Morphs enthalten Zwischenwerte; für die
kompakte Leiste gilt die Messung nach dem Ende des Übergangs.

Das mobile Hauptmenü verwendet für alle fünf direkten Einträge dieselbe grüne
Hover-, Fokus- und Touch-Fläche mit 10 px Radius und dunklem Text wie der
A–Z-Auslöser. Die gemeinsame Regel gilt bis 900 px.

## Größerer Desktop-Header nach der Website-Referenz

- Referenz im Browser bei 1024, 1440, 1920 und 2560 px gemessen: 92 px Headerhöhe.
  Die eigene Mobilgrenze bleibt bei 900 px; ab 901 px gilt der größere Desktop-Header.
- Logo statt 203 × 63 px jetzt bis zu 256 × 79 px; Kontaktflächen statt 44 × 44 px
  jetzt 60 × 60 px. WhatsApp-Glyphe 30 px, Telefonzeichen 38 px. Radius 19 px folgt
  der bisherigen mobilen Form im gleichen Maßstab; Abstand weiterhin 6 px.
- Der Header-Container wächst von höchstens 1360 auf 1600 px. Bei 1440 px sitzt das
  Logo 32 px vom linken Rand, bei 1920 px 160 px statt bisher 280 px. Die Textnavigation
  bleibt zur Fensterbreite zentriert, ohne auf großen Monitoren weiter als 720 px zu wachsen.
- Alle 51 Seiten bei 901 px erneut im Browser geprüft: 92 px Höhe, 60-px-Icons,
  einzeilige Navigation, kein Überlauf oder Überlappen, Zentrierungsabweichung unter 1 px.
  Acht Seitentypen bei 1440 px ebenfalls geprüft; Startseite zusätzlich bei 1024, 1920
  und 2560 px. Mobile Kontaktleiste bei 320, 390, 768 und 900 px: 82 px, Icons 44 px.
- Telefon-Popover mit Tastatur und Escape geprüft. Bei 901 × 220 px bleibt es im
  Fenster und scrollbar. Leistungsmenü bei 901 × 320 px bis zum letzten Link gescrollt.
  Wechsel vom offenen 900-px-Mobilmenü auf Desktop schließt das Menü und löst die Scrollsperre.
- Beim Scrollen bleiben Logo und Header unverändert groß. FAQ-Sprung bei 1440 px:
  Abschnitt beginnt rund 106 px unter der Fensteroberkante, Header endet bei 92 px.
- Header-Build nach der Versionsänderung: 51 aktualisierte Seiten, zweiter Lauf 0
  Änderungen. Syntax- und Diff-Prüfung bestanden. Messwerte und Screenshots:
  `tmp/header-review-20261001/enlarged-*`.


## Mehr seitlicher Abstand im mobilen Querformat

Auf Wunsch anhand des iPhone-Screenshots rücken Logo und Aktionsgruppe im breiten
Querformat je 12 px nach innen: 28 statt 16 px Seitenabstand. Unterhalb dieser
Breiten steigt der Abstand fließend von 16 auf 28 px, damit schmale Fenster weiter
alle Icons aufnehmen. Seitliche `safe-area-inset`-Werte des Geräts bilden die
Mindestabstände. Die Regel gilt bis 900 px und nur im Querformat, für reguläre
Seiten und den kompakten Startseiten-Header. Die große Startseiten-Markenkachel
bleibt zentriert; Hochformat und Desktop behalten ihre Positionen.

Im Browser bei 320 × 200, 390 × 240, 480 × 320, 568 × 320, 667 × 375, 780 × 360,
844 × 390, 874 × 402 und 900 × 420 px geprüft: kein Überlauf oder Überlappen.
Kontakt und Projektdetail haben bei 874 × 402 px links und rechts 28 px Abstand;
die Startseite im kompakten Zustand durch ihren transparenten Rahmen 29 px.
Hochformat bei 390 × 844 und 768 × 1024 px sowie Desktop bei 901 und 1440 px
unverändert. Mobilmenü und Telefon-Popover enden an der neuen rechten Kante
und passen in das 402 px hohe Fenster. Native iPhone-Sicherheitsabstände lassen
sich im verfügbaren Browser nicht emulieren; sie werden über CSS `env()` berücksichtigt.
Messwerte und Screenshots: `tmp/header-review-20261001/landscape-*`.
CSS-Version `20261001e`; zweiter Header-Build ohne weitere Änderungen.
