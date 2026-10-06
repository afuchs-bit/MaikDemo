# AP-580 — Über uns: Zitat-Animation am Desktop erst beim Hinscrollen

## Anlass

Rückmeldung des Auftraggebers am 02.10.2026: Die Zitat-Animation „Kein Auftrag ist
uns zu klein.“ auf `/ueber-uns/` funktioniert in Google Chrome nicht. Dazu gehören die
Blüte, die sechs Wörter, der Strich unter „zu klein.“ und die Signatur (AP-490/491).

## Befund

Gemessen in echtem Chrome 154 (headless, CDP). Die Animation selbst läuft fehlerfrei,
falsch ist nur der Auslösezeitpunkt. `main.js` setzt `.is-in`, sobald 60 % des Zitats
im Fenster stehen. Am Desktop liegt das Zitat beim Laden 789 px unter der
Fensteroberkante und ist 112 px hoch. Ab etwa 856 px Fensterhöhe ist die Bedingung
damit schon beim Laden erfüllt:

| Fenster     | vorher                |
|-------------|-----------------------|
| 1280 × 720  | beim Scrollen         |
| 1280 × 800  | beim Scrollen         |
| 1512 × 860  | 61 ms nach dem Laden  |
| 1440 × 900  | 61 ms nach dem Laden  |
| 1920 × 1080 | 61 ms nach dem Laden  |

Die Animation lief deshalb in den ersten 1,8 s angeschnitten am unteren Bildrand ab.
Wer hinscrollte, sah nur noch den Endzustand. Chrome hat am Mac ein etwas höheres
Inhaltsfenster als Safari, deshalb fiel es dort auf.

## Umsetzung

- `assets/js/main.js`, Block AP-490: Ab 901 px bekommt der IntersectionObserver
  `rootMargin: '0px 0px -28% 0px'`. Ausgelöst wird damit an der 72-%-Linie, wie bei
  `data-reveal-late` aus AP-534 (E2). Bis 900 px gibt es keinen rootMargin.
  `threshold: 0.6` bleibt auf allen Breiten.
- Cache-Busting: `main.js?v=20261002g` in allen 51 Seiten (vorher `20261002f`).
- `JS_VERSION` in `.github/scripts/build-headers.mjs` auf `20261002g`. Der Lauf hebt
  auch `home-header-morph.js` in `index.html` mit an.
- **Falle beim Header-Lauf:** Er setzte `projekte.css` in `projekte/index.html` von
  `20261002za` (AP-538) auf die zentrale `CSS_VERSION` `20261002y` zurück. Die Zeile ist
  von Hand wiederhergestellt, `CSS_VERSION` selbst bleibt unangetastet.

## Prüfung

Gescrollt wurde in 40-px-Schritten.

| Fenster     | beim Laden | ausgelöst bei scrollY | Zitatmitte bei |
|-------------|------------|-----------------------|----------------|
| 1280 × 800  | nein       | 280                   | 70 %           |
| 1440 × 900  | nein       | 240                   | 67 %           |
| 1512 × 860  | nein       | 240                   | 70 %           |
| 1920 × 1080 | nein       | 80                    | 71 %           |
| 402 × 874   | nein       | 160 (vorher 160)      | 98 %           |
| 375 × 667   | nein       | 360 (vorher 360)      | 97 %           |

Nach dem Auslösen stehen alle Wörter, der Strich (`transform: none`) und die Signatur
wie zuvor am Ende. Das Handy ist unverändert. Ab etwa 1190 px Fensterhöhe löst die
Animation weiter beim Laden aus, das Zitat steht dann aber vollständig im oberen
Fensterbereich.
