# AP-605 — Go-live: Schriften, Performance, Barrierefreiheit und Fremdquellen

Stand 09.10.2026 · Basis `1db06c5f` (`claude/kind-fermat-pyzy5p`)
Go-live-Block AP-600 bis AP-605 · Hosting **Hetzner** (Entscheidung des Auftraggebers vom 08.10.2026)
Setzt AP-601 (Prüfskript) voraus. Die Messung auf der Testumgebung folgt nach AP-604.

## Auftrag

Vor dem Go-live **messen**, nicht umbauen: Welche Schriften wirklich laden, wie schnell die Seite ist,
wo Barrierefreiheit hakt und welche Fremdquellen beim Seitenaufruf angesprochen werden. Behoben wird
in diesem AP nur, was klein, risikoarm und eindeutig ist. Alles andere geht mit Messwert in
`docs/offene-punkte.md` oder in einen eigenen AP.

Hausregel bleibt: **keine Build-Pipeline für CSS** (`CLAUDE.md`, Grundregel 6). Kein Minifizieren,
kein Zusammenlegen von Stylesheets in diesem AP. Kompression übernimmt der Server (AP-604).

## Befund

### Schriften (`assets/fonts/`)

| Datei | Größe | `@font-face` in | Lizenzdatei |
|---|---|---|---|
| `nunito-latin.woff2` | 39 KB | `home-dark.css`, `header-home.css`, `kontakt.css` u. a. | `nunito-OFL.txt` ✔ |
| `nunito-italic-latin.woff2` | 42 KB | `home-dark.css` | ✔ |
| `baloo2-700-latin.woff2` | 19 KB | `home-dark.css`, `kontakt.css` | `baloo2-OFL.txt` ✔ |
| `baloo2-variable-latin.woff2` | 33 KB | `home-dark.css` | ✔ |
| `inter-latin.woff2`, `inter-latin-ext.woff2` | 48 + 85 KB | `styles.css` Z. 66–78 | **fehlt** |
| `outfit-latin.woff2`, `outfit-latin-ext.woff2` | 32 + 15 KB | `styles.css` Z. 50–62 | **fehlt** |

- Alle WOFF2, `font-display: swap`, `unicode-range` Latin (enthält ä ö ü ß, €, „ “, –) ✔.
- Keine Anfrage an `fonts.googleapis.com`/`fonts.gstatic.com` ✔.
- `styles.css` Z. 164–165 setzt global `--display: "Outfit"` und `--body: "Inter"`. Auf Nunito
  umgestellt wird nur in `home-dark.css` (Startseite) und `leistung-mobile.css` (Leistungsseiten).
  Kontakt, Über uns, Projekte, Projektseiten, Impressum, Datenschutz und 404 laden keines der beiden –
  dort greifen Inter/Outfit, soweit das Seiten-Stylesheet nicht selbst eine Schrift setzt. **Ob Inter oder Outfit irgendwo tatsächlich gerendert werden, ist
  nicht gemessen.** Werden sie gerendert, fehlt die Lizenzdatei. Werden sie nicht gerendert, lädt der
  Browser sie gar nicht (Schriften werden nur bei Verwendung geladen) – dann sind sie Ballast im Repo.
- Handschrift-Akzente: 31 Deklarationen in 10 Stylesheets nutzen
  `"Comic Sans MS", "Comic Sans", "Chalkboard SE", cursive` – **Systemschriften**. Auf Android und
  Linux gibt es keine davon. Dort erscheint die generische Schreibschrift des Geräts, das Schriftbild
  weicht also je Gerät ab (**E1**).

### Gewicht (unkomprimiert / gzip, gemessen am Repo)

| Seite | HTML | CSS | JS |
|---|---|---|---|
| Startseite | 253 / 51 KB | 15 Dateien, 687 / 163 KB | 10 Dateien, 251 / 79 KB + Elfsight |
| Leistungsseite Baumpflege | 54 / 10 KB | 10 Dateien, 573 / 137 KB | 5 Dateien, 145 / 41 KB |

- Alle externen Skripte mit `defer`/`async` ✔. Video `preload="none"` ✔.
- Bilder: AVIF/WebP mit `srcset` weitgehend vorhanden. Breite/Höhe noch nicht vollständig gemessen.
- 15 Stylesheets blockieren das erste Rendern der Startseite. Das ist der wahrscheinlichste Bremsklotz,
  wird aber nicht in diesem AP gelöst (Hausregel, Risiko).
