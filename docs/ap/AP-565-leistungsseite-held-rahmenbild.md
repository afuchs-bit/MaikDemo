# AP-565 — Umsetzung (06.10.2026), Abweichungen vom Auftragsdokument

Das Auftragsdokument steht unverändert darunter. Umgesetzt auf Basis AP-568
(Branch `codex/ap-565-held-rahmenbild`), nur für **Balkonkastenbepflanzung**.

**Abweichungen:**
- **Auf Ansage gestrichen (06.10.2026):** Herkunftszeile, Anruf-Knopf, Instagram-Nachweis,
  Mustergarten-Nachweis und nach der ersten Abnahme der Karten-Reiter „Leistung für
  Privatkunden“ (vollständig aus Build, Vorlage und CSS; Schlüssel `20261006d`). Raster daher fünf Zeilen (Luft, Balken, Titel, Knopf, Luft), kein
  `heroEyebrow`/`heroTel`/`heroProof` im Build, keine CSS dafür.
- **Cache-Schlüssel:** Seit AP-568 hat `leistung-mobile.css` einen eigenen Schlüssel
  (`LEISTUNG_MOBILE_CSS_VERSION` → `20261006c`); `CSS_VERSION` bleibt. Die 37 übrigen Seiten
  ändern sich nur in dieser einen Zeile (statt 51 Dateien mit drei Schlüsseln).
- **Vorlage:** `{{heroTag}}` hängt am Ende der `{{heroEdge}}`-Zeile statt in eigener Zeile –
  so bleiben die übrigen Seiten byte-gleich (keine Leerzeile).
- **Bild-Derivate** mit `sharp` statt Pillow (Pillow ist nicht installiert); gleiche Box
  1889 × 685, Ergebnis 700 × 254 (53 KB) und 1400 × 508 (145 KB).
- **Kopfhöhe (E3):** gemessen 92 px statt 80 px → `min-height: clamp(640px, calc(100svh - 92px), 900px)`;
  der Held füllt bei 1440 × 900 genau das Fenster (808 + 92 px).
- **Spezifität Titel:** `.lpv2-page--homepage-unified.lpv2-page--title-above .lpv2-title` (0,3,0)
  setzte 80/20 px Innenabstand; die Titelregel trägt deshalb `.lpv2-hero` davor.
- **Balken „Alle Leistungen“:** Die Regeln für `.lpv2-breadcrumb-back` sind auf `.lpv2-hero`
  begrenzt – sonst trafen sie auch den Link unter den Ergänzungen (−22 px Höhe).

**Anpassung nach AP-581/583 (06.10.2026, nach dem Zusammenführen):**
- AP-583 legt den Desktop-Kopf fest über die Seite (`body` 112 px oben), AP-581 setzt auf allen
  Leistungsseiten einen eigenen Rücklink „Alle Leistungen“ über den Held und blendet die Leiste
  im Held aus. Die eigene Leiste des Rahmenbild-Helds entfällt deshalb.
- **Bündig mit dem Rücklink:** Die Randspalten des Helds folgen jetzt dem Seiten-Container
  (`min(100% − 2 × --gutter, --container)`) statt dem Startseiten-Rand; Rücklink, Schriftzug und
  Knopf stehen auf einer Kante, die Karte schließt rechts mit dem Container ab.
- **Höhe:** `--hero-frei = 100svh − 112px − --space-section-compact − 34px − clamp(28px,3vw,40px)`,
  `min-height: clamp(480px, --hero-frei, 900px)`. Die Karte ist höchstens so hoch, dass sie mit
  32 px Luft ins freie Fenster passt (`width: min(100%, 460px, (--hero-frei − 64px) × 0,75)`).
  Gemessen: Held endet bei 901 × 900, 1024 × 768, 1280 × 800, 1440 × 900 und 1920 × 1080 genau am
  Fensterrand; Karte 460 × 613 bei 1920 × 1080, 437 × 582 bei 1440 × 900, 355 × 473 bei 1024 × 768.
- Die Messwerte unten stammen aus der ersten Fassung (Kopf 92 px, eigene Leiste) und sind durch
  diese Anpassung überholt; Handy bis 900 px blieb in beiden Fassungen unverändert.

**Messung (Headless Chrome):**

| Prüfung | Ergebnis |
|---|---|
| Handy 375/480 px, Querformat 874 px | 359 vorhandene Elemente unverändert; nur die 5 neuen, ausgeblendet |
| Held 901–1920 px | voll breit, zoom 1, Wasserzeichen .12; Balken, Titel, Knopf bündig am Rand; Schriftzug 620 × 225 bei 1440; Knopf 440 × 74; Karte 460 × 613 (3:4) rechtsbündig, Rahmen 12 px; kein Überlauf |
| Bilder | Desktop nur Hochkant-Motiv (1× `-hero-480`, 2× `-hero-1200`), Schriftzug 700/1400; kein 4:3-Abruf; keine 404 |
| Übrige Sektionen 1280 px | Breite, Lage und Höhe unverändert |
| Ersatztitel ohne Schriftzug | Baloo 700, 63 px bei 1440, „Balkonkasten-“ weiß, „bepflanzung“ grün |
| Tastatur, Puls | Alle Leistungen → Knopf (Fokusring 9 px); Knopf pulsiert |
| Übrige 37 Seiten | nur Cache-Zeile `leistung-mobile.css` |

---

# AP-565 — Leistungsseite Balkonkasten: Held am Desktop als „Rahmenbild“

Stand 06.10.2026 · Seite `/privatkunden/leistungen/balkonkastenbepflanzung/` · nur Desktop ab 901 px.
Handy bis 900 px bleibt pixelgleich (inklusive Querformat 481–900 px aus AP-536/537). Die übrigen 37 Leistungsseiten bleiben unverändert; sie bekommen nur den regulären Cache-Buster-Lauf (§3.6).

## 0. Kurz für Claude Code

1. Branch wie zuletzt (AP-564). **Nicht** in `claude/kind-fermat-pyzy5p` mergen – der Deploy-Merge ist Saschas Schritt. Weicht der Arbeitsbranch ab, vorher nachfragen.
2. AP-Nummer prüfen: `git log --all --oneline | grep -oE "AP-[0-9]+" | sort -t- -k2 -n -u | tail -3` und `git grep -hoE "AP-5[0-9]{2}" -- . | sort -u | tail -3`. Stand bei Erstellung: höchste belegte Nummer **AP-564** (`docs/ap/AP-564-baumkontrolle-warnschild.md`; Arbeitsbaum `a360596`). Ist AP-565 belegt, nächste freie nehmen und in Patch, Kommentaren und Dateinamen ersetzen.
3. **Zuerst die zwei Bild-Derivate erzeugen** (§3.1, binär, nicht im Patch) – der Build läuft auch ohne sie, aber der Titel wäre dann ein kaputtes Bild.
4. Den Patch aus §4 als `/tmp/ap565.diff` speichern, `git apply --check /tmp/ap565.diff`, dann `git apply /tmp/ap565.diff`. Der Patch ist gegen `a360596` („Alte Bewertungssektion entfernen und Elfsight beibehalten“, `claude/kind-fermat-pyzy5p`) erzeugt, mit `--check` geprüft und umfasst **nur die fünf Quelldateien**.
   Schlägt `--check` fehl: Änderungen von Hand nach §3 einspielen – Python mit `encoding="utf-8"`, vor jedem Ersetzen `assert s.count(old) == 1`. **Kein Perl.**
5. Build: `cd .github/scripts && node build-leistungen.mjs && node build-headers.mjs` (Reihenfolge wichtig: `build-headers.mjs` schreibt die CSS-Version in alle Seiten). Erwartung §3.6. Generierte HTML-Dateien nie von Hand anfassen.
6. QA nach §6, dann dieses Dokument nach `docs/ap/AP-565-leistungsseite-held-rahmenbild.md` legen.
7. Ein Commit (Derivate mit einchecken): `AP-565: Leistungsseite Balkonkasten - Held am Desktop als Rahmenbild`

## 1. Auftrag

