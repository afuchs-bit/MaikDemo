# AP-551 — Frage und Antwort der Gartenpflege-Einladung angleichen (02.10.2026)

Die Gartenpflege-Einladung in `#social-proof` übernimmt auf Desktop ab 901 px
und im mobilen Querformat das Schriftverhältnis der Hochkantfassung: Die Frage
ist nur 12,5 % größer als die Antwort. Beide verwenden Nunito, die Frage mit
Gewicht 700, die Antwort mit 500. Die bisherige separate Desktop-Frageschrift
Baloo 2 und der deutlich größere Schriftgrößenunterschied entfallen in dieser
Komponente.

Ein gemeinsamer Größenwert skaliert die Antwort am Desktop von 20 bis 26 px
und die Frage entsprechend von 22,5 bis 29,25 px. Im mobilen Querformat zählt
die tatsächlich verfügbare Containerbreite: Antwort 16–20 px, Frage 18–22,5 px.
Beide Texte verwenden Zeilenhöhe 1,4. Natürliche Umbrüche und vollständige
Texte bleiben erhalten.

Die Gruppe bleibt mittig auf höchstens 1120 px begrenzt, mit zwei gleich breiten
Spalten und vertikal mittiger Ausrichtung von Frage und Antwort. Am Desktop
begrenzt ein fließender Abstand von 48–96 px die Trennung der Textblöcke
(vorher bis 160 px). Die Antwort erhält 18–24 px Innenabstand, im Querformat
weiter 14 px. Die vorhandene grüne Farbfläche, Rundung, Markenblume und der
Anfragebutton darunter bleiben erhalten. Schmale Querformat-Container bis
440 px stapeln wie bisher zugunsten der Lesbarkeit.

Hochkantregeln, Textinhalt, HTML, Galerie-Layout, JavaScript und Kontaktziele
bleiben erhalten. CSS-Version `20261002m` zentral durch den Header-Generator
auf den 51 veröffentlichten Header-Seiten nachgeführt; Anfrage-CSS bleibt
`20261002b`.

## Prüfung

- Querformat 568×320, 667×375, 768×432, 844×390, 874×402, 900×420;
  Desktop 901×600, 1024×768, 1280×800, 1440×1000, 1920×1080, 2560×1440.
  Schriftverhältnis 1,125 bei allen Größen; Textüberlauf und Seitenüberlauf 0.
  Gleich breite Spalten und Mittelachsen unter 0,004 px Rundungsabweichung.
- Bei 1440 px: Frage 27,54 px, Antwort 24,48 px, Spalten je 512 px und
  96 px Abstand. Bei 874 px: Frage 20,96 px, Antwort 18,63 px. Desktop,
  schmaler Desktop und 874×402 visuell mit vollständigen Texten abgenommen.
- Sicherheitsrand-Simulation mit 62 px je Seite zusätzlich zum bestehenden
  32-px-Seitenrand bei 568, 667, 844, 874, 900 und 437 px: keine Text- oder
  Seitenüberläufe. Unter 440 px verfügbarer Breite stehen Frage, Antwort
  und Button untereinander. CSS-Reflow 437×201 und 320×200 geprüft.
  Kein physischer Safari-/iPhone-Test und kein tatsächlicher Browserzoom.
- Hochkant 320, 390, 430, 768, 900 px vor/nachher: identische Textgeometrie,
  Schriften, Abstände und Gestaltung. Animierte CTA-Größen und Überstände
  von Pulsfläche/Versatzrahmen wurden als bewegter Zustand ausgenommen.
- Anfragebutton per Tastatur fokussiert: sichtbarer 2-px-Ring mit 9 px Abstand.
  Enter erreicht wie bisher `#anfrage`, das vorhandene Formular ist sichtbar.
  Kein Versand und keine externen Kontaktaktionen.
- Browser ohne Fehler/Warnungen. Vorschau-CSS bytegleich mit der bearbeiteten
  Datei. Zweiter Generatorlauf: 0 Änderungen. `git diff --check` erfolgreich.
- Kein Commit oder Push.

Prüfdaten und Screenshots: `tmp/invitation-typography-20261002/`.
