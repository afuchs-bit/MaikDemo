# AP-601 — Go-live: SEO-Abschluss und automatische Prüfung

Stand 09.10.2026 · Basis `1db06c5f` (`claude/kind-fermat-pyzy5p`)
Go-live-Block AP-600 bis AP-605 · Hosting **Hetzner** (Entscheidung des Auftraggebers vom 08.10.2026)

## Auftrag

Das SEO-Grundgerüst steht weitgehend: Canonicals, Open Graph, JSON-LD und Sitemap-Build gibt es schon.
Dieser AP schließt die verbliebenen Lücken und baut eine Prüfung, die vor jedem Deploy belegt, dass
alles stimmt.

Meta-Titles und -Descriptions bleiben **außerhalb des CMS** (Entscheidung vom 08.10.2026).
Projekttitel und -beschreibung kommen aus dem CMS. Das Meta daraus erzeugt der Renderer.

## Befund (Messung über alle 56 HTML-Dateien, 50 Sitemap-URLs)

| Prüfung | Ergebnis |
|---|---|
| Canonical | 51 Seiten, alle `https://rohdich.de/…` (ohne www). Damit ist die Hauptadresse im Code bereits **rohdich.de** |
| `og:url`, JSON-LD `@id`/`url` | durchgehend `https://rohdich.de` |
| Open Graph | alle 50 Sitemap-Seiten mit title, description, url, image; `og:locale` nur auf `/ueber-uns/` |
| Genau eine `<h1>` | alle indexierbaren Seiten ✔ (`gewerbekunden/index.html` ist eine Weiterleitungsseite, 0 × h1) |
| JSON-LD | alle Blöcke gültiges JSON; `LandscapingBusiness` vorhanden; **kein** `aggregateRating`/`Review` ✔; `logo` fehlt |
| `lang="de"` | ✔ |
| `sitemap.xml` | 50 URLs, erzeugt von `build-index.mjs` (AP-09); `gewerbekunden/` und `404` korrekt nicht enthalten |
| `robots-live.txt` | vorhanden (AP-08/AP-398), Sitemap-Zeile auf `https://rohdich.de/sitemap.xml` |
| `noindex,nofollow` | auf allen 56 Seiten (Demo-Sperre AP-01). Wird **nicht** in diesem AP entfernt, sondern beim Deploy (AP-604) |

**Titel über 60 Zeichen** (Google kürzt nach Pixelbreite, ca. 580 px):

| Seite | Länge | Quelle |
|---|---|---|
| `/` | 71 | `index.html` Z. 14 |
| `/projekte/moderne-vorgartengestaltung-…-bochum-1/` | 121 | Renderer, `render.mjs` Z. 426 |
| `/projekte/vorgartengestaltung-mit-gepflasterter-einfahrt-herne/` | 97 | Renderer |
| `/projekte/poolbau-mit-individueller-gartengestaltung-herne/` | 93 | Renderer |
| `/projekte/gartengestaltung-herne/`, `…-herne-1/` | 67 | Renderer |
| `/projekte/baumarbeiten-herne/` | 63 | Renderer |
| `/projekte/` | 67 | `projekte/index.html` |
| `/datenschutz/` | 62 | `content/rechtstexte/datenschutz.json` |

Ursache bei den Projekten: Das feste Suffix ` — Maik Rohdich Garten- und Landschaftsbau` hat 43 Zeichen.

**Descriptions außerhalb 70–160 Zeichen:**

| Seite | Länge | Quelle |
|---|---|---|
| `/` | 190 | `index.html` |
| `/ueber-uns/` | 162 | `ueber-uns/index.html` |
| `/projekte/baumarbeiten-herne/` | 76 | CMS-Feld `beschreibung`, `render.mjs` Z. 428 |

**Doppelter Titel:** `/projekte/gartengestaltung-herne/` und `/projekte/gartengestaltung-herne-1/` haben
beide die H1 „Gartengestaltung in Herne“ und damit denselben Titel → Entscheidung E1.

## Umsetzung

### 1. Prüfskript `scripts/golive-check.mjs` anlegen

Ein Node-Skript ohne neue Abhängigkeit (Regex und `JSON.parse` reichen; jsdom ist als devDependency
vorhanden, falls nötig). Aufruf über `package.json`:

```json
"check:golive": "node scripts/golive-check.mjs"
```

