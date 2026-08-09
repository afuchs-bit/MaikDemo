# Generierte Bild- & Video-Assets

Diese Medien wurden über Higgsfield generiert und liegen aktuell auf einem CloudFront-CDN.
**Wichtig:** CDN-URLs können sich ändern – vor Live-Gang lokal sichern und in `assets/img/` / `assets/video/` legen.

## Hero
- **Bild (16:9, 2048×1152):** `https://d8j0ntlcm91z4.cloudfront.net/user_3FJEDA6UDaxninowAcaUWRzghT2/hf_20260622_060301_09419ab7-e3c1-4af3-b7a2-fa17bbd9ca87.png`
  → speichern als `assets/img/hero/hero.png`
- **Video (16:9, 4s, 720p, MP4):** `https://d8j0ntlcm91z4.cloudfront.net/user_3FJEDA6UDaxninowAcaUWRzghT2/hf_20260622_060910_79733f0c-ce85-436f-80ae-361b74394d07.mp4`
  → speichern als `assets/video/hero.mp4`

## Zielgruppenweiche

Die Startseiten-Weiche liegt seit AP-82 im Hero und nutzt **echte Fotos**:
`assets/img/hero/hero-pool.*` (Privat) und `assets/img/hero/gate-gewerbe.*` (Gewerbe).

Die alte Sektion „Wählen Sie Ihren Bereich" wurde mit AP-88 entfernt, ihre beiden
KI-Bilder mit AP-90 aus dem Repo gelöscht (Derivate und `SOURCES`-Einträge in
`build-images.mjs`). Die Originale liegen weiterhin im gitignoreten
`assets/img/_src/`. Nicht mehr genutzt:
- **Privatkunden (16:9):** `https://d8j0ntlcm91z4.cloudfront.net/user_3FJEDA6UDaxninowAcaUWRzghT2/hf_20260622_061016_a7688c52-a5c8-4ee9-9465-df631ce0ef11.png`
  → früher `assets/img/split/split-private.*`
- **Gewerbekunden (16:9):** `https://d8j0ntlcm91z4.cloudfront.net/user_3FJEDA6UDaxninowAcaUWRzghT2/hf_20260622_061114_302176ae-ad89-48ef-b1ee-dcd3db4db7fa.png`
  → früher `assets/img/hero/hero-gewerbe-aussenanlagen.*`

## Persönliche Maik-Sektion (#ueber)
Statt des früheren KI-Porträts jetzt eine 3er-Foto-Collage (randlose Karten mit
großem Eckenradius) aus echten Fotos des Betriebs (aus Datenschutzgründen bewusst
gewählt). Lokal gespeichert unter `assets/img/ueber/` (aus HEIC via `sips` nach
JPG konvertiert, Langseite 1400px):
- `ueber-1.jpg` – angelegte Gartenteichanlage mit Palmen (Querformat)
- `ueber-2.jpg` – Minibagger + Bohrhammer bei Abbrucharbeiten (Querformat)
- `ueber-3.jpg` – Findling wird mit Bagger versetzt (Querformat, gedreht)

Früheres, nicht mehr genutztes KI-Bild:
- **Beratungs-Detail (3:4, hochkant):** `https://d8j0ntlcm91z4.cloudfront.net/user_3FJEDA6UDaxninowAcaUWRzghT2/hf_20260622_061146_543ad50e-dd56-484a-947d-b8dd581a3541.png`
  → früher `assets/img/maik.png`

## Projekte
- **Vorgarten Herne (4:3):** `https://d8j0ntlcm91z4.cloudfront.net/user_3FJEDA6UDaxninowAcaUWRzghT2/hf_20260622_061235_3c977f2c-9a0f-42f2-9b53-e578cf8f9484.png`
  → `assets/img/projects/herne-vorgarten.png`
- **Teich Bochum (4:3):** `https://d8j0ntlcm91z4.cloudfront.net/user_3FJEDA6UDaxninowAcaUWRzghT2/hf_20260622_061214_8416af8e-1ecb-4039-815b-bb74908b7ac9.png`
  → `assets/img/projects/bochum-teich.png`
- **Gewerbe Recklinghausen (4:3):** `https://d8j0ntlcm91z4.cloudfront.net/user_3FJEDA6UDaxninowAcaUWRzghT2/hf_20260622_061303_bcbbec22-3158-4220-a6f3-c4993071ca17.png`
  → `assets/img/projects/recklinghausen.png`

## Privatkunden-Unterseite (`privatkunden/`)
- **Hero-Hintergrund:** aktuell das Zielgruppenweiche-Privat-Bild (CDN, s. o.) – vor Live-Gang durch echtes Gartenfoto ersetzen (`assets/img/privat/hero.jpg`).
- **Vorher-Nachher-Slider:** aktuell **Demo-Platzhalter** – beide Ebenen nutzen dasselbe Foto (`ueber-1.jpg` / `ueber-3.jpg`), die „Vorher“-Ebene wird per CSS-Filter entsättigt (`.ba-before img` in `styles.css`).
  **Nachzuliefern:** echte Vorher/Nachher-Fotopaare (gleiche Perspektive!), ablegen als
  `assets/img/privat/ba-1-vorher.jpg` + `ba-1-nachher.jpg` (usw.), dann in `privatkunden/index.html` die `<img>`-Quellen tauschen und den CSS-Platzhalter-Filter entfernen.
- **Projektkarten auf `/privatkunden/` (`#projekte-privat`):** Cover kommen aus
  `data/projekte-index.json` (die 3 neuesten Projekte mit `kundentyp: privat`), gerendert von
  `assets/js/projekte-privat.js`. Statisches Fallback-Markup mit denselben Bildern bleibt
  sichtbar, falls der Index nicht lädt.
- **Leistungskarten (`#leistungen`):** die 8 Karten zeigen im aufgeklappten Panel ein Foto.
  **Nachzuliefern** – Dateien einfach unter diesen Pfaden ablegen, es ist **keine Code-Änderung nötig**
  (die Pfade stehen als `--svc-img` je `[data-svc]` in `styles.css`; fehlt eine Datei, greift automatisch
  die Schraffur. Achtung: im CSS sind sie als `../img/leistungen/…` notiert, weil relative URLs gegen
  `assets/css/` aufgelöst werden – gemeint ist immer `assets/img/leistungen/`):
  `assets/img/leistungen/gartengestaltung.jpg`, `vorgarten.jpg`, `teich.jpg`, `baumarbeiten.jpg`,
  `dachbegruenung.jpg`, `gartenpflege.jpg`, `palmen.jpg`, `pool.jpg`
  Querformat, mind. ca. 800 × 600 px; das Panel legt einen dunklen Verlauf darüber, damit der Text lesbar bleibt.

## Nach lokalem Sichern: Pfade in HTML/CSS ersetzen
```bash
# Beispiel: alle Cloudfront-URLs durch lokale Pfade ersetzen
sed -i 's|https://d8j0ntlcm91z4.cloudfront.net/user_3FJEDA6UDaxninowAcaUWRzghT2/hf_20260622_060301_09419ab7[^"]*\.png|assets/img/hero/hero.png|g' index.html assets/css/styles.css
# (für jedes Asset analog)
```
