# AP-606 — Strukturierte Daten: gültiger Geschäftstyp statt „LandscapingBusiness“

Stand 15.10.2026 · Folge-AP zu AP-601 (Befund beim Gegencheck im Schema Markup Validator)

## Anlass

Der Betriebsknoten `#business` der Startseite, Kontaktseite und Über-uns-Seite hatte den Typ
`LandscapingBusiness`. Diesen Typ gibt es auf schema.org nicht. Der Schema Markup Validator meldete
„Der Typ LandscapingBusiness entspricht nicht dem erkannten Schema“ und dazu 8 Folgefehler, weil
`publisher`, `worksFor` und `provider` auf einen ungültigen Knoten zeigten. Suchmaschinen verwerfen
einen solchen Knoten. Adresse, Öffnungszeiten, Telefon und Logo kamen damit nicht an.

## Entscheidung

`HomeAndConstructionBusiness`. Einen eigenen Typ für Garten- und Landschaftsbau gibt es bei
schema.org nicht. `HomeAndConstructionBusiness` ist der genaueste gültige Untertyp von
`LocalBusiness` für Betriebe, die an Haus und Grundstück arbeiten. Das Fachgebiet steht weiterhin in
`knowsAbout`. Eine `additionalType`-URL wurde bewusst nicht gesetzt, damit kein ungeprüfter externer
Bezeichner hineinkommt.

## Umsetzung

- `index.html`, `kontakt/index.html`, `ueber-uns/index.html`: `"@type": "HomeAndConstructionBusiness"`.
  Dazu wurde der Kommentar in `index.html` (AP-21) angepasst.
- `docs/umsetzungsplan.md`: Beispielblock (Teil zu AP-21) auf den gültigen Typ umgestellt.
- `scripts/golive-check.mjs`: neue SEO-Regel „JSON-LD-Typ“. Jeder `@type` muss in einer Liste
  stehen, die einzeln auf schema.org geprüft wurde (`SCHEMA_TYPEN`). Neue Typen erst prüfen, dann
  eintragen.
- Nicht angefasst: `gewerbekunden/index.saved.html` (abgelegter Seitenstand, wird nicht ausgeliefert).
  Wird die Gewerbeseite reaktiviert, dort ebenfalls umstellen. Die Prüfung meldet es dann.

## Prüfung

- `node scripts/golive-check.mjs --root <Stand vor AP-606>` meldet 3 Fehler „JSON-LD-Typ“
  (Gegenprobe). Der neue Stand meldet keinen.
- Schema Markup Validator, Betriebs- und Service-Block der Startseite: vorher 8 Fehler, nachher
  **0 Fehler, 0 Warnungen**. Der Knoten wird als `HomeAndConstructionBusiness` mit Logo, Adresse,
  Öffnungszeiten und `knowsAbout` erkannt.
- Kein CSS geändert, kein Cache-Busting nötig.
