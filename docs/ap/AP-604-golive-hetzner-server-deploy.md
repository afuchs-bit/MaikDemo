# AP-604 — Go-live: Server-Konfiguration und Deploy auf Hetzner

Stand 09.10.2026 · Basis `1db06c5f` (`claude/kind-fermat-pyzy5p`)
Go-live-Block AP-600 bis AP-605 · Hosting **Hetzner** (Entscheidung des Auftraggebers vom 08.10.2026)
Setzt AP-601 (Prüfskript) und AP-603 (PHP-Empfänger) voraus.

> **Vorrang:** Dieser AP löst Teil C des Umsetzungsplans (Cloudflare Pages) und den Vercel-Stand aus
> AP-398 ab. Er schreibt die Dokumente in Schritt 6 entsprechend nach.

## Auftrag

Alles vorbereiten, damit die Seite morgen zuerst auf eine passwortgeschützte Testumgebung bei Hetzner
und später unter `rohdich.de` ausgeliefert werden kann – ohne dass jemand von Hand Dateien hochlädt:

1. ein Skript, das aus dem Repo genau die auszuliefernden Dateien zusammenstellt,
2. `.htaccess` für Test und Live (Weiterleitungen, 404, Header, Caching),
3. einen GitHub-Workflow, der nach jedem Build per SSH/rsync hochlädt,
4. die Weiterleitungen der alten Seite,
5. die Dokumente auf Hetzner umstellen.

Zugangsdaten gibt es erst morgen. Der AP arbeitet deshalb mit Platzhaltern und GitHub Secrets.

## Befund

### Bestehende Plattformdateien (alle für andere Anbieter)

| Datei | Stand | Verwertbar |
|---|---|---|
| `vercel.json` | Header inkl. CSP (AP-398), Funktionsregion | Header → `.htaccess` |
| `.vercelignore` | Ausschlussliste (AP-398) | Grundlage der Allowlist |
| `_headers` | Cloudflare (AP-27), laut eigenem Kommentar nicht mehr wirksam | nein |
| `robots-live.txt` | Live-Fassung mit KI-Crawlern, sperrt `/admin/` und `/api/` | ja |
| `robots.txt` | Demo: `Disallow: /` | ja (Testumgebung) |

### Die CSP aus `vercel.json` würde die Seite heute beschädigen

`script-src 'self'` blockiert:
- zwei Inline-Skripte: `index.html` Z. 11 (`home-header-morph`) und `ueber-uns/index.html` Z. 10 (`js`);
- `https://elfsightcdn.com/platform.js` (`index.html` Z. 1569, Google-Bewertungen über Elfsight).

Hashes der Inline-Skripte (am 09.10.2026 berechnet, vor dem Eintragen neu berechnen):
- `index.html`: `sha256-UDlLSTW+/iC1W5drAU4pXGgcL6UUQiEN6sFz/FkB8kk=`
- `ueber-uns/index.html`: `sha256-/x7W7R75k8Roq0WaVRQX9blP4OufE5xbAdzklGxsgpw=`

Keine Inline-Event-Handler auf irgendeiner Seite ✔.

### Elfsight lädt ohne Einwilligung

Das Bewertungs-Widget lädt bei jedem Aufruf der Startseite Code von Elfsight und Bilder von Google.
Damit gehen IP-Adressen an Dritte, bevor der Besucher etwas tut. Das widerspricht AP-20 („ohne
Consent-Banner, ohne Drittanbieter-Widget“) und braucht eine Entscheidung (**E1**).

### Workflows

- `build-index.yml` committet sein Ergebnis mit `[skip ci]`. Für diesen Commit startet **kein**
  push-ausgelöster Workflow. Ein Deploy-Workflow muss deshalb zusätzlich auf
  `workflow_run` von „Projekt-Index bauen“ hören.
- `workflow_run` checkt standardmäßig den Default-Branch aus. Der Deploy muss ausdrücklich die Spitze
  von `claude/kind-fermat-pyzy5p` auschecken. Die `head_sha` des Build-Laufs enthält den Rück-Commit
  noch nicht.
- Claude Code kann `.github/workflows/**` nicht pushen. Der Workflow kommt nach
  `docs/workflow-aenderungen.md` und wird von Sascha im GitHub-Web-UI angelegt.

### Was ausgeliefert werden muss

Zur Laufzeit per `fetch` geladen: `data/projekte-index.json`, `data/galerie-teaser.json`,
`content/taxonomie.json`. **Nicht** geladen: `data/images.json`, `data/images-repo.json`,
`data/kundenstimmen-entwurf.json`. Ein verwaister Bildordner mit Gedankenstrich im Namen
(`assets/img/projekte/beetanlage-mit-natursteineinfassung-–-vorher-nachher-herne/`) wird von keinem
Projekt referenziert.

