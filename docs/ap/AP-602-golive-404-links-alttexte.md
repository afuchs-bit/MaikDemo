# AP-602 — Go-live: 404-Seite, interne Links und Alt-Texte

Stand 09.10.2026 · Basis `1db06c5f` (`claude/kind-fermat-pyzy5p`)
Go-live-Block AP-600 bis AP-605 · Hosting **Hetzner** (Entscheidung des Auftraggebers vom 08.10.2026)
Setzt AP-601 voraus (Prüfskript `scripts/golive-check.mjs`).

## Auftrag

Fehlerseite, interne Verlinkung und Bildbeschreibungen vor dem Go-live prüfen und die gefundenen
Lücken schließen. Weiterleitungen auf Serverebene (`/privatkunden/`, alte URLs) sind **nicht** Teil
dieses AP, sondern von AP-604.

## Befund

### 404-Seite (`404.html`)

| Prüfung | Ergebnis |
|---|---|
| Pfade | 81 wurzelrelative Pfade (`/assets/…`, `/kontakt/`), keine relativen → funktioniert unter jeder Tiefe ✔ |
| Inhalte | Startseite, Projekte, Über uns, alle Leistungen, Kontakt, Impressum, Datenschutz, beide Telefonnummern, WhatsApp ✔ |
| `noindex` | gesetzt, bleibt (AP-10) ✔ |
| Titel | 62 Zeichen |
| Statuscode | kommt auf Hetzner aus `ErrorDocument 404 /404.html` (AP-604) |
| Link „Zum Gewerbekundenbereich“ | Z. 290 → `/gewerbekunden/`, eine Weiterleitungsseite (siehe unten) |
| Lokale Vorschau | `scripts/preview.mjs` antwortet bei fehlender Seite mit JSON, nicht mit `404.html` → lokal nicht testbar |

### Links auf die deaktivierte Gewerbekundenseite

`gewerbekunden/index.html` leitet per `<meta http-equiv="refresh">` auf die Startseite („Temporär
deaktiviert“, Seitenstand in `index.saved.html`). Darauf zeigen:

| Datei | Zeile | Element |
|---|---|---|
| `404.html` | 290 | Listenlink „Zum Gewerbekundenbereich“ |
| `index.html` | 662 | Tor-Kachel `.gate-door--gewerbe` im Block „Auf den vereinbarten iPhone-Breiten vorübergehend ausgeblendet“. Ob sie auf anderen Breiten sichtbar ist, ist nicht gemessen |
| `gewerbekunden/leistungen/aussenanlagenpflege/index.html` | 362 | Brotkrumen „Gewerbekunde“ |

### Alt-Texte (alle ausgelieferten Seiten, ohne `docs/`, `admin/`, `*.saved.html`)

| Messung | Anzahl |
|---|---|
| `<img>` gesamt | 2 255 |
| ohne `alt`-Attribut | **0** (ein scheinbarer Treffer in `index.html` Z. 157 steht in einem HTML-Kommentar) |
| mit Beschreibung | 432 |
| `alt=""` | 1 823 |

Aufschlüsselung `alt=""`:

| Ordner | sichtbar | `aria-hidden` |
|---|---|---|
| `assets/img/icons` | 345 | 1 245 |
| `assets/img/leistungen-mobile` (Fotos) | **178** | – |
| `assets/img/logo` | 2 | 40 |
| `assets/img/projektablauf` | – | 5 |
| `assets/img/proof` (Fotos) | **4** | – |
| `assets/img/hero` (Fotos) | **1** (`gate-gewerbe-grossbaum`) | 1 (Startseiten-Held im `aria-hidden`-`<picture>`) |
| `assets/img/galerie-teaser` (Fotos) | **2** | – |
| Lightbox-Platzhalter (`src=""`, per JS gefüllt) | 1 | – |

`alt=""` ist richtig, wenn das Bild nur schmückt oder direkt daneben derselbe Text steht. Fett markiert
sind Fotos, bei denen das am Bild selbst nicht erkennbar ist. Das prüft Schritt 2.

CMS: `alt` ist für Projektbilder und Seiteninhalte Pflichtfeld (`admin/config.yml` Z. 124 und 149),
`build-index.mjs` lehnt leere Alt-Texte ab ✔. In JS fallen `galerie.js` Z. 493 und `projekte-card.js`
Z. 62 auf `''` zurück – bei Pflichtfeld unkritisch.

## Umsetzung

### 1. `pruefeLinks()` im Prüfskript

