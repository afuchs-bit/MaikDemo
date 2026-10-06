# AP-567 — Leistungsseite Balkonkasten: Blickführung am Desktop (Choreografie + Hierarchie, Mockup F2 „A+B“)

Stand 06.10.2026 · Seite `/privatkunden/leistungen/balkonkastenbepflanzung/` · nur Desktop ab 901 px.
Baut auf **AP-566** (zwei Spalten mit Bewegung) auf und korrigiert dessen Schwäche: Beide Spalten erschienen gleichzeitig mit gleichem Gewicht – „wo soll ich hingucken“. Handy bis 900 px bleibt pixelgleich. Übrige 37 Leistungsseiten unverändert.

Freigegeben per Mockup `mockup-balkonkasten-blickfuehrung.html`, Variante **A+B · Kombination**.

---

## 0. Kurz für Claude Code

1. Branch wie bei AP-566. Nicht selbst nach `claude/kind-fermat-pyzy5p` mergen.
2. AP-Nummer prüfen (`git log --all --oneline | grep -oE "AP-[0-9]+" | sort -t- -k2 -n -u | tail -3` und `git grep -hoE "AP-5[0-9]{2}" -- . | sort -u | tail -3`). Ist AP-567 belegt: nächste freie nehmen und überall ersetzen.
3. Voraussetzung: AP-566 ist umgesetzt (Block „AP-566“ in `leistung-mobile.css`, Abschnitt `--- AP-566` in `main.js`). Falls AP-566 anders gelandet ist als geschrieben (Umsetzungsvermerk lesen!), die Fundstellen in §3 sinngemäß übertragen – nicht blind ersetzen.
4. Änderungen nach §3 von Hand (Python, `encoding="utf-8"`, `assert s.count(old) == 1`, kein Perl). Nur zwei Quelldateien plus `index.html` (Cache-Busting).
5. Build `cd .github/scripts && node build-leistungen.mjs`, QA §6, Dokument nach `docs/ap/AP-567-balkonkasten-blickfuehrung-choreografie.md`.
6. Ein Commit: `AP-567: Leistungsseite Balkonkasten - Blickfuehrung am Desktop (Choreografie + Hierarchie)`

---

## 1. Auftrag

Sascha nach Sichtung von AP-566 live: „Zwei Texte, welche gleichzeitig aufgehen – das darf so nicht sein.“ Ursache: Am Desktop passt die Textsektion ins Fenster, die scrollgebundenen Reveals feuern deshalb alle sofort; und beide Überschriften haben identisches Gewicht, es gibt keinen Startpunkt.

Entscheidung **A+B**: Das Auge wird links abgeholt und über die Trennlinie nach rechts geführt. Zwei Mittel:

**Hierarchie (dauerhaft):** H2 links wird größer, H3 rechts wird zur weißen Zwischenüberschrift. Die rechte Spalte liegt gedimmt (35 %) bis sie an der Reihe ist.

**Choreografie (einmalig beim Eintritt, unabhängig vom Scrollen):**

| t | Was passiert | Element |
|---|---|---|
| 0,00 s | H2 steigt Wort für Wort auf (70 ms Versatz) | `.lpv2-content-lead h2` |
| 0,50 s / 0,70 s | Striche über Einstieg und Standort zeichnen sich | `p::before` |
| 1,00–2,10 s | Trennlinie füllt sich von oben nach unten, Lichtpunkt läuft mit und verschwindet am Ende | `.lpv2-divider-fill` |
| 1,30 s | Rechte Spalte wird sichtbar (Deckkraft 0 → 1), Liste noch gedimmt | `.lpv2-content-service` |
| 1,40 s | H3 steigt Wort für Wort auf | `.lpv2-content-service h3` |
| 1,80 s + i × 0,18 s | Listenpunkt i wird hell, Blüte wächst von 55 % auf 100 % mit Überschwingen; danach leichtes Schwingen | `li:nth-child(i+1)` |

Danach steht die Sektion ruhig; Hover-Verhalten aus AP-566 bleibt. Die Absätze links bewegen sich nicht.

**Was aus AP-566 wegfällt:** Die Trennlinie ist **nicht mehr scrollgebunden** (kein `--lpv2-divider-p` per Scroll-Handler), sondern Teil der Sequenz. Die Listenpunkte hängen **nicht mehr** am `data-reveal-late`-Beobachter (72 %-Linie), sondern an der Sequenz – Ausnahme: Punkte, die beim Eintritt noch unterhalb des Fensters liegen (kleine Monitore), warten auf ihr Erscheinen (§2.3).

