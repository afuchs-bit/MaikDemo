# AP-546 — FAQ als mittige Spalte auf allen Bildschirmgrößen (02.10.2026)

Die Startseiten-FAQ übernimmt die Hochkantgestaltung auf allen Breiten:
Gruppenkacheln mit asymmetrischen Rundungen, grüner Gruppenüberschrift,
feinen Trennlinien und denselben Plus-/Chevron-Symbolen. Die einzelne Spalte
ist auf 760 px begrenzt und zentriert. Bei Displayaussparungen berücksichtigt
sie den größeren Sicherheitsrand symmetrisch, ohne zusätzliche Container-
Innenränder. Safari-Textvergrößerung im mobilen Querformat ist auf 100 % gesetzt.
Die Fragezeilen behalten mindestens 68 px, unter 360 px 80 px Höhe; längerer
Text kann die Zeilen natürlich vergrößern.

„Anfrage & Ablauf“ steht standardmäßig sichtbar über dem Schalter „Weitere
13 Fragen anzeigen“. Erreichbarkeit & Termine, Leistungen & Rahmen und
Fachliches öffnen darunter ebenfalls in einer Spalte. Die Einstellung steht
nun direkt in `content/faq-startseite.json` (`sichtbareGruppen: 1`) und im daraus
erzeugten HTML. Der bisherige JavaScript-Umbau abhängig von 520 px entfällt.
Alle 15 Fragen, Antworten und das FAQPage-Schema bleiben unverändert.

Die vorhandene Hochkantbedienung gilt überall: Antworten lassen sich unabhängig
öffnen; der äußere Ausklapper und die Antworten animieren ihre natürliche Höhe.
Größenwechsel erhalten die gewählten Öffnungszustände und beenden laufende
Höhenanimationen sauber. Reduzierte Bewegung wird auch vom äußeren Ausklapper
berücksichtigt. Native Details/Summary bleiben ohne JavaScript bedienbar.

Gemeinsames CSS `20261002i`, Privatformular-JavaScript `20261002a`. Der Header-
Generator führt die JavaScript-Version jetzt ebenfalls zentral nach. Keine
Änderung an Formularfunktion, Navigation, öffentlichen URLs oder Inhalten.

## Prüfung

- Standardzustand und geöffnete Gruppen bei 320×844, 390×844, 430×932,
  768×1024, 900×1200; Querformat 568×320, 667×375, 844×390, 874×402,
  900×420; Desktop 901×900, 1024×768, 1440×900, 1920×1080, 2560×1440.
  Stets eine Spalte, Mitte mit Rundungsabweichung unter 0,01 px; keine
  horizontal abgeschnittenen Fragen oder Antworten.
- CSS-Reflow bei 437×201 ebenfalls ohne Textüberlauf. Kein tatsächlicher
  Browserzoom oder Test auf einem physischen iPhone/Safari.
- Hochkantreferenz 320, 390 und 430 px vor/nachher: gleiche Breiten, Höhen,
  Schriften, Farben, Radien und Innenabstände der sichtbaren FAQ-Bauteile.
  Dynamische Einblendpositionen und laufende Farbübergänge sind aus dem
  Vergleich ausgenommen.
- Alle 15 Antworten bei 874×402 und 1440×900 mit Enter geöffnet; vollständig
  erreichbar, kein Textüberlauf. Enter und Leertaste öffnen/schließen Fragen
  und äußeren Ausklapper. Gelber 2-px-Tastaturfokus sichtbar.
- Wechsel vom Desktop ins Querformat mit geöffneten Antworten: Zustände
  erhalten, keine verbleibenden Animationsklassen. Schließen des Ausklappers
  räumt Inline-Höhe/Overflow auf; Fokus bleibt auf seinem Summary.
- FAQ-Fragment stimmt mit dem Renderer und der zentralen Quelle überein;
  erneute Erzeugung würde keine Änderung auslösen. FAQPage-Schema gegenüber
  dem vorherigen Stand identisch. Zweiter Header-Generatorlauf: 0 Änderungen.
- JavaScript-Syntaxprüfung und `git diff --check` erfolgreich.
  Kein Commit oder Push.

Messwerte und visuelle Abnahme: `tmp/faq-review-20261002/`.
