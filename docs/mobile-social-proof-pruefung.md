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

## AP-179 – Ohne Blume, einheitliche Subtextbreite (05.09.2026)

- Das Blumenmotiv samt Dekorationsebene ist aus dieser Sektion entfernt.
- Kontrolle bei 320, 375, 390, 430 und 900 px: kein horizontaler Überstand,
  alle Kurztexte auf gemeinsamer linker Kante und mit identischer Blockbreite.
  Die Breite beträgt 257 px bei 320 px Viewport, sonst maximal ca. 269 px (28ch).
  Die ersten beiden Kurztexte haben jeweils drei ausgewogene Zeilen, der dritte eine.
- Visuell bei 320 und 390 px geprüft. Bei 390 px betragen die längsten sichtbaren
  Textzeilen etwa 207 / 227 / 235 px; der Wortlaut wurde nicht verändert.
- Ab 901 px bleibt die Sektion ausgeblendet. Bei 320 px und 200 % Schriftgröße
  bleiben alle Kurztexte innerhalb ihrer Bereiche. Der dokumentierte Überstand
  anderer Bestandssektionen bleibt unverändert (423 px Scrollbreite).
- Homepage außerhalb der Sektion und ihrer CSS-Version sowie KPI-Wortlaut mit
  AP-178 verglichen: identisch. `git diff --check` bestanden.

## AP-180 – Subtexte mit höchstens zwei Zeilen (05.09.2026)

- Bei 320, 375, 390, 430 und 900 px mit normaler Schrift per DOM-Textmessung geprüft:
  Zeilenanzahl jeweils 2 / 2 / 1. Kein horizontaler Überstand, vollständige Texte.
  Die sichtbaren Zeilenbreiten liegen bei 216 / 206 px, 206 / 205 px und 235 px.
- Ab 901 px bleibt die neue Sektion ausgeblendet. Zahlen und Bezeichnungen unverändert.
- Visuelle Kontrolle bei 390 px und bei 200 % Schriftgröße auf 320 px.
  Vergrößerte Schrift darf mehr als zwei Zeilen beanspruchen; keine maximale Texthöhe,
  kein Abschneiden oder Verbergen von Text. Alle Absätze passen in ihre Inhaltsbereiche.
  Der dokumentierte Überstand anderer Bestandssektionen bleibt bei 423 px unverändert.
- Nur zwei Subtexte umformuliert. Das übrige Markup der Sektion, Hero, alte Proof-Sektion
  und Homepage außerhalb der neuen Sektion und ihrer CSS-Version bleiben identisch.
- `git diff --check` bestanden.


## AP-181 – Bildfolge und persönliche Einladung (05.09.2026)

- Browserprüfung bei 320, 375, 390, 430 und 900 px: keine zusätzliche horizontale
  Scrollbreite. Fotobreiten 257 / 312 / 327 / 367 / 640 px (Browser mit 15-px-Scrollbar),
  jeweils exakt 4:3. Außenabstand 24 px, ab maximaler Inhaltsbreite zentriert.
- Abstand vom letzten KPI-Textblock zum Foto exakt 32 px. Die Zahlen und KPI-Texte
  bleiben unverändert; normale Subtext-Zeilenanzahl weiterhin 2 / 2 / 1.
- Ab 901 px ist die gesamte neue Sektion ausgeblendet. Rückkehr zu 900 px und weitere
  Größenwechsel behalten die korrekte Bildposition. Alte Proof-Sektion und alte Galerie
  bleiben auf allen geprüften Breiten sichtbar.
- Visuelle Kontrolle bei 320 und 390 px: vollständige Motive, 16-px-Eckenradius,
  Punkte unten im Bild, gemeinsame linke Kante, ruhiger Galerie-Link und hervorgehobene
  Fragen. Der grüne Anfrage-CTA wächst bei 320 px auf zwei Beschriftungszeilen.
- Horizontale Scrollgesten im In-App-Browser: alle vier Motive in der vereinbarten
  Reihenfolge; letzter → erster und erster → letzter mit identischer Randkopie und
  anschließend korrekter realer Scrollposition. Bildunterschrift, aktiver Punkt und
  Screenreader-Status synchron. Dies ist eine Browserprüfung, kein physischer iOS-Test.