Parameter:
- `--root <pfad>` – zu prüfender Stand, Standard Repo-Wurzel. AP-604 ruft es mit `--root _site` auf.
- `--ziel demo|staging|live` – Standard `demo`. `staging` prüft wie `demo`, `live` nach den Live-Regeln unten.
- `--nur-bericht` – Fehler werden ausgegeben, der Exit-Code bleibt 0. Für Deploys auf die Testumgebung (AP-604).

Aufbau in Abschnitten, damit AP-602 und AP-605 eigene Abschnitte ergänzen können
(`pruefeSeo()`, später `pruefeLinks()`, `pruefeAlt()`, `pruefeFremdquellen()`). Ausgabe: je Abschnitt
eine Tabelle mit Fehler/Warnung/Datei. Exit-Code 1, sobald ein Fehler vorliegt.

**SEO-Regeln** für jede URL aus `sitemap.xml` (URL → Datei: `https://rohdich.de/x/` → `x/index.html`):

| Regel | Fehler | Warnung |
|---|---|---|
| genau ein `<title>` | fehlt/mehrfach | – |
| Titellänge | > 65 | 61–65 |
| Meta-Description | fehlt, < 70 oder > 160 | – |
| genau eine `<h1>` | ≠ 1 | – |
| `rel="canonical"` | fehlt oder ≠ Sitemap-URL | – |
| `og:title`, `og:description`, `og:url`, `og:image` | fehlt; `og:url` ≠ Canonical | – |
| `og:image` | Datei existiert nicht unter `--root` | – |
| `<html lang="de">` | fehlt | – |
| JSON-LD | nicht parsebar; Typ `AggregateRating` oder `Review` vorhanden | – |
| Titel/Description seitenübergreifend | doppelt | – |

Zusätzlich:
- Jede `index.html` unter `--root`, die **nicht** in der Sitemap steht, muss `noindex` tragen, eine
  Weiterleitungsseite sein oder `404.html`/`admin/index.html` sein. Sonst Fehler „verwaiste Seite“.
- `--ziel demo` und `staging`: Jede Sitemap-Seite trägt `noindex` (Demo-Sperre muss stehen).
- `--ziel live`: **Keine** Sitemap-Seite trägt `noindex`; `admin/index.html` und `404.html` tragen es
  weiterhin. `robots.txt` enthält `Sitemap: https://rohdich.de/sitemap.xml` und keine Zeile
  `Disallow: /` ohne Pfad.

### 2. Projekttitel im Renderer kürzen (`render.mjs` Z. 426–427)

Vorher:
```js
title: esc(`${h1} — Maik Rohdich Garten- und Landschaftsbau`),
ogTitle: escAttr(`${h1} — Maik Rohdich Garten- und Landschaftsbau`),
```

Nachher (Hilfsfunktion neben `truncate()`, Z. 202):
```js
// AP-601: Projekttitel ≤ 60 Zeichen. Suffix nur, wenn er passt.
export function projektTitel(h1) {
  const marke = ' | Maik Rohdich';
  const basis = String(h1 || '').trim().replace(/\s+/g, ' ');
  if ((basis + marke).length <= 60) return basis + marke;
  return basis.length <= 60 ? basis : truncate(basis, 60);
}
```
```js
title: esc(projektTitel(h1)),
ogTitle: escAttr(projektTitel(h1)),
```

### 3. Zu kurze Projekt-Description ergänzen (`render.mjs` Z. 428)

Vorher: `description: escAttr(truncate(project.beschreibung, 155)),`

Nachher:
```js
// AP-601: Unter 100 Zeichen einen festen, faktenfreien Zusatz anhängen.
description: escAttr(projektBeschreibung(project.beschreibung)),
```
```js
export function projektBeschreibung(text) {
  const basis = String(text || '').trim().replace(/\s+/g, ' ').replace(/[.\s]*$/, '');
  const zusatz = '. Ausgeführt von Maik Rohdich Garten- und Landschaftsbau.';
  return basis.length < 100 ? truncate(basis + zusatz, 155) : truncate(basis, 155);
}
```
Danach die Projektseiten **über das Build-Skript** neu erzeugen (`cd .github/scripts && npm ci &&
node build-index.mjs`). Generierte HTML nie direkt bearbeiten.

### 4. Hand-geschriebene Titel und Descriptions

Vorschläge, beide nur aus Fakten, die heute schon auf der Seite stehen. Sascha gibt sie frei,
bevor Claude Code committet (**E2**).

