# AP-607 — Kontaktseite: fehlende Logo-Definition

Stand 17.10.2026 · Basis `577b47e` (`claude/kind-fermat-pyzy5p`)

## Befund

`npm run check:golive -- --root _site --ziel live` meldete auf `kontakt/index.html` zweimal
„Anker fehlt `#brand-logo`“ (Kopf Z. 92, Fuß Z. 380). Die Kontaktseite war die einzige Seite mit
`<use href="#brand-logo">`, aber ohne die Definition `<symbol id="brand-logo">`.

Sichtbar war das nicht: `styles.css` Z. 361–369 zeichnet das Logo als Hintergrundbild und blendet
`<use>` aus. Der Fehler hat den Live-Deploy aber blockiert, weil das Prüfskript dort mit Exit 1 abbricht.

## Änderung

Den Logo-Block aus `.github/scripts/templates/_logo.html` unverändert direkt nach `<body>` in
`kontakt/index.html` eingesetzt – derselbe Block, der auf `ueber-uns/index.html` steht (zeichengleich
geprüft). Das unsichtbare SVG hat `width="0" height="0"`, `position:absolute` und `aria-hidden`, ändert also
weder Layout noch Vorlese-Reihenfolge. `build-headers.mjs` und `build-footers.mjs` danach ausgeführt:
keine weiteren Änderungen.

## Prüfung

- `npm test`: 61 von 61 bestanden
- `check:golive --ziel live`: SEO 0, Links 0, Alt 0, Fremdquellen 0 Fehler (verbleibende Warnungen:
  Link auf `/gewerbekunden/`, ein Alt-Text mit 181 Zeichen, Elfsight bis AP-604 E1)
- Kein CSS geändert, kein Cache-Busting nötig
