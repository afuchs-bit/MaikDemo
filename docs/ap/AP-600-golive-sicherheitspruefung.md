# AP-600 — Go-live: Sicherheitsprüfung von Repo und Auslieferung

Stand 09.10.2026 · Basis `1db06c5f` (`claude/kind-fermat-pyzy5p`)
Go-live-Block AP-600 bis AP-605 · Hosting **Hetzner** (Entscheidung des Auftraggebers vom 08.10.2026)

## Auftrag

Vor dem Go-live nachweisen, dass weder im Repository noch in dem, was später auf dem Server liegt,
Zugangsdaten, Schlüssel oder personenbezogene Daten stehen, die dort nicht hingehören.

Das ist ein **Prüf-AP**. Ergebnis ist der Bericht `docs/sicherheitspruefung.md`. Am Code ändert
sich nur, was unter „Umsetzung“ ausdrücklich steht.

## Befund (Vorprüfung 09.10.2026)

| Prüfung | Ergebnis |
|---|---|
| Sichtbarkeit `afuchs-bit/MaikDemo` | **öffentlich** – Code, Historie und `docs/` (Umsetzungsplan, offene Punkte, AP-Dokumente) sind für jeden lesbar |
| Musterscan Historie (516 geladene Commits, flache Kopie) | keine Treffer für GitHub-Tokens, AWS-Keys, Google-API-Keys (`AIza…`), private Schlüssel, `SMTP_PASS=…`, `EMPFAENGER=…@` |
| Jemals committete Geheimnis-Dateien | keine (nur `.env.example`, leer) |
| `.gitignore` | deckt `.env` und `.env.*` ab |
| `api/anfrage.js` | Zugangsdaten nur aus Umgebungsvariablen, Log enthält nur den Fehlercode |
| `admin/config.yml` | enthält nur die Worker-URL des OAuth-Proxys (`base_url`), kein Geheimnis |
| Google-Places-Key | nicht im Repo; nur als geplantes GitHub Secret `GOOGLE_PLACES_API_KEY` im Umsetzungsplan (Z. 599) |
| `data/kundenstimmen-entwurf.json` | Namen und Volltexte von Google-Rezensenten (Stand 06.09.2026). Wird von **keiner** Seite und keinem Skript geladen, liegt aber öffentlich im Repo und würde heute mit ausgeliefert |
| `data/images.json`, `data/images-repo.json` | zur Laufzeit nicht geladen (Build-Daten) |
| Fremdskript auf der Startseite | `index.html` Z. 1569 lädt `https://elfsightcdn.com/platform.js` bei jedem Seitenaufruf. Fremder Code mit vollem Zugriff auf die Startseite – Entscheidung in AP-604 |
| HTML-Kommentare in ausgelieferten Seiten | 680 Kommentare, darunter interne Arbeitsnotizen (AP-Verweise, „Demo-Sperre“, 14 × `OFFEN`) – im Quelltext für jeden sichtbar. Kein Geheimnis gefunden, aber Behandlung in AP-604 |

**Noch nicht geprüft:** die vollständige Historie aller Branches. Genau das ist Kern dieses AP.

## Umsetzung

### 1. Vollständige Historie holen

```bash
git fetch --unshallow || git fetch --depth=100000
git fetch origin '+refs/heads/*:refs/remotes/origin/*'
git rev-list --all --count   # Zahl in den Bericht
```

### 2. gitleaks laufen lassen

- gitleaks als **Release-Binary** von `github.com/gitleaks/gitleaks/releases` installieren, Version
  festhalten. Kein `curl … | sh` aus anderer Quelle.
- Historie aller Branches:
  `gitleaks git --log-opts="--all" --redact --report-format json --report-path /tmp/gitleaks-historie.json .`
- Arbeitsbaum (auch nicht committete Dateien):
  `gitleaks dir . --redact --report-format json --report-path /tmp/gitleaks-baum.json`
- Projekteigene Muster zusätzlich per `git log --all -p | grep -nE` prüfen: `SMTP_PASS=.+`,
  `EMPFAENGER=.+@`, `AIza[0-9A-Za-z_-]{30,}`, `\.htpasswd`, `BEGIN .*PRIVATE KEY`.
- Berichte bleiben in `/tmp`. **Kein Bericht mit Fundstellen ins Repo** – das Repo ist öffentlich.

