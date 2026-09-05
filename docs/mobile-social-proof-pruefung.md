# AP-174 – Mobile Social-Proof-Kacheln

Stand: 05.09.2026. Geprüft in der lokalen In-App-Browservorschau.

## Darstellung

| Viewportbreite | Kartenhöhen (px) | Seitlicher Überstand | Neue Sektion |
|---|---|---|---|
| 320 | 199 / 223 / 157 | keiner | sichtbar |
| 375 | 199 / 199 / 157 | keiner | sichtbar |
| 390 | 178 / 199 / 157 | keiner | sichtbar |
| 430 | 178 / 178 / 157 | keiner | sichtbar |
| 900 | 178 / 178 / 157 | keiner | sichtbar |
| 901 | 0 / 0 / 0 | keiner | ausgeblendet |

Die Browserprüfung verwendet eine klassische 15-px-Bildlaufleiste. Die nutzbare
Seitenbreite ist deshalb jeweils 15 px kleiner als der angegebene Viewport.
Die Kacheln halten links und rechts je 16 px Abstand zu dieser nutzbaren Breite.

- Alle drei Grafiken laden erfolgreich, mit echter Transparenz und #56E607 als
  sichtbarer Farbe. Keine eingebrannten Schachbrettflächen oder fehlenden Bilder.
- Texte und Grafiken bleiben auf allen geprüften Breiten innerhalb ihres Inhaltsbereichs.
- Bei 200 % Schriftgröße und 320 px Viewport wachsen die Karten auf 502 / 508 / 334 px.
  Kein Text wird abgeschnitten; die Rundungen folgen der neuen Höhe.
- Keine JavaScript-Fehler oder Warnungen in der aktualisierten Vorschau.
- `node --check assets/js/mobile-social-proof.js` und `git diff --check` bestanden.
- Das bestehende Homepage-Markup bleibt nach Herausrechnen der neuen Sektion und
  ihrer CSS-/JS-Einbindungen identisch. Die alte Proof-Sektion dient nur dem Auftraggeber
  als Referenz und bleibt vollständig erhalten.

## Behobene Ursache der seitlichen Verschiebung

Die ursprüngliche Blume ragte durch `right: -64px` über ihre Kachel hinaus.
`clip-path` maskierte die Darstellung, begrenzte aber den Scrollbereich nicht.
Nun begrenzt zusätzlich `overflow: hidden` den dekorativen Überstand an der Kachel.
Die Seitenbreite wird nicht durch eine globale Zoom- oder Breitenkorrektur verändert.

Die Seitengestaltung oberhalb von 900 px erhält keine neuen Darstellungsregeln.
Eine Prüfung auf einem physischen iPhone/Safari wurde durch den Agenten nicht ausgeführt.

## AP-175 – Gemeinsame matte Fläche (05.09.2026)

Der vorherige Stand ist oben dokumentiert. Der aktuelle Entwurf verwendet eine
gemeinsame gerundete Fläche, eine einzelne Diagonale und zwei Trennlinien.
Es gibt keine Blumen und keinen Hintergrundverlauf. Die Zahlen und Aussagen bleiben
unverändert; die Kurztexte verwenden jetzt 16 px statt 15 px.

| Viewportbreite | Höhen der drei Inhaltsbereiche (px) | Horizontaler Überstand | Sektion |
|---|---|---|---|
| 320 | 215 / 236 / 190 | keiner | sichtbar |
| 375 | 215 / 236 / 167 | keiner | sichtbar |
| 390 | 215 / 212 / 167 | keiner | sichtbar |
| 430 | 193 / 190 / 167 | keiner | sichtbar |
| 900 | 193 / 190 / 167 | keiner | sichtbar |
| 901 | 0 / 0 / 0 | keiner | ausgeblendet |

- Visuelle Kontrolle bei 320 und 390 px: proportionale Grafiken, klare Hierarchie,
  neutrale Fläche und nur eine grüne diagonale Kante. Eine einzige SVG-Kontur im DOM.
- Bei 320 px und 200 % Schriftgröße wachsen die Inhaltsbereiche auf 534 / 579 / 351 px.
  Der gesamte Inhalt der neuen Sektion bleibt innerhalb der Fläche.
- Die gesamte Bestandsseite hat bei dieser vergrößerten Schrift allerdings einen
  Überstand außerhalb der neuen Sektion (unter anderem Hero, alte Proof-Inhalte und
  Formulartexte). Vergleich mit dem vorherigen Commit: in beiden Ständen 423 px
  Scrollbreite bei 305 px nutzbarer Breite. Dies ist keine neue Regression und wurde
  im Rahmen dieser Gestaltung nicht verändert.
- Das Homepage-Markup außerhalb der neuen Sektion und ihrer Cache-Versionen ist
  gegenüber AP-174 identisch. Desktop und alte Proof-Sektion bleiben unverändert.
