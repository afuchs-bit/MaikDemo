# AP-555 — Anfrage-Sektion kompakt und mittig gestalten (02.10.2026)

Die Startseiten-Sektion „Der erste Schritt zu Ihrem Gartenprojekt“ verwendet
auf Desktop ab 901 px und im Handy-Querformat eine gemeinsame Mittelachse.
Die bisherige Kontaktspalte neben der längeren Formularspalte entfällt.
Anrufen, WhatsApp und E-Mail stehen als drei gleich breite und gleich hohe
Kontaktwege über der Eingabe. Die bisherige Hochkantgestaltung bleibt erhalten.

Die Gesamtbreite sinkt von 1120 auf höchstens 860 px. Seitlich gelten mindestens
32 px beziehungsweise der größere bestehende Seiten- oder Sicherheitsrand;
Displayaussparungen werden symmetrisch berücksichtigt. Die Überschrift ist
mittig, der Abstand zum Formular beträgt 32–40 px. Der alte zusätzliche untere
Layoutabstand entfällt. Die Sektion erhält 56–80 px Außenabstand, im
Handy-Querformat weiterhin 48 px.

Name und Rückkontakt teilen sich bei ausreichender Breite eine Zeile;
Nachricht und Felder bleiben auf einer gemeinsamen Außenkante. Fotoauswahl und
Sendebutton stehen in einer kompakten, zentrierten Aktionszeile. Unter 680 px
Containerbreite stehen sie untereinander. Auch die Kontaktkacheln passen sich
dort mit Icons über dem Text an; bei höchstens 420 px Containerbreite werden
sie zu einer gut lesbaren Liste. Kontaktkacheln wachsen bei mehrzeiligem Text
gemeinsam statt auf einer festen Höhe Inhalte abzuschneiden.

„Anfrage senden“ und der vorhandene Ablaufbutton „Projekt anfragen“ teilen
Größen-Tokens: Desktop 420 × 64 px, Handy-Querformat 360 × 64 px, bei weniger
Platz höchstens die verfügbare Breite. Die bestehende Laschenform, Pfeilkapsel,
Farben und Reaktionen bleiben erhalten. Fotoauswahl und Sendebutton sind in
den üblichen breiten Ansichten gleich groß. Statusmeldungen stehen unter der
gesamten Aktionszeile und erzeugen keine neue ungleiche Spalte.

Zwei reine Layout-Wrapper fassen Foto/Einwilligung sowie die Aktionen zusammen.
Im Hochkantlayout verwenden sie `display: contents`. Controls, IDs, Labels,
Attribute, Kontaktziele, DOM-Reihenfolge, Texte und sämtliche Formularskripte
bleiben erhalten. Der bestehende leere Versand-Endpunkt wird nicht verändert.
Keine neue Layout- oder Scrolllogik und keine zusätzliche Bibliothek.

CSS-Version `20261002q`, Anfrage-CSS `20261002c`; JavaScript bleibt
`20261002e`. Der Headergenerator aktualisiert die 39 veröffentlichten
Anfrage-CSS-Einbindungen, die Leistungsseitenvorlage führt dieselbe Version.

## Prüfung

- Querformat 568×320, 667×375, 768×432, 844×390, 874×402, 900×420;
  Desktop 901×600, 1024×768, 1280×900, 1440×1000, 1920×1080 und 2560×1440:
  kein horizontaler Seiten- oder Textüberlauf. Die Mittelachse weicht höchstens
  0,004 px durch Rundung ab. Alle drei Kontaktkacheln haben jeweils dieselbe
  Breite und Höhe. Beide Anfragebuttons haben in jeder geprüften Ansicht
  identische natürliche Abmessungen.
- CSS-Reflow bei 437×201 und lokale Sicherheitsrand-Prüffassung mit 62 px je
  Seite: Inhalte bleiben vollständig erreichbar und laufen nicht über. Auf
  besonders schmalen Flächen stapeln die Kontaktwege und Aktionen. Eingabefelder
  behalten 16 px Schrift. Kein physischer Safari-/iPhone-Test und kein
  tatsächlicher Browserzoom.
- Hochkant 320, 390, 430, 768 und 900 px: berechnete Breiten, Höhen, Raster,
  Schriften, Farben, Mindesthöhen und Abstände vor/nachher direkt verglichen;
  keine Abweichung. Scrollabhängige Positionen und die laufende Pulsphase des
  entfernten Ablaufbuttons wurden nicht als Layoutdifferenz gewertet.
- Formular-Controls und Linkattribute mit dem vorherigen HTML verglichen:
  alle 20 Einträge unverändert. Künstliche lokale Eingaben bleiben beim Wechsel
  zwischen 874×402 und 1440×1000 erhalten. Tab erreicht nach der Nachricht die
  Fotoauswahl und danach den Sendebutton; beide zeigen einen sichtbaren
  2-px-Fokus. Der fokussierte Button liegt unterhalb des Headers.
- Lokalen Sendebutton bei leerem Endpunkt betätigt: bestehender Hinweis auf
  noch inaktiven Versand erscheint über die gesamte Aktionsbreite, ohne
  Überlauf. Keine Anfrage versandt. Sichtbare Fotoauswahl-/Einwilligungshinweise
  in einer lokalen HTML-Prüffassung kontrolliert; keine Datei hochgeladen.
- Ausgelieferte CSS-Dateien stimmen bytegleich mit den bearbeiteten Dateien
  überein. Zweiter Generatorlauf: 0 Änderungen. Syntaxprüfung des Generators
  und `git diff --check` erfolgreich. Keine Änderung an Formular-JavaScript.
- Kein Commit oder Push.

Messwerte, Vergleich und Screenshots: `tmp/request-compact-20261002/`.
