# AP-566 — Leistungsseite Balkonkasten: Textbereich am Desktop als zwei Spalten mit Bewegung (Mockup F)

Stand 06.10.2026 · Seite `/privatkunden/leistungen/balkonkastenbepflanzung/` · nur Desktop ab 901 px.
Ersetzt das Trichter-Layout aus **AP-534** (Variante 8) in der Textsektion. Handy bis 900 px bleibt pixelgleich. Die übrigen 37 Leistungsseiten bleiben unverändert (Ausrollen ist ein eigenes AP). Der Held (AP-565) und alles ab der Galerie bleiben wie sie sind.

Freigegeben per Mockup `mockup-balkonkasten-variante-f.html` (Variante **F · beide Überschriften nebeneinander**). **Sascha: „Wichtig ist mir das Bewegliche.“** Die Bewegung ist also nicht Kür, sondern Teil des Auftrags – §4 ist Pflicht, nicht optional.

---

## 0. Kurz für Claude Code

1. Branch wie bei AP-534/AP-565 (aktueller Arbeitsbranch). **Nicht** selbst nach `claude/kind-fermat-pyzy5p` mergen – der Deploy-Merge ist Saschas Schritt. Weicht der Arbeitsbranch ab oder ist unklar: vorher nachfragen.
2. AP-Nummer prüfen: `git log --all --oneline | grep -oE "AP-[0-9]+" | sort -t- -k2 -n -u | tail -3` **und** `git grep -hoE "AP-5[0-9]{2}" -- . | sort -u | tail -3`. Stand bei Erstellung: höchste im Repo belegte Nummer **AP-564**; AP-565 (Held „Rahmenbild“) ist geschrieben, aber ggf. noch nicht committet. Ist AP-566 belegt: nächste freie nehmen und in Kommentaren, Dateiname und Commit ersetzen.
3. Änderungen nach §3 von Hand einspielen (vier Quelldateien, kein Patch – der Stand hat sich seit AP-534 mehrfach bewegt). Python mit `encoding="utf-8"`, vor jedem Ersetzen `assert s.count(old) == 1`. **Kein Perl.**
4. Build: `cd .github/scripts && node build-leistungen.mjs`. Generierte HTML-Dateien nie von Hand anfassen. Erwartung: alle 38 Leistungsseiten bekommen die neuen Versionsstrings (CSS/JS aus `index.html`); **inhaltlich** ändert sich keine generierte Seite – das Markup bleibt identisch, alles Neue ist CSS und JS.
5. QA nach §6, dann dieses Dokument nach `docs/ap/AP-566-balkonkasten-desktop-zwei-spalten-bewegung.md` legen.
6. Ein Commit: `AP-566: Leistungsseite Balkonkasten - Textbereich am Desktop als zwei Spalten mit Bewegung`

---

## 1. Auftrag

Sascha findet das Trichter-Layout (AP-534, alles auf der Mittelachse gestapelt) am Desktop zu generisch – „sieht aus wie jede andere Website“ und wie eine gestreckte Handyansicht. Mockup F wurde freigegeben:

```
┌──────────────────────────── 1080 px ─────────────────────────────┐
│ Ein Stück Garten                │     Wir bringen Farbe an        │  ← H2 und H3 nebeneinander,
│ vor Ihrem Fenster  (H2)        ┃     Balkon und Fenster  (H3)    │     gleiche Größe, eine Linie
│                                 ┃                                 │
│ ── Einstieg-Absatz              ┃  ✿ Pflanzenauswahl …            │  ← Blüten blühen beim Erreichen auf
│                                 ┃  ✿ Bepflanzung …                │
│ ── Standort-Absatz              ┃  ✿ Substrat …                   │
│                                 ┃  ✿ Kombination …                │
│                                 ┃  ✿ Wechsel …                    │
│                                 ┃                                 │
│ ────────────────────────────────┴───────────────────────────────  │  ← Haarlinie über die Breite
│ Hinweistext (Blocksatz)         │  ┌ Abschluss-Kachel ┐           │
│                                 │  │ … Blütenstempel  │           │
│                                 │  └──────────────────┘           │
│                                 │  [ JETZT ANFRAGEN → ] 400 px    │
└──────────────────────────────────────────────────────────────────┘
                 ┃ = Trennlinie, füllt sich mit dem Scrollen grün, Lichtpunkt an der Spitze
                 ── = kurze grüne Striche, die sich über den Absätzen zeichnen
```

Links: Überschrift, beide Einstiegstexte untereinander. Rechts: Leistungsüberschrift, Liste. Unten im selben Raster: Hinweistext links, Abschluss-Kachel mit Knopf rechts.

### 1.1 Die Bewegung (Pflicht, siehe §4)

| # | Was | Wann | Wie |
|---|---|---|---|
| B1 | Die Wörter beider Überschriften steigen aus einer unsichtbaren Kante auf, Wort für Wort (70 ms Versatz), H3 beginnt 300 ms nach H2 | einmalig, sobald die Textsektion ins Fenster kommt | JS zerlegt die Überschriften in `<span>`-Wörter, CSS-Animation |
| B2 | Die senkrechte Trennlinie zwischen den Spalten füllt sich von oben grün, mit einem kleinen Lichtpunkt an der Spitze | fortlaufend mit dem Scrollen (0 → 100 % zwischen Eintritt und Verlassen der Sektion) | JS setzt `--lpv2-divider-p` am Container, CSS zeichnet |
| B3 | Die Blüten der fünf Listenpunkte öffnen sich (Skalierung 0 → 1 mit Überschwingen, leichte Drehung), danach schwingen sie kaum merklich; bei Hover drehen sie sich und der Text rückt 6 px nach rechts | einzeln beim Erreichen (bestehender `data-reveal-late`-Mechanismus, 72 %-Linie) | CSS auf `li.reveal.is-in::before` |
| B4 | Kurze grüne Striche (56 px) über den beiden Einstiegstexten zeichnen sich von links | wie B1, 0,5 s bzw. 0,75 s versetzt | CSS `scaleX` |
| B5 | ~~Um die Abschluss-Kachel läuft ein grüner Lichtsaum einmal herum (8 s, endlos)~~ **entfernt 06.10.2026 (AP-567 Nachtrag)** | sobald die Kachel da ist | CSS `conic-gradient` + Maske auf `.lpv2-closing::before` |
| B6 | Knopf: bestehendes Pulsen (`maik-cta--attention`, AP-Kundenwunsch) bleibt unverändert | — | nichts tun |