- Direkte Punktauswahl sowie rechte Pfeiltaste geprüft; Tastaturfokus sichtbar (2 px),
  Randduplikate aria-hidden und inert. Ein Klick auf das Foto verändert weder Bild noch URL.
- Galerie-Link führt zur vorhandenen Garten- und Projektgalerie. Haupt-CTA nutzt #anfrage,
  fokussiert den sichtbaren Formulareinstieg und hält ihn unterhalb des mobilen Headers.
  Vorwahl und Formularinhalt bleiben bestehen; kein Formular abgesendet.
- Simulierte vier Sekunden Dekodierverzögerung: erstes Foto bleibt sichtbar, die
  Bedienelemente erscheinen erst nach Bereitschaft aller Bilder. Simulierte reduzierte
  Bewegung: direkte Punktauswahl erreicht die Zielposition ohne Animation.
- Absichtlich nicht erreichbare AVIF-/WebP-Dateien eines späteren Motivs: erstes Foto
  bleibt als Standbild sichtbar. Bei ausgefallenem ersten Motiv übernimmt das geladene
  Pflastermotiv. Keine bedienbaren Punkte für eine unvollständig geladene Bildfolge.
- Ohne neues JavaScript bleiben erstes Foto, Bildunterschrift und beide Links erhalten.
  Der statische CTA verwendet den sichtbaren Kontaktbereich #kontakt als Fallback;
  das Modul setzt anschließend #anfrage und übernimmt den präzisen Formularsprung.
- 200 % Schrift bei 320 px: keine abgeschnittenen Texte oder seitlicher Überstand der
  neuen Sektion (305 px Inhalts-/Scrollbreite). Der CTA wächst frei; deutsche Silbentrennung
  erhält lesbare Wortteile. Der dokumentierte Überstand anderer Bestandssektionen bleibt
  unverändert (423 px Dokument-Scrollbreite bei 305 px nutzbarer Bildschirmbreite).
- KPI-Markup und übrige Homepage gegen AP-180 verglichen: identisch, abgesehen vom
  neuen Bereich, seiner CSS-Version und dem neuen Skript. Beide persönlichen Texte
  einschließlich Schreibweise und Zeichensetzung wortgetreu übernommen.
- JavaScript-Syntaxprüfung und git diff --check bestanden. LAN-Vorschau liefert HTTP 200.
  Temporäre Fehler-/Schrift-/Bewegungsprüfseiten liegen nur während der Prüfung im
  ignorierten .agents-Verzeichnis und werden anschließend entfernt.


## AP-182 – Blumenlogo und Galerie-CTA unter dem Bild (05.09.2026)

- Sichtbare Bildunterschrift entfernt; Screenreader-Beschreibung und Bildwechsel bleiben
  erhalten. Ein horizontaler Bildwechsel mit aktualisiertem aktiven Punkt geprüft.
- Vorhandenes transparentes Hero-Blumenmotiv unverändert eingebunden, geladen,
  dekorativ und ohne Zeigerinteraktion. Kein neuer Hintergrund oder Filter.
- 320 / 375 / 390 / 430 / 900 px geprüft: Logo 88–104 px breit, ca. 13–20 px Überlappung
  in das Foto und 57–64 px unterhalb. Link vollständig außerhalb des Fotos. Die vertikalen
  Mittelpunkte von Logo und Link stimmen bei normaler Schrift überein (Rundung < 0,01 px).
  Zwischen Linkbereich und Logo bleiben 16 px Platz. Keine horizontale Seitenerweiterung.
- Ab 901 px bleibt die mobile Sektion ausgeblendet. Visuelle Kontrolle bei 390 px.
- Bei 320 px mit 200 % Schrift wächst der Link auf 134 px Höhe, ohne Abschneiden oder
  Überlagern des Logos. Galeriebreite und Scrollbreite jeweils 257 px. Bereits dokumentierter
  Überstand anderer Bestandsbereiche weiterhin 423 px.
- KPI-Markup, persönliche Texte, Anfrage-CTA, Hero und sämtliche Bestandssektionen mit
  AP-181 verglichen: identisch. Nur Galerie-Markup, eigene mobile CSS-Datei und deren
  Cache-Version angepasst; bestehende JavaScript-Datei unverändert.
