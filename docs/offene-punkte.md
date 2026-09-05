# Offene Punkte

Fehlende Fakten, die der Auftraggeber nachliefert. Jeder Eintrag ist im Quelltext als
`<!-- OFFEN: … -->` markiert. **Keine dieser Lücken blockiert ein Arbeitspaket** — Texte sind
so formuliert, dass sie auch ohne den Wert vollständig und richtig sind.

Sobald ein Wert vorliegt: in `content/stammdaten.json` eintragen (AP-03), den
`<!-- OFFEN -->`-Kommentar auflösen, Zeile hier streichen.

**Stand:** 12.08.2026

## Kontaktdaten — ERLEDIGT (AP-03, 25.07.2026)

Alle Kontaktdaten wurden vom Auftraggeber geliefert und zentral in
`content/stammdaten.json` hinterlegt sowie zeichengleich über alle Seiten, den Footer
und das JSON-LD verteilt:

- Mobil / WhatsApp: `0171 / 173 89 43` (`tel:+491711738943`, `wa.me/491711738943`)
- Festnetz: `02325 / 58 57 90` (`tel:+492325585790`)
- E-Mail: `Maik@rohdich.de`

## Standort und Profile

| Wert | Fundstellen | AP |
|---|---|---|
| Geokoordinaten Hülsstraße 5, 44625 Herne | JSON-LD `geo` auf der Startseite | AP-21 |
| Google Place ID | `content/stammdaten.json` | AP-20 |
| Google-Unternehmensprofil-URL | JSON-LD `sameAs` | AP-21 |
| Social-Media-Profile | JSON-LD `sameAs` | AP-21 |
| Echtes Logo als `assets/img/logo/logo.svg` | derzeit nur `favicon.svg` vorhanden | AP-06 / AP-21 |

## Fachliche Angaben

| Wert | Fundstellen | AP |
|---|---|---|
| ~~Zertifizierungsstandard der Baumkontrolle (FLL o. a.)~~ — **ERLEDIGT (AP-176, 05.09.2026):** Landwirtschaftskammer-Zertifizierung, vom Auftraggeber auf Rückfrage bestätigt. Steht in Teil B. Nicht FLL — `stammdaten.json → offen.fllZertifizierung` bleibt daher `null`. | — | AP-176 |
| Reaktionszeit Sturmnotdienst | `gewerbekunden/index.html`, `content/leistungen/gewerbe/sturmnotdienst.json` | AP-13 / AP-33 |
| Betriebshaftpflicht: Versicherer und Deckungssumme | `gewerbekunden/index.html`, `content/leistungen/gewerbe/baumarbeiten.json` | AP-13 / AP-33 |
| Zwei gewerbliche Referenzobjekte inkl. Ort und Objektart | `gewerbekunden/index.html` | AP-13 / AP-23 |
| Vertragslaufzeiten und Reaktionszeiten im Gewerbebereich | `gewerbekunden/index.html`, `content/leistungen/gewerbe/sturmnotdienst.json` | AP-13 / AP-23 / AP-33 |
| Sicherungsausrüstung und Qualifikation für Arbeiten auf Dachflächen | `content/leistungen/gewerbe/dachbegruenung.json` | AP-33 |
| Details zum Partnerbetrieb in Bochum | noch ohne Fundstelle | AP-23 |
| Fassaden-/Stellplatzbegrünung: Systeme, Aufbauten, Referenzen | `content/leistungen/gewerbe/dachbegruenung.json` | AP-110 |
| Umgestaltung: Maschinenpark-Details, typische Projektgrößen | `content/leistungen/gewerbe/umgestaltung-aussenanlagen.json` | AP-111 |
| Begutachtung: Bestellungskörperschaft des Gutachtertitels (2.4.1), Honorarrahmen, Beispiel-Gutachten | `content/leistungen/gewerbe/begutachtung.json` | AP-112 |