- Zielwerte aus `docs/go-live-checkliste.md` Abschnitt 4: Lighthouse mobil Performance ≥ 90,
  SEO 100, Barrierefreiheit ≥ 95, CLS < 0,1.

### Barrierefreiheit (Vorprüfung)

- `prefers-reduced-motion`: 55 Treffer in CSS, 21 in JS. GSAP läuft nur über `main.js` (5 Abfragen) ✔.
  Ohne Abfrage: `galerie.js` und `home-header-morph.js` (dort nur Messung per
  `requestAnimationFrame`, Bewegung über CSS-Übergänge) – gerendert prüfen.
- **Kein Sprunglink** („Zum Inhalt springen“) auf Startseite, Kontakt, Leistungsseiten (**E2**).
- `lang="de"` überall ✔. Kontraste wurden in früheren APs einzeln berechnet, nicht seitenweit.

### Fremdquellen beim Seitenaufruf (statisch)

| Quelle | Seite | Zeitpunkt |
|---|---|---|
| `elfsightcdn.com` (+ Folgeanfragen) | Startseite | sofort (siehe AP-604 E1) |
| `www.google.com/maps` | Kontakt | erst nach Klick (Zwei-Klick, `kontakt.js`) ✔ |
| `unpkg.com` | `/admin/` | nur CMS |
| Instagram, WhatsApp, Google Maps Route | alle | nur Links, keine Einbettung ✔ |

## Umsetzung

### 1. `pruefeFremdquellen()` im Prüfskript

Statisch je auslieferbarer Seite: alle `<script src>`, `<link href>` (stylesheet, preload, icon),
`<iframe src>`, `<img src>`/`srcset`, `<source>`, `<video>`/`poster`, CSS-`url()` in den geladenen
Stylesheets, `@import`. Jede Quelle außerhalb von `rohdich.de`/relativ ist ein **Fehler**, außer sie
steht in einer Ausnahmeliste im Skript mit Begründung (heute: `/admin/` → `unpkg.com`; `elfsightcdn.com`
bis AP-604 E1 umgesetzt ist, als Warnung). Daten-Attribute (`data-map-src`) zählen nicht – sie laden
erst nach Klick.

### 2. Gerenderte Messung (Playwright/Chromium)

Seiten: Startseite, Balkonkastenbepflanzung, Baumpflege, Projekte, eine Projektseite, Kontakt,
Über uns, Impressum, 404. Breiten 402 und 1440, zusätzlich Querformat 852 × 393 für die Startseite.

1. **Schriften:** `document.fonts` nach `load` – welche Familien/Schnitte sind `loaded`? Je Seite als
   Tabelle. Damit ist die Inter/Outfit-Frage beantwortet.
2. **Fremdanfragen:** alle Requests mit Host außerhalb von `localhost` mitschneiden. Erwartet: nur
   Elfsight und dessen Folgeanfragen auf der Startseite (bis E1 umgesetzt). Liste in den Nachtrag –
   sie ist Grundlage für Datenschutztext und CSP.
3. **axe-core** (`@axe-core/playwright` nur als Test-Werkzeug im Arbeitsverzeichnis, **nicht** in
   `package.json`): Verstöße je Seite und Breite, gruppiert nach Schwere.
4. **Bewegung:** dieselben Seiten mit `reducedMotion: 'reduce'`. Nach 2 s darf sich nichts mehr
   bewegen (zwei Screenshots im Abstand von 1 s vergleichen); Knöpfe pulsieren nicht (AP-568).
5. **Tastatur:** Tab-Reihenfolge auf Startseite und Kontakt: Kopf, Menü, Formular, FAQ, Karte-Knopf,
   Footer. Jeder Fokus sichtbar (Fokusring ≥ 2 px oder deutlicher Kontrastwechsel).
6. **Lighthouse mobil** lokal gegen die Vorschau (ohne Kompression, deshalb nur Richtwert) für
   Startseite und Baumpflege. Endgültige Messung morgen auf der Testumgebung.
7. **Bilder:** alle `<img>` ohne `width`/`height` und ohne CSS-`aspect-ratio` → Liste (CLS-Risiko).

### 3. Kleine Korrekturen, die dieser AP selbst erledigt

- **Lizenzdateien:** Wenn Inter oder Outfit laut Schritt 2.1 auf mindestens einer Seite geladen werden:
  `inter-OFL.txt` und `outfit-OFL.txt` aus den Original-Repositories (rsms/inter, Outfitio/Outfit-Fonts)
  neben die Dateien legen. Werden sie nirgends geladen: **nichts löschen**, Befund in
  `docs/offene-punkte.md` (Entfernen ist ein eigener AP mit CSS-Änderung).