- git diff --check bestanden; temporäre Schriftprüfseite anschließend entfernt.


## AP-183 – Originale Header-Blüten am Foto (05.09.2026)

- Im Browser nachgewiesen: Header-Hintergrund und SVG-Bild verwenden dieselbe
  maik-rohdich-logo-mobile-horizontal-balanced.png. Keine Veränderung der Bilddatei.
- Pixelanalyse: Blütenbereich beider Header-Varianten identisch, transparente Spalten
  204–219 trennen Blüten und Wortmarke. Das Sichtfenster 0/0/210/180 zeigt nur die Blüten.
- Bei 390 px visuell mit dem sichtbaren Header verglichen: identische Formen, Konturen
  und Farben. Kein Rest der Wortmarke sichtbar. Logo und Link vertikal zentriert.
- 320, 390 und 900 px ohne horizontalen Seitenüberstand; Originalproportion 210:180
  erhalten. Ab 901 px ist die mobile Sektion weiterhin ausgeblendet.
- Galerie-Bedienung und übrige Inhalte unverändert. CSS-Version erhöht;
  git diff --check bestanden.


## AP-184 – Gedrehte Hero-Form für die Bildfolge (05.09.2026)

- Hero bei 390 px visuell und per CSS geprüft: skewY-Matrix mit Faktor 0,301173
  (ca. 16,8 Grad), gegenüberliegende Eckenradien 2 / 14 px. Für das Foto im Uhrzeigersinn
  gedrehte Anordnung und reduzierte Neigung von ca. 6,1 Grad umgesetzt.
- Skalierbarer Clip mit 8 % seitlichem Versatz, waagerechten Ober-/Unterkanten und
  weichen Ecken oben links/unten rechts. Keine Transformation der eigentlichen Bilder.
- 320, 375, 390, 430 und 900 px: Fotoformat weiterhin 4:3; kein horizontaler Seitenüberstand.
  Ab 901 px bleibt die gesamte mobile Sektion ausgeblendet. Visuelle Kontrolle bei 390 px.
- Alle vier Motive vorwärts durchgewischt, einschließlich letztes → erstes. Aktiver Punkt
  und Scrollposition stimmen, die Maske bleibt am gemeinsamen Rahmen. Punkte bleiben bedienbar.
- Blumenlogo folgt der neuen Bildecke mit 8 % Einrückung. Link und Logo haben weiterhin
  16 px Abstand; ihre Anordnung steht vollständig außerhalb der Scrollspur.
- 320 px bei 200 % Schrift: Galeriebreite/Scrollbreite jeweils 257 px; Linkbreite/Scrollbreite
  jeweils 132 px. Keine Überlagerung oder Textabschneidung. Bekannter Überstand anderer
  Bestandsbereiche bleibt unverändert bei 423 px Dokumentbreite.
- Homepage-Markup gegen AP-183 verglichen: nur neue Clipdefinition und CSS-Version geändert.
  Hero, Fotoquellen, Original-Blumenlogo, Texte, CTAs und JavaScript unverändert.
- git diff --check bestanden; temporäre Schriftprüfseite nach der Kontrolle entfernt.


## AP-185 – Flachere Bilddiagonale (05.09.2026)

- Seitenversatz im SVG-Clip von 8 auf 5,5 % reduziert (ca. 4,19 Grad bei 4:3).
  Eckrundungen erhalten; Blumenlogo an die neue untere rechte Ecke angepasst.
- Bei 390 px visuell geprüft: mehr sichtbare Bildränder, weiterhin erkennbare Hero-Form.
  Galerie-Punkt bedienbar. Zusätzlich 320 und 900 px ohne horizontalen Seitenüberstand;
  weiterhin 16 px zwischen Galerie-Link und Logo. Ab 901 px ausgeblendet.
- Homepage-Markup außerhalb von Bildkontur und CSS-Version gegenüber AP-184 identisch.
  Hero, Bilder, Texte und JavaScript unverändert. git diff --check bestanden.


## AP-186 – Blumenlogo als Siegel am Gartenfoto (05.09.2026)

