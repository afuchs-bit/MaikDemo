# Go-Live-Checkliste

Abzuarbeiten unmittelbar vor dem Umschalten auf `rohdich.de`.
Reihenfolge beachten — Position 1 zuerst.

## 1. Indexierungssperre aufheben (AP-01, seit AP-604 automatisch)

Die Demo-Sperre wird **nicht mehr von Hand** entfernt. Sie fällt automatisch weg, sobald die
GitHub-Variable `DEPLOY_ZIEL` auf `live` steht: `.github/scripts/prepare-deploy.mjs` entfernt dann in der
ausgelieferten Kopie das `noindex` der Sitemap-Seiten und ersetzt `robots.txt` durch `robots-live.txt`.
Die Quellen im Repo behalten die Sperre.

- [ ] `DEPLOY_ZIEL` = `live` gesetzt (Settings → Secrets and variables → Actions → Variables)
- [ ] Vorher lokal: `node .github/scripts/prepare-deploy.mjs --ziel live --out _site` meldet
      „Demo-Sperre entfernt: N von N Sitemap-Seiten“
- [ ] `npm run check:golive -- --root _site --ziel live` läuft ohne Fehler (AP-601)

> **Ausnahme — bleibt immer:** `admin/index.html`, `404.html` und `gewerbekunden/index.html`
> behalten ihr `noindex` in jedem Ziel.

**Prüfung:** `grep -rl noindex _site --include=*.html` liefert genau diese drei Dateien.

## 1b. Vorläufiges Zitat auf /ueber-uns/ ersetzen (AP-327, AP-384)

Die Sektion „Das Team hinter dem Betrieb" trägt seit dem 15.09.2026 **sichtbaren
Platzhaltertext** — auf ausdrückliche Entscheidung des Auftraggebers, damit das Layout im
Zusammenhang beurteilt werden kann. Das weicht bewusst von Grundregel 2 ab und darf nicht
live gehen.

**Der Absatz ist seit AP-384 erledigt** (21.09.2026): Er trägt den Text des Auftraggebers,
in der Wir-Form, und nicht mehr die Platzhalter-Klasse. Die ursprünglich vorgesehenen Sätze
in der Ich-Form von Maik Rohdich werden nicht mehr gebraucht.

