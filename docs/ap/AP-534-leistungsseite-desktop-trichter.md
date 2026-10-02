> **Umsetzungsvermerk (02.10.2026, Claude Code):** Geliefert als „AP-531“; die Nummer war auf
> `codex/homepage-review` schon belegt (Galerie), umgesetzt als **AP-534** (Nummer im Text
> ersetzt). Abweichungen vom Ablauf in §0:
> - Der `index.html`-Hunk passte nicht (dort stand inzwischen `main.js?v=20260930b`); die
>   Version ist von Hand auf `20261002a` gesetzt. Die übrigen vier Quelldateien kamen per
>   `git apply` (Check bestanden).
> - Die Vorlagen `leistung-v2.html`, `leistung.html`, `leistung-legacy-document.html` und
>   `rechtstext.html` trugen noch `footer-kontakt.css?v=20260930a`; der Build hätte alle
>   Leistungsseiten darauf zurückgedreht. Vorlagen auf `…b` nachgezogen.
> - Auf Ansage des Auftraggebers nur **eine** generierte Seite geändert: Die übrigen
>   Leistungsseiten (deren einzige Build-Änderung die `main.js`-Version war) sind auf HEAD
>   zurückgesetzt. Der nächste Build zieht ihnen die neue Version nach – ohne Wirkung, sie
>   tragen kein `data-reveal-late`.
> - QA §6 Punkt 4: Steht die H3 oben im Fenster, liegt die ganze Liste schon über der
>   72-%-Linie – alle Punkte sind dann sofort da. Gemessen wurde deshalb beim Scrollen von
>   oben in 60-px-Schritten: 1, 2, 3, 4, 5, dann Hinweis, Abschluss, Knopf, nie zwei je Schritt.
> - **E1 entschieden (02.10.2026):** Der Abschlusssatz steht am Desktop in der Kachel des
>   Handys (Fläche, Blütenstempel, Zeilen untereinander), 400px breit über dem Knopf.
>   Teil 5 des CSS-Blocks entsprechend gekürzt, `mobileCssVersion` → `20261002b`.
> - Auf Ansage (02.10.2026): Hinweistext im Blocksatz, Abschluss-Kachel 480px wie der Text,
>   beide mittig untereinander, Knopf darunter. (Kurz standen Text und Kachel nebeneinander;
>   auf Ansage zurück.) Das Raster liegt am Container der Textsektion.
> - Beim Umsetzen lagen Kopien `* 2.*` der vier gepatchten Quelldateien im Arbeitsbaum
>   (gitignored, inhaltsgleich mit HEAD, vermutlich iCloud). Die JSON-Kopie ließ
>   `build-leistungen.mjs` abbrechen; alle vier sind aus dem Projekt verschoben.
> - QA §6 Punkt 3: Die H2 bricht bei 34px und `max-width: 22ch` zweizeilig um (34 Zeichen
>   passen nicht in 22ch). Offen für den Auftraggeber.

# AP-534 — Leistungsseiten: Textbereich am Desktop als Trichter (Balkonkastenbepflanzung)

Stand 02.10.2026 · Seite `/privatkunden/leistungen/balkonkastenbepflanzung/` · nur Desktop ab 901 px.
Die Handy-Fassung bis 900 px bleibt pixelgleich. Die übrigen 37 Leistungsseiten bleiben unverändert (Ausrollen ist ein eigenes AP, siehe §7).

## 0. Kurz für Claude Code

1. Branch wie in AP-530 (`codex/homepage-review`). **Nicht** in `claude/kind-fermat-pyzy5p` committen oder mergen – der Deploy-Merge ist Saschas Schritt. Weicht der aktuelle Arbeitsbranch ab, vorher nachfragen.
2. AP-Nummer prüfen: `git log --all --oneline | grep -oE "AP-[0-9]+" | sort -t- -k2 -n -u | tail -3` und `git grep -hoE "AP-5[0-9]{2}" -- . | sort -u | tail -3`. Stand bei Erstellung: höchste belegte Nummer AP-530 (nur im Arbeitsbaum geprüft, `git log` lag als Shallow-Clone nicht vor). Ist AP-534 belegt, nächste freie nehmen und in Patch, Kommentaren, Versionsstring-Kommentaren und Dateinamen dieses Dokuments ersetzen.
3. Den Patch aus §4 als `/tmp/ap531.diff` speichern, `git apply --check /tmp/ap531.diff`, dann `git apply /tmp/ap531.diff`. Der Patch ist gegen den Stand `beedaab` („chore: Projekt-Index & Sitemap aktualisiert“) von `claude/kind-fermat-pyzy5p` erzeugt und mit `git apply --check` geprüft; er umfasst **nur die fünf Quelldateien**, nicht die generierten Seiten.
   Schlägt `--check` fehl: Änderungen von Hand nach §3 einspielen – Python mit `encoding="utf-8"`, vor jedem Ersetzen `assert s.count(old) == 1`. **Kein Perl.**
4. Build: `cd .github/scripts && node build-leistungen.mjs`. Erwartung: 38 Leistungsseiten + `index.html` werden neu geschrieben (Grund: neue `main.js`-Version aus `index.html`), **inhaltlich** ändert sich nur `privatkunden/leistungen/balkonkastenbepflanzung/index.html` (§3.6). Generierte HTML-Dateien nie von Hand anfassen.
5. QA nach §6, dann dieses Dokument nach `docs/ap/AP-534-leistungsseite-desktop-trichter.md` legen.
6. Ein Commit: `AP-534: Leistungsseite Balkonkasten - Textbereich am Desktop als Trichter`

## 1. Auftrag