- Originale Header-Blütengruppe proportional auf 65–80 px Breite verkleinert;
  etwa zwei Drittel auf dem Foto, ein Drittel darunter. Rechter Überstand an der
  schrägen Bildecke 8 px. Feiner dunkler Schlagschatten, unveränderte Bilddatei.
- 320, 375, 390, 430 und 900 px ohne horizontalen Seitenüberstand bei normaler
  Schrift. Ab 901 px bleibt die mobile Sektion ausgeblendet.
- Visuelle Kontrolle des Vorgartens bei 390 px und des Poolgartens bei 320 px:
  erkennbare Verbindung zur Bildkante, untergeordnete Größe, freie Navigationspunkte.
- Bei 320 px bleiben 5,375 px zwischen dem sichtbaren aktiven vierten Punkt und
  dem SVG-Sichtfenster. Direkte Auswahl des vierten Motivs erfolgreich; aktiver
  Punkt und Bild synchron. Das Siegel hat weiterhin pointer-events: none.
- Homepage-Markup gegenüber AP-185 bis auf die CSS-Cache-Version identisch.
  Hero, Bildkontur, Kennzahlen, Texte, Originalgrafiken und JavaScript unverändert.
  git diff --check bestanden.


## AP-187 – Zweiteiliger Hero-CTA neben der Einladung (05.09.2026)

- Hero-CTA bei 390 px visuell und per CSS verglichen: ca. 16,8 Grad Neigung,
  Radien 2 / 14 px, dunkle Fläche und grüne Kontur. Neue Gruppe verwendet dieselbe
  Gestaltung mit 13 Grad Neigung und zwei waagerecht beschrifteten Links.
- 320, 375, 390, 430 und 900 px: Gruppe 110–144 px breit, beide Linkflächen jeweils
  96 px hoch. Keine abgeschnittenen Beschriftungen oder horizontalen Seitenüberstände.
  „Maik kontaktieren“ steht auf kleinen Handys in zwei Zeilen ohne Worttrennung.
  Ab 901 px ist die mobile Sektion weiterhin vollständig ausgeblendet.
- Visuelle Kontrolle bei 320 und 390 px. Texte beginnen links neben der Gruppe und
  laufen darunter über die verfügbare Breite weiter. Das unveränderte Blumensiegel
  bleibt am Bildrand; die Einladung beginnt 40 px unter dem Foto.
- Beide Links per Tastatur fokussierbar; Fokusrahmen sichtbar. Galerie-Link tatsächlich
  geöffnet: bestehende „Unsere Garten- und Projektgalerie“. Kontakt-Link tatsächlich
  geöffnet: #anfrage, sichtbarer Formulareinstieg mit Tastaturfokus unterhalb des Headers.
  Kein Formular abgesendet; vorhandener Sprunghandler unverändert.
- 200 % Schrift bei 320 px: Container-Regel stellt die Gruppe über den Text. Beide
  Links wachsen auf je 192 px Höhe; neue Sektion 305 px breit ohne eigenen Überstand.
  Beschriftungen und Texte werden nicht abgeschnitten. Bekannter Überstand anderer
  Bestandssektionen weiterhin 423 px Dokumentbreite bei 305 px verfügbarer Breite.
- Beide persönlichen Texte automatisiert wortgetreu mit AP-186 verglichen. Übrige
  Homepage außerhalb der mobilen Sektion bis auf die eigene CSS-Version identisch.
  Hero, Kennzahlen, Bildkontur, Originalgrafiken und JavaScript unverändert.
- git diff --check bestanden. Temporäre Schriftprüfseite nach der Prüfung entfernt.


## AP-188 – Gartenwunsch-Button wieder unter der Bildfolge (05.09.2026)

- Neuer Prüfrahmen des Auftraggebers: ausschließlich iPhone 15 Pro und iPhone 16 Pro.
  Browserprüfung bei 393 × 852 und 402 × 874 CSS-Pixeln. Die temporären Prüfseiten
  entfernen nur den Platzbedarf des Desktop-Scrollbalkens, sodass 393 bzw. 402 px
  tatsächliche Inhaltsbreite zur Verfügung stehen. Kein Test auf physischen iPhones.