### Alte Seite unter `rohdich.de`

Statisches HTML mit `.html`-Dateien. In der Navigation am 09.10.2026 gefunden (20 Adressen):
`index`, `unternehmen`, `galerie`, `fachgebiete_gartenbau`, `fachgebiete_vorgarten`,
`fachgebiete_pflasterarbeiten`, `fachgebiete_gruenpflege`, `fachgebiete_rollrasen`,
`fachgebiete_baumpflege`, `fachgebiete_teichbau`, `fachgebiete_dachbegruenung`,
`fachgebiete_natursteine`, `fachgebiete_erdarbeiten`, `kaminholz`, `baumkontrolle`, `anfahrt`,
`formular`, `impressum`, `dsgvo`, `steuerrecht` (Steuerartikel zu Gartenarbeiten).
Den Rest liefert der Search-Console-Export, den Sascha heute zieht.

### Sonstiges

- 56 HTML-Dateien tragen `noindex` (Demo-Sperre AP-01). Erwartet nach dem Live-Deploy: nur noch
  `admin/index.html`, `404.html` und `gewerbekunden/index.html`.
- 680 HTML-Kommentare mit internen Arbeitsnotizen in den ausgelieferten Seiten (**E4**).
- `/privatkunden/` hat seit AP-F8 keine Seite mehr (Inhalt in der Startseite, Teil H.5) → heute 404.
- `/gewerbekunden/` ist eine Meta-Refresh-Seite (siehe AP-602, E1 dort).

## Umsetzung

### 1. `.github/scripts/prepare-deploy.mjs`

Aufruf: `node .github/scripts/prepare-deploy.mjs --ziel staging|live --out _site`. Löscht `_site`,
kopiert nach **Allowlist** (was nicht genannt ist, geht nicht raus):

| Muster | Bemerkung |
|---|---|
| `**/*.html` | ohne `*.saved.html`, ohne `docs/`, `.github/`, `tests/`, `scripts/`, `content/`, `server/`, `node_modules/` |
| `assets/**` | ohne `**/*.md`, ohne `assets/img/_src/**` |
| `data/projekte-index.json`, `data/galerie-teaser.json` | nur diese zwei |
| `content/taxonomie.json` | Laufzeit (Galerie) |
| `admin/index.html`, `admin/config.yml` | CMS |
| `api/anfrage.php`, `api/.htaccess`, `api/lib/.htaccess`, `api/lib/PHPMailer/src/{PHPMailer,SMTP,Exception}.php`, `api/lib/PHPMailer/LICENSE` | Empfänger (AP-603) |
| `sitemap.xml`, `404.html` | |
| `robots.txt` | live: Inhalt von `robots-live.txt`; staging: `robots.txt` |
| `.htaccess` | live: `server/htaccess-live`; staging: `server/htaccess-staging` |
| `admin/.htaccess` | aus `server/htaccess-admin` (beide Ziele) |

Umformungen nur bei `--ziel live`:
- In jeder HTML-Datei außer `admin/index.html`, `404.html`, `gewerbekunden/index.html` genau die Zeilen
  `<meta name="robots" content="noindex,nofollow" />` bzw. ohne ` /` entfernen, dazu den direkt
  davorstehenden Kommentar `<!-- AP-01: Demo-Sperre … -->`. Zählen und ausgeben. Erwartet: so viele wie
  Sitemap-URLs (heute 50).
- Bei **E4 = ja** zusätzlich HTML-Kommentare entfernen (siehe E4).

Ausgabe am Ende: Dateianzahl und Größe je Oberordner, Liste der **nicht** ausgelieferten Oberordner.
Abbruch mit Exit 1, wenn eine Sitemap-URL in `_site` keine Datei hat.

`_site/` in `.gitignore` eintragen.

### 2. `.htaccess`-Vorlagen in `server/`

