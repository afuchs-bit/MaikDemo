# Generierte Bild- & Video-Assets

Diese Medien wurden über Higgsfield generiert und liegen aktuell auf einem CloudFront-CDN.
**Wichtig:** CDN-URLs können sich ändern – vor Live-Gang lokal sichern und in `assets/img/` / `assets/video/` legen.

## Homepage-Schrift

- `assets/fonts/baloo2-700-latin.woff2` – offizieller Latin-Schnitt von
  Baloo 2, Gewicht 700. Quelle: [Google Fonts / Baloo 2](https://github.com/google/fonts/tree/main/ofl/baloo2),
  abgerufen am 02.09.2026. Die Schrift wird ausschließlich für die mobile
  Homepage-H1 bis 900 px verwendet. SHA-256:
  `8E7FFC9B993AA8CAA89BCAB81E103C9EB2DA4E3E042F37B7A5115D0DDBFF12C0`.
- `assets/fonts/baloo2-OFL.txt` – zugehörige SIL Open Font License 1.1 aus dem
  [offiziellen Google-Fonts-Repository](https://github.com/google/fonts/blob/main/ofl/baloo2/OFL.txt),
  abgerufen am 02.09.2026.

- `assets/fonts/nunito-latin.woff2` – offizieller variabler Latin-Schnitt von
  Nunito, normal, Gewichte 200–1000. Quelle: [Google Fonts / Nunito](https://github.com/google/fonts/tree/main/ofl/nunito),
  abgerufen am 29.08.2026. SHA-256:
  `BA344451EAB25B217A165363B1982048A5E5830A0DAF36577973955A04CAC793`.
- `assets/fonts/nunito-italic-latin.woff2` – offizieller variabler Latin-Schnitt
  von Nunito, kursiv, Gewichte 200–1000. Quelle und Abrufdatum wie oben. SHA-256:
  `6CFCC3786D5BA3B5C3A41797F95272E57F4290CCBD283A4BFD0033A3D857E64C`.
- `assets/fonts/nunito-OFL.txt` – zugehörige SIL Open Font License 1.1 aus dem
  [offiziellen Google-Fonts-Repository](https://github.com/google/fonts/blob/main/ofl/nunito/OFL.txt),
  abgerufen am 29.08.2026. Die Schrift wird ausschließlich auf der Homepage
  eingebunden; das grafische Logo und die Typografie der Unterseiten bleiben
  unverändert.

## Mobile Header-Symbole

- `assets/img/logo/maik-rohdich-logo-mobile-horizontal-balanced.png` – mobile
  640 × 180 px große Logoableitung aus dem vorhandenen Originallogo. Die Blüte
  wurde pixelgenau aus dem bisherigen Mobilasset übernommen; die vollständige
  Wortmarke `MAIK ROHDICH` wurde mechanisch aus dem Originallogo freigestellt,
  mit transparenten Sicherheitskanten neu ausbalanciert und nicht generativ
  verändert. Die gelben Zusatzzeilen sind nicht enthalten.
- `assets/img/icons/phone-header-mobile.png` – mechanisch aus der vom Auftraggeber
  gelieferten Datei `Design ohne Titel.png` freigestellt, quadratisch beschnitten und
  einheitlich auf das Wortmarken-Grün `#56E607` gesetzt. Die Form wurde nicht verändert.
- `assets/img/icons/whatsapp-glyph-white.svg` – unveränderte Datei
  `Digital_Glyph_White_RGB_2026.svg` aus dem offiziellen
  [WhatsApp Brand Resource Center](https://www.meta.com/brand/resources/whatsapp/whatsapp-brand/),
  abgerufen am 25.08.2026. SHA-256:
  `7FB054C0F4BEA644B4A4A014D6D8581AAD7E6DCB639049D17A578DC44F8E6FD4`.

## Hero
- `assets/img/icons/rohdich-standort.svg` – Pin-Kontur des vom Auftraggeber
  bereitgestellten Standortzeichens. Das frühere abstrahierte Innenmotiv wurde
  für die Kombination mit der echten Markenblüte entfernt. SHA-256:
  `45E1F44021C65C6E6BBF8337D386775AFFA8BE0833D94F027179BB85A93735A3`.
- `assets/img/icons/rohdich-blume.png` – 160 × 160 px große, transparente
  Einzelblüte, mechanisch aus
  `assets/img/logo/maik-rohdich-logo-mobile-horizontal-balanced.png` isoliert.
  Form und Farben wurden nicht generativ verändert. SHA-256:
  `6D8489157F6CBA0265A864BC55E78AAB6AAE5458BF4A1D6814AA0099354397DA`.
- **Foto im oberen Homepage-Hero:** Aus der vom Auftraggeber bereitgestellten
  Datei `maik-rohdich-hero-aufschrift-kraeftigere-farben.png` mechanisch und ohne Beschnitt,
  Filter oder generative Veränderung abgeleitet. Original: 1023 × 1537 px,
  SHA-256 `556C87DA184AD11F23FCB71305BE6DBD47A5E36BA70CE0E520873EB7CCADA1C1`.
  Für die maximal verfügbare Auflösung wird das native Format als AVIF und WebP
  unter `assets/img/hero/hero-fahrzeug-palmengarten-v8-1023.{avif,webp}` geladen.
  Mobil wird die originalgetreuere WebP-Neukodierung
  `assets/img/hero/hero-fahrzeug-palmengarten-v9-mobile-q95.webp` bevorzugt
  (Qualität 95, Encoder-Methode 6, unveränderte 1023 × 1537 px). Für
  hochauflösende Mobilgeräte steht zusätzlich
  `assets/img/hero/hero-fahrzeug-palmengarten-v10-mobile-2046-q92.webp` bereit:
  deterministisches 2×-Lanczos-Upscaling auf 2046 × 3074 px, milde
  Unsharp-Mask-Schärfung (Radius 1,2; Stärke 35 %; Schwellenwert 3),
  WebP-Qualität 92 und Encoder-Methode 6. SHA-256:
  `2C176EE7BD22E1B3169EE23CED611062ED4E29D8C3EA97EE4AEF72BABCA4FEB7`.
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
