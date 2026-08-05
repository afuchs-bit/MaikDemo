# Datenstruktur – Projekte (Vorbereitung für Sveltia CMS)

Dieses Dokument beschreibt die Content-Datenschicht, aus der die Projekt-Sektion der
Startseite gerendert wird. Es ist die Grundlage für Schritt 2 (Sveltia CMS), in dem der
Kunde Projekte und Fotos selbst pflegt – **ohne** dass an dieser Struktur etwas umgebaut
werden muss.

## Überblick

```
content/
  taxonomie.json                     ← verbindliche Liste aller Leistungen (Single Source of Truth)
  projekte/
    vorgarten-herne-2026.json        ← ein Eintrag = eine Datei (Sveltia Folder-Collection)
    teichanlage-bochum-2026.json
    aussenanlagen-recklinghausen-2026.json
data/
  projekte-index.json                ← GENERIERT (nicht editieren) – von der GitHub Action gebaut
assets/
  img/projekte/<slug>/01.webp …      ← Projektbilder (Ziel-Ablage, siehe „Bilder")
  js/config.js                       ← Basis-Pfad an genau einer Stelle
  js/projekte.js                     ← Renderer der Startseiten-Sektion #projekte
.github/
  scripts/build-index.mjs            ← Validierung + Index-Build (Node)
  workflows/build-index.yml          ← baut & committet den Index bei Push auf content/**
```

## Ein Projekt = eine Datei

Dateiname = **Slug** (z. B. `vorgarten-herne-2026`). Keine Taxonomie im Dateipfad.
Schema je Datei:

| Feld           | Typ             | Pflicht | Beschreibung |
|----------------|-----------------|:------:|--------------|
| `titel`        | String          |  ja    | Projekttitel (deutsch). |
| `ort`          | String          |  ja    | Ort; wird in der Karte per CSS in **Versalien** angezeigt. |
| `kundentyp`    | Array           |  ja    | `"privat"` und/oder `"gewerbe"`. **Mehrfachzuordnung möglich** (z. B. Baumkontrolle). |
| `leistungen`   | Array           |  ja    | Slugs aus `taxonomie.json`. Ein Projekt hat meist mehrere. |
| `datum`        | String (ISO)    |  ja    | z. B. `"2026-05-01"`. Bestimmt die Sortierung (absteigend). |
| `featured`     | Boolean         |  ja    | Steuert die 3 Karten auf der Startseite (die 3 neuesten mit `featured:true`) **und** den Tab „Highlights" in der Galerie. |
| `beschreibung` | String          |  ja    | Kurzbeschreibung (deutsch). |
| `bilder`       | Array           |  ja    | Objekte `{ "bild": …, "alt": … }`. **Das erste Bild ist automatisch das Cover** – kein separates `cover`-Flag. |

Beispiel:

```json
{
  "titel": "Vorgarten & Bepflanzung",
  "ort": "Herne",
  "kundentyp": ["privat"],
  "leistungen": ["vorgarten", "bepflanzung"],
  "datum": "2026-05-01",
  "featured": true,
  "beschreibung": "Vorgarten-Neugestaltung mit Naturstein, strukturierter Bepflanzung und integrierter Beleuchtung.",
  "bilder": [
    { "bild": "/assets/img/projekte/vorgarten-herne-2026/01.webp", "alt": "Neu gestalteter Vorgarten mit Natursteinweg" }
  ]
}
```

Konventionen: **deutsche** Feldwerte/Labels, **englische** Slugs und Codebezeichner.

### „Highlights" ist keine Kategorie
`featured: true` ist eine **Auszeichnung**, keine Zeitangabe. Die Startseite zeigt die
**3 neuesten Projekte mit `featured: true`** (sortiert nach `datum` absteigend), der Tab
„Highlights" in der Galerie zeigt **alle** markierten Projekte. Es gibt bewusst kein Feld
„aktuell": Aktualität ergibt sich ausschließlich aus `datum`, und die Galerie öffnet
standardmäßig mit allen Projekten in genau dieser Reihenfolge.

### Badge-Regel (Privatkunde / Gewerbekunde)
Aus `kundentyp` abgeleitet: enthält das Array `"gewerbe"` → Badge **„Gewerbekunde"**
(Klasse `project-tag warn`, coral). Sonst → **„Privatkunde"** (grün). Bei gemischter
Zuordnung gewinnt „Gewerbekunde".

## `data/projekte-index.json` ist generiert – NICHT von Hand editieren

