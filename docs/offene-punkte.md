# Offene Punkte

Fehlende Fakten, die der Auftraggeber nachliefert. Jeder Eintrag ist im Quelltext als
`<!-- OFFEN: … -->` markiert. **Keine dieser Lücken blockiert ein Arbeitspaket** — Texte sind
so formuliert, dass sie auch ohne den Wert vollständig und richtig sind.

Sobald ein Wert vorliegt: in `content/stammdaten.json` eintragen (AP-03), den
`<!-- OFFEN -->`-Kommentar auflösen, Zeile hier streichen.

**Stand:** 06.09.2026

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
| „eigenem Maschinenpark" | Teil B, Zeile 43: „Keine Mitarbeiterzahlen, keine Fuhrparkgrößen, kein Teamfoto — **ausdrücklicher Wunsch des Betriebsinhabers**" |
| „eigenen Fachkräften" | grenzt an eine Personalangabe |
| „termingerecht umgesetzt" | Terminversprechen; Teil B führt Reaktionszeiten als offenen Punkt |

**Zu klären:** ob der Betriebsinhaber diese drei Aussagen mitträgt — die Vorgabe stammt
laut Teil B von ihm selbst.

### Was geändert wurde

Der gelieferte Text nannte **„Seit über 25 Jahren"**. Angeglichen auf **20**: Die Seite
nennt 2003 als Gründung, und der
Willkommen-Text weiter oben „Seit über 20 Jahren". Derselbe Fall war bei AP-174 schon
einmal so entschieden worden.

### Zeilenlänge auf Mobil — bewusst so entschieden ~~(überholt durch AP-230)~~

> **Überholt am 06.09.2026 durch AP-230.** Der Float ist einem Raster gewichen; unter
> 860 px steht das Foto jetzt **unter** dem Text. Damit ist die unten dokumentierte
> Freigabe „auch auf Mobil nebeneinander" abgelöst — vom Auftraggeber am 06.09.2026 so
> entschieden. Grund: Die 26-Zeichen-Rechnung stützte sich auf einen Textstand von vor
> der Kürzung in AP-212. Mit dem eingesetzten Foto nachgemessen standen bei 390 px sechs
> Zeilen mit 17–21 Zeichen da, danach sprang der Text auf 48 — der Umfluss endete mitten
> im Absatz. Heute sind es rund 39 Zeichen je Zeile über den ganzen Absatz.
> Der Abschnitt bleibt stehen, damit nachvollziehbar ist, worauf die alte Entscheidung
> beruhte.

Block 2 steht **auch auf Mobil** nebeneinander, wie skizziert. Gemessen bei 375 px:
Inhaltsbreite 363 px, Textspalte 52 % = 189 px, bei 7,27 px je Zeichen also **26 Zeichen
pro Zeile**. Typografisch empfohlen sind 45–75. Der Auftraggeber hat das in Kenntnis dieser
Zahl bestätigt. Falls es sich im Betrieb als zu eng erweist: ein Umbruchpunkt bei ~600 px
brächte rund 48 Zeichen.

### Fehlendes Material — die Sektion ist unvollständig

| Was | Wohin | Status |
|---|---|---|
| Foto für Block 2 | `assets/img/_src/` | **geliefert** (AP-230, 06.09.2026): `ueber-hund.jpg`, 980 × 980 |
| Mustergarten-Video | `assets/video/mustergarten.mp4` | **geliefert** — siehe eigenen Abschnitt unten |
| Plakatbild zum Video | `assets/img/_src/` | **gesetzt** (AP-231): `mustergarten-standbild.jpg`, 960 × 725. Ein Einzelbild aus derselben Datei; auf diesem Rechner liegt weiterhin kein `ffmpeg`, der Frame kam fertig aus dem Entwurf |
| Bildunterschrift Block 2 | — | **gesetzt** (AP-230): „Feierabend im Garten." Der Entwurf „Unser …" der Skizze setzte den Namen des Hundes voraus, der weiterhin fehlt — siehe AP-230, O1 |
| Text Block 4 | — | Stichworte: „Damit wir uns Zeit nur für Sie nehmen", „Inspiration Mustergarten" |

**Wichtig für die Fotoauswahl:** ~~Der Textumfluss ist eingerichtet, greift aber nur, wenn der
Text **länger** ist als das Foto hoch.~~ **Gegenstandslos seit AP-230** — es gibt keinen
Umfluss mehr. Die Bildspalte ist fest (220–300 px am Desktop, 240 px darunter), die
Textlänge spielt für das Layout keine Rolle mehr.

Der Fließtext wurde am 05.09.2026 gekürzt und misst jetzt nur noch **82 px** - drei Zeilen
bei 1200 px Fensterbreite, zuvor 245 px. Ein 4:3-Foto bei 42 % Breite wäre 375 px hoch; der
Text endete also fast 300 px **vor** dem Fotoende, und es liefe keine einzige Zeile darunter.

