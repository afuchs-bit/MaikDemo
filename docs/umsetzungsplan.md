# Umsetzungsplan für Claude Code — Website Maik Rohdich Garten- und Landschaftsbau
## SEO / GEO / AEO Optimierung

**Version:** 1.0 · **Stand:** 21.07.2026
**Repo:** `afuchs-bit/MaikDemo`
**Produktions-Branch:** `claude/kind-fermat-pyzy5p` (soll zu `main` umbenannt werden, siehe AP-02)
**Zieldomain:** `https://rohdich.de`

---

# TEIL A — Kontext und Regeln

## A.1 Was dieses Dokument ist

Dies ist der vollständige Arbeitsauftrag. Es ersetzt jede vorherige Absprache. Arbeite die Arbeitspakete in der angegebenen Reihenfolge ab. Jedes Arbeitspaket hat Akzeptanzkriterien — ein Paket gilt erst als fertig, wenn alle erfüllt sind.

**So gehst du vor:**

1. Verschaffe dir zuerst einen Überblick über das Repository. Lies `README.md`, `ASSETS.md`, `docs/datenstruktur.md` und `docs/cms-hinweise.md`, bevor du die erste Zeile änderst.
2. Lege dieses Dokument als `docs/umsetzungsplan.md` im Repo ab und verweise in `CLAUDE.md` darauf, damit es in jeder Session verfügbar ist.
3. Arbeite die Pakete nacheinander ab. Ein Commit pro Paket.
4. Nach jedem Paket: Akzeptanzkriterien selbst prüfen und das Ergebnis kurz protokollieren.
5. **Stoppe und frage nach**, wenn ein Paket eine Entscheidung erfordert, die nicht in diesem Dokument steht. Rate nicht.

**Was du nicht brauchst:** Es gibt kein vorheriges Gespräch, an das du anknüpfen müsstest. Alle Festlegungen, alle Begründungen und alle Verbote stehen hier.

## A.2 Aktueller Stack

- Statische HTML-Seiten, kein Framework, kein Build-Step für HTML
- CSS: eine Datei `assets/css/styles.css`, Cache-Busting per Query-String
- JS: `assets/js/` — `main.js`, `galerie.js`, `projekte.js`, `projekte-card.js`, `config.js`
- CMS: **Sveltia CMS** unter `/admin/`, GitHub-Backend, OAuth über Cloudflare Worker (`sveltia-cms-auth.a-fuchs-eff.workers.dev`)
- Inhalte: `content/projekte/*.json`, Taxonomie in `content/taxonomie.json`
- Build: GitHub Action `.github/workflows/build-index.yml` erzeugt `data/projekte-index.json` über `.github/scripts/build-index.mjs`
- Konsistenzprüfung: `.github/scripts/check-config-sync.mjs` erzwingt, dass die `leistungen`-Optionen in `admin/config.yml` und `content/taxonomie.json` identisch sind

**Wichtig:** Wer Leistungen hinzufügt, muss **beide** Dateien ändern, sonst schlägt die Action fehl.

## A.3 Grundregeln — nicht verhandelbar

1. **Erfinde niemals Fakten.** Keine Telefonnummern, keine Zertifikatsnamen, keine Reaktionszeiten, keine Preise, keine Versicherungsdaten, keine Mitarbeiterzahlen, keine Projektorte. Was nicht in Teil B steht, ist unbekannt.
2. Fehlende Fakten werden als `<!-- OFFEN: … -->` HTML-Kommentar markiert und in `docs/offene-punkte.md` gesammelt. **Nicht** als sichtbarer Platzhaltertext auf der Seite.
3. **Keine Mitarbeiterzahlen, keine Fuhrparkgrößen, kein Teamfoto** — ausdrücklicher Wunsch des Betriebsinhabers.
4. **Keine Rabatte, keine Aktionen, kein Rabatt-Newsletter** — ausdrücklich abgelehnt.
5. Keine Preise und keine Preisspannen auf der Website. Kostentreiber erklären ist erlaubt und erwünscht, konkrete Zahlen nicht.
6. Bestehende Klassen- und CSS-Struktur wiederverwenden. Kein neues Framework, kein Tailwind, keine Build-Pipeline für CSS.
7. Alle Texte auf Deutsch, Sie-Ansprache, bodenständiger Ton. Keine Superlative, keine Werbesprache.
8. Nach jedem Arbeitspaket ein eigener Commit mit `AP-XX: <Kurzbeschreibung>`.

## A.4 Tonalität

Der Betrieb positioniert sich als bodenständig, fachlich, ehrlich. Der Inhaber sagt Kunden auch, wenn etwas nicht sinnvoll ist. Formulierungen wie „Traumgarten", „Ihre grüne Oase" oder „einzigartig" sind unpassend. Stattdessen: konkret, sachlich, mit Fachbegriffen wo sie zutreffen.

Der Inhaber lehnt den Begriff „Landschaftsgestalter" ab, weil er nach Großprojekten klingt. Verwendete Bezeichnungen: **Gartenbaumeister**, **Garten- und Landschaftsbau**, **Sachverständiger für Baumkontrolle**.

---

# TEIL B — Verbindliche Stammdaten

Diese Werte sind final abgestimmt und müssen **zeichengenau identisch** an allen Stellen erscheinen: sichtbarer Text, Footer, Impressum, JSON-LD, Google-Unternehmensprofil.

| Feld | Wert |
|---|---|
| Firmenname | Maik Rohdich Garten- und Landschaftsbau |
| Inhaber | Maik Rohdich, Gartenbaumeister |
| Straße | Hülsstraße 5 |
| PLZ / Ort | 44625 Herne |
| Land | DE |
| Gegründet | 2003 (seit 01.01.2003) |
| Google-Bewertungen | 68 Bewertungen, Durchschnitt 4,9 |
| **Öffnungszeiten** | **Montag bis Freitag, 09:00–17:00 Uhr** |
| **Samstag** | **09:00–12:00 Uhr** |
| **Sonntag** | **geschlossen** |
| **WhatsApp** | **24/7 erreichbar für Nachrichten** — Antwort zu den Geschäftszeiten |
| Besuche vor Ort | **ausschließlich nach vorheriger Terminvereinbarung** |
| Einsatzgebiet | Herne (Sitz), Bochum, Castrop-Rauxel, Recklinghausen, Gelsenkirchen-Buer, weitere Orte nach Projekt |
| Besonderheiten | Ausbildungsbetrieb · Sachverständiger für Baumkontrolle (Landwirtschaftskammer-zertifizierter Baumkontrolleur, vom Auftraggeber am 05.09.2026 bestätigt) · Meisterbetrieb |
| Partnerbetrieb | Partnerfirma in Bochum (Details offen) |

## B.1 OFFEN — vom Auftraggeber nachzuliefern

Diese Werte werden in den kommenden Tagen nachgeliefert. **Sie blockieren kein Arbeitspaket.**

**Umgang damit — verbindlich:**
- Baue die Struktur, den Text und das Markup so, dass der fehlende Wert an genau einer Stelle eingesetzt werden kann.
- Setze an der Fundstelle `<!-- OFFEN: <Bezeichnung> -->`. Kein sichtbarer Platzhaltertext, keine Demo-Werte, keine erfundenen Angaben.
- Formuliere Sätze so um, dass sie auch ohne den fehlenden Fakt vollständig und richtig sind. Beispiel: statt „Reaktionszeit von X Stunden" schreibe „Im Sturmfall melden wir uns kurzfristig zurück" und markiere die Präzisierung als offen.
- Zentralisiere alle künftigen Werte in `content/stammdaten.json` (AP-03), damit das Nachtragen ein einziger Commit wird.
- Führe `docs/offene-punkte.md` mit Bezeichnung, Fundstelle(n) und betroffenem Arbeitspaket.

**Liste der offenen Werte:**

- Echte Mobilnummer (aktuell Demo: `0171 / 234 56 78`)
- Echte Festnetznummer (aktuell Demo: `02323 / 12 34 56 7`) — soll laut Absprache erhalten bleiben
- Echte WhatsApp-Nummer (aktuell Demo: `491712345678`)
- E-Mail-Adresse (aktuell `info@rohdich.de` — bestätigen)
- Geokoordinaten Hülsstraße 5, 44625 Herne
- Google Place ID
- Google-Unternehmensprofil-URL, Social-Media-Profile (für `sameAs`)
- Zertifizierungsstandard der Baumkontrolle (FLL o. a.)
- Reaktionszeit Sturmnotdienst
- Betriebshaftpflicht: Versicherer und Deckungssumme
- Zwei gewerbliche Referenzobjekte inkl. Ort und Objektart
- Vertragslaufzeiten und verbindliche Reaktionszeiten im Gewerbebereich

## B.2 Der Widerspruch, den der Text auflösen muss

Es gibt Öffnungszeiten (Mo–Fr 09:00–17:00, Sa 09:00–12:00), aber **keine Ladenöffnung**. Besuche nur nach Termin. Der Text muss beides gleichzeitig transportieren, ohne dass Kunden unangemeldet auf dem Hof stehen.

**Verbindliche Formulierung** (so oder sinngemäß, überall konsistent):

> **Erreichbarkeit:** Montag bis Freitag, 09:00–17:00 Uhr · Samstag, 09:00–12:00 Uhr
> Per WhatsApp erreichen Sie uns rund um die Uhr — wir antworten innerhalb der Geschäftszeiten.
> Besuche am Betrieb sind ausschließlich nach vorheriger Terminvereinbarung möglich.

Direkt darunter ein Button „Termin vereinbaren".

---

# TEIL C — Hosting und Deployment

## C.1 Entscheidung — final

**Das Hosting läuft über Cloudflare Pages. GitHub Pages wird abgelöst.** Diese Entscheidung ist getroffen, es gibt keine Alternativvariante mehr in diesem Plan.

Begründung, damit die Umsetzung sie kennt:
- Echte 301-Weiterleitungen über `_redirects` — auf GitHub Pages technisch nicht möglich
- HTTP-Header über `_headers`
- Kostenlos auch bei kommerzieller Nutzung
- Ein Worker kann als Formular-Endpoint dienen, Bild-Uploads landen in R2 — kein Drittanbieter, kein zusätzlicher AVV
- AI Crawl Control liefert ohne Konfiguration die Auswertung, welche KI-Crawler die Seite abrufen. Das ist der zentrale Nachweis für das GEO/AEO-Ziel und einfacher zu bekommen als eine Rohlog-Auswertung
- Cloudflare ist über den Sveltia-OAuth-Worker ohnehin schon im Stack

## C.2 Deployment-Kette

Das Repository bleibt die Quelle der Wahrheit. Sveltia CMS committet weiter in den Produktionsbranch. Cloudflare Pages baut bei jedem Push. GitHub Actions laufen unverändert weiter für Index-Build, Sitemap-Generierung und Bewertungs-Cache.

**Wichtig zur Reihenfolge:** Die GitHub Actions müssen **vor** dem Cloudflare-Build fertig sein, sonst deployt Cloudflare einen Stand ohne frisch generierte Projektseiten und Sitemap. Da die Action ihre Ergebnisse ins Repo committet, löst dieser Commit einen zweiten Cloudflare-Build aus. Das ist akzeptabel, muss aber beim Debugging bekannt sein. Alternative, falls es stört: Den gesamten Build in die Action ziehen und das fertige Ergebnis per Wrangler an Cloudflare Pages deployen, statt Cloudflare selbst bauen zu lassen.

## C.3 Cloudflare-Dateien im Repo-Root

| Datei | Zweck | Arbeitspaket |
|---|---|---|
| `_redirects` | 301-Weiterleitungen | AP-12 |
| `_headers` | Security- und Cache-Header | AP-27 |
| `robots.txt` | Crawler-Steuerung | AP-01 / AP-08 |
| `sitemap.xml` | generiert | AP-09 |
| `404.html` | Fehlerseite | AP-10 |

## C.4 Achtung: AI-Bot-Standardwerte

Cloudflare hat die Steuerung von KI-Crawlern zum 01.07.2026 in die drei Kategorien **Search**, **Agent** und **Training** aufgeteilt. Zum **15.09.2026** greifen neue Standardwerte: Für neu aufgeschaltete Domains werden Training und Agent auf Seiten mit Werbeanzeigen standardmäßig blockiert, Search bleibt erlaubt.

Diese Seite enthält keine Werbung, die Regel greift voraussichtlich nicht. Trotzdem gilt: **Nach der Domainaufschaltung im Dashboard unter AI Crawl Control manuell prüfen, dass Search und Training nicht blockiert sind.** Andernfalls wird genau der Traffic ausgesperrt, für den dieses Projekt optimiert. Ergebnis in `docs/cloudflare-setup.md` dokumentieren.

---

# TEIL D — Arbeitspakete

## Phase 1 — Blockierend vor Go-Live

---

### AP-00 · Cloudflare Pages einrichten

**Ziel:** Deployment-Umgebung steht, bevor inhaltlich gearbeitet wird.

**Umsetzung:**
1. Cloudflare-Pages-Projekt anlegen, mit dem GitHub-Repository verbinden.
2. Produktionsbranch auf `main` setzen (siehe AP-02).
3. Build-Einstellungen: kein Build-Befehl, Ausgabeverzeichnis ist das Repo-Root — die Seite ist statisch, der Index-Build läuft in GitHub Actions.
4. Preview-Deployments für andere Branches aktivieren. **Preview-URLs müssen `noindex` liefern** — als Regel in `_headers` über `X-Robots-Tag`, oder über eine Cloudflare-Access-Regel. Sonst entsteht dasselbe Duplikatsproblem wie mit der GitHub-Pages-Demo.
5. Domain `rohdich.de` noch **nicht** aufschalten. Das passiert erst beim Go-Live, gemeinsam mit AP-12.
6. `docs/cloudflare-setup.md` anlegen und alle Einstellungen dort dokumentieren.

**Akzeptanzkriterien:**
- [ ] Push auf `main` erzeugt automatisch ein Deployment
- [ ] Preview-Deployments liefern `X-Robots-Tag: noindex` (per `curl -I` nachweisbar)
- [ ] Die Zieldomain ist noch nicht umgestellt
- [ ] `docs/cloudflare-setup.md` existiert

---

### AP-01 · Demo aus dem Suchindex halten

**Problem:** Die Demo unter `afuchs-bit.github.io/MaikDemo/` ist voll indexierbar. Wenn Google sie erfasst, entsteht eine Duplikatskopie, die später mit der Zieldomain konkurriert.

**Umsetzung:**
1. In **jede** HTML-Datei direkt nach `<meta name="viewport">` einfügen:
   ```html
   <meta name="robots" content="noindex,nofollow" />
   ```
2. `robots.txt` im Root mit `User-agent: *` / `Disallow: /`
3. In `docs/go-live-checkliste.md` als erste Position eintragen, dass beides beim Umschalten entfernt wird.

**Akzeptanzkriterien:**
- [ ] Alle HTML-Dateien enthalten das noindex-Meta
- [ ] `robots.txt` existiert und sperrt alles
- [ ] `docs/go-live-checkliste.md` existiert mit diesem Punkt an Position 1

---

### AP-02 · Branch aufräumen

**Umsetzung:** Produktionsbranch von `claude/kind-fermat-pyzy5p` in `main` umbenennen. Anpassen in:
- `admin/config.yml` → `backend.branch`
- Cloudflare-Pages-Projekteinstellung (Produktionsbranch)
- Alle Workflows unter `.github/workflows/`

**Akzeptanzkriterien:**
- [ ] Branch heißt `main`
- [ ] CMS speichert nachweislich in `main`
- [ ] Actions laufen fehlerfrei durch

---

### AP-03 · Stammdaten vereinheitlichen

**Umsetzung:**
1. Zentrale Datei `content/stammdaten.json` mit allen Werten aus Teil B anlegen.
2. Alle Demo-Nummern und `(Demo)`-Kennzeichnungen aus allen HTML-Dateien entfernen.
3. Wo echte Werte fehlen: `<!-- OFFEN: echte Mobilnummer einsetzen -->` statt Platzhaltertext.
4. Alle Vorkommen von `wa.me/491712345678` durch eine Konstante ersetzen, die aus den Stammdaten kommt.

**Akzeptanzkriterien:**
- [ ] `grep -r "Demo" *.html` liefert keine Treffer mehr
- [ ] `grep -r "491712345678"` liefert keine hartkodierten Treffer
- [ ] Adresse, Firmenname und Öffnungszeiten sind in allen Dateien zeichengleich

---

### AP-04 · Öffnungszeiten korrigieren

**Verbindlich: Montag bis Freitag 09:00–17:00 Uhr. Samstag 09:00–12:00 Uhr. Sonntag geschlossen. WhatsApp 24/7.**

**Umsetzung:**

1. JSON-LD auf der Startseite ersetzen:
```json
"openingHoursSpecification": [
  {"@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "09:00", "closes": "17:00"},
  {"@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "09:00", "closes": "12:00"}
]
```

2. Den bestehenden FAQ-Eintrag „Gibt es feste Öffnungszeiten?" **inhaltlich ersetzen**:
> **Antwort:** Ja. Wir sind montags bis freitags von 09:00 bis 17:00 Uhr und samstags von 09:00 bis 12:00 Uhr erreichbar. Per WhatsApp können Sie uns rund um die Uhr schreiben — wir antworten innerhalb der Geschäftszeiten. Besuche am Betrieb sind ausschließlich nach vorheriger Terminvereinbarung möglich, auch innerhalb der Öffnungszeiten.

3. Im Kontaktbereich und im Footer die Zeiten sichtbar ergänzen, mit dem Zusatz aus Abschnitt B.2 und einem Button „Termin vereinbaren".

4. Im FAQ-Eintrag „Kann man ohne Termin zum Betrieb kommen?" die Antwort so anpassen, dass sie zu den Öffnungszeiten passt und nicht widerspricht.

**Akzeptanzkriterien:**
- [ ] Zeiten identisch in JSON-LD, Kontaktbereich, Footer und FAQ
- [ ] WhatsApp-24/7-Hinweis an allen drei sichtbaren Stellen
- [ ] Kein Text mehr, der behauptet, es gebe keine Öffnungszeiten
- [ ] Rich Results Test zeigt keine Fehler

---

### AP-05 · aggregateRating entfernen

**Problem:** Selbstausgezeichnete Bewertungen im eigenen `LocalBusiness`-Markup verstoßen gegen Googles Richtlinien für strukturierte Daten und riskieren eine manuelle Maßnahme.

**Umsetzung:** Den `aggregateRating`-Block ersatzlos aus dem JSON-LD in `index.html` streichen. Die sichtbare Darstellung der Bewertungen bleibt bestehen (siehe AP-20).

**Akzeptanzkriterien:**
- [ ] Kein `aggregateRating` und kein `Review`-Markup mehr in irgendeiner JSON-LD-Struktur
- [ ] Sichtbare Bewertungsanzeige unverändert vorhanden

---

### AP-06 · Kaputte Schema-Referenz beheben

**Problem:** `index.html` verweist im LocalBusiness-Schema auf `assets/img/hero/hero.jpg`. Diese Datei existiert nicht im Repo.

**Umsetzung:** Auf ein real existierendes Bild umstellen, als absolute URL (`https://rohdich.de/...`).

**Akzeptanzkriterien:**
- [ ] Die im Schema referenzierte Datei existiert
- [ ] Alle Schema-URLs sind absolut, nicht relativ

---

### AP-07 · Canonical und og:url auf der Startseite

**Problem:** Alle Unterseiten haben Canonical und `og:url`, die Startseite als einzige nicht.

**Umsetzung:**
```html
<link rel="canonical" href="https://rohdich.de/" />
<meta property="og:url" content="https://rohdich.de/" />
```

**Akzeptanzkriterien:**
- [ ] Jede HTML-Seite hat genau ein Canonical auf ihre eigene, absolute URL
- [ ] Jede Seite hat `og:url`, `og:title`, `og:description`, `og:image`, `og:type`

---

### AP-08 · robots.txt (Go-Live-Fassung)

