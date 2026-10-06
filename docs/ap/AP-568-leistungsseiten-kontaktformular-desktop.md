# AP-568 — Leistungsseiten: Kontaktformular am Desktop wie auf der Startseite

Stand 06.10.2026 · Basis `a3605965` (`codex/homepage-review`)

## Auftrag

„Das Kontaktformular in den Leistungsunterseiten auf dem Desktop soll identisch sein wie das
Kontaktformular auf der Homepage auf dem Desktop." Entscheidungen des Auftraggebers:
Kontaktbereich bricht aus der 640-px-Spalte aus (860 px wie Startseite); Überschrift überall
„Der erste Schritt zu Ihrem Gartenprojekt" (außer Sturmnotdienst).

## Befund

- `lpv2Contact()` in `render.mjs` war eine flache Handkopie des Startseiten-Kurzformulars: Die
  Hüllen `.anf__eingabe`, `.anf__kontaktfelder`, `.anf__aktionen`, `.anf__foto-gruppe` fehlten,
  die Desktop-Anordnung aus `anfrage.css` (AP-547/555) griff ins Leere.
- Die Seiten laden `cta-family-home.css`, `home-spacing.css` und `home-dark.css` nicht
  (Knopf 362 × 64, Abstände, Überschriftgröße).
- Ab 901 px stand die ganze `.lpv2-main` in 32 rem mit `zoom: 1.25`.
- Die AP-512-Kopie der Handy-Regeln (ab 481 px) überlagerte am Desktop die Startseiten-Gestaltung
  und schaltete mit einer falsch erfassten reduced-motion-Zeile den Knopf-Puls ab.

## Änderungen

- `render.mjs`: Hüllen wie in `index.html`, Mail-Icon-Attribute angeglichen, Standardtitel
  „…Gartenprojekt". Bis 900 px lösen sich die Hüllen per `display: contents` auf.
- `leistung-mobile.css`:
  - Formular-Kopien aus dem AP-512-Block gelten nur noch bis 900 px.
  - Die beiden Zeilen ohne Bewegung gelten ab 901 px nicht mehr für den Kontaktbereich.
  - Ab 901 px tragen die Sektionen Spalte und zoom selbst (wie AP-534), der Kontaktbereich steht
    bei zoom 1 in voller Breite.
  - Begrenzte Kopie der wirkenden Startseiten-Regeln (in Chrome ermittelt: 25 Regeln aus drei
    Dateien) unter `.lpv2-home-contact`.
- `build-headers.mjs`: eigener Cache-Schlüssel `LEISTUNG_MOBILE_CSS_VERSION`, damit
  `leistung-mobile.css` nicht am `styles.css`-Schlüssel aller Seiten hängt.
- 38 Leistungsseiten neu gebaut (Formularbereich, Überschrift, Cache-Zeile).

## Messung (headless Chrome)

| Prüfung | Ergebnis |
|---|---|
| Kontaktbereich Startseite gegen Baumpflege/Außenanlagenpflege, 1024/1280/1440/1920 px | keine Lageabweichung über 0,5 px; Rest nur Tipp-Hervorhebung, Rasterwerte an einem Block-Element, Variablen |
| Sturmnotdienst | gleicher Aufbau, Unterschiede nur durch eigene Texte |
| Übrige Sektionen ab 901 px (Held, Text, Galerie, Fragen, Ergänzungen, Footer) | unverändert (0,1 px Rundung) |
| Trichter-Seite Balkonkastenbepflanzung | unverändert |
| Handy 360/402/480 px | 0 Abweichungen (351 Elemente) |
| Tablet 768/900 px | nur +35 px durch zweizeilige Überschrift |
| Funktion 901–1920 px | Knopf 362 × 64, Fehlermeldungen, Foto-Einwilligung, Puls, kein Überlauf, keine Konsolenfehler |