Freigegeben per Mockup (`leistungsseite-desktop-mockup.html`, Variante **8 · Mittig, beidseitig** in der letzten Fassung „Text mittig in einer Spalte“). Der Textbereich zwischen dem Held-Knopf und „JETZT ANFRAGEN“ wird am Desktop neu aufgebaut; Held (Titel, Foto, Knopf) und alles ab der Galerie bleiben wie sie sind.

Ziel laut Sascha: Der Kunde soll mit den Augen geführt werden statt erschlagen; optisch nicht zu viel; die beiden Einstiegstexte nebeneinander; die Punkte sollen beim Scrollen einzeln erscheinen, „damit es nicht zu viel auf einmal ist“.

Aufbau am Rechner (Satzspiegel 1080 px):

```
┌──────────────────────── 1080 px ─────────────────────────┐
│          Ein Stück Garten vor Ihrem Fenster  (H2, 34 px) │
│                                                          │
│  Einstieg (≤ 46 ch)        │        Standort (≤ 46 ch)   │   ← 1 px Haarlinie, grün, oben/unten auslaufend
│                                                          │
│         Wir bringen Farbe an Balkon und Fenster (32 px)  │
│                  ┌──── 480 px ────┐                      │
│                  │ ✿ Punkt 1       │ ← erscheint einzeln  │
│                  │ ✿ Punkt 2       │                      │
│                  │ … Punkt 5       │                      │
│                  │ Hinweistext     │                      │
│                  └─────────────────┘                      │
│              Abschlusssatz, zentriert (≤ 400 px)         │
│                 [ JETZT ANFRAGEN  → ]  400 px            │
└──────────────────────────────────────────────────────────┘
```

Oben breit, ab der Leistungsüberschrift sammelt sich alles auf der Mittelachse bis zum Knopf.

### 1.1 Zwei Abweichungen zwischen Mockup und Live-Stand – so werden sie aufgelöst

- **Listenpunkte.** Das Mockup zeigte die Punkte mit kleinem grünen Haken, 17,5 px normal, 18 px Abstand. Live (Handy, `lpv2-page--homepage-unified`) stehen sie fett 19 px weiß, mit der Blüte als Marke (30 px), 20 px Innenabstand und Trennlinien. **Die Live-Darstellung bleibt** – das Handy gilt als final, und der Desktop soll „wie auf dem Handy, nur breiter“ sein. Das Mockup hatte die Handy-Liste nur angenähert. Geändert werden nur Breite (480 px statt 34 ch) und Mittigkeit.
- **Abschluss.** Live steht der Abschlusssatz auf dem Handy in einem grün getönten Kasten mit Blütenstempel. Das Mockup (Variante 8) zeigte ihn ohne Kasten, zentriert, darunter den Knopf 400 px. **Umgesetzt wird das Mockup** – Entscheidung **E1** in §7, falls Maik den Kasten am Desktop vermisst.

## 2. Ist-Zustand und Herleitung

### 2.1 Woher die Enge kommt (AP-512)

Seit AP-512 (30.09.2026) läuft die Handy-Fassung auf allen Breiten. Ab 901 px setzt `leistung-mobile.css` `.lpv2-page .lpv2-main{max-width:32rem;zoom:1.25}`: 512 px Spalte, durch `zoom` auf 640 px sichtbar; `container-type:inline-size` auf `.lpv2-main`, damit `cqw`-Maße (Knöpfe, Galeriefenster) die Spalte messen. Folge: jede Sektion, auch die Textsektion, ist 640 px breit, der Fließtext steht mit 22,5 px (18 px × 1,25), alles ist zentriert und gleich laut.

Der Trichter braucht 1080 px bei `zoom:1` **nur für die Textsektion**. `zoom` lässt sich nicht pro Kind aufheben, deshalb wandert die Spaltenregel von `.lpv2-main` auf die einzelnen Sektionen:

| vorher (AP-512, ≥ 901 px) | nachher (nur `lpv2-page--desktop-trichter`) |
|---|---|
| `.lpv2-main{max-width:32rem;zoom:1.25;container-type:inline-size}` | `.lpv2-main{max-width:none;zoom:1;container-type:normal}` |
| Sektionen erben Breite und Zoom | `.lpv2-main > article > section:not(.lpv2-content-feature){max-width:32rem;margin-inline:auto;zoom:1.25;container-type:inline-size}` |

Jede Sektion außer der Textsektion ist damit für sich genommen exakt, was `.lpv2-main` vorher war: 32rem, 1,25-fach, eigener Container für `cqw`. Held, Galerie, Fragen, Kontakt und Ergänzungen sehen deshalb aus wie heute (QA §6, Punkt 2 misst das nach). Die versteckte `.lpv2-editorial` bekommt die Regel ebenfalls – `display:none`, wirkungslos.

### 2.2 Abgeleitete Werte