Freigegeben per Mockup (`leistungsseite-hero-desktop-mockup.html`, **Variante B · Rahmenbild**). Der Held der Leistungsseite wird am Desktop nach dem Vorbild des Startseiten-Helds gebaut (vollbreit, dunkel, Wasserzeichen, gleiche Zeilenfolge links), mit einem Twist, damit der Kunde die Seite nicht mit der Startseite verwechselt: **keine schräge Teilung** – das Foto steht rechts als hochkant stehende Karte mit Hausecken, versetztem grünem Rahmen und Blütenstempel, der Titel ist der grüne Schriftzug (dieselbe Handschrift wie „Garten“ auf der Startseite).

Aufbau ab 901 px (Satzspiegel bis 1680 px, Randspalten `max(clamp(32px,4vw,72px), Rest/2)`):

```
┌────────── Spalte 2 (52fr) ──────────┐ ┌──── Spalte 3 (48fr) ────┐
│ ← ALLE LEISTUNGEN                   │ │                         │
│ ✿ Meisterbetrieb in Herne, Bochum…  │ │   ┌──────────────┐      │
│ [Schriftzug „Balkonkasten           │ │   │ Leistung für │      │
│   Bepflanzung“, grün, ≤ 620 px]     │ │   │ Privatkunden │ 3:4  │
│                                     │ │   │   Foto       │460px │
│ [ Balkonkästen bepflanzen lassen →] │ │   │              │ ✿    │
│   440 × 74              (☎) 66 px   │ │   └──────────────┘ └ Rahmen 12 px versetzt
│ [IG] Einblicke Live   📍 1.500 m² … │ │                         │
└─────────────────────────────────────┘ └─────────────────────────┘
      ← Wasserzeichen (Blütengruppe) hinter Spalte 1–2, 12 % →
```

Darunter unverändert der Trichter-Textbereich (AP-534), nur mit 40 px statt 80 px Abstand nach oben, weil der Held seine Luft unten selbst mitbringt.

### 1.1 Entscheidungen, die im AP schon getroffen sind

- **Schriftzug als Titel.** `assets/img/leistungen-mobile/balkonkastenbepflanzung-schriftzug.png` (2172 × 724, 606 KB) liegt im Repo, wird aber nirgends referenziert. Er wird zugeschnitten (Bounding-Box 1889 × 685) und als WebP in 700 px (1×, 43 KB) und 1400 px (2×, 141 KB) abgelegt. Die H1 behält `aria-label="Balkonkastenbepflanzung"` und die Baloo-Zeilen für das Handy; am Desktop trägt das Bild den Titel (`aria-hidden`).
- **Fallback ohne Schriftzug** (für das spätere Ausrollen): Baloo 700 `clamp(44px,4.4vw,80px)` wie der Startseiten-Titel, erste Zeile weiß mit Bindestrich, zweite Zeile im Logo-Grün – automatisch über `:has()`, sobald `desktopHeroGraphic` fehlt.
- **Hochkantfoto.** Das 4:3-Motiv der Handy-Fassung bleibt dort; am Desktop lädt dasselbe `<picture>` über `<source media="(min-width: 901px)">` das Hochkant-Original `originale/balkonkastenbepflanzung.jpg` (Manifest `images-repo.json`: 480/800/1200, 3:4). Beide bekommen ein eigenes Preload mit `media`.
- **Anfrageknopf** bleibt der `maik-cta` der Leistungsseiten (grün gefüllt, Pfeil), auf 440 × 74 vergrößert; daneben neu ein runder **Anruf-Knopf** (66 px, `tel:+491711738943`, Telefon-Icon des Headers) – telefon-first wie der Startseiten-Held.
- **Herkunftszeile** „Meisterbetrieb in Herne, Bochum, Recklinghausen und Umgebung“ ist der Text der Startseite (`gate-region`), kein neuer Claim. Pro Seite über `desktopHeroEyebrow` überschreibbar (HTML erlaubt, `<b>` für die Hervorhebung).
- **Nachweise** (Instagram „Einblicke Live“, „1.500 m² Mustergarten am Firmensitz in Herne“): Markup und Styling der Startseite (`hero-proof-strip`), als eigene Klassen `lpv2-hero-proof__*`, weil `home-dark.css` auf Leistungsseiten nicht geladen wird.
- **Karten-Reiter** „Leistung für Privatkunden“ (Gewerbeseiten: „Gewerbekunden“, aus `welt.key`) ist `aria-hidden` – rein visuell, Entscheidung E2 in §7.

## 2. Ist-Zustand und Herleitung

### 2.1 Warum der Held heute 640 px breit ist

AP-512 legte `.lpv2-main` auf 32rem mit `zoom:1.25`; AP-534 verschob das auf jede Sektion einzeln (`.lpv2-main > article > section:not(.lpv2-content-feature)`), damit die Textsektion ausbrechen kann. Der Held ist damit eine 512-px-Spalte, 1,25-fach sichtbar = 640 px: Balken „Alle Leistungen“, Titel zentriert in Baloo 600/31 px (sichtbar 38,75 px), 4:3-Foto mit Blütenstempel, Knopf. Mit der Startseite (vollbreit, Schräge, Wasserzeichen, Nachweise) hat er außer Farben und Schrift nichts gemein.

Die neue Regel `section.lpv2-hero{max-width:none;margin:0;zoom:1;container-type:normal}` hat dieselbe Spezifität wie die AP-534-Regel (3 Klassen + 2 Elemente) und steht später in der Datei – sie gewinnt. Alle anderen Sektionen behalten ihre 32rem-Spalte unverändert (QA §6, Punkt 2).

`container-type:normal` am Held hat eine Folge: `cqw`-Maße des `maik-cta` (`font-size: clamp(.82rem, 3.9cqw, 1rem)`) messen dann das Fenster statt der Spalte und laufen in das Maximum; die Beschriftung wird ohnehin explizit auf 1,125 rem gesetzt.

### 2.2 Abgeleitete Werte

| Wert | Herleitung |
|---|---|
| Raster `[Rand] 52fr 48fr [Rand]`, `--hero-max:1680px`, Rand `max(clamp(32px,4vw,72px), (100% − 1680px)/2)` | Startseiten-Held (`home-dark.css`, AP-560): `--wide-hero-inset`, `--wide-hero-max`, Spalten 44/56. Hier 52/48, weil die Karte schmaler ist als die Foto-Hälfte der Startseite. Bei 1440 px: Rand 58 px, Spalte 2 = 688 px, Spalte 3 = 636 px. |
| Zeilen `minmax(64px,1fr) auto auto auto auto minmax(64px,1fr)` | Oben/unten mindestens 64 px, Rest verteilt sich; der Startseiten-Held nimmt 160/80, weil dort der Kopf über dem Held schwebt – auf der Leistungsseite steht er sticky **im** Fluss (`styles.css .site-header`), die Spalte beginnt also schon unter dem Kopf. |
| Mindesthöhe `clamp(640px, calc(100svh − 80px), 900px)` | Ein Fenster abzüglich Kopfzeile (`.header-inner` ≈ 76–80 px, sticky). Startseite: `clamp(660px,100svh,960px)` inklusive Kopf. Bei 1440 × 900: 820 px. QA §6, Punkt 3 misst die reale Kopfhöhe nach. |
| Wasserzeichen `clamp(360px,34vw,680px)`, `margin-left:-4%`, `opacity:.12`, `saturate(.7)` | Größe wie Startseite (`background-size: clamp(360px,34vw,680px)`). Die Startseite dunkelt mit einem Verlauf zu 93 % ab; hier `opacity:.12` – gleiche Sichtbarkeit (0,12 ≈ 1 − 0,93 + Rest des Verlaufs), ein Pseudoelement statt zweier Hintergrundebenen. |
| Schriftzug `width:min(100%,620px)` | Bounding-Box 1889 × 685 → bei 620 px Breite 225 px hoch. Mockup: 620 px. Bei 1440 px nutzt er 90 % der Spalte 2. |
| Karte `min(100%,460px)`, `aspect-ratio:3/4`, Ecken `26px 7px 26px 7px`, Rahmen `translate(12px,12px)`, 1,5 px | Mockup. 460 × 613 px; mit Rahmen 472 × 625. Ecken = Form der Abschluss-Kachel (22/6) eine Stufe größer; Rahmen = Prinzip des `maik-cta__frame` (6 px) verdoppelt, weil die Karte doppelt so groß ist. Hochkant-Derivat 800 px ≥ 460 × 1,5 für Retina, 1200 px für 2×. |
| `object-position: 40% 55%` | Im Hochkant-Original (800 × 1067) liegen die Veilchen links unten, der Kasten läuft nach rechts oben; 40 %/55 % hält beides bei leichter Beschneidung durch 3:4 (Original ist 3:4 – also praktisch keine Beschneidung, der Wert greift nur bei schmaleren Karten unter 1100 px Fensterbreite). |
| Stempel 140 px, `right:-30px; bottom:-34px` | Handy: `clamp(4.0625rem,20vw,5rem)` bei `-14/-18` am 320-px-Foto → Verhältnis 1 : 4. Karte 460 px → 115 px; auf 140 angehoben, weil die Karte freisteht und der Stempel das Objekt ist, das sie mit dem heutigen Held verbindet. |
| Knopf 440 × 74, Radius 16, Beschriftung 1,125 rem, Pfeil 70 × 46 / Bild 52 | Startseiten-Kontaktlasche 480 × 76. `maik-cta` ≥ 481 px: 64 px hoch, Radius 14, Pfeil 62 × 40 / 46 – jeweils × 1,15 (Mockup `--s:1.15`). |
| Anruf-Knopf 66 px rund, 1,5 px Lime-Ring | Höhe des Knopfs minus 8 px; Ring wie der Telefon-Knopf im Header. |
| Nachweise: Icon 44 px, Radius 14, `clamp(15px,1.05vw,18px)` 800 | 1:1 Startseite (`.hero-proof-instagram-icon`, `.hero-proof-location-text`). |
| Versalzeile „Alle Leistungen“ 13 px, 800, `letter-spacing:.08em` | Mockup. Der Handy-Balken (`.lpv2-breadcrumbs--bar`, `.76rem`) wird am Desktop umgesetzt statt ein zweites Element zu bauen – gleiche Link-Semantik, gleicher Pfeil. |
| Textsektion `padding-top:40px` | AP-534: 80 px. Der Held endet jetzt mit seiner Zeile 7 (≥ 64 px Luft); 64 + 40 = 104 px bis zur Überschrift „Ein Stück Garten …“ – im Bereich der 92 px, die AP-534 zwischen Absätzen und Leistungsüberschrift setzt. |