Damit der in der Skizze gezeigte Umfluss überhaupt entsteht, müsste das Foto **flacher als
etwa 5:1** sein. Das ist kein üblicher Bildausschnitt. Realistisch bleiben zwei Wege: auf den
Umfluss verzichten und Text und Foto schlicht nebeneinanderstellen, oder den Text wieder
verlängern. **Zu entscheiden, sobald das Foto vorliegt.**

### Ebenfalls offen

`assets/img/ueber/ueber-3` liegt um 90° gedreht vor — die Ableitung wurde ohne Beachtung
der EXIF-Orientierung erzeugt. Vor einer Verwendung neu bauen.

### Das Mustergarten-Video — Herkunft geklärt (Korrektur vom 06.09.2026)

> **Diese Einschätzung war falsch und ist am 06.09.2026 richtiggestellt worden.**
> Das Video **zeigt die reale Anlage**. Midjourney wurde ausschließlich zur
> Qualitätsverbesserung des vorhandenen Materials eingesetzt, nicht zur Erzeugung
> des Motivs — vom Auftraggeber auf Rückfrage klargestellt. Der Ursprungsname
> `u1187684669_httpss.mj.run…` belegt nur den Durchlauf durch das Werkzeug, nicht
> die Herkunft des Bildinhalts.
>
> **Folge:** Grundregel 1 ist nicht berührt, und das Standbild darf als
> Referenzaufnahme dienen. AP-231 setzt es deshalb als `poster` ein — bis dahin
> stand bis zum Ladeende ein schwarzes Band.
>
> Der ursprüngliche Text bleibt darunter stehen, damit die Korrektur nachvollziehbar
> ist.

**Ursprünglicher Eintrag vom 05.09.2026 (überholt):** Die gelieferte Datei stammt aus
Midjourney — erkennbar am Ursprungsnamen `u1187684669_httpss.mj.run…`. Sie zeigt
~~**nicht** den realen Mustergarten in Herne~~.

Das steht in Spannung zu Grundregel 1 („Niemals Fakten erfinden") und zum Bildbestand
dieses Projekts, in dem generiertes Material nicht als Referenzaufnahme dienen soll. Die
Seite behauptet an mehreren Stellen etwas Konkretes: „1.500 m² Mustergarten in Herne",
„Unser Mustergarten mit Sitz in Herne".

**Der Auftraggeber hat nach Rückfrage entschieden, sie trotzdem als Mustergarten
einzubauen.**

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

### AP-180 — Autostart in Schleife, verlangsamte Wiedergabe

**Vom 05.09.2026.** Auf Wunsch des Auftraggebers läuft das Video stumm, in Endlosschleife
und startet von selbst.

| Punkt | Umsetzung |
|---|---|
| Geschwindigkeit | **0,6×** (AP-182, zuvor 0,75). `playbackRate` gibt es **nur** als JavaScript-Eigenschaft, kein HTML-Attribut — deshalb `assets/js/ueber-video.js`. Die Rate wird bei `loadedmetadata` **und** bei jedem `play` gesetzt, weil manche Browser sie nach einem `load()` auf 1 zurückstellen. |
| Laufzeit | aus 5,21 s werden **8,7 s** |
| Untergrenze | Die Quelle hat **24 fps** (gemessen: 72 Bilder in 3 s bei Tempo 1). Verlangsamen fügt keine Bilder hinzu: 0,6× ergibt effektiv 14,4 fps, 0,5× nur 12, 0,4× nur 9,6. Unter etwa 15 fps beginnt eine Kamerafahrt sichtbar zu haken. Weiter verlangsamen ginge nur mit Quellmaterial höherer Bildrate. |
| Datenmenge | Start ist ans Sichtfeld gekoppelt (`preload="none"` + `IntersectionObserver`). Wer den Block nie erreicht, lädt die 9 MB nicht. Ausserhalb des Blicks hält das Video an. |
| Anhalten | **Seit AP-181 nicht mehr möglich** — siehe eigenen Abschnitt unten. |
| Bewegungsreduzierung | Bei `prefers-reduced-motion: reduce` **kein** Autostart. Im Vorschau-Panel liess sich die Einstellung nicht emulieren; stattdessen wurde die Bedingung direkt geprüft, indem `matchMedia` umgebogen wurde. Auf einem echten Gerät mit der Einstellung sollte das noch einmal gegengeprüft werden. |

**Offen:** Ob ein automatisch startendes Video über die volle Breite inhaltlich gewollt ist,
sobald der Betriebsinhaber die Seite sieht — es ist das auffälligste Element der Startseite
und zeigt einen Garten, den es so nicht gibt (siehe Abschnitt oben).

### AP-181 — Das Video lässt sich nicht mehr anhalten (WCAG 2.2.2)

**Vom 05.09.2026.** Auf Wunsch des Auftraggebers ist das Video **nicht bedienbar**: keine
Steuerleiste, kein Kontextmenü, keine Reaktion auf die Maus (`controls` entfernt,
`pointer-events: none`, `tabindex="-1"`).

**Damit lässt sich die Bewegung nicht mehr anhalten.** Das Video startet von selbst und
läuft endlos, effektiv 8,7 s je Umlauf.

**WCAG 2.2.2 (Pause, Stop, Hide)** verlangt für Bewegung, die automatisch startet und
länger als fünf Sekunden dauert, eine Möglichkeit zum Anhalten, Stoppen oder Ausblenden.
Diese Möglichkeit gibt es nicht mehr. Der Auftraggeber hat das nach Rückfrage im Wissen um
die Folge so entschieden.

**Was als Milderung bleibt:**

- Bei `prefers-reduced-motion: reduce` startet das Video gar nicht erst.
- Außerhalb des Sichtfelds hält es an.
- Es ist stumm und nicht fokussierbar, erzeugt also keine Tastaturfalle.

**Zu klären:** ob das so bleiben soll. Eine Variante, die optisch identisch wäre und die
Anforderung erfüllte: Klick auf das Video hält an, erneuter Klick startet wieder — ohne
sichtbare Steuerleiste. Das war als Option angeboten und wurde nicht gewählt; es lässt sich
jederzeit nachrüsten.

### AP-181 — Titel und Text am Videoblock

Titel „1.500 m² Mustergarten" als `h3` über dem Band, in Baloo 2 (der Zweitschrift des
Hauses), aufrecht. Die Schreibweise folgt Hero-Proofleiste und Kennzahl der Proof-Sektion;
geliefert war „1500m2".