Alles respektiert `prefers-reduced-motion: reduce`: dann steht alles sofort, nichts bewegt sich (der bestehende Block am Ende von `leistung-mobile.css` setzt Animationsdauern auf 0,01 ms; B2 wird im JS auf 100 % gesetzt).

---

## 2. Ist-Zustand und Herleitung

### 2.1 Was AP-534 aufgebaut hat und was bleibt

- Teil 1 (Spalte/Zoom von `.lpv2-main` auf die Sektionen) **bleibt unverändert** – Held, Galerie, Fragen, Kontakt behalten ihre 32rem-Spalte mit `zoom:1.25`.
- Teil 2 (Satzspiegel, Container als Grid, `display:contents` für Artikel/Service/Closing) **bleibt**, mit zwei Änderungen: die Mittelspalte wird 20 px statt 1 px breit (Platz für den Lichtpunkt), und `.lpv2-closing-block` wird **kein** `display:contents` mehr (Kachel und Knopf sollen zusammen als ein Rasterfeld rechts unten stehen).
- Teil 3–5 (Zeilen, Platzierung) werden **ersetzt**.
- Teil 6 (Erscheinen, 12 px / 0,55 s) **bleibt** und wird um die Blüten erweitert.
- Die Neutralisierung außerhalb der Media Query (Handy zeigt `li.reveal` sofort) **bleibt**.

### 2.2 Abgeleitete Werte

| Wert | Herleitung |
|---|---|
| Spalten `minmax(0,1fr) 20px minmax(0,1fr)`, `column-gap:44px` | 1080 − 20 − 88 = 972 → 486 px je Spalte. AP-534 hatte 487,5 px – Absätze mit `max-width:46ch` (≈ 455 px) passen weiterhin. Die Mittelspalte ist 20 px, damit der 9-px-Lichtpunkt mit 6-px-Hof (= 21 px) nicht über die Absätze läuft; die 1-px-Linie liegt in der Spaltenmitte. |
| H2 und H3 beide `2rem` (32 px), `line-height:1.1`, `max-width:12em` | Mockup: gleiche Größe, Baloo 2 800. AP-534 hatte H2 34 / H3 32 – jetzt gleich, weil sie auf einer Linie stehen. 12 em × 32 px = 384 px → „Ein Stück Garten vor Ihrem Fenster“ bricht nach „Garten“ um (zwei Zeilen), „Wir bringen Farbe an Balkon und Fenster“ nach „an“ (zwei Zeilen). Beide zweizeilig = gleiche Höhe = Absätze und Liste beginnen auf einer Linie. |
| Zeilen: 1 = Überschriften, 2 = Einstieg / Liste, 3 = Standort / (Liste läuft weiter), 4 = Hinweis / Kachel+Knopf | Liste `grid-row:2 / 4` spannt über beide Absatz-Zeilen; `align-items:start`. |
| Abstand H → Inhalt 26 px, Einstieg → Standort 20 px, Zeile 3 → Zeile 4: 56 px Luft + 1 px Haarlinie + 36 px | Mockup: 26 / 20 / 56 + 36 (Haarlinie als `border-top` der Zeile-4-Elemente ist nicht möglich, weil zwei Elemente – deshalb `.container::after` als eigenes Rasterfeld über beide Spalten in Zeile 4, die Inhalte stehen in Zeile 5). Also real: Zeile 4 = Haarlinie (`margin-top:56px`), Zeile 5 = Hinweis / Kachel+Knopf (`margin-top:36px`). |
| Striche über den Absätzen 56 × 1 px, `padding-top:16px` | Mockup. Farbe `--mobile-logo-green`, Deckkraft .32 (wie die Haarlinie in AP-534: .55 wirkte bei kurzen Strichen zu hart – im Mockup `rgba(140,198,63,.32)`). |
| Trennlinie: Grundlinie `rgba(250,248,241,.1)`, Füllung `linear-gradient(var(--mobile-logo-green), #5FAE35)`, Punkt 9 px + Hof 6 px `rgba(…,.18)` | Mockup. Füllung `scaleY(var(--lpv2-divider-p))`, Punkt `top: calc(var(--lpv2-divider-p) * 100%)`. |
| Fortschritt `p = clamp((0.7 · Fensterhöhe − top) / Höhe, 0, 1)` | Mockup: Fokuslinie 70 % Fensterhöhe. Bei p ≤ 0,02 oder ≥ 0,98 wird der Punkt ausgeblendet (Linie beginnt/endet sauber). |
| Blüte: `scale(0) rotate(-48deg)` → `scale(1) rotate(-8deg)`, 0,8 s `cubic-bezier(.34,1.5,.5,1)` | Mockup: Überschwingen durch y > 1 in der Kurve. Endzustand `rotate(-8deg)` = der heutige Ruhezustand (`li:before{transform:rotate(-8deg)}`), damit nichts springt. Schwingen danach: `rotate(-12deg)` ↔ `rotate(-3deg)`, 5 s, alternate, Startversatz `i × 0,7 s` über `--i` (nth-child). |
| Wort-Aufstieg: `translateY(110%)` → 0, 0,85 s `cubic-bezier(.2,.8,.2,1)`, Versatz 70 ms/Wort, H3 +300 ms | Mockup. Das Wort-Span ist `overflow:hidden` mit `padding-bottom:.1em; margin-bottom:-.1em`, damit Unterlängen (g, p) nicht abgeschnitten werden. |
| Lichtsaum: 1 px Ring, `conic-gradient(from var(--lpv2-ang), transparent 0 70%, grün 86%, transparent 100%)`, 8 s linear endlos | Mockup. `@property --lpv2-ang` (Chrome/Safari/Firefox aktuell). Ohne `@property`-Unterstützung: Ring steht still, kein Fehler. Die Kachel hat Rundung `18px 5px 18px 5px` – der Ring folgt ihr über `border-radius:inherit`. |
| Knopf 400 px, linksbündig unter der Kachel, `margin-top:20px` | **E1 (§7):** Mockup F hatte den Knopf *in* der Kachel. Live sind Kachel (`p.lpv2-closing`) und Knopf Geschwister – ihn in die Kachel zu holen hieße Markup-Umbau im Build. Umgesetzt wird: Knopf direkt unter der Kachel, gleiche linke Kante. Falls Sascha ihn in der Kachel will, ist das ein Folge-AP am Template. |

