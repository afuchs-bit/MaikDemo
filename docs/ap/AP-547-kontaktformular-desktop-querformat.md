# AP-547 — Kontaktformular für Desktop und Querformat angleichen (02.10.2026)

Die Startseiten-Kurzanfrage übernimmt ihre bestehende Hochkantgestaltung auf
Desktop ab 901 px und Handy-Querformat. Die große umschließende Kartenfläche
entfällt dort: Kontaktwege links und Eingabe rechts stehen auf dem gemeinsamen
Sektionsgrund. Gesamtbreite maximal 1120 px wie bei Willkommen und Über uns,
fließender Spaltenabstand 32–96 px. Sicherheitsränder werden einmal angewendet,
wobei der größere linke/rechte Rand die Gesamtgruppe symmetrisch zentriert.

Die Eingabefelder, Fotoauswahl, Telefon-, WhatsApp- und E-Mail-Kacheln übernehmen
Flächenfarben, Rundungen und Icons der Hochkantfassung. Der Sendebutton trägt
nun auch am Desktop die vorhandene Laschenform, den versetzten Rahmen,
Handschrift, dunkle Pfeilkapsel und die gemeinsame Halo-/Puls-/Touch-Reaktion.
Reduzierte Bewegung wird berücksichtigt. Desktop/Querformat-Felder verwenden
16 px Schrift und mindestens 52 px Höhe, Kontaktwege und Sendebutton mindestens
64 px; mehrzeilige Kontaktbeschriftungen dürfen natürlich wachsen.

Zwei Layout-Wrapper teilen das bestehende Formular in Direktkontakt und Eingabe
sowie die beiden Kontaktfelder. In der Hochkantdarstellung verwenden sie
`display: contents`, sodass die bestehende Anordnung erhalten bleibt. Bei genug
Eingabebreite stehen Name und Rückkontakt nebeneinander; andernfalls untereinander.
Bei höchstens 560 px Inhaltsbreite stapeln auch die beiden Hauptbereiche. Das
Formular bleibt Teil des normalen Seitenflusses, ohne feste Höhe oder Scrollsperre.

Alle Controls, Labels, IDs, Datenattribute, Kontaktziele, Texte und JavaScript-
Funktionen bleiben erhalten. Der vorhandene leere Versand-Endpunkt wird nicht
aktiviert. Formular-, Foto- und Hinweislogik wurden nicht geändert. Die Gestaltung
ist auf `.private-contact` begrenzt; andere Formulare erhalten keine neue Anordnung.

CSS-Version `20261002j`, Anfrage-CSS separat `20261002a`. Der Header-Generator
aktualisiert jetzt auch Anfrage-CSS auf den 39 veröffentlichten Einbindungen;
die Leistungsseitenvorlage führt dieselbe Version.

## Prüfung

- Hochkant 320, 390, 430, 768 und 900 px: berechnete Raster, Breiten, Höhen,
  Schriften, Farben, Icon-Assets/-größen und Abstände vor/nachher verglichen.
  Keine materielle Abweichung; dynamische Einblendpositionen und CTA-Pulsphase
  ausgenommen. Die bestehende Hochkantkomposition bleibt erhalten.
- Querformat 568×320, 667×375, 844×390, 874×402, 900×420; Desktop 901×900,
  1024×768, 1440×1000, 1920×1080 und 2560×1440: keine abgeschnittenen Labels,
  Kontaktwerte, Foto- oder Buttonbeschriftungen. Mittelachse unter 0,01 px
  Rundungsabweichung, keine äußere Formularumrandung.
- CSS-Reflow 437×201 und Sicherheitsrand-Simulation mit 62 px je Seite:
  gestapelte Bereiche und vollständige Texte, kein horizontaler Textüberlauf.
  Bei 874×402 mit Sicherheitsrändern: 750 px Gesamtbreite, mittig, zwei
  Hauptspalten und mindestens 64 px Kontaktflächen. Kein Test auf einem
  physischen iPhone/Safari und kein tatsächlicher Browserzoom.
- Name, Rückkontakt und Nachricht mit künstlichen Testwerten befüllt; Wechsel
  von 1440×1000 auf 874×402 erhält die Werte. Tab-Reihenfolge vom Namen zum
  Rückkontakt und von der Nachricht zum Fotoeingang geprüft. Feld- und
  Fotoauswahlfokus mit sichtbarem 2-px-Ring. Keine Datei hochgeladen.
- Sendebutton in der lokalen Vorschau betätigt: vorhandener Hinweis auf noch
  inaktiven Versand erscheint vollständig, Werte bleiben erhalten, kein
  horizontaler Überlauf. Es wurde keine Anfrage versandt.
- Sämtliche Control-/Label-Attribute und Formularlinks gegen den vorherigen
  Stand geprüft: unverändert. Das vorige FAQ-Paket bleibt unverändert.
- Zweiter Generatorlauf: 0 Änderungen. Vorschau-CSS stimmt bytegleich mit
  den bearbeiteten Dateien überein. `git diff --check` erfolgreich.
- Kein Commit oder Push.

Messwerte und visuelle Abnahme: `tmp/contact-review-20261002/`.
