# AP-552 — Scrollsprung beim Drehen und Scrollen beheben (02.10.2026)

Gemeldet wurde ein wiederholter Rücksprung nach oben auf dem iPhone 16 Pro
mit Safari, nachdem die Startseite ins Querformat gedreht und gescrollt wurde.
Der Auslöser ließ sich mit der vorherigen Startseitenfassung nachstellen:
Bei einer Größenänderung ruft der automatische Refresh von GSAP ScrollTrigger
vorübergehend `window.scrollTo(0, 0)` auf und stellt danach die vorige Position
wieder her. Browserleisten ändern beim Scrollen die sichtbare Fensterhöhe;
eine solche Neuberechnung ist für die einmaligen Einblendungen unnötig.

## Umsetzung

- Die Startseite lädt ScrollTrigger nicht mehr. GSAP selbst bleibt für die
  vorhandenen Einblendbewegungen erhalten; weitere GSAP-Erweiterungen sind
  nicht erforderlich.
- Die zentrale Reveal-Registrierung in `assets/js/main.js` nutzt native
  IntersectionObserver. Animationen starten einmal beim Erreichen ihres
  bisherigen Eintrittspunkts: allgemein bei 88 % der sichtbaren Höhe,
  das Willkommensfoto 72 px vor dem unteren Rand. Beim direkten Anspringen
  einer tieferen Sektion werden bereits passierte Elemente ebenfalls freigegeben.
- Bei Höhenwechseln wird nur der Beobachtungsbereich noch nicht gestarteter
  Reveals aktualisiert. Dieser Vorgang verändert weder die Scrollposition
  noch bereits abgeschlossene Animationen. Bewegungsdauer, Kurve, Verzögerungen,
  der eigene Willkommensstempel und die dynamische Registrierung bleiben erhalten.
- Ohne GSAP greift weiterhin die CSS-Einblendung. Bei reduzierter Bewegung
  oder fehlendem IntersectionObserver gibt die zentrale Reveal-Logik Inhalte
  unmittelbar frei.
- JavaScript-Version `20261002c` auf allen 51 veröffentlichten Einbindungen
  nachgeführt. Der CSS-Kommentar zur Auslösung wurde berichtigt, mit zentraler
  CSS-Version `20261002n`. Keine Layout- oder Farbregeln geändert.

## Prüfung

- Instrumentierte Vorher-/Nachher-Fassungen der lokalen Startseite protokollieren
  Scrollereignisse, Größenwechsel und programmatische `scrollTo`-Aufrufe.
  Hochkant 390×844, Wechsel auf 874×402, Scrollen auf 804 px, Höhenwechsel auf
  350 px, weiteres Scrollen auf 1154 px und Rückwechsel auf 402 px:
  Vorher setzt ScrollTrigger die Position während seines Refresh auf 0 und
  stellt anschließend 1154 px wieder her. Nachher keine programmatischen
  `scrollTo`-Aufrufe, die Position bleibt bei 1154 px.
- Weitere Höhenwechsel auf 320 und 450 px erhalten ebenfalls 1154 px.
  Nach weiterem Scrollen bleibt die Position bei 2504 px auch beim erneuten
  Wechsel 874×450 → 390×844 → 874×402 erhalten. Weiter unten bei 3710 px
  lösen Höhenwechsel 402 → 350 → 402 keinen Rücksprung aus.
- In der tatsächlichen Vorschau mit `#ueber-title` bleibt nach eigenem Scrollen
  die Position bei 2957,5 px durch Höhenwechsel 402 → 350 → 402 erhalten.
  Der bewusste initiale Ankersprung funktioniert weiterhin.
- Willkommensfoto, Text, Kennzahlen, Über-uns-Inhalte und tieferer Anfragebereich
  blenden beim normalen Scrollen ein. Desktop bei 1440×900 geprüft: Foto,
  Text und Willkommensstempel erreichen nach abgeschlossener Animation
  Deckkraft 1. Querformat visuell abgenommen.
- Lokale Prüffassung ohne GSAP: sichtbare Inhalte erreichen per CSS Deckkraft 1.
  Erzwungene JavaScript-Präferenz für reduzierte Bewegung: 24 von 24 Reveals
  sofort freigegeben. Ohne IntersectionObserver gibt die zentrale Reveal-Logik
  ebenfalls alle 24 Elemente frei; das separate bestehende Galerie-Skript
  benötigt diese API weiterhin. Der künstliche No-Observer-Test erzeugt dort
  einen Fehler, der nicht zu dieser Scrollkorrektur gehört.
- Größen- und Orientierungswechsel wurden im In-App-Browser simuliert.
  Kein physischer iPhone-/Safari-Test. Die echte Safari-Adressleistenanimation
  und Touch-Dynamik sind durch diese Simulation nicht vollständig abgedeckt.
- JavaScript-Syntax und `git diff --check` erfolgreich. Lokale Vorschau liefert
  `main.js`, `styles.css` und `index.html` bytegleich zu den bearbeiteten Dateien.
  Keine ScrollTrigger-Script-Tags in veröffentlichten Seiten. Zweiter
  Header-Generatorlauf: 0 Änderungen. Branch `codex/homepage-review`.
- Server auf `*:8080`; WLAN-Vorschau unter `http://192.168.1.188:8080/` erreichbar.
  Kein Commit oder Push.

Prüffassungen, Scrollprotokolle und Screenshot:
`tmp/scroll-resize-20261002/`.

Grundlagen: [GSAP Refresh](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.refresh%28%29/),
[GSAP Resize-Konfiguration](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.config%28%29/),
[IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API).
