# Leistungsseiten (AP-16) – für Entwickler

Die Leistungsseiten unter `/leistungen/<slug>/` und die Übersicht `/leistungen/` werden
**generiert**, nicht von Hand geschrieben. Inhalt liegt in Daten, Struktur im Template,
Chrome (Header/Footer/Logo) wird mit den Projektseiten geteilt.

## Woraus eine Seite entsteht

| Teil | Ort |
|------|-----|
| Inhalt je Leistung | `content/leistungen/<slug>.json` |
| Seiten-Template | `.github/scripts/templates/leistung.html` |
| Übersichts-Template | `.github/scripts/templates/leistungen-index.html` |
| Render-Logik | `.github/scripts/lib/render.mjs` (`renderLeistungPage`, `renderLeistungenOverview`) |
| Generator | `.github/scripts/build-leistungen.mjs` |
| Ausgabe (committet) | `leistungen/<slug>/index.html`, `leistungen/index.html` |

Die Seiten tragen im Kopf einen Sentinel-Kommentar und dürfen **nicht** von Hand editiert
werden – der nächste Generatorlauf überschreibt sie.

## Eine Leistung ändern oder anlegen

1. `content/leistungen/<slug>.json` bearbeiten oder neu anlegen. Der `<slug>` **muss** in
   `content/taxonomie.json` existieren (sonst bricht der Generator ab).
2. Bei einer **neuen** Leistung zusätzlich den Slug in `content/taxonomie.json` **und**
   `admin/config.yml` eintragen (sonst schlägt `check-config-sync.mjs` fehl).
3. Reihenfolge in der Übersicht: Array `ORDER` in `build-leistungen.mjs`.
4. Neu generieren und committen:
   ```bash
   node .github/scripts/build-leistungen.mjs     # nur Leistungsseiten
   # oder alles (Projekt-Index + Projektseiten + Leistungsseiten):
   cd .github/scripts && npm run build
   ```

## Pflichtfelder je `content/leistungen/<slug>.json`

`h1`, `navLabel`, `title`, `metaDescription`, `serviceType`, `intro` (40–60 Wörter),
`eignung` (Array), `ablauf`/`aufwand`/`fehleinschaetzungen` (Arrays aus `{titel,text}`),
`faq` (mind. 3 × `{frage,antwort}`), `nachbarn` (Slugs anderer Leistungen),
`kundengruppe` (`privat`/`gewerbe`). Der Generator validiert das und bricht bei Fehlern ab.

## Automatik

- **Referenzprojekte** werden aus `content/projekte/*.json` ermittelt (Projekte, deren
  `leistungen` den Slug enthalten). Ohne Treffer erscheinen die neuesten Projekte als
  allgemeine Beispiele – so bleibt „mindestens ein Referenzprojekt" wahr, ohne Erfindung.
- **Projekt → Leistung:** Die Projektseiten verlinken auf `/leistungen/<slug>/`. `build-index.mjs`
  prüft, ob die Seite existiert; solange nicht, fällt es auf den Galerie-Filter zurück. Nach
  jedem `build-leistungen`-Lauf einmal `build-index` laufen lassen, damit die Links sitzen
  (oder gleich `npm run build`, das beide in der richtigen Reihenfolge ausführt).

## Navigation (AP-18)

Header-Dropdown „Leistungen" und die Footer-Leistungenspalte stammen aus **einer** Quelle:
der Konstante `LEISTUNGEN_NAV` in `render.mjs` (Slug + Kurzlabel, fachliche Reihenfolge).

- Generierte Seiten (Projekte, Leistungen) füllen die Platzhalter `{{leistungenSubmenu}}`
  und `{{leistungenFooter}}` beim Rendern.
- Die vier Handseiten (`index.html`, `privatkunden/`, `gewerbekunden/`, `projekte/`) bekommen
  die Listen per Marker-Injektion (`<!-- BUILD:leistungen-submenu -->`,
  `<!-- BUILD:leistungen-footer -->`) durch `build-leistungen.mjs`.

**Eine neue Leistung muss deshalb auch in `LEISTUNGEN_NAV` eingetragen werden**, sonst fehlt
sie in der Navigation. `build-leistungen.mjs` warnt, wenn `LEISTUNGEN_NAV` und die Inhaltsdateien
voneinander abweichen. Das Untermenü-Verhalten (Desktop-Hover/-Klick, Mobil-Toggle) steckt in
`assets/js/main.js` und `assets/css/styles.css`. **Nach Änderungen an `main.js` den `?v=`-Parameter
in allen HTML-Dateien hochzählen** (wie bei der CSS-Datei), sonst liefert der Browser altes JS.

## Startseiten-FAQ (AP-19)

Die FAQ auf der Startseite steht in `content/faq-startseite.json` (Array `faq` aus
`{frage, antwort}`, Antworten answer-first, 40–60 Wörter). `build-leistungen.mjs` generiert
daraus **beides** in `index.html`: die sichtbare `<details>`-Liste (zwischen
`<!-- BUILD:faq -->`) **und** das `FAQPage`-Schema (zwischen `<!-- BUILD:faq-schema -->`) –
aus derselben Quelle, also garantiert zeichengleich. Nie das Schema oder die Liste von Hand
editieren; stattdessen die JSON pflegen und neu generieren. Das Ablaufdiagramm „So läuft eine
Anfrage ab" ist eine statische, barrierefreie HTML-Sektion in `index.html` (semantisches `<ol>`).

Leistungsseiten können optional einen `fachtext`-Block tragen (siehe
`content/leistungen/baumkontrolle.json` → Verkehrssicherungspflicht): `{titel, intro,
bloecke:[{h3,text}], hinweis}`. Ohne das Feld erscheint kein Block.

## Kein CMS, kein Workflow-Handoff nötig

Leistungsinhalte pflegt der Entwickler, nicht der Kunde über Sveltia. Die Seiten werden
lokal generiert und committet. Anders als bei den Projektseiten (AP-15) braucht es dafür
**keine** Änderung an `.github/workflows/**`.
