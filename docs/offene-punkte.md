# Offene Punkte

Fehlende Fakten, die der Auftraggeber nachliefert. Jeder Eintrag ist im Quelltext als
`<!-- OFFEN: … -->` markiert. **Keine dieser Lücken blockiert ein Arbeitspaket** — Texte sind
so formuliert, dass sie auch ohne den Wert vollständig und richtig sind.

Sobald ein Wert vorliegt: in `content/stammdaten.json` eintragen (AP-03), den
`<!-- OFFEN -->`-Kommentar auflösen, Zeile hier streichen.

**Stand:** 21.07.2026

## Kontaktdaten

| Wert | Aktueller Zustand | Fundstellen | AP |
|---|---|---|---|
| Echte Mobilnummer | Demo `0171 / 234 56 78` | `index.html`, `privatkunden/`, `gewerbekunden/` | AP-03 |
| Echte Festnetznummer | Demo `02323 / 12 34 56 7` — bleibt laut Absprache erhalten | dieselben | AP-03 |
| Echte WhatsApp-Nummer | Demo `491712345678`, 39 Vorkommen | alle Seiten | AP-03 |
| E-Mail-Adresse | `info@rohdich.de` — noch zu bestätigen | Footer, Kontaktbereich | AP-03 |

## Standort und Profile

| Wert | Fundstellen | AP |
|---|---|---|
| Geokoordinaten Hülsstraße 5, 44625 Herne | JSON-LD `geo` auf der Startseite | AP-21 |
| Google Place ID | `content/stammdaten.json` | AP-20 |
| Google-Unternehmensprofil-URL | JSON-LD `sameAs` | AP-21 |
| Social-Media-Profile | JSON-LD `sameAs` | AP-21 |
| Echtes Logo als `assets/img/logo/logo.svg` | derzeit nur `favicon.svg` vorhanden | AP-06 / AP-21 |

## Fachliche Angaben

| Wert | Fundstellen | AP |
|---|---|---|
| Zertifizierungsstandard der Baumkontrolle (FLL o. a.) | `gewerbekunden/index.html` | AP-13 |
| Reaktionszeit Sturmnotdienst | `gewerbekunden/index.html` | AP-13 |
| Betriebshaftpflicht: Versicherer und Deckungssumme | `gewerbekunden/index.html` | AP-13 |
| Zwei gewerbliche Referenzobjekte inkl. Ort und Objektart | `gewerbekunden/index.html` | AP-13 / AP-23 |
| Vertragslaufzeiten und Reaktionszeiten im Gewerbebereich | `gewerbekunden/index.html` | AP-13 / AP-23 |
| Details zum Partnerbetrieb in Bochum | noch ohne Fundstelle | AP-23 |

## Rechtstexte

| Wert | Fundstellen | AP |
|---|---|---|
| Impressum (Pflichtangaben vom Anbieter: Kontakt, USt-/Steuernr. usw.) | `content/rechtstexte/impressum.body.html` | AP-11 |
| Datenschutzerklärung (Volltext vom Anbieter) | `content/rechtstexte/datenschutz.body.html` | AP-11 |
