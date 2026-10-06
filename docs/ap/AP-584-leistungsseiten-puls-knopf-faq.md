# AP-584 — Leistungsseiten: Knopf-Puls ab 481 px, Held-Knopf mittig, FAQ am Desktop wie Startseite

Stand 06.10.2026 · Branch `codex/ap-565-held-rahmenbild` (Basis 21ed787a + AP-568/565)

## Auftrag (Ansage des Auftraggebers)

1. Der Anfrageknopf im Balkonkasten-Held pulsiert am Desktop nicht, am Handy schon – er soll pulsieren.
2. Der Knopf steht mittig unter dem Titel.
3. Die FAQ der Leistungsseiten sehen am Desktop aus wie das neue FAQ-Design der Startseite
   (Entscheidungen: Gruppenüberschrift = Name der Leistung; gleiche Animation).

## Befund

- **Puls:** Die `@keyframes maik-cta-*` stehen in `cta-family.css` (~218–252) nur in
  `@media (max-width:480px)`; die Startseite holt sie ab 481 px aus `cta-family-home.css`, das
  die Leistungsseiten nicht laden. Auf **allen** Leistungsseiten lief ab 481 px deshalb keine
  Puls-Animation (Name gesetzt, `getAnimations()` leer) – auch nicht bei „Anfrage senden“.
  **Berichtigung AP-568:** Die dortige Messung prüfte nur den Animationsnamen; die Aussage
  „pulsiert auf Tablet und Desktop“ war falsch.
- **Auslöser:** `cta-signal.js` startet den Puls erst, wenn der Knopf zu 95 % über der
  80-%-Linie des Fensters steht; im Rahmenbild-Held lag er bei 1440 × 900 knapp darunter.
- **FAQ:** Startseite (AP-546) eine 760-px-Spalte mit Gruppen-Karte, grüner Versal-Überschrift,
  Trennlinien, Plus und WAAPI-Animation (`privat-form.js`); Leistungsseiten 1–3 Einzelkarten in
  der 32-rem-Spalte mit zoom 1.25, ohne Skript.

## Änderungen

- `leistung-mobile.css`:
  - die sechs Keyframes wörtlich aus `cta-family.css` in `@media (min-width:481px)`;
  - Held-Knopf: Container so breit wie der Titel (`min(100%,620px)`), Knopf mittig;
    Held-Zeilen `.5fr / 1.5fr`, damit der Knopf im ersten Bild über der 80-%-Linie liegt;
  - FAQ ab 901 px aus der Spalte (wie der Kontaktbereich, AP-568) und begrenzte Kopie der
    Startseiten-Regeln (`privat-form.css` `.private-faq*`, `home-spacing.css`, `home-dark.css`)
    auf die Leistungsseiten-Klassen; bis 900 px löst sich die neue Hülle auf, die
    Gruppenüberschrift ist aus.
- `render.mjs` (`lpFaq`): Hülle `div.lpv2-faq-gruppe` mit `h3.lpv2-faq-gruppe__titel` (Name der
  Leistung) und `data-private-faq-group` an der Liste.
- `privat-form.js`: Das FAQ-Modul nimmt auch `.lpv2-faq`, animiert dort nur ab 901 px; darunter
  natives `<details>`. Die übrigen Module steigen auf Leistungsseiten früh aus (geprüft).
- `leistung-v2.html`: `privat-form.js` eingebunden. `build-headers.mjs`:
  `PRIVATE_FORM_JS_VERSION` 20261006a, `LEISTUNG_MOBILE_CSS_VERSION` 20261006f.

## Messung (Headless Chrome)

| Prüfung | Ergebnis |
|---|---|
| Puls ohne Scrollen 901×900, 1024×768, 1280×800, 1440×900, 1920×1080 | `maik-cta-rhythm-breath` läuft, Halo bis ≈ 0,5 Deckkraft; reduziert: keine Animation |
| Knopf mittig | Mitte Knopf = Mitte Titel auf allen Breiten (±0 px) |
| FAQ Startseite ↔ Baumpflege / Balkonkasten bei 1024/1440/1920 | Karte 760 × 180, Überschrift, Zeilen 68 px, Plus, Abstände deckungsgleich; Rest nur `min-height:auto↔0` ohne Wirkung |
| Animation | 1440: gleitet auf/zu (`is-opening`/`is-closing`); 402: nativ wie bisher; reduziert: sofort; Startseite unverändert animiert |
| Handy 375/402/480 | unverändert bis auf die neuen ausgeblendeten Elemente |
| Tablet 768/874 | nur die bekannte AP-568-Verschiebung (+35 px) |
| Desktop sonst | Galerie/Kontakt/Ergänzungen unverändert, kein Überlauf, keine Konsolenfehler |