Der Text darunter stammt vom Auftraggeber. Angeglichen: fehlendes „nach" in „nur nach
Absprache", doppelte Leerzeichen, Halbgeviertstriche, Schlusspunkt. **Inhaltlich gedeckt**
durch Teil B, Zeile 75: „Besuche vor Ort — ausschließlich nach vorheriger
Terminvereinbarung."

## AP-215 — Kein Social-Proof-Block mehr auf dem Desktop

**Vom 05.09.2026.** Der Auftraggeber hat zwei Sektionen entfernen lassen:
„Vertrauen, das durch verlässliche Arbeit gewachsen ist." und „Gärten, die für sich
sprechen".

**Folge, die vor der Entfernung nicht offensichtlich war:** Der Ersatz von davidk.
(`.mobile-social-proof`, AP-174 ff.) ist auf `max-width: 900px` begrenzt. Oberhalb davon
steht damit **kein** Kennzahlen- oder Vertrauensblock mehr. Vorher zeigten beide Sektionen
auf schmalen Geräten sogar gleichzeitig — dieses Doppel ist jetzt aufgelöst, aber der
Desktop steht leer.

**Mit der Proof-Sektion verschwunden sind:**

| Angabe | Sonst noch auf der Seite? |
|---|---|
| „20+ Jahre Erfahrung" | **nein, nirgends mehr** |
| „2003 gegründet in Herne" | ja, zweimal |
| „4,9 ★ Google-Bewertung" | ja, im Rezensionskarussell |
| „Meister- & Ausbildungsbetrieb" | ja, zweimal („Meisterbetrieb seit 2003") |
| „1.500 m² Mustergarten" | ja, dreimal |
| Karte „Auch kleine und einmalige Arbeiten." samt Knopf zum Anfrageformular | **nein** |

Die NRW-Karte ist nicht betroffen — sie war in AP-179 in die Über-uns-Sektion umgezogen.

**Zu entscheiden:** ob der Desktop einen Ersatz bekommen soll. Entweder davidk.s Block
auch oberhalb 900 px zeigen (er ist gestalterisch auf schmale Geräte ausgelegt), oder eine
eigene Fassung. Solange nichts geschieht, sehen Desktop-Besucher weder Kennzahlen noch den
Hinweis auf kleine Aufträge.

**Nebenbefund:** Der Begründungssatz zur Jahresangabe in AP-179 berief sich unter anderem
auf „20+ Jahre" aus der Proof-Sektion. Der Beleg ist entfallen; die Angabe „über 20 Jahren"
bleibt aber richtig, weil das Gründungsjahr 2003 weiterhin auf der Seite steht.


## AP-230 (committet als AP-216) — Über-uns-Sektion: Raster, Hundefoto, Kartenfarben


> **Warum die Nummern springen.** Diese fünf Arbeitspakete wurden lokal als AP-216 bis
> AP-220 committet. Parallel hat davidk. auf demselben Branch AP-215 bis AP-229 für den
> mobilen Footer und die Leistungsbilder vergeben — die Nummern gab es damit doppelt.
> Beim Zusammenführen am 06.09.2026 sind die hiesigen Abschnitte auf **AP-230 bis AP-234**
> gerückt. Die Commit-Meldungen tragen weiterhin die alten Nummern; sie umzuschreiben
> hieße, Historie zu ändern, während andere darauf aufbauen. Die Klammer in jeder
> Überschrift stellt die Zuordnung her.

