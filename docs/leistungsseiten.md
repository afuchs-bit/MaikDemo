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

## Kein CMS, kein Workflow-Handoff nötig

Leistungsinhalte pflegt der Entwickler, nicht der Kunde über Sveltia. Die Seiten werden
lokal generiert und committet. Anders als bei den Projektseiten (AP-15) braucht es dafür
**keine** Änderung an `.github/workflows/**`.
