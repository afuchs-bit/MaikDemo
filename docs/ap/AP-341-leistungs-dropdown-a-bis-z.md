# AP-341 — Leistungs-Dropdown spiegelt die A–Z-Liste der Startseite

**Datum:** 18.09.2026 · **Auftrag:** Das Untermenü „Leistungen" soll dieselben Leistungen
in derselben Reihenfolge führen wie die Startseite, Überschrift „Unsere Leistungen von
A bis Z".

## Diagnose

Zwei Listen derselben Leistungen, die nichts voneinander wussten:

| | Dropdown (vorher) | Startseite, Abschnitt `#leistungen` |
|---|---|---|
| Überschrift | „Für Privatkunden" | „Unsere Leistungen von A bis Z im Überblick" |
| Einträge | 13 | 21 |
| Ziele | 13 Seiten, je eine Zeile | 12 Seiten, mit Mehrfachzielen |
| Sortierung | fachliche Priorität | alphabetisch |

Die Startseite zerlegt mehrere Leistungsseiten in einzeln benannte Themen:
`gartengestaltung` erscheint fünfmal (Erd- & Baggerarbeiten, Gartenbeleuchtung,
Gartenentwässerung, Gartengestaltung, Rasen & Rollrasen), `terrasse-pflasterarbeiten`
viermal, `bepflanzung` dreimal. Das Dropdown kannte nur die Seitenebene.