Anlegen als `robots-live.txt`, beim Go-Live in `robots.txt` umbenennen:

```
User-agent: *
Allow: /

# Antwortmaschinen bewusst erlaubt — Ziel ist GEO/AEO-Sichtbarkeit
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-SearchBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Applebot-Extended
Allow: /

Sitemap: https://rohdich.de/sitemap.xml
```

**Akzeptanzkriterien:**
- [ ] Datei existiert, Sitemap-Verweis korrekt

---

### AP-09 · sitemap.xml automatisch generieren

**Umsetzung:** `.github/scripts/build-index.mjs` erweitern. Das Skript kennt bereits alle Projekt-Slugs. Es soll zusätzlich `sitemap.xml` im Root schreiben mit:
- allen statischen Seiten
- allen Leistungsseiten aus `content/taxonomie.json`
- allen Projektseiten aus `content/projekte/*.json`, `lastmod` aus dem Feld `datum`

Keine Prioritäten und keine `changefreq` — beides wird von Google ignoriert.

**Akzeptanzkriterien:**
- [ ] `sitemap.xml` wird bei jedem Push automatisch neu erzeugt
- [ ] Enthält ausschließlich indexierbare URLs (keine noindex-Seiten, keine Query-Parameter)
- [ ] Valide gegen das Sitemap-Protokoll

---

### AP-10 · 404-Seite

**Umsetzung:** `404.html` im Root mit Header, Footer, kurzer Erklärung, Links zu Startseite, Leistungsübersicht, Projekten und Kontakt. `<meta name="robots" content="noindex">` setzen.

**Akzeptanzkriterien:**
- [ ] Datei existiert und ist gestaltet wie der Rest der Seite
- [ ] Liefert HTTP 404 (bei Cloudflare Pages automatisch)

---

### AP-11 · Rechtstexte verlinken

**Umsetzung:** `/impressum/index.html` und `/datenschutz/index.html` anlegen mit Grundgerüst und dem Kommentar `<!-- OFFEN: Rechtstext vom Anbieter einsetzen -->`. Alle `href="#"` im Footer durch die echten Pfade ersetzen. Beide Seiten mit `noindex` versehen ist **nicht** nötig — Impressum darf indexiert werden und ist ein Vertrauenssignal.

**Akzeptanzkriterien:**
- [ ] Keine `href="#"` mehr im Footer irgendeiner Seite
- [ ] Beide Seiten erreichbar, mit Header und Footer

---

### AP-12 · Weiterleitungen der Altdomain

**Umsetzung:**
1. Vor dem Umschalten den indexierten URL-Bestand der alten Seite erfassen: Search Console → Seiten-Bericht, ergänzt um `site:rohdich.de`.
2. Für **jede** alte URL ein thematisch passendes neues Ziel bestimmen. Pauschale Weiterleitung aller URLs auf die Startseite wertet Google als Soft-404.
3. Bei Cloudflare Pages: `_redirects` im Root, eine Zeile je Regel:
   ```
   /alte-seite.html  /leistungen/gartengestaltung/  301
   ```
4. Ergebnis in `docs/redirect-map.md` dokumentieren.

**Akzeptanzkriterien:**
- [ ] `docs/redirect-map.md` mit vollständiger Zuordnung alt → neu
- [ ] `_redirects` enthält alle Regeln
- [ ] Stichprobe: 10 alte URLs liefern HTTP 301 auf ein passendes Ziel

---

### AP-13 · Platzhalter beseitigen

**Umsetzung:**
1. Alle 13 `[PLATZHALTER: …]`-Marker auf `/gewerbekunden/` entfernen.
2. Die CSS-Klasse `.tbd` und den zugehörigen `<style>`-Block löschen.
3. Für jeden entfernten Platzhalter: entweder echten Fakt einsetzen (falls in Teil B vorhanden) oder Satz so umformulieren, dass er ohne den fehlenden Fakt funktioniert, und `<!-- OFFEN: … -->` setzen.
4. Alle Einträge in `docs/offene-punkte.md` sammeln.

**Akzeptanzkriterien:**
- [ ] `grep -r "PLATZHALTER"` liefert keine Treffer
- [ ] `grep -r "tbd"` liefert keine Treffer
- [ ] `docs/offene-punkte.md` listet jeden fehlenden Fakt mit Fundstelle

---

### AP-14 · Formular-Backend

**Umsetzung — als Cloudflare Pages Function, kein Drittanbieter:**

1. `onsubmit="return false;"` in allen drei Formularen entfernen und durch echte Übermittlung ersetzen.
2. Endpoint als Pages Function unter `functions/api/anfrage.js` anlegen. Sie nimmt `multipart/form-data` entgegen.
3. Bilder in einen **R2-Bucket** schreiben. In der E-Mail nur zeitlich begrenzte Links versenden, keine Anhänge — das vermeidet Größenprobleme beim Mailversand.
4. Versand über einen E-Mail-Dienst mit EU-Verarbeitung und AVV. Zugangsdaten ausschließlich als Cloudflare-Secret, niemals im Repo.
5. Felder: Kundentyp (privat/gewerblich), Ort, Bereich/Leistung, Beschreibung, bevorzugter Kontaktweg, Kontaktdaten, **Bild-Upload**.
6. Spamschutz **ohne** Google reCAPTCHA: Honeypot-Feld, Zeitstempel-Prüfung (Absenden unter drei Sekunden = Bot), serverseitiges Rate Limiting über Cloudflare. Falls das nicht reicht, Cloudflare Turnstile — der ist datenschutzfreundlich und ohne Cookies nutzbar.
7. Pflicht-Checkbox mit Verweis auf die Datenschutzerklärung.
8. Erfolgs- und Fehlerzustand sichtbar behandeln, nicht nur in der Konsole. Bei Fehler die Telefonnummer und den WhatsApp-Link als Ausweichweg anbieten.
9. Dateitypen auf Bilder begrenzen, Größe je Datei begrenzen, Anzahl begrenzen.
10. **Keine inhaltliche Vorfilterung** — alle Anfragen gehen ungefiltert an den Inhaber. Einzige Ausnahme ist der Pool-Rechner (AP-24).

**Akzeptanzkriterien:**
- [ ] Testabsendung kommt als E-Mail an
- [ ] Bild-Upload funktioniert, Datei liegt in R2, Link in der Mail funktioniert
- [ ] Ohne Einwilligungshaken kein Absenden möglich
- [ ] Kein Google-Dienst im Formularpfad
- [ ] Keine Zugangsdaten im Repository
- [ ] Fehlerfall zeigt Telefonnummer und WhatsApp als Alternative

---

## Phase 2 — Struktur

---

### AP-15 · Projektseiten statisch generieren

**Das ist das wichtigste Arbeitspaket des gesamten Plans.**

**Problem:** `/projekte/` liefert im HTML null Projektinhalte. Das Grid wird per JavaScript aus `data/projekte-index.json` befüllt. Einzelprojekte existieren nur als Query-Parameter (`?projekt=slug`) in einer Lightbox. Folge: kein Projekt ist indexierbar, und Crawler von Antwortmaschinen rendern kein JavaScript — für sie ist die Seite leer.

**Umsetzung:**

1. `.github/scripts/build-index.mjs` erweitern: aus jeder Datei in `content/projekte/*.json` eine statische Seite unter `/projekte/<slug>/index.html` erzeugen.
2. Der Slug folgt der bestehenden CMS-Regel `{{fields.titel}}-{{fields.ort}}`, slugifiziert.
3. Jede Projektseite enthält:
   - `<title>`: `<Titel> in <Ort> — Maik Rohdich Garten- und Landschaftsbau`
   - Meta-Description aus dem Feld `beschreibung`, auf 155 Zeichen gekürzt
   - Canonical auf die eigene URL
   - genau ein `<h1>` mit Titel und Ort
   - Fließtext, gegliedert in Ausgangslage, Umsetzung, Ergebnis
   - alle Bilder mit dem gepflegten Alt-Text, `loading="lazy"` außer dem ersten
   - Verlinkung auf jede zugehörige Leistungsseite
   - Verlinkung auf die passende Kundengruppenseite (privat oder gewerblich)
   - Breadcrumb-JSON-LD: Startseite → Projekte → Projekt
   - `ImageObject`-JSON-LD je Bild
4. Ein HTML-Template als eigene Datei ablegen, damit Designänderungen nicht im Skript stattfinden.
5. `/projekte/` (Galerie) bekommt zusätzlich eine **im HTML vorhandene Liste** aller Projekte mit Titel, Ort, Bild und Link. Der Filter bleibt JavaScript, der Inhalt nicht. Bei aktivem JS wird die statische Liste ausgeblendet und durch das gefilterte Grid ersetzt.
6. Die alten `?projekt=`-Links auf der Startseite auf die neuen sauberen URLs umstellen.
7. Neue Projektseiten in die Sitemap aufnehmen (AP-09).

**Akzeptanzkriterien:**
- [ ] `curl` auf eine Projekt-URL zeigt vollständigen Inhalt ohne JavaScript
- [ ] `curl` auf `/projekte/` zeigt alle Projekte als HTML
- [ ] Jedes Projekt hat genau ein `<h1>`, ein Canonical und ein Breadcrumb-Schema
- [ ] Der Filter funktioniert weiterhin
- [ ] Ein neu über das CMS angelegtes Projekt erzeugt automatisch eine neue Seite

---

### AP-16 · Leistungsseiten anlegen

**Entscheidung des Auftraggebers: jede Leistung bekommt eine eigene Unterseite.**

Hinweis für die Umsetzung: Damit steigt das Risiko dünner Seiten. Jede Seite braucht deshalb zwingend die unten definierten Pflichtbestandteile. Seiten, die später wieder entfernt werden, brauchen eine 301 auf `/leistungen/`.

**URL-Schema:** `/leistungen/<slug>/`

| # | Slug | H1 | Fokus |
|---|---|---|---|
| 1 | `baumkontrolle-gutachten` | Baumkontrolle und Gutachten | Verkehrssicherungspflicht, Sachverständigenkompetenz — das Alleinstellungsmerkmal |
| 2 | `baumfaellung` | Baumfällung und Baumarbeiten | häufigster Auftragstyp |
| 3 | `gartengestaltung` | Gartengestaltung | Hauptleistung |
| 4 | `vorgarten` | Vorgartengestaltung | bevorzugte Projektgröße, 2–3 Tage |
| 5 | `teichanlage` | Teichanlagen und Wasser im Garten | Schwerpunktthema dieses Jahres |
| 6 | `gartenpflege` | Gartenpflege | wiederkehrende Aufträge |
| 7 | `aussenanlagenpflege` | Außenanlagenpflege für Gewerbe | Gewerbekunden, Bestandsgeschäft |
| 8 | `terrasse-pflasterarbeiten` | Terrassen und Pflasterarbeiten | DIN-relevant, hohe Reklamationsquote — Qualitätsargumentation wichtig |
| 9 | `bepflanzung` | Bepflanzung | |
| 10 | `dachbegruenung` | Dachbegrünung | inklusive Förderthema |
| 11 | `palmen-winterfest` | Winterfeste Palmen und Beleuchtung | läuft nach eigener Aussage sehr gut, eigene Spezialerde |
| 12 | `pool-whirlpool-umfeld` | Pool- und Whirlpool-Umfeld | inkl. Poolausschachtung und Kostenrechner (AP-24) |
| 13 | `sturmnotdienst` | Sturmnotdienst | selten beauftragt, soll aber bekannt sein |
| 14 | `holzverkauf` | Brennholz und Stammholz | Zusatzgeschäft |

Zusätzlich eine Übersichtsseite `/leistungen/` mit allen vierzehn, kurz angerissen und verlinkt.

**Pflichtbestandteile jeder Leistungsseite:**

1. `<title>` nach dem Muster `<Leistung> in Herne, Bochum & Recklinghausen | Maik Rohdich`
2. Meta-Description, 150–160 Zeichen, mit Ort und Handlungsaufforderung
3. Canonical, `og:*`, Breadcrumb-JSON-LD
4. Genau ein `<h1>`
5. **Erster Absatz beantwortet in 40–60 Wörtern vollständig, was die Leistung umfasst und für wen.** Antwortmaschinen extrahieren fast ausschließlich den ersten Absatz nach einer Überschrift.
6. Abschnitt „Für wen sich das eignet"
7. Abschnitt „Wie wir vorgehen" — Ablauf in Schritten
8. Abschnitt „Was den Aufwand bestimmt" — Kostentreiber ohne Zahlen: Fläche, Untergrund, Zugänglichkeit, Material, Entwässerung, Pflegeaufwand
9. Abschnitt „Häufige Fehleinschätzungen" — was Kunden typischerweise unterschätzen
10. Mindestens ein verlinktes Referenzprojekt aus `/projekte/`
11. Mindestens drei leistungsspezifische FAQ-Fragen mit `FAQPage`-JSON-LD
12. `Service`-JSON-LD mit `provider` als Referenz auf `https://rohdich.de/#business` und `areaServed`
13. Interne Verlinkung: zur Kundengruppenseite, zu zwei thematisch benachbarten Leistungen, zum Kontakt
14. Abschließender CTA-Block

**Taxonomie synchron halten:**
Neue Leistungen müssen in `content/taxonomie.json` **und** in `admin/config.yml` unter `collections[0].fields.leistungen.options` eingetragen werden — `check-config-sync.mjs` erzwingt Gleichheit, sonst schlägt die Action fehl.

**Akzeptanzkriterien:**
- [ ] Alle 14 Seiten plus Übersichtsseite existieren
- [ ] Jede Seite erfüllt alle 14 Pflichtbestandteile
- [ ] `taxonomie.json` und `admin/config.yml` sind synchron, Action läuft grün
- [ ] Jede Seite ist von der Startseite aus in maximal zwei Klicks erreichbar
- [ ] Keine zwei Seiten haben identische Textblöcke

---

### AP-17 · Ortsseiten

**Umsetzung:** Ortsseiten **nur** dort anlegen, wo tatsächlich Referenzprojekte existieren, die auf der Seite gezeigt werden. Textlich variierte Städteseiten ohne eigenen Inhalt sind Doorway Pages und werden abgewertet.

Realistisch zum Start: Herne (Sitz). Weitere Städte erst, wenn echte Projektfotos mit Ortsbezug vorliegen.

Struktur: `/gartenbau-<stadt>/` mit Ortsbezug im ersten Absatz, mindestens zwei lokalen Referenzprojekten, ortsspezifischen Besonderheiten und Verlinkung auf die Leistungsseiten.

**Akzeptanzkriterien:**
- [ ] Keine Ortsseite ohne mindestens zwei echte lokale Referenzprojekte
- [ ] Keine Ortsseite besteht überwiegend aus Text, der auch auf anderen Ortsseiten steht

---

### AP-18 · Navigation entwirren

**Problem:** „Projekte" (Anker zur Startseite) und „Galerie" (eigene Seite) stehen beide im Menü und meinen faktisch dasselbe.

**Umsetzung:** Auf einen Menüpunkt „Projekte" reduzieren, der auf `/projekte/` führt. Menüpunkt „Leistungen" mit Dropdown auf die 14 Leistungsseiten ergänzen. Footer entsprechend anpassen.

> **Nachtrag (26.07.2026, AP-36):** Auftraggeber-Entscheidung geändert — der Menüpunkt heißt jetzt „Galerie" (führt weiterhin auf `/projekte/`). Die obige Festlegung („Menüpunkt Projekte") ist insoweit überholt.

**Akzeptanzkriterien:**
- [ ] Kein doppelter Menüpunkt
- [ ] Alle Leistungsseiten aus Header und Footer erreichbar
- [ ] Navigation identisch auf allen Seiten

---

## Phase 3 — AEO und strukturierte Daten

---

### AP-19 · FAQ vervollständigen und Antwortformat umstellen

**Problem:** Auf der Startseite stehen 11 sichtbare Fragen, aber nur 4 im `FAQPage`-Schema.

**Umsetzung:**

1. Alle sichtbaren Fragen ins Schema aufnehmen. Sichtbarer Text und Schema-Text müssen **identisch** sein.
2. Jede Antwort so umschreiben, dass die **ersten 40–60 Wörter die Frage vollständig beantworten**. Details folgen danach.
3. Folgende Fragen ergänzen — sie decken belegte Kundenfragen ab und sind AEO-relevant:

| Frage | Kernaussage der Antwort |
|---|---|
| Wie läuft eine Anfrage bei Ihnen ab? | Anruf oder Nachricht → Terminvereinbarung → Besichtigung vor Ort → bei Gestaltungsprojekten zusätzlich Termin am Betrieb → Angebot. Als Ablaufdiagramm darstellen. |
| Was bestimmt die Kosten eines Gartenprojekts? | Fläche, Untergrund, Entwässerung, Materialwahl, Zugänglichkeit, Pflegeaufwand. Keine Zahlen. |
| Wie lange dauert die Neugestaltung eines Gartens? | Ein kompletter Garten liegt typischerweise bei rund zwei Wochen. Kleinere Arbeiten deutlich kürzer. |
| Wann darf eine Hecke geschnitten werden? | Starker Rückschnitt nur zwischen 1. Oktober und 28./29. Februar (§ 39 BNatSchG). Schonender Form- und Pflegeschnitt ganzjährig zulässig. |
| Wird Dachbegrünung gefördert? | Ja, häufig über kommunale Programme. Fördermöglichkeiten hängen vom Ort ab und werden im Beratungstermin geprüft. |
| Verlangen Sie Vorkasse? | Bei größeren Projekten ja, das wird vor Beauftragung transparent besprochen. |
| In welchen Orten arbeiten Sie? | Herne, Bochum, Castrop-Rauxel, Recklinghausen, Gelsenkirchen-Buer, bei passenden Projekten darüber hinaus. |
| Sind Sie Ausbildungsbetrieb? | Ja. |
| Kann ich Bilder vorab schicken? | Ja, per WhatsApp rund um die Uhr. |

4. Ehrliche Einordnung für den Auftraggeber, nicht für die Seite: Google zeigt FAQ-Rich-Results seit 2023 fast ausschließlich für Behörden- und Gesundheitsseiten. Der Nutzen des Markups liegt heute darin, dass Sprachmodelle strukturierte Frage-Antwort-Paare zuverlässiger extrahieren.

**Akzeptanzkriterien:**
- [ ] Jede sichtbare Frage steht im Schema und umgekehrt
- [ ] Jede Antwort beantwortet die Frage in den ersten 60 Wörtern vollständig
- [ ] Rich Results Test meldet keine Fehler
- [ ] Ablaufdiagramm ist als HTML/SVG umgesetzt, nicht als Bild ohne Textalternative

---

### AP-20 · Google-Bewertungen offiziell einbinden

**Ziel:** 4,9 Sterne aus 68 Bewertungen sichtbar auf der Website, DSGVO-konform, ohne Consent-Banner, ohne Drittanbieter-Widget, ohne Richtlinienverstoß.

**Warum dieser Weg:** Ein kostenloses offizielles Google-Widget existiert nicht mehr. Drittanbieter-Widgets laden bei jedem Seitenaufruf fremde Skripte und brauchen deshalb ein Consent-Banner. Der saubere Weg ist, die Bewertungen serverseitig abzuholen, zu cachen und selbst als HTML zu rendern — beim Seitenaufruf läuft dann keine Verbindung zu Google.

**Umsetzung:**

1. Google Cloud Projekt anlegen, **Places API** aktivieren, API-Key erzeugen, per IP oder Referrer einschränken.
2. Place ID des Betriebs über den Google Place ID Finder ermitteln, in `content/stammdaten.json` speichern.
3. API-Key als GitHub Secret `GOOGLE_PLACES_API_KEY` hinterlegen. **Niemals im Repo.**
4. Neuen Workflow `.github/workflows/google-reviews.yml` anlegen:
   - Trigger: `schedule` täglich plus `workflow_dispatch`
   - Ruft Place Details ab (Felder: `rating`, `userRatingCount`, `reviews`)
   - Schreibt das Ergebnis nach `data/google-reviews.json`
   - Committet die Datei nur bei Änderung