### 2.3 Reveal

Alle Held-Elemente tragen `reveal` (Balken, Herkunftszeile, Titel, Karte, Knopf, Nachweise) und laufen über die bestehende Staffelung in `main.js` (55 ms je Geschwister, max. 4). Der Anruf-Knopf steckt im Knopf-Container und erscheint mit ihm. Kein neues JavaScript.

## 3. Änderungen nach Fundstelle

### 3.1 Bild-Derivate (binär, vor dem Patch erzeugen)

Im Repo-Wurzelverzeichnis, Python mit Pillow (ist im Projekt für Bildanalysen etabliert; `build-images.mjs` **nicht** benutzen – es schreibt `data/images.json` neu, und die Schriftzüge gehören nicht in die CMS-Datenschicht):

```python
from PIL import Image
src = 'assets/img/leistungen-mobile/balkonkastenbepflanzung-schriftzug.png'
im = Image.open(src).convert('RGBA')
im = im.crop(im.getbbox())            # (116, 23, 2005, 708) -> 1889 x 685
for w in (700, 1400):
    r = im.copy(); r.thumbnail((w, w))
    r.save(f'assets/img/leistungen-mobile/balkonkastenbepflanzung-schriftzug-{w}.webp', 'WEBP', quality=90, method=6)
```

Erwartung: `…-schriftzug-700.webp` 700 × 254 (≈ 43 KB), `…-schriftzug-1400.webp` 1400 × 508 (≈ 141 KB). Das PNG bleibt als Quelle liegen.

### 3.2 `content/leistungen/privat/balkonkastenbepflanzung.json`

Nach `"desktopLayout": "trichter",` neu:

```json
"desktopHero": "rahmenbild",
"desktopHeroPortrait": "/assets/img/leistungen-mobile/originale/balkonkastenbepflanzung.jpg",
"desktopHeroGraphic": {
  "bild": "/assets/img/leistungen-mobile/balkonkastenbepflanzung-schriftzug-1400.webp",
  "bild1x": "/assets/img/leistungen-mobile/balkonkastenbepflanzung-schriftzug-700.webp",
  "width": 1400,
  "height": 508
},
```

`mobileCssVersion` im JSON bleibt (wird seit `build-headers.mjs` ohnehin überschrieben, §3.5).

### 3.3 `.github/scripts/lib/render.mjs`

- `renderPicture(...)`: drei neue Optionen `desktopBild`, `desktopSizes = '460px'`, `desktopMedia = '(min-width: 901px)'`. Hat das Desktop-Bild einen Manifest-Eintrag, kommen zwei `<source media=…>`-Zeilen (AVIF, WebP) **vor** die normalen Quellen; sonst passiert nichts. `set()` nimmt jetzt den Manifest-Eintrag als zweiten Parameter.
- `lcpPreloadFor(bild, sizes, base, media = '')`: optionales `media`-Attribut am `<link rel="preload">`.
- `renderLeistungPage(...)`, nach `heroTitleHtml`: Block „AP-565“ mit `rahmenbild`, `heroGraphicHtml` (das `<img class="lpv2-title-graphic-desktop">` mit `srcset` 1×/2×), `heroEyebrow`, `heroTel`, `heroTag`, `heroProof`.
- Platzhalter: `h1: heroTitleHtml + heroGraphicHtml`; `heroPreload` liefert bei `rahmenbild` zwei Preloads (Handy `(max-width: 900px)`, Desktop `(min-width: 901px)` mit `460px`); `heroPicture` bekommt `desktopBild`; `pageVariantClass` hängt `lpv2-page--desktop-rahmenbild` an; `mobileHeroCta` bekommt `${heroTel}` hinter den Knopf; neue Template-Werte `heroEyebrow, heroTag, heroProof`.
- Ohne `desktopHero: "rahmenbild"` ist die Ausgabe byte-identisch zu heute (QA §6, Punkt 9).

### 3.4 `.github/scripts/templates/leistung-v2.html`

`{{heroEyebrow}}` zwischen Kicker und `<h1>`; `{{heroTag}}` als letztes Kind der `<figure>`; `{{heroProof}}` nach `{{mobileHeroCta}}`.

### 3.5 `.github/scripts/build-headers.mjs`

`CSS_VERSION` `'20261002y'` → `'20261006a'`. Das ist seit AP-5xx der Cache-Buster für `styles.css`, `header-home.css` **und** `leistung-mobile.css` auf allen veröffentlichten Seiten – daher die 51 Dateien in §3.6.

### 3.6 `assets/css/leistung-mobile.css`

Neuer Block **am Dateiende** (nach dem AP-536/537-Block), Kommentar „AP-565“. Eine Zeile außerhalb der Media Query blendet die fünf neuen Elemente aus; `@media (min-width:901px)` mit neun nummerierten Teilen (Spalte/Zoom, Bühne + Wasserzeichen, Balken, Herkunftszeile, Titel/Schriftzug/Fallback, Knöpfe, Nachweise, Karte, Übergang). Alle Selektoren beginnen mit `.lpv2-page--desktop-rahmenbild`; `:root`-Tokens unberührt. Vollständig im Patch.

### 3.7 Generierte Dateien (Ergebnis des Builds, nicht von Hand)

- 51 veröffentlichte Seiten (`build-headers.mjs`): nur `?v=20261006a` an `styles.css`, `header-home.css`, `leistung-mobile.css`.
- `privatkunden/leistungen/balkonkastenbepflanzung/index.html` zusätzlich: zwei Preloads mit `media`, Body-Klasse `lpv2-page--desktop-rahmenbild`, `<p class="lpv2-hero-eyebrow reveal">` vor der H1, das Schriftzug-`<img>` als letztes Kind der H1, zwei `<source media="(min-width: 901px)">` im Held-`<picture>`, `<span class="lpv2-hero-tag">` in der Figure, `<a class="lpv2-hero-tel">` hinter dem Knopf, `<aside class="lpv2-hero-proof reveal">` nach dem Knopf-Container.
- Build zweimal laufen lassen: zweiter Lauf ohne Änderung (bei Erstellung geprüft).