### 2.3 Warum die Wörter per JS zerlegt werden, nicht im Build

Das Markup der Überschriften bleibt im Build unangetastet (SEO/AEO: Crawler sehen `<h2>Ein Stück Garten vor Ihrem Fenster</h2>` am Stück, kein Span-Salat). `main.js` zerlegt zur Laufzeit nur am Desktop und nur auf `lpv2-page--desktop-trichter`. Ohne JS oder bei `reduced-motion` stehen die Überschriften einfach da – die CSS-Regeln greifen erst, wenn die Klasse `lpv2-split` am Heading sitzt, die JS setzt.

### 2.4 Warum die Haarlinie und die Trennlinie am Container hängen

`.container` ist das einzige echte Rasterelement; Artikel, Service und Closing sind `display:contents`. Container-`::before` ist die Trennlinie (Zeilen 1–3, Spalte 2), Container-`::after` die waagerechte Haarlinie (Zeile 4, alle Spalten). AP-534 nutzte `::before` schon für die alte Haarlinie – die Regel wird ersetzt, nicht ergänzt.

---

## 3. Änderungen nach Fundstelle

Keine Zeilennummern; Fundstellen über Signaturen.

### 3.1 `assets/css/leistung-mobile.css` – Block „AP-534“

**Kopfkommentar** des Blocks: nach der Zeile `   Scrollen (data-reveal-late, main.js: Ausloeselinie 72 % Fensterhoehe). */` nichts ändern, aber **vor** `.lpv2-page--desktop-trichter .lpv2-content-service .lpv2-content-list li.reveal,` folgende Zeile einfügen:

```
/* AP-566 (06.10.2026): Teile 2-6 unten auf Mockup F umgebaut - zwei Spalten nebeneinander
   (links Ueberschrift + beide Absaetze, rechts Leistungsueberschrift + Liste), darunter
   Hinweis links und Kachel + Knopf rechts. Dazu Bewegung: Wort-Aufstieg der Ueberschriften,
   Trennlinie fuellt sich beim Scrollen, Blueten bluehen auf, Lichtsaum um die Kachel. */
```

(a′) **Außerhalb** der Media Query, direkt nach der Neutralisierungsregel `…lpv2-content-service-copy.reveal{opacity:1;transform:none;transition:none}` eine Zeile einfügen:
```
.lpv2-divider-fill{display:none}
```

**Innerhalb `@media (min-width:901px){ … }` des Blocks:**

(a) Teil 2 – die Grid-Regel am Container. Suche exakt:
```
grid-template-columns:minmax(0,1fr) 1px minmax(0,1fr);column-gap:52px;row-gap:0;
```
ersetze durch:
```
grid-template-columns:minmax(0,1fr) 20px minmax(0,1fr);column-gap:44px;row-gap:0;align-items:start;position:relative;--lpv2-divider-p:1;
```

(b) Teil 2 – `display:contents`-Regel. Suche exakt:
```
:is(.lpv2-content-editorial,.lpv2-content-service,.lpv2-content-closing,.lpv2-closing-block){display:contents}
```
ersetze durch:
```
:is(.lpv2-content-editorial,.lpv2-content-service,.lpv2-content-closing){display:contents}
```

(c) **Teile 3, 4 und 5 komplett löschen** – vom Kommentar `/* 3 - Zeile 1: Ueberschrift ueber die ganze Breite; …` bis einschließlich der Zeile
```
  .lpv2-page--desktop-trichter .lpv2-content-closing .lpv2-closing-cta{grid-column:1 / -1;grid-row:7;justify-self:center;width:400px;margin:20px auto 0}
```
(das ist die letzte Zeile von Teil 5, direkt vor dem Kommentar `/* 6 - Erscheinen …`). Guard: `assert s.count('/* 3 - Zeile 1') == 1` und `assert s.count('grid-row:7;justify-self:center;width:400px') == 1`.

An dieser Stelle **einfügen** (Teile 3–5 neu):

