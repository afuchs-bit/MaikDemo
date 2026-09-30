# AP-530 — Über uns: Startbild und „Das Team" am Desktop auf einer Mittelachse

Stand 30.09.2026 · Branch `codex/homepage-review` (Basis `589a0cb1`, AP-515) · Seite `/ueber-uns/`
Nur Desktop ab 901 px. Die Handy-Fassung bis 900 px bleibt pixelgleich.

## 0. Kurz für Claude Code

1. Auf `codex/homepage-review` arbeiten. **Nicht** in `claude/kind-fermat-pyzy5p` committen oder mergen (GitHub-Pages-Quelle, geht sofort live – der Deploy-Merge ist ein eigener Schritt von Sascha).
2. AP-Nummer prüfen: `git log --all --oneline | grep -oE "AP-[0-9]+" | sort -t- -k2 -n -u | tail -3` und `git grep -hoE "AP-5[0-9]{2}" -- . | sort -u | tail -3`. Stand bei Erstellung: höchste Nummer AP-529. Ist AP-530 inzwischen belegt, die nächste freie nehmen und im Patch, in den Kommentaren und im Dateinamen dieses Dokuments ersetzen.
3. Den Patch aus §4 als `/tmp/ap530.diff` speichern, `git apply --check /tmp/ap530.diff`, dann `git apply /tmp/ap530.diff`. Der Patch ist gegen `589a0cb1` erzeugt und geprüft.
   Schlägt `--check` fehl (Datei hat sich seitdem geändert): Änderungen von Hand nach §3 einspielen, mit Python (`encoding="utf-8"`, vor jedem Ersetzen `assert s.count(old) == 1`). **Kein Perl.**
4. QA nach §6, dann dieses Dokument nach `docs/ap/AP-530-ueber-uns-mittelachse-desktop.md` legen.
5. Ein Commit: `AP-530: Ueber uns - Startbild und Team am Desktop auf einer Mittelachse`

## 1. Auftrag

