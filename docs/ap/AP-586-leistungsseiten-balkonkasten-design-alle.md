# AP-586 — Leistungsseiten: Balkonkasten-Design am Desktop auf alle Seiten

Stand 08.10.2026 · alle 38 Leistungsseiten (37 privat, 1 gewerbe) · nur Desktop ab 901 px. Das Handy bis
900 px bleibt gleich.

## Auftrag

Ansage: „Wende nun die gesamte Designlogik, welche wir bei Balkonkastenbepflanzung haben, auf alle
Leistungsseiten an … Wenn irgendwelche besonderen Probleme auftreten, melde mir das.“

Übertragen werden:

- **Rahmenbild-Held** (AP-565 mit Nachträgen):
  - Titel in Baloo 2 700, weiß, Größe wie der Startseiten-Titel.
  - Titel und Knopf (380 × 64) mittig zwischen Containerkante und Foto.
  - Hochkant-Karte 3:4 bündig mit dem Rücklink, ohne Schatten; Blütenstempel, versetzter Rahmen.
- **Textbereich „Trichter“ mit Blickführung** (AP-566/567 mit Nachträgen):
  - zwei Spalten mit Trennlinie;
  - H2 groß und grün, H3 weiß mit der Liste direkt darunter;
  - Eintritts-Sequenz mit Blüten als Kette;
  - Hinweis, Kachel und Knopf untereinander in 760 px;
  - Abstände 96 / 41 / 96.

**Entscheidungen 08.10.2026:**

1. Ausrollen mit den vorhandenen Fotos. Die Karte schneidet per `object-fit` auf 3:4 zu.
2. Baumkontrolle bekommt den neuen Held; der Textbereich bleibt in der bisherigen Spalte.

## Umsetzung

- **`render.mjs`:**
  - `desktopHero` = `rahmenbild` und `desktopLayout` = `trichter` sind jetzt Standard für alle
    editorial-v2-Seiten; eine Seite kann per JSON abweichen. Baumkontrolle: `"desktopLayout": "spalte"`.
  - Titelzeilen: Die Klasse `lpv2-title-line--join` kommt nur an Wortfugen, also wo im h1 kein
    Leerzeichen zwischen den Zeilen steht. Nur dort setzt das CSS den Bindestrich:
    „Balkonkasten-“, „Sichtschutz-“, „Stubbenfräsen-“, „Ausgleichs-“, „Naturstein-“. Bisher stand der
    Bindestrich fest hinter Zeile 1 und wäre bei „Zäune &“, „Bonsai /“ oder „Außergewöhnliches“ falsch
    gewesen.
  - Neues optionales JSON-Feld `titelTrennung` (z. B. `["Vorgarten|gestaltung"]`): ein weiches
    Trennzeichen im Held-Titel. Es bricht nur, wenn das Wort nicht in die Titelbreite passt.
- **`leistung-mobile.css`:**
  - Die H3 darf umbrechen (bis 64 Zeichen).
  - Die Liste steht ohne JS in Zeile 2; mit JS 18 px unter der H3, gemessen von `main.js`
    (`--lpv2-list-top`, ResizeObserver).
  - Ein Absatz nach dem Leistungsblock (Sturmnotdienst) steht unten wie der Hinweistext.
  - Ohne Hinweistext (Findlinge) hält die Kachel den 96-px-Abstand zur Linie.
  - Die AP-568-Spaltenregel nimmt den Held aus. Sonst bliebe er bei Baumkontrolle in der 32-rem-Spalte.
  - `hyphens:manual` am Desktop-Titel, weil die Grundregel `hyphens:none` auch weiche Trennstellen
    abschaltet.
- **JSON:**
  - `baumkontrolle.json`: `desktopLayout: spalte`.
  - `titelTrennung` bei Außergewöhnliches, Nassschneidearbeiten, Saisonbepflanzung, Schredderarbeiten,
    Verkehrssicherheit, Vorgartengestaltung, Wurzelentfernung, Objekt- & Grünflächenpflege.
- **Cache:** `LEISTUNG_MOBILE_CSS_VERSION` und `JS_VERSION` gehoben.

## Prüfung (headless Chrome)

**Desktop, alle 38 Seiten × 901/1024/1280/1440/1920:**

- **Held:**
  - Titel und Knopf mittig (±1 px), Titelzeilen innerhalb der Titelbreite.
  - Der Knopf liegt über der Puls-Linie, das Label passt in den Knopf.
  - Die Karte ist bündig mit dem Rücklink.
- **Textbereich:**
  - Keine Überlappungen.
  - H3 → Liste 18 px, Kachel → Knopf 41 px, Knopf → Galerie-Bilder 96 px.
  - Kachel 760 px.
- **Allgemein:** kein Überlauf, keine Konsolenfehler.
- **Erster Lauf:** 8 Seiten mit zu langen Titelwörtern bei 1920 und teils 901 px. Gelöst mit
  `titelTrennung` und `hyphens:manual`; danach ohne Befund.

**Sequenz (1440, alle Trichter-Seiten):** Eintritt, alle Punkte hell, Abstände ≥ 0,18 s, H3 sichtbar,
Trennlinie voll, Hinweis/Kachel/Knopf erschienen – **alle 37 Trichter-Seiten ok** (Abstände 175–180 ms im 10-ms-Messraster).

**Handy (375/402/874, alle 38 Seiten):** Element-Vergleich gegen den Stand vorher (Lage, Größe, Deckkraft, Transform, Farbe) – **0 Abweichungen**. Neu sind nur Klassen und Attribute (`reveal`, `data-reveal-late`, `lpv2-title-line--join`), die bis 900 px nichts bewirken.