---

## 2. Herleitung

### 2.1 Abgeleitete Werte

| Wert | Herleitung |
|---|---|
| H2 `clamp(2.2rem, 4cqw, 3.1rem)` → bei 1080 px Satzspiegel 43 px, `max-width:11em`, `line-height:1.06` | Mockup F2: `clamp(2.2rem,4cqw,3.3rem)` auf 1240-Rahmen ≈ 48 px; auf dem 1080-Satzspiegel der Live-Seite mit 4 cqw = 43 px. 11 em × 43 = 473 px ≤ 486-px-Spalte. „Ein Stück Garten vor Ihrem Fenster“ bricht nach „Garten“ → zwei Zeilen, ≈ 91 px hoch. `cqw` funktioniert, weil `.container` seit AP-534 `container-type:inline-size` trägt. |
| H3 `1.375rem` (22 px), Farbe `--lpv2-text-heading` (weiß), `font-weight:700`, `letter-spacing:.01em`, `line-height:1.3`, `max-width:20em`, `margin-top:.35em` | Mockup F2: `clamp(1.2rem,1.9cqw,1.5rem)` ≈ 22 px; weiß statt Grün, damit links die einzige grüne Überschrift steht. Baloo 2 bleibt (Familie wie bisher aus dem Handy-Block). 39 Zeichen bei 22 px Baloo ≈ 430 px → einzeilig in 486 px. |
| Oberkanten: H2 (91 px) vs. H3 (≈ 29 px + .35 em = 37 px) sind **nicht** mehr gleich hoch – die Liste beginnt dadurch 54 px höher als der Einstieg. | Gewollt: Die rechte Spalte soll optisch als „zweiter Schritt“ lesbar sein, nicht als Spiegel. Rechts: `align-self:start`, Liste `margin-top:18px` (statt 26). Falls Sascha die Oberkante von Liste und Einstieg doch gleich will → E1 (§7). |
| Dimmung rechts `opacity:.35`, Übergang `.5s` | Mockup F2. |
| Blüte gedimmt: `transform:scale(.55) rotate(-8deg)`, `opacity:.6` → hell: Keyframe `lpv2-bloom` (Ende `scale(1) rotate(-8deg)`), `opacity:1` | Mockup F2 (55 %). Startwinkel = Ruhewinkel, damit nur Größe und Deckkraft wechseln. |
| Sequenzzeiten wie Tabelle §1 | Mockup F2 (`base 1.8 s`, Versatz 0,18 s). Gesamt bis Punkt 5: 1,8 + 4 × 0,18 + 0,7 = 3,2 s. |
| Trennlinie: Keyframe `lpv2-divider-fill` 1,1 s, Beginn 1,0 s, `--lpv2-divider-p` 0 → 1 und `--lpv2-divider-dot` 1 → 0 bei 95 % | Mockup F2 `fillY`. Benötigt `@property` für beide Variablen (sonst keine Interpolation – Fallback: Linie springt auf voll, kein Fehler). |
| Rechte Spalte: `opacity:0` → `1`, `.6s`, `transition-delay:1.3s` | Mockup F2. Gilt für `.lpv2-content-service` – **Achtung:** der ist seit AP-534 `display:contents`, damit wirkt `opacity` nicht. Deshalb wird die Deckkraft **auf H3 und `.lpv2-content-list` einzeln** gesetzt (gleiche Werte, gleiches Delay). |
| Eintrittsschwelle `threshold:.15` an `.container` | wie AP-566 (`is-live`). |

### 2.2 Was mit AP-566-Regeln passiert

| AP-566 | AP-567 |
|---|---|
| Scroll-Handler setzt `--lpv2-divider-p` | **entfernt**; Variablen werden per Keyframe animiert |
| `--lpv2-divider-p:1` als Default am Container | bleibt (Fallback ohne JS: Linie voll) → **wird `0`**, da die Sequenz sie füllt; ohne JS gibt es kein `is-live`, dann steht eine graue Grundlinie – akzeptiert |
| Wort-Aufstieg H2/H3 mit `--lpv2-wd:300ms` für H3 | H3-Verzögerung wird **1400 ms** |
| `li.reveal.is-in:before` → `lpv2-bloom` über den 72 %-Beobachter | `li` bekommt die Klasse `lpv2-seq` mit `--lpv2-d` per JS; Blüte und Helligkeit hängen an `lpv2-seq`. `reveal`/`is-in` wird für die Punkte am Desktop neutralisiert (Deckkraft 1, kein Transform), damit der Beobachter nicht dazwischenfunkt |
| Striche `.5s` / `.75s` | `.5s` / `.7s` (Mockup F2) |
| Hinweistext, Kachel, Knopf: `data-reveal-late` | **unverändert** – sie liegen unterhalb der Sektion und erscheinen weiter beim Scrollen |