## 4. Patch (Quelldateien)

Gegen `a360596` auf `claude/kind-fermat-pyzy5p`; `git apply --check` bestanden; Build danach fehlerfrei und deterministisch.

```diff
diff --git a/.github/scripts/build-headers.mjs b/.github/scripts/build-headers.mjs
index 4b44253..51e3fb6 100644
--- a/.github/scripts/build-headers.mjs
+++ b/.github/scripts/build-headers.mjs
@@ -8,7 +8,7 @@ import { renderNavSubmenu } from './lib/render.mjs';
 const __dirname = path.dirname(fileURLToPath(import.meta.url));
 const REPO_ROOT = path.resolve(__dirname, '..', '..');
 const TEMPLATE = path.join(__dirname, 'templates', '_header.html');
-const CSS_VERSION = '20261002y';
+const CSS_VERSION = '20261006a';
 const PRIVATE_FORM_CSS_VERSION = '20261004d';
 const MOBILE_SOCIAL_PROOF_CSS_VERSION = '20261005i';
 const JS_VERSION = '20261002f';
diff --git a/.github/scripts/lib/render.mjs b/.github/scripts/lib/render.mjs
index 0024565..644110c 100644
--- a/.github/scripts/lib/render.mjs
+++ b/.github/scripts/lib/render.mjs
@@ -160,8 +160,11 @@ export function absUrl(p) {
 // AP-77: Das <img src> zeigt auf `<base>.webp`, nicht auf `bild`. Bei den Bildern aus
 // build-images.mjs ist das derselbe Pfad; bei denen aus build-hero-images.mjs liegt unter
 // `bild` das grosse Original (bis 1,2 MB), das nie ausgeliefert werden soll.
-export function renderPicture(bild, { alt = '', sizes = '100vw', className = '', priority = false, width, height, base = '', objectPosition = '' } = {}) {
+export function renderPicture(bild, { alt = '', sizes = '100vw', className = '', priority = false, width, height, base = '', objectPosition = '', desktopBild = '', desktopSizes = '460px', desktopMedia = '(min-width: 901px)' } = {}) {
   const m = imageManifest()[bild];
+  // AP-565: zweites Motiv ab Desktop (Hochkant im Rahmenbild-Held). Eigene <source>-Zeilen
+  // mit media-Attribut VOR den normalen Quellen; ohne Manifest-Eintrag entfaellt es still.
+  const dm = desktopBild ? imageManifest()[desktopBild] : null;
   const cls = className ? ` class="${escAttr(className)}"` : '';
   const position = /^\d{1,3}% \d{1,3}%$/.test(objectPosition)
     ? ` style="object-position:${escAttr(objectPosition)}"` : '';
@@ -171,20 +174,26 @@ export function renderPicture(bild, { alt = '', sizes = '100vw', className = '',
     const wh = width && height ? ` width="${width}" height="${height}"` : '';
     return `<img${cls}${position} src="${rel(bild)}" alt="${escAttr(alt)}"${wh} ${load}>`;
   }
-  const set = (ext) => widthsFor(m, ext).map((w) => `${rel(`${m.base}-${w}.${ext}`)} ${w}w`).join(', ');
+  const set = (ext, entry = m) => widthsFor(entry, ext).map((w) => `${rel(`${entry.base}-${w}.${ext}`)} ${w}w`).join(', ');
+  const desktopSources = dm
+    ? `<source media="${escAttr(desktopMedia)}" type="image/avif" sizes="${escAttr(desktopSizes)}" srcset="${set('avif', dm)}">
+        <source media="${escAttr(desktopMedia)}" type="image/webp" sizes="${escAttr(desktopSizes)}" srcset="${set('webp', dm)}">
+        `
+    : '';
   return `<picture>
-        <source type="image/avif" sizes="${escAttr(sizes)}" srcset="${set('avif')}">
+        ${desktopSources}<source type="image/avif" sizes="${escAttr(sizes)}" srcset="${set('avif')}">
         <source type="image/webp" sizes="${escAttr(sizes)}" srcset="${set('webp')}">
         <img${cls}${position} src="${rel(fallbackSrc(m))}" alt="${escAttr(alt)}" width="${width || m.width}" height="${height || m.height}" ${load}>
       </picture>`;
 }
 
 // Preload-Link fuer das LCP-Bild einer Seite (AVIF-srcset, relativ zur Seitentiefe).
-function lcpPreloadFor(bild, sizes = '100vw', base = '') {
+function lcpPreloadFor(bild, sizes = '100vw', base = '', media = '') {
   const m = bild ? imageManifest()[bild] : null;
+  const mediaAttr = media ? ` media="${escAttr(media)}"` : '';
   if (m) {
     const srcset = widthsFor(m, 'avif').map((w) => `${escAttr(relAsset(`${m.base}-${w}.avif`, base))} ${w}w`).join(', ');
-    return `<link rel="preload" as="image" type="image/avif" imagesizes="${escAttr(sizes)}" imagesrcset="${srcset}" />`;
+    return `<link rel="preload" as="image" type="image/avif"${mediaAttr} imagesizes="${escAttr(sizes)}" imagesrcset="${srcset}" />`;
   }
   return bild ? `<link rel="preload" as="image" href="${escAttr(relAsset(bild, base))}" fetchpriority="high" />` : '';
 }
@@ -1335,6 +1344,31 @@ export async function renderLeistungPage(opts) {
     const heroTitleHtml = splitHeroTitle
       ? `<span class="lpv2-title-full">${esc(presented.h1)}</span><span class="lpv2-title-lines" aria-hidden="true">${presented.heroTitleLines.map((line) => `<span>${esc(line)}</span>`).join('')}</span>`
       : esc(presented.h1);
+    // AP-565: Rahmenbild-Held am Desktop (desktopHero "rahmenbild"). Alle Zusaetze sind
+    // desktop-only (unter 901px per CSS ausgeblendet) und tragen keine neuen Texte ausser
+    // den auf der Startseite bereits verwendeten (Herkunftszeile, Nachweise).
+    const rahmenbild = presented.desktopHero === 'rahmenbild';
+    const heroGraphic = rahmenbild && presented.desktopHeroGraphic?.bild ? presented.desktopHeroGraphic : null;
+    const assetPath = (p) => escAttr(`${base}${String(p).replace(/^\/+/, '')}`);
+    const heroGraphicHtml = heroGraphic
+      ? `<img class="lpv2-title-graphic-desktop" src="${assetPath(heroGraphic.bild)}"${heroGraphic.bild1x ? ` srcset="${assetPath(heroGraphic.bild1x)} 1x, ${assetPath(heroGraphic.bild)} 2x"` : ''} alt="" aria-hidden="true" width="${Number(heroGraphic.width) || 1400}" height="${Number(heroGraphic.height) || 508}" fetchpriority="high" decoding="async">`
+      : '';
+    const heroEyebrowText = presented.desktopHeroEyebrow || 'Meisterbetrieb in <b>Herne</b>, Bochum, Recklinghausen und Umgebung';
+    const heroEyebrow = rahmenbild
+      ? `<p class="lpv2-hero-eyebrow reveal"><img src="${base}assets/img/icons/maik-rohdich-bluete-original.png?v=20260913b" alt="" aria-hidden="true" width="85" height="70" decoding="async"><span>${heroEyebrowText}</span></p>`
+      : '';
+    const heroTel = rahmenbild
+      ? `<a class="lpv2-hero-tel" href="tel:+491711738943" aria-label="Direkt anrufen unter 0171 173 89 43"><img src="${base}assets/img/icons/phone-header-mobile.png?v=20260902a" alt="" width="192" height="192" decoding="async"></a>`
+      : '';
+    const heroTag = rahmenbild
+      ? `<span class="lpv2-hero-tag" aria-hidden="true">Leistung für <b>${welt.key === 'gewerbe' ? 'Gewerbekunden' : 'Privatkunden'}</b></span>`
+      : '';
+    const heroProof = rahmenbild
+      ? `<aside class="lpv2-hero-proof reveal" aria-label="Firmensitz und Mustergarten">
+        <a class="lpv2-hero-proof__instagram" href="https://www.instagram.com/rohdich_garten_landschaftsbau/" target="_blank" rel="noopener" aria-label="Einblicke live bei Maik Rohdich auf Instagram ansehen"><span class="lpv2-hero-proof__instagram-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.7" r="1" fill="currentColor" stroke="none"/></svg></span><span>Einblicke <strong>Live</strong></span></a>
+        <div class="lpv2-hero-proof__location"><span class="lpv2-hero-proof__mark" aria-hidden="true"><img class="lpv2-hero-proof__pin" src="${base}assets/img/icons/rohdich-standort.svg" alt="" width="24" height="24" decoding="async"><img class="lpv2-hero-proof__flower" src="${base}assets/img/icons/maik-rohdich-bluete-original.png?v=20260913b" alt="" width="85" height="70" decoding="async"></span><p><span>1.500 m² Mustergarten</span><span>am Firmensitz in <strong>Herne</strong></span></p></div>
+      </aside>`
+      : '';
     const hideProcess = presented.hideProcess === true;
     const homepageContact = presented.contactVariant === 'homepage';
     const processSection = hideProcess ? '' : `<section class="lpv2-process section" id="ablauf" aria-labelledby="lpv2-process-title">