Eine statische Seite kann kein Verzeichnis auflisten, und der Browser soll die GitHub-API
nicht abfragen. Deshalb fasst die GitHub Action alle Projektdateien zu **einer** Datei
zusammen, die das Frontend per `fetch` lädt. Die Datei trägt oben einen `_hinweis` und wird
bei jedem relevanten Push neu erzeugt. Änderungen von Hand gehen beim nächsten Build verloren.

### Was die Action tut (`.github/workflows/build-index.yml`)
- Trigger: Push, der `content/**`, `assets/img/projekte/**` oder die Build-Skripte ändert.
  (`data/**` ist als Loop-Guard ausgeschlossen; der Rück-Commit trägt zusätzlich `[skip ci]`.)
- Liest & **validiert** alle Projektdateien gegen `taxonomie.json`.
- Sortiert nach `datum` absteigend und schreibt `data/projekte-index.json`.
- **Seit AP-15:** erzeugt zusätzlich je Projekt eine statische, crawlbare Seite
  `projekte/<slug>/index.html` (Slug = Dateiname) und aktualisiert die statische
  Projektliste in `projekte/index.html` zwischen den `<!-- BUILD:gallery-list -->`-Markern.
  Template und Render-Logik liegen in `.github/scripts/templates/` bzw.
  `.github/scripts/lib/render.mjs`. Verwaiste generierte Ordner (Sentinel-Kommentar im
  Kopf) werden beim Lauf entfernt. **Damit der Rück-Commit diese Seiten mitnimmt, muss der
  Commit-Back-Step einmalig erweitert werden — siehe `docs/workflow-aenderungen.md`.**
- Committet das Ergebnis zurück (nur bei Änderung).
- **Kompatibel mit „Deploy from a branch"**: der zurückcommittete Index wird von GitHub
  Pages einfach mitausgeliefert – der bestehende Deploy-Mechanismus bleibt unverändert.
  (Es wurde bewusst **kein** Actions-basierter Deploy erzwungen.)

### Validierung (die Action schlägt fehl bei …)
- fehlenden Pflichtfeldern oder falschen Typen,
- unbekanntem `kundentyp` (erlaubt: `privat`, `gewerbe`),
- unbekanntem `leistungen`-Slug (nicht in `taxonomie.json`),
- ungültigem `datum`,
- **nicht existierendem lokalen Bildpfad**.

So kann der Kunde die Seite nicht „kaputt speichern". **Warnungen** (kein Abbruch) gibt es bei
Remote-Bild-URLs (noch nicht lokalisiert) und bei **GPS-EXIF in Bildern** (DSGVO, siehe unten).

## Bilder

Ziel-Ablage: `assets/img/projekte/<slug>/01.webp`, `02.webp`, … Das erste Bild ist das Cover.

**EXIF/GPS entfernen (DSGVO):** Fotos von Kundengrundstücken enthalten häufig GPS-Koordinaten.
Diese müssen entfernt werden. Sveltia entfernt EXIF beim Re-Encoding nach WebP später ohnehin;
für einmalig migrierte Bestandsbilder z. B. `exiftool -all=` oder Neu-Encoding. Die Action
enthält einen Check (`exifr.gps`), der bei vorhandenen GPS-Tags **warnt**.

> **Aktueller Stand:** Die drei Projektbilder liegen noch als Remote-PNGs auf einem CDN
> (`d8j0ntlcm91z4.cloudfront.net`, siehe `ASSETS.md`). Deshalb referenzieren die Projekt-JSONs
> vorerst diese CDN-URLs (Startseite bleibt optisch identisch), und der Renderer reicht absolute
> URLs unverändert durch. Sobald die Originale lokal vorliegen, werden sie als
> `assets/img/projekte/<slug>/01.webp` abgelegt und die `bild`-Pfade darauf umgestellt – am
> Code ändert sich nichts.
>
> **Hinweis am Rande:** Die Bestandsfotos unter `assets/img/ueber/ueber-1..3.jpg` (Über-uns-Collage)
> enthalten aktuell GPS-EXIF. Das ist außerhalb dieses Schritts, sollte aber vor go-live bereinigt
> werden.

## Basis-Pfad an genau einer Stelle (`assets/js/config.js`)

Die Seite läuft heute unter `/MaikDemo/` (GitHub-Pages-Projektpfad), später unter einer eigenen
Domain auf `/`. Damit **beides** funktioniert, wird der Basis-Pfad **einmal** aus
`document.baseURI` abgeleitet; alle Fetch- und Bildpfade laufen darüber:

- `assetUrl(p)` – absolute (CDN-)URLs unverändert; im Content gespeicherte `"/assets/…"`-Pfade
  werden auf den Basis-Pfad rebasiert (ein führender `/` würde sonst unter `/MaikDemo/` auf den
  Host-Root zeigen).
