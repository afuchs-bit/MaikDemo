# Maik Rohdich Garten- und Landschaftsbau — Projektkontext

## Verbindliche Dokumente

- **[docs/umsetzungsplan.md](docs/umsetzungsplan.md)** — der vollständige Arbeitsauftrag
  (SEO/GEO/AEO-Relaunch). **Teil H** enthält die Korrekturen aus der Repo-Prüfung und gilt
  bei Widersprüchen vor den Teilen A–G. Vor jedem Arbeitspaket lesen.
- [docs/offene-punkte.md](docs/offene-punkte.md) — fehlende Fakten mit Fundstelle
- [docs/go-live-checkliste.md](docs/go-live-checkliste.md) — vor dem Umschalten abarbeiten
- [docs/datenstruktur.md](docs/datenstruktur.md), [docs/cms-hinweise.md](docs/cms-hinweise.md), [ASSETS.md](ASSETS.md)

## Grundregeln

1. **Niemals Fakten erfinden.** Keine Telefonnummern, Zertifikate, Reaktionszeiten, Preise,
   Versicherungsdaten, Mitarbeiterzahlen oder Projektorte. Was nicht in Teil B des
   Umsetzungsplans steht, ist unbekannt.
2. Fehlende Fakten als `<!-- OFFEN: … -->` markieren und in `docs/offene-punkte.md` eintragen.
   **Kein** sichtbarer Platzhaltertext auf der Seite.
3. Keine Mitarbeiterzahlen, keine Fuhrparkgrößen, kein Teamfoto. Keine Preise oder
   Preisspannen — Kostentreiber erklären ist erlaubt und erwünscht.
4. Keine Rabatte, keine Aktionen, kein Newsletter.
5. Alle Texte auf Deutsch, Sie-Ansprache, bodenständig und sachlich. Keine Superlative,
   keine Werbesprache. „Traumgarten", „grüne Oase", „einzigartig" sind unpassend.
   Der Begriff **„Landschaftsgestalter" wird abgelehnt**. Korrekt: Gartenbaumeister,
   Garten- und Landschaftsbau, Sachverständiger für Baumkontrolle.
6. Bestehende CSS- und Klassenstruktur wiederverwenden. Kein Framework, kein Tailwind,
   keine Build-Pipeline für CSS.
7. Ein Commit pro Arbeitspaket, Format: `AP-XX: <Kurzbeschreibung>`.

## Stack

Statische HTML-Seiten ohne Build-Schritt. Eine CSS-Datei, Vanilla-JS in `assets/js/`.
Sveltia CMS unter `/admin/` mit GitHub-Backend. Inhalte in `content/projekte/*.json`,
Taxonomie in `content/taxonomie.json`. Die GitHub Action `build-index.yml` erzeugt
`data/projekte-index.json` über `.github/scripts/build-index.mjs`.

## Fallstricke

- **CSS-Cache-Busting:** Nach *jeder* Änderung an `assets/css/styles.css` den `?v=`-Parameter
  in **allen** HTML-Dateien hochzählen, sonst liefert Safari altes CSS aus.
- **Taxonomie-Sync:** Neue Leistungen müssen in `content/taxonomie.json` **und**
  `admin/config.yml` eingetragen werden. `check-config-sync.mjs` erzwingt gleiche Slugs und
  lässt die Action sonst fehlschlagen. Bestehende Slugs **nicht umbenennen** — die
  Projektdateien referenzieren sie, und der Index-Build bricht bei unbekannten Slugs ab.
- **`.github/workflows/**` kann Claude nicht pushen** (fehlender `workflow`-Scope).
  Solche Änderungen in einen eigenen Commit trennen und vom Auftraggeber im GitHub-Web-UI
  einspielen lassen. `.github/scripts/**` ist davon nicht betroffen.
- **`admin/index.html` behält dauerhaft `noindex`** — auch beim Go-Live nicht entfernen.
