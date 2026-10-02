# AP-540 — Über uns optisch zentrieren und Videorahmen entfernen (01.10.2026)

Die Screenshots `IMG_5260.PNG` und `IMG_5261.PNG` bestätigen die korrigierte
Mediengröße aus AP-539. Die kurze Aussagenliste steht jedoch am linken Rand
ihrer breiten Spalte; rechts bleibt dadurch wesentlich mehr ungenutzter Raum.
Das Raster ist geometrisch zentriert, seine Inhalte wirken dadurch linksbetont.
Außerdem tragen Video-Border und Kachelschatten eine sichtbare Kontur ins Motiv.

Desktop ab 901 px und Handy-Querformat erhalten gemeinsam folgende Korrektur:

- Die drei Aussagen behalten ihre volle rechte Rasterfläche und gleichmäßige
  vertikale Verteilung. Ihre Zeilen sind nun als gemeinsamer Block mit höchstens
  17,5 em Breite in der Spalte zentriert. `text-wrap: balance` bildet ausgewogene
  Umbrüche ohne feste Zeilenumbrüche oder Änderungen am Wortlaut.
- Die Beschriftung zentriert sich zum gesamten Bild einschließlich der 8 px
  rechts überstehenden Markenblume. Ihre Mitte liegt damit 4 px weiter rechts.
  Der Hinweis und der Button bleiben in der gemeinsamen Abschlusszeile vertikal
  ausgerichtet. Es gibt keinen Transform auf der gesamten Sektion und keine
  Änderung an ihren Außenrändern oder den Mediengrößen.
- Die 1-px-Kachelkontur und der mehrteilige Kachelschatten des Videos entfallen.
  Seine Hintergrundfarbe entspricht der Sektion, sodass der minimale Freiraum
  zwischen nativem 720:544-Film und mobilem 4:3-Rahmen unauffällig bleibt.
  Vollständiges Motiv, Rundungen, Blume, Video und Einblendungen bleiben erhalten.

Die bestehende mobile Hochkantdarstellung bleibt unverändert. Keine Änderungen
an HTML-Struktur, Assets, JavaScript, Navigation oder der Button-Familie.
CSS-Version zentral `20261001p`, JavaScript weiterhin `20261001c`.

## Prüfung

- Querformat 568×320 und 667×375 ohne Aussparungen; 844×390, 874×402 und
  900×420 mit vollständig nachgebildeten Safe Areas von 62 px je Seite,
  einschließlich der allgemeinen Container-Innenränder aus AP-539.
- Desktop 901, 1024, 1440, 1920 und 2560 px: alle drei Aussagen haben dieselbe
  horizontale Mitte wie die rechte Spalte, Rundungsabweichung unter 0,01 px.
  Keine Überschneidung, Abschneidung oder horizontaler Überlauf.
- Beschriftung in allen zweispaltigen Fällen 4 px optisch nach rechts versetzt;
  vertikale Mitte von Beschriftung und Button unverändert gemeinsam, Abweichung
  unter 0,01 px ohne die bestehende Button-Pulsphase.
- Video-Border überall 0 px, `box-shadow: none`. Mediengrößen unverändert,
  mobiler 4:3-Rahmen und nativer Desktop-Rahmen ohne Motivbeschnitt.
- 437×201 mit nachgebildeten Aussparungen: vorhandener gestapelter Fallback
  vollständig lesbar und ohne horizontalen Überlauf. Dies prüft CSS-Reflow,
  keinen tatsächlichen Browser-Zoom.
- Hochkant 320, 390, 430, 768 und 900 px vor/nachher: identische Größen,
  Positionen, Schriftgrößen, Abstände und Video-Border/-Schatten. Eine dynamische
  Hover-Schattenphase am unveränderten CTA ist aus dem Geometrievergleich
  ausgenommen; andere gemessene Eigenschaften stimmen überein.
- Visuelle Abnahme des realen Desktop-Aufbaus sowie der mobilen Quelle mit
  vollständiger Safe-Area-Simulation. Die mobile Aufnahme bei 874×560 zeigt
  Überschrift, Bild, Aussagen und Abschluss gemeinsam. Die zusätzliche Höhe
  verändert ihre Breiten nicht. Kein direkter Zugriff auf das physische iPhone.
- Zweiter Generatorlauf: 0 Änderungen; `git diff --check` erfolgreich.
  Netzwerk-Vorschau liefert dieselben aktuellen CSS-Bytes wie das Repository.
  Kein Commit oder Push.

Messwerte und visuelle Abnahme: `tmp/about-centering-20261001/`.