**Befund, der die Entscheidung brauchte:** Die A–Z-Liste der Startseite führt
**Baumkontrolle & Gutachten** überhaupt nicht, und Sturmnotdienst nur als Notfallkachel
über der Liste — nicht als A–Z-Eintrag. Ein wortwörtliches 1:1 entfernt beide aus dem
Menü. Der Auftraggeber hat das so entschieden („strikt 1:1, 21 Einträge").

Beide Seiten bleiben bestehen und sind weiter verlinkt (programmatisch geprüft):

| Nicht mehr im Menü | erreichbar über |
|---|---|
| Baumkontrolle & Gutachten | Startseite, Block „Bäume schneiden, fällen & kontrollieren"; sechs Projektseiten |
| Sturmnotdienst | Startseite, Notfallkachel über der A–Z-Liste; sechs Projektseiten |

In der Gewerbe-Gruppe steht Baumkontrolle weiterhin.

## Diff

**[lib/render.mjs](.github/scripts/lib/render.mjs)** — zwei neue Felder an `WELTEN.privat`:

- `navKopf: 'Unsere Leistungen von A bis Z'` — nur die Dropdown-Überschrift. Bewusst
  **nicht** `navLabel` überschrieben: das ist auch die Kennung der Welt im Build-Protokoll
  („✅ Für Privatkunden: 13 direkte Leistungsseiten generiert", `build-leistungen.mjs:277`),
  wo der A–Z-Satz schlicht falsch wäre.
- `navListe: [{ slug, label }, …]` — die 21 Einträge in der Reihenfolge der Startseite.

**`slugs` blieb unangetastet**, und das ist der Kern der Sache: Dieselbe Liste steuert,
welche Leistungsseiten gebaut werden. Ein fünffaches `gartengestaltung` darin hätte
fünfmal dieselbe Seite erzeugt. Die Navigation braucht deshalb eine eigene Liste.

`renderNavSubmenu` nimmt `navListe`, wenn vorhanden, sonst unverändert den Weg über
`slugs`. Die Gewerbe-Welt läuft dadurch ohne Änderung weiter (7 Einträge, Überschrift
„Für Gewerbekunden").

**Die `<wbr>` der Startseiten-Kacheln** sind nicht mitgekommen: Sie sind ein
Umbruchhinweis für die schmalen Kacheln, die Menüzeile ist breit genug — und `esc()`
gäbe sie ohnehin als sichtbaren Text aus.

**Die 37 ausgelieferten Seiten:** Nur sechs davon tragen die
`BUILD:leistungen-submenu`-Marker (`index.html`, `404.html`, `kontakt/`, `projekte/`,
`ueber-uns/`, `gewerbekunden/index.saved.html`); bei den übrigen 31 ist der Block ohne
Marker eingebacken. Beide Fälle wurden gesetzt — bei den markerlosen über eine
ausgeglichene `<ul>`-Zählung statt über das erste `</ul>`, sonst hätte die Ersetzung
mitten im Block geendet. Das Pfadpräfix (`""`, `"/"`, `"../"`, `"../../"`, `"../../../"`)
wurde je Datei aus dem vorhandenen Block gelesen, nicht geraten.

**[assets/css/styles.css](assets/css/styles.css)** — eine Regel, die der Auftrag nicht
vorsah, die die Prüfung aber erzwungen hat (siehe QA):

```css
@media (min-width: 901px) {
  .nav-submenu { max-height: calc(100vh - 96px); overflow-y: auto; overscroll-behavior: contain; }
}
```

Nur ab 901px: Darunter steht das Untermenü im Fluss der ohnehin scrollenden Menükarte —
ein zweiter Scrollbereich darin wäre eine Falle.

**Cache-Busting:** `styles.css?v=20260918j` → `?v=20260918k` in allen 37 Seiten.

## QA

- **Liste gegen Liste:** Beschriftungen, Ziele und Reihenfolge des Dropdowns
  programmatisch gegen die 21 Karten der Startseite verglichen — **identisch**.
- **Rebuild-Trockenlauf** in einer Wegwerf-Kopie: Der von `build-leistungen.mjs`
  erzeugte Block ist auf vier Stichproben **zeichengleich** mit dem handgesetzten. Hand
  und Generator laufen nicht auseinander.
- **Alle 18 Ziele** (11 Privat-, 7 Gewerbeseiten) existieren als Verzeichnis, kein toter
  Link. Überschrift auf 37 Seiten gesetzt, alte Überschrift auf 0 Seiten übrig.
- **Der kritische Punkt — Panelhöhe.** Vorher 13 Zeilen in der linken Spalte, jetzt 21.
  Gemessen **ohne** Deckel: Panel 924px hoch, Unterkante 76–85px **unter** dem
  Bildschirmrand bei 900px Fensterhöhe — die letzten Einträge wären unerreichbar gewesen.
  Mit Deckel:

  | Fenster | Panelhöhe | Unterkante | ragt heraus | scrollt |
  |---|---|---|---|---|
  | 901 × 900 | 804 px | 856 px | 0 | ja |
  | 1280 × 900 | 804 px | 862 px | 0 | ja |
  | 1280 × 700 | 604 px | 662 px | 0 | ja |
  | 1440 × 1080 | 924 px | 985 px | 0 | nein |

  Bei 1080px Fensterhöhe greift der Deckel nicht — das Panel bleibt ungekürzt.
- **Tastatur:** Per echter Tab-Kette bis „Zäune & Sichtschutz" (letzter Eintrag)
  navigiert. Das Panel scrollt den Eintrag selbst ins Bild (`scrollTop` 120),
  `:focus-visible` greift, der Eintrag liegt vollständig im sichtbaren Panelbereich.
- **Handy (390 × 844):** Untermenü klappt auf (`display: grid`, 29 Zeilen inkl.
  Gruppenköpfen), die Menükarte scrollt (1797px Inhalt in 746px), das Untermenü selbst
  hat `overflow: visible` — kein verschachtelter Scrollbereich. Die Instagram-Zeile am
  Ende bleibt erreichbar. Kein waagerechter Überlauf.
- Zwei generierte Leistungsseiten stichprobenartig: 21 Privat-, 7 Gewerbeeinträge,
  richtige Überschrift. `check-config-sync.mjs` Exit 0.

## Nachtrag AP-342 (18.09.2026)

Die Gewerbe-Gruppe ist inzwischen aus dem Dropdown entfernt, und der hier eingeführte
Höhendeckel `max-height: calc(100vh - 96px)` ist durch eine feste Höhe von 480 px
ersetzt. Siehe `AP-342-dropdown-ohne-gewerbe-feste-hoehe.md`.

## Offen

Die beiden Listen sind jetzt inhaltlich gekoppelt, aber technisch nicht: Wer die A–Z-Liste
auf der Startseite ändert, muss `navListe` in `render.mjs` mitziehen. Ein Prüfschritt in
`check-config-sync.mjs`, der beide Listen vergleicht und bei Abweichung meckert, wäre die
saubere Absicherung — hier bewusst nicht mitgemacht, um das Arbeitspaket nicht
auszuweiten.
