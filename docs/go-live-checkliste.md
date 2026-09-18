# Go-Live-Checkliste

Abzuarbeiten unmittelbar vor dem Umschalten auf `rohdich.de`.
Reihenfolge beachten — Position 1 zuerst.

## 1. Indexierungssperre aufheben (AP-01)

Die Demo läuft mit vollständiger Sperre. Beim Umschalten beides entfernen:

- [ ] `<meta name="robots" content="noindex,nofollow" />` aus `index.html`,
      `privatkunden/index.html`, `gewerbekunden/index.html`, `projekte/index.html`
      **und aus allen bis dahin neu entstandenen Seiten** entfernen
      (Leistungsseiten, Projektseiten, Ortsseiten, Impressum, Datenschutz)
- [ ] `robots.txt` durch `robots-live.txt` ersetzen (AP-08)

> **Ausnahme — nicht anfassen:** `admin/index.html` behält sein `noindex` dauerhaft.
> Das ist der CMS-Login und gehört nie in den Suchindex.
> `404.html` behält sein `noindex` ebenfalls (AP-10).

**Prüfung:** `grep -rn "noindex" --include="*.html" .` darf nur noch `admin/index.html`
und `404.html` liefern.

## 1b. Vorläufigen Text auf /ueber-uns/ ersetzen (AP-327)

Die Sektion „Die Person hinter dem Betrieb" trägt seit dem 15.09.2026 **sichtbaren
Platzhaltertext** — auf ausdrückliche Entscheidung des Auftraggebers, damit das Layout im
Zusammenhang beurteilt werden kann. Das weicht bewusst von Grundregel 2 ab und darf nicht
live gehen.

- [ ] Die drei bis vier Sätze in der Ich-Form von Maik Rohdich stehen im Absatz
      `.ueber-inhaber__text`
- [ ] Das Zitat ist durch den freigegebenen Wortlaut ersetzt
- [ ] An beiden Stellen ist die Klasse `ueber-inhaber__platzhalter` entfernt
- [ ] Der `[OFFEN: …]`-Kommentar über der Sektion in `ueber-uns/index.html` ist aufgelöst

**Prüfung:** `grep -n "ueber-inhaber__platzhalter" ueber-uns/index.html assets/css/ueber-uns.css`
liefert keine Treffer mehr im Markup.

## 2. Domain und Transport

- [ ] Domain `rohdich.de` auf **Vercel** aufgeschaltet, HTTPS aktiv, HSTS gesetzt
- [ ] **Vercel-Tarif Pro.** Nicht optional: Hobby ist laut Nutzungsbedingungen auf
      nicht-kommerzielle private Nutzung beschränkt, und der Auftragsverarbeitungs-
      vertrag gilt ausdrücklich nur für Pro und Enterprise — „This Addendum applies
      to Vercel's Processing of Personal Data as a Processor under the Agreement for
      Customers who are on Enterprise and Pro plans."
- [ ] Die übrigen Punkte dieses Abschnitts stammen aus der Zeit, als Cloudflare Pages
      das Ziel war (`_redirects`, `_headers`, weiter unten „AI Crawl Control"). Sie
      sind plattformspezifisch und müssen für Vercel neu bestimmt werden
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

- [ ] `data-endpoint="/api/anfrage"` am Kurzformular in `index.html` eingetragen —
      ohne das bleibt das Formular im heutigen Zustand und zeigt nur den Hinweis
- [ ] Umgebungsvariablen in Vercel gesetzt: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`,
      `SMTP_PASS`, `EMPFAENGER`, optional `SMTP_ABSENDER`. **Niemals ins Repo** — es
      ist öffentlich
- [ ] `fra1` als Ausführungsort in den Projekteinstellungen sichtbar (Standard neuer
      Projekte ist `iad1`, Washington D.C.)
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
- [ ] Cloudflare AI Crawl Control geprüft: **Search und Training nicht blockiert**
      (Cloudflare ändert zum 15.09.2026 die Standardwerte)
- [ ] Baseline-Messung in `docs/baseline.md` dokumentiert — **vor** dem Umschalten erfassen
- [ ] Testklick auf die Telefonnummer erscheint als Event
