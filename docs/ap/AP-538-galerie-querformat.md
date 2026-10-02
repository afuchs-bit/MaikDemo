# AP-538 — Galerie im Querformat: Umschalter mittig, Projekte kleiner

Stand 02.10.2026 · Branch `codex/homepage-review` · Seite `/projekte/` · nur 481–900 px.
Hochformat (≤ 480 px) und Desktop (≥ 901 px) bleiben unverändert.

## Auftrag

Ansage des Auftraggebers, geprüft auf dem Handy quer:

- Der Umschalter „Bildergalerie / Projekte mit Details“ ist nicht zentriert.
- Die Projekte müssen viel kleiner sein.

## Messwerte

| | vorher | nachher |
|---|---|---|
| Umschalter bei 874 px | 540 px, x 35 (links) | 540 px, x 167 (mittig) |
| Umschalter bei 667 px | x 27 | x 64 (mittig) |
| Projektkarten bei 874 px | 1 Spalte, 804 × 812 | 3 Spalten, 253 × 419–459, letzte Reihe (2) mittig |
| Projektkarten bei 667 px | 1 Spalte | 2 Spalten, 296 × 451–471, letzte Karte mittig |

Ursache beim Umschalter: Bis 900 px gilt nur `max-width: 540px`. Die Zentrierung des Desktops (`justify-self: center`, AP-521) greift dort nicht.

## Umsetzung

- `assets/css/projekte.css`, neuer Block am Dateiende:
  - `@media (min-width: 481px) and (max-width: 900px)`: Umschalter mit `margin-inline: auto`; das Projektraster wird wie am Desktop (AP-521) ein Flex-Umbruch mit mittiger letzter Reihe, zwei Spalten, Abstand 22 px.
  - `@media (min-width: 741px) and (max-width: 900px)`: drei Spalten, wie die Bildergalerie in diesem Bereich.
  - Unter 741 px bleibt es bei zwei Spalten. Drei Spalten wären bei 667 px nur 190 px breit, die Titel liefen über 4–5 Zeilen.
  - `:not([hidden])` bleibt Pflicht, siehe AP-521.
- `projekte/index.html`: `projekte.css?v=20261001a` → `?v=20261002a`. Die Datei lädt nur diese Seite.

## Prüfung

- Stilvergleich über `main`, vorher gegen nachher, bei 402 px (511 Elemente) und 1280 px (510 Elemente): jeweils **0 Abweichungen**.
- Bei 874 und 667 px in beiden Ansichten: Die jeweils verborgene Ansicht bleibt verborgen (`display: none`).
- Aufnahme der Projekt-Ansicht bei 874 px ohne Konsolen- oder Netzfehler.