5. Die Bewertungssektion auf Startseite, Leistungsseiten und Kundengruppenseiten aus dieser JSON-Datei statisch rendern (im `build-index.mjs`-Lauf).
6. **Pflicht: Google-Attribution** sichtbar anbringen („Bewertungen von Google") inklusive Verlinkung auf das Unternehmensprofil.
7. **Kein** `Review`- oder `aggregateRating`-JSON-LD dazu (siehe AP-05).

**Bekannte Grenzen, im Code dokumentieren:**
- Die Places API liefert nur rund **fünf** Bewertungen — die von Google als am relevantesten eingestuften. Alle 67 lassen sich damit nicht anzeigen.
- Die Gesamtzahl und der Durchschnitt lassen sich vollständig ausgeben.
- Der tägliche Cache ist Pflicht, nicht Kür: Wird der Abruf ins Rendering gelegt, ruiniert das Ladezeit, Kosten und Datenschutz gleichzeitig.
- Google-Nutzungsbedingungen begrenzen die Zwischenspeicherung von Ortsdaten. Der tägliche Refresh hält das ein.

**Akzeptanzkriterien:**
- [ ] Workflow läuft täglich und aktualisiert `data/google-reviews.json`
- [ ] Beim Seitenaufruf geht keine einzige Anfrage an eine Google-Domain (im Netzwerk-Tab prüfbar)
- [ ] Google-Attribution sichtbar
- [ ] API-Key nicht im Repository
- [ ] Kein Bewertungs-Markup im JSON-LD

---

### AP-21 · Schema-Ausbau

**Umsetzung auf der Startseite:**

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LandscapingBusiness",
      "@id": "https://rohdich.de/#business",
      "name": "Maik Rohdich Garten- und Landschaftsbau",
      "url": "https://rohdich.de/",
      "logo": "https://rohdich.de/assets/img/logo/logo.svg",
      "image": "https://rohdich.de/assets/img/…",
      "telephone": "OFFEN",
      "email": "OFFEN",
      "foundingDate": "2003-01-01",
      "priceRange": "€€",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Hülsstraße 5",
        "postalCode": "44625",
        "addressLocality": "Herne",
        "addressCountry": "DE"
      },
      "geo": { "@type": "GeoCoordinates", "latitude": "OFFEN", "longitude": "OFFEN" },
      "areaServed": ["Herne","Bochum","Castrop-Rauxel","Recklinghausen","Gelsenkirchen-Buer"],
      "openingHoursSpecification": [
        {"@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "09:00", "closes": "17:00"},
        {"@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "09:00", "closes": "12:00"}
      ],
      "sameAs": ["OFFEN: Google-Unternehmensprofil", "OFFEN: Social-Profile"],
      "founder": { "@id": "https://rohdich.de/#maik-rohdich" },
      "knowsAbout": [
        "Gartengestaltung","Vorgartengestaltung","Teichbau","Baumkontrolle",
        "Verkehrssicherungspflicht bei Bäumen","Dachbegrünung","Pflasterarbeiten",
        "Außenanlagenpflege","winterfeste Bepflanzung"
      ]
    },
    {
      "@type": "Person",
      "@id": "https://rohdich.de/#maik-rohdich",
      "name": "Maik Rohdich",
      "jobTitle": "Gartenbaumeister",
      "worksFor": { "@id": "https://rohdich.de/#business" },
      "hasCredential": [
        { "@type": "EducationalOccupationalCredential", "credentialCategory": "Meisterbrief", "name": "Gartenbaumeister" },
        { "@type": "EducationalOccupationalCredential", "credentialCategory": "Zertifizierung", "name": "Sachverständiger für Baumkontrolle" }
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://rohdich.de/#website",
      "url": "https://rohdich.de/",
      "name": "Maik Rohdich Garten- und Landschaftsbau",
      "inLanguage": "de-DE",
      "publisher": { "@id": "https://rohdich.de/#business" }
    }
  ]
}
```

**Warum die Person-Entität wichtig ist:** Sprachmodelle verknüpfen Fakten über Entitäten. Die Kette „Maik Rohdich = Gartenbaumeister = Sachverständiger für Baumkontrolle = Herne" muss in Schema, sichtbarem Fließtext und Google-Unternehmensprofil **redundant und identisch** auftauchen. Das ist der Teil von GEO, der tatsächlich messbar wirkt.

**Akzeptanzkriterien:**
- [ ] Alle Seiten nutzen `@id`-Referenzen statt duplizierter Objekte
- [ ] Schema Markup Validator meldet keine Fehler
- [ ] Alle URLs absolut
- [ ] Kein Fakt im Schema, der nicht auch im sichtbaren Text steht

---

### AP-22 · Fachinhalte für Antwortmaschinen

Zwei Inhalte, die überdurchschnittlich häufig von Sprachmodellen zitiert werden, weil sie eine sachliche Frage vollständig beantworten:

**1. Verkehrssicherungspflicht bei Bäumen** — auf `/leistungen/baumkontrolle-gutachten/`
Wer haftet, wann eine Kontrolle nötig ist, welcher Turnus üblich ist, was ein Befund enthält, was bei Gewerbeobjekten und Hausverwaltungen zusätzlich gilt. Das ist zugleich das stärkste Verkaufsargument gegenüber Firmen.

**2. Ablauf einer Anfrage** — auf der Startseite, als Diagramm
Vom Erstgespräch bis zur Umsetzung, mit dem expliziten Hinweis auf Terminpflicht.

**Akzeptanzkriterien:**
- [ ] Beide Inhalte existieren
- [ ] Jeder beantwortet die Leitfrage im ersten Absatz vollständig
- [ ] Rechtsangaben mit Quellenangabe und Stand versehen
- [ ] Ablaufdiagramm ist textlich zugänglich, nicht nur als Grafik

---

### AP-23 · Kundengruppenseiten überarbeiten

`/privatkunden/` und `/gewerbekunden/` werden zu Hubs, die auf die Leistungsseiten verteilen, statt Inhalte zu duplizieren.

Für `/gewerbekunden/` zusätzlich: Ein Abschnitt zum Thema **Ausschreibungen und Vergabe**. Der Betrieb verliert Ausschreibungen regelmäßig an günstigere Anbieter ohne vergleichbare Qualifikation. Der Abschnitt soll Eignungsnachweise, Qualifikationen und Referenzstruktur so darstellen, dass sie in Vergabeverfahren verwendbar sind. Fehlende Angaben als `<!-- OFFEN -->` markieren.

**Akzeptanzkriterien:**
- [ ] Keine Textblöcke, die identisch auf einer Leistungsseite stehen
- [ ] Beide Seiten verlinken auf alle für sie relevanten Leistungsseiten
- [ ] Ausschreibungsabschnitt vorhanden

---

### AP-24 · Pool-Rechner

**Umsetzung:** Auf `/leistungen/pool-whirlpool-umfeld/` ein interaktives Element, das über Fläche, Ausführung und Budgetrahmen eine grobe Einordnung gibt und die Anfrage entsprechend qualifiziert.

**Zwingende Ergänzung:** Der Rechner ist JavaScript und damit für Antwortmaschinen unsichtbar. Die Kostentreiber müssen **zusätzlich als Fließtext** auf derselben Seite stehen: Aushub und Erdarbeiten, Untergrund, Zugänglichkeit für Maschinen, Technik, Entwässerung, Umfeldgestaltung, Folgepflege. Dann bedient der Rechner die Konversion und der Text die Sichtbarkeit.

**Datenschutz:** Eine Budgetangabe ist eine personenbezogene Angabe, sobald sie mit der Anfrage übermittelt wird. Sie gehört in die Datenschutzerklärung. Wenn die Berechnung rein clientseitig bleibt und nur das Ergebnis mitgesendet wird, ist das der sauberere Weg.

**Positionierung im Text:** Poolausschachtung wird aktiv angeboten. Whirlpool-Umfeld ebenfalls. Der Text darf nicht exklusiv oder abweisend wirken.

**Akzeptanzkriterien:**
- [ ] Rechner funktioniert und ist ohne Maus bedienbar
- [ ] Kostentreiber stehen zusätzlich als Fließtext auf der Seite
- [ ] Keine konkreten Preise im sichtbaren Text
- [ ] Datenschutzhinweis am Rechner

---

## Phase 4 — Performance und Technik

---

### AP-25 · Bilder

**Ist-Zustand:** `ueber-1.jpg` 880 KB, ein Projektbild 1,3 MB. Kein `srcset`. Auf Unterseiten fehlt `loading="lazy"` fast vollständig. Alle Projektbilder liegen auf einer fremden CloudFront-Domain.

**Umsetzung:**
1. Alle CloudFront-URLs durch Dateien auf der eigenen Domain ersetzen.
2. AVIF mit WebP-Fallback, `<picture>`-Element.
3. `srcset`/`sizes` mit mindestens drei Breiten (480, 960, 1600).
4. Zielgröße pro Bild unter 200 KB.
5. `loading="lazy"` für alles unterhalb des ersten Viewports.
6. Das LCP-Bild bekommt `fetchpriority="high"` und einen `<link rel="preload">` im Head. **Kein** `lazy` darauf.
7. `width` und `height` an jedem `<img>`, gegen Layout Shift.
8. Sprechende Dateinamen: `vorgarten-naturstein-herne.avif` statt `hf_20260622_061235_3c977f2c.png`.
9. Alt-Texte: beschreibend, mit Leistung und Ort, ohne Keyword-Stuffing. Rein dekorative Bilder bekommen `alt=""`.

**Akzeptanzkriterien:**
- [ ] Kein Bild über 200 KB
- [ ] Keine fremden Bilddomains mehr im HTML oder in den JSON-Dateien
- [ ] Jedes inhaltstragende Bild hat einen aussagekräftigen Alt-Text
- [ ] Lighthouse Performance mobil ≥ 90
- [ ] CLS < 0,1

---

### AP-26 · Schriften selbst hosten

**Problem:** Outfit und Inter werden vom Google-CDN geladen. Das ist renderblockierend und in Deutschland ein DSGVO-Risiko (LG München I, Az. 3 O 17493/20).

**Umsetzung:** Beide Schriften als WOFF2 lokal ablegen, `@font-face` mit `font-display: swap`, `<link rel="preload">` für die Hauptschnitte. Alle `fonts.googleapis.com`- und `fonts.gstatic.com`-Verweise entfernen, ebenso die zugehörigen `preconnect`-Tags. Lizenzlage prüfen (beide stehen unter SIL Open Font License, Self-Hosting zulässig).

**Akzeptanzkriterien:**
- [ ] Keine Anfrage an eine Google-Domain beim Seitenaufruf
- [ ] Schriftbild unverändert
- [ ] Kein Flash of Unstyled Text

---

### AP-27 · HTTP-Header und Sicherheit

Bei Cloudflare Pages über `_headers` im Root:

```
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains

/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

**Akzeptanzkriterien:**
- [ ] Header per `curl -I` nachweisbar
- [ ] HTML-Dateien werden nicht dauerhaft gecacht

---

## Phase 5 — Messung

---

### AP-28 · Messtechnik einrichten

**Umsetzung:**
1. Google Search Console für `rohdich.de` verifizieren, Sitemap einreichen.
2. Bing Webmaster Tools einrichten (speist auch ChatGPT-Suchergebnisse).
3. IndexNow einrichten — Key-Datei im Root, Ping bei neuen Projektseiten aus der GitHub Action heraus.
4. Analytics: Plausible oder Matomo, EU-gehostet, cookiefrei. **Kein Google Analytics.**
5. Conversion-Tracking als Events: Klick auf `tel:`, Klick auf `wa.me`, Formularabsendung, Klick auf E-Mail.
6. Cloudflare AI Crawl Control aktivieren und dokumentieren, welche KI-Crawler die Seite abrufen. Nach dem Onboarding prüfen, dass Search und Training **nicht** blockiert sind — Cloudflare ändert zum 15.09.2026 die Standardwerte.
7. Baseline-Messung **vor** dem Umschalten: aktuelle Rankings, Impressionen, Klicks, Anfragevolumen dokumentieren in `docs/baseline.md`.

**Akzeptanzkriterien:**
- [ ] Alle sechs Werkzeuge aktiv und liefern Daten
- [ ] `docs/baseline.md` existiert mit Messwerten vor dem Relaunch
- [ ] Testklick auf Telefonnummer erscheint als Event

---

## Phase 6 — Verzahnung Google-Unternehmensprofil

---

### AP-29 · Abgleich Website ↔ Profil

Wird vom Auftraggeber gepflegt, muss aber technisch zusammenpassen:

- **Öffnungszeiten im Profil auf Mo–Fr 09:00–17:00 und Sa 09:00–12:00 setzen, So geschlossen.** Abweichungen zwischen Website und Profil sind einer der wenigen Punkte, die Google bei lokalen Betrieben direkt negativ bewertet.
- NAP zeichengenau identisch zur Website
- Primärkategorie „Garten- und Landschaftsbau", Sekundärkategorien u. a. „Baumpflegedienst", „Gartenbauunternehmen"
- Die Leistungen im Profil spiegeln exakt die 14 Leistungsseiten
- Jeder Profil-Beitrag verlinkt auf die passende Leistungs- oder Projektseite, mit UTM-Parametern
- Profilfotos = echte Projektfotos der Website
- Attribut „Termin erforderlich" setzen, falls verfügbar

**Bewertungen einholen ohne QR-Code:** Der Inhaber lehnt QR-Codes auf Visitenkarten ab, weil damit auch unzufriedene Kunden angestoßen werden. Alternative: Bewertungslink per WhatsApp, versendet erst nach erfolgreicher Abnahme, gezielt an ausgewählte Kunden.

**Akzeptanzkriterien:**
- [ ] `docs/gbp-abgleich.md` dokumentiert jeden Wert doppelt (Website / Profil) mit Häkchen

---

# TEIL E — Reihenfolge

```
Phase 1  AP-00           Deployment-Umgebung zuerst
         AP-01 … AP-14   blockierend, vor Go-Live
Phase 2  AP-15           wichtigstes Einzelpaket
         AP-16 … AP-18
Phase 3  AP-19 … AP-24
Phase 4  AP-25 … AP-27
Phase 5  AP-28           parallel ab Tag 1
Phase 6  AP-29           beim Go-Live
```

AP-00 und AP-01 zuerst. AP-15 vor AP-16, weil die Leistungsseiten auf Projektseiten verlinken. AP-28 so früh wie möglich, sonst fehlt die Baseline.

**Teilweise blockiert durch fehlende Stammdaten (Teil B.1):**
AP-03, AP-13, AP-20 (Place ID) und AP-21 (Koordinaten, `sameAs`) lassen sich vollständig vorbereiten, aber nicht abschließen. Baue sie so, dass das Nachtragen ein einziger Commit in `content/stammdaten.json` ist. **Warte nicht auf die Werte** — arbeite weiter und markiere die Lücken.

**Nachtrag-Paket, sobald die Werte vorliegen:**
1. Werte in `content/stammdaten.json` eintragen
2. Alle `<!-- OFFEN: … -->`-Kommentare auflösen
3. `docs/offene-punkte.md` leeren
4. Umformulierte Sätze aus B.1 auf die jetzt belegbare Fassung schärfen
5. Rich Results Test und Prüfliste Teil F erneut durchlaufen

---

# TEIL F — Prüfliste vor dem Go-Live

- [ ] Alle `noindex`-Tags aus AP-01 entfernt
- [ ] `robots.txt` durch die Live-Fassung ersetzt
- [ ] Domain `rohdich.de` auf Cloudflare Pages aufgeschaltet, HTTPS aktiv, HSTS gesetzt
- [ ] Preview-Deployments liefern weiterhin `noindex`
- [ ] `_redirects` und `_headers` greifen nachweislich (`curl -I`)
- [ ] Alle Demo-Nummern und Platzhalter beseitigt (`grep`-Nachweis)
- [ ] `docs/offene-punkte.md` ist leer oder vom Auftraggeber freigegeben
- [ ] Impressum und Datenschutz mit echten Texten
- [ ] Formular getestet, E-Mail kommt an, Bild-Upload funktioniert
- [ ] Weiterleitungen aller alten URLs stichprobenartig geprüft
- [ ] Sitemap eingereicht in Search Console und Bing
- [ ] Rich Results Test auf allen Seitentypen ohne Fehler
- [ ] Lighthouse mobil: Performance ≥ 90, SEO 100, Accessibility ≥ 95
- [ ] Keine Anfrage an Google-Domains beim Seitenaufruf
- [ ] Öffnungszeiten identisch in Website, Schema und Unternehmensprofil
- [ ] Cloudflare AI Crawl Control geprüft: Search und Training nicht blockiert
- [ ] Baseline-Messung dokumentiert
- [ ] Jede Seite hat genau ein `<h1>`, ein Canonical, eine Meta-Description
- [ ] Keine verwaiste Seite: alles in maximal drei Klicks erreichbar

---

# TEIL G — Was ausdrücklich NICHT gemacht wird

- Keine Vermietungs- oder Fuhrparkseite (eigenes Unternehmen, eigene Website)
- Kein Shop, keine Versandfunktion
- Kein Rabatt-Newsletter, keine Rabattaktionen
- Kein Teamfoto, keine Mitarbeiterzahl, keine Fuhrparkgröße
- Keine Preise und keine Preisspannen
- Keine Vorfilterung von Anfragen außer dem Pool-Rechner
- Kein Google Analytics, kein reCAPTCHA, keine Google Fonts vom CDN
- Kein `aggregateRating`- oder `Review`-Markup
- Keine erfundenen Fakten, Zertifikate, Referenzen oder Reaktionszeiten

---

# TEIL H — Nachtrag aus der Repo-Prüfung (21.07.2026)

Dieser Abschnitt wurde nach Abgleich des Plans mit dem tatsächlichen Repository ergänzt.
**Bei Widersprüchen gilt Teil H vor den Teilen A–G.**

## H.1 Entscheidungen des Auftraggebers

1. **Leistungs-Slugs:** Die bestehenden Slugs aus `content/taxonomie.json` bleiben unverändert.
   Die Slug-Tabelle in AP-16 ist insoweit **überholt**. Es werden ausschließlich neue Slugs
   ergänzt, nichts umbenannt. Grund: alle vorhandenen Projektdateien referenzieren die alten
   Slugs, und `build-index.mjs` bricht bei unbekannten Slugs mit exit 1 ab.

   | Bestand (bleibt) | URL |
   |---|---|
   | `gartengestaltung`, `vorgarten`, `teichbau`, `bepflanzung`, `dachbegruenung`, `baumarbeiten`, `baumkontrolle`, `sturmnotdienst`, `holzverkauf`, `aussenanlagenpflege` | `/leistungen/<slug>/` |

   | Neu zu ergänzen | URL |
   |---|---|
   | `gartenpflege`, `terrasse-pflasterarbeiten`, `palmen-winterfest`, `pool-whirlpool-umfeld` | `/leistungen/<slug>/` |

   Labels dürfen frei angepasst werden (`check-config-sync.mjs` prüft nur Slugs hart).
   Neue Slugs müssen in `content/taxonomie.json` **und** `admin/config.yml` eingetragen werden.

2. **Hero-Hintergrundvideo:** wird bei AP-25 mit umgezogen (CloudFront → eigene Domain).
   Es soll später ausgetauscht werden, bleibt aber vorerst erhalten. Da es LCP-relevant ist,
   gilt dafür dieselbe Sorgfalt wie für das LCP-Bild.

3. **Altdomain:** Unter `rohdich.de` läuft derzeit die **alte Seite des Endkunden**. Sie wird
   abgeschaltet, sobald die neue Seite vorgestellt ist. AP-12 (Redirect-Map) ist damit
   **relevant und nicht gegenstandslos** — der indexierte URL-Bestand muss vor dem
   Abschalten erfasst werden.

## H.2 Korrekturen an den Arbeitspaketen