| Wert | Herleitung |
|---|---|
| Satzspiegel `min(100% - 48px, 1080px)` | 1080 = 640 (Heldspalte) × 1,6875; bei 1280 px bleiben 100 px Rand, bei 1024 px wird er 976 px breit. Entspricht dem Mockup. |
| Spalten `minmax(0,1fr) 1px minmax(0,1fr)`, `column-gap:52px` | Bei 1080: (1080 − 1 − 104) / 2 = 487,5 px je Spalte. Mockup: 52 px Gasse. |
| Absätze `max-width:46ch` | Nunito 18 px: 1 ch ≈ 9,9 px → 46 ch ≈ 455 px, passt mit Luft in 487 px. Bei 976 px Satzspiegel (435 px je Spalte) bricht der Absatz früher um – kein Overflow, da `minmax(0,1fr)`. |
| Haarlinie `linear-gradient(180deg, transparent, grün 18%, grün 82%, transparent)`, `opacity:.55` | wie Mockup (Varianten 1, 6, 7, 8); Farbe `--mobile-logo-green` wie die Überschriften. |
| H2 `2.125rem` (34 px), `max-width:22ch` | Mockup 34 px. Handy: `clamp(1.45rem,6.4vw,1.6rem)` → 1,6 rem × 1,25 = 32 px sichtbar; am Desktop ohne Zoom 2 px größer, dafür auf echter Breite. 22 ch Baloo 34 px ≈ 400 px → „Ein Stück Garten vor Ihrem Fenster“ bleibt einzeilig bis ~720 px Satzspiegel. |
| H3 `2rem` (32 px), `max-width:26ch` | Mockup 32 px. „Wir bringen Farbe an Balkon und Fenster“ (39 Zeichen) → zwei Zeilen zentriert, wie im Mockup. |
| Listenspalte `480px` | Mockup: 52 ch bei 16 px ≈ 460 px. 480 px aufgerundet, damit die 19-px-Punkte (Handy-Stil) ~45 Zeichen je Zeile bekommen; längster Punkt (73 Zeichen) → zwei Zeilen. |
| Abschluss `max-width:400px`, Knopf `400px` | Knopfbreite wie Mockup; der Text sitzt auf derselben Breite, damit Satz und Knopf eine Säule bilden. Knopfhöhe 64 px kommt aus der kopierten `.maik-cta`-Regel (≥ 481 px, `:where(.lpv2-main)`), Beschriftung 1,1 rem aus `.lpv2-page .lpv2-closing-cta .maik-cta__label`. |
| Sektion `padding:80px 0 96px` | Oben: Handy-Übergang 64 px × 1,25 = 80 px sichtbar, am Desktop ohne Zoom als 80 px gesetzt – der Abstand zum Held-Knopf bleibt optisch gleich. Unten 96 px, damit die Galerie (eigene Spalte, eigener Zoom) Luft bekommt. |
| Abstände: H2 → Absätze 40 px, Absätze → H3 92 px, H3 → Liste 40 px, Hinweis → Abschluss 32 px, Abschluss → Knopf 20 px | Mockup: 40 / 92 / 40 / 26 / 14. Die letzten beiden um 6 px vergrößert, weil Live-Abschluss (Baloo 19 px, 1,5) und Knopfrahmen (6 px versetzt) mehr Masse haben als im Mockup. |
| Erscheinen: `translateY(12px)`, `.55s`, Auslöselinie 72 % | Mockup: 12 px / 0,5 s / 72 % Fensterhöhe. Der Seitenstandard (`styles.css .reveal`) ist 24 px / 0,9 s / 90 % – zu träge für fünf dicht stehende Punkte. |

### 2.3 Wie das Erscheinen funktioniert

`main.js` registriert alle `.reveal`-Elemente in einem `IntersectionObserver` mit `rootMargin: 0 0 -10% 0` – Auslösung, wenn die Oberkante 90 % der Fensterhöhe passiert. Fünf Listenpunkte à ~70 px lägen damit innerhalb von 350 px Scrollweg alle sichtbar, zudem ganz unten im Fenster. Deshalb kommt ein zweiter Beobachter (`rootMargin: 0 0 -28% 0`, Auslösung bei 72 %) für Elemente mit `data-reveal-late`, **nur** wenn `matchMedia('(min-width: 901px)')` beim Laden zutrifft. Unter 901 px laufen die Elemente in den normalen Beobachter – Handy unverändert. Für den GSAP-Pfad (Startseite) gilt analog `start: 'top 72%'`; die Leistungsseiten laden kein GSAP.

Welche Elemente das Attribut bekommen, entscheidet der Build am JSON-Feld `desktopLayout: "trichter"` – nur dann tragen die `<li>` die Klasse `reveal`. Auf dem Handy neutralisiert eine Regel außerhalb der Media Query diese Klasse an Liste und Hinweistext (`opacity:1; transform:none; transition:none`), damit die Handy-Fassung nicht plötzlich Punkt für Punkt einblendet. Abschlusssatz und Knopf tragen `reveal` schon heute; auf dem Handy ändert sich für sie nichts.

Die Überschrift `.lpv2-content-lead` wird am Desktop `display:contents` (damit H2 und Einstieg eigene Rasterzellen sind). Ihr `reveal` wirkt dann nicht mehr – H2 und Einstiegstext stehen sofort. Das ist gewollt: Sie sind der ruhige Block, der schon beim Erreichen der Sektion da sein soll.

## 3. Änderungen nach Fundstelle

Keine Zeilennummern; Fundstellen über Klassennamen, Funktionsnamen und eindeutige Textsignaturen.

### 3.1 `content/leistungen/privat/balkonkastenbepflanzung.json`

- `"mobileCssVersion": "20260930d"` → `"20261002a"` (Cache-Buster für `leistung-mobile.css`, nur diese Seite).
- Neu, direkt danach: `"desktopLayout": "trichter"`. Alle anderen JSON-Dateien bleiben ohne das Feld.

### 3.2 `.github/scripts/lib/render.mjs`

- `lpv2HomepageCta(...)`: achter, optionaler Parameter `attrs = ''`, wird roh in das öffnende `<a …${attrs}>` geschrieben. Bestehende Aufrufe ändern sich nicht.
- `lpv2Closing(...)`: `const late = leistung.desktopLayout === 'trichter' ? ' data-reveal-late' : ''` – an `<p class="lpv2-closing lpv2-closing-lines reveal">` und als `attrs` an den Knopf.
- `lpv2ContentSection(...)`: `late` wie oben; `<li>` wird zu `<li class="reveal" data-reveal-late>`, `<div class="lpv2-content-service-copy">` zu `<div class="lpv2-content-service-copy reveal" data-reveal-late>` – **nur** bei `late`, sonst byte-identisch zu heute.
- `renderLeistungPage(...)`, `pageVariantClass`: hängt `' lpv2-page--desktop-trichter'` an, wenn `presented.desktopLayout === 'trichter'`.

