# Dunkle Farbwelt über die ganze Website

**Stand:** 02.09.2026 · Branch `codex/homepage-review` · nach `ba93bd2`

> **Ersetzt den Entwurf vom selben Tag, der nur die Startseite umfasste.** Der Auftraggeber
> hat den Zuschnitt erweitert: Die Farben aus Hero und Social Proof gelten für **alle**
> Seiten. Damit ist der Haupteinwand des alten Entwurfs — „38 weitere Seiten würden
> mitgehen" — kein Risiko mehr, sondern das Ziel.

## Warum

`index.html` trägt `html.home-theme-dark` und läuft in der dunklen Farbwelt. Die übrigen
35 ausgelieferten Seiten stehen in der hellen Palette. Das soll vereinheitlicht werden:
**eine Farbwelt, die dunkle.**

Nur die Farben. Die Nunito-Typografie, die `home-dark.css` heute zusätzlich für die
Startseite setzt, bleibt dort — sie war nicht Teil des Auftrags.

## Reichweite, gemessen

Dunkle Token wurden je Seitentyp probeweise auf `:root` erzwungen und die Seite vermessen:

| Seitentyp | Seiten | Helle Flächen | Text < 4,5:1 | von geprüft |
|---|---|---|---|---|
| Generiert (Leistung, Projekt, Rechtstext) | **32** | 4 | 7 | 93 |
| Kontakt | 1 | 14 | 12 | 82 |
| Gewerbe-Hub | 1 | 59 | 67 | 186 |
| Startseite | 1 | 83 | 59 | 165 |

**Der wichtigste Befund: Die 32 generierten Seiten kommen fast umsonst mit.** Sie sind
durchgehend auf Token gebaut. Die Arbeit steckt in den drei handgepflegten Seiten.

**Der zweitwichtigste: Die Bauteile überschneiden sich.** `.chev`, `details`,
`.b2b-request-media`, `.private-service-face`, `.step-node` treten auf Startseite **und**
Gewerbe-Hub auf. Die vier Zahlen oben addieren sich nicht — site-weit sind es rund
**25 bis 30 Bauteilgruppen**, nicht 160.

Auf jeder Seite gleich: `.site-header` (durchscheinend hell), `.menu`, und der
WhatsApp-Knopf in `rgb(37,211,102)` — Letzterer ist WhatsApps Markenfarbe und bleibt.

## Entwurf

### 1. Die Palette zieht nach `styles.css`

Es gibt künftig kein Thema mehr zum Umschalten — **dunkel ist die Palette**. Der Token-Block
aus `html.home-theme-dark` (Flächen, Schrift, Linien, Markenrollen `--home-lime`,
`--home-yellow`, `--home-brand-green`, `--home-red`) wandert nach `styles.css :root`.

Damit werden alle 36 Seiten in einem Zug dunkel, ohne dass eine einzige HTML-Datei eine
Klasse braucht. Eine Scoping-Klasse, die überall gilt, ist tote Zeremonie.

### 2. `home-dark.css` schrumpft auf das, was wirklich nur die Startseite betrifft

Es bleiben: Nunito-Typografie, Hero mit Intro-Zustandsmodell, Gewerbe-Tür, NRW-Karte,
Kleinauftrags-Karte, Proofleiste. Es geht: der Token-Block und alles, was jetzt in
`styles.css` steht.

Die Selektoren behalten vorerst ihr `html.home-theme-dark`-Präfix, und die Klasse bleibt an
`index.html`. Sie zu entfernen wäre ein zweiter, unabhängiger Umbau ohne sichtbaren Nutzen
— das gehört nicht in dieses Paket.

### 3. Die helle Insel fällt

Aus `merge-light.css` verschwinden der `.merge-light-scope`-Token-Block und die Nahtlinie.
Der Wrapper `<div class="merge-light-scope">` in `index.html` wird mit entfernt.

Geprüft: Die Klasse kommt nur in diesen beiden Regeln und dem Wrapper vor; keine
verbleibende Regel hängt darunter. Ebenfalls geprüft: Es gibt keine Geschwister- oder
Positionsselektoren auf Sektionsebene, die das Auspacken der sechs Sektionen träfen.

### 4. Fünf Flächenrollen statt Einzelfälle

Jede helle Fläche bekommt die Rolle, die sie im Aufbau hat — nicht „irgendein Grau":

| Rolle | Token | Wert | Wofür |
|---|---|---|---|
| Grundfläche | `--bg` | `#171916` | Sektionshintergründe |
| Gehobene Karte | `--bg-elev` | `#20241D` | Karten, Kacheln, Eingabefelder |
| Weiche Fläche | `--bg-soft` | `#2A2F26` | eingelassene Flächen, Chevron-Kreise |
| Sektionswechsel | `--bg-hero` | `#1B1E19` | abgesetzte Sektionen |
| Linien | `--line` / `--line-2` | Weiß 12 % / 8 % | Rahmen, Trenner |

### 5. Was ausdrücklich hell bleibt

- **Die Google-Rezensionskarte.** Entscheidung des Auftraggebers: Das weiße Feld mit dem
  G-Logo ist Wiedererkennung.
- **Der WhatsApp-Knopf.** Fremde Markenfarbe.
- **`.private-service-face--back`.** Trägt bereits einen dunkelgrünen Verlauf mit weißer
  Schrift und funktioniert unverändert.