`server/htaccess-live`:
```apache
# AP-604 – Live-Konfiguration rohdich.de (Apache 2.4, Hetzner-Webhosting)
Options -Indexes
DirectoryIndex index.html
ErrorDocument 404 /404.html
AddDefaultCharset utf-8
AddType image/avif .avif
AddType image/webp .webp
AddType font/woff2 .woff2
AddType video/mp4 .mp4

RewriteEngine On

# 1. Eine einzige Weiterleitung auf https://rohdich.de (kein Doppel-Sprung)
RewriteCond %{HTTPS} !=on [OR]
RewriteCond %{HTTP_HOST} !^rohdich\.de$ [NC]
RewriteCond %{HTTP_HOST} ^(www\.)?rohdich\.de$ [NC]
RewriteRule ^ https://rohdich.de%{REQUEST_URI} [R=301,L]

# 2. Versteckte Dateien nie ausliefern (Ausnahme: Zertifikatspruefung)
RewriteRule (^|/)\.(?!well-known/) - [R=404,L]

# 3. /index.html -> / (nur echte Anfragen, nicht der interne DirectoryIndex-Aufruf)
RewriteCond %{THE_REQUEST} \s/(.+/)?index\.html[\s?]
RewriteRule ^(.+/)?index\.html$ /$1 [R=301,L]

# 4. Alte Seite (Quelle: docs/redirect-map.md) – hier eintragen
# RewriteRule ^unternehmen\.html$ /ueber-uns/ [R=301,L]

# 5. Struktur der neuen Seite
RewriteRule ^privatkunden/?$ / [R=301,L]
# Nur bei AP-602 E1 = "bleibt deaktiviert" (302 = voruebergehend):
# RewriteRule ^gewerbekunden/?$ / [R=302,L]

<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
  Header always set X-Frame-Options "SAMEORIGIN"
  # HSTS zuerst kurz; Steigerung nach Plan in docs/go-live-checkliste.md
  Header always set Strict-Transport-Security "max-age=300"
  Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'sha256-UDlLSTW+/iC1W5drAU4pXGgcL6UUQiEN6sFz/FkB8kk=' 'sha256-/x7W7R75k8Roq0WaVRQX9blP4OufE5xbAdzklGxsgpw='; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-src https://www.google.com; form-action 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'"

  # Caching: versionierte Assets lange, alles Veraenderliche kurz
  <If "%{REQUEST_URI} =~ m#^/assets/#">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </If>
  <Else>
    Header set Cache-Control "no-cache"
  </Else>
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript application/json image/svg+xml application/xml text/xml text/plain
</IfModule>
```

- CSP: die Hashes beim Erstellen **neu berechnen** (`sha256` über den exakten Skriptinhalt, Base64).
  Kommen bei E1 Elfsight-Domains hinzu, nur die Domains eintragen, die der Netzwerk-Tab auf der
  Testumgebung tatsächlich zeigt.
- `api/.htaccess` (AP-603) hat eine eigene `RewriteEngine`, deshalb greifen die Regeln 1–3 unter
  `/api/` nicht. Das ist gewollt; HSTS deckt `http` dort ab.
- Bilder mit `max-age=1 Jahr`: Wer ein Bild unter **gleichem Namen** ersetzt, muss wie bei CSS
  `?v=` hochzählen oder den Namen ändern. In `CLAUDE.md` unter „Fallstricke“ ergänzen.

`server/htaccess-staging`: identisch, außer
- Regel 1 ersetzt durch reine `https`-Weiterleitung auf denselben Host;
- **kein** HSTS;
- zusätzlich ganz oben:
  ```apache
  AuthType Basic
  AuthName "Testumgebung"
  AuthUserFile /PFAD/AUSSERHALB/DER/DOKUMENTWURZEL/.htpasswd   # morgen eintragen
  Require valid-user
  ```
  und `Header always set X-Robots-Tag "noindex, nofollow"`.

`server/htaccess-admin` (wird zu `admin/.htaccess`):
```apache
# Sveltia CMS laedt von unpkg.com und spricht mit GitHub und dem OAuth-Worker.
Header always unset Content-Security-Policy
Header always set X-Robots-Tag "noindex, nofollow"
```

### 3. Deploy-Workflow (für `docs/workflow-aenderungen.md`)

Neuer Abschnitt „AP-604 — Deploy auf Hetzner“ mit dieser Datei `.github/workflows/deploy-hetzner.yml`:

```yaml
name: Deploy Hetzner

on:
  push:
    branches: [claude/kind-fermat-pyzy5p]
  workflow_run:
    workflows: ["Projekt-Index bauen"]
    types: [completed]
    branches: [claude/kind-fermat-pyzy5p]
  workflow_dispatch:
    inputs:
      probelauf:
        description: 'Nur anzeigen, was sich aendern wuerde (rsync --dry-run)'
        type: boolean
        default: true

permissions:
  contents: read

concurrency:
  group: deploy-hetzner
  cancel-in-progress: false

jobs:
  deploy:
    if: github.event_name != 'workflow_run' || github.event.workflow_run.conclusion == 'success'
    runs-on: ubuntu-latest
    env:
      ZIEL: ${{ vars.DEPLOY_ZIEL || 'staging' }}
    steps:
      - uses: actions/checkout@v4
        with:
          ref: claude/kind-fermat-pyzy5p   # Spitze inkl. Rueck-Commit des Index-Builds

      - uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Abhaengigkeiten
        run: npm ci

      - name: Auslieferung zusammenstellen
        run: node .github/scripts/prepare-deploy.mjs --ziel "$ZIEL" --out _site

      - name: Go-live-Pruefung (live blockierend, staging nur Bericht)
        run: node scripts/golive-check.mjs --root _site --ziel "$ZIEL" $([ "$ZIEL" = live ] || echo --nur-bericht)

      - name: SSH vorbereiten
        run: |
          install -m 700 -d ~/.ssh
          printf '%s\n' "${{ secrets.HETZNER_SSH_KEY }}" > ~/.ssh/id_ed25519
          chmod 600 ~/.ssh/id_ed25519
          printf '%s\n' "${{ secrets.HETZNER_KNOWN_HOSTS }}" > ~/.ssh/known_hosts

      - name: Hochladen
        env:
          PFAD: ${{ env.ZIEL == 'live' && secrets.HETZNER_PFAD_LIVE || secrets.HETZNER_PFAD_STAGING }}
          PROBE: ${{ github.event_name == 'workflow_dispatch' && inputs.probelauf && '--dry-run --itemize-changes' || '' }}
        run: |
          rsync -rlzc --delete $PROBE \
            --chmod=D755,F644 \
            --filter='P .htpasswd' --filter='P .well-known/' --filter='P anfrage-config.php' \
            -e "ssh -p ${{ secrets.HETZNER_PORT }} -o StrictHostKeyChecking=yes" \
            _site/ "${{ secrets.HETZNER_USER }}@${{ secrets.HETZNER_HOST }}:$PFAD/"
```

Im selben Abschnitt dokumentieren:
- **Secrets:** `HETZNER_HOST`, `HETZNER_PORT` (aus dem Konto; bei Webhosting nicht unbedingt 22),
  `HETZNER_USER`, `HETZNER_SSH_KEY` (eigener Deploy-Schlüssel, ed25519, nur für diesen Zweck),
  `HETZNER_KNOWN_HOSTS` (Host-Schlüssel per `ssh-keyscan` einmal ermitteln und **gegen den Fingerabdruck
  im Hetzner-Konto prüfen**), `HETZNER_PFAD_STAGING`, `HETZNER_PFAD_LIVE`.
- **Variable:** `DEPLOY_ZIEL` = `staging` bis zum Go-live-Tag. Umschalten auf `live` ist der Go-live.
- **Erster Live-Deploy nur als Probelauf** (`workflow_dispatch`, `probelauf: true`): Die Liste zeigt,
  welche Dateien der alten Seite `--delete` entfernt. Sascha prüft sie gegen das Backup.
- Ohne SSH (nur FTP/SFTP im Tarif): Hochladen per `lftp -e "mirror -R --delete --parallel=4 _site/ $PFAD; quit" sftp://…`.
  Variante erst einsetzen, wenn feststeht, dass SSH fehlt.
- `cancel-in-progress: false`: Läufe werden nacheinander abgearbeitet. Ein Push startet Deploy und
  Index-Build parallel. Der zweite Deploy nach dem Rück-Commit ist erwartet.

### 4. `docs/redirect-map.md`

Tabelle alt → neu → Status → Quelle. Vorschlag aus der Navigation der alten Seite:

| Alt | Neu | Sicherheit |
|---|---|---|
| `/index.html` | `/` | sicher |
| `/unternehmen.html` | `/ueber-uns/` | sicher |
| `/galerie.html` | `/projekte/` | sicher |
| `/fachgebiete_gartenbau.html` | `/privatkunden/leistungen/gartengestaltung/` | Inhalt vergleichen |
| `/fachgebiete_vorgarten.html` | `/privatkunden/leistungen/vorgarten/` | sicher |
| `/fachgebiete_pflasterarbeiten.html` | `/privatkunden/leistungen/terrasse-pflasterarbeiten/` | sicher |
| `/fachgebiete_gruenpflege.html` | `/privatkunden/leistungen/gartenpflege/` | Inhalt vergleichen |
| `/fachgebiete_rollrasen.html` | `/privatkunden/leistungen/rollrasen/` | sicher |
| `/fachgebiete_baumpflege.html` | `/privatkunden/leistungen/baumpflege/` | sicher |
| `/fachgebiete_teichbau.html` | `/privatkunden/leistungen/teichbau/` | sicher |
| `/fachgebiete_dachbegruenung.html` | `/privatkunden/leistungen/dachbegruenung/` | sicher |
| `/fachgebiete_natursteine.html` | `/privatkunden/leistungen/findlinge-natursteineinfassungen/` | Inhalt vergleichen |
| `/fachgebiete_erdarbeiten.html` | `/privatkunden/leistungen/erd-baggerarbeiten/` | Inhalt vergleichen |
| `/kaminholz.html` | `/privatkunden/leistungen/holzverkauf/` | sicher |
| `/baumkontrolle.html` | `/privatkunden/leistungen/baumkontrolle/` | sicher |
| `/anfahrt.html` | `/kontakt/` | sicher |
| `/formular.html` | `/kontakt/` | sicher |
| `/impressum.html` | `/impressum/` | sicher |
| `/dsgvo.html` | `/datenschutz/` | sicher |
| `/steuerrecht.html` | `/#faq` (Frage „Kann ich Gartenarbeiten steuerlich geltend machen?“) | Entscheidung E5 |

Weitere URLs aus dem Search-Console-Export (Leistung → Seiten) ergänzt Sascha als Zeilen. Danach
alle Zeilen als `RewriteRule ^<alt>$ <neu> [R=301,L]` in Abschnitt 4 von `server/htaccess-live`
übertragen, gleiche Reihenfolge wie die Tabelle. Nicht pauschal auf die Startseite.

### 5. Plattform-Reste

- `vercel.json`, `.vercelignore`, `_headers` löschen. Sie beschreiben Plattformen, die nicht kommen,
  und widersprechen den neuen Dateien. Der Inhalt bleibt in der Historie.
- `api/anfrage.js`, `nodemailer`, `scripts/preview.mjs`, `.env.example`: bleiben bis **E3**. Die
  Allowlist liefert sie ohnehin nicht aus.

### 6. Dokumente nachziehen

- `docs/umsetzungsplan.md`: neuer Abschnitt **H.11 „Nachtrag: Hosting Hetzner (08.10.2026)“**. Er
  gilt vor Teil C sowie vor den Plattformteilen von AP-12, AP-14 und AP-27. Inhalt: Entscheidung,
  Ablauf Repo → Build-Workflow → Deploy-Workflow → Hetzner, Allowlist, `.htaccess`-Vorlagen,
  PHP-Empfänger, Demo-Sperre fällt automatisch beim Ziel `live`.
- `docs/go-live-checkliste.md`:
  - Abschnitt 1: Die Demo-Sperre entfällt durch `DEPLOY_ZIEL=live` (kein Handentfernen mehr). Prüfung:
    `npm run check:golive -- --root _site --ziel live`.
  - Abschnitt 2: Vercel-Punkte durch Hetzner ersetzen (Testumgebung, Secrets, Probelauf, Backup,
    `DEPLOY_ZIEL`). Stufenplan HSTS: 300 s → nach einer Woche 86 400 s → nach einem Monat 31 536 000 s.
  - Abschnitt 4: Vercel-Umgebungsvariablen durch `anfrage-config.php` ersetzen.
  - Abschnitt 5: Cloudflare AI Crawl Control streichen (kein Cloudflare vor der Seite).
- `CLAUDE.md`, Abschnitt „Stack“: Hosting Hetzner, Deploy über `deploy-hetzner.yml`, was die Allowlist
  ausliefert. Fallstricke: gleicher Bildname → `?v=` (siehe Schritt 2).
- `README.md`: Abschnitt „Deploy“ (zwei Sätze, Verweis auf `docs/workflow-aenderungen.md`).

## Stoppregeln

- Keine Zugangsdaten, Pfade, Hostnamen oder Benutzernamen von Hetzner in Repo-Dateien – nur Platzhalter.
- `noindex` nicht in den Quellen entfernen. Nur `prepare-deploy.mjs` bei `--ziel live`.
- `admin/index.html`, `404.html` behalten `noindex` in jedem Ziel.
- Keine Änderung an `build-index.yml`. Der neue Workflow wird nur als Text in `docs/workflow-aenderungen.md` abgelegt.
- Keine Elfsight-Änderung an `index.html` in diesem AP (Umsetzung von E1 ist ein eigener AP).
- `robots-live.txt` inhaltlich unverändert.

## Prüfung

- [ ] `node .github/scripts/prepare-deploy.mjs --ziel staging --out _site` und `--ziel live`: Ausgabe plausibel,
      `_site` enthält **kein** `docs/`, `tests/`, `scripts/`, `server/`, `.github/`, `*.md`, `package*.json`,
      `vercel.json`, `api/anfrage.js`, `data/kundenstimmen-entwurf.json`
