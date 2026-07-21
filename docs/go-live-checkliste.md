# Go-Live-Checkliste

Abzuarbeiten unmittelbar vor dem Umschalten auf `rohdich.de`.
Reihenfolge beachten — Position 1 zuerst.

## 1. Indexierungssperre aufheben (AP-01)

Die Demo läuft mit vollständiger Sperre. Beim Umschalten beides entfernen:

- [ ] `<meta name="robots" content="noindex,nofollow" />` aus `index.html`,
      `privatkunden/index.html`, `gewerbekunden/index.html`, `projekte/index.html`
      **und aus allen bis dahin neu entstandenen Seiten** entfernen
      (Leistungsseiten, Projektseiten, Ortsseiten, Ratgeber, Impressum, Datenschutz)
- [ ] `robots.txt` durch `robots-live.txt` ersetzen (AP-08)

> **Ausnahme — nicht anfassen:** `admin/index.html` behält sein `noindex` dauerhaft.
> Das ist der CMS-Login und gehört nie in den Suchindex.
> `404.html` behält sein `noindex` ebenfalls (AP-10).

**Prüfung:** `grep -rn "noindex" --include="*.html" .` darf nur noch `admin/index.html`
und `404.html` liefern.

## 2. Domain und Transport

- [ ] Domain `rohdich.de` auf Cloudflare Pages aufgeschaltet, HTTPS aktiv, HSTS gesetzt
- [ ] Preview-Deployments liefern weiterhin `X-Robots-Tag: noindex` (`curl -I` nachweisbar)
- [ ] `_redirects` und `_headers` greifen nachweislich (`curl -I`)
- [ ] Alte Seite unter `rohdich.de` abgeschaltet, Weiterleitungen stichprobenartig geprüft
      (10 alte URLs → HTTP 301 auf thematisch passendes Ziel, kein Sammel-Redirect
      auf die Startseite)

## 3. Inhalte

- [ ] Alle Demo-Nummern und Platzhalter beseitigt — mit `grep`-Nachweis:
      `grep -rn "Demo\|PLATZHALTER\|tbd" --include="*.html" .`
      und `grep -rn "2345678\|1234567\|0171 / 234\|02323 / 12" --include="*.html" .`
- [ ] `docs/offene-punkte.md` ist leer oder vom Auftraggeber freigegeben
- [ ] Impressum und Datenschutz mit echten Texten
- [ ] Jede Seite hat genau ein `<h1>`, ein Canonical, eine Meta-Description
- [ ] Keine verwaiste Seite — alles in maximal drei Klicks erreichbar
- [ ] Öffnungszeiten identisch in Website, Schema und Google-Unternehmensprofil

## 4. Technik

- [ ] Formular getestet: E-Mail kommt an, Bild-Upload funktioniert, ohne Einwilligung
      kein Absenden
- [ ] Keine Anfrage an Google-Domains beim Seitenaufruf (Netzwerk-Tab)
- [ ] Rich Results Test auf allen Seitentypen ohne Fehler
- [ ] Lighthouse mobil: Performance ≥ 90, SEO 100, Accessibility ≥ 95, CLS < 0,1

## 5. Messung

- [ ] Sitemap eingereicht in Search Console und Bing Webmaster Tools
- [ ] Cloudflare AI Crawl Control geprüft: **Search und Training nicht blockiert**
      (Cloudflare ändert zum 15.09.2026 die Standardwerte)
- [ ] Baseline-Messung in `docs/baseline.md` dokumentiert — **vor** dem Umschalten erfassen
- [ ] Testklick auf die Telefonnummer erscheint als Event