- `dataUrl(p)` – löst z. B. `"data/projekte-index.json"` gegen den Basis-Pfad auf.

Kein hartkodiertes `/MaikDemo/` im Code.

## Progressive Enhancement

`#projekte` enthält weiterhin **statisches Markup** der 3 Projekte. `assets/js/projekte.js`
ersetzt es bei erfolgreichem `fetch` durch die datengetriebenen Karten (gleiche Klassen/Tokens,
`<img loading="lazy" decoding="async" width height>` → kein Layout-Shift). Schlägt der `fetch`
fehl, **bleibt das statische Markup sichtbar** (kein `<noscript>`-only).

---

## Taxonomie als Single Source of Truth (`content/taxonomie.json`)

Verbindliche Leistungsliste (Slug englisch, Label deutsch):

| Slug                 | Label |
|----------------------|-------|
| `gartengestaltung`   | Gartengestaltung |
| `vorgarten`          | Vorgartenbau |
| `teichbau`           | Teichanlage |
| `bepflanzung`        | Bepflanzung |
| `dachbegruenung`     | Dachbegrünung |
| `baumarbeiten`       | Baumarbeiten / Fällung |
| `baumkontrolle`      | Baumkontrolle & Gutachten |
| `sturmnotdienst`     | Sturmnotdienst |
| `holzverkauf`        | Holzverkauf |
| `aussenanlagenpflege`| Außenanlagenpflege |

### Dokumentierte Abweichungen im Bestand

Die Seite listet Leistungen an mehreren Stellen – historisch mit **divergierenden Schreibweisen**
und ohne gemeinsame Slugs. `taxonomie.json` ist ab jetzt die verbindliche Referenz. Die Angleichung
der folgenden Stellen an diese Labels/Slugs ist bewusst **noch nicht** erfolgt (eigener Schritt),
hier dokumentiert:

Stellen im Markup:
- **A1** Footer „Leistungen" (`index.html`)
- **A2** Footer „Leistungen für Privatkunden" (`privatkunden/index.html`)
- **B1** Kontakt-Select „Bereich" (`index.html`, `name="bereich"`, ohne `value`)
- **B2** Kontakt-Select „Worum geht es?" (`privatkunden/index.html`, `name="bereich"`)
- **C1** Privatkunden-Chips (`index.html`, `.chips`)
- **C2** Gewerbekunden-Chips (`index.html`, `.chips`)
- (zusätzlich: Leistungskarten-Überschriften `.svc-card h3` und JSON-LD `OfferCatalog` auf der Privatkunden-Seite)