| Datei | Feld | Neu | Länge |
|---|---|---|---|
| `index.html` | `<title>` | Garten- und Landschaftsbau in Herne & Bochum \| Maik Rohdich | 59 |
| `index.html` | description | Garten- und Landschaftsbau in Herne, Bochum, Recklinghausen und Umgebung: Gartengestaltung, Vorgarten, Teichbau, Baumkontrolle und Pflege – seit 2001. | 150 |
| `ueber-uns/index.html` | description | Meisterbetrieb für Garten- und Landschaftsbau in Herne seit 2001: Gartenbaumeister, zertifizierter Baumkontrolleur der Landwirtschaftskammer. | 141 |
| `content/rechtstexte/datenschutz.json` | `title` | Datenschutzerklärung \| Maik Rohdich | 35 |
| `projekte/index.html` | `<title>` | Gartenbilder & Projekte \| Maik Rohdich | 38 |

- `og:title` der Startseite bleibt „Maik Rohdich Garten- und Landschaftsbau“.
- Datenschutz danach mit `node .github/scripts/build-rechtstexte.mjs` neu bauen.
- `projekte/index.html` ist hand-geschrieben. `build-index.mjs` ersetzt dort nur den Bereich zwischen
  den `BUILD:gallery-list`-Markern (Z. 177–233). Der `<title>` (Z. 15) darf direkt geändert werden.
- „seit 2001“ bleibt unverändert. Das Gründungsjahr (2001 oder 2003) ist bei Maik angefragt. Wird es
  2003, ändert ein eigener AP alle Fundstellen.

### 5. Logo im JSON-LD (nur bei E3 = ja)

Im `LandscapingBusiness`-Block der Startseite `"logo": "https://rohdich.de/assets/img/logo/maik-rohdich-logo.png"`
ergänzen. Die Datei existiert (527 × 150 px). Den Hinweis aus Teil H.2 zu AP-06/AP-21, das Logo fehle,
in `docs/umsetzungsplan.md` mit einem Satz als erledigt markieren.

### 6. Go-live-Checkliste anpassen

In `docs/go-live-checkliste.md`, Abschnitt 3, die Zeile „Jede Seite hat genau ein `<h1>`, ein
Canonical, eine Meta-Description“ ersetzen durch:
„`npm run check:golive -- --root _site --ziel live` läuft ohne Fehler (AP-601)“.

## Stoppregeln

- Keine Entfernung von `noindex` aus Quellen oder Templates (das macht der Deploy, AP-604).
- Kein Eingriff in `robots.txt`, `robots-live.txt`, `sitemap.xml`-Logik oder Canonicals.
- Keine Textänderungen außer den Feldern aus Schritt 4. Keine Projekttitel im CMS ändern (E1).
- Keine Meta-Felder ins CMS aufnehmen.
- Keine neue npm-Abhängigkeit.
- Generierte Seiten nur über die Build-Skripte.
- Kein CSS geändert → kein Cache-Busting nötig.

## Prüfung

- [ ] `npm run check:golive` läuft. Erwartet: Fehler nur noch für den doppelten Titel (E1), solange E1 offen ist
- [ ] Alle 7 Projekttitel ≤ 60 Zeichen (Ausgabe des Prüfskripts)
- [ ] `/projekte/baumarbeiten-herne/` Description ≥ 100 Zeichen
- [ ] `git diff --stat` zeigt nur `render.mjs`, die neu gebauten Projektseiten, `index.html`,
      `ueber-uns/index.html`, `projekte/index.html`, `content/rechtstexte/datenschutz.json`,
      `datenschutz/index.html`, `scripts/golive-check.mjs`, `package.json`, `docs/go-live-checkliste.md`
- [ ] Rich Results Test (search.google.com/test/rich-results) für `/`, eine Leistungsseite, eine Projektseite: keine Fehler
- [ ] `npm test` weiterhin grün

Commit: `AP-601: SEO-Abschluss und Go-live-Prüfskript`

## Offene Entscheidungen

- **E1 – Doppelter Projekttitel „Gartengestaltung in Herne“:** Einen der beiden Projekttitel im CMS
  unterscheidbar machen (z. B. nach Gartenart). Inhalt kommt von Sascha oder Maik.
- **E2 – Freigabe der Texte aus Schritt 4** (Titel ohne „Recklinghausen“, das in der Description bleibt).
- **E3 – Logo im JSON-LD:** Empfehlung ja (hilft bei der Darstellung in der Google-Suche).
- **E4 – `og:locale="de_DE"` auf allen Seiten:** optional, kleiner Nutzen. Standard: weglassen.