### 2.3 Punkte unterhalb des Fensters

Beim Eintritt prüft JS je `<li>`, ob seine Oberkante über 92 % Fensterhöhe liegt. Sichtbare Punkte bekommen ihre Sequenzzeit (`--lpv2-d = 1.8s + k × .18s`, k zählt nur sichtbare). Unsichtbare Punkte werden nach Ende der Sequenz in einen `IntersectionObserver` (`rootMargin 0 0 -12% 0`) gegeben und schalten beim Erscheinen sofort (`--lpv2-d:0s`). So bricht die Reihenfolge auf 768-px-Höhe nicht.

---

## 3. Änderungen nach Fundstelle

### 3.1 `assets/css/leistung-mobile.css`

**(a) Block-Kommentar.** Vor der Zeile `/* AP-566 (06.10.2026): Teile 2-6 unten …` einfügen:
```
/* AP-567 (06.10.2026): Blickfuehrung - links grosse gruene H2, rechts weisse Zwischen-
   ueberschrift; rechte Spalte gedimmt, bis die Eintritts-Sequenz sie Punkt fuer Punkt hell
   schaltet. Trennlinie und Blueten laufen in dieser Sequenz, nicht mehr am Scrollen. */
```

**(b) Teil 2, Container-Regel.** Suche `align-items:start;position:relative;--lpv2-divider-p:1;` → ersetze durch `align-items:start;position:relative;--lpv2-divider-p:0;--lpv2-divider-dot:0;`

**(c) Teil 3, H2/H3.** Ersetze die beiden Regeln

```
  .lpv2-page--desktop-trichter .lpv2-content-lead h2,
  .lpv2-page--desktop-trichter .lpv2-content-lead h2.lpv2-content-title--long{grid-column:1;grid-row:1;width:auto;max-width:12em;margin:0;font-size:2rem;line-height:1.1;text-align:left;text-wrap:balance}
  .lpv2-page--desktop-trichter .lpv2-content-service h3{grid-column:3;grid-row:1;width:auto;max-width:12em;margin:0;font-size:2rem;line-height:1.1;text-align:left;text-wrap:balance}
```
durch
```
  .lpv2-page--desktop-trichter .lpv2-content-lead h2,
  .lpv2-page--desktop-trichter .lpv2-content-lead h2.lpv2-content-title--long{grid-column:1;grid-row:1;width:auto;max-width:11em;margin:0;font-size:clamp(2.2rem,4cqw,3.1rem);line-height:1.06;text-align:left;text-wrap:balance}
  .lpv2-page--desktop-trichter .lpv2-content-service h3{grid-column:3;grid-row:1;align-self:start;width:auto;max-width:20em;margin:.35em 0 0;font-family:'Baloo 2',sans-serif;font-size:1.375rem;font-weight:700;line-height:1.3;letter-spacing:.01em;color:var(--lpv2-text-heading,#fafaf6);text-align:left;text-wrap:balance;opacity:0;transition:opacity .6s var(--ease) 1.3s}
  .lpv2-page--desktop-trichter .lpv2-content-feature > .container.is-live .lpv2-content-service h3{opacity:1}
```
Guard: `assert s.count("max-width:12em;margin:0;font-size:2rem") == 2` vor dem Ersetzen.

**(d) Teil 3, Striche.** Suche `animation:lpv2-draw-x .9s var(--ease) .75s forwards` → `.7s`.

**(e) Teil 3, Liste.** Suche `.lpv2-content-service .lpv2-content-list{grid-column:3;grid-row:2 / 4;width:100%;max-width:none;margin:26px 0 0}` → ersetze `margin:26px 0 0}` durch `margin:18px 0 0;opacity:0;transition:opacity .6s var(--ease) 1.3s}` und füge danach ein:
```
  .lpv2-page--desktop-trichter .lpv2-content-feature > .container.is-live .lpv2-content-list{opacity:1}
```

**(f) Teil 3, Trennlinie.** Die Regel `.lpv2-divider-fill::before{…transform:scaleY(var(--lpv2-divider-p));…}` und `::after{…opacity:var(--lpv2-divider-dot,0)}` bleiben. Neu danach:
```
  .lpv2-page--desktop-trichter .lpv2-content-feature > .container.is-live{animation:lpv2-divider-fill 1.1s var(--ease) 1s forwards}
```
(Die Keyframes animieren die zwei registrierten Variablen am Container; `::before/::after` der Füllung lesen sie.)