## Gemeldete Probleme

1. **Fotos zu klein für die Hochkant-Karte.**
   - Die Karte ist bis zu 460 × 613 px groß. Für Retina-Schärfe braucht sie etwa 2 Bildpunkte je Pixel
     (Faktor ≥ 2).
   - Die Held-Fotos fast aller Seiten liegen nur in 640 px vor und sind meist quadratisch. Auf normalen
     Bildschirmen sind sie ordentlich, auf Retina weich.
   - **Saisonbepflanzung** (480 × 360) wird schon auf normalen Bildschirmen hochgerechnet.
   - Abhilfe: je Seite ein großes Hochkant-Original (≥ 920 × 1227) als `desktopHeroPortrait` eintragen,
     wie bei Balkonkasten.

   | Seite | Foto | Größe | Faktor |
   |---|---|---|---|
| saisonbepflanzung | `kuebelbepflanzung-480.webp` | 480x360 | 0,59 |
| aussergewoehnliches-garten | `aussergewoehnliches-garten-640.webp` | 640x640 | 1,04 |
| baumarbeiten | `baumfaellung-warnschild-640.webp` | 640x640 | 1,04 |
| beleuchtung | `gartenbeleuchtung-nacht-640.webp` | 640x640 | 1,04 |
| bepflanzung | `pflanzarbeiten-bienenpflanze-640.webp` | 640x640 | 1,04 |
| entwaesserung | `entwaesserung-rohrsystem-640.webp` | 640x640 | 1,04 |
| erd-baggerarbeiten | `erd-baggerarbeiten-baggerarm-640.webp` | 640x640 | 1,04 |
| ersatz-ausgleichspflanzungen | `ersatz-ausgleichspflanzungen-640.webp` | 640x640 | 1,04 |
| feuerstellen | `feuerstellen-640.webp` | 640x640 | 1,04 |
| findlinge-natursteineinfassungen | `findlinge-natursteinbeet-640.webp` | 640x640 | 1,04 |
| gartengestaltung | `gartengestaltung-gartenanlage-640.webp` | 640x640 | 1,04 |
| gartenpflege | `gartenpflege-team-640.webp` | 640x640 | 1,04 |
| nassschneidearbeiten | `nassschneidearbeiten-640.webp` | 640x640 | 1,04 |
| palmen-winterfest | `palmen-winterfest-schnee-640.webp` | 640x640 | 1,04 |
| pflasterreinigung-fugenreinigung | `pflaster-fugenreinigung-wildkrautbuerste-640.webp` | 640x640 | 1,04 |
| pool-whirlpool-umfeld | `pool-whirlpool-garten-640.webp` | 640x640 | 1,04 |
| rodungsarbeiten | `rodungsarbeiten-minibagger-640.webp` | 640x640 | 1,04 |
| rohdichs-grubengold | `rohdichs-grubengold-640.webp` | 640x640 | 1,04 |
| schredderarbeiten | `schredderarbeiten-640.webp` | 640x640 | 1,04 |
| sichtschutzbepflanzung | `sichtschutzbepflanzung-640.webp` | 640x640 | 1,04 |
| stubbenfraeseneinsatz | `stubbenfraeseneinsatz-640.webp` | 640x640 | 1,04 |
| terrasse-pflasterarbeiten | `pflasterarbeiten-baustelle-640.webp` | 640x640 | 1,04 |
| terrassenbau | `terrassenbau-holzoptik-garten-640.webp` | 640x640 | 1,04 |
| verkehrssicherheit | `verkehrssicherheit-640.webp` | 640x640 | 1,04 |
| vermessung-lasertechnik | `vermessung-lasertechnik-640.webp` | 640x640 | 1,04 |
| vorgarten | `vorgartengestaltung-findlinge-640.webp` | 640x640 | 1,04 |
| wurzelentfernung | `rodungsarbeiten-640.webp` | 640x640 | 1,04 |
| aussenanlagenpflege | `objekt-gruenflaechenpflege-mitarbeiter-640.webp` | 640x640 | 1,04 |
| baumpflege | `baumpflege-640.webp` | 640x704 | 1,15 |
| dachbegruenung | `dachbegruenung-640.webp` | 640x704 | 1,15 |
| holzverkauf | `kaminholz-640.webp` | 640x704 | 1,15 |
| rollrasen | `rasen-rollrasen-640.webp` | 640x704 | 1,15 |
| sturmnotdienst | `baumfaellung-640.webp` | 640x704 | 1,15 |
| teichbau | `teichbau-technik-640.webp` | 640x704 | 1,15 |
| zaeune-sichtschutz | `zaeune-sichtschutz-640.webp` | 640x704 | 1,15 |
| bonsai-formgehoelze | `formgehoelzgarten-vor-wohnhaus-71ca9ab-960.webp` | 960x720 | 1,17 |
| baumkontrolle | `baumkontrolle-warnschild-20261003.jpg` | 1536x1024 | 1,67 |
| balkonkastenbepflanzung | `balkonkastenbepflanzung-hero (Hochkant-Original)` | 800x1067 | 1,74 |
2. **Baumkontrolle-Textbereich:** Drei Leistungsblöcke und ein Ablaufdiagramm passen nicht ins
   Zwei-Spalten-Raster. Er bleibt in der bisherigen Spalte; eine eigene Lösung wäre ein Folge-AP.
3. **Lange Titelwörter:** Acht Titel brechen bei großen Bildschirmen (1920) und teils bei 901 px mit
   Bindestrich um, z. B. „Vorgarten-/gestaltung“. Die Größe bleibt dafür wie auf der Startseite.