**Vom 06.09.2026.** Die Sektion steht jetzt als Raster statt als Float, trägt ein kleines
Foto und die NRW-Karte hat ihre Dunkelfarben zurück. Was dabei offen geblieben ist:

| # | Punkt | Warum es offen ist |
|---|---|---|
| O1 | **Name des Hundes** | Die Bildunterschrift lautet „Feierabend im Garten." und behauptet damit nichts. Mit Namen wäre etwa „Feierabend für ⟨Name⟩." möglich. Am 06.09.2026 beim Auftraggeber angefragt, liegt nicht vor. |
| O2 | **Aufnahmeort** — Musterfläche oder Kundengarten? | Deshalb steht im `alt` nur, was zu sehen ist. Eine Unterschrift wie „in unserem Mustergarten" wäre ohne Bestätigung eine Tatsachenbehauptung (§ 5 UWG) und ist bewusst nicht formuliert. Hängt mit dem offenen Punkt zu den Teich- und Palmenfotos zusammen. |
| O3 | **Hunderasse** | Im `alt` bewusst nicht benannt — sie ist nicht bestätigt. |
| O5 | ~~**Rechtes Drittel der Kartenzeile**~~ | **Erledigt mit AP-231.** Die Karte ist auf 300 px verkleinert, die Legende hat einen Eyebrow bekommen und füllt die Zeile. Die Qualifikationen stehen jetzt in der Signatur weiter oben. |

### Bewusste Abweichungen, keine offenen Punkte

- **Die Sektion wird länger:** Desktop +213 px (1813 → 2026), Mobil +346 px (1395 → 1741).
  Bei einer Startseite, die bereits als lang gilt, ist das eine bewusste Gegenbuchung —
  das Bild kostet Länge und bringt Wärme. Der weit größere Längenposten bleibt das
  Videoband.
- **Die Freigabe „auch auf Mobil nebeneinander" aus AP-179 ist abgelöst.** Begründung im
  dortigen Abschnitt.

### Bei der Prüfung aufgefallen, nicht Teil von AP-230

Gehört in ein eigenes Arbeitspaket, teils mit Entscheidungsbedarf:

1. **`mustergarten.mp4`: 9.468.292 Bytes bei nativ 720 × 544.** Wird auf 1440 px
   Fensterbreite randlos gezogen, also gut zweifach hochskaliert. Kein `poster` — bis zum
   Ladeende steht ein schwarzes Band von 558 px (Desktop) bzw. 219 px (Mobil).
2. **Grünton des Videotitels.** `--mobile-logo-green` #56E607 ist der vierte Grünton der
   Sektion, neben `--home-lime` #8CC63F, `--green-700` #4A7A10 und `--home-dark-accent`
   #B6D97A. Dazu synthetisch kursiv gestellt — es existiert nur ein aufrechter
   Baloo-2-Schnitt. AP-213 hat das ausdrücklich so entschieden; Änderung nur nach Rückfrage.
3. **Toter `.section-proof`-Code in `home-dark.css`.** AP-230 hat vier Regeln entscopt,
   weil eine davon sichtbar falsch war. Der Token-Block und rund ein Dutzend weiterer
   Regeln stehen weiterhin ohne passendes Element in der Datei. Eigener Aufräum-AP.
4. **Der Absatz „Über uns" nennt Maik Rohdich nicht.** Kein Name, kein Meistertitel, keine
   Baumkontrolle — ausgerechnet in der Sektion, die dafür da ist. Copy-AP.
5. **Dopplung zum Willkommen-Abschnitt.** Willkommen: „Seit über 20 Jahren legen wir Gärten
   an, bauen Terrassen, Teiche und halten Außenanlagen in Form". Über uns: „Seit über 20
   Jahren planen, bauen und pflegen wir Gärten und Außenanlagen in Herne und Umgebung."
   Zwei Sektionen Abstand. Vorschlag: den ersten Satz in „Über uns" streichen, der Absatz
   beginnt dann bei „Jeder Garten entsteht aus Ihren Vorstellungen…". Reine Streichung,
   keine neue Behauptung — gehört trotzdem in einen Copy-AP.
6. **Zeilenlänge zwischen 700 und 860 px.** Der 62ch-Deckel der Textspalte greift nur im
   zweispaltigen Modus. Zwischen dem Umbruchpunkt und etwa 700 px läuft der Absatz über die
   volle Containerbreite — bei 859 px sind das 790 px Spaltenbreite gegenüber 595 px am
   Desktop. Gegenüber dem Stand vor AP-230 ist das keine Verschlechterung (dort war es auf
   allen Breiten die volle Breite), aber es unterläuft das Ziel des Deckels. Ein
   `max-width: 62ch` am Absatz in der Mobil-Query würde es beheben.


