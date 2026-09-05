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
| Google-Bewertungen | 67 Bewertungen, Durchschnitt 4,9 |
| **Öffnungszeiten** | **Montag bis Freitag, 09:00–17:00 Uhr** |
| **Samstag** | **09:00–12:00 Uhr** |
| **Sonntag** | **geschlossen** |
| **WhatsApp** | **24/7 erreichbar für Nachrichten** — Antwort zu den Geschäftszeiten |
| Besuche vor Ort | **ausschließlich nach vorheriger Terminvereinbarung** |
| Einsatzgebiet | Herne (Sitz), Bochum, Castrop-Rauxel, Recklinghausen, Gelsenkirchen-Buer, weitere Orte nach Projekt |
| Besonderheiten | Ausbildungsbetrieb · Sachverständiger für Baumkontrolle · Meisterbetrieb |
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

**Ziel:** 4,9 Sterne aus 67 Bewertungen sichtbar auf der Website, DSGVO-konform, ohne Consent-Banner, ohne Drittanbieter-Widget, ohne Richtlinienverstoß.

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