```css
  /* 3 - Zeile 1: H2 links, H3 rechts, gleiche Groesse, auf einer Linie (Mockup F) */
  .lpv2-page--desktop-trichter .lpv2-content-lead{display:contents}
  .lpv2-page--desktop-trichter .lpv2-content-lead h2,
  .lpv2-page--desktop-trichter .lpv2-content-lead h2.lpv2-content-title--long{grid-column:1;grid-row:1;width:auto;max-width:12em;margin:0;font-size:2rem;line-height:1.1;text-align:left;text-wrap:balance}
  .lpv2-page--desktop-trichter .lpv2-content-service h3{grid-column:3;grid-row:1;width:auto;max-width:12em;margin:0;font-size:2rem;line-height:1.1;text-align:left;text-wrap:balance}

  /* Zeilen 2-3 links: Einstieg und Standort untereinander, je mit kurzem gruenen Strich oben.
     Rechts: Liste ueber beide Zeilen. */
  .lpv2-page--desktop-trichter .lpv2-content-lead .lpv2-content-flow-copy--intro{grid-column:1;grid-row:2;margin-top:26px}
  .lpv2-page--desktop-trichter .lpv2-content-context{grid-column:1;grid-row:3;justify-self:start;width:100%;margin-top:20px}
  .lpv2-page--desktop-trichter :is(.lpv2-content-lead,.lpv2-content-context) p{position:relative;max-width:46ch;margin-inline:0;padding-top:16px;text-align:left;text-align-last:auto;hyphens:manual}
  .lpv2-page--desktop-trichter :is(.lpv2-content-lead,.lpv2-content-context) p::before{content:'';position:absolute;left:0;top:0;width:56px;height:1px;background:var(--mobile-logo-green,#56e607);opacity:.32;transform:scaleX(0);transform-origin:left}
  .lpv2-page--desktop-trichter .lpv2-content-feature > .container.is-live .lpv2-content-lead p::before{animation:lpv2-draw-x .9s var(--ease) .5s forwards}
  .lpv2-page--desktop-trichter .lpv2-content-feature > .container.is-live .lpv2-content-context p::before{animation:lpv2-draw-x .9s var(--ease) .75s forwards}
  .lpv2-page--desktop-trichter .lpv2-content-service .lpv2-content-list{grid-column:3;grid-row:2 / 4;width:100%;max-width:none;margin:26px 0 0}

  /* Trennlinie in Spalte 2 ueber Zeilen 1-3: Grundlinie grau, Fuellung gruen waechst mit dem
     Scrollen (--lpv2-divider-p, main.js), Lichtpunkt an der Spitze. */
  .lpv2-page--desktop-trichter .lpv2-content-feature > .container::before{content:'';grid-column:2;grid-row:1 / 4;position:relative;justify-self:center;width:1px;background:rgba(250,248,241,.1)}
  .lpv2-page--desktop-trichter .lpv2-content-feature > .container .lpv2-divider-fill{display:block;grid-column:2;grid-row:1 / 4;position:relative;justify-self:center;width:1px;pointer-events:none}
  .lpv2-page--desktop-trichter .lpv2-content-feature > .container .lpv2-divider-fill::before{content:'';position:absolute;inset:0;background:linear-gradient(var(--mobile-logo-green,#56e607),#5FAE35);transform:scaleY(var(--lpv2-divider-p));transform-origin:top}
  .lpv2-page--desktop-trichter .lpv2-content-feature > .container .lpv2-divider-fill::after{content:'';position:absolute;left:50%;top:calc(var(--lpv2-divider-p) * 100%);width:9px;height:9px;margin:-4px 0 0 -4px;border-radius:50%;background:var(--mobile-logo-green,#56e607);box-shadow:0 0 0 6px rgba(140,198,63,.18);opacity:var(--lpv2-divider-dot,0)}

  /* 4 - Zeile 4: waagerechte Haarlinie ueber beide Spalten; Zeile 5: Hinweis links,
     Kachel + Knopf rechts (Mockup F). */
  .lpv2-page--desktop-trichter .lpv2-content-feature > .container::after{content:'';grid-column:1 / -1;grid-row:4;height:1px;margin-top:56px;background:rgba(250,248,241,.1)}
  .lpv2-page--desktop-trichter .lpv2-content-service-copy{grid-column:1;grid-row:5;justify-self:start;width:100%;max-width:46ch;margin-top:36px;align-self:center}
  .lpv2-page--desktop-trichter .lpv2-content-service-copy p{max-width:none;text-align:justify;text-align-last:left;hyphens:auto}
  .lpv2-page--desktop-trichter .lpv2-closing-block{grid-column:3;grid-row:5;display:grid;justify-items:start;width:100%;max-width:480px;margin-top:36px}
  .lpv2-page--desktop-trichter .lpv2-content-closing .lpv2-closing{width:100%;max-width:none;margin:0}
  .lpv2-page--desktop-trichter .lpv2-content-closing .lpv2-closing-cta{width:400px;margin:20px 0 0}

  /* 5 - Lichtsaum um die Kachel: 1px-Ring, der gruene Abschnitt laeuft in 8 s einmal herum.
     ::before der Kachel ist frei (homepage-unified setzt content:none); ::after traegt den
     Bluetenstempel und bleibt. */
  .lpv2-page--desktop-trichter .lpv2-content-closing .lpv2-closing::before{content:'';display:block;position:absolute;inset:0;z-index:1;padding:1px;border-radius:inherit;background:conic-gradient(from var(--lpv2-ang,0deg),transparent 0 70%,var(--mobile-logo-green,#56e607) 86%,transparent 100%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:lpv2-ring-turn 8s linear infinite;pointer-events:none}
```

(d) Teil 6 – nach der bestehenden `…reveal.is-in{opacity:1;transform:none}`-Regel (letzte Zeile von Teil 6, direkt vor der schließenden `}` der Media Query) **einfügen**:

```css
  /* 6b - AP-566: Blueten bluehen auf, wenn der Punkt erscheint; danach kaum merkliches
     Schwingen (Versatz je Punkt), bei Hover Drehung und Text rueckt 6px nach rechts. */
  .lpv2-page--desktop-trichter .lpv2-content-service .lpv2-content-list li.reveal:before{transform:scale(0) rotate(-48deg)}
  .lpv2-page--desktop-trichter .lpv2-content-service .lpv2-content-list li.reveal.is-in:before{animation:lpv2-bloom .8s cubic-bezier(.34,1.5,.5,1) forwards,lpv2-sway 5s ease-in-out infinite alternate;animation-delay:0s,calc(var(--lpv2-i,0) * .7s + .8s)}
  .lpv2-page--desktop-trichter .lpv2-content-service .lpv2-content-list li:nth-child(1){--lpv2-i:0}
  .lpv2-page--desktop-trichter .lpv2-content-service .lpv2-content-list li:nth-child(2){--lpv2-i:1}
  .lpv2-page--desktop-trichter .lpv2-content-service .lpv2-content-list li:nth-child(3){--lpv2-i:2}
  .lpv2-page--desktop-trichter .lpv2-content-service .lpv2-content-list li:nth-child(4){--lpv2-i:3}
  .lpv2-page--desktop-trichter .lpv2-content-service .lpv2-content-list li:nth-child(5){--lpv2-i:4}
  .lpv2-page--desktop-trichter .lpv2-content-service .lpv2-content-list li{transition:padding-left .4s var(--ease)}
  @media (hover:hover){
    .lpv2-page--desktop-trichter .lpv2-content-service .lpv2-content-list li.reveal.is-in:hover{padding-left:50px}
    .lpv2-page--desktop-trichter .lpv2-content-service .lpv2-content-list li.reveal.is-in:hover:before{animation:lpv2-bloom .8s cubic-bezier(.34,1.5,.5,1) forwards,lpv2-spin 2.6s linear infinite}
  }

  /* 6c - AP-566: Wort-Aufstieg der Ueberschriften. main.js zerlegt H2/H3 in .lpv2-w-Spans
     und setzt lpv2-split am Heading; ohne JS stehen die Ueberschriften einfach da. */
  .lpv2-page--desktop-trichter .lpv2-split .lpv2-w{display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.1em;margin-bottom:-.1em}
  .lpv2-page--desktop-trichter .lpv2-split .lpv2-w > span{display:inline-block;transform:translateY(110%)}
  .lpv2-page--desktop-trichter .lpv2-content-feature > .container.is-live .lpv2-split .lpv2-w > span{animation:lpv2-rise .85s cubic-bezier(.2,.8,.2,1) forwards;animation-delay:calc(var(--lpv2-wi,0) * 70ms + var(--lpv2-wd,0ms))}
  .lpv2-page--desktop-trichter .lpv2-content-service h3.lpv2-split{--lpv2-wd:300ms}
```

(e) **Nach** der schließenden `}` der Media Query des AP-534-Blocks (also direkt vor `/* ---------- AP-536: …`) die Keyframes und das `@property` einfügen – außerhalb der Media Query, damit sie überall definiert sind:

```css
/* AP-566: Keyframes und registrierte Eigenschaft fuer die Bewegung der Textsektion. */
@property --lpv2-ang{syntax:"<angle>";initial-value:0deg;inherits:false}
@keyframes lpv2-ring-turn{to{--lpv2-ang:360deg}}
@keyframes lpv2-draw-x{to{transform:scaleX(1)}}
@keyframes lpv2-rise{to{transform:translateY(0)}}
@keyframes lpv2-bloom{to{transform:scale(1) rotate(-8deg)}}
@keyframes lpv2-sway{from{transform:scale(1) rotate(-12deg)}to{transform:scale(1.05) rotate(-3deg)}}
@keyframes lpv2-spin{to{transform:scale(1) rotate(352deg)}}
```

(f) `prefers-reduced-motion`: der bestehende Block (`.lpv2-page *{… animation-duration:.01ms!important; animation-iteration-count:1!important}`) deckt alle Keyframes ab. Zusätzlich muss der Grundzustand stehen – **in denselben** `@media (prefers-reduced-motion:reduce){ … }`-Block hinten einfügen:

```css
  .lpv2-page--desktop-trichter .lpv2-split .lpv2-w > span{transform:none!important}
  .lpv2-page--desktop-trichter :is(.lpv2-content-lead,.lpv2-content-context) p::before{transform:scaleX(1)!important}
  .lpv2-page--desktop-trichter .lpv2-content-service .lpv2-content-list li.reveal:before{transform:rotate(-8deg)!important}
  .lpv2-page--desktop-trichter .lpv2-content-feature > .container{--lpv2-divider-p:1!important;--lpv2-divider-dot:0!important}
```

### 3.2 `.github/scripts/lib/render.mjs` – Trennlinien-Element

Die Füllung der Trennlinie braucht ein eigenes Element (der Container hat nur zwei Pseudoelemente, beide belegt). In `lpv2ContentSection(leistung, base)`: dort, wo der Rückgabestring mit `<section class="lpv2-content-feature section" …>` und `<div class="container">` beginnt, **direkt nach** `<div class="container">` einfügen – nur bei `late` (also `desktopLayout === 'trichter'`), sonst byte-identisch:

```js
  // AP-566: leeres Element fuer die Trennlinie am Desktop (Fuellung + Lichtpunkt, CSS).
  const dividerHtml = late ? '<span class="lpv2-divider-fill" aria-hidden="true"></span>' : '';
```
und im Template `<div class="container">${dividerHtml}`.

Guard: `assert s.count('<div class="container">') == 1` **innerhalb** des Funktionskörpers von `lpv2ContentSection` (nicht in der ganzen Datei – `container` kommt öfter vor; den Funktionskörper erst per Index eingrenzen).

Auf dem Handy bleibt `.lpv2-divider-fill` unsichtbar: die Regel `.lpv2-divider-fill{display:none}` steht außerhalb der Media Query (§3.1 (a′)), in der Media Query setzt Teil 3 `display:block` (ist in der Regel oben enthalten).

### 3.3 `assets/js/main.js` – Block „Scroll reveal“, nach `registerReveal();`

Direkt nach der Zeile `registerReveal();` einfügen:

```js
  // --- AP-566: Bewegung der Textsektion am Desktop (Balkonkasten, Mockup F) ---
  // Wort-Aufstieg der Ueberschriften, Trennlinie fuellt sich beim Scrollen. Nur ab 901px,
  // nur auf Seiten mit lpv2-page--desktop-trichter. Bei reduced-motion steht alles sofort.
  (() => {
    const container = document.querySelector('.lpv2-page--desktop-trichter .lpv2-content-feature > .container');
    if (!container || !lateRevealMedia.matches) return;
    if (reduced) { container.classList.add('is-live'); return; }

    const split = (el, delay) => {
      if (!el || el.classList.contains('lpv2-split')) return;
      const words = el.textContent.trim().split(/\s+/);
      el.textContent = '';
      words.forEach((w, i) => {
        const outer = document.createElement('span');
        outer.className = 'lpv2-w';
        outer.style.setProperty('--lpv2-wi', i);
        const inner = document.createElement('span');
        inner.textContent = w;
        outer.appendChild(inner);
        el.appendChild(outer);
        if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
      });
      el.classList.add('lpv2-split');
    };
    split(container.querySelector('.lpv2-content-lead h2'));
    split(container.querySelector('.lpv2-content-service h3'));

    const live = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      container.classList.add('is-live');
      live.disconnect();
    }, { threshold: 0.12 });
    live.observe(container);

    let ticking = false;
    const update = () => {
      ticking = false;
      const r = container.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (window.innerHeight * 0.7 - r.top) / r.height));
      container.style.setProperty('--lpv2-divider-p', p.toFixed(4));
      container.style.setProperty('--lpv2-divider-dot', p > 0.02 && p < 0.98 ? '1' : '0');
    };
    const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request, { passive: true });
    update();
  })();
```