- Auf beiden Breiten visuell geprüft: Button 345 bzw. 354 px breit, 56 px hoch,
  Beschriftung einzeilig. 40 px Abstand zum Foto und mindestens 17 px freie Distanz
  zum Blumensiegel. Kein horizontaler Seitenüberstand bei normaler Schrift.
- SVG-Pfad automatisiert mit AP-186 verglichen: identisch. Ursprüngliches Grün
  #8CC63F, dunkle Schrift und ursprüngliche Typografie wiederhergestellt.
- Grüner Button und vorhandener „Maik kontaktieren“-Link tatsächlich angeklickt:
  beide führen zu #anfrage und fokussieren den sichtbaren Formulareinstieg unter
  dem Header. Kein Formular abgesendet. Bildwechsel-Code unverändert.
- 200 % Schrift bei 393 px: Button wächst auf ca. 122 px Höhe, Beschriftung auf
  zwei Zeilen. Fokusrahmen vollständig sichtbar; Buttonbreite/Scrollbreite 345 px,
  neue Sektion 393 px ohne eigenen Überstand. Bekannte Bestandsbereiche erzeugen
  bei dieser Schriftgröße weiterhin einen Dokumentüberstand (448 px).
- Gesamtes vorhandenes Homepage-Markup gegen AP-187 verglichen: identisch nach
  Abzug des ergänzten Buttons und beider Cache-Versionen. JavaScript-Syntax und
  git diff --check bestanden. Temporäre iPhone-Prüfseiten anschließend entfernt.


## AP-192 – Blumensiegel minimal nach rechts (05.09.2026)

- CSS-Position um exakt 4 px nach rechts verschoben; Größe, vertikale Position,
  Schatten und Originalgrafik unverändert.
- Visuelle Browserprüfung bei 393 × 852 und 402 × 874 CSS-Pixeln. Kein horizontaler
  Überstand der neuen Sektion und keine Berührung mit Bildpunkten oder Button.
- Homepage-Markup bis auf die CSS-Cache-Version unverändert; git diff --check bestanden.


## AP-193 – Gartenwunsch-Button unter den Texten (05.09.2026)

- Button im Markup hinter die vollständige Einladung verschoben; 28 px Abstand
  nach dem gemeinsamen Text-/CTA-Block.
- Visuelle Browserprüfung bei 393 × 852 und 402 × 874 CSS-Pixeln: Button erscheint
  unter „Damit ihr Garten Sie jederzeit … laufende Pflegearbeiten.“ und bleibt einzeilig.
- Buttonziel #anfrage, Bildfolge, Blumensiegel, zweiteiliger CTA und Textwortlaut
  unverändert. Kein horizontaler Überstand der neuen Sektion; git diff --check bestanden.


## AP-194 – Gelber Pinselstrich zur Galerie (05.09.2026)

- Markenfarbe anhand der vorhandenen Logo-SVGs bestätigt: #FFED00. Skalierbarer
  SVG-Pinselstrich mit dezenter dunkler Farbspur und Schatten umgesetzt.
- „Zur Galerie“ nur noch einmal sichtbar und als eigener Link am Blumensiegel;
  bisheriger Galerie-Bereich im rechten CTA entfernt. „Maik kontaktieren“ bleibt
  als eigenständiger kompakter CTA erhalten.
- Visuelle Browserprüfung bei 393 × 852 und 402 × 874 CSS-Pixeln: Beschriftung frei,
  Blume nur über dem oberen Strichrand, kein horizontaler Seitenüberstand.
- Galerie-Link, Kontakt-CTA und grüner Haupt-CTA per Tastatur erreichbar; Fokusrahmen
  sichtbar. Linkziele unverändert. Bildwechsel und Texte unverändert.
- git diff --check bestanden.


## AP-195 – Galerie und Siegel auf gegenüberliegenden Bildecken (05.09.2026)

- Das unveränderte Blumensiegel bleibt unten rechts; der gelbe Galerie-Link sitzt
  unten links und überlappt die Bildkante um exakt 8 px.
- Pinselbreite bei beiden Zielbreiten 122,5 px; Markenbereich auf 40 px verkürzt.
- Visuelle Browserprüfung bei 393 × 852 und 402 × 874 CSS-Pixeln. Navigationspunkte
  bleiben frei; kein horizontaler Überstand der neuen Sektion.