### 3.3 `assets/js/main.js` (Block „Scroll reveal“)

- Vor `const gsapRevealEnabled`: `const lateRevealActive = window.matchMedia('(min-width: 901px)').matches;` und `const isLateReveal = (el) => lateRevealActive && el.hasAttribute('data-reveal-late');`
- `revealWithGsap`: `start: isWelcomePhoto ? 'top bottom+=72px' : (isLateReveal(el) ? 'top 72%' : 'top 88%')`
- Nach dem Block, der `revealObserver` erzeugt: zweiter Beobachter `revealObserverLate` (`rootMargin: '0px 0px -28% 0px'`, `threshold: 0.08`), nur wenn `revealObserver && lateRevealActive`.
- `registerReveal`: `else if (revealObserverLate && isLateReveal(el)) revealObserverLate.observe(el);` vor dem bisherigen `else revealObserver.observe(el);`

### 3.4 `assets/css/leistung-mobile.css`

Neuer Block **am Dateiende**, nach dem `prefers-reduced-motion`-Block (Kommentar „AP-534“). Inhalt vollständig im Patch (§4). Gliederung: Neutralisierung außerhalb der Media Query; dann `@media (min-width:901px)` mit sechs nummerierten Teilen (Spalte/Zoom, Satzspiegel, Zeile 1–2, Zeile 3, Abschluss, Erscheinen). Alle Selektoren beginnen mit `.lpv2-page--desktop-trichter`, keine `:root`-Tokens werden angefasst.

### 3.5 `index.html`

`main.js?v=20260923f` → `main.js?v=20261002a` (genau eine Fundstelle). `index.html` ist Quelle der Wahrheit; `build-leistungen.mjs` liest die Version und schreibt sie in alle Leistungsseiten. Die Handseiten (`kontakt/`, `ueber-uns/`, `404.html`, Rechtstexte) behalten ihre Version – sie enthalten kein `data-reveal-late`, das neue `main.js` ändert für sie nichts.

### 3.6 Generierte Seiten (Ergebnis des Builds, nicht von Hand)

- 38 Leistungsseiten: nur die `main.js`-Version.
- `privatkunden/leistungen/balkonkastenbepflanzung/index.html` zusätzlich: `leistung-mobile.css?v=20261002a`, `<body class="… lpv2-page--desktop-trichter">`, fünf `<li class="reveal" data-reveal-late>`, `lpv2-content-service-copy reveal` mit Attribut, `data-reveal-late` an Abschluss und Knopf (je zweimal – einmal in `.lpv2-content-feature`, einmal in der versteckten `.lpv2-editorial`).

## 4. Patch (Quelldateien)

Gegen `beedaab` auf `claude/kind-fermat-pyzy5p`; `git apply --check` bestanden; Build danach fehlerfrei und deterministisch (zweiter Lauf: keine Änderung).

```diff
diff --git a/.github/scripts/lib/render.mjs b/.github/scripts/lib/render.mjs
index 5d5747a..b9bb207 100644
--- a/.github/scripts/lib/render.mjs
+++ b/.github/scripts/lib/render.mjs
@@ -1121,13 +1121,13 @@ function lpv2MobileCtaLabelClass(label) {
   return 'maik-cta__label--compact';
 }
 
-function lpv2HomepageCta(label, base, extraClass = '', href = '#kontakt', attention = true, labelClass = '', icon = 'arrow') {
+function lpv2HomepageCta(label, base, extraClass = '', href = '#kontakt', attention = true, labelClass = '', icon = 'arrow', attrs = '') {
   const classes = [extraClass, 'maik-cta', attention ? 'maik-cta--attention' : '', 'reveal'].filter(Boolean).join(' ');
   const labelClasses = ['maik-cta__label', labelClass].filter(Boolean).join(' ');
   const iconHtml = icon === 'phone'
     ? `<img class="maik-cta__phone-icon" src="${base}assets/img/icons/phone-header-mobile.png?v=20260902a" alt="" width="24" height="24" decoding="async">`
     : `<svg viewBox="0 0 24 24" focusable="false"><path d="M5 12h14M13 6l6 6-6 6"/></svg><img class="maik-cta__arrow-image" src="${base}assets/img/icons/maik-rohdich-cta-pfeil-rechts.svg" alt="" width="1883" height="567" decoding="async">`;
-  return `<a class="${escAttr(classes)}" href="${escAttr(href)}">
+  return `<a class="${escAttr(classes)}" href="${escAttr(href)}"${attrs}>
           <svg class="maik-cta__halo" viewBox="0 0 360 64" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path class="maik-cta__halo-line--wide" d="M14 0H316Q322 0 328 3L352 13Q360 16 360 24V50Q360 64 346 64H14Q0 64 0 50V14Q0 0 14 0Z" vector-effect="non-scaling-stroke"/><path class="maik-cta__halo-line--medium" d="M14 0H316Q322 0 328 3L352 13Q360 16 360 24V50Q360 64 346 64H14Q0 64 0 50V14Q0 0 14 0Z" vector-effect="non-scaling-stroke"/><path class="maik-cta__halo-line--core" d="M14 0H316Q322 0 328 3L352 13Q360 16 360 24V50Q360 64 346 64H14Q0 64 0 50V14Q0 0 14 0Z" vector-effect="non-scaling-stroke"/></svg>
           <svg class="maik-cta__frame" viewBox="0 0 360 64" preserveAspectRatio="none" aria-hidden="true" focusable="false"><use href="#maik-cta-shape"/></svg>
           <svg class="maik-cta__shape" viewBox="0 0 360 64" preserveAspectRatio="none" aria-hidden="true" focusable="false"><use href="#maik-cta-shape"/></svg>
@@ -1146,14 +1146,23 @@ function lpv2Closing(leistung, base) {
     ? configuredLines.map((line) => `<span>${esc(line)}</span>`).join('\n          ')
     : text;
   const label = leistung.closingCtaLabel || 'Beratung vereinbaren';
+  // AP-534: Am Rechner (Trichter-Layout) erscheinen Abschluss und Knopf erst bei 72 %
+  // Fensterhoehe (data-reveal-late, main.js). Auf dem Handy wirkt das Attribut nicht.
+  const late = leistung.desktopLayout === 'trichter' ? ' data-reveal-late' : '';
   return `<div class="lpv2-closing-block">