`lateRevealMedia` (Block „Scroll reveal“) und `reduced` (Zeile 5 von `main.js`, `const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches`) existieren im selben Scope – geprüft am Stand `8b446c2`.

**Wichtig:** Die H2 trägt `id="lpv2-content-title"` und wird per `aria-labelledby` referenziert – das Zerlegen in Spans ändert den Accessible Name nicht (Textinhalt bleibt, Spans sind inline). Nicht die `id` anfassen.

### 3.4 `index.html` – Cache-Busting

Die Leistungsseiten beziehen **beide** Versionen aus `index.html` (Build liest `styles.css?v=` für `leistung-mobile.css` und `main.js?v=` für `main.js`; das JSON-Feld `mobileCssVersion` ist ohne Wirkung – nicht anfassen):

- `styles.css?v=20261002y` → `styles.css?v=20261006a` (genau eine Fundstelle)
- `main.js?v=20261002f` → `main.js?v=20261006a` (genau eine Fundstelle)

Danach prüfen, ob die vier Vorlagen in `.github/scripts/templates/` (`leistung-v2.html`, `leistung.html`, `leistung-legacy-document.html`, `rechtstext.html`) irgendwo feste Versionsstrings für `styles.css` oder `main.js` tragen (AP-534 hatte das bei `footer-kontakt.css`). Wenn ja: nachziehen, sonst dreht der Build sie zurück.

---

## 4. Stopp-Regeln (was sich nicht ändern darf)

- **Handy ≤ 900 px pixelgleich.** Alle neuen Regeln liegen in `@media (min-width:901px)` oder sind im Grundzustand wirkungslos (`.lpv2-divider-fill{display:none}`, Keyframes ohne Anwendung). QA §6.1 misst das nach.
- **Held (AP-565), Galerie, Fragen, Kontakt, Ergänzungen** bleiben unverändert – Teil 1 des AP-534-Blocks nicht anfassen.
- **Texte unverändert.** Kein Wort, keine Zeile, keine `lpv2-mobile-keep`-Gruppe wird geändert. Der Satz „Fünf Schritte …“ aus Mockup A ist **nicht** Teil dieses APs.
- **Header-Knöpfe und `.maik-cta`** unangetastet. Das Pulsen des Knopfes (B6) ist bereits live.
- **Kein `overflow:hidden`** am Footer oder an Rasterelementen der Textsektion (Fokusringe). Die einzigen `overflow:hidden` sind die `.lpv2-w`-Wort-Spans.
- **Generierte Seiten nie von Hand.** Alles über `build-leistungen.mjs`.
- **Andere 37 Leistungsseiten:** inhaltlich keine Änderung außer den zwei Versionsstrings.
- **Kein Perl**, Python mit `encoding="utf-8"` und `assert s.count(old) == 1`.

---

## 5. Build und Determinismus

1. `cd .github/scripts && node build-leistungen.mjs`
2. `git status --short | wc -l` → erwartet: 4 Quelldateien + `index.html`… (index.html ist Quelldatei) + 38 generierte Seiten. `git diff --stat -- privatkunden gewerbekunden | tail -1`.
3. Zweiter Build-Lauf → `git status` unverändert (deterministisch).
4. `git diff -- privatkunden/leistungen/balkonkastenbepflanzung/index.html`: genau drei Änderungen – `styles.css?v=` / `leistung-mobile.css?v=` auf `20261006a`, `main.js?v=20261006a`, und das neue `<span class="lpv2-divider-fill" aria-hidden="true"></span>` direkt nach `<div class="container">` der Textsektion. Eine beliebige andere Leistungsseite: nur die Versionsstrings.

---

## 6. QA-Checkliste

Messen mit Playwright/Chromium (wie AP-534), nicht schätzen.

### 6.1 Handy bleibt gleich
- [ ] 390 × 844 (iPhone), 874 × 402 (quer): Screenshot der Balkonkasten-Seite vor/nach dem Commit pixeldiffen (Pillow). Erwartung: 0 abweichende Pixel in der Textsektion. (Der Vergleich geht am einfachsten über `git stash` des CSS/JS bei gleicher generierter Seite – oder vorher die Live-Seite rendern.)
- [ ] `.lpv2-divider-fill` hat auf 390 px `display:none` (computed).

### 6.2 Layout Desktop (1440 × 900 und 1280 × 800)
- [ ] `.container` der Textsektion: `grid-template-columns` computed = `486px 20px 486px` bei 1440 (Satzspiegel 1080). Bei 1280: Satzspiegel 1080, gleiche Werte. Bei 1024: `min(100% − 48px, 1080px)` = 976 → `434px 20px 434px`.
- [ ] H2 und H3: gleiche `font-size` (32 px), gleiche Oberkante (`getBoundingClientRect().top` identisch ± 1 px), beide zweizeilig, beide `text-align:left`.
- [ ] Einstieg-Absatz (`.lpv2-content-flow-copy--intro`) und Liste (`.lpv2-content-list`) beginnen auf derselben Höhe (± 2 px: beide `margin-top:26px` unter zweizeiligen Überschriften gleicher Höhe). Falls die Überschriften bei einer Breite **nicht** gleich hoch sind (z. B. H3 dreizeilig bei 1024): festhalten und in §7 eintragen – akzeptabel, solange nichts überlappt.
- [ ] Standort-Absatz unter dem Einstieg mit 20 px Luft (plus 16 px `padding-top` für den Strich).
- [ ] Waagerechte Haarlinie (`.container::after`) über die volle Satzspiegelbreite, 1 px, 56 px unter dem tiefsten Element der Zeilen 2–3 (Liste).
- [ ] Hinweistext links (`max-width:46ch`, Blocksatz), Kachel rechts 480 px, Knopf 400 px unter der Kachel, linke Kanten von Kachel und Knopf bündig. Hinweistext vertikal mittig zu Kachel+Knopf (`align-self:center`).
- [ ] Blütenstempel der Kachel (`.lpv2-closing::after`) sitzt weiter rechts unten außerhalb der Kachel und wird nicht vom Lichtsaum-Ring (`::before`, z-index 1) überdeckt (`::after` hat z-index 2).
- [ ] Kein horizontaler Scroll bei 1024–1920 px.