**(g) Teil 6 (AP-534) + 6b (AP-566).** Die Punkte sollen am Desktop nicht mehr über `reveal`/`is-in` kommen. **Ersetze** in Teil 6 die Selektoren `.lpv2-page--desktop-trichter .lpv2-content-service .lpv2-content-list li.reveal,` (erste Zeile der `opacity:0;transform:translateY(12px)`-Regel) **und** `.lpv2-page--desktop-trichter .lpv2-content-service .lpv2-content-list li.reveal.is-in,` (erste Zeile der `.is-in`-Regel) jeweils durch nichts – d. h. die Zeile löschen, so dass die Regeln nur noch `.lpv2-content-service-copy.reveal` und `.lpv2-closing/.lpv2-closing-cta` betreffen. Guard: beide Strings je genau 1×.

Dann **ersetze Block 6b komplett** (von `/* 6b - AP-566:` bis zur schließenden `}` von `@media (hover:hover){ … }`) durch:

```css
  /* 6b - AP-567: Liste gedimmt, bis die Eintritts-Sequenz (main.js) jedem Punkt lpv2-seq
     und seine Zeit --lpv2-d gibt. Dann wird der Punkt hell, die Bluete waechst mit
     Ueberschwingen von 55 % auf 100 % und schwingt danach leicht. */
  .lpv2-page--desktop-trichter .lpv2-content-service .lpv2-content-list li{opacity:.35;transform:none;transition:opacity .5s var(--ease) var(--lpv2-d,0s),padding-left .4s var(--ease)}
  .lpv2-page--desktop-trichter .lpv2-content-service .lpv2-content-list li:before{transform:scale(.55) rotate(-8deg);opacity:.6;transition:opacity .4s var(--ease) var(--lpv2-d,0s)}
  .lpv2-page--desktop-trichter .lpv2-content-service .lpv2-content-list li.lpv2-seq{opacity:1}
  .lpv2-page--desktop-trichter .lpv2-content-service .lpv2-content-list li.lpv2-seq:before{opacity:1;animation:lpv2-bloom .7s cubic-bezier(.34,1.5,.5,1) forwards,lpv2-sway 5s ease-in-out infinite alternate;animation-delay:var(--lpv2-d,0s),calc(var(--lpv2-d,0s) + .8s + var(--lpv2-i,0) * .7s)}
  .lpv2-page--desktop-trichter .lpv2-content-service .lpv2-content-list li:nth-child(1){--lpv2-i:0}
  .lpv2-page--desktop-trichter .lpv2-content-service .lpv2-content-list li:nth-child(2){--lpv2-i:1}
  .lpv2-page--desktop-trichter .lpv2-content-service .lpv2-content-list li:nth-child(3){--lpv2-i:2}
  .lpv2-page--desktop-trichter .lpv2-content-service .lpv2-content-list li:nth-child(4){--lpv2-i:3}
  .lpv2-page--desktop-trichter .lpv2-content-service .lpv2-content-list li:nth-child(5){--lpv2-i:4}
  @media (hover:hover){
    .lpv2-page--desktop-trichter .lpv2-content-service .lpv2-content-list li.lpv2-seq:hover{padding-left:50px}
    .lpv2-page--desktop-trichter .lpv2-content-service .lpv2-content-list li.lpv2-seq:hover:before{animation:lpv2-bloom .7s cubic-bezier(.34,1.5,.5,1) forwards,lpv2-spin 2.6s linear infinite}
  }
```

**(h) Teil 6c, H3-Verzögerung.** Suche `h3.lpv2-split{--lpv2-wd:300ms}` → `--lpv2-wd:1400ms`.

**(i) Keyframes (außerhalb der Media Query, Block „AP-566: Keyframes …“).** Ergänzen:
```css
@property --lpv2-divider-p{syntax:"<number>";initial-value:0;inherits:false}
@property --lpv2-divider-dot{syntax:"<number>";initial-value:0;inherits:false}
@keyframes lpv2-divider-fill{from{--lpv2-divider-p:0;--lpv2-divider-dot:1}95%{--lpv2-divider-dot:1}to{--lpv2-divider-p:1;--lpv2-divider-dot:0}}
```
Ersetze `@keyframes lpv2-bloom{to{transform:scale(1) rotate(-8deg)}}` durch `@keyframes lpv2-bloom{from{transform:scale(.55) rotate(-8deg)}to{transform:scale(1) rotate(-8deg)}}`.