- Galerie-Link per Tastatur fokussiert; der 2-px-Fokusrahmen mit 4 px Abstand bleibt
  vollständig sichtbar. Linkziel, Bildwechsel, Kontakt-CTA, Haupt-CTA und Einladung
  bleiben unverändert.


## AP-196 – Blumensiegel oben links, Galerie-Link unten rechts (05.09.2026)

- Beide Akzente diagonal verteilt: unverändertes Header-Blumensiegel oben links,
  gelber Galerie-Pinsel unten rechts.
- Siegel in die Bildfigur verschoben und 12 px unter deren Oberkante verankert.
- Visuelle Browserprüfung bei 393 × 852 und 402 × 874 CSS-Pixeln. Der Galerie-Link
  berührt die mittigen Navigationspunkte nicht.
- Alle vier Gartenmotive bei 402 px durchgeschaltet: Siegel bleibt erkennbar und
  verdeckt keinen für die Bildaussage entscheidenden Bereich.
- Galerie-Link 122,5 px breit und 8 px über der Bildkante; bei 402 px endet er bei
  x = 378 px innerhalb der 402 px breiten Ansicht. Kein horizontaler Überstand.
- Linkziel, Kontakt-CTA, Haupt-CTA, Bildwechsel und Texte unverändert.


## AP-197 – Galerie-CTA höher und verfeinert (05.09.2026)

- Linkfläche bei 393 × 852 und 402 × 874 CSS-Pixeln mit 126 × 44 px gemessen.
- Linkbox 14 px über der unteren Bildkante; der sichtbare gelbe Pinsel greift durch
  seinen organischen Innenrand etwa 6 px in das Foto.
- Helle Farbspur, weicher Schatten und dezente Textaufhellung visuell auf beiden
  Zielbreiten geprüft. Der CTA bleibt klar kleiner als der grüne Haupt-CTA.
- Kein horizontaler Überstand. Fokusrahmen per Tastatur geprüft und vollständig
  sichtbar; Linkziel und übrige Bedienung unverändert.


## AP-198 – Siegel-Überlappung oben links spiegeln (05.09.2026)

- Frühere Zwei-Drittel-Überlappung von unten rechts proportional nach oben links
  gespiegelt: ein Drittel oberhalb des Bildes, zwei Drittel auf dem Foto.
- Bei 393 px: 22,45 px außen und 44,91 px auf dem Bild bei 67,36 px Siegelhöhe.
- Bei 402 px: 22,84 px außen und 45,72 px auf dem Bild bei 68,56 px Siegelhöhe.
- Visuell auf beiden Zielbreiten geprüft. Abstand zum letzten KPI bleibt frei,
  kein horizontaler Überstand; Galerie-CTA und übrige Sektion unverändert.


## AP-199 – Rechteckige Bilder mit runden Ecken (05.09.2026)

- SVG-Clip und zugehörige ausgeblendete Geometrie aus Markup und CSS entfernt.
- Berechneter Bildstil bei 393 × 852 und 402 × 874 CSS-Pixeln geprüft:
  clip-path: none und border-radius: 16px.
- Unverändertes 4:3-Format gemessen: 345 × 258,75 px beziehungsweise
  354 × 265,5 px. Kein horizontaler Überstand.
- Blumensiegel, Galerie-CTA, Navigationspunkte, Bildwechsel und Texte unverändert.


## AP-200 – Siegel unten links, Galerie-CTA mittig (05.09.2026)

- Siegel unten links mit früherer Zwei-Drittel-Überlappung: bei 393 px 44,91 px
  auf dem Foto und 22,45 px darunter; bei 402 px 45,72 px und 22,84 px.
- Galerie-Link bei beiden Zielbreiten exakt auf der Bildmitte gemessen:
  196,5 px bei 393 px und 201 px bei 402 px Inhaltsbreite.
- Linkbox beginnt unterhalb des Bildes und berührt die Navigationspunkte nicht.
  Zwischen Siegelbox und Link bleiben 23,94 beziehungsweise 26,53 px frei.
- Kein horizontaler Überstand; Bildwechsel, Linkziele, Texte und übrige CTAs
  unverändert.


## AP-201 – Siegel unten rechts (05.09.2026)