- **AP-04:** Das JSON-LD enthält neben `Mo–Fr 09:00–17:00` zusätzlich einen
  **Samstagsblock `09:00–12:00`**. Dieser muss ersatzlos gelöscht werden, sonst bleibt der
  Widerspruch zu „Samstag geschlossen" bestehen. Im Plan nicht erwähnt.

- **AP-03:** Die Abnahmekriterien greifen zu kurz.
  - `grep -r "Demo" *.html` erfasst nur das Wurzelverzeichnis. Korrekt:
    `grep -rn "Demo" --include="*.html" .`
  - `grep -r "491712345678"` findet **nicht** die Schreibweise mit Bindestrichen.
    In `index.html` steht `"telephone": "+49-171-2345678"` im JSON-LD. Zusätzlich prüfen:
    `grep -rn "2345678\|1234567\|0171 / 234\|02323 / 12" --include="*.html" .`

- **AP-06 / AP-21:** Der in AP-21 vorgeschlagene Schema-Block verweist auf
  `assets/img/logo/logo.svg`. Diese Datei **existiert nicht** — vorhanden ist nur
  `assets/img/logo/favicon.svg`. Vor Verwendung entweder das echte Logo ablegen oder
  das `logo`-Feld weglassen. Sonst entsteht derselbe Fehler, den AP-06 gerade behebt.

- **AP-01 / Teil F:** `admin/index.html` trägt bereits `noindex` und **muss es dauerhaft
  behalten** (CMS-Login). Die Checklistenzeile „Alle noindex-Tags aus AP-01 entfernt"
  gilt ausdrücklich **nicht** für `admin/index.html`.

- **AP-07:** `projekte/index.html` fehlt zusätzlich `og:image`. Mit erledigen.

- **AP-13:** Es sind **12** `[PLATZHALTER: …]`-Marker, nicht 13.

- **AP-25:** Neben den Bildern liegt auch ein **Hero-Video (`.mp4`)** auf CloudFront.
  Insgesamt 16 CloudFront-Verweise in HTML/JSON.

## H.3 Was Claude Code nicht selbst ausführen kann

Diese Punkte müssen vom Auftraggeber im jeweiligen Web-UI erledigt werden:

- **Alle Dateien unter `.github/workflows/**`** — der verwendete Token hat keinen
  `workflow`-Scope. Betrifft **AP-02** (Branch-Anpassung in Workflows) und **AP-20**
  (neuer `google-reviews.yml`). Änderungen an `.github/scripts/**` sind davon **nicht**
  betroffen, dort kann normal gearbeitet werden (relevant für AP-09 und AP-15).
- **AP-00** (Cloudflare-Pages-Projekt), **AP-02** (Branch-Umbenennung auf GitHub),
  **AP-28** (Search Console, Bing, Analytics, AI Crawl Control), **AP-29** (Google-Profil).

## H.4 Bestätigter Ist-Zustand (Stand 21.07.2026)

Geprüft und bestätigt: `aggregateRating` in `index.html`; `assets/img/hero/` existiert nicht;
`index.html` ohne Canonical und `og:url`; 11 sichtbare FAQ-Fragen gegen 4 im Schema;
Navigation mit doppeltem Einstieg („Projekte" als Anker, „Galerie" als Seite);
`#galleryGrid` im HTML leer und rein JS-befüllt; 3 Formulare mit `onsubmit="return false;"`;
4 Seiten mit `href="#"` für Impressum und Datenschutz; keine `robots.txt`;
12 Google-Fonts-Verweise; Bilder 1,3 MB / 880 KB / 2 × ~710 KB.

## H.5 Nachtrag: Privatkundenbereich in die Startseite überführt (30.08.2026)

**Abweichung von AP-23.** AP-23 schreibt `/privatkunden/` und `/gewerbekunden/` als zwei
parallele Hubs fest. Auf Wunsch des Auftraggebers ist die Privatkunden-Hubseite entfallen:
ihre Inhalte stehen jetzt auf der Startseite, `privatkunden/index.html` wurde gelöscht.
`/gewerbekunden/` bleibt als eigenständiger Zweig unverändert bestehen.

**Was bestehen bleibt.** Die 13 Leistungsseiten unter `/privatkunden/leistungen/*` sind
unangetastet. Nur ihr Elternteil fehlt — die Breadcrumbs führen deshalb zweistufig von der
Startseite direkt auf die Leistung, sichtbar wie im `BreadcrumbList`-Schema.

**Folgeänderungen, alle im Generator und in den erzeugten Seiten gespiegelt.**

- `WELTEN.privat` in `.github/scripts/lib/render.mjs` trägt jetzt `hubEntfaellt: true`.
  Daran hängen Breadcrumb-Kette, Breadcrumb-Schema, Untermenü-Kopf und Welt-CTA.
- Der Untermenü-Kopf „Für Privatkunden" ist ein `<span>` statt eines Links. Die Gruppe
  bleibt, weil die 13 Leistungslinks darunter weiter gültig sind.
- Der Nav- und Footer-Punkt „Privatkunden" ist ersatzlos entfallen.
- 39 Formular-Deeplinks der Leistungsseiten (`?pfad=…&leistung=…#anfrage`) zeigen auf die
  Startseite. Die Vorbelegung durch `privat-form.js` funktioniert dort unverändert.
- `assets/js/galerie.js` legt seine CTA-Ziele ebenfalls auf die Startseite.
- `/privatkunden/` ist aus `sitemap.xml` entfernt.

**Offen für Phase 2.**

