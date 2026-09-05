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