-        <p class="lpv2-closing lpv2-closing-lines reveal">${copy}</p>
-        ${lpv2HomepageCta(label, base, 'lpv2-closing-cta', leistung.ctaHref || '#kontakt', true, '', leistung.ctaIcon || 'arrow')}
+        <p class="lpv2-closing lpv2-closing-lines reveal"${late}>${copy}</p>
+        ${lpv2HomepageCta(label, base, 'lpv2-closing-cta', leistung.ctaHref || '#kontakt', true, '', leistung.ctaIcon || 'arrow', late)}
       </div>`;
 }
 
 function lpv2ContentSection(leistung, base) {
   if (leistung.contentVariant !== 'editorial') return '';
+  // AP-534: Trichter-Layout am Rechner - Listenpunkte und Hinweistext erscheinen einzeln
+  // beim Scrollen. Nur diese Seiten tragen die Klasse reveal an den Punkten; die
+  // Handy-Fassung neutralisiert sie (leistung-mobile.css, Block AP-534).
+  const late = leistung.desktopLayout === 'trichter';
+  const liAttrs = late ? ' class="reveal" data-reveal-late' : '';
+  const copyAttrs = late ? ' reveal" data-reveal-late' : '"';
   const intro = lpv2MobileParagraphs(leistung.einstieg || [], leistung.mobileEinstieg);
   const contentBlocks = (leistung.inhalt || []).map((block) => {
     const paragraphs = lpv2MobileParagraphs(
@@ -1162,10 +1171,10 @@ function lpv2ContentSection(leistung, base) {
       block.mobileNaturalWrapParagraphs,
       block.mobileAccentPhoneParagraphs,
     );
-    const bullets = (block.bullets || []).map((item) => `<li>${escMobileCopy(item)}</li>`).join('');
+    const bullets = (block.bullets || []).map((item) => `<li${liAttrs}>${escMobileCopy(item)}</li>`).join('');
     const heading = block.heading ? `<h3>${esc(block.heading)}</h3>` : '';
     const list = bullets ? `<ul class="lpv2-list lpv2-content-list">${bullets}</ul>` : '';
-    const copy = paragraphs ? `<div class="lpv2-content-service-copy">${paragraphs}</div>` : '';
+    const copy = paragraphs ? `<div class="lpv2-content-service-copy${copyAttrs}>${paragraphs}</div>` : '';
     const diagram = leistung.diagram === 'baumkontrolle' && block.heading === 'Von der Kontrolle zur passenden Maßnahme'
       ? lpv2DecisionGraphic(base)
       : '';
@@ -1389,7 +1398,7 @@ export async function renderLeistungPage(opts) {
       mobileCssVersion: escAttr(presented.mobileCssVersion || '20260924z6'),
       ctaFamilyVersion: escAttr(presented.ctaFamilyVersion || '20260919a'),
       heroVariantClass: `${imageFirstHero ? ' lpv2-page--image-first' : ''}${heroTitleAbove ? ' lpv2-page--title-above' : ''}${heroTitleGraphic ? ' lpv2-page--title-graphic' : ''}`,
-      pageVariantClass: `${presented.relatedVariant === 'homepage' ? ' lpv2-page--homepage-unified' : ''}${presented.contentVariant === 'editorial' ? ' lpv2-page--content-feature' : ''}`,
+      pageVariantClass: `${presented.relatedVariant === 'homepage' ? ' lpv2-page--homepage-unified' : ''}${presented.contentVariant === 'editorial' ? ' lpv2-page--content-feature' : ''}${presented.desktopLayout === 'trichter' ? ' lpv2-page--desktop-trichter' : ''}`,
       title: esc(presented.title), ogTitle: escAttr(presented.title),
       description: escAttr(truncate(presented.metaDescription, 160)), canonical: escAttr(canonical),
       ogImage: escAttr(absUrl(hero.bild)), heroPreload: lcpPreloadFor(hero.bild, heroTitleAbove ? '(max-width: 480px) calc(100vw - 64px), 100vw' : '100vw', base),
diff --git a/assets/css/leistung-mobile.css b/assets/css/leistung-mobile.css
index f4d133c..1b5682e 100644
--- a/assets/css/leistung-mobile.css
+++ b/assets/css/leistung-mobile.css
@@ -520,3 +520,65 @@
   html.lpv2-root{scroll-behavior:auto}
   .lpv2-page *{scroll-behavior:auto!important;transition-duration:.01ms!important;animation-duration:.01ms!important;animation-iteration-count:1!important}
 }
