# AP-344 — Gelber Fokuskreis und helle Panelfläche im Leistungsmenü

**Auftrag:** „entferne diesen gelben kreis und entferne den hellgrünen kachel hinter
den leistungen" (Screenshot: Handymenü der Startseite, Leistungen aufgeklappt).

## Diagnose

Beide Flächen stammen aus der dunklen Farbwelt der Startseite. Auf den hellen Seiten
gab es im Handymenü weder das eine noch das andere — es waren keine gestalteten
Absichten, sondern zwei Regeln, die weiter reichten als gedacht.

### Der gelbe Kreis war der Tastatur-Fokusring

`home-dark.css` legte mit einer Sammelregel

```css
html.home-theme-dark :where(.site-header, .hero--gate, …) :focus-visible {
  outline: 3px solid var(--home-focus);   /* = --home-yellow */
  outline-offset: 3px;
}
```

einen Ring um *jedes* fokussierte Element im Kopfbereich. Der Aufklapp-Knopf ist rund
(`border-radius: 999px`, `styles.css`) und mobil 44 × 44 px groß — aus dem Ring wurde
damit ein gelber Kreis von 50 px, der frei um den Knopf schwebte.

Er erscheint **nur bei Tastaturbedienung**: `main.js` fokussiert den Knopf nicht, es
setzt beim Klick nur `is-open` und `aria-expanded`; Chrome und Safari lassen
`:focus-visible` beim Tippen mit dem Finger nicht greifen. Auf dem Screenshot des
Auftraggebers war er zu sehen, weil die Seite in der AP-343-Prüfung per Tastatur
bedient wurde. Er wurde deshalb **nicht entfernt, sondern leise gestellt** — ohne ihn
sähe man bei Tastaturbedienung nicht mehr, wo man steht.

### Die helle Kachel war die Gruppenfläche

`home-dark.css` setzte `.nav-submenu--welten .nav-submenu-group:nth-child(1)` auf
`var(--bg-soft)` (#2A2F26) — ohne Fenstergrenze. Die Handy-Regel in `styles.css`
wollte sie auf `transparent` setzen, verlor aber in der Spezifität: fünf Klassen
(`html` + `.home-theme-dark` + drei) gegen drei.

Nach Ansage des Auftraggebers ist sie **überall** entfallen, auch im
Desktop-Dropdown: Seit AP-342 steht dort nur noch eine einzige Gruppe, ein
abgesetztes Panel im Panel hatte damit keinen Zweck mehr.

## Diff

**`assets/css/home-dark.css`**

- Neu bei der Farbregel des Knopfes:
  ```css
  html.home-theme-dark .submenu-toggle:focus-visible {
    outline: 2px solid var(--ink-mute);
    outline-offset: 0;
  }
  ```
  Zwei Klassen und eine Pseudoklasse genügen: Die Sammelregel steht in `:where()`,
  das nichts zur Spezifität beiträgt — dort zählen nur `html` + `.home-theme-dark`
  + `:focus-visible` (0,2,1).
- Gestrichen: beide Blöcke mit `…nav-submenu-group:nth-child(1)` und `:nth-child(2)`
  (Zeilen 252/256 und 536/540) sowie der aufgehellte Zeilen-Hover (Zeile 544). Die
  `:nth-child(2)`-Regeln waren seit AP-342 ohnehin tot.

**`assets/css/styles.css`**

- Gestrichen: `.nav-submenu--welten .nav-submenu-group:nth-child(1) { background:
  var(--green-50); }` und der dazugehörige Sonder-Hover auf `--bg-elev`.
- Gestrichen: das `background: transparent` im 900px-Block — gegenstandslos, und es
  hatte ohnehin nie gegriffen.
- `border-radius` und `padding` der Gruppe bleiben: Das Polster hält die Liste vom
  Panelrand, der Radius ist ohne Fläche wirkungslos, aber harmlos.

**Cache-Busting:** `styles.css` `?v=20260918n` → `?v=20260918o` in allen 37 Seiten,
`home-dark.css` `?v=20260916a` → `?v=20260918a` (steht nur in `index.html`).

## QA

Headless Chrome über `.claude/preview/`, Messungen direkt am Dateipfad.

| Prüfung | Ergebnis |
|---|---|
| Handy 390 px, Startseite, Leistungen auf | Gruppenfläche `rgba(0, 0, 0, 0)`; Karte 396 px, Untermenü 266 sichtbar / 997 Inhalt, scrollt |
| Desktop 1280 px | Panel 284 × 480 px (unverändert), 1 Gruppe, Fläche transparent, Unterkante 538 px |
| Fokusring, echte Tab-Taste (`Input.dispatchKeyEvent`) | 390 px und 1280 px: `:focus-visible` greift, `2px solid rgb(174, 181, 170)`, `outline-offset: 0px` — kein gelber Halo mehr |
| Kontrast des Rings | `--ink-mute` #AEB5AA auf Kartengrund #20241D = **7,50 : 1** (WCAG 1.4.11 verlangt 3 : 1) |
| Zeilen-Hover | `--bg-soft` #2A2F26 auf Panel #20241D = 1,15 : 1 — **identisch zu vorher**, es sind dieselben zwei Farben, nur in der Rolle vertauscht (vorher Kachel #2A2F26 / Hover #20241D) |
| Helle Seite `/ueber-uns/` 390 px | unverändert: Karte 396 px, Gruppe transparent, Untermenü 212 / 1012 |
| Generierte Seite `/privatkunden/leistungen/gartenpflege/` 390 px | gleich |
| Pixelvergleich Startseite 375 / 1280 px, alle Scheiben | **identisch** — außerhalb des Menüs keine Abweichung |
| `check-config-sync.mjs` | Exit 0 |

## Nicht angefasst

Die Sammelregel für den Fokusring selbst (sie gilt für Hero, Proof, Fork, FAQ und
Footer weiter), der Instagram-Fokusring der Meta-Zeile, die Menüstruktur, die
Kartenhöhe aus AP-343, `build-leistungen.mjs`.

## Anmerkung

`.nav-submenu--welten .nav-submenu-group + .nav-submenu-group` (Trennlinie zwischen
zwei Gruppen, 900px-Block) ist seit AP-342 tot, ebenso `border-radius: 12px` an der
Gruppe. Beides steht noch — Aufräumen wäre eine eigene, nicht beauftragte Änderung.
