# Maik Rohdich Garten- und Landschaftsbau – Website

Moderne, statische Startseite. Kein Build-Schritt notwendig.

## Lokal vorschauen
```bash
npm ci
npm run preview
# http://127.0.0.1:8080/ – auch im WLAN auf Port 8080 erreichbar
```

Die Vorschau bedient auch `/api/anfrage`. Für den Testversand `.env.example`
als `.env.local` kopieren und `EMPFAENGER` setzen. Bei `MAIL_TRANSPORT=formsubmit`
den Aktivierungslink im Empfängerpostfach einmal bestätigen. Die lokale
Testadresse steht ausschließlich in der ignorierten `.env.local`; diese Datei
wird nicht an Browser ausgeliefert. Nach Änderungen an der Konfiguration den
Vorschauserver neu starten.

Alternativ mit `MAIL_TRANSPORT=smtp` die SMTP-Felder aus `.env.example` ausfüllen.
Im Deployment werden diese Werte als Umgebungsvariablen gesetzt. Die Fotoauswahl
zeigt bis zu sechs Vorschauen, erlaubt das Nachreichen und einzelne Entfernen
und sendet ausschließlich verkleinerte JPEGs ohne die ursprünglichen Metadaten.
FormSubmit ist für den lokalen Test eingerichtet; der SMTP-Versand bleibt für
das eigene Postfach verfügbar. Der Testdienst speichert Formulareingaben laut
[Dokumentation](https://formsubmit.co/documentation) bis zu 30 Tage.

Name, Telefonnummer oder E-Mail-Adresse und eine kurze Beschreibung sind
Pflichtangaben. Fehlende oder ungültige Angaben werden vor dem Senden am Feld
und in einer verlinkten Zusammenfassung erklärt. Korrigierte Hinweise verschwinden
beim Ausfüllen; Texte und Fotos bleiben bei Fehlern erhalten. Der Empfangs-Endpunkt
prüft dieselben Angaben und liefert genaue Fehler zu Feldern und Anhängen zurück.

`npm test` prüft Fotoauswahl, Entfernen, Abbrechen, Feldvalidierung, Fehlerfälle
und die Übergabe an beide Versandwege ohne echte E-Mails zu versenden.

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
- Weitere echte Google-Review-Auszüge (eine ist bereits eingebunden, 68 Bewertungen bestätigt)
- Telefonnummern (aktuell Demo-Werte: Mobil `0171 / 234 56 78`, Festnetz `02323 / 12 34 56 7`) – vor Live-Gang durch echte Nummern ersetzen
- Impressum + Datenschutz-Inhalte