- **Helle `color:`-Angaben.** Allein in `privat-form.css` sind 53 der 151 Hell-Literale
  Schriftfarben — helle Schrift auf dunklem Grund ist das Ziel, nicht das Problem. Ein
  pauschaler Durchlauf über alle Hell-Literale würde genau dort Schaden anrichten.

### 6. Zwei Fallen, die dieses Repo schon gestellt hat

**Generierte Seiten driften.** 32 der 36 Seiten entstehen aus Vorlagen unter
`.github/scripts/templates/`. Änderungen nur an ausgelieferten Dateien überschreibt der
nächste Build. Entwarnung für die Farben selbst: Die Vorlagen enthalten keine Farbwerte,
nur `{{cssVersion}}`-Platzhalter. Und `build-index.mjs:181` liest die CSS-Version aus einer
bestehenden Seite aus, statt sie als Konstante zu führen — der `?v=`-Durchlauf zieht also
von allein durch. **Nach dem Umbau werden `build-leistungen.mjs` und `build-rechtstexte.mjs`
von Hand nachgezogen und das Ergebnis geprüft**, weil die Action sie nicht aufruft.

**Der `?v=`-Durchlauf ist Pflicht.** `styles.css` wird verändert — ohne Hochzählen in allen
ausgelieferten HTML-Dateien liefert Safari alte CSS aus. Das ist diesmal kein zu
vermeidender Aufwand, sondern Teil des Auftrags.

`admin/index.html` bleibt unberührt.

## Abfolge

Drei Arbeitspakete, jedes für sich messbar und ansehbar:

1. **Palette umziehen.** Token nach `styles.css :root`, `home-dark.css` entschlacken, Insel
   entfernen, `?v=` über alle Seiten. Danach ist die ganze Website dunkel — mit den
   bekannten hellen Flecken. Messbar: alle 36 Seiten tragen die dunkle Grundfläche.
2. **Gemeinsame Bauteile.** Header, Menü, `.chev`, `details`, `.step-node`, `.btn`-Varianten,
   Formularfelder — alles, was auf mehreren Seiten auftritt. Ein Durchgang, mehrere Seiten
   werden gleichzeitig sauber.
3. **Seitenspezifisches.** Was danach noch übrig ist, je Seite.

## Prüfung

Maßgeblich ist die Messung, nicht die Sichtprüfung. Dieselbe Diagnose läuft nach jedem
Paket über **einen Vertreter jedes Seitentyps** (Startseite, Gewerbe-Hub, Kontakt, je eine
Leistungs-, Projekt- und Rechtstextseite, 404).

| Kriterium | Ziel |
|---|---|
| Textstellen unter 4,5:1 | **0** je Seite |
| Helle Flächen | nur Google-Karte und WhatsApp-Knopf |
| Seiten in heller Palette | **0** |

Dazu:

1. **Erzwungene Zustände**: Assistent Schritt 1–4, Akutpfad, offene FAQ-Gruppen, Karussell
   weitergeschaltet, Leistungskacheln umgedreht, Formularfehler, `:hover`/`:focus`.
   Was sich nicht nachweisen lässt, wird nicht angefasst.
2. **Generatoren nachziehen** und den Diff prüfen — jede geänderte Zeile muss erklärbar
   sein. Beim letzten Durchlauf steckte in 45 Zeilen genau eine unerwartete.
3. **Sichtprüfung** bei 375 / 768 / 1200 px auf allen Vertretern.
4. Je Seite: eine `h1`, keine doppelten IDs, keine toten Anker, keine Konsolenfehler,
   kein Querlauf.

## Risiken

| Risiko | Gegenmaßnahme |
|---|---|
| Generierte Seiten fallen beim nächsten Build zurück | Vorlagen tragen keine Farben; Generatoren nach dem Umbau von Hand nachziehen und Diff prüfen |
| Safari liefert alte CSS | `?v=`-Durchlauf über alle ausgelieferten HTML-Dateien, verifiziert |
| Pauschaler Durchlauf zerstört korrekte helle Schrift | `color:`-Angaben getrennt behandeln |
| Zustände, die im Ruhezustand nicht rendern, bleiben hell | Diagnose mit erzwungenen Zuständen |
| Bilder und Fotos wirken auf dunklem Grund anders | Sichtprüfung; Bildmaterial wird nicht verändert |

## Berührte Dateien

| Datei | Änderung |
|---|---|
| `assets/css/styles.css` | dunkle Token nach `:root`, Bauteilflächen auf Token |
| `assets/css/home-dark.css` | Token-Block raus, bleibt für Startseiten-Bauteile |
| `assets/css/merge-light.css` | Token-Block und Naht raus |
| `assets/css/privat-form.css` | ~97 Flächen- und Rahmenliterale auf Token |
| `assets/css/anfrage.css` | Token-Brücke auf dunkle Werte |
| `assets/css/gewerbe.css`, `kontakt.css`, `projekte.css`, `customer-hero.css`, `form-trust-card.css` | Flächenliterale auf Token |
| alle ausgelieferten `*.html` | `?v=`-Durchlauf; `index.html` zusätzlich der Wrapper |

## Was dieser Entwurf nicht tut

- **Keine Typografieänderung.** Nunito bleibt der Startseite vorbehalten.
- **Keine neue Palette.** Nur die Token, die Hero und Social Proof heute schon nutzen.
- **Keine Änderung an Aufbau, Text oder Reihenfolge** — ausschließlich Farbe.
- **Kein Eingriff in `.github/workflows/**`** (fehlender Push-Scope) und keiner in `admin/`.
- **Kein Deployment, kein Push.**
