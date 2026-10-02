# AP-542 — Kompakte Ablauf-Karten und Scrollanimation im Querformat (02.10.2026)

Im Handy-Querformat folgt die Ablauf-Reihe jetzt dem normalen vertikalen
Seitenscrollen. Nach der Überschrift bleibt die Kartenbühne unter dem Header
stehen; beim Weiterscrollen bewegen sich Linie und Karten seitlich von Schritt
1 bis Schritt 5. Es gibt keine Touch-Geste, Scrollsperre oder manuelle
Radbehandlung. Die Seite selbst bleibt der einzige vertikale Scrollbereich.

Die Bühne haftet als eigenes Element. Dadurch darf die Überschrift vorher
normal aus dem Bild laufen und die kurze Querformat-Höhe steht vollständig für
Linie, Markenziffern und Karten zur Verfügung. Der JavaScript-Zweig berechnet
den Startpunkt aus Überschrift, Bühnenabstand und aktueller Headerhöhe. Die
vorhandene Desktop-Progression steuert danach auch im Querformat Track, Linie,
aktive Station und Übergabe der Blume an den Anfrage-Button. Beim Drehen werden
Klassen, feste Scroller-Höhe, Fokuspunkt und Abschlusszustand sauber gewechselt.

Die Kartenbreite beträgt im üblichen Querformat höchstens 248 px, auf sehr
kurzen Ansichten höchstens 220 px. Bilder verwenden dort einen breiteren
Ausschnitt, Texte kleinere, weiterhin lesbare Größen und der erste Schritt die
prägnante Textfassung. Alle Inhalte bleiben vollständig vorhanden. Bei
568×320 px ist die Bühne 230 px hoch; bei 667×375 bis 900×420 px 285 px.
Sie passt damit jeweils vollständig unter die 90-px-Sticky-Zone des Headers.

Der Kartenabstand wächst auf 40–48 px im Querformat und auf bis zu 56 px am
Desktop. Erste und letzte Karte bleiben exakt in der Bühnenmitte. Symmetrische
Safe Areas und die zentrierte Endposition aus AP-541 bleiben erhalten. Bei
reduzierter Bewegung bleibt die bestehende native, mittig einrastende
Scrollfläche als zugänglicher Fallback bestehen. Die Hochkantansicht ändert
sich nicht.

CSS-Version und gemeinsame JavaScript-Version: `20261002a`.

## Prüfung

- Vertikale Scrollanimation bei 874×402: Bühne haftet unter dem Header,
  Schritt 2 liegt bei 25,6 % Fortschritt auf der Bühnenmitte; Schritt 5 endet
  bei 100 % mit weniger als 0,25 px Abweichung von der Mitte.
- 568×320, 667×375, 844×390, 874×402 und 900×420: Kartenhöhen 195 bzw. 228 px,
  Bühnenhöhen 230 bzw. 285 px, vollständige Texte, keine horizontale
  Seitenüberbreite. Abstand 40–45 px.
- Displayaussparungen mit 62 px je Seite als lokale Quelldiagnose nachgebildet:
  686-px-Bühne, Anfang weiterhin auf x=437 px, kein Seitenüberlauf.
- Desktop 1440×900: 56 px Kartenabstand, erster und letzter Mittelpunkt x=720,
  Fortschritt 0 bis 1 und Abschlusszustand korrekt.
- Hochkant 320, 390, 430, 768 und 900 px: gespeicherte Vorherwerte für
  Kartenhöhe, Position, Medienanzeige, Schriftgröße, Bühnenbreite und
  Journey-Klasse stimmen vollständig überein.
- Größenwechsel Querformat → Hochformat entfernt angeheftete Klasse,
  Scroller-Höhe, Fokuspunkt und Abschlusszustand. Keine Konsolenfehler.
- JavaScript-Syntax, `git diff --check` und zweiter Generatorlauf erfolgreich;
  der zweite Lauf erzeugt 0 Änderungen. Kein Commit oder Push.

Messwerte und Abnahmebilder: `tmp/process-landscape-scroll-20261002/`.
