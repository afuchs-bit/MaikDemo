# CMS-Hinweise (Sveltia) – für Entwickler

Dieses Dokument betrifft die **Repo-Seite** des CMS (Admin-Oberfläche + Collection-Schema).
Das externe Setup (Cloudflare-Worker `sveltia-cms-auth`, GitHub OAuth App, Secrets, Collaborator)
ist separat erledigt und liegt **nicht** im Repo.

## Dateien

| Datei | Zweck |
|-------|-------|
| `admin/index.html` | Minimaler Sveltia-Loader (gepinnte Version, `noindex`, mobil). |
| `admin/config.yml` | Backend + Collection-Schema. Bildet `content/projekte/*.json` 1:1 ab. |
| `.github/scripts/check-config-sync.mjs` | Prüft `leistungen`-Optionen gegen `content/taxonomie.json`. |

Aufruf im Browser: `https://afuchs-bit.github.io/MaikDemo/admin/` (bzw. `…/admin/` unter eigener Domain).

## Voraussetzung: richtiger Branch + Pages-Quelle

`admin/config.yml` schreibt CMS-Änderungen nach **`backend.branch: claude/kind-fermat-pyzy5p`**
(der Produktions-Branch). Damit das CMS und die öffentliche Seite zusammenpassen, muss gelten:

1. Schritt 1 **und** Schritt 2 sind nach `claude/kind-fermat-pyzy5p` gemergt (die Feature-Branch
   `claude/sveltia-project-data-structure-1yygu8` ist ein sauberer Fast-Forward darauf).
2. GitHub Pages liefert aus **`claude/kind-fermat-pyzy5p`** aus (Settings → Pages → „Deploy from a
   branch"). Andernfalls erscheinen `/admin/` und CMS-Änderungen nicht live.

Wird der Produktions-Branch umbenannt (z. B. später auf `main`), muss `backend.branch` in
`admin/config.yml` mitgezogen werden.

## Version-Pinning

Sveltia ist bewusst auf eine **feste Version** gepinnt (nicht `@latest`), aktuell **0.171.0**:

```html
<script type="module" src="https://unpkg.com/@sveltia/cms@0.171.0/dist/sveltia-cms.js"></script>
```

**Update:** Versionsnummer in `admin/index.html` ändern, vorher die Release-Notes prüfen
(<https://github.com/sveltia/sveltia-cms/releases>). Nur eine Stelle – kein Build.

## Schema-Bindung an Schritt 1 (wichtig)

Die Feldnamen/-typen in `admin/config.yml` müssen **exakt** zu den echten Projektdateien passen,
sonst schreibt das CMS Pfade/Felder, die der Startseiten-Renderer (`assets/js/projekte.js`) nicht
liest. Bewusste Punkte:

- **Format `json`** (`extension: json`, `format: json`) – Bestandsdateien sind JSON.
- **`bilder`** ist eine Liste aus Objekten `{ bild, alt }` (`widget: list` mit `fields:`), das
  **erste Bild ist das Titelbild** (keine Cover-Extraspalte).
- **Slug:** Schritt 1 hat kein `slug`-Feld (Slug = Dateiname). Neue Einträge leiten den Slug aus
  `titel` + `ort` ab (`slug: "{{fields.titel}}-{{fields.ort}}"` → z. B. `vorgarten-bepflanzung-herne`).
  Das weicht bewusst vom `…-2026`-Suffix der Bestandsdateien ab und betrifft nur **neue** Einträge.
- **Bildpfade:** `media_folder`/`public_folder` = `/assets/img/projekte/{{slug}}`. Der gespeicherte
  `bild`-Wert ist `/assets/img/projekte/<slug>/<datei>` (führender Slash, **ohne** `/MaikDemo/`).
  `assetUrl()` in `assets/js/config.js` rebasiert das zur Laufzeit korrekt – unter `/MaikDemo/`
  **und** unter eigener Domain.
- **WebP/EXIF:** `media_libraries` re-encodet Handy-Fotos beim Upload zu WebP (Qualität 85, max
  2048px). Dabei fällt EXIF (inkl. GPS) weg – wichtig für DSGVO.

## Taxonomie-Sync-Check

Die gültigen Leistungen stehen an zwei Stellen: `content/taxonomie.json` (**Quelle der Wahrheit**)
und die `leistungen`-Optionen in `admin/config.yml`. `check-config-sync.mjs` vergleicht die
`value`s der Optionen mit den Slugs der Taxonomie:

- **Slug-Abweichung** (fehlend / zusätzlich / Tippfehler) → Script `exit 1`, die **GitHub Action
  schlägt fehl**.
- **Label-Abweichung** → nur Warnung (verbindlich sind die Slugs).

Der Check läuft in `.github/workflows/build-index.yml` (Step „Config-Taxonomie-Sync prüfen") vor dem
Index-Build und wird u. a. bei Änderungen an `admin/**` oder `content/**` ausgelöst.

**Warum Check statt Generierung?** `config.yml` enthält viel handgepflegten Inhalt (Labels, Hints,
Widget-Optionen). Ein Generieren des Options-Blocks würde diese überschreiben und wäre fehleranfälliger.
Der Check hält `taxonomie.json` als einzige Quelle und schlägt bei Drift laut fehl, lässt `config.yml`
aber frei editierbar.

Lokal ausführen:

```bash
cd .github/scripts && npm install      # einmalig (installiert yaml, exifr)
cd ../.. && node .github/scripts/check-config-sync.mjs
```

## Lokales Testen des CMS (optional)

Zum Testen ohne GitHub-Login gibt es Sveltias lokales Backend. **Nicht produktiv aktiv lassen.**

1. In `admin/config.yml` die auskommentierte Zeile aktivieren:
   ```yaml
   local_backend: true
   ```
2. Lokalen Proxy starten (schreibt in die echten Dateien im Arbeitsverzeichnis):
   ```bash
   npx @sveltia/cms-server
   ```
3. Seite lokal servieren und `http://localhost:8080/admin/` öffnen:
   ```bash
   python3 -m http.server 8080
   ```
4. **Danach `local_backend: true` wieder auskommentieren** (ist im Repo standardmäßig aus).

## Sicherheit

- **Keine Secrets im Repo.** `GITHUB_CLIENT_SECRET` u. a. liegen ausschließlich als
  Cloudflare-Worker-Secrets.
- `base_url` (die Worker-URL) ist nur eine Endpunkt-Adresse und darf öffentlich im Repo stehen.
