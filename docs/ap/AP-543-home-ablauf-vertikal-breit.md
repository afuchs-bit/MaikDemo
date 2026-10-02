# AP-543 – Projektablauf vertikal und breit

## Anlass

Die horizontale Scrollstrecke aus AP-536 bis AP-542 passte im iPhone-Querformat nicht zuverlässig in die sichtbare Fläche. Karten und Bilder wirkten seitlich versetzt; Bilder wurden durch die hochformatige Karte beschnitten. Außerdem sollte die Desktop-Version wieder normal von oben nach unten lesbar sein.

## Umsetzung

- Desktop ab 901 px und mobile Querformate bis 900 px verwenden einen normalen vertikalen Seitenfluss ohne Pinning und ohne horizontalen Scrollbereich.
- Jede Station ist eine breite, mittig ausgerichtete Karte mit vollständigem Bild links und Text rechts.
- `object-fit: contain` zeigt jedes Motiv vollständig. Die dunkle Bildfläche fängt abweichende Seitenverhältnisse ruhig auf.
- Die Bildspalte folgt exakt dem 4:3-Verhältnis der gelieferten Motive. So bleiben die Bilder vollständig sichtbar, ohne dunkle Seitenstreifen.
- Nummer, Fortschrittslinie und Markenblume bleiben als vertikale Führung erhalten. Die Führung steht mit demselben ruhigen Zwischenraum wie in der Hochkantansicht links vor der Karte; die Karte selbst bleibt exakt auf der Viewportmitte.
- Die Hochkantdarstellung bis 480 px bleibt in Aufbau und Abmessungen unverändert.
- Die Scrolllogik aktiviert auf der Startseite auf allen Breiten nur noch die vorhandene vertikale Journey. Reduced Motion zeigt weiterhin den vollständigen statischen Zeitstrahl.

AP-543 ersetzt für die Startseite das horizontale Verhalten aus AP-536 bis AP-542.