**AP-33:** In den vier Gewerbe-Leistungsdateien waren zu diesen Punkten FAQ-Antworten als
`[OFFEN: …]` entworfen. Da FAQ-Antworten sichtbar auf der Seite **und** im FAQPage-Schema
ausgegeben werden (Grundregel 2: kein sichtbarer Platzhaltertext), wurden die betroffenen
Fragen entfernt statt mit Platzhaltern zu veröffentlichen. Sobald die Werte vorliegen:
Fragen wieder aufnehmen und beantworten.

**AP-110–112 (gleiche Regel):** Die neuen bzw. verbreiterten Gewerbe-Seiten
(`umgestaltung-aussenanlagen`, `begutachtung`, `dachbegruenung`) sind bewusst so
formuliert, dass sie nur bestätigte Fakten der Gewerbekunden-Seite verwenden.
Die drei Zeilen oben nennen, was fehlt, um die Seiten inhaltlich zu vertiefen —
keine sichtbaren Platzhalter im Seitentext.

## Ueber-uns-Sektion (AP-127)

| Wert | Fundstellen | AP |
|---|---|---|
| Freigabe der drei O-Töne des Redesign-Mockups | `index.html` (`<!-- OFFEN -->` in `.ueber-content`) | AP-127 |
| Hochauflösende Originale für Leitfoto und Hebeaktion-Foto | `assets/img/_src/ueber-team.jpg`, `assets/img/_src/ueber-hebeaktion.jpg` | AP-127 |

