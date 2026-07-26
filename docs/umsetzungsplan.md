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
| Google-Bewertungen | 67 Bewertungen, Durchschnitt 4,8 |
| **Öffnungszeiten** | **Montag bis Freitag, 08:00–20:00 Uhr** |
| **Samstag / Sonntag** | **geschlossen** |
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

Es gibt Öffnungszeiten (Mo–Fr 08–20), aber **keine Ladenöffnung**. Besuche nur nach Termin. Der Text muss beides gleichzeitig transportieren, ohne dass Kunden unangemeldet auf dem Hof stehen.

**Verbindliche Formulierung** (so oder sinngemäß, überall konsistent):

> **Erreichbarkeit:** Montag bis Freitag, 08:00–20:00 Uhr
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

**Verbindlich: Montag bis Freitag 08:00–20:00 Uhr. Samstag und Sonntag geschlossen. WhatsApp 24/7.**

**Umsetzung:**

1. JSON-LD auf der Startseite ersetzen:
```json
"openingHoursSpecification": [{
  "@type": "OpeningHoursSpecification",
  "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
  "opens": "08:00",
  "closes": "20:00"
}]
```

2. Den bestehenden FAQ-Eintrag „Gibt es feste Öffnungszeiten?" **inhaltlich ersetzen**:
> **Antwort:** Ja. Wir sind montags bis freitags von 08:00 bis 20:00 Uhr erreichbar. Per WhatsApp können Sie uns rund um die Uhr schreiben — wir antworten innerhalb der Geschäftszeiten. Besuche am Betrieb sind ausschließlich nach vorheriger Terminvereinbarung möglich, auch innerhalb der Öffnungszeiten.

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

**Ziel:** 4,8 Sterne aus 67 Bewertungen sichtbar auf der Website, DSGVO-konform, ohne Consent-Banner, ohne Drittanbieter-Widget, ohne Richtlinienverstoß.

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
      "openingHoursSpecification": [{
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
        "opens": "08:00", "closes": "20:00"
      }],
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

Drei Inhalte, die überdurchschnittlich häufig von Sprachmodellen zitiert werden, weil sie eine sachliche Frage vollständig beantworten:

**1. Verkehrssicherungspflicht bei Bäumen** — auf `/leistungen/baumkontrolle-gutachten/`
Wer haftet, wann eine Kontrolle nötig ist, welcher Turnus üblich ist, was ein Befund enthält, was bei Gewerbeobjekten und Hausverwaltungen zusätzlich gilt. Das ist zugleich das stärkste Verkaufsargument gegenüber Firmen.

**2. Heckenschnitt-Fristen** — eigene Seite `/ratgeber/heckenschnitt-fristen/`
§ 39 BNatSchG: starker Rückschnitt nur 1. Oktober bis 28./29. Februar, Form- und Pflegeschnitt ganzjährig zulässig. Laut Erstgespräch kommen Kunden regelmäßig im Februar zu spät damit an. Saisonal hohes Suchvolumen, echter Nutzen, natürlicher Backlink-Anlass. **Fachlich exakt arbeiten, Gesetzesstand prüfen.**

**3. Ablauf einer Anfrage** — auf der Startseite, als Diagramm
Vom Erstgespräch bis zur Umsetzung, mit dem expliziten Hinweis auf Terminpflicht.

**Akzeptanzkriterien:**
- [ ] Alle drei Inhalte existieren
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

- **Öffnungszeiten im Profil auf Mo–Fr 08:00–20:00 setzen, Sa/So geschlossen.** Abweichungen zwischen Website und Profil sind einer der wenigen Punkte, die Google bei lokalen Betrieben direkt negativ bewertet.
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