### 6.3 Bewegung Desktop (Pflichtteil)
- [ ] **B1** Seite laden, zur Textsektion scrollen: beide Überschriften steigen Wort für Wort auf, H3 ~0,3 s nach H2. Unterlängen („g“ in „bringen“, „p“ nicht vorhanden – „Stück“ hat „ü“) nicht abgeschnitten. Nach dem Aufstieg: `textContent` der H2 = „Ein Stück Garten vor Ihrem Fenster“ (DevTools), `document.getElementById('lpv2-content-title').textContent.trim()` unverändert.
- [ ] **B2** Beim Scrollen durch die Sektion: `--lpv2-divider-p` am Container läuft von 0 nach 1 (DevTools-Konsole: `getComputedStyle(c).getPropertyValue('--lpv2-divider-p')` bei drei Scrollpositionen: Sektion ganz unten im Fenster ≈ 0, Mitte ≈ 0,5, Sektion verlassen = 1). Grüne Füllung wächst von oben, Lichtpunkt sitzt an der Spitze und ist bei p ≈ 0 und p = 1 ausgeblendet.
- [ ] **B3** Von oben in 60-px-Schritten scrollen: die Blüten öffnen sich nacheinander (Skalierung mit sichtbarem Überschwingen), nie zwei gleichzeitig; danach leichtes Schwingen (Winkel zwischen −12° und −3°). Hover auf einen Punkt: Blüte dreht sich, `padding-left` 44 → 50 px.
- [ ] **B4** Die 56-px-Striche über Einstieg und Standort zeichnen sich von links, versetzt (0,5 s / 0,75 s nach `is-live`).
- [ ] **B5** Lichtsaum läuft in ~8 s einmal um die Kachel, folgt der Rundung `18px 5px 18px 5px`. In Firefox: läuft (`@property` ab 128 unterstützt) – falls nicht: steht still, kein Fehler, notieren.
- [ ] **B6** Knopf pulsiert wie bisher (`maik-cta--attention.is-pulsing`).
- [ ] Reveal-Reihenfolge wie AP-534: Punkte 1–5, Hinweis, Kachel, Knopf – nie zwei je Schritt.

### 6.4 Reduzierte Bewegung und Zugänglichkeit
- [ ] Chromium mit `--force-prefers-reduced-motion` (oder DevTools-Rendering-Emulation): alles steht sofort – Überschriften komplett, Striche gezeichnet, Trennlinie voll grün ohne Punkt, Blüten offen in Ruhelage (−8°), kein Lichtsaum-Lauf.
- [ ] JS deaktiviert: Überschriften stehen (keine Spans), Trennlinie voll (`--lpv2-divider-p:1` Default), Striche: **nicht** gezeichnet (brauchen `is-live`) – akzeptiert, 56-px-Linien sind Deko. Liste: Punkte sichtbar? → Nein, `li.reveal` bleibt `opacity:0` ohne JS – **das ist schon heute so (AP-534)**, nicht Teil dieses APs. Nur notieren.
- [ ] Tab-Fokus auf den Knopf: Fokusring vollständig sichtbar, nicht von der Kachel oder `.lpv2-closing-block` beschnitten.
- [ ] Lighthouse Accessibility auf der Seite: kein neuer Fehler; `aria-labelledby` der Sektion löst weiter auf den H2-Text auf.

### 6.5 Konsole
- [ ] Keine Fehler/Warnungen in der Konsole beim Laden und Scrollen (Chromium, Firefox, Safari falls vorhanden).

---

## 7. Offene Entscheidungen

| # | Frage | Vorschlag | Entscheidung |
|---|---|---|---|
| E1 | Knopf **in** der Kachel (Mockup F) oder **unter** der Kachel (Live-Markup, dieses AP)? In der Kachel hieße: `lpv2Closing()` im Build umbauen, den `<a>` in das `<p>` ziehen (nicht erlaubt: `<a>` als Block in `<p>`) → aus dem `<p>` ein `<div>` machen, CSS der Kachel umziehen. Eigenes AP. | Unter der Kachel, linksbündig. | [OFFEN – Sascha] |
| E2 | Hinweistext links in Zeile 5 oder (wie Mockup A/C) teilweise neben der Leistungsüberschrift? Mockup F zeigt ihn komplett unten links. | Wie Mockup F, komplett unten links. | [OFFEN – Sascha, Vorschlag übernehmen, wenn keine Rückmeldung] |
| E3 | Ausrollen auf die übrigen 37 Leistungsseiten: Die Spaltenlogik hängt an gleich hohen Überschriften (beide zweizeilig). Bei Seiten mit einzeiliger H2 und zweizeiliger H3 (oder umgekehrt) stimmt die Oberkante von Absatz und Liste nicht. Vor dem Ausrollen: Längen aller H2/H3 aus `content/leistungen/**/*.json` auswerten. | Eigenes AP, erst nach Maiks Freigabe von Balkonkasten. | [OFFEN] |
| E4 | Mockup-Hinweis: Die Haarlinien-Deckkraft .32 ist aus dem Mockup; AP-534 hatte .55 für die senkrechte Linie. Falls die kurzen Striche am Monitor zu schwach sind: .45. | .32, nach Sichtung ggf. anheben. | [OFFEN – nach QA-Screenshot] |