- `node --check assets/js/mobile-social-proof.js` und `git diff --check` bestanden.

Auch diese Kontrolle erfolgte im lokalen Browser, nicht auf einem physischen iPhone.

## AP-176 – Freistehende Kennzahlen (05.09.2026)

- Kontrolle bei 320, 375, 390, 430 und 900 px: alle Grafiken geladen, Texte und
  Zahlen innerhalb ihrer Inhaltsbereiche, kein horizontaler Überstand bei normaler Schrift.
  Ab 901 px bleibt die neue Sektion ausgeblendet.
- Visuell bei 320 und 390 px geprüft: transparenter Hintergrund, keine Rahmen,
  Trennlinien oder SVG-Kontur. Der mittlere Block ist leicht eingerückt.
- Die drei Inhaltsbereiche sind bei 390 px 149 / 171 / 126 px hoch, mit jeweils
  36 px Abstand. Bei 320 px betragen die Höhen 171 / 195 / 126 px.
- Bei 320 px und 200 % Schriftgröße wachsen sie auf 445 / 493 / 310 px,
  ohne Inhalte abzuschneiden. Der unter AP-175 dokumentierte Überstand anderer
  Bestandssektionen bei 200 % Schriftgröße bleibt unverändert (423 px Scrollbreite).
- Die Rahmen-JavaScriptdatei und ihre Einbindung sind entfernt. Keine verbliebenen
  Verweise auf die entfernten Panel-, Rahmen- oder Kartenklassen im Anwendungscode.
- Homepage außerhalb der neuen Sektion und ihrer CSS-/JS-Einbindungen mit dem
  vorherigen Commit verglichen: identisch. `git diff --check` bestanden.

## AP-177 – Kleinere Kennzahlen mit einzelner Blüte (05.09.2026)

- Bei 320, 375, 390, 430 und 900 px geprüft: kein horizontaler Überstand bei normaler
  Schrift. Ab 901 px ist die neue Sektion ausgeblendet.
- Zahlenhöhen exakt 44 / 42 / 36 px, jeweils proportional und unten in einer
  44-px-Zeile ausgerichtet. Alle drei Aussagen haben dieselbe linke Kante.
- Bezeichnungen: 18 px, Gewicht 700. Bei 390 px sind die Inhaltsbereiche
  127 / 127 / 105 px hoch, bei 320 px 150 / 150 / 105 px.
- Eine einzige Blüte: geladen, 32 × 32 px, Deckkraft 0,55, vertikal zentriert,
  vollständig innerhalb der ersten Zahlenzeile und für Screenreader dekorativ.
- Visuelle Kontrolle bei 320 und 390 px sowie bei 200 % Schriftgröße auf 320 px.
  Bei vergrößerter Schrift wachsen die Bereiche auf 374 / 464 / 284 px;
  keine Textabschneidung und keine Überlagerung mit der Blüte. Der dokumentierte
  Überstand anderer Bestandssektionen bleibt bei 423 px Scrollbreite unverändert.
- Sämtliche KPI-Bezeichnungen und Kurztexte sowie das Homepage-Markup außerhalb
  der Sektion und ihrer CSS-Version sind gegenüber AP-176 identisch.
- `git diff --check` bestanden. Keine neue JavaScript-Funktionalität.

## AP-178 – Großes angeschnittenes Blumenlogo (05.09.2026)

- Bestehendes Hero-Motiv einmalig als dekorativer Hintergrund eingebunden;
  Originaldatei unverändert. Ausgeblendet für Screenreader, ohne Zeigerinteraktion.
- Kontrolle bei 320, 375, 390, 430 und 900 px: Motiv geladen, eigene Dekorationsebene
  innerhalb der Sektion beschnitten, kein horizontaler Überstand bei normaler Schrift.
  Ab 901 px bleibt die Sektion ausgeblendet. Texte liegen innerhalb ihrer Bereiche.
- Visuelle Kontrolle bei 320 und 390 px: große Blüte rechts beim mittleren KPI,
  Blätter nach oben und unten, weicher Übergang zur Textseite. Keine neue Hintergrundfläche.
- Kontrast konservativ berechnet: Selbst rein weiße Motivpixel mit voller 14-%-Deckkraft
  ohne abschwächende Maske ergeben mindestens 8,49:1 für den Kurztext, 11,10:1 für
  Bezeichnungen und 7,03:1 für die grünen Zahlen auf dem vorhandenen Seitenhintergrund.
- Bei 320 px und 200 % Schriftgröße keine Textabschneidung in der neuen Sektion.
  Der zuvor dokumentierte Überstand anderer Bestandssektionen bleibt unverändert
  (423 px Scrollbreite bei 305 px nutzbarer Breite).
- KPI-Wortlaut und Homepage außerhalb dieser Sektion und ihrer CSS-Version sind
  gegenüber AP-177 identisch. `git diff --check` bestanden.