Vorsicht: `inherits:false` an `--lpv2-divider-p` heißt, dass `.lpv2-divider-fill` den Wert **nicht** erbt. Deshalb die beiden Regeln an `.lpv2-divider-fill::before/::after` auf den Container-Wert zeigen lassen – einfachste Lösung: `inherits:true` bei beiden `@property`-Deklarationen setzen. **So umsetzen: `inherits:true`.**

**(j) reduced-motion.** Im `prefers-reduced-motion`-Block die AP-566-Zeilen ergänzen/ersetzen:
```css
  .lpv2-page--desktop-trichter .lpv2-content-feature > .container{--lpv2-divider-p:1!important;--lpv2-divider-dot:0!important}
  .lpv2-page--desktop-trichter .lpv2-content-service h3,
  .lpv2-page--desktop-trichter .lpv2-content-service .lpv2-content-list,
  .lpv2-page--desktop-trichter .lpv2-content-service .lpv2-content-list li{opacity:1!important}
  .lpv2-page--desktop-trichter .lpv2-content-service .lpv2-content-list li:before{transform:scale(1) rotate(-8deg)!important;opacity:1!important}
```

### 3.2 `assets/js/main.js` – Abschnitt `--- AP-566`

Den ganzen Scroll-Teil ersetzen: von `let ticking = false;` bis einschließlich `update();` (Ende des IIFE-Körpers vor `})();`) **löschen** und durch die Sequenzlogik ersetzen. Außerdem den `live`-Beobachter erweitern. Zielzustand des Abschnitts:

```js
  // --- AP-566/567: Blickfuehrung der Textsektion am Desktop (Balkonkasten, Mockup F2 A+B) ---
  // Wort-Aufstieg der Ueberschriften, Trennlinie fuellt sich, Listenpunkte werden nacheinander
  // hell - als feste Sequenz beim Eintritt, unabhaengig vom Scrollen. Nur ab 901px, nur auf
  // Seiten mit lpv2-page--desktop-trichter. Bei reduced-motion steht alles sofort.
  (() => {
    const container = document.querySelector('.lpv2-page--desktop-trichter .lpv2-content-feature > .container');
    if (!container || !lateRevealMedia.matches) return;
    const items = [...container.querySelectorAll('.lpv2-content-list li')];
    if (reduced) {
      container.classList.add('is-live');
      items.forEach((li) => { li.style.setProperty('--lpv2-d', '0s'); li.classList.add('lpv2-seq'); });
      return;
    }

    const split = (el) => {
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

    const BASE = 1.8, STEP = 0.18;
    const startSequence = () => {
      let k = 0;
      const later = [];
      items.forEach((li) => {
        if (li.getBoundingClientRect().top < window.innerHeight * 0.92) {
          li.style.setProperty('--lpv2-d', `${(BASE + k * STEP).toFixed(2)}s`);
          li.classList.add('lpv2-seq');
          k += 1;
        } else later.push(li);
      });
      if (!later.length || !('IntersectionObserver' in window)) {
        later.forEach((li) => { li.style.setProperty('--lpv2-d', '0s'); li.classList.add('lpv2-seq'); });
        return;
      }
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.style.setProperty('--lpv2-d', '0s');
          e.target.classList.add('lpv2-seq');
          obs.unobserve(e.target);
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
      setTimeout(() => later.forEach((li) => obs.observe(li)), (BASE + k * STEP) * 1000);
    };

    if (!('IntersectionObserver' in window)) { container.classList.add('is-live'); startSequence(); return; }
    const live = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      container.classList.add('is-live');
      startSequence();
      live.disconnect();
    }, { threshold: 0.15 });
    live.observe(container);
  })();
```

**Wichtig:** Die `<li>` tragen aus dem Build weiterhin `class="reveal" data-reveal-late`. `registerReveal()` läuft vor diesem Abschnitt und beobachtet sie. Das ist harmlos, weil §3.1 (g) ihre `reveal`-Regeln am Desktop entfernt hat – `is-in` wird gesetzt, bewirkt aber nichts. Markup und Build bleiben unangetastet (kein Rebuild-Diff außer Versionsstrings).

### 3.3 `index.html`

`styles.css?v=20261006a` → `20261006b`, `main.js?v=20261006a` → `20261006b` (je genau 1×; falls AP-566 andere Strings vergeben hat: die aktuellen nehmen, Buchstaben hochzählen). Vorlagen in `.github/scripts/templates/` auf feste Strings prüfen wie in AP-566.

