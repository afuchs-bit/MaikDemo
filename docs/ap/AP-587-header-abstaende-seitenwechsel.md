# AP-587 — Stabile Header-Abstände beim Seitenwechsel (07.10.2026)

## Befund

Die kompakte Homepage-Leiste behielt den transparenten 1-px-Rahmen ihrer
Einstiegskarte. Gegenüber Unterseiten stand das Logo dadurch 1 px weiter rechts,
die Aktionsgruppe 1 px weiter links. Die erste Gridzeile wurde außerdem mit
63 statt 65 px ausgeglichen. Bis 340 px galten unterschiedliche Logoformeln.
Beim Einstieg von einer Unterseite über `#faq` lief zusätzlich kurz der Morph
von der großen Startkarte zur kompakten Leiste.

## Änderung

- `header-home.css` definiert die kompakte Geometrie gemeinsam für Unterseiten
  und die kondensierte Homepage: ohne Innenrahmen, identische Gridzeile,
  Innenabstände und responsive Logo-Maße einschließlich der Stufe bis 340 px.
  Die bisher nur auf der mobilen Homepage gesetzte Scrollbarreserve gilt
  gemeinsam, damit kurze Seiten und das Öffnen eines Menüs die Headerbreite
  auch bei klassischen Scrollleisten nicht verändern.
- Doppelte kompakte Maße in `home-dark.css` entfernt. Die Verkleinerung beim
  Drücken einer Aktion gilt dort nur noch für die große Einstiegskarte;
  kompakte Aktionen verhalten sich wie auf Unterseiten.
- Ein kleines Inline-Script unmittelbar nach dem Homepage-Header setzt bei
  mobilen Sprunglink-Einstiegen den kompakten Zustand vor dem Zeichnen.
  `home-header-morph.js` hält ihn bis zum Ankersprung und aktiviert die
  regulären Übergänge erst nach der ersten Layoutmessung. Kein Scrollbefehl,
  kein Zeitgeber und keine gespeicherte Navigationseinstellung.
- Der große Homepage-Einstieg, seine Scrollanimation und die schwebende
  Desktop-Karte bleiben erhalten. Desktop-Zustände werden jeweils miteinander
  verglichen: oben schwebend, nach dem Scrollen kompakt.
- Cache-Schlüssel zentral: Header-/Homepage-CSS `20261007h`, eigener
  `HOME_HEADER_JS_VERSION` für den Morph `20261007b`.

## Prüfung

In der lokalen In-App-Vorschau, Branch `codex/homepage-review`:

- Alle 45 öffentlichen Seiten: identisches Header-Markup nach Normalisierung
  der relativen Pfade, eine gemeinsame CSS-Einbindung, gültige lokale Ziele.
- Alle Seiten bei 402 × 874, 874 × 402, 1024 × 768 und 1440 × 900.
  Der kompakte mobile Homepage-Zustand wird zusätzlich separat geprüft.
- Stichprobe Über uns, Kontakt, Galerie, Baumkontrolle, Impressum und 404:
  320, 340, 390, 430, 768 und 900 px hochkant; 568 × 320, 667 × 375,
  844 × 390, 900 × 420 sowie Desktop 901, 1280, 1920 und 2560 px.
- Kompakte Homepage und neue FAQ-Seiteneinstiege an allen 18 geprüften
  Viewports: Logo und Aktionsflächen stimmen ohne geometrische Abweichung mit
  den Unterseiten überein. Kein horizontaler Überlauf oder überlappender
  Desktop-Menüeintrag.
- Tatsächliche Navigation über Galerie, Über uns, Kontakt, FAQ und
  Baumkontrolle. Die Rückkehr über das Logo stellt die große Startkarte wieder
  her. Öffnen des mobilen Menüs verschiebt die erste Headerzeile nicht.
- Leistungs-Dropdown, Escape, Telefon-Popover und Fokus-Rückgabe geprüft.
  Wechsel mit offenem Menü von 874 auf 901 px schließt es, synchronisiert
  `aria-expanded` und gibt die Scrollsperre frei.
- Generator-Folgelauf ohne Änderung; JavaScript-Syntax und `git diff --check`.
  Bestehende uncommittete Arbeiten erhalten; Seiteninhalt außer dem gezielten
  Homepage-Inline-Script und den Cache-Schlüsseln unverändert.

Kein direkter Test auf dem physischen iPhone/Safari: Der native Computer-Use-
Zugriff ist nicht freigegeben. Messdaten und Vorschauen liegen unter
`tmp/header-spacing-20261007/`. Lokal umgesetzt, kein Commit/Push.