- [ ] live: `grep -rl noindex _site --include=*.html` → genau `admin/index.html`, `404.html`, `gewerbekunden/index.html`
- [ ] live: `_site/robots.txt` = `robots-live.txt`; staging: `Disallow: /`
- [ ] `npm run check:golive -- --root _site --ziel live` ohne neue Fehler gegenüber AP-601/602
- [ ] `.htaccess`-Syntax lokal prüfen: `docker run --rm -v $PWD/_site:/usr/local/apache2/htdocs httpd:2.4`
      mit `AllowOverride All` und `mod_rewrite`/`mod_headers` aktiv. Dann `curl -sI` für `/`, `/index.html`,
      `/unternehmen.html`, `/privatkunden/`, `/gibt/es/nicht/`, `/.git/config`, `/admin/`,
      `/api/anfrage` (GET → 405), `/api/anfrage.php` (→ 404). Ergebnis als Tabelle in den AP.
      Ohne Docker: Tabelle als Prüfliste für morgen auf der Testumgebung.
- [ ] Workflow-YAML mit `actionlint` geprüft (falls installierbar)
- [ ] `npm test` grün

Commit: `AP-604: Deploy-Vorbereitung fuer Hetzner (Allowlist, htaccess, Workflow, Weiterleitungen)`

**Vorprüfung (10.10.2026, lokales Apache 2.4, `server/htaccess-live` wie oben, eine Beispielregel aktiv):**

| Anfrage | Ergebnis |
|---|---|
| `/`, `/kontakt/` | 200, CSP und `Cache-Control: no-cache` |
| `/index.html`, `/kontakt/index.html` | 301 → `/`, `/kontakt/` (kein Schleifen beim DirectoryIndex) |
| `/unternehmen.html` | 301 → `/ueber-uns/` |
| `/privatkunden/` | 301 → `/` |
| `/gibt/es/nicht/`, `/.git/config` | 404 |
| `/api/anfrage` / `/api/anfrage.php` | an `anfrage.php` geleitet / 404 |
| `/assets/…` | `Cache-Control: public, max-age=31536000, immutable` |
| `/admin/` | ohne CSP, mit `X-Robots-Tag: noindex` |
| `http://www.rohdich.de/kontakt/` | ein einziger 301 → `https://rohdich.de/kontakt/` |

Die Tabelle ersetzt nicht die Prüfung auf Hetzner (andere Module, PHP, HTTPS-Erkennung).

## Morgen mit Hetzner-Zugang (Sascha)

- [ ] Backup der alten Seite (Dateien) – **vor** jedem Deploy auf die Live-Wurzel
- [ ] Test-Subdomain (z. B. `neu.rohdich.de`) mit eigenem Verzeichnis, SSL aktivieren; bestehende DNS-Einträge nicht ändern
- [ ] `.htpasswd` außerhalb der Dokumentwurzel anlegen, Pfad in `server/htaccess-staging` eintragen lassen
- [ ] SSH-Zugang, Port und Pfade klären; Deploy-Schlüssel hinterlegen; Secrets und `DEPLOY_ZIEL=staging` in GitHub setzen
- [ ] Workflow aus `docs/workflow-aenderungen.md` im GitHub-Web-UI anlegen, ersten Lauf beobachten
- [ ] Cloudflare-Worker des CMS: `rohdich.de` und die Test-Subdomain als erlaubte Domains eintragen
- [ ] Prüftabelle aus „Prüfung“ auf der Testumgebung abarbeiten

## Offene Entscheidungen

- **E1 – Google-Bewertungen über Elfsight:**
  (a) entfernen und durch den Abruf über die Places API ersetzen (AP-20; kein Banner, kein Fremdskript);
  (b) Zwei-Klick-Lösung: Platzhalter mit Knopf „Google-Bewertungen anzeigen“, erst danach lädt Elfsight;
  dazu Datenschutztext und CSP-Domains;
  (c) Einwilligungsbanner für die ganze Seite.
  Empfehlung: (b) zum Go-live, (a) danach. Umsetzung als eigener AP nach der Entscheidung.
- **E2 – CSP für `/admin/` abschalten?** Empfehlung ja (oben so umgesetzt). Das CMS lädt Fremdcode von
  unpkg, ist aber nur nach GitHub-Login nutzbar und für Besucher ohne Belang.