+
+/* ---------- AP-534: Trichter-Layout am Rechner (Seiten mit desktopLayout "trichter") ----------
+   Freigegeben per Mockup (leistungsseite-desktop-mockup.html, Variante 8). Gilt nur ab 901px
+   und nur fuer Seiten mit der Klasse lpv2-page--desktop-trichter (Build setzt sie aus dem
+   JSON-Feld desktopLayout). Handy bis 900px bleibt unveraendert - die einzige Regel ausserhalb
+   der Media Query neutralisiert die neuen reveal-Klassen der Listenpunkte dort.
+
+   Aufbau am Rechner: Held, Galerie, Fragen, Kontakt und Ergaenzungen bleiben die 32rem-Spalte
+   mit zoom 1.25 aus AP-512 - nur traegt jetzt jede dieser Sektionen die Spalte selbst, nicht
+   mehr .lpv2-main. So kann die Textsektion (.lpv2-content-feature) auf 1080px Satzspiegel bei
+   zoom 1 ausbrechen. container-type wandert mit, damit cqw-Masse weiter die 32rem-Spalte messen.
+
+   Textsektion: Ueberschrift mittig (34px), darunter Einstieg und Standort-Absatz nebeneinander,
+   getrennt durch eine gruene Haarlinie; dann die Leistungsueberschrift mittig (32px) und eine
+   einzige 480px-Spalte - Liste wie auf dem Handy (Bluete, Trennlinien), Hinweistext, Abschluss
+   zentriert, Knopf 400px. Liste, Hinweistext, Abschluss und Knopf erscheinen einzeln beim
+   Scrollen (data-reveal-late, main.js: Ausloeselinie 72 % Fensterhoehe). */
+.lpv2-page--desktop-trichter .lpv2-content-service .lpv2-content-list li.reveal,
+.lpv2-page--desktop-trichter .lpv2-content-service-copy.reveal{opacity:1;transform:none;transition:none}
+
+@media (min-width:901px){
+  /* 1 - Spalte und Zoom von .lpv2-main auf die Sektionen, Textsektion ausgenommen */
+  .lpv2-page--desktop-trichter .lpv2-main{max-width:none;zoom:1;container-type:normal}
+  .lpv2-page--desktop-trichter .lpv2-main > article > section:not(.lpv2-content-feature){max-width:32rem;margin-inline:auto;zoom:1.25;container-type:inline-size}
+
+  /* 2 - Satzspiegel der Textsektion */
+  .lpv2-page--desktop-trichter .lpv2-content-feature{padding:80px 0 96px}
+  .lpv2-page--desktop-trichter .lpv2-content-feature > .container{width:min(100% - 48px,1080px);max-width:none;margin-inline:auto;padding:0;container-type:inline-size}
+  .lpv2-page--desktop-trichter .lpv2-content-editorial{display:grid;grid-template-columns:minmax(0,1fr) 1px minmax(0,1fr);column-gap:52px;row-gap:0;padding:0}
+  .lpv2-page--desktop-trichter .lpv2-content-feature .lpv2-mobile-keep{white-space:normal}
+
+  /* 3 - Zeile 1: Ueberschrift ueber die ganze Breite; Zeile 2: zwei Absaetze an der Haarlinie */
+  .lpv2-page--desktop-trichter .lpv2-content-lead{display:contents}
+  .lpv2-page--desktop-trichter .lpv2-content-lead h2{grid-column:1 / -1;grid-row:1;width:auto;max-width:22ch;margin:0 auto;font-size:2.125rem;line-height:1.14}
+  .lpv2-page--desktop-trichter .lpv2-content-lead h2.lpv2-content-title--long{font-size:2.125rem;line-height:1.14}
+  .lpv2-page--desktop-trichter .lpv2-content-lead .lpv2-content-flow-copy--intro{grid-column:1;grid-row:2;margin-top:40px}
+  .lpv2-page--desktop-trichter .lpv2-content-editorial::before{content:'';grid-column:2;grid-row:2;margin-top:40px;background:linear-gradient(180deg,transparent,var(--mobile-logo-green,#56e607) 18%,var(--mobile-logo-green,#56e607) 82%,transparent);opacity:.55}
+  .lpv2-page--desktop-trichter .lpv2-content-context{grid-column:3;grid-row:2;justify-self:end;width:100%;margin-top:40px}
+  .lpv2-page--desktop-trichter :is(.lpv2-content-lead,.lpv2-content-context) p{max-width:46ch;margin-inline:0}
+
+  /* 4 - Zeile 3: Leistungsueberschrift mittig, darunter eine 480px-Spalte */
+  .lpv2-page--desktop-trichter .lpv2-content-service{grid-column:1 / -1;grid-row:3;margin-top:92px}
+  .lpv2-page--desktop-trichter .lpv2-content-service h3{width:auto;max-width:26ch;margin:0 auto;font-size:2rem;line-height:1.17}
+  .lpv2-page--desktop-trichter .lpv2-content-service .lpv2-content-list{max-width:480px;margin:40px auto 0}
+  .lpv2-page--desktop-trichter .lpv2-content-service-copy{max-width:480px;margin-inline:auto}
+  .lpv2-page--desktop-trichter .lpv2-content-service-copy p{max-width:none}
+
+  /* 5 - Abschluss: Text zentriert ohne Kasten, Knopf 400px als Trichterende */
+  .lpv2-page--desktop-trichter .lpv2-content-closing{margin-top:32px}
+  .lpv2-page--desktop-trichter .lpv2-content-closing .lpv2-closing{max-width:400px;margin:0 auto;padding:0;border-radius:0;background:none;box-shadow:none;font-size:1.1875rem;text-align:center}
+  .lpv2-page--desktop-trichter .lpv2-content-closing .lpv2-closing:after{content:none}
+  .lpv2-page--desktop-trichter .lpv2-closing-lines > span{display:inline}
+  .lpv2-page--desktop-trichter .lpv2-content-closing .lpv2-closing-cta{width:400px;margin:20px auto 0}
+
+  /* 6 - Erscheinen beim Scrollen: kurz und flach statt 24px/0.9s wie im Rest der Seite */
+  .lpv2-page--desktop-trichter .lpv2-content-service .lpv2-content-list li.reveal,
+  .lpv2-page--desktop-trichter .lpv2-content-service-copy.reveal,
+  .lpv2-page--desktop-trichter .lpv2-content-closing :is(.lpv2-closing,.lpv2-closing-cta).reveal{opacity:0;transform:translateY(12px);transition:opacity .55s var(--ease),transform .55s var(--ease)}
+  .lpv2-page--desktop-trichter .lpv2-content-service .lpv2-content-list li.reveal.is-in,
+  .lpv2-page--desktop-trichter .lpv2-content-service-copy.reveal.is-in,
+  .lpv2-page--desktop-trichter .lpv2-content-closing :is(.lpv2-closing,.lpv2-closing-cta).reveal.is-in{opacity:1;transform:none}
+}
diff --git a/assets/js/main.js b/assets/js/main.js
index 7ca6b90..7ae58da 100644
--- a/assets/js/main.js
+++ b/assets/js/main.js
@@ -309,6 +309,13 @@
     el.classList.add('is-in');
   };
 
+  // AP-534: Elemente mit data-reveal-late erscheinen am Rechner (ab 901px) erst, wenn ihre
+  // Oberkante 72 % der Fensterhoehe erreicht - statt 90 % wie alle anderen. So kommen die
+  // Listenpunkte der Leistungsseiten einzeln beim Scrollen. Unter 901px gilt das Attribut
+  // nicht; die Handy-Fassung bleibt unveraendert.
+  const lateRevealActive = window.matchMedia('(min-width: 901px)').matches;
+  const isLateReveal = (el) => lateRevealActive && el.hasAttribute('data-reveal-late');
+
   const gsapRevealEnabled = !reduced && Boolean(window.gsap && window.ScrollTrigger);
   if (gsapRevealEnabled) {
     window.gsap.registerPlugin(window.ScrollTrigger);
@@ -341,7 +348,7 @@
       ease: 'power2.out',
       scrollTrigger: {
         trigger: el,
-        start: isWelcomePhoto ? 'top bottom+=72px' : 'top 88%',
+        start: isWelcomePhoto ? 'top bottom+=72px' : (isLateReveal(el) ? 'top 72%' : 'top 88%'),
         once: true
       },
       onStart: () => {
@@ -365,6 +372,18 @@
     }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
   }
 
+  // AP-534: zweiter Beobachter, Ausloeselinie bei 72 % statt 90 % der Fensterhoehe.
+  let revealObserverLate = null;
+  if (revealObserver && lateRevealActive) {
+    revealObserverLate = new IntersectionObserver((entries) => {
+      entries.forEach((entry) => {
+        if (!entry.isIntersecting) return;
+        revealNow(entry.target);
+        revealObserverLate.unobserve(entry.target);
+      });
+    }, { rootMargin: '0px 0px -28% 0px', threshold: 0.08 });
+  }
+
   const registerReveal = (root = document) => {
     const candidates = [];
     if (root.nodeType === Node.ELEMENT_NODE && root.matches('.reveal')) candidates.push(root);
@@ -374,6 +393,7 @@
       registeredRevealElements.add(el);
       if (gsapRevealEnabled) revealWithGsap(el);
       else if (!revealObserver) revealNow(el);
+      else if (revealObserverLate && isLateReveal(el)) revealObserverLate.observe(el);
       else revealObserver.observe(el);
     });
   };