- **Reduced Motion:** Bewegt sich in Schritt 2.4 etwas trotz Einstellung, die betroffene Regel um
  `@media (prefers-reduced-motion: reduce)` ergänzen – nur dort, wo die Messung es zeigt.
  Danach `?v=` der geänderten CSS-Datei in allen HTML-Dateien nach Hausregel hochzählen (Leistungsseiten
  über Renderer/`build-headers.mjs`).
- **axe „critical“:** nur Fehler der Schwere *critical* beheben, die eine einzelne Attributänderung
  sind (fehlendes `aria-label`, `label`-Bezug, doppelte `id`). Alles Weitere in `docs/offene-punkte.md`.

### 4. Nachtrag im AP

Tabellen aus Schritt 2 (Schriften, Fremdanfragen, axe je Seite, Bewegung, Tastatur, Lighthouse,
Bilder ohne Maße) unter „Nachtrag: Messung“ an diesen AP anhängen.

## Stoppregeln

- Keine Gestaltungsänderung, keine Schrift austauschen, keine Stylesheets zusammenlegen oder minifizieren.
- Header-Knöpfe unberührt. Kein `overflow: hidden` am Footer (Fokusringe).
- Keine neue Abhängigkeit in `package.json` (axe, Lighthouse nur temporär).
- Elfsight nicht anfassen (AP-604 E1).
- Zwei Welten beachten: Handy-Regeln nur in `@media (max-width: 900px)`, Desktop in `@media (min-width: 901px)`.

## Prüfung

- [ ] Alle Tabellen aus Schritt 2 im Nachtrag
- [ ] `npm run check:golive` → Abschnitt Fremdquellen ohne Fehler (Elfsight als begründete Warnung)
- [ ] Jede Korrektur aus Schritt 3 mit Vorher/Nachher-Messung belegt
- [ ] Neue Einträge in `docs/offene-punkte.md` mit Fundstelle
- [ ] `npm test` grün

Commit: `AP-605: Go-live-Messung Schriften, Performance, Barrierefreiheit`

## Morgen auf der Testumgebung

- [ ] Lighthouse mobil (PageSpeed Insights geht nicht hinter Passwortschutz → Chrome DevTools
      Lighthouse oder `npx lighthouse` mit Basic-Auth-Header) für Startseite, Baumpflege, Projekte
- [ ] Antwort-Header prüfen: `Content-Encoding: gzip` (oder `br`) für HTML/CSS/JS, `Cache-Control` laut AP-604
- [ ] Ergebnis gegen die Zielwerte; Abweichungen als eigener Performance-AP

## Offene Entscheidungen

- **E1 – Handschrift-Akzente:** (a) so lassen – auf Android/Linux erscheint eine andere Schreibschrift;
  (b) eine freie Handschrift-Schrift (OFL) selbst hosten, damit alle Geräte gleich aussehen.
  Empfehlung (b) nach dem Go-live, wenn Sascha das Bild auf einem Android-Gerät stört.
- **E2 – Sprunglink „Zum Inhalt springen“:** WCAG 2.4.1. Unsichtbar bis zum ersten Tab, ändert die
  Header-Knöpfe nicht. Empfehlung ja, als eigener kleiner AP.
- **E3 – Stylesheets zusammenlegen/minifizieren:** nur, wenn Lighthouse auf der Testumgebung unter 90
  liegt und die Stylesheets als Ursache ausweist. Dann bewusste Ausnahme von Grundregel 6.


---

## Nachtrag: Messung (17.10.2026)

**Entscheidungen:** E1 Handschrift bleibt, Entscheidung nach dem Go-live. E2 Sprunglink als eigener
kleiner AP. E3 offen bis zur Lighthouse-Messung auf der Testumgebung.

**Methode:** Live-Auslieferung (`prepare-deploy.mjs --ziel live`) über einen lokalen statischen
Server **ohne Kompression und ohne CSP-Header**. Elfsight lädt deshalb hier, auf Hetzner blockiert es
die CSP (AP-604). Gemessen in Chrome headless per CDP (kein Playwright nötig), mit axe-core 4.14.0 und
Lighthouse 13.5.0, beide nur im Scratchpad. Jede Seite wurde einmal ganz durchgescrollt, damit
Lazy-Inhalte und späte Schriften laden.