---

## 4. Stopp-Regeln

- Handy ≤ 900 px pixelgleich (alle Änderungen in `@media (min-width:901px)`, Keyframes/`@property` ohne Anwendung auf dem Handy).
- Held, Galerie, Fragen, Kontakt unverändert. Texte unverändert. Header-Knöpfe und `.maik-cta` unverändert.
- Hinweistext, Kachel, Knopf, Lichtsaum (B5) und Pulsen (B6) aus AP-566 bleiben wie sie sind.
- Absätze links werden **nicht** animiert.
- Kein `overflow:hidden` außer an `.lpv2-w`. Kein Perl. Generierte Seiten nur per Build.

---

## 5. Build

Wie AP-566 §5. Erwartung: Diff in generierten Seiten = nur die zwei Versionsstrings, **kein** Markup-Unterschied.

---

## 6. QA (Playwright/Chromium, 1440 × 900 und 1280 × 800, zusätzlich 1366 × 768)

**Hierarchie**
- [ ] H2 computed `font-size` = 43,2 px bei Satzspiegel 1080 (`4cqw`); zweizeilig; grün.
- [ ] H3 computed `font-size` = 22 px, Farbe `#fafaf6`, einzeilig, Baloo 2 700.
- [ ] Vor dem Eintritt (Sektion unterhalb des Fensters, `is-live` fehlt): H3 und Liste `opacity:0`; jedes `li` `opacity:.35`; Blüte `scale(.55)`.

**Sequenz** (Seite laden, Sektion per Scroll in den Bereich bringen, Zeit ab `is-live` messen – z. B. `MutationObserver` auf die Klasse + `performance.now()`)
- [ ] 0,0 s: H2-Wörter steigen auf, nichts rechts sichtbar.
- [ ] 0,5 s / 0,7 s: Striche zeichnen sich.
- [ ] 1,0–2,1 s: `--lpv2-divider-p` am Container läuft 0 → 1 (drei Messpunkte: 1,1 s ≈ 0,1; 1,55 s ≈ 0,5; 2,2 s = 1); Lichtpunkt sichtbar bis ≈ 2,05 s, dann `--lpv2-divider-dot` = 0.
- [ ] 1,3 s: H3 und Liste werden sichtbar (Deckkraft 0 → 1), Liste noch gedimmt.
- [ ] 1,4 s: H3-Wörter steigen auf.
- [ ] 1,8 / 1,98 / 2,16 / 2,34 / 2,52 s: Punkte 1–5 werden hell, Blüte wächst mit sichtbarem Überschwingen; `li:nth-child(n)` erhält `lpv2-seq` mit `--lpv2-d` wie angegeben.
- [ ] Danach: Blüten schwingen leicht; Hover: Drehung + `padding-left` 44 → 50 px.
- [ ] Scrollen während der Sequenz (schnell nach unten) ändert die Reihenfolge **nicht**.
- [ ] 1366 × 768: liegen Punkt 4/5 beim Eintritt unter 92 % Fensterhöhe, bekommen sie `lpv2-seq` erst beim Erscheinen (DevTools: Klasse fehlt, bis gescrollt wird) – und dann sofort (`--lpv2-d:0s`).

**Unverändert**
- [ ] Hinweistext, Kachel, Knopf erscheinen weiter über `data-reveal-late` beim Scrollen; Lichtsaum läuft; Knopf pulsiert.
- [ ] 390 × 844 und 874 × 402: Pixeldiff der Textsektion vor/nach = 0.

**Zugänglichkeit / Konsole**
- [ ] reduced-motion: alles sofort da, Liste hell, Trennlinie voll ohne Punkt.
- [ ] Ohne JS: H2/H3 stehen (keine Spans), Liste gedimmt bei 35 %, H3 und Liste bei `opacity:0` → **Problem**: ohne JS bleibt die rechte Spalte unsichtbar. Deshalb zusätzlich in §3.1 (c)/(e) die Deckkraft-0-Regeln an `html.js` o. ä. knüpfen, falls die Seite eine solche Klasse setzt – prüfen (`grep -n "classList.add('js')\|no-js" assets/js/main.js index.html`). Gibt es keine: `<noscript><style>` im Template ist nicht erlaubt (Vorlage nicht anfassen) → stattdessen die beiden `opacity:0`-Regeln nur unter `.lpv2-page--desktop-trichter.lpv2-js` setzen und `lpv2-js` am `<body>` in `main.js` ganz am Anfang des AP-567-Abschnitts setzen (`document.body.classList.add('lpv2-js')`). **So umsetzen**, in §3.1 (c) und (e) entsprechend `.lpv2-page--desktop-trichter.lpv2-js` als Selektor für die `opacity:0`-Regeln verwenden.
- [ ] `aria-labelledby` der Sektion löst weiter auf den H2-Text auf; Tab-Fokus auf den Knopf vollständig sichtbar.
- [ ] Keine Konsolenfehler (Chromium, Firefox, Safari).