Für jede auslieferbare HTML-Datei unter `--root`:
- `href`, `src`, `srcset` (jede Angabe), `poster` mit relativem oder wurzelrelativem Ziel auflösen.
  Verzeichnis → `index.html`, Query (`?v=`) ignorieren, Prozent-Kodierung dekodieren.
- **Fehler:** Ziel existiert nicht. Anker `#id` existiert in der Zielseite nicht.
- **Warnung:** Ziel ist eine Weiterleitungsseite (`meta http-equiv="refresh"`) oder trägt `noindex`
  (außer Rechtstexte im Demo-Modus).
- `tel:`, `mailto:`, `https://` überspringen. Mit `--extern` zusätzlich externe Links per `HEAD`
  (Zeitlimit 8 s, nur Warnungen, weil Instagram und WhatsApp Bots oft abweisen).
- Laufzeit-Daten: Für jeden Eintrag in `data/projekte-index.json` muss `projekte/<slug>/index.html`
  existieren, und jedes dort genannte Bild muss als Datei vorhanden sein.

### 2. `pruefeAlt()` im Prüfskript

Mit jsdom (bereits devDependency) je Seite:
- **Fehler:** `<img>` ohne `alt`-Attribut (außer `src=""`).
- `alt=""` gilt als **in Ordnung**, wenn das Bild oder ein Vorfahre `aria-hidden="true"` bzw.
  `role="presentation"` trägt, wenn der Pfad unter `assets/img/icons/` oder `assets/img/logo/` liegt
  oder wenn der nächste Vorfahre `<a>`, `<button>`, `<figure>` oder `<li>` eigenen sichtbaren Text von
  mindestens 3 Zeichen enthält.
- Sonst **Warnung** „Inhaltsbild ohne Beschreibung“, gruppiert nach Ordner.
- **Warnung** bei Alt-Texten, die wie Dateinamen aussehen (`.jpg`, `.webp`, `img`, `DSC`) oder länger
  als 150 Zeichen sind.

### 3. Gefundene Inhaltsbilder beschreiben

Für jede Warnung aus Schritt 2 das Bild ansehen und einen Alt-Text schreiben, der **nur beschreibt,
was zu sehen ist**: keine Orte, Kunden oder Projektdetails, die nicht anderweitig belegt sind. Länge
60–120 Zeichen, deutsch, ohne „Bild von“.
- Hand-geschriebene Seiten (`index.html`, `ueber-uns/index.html`, `kontakt/index.html`) direkt.
- Leistungsseiten (`leistungen-mobile`): in `content/leistungen/*.json` bzw. im Renderer, danach
  `node .github/scripts/build-leistungen.mjs`. Nie die generierten Seiten von Hand.
- Ergebnis als Tabelle (Datei, Bild, neuer Alt-Text) in diesen AP unter „Nachtrag“.

Erwartung vor dem Lauf: Die 178 `leistungen-mobile`-Bilder stehen in Karten mit Leistungsnamen und
bleiben vermutlich bei `alt=""`. Die Messung entscheidet.

### 4. Links auf die Gewerbekundenseite (nach E1)

- Variante **„bleibt deaktiviert“**: `404.html` Z. 290 den Listenpunkt entfernen. Brotkrumen in der
  Außenanlagenpflege-Seite über den Renderer bzw. die Leistungsdaten auf „Startseite“ zeigen lassen.
  Tor-Kachel `index.html` Z. 662: Sichtbarkeit messen (Schritt 5); ist sie irgendwo sichtbar, auf allen
  Breiten ausblenden, das Markup bleibt als Kommentar-Stand erhalten.
- Variante **„geht mit live“**: `gewerbekunden/index.saved.html` zurück nach `index.html` (eigener AP,
  nicht hier).

### 5. Gerenderte Prüfung (Playwright/Chromium)

Breiten 360, 390, 402, 430, 768, 1024, 1280, 1440 und Querformat 852 × 393:
- Ist `.gate-door--gewerbe` sichtbar (`getBoundingClientRect`, `visibility`, `display`)?
- 404-Seite unter `/gibt/es/nicht/`: Logo, Schrift, Bilder geladen, keine Konsolenfehler.

Dafür `scripts/preview.mjs` minimal erweitern: Wenn eine angefragte Seite fehlt und die Anfrage
HTML erwartet (`Accept` enthält `text/html`), `404.html` mit Status 404 ausliefern. JSON-Antworten
für `/api/` bleiben unverändert.

### 6. 404-Titel (optional, E2)