- **E3 – Node-Vorschau behalten?** (a) behalten wie heute; (b) entfernen und `preview.mjs` leitet
  `/api/anfrage` an einen lokalen `php -S` weiter. Empfehlung (b), damit es nur noch einen Empfänger gibt.
  Eigener kleiner AP.
- **E4 – HTML-Kommentare beim Live-Deploy entfernen?** Empfehlung ja. Umsetzung im Deploy-Skript:
  Kommentare außerhalb von `<script>`, `<style>`, `<pre>`, `<textarea>` entfernen. Prüfung: Textinhalt
  (`document.body.textContent`) jeder Seite vor und nach gleich, `npm run check:golive` unverändert.
- **E5 – `/steuerrecht.html`:** auf die Steuerfrage im FAQ der Startseite (`/#faq`) oder auf `/`.
  Empfehlung `/#faq`.
- **E6 – Testumgebung auch nach dem Go-live behalten?** Empfehlung ja, passwortgeschützt. Dann
  `DEPLOY_ZIEL` später um ein zweites Ziel erweitern.

---

## Nachtrag (16.10.2026, umgesetzt)

**Entscheidungen:**
- **E1:** CSP **ohne** Elfsight, die Zwei-Klick-Lösung (b) kommt als nächster AP. Bis dahin bleibt das Widget auf Test und Live leer.
- **E2:** keine CSP für `/admin/`.
- **E3:** Node-Vorschau bleibt (eigener AP).
- **E4:** HTML-Kommentare werden beim Live-Deploy entfernt.
- **E5:** `/steuerrecht.html` → `/#faq`.
- **E6:** Die Testumgebung bleibt nach dem Go-live.
- **Gewerbe:** `/gewerbekunden/` → `/` mit **302** (AP-602 E1).

### Abweichungen vom Entwurf

1. **Passwortschutz der Testumgebung nur über https.** Apache prüft den Zugang *vor* den Rewrite-Regeln.
   Mit dem Entwurf hätte der Browser bei `http://` nach dem Passwort gefragt und es **unverschlüsselt**
   geschickt, bevor die https-Weiterleitung greift. Jetzt gilt
   `<RequireAny> Require expr %{HTTPS} != 'on' / Require valid-user </RequireAny>`: http wird nur
   umgeleitet, nie beantwortet.
2. **`.htpasswd`-Pfad aus Secret** `HETZNER_HTPASSWD_PFAD` statt Platzhalter im Repo (Stoppregel:
   keine Hetzner-Pfade). `prepare-deploy.mjs` bricht für `staging` ohne den Pfad ab, statt eine
   `.htaccess` zu bauen, die Apache mit 500 quittiert.
3. **CSP-Hashes werden bei jedem Deploy berechnet** und eingesetzt (`__CSP_SCRIPT_HASHES__`). Die
   Hashes vom 09.10. waren unverändert gültig. Wer künftig ein Inline-Skript ändert, bricht die
   Seite dadurch nicht.
4. **`htaccess-staging` wird gegen `htaccess-live` getestet** (`tests/prepare-deploy.test.mjs`): Die
   Dateien dürfen nur im Kopf, in Regel 1 und in HSTS/X-Robots voneinander abweichen.
5. **`/steuerrecht.html`** braucht das Flag `NE`, sonst kodiert Apache `#` zu `%23`.

### Ergebnis `prepare-deploy.mjs`

- staging und live: 2.053 Dateien. Nicht ausgeliefert werden `.env.example`, `.github/`, `.gitignore`,
  `ASSETS.md`, `CLAUDE.md`, `README.md`, `docs/`, `package*.json`, `robots*.txt` (als Quelle),
  `scripts/`, `server/` und `tests/`. Auch `api/anfrage.js` und `data/kundenstimmen-entwurf.json`
  fehlen in `_site`.
- live: **Demo-Sperre entfernt: 50 von 50** Sitemap-Seiten. `noindex` tragen danach nur noch
  `404.html`, `admin/index.html` und `gewerbekunden/index.html`. `robots.txt` = `robots-live.txt`.
  645 HTML-Kommentare entfernt.
- **E4-Nachweis:** In allen 53 Seiten sind Titel und `body.textContent` in Quelle und `_site`
  identisch (jsdom).
- `npm run check:golive -- --root _site --ziel live`: nur die bekannten Meldungen (Fehler E1 aus AP-601
  doppelter Projekttitel, Warnung Tor-Kachel, Warnung Zertifikats-Alt-Text).

### Prüftabelle: Apache 2.4.68 + PHP 8.3.35 (Docker `php:8.3-apache`, TLS selbstsigniert)

Live (`_site`, Host `rohdich.de`):