### 1. Schriften (`document.fonts`, Status `loaded`)

| Seite | 402 px | 1440 px |
|---|---|---|
| `/` | Baloo 2 (variabel), Baloo 2 700, Nunito, Outfit | Baloo 2 (variabel), Baloo 2 700, Nunito, Outfit |
| `/privatkunden/leistungen/balkonkastenbepflanzung/` | Baloo 2 (variabel), Inter, Nunito, Outfit | Baloo 2 (variabel), Baloo 2 700, Inter, Nunito, Outfit |
| `/privatkunden/leistungen/baumpflege/` | Baloo 2 (variabel), Inter, Nunito, Outfit | Baloo 2 (variabel), Baloo 2 700, Inter, Nunito, Outfit |
| `/projekte/` | Baloo 2 (variabel), Inter, Nunito, Outfit | Baloo 2 (variabel), Inter, Nunito, Outfit |
| `/projekte/baumarbeiten-herne/` | Inter, Outfit | Inter, Nunito, Outfit |
| `/kontakt/` | Baloo 2 (variabel), Baloo 2 700, Inter, Nunito, Outfit | Baloo 2 (variabel), Baloo 2 700, Inter, Nunito, Outfit |
| `/ueber-uns/` | Baloo 2 (variabel), Baloo 2 700, Inter, Nunito, Outfit | Baloo 2 (variabel), Baloo 2 700, Inter, Nunito, Outfit |
| `/impressum/` | Inter, Nunito, Outfit | Inter, Nunito, Outfit |
| `/404.html` | Inter, Outfit | Inter, Nunito, Outfit |

**Ergebnis:** **Inter und Outfit werden geladen**, Outfit auf allen gemessenen Seiten und Inter auf
allen außer der Startseite. Die Lizenzdateien `assets/fonts/inter-OFL.txt` (rsms/inter, `LICENSE.txt`)
und `assets/fonts/outfit-OFL.txt` (Outfitio/Outfit-Fonts, `OFL.txt`) sind ergänzt und werden mit den
Schriften ausgeliefert. Keine Anfrage an Google Fonts.

### 2. Fremdanfragen beim Seitenaufruf

| Seite | Hosts |
|---|---|
| `/` | core.service.elfsight.com, elfsightcdn.com, phosphor.utils.elfsightcdn.com, service-reviews-ultimate.elfsight.com, static.elfsight.com, universe-static.elfsightcdn.com |
| `/privatkunden/leistungen/balkonkastenbepflanzung/` | – keine – |
| `/privatkunden/leistungen/baumpflege/` | – keine – |
| `/projekte/` | – keine – |
| `/projekte/baumarbeiten-herne/` | – keine – |
| `/kontakt/` | – keine – |
| `/ueber-uns/` | – keine – |
| `/impressum/` | – keine – |
| `/404.html` | – keine – |

Nur die Startseite spricht Dritte an, und zwar ausschließlich über Elfsight mit 6 Hosts. Diese Liste
ist die Grundlage für den E1-AP aus AP-604 (Zwei-Klick-Lösung, Datenschutztext, CSP-Domains).
`pruefeFremdquellen()` meldet statisch nur `elfsightcdn.com` als begründete Warnung. Eine
Gegenprobe mit eingeschmuggelten Quellen (Skript, Bild, Inline-Style, iframe, CSS-`@import`) ergab
5 von 5 Fehlern. Canonical, reine Links, `data-map-src`, CSS-Kommentare und unpkg im Admin werden
ignoriert.

### 3. axe-core (Verstöße je Seite und Breite)

**Keine Verstöße der Schwere „critical“.** Eine Korrektur nach Schritt 3 ist daher nicht nötig.

| Regel | Schwere | Messungen | Fundstellen (Beispiele) |
|---|---|---|---|
| `color-contrast` | serious | 19 von 19 | Elfsight-Bewertungen (Startseite); `.footer-route` „Route planen“ (alle übrigen Seiten); auf `/kontakt/` zusätzlich `.contact-location-route strong` |
| `label-content-name-mismatch` | serious | 19 von 19 | `.mobile-kpi-signature__google`, `#gate-qualification-tree`, `.iphone-service-feature`, `.iphone-service-inquiry` |
| `scrollable-region-focusable` | serious | 1 von 19 | `#mobile-proof-gallery-track` (Startseite, 402 px) |

Alles „serious“ steht mit Fundstellen in `docs/offene-punkte.md`.

