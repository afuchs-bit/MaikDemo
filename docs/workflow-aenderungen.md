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
