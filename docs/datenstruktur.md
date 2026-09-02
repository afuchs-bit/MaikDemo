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

### Responsive Derivate und die zwei Bild-Manifeste (AP-25 / AP-77)

Ausgeliefert wird nie die Datei aus `bild`, sondern immer ein Derivat unter 200 KB.
Welche Derivate es gibt, steht in **zwei** auto-generierten Manifesten:

| Datei | Erzeuger | Quellen |
|---|---|---|
| `data/images.json` | `.github/scripts/build-images.mjs` | Originale in `assets/img/_src/` (gitignored) |
| `data/images-repo.json` | `.github/scripts/build-hero-images.mjs` | Bilder, die bereits im Repo liegen |

Zwei Dateien, weil `build-images.mjs` sein Manifest **vollständig neu schreibt** – die
Einträge des anderen Skripts würden sonst still verschwinden. `.github/scripts/lib/images.mjs`
liest beide zusammen ein; nur diese Datei kennt die Aufteilung.

Ein Eintrag hat den kanonischen Bildpfad als Schlüssel (also auch die UUID-Dateinamen aus
dem CMS-Import, die **nicht umbenannt werden dürfen**) und beschreibt die Derivate daneben:

```json
"/assets/img/projekte/gartengestaltung-herne/03ff56b1-….webp": {
  "base": "/assets/img/projekte/gartengestaltung-herne/gartengestaltung-herne-hero",
  "widths": [480, 960, 1440],
  "webpWidths": [480, 960],
  "width": 960, "height": 720, "aspect": 0.75
}
```

- `widths` = AVIF-Breiten, `webpWidths` = WebP-Breiten (fehlt, wenn identisch). AVIF komprimiert
  besser und deckt gelegentlich eine Breite mehr ab; ohne das getrennte Feld zeigte das
  WebP-`srcset` auf nicht existierende Dateien.
- Das `<img src>` in `<picture>` ist **immer** `<base>.webp`, nie der Schlüssel selbst.
  Bei `build-images.mjs` ist das derselbe Pfad, bei `build-hero-images.mjs` liegt unter dem
  Schlüssel das große Original.

`build-index.mjs` hängt diese Angaben als `variants` an jedes Bild in
`data/projekte-index.json`, damit `assets/js/projekte-card.js` im Browser dasselbe
`<picture>` bauen kann wie `lib/render.mjs` für die generierten Seiten. Ein Bild ohne
Manifest-Eintrag ist kein Fehler, erzeugt aber eine Build-Warnung – dort liefe die Karte
auf das Original hinaus. Neue Bilder in `.github/scripts/build-hero-images.mjs` unter
`SOURCES` ergänzen und `npm run build-hero-images` laufen lassen.

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

Stellen im Markup (Stand AP-F15 — die Kontakt-Selects B1/B2 und der Privatkunden-Footer A2
sind mit der Zusammenfuehrung entfallen; die Tabelle unten fuehrt sie noch als Spalten):
- **A1** Footer „Leistungen" (`index.html`)
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

**CTA-Vorbefüllung (Stand AP-F15):** Der „Jetzt anfragen"-Button der Galerie verlinkt auf das
Anfrageformular der Startseite und übergibt den **Taxonomie-Slug** direkt:
`../?leistung=<slug>#anfrage`. Das frühere `?bereich=<Option-Text>` ist entfallen — es verglich
Options-Texte statt Slugs und brach bei jeder Umformulierung eines Dropdown-Eintrags. Das
zugehörige Select `name="bereich"` existiert seit der Zusammenführung von Startseite und
Privatkundenseite nicht mehr; die beiden verwaisten Handler in `main.js` sind entfernt.

Gelesen wird der Parameter von `assets/js/privat-form.js`; unbekannte Slugs werden verworfen.
Derselbe Mechanismus trägt `?pfad=<hauptpfad>` aus den Leistungsseiten. Zusätzlich schaltet
`assets/js/anfrage.js` die Vorwahl auf „Mehr Angaben", sobald einer der beiden Parameter
vorhanden ist — wer mit konkretem Kontext kommt, landet direkt im ausführlichen Formular.

Die früher hier geführte Zuordnungstabelle „Leistungs-Slug → Bereich-Option" ist damit
gegenstandslos und wurde entfernt. Der Slug ist jetzt der Wert; eine Übersetzung entfällt.
Damit hat auch `baumarbeiten` ein Ziel — im Text-Mapping hatte es kein Pendant.