### 4. Bewegung mit `prefers-reduced-motion: reduce`

| Seite | Größen | oben (2 s / 3 s) | Mitte der Seite | laufende Animationen |
|---|---|---|---|---|
| `/` | 402×874, 1440×900, 852×393 | ruhig | ruhig | – |
| `/privatkunden/leistungen/balkonkastenbepflanzung/` | 402×874, 1440×900 | ruhig | ruhig | lpv2-sway @ .reveal.is-in |
| `/privatkunden/leistungen/baumpflege/` | 402×874, 1440×900 | ruhig | ruhig | lpv2-sway @ .reveal.is-in |
| `/projekte/` | 402×874, 1440×900 | ruhig | ruhig | – |
| `/projekte/baumarbeiten-herne/` | 402×874, 1440×900 | ruhig | ruhig | – |
| `/kontakt/` | 402×874, 1440×900 | ruhig | ruhig | – |
| `/ueber-uns/` | 402×874, 1440×900 | ruhig | ruhig | – |
| `/impressum/` | 402×874, 1440×900 | ruhig | ruhig | – |
| `/404.html` | 402×874, 1440×900 | ruhig | ruhig | – |

Alle Bildschirmfotos waren pixelgleich, nichts bewegt sich. Einzige registrierte Animation:
`lpv2-sway` (Blüten der Leistungsliste, Desktop). Nachgemessen mit 6 Proben über 10 s auf Baumpflege
1440 px: Das `transform` des `::before` bleibt unverändert, weil `leistung-mobile.css` Z. 554 es
unter „Bewegung reduzieren“ mit `!important` festhält. Es gibt daher **keine CSS-Änderung** und
kein Cache-Busting. Kein Knopf pulsiert (keine `maik-cta`-Animation registriert).

### 5. Tastatur

| Seite | Größe | Stopps | Reihenfolge der Bereiche | ohne sichtbaren Fokus |
|---|---|---|---|---|
| `/` | 1440 | 157 (bis zum Wiederbeginn) | Kopf → Seite → Social Proof → Über uns → Karte → Leistungen → Ablauf → Bewertungen → Formular → FAQ → Fuß | 19 Stopps im Elfsight-Widget (Shadow DOM); Datenschutz-Link `.anf__rechtliches a` |
| `/` | 402 | 58 von 60 | wie oben bis Ablauf | Elfsight-Widget |
| `/kontakt/` | 1440 | 58 | Kopf → Menü → Seite → Karte → Fuß (Durchlauf wiederholt sich) | – |
| `/kontakt/` | 402 | 58 | wie oben | – |

Sichtbar heißt hier `outline` ≥ 2 px oder ein Fokus-Schatten. Die Reihenfolge folgt dem Lesefluss.

### 6. Lighthouse mobil (lokal, ohne Kompression – nur Richtwert)

| Seite | Performance | Barrierefreiheit | Best Practices | SEO | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| `/` | 59 | 97 | 100 | 100 | 6,6 s | 17,7 s | 0 ms | 0 |
| `/privatkunden/leistungen/baumpflege/` | 64 | 96 | 100 | 100 | 4,5 s | 9,3 s | 0 ms | 0 |

Ziel laut Checkliste ist Performance ≥ 90. Wichtigste Ursachen: 15 bzw. 10 render-blockierende
Stylesheets (689 / 575 KB unkomprimiert, mit gzip etwa ein Viertel davon), auf der Startseite 3,9 MB
Gesamtgewicht mit dem Hero `hero-fahrzeug-palmengarten-v9-mobile-q95.webp` (475 KB) sowie den PNGs
`maik-rohdich-1000plus-v1.png` (442 KB) und `maik-rohdich-ehrliche-einschaetzung.png` (290 KB).
Endgültige Messung auf der Testumgebung mit gzip (E3), danach gegebenenfalls ein eigener
Performance-AP.

### 7. Bilder ohne Maße

Keine. Alle `<img>` auf allen gemessenen Seiten und Breiten haben `width` und `height` oder ein
berechnetes `aspect-ratio`. Das passt zu CLS 0.

### Prüfung

- `npm run check:golive`: Abschnitt Fremdquellen 0 Fehler, 1 begründete Warnung (Elfsight).
- Einzige Korrektur: die zwei Lizenzdateien. Vorher fehlten sie, nachher liegen sie neben den
  Schriften und stecken laut Allowlist in `_site`.
- Neue Einträge in `docs/offene-punkte.md` (Abschnitt AP-605) mit Fundstellen.