| Taxonomie-Slug        | A1 Home-Footer | A2 Priv-Footer | B1 „Bereich" | B2 „Worum geht es?" | C1 Privat-Chips | C2 Gewerbe-Chips |
|-----------------------|----------------|----------------|--------------|---------------------|-----------------|------------------|
| `gartengestaltung`    | Gartengestaltung | Gartengestaltung | *(in „Garten / Vorgarten")* | Gartengestaltung / Umgestaltung | Gartengestaltung | – |
| `vorgarten`           | Vorgärten | Vorgartenbau | *(in „Garten / Vorgarten")* | Vorgarten | Vorgartenbau | – |
| `teichbau`            | Teichbau | Teichanlagen | Teich / Wasser im Garten | Teich / Wasser im Garten | Teichanlage | – |
| `bepflanzung`         | – | – | Bepflanzung | – | – | – |
| `dachbegruenung`      | Dachbegrünung | Dachbegrünung | Dachbegrünung | Dachbegrünung | Dachbegrünung | – |
| `baumarbeiten`        | – | Baumarbeiten | – | Baumarbeiten / Baumfällung | Baumfällung | – |
| `baumkontrolle`       | Baumkontrolle & Gutachten | – | Baumkontrolle / Gutachten | – | – | Baumkontrolle & Gutachten |
| `sturmnotdienst`      | Sturmnotdienst | – | Sturmschaden / Sturmnotdienst | – | – | – |
| `holzverkauf`         | Holzverkauf | – | Holzverkauf | – | – | – |
| `aussenanlagenpflege` | Pflege von Außenanlagen | – | Gewerbliche Pflege | – | – | Außenanlagenpflege |

**Nur im Bestand, ohne Taxonomie-Slug** (reine Marketing-Chips, bewusst nicht abgebildet):
`Gartenpflege`, `Palmen / winterfest`, `Pool- & Whirlpool-Umfeld` (Privat) sowie
`Grünpflege & Erhaltung`, `Verkehrssicherheit`, `Umbau Außenanlagen`, `Bürokomplexe` (Gewerbe).

**Wichtigste Divergenzen:** gleiche Leistung, verschiedene Schreibweisen
(Teich = „Teichbau"/„Teichanlagen"/„Teichanlage"/„Teich / Wasser im Garten"); Baum-Leistungen
unterschiedlich zusammengefasst; „Garten / Vorgarten" im Home-Select zusammengelegt, sonst
getrennt. Empfehlung für den Folgeschritt: Footer + „Bereich"-Select aus `taxonomie.json`
generieren, Marketing-Chips separat pflegen.

---

## Ein neues Projekt anlegen (manuell, bis Sveltia da ist)

1. Neue Datei `content/projekte/<slug>.json` nach obigem Schema anlegen.
2. Bilder unter `assets/img/projekte/<slug>/` ablegen (WebP, ohne GPS-EXIF).
3. `leistungen` nur mit Slugs aus `taxonomie.json` füllen.
4. Committen/Pushen → die Action validiert, baut `data/projekte-index.json` und committet ihn zurück.
   Bei Fehlern schlägt die Action mit klarer Meldung fehl und der Index bleibt unverändert.

---

## Projektgalerie `/projekte/` – Filter-URL-Parameter

Die öffentliche Galerie (`projekte/index.html`, Logik in `assets/js/galerie.js`) hält ihren
Filterzustand in Query-Parametern (`history.replaceState`, kein Reload). Deep-Links sind teilbar und
stellen den Zustand beim Laden wieder her. Default-Werte werden aus der URL weggelassen.

| Parameter  | Werte | Bedeutung |
|------------|-------|-----------|
| `tab`      | `highlights` | Ansicht „Highlights" (nur Projekte mit `featured: true`). Ohne Parameter = alle Projekte, nach `datum` absteigend. |
| `typ`      | `privat` \| `gewerbe` | Kundentyp-Filter. Ohne Parameter = alle. |
| `leistung` | Komma-Liste von Taxonomie-Slugs, z. B. `baumkontrolle,bepflanzung` | Leistungs-Filter, **ODER-Semantik**: ein Projekt erscheint, wenn es **mindestens eine** der gewählten Leistungen hat. Unbekannte Slugs werden ignoriert. |
| `projekt`  | ein Projekt-Slug, z. B. `teichanlage-bochum-2026` | **Deep-Link:** öffnet beim Laden direkt die Lightbox dieses Projekts. Schaltet immer auf die Alle-Ansicht (Sichtbarkeit im Grid). Unbekannter Slug → ignoriert. Der Param wird beim Laden aus der URL entfernt (`replaceState`), damit ein Reload die Lightbox nicht erneut öffnet. Wird von den Startseiten-Karten (`#projekte`) genutzt. |

**Beispiel-Deeplinks** (z. B. für Direktlinks aus der Sonderthemen-Sektion):
- Alle Baumkontrolle-Projekte: `…/MaikDemo/projekte/?leistung=baumkontrolle`
- Gewerbe-Projekte gesamt: `…/MaikDemo/projekte/?typ=gewerbe`
- Nur die Highlights: `…/MaikDemo/projekte/?tab=highlights`

**Chip-Trefferzahlen** sind facettiert: Kundentyp-Zahlen berücksichtigen den aktiven Leistungsfilter,
Leistungs-Zahlen den aktiven Kundentyp (jeweils innerhalb des gewählten Tabs). Chips mit 0 Treffern
werden **deaktiviert** (nicht versteckt); ein bereits aktiver Chip bleibt abwählbar.

**CTA-Vorbefüllung:** Der „Jetzt anfragen"-Button verlinkt kontextabhängig auf das Kontaktformular der
Startseite mit `?bereich=<Option-Text>#kontakt`. `main.js` liest `?bereich=` beim Laden und setzt das
Dropdown (der Wert muss exakt einem `<option>`-Text entsprechen). Zuordnung Leistungs-Slug → Bereich
(nur bei genau einer aktiven Leistung, sonst typ-basierter Default, sonst ohne Vorwahl):

| Leistungs-Slug | Bereich-Option |
|----------------|----------------|
| `gartengestaltung`, `vorgarten` | Garten / Vorgarten |
| `teichbau` | Teich / Wasser im Garten |
| `bepflanzung` | Bepflanzung |
| `dachbegruenung` | Dachbegrünung |
| `baumkontrolle` | Baumkontrolle / Gutachten |
| `sturmnotdienst` | Sturmschaden / Sturmnotdienst |
| `holzverkauf` | Holzverkauf |
| `aussenanlagenpflege` | Gewerbliche Pflege |
| `baumarbeiten` | *(kein exaktes Pendant → keine Vorwahl)* |