- Siegel horizontal nach unten rechts gespiegelt; Größe und vertikale
  Zwei-Drittel-Überlappung unverändert.
- Abstand zum mittigen Galerie-Link bei 393 px: 23,94 px; bei 402 px: 26,53 px.
- Visuell auf beiden Zielbreiten geprüft. Kein horizontaler Überstand;
  Galerie-Link, Bildwechsel, Linkziele und übrige Inhalte unverändert.


## AP-202 – Siegel direkt auf der unteren rechten Ecke (05.09.2026)

- Siegelrahmen auf beiden Zielbreiten exakt 12 px über die rechte Bildkante
  hinausgeführt; vertikale Überlappung und Größe unverändert.
- Verbleibender Abstand zum Ansichtsrand: 12 px bei 393 px und 402 px.
- Freiraum zum mittigen Galerie-Pinsel: 42,91 px beziehungsweise 46 px.
- Visuell auf beiden iPhone-Breiten geprüft; kein horizontaler Überstand.
  Galerie-Link, Bildwechsel, Texte und übrige Inhalte unverändert.


## AP-203 – Siegel 4 px weiter rechts (05.09.2026)

- Ausschließlich die horizontale Siegelposition von -12 px auf -16 px geändert.
- Bei 393 px und 402 px verbleiben jeweils 8 px zwischen SVG-Rahmen und Ansichtsrand.
- Visuell bei 393 px sowie rechnerisch bei 402 px geprüft; kein horizontaler
  Überstand. Größe, Überlappung und übrige Sektion unverändert.


## AP-204 – Drei Bilder und Galerie-Link tiefer (05.09.2026)

- „Blühender Vorgarten“ vollständig aus der mobilen Bildfolge entfernt.
- Drei reale Motive und drei passende Punkte geprüft. Startbild, Fallback-
  Unterschrift und erster Alternativtext gehören zu „Pflasterflächen und Rasen“.
- Alle drei Punkte bei 402 px betätigt: aktive Position und versteckte
  Bildunterschrift wechseln synchron; drei Originale plus zwei Randduplikate.
- Galerie-Link beginnt 6 px unter der Bildkante, Markenbereich 54 px hoch.
- Visuell bei 393 × 852 und 402 × 874 CSS-Pixeln geprüft. Kein horizontaler
  Überstand; Siegel, Linkziel, Texte und übrige CTAs unverändert.


## AP-205 – „Maik kontaktieren“ entfernen (05.09.2026)

- Kontakt-Link, Aktionscontainer und sämtliche nur dafür verwendeten CSS-Regeln
  entfernt; kein sichtbares oder verstecktes Vorkommen mehr vorhanden.
- Textspalte bei 393 px mit 345 px und bei 402 px mit 354 px Breite gemessen.
- Grüner Haupt-CTA besitzt weiterhin dieselbe volle Breite und sein bestehendes
  Ziel. Galerie-Link, Bilder, Siegel und Texte unverändert.
- Visuell auf beiden Zielbreiten geprüft; keine Lücke und kein horizontaler
  Überstand.


## AP-206 – Fragen links, Antworten rechts (05.09.2026)

- Beide Antwortsätze in eigene Blockelemente überführt; Fragen und Wortlaut
  unverändert.
- Berechnete Antwortausrichtung auf beiden Zielbreiten rechtsbündig. Breite
  jeweils 307,19 px; rechte Kante bei x = 369 px beziehungsweise x = 378 px.
- Erster Antworttext über zwei Zeilen, zweiter über drei Zeilen visuell geprüft.
- Grüner Haupt-CTA bleibt darunter; kein horizontaler Überstand und keine
  zusätzlichen dekorativen Elemente.


## AP-207 – Offene Antwortflächen mit Hero-Blüte (05.09.2026)

- Visuell bei 393 × 852 und 402 × 874 CSS-Pixeln geprüft. Beide Antwortzeilen
  schließen rechts bei x = 369 px beziehungsweise x = 378 px ab; ihre maximale
  Breite beträgt jeweils 326,39 px.
- Die Textflächen messen bei beiden Zielbreiten rund 289 px. Blüten erscheinen
  proportional mit 29,47 px beziehungsweise 30,14 px, bleiben vollständig
  sichtbar und stehen mit 8 px Abstand außerhalb der Textfläche.
