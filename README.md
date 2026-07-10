# Maik Rohdich Garten- und Landschaftsbau – Website

Moderne, statische Startseite. Kein Build-Schritt notwendig.

## Lokal vorschauen
```bash
python3 -m http.server 8080
# http://localhost:8080
```

## Struktur
- `index.html` – komplette Startseite (12 Sektionen lt. Spec)
- `privatkunden/index.html` – Privatkunden-Unterseite (Vorher-Nachher-Slider, Leistungen, Ablauf, FAQ, Anfrage-Formular; eigenes Service-/FAQ-/Breadcrumb-JSON-LD)
- `assets/css/styles.css` – Design-System (Brand: #315200 oliv, #FFED00 gelb, #EB6C44 koralle)
- `assets/js/main.js` – Scroll-Reveal, Header, FAQ, Anrufen-Popover
- `assets/img/` – Bilder & Logo (Swap-Slot)
- `assets/video/hero.mp4` – optional, Hero-Hintergrundvideo (Standbild ist Fallback)

## Vom Kunden noch nachzuliefern
- Original-Logo → `assets/img/logo/logo.svg` (Platzhalter aktuell als SVG-Marke eingebaut)
- Echtes Hero-Foto/-Video → `assets/img/hero/hero.jpg` + `assets/video/hero.mp4`
- Echte Projektfotos für die 3 Projektkarten
- Weitere echte Google-Review-Auszüge (eine ist bereits eingebunden, 61 Bewertungen bestätigt)
- Telefonnummern (aktuell Demo-Werte: Mobil `0171 / 234 56 78`, Festnetz `02323 / 12 34 56 7`) – vor Live-Gang durch echte Nummern ersetzen
- Impressum + Datenschutz-Inhalte