**Das Zitat ist seit AP-450 erledigt** (24.09.2026): Es lautet auf Ansage des Auftraggebers
**„Kein Auftrag ist uns zu klein."** Der Satz ist nicht erfunden — er nimmt die Überschrift
der Kachel auf, die bis zu diesem Tag hinter den Projekten stand („Kein Auftrag ist zu
klein.", AP-327, Wortlaut ebenfalls vom Auftraggeber) und mit AP-450 entfallen ist.

- [x] Der Absatz `.ueber-inhaber__text` trägt den endgültigen Text (AP-384)
- [x] Das Zitat ist durch den freigegebenen Wortlaut ersetzt (AP-450)
- [x] Am Zitat ist die Klasse `ueber-inhaber__platzhalter` entfernt (AP-450)
- [x] Der `[OFFEN: …]`-Kommentar über der Sektion in `ueber-uns/index.html` ist aufgelöst (AP-450)

**Damit trägt die Seite keinen sichtbaren Platzhaltertext mehr** — die Abweichung von
Grundregel 2, die seit dem 15.09.2026 bestand, ist beendet.

**Prüfung:** `grep -n "ueber-inhaber__platzhalter" ueber-uns/index.html assets/css/ueber-uns.css`
liefert keine Treffer mehr im Markup.

## 2. Domain, Hosting und Transport (Hetzner, AP-604)

- [ ] **Backup** der alten Seite (Dateien) gezogen – **vor** jedem Deploy auf die Live-Wurzel
- [ ] Testumgebung (z. B. `neu.rohdich.de`) mit eigenem Verzeichnis und SSL, `.htpasswd` außerhalb der
      Dokumentwurzel, Pfad als Secret `HETZNER_HTPASSWD_PFAD`
- [ ] SSH-Zugang, Port und Pfade geklärt; Deploy-Schlüssel und alle Secrets laut
      `docs/workflow-aenderungen.md` (Abschnitt AP-604) gesetzt; `DEPLOY_ZIEL=staging`
- [ ] Workflow `deploy-hetzner.yml` im GitHub-Web-UI angelegt, erster Lauf grün
- [ ] Prüftabelle aus `docs/ap/AP-604-golive-hetzner-server-deploy.md` (Nachtrag) auf der Testumgebung
      abgearbeitet
- [ ] **Erster Live-Deploy als Probelauf** (`workflow_dispatch`, `probelauf` an): Löschliste gegen das
      Backup geprüft, erst dann echter Lauf
- [ ] Domain `rohdich.de` zeigt auf die Live-Wurzel, HTTPS aktiv; `http://www.rohdich.de/kontakt/`
      liefert **einen** 301 auf `https://rohdich.de/kontakt/`
- [ ] HSTS-Stufenplan: Start `max-age=300` → nach einer Woche ohne Probleme `86400` → nach einem Monat
      `31536000` (jeweils in `server/htaccess-live` ändern und deployen)
- [ ] Testumgebung liefert `X-Robots-Tag: noindex, nofollow` und fragt nach dem Passwort nur über https
      (`curl -I`)
- [ ] Weiterleitungen stichprobenartig geprüft: 10 alte URLs aus `docs/redirect-map.md` → HTTP 301 auf
      das thematisch passende Ziel, kein Sammel-Redirect auf die Startseite
- [ ] CMS: im Cloudflare-Worker `rohdich.de` und die Test-Subdomain als erlaubte Domains eingetragen

## 3. Inhalte

- [ ] Alle Demo-Nummern und Platzhalter beseitigt — mit `grep`-Nachweis:
      `grep -rn "Demo\|PLATZHALTER\|tbd" --include="*.html" .`
      und `grep -rn "2345678\|1234567\|0171 / 234\|02323 / 12" --include="*.html" .`
- [ ] `docs/offene-punkte.md` ist leer oder vom Auftraggeber freigegeben
- [ ] Impressum und Datenschutz mit echten Texten
- [ ] `npm run check:golive -- --root _site --ziel live` läuft ohne Fehler (AP-601)
- [ ] Keine verwaiste Seite — alles in maximal drei Klicks erreichbar
- [ ] Öffnungszeiten identisch in Website, Schema und Google-Unternehmensprofil

## 4. Technik

- [ ] `data-endpoint="/api/anfrage"` am Kurzformular in `index.html` eingetragen —
      ohne das bleibt das Formular im heutigen Zustand und zeigt nur den Hinweis
- [ ] `anfrage-config.php` aus `server/anfrage-config.example.php` eine Ebene **über** der
      Dokumentwurzel angelegt (Rechte 600): Empfänger, Absender-Postfach der Domain, SMTP-Daten,
      `erlaubte_origins`, `ratelimit_dir` (AP-603). **Niemals ins Repo**
- [ ] PHP ≥ 8.1, `display_errors` aus, `post_max_size` ≥ 8M, `upload_max_filesize` ≥ 4M
- [ ] `/api/anfrage` per GET → 405, `/api/anfrage.php` → 404, `/api/lib/…` → 403
- [ ] Testanfrage **ohne** Foto kommt im Postfach an
- [ ] Testanfrage **mit** Foto kommt an; im Anhang ist nachweislich kein EXIF mehr
      (`exiftool` oder Bytes nach dem Marker `Exif` durchsuchen)
- [ ] Foto ausgewählt, Häkchen nicht gesetzt → kein Absenden. Ohne Foto wird nicht
      nach einer Einwilligung gefragt; die Anfrage selbst stützt sich auf
      Vertragsanbahnung (Art. 6 Abs. 1 lit. b DSGVO), nicht auf Einwilligung
- [ ] Der Satz „Fotos senden Sie am schnellsten direkt per WhatsApp mit." ist
      verschwunden, sobald der Upload läuft (macht `anfrage.js` selbst)
- [ ] Keine Anfrage an Google-Domains beim Seitenaufruf (Netzwerk-Tab)
- [ ] Rich Results Test auf allen Seitentypen ohne Fehler
- [ ] Lighthouse mobil: Performance ≥ 90, SEO 100, Accessibility ≥ 95, CLS < 0,1

## 5. Messung

- [ ] Sitemap eingereicht in Search Console und Bing Webmaster Tools
- [ ] Baseline-Messung in `docs/baseline.md` dokumentiert — **vor** dem Umschalten erfassen
- [ ] Testklick auf die Telefonnummer erscheint als Event