diff --git a/content/leistungen/privat/balkonkastenbepflanzung.json b/content/leistungen/privat/balkonkastenbepflanzung.json
index 2f7b2b8..72407c3 100644
--- a/content/leistungen/privat/balkonkastenbepflanzung.json
+++ b/content/leistungen/privat/balkonkastenbepflanzung.json
@@ -12,7 +12,8 @@
     "gerne zur Verfügung."
   ],
   "themeColor": "#171916",
-  "mobileCssVersion": "20260930d",
+  "mobileCssVersion": "20261002a",
+  "desktopLayout": "trichter",
   "ctaFamilyVersion": "20260926b",
   "h1": "Balkonkastenbepflanzung",
   "heroTitleLines": [
diff --git a/index.html b/index.html
index 4c42a91..3633f8c 100644
--- a/index.html
+++ b/index.html
@@ -2516,7 +2516,7 @@ html.home-theme-dark body { background-color: #1B1E19; }
 
 <script src="assets/vendor/gsap/gsap.min.js?v=3.13.0" defer></script>
 <script src="assets/vendor/gsap/ScrollTrigger.min.js?v=3.13.0" defer></script>
-<script src="assets/js/main.js?v=20260923f" defer></script>
+<script src="assets/js/main.js?v=20261002a" defer></script>
 <script src="assets/js/mobile-qualifications.js?v=20260909a" defer></script>
 <script src="assets/js/mobile-social-proof-gallery.js?v=20260930a" defer></script>
 <script src="assets/js/cta-signal.js?v=20260914a" defer></script>
```

## 5. Stopp-Regeln

- **Handy bis 900 px pixelgleich.** Alle neuen Regeln sitzen hinter `@media (min-width:901px)` – bis auf die Neutralisierung der `reveal`-Klasse an Liste und Hinweistext, die die Handy-Darstellung gerade *erhält*. QA §6, Punkt 1.
- **Held unangetastet.** Titel, Foto, Blütenstempel, Knopf, „Alle Leistungen“ – keine Regel in diesem AP zielt auf `.lpv2-hero`. Die Sektionsregel aus §2.1 gibt dem Held nur, was er über `.lpv2-main` ohnehin hatte.
- **Listenpunkte im Live-Stil** (Blüte, 19 px fett, Trennlinien). Keine Haken, kein Umbau der `li`-Regeln aus dem `homepage-unified`-Block.
- **Kein Perl, keine generierten Dateien von Hand, keine `:root`-Tokens, kein `overflow:hidden` am Footer.** `data/images.json` und `admin/config.yml` bleiben unberührt.
- **Nur diese eine Seite** bekommt `desktopLayout`. Die anderen 37 JSON-Dateien nicht anfassen – auch nicht „wo wir schon dabei sind“.
- **Header-Knöpfe** bleiben, wie sie sind.

## 6. QA (Chromium, Playwright; 901, 1024, 1280, 1440 px; außerdem 375 und 480 px)

1. **Handy-Abgleich.** Screenshot der Balkonkastenseite bei 375 px und 480 px vor und nach dem Patch (Full Page) pixelweise vergleichen (Pillow, Differenzbild). Erwartung: 0 abweichende Bildpunkte – Reveal-Zustände vorher per `document.querySelectorAll('.reveal').forEach(e=>e.classList.add('is-in'))` vereinheitlichen.
2. **Übrige Sektionen am Desktop.** Bei 1280 px `getBoundingClientRect()` von `.lpv2-hero`, `.lpv2-gallery-grid-section`, `.lpv2-faq`, `.private-contact`, `.lpv2-related` vor/nach: Breite 640 px (32rem × 1,25), gleiche `left`-Kante; Höhen identisch. Galeriefenster-Höhe (`.lpv2-gallery-grid-window`, cqw-abhängig) identisch.
3. **Textsektion.** Bei 1280 px: `.lpv2-content-feature > .container` 1080 px breit, mittig (left 100 px). H2 Schriftgröße 34 px, einzeilig, mittig. `.lpv2-content-flow-copy--intro` und `.lpv2-content-context` auf einer Höhe (`top` gleich), Haarlinie (`::before`) dazwischen 1 px breit, grün. `.lpv2-content-list` 480 px breit, mittig; `li` 19 px fett mit Blüte und Trennlinien wie auf dem Handy. `.lpv2-closing` ohne Hintergrund, Text zentriert, ≤ 400 px; `.lpv2-closing-cta` 400 × 64 px, mittig.
4. **Erscheinen.** Bei 1280 × 800 px frisch laden, Fenster so scrollen, dass `.lpv2-content-service h3` oben steht: kein `li` hat `is-in`. Dann in 60-px-Schritten scrollen und je Schritt zählen, wie viele `li.is-in` – es müssen nacheinander 1, 2, 3, 4, 5 werden, nie zwei im selben Schritt (bei 60 px Schritt und ~70 px Punkthöhe). Danach Hinweistext, Abschluss, Knopf in dieser Reihenfolge. Hochscrollen lässt alles stehen (once).
5. **Reduzierte Bewegung** (`prefers-reduced-motion: reduce` emulieren): alles sofort sichtbar, keine Transition.
6. **Tastatur.** Tab vom Held-Knopf aus: nächster Fokus ist „JETZT ANFRAGEN“, Fokusring sichtbar (`outline-offset: 9px`), Knopf nicht abgeschnitten (`.lpv2-content-feature` hat `overflow:hidden` – 96 px Innenabstand unten lassen den Ring frei).
7. **Schmaler Desktop 901 px.** Satzspiegel 853 px, Spalten je ~374 px, Absätze brechen auf ~5–6 Zeilen; nichts überläuft (`document.documentElement.scrollWidth === innerWidth`).
8. **Andere Leistungsseite** (z. B. `/privatkunden/leistungen/baumpflege/`) bei 1280 px: unverändert (Mittelspalte 640 px, keine `desktop-trichter`-Klasse, kein `data-reveal-late`).
9. **Build-Determinismus.** `node build-leistungen.mjs` zweimal laufen lassen; zweiter Lauf ohne `git status`-Änderung.
10. **Konsole** ohne Fehler; `main.js` lädt mit `?v=20261002a`.

## 7. Offene Punkte und Entscheidungen

- **E1 – Abschluss ohne Kasten.** Mockup und AP setzen den Abschlusssatz am Desktop ohne den grünen Kasten und ohne Blütenstempel. Will Maik den Kasten (Wiedererkennung, Runde 1), reicht es, in §4 Teil 5 die Regel `.lpv2-content-closing .lpv2-closing{… background:none; box-shadow:none; border-radius:0 …}` zu streichen und `:after{content:none}` zu entfernen – dann steht der Handy-Kasten 400 px breit mittig. Mit Maik klären, nicht vorab bauen.
- **E2 – Auslöselinie 72 %.** Mockup-Wert. Wirkt es zu zögerlich (Punkte kommen „zu spät“), `rootMargin` in `main.js` auf `-22%` (78 %) setzen; wirkt es hektisch, `-32%`. Nur die eine Zahl.
- **Schriftgröße.** Am Desktop steht der Fließtext mit 18 px statt der bisherigen 22,5 px (Zoomfolge). Das ist Rückkehr auf Normalmaß und entspricht dem Mockup – Maik gegenüber benennen, weil es ihm auffallen wird.
- **Ausrollen auf die 37 übrigen Leistungen (eigenes AP).** Das Raster setzt Zeilen explizit (`grid-row:1/2/3`) und erwartet genau: eine Überschrift, einen Einstieg, einen Standort-Absatz (`.lpv2-content-context`), eine Leistungssektion. Vor dem Ausrollen prüfen: Seiten ohne `lpv2-content-context` (dann steht der Einstieg allein links neben leerer Spalte), Seiten mit mehreren Leistungssektionen, `baumkontrolle` mit `lpv2-decision`-Grafik, Überschriften mit `lpv2-content-title--long`. Lösung dort voraussichtlich `grid-auto-flow:row` statt fester Zeilen plus ein Fallback „einspaltig, wenn kein Kontext-Absatz“. Außerdem je Datei `desktopLayout` und `mobileCssVersion` setzen; die versteckte `.lpv2-editorial` könnte in dem Zuge aus dem Template fallen.
- **Branch.** AP-530 arbeitete auf `codex/homepage-review`; dieser Patch ist gegen `claude/kind-fermat-pyzy5p` (`beedaab`) erzeugt, weil nur dieser Stand vorlag. Greift `--check` auf dem Arbeitsbranch nicht, §0 Punkt 3.
