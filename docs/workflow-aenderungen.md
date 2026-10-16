# Workflow-Änderungen für das GitHub-Web-UI

Änderungen unter `.github/workflows/**` kann Claude nicht pushen (der Token hat keinen
`workflow`-Scope). Diese Datei sammelt die Diffs, die **der Auftraggeber selbst** im
GitHub-Web-UI (Datei öffnen → Bearbeiten → Commit) einspielen muss.

`.github/scripts/**` ist davon **nicht** betroffen und wird normal mit gepusht.

---

## AP-15 — Generierte Projektseiten mit-committen

**Status:** offen · **Datei:** `.github/workflows/build-index.yml`

**Warum:** `build-index.mjs` erzeugt seit AP-15 zusätzlich `projekte/<slug>/index.html`
je Projekt und aktualisiert die statische Liste in `projekte/index.html`. Der
Commit-Back-Step committet bisher **nur** `data/projekte-index.json` zurück. Ohne die
Erweiterung erzeugt die Action zwar die Seiten, committet sie aber nicht — ein **über das
CMS neu angelegtes** Projekt bekäme dann keine Live-Seite.

> Die vier heute bestehenden Projektseiten sind bereits im Repo committet und live —
> diese Änderung betrifft nur **künftige** CMS-Anlagen.

**Schritt „Ergebnis zurückcommitten (nur bei Änderung)" ersetzen durch:**

```yaml
      - name: Ergebnis zurückcommitten (nur bei Änderung)
        run: |
          git add data/projekte-index.json projekte/
          if git diff --cached --quiet; then
            echo "Keine Änderung – nichts zu committen."
          else
            git config user.name "github-actions[bot]"
            git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
            git commit -m "chore: Projekt-Index & Projektseiten aktualisiert [skip ci]"
            git push
          fi
```

**Unbedenklich:** Der Trigger `on.push.paths` enthält `projekte/**` **nicht** — der
Rück-Commit löst also keinen zweiten Lauf aus; `[skip ci]` sichert das zusätzlich ab.


---

## AP-604 — Deploy auf Hetzner

**Status:** offen · **Datei (neu):** `.github/workflows/deploy-hetzner.yml`

**Warum:** Die Seite geht ab dem Go-live von Hetzner aus, nicht mehr von GitHub Pages. Der Workflow
stellt mit `.github/scripts/prepare-deploy.mjs` nur die erlaubten Dateien zusammen (Allowlist),
prüft sie mit `scripts/golive-check.mjs` und lädt sie per SSH/rsync hoch. Geprüft mit actionlint 1.7.12.

**Neue Datei anlegen** (GitHub → Code → Add file → Create new file →
`.github/workflows/deploy-hetzner.yml`):

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
        env:
          HTPASSWD_PFAD: ${{ secrets.HETZNER_HTPASSWD_PFAD }}   # nur fuer staging noetig
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

**Secrets** (Settings → Secrets and variables → Actions → Secrets):

| Secret | Inhalt |
|---|---|
| `HETZNER_HOST` | Server aus dem Hetzner-Konto |
| `HETZNER_PORT` | SSH-Port aus dem Konto (beim Webhosting nicht unbedingt 22) |
| `HETZNER_USER` | SSH-Benutzer |
| `HETZNER_SSH_KEY` | eigener Deploy-Schlüssel (ed25519), nur für diesen Zweck; öffentlicher Teil ins Konto |
| `HETZNER_KNOWN_HOSTS` | Ausgabe von `ssh-keyscan -p <PORT> <HOST>`, **gegen den Fingerabdruck im Hetzner-Konto prüfen** |
| `HETZNER_PFAD_STAGING` | Dokumentwurzel der Testumgebung |
| `HETZNER_PFAD_LIVE` | Dokumentwurzel von rohdich.de |
| `HETZNER_HTPASSWD_PFAD` | absoluter Pfad der `.htpasswd` der Testumgebung, **außerhalb** der Dokumentwurzel |

`HETZNER_HTPASSWD_PFAD` ist neu gegenüber dem AP-Entwurf: Die Stoppregel verbietet Hetzner-Pfade im
Repo. `prepare-deploy.mjs` setzt den Pfad beim Bau ein und bricht für `staging` ab, wenn er fehlt –
statt eine `.htaccess` mit Platzhalter hochzuladen, die Apache mit 500 quittiert.

**Variable** (Settings → Secrets and variables → Actions → Variables): `DEPLOY_ZIEL` = `staging` bis
zum Go-live-Tag. Umschalten auf `live` **ist** der Go-live: Ab dann fallen Demo-Sperre und interne
HTML-Kommentare in der ausgelieferten Kopie weg, `robots.txt` wird zur Live-Fassung.

**Ablauf und Hinweise**

- **Erster Live-Deploy nur als Probelauf:** Actions → Deploy Hetzner → Run workflow, `probelauf`
  angehakt. Die Liste zeigt, welche Dateien der alten Seite `--delete` entfernen würde. Gegen das
  Backup prüfen, erst dann ohne Probelauf starten.
- Läufe werden nacheinander abgearbeitet (`cancel-in-progress: false`). Ein Push startet Deploy und
  Index-Build parallel; der zweite Deploy nach dem Rück-Commit des Index-Builds ist erwartet.
- `workflow_run` würde sonst den Default-Branch auschecken – deshalb fest `ref: claude/kind-fermat-pyzy5p`.
- `--filter='P …'` schützt `.htpasswd`, `.well-known/` (Zertifikat) und eine versehentlich in der
  Wurzel liegende `anfrage-config.php` vor `--delete`.
- **Ohne SSH** (nur SFTP im Tarif): Schritt „Hochladen“ durch
  `lftp -e "mirror -R --delete --parallel=4 _site/ $PFAD; quit" sftp://…` ersetzen. Erst einsetzen,
  wenn feststeht, dass SSH fehlt.
- Die GitHub-Pages-Vorschau (`pages-build-deployment`) läuft unabhängig weiter, bis das Repo privat
  wird (siehe E2 in AP-600).