---

## 7. Offene Entscheidungen

| # | Frage | Vorschlag | Entscheidung |
|---|---|---|---|
| E1 | Liste rechts beginnt durch die kleinere H3 ≈ 54 px höher als der Einstieg links. Soll die Liste stattdessen auf die Oberkante des Einstiegs ausgerichtet werden (`margin-top` der Liste = Höhendifferenz, dann wirkt rechts oben Luft)? | So lassen (rechts als zweiter Schritt lesbar). | [OFFEN – Sascha, nach Sichtung] |
| E2 | Dimmung 35 % oder 45 %? Bei 35 % ist der Text auf dem Dunkel noch lesbar (Kontrast ≈ 3,9:1 für `#fafaf6` bei .35 auf `#17191e`), aber knapp unter AA für Fließtext. Da der Zustand nur ~2 s dauert und danach 1 ist: vertretbar. | 35 % | [OFFEN] |
| E3 | Ausrollen auf die übrigen Leistungsseiten: Die H3-Länge (einzeilig bei 22 px) muss je Seite geprüft werden; H2 bricht je nach Länge ein- bis dreizeilig. | Eigenes AP nach Maiks Freigabe. | [OFFEN] |

---

## 8. Umsetzungsvermerk (Claude Code, 06.10.2026)

**AP-Nummer:** AP-567 war im Repo frei. Ein früherer Anlauf „Google-Bewertungen“ trug intern dieselbe
Nummer, wurde aber nie committet. Branch `codex/ap-565-held-rahmenbild`.

**Entscheidung E1 (06.10.2026):** Die H3 steht oben, die Liste direkt darunter (18 px). Der Plan nahm an,
dass die Liste dafür von selbst höher rückt. Im Raster ist Zeile 1 aber so hoch wie die große H2, die Liste
hätte also trotzdem auf Höhe des Einstiegs begonnen (≈ 70 px Lücke unter der H3). Umgesetzt wurde es so:
- Die Liste spannt die Zeilen 1–3.
- `margin-top: 1,65 × H3-Schriftgröße + 18 px`.
- Die H3 bleibt immer einzeilig (`white-space:nowrap`, `clamp(1.2rem, 2.04cqw, 1.375rem)`): 22 px bei
  1080 px Satzspiegel, 19,6 px bei 1024 px Fenster.

**Abweichungen vom Ablauf**

1. **Cache-Schlüssel:** Wie bei AP-566 aus `build-headers.mjs`: `LEISTUNG_MOBILE_CSS_VERSION`
   `20261006j`, `JS_VERSION` `20261006c`, danach `npm run build`. `index.html` wäre zurückgedreht worden.
2. **Listenpunkte in der Kette statt mit festen Zeiten:**
   - Problem: Beim echten Scrollen kommt die Sektion von unten ins Bild, denn der Held füllt das erste
     Fenster. Beim Auslösen (15 % sichtbar) liegen fast alle Punkte noch unter der 92-%-Linie. Mit der
     Logik aus §3.2 schalteten die Punkte 2–5 dann gemeinsam (gemessen: alle bei 2,25 s).
   - Jetzt: Punkt i schaltet frühestens 1,8 s nach dem Eintritt und 0,18 s nach Punkt i−1, und erst, wenn
     er über 92 % Fensterhöhe steht. Sonst wartet er auf einen IntersectionObserver.
   - Gemessen bei 1440 × 900 (40- und 120-px-Schritte) und 1366 × 768: 2,04 / 2,23 / 2,41 / 2,59 / 2,78 s,
     nie zwei zugleich. Springt man direkt hinein: 1,80 / 1,98 / … wie im Plan.
3. **Spezifität:** Die Neutralisierung außerhalb der Media Query
   (`…list li.reveal{opacity:1;transition:none}`) hätte `li{opacity:.35}` überstimmt. Die neuen Regeln
   tragen deshalb `li.reveal`. Meine AP-566-Zusatzregel (`li.reveal{transition:…padding-left}`) ist
   entfernt.
4. **Inline-Verzögerung:** `revealNow()` in `main.js` schreibt an jedes `.reveal` eine
   `transition-delay` inline. `transition-delay` der Punkte daher mit `!important`.