- Kein Redirect möglich. Die Seite liefert ab sofort 404. Auf GitHub Pages
  („Deploy from a branch", siehe H.2) wird eine `_redirects`-Datei **nicht** ausgewertet —
  sie wäre wirkungslos. Solange die Site auf `noindex` steht, ist das folgenlos; vor dem
  Go-Live braucht es entweder den Wechsel auf Cloudflare Pages oder eine
  `privatkunden/index.html`, die per `<meta http-equiv="refresh">` und Canonical auf die
  Startseite verweist.
- Hero und Kontaktweiche haben je eine Kachel verloren und stehen einspaltig. Die
  Übergangsregeln liegen in `assets/css/merge-light.css`, nicht in `styles.css`, um einen
  `?v=`-Durchlauf über alle Seiten zu vermeiden. Sie fallen weg, sobald der kompakte
  Gewerbe-Block steht.
- Der Weg zum Formular ist deutlich länger geworden: `#anfrage` liegt rund 10.500 px unter
  dem Seitenanfang. Das verstärkt die ohnehin geplante Lazy-Load-Maßnahme.
- Eine Übersichtsseite unter `/privatkunden/leistungen/` fehlt weiterhin. Ohne sie hat das
  Verzeichnis keine Elternseite.

## H.6 Nachtrag: Deutschlandweite Aufträge auf Anfrage (31.08.2026)

**Ergänzung zu Teil B, Zeile 76.** Dort ist das Einsatzgebiet festgelegt als „Herne (Sitz),
Bochum, Castrop-Rauxel, Recklinghausen, Gelsenkirchen-Buer, weitere Orte nach Projekt".
Der Auftraggeber hat am 31.08.2026 ergänzt, dass Maik Rohdich auf Anfrage auch
deutschlandweit tätig wird. Die Angabe stammt vom Auftraggeber selbst; sie ist damit belegt
und keine Annahme.

**Wo sie steht.** Ausschließlich in der Bildunterschrift der Einsatzgebiets-Karte auf der
Startseite: „Auf Anfrage auch deutschlandweit." Das „auch" ist gesetzt, weil der Schwerpunkt
weiterhin die fünf Städte sind — ohne das Wort widerspräche der Satz der Karte, die
Nordrhein-Westfalen zeigt.

**Wo sie bewusst nicht steht.** Footer, Kontaktkarte und die FAQ-Antwort „In welchen Orten
arbeiten Sie?" bleiben unverändert bei „weitere Orte nach Projekt" beziehungsweise „auch
darüber hinaus". Beides passt zur neuen Angabe und widerspricht ihr nicht.

**`areaServed` bleibt unverändert** bei den fünf Städten — in beiden JSON-LD-Blöcken der
Startseite und in `AREA_SERVED` in `.github/scripts/lib/render.mjs`. Teil D des Plans setzt
mit der Ortsliste bewusst ein lokales Signal; „Deutschland" würde es verwässern, ohne dass
ein Nutzen dagegenstünde.

**Keine weitergehenden Zusagen.** Weder Radius noch Fristen noch Konditionen für Aufträge
außerhalb des Schwerpunkts sind bekannt. Sie dürfen nicht ergänzt werden, solange der
Auftraggeber sie nicht nennt.

## H.7 Nachtrag: Eigenständige mobile Social-Proof-Kacheln (05.09.2026)

**AP-174, ausdrücklicher Auftrag des Auftraggebers.** Die neue mobile Sektion steht vor
der bisherigen Proof-Sektion. Diese bleibt vollständig und sichtbar als Referenz erhalten;
sie ist ausdrücklich keine gestalterische Vorlage. Die neue Gestaltung verwendet nur die
Formensprache des mobilen Heros und die drei gelieferten handschriftlichen Zahlengrafiken.
Bis einschließlich 900 px werden die neuen Kacheln angezeigt, darüber nicht.

**Neue, vom Auftraggeber bestätigte Aussagen:**

- **25+ Jahre Erfahrung** bezeichnet Maiks gesamte Berufserfahrung, einschließlich der
  Zeit vor der Betriebsgründung. Das Gründungsdatum 01.01.2003 bleibt unverändert.
- **100 % Chef am Telefon und im Garten** ist der ausdrücklich gewählte Wortlaut.
  Das ausgebildete Team vor Ort wird im Begleittext ebenfalls als Ansprechpartner genannt.
- **8000 m² Gartenfläche gestaltet**, mit dem Begleittext **Für über 400 zufriedene Kunden.**

Die Kacheln beginnen ohne sichtbare Sektionsüberschrift. Ihre Texte sind eine erste
Entwurfsfassung. Das kräftige Grün des Hero-Schriftzugs (#56E607) gilt auch für die Zahlen.
Es gibt keine Zähleranimationen oder zusätzlichen Buttons. Der neue Gewerbe-/Qualifikationsblock,
der Bildübergang und der spätere Hinweis auf kleinere, einmalige, spontane und wiederkehrende
Arbeiten werden in gesonderten Schritten gestaltet.

**Überarbeitung nach mobiler Rückmeldung, ebenfalls 05.09.2026:** Runde 22-px-Ecken
mit weich gerundeter Diagonale, stärkere Blume und leicht aufgehellte Grünflächen.
Die anfängliche Mindesthöhe von 240 px entfällt. Die Karten wachsen nur mit ihrem
Inhalt; der Chef-Begleittext wurde dafür sinngemäß gekürzt. Die Dekoration wird
innerhalb der Karte begrenzt, damit sie die mobile Seitenbreite nicht erweitert.
Die Zahlen wurden nach erfolglosen ImageGen-Freistellversuchen technisch aus den
Originalen aufbereitet. Dateinachweise stehen in ASSETS.md, Prüfergebnisse in
docs/mobile-social-proof-pruefung.md.

**AP-175, neue Gestaltungsrichtung auf Wunsch des Auftraggebers, 05.09.2026:**
Die wiederholten Blumen und der grüne Flächenverlauf entfallen. Die drei Aussagen
stehen jetzt in einer gemeinsamen matten Fläche (#20211f), gegliedert durch feine
neutrale Trennlinien. Nur die äußere Form trägt einen gerundeten diagonalen Anschnitt;
ein kurzer grüner Strich betont diese Kante. Die gelieferten Handschriftgrafiken bleiben
der Blickfang. Fließtext steht für bessere Lesbarkeit wieder in 16 px. Alle Aussagen,
die Reihenfolge und die Begrenzung auf maximal 900 px bleiben erhalten.

**AP-176, freistehende Variante auf Wunsch des Auftraggebers, 05.09.2026:**
Die Kennzahlen stehen direkt auf dem Seitenhintergrund. Gemeinsame Fläche, Kontur,
Schräge und Trennlinien entfallen. Die Handschriftgrafiken erhalten 64 px Höhe;
36 px Abstand gliedern die Aussagen. Der mittlere Block ist um 20 px eingerückt,
alle Texte bleiben linksbündig. Außen stehen 24 px Abstand zur Verfügung. Die
SVG-Kontur und ihr JavaScript werden entfernt. Inhalte und mobiler Einbau bleiben gleich.

**AP-177, abgestimmte Verfeinerung nach Gestaltungsfragen, 05.09.2026:**
Ruhig, persönlich und luftig; alle drei Aussagen auf einer gemeinsamen linken Kante.
Zahlenhöhen: 25+ 44 px, 100 % 42 px, 8000 m² 36 px, jeweils unten in einer 44-px-Zeile.
Die vorhandenen transparenten Zahlengrafiken im Hero-Grün bleiben unverändert.
Bezeichnungen: Nunito 18 px, Gewicht 700, Zeilenhöhe 1,25; Kurztexte weiterhin 16 px.
Abstände und Wortlaut bleiben erhalten. Das einzelne vorhandene Blumen-Icon erscheint
einmal rechts in der ersten Zahlenzeile, 32 × 32 px, Deckkraft 55 %, dekorativ und
vertikal zentriert. Keine neuen Flächen, Rahmen, Trennlinien oder Animationen.

**AP-178, großes Logo nach Bildvorlage des Auftraggebers, 05.09.2026:**
Das kleine Blumen-Icon wird durch ein einziges großes, rechts angeschnittenes
Hero-Blumenmotiv hinter der gesamten Sektion ersetzt. Das bestehende WebP bleibt
unverändert. Die Darstellung verwendet 14 % Deckkraft, eine leichte Drehung und
weiche Masken zur Textseite sowie an den Bildenden. Eine eigene, nicht interaktive
Dekorationsebene beschneidet den Überstand; Texte stehen darüber. Zahlengrößen,
Typografie, Abstände und Inhalte bleiben unverändert. Keine Kacheln oder neuen Flächen.

**AP-179, Blume entfernen und Subtexte harmonisieren, 05.09.2026:**
Das Hintergrundmotiv und seine Darstellungsebene entfallen. Alle Kurztexte erhalten
dieselbe maximale Breite von 28ch und ausgewogene Zeilenumbrüche (`text-wrap: balance`).
Die beiden längeren Texte erscheinen so annähernd so breit wie der kurze Kundenhinweis.
Wortlaut, Schriftgröße, Kennzahlen und linke Ausrichtung bleiben unverändert.

**AP-180, maximal zweizeilige Subtexte und typografische Verfeinerung, 05.09.2026:**
Der Auftraggeber wünscht kürzere Subtexte und eine kritische gestalterische Überarbeitung.
Der Erfahrungstext lautet jetzt „Für einen Garten, der zu Ihnen und Ihrem Grundstück passt.“,
der Kontakttext „Maik und sein Fachteam sind persönlich vor Ort für Sie da.“.
Der Hinweis auf über 400 zufriedene Kunden bleibt erhalten. Bei normaler 16-px-Schrift
ergeben sich höchstens zwei Zeilen. Vergrößerte Schrift darf ohne Abschneiden mitwachsen.
Zahl und Bezeichnung stehen 8 px auseinander, zum Subtext folgen ebenfalls 8 px.
Die Textbereiche reservieren mindestens zwei Zeilen für einen gleichmäßigen Rhythmus.
Die nächste gestalterische Empfehlung ist ein echtes Projektfoto unter den Kennzahlen;
Fotos und deren Übergang sind weiterhin kein Bestandteil dieses Arbeitspakets.


## H.8 Nachtrag: Mobile Bildfolge und persönliche Einladung (05.09.2026)

**AP-181, abgestimmter Plan des Auftraggebers.** Die freistehenden Kennzahlen werden
innerhalb derselben mobilen Sektion um vier echte Gartenmotive ergänzt. Reihenfolge:
Blühender Vorgarten, Pflasterflächen und Rasen, Eingewachsener Garten, Poolgarten am Abend.
Die bestehenden AVIF-/WebP-Dateien bleiben unverändert. Fotoformat 4:3 ohne Beschnitt,
16 px Radius, gemeinsame linke Kante bei 24 px Außenabstand und maximal 640 px Breite.
Nach dem Kundenhinweis folgen 32 px Abstand; nur dessen reservierte zweite Leerzeile entfällt.

Die Bildfolge verwendet natives horizontales Scrollen mit Einrasten und dekorativen
Randduplikaten für den endlosen Wechsel. Vier antippbare Punkte liegen unten im Foto,
ohne Pfeile, Zahlenzähler, automatische Wechsel oder Vergrößerungsfunktion. Bildunterschrift
und Screenreader-Status folgen der Auswahl. Fehler beim Laden führen auf ein verfügbares
Standbild zurück; die Erweiterung startet erst nach erfolgreicher Bilddekodierung.

Darunter führt „Alle Gartenbilder ansehen →“ zur vorhandenen Galerie. Die folgenden
Texte sind auf ausdrücklichen Wunsch einschließlich Schreibweise und Zeichensetzung
wortgetreu übernommen; jeweils die erste Frage ist hervorgehoben:

- „Der Geburtstag steht an, aber für den Garten bleibt keine Zeit? Kein Anliegen ist uns zu klein – oft sind auch kurzfristige Einsätze möglich.“
- „Im Urlaub oder einfach wenig Zeit? Auf Wunsch pflegen wir Ihren Garten regelmäßig – auch während Ihrer Abwesenheit.“

Der Haupt-CTA „Gartenwunsch besprechen →“ trägt das Hero-Button-Grün #8CC63F und eine
skalierbare Vektorfläche mit kleiner gerundeter Diagonale. Sein Ziel bleibt #anfrage.
Nur dieser neue CTA nutzt den sichtbaren Formulareinstieg mit Headerabstand, weil der
bestehende globale Handler bei aktiver Kurzanfrage auf den verborgenen Assistenten zielt.
Formularmodus und vorhandene Eingaben werden dabei nicht verändert.

Die Kennzahlen, der Hero, die alte Proof-Sektion und die alte Galerie bleiben erhalten.
Sämtliche neuen Gestaltungsvorgaben gelten ausschließlich bis einschließlich 900 px.
Prüfprotokoll: docs/mobile-social-proof-pruefung.md, Abschnitt AP-181.

**Robuster Link-Fallback:** Ohne das neue Skript führt der CTA nativ zum sichtbaren
Kontaktbereich #kontakt. Sobald das Modul verfügbar ist, setzt es wie vereinbart
#anfrage und übernimmt den präzisen Sprung. Dadurch bleibt der CTA auch ohne Erweiterung nutzbar.


**AP-182, Blumenlogo am unteren Bildrand (05.09.2026):** Auf Wunsch des Auftraggebers
entfällt die sichtbare Bildbeschreibung. Die vorhandenen Alternativtexte und die für
Screenreader zugängliche Bildunterschrift bleiben für die Bedienbarkeit erhalten.
Das bestehende dreiblütige Hero-Motiv erscheint einmal in Originalfarben rechts unten,
88–104 px breit. Es überlappt den Bildrand um etwa 13–20 px und bleibt beim Wischen fest.
Links daneben steht „Zur Galerie →“, vollständig außerhalb des Fotos und bei normaler
Schrift auf derselben Mittelachse wie das Logo. Der kürzere Galerie-Link lässt beiden
Elementen auch auf kleinen Handys Platz. Der Anfrage-CTA bleibt unter den persönlichen
Texten. Neue Assets oder Änderungen an der Wischfunktion sind nicht erforderlich.


**AP-183, exakt das Blumenmotiv des Headers (05.09.2026):** Das Hero-Wasserzeichen
am Foto wird durch die originale Blütengruppe des mobilen Headers ersetzt. Ein SVG-
Sichtfenster (210 × 180) zeigt den linken Teil derselben unveränderten Datei
maik-rohdich-logo-mobile-horizontal-balanced.png. Keine neue Bildableitung, Nachzeichnung
oder Farbänderung. Die Blüten sind in beiden mobilen Header-Varianten pixelidentisch.
Die Höhe und der Überlappungsabstand folgen den Originalproportionen; Galerie-Link und
Logo bleiben bei normaler Schrift auf derselben Mittelachse.


**AP-184, gedrehte Hero-CTA-Form als Bildkontur (05.09.2026):** Die Kontur der
Hero-CTA-Gruppe wird auf Wunsch des Auftraggebers um 90 Grad nach rechts gedreht
auf die mobile Bildfolge übertragen. Die Seiten neigen sich nach oben rechts;
Ober- und Unterkante bleiben waagerecht. Die im Hero gegenüberliegenden weichen
Ecken liegen nach der Drehung oben links und unten rechts, die anderen Ecken
bleiben knapp gerundet. Für die Gartenfotos wird die Neigung auf ca. 6,1 Grad
reduziert (seitlicher Versatz 8 % der Breite im bestehenden 4:3-Format).

Ein skalierbarer SVG-Clip formt den gemeinsamen Bildrahmen. Die Fotos selbst werden
weder geschert noch gedreht; nur die seitlichen Randbereiche werden beschnitten.
Das unveränderte Header-Blumenlogo folgt der neuen unteren rechten Ecke mit 8 %
Einrückung. Der Galerie-Link bleibt außerhalb des Fotos auf der gemeinsamen linken
Kante. Keine zusätzliche Kontur, Fläche oder Animation; Hero und Bildwechsel unverändert.


**AP-185, Bildschräge weiter abflachen (05.09.2026):** Auf Wunsch des Auftraggebers
wird die Seitenneigung von ca. 6,1 auf 4,2 Grad reduziert. Der seitliche Versatz sinkt
von 8 auf 5,5 % der Bildbreite, sodass mehr vom Motiv sichtbar bleibt. Die gedrehte
Hero-Form mit ihren gegenüberliegenden weichen Ecken bleibt erhalten. Das Blumenlogo
folgt der Bildecke mit 5,5 % Einrückung. Der bereits abgenommene Hero bleibt unverändert.


**AP-186, Blumenlogo als Siegel am Gartenfoto (05.09.2026):** Die originale
Header-Blütengruppe wird auf 65–80 px Breite verkleinert und unabhängig von der
Mittelachse des Galerie-Links am unteren rechten Bildrand verankert. Etwa zwei
Drittel ihrer Höhe liegen auf dem Foto, ein Drittel ragt unten heraus. Rechts
steht das Siegel 8 px über die schräge Bildecke. Ein feiner dunkler Schlagschatten
trennt die unveränderten Originalfarben vom Motiv. Form, Ausrichtung und Datei
bleiben erhalten; die Dekoration fängt keine Berührungen ab. Der Galerie-Link
bleibt außerhalb des Fotos. Hero, Bildkontur und Bildwechsel unverändert.


**AP-187, zweiteiliger Hero-CTA neben der Einladung (05.09.2026):** Auf Wunsch
des Auftraggebers stehen unter dem Foto rechts „Zur Galerie“ und „Maik kontaktieren“
in einer gemeinsamen Form nach dem Vorbild des Hero-CTAs. Dunkle Fläche, grüne
Kontur, gegenüberliegende weiche Ecken und schräge Teilung werden übernommen.
Die Neigung beträgt für die breiteren Textbeschriftungen 13 Grad; die Schrift
bleibt waagerecht. Beide Bereiche sind eigenständige Links, oben zur bestehenden
Galerie und unten zum sichtbaren Anfrageformular. Der bisherige Galerie-Textlink
und der breite grüne Anfrage-Button entfallen zugunsten dieser Gruppe.

Die beiden persönlichen Texte bleiben wortgetreu erhalten und beginnen links
neben dem CTA. Unterhalb der Gruppe nutzt der Text wieder die verfügbare Breite,
damit auf Handys keine durchgehend schmale, lange Textspalte entsteht. Ein
schriftabhängiger Container-Breakpoint stellt die Gruppe bei stark vergrößerter
Schrift über den Text. Blumensiegel, Bilder, Kennzahlen, Hero, Desktop und alte
Bestandsbereiche bleiben erhalten. Keine Änderungen an der JavaScript-Bedienung.


**AP-188, grünen Gartenwunsch-Button unter den Bildern wiederherstellen (05.09.2026):**
Der Auftraggeber legt ab jetzt iPhone 15 Pro und iPhone 16 Pro als ausschließlichen
Gestaltungs- und Prüfrahmen fest. Verwendete Hochformat-Prüfraster: 393 × 852 und
402 × 874 CSS-Pixel. Die bestehende mobile Sichtbarkeitsgrenze bleibt erhalten;
es werden keine gerätespezifischen Ausblendungen ergänzt.

„Gartenwunsch besprechen →“ steht wieder in der ursprünglichen grünen Vektorform
aus AP-186 direkt unter der Bildfolge. Kontur, Farbe und Typografie sind übernommen;
der Button füllt die Bildbreite und hält 40 px Abstand zum Foto für das Blumensiegel.
Der zweiteilige CTA und beide Texte bleiben für den gewünschten Vergleich stehen.
Beide Anfrage-Links verwenden denselben vorhandenen Sprung zum sichtbaren Formular;
ohne Erweiterung bleibt #kontakt als natives Ziel erhalten.


**AP-192, Blumensiegel minimal nach rechts versetzen (05.09.2026):** Das
unveränderte Header-Blumenmotiv rückt auf Wunsch des Auftraggebers ausschließlich
horizontal um 4 px nach rechts. Größe, Höhe, Bildkontur, Buttonabstand und alle
übrigen Elemente bleiben unverändert. Prüfung weiterhin bei iPhone 15 Pro und
iPhone 16 Pro.


**AP-193, Gartenwunsch-Button unter die persönlichen Texte verschieben (05.09.2026):**
Der grüne CTA „Gartenwunsch besprechen →“ steht nicht mehr direkt unter der
Bildfolge, sondern nach der vollständigen Einladung unter dem Satz zu den laufenden
Pflegearbeiten. Zum Text-/CTA-Block hält er 28 px Abstand. Gestaltung, Breite und
Formularsprung bleiben unverändert; ebenso Bildfolge, Blumensiegel und zweiteiliger CTA.


**AP-194, gelber Pinselstrich als Galerie-Link (05.09.2026):** Unter dem
Blumensiegel sitzt ein eigenständiger, organisch geformter Pinselstrich im exakten
Logo-Gelb #FFED00. Eine feine dunklere Farbspur und ein zurückhaltender Schatten
geben ihm Tiefe, ohne eine neue Bilddatei zu benötigen. Die waagerechte dunkle
Beschriftung „Zur Galerie“ führt zur bestehenden Galerie. Die Blume überlappt nur
den oberen Rand des Strichs, sodass die Beschriftung frei bleibt.

Der bisherige Galerie-Link im rechten Hero-CTA entfällt, damit die Aktion nur einmal
vorkommt. „Maik kontaktieren“ bleibt dort als kompakter einzelner CTA. Die Einladung
beginnt 24 px nach dem 56 px hohen Markenbereich; der grüne Haupt-CTA bleibt unter
den Texten. Prüfung weiterhin bei iPhone 15 Pro und iPhone 16 Pro.


**AP-195, Bildsignatur auf beide unteren Ecken verteilen (05.09.2026):** Das
Blumensiegel bleibt unverändert an der unteren rechten Bildecke. Der gelbe
Galerie-Pinsel sitzt nun an der unteren linken Ecke und greift 8 px in das Foto,
sodass beide Elemente eine ruhige Gegenbewegung bilden. Seine Breite wird auf
ca. 123 px reduziert und seine leichte Drehung folgt der neuen Platzierung.

Der Markenbereich unter dem Foto wird von 56 auf 40 px verkürzt. Dadurch bleibt
der Abstand zur persönlichen Einladung trotz der höheren Galerieposition
ausgewogen. Bildkontur, Navigationspunkte, Siegel, Links und Texte bleiben
inhaltlich unverändert. Prüfung weiterhin bei iPhone 15 Pro und iPhone 16 Pro.


**AP-196, Blumensiegel oben links und Galerie-Link unten rechts (05.09.2026):**
Auf Wunsch des Auftraggebers stehen die beiden Akzente diagonal gegenüber. Das
unveränderte Blumensiegel greift oben links in die weiche diagonale Bildkontur;
der gelbe Pinsel „Zur Galerie“ liegt rechts unten und greift weiterhin 8 px in
das Foto.

Die leichte Pinseldrehung wird zur rechten Platzierung gespiegelt. Der Siegelcode
liegt nun direkt an der Bildfigur, damit seine obere Position unabhängig von der
Bildbreite stabil bleibt. Größen, Linkziel, Bildwechsel und die darunterliegende
Einladung bleiben unverändert. Prüfung weiterhin bei iPhone 15 Pro und iPhone 16 Pro.


**AP-197, Galerie-Pinsel höher und greifbarer (05.09.2026):** Der sekundäre
Galerie-CTA rückt 6 px weiter nach oben. Seine Linkfläche überlappt den Bildrahmen
damit 14 px und wächst von 122,5 × 40 px auf 126 × 44 px. Die Aktion bleibt
deutlich kleiner als der grüne Haupt-CTA, erreicht aber eine verlässliche
Berührungshöhe.

Eine feine hellgelbe Farbspur, ein weicherer Schatten und eine minimale
Textaufhellung geben dem vorhandenen Logo-Gelb mehr Tiefe. Der organische
Pinselumriss, das Linkziel und die Position unten rechts bleiben erhalten.
Blumensiegel, Bildwechsel, Texte und übrige CTAs bleiben unverändert.


**AP-198, frühere Siegel-Überlappung oben links spiegeln (05.09.2026):** Die
Überlappung des Blumensiegels übernimmt exakt das Verhältnis seiner früheren
Position unten rechts. Oben links ragt nun ein Drittel der Siegelhöhe über den
Bildrand hinaus; zwei Drittel liegen auf dem Foto.

Die Position wird proportional aus der unveränderten 210:180-Siegelgrafik
berechnet und bleibt dadurch auf beiden Zielbreiten gleich. Horizontale
Ausrichtung, Größe, Galerie-CTA, Bilder und übrige Sektion bleiben unverändert.


**AP-199, Gartenbilder wieder mit runden Ecken (05.09.2026):** Die gedrehte
Hero-CTA-Kontur wird auf Wunsch des Auftraggebers vollständig von der Bildfolge
entfernt. Alle Fotos erscheinen wieder im unveränderten 4:3-Format mit vier
gleichmäßigen Ecken von 16 px Radius.

Der nicht mehr benötigte SVG-Clip samt CSS-Hilfsregel wird entfernt. Blumensiegel
oben links, Galerie-Pinsel unten rechts, Navigationspunkte, Bildwechsel und
darunterliegende Inhalte bleiben unverändert.


**AP-200, Blumensiegel unten links und Galerie-Link mittig (05.09.2026):** Das
Blumensiegel wechselt an die untere linke Bildecke und übernimmt erneut das
frühere Verhältnis: zwei Drittel liegen auf dem Foto, ein Drittel ragt darunter
hervor. Der Galerie-Pinsel sitzt horizontal exakt mittig unter dem Bild.

Die Linkfläche beginnt an der unteren Bildkante, sodass sie die mittigen
Navigationspunkte nicht überlagert. Der Markenbereich wächst auf 48 px und hält
den folgenden Textabstand stabil. Bildform, Größen, Links und übrige Inhalte
bleiben unverändert.


**AP-201, Blumensiegel unten rechts korrigieren (05.09.2026):** Das Siegel wird
auf Wunsch des Auftraggebers von unten links nach unten rechts gespiegelt. Seine
Größe und das Verhältnis mit zwei Dritteln auf dem Foto und einem Drittel
unterhalb bleiben exakt erhalten.

Der Galerie-Pinsel bleibt horizontal mittig unter dem Bild. Abstände,
Bildwechsel, Linkziele und die übrige Sektion bleiben unverändert.


**AP-202, Blumensiegel auf die untere rechte Ecke setzen (05.09.2026):** Das
Siegel rückt horizontal weiter nach rechts und greift mit seinem SVG-Rahmen
12 px über die abgerundete Bildkante. Dadurch sitzt das sichtbare Blumenmotiv
direkt auf der Ecke.

Die vertikale Zwei-Drittel-Überlappung und die Siegelgröße bleiben unverändert.
Der mittige Galerie-Pinsel erhält durch die Verschiebung mehr Abstand. Auf beiden
Zielbreiten verbleiben 12 px bis zum Ansichtsrand.


**AP-203, Blumensiegel minimal weiter nach rechts (05.09.2026):** Das Siegel
rückt auf Wunsch des Auftraggebers um exakt 4 px weiter nach rechts. Größe,
vertikale Überlappung, Galerie-Pinsel und alle übrigen Elemente bleiben
unverändert. Auf beiden Zielbreiten verbleiben 8 px bis zum Ansichtsrand.


**AP-204, Bildfolge auf drei Motive reduzieren (05.09.2026):** Das bisherige
erste Motiv „Blühender Vorgarten“ wird aus der mobilen Bildfolge entfernt.
„Pflasterflächen und Rasen“ ist nun das sichtbare Startbild; danach folgen
„Eingewachsener Garten“ und „Poolgarten am Abend“.

Punkte, Positionsangaben und versteckte Bildunterschrift werden auf drei Bilder
aktualisiert. Der mittige Galerie-Pinsel rückt 6 px nach unten und der
Markenbereich wächst entsprechend auf 54 px. Siegel, Bildformat, Linkziel und
übrige Inhalte bleiben unverändert.


**AP-205, sekundären Kontakt-CTA entfernen (05.09.2026):** Der dunkle
„Maik kontaktieren“-CTA unterhalb der Bildfolge wird vollständig entfernt.
Mit ihm entfallen sein Aktionscontainer, die Hero-Kontur und alle ausschließlich
dafür verwendeten CSS-Regeln.

Die beiden persönlichen Texte nutzen anschließend die vollständige Inhaltsbreite.
Der mittige Galerie-Link und der grüne Haupt-CTA „Gartenwunsch besprechen“
bleiben erhalten.


**AP-206, Einladung als typografischen Dialog setzen (05.09.2026):** Die beiden
Fragen bleiben fett und linksbündig. Die jeweiligen Antwortsätze erhalten eigene
Markup-Elemente, eine maximale Breite von 32 typografischen Zeichenbreiten und
schließen rechtsbündig mit der Inhaltskante ab.

So entsteht die gewünschte Chatwirkung ausschließlich durch den wechselnden
Satz und die Einrückung. Zusätzliche Sprechblasen, Flächen oder Symbole werden
nicht eingeführt. Wortlaut, Abstände zwischen den Themen und Haupt-CTA bleiben
unverändert.


**AP-207, Antworten als offenen Dialog gestalten (05.09.2026):** Die beiden
Antworten stehen weiterhin rechts, erhalten nun aber eine sanft von transparent
zu dunklem Markengrün auslaufende Fläche. Eine feine rechte Kontur und nur rechts
gerundete Ecken formen eine offene Antwortzeile statt einer klassischen
Chatblase. Antworttext erscheint im ruhigen Akzentgrün `#B6D97A`.

Rechts neben jeder Antwort sitzt exakt die einzelne Blüte aus dem Hero als
persönliches Absenderzeichen. Die Blüten bleiben dekorativ; ein visuell
ausgeblendetes „Maiks Antwort:“ stellt die Bedeutung und Lesereihenfolge für
Screenreader her. Fragen, Wortlaut, Bilder, Galerie-Link und Haupt-CTA bleiben
unverändert.


**AP-208, erste Dialogantwort präzisieren (05.09.2026):** Die Antwort auf die
Geburtstagsfrage lautet nun „Kein Anliegen ist uns zu klein oder zu spontan.“
Die vorangestellte Formulierung „Keine Panik!“ entfällt. Gestaltung,
Screenreader-Absender und übrige Inhalte bleiben unverändert.


**AP-209, Dialogtexte sprachlich schärfen (05.09.2026):** Beide Frage-Antwort-
Paare werden grammatikalisch geglättet und nennen die konkrete Leistung klarer.
Die erste Antwort verweist auf häufig mögliche kurzfristige Einsätze, ohne eine
generelle Verfügbarkeit zu versprechen. Das zweite Paar lautet „Im Urlaub oder
einfach wenig Zeit?“ und beschreibt Maiks regelmäßige Gartenpflege während der
Abwesenheit. Gestaltung und zugängliche Absenderhinweise bleiben unverändert.


**AP-210, Anfrage-CTA mit persönlichem Maik-Stempel (05.09.2026):** Der kleine
Standardpfeil entfällt. Ein eigens gezeichneter gelber Pinselstempel sitzt in
der diagonalen rechten Ecke und trägt zweizeilig „MIT MAIK“. Damit benennt das
visuelle Element die persönliche Beratung, statt nur eine allgemeine Richtung
anzuzeigen.

Der grüne CTA wächst auf mindestens 64 px Höhe, seine Beschriftung auf bis zu
18 px bei Gewicht 800. Die bestehende asymmetrische Vektorform bleibt erhalten
und erhält einen dezenten Schatten. Der Stempel verwendet Maiks vorhandenes
Logogelb `#F2E20C`; Buttonfarbe, Linkziel und Fokusfarbe bleiben unverändert.
Bei reduzierter Bewegung entfallen sämtliche Übergänge.


**AP-211, Maik-Stempel wieder entfernen (05.09.2026):** Der gelbe „MIT
MAIK“-Stempel wird auf Wunsch des Auftraggebers vollständig aus dem CTA und
seinem zugänglichen Namen entfernt. Der Button bleibt 64 px hoch, verwendet
weiterhin die verstärkte Beschriftung bis 18 px, seine grüne asymmetrische Form
und den dezenten Schatten. Es wird kein Ersatzsymbol eingesetzt.


**AP-215, mobilen Schnellzugriff entfernen (06.09.2026):** Im Footer der
Homepage wird die Navigation „Schnellzugriff“ ausschließlich auf den
vereinbarten iPhone-Breiten von 390 bis 404 px im Hochformat ausgeblendet.
Kontaktangaben, Einsatzgebiet sowie Impressum und Datenschutz bleiben erhalten.


**AP-216, Kontaktdaten im mobilen Footer zusammenhalten (06.09.2026):** Die
Kontaktfelder stehen auf den vereinbarten iPhone-Breiten einspaltig. E-Mail-
Adresse sowie Mobil- und Festnetznummer werden als untrennbare Angaben gesetzt,
damit sie vollständig in jeweils einer Zeile erscheinen.


**AP-217, Kontaktfelder wieder als 2×2-Raster setzen (06.09.2026):** Die vier
Kontaktfelder im mobilen Footer stehen wieder in zwei Spalten und zwei Reihen.
Leicht verdichtete Innenabstände, Icons und Beschriftungen halten Telefonnummern
und E-Mail-Adresse weiterhin jeweils vollständig in einer Zeile.


**AP-218, WhatsApp durch Kontaktformular ersetzen (06.09.2026):** Im 2×2-
Kontaktraster der vereinbarten iPhone-Ansichten ersetzt „Kontakt aufnehmen“ die
WhatsApp-Kachel und führt zum vorhandenen Formularanker `#anfrage`. Ein klares
Formularsymbol kennzeichnet das Ziel. Der zusätzliche WhatsApp-Hinweis unter den
Öffnungszeiten entfällt dort ebenfalls; außerhalb dieser Ansichten bleibt die
bisherige WhatsApp-Verknüpfung erhalten.


**AP-219, Header-Telefonzeichen im mobilen Footer wiederverwenden
(06.09.2026):** Mobil- und Festnetzfeld verwenden auf den vereinbarten
iPhone-Breiten exakt das grüne Telefon-Asset des mobilen Headers. Es wird für die
kleineren Footer-Felder proportional auf 23 px skaliert; die bisherigen
Linien-SVGs bleiben außerhalb dieser Ansichten unverändert.


**AP-220, WhatsApp und Instagram separat ergänzen (06.09.2026):** Unter dem
2×2-Kontaktraster erscheint auf den vereinbarten iPhone-Breiten eine eigene
zweispaltige Social-Zeile. WhatsApp verwendet das vorhandene offizielle Symbol
und öffnet den bestätigten Chat-Link. Instagram erhält ein eigenständiges,
farbiges Kamerasymbol; mangels bestätigter Profiladresse bleibt es zunächst ein
nicht interaktiver visueller Eintrag. Der Hinweis „WhatsApp jederzeit“ ist durch
den wieder sichtbaren separaten Kanal erneut schlüssig.


**AP-221, Mail- und Formularzeichen farblich angleichen (06.09.2026):** E-Mail-
und Kontaktformularsymbol verwenden auf den vereinbarten iPhone-Breiten nun
exakt das Hero-Grün `#56E607` auf derselben dunklen Iconfläche wie die
Telefonzeichen. Formen, Ziele und das 2×2-Raster bleiben unverändert.


**AP-222, Social-Kanäle auf einzelne Icons reduzieren (06.09.2026):** WhatsApp
und Instagram stehen auf den vereinbarten iPhone-Breiten als zwei kompakte,
zentrierte Einzelicons unter dem 2×2-Kontaktraster. Sichtbare Begleittexte und
Kachelhintergründe entfallen; die zugänglichen Bezeichnungen bleiben erhalten.


**AP-223, WhatsApp-Icon an Headerform angleichen (06.09.2026):** Das einzelne
WhatsApp-Icon im mobilen Footer übernimmt die abgerundete quadratische Form des
Header-Buttons. Größe, Symbol und 44-px-Berührungsfläche bleiben unverändert.


**AP-224, Einsatzgebiet im mobilen Footer entfernen (06.09.2026):** Der Block
„Einsatzgebiet“ wird auf den vereinbarten iPhone-Breiten zusammen mit dem bereits
entfernten Schnellzugriff ausgeblendet. Kontaktbereich und rechtliche Links
rücken ohne Leerstelle nach; andere Bildschirmbreiten bleiben unverändert.


**AP-225, mobile Erreichbarkeit neben Social-Icons setzen (06.09.2026):** Die
einzelnen WhatsApp- und Instagram-Icons rücken links an den Rand. Rechts daneben
steht „Jederzeit erreichbar · Auch an Feiertagen und Wochenenden · Mustergarten
nur nach Vereinbarung“ mit grünen Mittelpunkt-Trennern. Die bisherigen
Öffnungszeiten werden auf den vereinbarten iPhone-Breiten ausgeblendet.


**AP-226, Erreichbarkeitstext typografisch vereinheitlichen (06.09.2026):**
„Jederzeit erreichbar“ und die Mittelpunkt-Trenner verwenden nun dieselbe
Schriftstärke und Farbe wie der restliche Hinweis. Engere Abstände zur Icongruppe
und die vollständige Nutzung der dritten Rasterspalte geben dem Text auf dem
iPhone 16 Pro mehr Raum bis zur rechten Footerkante.


**AP-227, grauen Schimmer der mobilen Kontaktfelder entfernen (06.09.2026):**
Die vier Kontaktfelder stehen auf den vereinbarten iPhone-Breiten ohne graue
Flächenfüllung direkt auf dem dunklen Footer. Eine sehr feine grüne Kontur erhält
ihre Form und Bedienbarkeit; Inhalte, Ziele und Raster bleiben unverändert.


**AP-228, Footer-Logo auf den Ziel-iPhones vergrößern (06.09.2026):** Maik
Rohdichs vollständiges Logo wächst auf den vereinbarten iPhone-Breiten von zuvor
maximal 195 px auf bis zu 300 px Breite. Die proportionale Skalierung und ein
angepasster oberer Abstand halten Wortmarke und Blume unverzerrt und frei.


**AP-229, Erreichbarkeit als Zweizeiler setzen (06.09.2026):** WhatsApp und
Instagram stehen links kompakt untereinander. Die dadurch breitere Textspalte
setzt den Erreichbarkeitshinweis bei normaler Schriftgröße in genau zwei
festgelegten, ausgewogenen Zeilen; bei Schriftvergrößerung darf er weiter
umbrechen, ohne abgeschnitten zu werden.

## H.9 Nachtrag: Einsatzgebiet Essen, Kontaktkarte, Erreichbarkeitszeile (23.09.2026)

Drei Festlegungen des Auftraggebers vom 23.09.2026, alle drei Abweichungen von dem,
was weiter oben steht. Teil B bleibt unverändert — es ist das Register des
Auftraggebers; hier steht, was seither gilt.

**Essen gehört zum Einsatzgebiet.** Teil B, Zeile 76 nennt fünf Orte. Der Auftraggeber
hat Essen ergänzt. Die Liste lautet damit überall: Herne, Bochum, Essen,
Castrop-Rauxel, Recklinghausen, Gelsenkirchen. Nachgezogen wurden `content/stammdaten.json`,
`AREA_SERVED` in `.github/scripts/lib/render.mjs`, sämtliche `areaServed`-Felder im
JSON-LD und die Ortszeile im Footer-Template. `check-config-sync.mjs` prüft den
Gleichstand und läuft fehlerfrei durch.

**„Auch deutschlandweit nach Absprache" steht jetzt auch auf der Kontaktkarte.**
H.6 legt unter „Wo sie bewusst nicht steht" fest, dass Footer, Kontaktkarte und die
FAQ-Antwort „In welchen Orten arbeiten Sie?" bei „weitere Orte nach Projekt" bleiben.
Für die Kontaktkarte gilt das nicht mehr: Der Auftraggeber hat den Satz dort
ausdrücklich gewünscht, im Wortlaut „Auch deutschlandweit nach Absprache". Footer und
FAQ-Antwort bleiben unverändert — H.6 gilt dort weiter.

Die Ortszeile der Kontaktkarte endet aus demselben Grund auf „Und Umgebung",
großgeschrieben mitten in der Aufzählung. Auch das ist der Wortlaut des Auftraggebers
und keine Unachtsamkeit.

**Die mobile Erreichbarkeitszeile im Footer sagt nicht mehr „Jederzeit erreichbar".**
Unter 481 px ersetzt diese Zeile die Öffnungszeiten aus `.footer-hours`. Auf der
Kontaktseite stand damit „Jederzeit erreichbar · Auch an Feiertagen und Wochenenden"
keine 400 Pixel unter „Sonntag geschlossen" — auf jeder Seite derselbe Widerspruch,
sichtbar nur auf dem Handy. Die Zeile lautet jetzt „WhatsApp jederzeit · Auch an
Feiertagen und Wochenenden · Mustergarten nur nach Vereinbarung". Das deckt sich mit
`content/stammdaten.json` (WhatsApp rund um die Uhr für Nachrichten, Antwort zu den
Geschäftszeiten), mit der Kontaktkarte und mit `.footer-hours` oberhalb 480 px.
Die Öffnungszeiten aus Teil B bleiben unangetastet.


## H.10 Nachtrag: Desktop an den Handy-Stand angleichen (29.09.2026)

**Warum.** Seit Ende August wurde fast ausschließlich für das iPhone gearbeitet, in
`@media (max-width: 480px)`-Blöcken. Von den 172 Commits zwischen `e637dac` (AP-325) und
`458a5d51` (AP-492) wirken 55 nur auf dem Handy und keiner nur auf dem Desktop. Am
Desktop fehlen dadurch unter anderem:

- auf der Startseite die Knöpfe im Hero, die KPI-Zeile und die Qualifikationen, die ganze
  Galerie-Einladung, die A–Z-Leistungsübersicht (der Desktop zeigt sechs Flip-Kacheln)
  und die Fotos im Ablauf;
- auf den 37 Leistungsseiten mit der Vorlage `leistung-v2.html` Heldenfoto, Fotoraster,
  Formular und „Passende Ergänzungen" — am Desktop bleibt dort nur Text;
- im Menü zehn Leistungen, die nur das Handy-Menü führt;
- die Knopf-Familie mit Halo und Puls.

Ein erster Anlauf am 15.09. entstand in einem isolierten Worktree und wurde nie
übernommen. Seine Nummern AP-328–338 sind seither anderweitig vergeben. Er ist überholt und
dient nur noch als Vorlage.

**Entscheidungen des Auftraggebers.** Vom 15.09., bestätigt am 29.09.:
- Der Desktop entsteht aus den Handy-Inhalten, ein DOM für alle Breiten.
- Einzige Desktop-Ausnahme ist die Hero-Unterzeile mit Ortsnennung.
- Bis 900 px gilt die Handy-Komposition, auf Tablets zentriert; ab 901 px der Desktop.
- Der Ablauf-Pin läuft ab 1024 px mit Maus.

Neu am 29.09.:
- Der tote Knopf der Leistungsseiten kommt zuerst.
- Die Arbeit kommt paketweise an, jedes Paket mit Commit nach Freigabe.
- Die Zwei-Welten-Regel steht sofort in `CLAUDE.md`.

**Nummern.** Für diesen Angleich ist der Block **AP-500 bis AP-529** reserviert. Geplant:

| AP | Paket |
|---|---|
| 500 | Toter Knopf der Leistungsseiten |
| 501 | Zwei-Welten-Regel |
| 502 | Umstellung der Startseiten-Gates von 480 auf 900 px |
| 503–510 | Startseite Sektion für Sektion |
| 511 | Knopf-Familie am Desktop |
| 512–514 | Leistungsseiten-Vorlage |
| 515 | Menü und Footer |
| 516 | Kontakt, Galerie, Über uns |
| 517 | Aufräumen |
| 529 | Sektionsüberschriften der Startseite (vorgezogen; 518–521 hat die Kontakt- und Galerie-Arbeit belegt) |

**AP-500 — toter Knopf der Leistungsseiten.** Der Hero-Knopf `a.lpv2-cta` springt auf
`#anfrage`. Das Formular liegt in `section.lpv2-home-contact`, und `leistung-mobile.css`
hat diese Sektion ab 481 px ausgeblendet. Auf Tablet und Desktop tat der Knopf deshalb
nichts, und die Seite bot keinen sichtbaren Kontaktweg außer Anrufen und WhatsApp im Kopf.

Die Sektion ist jetzt auf allen Breiten sichtbar. Sie bringt dieselben Kanäle und dasselbe
Kurzformular wie die Startseite mit; die Stylesheets dafür laden die Leistungsseiten
bereits. Galerie, Ergänzungen und die übrigen Handy-Module bleiben am Desktop vorerst
ausgeblendet — sie folgen mit AP-512–514.

Gemessen in echtem Chrome an Balkonkasten, Gartengestaltung und Außenanlagenpflege, je bei
768, 1280 und 1440 px: Der Klick landet am Formular. Bei 402 und 480 px ist die Seite
pixelgleich zum Stand vorher.

**Der Cache-Schlüssel von `leistung-mobile.css` steht nicht in einer Vorlage.** Er steht
in jeder der 37 Inhaltsdateien als `"mobileCssVersion"` unter `content/leistungen/`.
`build-leistungen.mjs` überträgt ihn in die Seiten. Wer die Datei ändert, hebt ihn in allen
37 Dateien an und baut neu. Der Build läuft nicht in CI — die erzeugten Seiten gehören in
denselben Commit.

**AP-501 — Zwei-Welten-Regel.** `CLAUDE.md` legt unter „Fallstricke" fest:
- Neue Handy-Regeln von Startseite und Leistungsseiten gehören in
  `@media (max-width: 900px)`, Desktop-Regeln in `@media (min-width: 901px)`.
- Neue 480-px-Sektionsgates entstehen nicht mehr.
- Wer bewusst nur für das Handy baut, trägt die Lücke in `docs/offene-punkte.md` ein.

Die 480er-Blöcke im Bestand stellt AP-502 um.

**AP-502 entfällt als eigenes Paket.** Geplant war, alle 480-px-Blöcke der drei nur von
der Startseite geladenen Stylesheets auf 900 px umzustellen. Die Prüfung vor dem Bau hat
gezeigt, dass diese Blöcke keine sauberen Sektionsgrenzen sind:

- `home-dark.css` mischt in ihnen Hero-Stufen (Teil einer Leiter 860 → … → 480 → 430),
  Kopf-Morph, Willkommen, die geparkte Gewerbe-Tür und Über uns.
- Die fließende Wurzelschrift (19,1 px zwischen 481 und 900 px) hätte außerdem die
  Sektionen in den geteilten Stylesheets aufgebläht, die auf Tablets noch im
  Desktop-Layout stehen.

Deshalb stellt jedes Sektionspaket nur die Weichen seiner eigenen Sektion um. Die
Wurzelschrift bleibt vorerst bei ≤ 480 px.

**AP-503 — Willkommenbereich auf allen Breiten.** Die Ursache dafür, dass der Desktop
„Willkommen bei" mit Wortmarke, Foto, Leitsatz, Eckdaten und Qualifikationen nicht zeigte,
war eine einzige Regel: Eine immer geltende `display:none`-Regel in `home-dark.css`
verbarg `.gate-welcome--iphone`, und nur der 480-px-Block schaltete ihn wieder ein. Der
Desktop behielt dafür `.mr-willkommen`. Das war seit `b4188bde` (05.09.2026) so gebaut,
zuerst nur für 390–404 px; AP-239 dehnte es auf 480 px aus.

Was sich ändert:
- **Gestaltung ohne Media Query:** Die Gestaltung des Bereichs (`home-dark.css`) und der
  Eckdaten-Signatur (`mobile-social-proof.css`) steht jetzt ohne Media Query. Ab 901 px
  ist die Wurzelschrift 16 px wie beim iPhone mit 402 px; die rem-Werte ergeben dort
  dieselben Maße.
- **Desktop ab 901 px:**
  - Kopfzeile über beide Spalten, darunter Foto links und Leitsatz rechts
  - die vier Eckdaten als Band
  - die vier Qualifikationen in einer Reihe
  - Detailfläche 40 rem, Zertifikat 22 rem
- **Tablets (481–900 px)** zeigen die Handy-Komposition als Mittelspalte von 34 rem.
- **Entfernt:**
  - `.mr-willkommen` samt Gestaltung
  - drei Absätze (`.gate-welcome-feeling/-copy/-outro`), die auch am Handy verborgen waren
- **Bildgröße:** Das `sizes` des Fotos fiel am Desktop auf 1 px zurück und ist jetzt für
  alle Breiten gesetzt.

Gemessen in Chrome:
- 402 und 480 px pixelgleich zum Stand vorher (11 von 11 Scheiben).
- Der Bereich zeigt bei 402 und 1440 px dieselben 23 Texte und Bilder in derselben
  Reihenfolge.
- Kein seitlicher Überlauf von 600 bis 1920 px.
- Die Qualifikationen öffnen sich am Desktop per Klick.

Was damit entfällt und was offen ist, steht in `docs/offene-punkte.md`.

**AP-504 — Galerie-Einladung auf allen Breiten.** Die zweite Ursache: Die Bildfolge mit
„Zur Galerie", „Keine Zeit für den Garten?" und „Gartenwunsch besprechen"
(`#social-proof`) war durch `.mobile-social-proof { display: none }` ohne Media Query
verborgen. Eingeschaltet war sie nur bis 900 px. Seit AP-215 gab es am Desktop an dieser
Stelle keine Fassung mehr, dort stand also gar nichts.

- **Gestaltung ohne Media Query:** Die Gestaltung der sektionseigenen Bausteine
  (`.mobile-proof-gallery*`, `.mobile-proof-invitation*`) steht jetzt ohne Media Query.
  Das gilt für die 900-px- wie für die 480-px-Stufe.
- **Desktop ab 901 px:**
  - die drei Fotos nebeneinander statt als Karussell
  - „Zur Galerie" mittig darunter
  - die Einladung zweispaltig
  - Willkommen und Galerie gehen ohne Trennlinie ineinander über
- **Knöpfe:**
  - `.mobile-proof-request` kommt auch in `#leistungen` und `#ablauf` vor und bleibt
    deshalb in den Handy-Blöcken.
  - Die Gestaltung beider Knöpfe dieser Sektion steht ab 481 px als auf
    `.mobile-social-proof` begrenzte Kopie in `cta-family-home.css`.
  - Vorläufig: AP-511 führt die Knopf-Familie zusammen und löst die Kopie auf.
- **Tablet-Fassung entfernt:** Kennzahlenliste, `--default`-Texte und alter Galeriepfeil.
  Details stehen in `docs/offene-punkte.md`.
- **Skript:** `mobile-social-proof-gallery.js` macht beim Wechsel über 900 px alle drei
  Bilder für Screenreader lesbar.

Gemessen in Chrome:
- 402 und 480 px pixelgleich zum Stand vor AP-503 (11 von 11 Scheiben).
- Die berechneten Stile aller 23 Knopf-Elemente sind am Handy und bei 768 und 1440 px
  gleich. Einzige Ausnahme: die Beschriftung von „Gartenwunsch besprechen" misst am Handy
  bei 402 px 15,7 statt 16 px (fließende Schrift mit Obergrenze 1 rem).
- „Gartenwunsch besprechen" springt am Desktop zum Formular.
- Drehen 820 → 1180 → 820 px ohne sichtbare Klone und ohne versteckte Bilder in der
  festen Reihe.
- Kein seitlicher Überlauf von 481 bis 1920 px.

**AP-507 — Leistungsübersicht A–Z auf allen Breiten.** Der Desktop zeigte bis dahin sechs
Wendekarten mit KI-Zeichnungen, eine Notfallkarte und zwei Wegekacheln. Die A–Z-Liste mit
Buchstabengrafiken und Fotos gab es nur am Handy: Ihre gesamte Gestaltung stand in einem
480-px-Block von `privat-form.css`, und eine Grundregel blendete sie sonst aus.

- **Anheben:** Die Media-Klammer dieses Blocks ist entfernt, die Regeln stehen an derselben
  Stelle. Am Handy ändert sich deshalb nichts.
- **Begrenzte Tablet- und Desktop-Maße:** Die Zeilen-Klassen nutzen auch die „Passenden
  Ergänzungen" der 37 Leistungsseiten (dort ab 481 px ausgeblendet). Alle neuen Maße
  tragen deshalb `.private-request-paths`.
- **Tablets (481–900 px)** zeigen die Handy-Liste als Mittelspalte von 34 rem.
- **Desktop ab 901 px:**
  - zwei Spalten, von oben nach unten gelesen wie ein Register (A–O links, P–Z rechts).
    Umgesetzt als Raster (`grid-auto-flow: row dense`): Die Zeile mit
    `iphone-service-row--column-break` und alle folgenden stehen rechts. Ein
    Mehrspaltensatz mit `break-before: column` war der erste Entwurf; Firefox kennt
    diesen Umbruch nicht und hätte frei ausgeglichen.
  - Notdienst-Kachel mittig darüber, „Zum Kontaktformular" mittig darunter
  - Hover mit derselben Rückmeldung wie das Tippen am Handy
- **Knopf:** Die begrenzte Knopf-Kopie aus AP-504 (`cta-family-home.css`) gilt jetzt auch
  für `#leistungen`.
- **Cache:** Der Schlüssel von `privat-form.css` ist in `index.html` und in der Vorlage
  `leistung-v2.html` angehoben. Die 37 Leistungsseiten sind neu gebaut und ändern sich
  jeweils nur in dieser Zeile.
- **Entfallen:** Was wegfällt, steht in `docs/offene-punkte.md`.

Gemessen in Chrome:
- 360, 390, 402, 430 und 480 px pixelgleich zum Stand vorher (26 von 26 Scheiben).
- Der Vergleich aller berechneten Stile von `#leistungen` bei 402 px ergibt null
  Abweichungen; nur die entfernten, dort ohnehin ausgeblendeten Blöcke fehlen.
- Ebenfalls null Abweichungen: die Ergänzungsliste einer Leistungsseite bei 402 px und die
  Galerie-Einladung bei 402, 768 und 1440 px.
- 901 bis 1920 px: zwei Spalten, keine geteilte Zeile, Kachel und Knopf mittig, kein
  seitlicher Überlauf.
- „Zum Kontaktformular" springt am Desktop zum Formular.

**Messaufbau, zwei Fallen:**
- **Warteschlange des Testservers:** `python3 -m http.server` nimmt nur 5 wartende
  Verbindungen an. Bei den über 50 Bildern der Liste verwarf er Anfragen, und das
  Galerie-Karussell fiel in der Messung auf Standbild. Abhilfe:
  `.claude/preview/stabiler-server.py`.
- **Hintergrund-Tabs:** Sie drosseln `requestAnimationFrame`. Der Sprung aus
  `privat-form.js`, der zwei Frames abwartet, schien deshalb zu fehlen. Das Prüfskript holt
  den Tab jetzt nach vorn.

**AP-509 — Google-Bewertungen als Karussell auf allen Breiten.** Am Handy baute
`mobile-private-review.js` die Bewertungen zu einem Wisch-Karussell um, aber nur bei höchstens
480 px im Hochformat. Darüber lief `private-proof.js` mit der weißen Zweier-Karte samt
Zusammenfassungskarte.

- **Skript:**
  - Die Weiche ist entfallen, das Karussell entsteht auf jeder Breite.
  - Die Folien-Positionen werden relativ zur ersten Folie gerechnet. Das rohe `offsetLeft`
    enthielt bei zentrierter Karte deren Einzug.
  - Schnelle Klicks werden gemerkt statt verworfen. Läuft die Animation an der
    Umbruchstelle (4 → 1 oder 1 → 4) noch auf eine Klon-Folie zu, setzt ein weiterer Klick
    sie erst um eine Runde auf die gleich aussehende echte Folie um. Sonst lief ein
    doppeltes „Weiter" von Bewertung 4 sichtbar rückwärts über 3 auf 2. Bei drei und mehr
    sehr schnellen Klicks, solange die Animation noch vor der letzten echten Folie steht,
    wird der Klick verworfen statt die Ansicht springen zu lassen.
  - Bei reduzierter Bewegung scrollt das Skript mit `behavior: 'auto'` statt `'instant'`,
    das ältere Safari-Versionen nicht kennen.
  - Ab 901 px kommen Pfeile dazu, weil sich mit der Maus nicht wischen lässt. Darunter bleibt
    das DOM wie am Handy.
  - `private-proof.js` ist gelöscht.
- **`privat-form.css`:**
  - Der Swipe-Block ist ohne Media Query angehoben.
  - Die Karussell-Zeilen des 520-px-Blocks, die das Handy-Aussehen mittragen, gelten jetzt auf
    allen Breiten.
  - Die Flächen und Abstände aus den gemeinsamen 480er-Blöcken gelten ab 481 px begrenzt auf
    `.private-proof-bento`.
  - Tablets zeigen eine Mittelspalte von 34 rem, der Desktop die Karte mittig mit höchstens
    40 rem.
  - Ohne JavaScript zeigt jede Bewertung den Google-Link.
- **Entfallen:** die Zusammenfassungskarte, siehe `docs/offene-punkte.md`.

Gemessen in Chrome:
- Der Vergleich aller berechneten Stile der Sektion bei 360, 402 und 480 px ergibt null
  Abweichungen.
- **Pixelvergleich:** 390, 402 und 430 px identisch. Bei 360 und 480 px wich einer von zwei
  Läufen auf verzögert ladenden Bildern ab; der Wiederholungslauf war identisch.
- **Pfeile:** keine bei 402 und 768 px, zwei ab 901 px.
- **Bedienung:** Viermal „Weiter" ergibt 2 → 3 → 4 → 1, „Zurück" von 1 springt auf 4, ein
  Doppelklick überspringt nichts, Enter auf dem Pfeil wirkt. Das gilt mit und ohne Bewegung.
- **Breitenwechsel:** Beim Wechsel 402 → 768 → 1440 → 402 px in einer Sitzung bleiben die
  aktive Bewertung und die Scrollposition erhalten.
- **Ohne JavaScript:** vier Bewertungen mit Link.
- `private-proof.js` wird nicht mehr angefragt, keine Konsolenfehler.

**AP-529 — Sektionsüberschriften der Startseite ab 481 px (30.09.2026).** Die sechs
Überschriften (Über uns, Leistungen, Ablauf, Bewertungen, Kontakt, Häufige Fragen) standen
nur bis 480 px in der freigegebenen Variante G (Baloo 2, mittig, AP-348/349). Darüber blieben
sie in Nunito und teils linksbündig. Die Nummer ist vorgezogen, weil die Kontakt- und
Galerie-Arbeit AP-518–521 parallel belegt hat.

- **Wo:** am Ende von `home-dark.css`. Diese Datei lädt nur die Startseite, deshalb ist
  kein Neubau der Leistungsseiten nötig. Die Handy-Regel in `privat-form.css` bleibt, weil
  die Leistungsseiten sie mitladen. Die Deklarationen sind 1:1 kopiert; bei Änderungen an
  Variante G beide Stellen nachziehen.
- **481–900 px:** 31 px wie am Handy.
- **Ab 901 px:** `clamp(2.25rem, 1.25rem + 2vw, 3rem)`, also 38 px bei 901 und 48 px ab etwa
  1400 px (vorher 49 px). Die Breite ist auf höchstens 20 em begrenzt; für die
  Leistungen-Überschrift braucht das eine eigene Zeile, weil `privat-form.css` sie per ID
  auf 100 % setzt.
- **Kontakt:** Der 760 px breite Kopf ist mittig.
- **FAQ:** Der Kopf ist einspaltig (vorher ab 821 px zweispaltig).
- **Ausnahme Ablauf bis AP-508:** Ab 901 px ist der Ablauf-Kopf zweispaltig (Überschrift mit
  grüner Linie links, Knopf rechts), ab 1024 px mit Maus zusätzlich im Scroll-Pin. Die
  Überschrift übernimmt dort nur die Schrift und bleibt links. Im Pin gelten Größe,
  Zeilenhöhe und Breite des Pins weiter. Geplant war die Grenze bei 1024 px; die Messung
  zeigte, dass der Kopf schon ab 901 px zweispaltig ist. Bis 900 px ist sie mittig; die
  grüne Linie entfällt dort, wie am Handy bis 767 px schon bisher.

Gemessen in Chrome gegen den Stand AP-509:
- Der Vergleich aller berechneten Stile in `main` (1151 sichtbare Elemente) ergibt bei 360,
  402 und 480 px null Abweichungen.
- Von 481 bis 1920 px sind alle Überschriften in Baloo; alle außer dem Ablauf ab 901 px
  stehen mittig. Kein seitlicher Überlauf.
- **Ablauf-Pin** bei 1024 × 768, 1280 × 800 und 1440 × 900: Verschiebung, Spurbreite,
  Scrollerhöhe, Marker und Kartenende sind identisch zur Referenz. Die Überschrift im Pin hat
  dieselbe Größe (32 bzw. 40 px), dieselbe Höhe und dieselbe Kopfhöhe. Die Prüfmeldung
  „Bühne steht: FEHLER" bei 1280 und 1440 px (Szene am Ende 4–5 px verrutscht) tritt in der
  Referenz genauso auf.

**Gegenprüfung AP-507, AP-509, AP-529 (30.09.2026).** Zwei unabhängige Prüfer:
- **Code, ohne Browser:** keine blockierenden Fehler. Die angehobenen Blöcke sind reine
  Klammer-Entfernungen (`git diff -w`), die Cache-Schlüssel stimmen in jedem Zwischenstand.
- **Test in Chrome:** neun Prüfungen bestanden. Dazu gehören kein Überlauf von 481 bis
  1920 px, 37 erreichbare Leistungsseiten, gleiche Liste bei 402 und 1440 px, Fokusrahmen an
  allen 40 Tabstopps und das Karussell mit und ohne Bewegung. Ohne JavaScript sind vier
  Bewertungen mit Google-Link sichtbar. Die Leistungsseite zeigt bei 402 und 1440 px null
  Abweichungen.

Drei Funde sind nachgemessen und behoben: der Spaltenumbruch in Firefox (Raster statt
Mehrspaltensatz), der Rückwärtslauf des Karussells an der Umbruchstelle und die Breite der
Leistungen-Überschrift. Die übrigen Hinweise stehen in `docs/offene-punkte.md`.

**AP-516 — Kontaktseite am Desktop geordnet (30.09.2026).** Die Handy-Fassung (bis 600 px,
AP-413 bis AP-449) war fertig, der Desktop wirkte ungeordnet. Die Gestaltung war nicht das
Problem, die Anordnung schon:
- Effektiv gab es drei Spalten: Kacheln, Adresse mit Route, Karte. Der Standort brachte ein
  eigenes Raster mit.
- Der Standort-Kopf stand nur über der rechten Hälfte.
- Bei 1440 px begannen die Kacheln 80 px über der Karte und endeten 160 px vor ihr.
- Adresse und Route schwebten senkrecht mittig neben der Karte.
- Der Besuchshinweis hing verwaist darunter.
- Zwischen 601 und 1050 px nahmen die Kacheln nur die halbe Breite ein.

Entscheidungen des Auftraggebers:
1. **Ab 901 px zwei bündige Spalten.** Links stehen die fünf Kontaktwege untereinander,
   rechts die Standort-Kachel. In der Kachel steht die Karte oben, darunter links Adresse
   und Route, rechts der Besuchshinweis. Die fünf Kacheln teilen sich die Höhe der
   Standort-Kachel.
2. **Der Standort trägt auch am Rechner die Gestaltung der Handy-Fassung.** Die alten
   Desktop-Regeln (Adress- und Routenkachel, heller Kartenplatzhalter, Trennlinie) sind
   entfallen.
3. **Die Bereichstitel kommen aus der Handy-Fassung.** Über den Kacheln steht keiner, denn
   „Direkt erreichbar“ bleibt nach AP-413 entfallen. Über dem Standort stehen die graue
   Beizeile und die grüne Überschrift. Der Kopf steht über der rechten Spalte, die Kacheln
   beginnen auf der Oberkante der Standort-Kachel.
4. **601–900 px zeigt die Handy-Komposition**, mittig auf 34rem.

Technik in `kontakt.css`:
- Das Aussehen der Handy-Fassung steht in der Grundebene.
- Die Handy-Anordnung steht in `@media (max-width: 900px)`, vorher 600 px.
- Die Desktop-Geometrie steht in `@media (min-width: 901px)`.
- Der Standort-Block spannt über beide Rasterzeilen des Hubs und reicht sie per `subgrid`
  an Kopf und Kachel weiter. Nur so lässt sich die Oberkante der Kacheln an die der
  Standort-Kachel binden.

Die Mobil-Nummer steht am Rechner in den 1.22rem, die AP-429 vorgesehen hatte. Auf dem
Handy griffen sie nie, weil die Spezifität dagegen stand.

Gemessen:
- Bis 600 px (320, 360, 375, 402, 430, 480, 600) ist die Seite pixelgleich zum Stand
  9e9f1400. Auch die berechneten Stile weichen nur an ausgeblendeten oder wirkungslosen
  Stellen ab, keine einzige Position oder Größe.
- Bei 901, 1024, 1280, 1440 und 1920 px sind Ober- und Unterkante beider Spalten auf 0 px
  gleich.
- Kein waagerechter Überlauf, Nummern und E-Mail ohne Umbruch.
- Die Kacheln sind 76 bis 82 px hoch.
- „Karte laden“ füllt die Fläche.

**AP-518 — Seitentitel der Kontaktseite am Desktop über den Kacheln (30.09.2026).**
Ergänzt Entscheidung 3 aus AP-516 auf Ansage des Auftraggebers. Ab 901 px steht
der Seitentitel (seit AP-519 „Unser Kontakt“) nicht mehr mittig über der ganzen Seite, sondern zentriert über
den Kacheln. Er steht in derselben Zeile und auf derselben Grundlinie wie „Unser Standort
in Herne“, beide Spalten haben damit einen Kopf.

Technik: Titel und Raster sind im Markup Geschwister. Ab 901 px wird deshalb der Container
selbst zum Raster, und `.contact-hub` bekommt `display: contents`. Die Zeilen sind dann:
Krümelpfad, die beiden Köpfe, Kacheln und Standort-Kachel. Das Markup bleibt unverändert.

Gemessen:
- Bei 901, 960, 1024, 1280, 1440 und 1920 px ist die Unterkante des Seitentitels gleich der
  Unterkante der Standort-Überschrift (0 px).
- Der Titel bleibt auch bei 901 px einzeilig.
- Kacheln und Standort-Kachel sind weiter oben und unten bündig.
- Bis 900 px (320, 402, 480, 600, 768, 900) ist die Seite pixelgleich.

**AP-519 — Seitentitel „Unser Kontakt“ (30.09.2026).** Auf Ansage des Auftraggebers heißt die
H1 der Kontaktseite jetzt „Unser Kontakt“ statt „Kontakt zu Maik Rohdich“, auf allen
Breiten. Das ist die einzige Änderung an der sonst finalen Handy-Fassung. Unverändert
bleiben die unsichtbaren Stellen, die die Seite für Suchmaschinen beschreiben: `<title>`,
Meta-Beschreibung und der JSON-LD-Name der ContactPage. Sie tragen den Betriebsnamen, den der
kurze Titel nicht mehr nennt.

**AP-520 — Besuchshinweis am Desktop senkrecht mittig (30.09.2026).** Auf Ansage des
Auftraggebers steht der Besuchshinweis mit dem roten Strich in der Standort-Kachel ab 901 px
genau mittig zwischen der Unterkante der Karte und der Unterkante der Kachel. Bis dahin saß
er unten bündig mit „Route planen“.

Technik: `align-self: center` allein zentriert nur in der Rasterzeile. Die endet am unteren
Polster (18 px) und am Rahmen (1 px) der Kachel. Ein unterer Rand von −19 px gleicht das aus.

Gemessen bei 901, 1024, 1280, 1440 und 1920 px:
- Die Mitte des Hinweises weicht höchstens 0,01 px von der Mitte des Zwischenraums ab.
- Kacheln und Standort-Kachel sind weiter bündig.
- Bis 900 px ist die Seite pixelgleich.

**AP-521 — Galerie-Seite am Desktop geordnet (30.09.2026).** Befund bei 1440 px:
- Der Titel stand mittig in einer 712 px breiten linken Rasterspalte (x 200–455), der
  Umschalter rechts daneben. Beides fluchtete mit nichts.
- In der Bildergalerie (29 Fotos, 4 Spalten) stand das letzte Foto allein links. Bei
  901–1050 px, mit 3 Spalten, blieben 2 Fotos übrig.
- Bei „Projekte mit Details“ (5 Kacheln, 3 Spalten) klaffte rechts in der zweiten Reihe
  eine Lücke.

Entscheidungen des Auftraggebers:
1. **Kopf mittig untereinander wie auf dem Handy.** Der Titel steht auf der Seitenmitte,
   darunter mittig der Umschalter in 540 px, derselbe Wert wie bis 900 px. Der Krümelpfad
   bleibt links.
2. **Bildergalerie:** Die unvollständige letzte Reihe steht mittig. Das gilt für jede
   Bildanzahl.
3. **Projekte mit Details:** ebenso.
4. **Bis 900 px unverändert.**

Technik in `projekte.css` (nur ab 901 px):
- Der Container ist einspaltig. Den Abstand trägt weiter `row-gap`.
- Beide Raster werden zu einem Flex-Umbruch mit `justify-content: center`. Jede Kachel
  bekommt die Spaltenbreite des bisherigen Rasters.
- Die Selektoren tragen `:not([hidden])`, sonst hebelte `display: flex` die
  Ausblendung der jeweils anderen Ansicht aus (`styles.css:2848`).
- Der Knopf „Passendes Projekt gesehen? Jetzt anfragen“ bleibt unverändert. Die
  Knopf-Familie am Desktop ist AP-511.

Gemessen bei 901, 1024, 1050, 1051, 1280, 1440 und 1920 px, jeweils in beiden Ansichten:
- Titel, Umschalter und letzte Reihe stehen auf 0 px genau auf der Containermitte.
- Die Kachelbreiten der vollen Reihen sind unverändert (±0,02 px).
- Immer ist nur eine Ansicht sichtbar, es gibt keinen Überlauf.
- Lightbox und Umschalter funktionieren.
- Bis 900 px (320, 402, 600, 768, 900) ist die Seite in beiden Ansichten pixelgleich.

**AP-522 — Über-uns-Seite am Desktop geordnet (30.09.2026).** Befund bei 1440 px:
- „Das Team hinter dem Betrieb“ stand mittig über einem linksbündigen Text. Das Zitat
  daneben war rechnerisch mittig, wirkte aber versetzt.
- In „Ehrlich beraten, sauber gebaut“ waren die Absätze 416, 587 und 748 px breit.
- Das Foto begann 46 px unter der Überschrift und endete 58 px unter der grünen Kachel.
- „Alles aus einer Hand“ hing unter dem Text in der linken Spalte.
- Vor „Was daraus wird“ lagen 192 px statt 96 px wie an der anderen Naht.
- Zwischen 861 und 900 px zeigte die Seite die Desktop-Fassung, der Umschaltpunkt lag
  bei 860 px.

Entscheidungen des Auftraggebers:
1. **Team und Zitat als zwei bündige Spalten.** Überschrift und Text stehen
   linksbündig, das Zitat mittig zum Textblock.
2. **Ehrlich beraten:** Die Überschrift bleibt mittig, das Foto steht rechts.

Umsetzung in `ueber-uns.css`:
- Umschaltpunkt 860 → 900 px.
- Ab 901 px die linksbündige Team-Überschrift.
- Beide Absätze so breit wie die Zusage-Kachel.
- Das Foto liegt absolut in der Figur und reicht von der Überschrift bis zur Kachel.
  So bestimmt allein der Text die Zeilenhöhe. Mindesthöhe 240 px.
- „Alles aus einer Hand“ läuft über die volle Breite.
- Die zweite Naht ist halbiert wie in AP-460.

Gemessen bei 901, 1024, 1280, 1440 und 1920 px:
- Überschrift und Text beginnen auf derselben Kante.
- Das Zitat steht auf 0 px mittig zum Textblock.
- Ober- und Unterkante des Fotos liegen auf 0 px mit Überschrift und Kachel.
- Absätze und Kachel sind gleich breit.
- Beide Nähte sind gleich (96 px bei 1440 px), kein Überlauf.
- Bis 860 px ist die Seite pixelgleich. 880 und 900 px zeigen die Handy-Fassung.

**AP-523 — Über uns: Foto bis zur Zeile „Alles aus einer Hand“ (30.09.2026).** Auf Ansage
des Auftraggebers reicht das Foto in „Ehrlich beraten, sauber gebaut“ am Desktop jetzt von
der Überschrift bis zur Unterkante der Kette „Planung → … → Pflege“. Bis dahin endete es
an der Zusage-Kachel und wirkte zu kurz: bei 1440 px 114 px über der Kette.

Umsetzung: Die Rasterbereiche sind jetzt `"wort bild" / "nachsatz bild"`. Der Nachsatz
steht damit wieder links unter dem Text.

Gemessen bei 901, 1024, 1280, 1440 und 1920 px: Ober- und Unterkante liegen auf 0 px
bündig. Das gilt auch während der Schreibmaschine tippt, dann ist die Zeile rund 11 px
höher, und danach. Bis 900 px ist die Seite pixelgleich.

**AP-515 — Footer am Desktop nach der Handy-Fassung (30.09.2026).** Der Handy-Footer
(bis 480 px) war fertig. Darüber stand noch die alte Fassung:
- Meisterbetrieb-Zeile, kleines Logo
- Kacheln mit WhatsApp statt Formular
- Öffnungszeiten, Schnellzugriff, Einsatzgebiet

Zehn Seiten zeigten den alten Footer auch auf dem Handy: 404, Impressum, Datenschutz, die
sechs Projektseiten und eine Sicherungskopie.

Entscheidungen des Auftraggebers:
1. **Am Desktop exakt die Inhalte des Handys.**
2. **Die Handy-Karte dreispaltig:** Marke | Kacheln 2×2 | Erreichbarkeit mit WhatsApp und
   Instagram, darunter © und Recht.
3. **Handy-Karte bis 900 px.**
4. **Alle Seiten gleich.**

Umsetzung:
- **Markup:** `_footer.html` verliert Meisterbetrieb-Zeile, WhatsApp-Kachel,
  Öffnungszeiten und Schnellzugriff mit Einsatzgebiet.
- **`render.mjs`:** Die Handy-Bausteine gelten für jede Seite. `HANDY_FOOTER_SEITEN` und
  `stundenZusatz` sind entfallen.
- **Seiten:** Übernommen per `build-footers.mjs` auf allen 52 Seiten; pro Datei hat sich
  nur der Footer-Bereich geändert (geprüft).
- **Stylesheet:** `footer-kontakt.css` lädt jetzt jede Footer-Seite, mit einheitlich
  `?v=20260930a`. Das gilt auch für die Vorlagen `projekt.html`, `rechtstext.html` und
  die drei Leistungsvorlagen. Ein Probelauf von `build-leistungen`, `build-index` und
  `build-rechtstexte` ergab keinen weiteren Diff.
- **`footer-kontakt.css`:** Aussehen in der Grundebene, Handy-Karte bis 900 px, Desktop-Karte
  ab 901 px.
- **Ausgleich für den entfallenen Block:** Das leere `.footer-utility` trug auf dem Handy
  20 px, weil es als Rasterbehälter nicht mit dem Nachbarn kollabierte. Der Abstand ist am
  `.footer-bottom` zurückgeholt.

Gemessen:
- Bis 480 px sind Startseite, Kontakt, Über uns, Galerie und zwei Leistungsseiten bei 320,
  402 und 480 px pixelgleich.
- Impressum, Projektseite und 404 zeigen bei 402 px denselben Footer wie Kontakt.
- Am Desktop (901–1920 px) liegt die Karte im Container, die drei Spalten sind oben bündig.
- Kein Überlauf, keine Nummer umgebrochen.
- Der Formular-Link hat je Seitentiefe das richtige Präfix (404 wurzelabsolut).
- Die Konsole ist fehlerfrei.

**AP-524 — Startseite: Eckdaten und Qualifikationen am Desktop wie auf dem Handy
(30.09.2026).** AP-503 hatte beide Bausteine des Willkommenbereichs am Desktop in die Breite
gelegt: die Eckdaten als flaches Band mit vier Zellen, die Qualifikationen als Viererreihe
über 1240 px.

Auf Ansage des Auftraggebers gilt am Desktop wieder die Handy-Anordnung:
- **Eckdaten:** 25+ | 1000+, darunter „Ihr Fachteam“, darunter die Google-Bewertung mit
  den Zierlinien.
- **Qualifikationen:** im 2×2-Raster.
- **Größe:** beide mittig und rund ein Viertel größer, per `zoom: 1.25` bei `max-width:
  32rem`, sichtbar 640 px.
- **Abstände und Zertifikat:** Die oberen Abstände und das Zertifikat (17.6rem) sind durch
  den Zoom geteilt. So bleiben sie sichtbar wie vorher.

Gemessen bei 901, 1024, 1280, 1440 und 1920 px:
- Beide stehen auf 0 px mittig und sind 640 px breit, ohne Überlauf.
- Die Erklärung öffnet in voller Kastenbreite, das Zertifikat bleibt 352 px breit.
- Bis 900 px (320, 402, 480, 768, 900) ist die Startseite pixelgleich.

**AP-525 — Hinweis „Zum Öffnen anklicken“ am Desktop (30.09.2026).** Unter den
Qualifikationen der Startseite steht auf Ansage des Auftraggebers ab 901 px „Zum Öffnen
anklicken“, bis 900 px weiter „Zum Öffnen antippen“.
- **Markup:** Beide Sätze stehen im Markup, `home-dark.css` blendet je einen aus. Es ist
  jeweils der ganze Satz, nicht nur das Verb: Ein Elementwechsel mitten in der Zeile
  verschob am Handy die Kantenglättung um 34 Pixel.
- **Gemessen:** Der Ausschnitt bei 402 und 900 px ist pixelgleich. Der Hinweis verschwindet
  beim Öffnen einer Erklärung weiter (`mobile-qualifications.js`).

**AP-512 — Leistungsseiten am Desktop: die Handy-Seite als Mittelspalte (30.09.2026).**
Ausgangslage: Die 37 Leistungsseiten (Vorlage `leistung-v2.html`) zeigten ab 481 px eine
eigene Textfassung. Es gab kein Foto, keine Galerie und keine Ergänzungen, dafür die
nummerierten Abschnitte „01/03“. Die fertige Handy-Fassung stand in `leistung-mobile.css`
hinter `max-width: 480px`.

Entscheidungen des Auftraggebers:
1. **Am Desktop gilt die Handy-Seite als Mittelspalte:** 32rem mit `zoom: 1.25`, sichtbar
   640 px.
2. **Bis 900 px gilt die Handy-Seite**, zwischen 481 und 900 px mittig auf 34rem.

Umsetzung in `leistung-mobile.css`:
- **Handy-Block:** Er gilt auf allen Breiten (`@media all`). Der Block
  „Desktop-Kompatibilität“ ist entfallen.
- **Spalte:** Ab 481 px ist `.lpv2-main` eine Spalte mit `container-type`. Die ungedeckelten
  `vw`-Maße (Galeriefenster, Bildkarussell) rechnen dort mit `cqw`.
- **Kopf und Footer:** Sie bleiben ab 481 px, wie sie waren. Schrift und Farbe des
  Handy-Blocks gelten nur für die Spalte; der Container-Innenabstand, die Maße von
  `.header-inner` und die Footer-Oberkante sind zurückgesetzt.
- **Begrenzte Kopie:** 103 Handy-Regeln aus `styles.css`, `privat-form.css`, `anfrage.css`
  und `cta-family.css` für Anfrageknöpfe, Kontakt, Formular und Ergänzungen, plus eine
  Variable.
  - Erfasst wurden sie maschinell bei 480 px über vier Seiten.
  - Jede gilt ab ihrer Grenze + 1 px, in der Reihenfolge der Quelle, `vw` als `cqw`.
  - Sie steht mit `:where(.lpv2-main)` vor dem Handy-Block, damit die Kaskade der des
    Handys entspricht.
- **Galerie:** `leistung-gallery-grid.js` rechnet unter Zoom mit `currentCSSZoom`. Sonst
  sprang das Galeriefenster beim Aufklappen.

`mobileCssVersion` steht in allen 37 Inhaltsdateien auf `20260930d`. Nach dem Zusammenführen mit AP-507 wurde die Kopie auf dem gemeinsamen Stand neu erfasst: Die Leistungsliste `iphone-service-*` gilt dort auf allen Breiten, 18 Regeln sind damit entfallen. Der Build hat pro Seite
nur die Versionszeilen geändert.

Gemessen:
- Bis 480 px sind Gartenpflege, Balkonkasten und Außenanlagenpflege bei 320, 402 und 480 px
  pixelgleich. Eine Seite hat zwei Render-Zustände; verglichen wurde gegen frische
  Referenzen.
- Kopf und Footer sind bei 600, 900, 1024 und 1440 px in den berechneten Stilen
  unverändert.
- Die Spalte weicht vom Handy nur in breitenabhängigen Maßen ab.
- Galerie, Fragen und der Knopf zum Kontakt funktionieren, die Konsole ist fehlerfrei.
- Die Sturmnotdienst-Seite (alte Vorlage) ist unverändert.

**AP-526 — Seitengrund am Desktop wie am Handy (30.09.2026).**
Auf Ansage des Auftraggebers trägt die ganze Website auf allen Breiten den Handy-Seitengrund
#1B1E19. Bisher galt er nur bis 480px, darüber lag #171916, auf der Startseite zusätzlich
ein Verlauf hinter Hero und Eckdaten sowie ein gelber Lichtschein hinter der Kontakt-Sektion.
- Die 480er-Weichen für den Seitengrund sind aufgehoben: `styles.css` (html/body),
  `privat-form.css` (Startseite: `--home-page-background`, html/body, Sektionen),
  `home-dark.css` (Hero-Stapel), `kontakt.css`, `ueber-uns.css`, `projekte.css` (Seite,
  Galerie-Umschalter) und der Inline-Stil in `index.html`.
- Der Lichtschein (`.private-contact::before`) ist ganz entfallen.
- Kopf (#171916), Footer-Karte und Kacheln behalten ihre eigenen Flächen.
- Handy (360, 402, 480 px) auf Startseite, Kontakt, Galerie, Über uns, Impressum und einer
  Leistungsseite pixelgleich; Tablet und Desktop tragen gemessen durchgehend #1B1E19.

**AP-527 — Kontaktseite: Beizeile und Pin entfallen, Standort-Kachel in Knopffarbe (01.10.2026).**
Auf Ansage des Auftraggebers, auf allen Breiten:
- Die Beizeile „Anfahrt & Besuch“ über „Unser Standort in Herne“ entfällt (Markup und
  `.contact-location-label`). Die 8px Abstand der H2 zur Beizeile entfallen mit.
- Der Pin über „Standort in Google Maps anzeigen“ entfällt (`.contact-map-pin`).
- Die Standort-Kachel trägt die Füllfarbe der Kontakt-Knöpfe, #252b22 statt #20241D.
- Die Mindesthöhe der Karte am Rechner (272px) bleibt unverändert.
- Gemessen bei 360–1440px: kein Überlauf, Platzhalter vollständig sichtbar. Am Rechner
  liegen „Unser Kontakt“ und „Unser Standort in Herne“ weiter auf einer Grundlinie
  (AP-518). „Karte laden“ lädt das iframe.
- Recherche zum Datenschutzhinweis vor „Karte laden“: Gestuft (kurz am Knopf, ausführlich
  in der Datenschutzerklärung) ist zulässig. Am Knopf bleiben müssen Google als Empfänger,
  die übertragenen Daten (IP-Adresse), der Widerrufshinweis (Art. 7 Abs. 3 Satz 3 DSGVO) und
  der Link zur Datenschutzerklärung. Auf Ansage gekürzt auf „Beim Laden erhält Google
  u. a. Ihre IP-Adresse. Die Einwilligung endet beim Neuladen. Mehr im Datenschutz“.

**AP-528 — Kontaktseite: Standortzeichen in der Kartenfläche (01.10.2026).**
Auf Ansage des Auftraggebers steht das Standortzeichen aus dem Adressblock (Pin mit Blüte,
`.contact-location-mark`) zusätzlich an der Stelle des in AP-527 entfallenen Pins über
„Standort in Google Maps anzeigen“. Gleiche Größe wie im Adressblock (54px), ohne Einzug,
4px Abstand zum Titel. Gemessen bei 360–1440px: mittig (±0px), Platzhalter passt, kein
Überlauf.

**AP-531 — Galerie: drei Fotos je Reihe, Handy-Knopf am Desktop, ohne „Privatkunde“ (01.10.2026).**
Auf Ansage des Auftraggebers:
- Bildergalerie ab 901px mit 3 statt 4 Spalten (die 901–1050-Stufe entfällt). Die letzte
  Reihe bleibt mittig.
- „Passendes Projekt gesehen? Jetzt anfragen“ trägt auf allen Breiten die Handy-Gestalt.
  Ab 481px steht eine maschinell erfasste, auf `:where(.gallery-cta)` begrenzte Kopie der
  480er-Regeln aus `cta-family.css` in `projekte.css` (29 Regeln, 5 Keyframes, Technik
  wie AP-512). Die alte lindgrüne Pille (AP-401/408) ist entfallen. Breite 26rem, mittig,
  wie der Galerie-Knopf der Startseite. Berechnete Stile bei 768/1280/1440px gegen 402px:
  Abweichungen nur bei Breite, Rand und der vw-abhängigen Schriftgröße (16 statt 15,7px).
- Das Etikett „Privatkunde“ entfällt auf den Karten unter „Projekte mit Details“
  (`buildCard`-Option `ohnePrivatEtikett` aus `galerie.js`, dazu `renderGalleryList` für
  die statische Liste). „Gewerbekunde“ bliebe sichtbar.
- Nebenbei: `templates/projekt.html` trug noch `footer-kontakt.css?v=20260930a`. Jeder
  Index-Build drehte die Projektseiten damit auf den alten Stand zurück; jetzt `…b` wie auf
  den Seiten.
- Handy (360/402/480px) pixelgleich in der Bildansicht. Die Projektansicht unterscheidet
  sich auf allen Breiten nur durch das entfallene Etikett.

**AP-532 — Über uns: Handy-Knopf, Handy-Titel, neue Projekt-Überschrift (01.10.2026).**
Auf Ansage des Auftraggebers:
- „Alle Projekte“ trägt ab 481px Gestaltung und Puls des Handys. Maschinell erfasste, auf
  `:where(.ueber-projekte .projects-more)` begrenzte Kopie der 480er-Regeln aus
  `cta-family.css` (24 Regeln, 1 Keyframe, Technik wie AP-531). Das Ausblenden aus AP-477
  ist entfallen, die Zentrierung gilt auf allen Breiten. Berechnete Stile bei
  768/1280/1440px gegen 402px: Abweichungen nur beim zentrierenden Rand.
- „Für wen wir arbeiten“ und „Alles aus einer Hand“ ab 481px in der Handy-Gestalt: grün,
  Baloo 2 600, 23,2px, mittig. „Für wen wir arbeiten“ steht mittig über dem Kachelraster.
  „Alles aus einer Hand“ steht mittig über der Kette. Der Nachsatz schrumpft auf
  `fit-content` und steht als Einheit mittig in der Spalte, auf einer Achse mit
  „Ehrlich beraten, sauber gebaut“ (Nachtrag auf Ansage). Während der Schreibmaschine bleibt die Kette im
  Fluss (nur für Screenreader sichtbar). Gemessen: Titelmitte = Kettenmitte (±0px) während
  und nach dem Lauf, bei 768 und 1280px.
- Projekt-Überschrift „Was wir umgesetzt haben“, Unterzeile „Drei Projekte aus Herne und
  Umgebung“ (alle drei Karten: Herne). Auf allen Breiten; bei 360px bricht die
  Überschrift zweizeilig.
- „Das Team“ steht ab 901px rechts neben dem Startfoto, senkrecht mittig, linksbündig;
  Steg und Zitat mittig darunter (600px). Die Überschrift
  „Das Team hinter dem Betrieb.“ ab 901px so groß wie „Alles aus einer Hand“ (23,2px), in
  derselben Farbe (grün) und Schrift (Baloo 2 600, „Das Team“ kursiv 700) und mittig über
  dem linksbündigen Absatz; auf dem Handy ist „Das Team“ seither ebenfalls kursiv (600). Die
  Blütengruppe am Foto sitzt am Rechner unten links statt rechts. Der Absatz neben dem Foto
  steht am Rechner im Blocksatz (letzte Zeile links, Silbentrennung), damit die mittige
  Überschrift auch sichtbar mittig über dem Text sitzt; die Textspalte ist dafür mindestens
  400px breit (das Foto gibt auf schmalen Rechnern bis 300px nach). Ebenso im Blocksatz: die beiden
  Absätze unter „Ehrlich beraten, sauber gebaut“. Die Kacheln „Für wen wir arbeiten“ und die
  Zusage-Kachel tragen ab 481px Farbe und Inhalt der Handy-Fassung (dunkle Kachel, Rahmen,
  nur Titel und Pfeil; Zusage in Grün 14%); die Abstände bleiben die des Desktops. Die Schreibmaschine schreibt ab
  481px in der Größe des Zusage-Satzes (19px statt bis 28px). Ab 901px ist der
  Abstand Trennlinie → „Für wen wir arbeiten“ so groß wie Kachel-Unterkante → „Was wir
  umgesetzt haben“ (2 × clamp(26px, 3.75vw, 48px)). Die Blüte im Steg über dem Zitat
  steht ohne den dunklen Kasten (`background: var(--bg)`) auf dem Seitengrund.
  Die beiden Absätze unter „Ehrlich beraten, sauber gebaut“ tragen am Rechner Größe, Schrift,
  Zeilenabstand und Farbe des Team-Textes. Zusage-Kachel (max. 680px) und „Alles aus einer
  Hand“ stehen am Rechner unter Text und Foto mittig auf der Seite
  (`.ueber-betrieb__wort { display: contents }`; dadurch ohne Einblendung). Das Foto
  steht wieder 4:3 (440 × 330px), der Text senkrecht mittig daneben; die Textspalte ist
  400px breit, damit der Textblock etwa so hoch ist wie das Foto (326 zu 330px bei 1280px); der Satz der
  Zusage-Kachel steht am Rechner mittig in der Kachel; zwischen Foto und Steg
  `clamp(44px, 4.4vw, 60px)` statt der 28–40px aus AP-530 (Ansage). Foto und Text liegen in zwei Sektionen. Das
  Raster von „Das Team“ trägt deshalb ein zweites Exemplar der Figur
  (`.ueber-inhaber__foto`), nur ab 901px sichtbar; das Startfoto in `.ueber-hero` ist ab
  901px aus. Beide Exemplare gleich halten. Die Datei wird einmal geladen. Abstand
  Seitentitel → Foto unverändert (51px bei 1280px). Handy und Tablet (360/402/480/768px)
  pixelgleich zum Stand davor.
- Handy (402/480px): Lage aller Elemente unverändert. Pixelabweichungen nur am neuen Text
  und an der Wort-Animation des Zitats, die auch zwischen zwei Aufnahmen desselben Stands
  schwankt.

**AP-533 — Über uns: „Das Team“ und „Ehrlich beraten“ gleich breit (02.10.2026).**
Auf Ansage des Auftraggebers steht der Team-Block am Rechner als Spiegelbild des
Betriebs-Blocks: Foto 440px, Text 400px, Lücke clamp(26px, 3.6vw, 56px), mittig. Beide
Blöcke laufen an denselben Außenkanten (vorher war der obere bei 1280px 165px breiter).
Dazu: Fotounterkante → Linie (Steg über dem Zitat) so groß wie „Maik Rohdich,
Gartenbaumeister“ → Betriebs-Foto, `margin-top: calc(2 * clamp(26px, 3.75vw, 48px) - 36px)`.

**AP-534 — Leistungsseite Balkonkasten: Textbereich am Desktop als Trichter (02.10.2026).**
Nach dem Auftragsdokument `docs/ap/AP-534-leistungsseite-desktop-trichter.md` (geliefert als
AP-531), nur `/privatkunden/leistungen/balkonkastenbepflanzung/`, nur ab 901px. Die Seite
trägt `desktopLayout: "trichter"` (JSON) → Klasse `lpv2-page--desktop-trichter`; Spalte und
Zoom wandern von `.lpv2-main` auf die einzelnen Sektionen, die Textsektion steht auf 1080px
Satzspiegel bei Zoom 1: Überschrift, zwei Einstiegsabsätze an grüner Haarlinie,
Leistungsüberschrift, 480px-Liste (Handy-Stil), darunter mittig untereinander der
Hinweistext (Blocksatz, 480px), die Abschluss-Kachel des Handys (E1 auf Ansage: Kachel
bleibt; 480px wie der Text) und der Knopf 400px. Das Raster liegt dafür am Container der Textsektion (Artikel, Leistungsblock und
Abschluss `display: contents`). Punkte,
Hinweis, Abschluss und Knopf erscheinen einzeln beim Scrollen (`data-reveal-late`, zweiter
Beobachter in `main.js` bei 72 % Fensterhöhe). Handy und Tablet pixelgleich, übrige
Sektionen am Desktop unverändert (640px), andere Leistungsseiten unberührt. Nebenbei:
Vorlagen auf `footer-kontakt.css?v=20260930b`. Offen: E2 (Auslöselinie), H2 zweizeilig
statt einzeilig.