| Anfrage | Ergebnis |
|---|---|
| `https://rohdich.de/`, `/kontakt/` | 200, CSP + HSTS, `Cache-Control: no-cache`, gzip |
| `/index.html`, `/kontakt/index.html` | 301 → `/`, `/kontakt/` |
| `/unternehmen.html` | 301 → `/ueber-uns/` |
| `/fachgebiete_natursteine.html` | 301 → `/privatkunden/leistungen/findlinge-natursteineinfassungen/` |
| `/steuerrecht.html` | 301 → `/#faq` |
| `/privatkunden/` | 301 → `/` |
| `/gewerbekunden/` | 302 → `/` |
| `/gibt/es/nicht/`, `/.git/config`, `/docs/umsetzungsplan.md` | 404 mit gestalteter 404-Seite |
| `/.htaccess` | 403 |
| `/admin/` | 200, **ohne** CSP, `X-Robots-Tag: noindex, nofollow` |
| `GET /api/anfrage` | 405 `{"ok":false,"code":"method"}` |
| `POST /api/anfrage` (unvollständig) | 422 mit Feldtexten (PHP-Empfänger läuft) |
| `/api/anfrage.php` | 404 |
| `/api/lib/PHPMailer/src/PHPMailer.php`, `/api/anfrage.js` | 403 |
| `/assets/css/styles.css` | `Cache-Control: public, max-age=31536000, immutable` |
| `/data/projekte-index.json`, `/robots.txt` | 200, `no-cache`; robots = Live-Fassung |
| `http://www.rohdich.de/kontakt/` | **ein** 301 → `https://rohdich.de/kontakt/` |
| `http://rohdich.de/`, `https://www.rohdich.de/projekte/` | je ein 301 auf `https://rohdich.de/…` |

Testumgebung (`_site-staging`, Host `neu.rohdich.de`, Testpasswort im Container):

| Anfrage | Ergebnis |
|---|---|
| `http://neu.rohdich.de/kontakt/` | 301 → https, **keine** Passwortabfrage über http |
| `https://…/` ohne / mit falschem Zugang | 401 mit Passwortabfrage |
| `https://…/` mit Zugang | 200, `X-Robots-Tag`, **kein** HSTS, Demo-Sperre im HTML erhalten |
| `/robots.txt` | Demo-Fassung (`Disallow: /`) |
| `/unternehmen.html` | 301 → `https://neu.rohdich.de/ueber-uns/` |

**CSP im echten Browser** (Chrome headless gegen den Live-Container): `/`, `/ueber-uns/`, `/kontakt/`,
`/projekte/`, eine Leistungs- und eine Projektseite, `/impressum/`, 404. Einziger Verstoß:
`elfsightcdn.com/platform.js` auf der Startseite (gewollt, E1). Beide Inline-Skripte laufen, belegt
durch die gesetzten Klassen `home-header-morph` und `js`. Keine sonstigen Konsolenfehler.

Die Tabelle ersetzt nicht die Prüfung auf Hetzner. Dort können andere Module aktiv sein, die
HTTPS-Erkennung kann abweichen, und es gibt eine echte SMTP-Anbindung.

**Workflow:** actionlint 1.7.12 ohne Befund (ShellCheck lokal nicht installiert, also ohne
Shell-Prüfung). `npm test`: 61 von 61 (inkl. 5 neue Tests für `prepare-deploy.mjs`, 15 PHP-Tests mit PHP 8.1).

### Befund für einen eigenen AP: Bildbestand

`assets/` umfasst **395 MB** bei 1.985 Dateien. Eine grobe Verweisprüfung (Dateiname oder Stamm in
HTML, CSS, JS und JSON) findet für **etwa 190 MB** keinen Verweis, davon 86 MB in `…/originale/`
(`galerie-teaser` 48 MB, `privat/hero` 35 MB). Das ist ein Hinweis, kein Beweis, denn manche Pfade
setzt erst JavaScript zusammen. Die Allowlist bleibt deshalb bei `assets/**`. Ein eigener AP sollte
die Verweise sauber ermitteln und Ungenutztes aus der Auslieferung nehmen. Das spart Upload-Zeit und
Speicher auf Hetzner.

### Weitere Hinweise

- `content/rechtstexte/datenschutz.body.html` nennt in einem OFFEN-Kommentar noch Vercel als geplanten
  Hoster. Der Datenschutztext ist Saschas Teil (AP-603-Liste).
- `robots-live.txt` erwähnt in einem Kommentar `.vercelignore`. Laut Stoppregel bleibt der Inhalt
  unverändert, live werden Kommentare in `robots.txt` ohnehin nicht ausgewertet.