5. **H3-Farbe:** `homepage-unified` setzt `-webkit-text-fill-color` grün. Daher auch diese Eigenschaft weiß.
6. **Ohne JS:** Die Dimmung der Punkte (35 %) hängt wie die `opacity:0`-Regeln an `.lpv2-js`. Ohne JS ist
   also alles voll sichtbar. Die Trennlinie zeigt dann nur die graue Grundlinie (akzeptiert).

**Messwerte**
- **Hierarchie (1440/1280/1366):**
  - H2 43,2 px, zweizeilig, grün.
  - H3 22 px, einzeilig, `#fafaf6`, Baloo 2 700; H3 → Liste 18,0 px.
  - Bei 1024: H2 38,4 px, H3 19,6 px, einzeilig.
- **Vor dem Eintritt:**
  - H3 und Liste: `opacity` 0.
  - Punkte 0,35, Blüte 0,55.
  - `--lpv2-divider-p` 0.
- **Sequenz bei 1440 (ab `is-live`):**
  - Bis 0,6 s ist H2 oben, die H3-Wörter warten.
  - Trennlinie: 0,25 bei 1,1 s, 0,63 bei 1,3 s, 1,00 bei 2,0 s; Lichtpunkt bis 2,0 s, ab 2,2 s 0.
  - H3 und Liste: 0,81 bei 1,55 s, 1 bei 2,0 s.
  - Die H3-Wörter steigen ab 1,4 s auf.
  - Die Punkte schalten nacheinander, die Blüten überschwingen bis 1,03–1,04.
- **Hover:** `padding-left` 44 → 50 px weich, `lpv2-spin`.
- **Reduzierte Bewegung:** Alles steht sofort, Trennlinie voll ohne Punkt, Blüten 1,0 bei −8°.
- **Unten:** Hinweis, Kachel und Knopf weiter einzeln beim Scrollen, Lichtsaum läuft, Knopf pulsiert.
  `aria-labelledby` löst auf den H2-Text auf.
- **Unverändert:** Handy und Tablet 375/390/402/480/874 auf Balkonkasten, Baumpflege und Startseite:
  0 Abweichungen. Bei 1440 sind Baumpflege und Startseite unverändert. Keine Konsolenfehler.

## Nachtrag 06.10.2026: Lichtsaum entfernt, Blüte beim Hover nur geneigt

Ansage nach Sichtung:
- **Lichtsaum entfernt:** Die laufende Animation um die Abschluss-Kachel (B5 aus AP-566) entfällt.
  Gelöscht sind die Regel an `.lpv2-closing::before`, `@property --lpv2-ang` und
  `@keyframes lpv2-ring-turn`. Kachel, Rundung und Blütenstempel bleiben.
- **Hover der Blüte:** Statt der Drehung auf 352° (`lpv2-spin`, entfällt) neigt sich die Blüte auf
  −14° und wächst auf 112 %.
  - Das läuft über `rotate`/`scale`, die zum laufenden `transform` hinzukommen; Übergang 0,35 s in
    beide Richtungen, das Schwingen läuft weiter.
  - Das Nachrücken des Texts 44 → 50 px bleibt.

Gemessen bei 1440:
- Kachel: `getAnimations` leer, `::before` ist `none`; Knopf pulsiert.
- Hover: nach 120 ms −10°/1,09, danach −14°/1,12; nach dem Verlassen nach 120 ms −4°/1,03,
  danach zurück auf none.
- Handy 375/402/874: 0 Abweichungen.

## Nachtrag 2, 06.10.2026: Hinweistext über der Kachel, Breite wie die FAQ-Karte

Ansage: Der Hinweistext („Wir achten darauf …“) steht über der Abschluss-Kachel, beide so breit wie die
FAQ-Karte. Zeile 5 trägt jetzt den Hinweistext, Zeile 6 Kachel und Knopf. Beide stehen mittig über die
ganze Breite, `width: min(100%, 760px)`; Abstände 36 px unter der Haarlinie, 32 px zur Kachel. Der Knopf
bleibt 400 px, linksbündig unter der Kachel. Bisher standen Text links (46ch) und Kachel (480 px) rechts
nebeneinander (Mockup F, E2 aus AP-566).

Gemessen bei 1024, 1440 und 1920: Text und Kachel 760 px breit, linke Kante identisch mit der
FAQ-Karte. Die Reihenfolge beim Erscheinen ist Text → Kachel → Knopf, kein Überlauf. Handy 375/402/874:
0 Abweichungen.