**O-Töne:** Das Mockup schlug drei Zitate für die Sektion vor, jedes dort selbst mit
„Freigabe Maik" markiert — also ausdrücklich noch nicht freigegeben. Zwei sind wörtliche
Aussagen von Maik Rohdich („Was auf Pinterest gut aussieht, funktioniert nicht auf jedem
Grundstück …" und „Für die Palmen mische ich meine eigene Erde …"), eines ist eine
Sammelaussage über Kunden („Er redet keinem nach dem Mund." / „Was Kunden am häufigsten
über ihn sagen"). Keine dieser Aussagen ist im Repo belegt. Nach Grundregel 1 sind sie
deshalb **nicht** veröffentlicht; die Sektion ist ohne sie vollständig und richtig. Das CSS
für den Zitatblock wurde bewusst noch nicht angelegt, damit keine toten Regeln entstehen.
Sobald die Freigabe vorliegt: Markup und Gestaltung nach Vorlage des Mockups ergänzen.
Die Sammelaussage über Kunden bleibt auch dann heikel — sie lässt sich nicht belegen.

**Fotos:** Leitfoto (Mitarbeiter mit `rohdich.de`-Weste) und Hebeaktion-Foto liegen nur als
560 px breite Vorschauen vor, aus dem Mockup extrahiert. Das Leitfoto wird auf dem Desktop
ca. 390 px breit angezeigt, für 2x-Displays bräuchte es ~780 px; aktuell ist es dort sichtbar
weicher. Sobald die Originale vorliegen: Dateien in `assets/img/_src/` ersetzen (gleiche
Namen) und `npm --prefix .github/scripts run build-images` laufen lassen — die Breitenliste
passt sich selbst an, an `build-images.mjs` ist nichts zu ändern.

## Rechtstexte

| Wert | Fundstellen | AP |
|---|---|---|
| Impressum (Pflichtangaben vom Anbieter: Kontakt, USt-/Steuernr. usw.) | `content/rechtstexte/impressum.body.html` | AP-11 |
| Datenschutzerklärung (Volltext vom Anbieter) | `content/rechtstexte/datenschutz.body.html` | AP-11 |

## AP-F15 — Wortlaut des Versandhinweises

Das Kurzanfrageformular hat keinen Endpunkt; ein Versand findet nicht statt. Beim Absenden
erscheint deshalb ein Hinweis statt einer Erfolgsmeldung — ein Erfolgszustand ohne echten
Versand ist ausgeschlossen.

Der derzeitige Wortlaut nennt ausschliesslich belegte Angaben (Mobilnummer, WhatsApp-Link,
`maik@rohdich.de` — alle bereits an anderer Stelle der Seite gefuehrt):

> Der Formularversand ist noch nicht aktiv. Ihre Anfrage erreicht uns bis dahin telefonisch
> unter 0171 / 173 89 43, per WhatsApp oder per E-Mail an maik@rohdich.de.

**Offen:** Bestaetigung des Wortlauts durch den Auftraggeber. Er darf unter keinen Umstaenden
nach „gesendet" klingen. Fundstelle: `assets/js/anfrage.js`, Konstante `HINWEIS`.

**Offen:** Der Datenschutz-Hinweis unter dem Kurzformular verweist auf `datenschutz/`, statt
eine Einwilligungs-Checkbox zu erzwingen. Begruendung: die Bearbeitung einer Anfrage stuetzt
sich ueblicherweise auf Vertragsanbahnung, nicht auf Einwilligung. Das ist eine Rechtsfrage —
vor dem Go-live anwaltlich rueckversichern.

## AP-F17 — `#kontakt` zeigt seit AP-F14 auf den Gewerbe-Teaser

> **Weitgehend erledigt mit AP-F20 (02.09.2026).** Der Auftraggeber hat den Gewerbe-Zweig
> von der Startseite entfernt. Damit gab es keinen Grund mehr, den Anker dort zu lassen:
> `id="kontakt"` sitzt jetzt auf der Sektion „Der erste Schritt zu Ihrem Gartenprojekt."
> Alle 35 Verweise aus 21 Dateien landen dadurch beim Anfrageformular — ohne dass eine
> einzige der 21 Dateien angefasst werden musste. Gemessen: Sprungziel 96 px unter der
> Fensterkante, 5 px unter dem festen Header, Überschrift sichtbar.
>
> **Offen bleibt allein die Feinsteuerung:** ob die 21 Links aus
> `gewerbekunden/leistungen/*` weiterhin zur Startseite führen sollen oder besser zu
> `gewerbekunden/#anfrage`, wo das passende Gewerbeformular steht. Das ist eine
> inhaltliche Entscheidung, kein Fehler mehr — der bisherige Zustand (Landung auf einem
> Knopf nach `/gewerbekunden/`) ist in jedem Fall behoben.

Der ursprüngliche Befund zur Nachvollziehbarkeit:

**Befund vom 02.09.2026**, aufgedeckt bei der Generator-Prüfung. Kein Fehler im Generator —
der erzeugt exakt das, was ausgeliefert ist. Es ist eine inhaltliche Verschiebung.

AP-F14 hat die `fork`-Sektion der Startseite auf „ein Satz, ein CTA" reduziert; sie ist
seither der **Gewerbe-Zweig**. Ihre `id="kontakt"` blieb bewusst stehen, weil zahlreiche
Seiten diesen Anker anspringen — eine Umbenennung hätte sie alle gebrochen. Damit stimmt
aber das Ziel nicht mehr: `#kontakt` ist heute eine Überschrift mit einem Knopf nach
`/gewerbekunden/`, **kein Kontaktformular**.

**33 Links landen dort:**

| Herkunft | Anzahl | Beschriftung |
|---|---|---|
| `projekte/*` | 10 | „Ähnliches Projekt geplant? Jetzt anfragen" |
| `gewerbekunden/leistungen/*` | 21 | „Termin vereinbaren", „Projekt besprechen", „Kontakt aufnehmen" |
| `privatkunden/leistungen/pool-whirlpool-umfeld/` | 1 | „Zum Kontakt" (Pool-Rechner) |
| `404.html` | 1 | |

Wer auf einer Projektseite „Jetzt anfragen" klickt, landet beim Gewerbe-Teaser statt beim
Anfrageformular. Die Links sind nicht tot, sie führen an der Absicht vorbei.

**Fundstellen im Generator** (drei Stellen, alles andere läuft bereits richtig):

- `.github/scripts/lib/render.mjs:234` — Pool-Rechner, „Zum Kontakt"
- `.github/scripts/lib/render.mjs:654` — der `#kontakt`-Zweig in `leistungContactHref()`,
  greift für die Gewerbe-Welt
- `.github/scripts/templates/projekt.html:82` — „Ähnliches Projekt geplant?"

Die 13 Privat-Leistungsseiten sind **nicht** betroffen; sie laufen seit AP-F17 über
`?pfad=…#anfrage`.

**Zielanker sind vorhanden:** `#anfrage` auf der Startseite (Kurzformular und Assistent),
`#anfrage` auch auf `/gewerbekunden/` (eigenes Gewerbeformular).

**Offen: Entscheidung des Auftraggebers.** Zwei sinnvolle Wege — entweder alle 33 Links auf
`#anfrage` der Startseite, oder je Welt getrennt: Projektseiten, Pool-Seite und 404 auf die
Startseite, die 21 Gewerbe-Links auf `gewerbekunden/#anfrage`, wo das passende Formular
steht. Bewusst zurückgestellt, bis die Kontaktführung insgesamt entschieden ist — die
Sektionsfolge der Startseite wurde gerade erst festgelegt.

**Nebenbefund:** Die GitHub Action ruft nur `check-config-sync`, `build-index`,
`build-gallery-teaser` und `build-footers` auf. `build-leistungen.mjs` und
`build-rechtstexte.mjs` laufen nur von Hand. Deshalb hinken die 20 Leistungsseiten und die
2 Rechtstextseiten derzeit der Header-Vorlage hinterher: dort fehlt die `aria-label`-
Entfernung an Anruf-Button und WhatsApp-Link (davidk., 01.09.2026). Unkritisch, beide
Elemente behalten ihren Namen aus dem sichtbaren Text — beim nächsten Handlauf gleicht es
sich an.

## AP-F24 — „Spontane Einsätze möglich" ist eine neue Aussage des Auftraggebers

**Vom 02.09.2026.** Der dritte Punkt der Karte „Auch kleine und einmalige Arbeiten." auf
der Startseite hieß bis dahin „Ohne Vorkasse" mit dem Zusatz „Bei kleineren Aufträgen ist
eine Anzahlung in der Regel nicht nötig." Das war aus einer **freigegebenen** FAQ-Antwort
abgeleitet (Umsetzungsplan Teil B, Zeile 574: „Verlangen Sie Vorkasse?").

Der Auftraggeber hat den Punkt auf **„Spontane Einsätze möglich"** geändert. Diese Aussage
steht so **nirgends in Teil B**.

**Warum sie trotzdem drin ist:** Sie nennt keine Frist. Der Umsetzungsplan führt
„Reaktionszeit Sturmnotdienst" ausdrücklich als offenen Punkt (Zeile 101) und gibt für
genau diesen Fall die Anweisung, den Satz ohne den fehlenden Fakt vollständig zu
formulieren (Zeile 87). „möglich" tut das. Der Auftraggeber hat den Wortlaut selbst
gewählt — aus drei vorgelegten Varianten die zurückhaltendste.

**Zu bestätigen:** Ob spontane Einsätze tatsächlich zugesagt werden sollen und in welchem
Rahmen. Falls daraus je eine konkrete Frist werden soll, gehört sie zuerst nach Teil B.

**Nachzuziehen bei nächster Gelegenheit:** Der Kommentar über den Regeln in
`assets/css/styles.css:899` lautet „Alle Aussagen stammen aus freigegebenen FAQ-Antworten."
Das greift seit dieser Änderung zu weit. Nicht sofort korrigiert, weil jede Änderung an
`styles.css` den `?v=`-Durchlauf über 37 HTML-Dateien nach sich zieht — für einen
Kommentar ohne sichtbare Wirkung. Beim nächsten Durchgang, der die Datei ohnehin anfasst,
mitnehmen. Dort wird auch die dann tote Regel `.proof-klein-list p` fällig.

## AP-179 — Über-uns-Sektion: Aussagen, Entscheidungen, fehlendes Material

**Vom 05.09.2026.** Die Sektion steht zwischen Galerie-Teaser und Leistungen.

### Drei Formulierungen aus dem gelieferten Text stehen nicht in Teil B

Der Auftraggeber hat sie nach Rückfrage **ausdrücklich unverändert** übernommen haben
wollen. Damit später niemand rätselt, woher sie stammen:

| Formulierung | Konflikt |
|---|---|
| „ein umfangreicher Maschinenpark" | Teil B, Zeile 43: „Keine Mitarbeiterzahlen, keine Fuhrparkgrößen, kein Teamfoto — **ausdrücklicher Wunsch des Betriebsinhabers**" |
| „Eigene Fachkräfte" | grenzt an eine Personalangabe |
| „termingerecht umgesetzt" | Terminversprechen; Teil B führt Reaktionszeiten als offenen Punkt |

**Zu klären:** ob der Betriebsinhaber diese drei Aussagen mitträgt — die Vorgabe stammt
laut Teil B von ihm selbst.

### Was geändert wurde

Der gelieferte Text nannte **„Seit über 25 Jahren"**. Angeglichen auf **20**: Die Seite
nennt 2003 als Gründung an vier Stellen, die Proof-Sektion „20+ Jahre", und der
Willkommen-Text weiter oben „Seit über 20 Jahren". Derselbe Fall war bei AP-174 schon
einmal so entschieden worden.

### Zeilenlänge auf Mobil — bewusst so entschieden

Block 2 steht **auch auf Mobil** nebeneinander, wie skizziert. Gemessen bei 375 px:
Inhaltsbreite 363 px, Textspalte 52 % = 189 px, bei 7,27 px je Zeichen also **26 Zeichen
pro Zeile**. Typografisch empfohlen sind 45–75. Der Auftraggeber hat das in Kenntnis dieser
Zahl bestätigt. Falls es sich im Betrieb als zu eng erweist: ein Umbruchpunkt bei ~600 px
brächte rund 48 Zeichen.

### Fehlendes Material — die Sektion ist unvollständig

| Was | Wohin | Status |
|---|---|---|
| Foto für Block 2 | `assets/img/_src/` | fehlt; `figure` ist auskommentiert |
| Mustergarten-Video | `assets/video/mustergarten.mp4` | **geliefert** — siehe eigenen Abschnitt unten |
| Plakatbild zum Video | `assets/img/_src/` | fehlt — auf dem Entwicklungsrechner liegt kein `ffmpeg`, ein Standbild lässt sich nicht selbst erzeugen |
| Bildunterschrift Block 2 | — | beginnt laut Skizze mit „Unser …" |
| Text Block 4 | — | Stichworte: „Damit wir uns Zeit nur für Sie nehmen", „Inspiration Mustergarten" |

**Wichtig für die Fotoauswahl:** Der Textumfluss ist eingerichtet, greift aber nur, wenn der
Text **länger** ist als das Foto hoch. Mit einem 4:3-Foto bei 42 % Breite gemessen: Foto
375 px hoch, Text 245 px — der Text endet 131 px **vor** dem Fotoende, es läuft also keine
Zeile darunter. Damit der skizzierte Umfluss sichtbar wird, braucht es einen **breiten,
flachen Bildausschnitt** (etwa 16:9 oder flacher) oder mehr Text.

### Ebenfalls offen

`assets/img/ueber/ueber-3` liegt um 90° gedreht vor — die Ableitung wurde ohne Beachtung
der EXIF-Orientierung erzeugt. Vor einer Verwendung neu bauen.

### Das Mustergarten-Video ist KI-generiert

**Vom 05.09.2026.** Die gelieferte Datei stammt aus Midjourney — erkennbar am
Ursprungsnamen `u1187684669_httpss.mj.run…`. Sie zeigt **nicht** den realen Mustergarten
in Herne.

Das steht in Spannung zu Grundregel 1 („Niemals Fakten erfinden") und zum Bildbestand
dieses Projekts, in dem generiertes Material nicht als Referenzaufnahme dienen soll. Die
Seite behauptet an mehreren Stellen etwas Konkretes: „1.500 m² Mustergarten in Herne",
„Unser Mustergarten mit Sitz in Herne".

**Der Auftraggeber hat nach Rückfrage entschieden, sie trotzdem als Mustergarten
einzubauen.** Hier festgehalten, damit es bei einer späteren Prüfung nicht übersehen wird.

**Zu klären:** ob der Betriebsinhaber das mitträgt — es geht um die Darstellung seines
eigenen Betriebsgeländes gegenüber Kunden.

### Technische Punkte zum Video

| Punkt | Befund |
|---|---|
| Auflösung | **720 × 544**. Randlos hochskaliert auf 1,67× bei 1200 px und 2,22× bei 1600 px Fensterbreite. Auf dem Telefon wird sie herunterskaliert (0,52×) und ist dort scharf. Eine höher aufgelöste Fassung würde das beheben. |
| Format | 4:3-nah. Ungeschnitten ergäbe das randlos einen 907 px hohen Block. Deshalb als Band gesetzt: `aspect-ratio: 16/9` mit `object-fit: cover`, gedeckelt auf 62 % Fensterhöhe. Der Film wird oben und unten beschnitten, nicht verzerrt. |
| Dauer | 5,2 Sekunden |
| Dateigröße | 9,0 MB, im Repository versioniert |
| Plakatbild | keines. Ohne `ffmpeg` lässt sich kein Standbild erzeugen; Browser zeigen mit `preload="metadata"` das erste Einzelbild. Ein eigenes Plakatbild wäre trotzdem besser. |
| Vorladen | **AP-180:** `preload="none"`, Start erst im Sichtfeld. Autostart würde sonst die 9 MB bei jedem Seitenaufruf laden, auch für Besucher, die den Block nie erreichen. Ein `IntersectionObserver` lädt und startet erst beim Erscheinen und hält beim Verlassen an. |

### AP-180 — Autostart in Schleife, 0,75-fache Geschwindigkeit

**Vom 05.09.2026.** Auf Wunsch des Auftraggebers läuft das Video stumm, in Endlosschleife
und startet von selbst.

| Punkt | Umsetzung |
|---|---|
| Geschwindigkeit | 0,75×. `playbackRate` gibt es **nur** als JavaScript-Eigenschaft, kein HTML-Attribut — deshalb `assets/js/ueber-video.js`. Die Rate wird bei `loadedmetadata` **und** bei jedem `play` gesetzt, weil manche Browser sie nach einem `load()` auf 1 zurückstellen. |
| Laufzeit | aus 5,21 s werden **6,95 s** |
| Datenmenge | Start ist ans Sichtfeld gekoppelt (`preload="none"` + `IntersectionObserver`). Wer den Block nie erreicht, lädt die 9 MB nicht. Ausserhalb des Blicks hält das Video an. |
| Anhalten | `controls` bleibt. Bewegung, die von selbst startet und länger als 5 s läuft, muss sich nach WCAG 2.2.2 anhalten lassen — bei 6,95 s ist das der Fall. |
| Bewegungsreduzierung | Bei `prefers-reduced-motion: reduce` **kein** Autostart. Im Vorschau-Panel liess sich die Einstellung nicht emulieren; stattdessen wurde die Bedingung direkt geprüft, indem `matchMedia` umgebogen wurde. Auf einem echten Gerät mit der Einstellung sollte das noch einmal gegengeprüft werden. |

**Offen:** Ob ein automatisch startendes Video über die volle Breite inhaltlich gewollt ist,
sobald der Betriebsinhaber die Seite sieht — es ist das auffälligste Element der Startseite
und zeigt einen Garten, den es so nicht gibt (siehe Abschnitt oben).