---

## 8. Umsetzungsvermerk (Claude Code, 06.10.2026)

**AP-Nummer:** AP-566 war frei (kein Commit, keine Fundstelle). Branch
`codex/ap-565-held-rahmenbild` (auf AP-584, vorher `origin/codex/homepage-review` 753d2743
hineingemergt).

**Abweichungen vom Ablauf**

1. **Cache-Schlüssel (§3.4):** Die Schlüssel kommen nicht mehr aus `index.html`, sondern aus den
   Konstanten in `build-headers.mjs` (seit AP-568/584). Gehoben: `LEISTUNG_MOBILE_CSS_VERSION`
   `20261006f` → `20261006g`, `JS_VERSION` `20261002i` → `20261006a`. `styles.css` blieb
   unverändert, sein Schlüssel auch. Build mit `npm run build` (nicht nur
   `build-leistungen.mjs`), sonst wären die Schlüssel zurückgedreht worden. `JS_VERSION` steuert
   auch `home-header-morph.js` und wurde dort mitgehoben.
2. **Trennlinie (§3.1 c):** Mit `align-items:start` am Raster wären `.container::before` und
   `.lpv2-divider-fill` (beide ohne Inhalt) 0 px hoch. Beide tragen `align-self:stretch`.
3. **Lichtsaum (§3.1 c, Teil 5):** Die allgemeine Regel `.lpv2-closing:before` (`@media all`)
   setzt `width:46px;height:2px`; ohne `width:auto;height:auto` wäre der Ring ein 46 × 2-px-Strich
   geblieben. Ergänzt.
4. **Hover-Nachrücken (§3.1 d):** Die Übergangsliste aus Teil 6 (`li.reveal`, höhere Spezifität)
   schluckte `transition:padding-left`. `padding-left .4s` steht jetzt in einer eigenen
   `li.reveal`-Regel mit opacity/transform zusammen.
5. **Zeilen:** Die Liste spannt Zeilen 2–3 und ist höher als Einstieg + Standort. Das Raster
   verteilte den Überhang auf beide Zeilen – zwischen den Absätzen standen ≈ 95 px statt 20 px.
   `grid-template-rows:auto auto 1fr auto auto` gibt den Überhang nur Zeile 3.
6. **Hinweistext:** stand durch ein geerbtes `margin-inline:auto` mittig in der linken Spalte;
   `margin:36px 0 0` statt nur `margin-top`.

**Entscheidungen §7:** E1–E4 wie vorgeschlagen umgesetzt (Knopf unter der Kachel, Hinweis unten
links, Ausrollen eigenes AP, Striche .32); alle in `docs/offene-punkte.md` als offen geführt.

**Messwerte (headless Chrome, 06.10.2026)**

| Breite | Spalten | H2/H3 Oberkante · Zeilen | Einstieg = Liste | Einstieg → Standort | Trennlinie | Kachel / Knopf |
|---|---|---|---|---|---|---|
| 1024 × 768 | 426,5 / 20 / 426,5 | gleich · 2/2 | gleich | 19,9 px | 566 px | 426,5 / 400 |
| 1280 × 800 | 486 / 20 / 486 | gleich · 2/2 | gleich | 20,0 px | 566 px | 480 / 400 |
| 1440 × 900 | 486 / 20 / 486 | gleich · 2/2 | gleich | 19,9 px | 566 px | 480 / 400 |
| 1920 × 1080 | 486 / 20 / 486 | gleich · 2/2 | gleich | 19,9 px | 566 px | 480 / 400 |

Bei 1024 ist der Satzspiegel 961 px (Fenster minus Scrollleiste minus 48 px), daher 426,5 statt
434. Haarlinie 1 px über die volle Breite, 56 px unter der Liste. Kein horizontaler Überlauf.

- **B1:** H2 sechs, H3 sieben Wort-Spans; Aufstieg im Zeitverlauf gemessen (H3 setzt ≈ 300 ms
  später ein), nach ≈ 1,6 s alles bei 0. `textContent` und Accessible Name der H2 unverändert.
- **B2:** `--lpv2-divider-p` 0 / 0,50 / 1 an den drei Stellen; Füllung `scaleY` gleich, Punkt
  nur dazwischen sichtbar.
- **B3:** In 60-px-Schritten erscheinen Punkte 1–5, Kachel, Hinweis, Knopf – nie zwei auf einmal
  (die Kachel steht höher als der mittige Hinweis). Blüte überschwingt bis Skalierung 1,08,
  danach `lpv2-sway` läuft (−3° … −12°). Hover: `padding-left` 44 → 50 px weich, `lpv2-spin`.
- **B4:** Striche `scaleX` 0 → 1, Einstieg vor Standort.
- **B5:** `lpv2-ring-turn` läuft (8 s), `--lpv2-ang` steigt; Ring 478 × 218 px = Kachel.
- **B6:** Knopf `is-pulsing`, `maik-cta-rhythm-breath` läuft.
- **Reduzierte Bewegung:** keine Zerlegung, Striche gezeichnet, Trennlinie voll ohne Punkt,
  Blüten offen bei −8°, kein Ring-Lauf.
- **Ohne JS:** Überschriften unzerlegt, Trennlinie voll (566 px).
- **Fokus:** Fokusring 2 px, Abstand 9 px; die Sektion hat `overflow:hidden`, der Knopf liegt
  weit innen – nicht beschnitten.
- **Unverändert:** Element-Vergleich gegen den Stand davor bei 375/390/402/480/874 auf
  Balkonkasten, Baumpflege, Außenanlagenpflege und Startseite (0 Abweichungen), bei 1440 auf
  Baumpflege, Außenanlagenpflege und Startseite (0). Auf Balkonkasten am Desktop außerhalb der
  Textsektion nur die Folge der um 515 px kürzeren Sektion. Keine Konsolenfehler.
