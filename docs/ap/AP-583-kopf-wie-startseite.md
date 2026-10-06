# AP-583 — Desktop-Kopf der Unterseiten wie auf der Startseite

## Anlass

Ansage des Auftraggebers am 06.10.2026, nur für den Desktop:

1. Wechselt man von der Startseite zu „Über uns“, verschiebt sich das Logo im Kopf. Es soll
   überall so stehen wie auf der Startseite, geprüft auf allen Unterseiten.
2. Auf den Leistungsseiten läuft der Kopf beim Scrollen nicht mit. Er soll oben sichtbar
   bleiben.

## Befund (Chrome 154, headless)

Die Startseite hat ab 901 px einen eigenen Kopf (`home-dark.css`, „Der bestehende
Desktop-Kopf schwebt …“). Er steht fest (`fixed`), oben mit 20 px Luft, und ist eine
abgerundete Karte mit 16 px Innenrand. Ab 12 px Scrollweg (`.is-scrolled`, `main.js`)
wird er zur Leiste. Die Unterseiten hatten die schlichte Leiste, `sticky`, ohne diese
Abstände.

| Breite | Logo Startseite (x / y) | Logo Unterseiten vorher (x / y) |
|---|---|---|
| 901 | 36 / 26 | 20 / 6 |
| 1280 | 44,5 / 26 | 28,5 / 6 |
| 1440 | 48 / 26 | 32 / 6 |
| 1920 | 176 / 26 | 160 / 6 |

Auf den Leistungsseiten ist der Kopf `sticky`, stand nach `scrollTo(900)` aber bei
−900 px. Ursache: `html.lpv2-root` und `.lpv2-page` haben `overflow-x:hidden`
(`leistung-mobile.css`). Damit wird `body` ein eigener Scrollbereich, und `sticky` bezieht
sich auf diesen statt auf das Fenster. `home-dark.css` laden die Leistungsseiten nicht.

## Umsetzung

**`assets/css/header-home.css`, Block ab 901 px.** Die Werte der Startseite gelten jetzt
für alle Seiten:

- **Kopf:** `.site-header` mit `position: fixed; inset: 0 0 auto; padding-top: 20px`,
  transparenter Grund und Rand.
  - Die Übergänge betreffen nur Farbe und Rand, wie auf der Startseite. Die
    `padding`-Transition aus `styles.css` fällt damit weg.
  - Nach dem Scrollen (`.is-scrolled`): `padding-top: 0`, Grund `#171916`, Rand
    `var(--line)`.
- **Innenkarte:** In `.site-header > .header-inner.container` wird `padding: 6px 0` zu
  `6px 16px`. Dazu kommen Grund `#171916`, `border-radius: 20px` und der Schatten der
  Startseite. Gescrollt gilt `border-radius: 0` ohne Schatten.
- **Platz für den Kopf:** `body { padding-top: 112px; }`, das sind 20 px Luft + 91 px Karte
  + 1 px Rand.
  - Der Wert ist fest und hängt nicht an `--header-h`. `main.js` setzt diese Variable
    beim Scrollen auf 92 px, und der Inhalt würde sonst springen.
- **Reduzierte Bewegung:** ohne Übergang.

**`assets/css/home-dark.css`:** `html.home-theme-dark body { padding-top: 0; }` ab
901 px. Die Startseite legt den Kopf weiter über ihren Einstieg.

**Wirkung**

- Kopf und Logo sind auf allen Seiten gleich.
- Der Kopf bleibt überall oben sichtbar, auch auf den Leistungsseiten. Die
  `overflow`-Regeln bleiben unangetastet.
- Der Inhalt der Unterseiten beginnt oben 20 px tiefer, der Abstand zur Kopfkarte bleibt
  damit wie vorher.
- Bis 900 px ändert sich nichts.

**Cache-Busting:** `CSS_VERSION` steht auf `20261006a`. Gebaut wird in der Reihenfolge
`build-leistungen`, `build-rechtstexte` und zuletzt `build-headers`.
- **Warum diese Reihenfolge:** `build-leistungen` schreibt `privat-form.css` mit der
  allgemeinen Version. Nur ein abschließender Header-Lauf stellt den eigenen Schlüssel
  `PRIVATE_FORM_CSS_VERSION` wieder her.
- **Folgeläufe:** Ein zweiter Lauf ändert nichts.

## Prüfung (Chrome 154, headless)

**Alle 51 Seiten mit Kopf bei 1440 × 900**

- Logo oben überall 48/26 bei 256 × 79, wie auf der Startseite.
- Nach `scrollTo(900)` steht das Logo bei 48/6, der Kopf bei top 0, `fixed`, 112 px hoch.
- Keine Abweichung, auch nicht auf den 38 Leistungsseiten.

**Stichprobe bei 901, 1280 und 1920 px**

Geprüft auf Startseite, Über uns, Kontakt, Projektseite, Baumpflege und 404. Das Logo
steht überall gleich: 36/26, 44,5/26 und 176/26. Die 404-Seite lässt sich bei 1920 × 1080
nicht scrollen und bleibt deshalb in der Kartenform.

**Startseite bei 1440 px**

Pixelgleich zum Stand vorher. Abweichende Scheiben kamen genauso zwischen zwei
Referenzaufnahmen vor, das sind Karussell und Animationen. Ein Ausreißer war in der
zweiten Aufnahme identisch.

**Handy und Tablet bei 375, 402 und 768 px**

Pixelgleich auf Startseite, Über uns, Kontakt, Galerie, Impressum, Baumpflege,
Balkonkasten, Projektseite und 404. Die Ausreißer an Animationsstellen sind zwischen
zwei Referenzaufnahmen gleich.

**Nebenwirkungen**

- Das Leistungs-Untermenü liegt wie auf der Startseite: oben bei 91 px, leicht über der
  Kartenkante.
- Das Telefon-Popover öffnet unter dem Kopf.
- Der Ankersprung `#anfrage` auf Baumpflege landet 4 px unter dem Kopf.
- Kein Überlauf, keine Fehler in der Konsole.