- Antwortfarbe, 500er Gewicht, 22,4 px Zeilenhöhe, rechte Kontur und ausschließlich
  rechts gerundete 14-px-Ecken per berechnetem Stil bestätigt. Der Kontrast von
  `#B6D97A` auf dem stärksten 18-prozentigen Verlaufsteil beträgt rund 9,4:1.
- Screenreader-Reihenfolge im Markup geprüft: Frage, „Maiks Antwort:“, Antwort.
  Beide Bilder besitzen leeren Alternativtext und `aria-hidden="true"`.
- Mit gezielt auf 200 % gesetzten Frage-, Antwort- und CTA-Schriftgrößen wachsen
  alle Flächen ohne Abschneiden, Blütenüberlagerung oder horizontalen Überstand.
- Bei 393 px und 402 px stimmen Dokument- und Ansichtsbreite exakt überein. In der
  Desktop-Vorschau bleibt die mobile Sektion ausgeblendet; CSS-Cachekennung
  `20260905am` ist geladen.


## AP-208 – Erste Dialogantwort präzisieren (05.09.2026)

- Sichtbaren Antworttext und zugängliche Lesereihenfolge auf „Maiks Antwort:
  Kein Anliegen ist uns zu klein oder zu spontan.“ geprüft.
- Keine CSS-, Layout- oder Bedienänderung.


## AP-209 – Dialogtexte sprachlich schärfen (05.09.2026)

- Beide Fragen und Antworten wortgetreu gegen die abgestimmte Fassung geprüft.
- Zweite Frage beginnt direkt mit „Im Urlaub“; „Länger weg“ und „nur“ entfallen.
- Formelle Anrede „Ihren“ sowie Gedankenstriche und Zeichensetzung geprüft.
- Bei 393 × 852 und 402 × 874 CSS-Pixeln erscheinen beide Antworten mit
  identischer Höhe von 91,17 px über jeweils drei Zeilen. Kein horizontaler
  Überstand; keine CSS- oder Bedienänderung.


## AP-210 – Anfrage-CTA mit „MIT MAIK“-Stempel (05.09.2026)

- Standardpfeil vollständig entfernt; sichtbare Beschriftung und zugänglicher
  Name lauten „Gartenwunsch besprechen“ beziehungsweise „Gartenwunsch mit Maik
  besprechen“.
- Eigenständige gelbe Vektorfläche mit zweizeiligem „MIT MAIK“ innerhalb der
  diagonalen rechten Ecke ergänzt.
- Mindesthöhe auf 64 px, Beschriftung auf bis zu 18 px und Gewicht 800 erhöht.
- Linkziel und gelber Fokusrahmen bleiben erhalten; Übergänge werden bei
  reduzierter Bewegung deaktiviert.
- CSS-Cachekennung auf `20260905an` erhöht.
- Bei 393 × 852 und 402 × 874 CSS-Pixeln misst der CTA 345 × 64 px
  beziehungsweise 354 × 64 px. Beschriftung und Stempel bleiben einzeilig;
  zwischen beiden verbleiben mindestens 4,74 px sichtbarer Freiraum.
- Bei 200 % Beschriftungsgröße wächst der CTA auf 104 px Höhe. Der Text bricht
  ausschließlich zwischen ganzen Wörtern um und bleibt ohne Überlagerung neben
  dem Stempel. Kein horizontaler Seitenüberstand.
- Laufzeit-Linkziel `#anfrage`, zugänglicher Name, gelber Fokusrahmen und
  praktisch deaktivierte Übergangsdauer bei reduzierter Bewegung geprüft.


## AP-211 – „MIT MAIK“-Stempel entfernen (05.09.2026)

- Gelben Stempel, Stempeltext und ausschließlich dafür benötigte CSS-Regeln
  vollständig entfernt.
- Sichtbarer und zugänglicher Linktext lautet wieder ausschließlich
  „Gartenwunsch besprechen“.
- Höhe von 64 px, Schriftgröße bis 18 px, Gewicht 800, Grundform, Buttonfarbe,
  Schatten, Fokusrahmen und Linkziel bleiben erhalten.
- CSS-Cachekennung auf `20260905ao` erhöht.