@@ -1389,33 +1423,36 @@ export async function renderLeistungPage(opts) {
       mobileCssVersion: escAttr(cssVersion),
       ctaFamilyVersion: escAttr(presented.ctaFamilyVersion || '20260919a'),
       heroVariantClass: `${imageFirstHero ? ' lpv2-page--image-first' : ''}${heroTitleAbove ? ' lpv2-page--title-above' : ''}${heroTitleGraphic ? ' lpv2-page--title-graphic' : ''}`,
-      pageVariantClass: `${presented.relatedVariant === 'homepage' ? ' lpv2-page--homepage-unified' : ''}${presented.contentVariant === 'editorial' ? ' lpv2-page--content-feature' : ''}${presented.desktopLayout === 'trichter' ? ' lpv2-page--desktop-trichter' : ''}`,
+      pageVariantClass: `${presented.relatedVariant === 'homepage' ? ' lpv2-page--homepage-unified' : ''}${presented.contentVariant === 'editorial' ? ' lpv2-page--content-feature' : ''}${presented.desktopLayout === 'trichter' ? ' lpv2-page--desktop-trichter' : ''}${presented.desktopHero === 'rahmenbild' ? ' lpv2-page--desktop-rahmenbild' : ''}`,
       title: esc(presented.title), ogTitle: escAttr(presented.title),
       description: escAttr(truncate(presented.metaDescription, 160)), canonical: escAttr(canonical),
-      ogImage: escAttr(absUrl(hero.bild)), heroPreload: lcpPreloadFor(hero.bild, heroTitleAbove ? '(max-width: 480px) calc(100vw - 64px), 100vw' : '100vw', base),
+      ogImage: escAttr(absUrl(hero.bild)), heroPreload: rahmenbild && presented.desktopHeroPortrait
+        ? lcpPreloadFor(hero.bild, heroTitleAbove ? '(max-width: 480px) calc(100vw - 64px), 100vw' : '100vw', base, '(max-width: 900px)') + lcpPreloadFor(presented.desktopHeroPortrait, '460px', base, '(min-width: 901px)')
+        : lcpPreloadFor(hero.bild, heroTitleAbove ? '(max-width: 480px) calc(100vw - 64px), 100vw' : '100vw', base),
       breadcrumbJsonLd: leistungBreadcrumb(presented.h1, canonical, welt),
       heroBreadcrumbBefore: mobileBalkonkasten ? mobileHeroBreadcrumb : imageFirstHero ? standardHeroBreadcrumb : '',
       heroBreadcrumbInside: mobileBalkonkasten ? desktopHeroBreadcrumb : imageFirstHero ? '' : standardHeroBreadcrumb,
       serviceJsonLd: serviceJsonLd(presented, canonical), faqJsonLd: faqJsonLd(presented.faq),
       logo: logo.trim(), header: fill(header, { base, leistungenSubmenu: renderNavSubmenu(base) }).trim(),
       footer: fill(footer, footerTemplateData(base, seitenPfad)).trim(),
-      h1: heroTitleHtml, titleAria: splitHeroTitle ? ` aria-label="${escAttr(presented.h1)}"` : '', titleClass: `${splitHeroTitle ? ' lpv2-title--split' : ''}${heroTitleGraphic ? ' lpv2-title--visually-hidden' : ''}`,
+      h1: heroTitleHtml + heroGraphicHtml, titleAria: splitHeroTitle ? ` aria-label="${escAttr(presented.h1)}"` : '', titleClass: `${splitHeroTitle ? ' lpv2-title--split' : ''}${heroTitleGraphic ? ' lpv2-title--visually-hidden' : ''}`,
       subheading: esc(presented.unterzeile),
       introHtml: presented.einstieg.map((p) => `<p>${esc(p)}</p>`).join(''),
       heroCta: lpv2Cta(presented.ctaLabel, base, presented.ctaHref || '#anfrage'),
-      heroPicture: renderPicture(hero.bild, { alt: hero.alt || '', sizes: heroTitleAbove ? '(max-width: 480px) calc(100vw - 64px), 100vw' : '100vw', priority: true, width: hero.width, height: hero.height, base, objectPosition: hero.objectPosition }),
+      heroPicture: renderPicture(hero.bild, { alt: hero.alt || '', sizes: heroTitleAbove ? '(max-width: 480px) calc(100vw - 64px), 100vw' : '100vw', priority: true, width: hero.width, height: hero.height, base, objectPosition: hero.objectPosition, desktopBild: rahmenbild ? presented.desktopHeroPortrait || '' : '' }),
       heroBrand: imageFirstHero
         ? `<img class="lpv2-hero-brand" src="${base}assets/img/logo/maik-rohdich-bluetengruppe-header-transparent.png" alt="" width="210" height="180" aria-hidden="true" decoding="async">`
         : '',
       heroEdge: imageFirstHero
         ? `<svg class="lpv2-hero-edge" viewBox="0 0 100 14" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path class="lpv2-hero-edge__fill" d="M0 1.5L100 12.5V14H0Z"/><path class="lpv2-hero-edge__line" d="M0 1.5L100 12.5" vector-effect="non-scaling-stroke"/></svg>`
         : '',
+      heroEyebrow, heroTag, heroProof,
       heroTitleGraphic: heroTitleGraphic
         ? `<div class="lpv2-hero-title-graphic reveal" aria-hidden="true"><img src="${escAttr(`${base}${heroTitleGraphic.bild.replace(/^\/+/, '')}`)}" alt="" width="${Number(heroTitleGraphic.width) || 2172}" height="${Number(heroTitleGraphic.height) || 724}" decoding="async"></div>`
         : '',
       contentHtml: lpv2Content(presented), closingHtml: lpv2Closing(presented, base),
       mobileHeroCta: presented.contentVariant === 'editorial'
-        ? `<div class="lpv2-mobile-hero-cta">${lpv2HomepageCta(presented.ctaLabel, base, 'lpv2-mobile-hero-cta__button', presented.ctaHref || '#kontakt', true, lpv2MobileCtaLabelClass(presented.ctaLabel), presented.ctaIcon || 'arrow')}</div>`
+        ? `<div class="lpv2-mobile-hero-cta">${lpv2HomepageCta(presented.ctaLabel, base, 'lpv2-mobile-hero-cta__button', presented.ctaHref || '#kontakt', true, lpv2MobileCtaLabelClass(presented.ctaLabel), presented.ctaIcon || 'arrow')}${heroTel}</div>`
         : '',
       mobileContentSection: lpv2ContentSection(presented, base), gallerySection: lpv2GallerySection(presented, base),
       galleryGridScript: presented.galleryVariant === 'grid-teaser'
diff --git a/.github/scripts/templates/leistung-v2.html b/.github/scripts/templates/leistung-v2.html
index d602d41..d2facc4 100644
--- a/.github/scripts/templates/leistung-v2.html
+++ b/.github/scripts/templates/leistung-v2.html
@@ -50,6 +50,7 @@
       <div class="container">
 {{heroBreadcrumbInside}}
         <p class="lpv2-kicker reveal">Leistung</p>
+{{heroEyebrow}}
         <h1 class="lpv2-title{{titleClass}} reveal" id="lpv2-title"{{titleAria}}>{{h1}}</h1>
         <p class="lpv2-subheading reveal">{{subheading}}</p>
         <div class="lpv2-intro reveal">{{introHtml}}</div>
@@ -59,9 +60,11 @@
         {{heroPicture}}
 {{heroBrand}}
 {{heroEdge}}
+{{heroTag}}
       </figure>
 {{heroTitleGraphic}}
 {{mobileHeroCta}}
+{{heroProof}}
     </section>
 {{mobileContentSection}}
     <section class="lpv2-editorial section" aria-labelledby="lpv2-editorial-title">
diff --git a/assets/css/leistung-mobile.css b/assets/css/leistung-mobile.css
index 739bc18..d9151b3 100644
--- a/assets/css/leistung-mobile.css
+++ b/assets/css/leistung-mobile.css
@@ -607,3 +607,92 @@
      Silbentrennung gegen grosse Wortluecken (lang="de") - wie am Desktop (AP-534). */
   .lpv2-page--content-feature :is(.lpv2-content-lead,.lpv2-content-context,.lpv2-content-service-copy) p{text-align:justify;text-align-last:left;hyphens:auto}
 }