**Fund-Regel:** Jeder echte Fund gilt als kompromittiert. Dann:
1. Sofort im Chat melden: Datei, Commit, Art des Schlüssels – **ohne den Wert**.
2. Sascha widerruft den Schlüssel beim Anbieter und erzeugt einen neuen. Das macht nicht Claude Code.
3. Erst danach Historie bereinigen (`git filter-repo`) – nur nach ausdrücklicher Freigabe, weil das
   einen Force-Push braucht.

### 3. Auslieferbare Dateien prüfen

Alle Dateitypen, die auf den Server gehen (`.html`, `.js`, `.json`, `.css`, `.xml`, `.txt`, `.yml`),
ohne `docs/`, `.github/`, `tests/`, `scripts/`, `node_modules/`, durchsuchen nach:

- Schlüsseln, Tokens, Passwörtern (gitleaks-Ergebnis aus Schritt 2 genügt)
- Entwicklungsadressen: `localhost`, `127.0.0.1`, `*.vercel.app`, `*.pages.dev`, `github.io`
- E-Mail-Adressen außer `maik@rohdich.de` und `info@rohdich.de`
- Telefonnummern außer `+491711738943` und `+492325585790` (Vorprüfung: nur diese beiden, 0 Demo-Nummern)
- Personennamen außerhalb freigegebener Inhalte (Kundenstimmen, Rezensenten)

Ergebnis als Tabelle in den Bericht.

### 4. `data/kundenstimmen-entwurf.json`

Nur nach Entscheidung **E1** handeln. Unabhängig davon schließt die Allowlist in AP-604 die Datei von
der Auslieferung aus.

### 5. Bericht `docs/sicherheitspruefung.md`

Inhalt: Datum, Werkzeug und Version, Umfang (Zahl der Commits, Branches), Ergebnis je Prüfung aus
Schritt 2 und 3 (ohne Klartextwerte), Befunde mit Status, offene Entscheidungen. `docs/` wird nicht
ausgeliefert (AP-604), ist aber auf GitHub öffentlich – deshalb nichts Schützenswertes hineinschreiben.

## Stoppregeln

- Kein Force-Push, keine Historienbereinigung, keine Änderung der Repo-Sichtbarkeit, kein Widerruf von
  Schlüsseln durch Claude Code.
- Keine Geheimniswerte in Chat, Commit-Nachricht oder Datei – auch nicht gekürzt.
- Kein Eingriff in HTML, CSS, JS, Build-Skripte oder Workflows.
- Dateien nur löschen, wenn E1 das freigibt.

## Prüfung

- [ ] Historie vollständig (kein `shallow` mehr), Commit- und Branch-Zahl im Bericht
- [ ] gitleaks über Historie **und** Arbeitsbaum, Version im Bericht
- [ ] Tabelle der auslieferbaren Dateien mit Ergebnis je Suchmuster
- [ ] Bericht enthält keinen Klartextwert (`grep -E "AIza|ghp_|BEGIN" docs/sicherheitspruefung.md` leer)
- [ ] Bei Fund: Meldung im Chat vor jedem weiteren Schritt

Commit: `AP-600: Sicherheitsprüfung vor dem Go-live`

## Offene Entscheidungen

- **E1 – Rezensionen-Entwurf löschen?** Empfehlung: ja. Die Datei wird nirgends genutzt, enthält
  personenbezogene Daten Dritter, und Google begrenzt das Zwischenspeichern von Bewertungsinhalten.
  Ein Löschen entfernt sie nicht aus der Historie. Das ist hinnehmbar, weil die Texte ohnehin
  öffentlich bei Google stehen.
- **E2 – Repo auf privat stellen?** Folgen, die Sascha abwägt:
  - Die Vorschau über GitHub Pages endet im kostenlosen Tarif. Nach dem Go-live ist das gewollt.
  - Sveltia CMS braucht dann den OAuth-Scope `repo`. Prüfen, ob der Cloudflare-Worker ihn anfordert.
  - GitHub Actions haben für private Repos ein Freikontingent an Minuten. Build und Deploy laufen
    bei jedem CMS-Commit.
  - `docs/` (Pläne, offene Punkte) wäre nicht mehr öffentlich lesbar.
- **E3 – Elfsight auf der Startseite:** wird in AP-604 entschieden (Inhaltsrichtlinie und Datenschutz).