Freigegeben per Mockup (`ueber-uns-desktop-mockup.html`, Variante „Mittelachse"). Am Desktop stehen Seitentitel, Foto, Überschrift „Das Team hinter dem Betrieb.", Absatz, Steg mit Blüte und Zitat auf **einer** zentrierten Achse untereinander. Das Foto wird schmaler und damit scharf.

Zwei Probleme werden gelöst:

- **Unschärfe.** `ueber-baumarbeiten` gibt es höchstens 900 px breit. Am Desktop stand das Foto 760 px breit. Auf Retina (2×) braucht das 1.520 Bildpunkte, es kommen 900 → Hochrechnung um 1,69.
- **Unruhe.** Titel und Foto mittig, darunter zweispaltig Überschrift/Text links, senkrechter Steg, Zitat rechts – und direkt danach mit „Ehrlich beraten, sauber gebaut" ein zweites Text-neben-Foto. Zwei gleich gebaute Sektionen hintereinander lesen sich wie eine Wiederholung.

## 2. Diagnose und Herleitung (gemessen, Chromium, vor der Änderung)

| | 901 px | 1024 px | 1440 px |
|---|---|---|---|
| Foto `.ueber-hero__foto` | 760 × 570 | 760 × 570 | 760 × 570 |
| Überschrift `text-align` | left (AP-522) | left | left |
| Absatz | 336 px breit, 7 Zeilen | 439 px, 5 Zeilen | 707 px, 3 Zeilen |
| Oberkante `.ueber-betrieb` | 1201 | 1172 | 1221 |

Werte:

- **Foto 440 px.** 900 / 440 = 2,05 Bildpunkte je CSS-Pixel → auf 2× scharf. Gleiche Breite wie das Hebeaktion-Foto der Betriebssektion (`.ueber-betrieb__raster`, Spalte `minmax(0, 440px)`).
- **`sizes` ab 901 px = 440px.** Bei 1× lädt der Browser damit die 480er-Datei (480/440 = 1,09), bei 2× weiter die 900er. Bis 900 px bleibt `sizes` wie bisher.
- **Textspalte 600 px.** Bei 17 px Inter rund 70 Zeichen je Zeile; der Absatz (264 Zeichen) läuft auf 4 Zeilen, `text-wrap: balance` gleicht sie an. Steg und Zitat stehen in derselben Spalte.
- **Abstand Foto → Überschrift `clamp(44px, 4.4vw, 60px)`** statt `--space-section` (96 px bei 1440 px). Foto und Team-Text gehören jetzt zusammen.
- **Steg waagerecht:** 72 px hoch (= Blüte 72 px), 1-px-Linie über die Spaltenbreite mit 128 px Lücke (Blüte + 2 × 28 px), oben `clamp(28px, 3vw, 40px)`, unten 14 px.
- **Signatur 14 px** statt 28 px unter dem Zitat: Zitat und Name stehen mittig untereinander und lesen sich als ein Block.

Das Markup bleibt bis auf `sizes` und einen Kommentar unverändert. Der vorhandene senkrechte Steg `.ueber-inhaber__steg` wird per CSS waagerecht umgelegt; die Handy-Blüte `.ueber-inhaber__bluete-mobil` bleibt am Desktop aus (Grundregel `display: none`). Die Zitat-Animation (AP-490/491) hängt an denselben Elementen und läuft unverändert.

## 3. Änderungen im Einzelnen

**`assets/css/ueber-uns.css`** – neuer Block direkt **vor** `/* --- Der Betrieb --- */` (Stand: Zeile 563), also nach `.ueber-inhaber__name`. Die Position ist wichtig: Alle überschriebenen Regeln stehen weiter oben mit gleicher Spezifität, der spätere Block gewinnt. Das betrifft `.ueber-hero__foto` (Z. 208), `.ueber-inhaber` (Z. 285), `.ueber-inhaber__raster` (Z. 337), die AP-522-Regel `.ueber-inhaber__gross { text-align: left }` (Z. 383), `.ueber-inhaber__text` (Z. 392), `.ueber-inhaber__steg` (Z. 402), `.ueber-inhaber__blume` (Z. 410), `.ueber-inhaber__zitat` (Z. 423) und `.ueber-inhaber__name` (Z. 555, `!important` → Override ebenfalls `!important`).

**`ueber-uns/index.html`**
- Z. 42: `ueber-uns.css?v=20260930b` → `?v=20260930c`
- Z. 347–348: Kommentar zu `sizes` ergänzt
- Z. 366–367 (beide `<source>` des Startbilds): `sizes` um die Desktop-Stufe `440px` ergänzt

## 4. Patch

```diff
diff --git a/assets/css/ueber-uns.css b/assets/css/ueber-uns.css
index c9343cd6..91ddd40f 100644
--- a/assets/css/ueber-uns.css
+++ b/assets/css/ueber-uns.css
@@ -560,6 +560,73 @@ body.ueber-page {
   color: var(--ink);
 }
 
+/* --- Mittelachse am Rechner (AP-530, 30.09.2026) --------------------------
+   Auf Wunsch des Auftraggebers: Startbild und "Das Team" stehen ab 901px auf
+   einer Achse untereinander - Titel, Foto, Ueberschrift, Text, Steg, Zitat.
+   Bis hierher stand das Foto 760px breit mittig und darunter Text und Zitat
+   zweispaltig mit senkrechtem Steg; direkt danach folgt mit der
+   Betriebssektion ein zweites Text-neben-Foto. Jetzt ist die Betriebssektion
+   das erste zweispaltige Element der Seite.
+
+   Foto 440px: Die Datei ueber-baumarbeiten ist 900px breit. Bei 760px
+   brauchte ein Retina-Bildschirm 1.520 Bildpunkte, es kamen 900 - das Foto
+   wurde um 1,69 hochgerechnet und war unscharf. 900 / 440 = 2,05 -> scharf.
+   Dieselbe Breite wie das Hebeaktion-Foto der Betriebssektion.
+
+   Textmass 600px: bei 17px Inter rund 70 Zeichen je Zeile, der Absatz laeuft
+   auf 4 Zeilen, text-wrap: balance gleicht sie an. Steg und Zitat nehmen
+   dieselbe Spalte.
+
+   Die Ueberschrift steht wieder mittig. AP-522 hatte sie am Rechner links
+   gesetzt, weil sie dort neben dem Zitat in einer Textspalte stand; die
+   Spalte gibt es nicht mehr. Unter 901px aendert sich nichts - die
+   Handy-Fassung hat schon diesen Aufbau.
+
+   Markup unveraendert bis auf sizes am Startbild. Der senkrechte Steg
+   (.ueber-inhaber__steg) wird waagerecht umgelegt, die Handy-Bluete
+   (.ueber-inhaber__bluete-mobil) bleibt am Rechner aus. */
+@media (min-width: 901px) {
+  .ueber-hero__foto { width: 440px; }
+
+  /* Foto-Unterkante bis Ueberschrift: statt --space-section (96px bei 1440px)
+     clamp(44px, 4.4vw, 60px) - Foto und Text gehoeren jetzt zusammen. Das
+     untere Polster (AP-460) bleibt. */
+  .ueber-inhaber { padding-top: clamp(44px, 4.4vw, 60px); }
+
+  .ueber-inhaber__raster {
+    grid-template-columns: minmax(0, 1fr);
+    max-width: 600px;
+    column-gap: 0;
+  }
+
+  .ueber-inhaber__gross { text-align: center; }
+
+  .ueber-inhaber__text {
+    text-align: center;
+    text-wrap: balance;
+  }
+
+  /* Der Steg liegt waagerecht: 1px-Linie ueber die Spaltenbreite mit einer
+     128px-Luecke in der Mitte, darin die Bluete (72px) wie bisher. */
+  .ueber-inhaber__steg {
+    height: 72px;
+    margin: clamp(28px, 3vw, 40px) 0 14px;
+    background: linear-gradient(90deg,
+      var(--line) 0 calc(50% - 64px),
+      transparent calc(50% - 64px) calc(50% + 64px),
+      var(--line) calc(50% + 64px) 100%) center / 100% 1px no-repeat;
+  }
+
+  .ueber-inhaber__blume { padding: 0; }
+
+  .ueber-inhaber__zitat { text-align: center; }
+
+  /* 14px statt 28px: Zitat und Signatur stehen jetzt mittig untereinander
+     und lesen sich als ein Block. !important, weil die Grundregel es traegt. */
+  .ueber-inhaber__name { margin-top: 14px !important; }
+}
+
+
 /* --- Der Betrieb --------------------------------------------------------- */
 
 /* AP-411: Drei Kinder statt zwei. Im Quelltext steht das Foto zwischen den
diff --git a/ueber-uns/index.html b/ueber-uns/index.html
index 218b20ed..4da01192 100644
--- a/ueber-uns/index.html
+++ b/ueber-uns/index.html
@@ -39,7 +39,7 @@ html, body { background-color: #171916; }
 <link rel="stylesheet" href="../assets/css/header-home.css?v=20260923d" />
 <link rel="stylesheet" href="../assets/css/footer-kontakt.css?v=20260930a" />
 <link rel="stylesheet" href="../assets/css/cta-family.css?v=20260923a" />
-<link rel="stylesheet" href="../assets/css/ueber-uns.css?v=20260930b" />
+<link rel="stylesheet" href="../assets/css/ueber-uns.css?v=20260930c" />
 
 <!-- AP-326: Eigenstaendiger Graph. Bis AP-325 verwies "about" per @id auf
      #business, das nur in index.html definiert ist - ein Verweis, der beim
@@ -345,7 +345,8 @@ html, body { background-color: #171916; }
 
        Das Bild ist das LCP-Element: eager statt lazy, fetchpriority high.
        width/height bleiben stehen, damit beim Laden nichts springt. sizes
-       folgt der Fotobreite aus ueber-uns.css (100% - 64px, hoechstens 760px).
+       folgt der Fotobreite aus ueber-uns.css: bis 900px 100% - 64px,
+       hoechstens 760px; ab 901px fest 440px (AP-530, Mittelachse).
 
        [OFFEN: Das Auftragsdokument zu AP-453 sah eine Unterzeile unter dem
         Startbild vor - ein Pendant zu "Ein Stueck Garten vor Ihrem Fenster".
@@ -363,8 +364,8 @@ html, body { background-color: #171916; }
     </div>
     <figure class="ueber-hero__foto">
       <picture>
-        <source type="image/avif" srcset="../assets/img/ueber/ueber-baumarbeiten-480.avif 480w, ../assets/img/ueber/ueber-baumarbeiten-900.avif 900w" sizes="(max-width: 480px) calc(100vw - 64px), min(calc(100vw - 64px), 760px)">
-        <source type="image/webp" srcset="../assets/img/ueber/ueber-baumarbeiten-480.webp 480w, ../assets/img/ueber/ueber-baumarbeiten-900.webp 900w" sizes="(max-width: 480px) calc(100vw - 64px), min(calc(100vw - 64px), 760px)">
+        <source type="image/avif" srcset="../assets/img/ueber/ueber-baumarbeiten-480.avif 480w, ../assets/img/ueber/ueber-baumarbeiten-900.avif 900w" sizes="(max-width: 480px) calc(100vw - 64px), (max-width: 900px) min(calc(100vw - 64px), 760px), 440px">
+        <source type="image/webp" srcset="../assets/img/ueber/ueber-baumarbeiten-480.webp 480w, ../assets/img/ueber/ueber-baumarbeiten-900.webp 900w" sizes="(max-width: 480px) calc(100vw - 64px), (max-width: 900px) min(calc(100vw - 64px), 760px), 440px">
         <img class="ueber-hero__bild" src="../assets/img/ueber/ueber-baumarbeiten.webp" width="900" height="675"
              alt="Baumfällung auf einer Baustelle: Zwei Personen in Schutzausrüstung zerlegen mit Motorsägen den Stamm eines gefällten Baumes, ringsum liegt das Schnittgut."
              loading="eager" fetchpriority="high" decoding="async">
```

## 5. Stoppregeln – was sich nicht ändern darf

- Alles unter 901 px. Kein Eingriff in den `@media (max-width: 900px)`-Block (Z. 1354 ff.).
- Markup von Titel, Überschrift, Absatz, Zitat, Blüten: Texte, Klassen, Reihenfolge, `data-ueber-q`, Wort-Spans der Animation.
- Zitat-Animation (AP-490/491): Keyframes, Zeiten, Keil-Linie unter „zu klein.". `main.js` wird nicht angefasst.
- Untere Naht `.ueber-inhaber` / `.ueber-betrieb` (AP-460, `clamp(26px, 3.75vw, 48px)` je Seite).
- Betriebssektion inkl. AP-522/523 (Foto-Streckung, volle Spaltenbreite).
- Header, Footer, `styles.css`. Die `?v=` anderer CSS-Dateien und `index.html` bleiben – `ueber-uns.css` lädt nur diese Seite (geprüft per `grep -rln "ueber-uns.css" --include=*.html .`).
- Kein Build nötig: `ueber-uns/index.html` ist handgepflegt.
- Keine neuen Bilddateien, keine neuen Derivate.

## 6. QA

Mit Playwright/Chromium messen, vorher/nachher. Referenzwerte nachher (1×, gemessen auf `589a0cb1` + Patch):

| | 901 px | 1024 px | 1440 px |
|---|---|---|---|
| Foto `.ueber-hero__foto` [x, y, b, h] | 231, 254, 440, 330 | 292, 263, 440, 330 | 500, 317, 440, 330 |
| Überschrift [x, y, b] | 151, 628, 600 | 212, 638, 600 | 420, 707, 600 |
| Überschrift `text-align` | center | center | center |
| Absatz | 600 breit, 4 Zeilen | 600, 4 Zeilen | 600, 4 Zeilen |
| Steg [y, b, h] | 847, 600, 72 | 865, 600, 72 | 965, 600, 72 |
| Zitat [y, h] | 933, 106 | 951, 108 | 1051, 112 |
| Oberkante `.ueber-betrieb` | 1073 (vorher 1201) | 1098 (vorher 1172) | 1211 (vorher 1221) |

Checkliste:

- [ ] 390 px und 900 px: ganzseitiger Screenshot vorher/nachher **pixelgleich** (geprüft: `ImageChops.difference(...).getbbox()` = `None`).
- [ ] 901, 1024, 1440 px: Werte wie oben (±2 px je nach Schriftrendering). 1280 px: gleicher Aufbau, Foto 440 px, Spalte 600 px.
- [ ] `document.documentElement.scrollWidth` = Viewportbreite auf allen Breiten.
- [ ] `currentSrc` des Startbilds: 1440 px @1× → `ueber-baumarbeiten-480.avif`, @2× → `ueber-baumarbeiten-900.avif`; 900 px @1× unverändert `-900.avif`.
- [ ] Blütengruppe an der Fotoecke sichtbar und nicht beschnitten.
- [ ] Waagerechter Steg: Linie links und rechts, Blüte mittig in der Lücke, **kein** senkrechter Strich mehr.
- [ ] Handy-Blüte `.ueber-inhaber__bluete-mobil` ab 901 px unsichtbar.
- [ ] Zitat-Animation: Blüte dreht ein, Wörter erscheinen, Linie zieht unter „zu klein." auf; mit `prefers-reduced-motion: reduce` und ohne JS sofort Endzustand.
- [ ] Safari (echtes Gerät oder WebKit): neue Regeln greifen, d. h. `?v=20260930c` wird geladen.
- [ ] `git diff --stat`: genau 2 Dateien plus dieses Dokument unter `docs/ap/`.

## 7. Offene Punkte

- **Überschrift mittig statt links.** AP-522 hat die Überschrift heute auf Ansage des Auftraggebers am Desktop linksbündig gesetzt – für das zweispaltige Raster. Das Raster entfällt; mittig folgt der Achse und entspricht AP-485 (Handy). Mit Maik bestätigen.
- **Höhe.** Bei 1440 px wird der Bereich nur 10 px kürzer (1221 → 1211). Der Gewinn ist Schärfe und Ruhe, nicht Platz. Bei 1024 px sind es 74 px, bei 901 px 128 px.
- **Originalfoto.** `ueber-baumarbeiten` liegt nur in 900 px vor. Mit dem Original ab etwa 2.500 px Breite könnte das Foto auf derselben Achse wieder deutlich größer stehen, ohne dass sich sonst etwas ändert (Derivate dann über `build-hero-images.mjs`, nicht `build-images.mjs`).