`<title>Seite nicht gefunden | Maik Rohdich</title>` (35 Zeichen) – einheitlich mit AP-601.

## Stoppregeln

- Keine Weiterleitungen in diesem AP (AP-604).
- `gewerbekunden/index.html` und `index.saved.html` nicht anfassen.
- Keine Alt-Texte für Icons, Logos oder Schmuckgrafiken ergänzen.
- Kein Bild austauschen, beschneiden oder umbenennen.
- Generierte Seiten nur über die Build-Skripte. Header-Knöpfe unberührt.
- Kein CSS geändert → kein Cache-Busting. Falls Schritt 4 die Tor-Kachel per CSS ausblendet, `?v=`
  der geänderten CSS-Datei nach Hausregel hochzählen.

## Prüfung

- [ ] `npm run check:golive`: Abschnitt Links ohne Fehler, Abschnitt Alt ohne Fehler; verbleibende Warnungen begründet
- [ ] Liste der neu beschriebenen Bilder im Nachtrag
- [ ] Sichtbarkeit der Tor-Kachel je Breite als Tabelle
- [ ] 404 unter `/gibt/es/nicht/` lokal: Status 404, vollständig gestaltet, keine Konsolenfehler
- [ ] `npm test` grün

Commit: `AP-602: 404-Seite, interne Links und Alt-Texte`

## Offene Entscheidungen

- **E1 – Gewerbekundenseite zum Go-live:** bleibt deaktiviert (Links entfernen, Server leitet `/gewerbekunden/`
  vorübergehend um, siehe AP-604) oder geht mit live (eigener AP).
- **E2 – 404-Titel kürzen:** Empfehlung ja.
- **E3 – Startseiten-Held mit Alt-Text?** Er ist heute als Schmuck markiert (`aria-hidden`). Ein Alt-Text
  brächte etwas für die Google-Bildersuche. Empfehlung: nein, die Überschrift trägt die Aussage.


---

## Nachtrag (15.10.2026, umgesetzt)

**Entscheidungen:** E1 Gewerbekundenseite bleibt deaktiviert, die Außenanlagenpflege-Seite bleibt live.
E2 404-Titel gekürzt. E3 Startseiten-Held bleibt Schmuck. Die Alt-Texte hat Sascha vor dem Eintragen
freigegeben (SEO-Fassung: Suchbegriff der Seite vorn, danach erkennbare Pflanzen, Materialien und Geräte).

### Abweichungen vom Plan

- **Kontaktseite:** `<use href="#brand-logo">` zeigte ins Leere. Das Logo ist trotzdem sichtbar, weil
  `styles.css` `.brand-logo > use` überall ausblendet und das Logo als CSS-Hintergrund zeichnet. Statt
  ein Symbol zu ergänzen, das nie gezeigt würde, wurden die beiden toten Verweise entfernt.
  Bildschirmfotos von Kopf und Fuß vorher und nachher sind byteweise identisch.
- **Projektübersicht:** Der `<noscript>`-Link zeigte auf `../#projekte`, das es auf der Startseite nicht
  gibt. Er zeigt jetzt auf `../#social-proof`, wo die Galerie-Auswahl steht.
- **Brotkrumen Außenanlagenpflege:** im Renderer per `hubEntfaellt: true` an der Gewerbe-Welt
  (`render.mjs`), wie bei den Privatkunden. Sichtbar und im JSON-LD lautet er jetzt Startseite →
  Objekt- & Grünflächenpflege.
- **Build-Drift:** `build-leistungen.mjs` hätte auf allen Leistungsseiten die Cache-Stände von
  `leistung-mobile.css` (20261008l → 20261007d, also zurück) und `privat-form.css` verändert. Diese
  Stände wurden nach dem Build auf den committeten Wert zurückgesetzt. Die Ursache liegt in den
  Versionsangaben der Leistungs-JSONs und ist offen für einen eigenen AP.
- **Externe Links (`--extern`):** Eigene Adressen auf rohdich.de werden übersprungen (vor dem Go-live
  liefert die Domain noch die alte Seite). Lehnt ein Server HEAD ab, folgt einmal GET. Ergebnis: 0 Warnungen.
- Gerendert wurde per CDP in Chrome gemessen, Playwright war dafür nicht nötig.

### Sichtbarkeit der Tor-Kachel `.gate-door--gewerbe`

| Viewport | Ergebnis |
|---|---|
| 360×780, 390×844, 402×874, 430×932 | unsichtbar (`display:none` an `.gate-doors--saved-iphone`) |
| 852×393 (quer) | unsichtbar (ebenso) |
| 768×1024, 1024×768, 1280×800, 1440×900 | unsichtbar (ebenso) |

