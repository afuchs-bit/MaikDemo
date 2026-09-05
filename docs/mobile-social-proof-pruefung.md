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
