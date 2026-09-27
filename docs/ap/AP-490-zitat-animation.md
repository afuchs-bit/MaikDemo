# AP-490 — Zitat-Animation „Kein Auftrag ist uns zu klein." (Variante A)

Stand 27.09.2026 · Branch `codex/homepage-review` · Seite `/ueber-uns/`

Das Zitat im Abschnitt „Das Team hinter dem Betrieb." animiert beim ersten
Sichtbarwerden **einmal**. Danach steht alles still. Grundlage ist das Auftragsdokument
„Zitat-Animation … (Variante A)" vom Auftraggeber.

## 1. Abweichungen vom Auftragsdokument (vom Auftraggeber bestätigt)

| Dokument | Umgesetzt | Grund |
|---|---|---|
| Branch `claude/kind-fermat-pyzy5p` | `codex/homepage-review` | Der genannte Branch ist die GitHub-Pages-Quelle; ein Commit dort geht sofort live. Bisheriger Ablauf: Arbeitsbranch, dann Deploy-Merge. Nicht live geschaltet |
| Zitat ≈ 1,3 × Überschrift, `clamp()` hergeleitet | Größe bleibt **22 px / 28 px** (Schreibzeile „Individualangebot", `.ueber-betrieb__typer-box`) | Der Auftraggeber hatte die Größe am selben Tag so festgelegt (AP-489). Herleitung und QA-Punkt „größer als die Überschrift" entfallen |
| Strichfarbe `var(--rd-marke)` | `var(--mobile-logo-green)` (#56E607) | `--rd-marke` gibt es im Projekt nicht; Logogrün ist das Grün der Texte auf dieser Seite (AP-467). Wahl des Auftraggebers |
| `.q-anim` als Container um Blüte, Zitat, Signatur | Zustand am Raster `.ueber-inhaber__raster.ueber-q`, beobachtet wird das `blockquote` | Blüte, Zitat und Signatur sind Rasterkinder; ein Wrapper bräche das Raster. Das Raster selbst ist auf dem Handy so hoch, dass 60 % davon nicht in jeden Bildschirm passen |
| Klassen `q-…` | `ueber-q…` nach der Konvention der Datei | Zuordnung: `.q-anim`=`.ueber-q`, `.q-flower`=`.ueber-q__bluete`, `.q-w`=`.ueber-q__w`, `.q-mark`=`.ueber-q__mark`, `.q-sig`=`.ueber-q__sig`, `.visually-hidden`=`.ueber-sr` |
| Build laufen lassen | **kein Build** | Die Seite ist handgepflegt; die Buildskripte fassen nur `BUILD:leistungen-submenu` und `BUILD:site-footer` an. Kein generiertes HTML berührt |
| CSS-Version in `index.html` hochsetzen | Stempel nur in `ueber-uns/index.html` | `ueber-uns.css` lädt nur diese Seite. Der neue `main.js`-Block betrifft nur diese Seite; die übrigen 49 Seiten und `index.html` (Quelle für `jsVersion` im Build) behalten `20260923f` |

## 2. Diagnose (vorher, gemessen in echtem Chrome über CDP)

| | 360 px | 390 px | 1280 px |
|---|---|---|---|
| Überschrift `.ueber-inhaber__gross` | 25,6 px | 25,6 px | 34,56 px |
| Zitat `.ueber-inhaber__spruch` | 22 px, 2 Zeilen | 22 px, **1 Zeile** | 28 px, 2 Zeilen |

- Das Zitat steht an **einer** Stelle: `ueber-uns/index.html` (Rasterkind von
  `.ueber-inhaber__raster`). Kein Template, kein Build.
- Keine globale `.visually-hidden`/`.sr-only`-Klasse → seitenlokal `.ueber-sr`.
- Keine `.js`-Klasse am `<html>` → per Inline-Skript im `<head>` gesetzt, wie
  `index.html:15`. Im `defer`-Skript käme sie zu spät: Das Zitat stünde beim ersten
  Zeichnen kurz voll da und verschwände dann.
- **Zwei Blüten:** `.ueber-inhaber__bluete-mobil img` (über dem Zitat, bis 860 px) und
  `.ueber-inhaber__blume img` (am senkrechten Steg, ab 861 px). Animiert wird jeweils das
  `<img>`. Die Span um die Desktop-Blüte zentriert sich per `translate(-50%,-50%)`, eine
  Animation am `<img>` kollidiert damit nicht.
- `.ueber-inhaber` hat `overflow: hidden` (`ueber-uns.css:287`). Strich und Blüte liegen
  vollständig innerhalb (geprüft).

## 3. Werte

Wörtlich aus dem Auftragsdokument: Blüte `rotate(-38deg) scale(.5)` → Ausgangslage in
650 ms `cubic-bezier(.34,1.56,.64,1)`, Deckkraft 300 ms. Wörter `translateY(.28em)`,
`blur(6px)`, Verzögerung `300ms + i·90ms`. Strich `stroke-dashoffset 1 → 0` in 500 ms ab
1150 ms, `cubic-bezier(.6,0,.3,1)`. Signatur ab 1400 ms. SVG `viewBox 0 0 200 20`, Pfad
`M4 13 C 40 5, 78 17, 118 10 S 176 6, 196 11`, `stroke-width: 7`, `left: -4%`,
`width: 108%`, `bottom: -.22em`, `height: .36em`.

Zeitachse (gerechnet): Wort 5 startet bei 300 + 5·90 = **750 ms** und endet bei
750 + 550 = **1300 ms**. Der Strich läuft 1150–1650 ms, die Signatur 1400–1800 ms.

Die Auslöseschwelle ist `intersectionRatio >= 0.599` statt `isIntersecting`. Die erste
Meldung nach `observe()` ist schon wahr, sobald das Zitat nur angeschnitten ist. `.599`
statt `.6` fängt nur die Rundung der Flächenquote ab.

## 4. Änderungen (Zeilen nach dem Commit)

- `ueber-uns/index.html`
  - 6–10: Inline-Skript `document.documentElement.classList.add('js')`
  - 42: `ueber-uns.css?v=20260927d` → `20260927e`
  - 405: Raster bekommt `ueber-q`
  - 414, 417: beide Blüten-`<img>` bekommen `ueber-q__bluete`
  - 419–436: Zitat in `.ueber-sr` (ganzer Satz) plus `aria-hidden`-Fassung in sechs
    `.ueber-q__w`, fester Umbruch nach „Auftrag", `.ueber-q__mark` mit SVG-Strich,
    Signatur mit `ueber-q__sig`. Die Texte sind wortgleich.
  - 912–915: `main.js?v=20260923f` → `20260927a` (nur hier)
- `assets/css/ueber-uns.css` 436–522: `.ueber-sr`, Grundregeln für Wörter, Markierung und
  SVG, Ausgangslagen und Übergänge unter
  `@media (prefers-reduced-motion: no-preference)` und `.js`.
- `assets/js/main.js` 1057–1078: Observer (einmal, `threshold: 0.6`, Rückfall ohne
  IntersectionObserver: sofort `.is-in`).

## 5. Stop-Regeln (eingehalten)

- Zitat-, Signatur-, Überschrift- und Fließtext wortgleich.
- Header, Footer (kein `overflow: hidden` dort), andere Sektionen und der Puls-CTA
  unberührt.
- Animiert werden nur `opacity`, `transform`, `filter` und `stroke-dashoffset`.

## 6. Cache-Busting

`ueber-uns/index.html`: `ueber-uns.css?v=20260927e`, `main.js?v=20260927a`. Beide werden
über den Vorschau-Server mit 200 ausgeliefert.

## 7. QA (echtes Chrome über CDP; Playwright ist nicht installiert, gleiche Engine)

- [x] **Endzustand** 360 / 390 / 1280 px: genau zwei Zeilen; „zu klein.“ in einer Zeile;
      alle Wörter mit Deckkraft 1 und `blur(0)`; Strich `stroke-dashoffset: 0`,
      `rgb(86,230,7)`, reicht 4–5 px über beide Wortenden hinaus, liegt innerhalb von
      `.ueber-inhaber`. ~~Zitat größer als Überschrift~~ entfällt (siehe §1).
- [x] **Auslösung bei 60 %:** bei 55,1 / 57,8 / 58,7 / 59,7 % kein `is-in`, bei 62,4 %
      gesetzt (360 px). Beim Laden oben: kein `is-in`.
- [x] **Nur einmal:** wegscrollen und zurück → Klasse bleibt, kein zweiter Lauf,
      Observer getrennt.
- [x] **Zeitplan:** berechnete Verzögerungen 0,3 / 0,39 / 0,48 / 0,57 / 0,66 / 0,75 s,
      Strich 1,15 s, Signatur 1,4 s. Eingefrorene Bilder bei 250, 650 und 1350 ms.
- [x] **Reduzierte Bewegung:** sofort Endzustand samt Strich.
- [x] **JS aus:** keine `.js`-Klasse, Zitat voll sichtbar, Strich sichtbar.
- [x] **Screenreader:** Im Accessibility-Baum steht der Satz genau einmal
      („„Kein Auftrag ist uns zu klein.“"), keine Einzelwörter.
- [x] **Kein Layout-Shift:** `layout-shift` während der Sequenz = 0.
- [x] **Rest der Seite:** bei 360, 375 und 1280 px außerhalb des Strichs pixelgleich.
      Bei 390 px wird die Seite 28 px länger. Der feste Umbruch aus dem Dokument macht
      das dort bisher einzeilige Zitat zweizeilig; der Umbruch ist statisch, keine
      Verschiebung während der Animation.
- [x] Konsole sauber auf `/ueber-uns/` und `/`; die Schreibzeile auf Über uns läuft
      weiter; `ueber-uns.css` 94 Regeln.
- [x] Build: nicht nötig (§1). `check-config-sync.mjs` grün.

## 8. Offene Punkte

- **Nicht live.** Live schalten per Deploy-Merge auf `claude/kind-fermat-pyzy5p` erst
  auf Ansage.
- Das schließende Anführungszeichen „“" steht in dieser Handschrift mit etwas Abstand
  zum Punkt. Das liegt am Zeichensatz; der Strich endet am Punkt.
- Safari/iPhone sind hier nicht prüfbar (kein iOS-Simulator). Alle verwendeten
  Eigenschaften (`filter: blur`, `stroke-dashoffset` mit `pathLength`, CSS-Übergänge)
  sind in WebKit Standard. Ein Blick auf dem iPhone gehört trotzdem zur Abnahme.