Damit war kein Eingriff ins CSS nötig. Die Kachel bleibt als Markup stehen, der Link darin ist die
einzige verbleibende Link-Warnung.

### 404 unter `/gibt/es/nicht/` (lokal, `scripts/preview.mjs`)

Status 404 · Titel „Seite nicht gefunden | Maik Rohdich“ · Schriften Outfit/Inter geladen · alle
sichtbaren Bilder geladen · keine fehlenden Dateien. Die einzige Konsolenmeldung ist der 404-Status
des Dokuments selbst (gewollt).

### Neu beschriebene Bilder (33 Hero-Fotos der Leistungsseiten)

| Datei | Alt-Text |
|---|---|
| `content/leistungen/gewerbe/aussenanlagenpflege.json` | Grünflächenpflege am Firmengebäude: Mitarbeiter mit Helm und Gehörschutz mäht mit dem Freischneider vor einer mit Glyzinien bewachsenen Fassade |
| `content/leistungen/privat/aussergewoehnliches-garten.json` | Außergewöhnliches für den Garten: große Buddha-Statue aus Stein zwischen Formgehölzen in Bonsai-Form, davor Natursteine und eine Steinschale |
| `content/leistungen/privat/baumarbeiten.json` | Baumfällung im Wohngebiet: gefällter Baumstamm mit Motorsäge auf Sägespänen, davor der Warnaufsteller „Baumfällung“ |
| `content/leistungen/privat/baumpflege.json` | Baumpflege mit Seilklettertechnik: Baumkletterer mit Seil, Klettergurt und Motorsäge bei Schnittarbeiten in der Krone eines Nadelbaums |
| `content/leistungen/privat/beleuchtung.json` | Gartenbeleuchtung bei Nacht: Pollerleuchte vor Natursteinfelsen am Teich, Rittersporn, Reiherfigur und Lichterketten am Baum |
| `content/leistungen/privat/bepflanzung.json` | Pflanzarbeiten mit insektenfreundlichen Pflanzen: Stecker „Bienenpflanze“ zwischen Bodendeckern im frisch bepflanzten Beet |
| `content/leistungen/privat/bonsai-formgehoelze.json` | Formgehölze und Gartenbonsais im Kiesvorgarten mit Chinaschilf, Ziergräsern, Findlingen und Gartenstrahlern vor zwei Wohnhäusern |
| `content/leistungen/privat/dachbegruenung.json` | Extensive Dachbegrünung mit Sedum (Fetthenne), Hauswurz, Blauschwingel und Feldsteinen auf mineralischem Substrat |
| `content/leistungen/privat/entwaesserung.json` | Entwässerung am Haus: orangefarbene KG-Rohre mit Abzweigen und Fallrohranschluss im offenen Sandgraben an der Hauswand |
| `content/leistungen/privat/erd-baggerarbeiten.json` | Erd- und Baggerarbeiten im Garten: Minibagger hebt eine große Baugrube hinter einem Einfamilienhaus aus |
| `content/leistungen/privat/ersatz-ausgleichspflanzungen.json` | Ersatzpflanzung: Hochstämme mit Drahtballen und Stammschutz aus Jute auf der Ladefläche, daneben Baumpfähle und Schubkarren |
| `content/leistungen/privat/feuerstellen.json` | Feuerstelle im Garten: rostige Feuerschale mit Motivrand auf Steinplatten in weißem Zierkies, daneben eine Lounge-Sitzgruppe |
| `content/leistungen/privat/findlinge-natursteineinfassungen.json` | Findling als Blickfang im Natursteinbeet aus Flusskieseln mit Glanzmispel, Koniferen, Ziergräsern und Blaukissen |
| `content/leistungen/privat/gartengestaltung.json` | Gartengestaltung mit geschwungener Rasenfläche, Pflastersteinkante, Rindenmulchbeeten, Margeriten und einer Buddha-Figur |
| `content/leistungen/privat/gartenpflege.json` | Gartenpflege im Team: Heckenschnitt von der Leiter, Rasen vertikutieren mit dem Vertikutierer und Rasenfilz zusammenrechen |
| `content/leistungen/privat/nassschneidearbeiten.json` | Nassschneidearbeiten: Mitarbeiter mit Gehörschutz und Arbeitshandschuhen schneidet einen Stein an der Steinsäge mit Wasserkühlung |
| `content/leistungen/privat/palmen-winterfest.json` | Palmen winterfest: Hanfpalmen im Schnee, kugelförmig geschnittenes Formgehölz und beleuchteter Pool in der Dämmerung |
| `content/leistungen/privat/pflasterreinigung-fugenreinigung.json` | Fugenreinigung mit der motorbetriebenen Wildkrautbürste: Pflastereinfahrt mit teils schon gereinigten Pflasterfugen |
| `content/leistungen/privat/pool-whirlpool-umfeld.json` | Pool- und Whirlpoolumfeld von oben: Pool mit Holzdeck, Whirlpool, Natursteinstufen, Kleinpflaster, Formgehölz und Hanfpalme |
| `content/leistungen/privat/rodungsarbeiten.json` | Rodungsarbeiten mit dem Minibagger: Bewuchs wird an einer Böschung neben Thuja-Hecke und Doppelstabmattenzaun abgetragen |
| `content/leistungen/privat/rohdichs-grubengold.json` | Rohdichs Grubengold: gestapelte 80-Liter-Säcke Pflanzsubstrat „Rohdich’s GrubenGold“ aus der Profi-Linie |
| `content/leistungen/privat/rollrasen.json` | Rollrasen verlegen: Mitarbeiter legt Rasensoden in einem Reihenhausgarten aus, daneben eine Rasenwalze |
| `content/leistungen/privat/saisonbepflanzung.json` | Saisonbepflanzung im Frühjahr: Terrakotta-Kübel mit Primeln, Hornveilchen, Narzissen und Vergissmeinnicht |
| `content/leistungen/privat/schredderarbeiten.json` | Häcksler für Schredderarbeiten auf einem Anhänger, abgestellt auf dem gepflasterten Betriebshof neben einem Lkw |
| `content/leistungen/privat/sichtschutzbepflanzung.json` | Sichtschutzbepflanzung aus Kirschlorbeer, Glanzmispel und Kiefer über einer Natursteinmauer, davor ein Hochbeet aus Holz |
| `content/leistungen/privat/stubbenfraeseneinsatz.json` | Stubbenfräseneinsatz: Stubbenfräse beim Abfräsen eines Baumstumpfs, ringsum liegen frische Holzspäne |
| `content/leistungen/privat/teichbau.json` | Gartenteich mit Seerosen, Sumpf- und Uferpflanzen, dahinter eine Hanfpalme, Rasenflächen und ein Weg aus Klinkerpflaster |
| `content/leistungen/privat/terrasse-pflasterarbeiten.json` | Pflasterarbeiten: frisch verlegtes Betonsteinpflaster mit Randsteinen, Schubkarre, Richtlatte und Wasserwaage |
| `content/leistungen/privat/verkehrssicherheit.json` | Verkehrssicherung bei Baumarbeiten: Warnaufsteller „Baumfällung“ auf der Straße vor Lkw und Minibagger |
| `content/leistungen/privat/vermessung-lasertechnik.json` | Rotationslaser für Höhenvermessung und Nivellierung am Rand einer Baugrube im Garten |
| `content/leistungen/privat/vorgarten.json` | Vorgartengestaltung mit Findlingen, Flusskies, Formgehölz, Polsterstauden und Betonpalisaden vor einer Klinkerfassade |
| `content/leistungen/privat/wurzelentfernung.json` | Wurzelentfernung mit dem Bagger: großer Wurzelstock mitsamt Erdreich aus dem Boden gehoben |
| `content/leistungen/privat/zaeune-sichtschutz.json` | Sichtschutzzaun in Anthrazit mit Kiesstreifen entlang einer gepflasterten Zufahrt zur Garage mit Sektionaltor |

Die Pflanzennamen Rittersporn, Chinaschilf, Blauschwingel, Blaukissen und Vergissmeinnicht sind nur
anhand der Fotos bestimmt. Bitte bei Gelegenheit von Maik bestätigen lassen.

Zusätzlich gekürzt: `ueber-uns/index.html`, Foto `ueber-baumarbeiten.webp` (154 → 114 Zeichen).

### Verbleibende Meldungen von `npm run check:golive`

- SEO: doppelter Projekttitel „Gartengestaltung in Herne“ (E1 aus AP-601, Umbenennung im CMS offen)
- Links, Warnung: Tor-Kachel → `/gewerbekunden/` (auf allen Breiten unsichtbar, siehe oben)
- Alt, Warnung: Zertifikat auf der Startseite, 181 Zeichen. Bewusst so gelassen: Bei einem Dokument
  ist die Abschrift der Inhalt.