+
+/* ---------- AP-565: Rahmenbild-Held am Rechner (Seiten mit desktopHero "rahmenbild") ----------
+   Freigegeben per Mockup (leistungsseite-hero-desktop-mockup.html, Variante B). Nur ab 901px
+   und nur mit der Klasse lpv2-page--desktop-rahmenbild (Build setzt sie aus dem JSON-Feld
+   desktopHero). Handy bis 900px bleibt pixelgleich: die neuen Elemente (Herkunftszeile, Anruf-
+   Knopf, Nachweise, Karten-Reiter, Schriftzug) sind ausserhalb der Media Query ausgeblendet.
+
+   Aufbau am Rechner, nach dem Vorbild des Startseiten-Helds (home-dark.css, AP-560): vollbreit,
+   dunkler Grund, Blueten-Wasserzeichen hinter dem Text, links in Zeilen: "Alle Leistungen",
+   Herkunftszeile mit Bluete, Titel als gruener Schriftzug (ohne Schriftzug: Baloo 700, zweite
+   Zeile gruen), Anfrageknopf + runder Anruf-Knopf, Nachweise (Instagram, Mustergarten).
+   Twist gegenueber der Startseite: keine schraege Teilung - das Foto ist rechts eine hochkant
+   stehende Karte (3:4, 460px) mit Hausecken 26/7, versetztem gruenem Rahmen (12px, wie die
+   Knopfform) und dem Bluetenstempel unten rechts. */
+.lpv2-hero-eyebrow,.lpv2-hero-tel,.lpv2-hero-proof,.lpv2-hero-tag,.lpv2-title-graphic-desktop{display:none}
+
+@media (min-width:901px){
+  /* 1 - Der Held verlaesst die 32rem-Spalte (AP-534 gibt sie jeder Sektion einzeln) */
+  .lpv2-page--desktop-rahmenbild .lpv2-main > article > section.lpv2-hero{max-width:none;margin:0;zoom:1;container-type:normal}
+
+  /* 2 - Buehne: Raster wie der Startseiten-Held (Randspalten, 52/48), Mindesthoehe ein Fenster
+     abzueglich Kopfzeile (sticky, ~80px) */
+  .lpv2-page--desktop-rahmenbild .lpv2-hero{--hero-inset:max(clamp(32px,4vw,72px),env(safe-area-inset-left,0px),env(safe-area-inset-right,0px));--hero-max:1680px;position:relative;isolation:isolate;display:grid;grid-template-columns:max(var(--hero-inset),calc((100% - var(--hero-max)) / 2)) minmax(0,52fr) minmax(0,48fr) max(var(--hero-inset),calc((100% - var(--hero-max)) / 2));grid-template-rows:minmax(64px,1fr) auto auto auto auto minmax(64px,1fr);min-height:clamp(640px,calc(100svh - 80px),900px);padding:0;background:var(--lp-bg);overflow:visible}
+  .lpv2-page--desktop-rahmenbild .lpv2-hero::before{content:'';grid-column:1 / 3;grid-row:1 / -1;align-self:stretch;justify-self:start;width:clamp(360px,34vw,680px);margin-left:-4%;background:url('../img/hero/rohdich-blueten-wasserzeichen.webp?v=20260902a') center / contain no-repeat;opacity:.12;filter:saturate(.7);pointer-events:none}
+  .lpv2-page--desktop-rahmenbild .lpv2-hero > .container{display:contents}
+  .lpv2-page--desktop-rahmenbild .lpv2-kicker,
+  .lpv2-page--desktop-rahmenbild .lpv2-breadcrumbs--desktop,
+  .lpv2-page--desktop-rahmenbild .lpv2-hero-edge{display:none}
+
+  /* 3 - Zeile 2: "Alle Leistungen" (der Handy-Balken, umgezogen und als Versalzeile gesetzt) */
+  .lpv2-page--desktop-rahmenbild .lpv2-breadcrumbs--bar{grid-column:2;grid-row:2;align-self:end;justify-self:start;margin:0 0 26px;color:var(--home-on-dark-2,#d9ded5);font-size:13px;font-weight:800;line-height:1;letter-spacing:.08em;text-transform:uppercase}
+  .lpv2-page--desktop-rahmenbild .lpv2-breadcrumb-back a{gap:10px;min-height:0}
+  .lpv2-page--desktop-rahmenbild .lpv2-breadcrumb-back a > span{padding-bottom:2px;border-bottom:1px solid rgba(140,198,63,.6);text-decoration:none}
+  .lpv2-page--desktop-rahmenbild .lpv2-breadcrumb-back img{width:22px}
+
+  /* 4 - Zeile 3: Herkunftszeile mit Bluete (Text der Startseite, gate-region) */
+  .lpv2-page--desktop-rahmenbild .lpv2-hero-eyebrow{grid-column:2;grid-row:3;display:flex;align-items:center;gap:12px;margin:0 0 22px;color:var(--home-on-dark-2,#d9ded5);font-family:Nunito,system-ui,sans-serif;font-size:15px;font-weight:700;line-height:1.3;letter-spacing:.01em}
+  .lpv2-page--desktop-rahmenbild .lpv2-hero-eyebrow img{width:30px;height:auto;filter:drop-shadow(0 2px 2px rgba(0,0,0,.45))}
+  .lpv2-page--desktop-rahmenbild .lpv2-hero-eyebrow b{color:var(--home-on-dark,#fafaf6);font-weight:800}
+
+  /* 5 - Zeile 4: Titel. Mit Schriftzug (gruene Handschrift wie "Garten" auf der Startseite):
+     die Baloo-Zeilen verschwinden, das Bild traegt den Titel, aria-label bleibt am h1.
+     Ohne Schriftzug: Baloo 700 wie der Startseiten-Titel, zweite Zeile im Logo-Gruen. */
+  .lpv2-page--desktop-rahmenbild .lpv2-title{grid-column:2;grid-row:4;align-self:auto;justify-self:start;width:min(100%,620px);max-width:none;margin:0;padding:0;background:transparent;text-align:left;line-height:0}
+  .lpv2-page--desktop-rahmenbild .lpv2-title--split > .lpv2-title-lines{display:none}
+  .lpv2-page--desktop-rahmenbild .lpv2-title-graphic-desktop{display:block;width:100%;height:auto;filter:drop-shadow(0 5px 13px rgba(0,0,0,.24))}
+  .lpv2-page--desktop-rahmenbild .lpv2-title:not(:has(.lpv2-title-graphic-desktop)){color:var(--home-on-dark,#fafaf6);font-size:clamp(44px,4.4vw,80px);font-weight:700;line-height:1.04;letter-spacing:-.028em;text-wrap:balance}
+  .lpv2-page--desktop-rahmenbild .lpv2-title:not(:has(.lpv2-title-graphic-desktop)) > .lpv2-title-lines{display:block}
+  .lpv2-page--desktop-rahmenbild .lpv2-title:not(:has(.lpv2-title-graphic-desktop)) > .lpv2-title-lines > span:first-child:after{content:'-'}
+  .lpv2-page--desktop-rahmenbild .lpv2-title:not(:has(.lpv2-title-graphic-desktop)) > .lpv2-title-lines > span:last-child{color:var(--mobile-logo-green,#56e607)}
+
+  /* 6 - Zeile 5: Anfrageknopf (maik-cta, 440 x 74) und runder Anruf-Knopf daneben */
+  .lpv2-page--desktop-rahmenbild .lpv2-mobile-hero-cta{grid-column:2;grid-row:5;display:flex;align-items:center;gap:22px;width:100%;margin:38px 0 0;padding:0}
+  .lpv2-page--desktop-rahmenbild .lpv2-mobile-hero-cta__button{width:min(100%,440px);min-height:74px;height:74px;padding:8px 12px 8px 0;border-radius:16px}
+  .lpv2-page--desktop-rahmenbild .lpv2-mobile-hero-cta__button .maik-cta__label{font-size:1.125rem;letter-spacing:.02em}
+  .lpv2-page--desktop-rahmenbild .lpv2-mobile-hero-cta__button .maik-cta__arrow{width:70px;height:46px;margin-right:14px}
+  .lpv2-page--desktop-rahmenbild .lpv2-mobile-hero-cta__button .maik-cta__arrow-image{width:52px}
+  .lpv2-page--desktop-rahmenbild .lpv2-hero-tel{display:grid;place-items:center;flex:0 0 auto;width:66px;height:66px;border-radius:50%;background:#171916;box-shadow:inset 0 0 0 1.5px var(--home-lime,#8cc63f);text-decoration:none;transition:box-shadow .18s ease}
+  .lpv2-page--desktop-rahmenbild .lpv2-hero-tel img{width:34px;height:34px;object-fit:contain}
+  .lpv2-page--desktop-rahmenbild .lpv2-hero-tel:hover{box-shadow:inset 0 0 0 1.5px var(--mobile-logo-green,#56e607),0 0 0 6px rgba(86,230,7,.12)}
+  .lpv2-page--desktop-rahmenbild .lpv2-hero-tel:focus-visible{outline:2px solid var(--home-lime,#8cc63f);outline-offset:5px}
+
+  /* 7 - Zeile 6: Nachweise wie der hero-proof-strip der Startseite */
+  .lpv2-page--desktop-rahmenbild .lpv2-hero-proof{grid-column:2;grid-row:6;align-self:start;display:flex;flex-wrap:wrap;align-items:center;gap:18px clamp(20px,2vw,32px);margin:30px 0 0;font-family:Nunito,system-ui,sans-serif}
+  .lpv2-page--desktop-rahmenbild .lpv2-hero-proof__instagram{display:inline-flex;align-items:center;gap:12px;min-height:48px;color:var(--home-on-dark,#fafaf6);font-size:clamp(15px,1.05vw,18px);font-weight:800;line-height:1;text-decoration:none;white-space:nowrap}
+  .lpv2-page--desktop-rahmenbild .lpv2-hero-proof__instagram strong{color:var(--home-lime,#8cc63f);font:inherit}
+  .lpv2-page--desktop-rahmenbild .lpv2-hero-proof__instagram-icon{display:inline-flex;align-items:center;justify-content:center;flex:0 0 44px;width:44px;height:44px;border-radius:14px;color:#fff;background:radial-gradient(circle at 30% 105%,#feda75 0 20%,#fa7e1e 34%,#d62976 57%,#962fbf 76%,#4f5bd5 100%);box-shadow:0 5px 12px rgb(0 0 0 / 24%)}
+  .lpv2-page--desktop-rahmenbild .lpv2-hero-proof__instagram-icon svg{width:26px;height:26px}
+  .lpv2-page--desktop-rahmenbild .lpv2-hero-proof__location{display:flex;align-items:center;gap:14px;color:var(--home-on-dark,#fafaf6);font-size:clamp(15px,1.05vw,18px);font-weight:800;line-height:1.3}
+  .lpv2-page--desktop-rahmenbild .lpv2-hero-proof__location p{margin:0}
+  .lpv2-page--desktop-rahmenbild .lpv2-hero-proof__location span{display:block}
+  .lpv2-page--desktop-rahmenbild .lpv2-hero-proof__location strong{color:var(--home-lime,#8cc63f);font:inherit}
+  .lpv2-page--desktop-rahmenbild .lpv2-hero-proof__mark{position:relative;display:block;flex:0 0 36px;width:36px;height:56px;filter:drop-shadow(0 5px 8px rgba(0,0,0,.26))}
+  .lpv2-page--desktop-rahmenbild .lpv2-hero-proof__pin{position:absolute;top:0;left:-10px;width:56px;max-width:none;height:56px}
+  .lpv2-page--desktop-rahmenbild .lpv2-hero-proof__flower{position:absolute;top:43%;left:50%;width:22px;height:auto;transform:translate(-50%,-50%)}
+
+  /* 8 - Spalte 3: die Karte. Figure wird 3:4, Bild per <source media> im Hochkant-Derivat,
+     versetzter Rahmen im Pseudoelement (title-above hatte ::before ausgeblendet). */
+  .lpv2-page--desktop-rahmenbild .lpv2-hero-media{grid-column:3;grid-row:1 / -1;align-self:center;justify-self:end;position:relative;z-index:2;width:min(100%,460px);height:auto;aspect-ratio:3 / 4;margin:0;overflow:visible;border-radius:26px 7px 26px 7px;background:transparent;box-shadow:0 40px 70px -36px rgba(0,0,0,.95),0 30px 60px -40px rgba(93,224,35,.55)}
+  .lpv2-page--desktop-rahmenbild .lpv2-hero-media::before{content:'';display:block;position:absolute;inset:0;z-index:-1;transform:translate(12px,12px);border:1.5px solid var(--home-lime,#8cc63f);border-radius:inherit;background:none;opacity:.9;pointer-events:none}
+  .lpv2-page--desktop-rahmenbild .lpv2-hero-media picture{position:absolute;inset:0;overflow:hidden;border-radius:inherit}
+  .lpv2-page--desktop-rahmenbild .lpv2-hero-media img:not(.lpv2-hero-brand){width:100%;height:100%;object-fit:cover;object-position:40% 55%}
+  .lpv2-page--desktop-rahmenbild .lpv2-hero-brand{right:-30px;bottom:-34px;width:140px;z-index:3}
+  .lpv2-page--desktop-rahmenbild .lpv2-hero-tag{position:absolute;left:-18px;top:36px;z-index:3;display:block;padding:10px 16px 10px 14px;border-radius:12px 4px 12px 4px;background:#171916;box-shadow:inset 0 0 0 1.5px var(--home-lime,#8cc63f);color:var(--home-on-dark,#fafaf6);font-family:Nunito,system-ui,sans-serif;font-size:14px;font-weight:800;letter-spacing:.02em;white-space:nowrap}
+  .lpv2-page--desktop-rahmenbild .lpv2-hero-tag b{color:var(--mobile-logo-green,#56e607)}
+
+  /* 9 - Uebergang zur Textsektion: der Held bringt seine Luft unten selbst mit (Zeile 7) */
+  .lpv2-page--desktop-rahmenbild .lpv2-content-feature{padding-top:40px}
+}
diff --git a/content/leistungen/privat/balkonkastenbepflanzung.json b/content/leistungen/privat/balkonkastenbepflanzung.json
index badd759..fe3e40b 100644
--- a/content/leistungen/privat/balkonkastenbepflanzung.json
+++ b/content/leistungen/privat/balkonkastenbepflanzung.json
@@ -14,6 +14,14 @@
   "themeColor": "#171916",
   "mobileCssVersion": "20261002j",
   "desktopLayout": "trichter",
+  "desktopHero": "rahmenbild",
+  "desktopHeroPortrait": "/assets/img/leistungen-mobile/originale/balkonkastenbepflanzung.jpg",
+  "desktopHeroGraphic": {
+    "bild": "/assets/img/leistungen-mobile/balkonkastenbepflanzung-schriftzug-1400.webp",
+    "bild1x": "/assets/img/leistungen-mobile/balkonkastenbepflanzung-schriftzug-700.webp",
+    "width": 1400,
+    "height": 508
+  },
   "ctaFamilyVersion": "20260926b",
   "h1": "Balkonkastenbepflanzung",
   "heroTitleLines": [
```

## 5. Stopp-Regeln

- **Handy bis 900 px pixelgleich**, Querformat 481–900 px eingeschlossen. Alle Layoutregeln hinter `@media (min-width:901px)`; die eine Zeile davor blendet nur neue Elemente aus. QA §6, Punkt 1.
- **Nur der Held.** Textsektion (AP-534), Galerie, Fragen, Kontakt, Ergänzungen, Fußzeile: unverändert bis auf die 40 px Oberkante der Textsektion. Keine Regel zielt auf `.lpv2-content-feature` außer `padding-top`.
- **Header-Knöpfe** unangetastet; der neue Anruf-Knopf ist im Held, nicht im Kopf.
- **Keine neuen Claims.** Herkunftszeile und Nachweise sind Startseiten-Texte. Keine Zahlen, Jahre oder Qualifikationen ergänzen.
- **Kein Perl, keine generierten Dateien von Hand, keine `:root`-Tokens, kein `overflow:hidden` am Footer, `build-images.mjs` nicht anstoßen.**
- **Nur diese eine Seite** bekommt `desktopHero`. Die 37 anderen JSON-Dateien nicht anfassen.

## 6. QA (Chromium, Playwright; 901, 1024, 1280, 1440, 1920 px; außerdem 375, 480, 874 px quer)

1. **Handy-Abgleich.** Full-Page-Screenshots der Balkonkastenseite bei 375, 480 und 874 × 402 px (quer) vor/nach dem Patch pixelweise vergleichen (Pillow-Differenzbild), Reveal-Zustände vorher per `document.querySelectorAll('.reveal').forEach(e=>e.classList.add('is-in'))` vereinheitlichen. Erwartung: 0 abweichende Bildpunkte. Zusätzlich `getComputedStyle` der fünf neuen Elemente bei 480 px: `display: none`.
2. **Übrige Sektionen am Desktop.** Bei 1280 px `getBoundingClientRect()` von `.lpv2-content-feature > .container`, `.lpv2-gallery-grid-section`, `.lpv2-faq`, `.private-contact`, `.lpv2-related` vor/nach: Breite und `left` identisch (640 px Spalte bzw. 1080 px Textsektion). Höhen identisch bis auf die Textsektion (−40 px oben).
3. **Bühne.** Bei 1440 × 900: Kopfhöhe (`.site-header`) messen – weicht sie von 80 px um mehr als 8 px ab, den Wert in `min-height: clamp(640px, calc(100svh - 80px), 900px)` anpassen. `.lpv2-hero` Breite = Fensterbreite (keine 640-px-Spalte mehr), Höhe ≥ 820 px, `zoom` = 1. Wasserzeichen-Pseudoelement links vorhanden, ≈ 490 px breit (34 vw), Deckkraft .12.
4. **Linke Spalte.** `left` von Balken, Herkunftszeile, H1, Knopf und Nachweisen identisch (= Rand 58 px bei 1440). Balken 13 px Versalien mit grünem Pfeil 22 px. Schriftzug `<img>` sichtbar, 620 × ≈225 px, `.lpv2-title-lines` `display:none`. Knopf 440 × 74, Beschriftung 18 px; Anruf-Knopf 66 × 66 rund mit Lime-Ring, 22 px rechts daneben. Nachweise: Instagram-Kachel 44 px mit Verlauf, Pin mit Blüte, Texte 15–18 px fett, „Live“ und „Herne“ in Lime.
5. **Karte.** `.lpv2-hero-media` 460 × 613 (3:4), rechtsbündig an Rand (right = 1440 − 58), vertikal mittig; `::before` 1,5 px Lime-Rahmen um 12 px nach rechts unten versetzt; Bild lädt das Hochkant-Derivat (`currentSrc` enthält `-hero-800` oder `-hero-1200`, **nicht** `-4x3`); Stempel 140 px über die Ecke unten rechts; Reiter „Leistung für Privatkunden“ oben links über den Rand hinaus.
6. **Fallback ohne Schriftzug.** Testweise `desktopHeroGraphic` aus dem JSON nehmen, bauen: H1 zeigt „Balkonkasten-“ weiß und „bepflanzung“ in `#56e607`, Baloo 700, 63 px bei 1440. Danach zurücksetzen.
7. **Schmaler Desktop 901 px.** Spalte 2 ≈ 437 px: Schriftzug skaliert auf Spaltenbreite, Knopf 437 px, Anruf-Knopf rutscht nicht um (Flex, `flex: 0 0 auto`), Nachweise brechen auf zwei Zeilen; Karte 384 px breit (48 % von 801); `scrollWidth === innerWidth`.
8. **Reveal.** Frisch laden bei 1280 × 800: Balken, Herkunftszeile, Titel, Karte, Knopf, Nachweise erscheinen gestaffelt; der Knopf pulsiert danach (`maik-cta--attention`, `cta-signal.js`) wie heute.
9. **Andere Leistungsseite** (`/privatkunden/leistungen/baumpflege/`): Held wie heute (640-px-Spalte, keine `desktop-rahmenbild`-Klasse, keine `media`-Sources, ein Preload); Diff gegen vorher nur die drei `?v=`-Strings.
10. **Konsole** ohne Fehler, 404-frei (beide Schriftzug-WebPs, Wasserzeichen `rohdich-blueten-wasserzeichen.webp`, Pin-SVG). Lighthouse LCP: das Hochkant-Derivat ist das LCP-Element und wird vom Desktop-Preload getroffen (Netzwerk-Tab: kein doppelter Abruf des 4:3-Bilds am Desktop).
11. **Tastatur.** Reihenfolge: Alle Leistungen → Knopf → Anruf → Instagram → danach Textsektion. Fokusringe sichtbar (Knopf `outline-offset: 9px`, Anruf 5 px).

## 7. Offene Punkte und Entscheidungen

- **E1 – Herkunftszeile.** Text ist der Startseiten-Satz (`gate-region`). Soll sie leistungsspezifischer werden („… für Balkon und Fenster“), ist das ein JSON-Feld (`desktopHeroEyebrow`) pro Seite, keine Code-Änderung. Mit Maik klären.
- **E2 – Reiter „Leistung für Privatkunden“.** Rein visuell, `aria-hidden`. Wirkt er zu viel, Regel `.lpv2-hero-tag{display:block}` streichen (Teil 8) – das Element bleibt harmlos im DOM, oder `heroTag` im Build auf `''` setzen.
- **E3 – Kopfhöhe.** 80 px angenommen, nicht gemessen (kein Browser bei Erstellung). QA §6, Punkt 3.
- **E4 – Zoom und Seitenkopf.** Der Kopf ist auf Leistungsseiten sticky im Fluss, auf der Startseite schwebt er. Soll der Held wie dort unter dem Kopf beginnen (160 px Luft oben), ist das ein eigenes AP am Header – hier bewusst nicht angefasst (Stopp-Regel).
- **Ausrollen auf 37 Leistungen (eigenes AP).** Pro Seite nötig: `desktopHero`, ein Hochkant-Motiv im Manifest (heute haben alle Seiten ein `originale/<slug>.jpg` neben dem `-4x3.jpg` – prüfen, ob die 3:4-Derivate überall existieren), optional ein Schriftzug (sonst Baloo-Fallback), Gewerbe-Seiten bekommen „Gewerbekunden“ automatisch. Wasserzeichen und Nachweise sind für alle gleich.
- **Schriftzug-Pflege.** Der Schriftzug ist ein Grafik-Asset außerhalb der CMS-Bildpipeline. Bei Änderungen des Leistungsnamens muss er neu erzeugt werden – im CMS (`admin/config.yml`) ist das Feld bewusst nicht angelegt.