## AP-231 (committet als AP-217) — Über uns als Signatur-Sektion

**Vom 06.09.2026.** Umbau auf Grundlage des gelieferten Entwurfs B („Signatur"), Fassung
„Über uns". Die Sektion hatte als einzige der Startseite keinen einzigen Baustein aus dem
Formenvorrat der Seite: keinen Eyebrow, keine Karte, keine Fläche, keinen Akzent.

### Was die Sektion jetzt zeigt — und woher es belegt ist

| Aussage | Beleg |
|---|---|
| „Meisterbetrieb seit 2003 in Herne" | `content/stammdaten.json`: `firma.gegruendet 2003-01-01`, `besonderheiten[2]` |
| „Sachverständiger für Baumkontrolle, Ausbildungsbetrieb" | `stammdaten.json` `besonderheiten[0]` und `[1]` |
| „alles aus einer Hand … eigenen Fachkräften und eigenem Maschinenpark" | bestehender Fließtext, vom Auftraggeber ausdrücklich so gewollt (AP-179). Die gleichnamige Faktenkachel ist mit AP-233 entfallen, die Aussage steht weiterhin im Absatz |
| „1.500 m² Mustergarten" | bestehende H3 aus AP-213, unverändert im Wortlaut |

**Nachtrag vom 06.09.2026 — die Signatur ist wieder entfallen.** Der Entwurf hatte unter
dem Fließtext eine Signatur „Maik Rohdich — Gartenbaumeister · Zertifizierter
Baumkontrolleur der Landwirtschaftskammer". Sie ist auf Wunsch des Auftraggebers entfernt
worden.

**Folge, hier festgehalten:** Damit steht auf dem Desktop weiterhin **nirgends sichtbar**
„Gartenbaumeister" auf der Startseite. Die Qualifikationsleiste in `.gate-welcome` ist ab
901 px `display: none` (gemessen bei 1440 px), und die Sektion nennt jetzt keinen Namen
mehr. Was bleibt, ist die Faktenzeile „Fachlich abgesichert — Sachverständiger für
Baumkontrolle, Ausbildungsbetrieb" in der Belegspalte. Falls die Meisterqualifikation auf
dem Desktop sichtbar werden soll, wäre die Faktenzeile die naheliegende Stelle.

**Korrektur an der Vorlage:** Die Analyse führte „Ausbildungsbetrieb" als Angabe, die
„bisher nirgends sichtbar auf der Startseite" stehe. Das trifft nur für den Desktop zu —
auf 390 px ist sie sichtbar.

### Entscheidungen des Auftraggebers vom 06.09.2026

| # | Frage | Entscheidung |
|---|---|---|
| E1 | Welcher Entwurf? | **B · Signatur** |
| E2 | H2 als Etikett oder Aussage? | **Etikett** — die H2 bleibt „Über uns" |
| E7 | Zitat „Wir reden Ihnen nicht nach dem Mund."? | **Nicht verwendet.** Der Satz ist im Repo nirgends belegt und stammt aus Gesprächsnotizen. An seiner Stelle steht „Gartenbau mit Handschlagqualität." — bis AP-230 die Unterzeile dieser Sektion und damit freigegeben. Gesetzt **ohne** Anführungszeichen, damit er kein Zitat vortäuscht |
| E8 | Video-Standbild? | **Ja** — siehe die Herkunftsklärung oben |
| E6 | Ersten Satz des Fließtexts streichen? | **Ja.** Reine Streichung der Dopplung zum Willkommen-Abschnitt |

### Bewusste Abweichungen von früheren Arbeitspaketen

- **Der randlose 100vw-Ausbruch des Videos (AP-179) entfällt.** Das Video sitzt jetzt in
  der Containerbreite, mit Rahmen, Schatten und dem asymmetrischen Eck 24/24/44/24 — der
  Marken-Ecke, die im Projekt an fünf Stellen so gesetzt ist. So verlangt es der
  freigegebene Entwurf.
- **Die H3 aus AP-213 sitzt jetzt als Kapsel im Bild.** Wortlaut unverändert, Position und
  Farbe geändert: `--mobile-logo-green` #56E607 wäre auf dem Foto nicht lesbar gewesen
  (gemessen 1,37 : 1 ohne Kapselgrund, 9,22 : 1 mit).
- **Der 42 %-Float bzw. das 62ch-Raster aus AP-230 ist abgelöst.** Die Kartenfarben-
  Entscopung aus AP-230 gilt unverändert weiter.

### Die geneigte Kante ~~(entfallen mit AP-233)~~

> **Am 06.09.2026 auf Wunsch des Auftraggebers wieder entfernt**, in beiden Lagen.
> Die Spalten werden jetzt allein durch den Abstand getrennt. Damit trägt die Sektion
> kein Schräg-Motiv mehr; die Formsprache der Seite kommt hier über Eyebrow,
> Faktenkachel und die Marken-Ecke am Videoband. Der Abschnitt bleibt stehen, weil
> die Maße für einen späteren Anlauf brauchbar sind.

Der Hero schneidet seine Kante mit `clip-path: polygon(0 0, 100% 28%, …)` im Winkel
`--mobile-hero-slope-angle`; AP-184 hat dasselbe Motiv schon einmal um 90° gedreht
(„skewY wird zu skewX, die asymmetrischen Radien drehen mit"). AP-231 übertrug das auf die
Trennung zwischen Aussage und Beleg: am Desktop eine geneigte Senkrechte, unter 860 px
dieselbe Kante um 90° gedreht.

Der Winkel war mit 4° flacher als der Hero (7,1–17,9°): dieser steht über die volle
Fensterbreite, die Kante nur über rund 510 px Höhe. Bei 7° schöbe sich ihr oberes
Ende 31 px aus der Mitte und die Spalten wirkten verrutscht; bei 4° sind es 18 px.
Eine Haarlinie in `--line` reichte dafür nicht — auf `--bg` sind das 1,15 : 1, sie war
im Beweisbild unsichtbar. Sie brauchte einen Verlauf in `--home-small-accent`.

### Gemessene Höhen

| Fensterbreite | vor AP-231 | nach AP-231 |
|---|---|---|
| 390 px | 1.741 | **2.015** |
| 768 px | — | **2.001** |
| 859 px | — | **2.068** |
| 1440 px | 2.026 | **1.933** |

Auf dem Desktop wird die Sektion trotz Fotopaar, Faktenzeilen und Mustergartenband
**kürzer**. Auf dem Telefon kostet sie 274 px mehr. Drei Maßnahmen haben dort gegengesteuert
(zusammen rund 400 px): die Karte auf 260 px gedeckelt, das Fotopaar auf 420 px begrenzt
und der Videozuschnitt in drei Stufen gestaffelt (4:3 unter 600 px, 16:9 bis 860 px, 21:9
darüber). Ohne sie wäre die Sektion bei 859 px 2.414 px hoch geworden.

### Weiterhin offen

| # | Punkt | |
|---|---|---|
| O1 | Name des Hundes | unverändert offen, siehe AP-230 |
| O2 | Aufnahmeort des Hundefotos | unverändert offen, siehe AP-230 |
| O10 | **Auflösung des Videos** | Die Quelle ist 720 px breit und wird ab etwa dieser Fensterbreite hochskaliert; bei 1440 px läuft sie auf 1.240 px. Eine höher aufgelöste Fassung würde das beheben. |
| O11 | **Dateigröße des Videos** | 9.468.292 Bytes. Unverändert der größte Einzelposten der Startseite. Das `poster` mildert nur den ersten Eindruck, nicht die Ladelast. |
| O12 | **WCAG 2.2.2** | Das Video startet selbsttätig, läuft in Schleife und lässt sich nicht anhalten. Unverändert gegenüber AP-181, dort als Auftraggeberentscheidung vermerkt. |

### Rücknahmen vom 06.09.2026 (AP-232 und AP-233, committet als AP-218 und AP-219)

Nach dem Bau hat der Auftraggeber drei Bauteile wieder streichen lassen. Der Reihe nach:

| AP | Entfernt | Was das bedeutet |
|---|---|---|
| AP-232 | Signatur „Maik Rohdich — Gartenbaumeister · Zertifizierter Baumkontrolleur der Landwirtschaftskammer" | „Gartenbaumeister" steht damit auf dem Desktop weiterhin nirgends sichtbar auf der Startseite |
| AP-233 | Geneigte Trennkante zwischen Wort- und Belegspalte | Die Sektion trägt kein Schräg-Motiv mehr |
| AP-233 | Faktenkachel „Alles aus einer Hand" | Die Belegspalte hat nur noch eine Kachel; die Aussage selbst steht weiterhin im Fließtext |

**Höhen nach den Rücknahmen:** Desktop 1.843 px (Ausgangswert vor AP-231: 2.026),
Mobil 1.778 px (vorher 1.741). Die Sektion ist damit auf dem Desktop 183 px kürzer als
vor dem Umbau und auf dem Telefon nur noch 37 px länger.


## AP-234 (committet als AP-220) — Über-uns-Unterseite und Button auf der Startseite

**Vom 06.09.2026.** Die Faktenkachel „Fachlich abgesichert" in der Über-uns-Sektion ist
einem Button gewichen, der auf die neue Unterseite `/ueber-uns/` führt.

### Die Seite

Fünf Abschnitte: Kopf mit Eyebrow und Leitsatz · „Ein Betrieb, der die Arbeit selbst macht"
mit dem bis dahin ungenutzten Foto `ueber-hebeaktion` · „Wofür wir geradestehen" mit den
vier Qualifikationen · [Team, auskommentiert] · „Wo wir arbeiten" mit Ortsliste und
Erreichbarkeitskarte.

Gerüst aus `kontakt/index.html` — `privatkunden/index.html` gibt es seit `980c79c` nicht
mehr. Eigene Datei `assets/css/ueber-uns.css` nach dem Muster von `kontakt.css`, damit
`styles.css` unberührt bleibt und kein `?v=`-Durchlauf über 37 Dateien nötig wird. Die
Farbwelt kommt vollständig aus `:root`; seit AP-F25 läuft die ganze Website dunkel.

### Belegherkunft jeder Aussage

| Aussage | Beleg |
|---|---|
| „Meisterbetrieb seit 2003 in Herne" | `stammdaten.json`: `firma.gegruendet`, `besonderheiten[2]` |
| „Maik Rohdich führt den Betrieb seit 2003" | `stammdaten.json`: `firma.inhaber`, `inhaberTitel` |
| „alles aus einer Hand – mit eigenen Fachkräften und eigenem Maschinenpark" | bestehender Fließtext der Startseite, vom Auftraggeber ausdrücklich so gewollt (AP-179) |
| „Der Betrieb bildet aus." | `stammdaten.json`: `besonderheiten[0]` — Ausbildungsbetrieb |
| „Was nicht sinnvoll ist, sagen wir Ihnen vorher." | Teil A.4: „Der Inhaber sagt Kunden auch, wenn etwas nicht sinnvoll ist." |
| die vier Qualifikationen | `index.html` (gate-welcome), Wortlaut übernommen; Baumkontrolle am 05.09.2026 bestätigt |
| Ortsliste | `stammdaten.json`: `einsatzgebiet`, zeichengleich mit dem Footer |
| Erreichbarkeitsblock | Teil B.2, verbindliche Formulierung |

Die Erläuterungen zu den vier Qualifikationen (was ein Meisterbrief berechtigt, wozu eine
Regelkontrolle dient) sind **fachliche Einordnung, keine Betriebsangaben** — sie behaupten
nichts über diesen Betrieb, was nicht anderswo belegt ist.

### Der Team-Abschnitt ist gebaut, aber ausgeschaltet

Auf Wunsch des Auftraggebers („erst Gerüst, Inhalte später") liegt das Markup fertig im
Quelltext von `ueber-uns/index.html`, **auskommentiert**. Auf der Seite ist davon nichts zu
sehen — kein Platzhaltertext, wie Grundregel 2 verlangt. Die CSS-Regeln (`.ueber-team*`)
stehen bereits in `ueber-uns.css` und greifen bis dahin auf kein Element.

**Vor dem Einschalten sind drei Dinge nötig, nicht nur die Daten:**

| # | Was fehlt | |
|---|---|---|
| O13 | **Namen, Funktionen, optional Qualifikation je Person** | Teil B nennt keine Personen außer dem Inhaber |
| O14 | **Freigabe, die Grundregel 3 für diese Seite aufhebt** | „Keine Mitarbeiterzahlen, keine Fuhrparkgrößen, kein Teamfoto — ausdrücklicher Wunsch des Betriebsinhabers" (Teil A.3). Ohne diese Freigabe bleibt der Block aus, auch wenn die Daten vorliegen |
| O15 | **Einwilligung der Abgebildeten**, falls Fotos verwendet werden | |

### Anschluss an die Build-Kette

- `.github/scripts/templates/_footer.html`: eine `<li>`-Zeile im Schnellzugriff → per
  `build-footers` in 36 Dateien propagiert, jeweils mit korrekt aufgelöstem `{{base}}`.
- `.github/scripts/build-leistungen.mjs`: `HAND_PAGES` um die neue Seite ergänzt, sonst
  driftet ihr Leistungs-Dropdown bei der nächsten Nav-Änderung still weg — derselbe Fall,
  den der AP-108-Kommentar dort beschreibt.
- `sitemap.xml` hat `/ueber-uns/` **automatisch** aufgenommen (On-Disk-Discovery in
  `build-index.mjs`). `robots.txt` und `_headers` führen keine Einzel-URLs.

**Die Hauptnavigation bleibt unangetastet** — fünf Punkte wie bisher. Vom Auftraggeber so
entschieden; die Seite hängt am Button und am Footer.

### Gemessen

Buttonkontrast 11,12 : 1 gegen `--bg` (WCAG AA verlangt 4,5). Kein horizontaler Overflow auf
beiden Seiten bei 320 / 390 / 720 / 768 / 861 / 1024 / 1440 / 1920 px. Der auskommentierte
Team-Abschnitt erzeugt in allen acht Breiten **null** Elemente. Sektionshöhe der Startseite
1843 → 1824 px.


## AP-235 — Hundefoto quadratisch, Button als Logo-Lasche

**Vom 06.09.2026.** Zwei Wünsche des Auftraggebers an der Über-uns-Sektion der Startseite.

### Das Foto zeigt jetzt den ganzen Garten

Die Kachel stand auf `aspect-ratio: 4/5`, die Aufnahme ist aber quadratisch (980 × 980).
`object-fit: cover` schnitt dadurch **20 % der Breite** weg — je 10 % links und rechts, und
genau dort liegen das Kiesbeet mit den Gräsern und das Formgehölz im Topf. Auf 1:1 ist das
ganze Bild zu sehen.

**Mehr geht ohne neues Material nicht.** `assets/img/_src/ueber-hund.jpg` ist bereits die
zugeschnittene Fassung; die in AP-230 erwähnte Quelle mit 1280 × 1600 liegt nicht im Repo.
Sollte sie nachgeliefert werden, ließe sich ein echter weiterer Ausschnitt wählen.

Die Arbeitsjacke daneben ist 480 × 600 und verliert im Quadrat 20 % Höhe. Ihr Ausschnitt
wandert deshalb auf `object-position: 50% 22%` — Helm und Gehörschutz bleiben vollständig,
weg fällt unten Westenfläche. Der Schriftzug auf der Weste sitzt mittig und bleibt drin.
Beide Kacheln behalten dieselbe Form; ein Paar liest sich nur dann als Paar.

### Der Button trägt jetzt das Logo

Aus „Wollen Sie mehr über uns erfahren? →" wird **„Mehr zu" plus Logo**. Die Form stammt
aus `.mobile-proof-request` („Gartenwunsch besprechen", `mobile-social-proof.css:462`): eine
Kapsel mit abgeschrägter Lasche oben rechts, gebaut als SVG hinter dem Text, weil sich diese
Ecke mit `border-radius` nicht bauen lässt.

Übernommen ist die **Form**, nicht die Füllung — die Vorlage ist in `--home-lime` gefüllt und
trägt einen Schlagschatten, hier steht der Pfad als Umriss. Der Button ist ein Nebenweg; die
Hauptaktion der Seite bleibt die Anfrage.

Zwei Unterschiede zur Vorlage, beide bewusst:

- Sie gilt nur unter 900 px, diese Regeln gelten in allen Breiten.
- Ihr Pfad ist gefüllt, deshalb fällt dort nicht auf, dass `preserveAspectRatio="none"` die
  Geometrie verzerrt. Bei einem Umriss schon. **Gemessen** bei 231 × 68 px (Skalierung
  X 0,643 / Y 1,063), Deckung subpixelgenau über ein Canvas:

  | | senkrechte Kante | waagerechte Kante |
  |---|---|---|
  | ohne `vector-effect` | 0,48 px | 0,79 px |
  | mit `non-scaling-stroke` | 0,75 px | 0,75 px |

  Ohne das Attribut wären die Kanten um 65 % unterschiedlich dick.

### Barrierefreiheit

Das Logo trägt die Textalternative, nicht das `<a>`. Vorgelesen wird der Link damit als
**„Mehr zu Maik Rohdich Garten- und Landschaftsbau"** — nachgemessen am zugänglichen Namen,
nicht angenommen. Die Form ist `aria-hidden`.

**Ein Kontrastwert, der festgehalten gehört:** Der Schriftzug „MAIK ROHDICH" trägt im Symbol
`fill="#5a8a1c"` und kommt gegen `--bg` #171916 auf **4,29 : 1** — knapp unter den 4,5, die
WCAG AA für Text dieser Größe verlangt. Als Markenzeichen ist er davon ausgenommen (WCAG
1.4.3 nimmt Logos und Markennamen aus), und derselbe Wert gilt im Header und im Footer. Der
Button übernimmt deshalb den Schatten des Footer-Logos (`.brand-logo-light`), der es von der
Fläche abhebt, ohne die Markenfarben anzutasten. Die beiden gelben Nebenzeilen liegen bei
14,63 : 1, der Umriss bei 11,12 : 1.

> **Falls die Marke einmal überarbeitet wird:** Ein Schriftzug in `--home-dark-accent`
> #B6D97A käme auf 11,12 : 1. Das wäre eine Markenentscheidung, kein Layout-AP.

### Gemessen

Kein horizontaler Overflow bei 320 / 390 / 420 / 421 / 768 / 861 / 1440 / 1920 px. Beide
Fotos in allen acht Breiten quadratisch und gleich groß. Der Button passt überall in seine
Spalte; unter 421 px schaltet er auf das kleinere Maß (Logo 30 statt 36 px). Sektionshöhe
1824 → **1769 px** am Desktop. `mobile-social-proof.css` ist unverändert — die Vorlage darf
sich nicht mitbewegen.
