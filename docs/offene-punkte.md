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
- E-Mail: `maik@rohdich.de`

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

**Entschieden am 18.09.2026 (AP-327 bis AP-331):** Das Formular bleibt ohne Einwilligungs-
Checkbox. **Nur wer ein Foto beilegt**, bestaetigt vor dem Absenden, dass er die Aufnahmen
weitergeben darf und keine ungefragten Personen darauf zu erkennen sind. Ein Bild kann
Daten Dritter enthalten, die blosse Kontaktangabe nicht.

## AP-360 — Vier neue Leistungsseiten: Texte brauchen Freigabe

Nassschneidearbeiten, Rodungsarbeiten, Verkehrssicherheit und Vermessungs- & Lasertechnik
standen in der A-Z-Liste der Startseite, hatten aber keine eigene Seite - sie zeigten aufs
Anfrageformular. Die vier Seiten sind jetzt gebaut.

**Die Texte sind von mir entworfen, nicht vom Auftraggeber geliefert.** Sie stuetzen sich
ausschliesslich auf Fachwissen zum Gewerk und auf geltendes Recht, nicht auf Betriebsinterna -
so, wie es die uebrigen dreizehn Leistungsseiten auch tun. Vor dem Go-live muss Maik Rohdich
sie lesen und freigeben.

Bewusst **nicht** geschrieben, weil unbekannt:

| Offen | Fundstelle |
|---|---|
| Welche Geraete und Verfahren tatsaechlich eingesetzt werden (Trennschneider, Wurzelfraese, Nivelliergeraet, Seilklettertechnik, Hebebuehne) | alle vier `content/leistungen/privat/*.json`, Abschnitt `ablauf` und `aufwand` |
| Ob fuer die Verkehrssicherung Nachweise vorliegen, die genannt werden duerfen | `verkehrssicherheit.json` |
| Ab welcher Groesse Rodungen uebernommen werden und ob es eine Mindestmenge gibt | `rodungsarbeiten.json` |
| Ob Zuschnitte auch ohne eigenen Auftrag uebernommen werden | `nassschneidearbeiten.json`, FAQ 3 - dort bewusst als "sprechen Sie uns an" formuliert |

**Rechtsangaben, die geprueft gehoeren:** Die Schonzeit vom 1. Maerz bis 30. September fuer
das Beseitigen von Baeumen, Hecken und Gebueschen steht in `rodungsarbeiten.json` als
geltendes Recht. Ob fuer Herne zusaetzlich eine Baumschutzsatzung mit Genehmigungspflicht
gilt, ist auf der Seite bewusst offen gelassen ("das klaeren wir vorab") - hier wurde
nichts behauptet, was nicht belegt ist.

## AP-329/330 — Foto-Upload: was noch fehlt

Der Empfangsweg ist gebaut (`api/anfrage.js`, `vercel.json`, Versand in `anfrage.js`),
aber **nicht scharfgeschaltet**: `data-endpoint` am Formular ist leer, das Foto-Feld
bleibt deshalb unsichtbar und das Formular verhaelt sich wie bisher. Zum Einschalten
fehlen Angaben, die nur der Auftraggeber liefern kann:

| Was | Wofuer | Ohne das |
|---|---|---|
| SMTP-Zugangsdaten zu `maik@rohdich.de` (Host, Port, Benutzer, Passwort) | Versand aus der Funktion | kein Versand |
| Vercel-Tarif **Pro** | Hobby verbietet kommerzielle Nutzung; der AVV nach Art. 28 DSGVO gilt nur fuer Pro und Enterprise | keine Rechtsgrundlage fuer die Verarbeitung durch Vercel |
| Aufbewahrungsdauer im Postfach | Pflichtangabe nach Art. 13 Abs. 2 lit. a DSGVO | Datenschutzerklaerung unvollstaendig |
| Anwaltlich geprueftere Datenschutzerklaerung | siehe AP-11 weiter oben | Verstoss gegen die Unterrichtungspflicht, sobald Bilder entgegengenommen werden |

Die Verarbeitungsvorgaenge sind in `content/rechtstexte/datenschutz.body.html` bereits
ausformuliert, damit der Anwalt nur noch pruefen und einsetzen muss. Zwei `OFFEN`-Marken
stehen dort: der Name des Auftragsverarbeiters und die Aufbewahrungsdauer.

**Nicht gebaut, mit Absicht:** ein Versandweg ohne JavaScript. Ein gewoehnliches
Formular-POST wuerde das Bild ungeschrumpft und **mit** GPS-Daten uebertragen — das
Entfernen der Metadaten passiert im Browser. Ohne JavaScript bleibt es beim Hinweis auf
Telefon, WhatsApp und E-Mail.

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
| O2 | ~~**Aufnahmeort** — Musterfläche oder Kundengarten?~~ | **Geklärt am 06.09.2026:** die Musterfläche am Firmensitz. Vom Auftraggeber auf Rückfrage bestätigt. Die Bildunterschrift lautet seit AP-238 „Feierabend im Mustergarten." — bis dahin blieb sie bewusst neutral, weil eine Ortsangabe ohne Bestätigung eine Tatsachenbehauptung nach § 5 UWG gewesen wäre. |
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


## AP-236 — Header-Logo im Button, Breite an das Fotopaar

**Vom 06.09.2026.** Zwei Nachbesserungen an dem Button aus AP-234.

### Das Logo war ein anderes als im Header

Der Button nutzte das SVG-Symbol `#brand-logo`. Der Header führt dasselbe Symbol zwar im
Markup, **blendet es aber per CSS aus** und legt ein PNG als Hintergrund darunter:

```css
/* styles.css:317-325 */
.brand-logo { background: url("../img/logo/maik-rohdich-logo.png") center / contain no-repeat; }
.brand-logo > use { display: none; }
```

Sichtbar ist im Header also nie das Symbol. Das erklärt, warum Button und Header
unterschiedlich aussahen, obwohl beide scheinbar dasselbe Logo führten — eine Falle für
jeden, der nur ins Markup schaut.

Übernommen ist die **kompakte** Fassung `maik-rohdich-logo-mobile-horizontal-meister.png`,
die der Header unter rund 900 px zeigt: zwei Zeilen statt drei, Schrift in Grün mit heller
Kontur. Die breite Desktop-Fassung setzt zwei ihrer drei Zeilen dunkel — im Header bei
67 px Höhe unproblematisch, in Buttongröße auf dunklem Grund nicht.

Eingebunden als `<img>`, nicht als Hintergrund wie im Header: nur ein `<img>` kann eine
Textalternative tragen. Vorgelesen ergibt der Link damit **„Mehr zu Maik Rohdich
Gartenbaumeister"** — am zugänglichen Namen nachgemessen.

**Kontrast**, als Canvas-Komposit über den echten Bildpixeln gegen `--bg` gemessen, nur der
Schriftbereich rechts der Blüten: Median **8,05 : 1**, hellstes Pixel 16,48 : 1, 68 % der
Schriftpixel über 4,5 : 1. Deutlich besser als das SVG-Symbol mit seinen 4,29 : 1 — der
`drop-shadow` aus AP-235 ist deshalb entfallen, das PNG bringt seine eigene Kontur mit.

### Der Button fluchtet jetzt mit den Bildern

`inline-flex` → `flex` plus `width: 100%`, Inhalt zentriert. Damit füllt er die Belegspalte,
und die ist deckungsgleich mit dem Fotopaar darunter.

**Ein Fund beim Messen:** Bei 768 px lief der Button auf 706 px, während das Paar bei 420
stehen blieb — Differenz 286 px, die rechten Kanten klafften auseinander. Ursache war der
Tablet-Deckel aus AP-231 (`.mr-ueber__paar { max-width: 420px }` unter 860 px), den der
Button nicht kannte. Er trägt ihn jetzt ebenfalls. **Beide Werte müssen zusammen bleiben** —
wer einen ändert, muss den anderen mitziehen.

Nachgemessen in elf Breiten (320 / 375 / 390 / 420 / 600 / 768 / 859 / 861 / 1024 / 1440 /
1920 px): Differenz **0** in jeder, linke und rechte Kante fluchten überall, kein
horizontaler Overflow.

### Offen

| # | Punkt | |
|---|---|---|
| O16 | ~~**Logogröße im Button**~~ | **Erledigt mit AP-237** (06.09.2026). Das Logo ist von 30/36 px auf **44/52 px** gewachsen: 156 × 44 px unter 421 px Fensterbreite, 185 × 52 px darüber. 52 px ist die Grenze, die der Button ohne zu wachsen trägt (52 + 2 × 10 px Innenabstand = 72 px, knapp über der `min-height` von 68). Der engste Fall ist 320 px Fensterbreite: Button 280 px, Inhalt 224 px, je 10 px Luft links und rechts — `scrollWidth` gleich `clientWidth`, kein Überlauf. |


## AP-238 — Weite Hundeaufnahme, Mustergarten benannt

**Vom 06.09.2026.** Die bisherige Aufnahme war ein enger Ausschnitt um den Hund; vom Garten
war fast nichts zu sehen. In AP-235 ließ sich das nur begrenzt beheben — die Quelle
(980 × 980) war bereits der fertige Zuschnitt, mehr als das Format von 4:5 auf 1:1 zu
stellen ging nicht.

Jetzt liegt die weite Ansicht vor: **1068 × 1070 px**, Verhältnis 0,998 — praktisch
quadratisch, also kein Zuschnitt nötig. Zu sehen sind Pool und Palmen links, Sonnenschirm,
Kiesbeet mit Natursteinen, Pflasterweg, das Formgehölz im Topf rechts, zwei Liegen und der
Hund vorn.

### Zwei Stolperstellen beim Ablegen

1. **Die Datei landete unter dem Namen `assets:img:_src:ueber-hund.jpg`** — direkt in
   `_src`, mit Doppelpunkten statt Schrägstrichen. Das passiert, wenn im macOS-Speichern-
   Dialog ein Pfad in das Namensfeld getippt wird: Der Finder macht daraus einen einzigen
   Dateinamen. Wer die Datei sucht, findet sie so nicht am erwarteten Ort.
2. **Sie war ein PNG mit `.jpg`-Endung.** `sharp` liest das Format aus dem Inhalt und wäre
   damit klargekommen, aber es widerspricht der Konvention in diesem Ordner. Vor dem Bau in
   echtes JPEG umgewandelt (Qualität 95), die falsch benannte Datei entfernt.

   > Nicht verwechseln: Die Merkregel „PNG-Quellen in `_src` sind KI-generiert" gilt für den
   > Altbestand. Hier war die Endung ein Artefakt des Speicherns aus der Unterhaltung, die
   > Aufnahme selbst ist echt.

### Ableitungen

| Datei | Größe | Budget 200 KB |
|---|---|---|
| `ueber-hund-480.avif` | 33 KB | ✓ |
| `ueber-hund-480.webp` | 54 KB | ✓ |
| `ueber-hund-960.avif` | 112 KB | ✓ |
| `ueber-hund-960.webp` | 184 KB | ✓ |

Die WebP-Fassung liegt mit 184 KB deutlich näher am Budget als beim engen Ausschnitt
(163 KB) — das detailreichere Motiv kostet. Bei einer künftigen Quelle mit mehr Struktur
könnte `webpWidths` nötig werden, wie bei `gate-gewerbe-baumarbeiten`.

### Text

Der `alt`-Text beschrieb den engen Ausschnitt und war damit sachlich falsch geworden. Neu
formuliert am gerenderten Bild. Die Bildunterschrift nennt jetzt den Ort — siehe O2 oben.

### Gemessen

Kein Problem in sieben Breiten (320 / 375 / 390 / 768 / 861 / 1440 / 1920 px): beide Kacheln
quadratisch und gleich groß, Button und Fotopaar weiterhin exakt gleich breit (Differenz 0 —
in AP-236/237 erarbeitet und hier nicht gekippt), kein horizontaler Overflow. **Der Hund
bleibt auch bei 162 px Kachelbreite klar erkennbar**; die Bildunterschrift passt weiterhin
zum Bild.


## AP-240 — Ecken des Mustergartenbands abgerundet

**Vom 06.09.2026.** Das Videoband hatte scharfe Ecken, obwohl die Bühne seit AP-231
`border-radius: 24px 24px 44px 24px` **und** `overflow: hidden` trägt.

**Ursache:** Ein `<video>` wird in einem eigenen Compositing-Layer gezeichnet und lässt sich
vom `overflow: hidden` des Elternelements nicht beschneiden. Gemessen: Bühne 20 px Radius,
Video 0 — im Beweisbild waren die Ecken scharf, während die Kapsel „1.500 m² Mustergarten"
darüber sauber gerundet war.

**Behoben** durch `border-radius` am Video selbst. Die Werte liegen je 1 px unter denen der
Bühne, weil diese einen 1-px-Rahmen trägt: innerer Radius = äußerer minus Rahmenbreite.
Ohne das blitzt in der Rundung ein Spalt zwischen Video und Rahmen durch.

| | Bühne | Video |
|---|---|---|
| ab 861 px | 24 / 24 / 44 / 24 | 23 / 23 / 43 / 23 |
| darunter | 20 / 20 / 34 / 20 | 19 / 19 / 33 / 19 |

Gilt auch für das `poster`-Standbild — dasselbe Element zeichnet es. Geprüft in acht Breiten
(320 / 375 / 390 / 599 / 600 / 861 / 1440 / 1920 px): Differenz je Ecke überall exakt 1 px,
kein horizontaler Overflow.

### Nebenbefund: parallele Sitzung, kollidierte Nummer

Während dieser Arbeit hat eine parallele Sitzung **AP-239** („Mobilgestaltung von einem
iPhone auf alle Handys ausgedehnt", Commit `0dd9f4d`) eingebracht. Dieser AP heißt deshalb
240, nicht 239. Der Cache-Bust-Zähler war dadurch schon auf `zz46` gestiegen, ohne dass
diese Sitzung ihn gesetzt hätte — beim Weiterzählen auf `zz47` fiel es auf.

**Die Über-uns-Sektion ist von AP-239 nicht betroffen** (null geänderte `mr-ueber`-Zeilen),
wohl aber mittelbar: Die dort eingeführte Wurzelschriftgröße
`clamp(12.736px, 3.9801vw, 19.104px)` unter 480 px zieht alle `rem`-Werte der Sektion mit.
Die Messwerte dieses AP wurden auf diesem Stand erhoben.


## AP-246 — Kurzkontaktformular neu gestaltet

**Vom 06.09.2026.** Das kurze Anfrageformular hatte keine Fläche, Felder als bloße Umrisse
und einen Radio-Punkt in Browser-Blau. Direkt darunter zeigt der Footer die Formsprache, die
ihm fehlte.

### Der gelieferte Fremdentwurf wurde verworfen

Zum Auftrag kam ein ausgearbeiteter Entwurf samt Referenz-HTML. Der Auftraggeber hat dessen
**Gestaltung** abgelehnt — sie passte nicht zur Website. Seine **inhaltlichen** Entscheidungen
bleiben gültig und sind umgesetzt: Chips statt Freitext, Direktkontakt über dem Formular, ein
kombiniertes Feld für Nummer oder E-Mail, kein Ortsfeld.

Nicht übernommen wurden: die eigene Farbpalette (dreizehn Werte, von denen nur einer einem
Token entsprach), die schrägen `clip-path`-Schnitte, der handgezeichnete Marker-Strich als
Absendefläche und die Blüte als Wasserzeichen.

### Woher jeder Baustein stammt

| Element | Vorbild im Bestand |
|---|---|
| Karte, Marken-Ecke 24/24/44/24 | `form-trust-card.css:16`, `kontakt.css:52`, `gewerbe.css:51`, `privat-form.css:2111` |
| Eyebrow | `.private-proof-since`, `privat-form.css:3174` |
| Kontaktkacheln | `.footer-contact-link`, `styles.css:1527` |
| Telefon-Icon | `phone-header-mobile.png` aus dem Hero |
| WhatsApp-Glyph auf `#25D366` | `whatsapp-glyph-white.svg` + `.btn-whatsapp`, `styles.css:279/1801` |
| Chips | Pillenform von `.btn`, `styles.css:236` |
| Absendeknopf | `.btn .btn-primary`, unverändert übernommen |

Alle Farben sind Tokens. Einziger fester Wert ist `#25D366` — die WhatsApp-Marke, die so
bereits in `styles.css:280` steht.

### Was an der Umschaltung nicht angetastet wurde

`setzeModus()`, `werteUebernehmen()` und `UEBERNAHME` in `anfrage.js` sind unverändert; die
Datei ist nur um die Chip- und Freitextlogik **ergänzt** (keine Zeile entfernt, per Diff
belegt). Erhalten sind `data-anf-modus="kurz"`, `data-anf-form`, `data-anf-status`,
`data-anf-zeitstempel`, `data-anf-modus-feld`, der Honeypot und der Feldname `name`.

**Bewusst aufgegeben:** E-Mail und Telefon sind zu einem Feld `kontakt` zusammengelegt.
`UEBERNAHME` kennt es nicht, die Übertragung läuft dort ins Leere — wer erst kurz tippt und
dann auf „mehr Angaben" wechselt, gibt seinen Kontaktkanal erneut ein. Vom Auftraggeber so
entschieden, damit `anfrage.js` unberührt bleibt.

### Gemessen

| Prüfung | Ergebnis |
|---|---|
| Umschaltung kurz → lang → kurz | funktioniert, Name wird übertragen |
| Chips an/aus, Themenfeld | sammelt korrekt, Abwahl funktioniert |
| Chipbreite beim Umschalten | 144,5 px → 144,5 px, unverändert (Rand bleibt 2 px) |
| „Etwas anderes" | öffnet das Freitextfeld, `aria-expanded` wechselt |
| Absenden | zeigt weiterhin den Hinweis, dass kein Versand aktiv ist |
| Radio-Punkt | `rgb(140, 198, 63)` statt Browser-Blau |
| Chips unter 560 px | zwei Spalten, drei Zeilen — in vier Breiten geprüft |
| Overflow | keiner bei 320 / 360 / 390 / 560 / 561 / 768 / 1024 / 1440 px |

### Weiterhin offen

Der Formularversand. Es gibt keinen Endpunkt; `anfrage.js` zeigt nur einen Hinweis. Die
Chip-Auswahl landet im versteckten Feld `themen`, damit sie im Datensatz steht, sobald ein
Endpunkt existiert. Die QA-Forderung des Fremdentwurfs „Ausgewählte Chips landen in der Mail
an Maik" ist bis dahin nicht erfüllbar.

Erreichbarkeitszeiten und ein Satz zur Rückmeldung stehen **nicht** im Formular — am
06.09.2026 so entschieden.


## AP-247 — Kartenlegende: „Für Ihre Anliegen in ganz NRW tätig"

**Vom 06.09.2026.** Unter der Einsatzgebiets-Karte standen der Vorspann „Hauptsächlich in
Nordrhein-Westfalen:" und darunter die fünf Städte. Beides ist durch einen Satz ersetzt:
**„Für Ihre Anliegen in ganz NRW tätig"**. „Auf Anfrage auch deutschlandweit." und „Sitz in
Herne" bleiben.

### Abweichung von H.6 — bewusst und begründet

H.6 des Umsetzungsplans legt fest: „Der Schwerpunkt sind weiterhin die fünf Städte" und
„Teil D des Plans setzt mit der Ortsliste bewusst ein lokales Signal". Der Vorspann stammte
aus AP-241 und war ausdrücklich darauf gestützt. **Der Auftraggeber hat am 06.09.2026
entschieden, die Städtezeile an dieser Stelle zu streichen.**

Inhaltlich ist die neue Aussage gedeckt: H.6 hält selbst fest, dass Maik Rohdich auf Anfrage
deutschlandweit tätig wird — „ganz NRW" bleibt dahinter zurück, behauptet also nichts
Zusätzliches.

**Das lokale Signal geht nicht verloren**, es entfällt nur an dieser einen Stelle. Nachgezählt:

| Ort | Städte weiterhin genannt |
|---|---|
| `.github/scripts/templates/_footer.html` | ja — propagiert in alle 37 Seiten |
| JSON-LD `areaServed` | ja, in drei Blöcken |
| `index.html` übrige Stellen | ja, acht Vorkommen |
| `AREA_SERVED` in `render.mjs` | unberührt |

### Nicht angefasst

Das `aria-label` der Karte nennt weiterhin die fünf Städte
(„Nordrhein-Westfalen mit dem Einsatzgebiet um Herne, Bochum, Gelsenkirchen, Recklinghausen
und Castrop-Rauxel"). Es beschreibt, was die Grafik **zeigt** — und sie hebt diese Kreise
weiterhin hervor. Eine Bildbeschreibung folgt dem Bild, nicht dem Text daneben.

Kein CSS geändert: `.proof-map-focus` behält seine Regel aus AP-241 (`display: block`,
2 px Abstand), die auch für einen alleinstehenden Satz richtig ist.

### Gemessen

Der Satz steht in allen geprüften Breiten (320 / 390 / 861 / 1440 px) einzeilig, kein
Doppelpunkt, keine Städte mehr in der Legende, kein horizontaler Overflow. Die Ausrichtung
aus AP-241/AP-242 ist unverändert: bis 860 px zentriert, ab 861 px linksbündig neben der
Karte.

### Offen

| # | Punkt | |
|---|---|---|
| O17 | **Hervorhebung auf der Karte ohne Erklärung** | Die Grafik betont weiterhin fünf Kreise um Herne, der Text nennt sie nicht mehr. Kein Widerspruch — die Karte zeigt ganz NRW, die Betonung markiert den Schwerpunkt — aber wer die Grafik liest, sieht eine Hervorhebung, die im Text keine Entsprechung hat. Falls das stören sollte, wäre die Hervorhebung anzupassen, nicht der Satz. |


## AP-249 — Freitextfeld stand trotz `hidden` offen (Fehler aus AP-246)

**Vom 06.09.2026.** Das Feld „Worum geht es?" im Kurzformular war dauerhaft sichtbar,
obwohl es erst auf Klick erscheinen sollte.

> Dieser Abschnitt hieß zunächst AP-248. Eine parallel laufende Sitzung hatte dieselbe
> Nummer Sekunden früher für „Ungenutzte Stile der Galerie-Filter entfernt“ vergeben
> (Commit `996d283`); der hiesige Commit war noch nicht gepusht und ist auf **AP-249**
> gerückt — derselbe Fall wie bei AP-230.

**Ursache:** `[hidden] { display: none }` ist eine Regel des **Browsers** und hat damit die
niedrigste Priorität. `anfrage.css:121` setzt `.anf__feld { display: grid }` und sticht sie
aus. Das Markup trug `hidden`, `anfrage.js` setzte es korrekt — gezeichnet wurde das Feld
trotzdem.

| | Freitextfeld | Umschaltung kurz/lang |
|---|---|---|
| `hidden`-Attribut | gesetzt | gesetzt |
| berechnetes `display` | `grid` | `none` |
| tatsächlich sichtbar | **ja, 297 × 160 px** | nein |

Die Umschaltung war nie betroffen: `.anf__form` und `.anf__karte` setzen kein `display`.

**Behoben** mit `.anf [hidden] { display: none; }` — am Wrapper statt an der einzelnen
Klasse, damit künftige Elemente mit `hidden` mitversorgt sind. Dasselbe Muster nutzt
`privat-form.css:824` für das ausführliche Formular.

### Warum die Prüfung in AP-246 das nicht gefunden hat

Getestet wurde `element.hidden` — die DOM-**Eigenschaft**. Die war korrekt `true`. Sie sagt
aber nichts darüber, ob das Element gezeichnet wird; das entscheidet allein das berechnete
`display`. Der Test war grün, während das Feld offen dastand.

> **Merksatz für künftige Prüfungen:** Sichtbarkeit nie über `element.hidden`,
> `classList.contains()` oder gesetzte Attribute feststellen. Nur
> `getComputedStyle(el).display` und `getBoundingClientRect()` sagen, was der Nutzer sieht.

### Gemessen

Startzustand `display: none`, Höhe 0. Nach Klick `display: grid`, Höhe 160 px,
`aria-expanded="true"`, Fokus im Textfeld. Zweiter Klick schließt wieder. Der Chip „Etwas
anderes" öffnet ebenfalls. Umschaltung kurz → lang → kurz an `display` geprüft: unverändert
richtig, das Freitextfeld bleibt beim Rückwechsel zu. Kein Overflow bei 320 / 390 / 768 /
1440 px.

---

## AP-252 — „Willkommen" von Baloo 2 auf Nunito

Im Willkommens-Absatz der Startseite lief das Wort „Willkommen" als einziges Element in
**Baloo 2**, der Rest der Zeile in Nunito. Eine Schriftinventur der Startseite zeigte: auf
der Desktop-Ansicht war das die **einzige** Fundstelle von Baloo 2. Auf Wunsch des
Auftraggebers läuft das Wort jetzt in Nunito und setzt sich nur noch über Kursiv und
Gewicht 700 vom Absatz ab.

Umgesetzt in [home-dark.css:2134](../assets/css/home-dark.css:2134) durch **Streichen** der
Zeile `font-family: "Baloo 2", cursive;`. Keine neue `font-family` gesetzt — der Absatz
`.mr-willkommen__gross` trägt bereits `font-family: var(--display)`, und `--display` ist auf
der Startseite Nunito (home-dark.css:45). So folgt die Stelle einem späteren Tokenwechsel
von allein.

### Nebenbefund: das bisherige Kursiv war errechnet

Baloo 2 ist in beiden `@font-face`-Blöcken (home-dark.css:12–27) nur mit
`font-style: normal` eingebunden — einen Kursivschnitt gibt es nicht. Die Schrägstellung
hat der Browser bislang selbst berechnet. Nunito bringt mit `nunito-italic-latin.woff2`
(Gewichte 200–1000) einen echten Kursivschnitt mit; `document.fonts.check('italic 700 40px
Nunito')` meldet `true`.

**Baloo 2 bleibt eingebunden.** Die Handy-Ansicht nutzt sie weiter für die Hero-Zeilen
(home-dark.css:801) und `.gate-welcome-statement` (home-dark.css:1663). Weder
`@font-face`-Blöcke noch Schriftdateien wurden entfernt.

### Gemessen

| | vorher (Baloo 2) | nachher (Nunito) |
|---|---|---|
| Wortbreite „Willkommen" bei 1440 px | 222,5 px | 241,6 px |
| Absatzhöhe | 242 px | 240 px |
| Zeilenumbruch | nein | nein |

Bei 768 px: Nunito, 138,9 px Wortbreite, kein waagerechter Überlauf. Bei 390 px ist
`.mr-willkommen` unverändert `display: none` (bestehende Mobilregel, von dieser Änderung
nicht berührt).

### Offen — zwei Fremdschriften in der Handy-Ansicht

Bei der Inventur mit aufgefallen, **nicht** beauftragt und deshalb unverändert:

- [home-dark.css:1792](../assets/css/home-dark.css:1792) setzt für die vier
  Qualifikations-Etiketten (Gartenbaumeister, LWK-BaumKontrolleur, Sachverständiger,
  Sachkundiger) `font-family: "Comic Sans MS", "Comic Sans", "Chalkboard SE", cursive` —
  keine Hausschrift darin. Auf Android greift der generische `cursive`-Zweig, die Darstellung
  ist dort geräteabhängig.
- [mobile-social-proof.css:115](../assets/css/mobile-social-proof.css:115) setzt für die
  Sterne der Google-Bewertung `Arial, sans-serif`. Bei reinen Symbolzeichen unkritisch.

---

## AP-254 — Footer-Generator löschte die mobilen Startseiten-Bausteine

Beim Livegang fiel auf: die Website zeigte nicht den Branch-Stand. Ursache war **nicht**
der Merge, sondern der Commit `5932af2` von `github-actions[bot]`. Er trug den Titel
„chore: Projekt-Index & Sitemap aktualisiert" und hat tatsächlich **nur 14 Zeilen aus
`index.html` gelöscht** — die mobilen Footer-Bausteine:

- `footer-contact-link--iphone-form` (Link auf `#anfrage`)
- `footer-social-iphone` mit WhatsApp- und Instagram-Symbol und Erreichbarkeitszeile
- die `footer-hours-whatsapp`-Umhüllung in der Öffnungszeiten-Zeile

### Ursache

[build-footers.mjs:41](../.github/scripts/build-footers.mjs:41) ersetzt auf **jeder** Seite
den kompletten `<footer class="site-footer">…</footer>` durch den gefüllten Inhalt von
[templates/_footer.html](../.github/scripts/templates/_footer.html). Einen Mechanismus für
seitenspezifische Bausteine gab es nicht. Wer etwas von Hand in den Footer einer Seite
schreibt, verliert es beim nächsten Lauf der Action — und die Action läuft bei jedem Push,
der `content/**`, `admin/**`, `assets/img/projekte/**`, `assets/img/galerie-teaser/**` oder
`.github/scripts/**` berührt.

### Behoben

Drei Platzhalter im Template, gefüllt von
[`footerTemplateData`](../.github/scripts/lib/render.mjs:474):
`{{startseiteFormularLink}}`, `{{startseiteSocial}}`, `{{stundenZusatz}}`.

Die Bausteine gehören nachweislich nur auf die Startseite:

- `id="anfrage"` gibt es ausschließlich in `index.html` — auf jeder anderen Seite wäre der
  Link tot
- die gesamte Gestaltung steht in `home-dark.css`, und die wird nur von `index.html` geladen

> **Überholt durch AP-339 (16.09.2026).** Beide Begründungen gelten nicht mehr: der Link
> bekommt sein Präfix aus `base`, die Gestaltung steht in `assets/css/footer-kontakt.css`.
> `/ueber-uns/` trägt die Bausteine seitdem ebenfalls. Die Platzhalter heißen jetzt
> `{{handyFormularLink}}` und `{{handySocial}}`.

Die Fallunterscheidung prüft **den Seitenpfad**, nicht `base`: `404.html` liegt ebenfalls in
der Wurzel und hätte die Bausteine sonst mitbekommen (beim ersten Versuch genau so passiert).
Dafür bekommt `footerTemplateData` jetzt den relativen Pfad als zweites Argument.

Die Platzhalter stehen im Template **ohne eigene Zeile** (`</a>{{startseiteFormularLink}}`),
damit der Footer aller übrigen Seiten zeichengleich bleibt.

### Gegenprobe

Alle vier Schritte der Action lokal nachgefahren — `check-config-sync`, `build-index`,
`build-gallery-teaser`, `build-footers`:

```
✅ Einheitlicher Footer in 0 von 38 HTML-Dateien aktualisiert.
git status --porcelain -- data/projekte-index.json data/galerie-teaser.json \
  assets/img/galerie-teaser/generated sitemap.xml '*.html'   → keine Seite geändert
```

Der Generator erzeugt `index.html` jetzt zeichengleich mit dem Handstand, und keine der
anderen 37 Seiten ändert sich. Der Bot hat nichts mehr zu committen.

### Merksatz

Der Footer einer Seite ist **generierter Inhalt**. Änderungen daran gehören ins Template
plus, wenn sie nur eine Seite betreffen, in einen Platzhalter mit Fallunterscheidung in
`footerTemplateData`. Ein Handstand in der HTML-Datei hält bis zum nächsten Push auf
`content/**`.

---

## AP-287 — Footer auf dem Handy wieder als eigene Kachel

Auftrag: der Footer soll auf dem Handy als einzelne, abgerundete Kachel stehen.

**Beim Nachmessen zeigte sich: die Kachel gab es bereits — sie war nur unsichtbar.**
`styles.css:1652` gibt dem Footer bis 720 px `margin: 0 12px …` und `border-radius: 24px`,
auf allen Seiten. Auf der Startseite hatte er aber exakt die Farbe der Seite dahinter.

| bei 390 px | Startseite vorher | Unterseite `/kontakt/` |
|---|---|---|
| Footer-Hintergrund | `#171916` | `#0E100D` |
| Seiten-Hintergrund | `#171916` | `#171916` |
| Abstand / Radius | 12 px / 24 px | 12 px / 24 px |
| box-shadow | inset 1 px | keine |

### Ursache

[privat-form.css:5093](../assets/css/privat-form.css:5093), innerhalb
`@media (max-width: 480px)`. Der Block vereinheitlicht bewusst die Flächen zusammengehöriger
Abschnitte („Inhaltlich verbundene Bereiche teilen eine Fläche", Kommentar Zeile 5075) — der
Footer war dort mitgerutscht. Eine zweite Gruppe (Zeile 5101) legte ihm zusätzlich
`box-shadow: inset 0 1px 0` auf; auf einer gerundeten Kachel zeichnet diese Linie einen
schwachen Bogen über die oberen Ecken, genau der Effekt, den `styles.css:1645` für
`border-top` schon beschreibt und dort abschaltet.

Gefunden über die CSSOM-Trefferliste am Element selbst, nicht über Textsuche — die Regel
steht in einer Datei, die man beim Footer nicht vermutet, und nennt `.site-footer` nur als
vierten Eintrag einer `:is()`-Liste.

### Behoben

`.site-footer` aus **beiden** Selektorlisten gestrichen. Damit gilt wieder
`var(--bg-dark)` = `#0E100D` aus `styles.css:1425` / `home-dark.css:198`. Kein neuer Wert,
keine Sonderregel für die Startseite — sie gleicht sich den 37 Unterseiten an. Beide Stellen
tragen jetzt einen Kommentar, warum der Footer nicht in diese Gruppen gehört.

### Gemessen (nachher, 390 px)

Startseite und `/kontakt/` liefern identische Werte: Hintergrund `rgb(14, 16, 13)` gegen
Seite `rgb(23, 25, 22)`, 12 px eingerückt, 366 px breit, Radius 24 px, `box-shadow: none`,
Inhalt 32 px vom Bildschirmrand. Kein waagerechter Überlauf.

Die Nachbarsektionen sind unverändert: `.mr-ueber`, `.private-process-updated`,
`.private-contact` weiterhin `#171916`, `.private-faq` `#1b1e19`, alle randbündig mit
Radius 0.

Bei 481 px und 720 px bleibt es bei der Kachel — dort hatte die 480er-Regel ohnehin nie
gegriffen, der Footer war also schon vorher dunkler abgesetzt. Ab 721 px läuft er wie bisher
randbündig ohne Radius.

---

## AP-289 — Grund hinter der Footer-Kachel auf den FAQ-Ton

Nachtrag zu AP-287. Die Footer-Kachel war danach sichtbar schwarz (`#0E100D`), der 12 px
breite Streifen um sie herum trug aber die Seitenfarbe `#171916` — während die Sektion
**direkt darüber** die FAQ mit `#1b1e19` ist. An der Oberkante der Kachel entstand dadurch
eine Kante.

Auf Wunsch des Auftraggebers bleibt die Kachel schwarz, der Grund um sie herum bekommt den
Ton der FAQ-Sektion. Aus drei gemessenen Kandidaten gewählt: **`#1b1e19`** (die Fläche der
FAQ-Sektion), nicht das Marken-Grün `#8CC63F` und nicht der FAQ-Kachelton `#232A1C`.

### Wer den Streifen malt — gemessen bei 390 px

| Bereich | Dokumentposition | gemalt von |
|---|---|---|
| links und rechts der Kachel | 0 … 13826 | `body` |
| **unter** der Kachel | 13826 … 13838 | `html` |

Der untere Streifen hängt an `html`, nicht an `body`: die 12 px `margin-bottom` des Footers
fallen durch Margin Collapsing aus dem Body-Kasten heraus, `body` endet an der
Kachelunterkante. Eine Regel nur auf `body` hätte den unteren Streifen stehen lassen — das
war der Punkt, an dem die Änderung beinahe halb fertig geworden wäre.

### Warum der Grundton und kein Rahmen am Footer

Gegenprobe im Browser: `html` und `body` versuchsweise auf Magenta gesetzt und die Seite
abgefahren. Magenta erschien **ausschließlich** in den drei Streifen um die Footer-Kachel.
`<main>` läuft lückenlos von 0 bis 13351, alle acht Sektionen darin sind randbündig und
haben eine eigene Hintergrundfarbe — keine senkrechte Lücke, keine seitliche Einrückung
außer beim Footer. Der Grundton ist damit gleichbedeutend mit „der Streifen", nur ohne
zusätzlichen Mechanismus.

Ein `box-shadow` am Footer wäre enger gefasst gewesen, hätte aber an den vier Ecken der
Kachel kleine Bögen der alten Farbe stehen lassen (Außenradius 24 + 12 = 36 px).

### Umgesetzt

[privat-form.css:5077](../assets/css/privat-form.css:5077), im bestehenden
`@media (max-width: 480px)`-Block: `html.home-theme-dark` neben `html.home-theme-dark body`,
beide auf `#1b1e19`. Derselbe Selektor steht im Inline-`<style>` in `index.html:8`; die
Regel aus `privat-form.css` steht in der Dokumentreihenfolge dahinter und gewinnt (über die
CSSOM-Trefferliste geprüft: vier passende Regeln, `privat-form.css` als letzte).

Der AP-209-Kommentar über dem Block nennt `#171916` als Grundton — er ist um einen Hinweis
auf die Änderung ergänzt, sonst widerspricht er der Regel darunter.

### Gemessen (390 px)

`html` und `body` beide `rgb(27, 30, 25)`, identisch mit `.private-faq`. Kachel unverändert
`rgb(14, 16, 13)`, 12 px eingerückt, 366 px breit, Radius 24 px, `box-shadow: none`. Die
übrigen Sektionen unverändert bei `rgb(23, 25, 22)`. Kein waagerechter Überlauf.

Bei 481 px und 1440 px bleibt der Grundton `rgb(23, 25, 22)` — die Regel gilt nur bis
480 px, und oberhalb hat die FAQ-Sektion ohnehin nicht `#1b1e19`. `/kontakt/` bei 390 px
unverändert.

---

## AP-292 — Über uns: Hundefoto an der Mustergarten-Kachel, drei Kernaussagen

Umsetzung des vom Auftraggeber gelieferten Dokuments `AP-291-ueber-uns-hund-mustergarten.md`
(`files (12).zip`, mit Referenzbildern für 390 px und 1280 px). Die Nummer AP-291 war beim
Umsetzen bereits vergeben (C2-Bewegung, `b7ef6fe`), deshalb läuft das Paket als AP-292.

Neue Reihenfolge der Sektion `#ueber` in allen Breiten: Überschrift → Mustergarten-Video mit
Hundefoto unten rechts → „1.500 m² Mustergarten in Herne" und Besuchshinweis → drei
Kernaussagen → Button. Danach unverändert Trennlinie und Einsatzgebiet-Karte.

### Zwei Freigaben, erteilt am 11.09.2026

- **F1 — Kurzfassung des Texts.** Der Absatz aus AP-286 ist zu drei Aussagen verdichtet.
  „saubere Arbeit" und „Gartenanlagen, die langfristig funktionieren" sind nicht mehr
  enthalten. Das Datum steht im HTML-Kommentar über der Liste.
- **F2 — Umbau der Sektion.** Das eigenständige Hundefoto samt handschriftlicher
  Bildunterschrift entfällt in allen Breiten. Auf dem Desktop trug es mit 532 × 746 px die
  rechte Spalte; der Hund sitzt jetzt als 260-px-Einschub an der Videokachel.

### Prüfung vor dem Lauf

Alle 17 Anker des gelieferten Skripts gegen `b7ef6fe` gezählt — jeder genau einmal. Das
Dokument war gegen `6e92191` geschrieben; dazwischen lag nur AP-291, das andere Dateien
angefasst hat. Das Skript lief unverändert durch, mit zwei Substitutionen vorab:
`AP-291` → `AP-292` und `[OFFEN: Datum der Freigabe]` → `11.09.2026`.

### Das Video ist unverändert geblieben

Ausdrückliche Auflage. Im Diff erscheint `<video class="mr-ueber__video">` nur als
Verschiebung — Zeile für Zeile identisch. Nachgemessen im Browser: `readyState 4`,
`videoWidth 720 × 544`, `playbackRate 0.6`, Poster gesetzt, Quelle `mustergarten.mp4`,
`pointer-events: none`, Seitenverhältnis 21:9 ab 861 px und 4:3 bis 599 px.

### Gemessen

| Breite | Hundefoto | Überstand unten | Luft zum Text | Muster → Buttonende | Überlauf |
|---|---|---|---|---|---|
| 360 px | 130 px | 40 px | 16 px | 670 px | 0 |
| 390 px | 140 px | 40 px | 16 px | 687 px | 0 |
| 480 px | 176 px | 40 px | 16 px | 777 px | 0 |
| 1280 px | 260 px | 40 px | 24 px | zweispaltig | 0 |

Bei 360 px ragt das Foto 10 px über die rechte Kachelkante — der Container hat 20 px
Innenabstand, deshalb bleibt der Überlauf bei 0. Überschrift bis 480 px linksbündig, darüber
zentriert. Punkte und Button fluchten ab 861 px oben auf derselben Linie (beide y = 832 bei
1280 px). Die Sektion ist auf dem Handy 131 px kürzer als vorher.

### Stolperstelle bei der Prüfung: GSAP macht Elemente unsichtbar

Der Button meldete in der Vorschau korrekte Maße (350 × 64 px an der richtigen Stelle), war
aber nicht zu sehen. Ursache: seit AP-278 liegt GSAP mit ScrollTrigger im Projekt, und der
setzt als Inline-Style `opacity: 0; visibility: hidden` bis die Animation startet. Im
Browser-Pane läuft sie nie an (eingefrorener IntersectionObserver). **Kein Fehler dieses AP**
— aber der Pane-Shim braucht seither zusätzlich `visibility: visible !important`, sonst
zeigt die Vorschau leere Flächen, wo alles in Ordnung ist.

### Offene Punkte

- **O1 — Bildunterschrift.** „Feierabend im Mustergarten" steht nur noch im Alt-Text. Die
  handschriftliche Grafik `feierabend-im-mustergarten-*.webp` liegt weiterhin unter
  `assets/img/ueber/`, wird auf der Startseite aber nicht mehr verwendet.
- **O2 — Tote CSS-Regeln.** `.mr-ueber__paar`, `.mr-ueber__foto*` und Reste von
  `.mr-ueber__beleg` greifen ins Leere. Aufräumen als eigenes AP — bewusst nicht hier.
- **O3 — Verwaiste Kommentarstelle.** `index.html` verweist im Kommentar über dem
  Button-Logo auf „das viewBox-Verfahren wie bei `.mr-ueber__brand`"; diese Klasse gibt es
  nicht mehr. Gehört zu O2.
- **O4 — Einheitlichkeit der Markenblume.** AP-246 hatte Willkommen, Galerie und
  Mustergarten gleich signiert. Die Mustergarten-Kachel weicht jetzt bewusst ab.
- **O5 — Achse der Sektionsköpfe.** „Über uns" steht auf dem Handy linksbündig. Gemessen
  stehen vier weitere Sektionsüberschriften dort ohnehin links; zentriert sind nur noch
  „Unsere Leistungen von A bis Z" und der Willkommensgruß.
- **O6 — Name des Hundes.** Weiter offen (AP-230 O1). Falls bekannt, gehört er in den
  Alt-Text.


## AP-327 — Über-uns-Unterseite: neuer Seitenaufbau

Die Seite folgt seit AP-327 dem kurzen Aufbau aus dem dritten Entwurf vom 15.09.2026:
Kopf mit Faktensatz, Person, Betrieb mit Auftraggeberkarten, drei Projekte (auf dem Handy
als Karussell), das Panel „Auch für die kleine Sache", Mustergarten, Fotoband, FAQ und
Erreichbarkeit mit Kontaktkacheln.
Aus 283 Wörtern sind rund 500 geworden, davon etwa 110 in eingeklappten FAQ-Antworten.

| Wert | Fundstelle | AP |
|---|---|---|
| **Text und Zitat von Maik Rohdich** für die Sektion „Die Person" — drei bis vier Sätze in der Ich-Form, dazu ein Zitat mit freigegebenem Wortlaut | `ueber-uns/index.html`, auskommentierter Abschnitt hinter dem Kopf | AP-327 |
| **Leistungen für Kommunen und öffentliche Auftraggeber** — was der Betrieb dort konkret übernimmt, und ob eine Kommune als Referenz genannt werden darf | `ueber-uns/index.html`, dritte Auftraggeberkarte und die FAQ-Frage „Arbeiten Sie auch für Kommunen und Hausverwaltungen?" | AP-327 |
| **Ausstellende Stellen** für Meisterbrief (Handwerkskammer, Jahr) und Sachkundenachweis Pflanzenschutz | standen bis AP-327 in den Qualifikationskarten; die Sektion ist entfallen, die Angaben fehlen weiterhin | AP-327 |
| **Foto „Kranich"** für das fünfte Feld des Fotobands | `ueber-uns/index.html`, Sektion „So sieht es bei uns aus" — das Feld ist nicht gebaut, solange das Bild fehlt | AP-327 |
| **Google-Unternehmensprofil-URL in den Stammdaten** — der Link (`https://www.google.com/maps?cid=17269983059863253129`) steht seit AP-F1 in `index.html`, `stammdaten.json → offen.googleProfilUrl` ist trotzdem `null`. Er gehört in die Stammdaten, damit `sameAs` ihn nutzen kann | `content/stammdaten.json`, `index.html` | AP-327 |

**Sektion „Die Person" ist sichtbar — mit vorläufigem Text.** Sie ist der Kern der Entwürfe:
Wer auf der Startseite „Mehr über Maik Rohdich" klickt, sucht die Person. Bauen lässt sie
sich trotzdem nicht, ohne Sätze zu erfinden. Sie stand deshalb zunächst auskommentiert im
Quelltext; am 15.09.2026 hat der Auftraggeber entschieden, sie mit dem Blindtext aus seinem
Entwurf **sichtbar** zu schalten, damit das Layout im Zusammenhang zu beurteilen ist.

Das weicht bewusst von Grundregel 2 ab (kein sichtbarer Platzhaltertext) und ist auf diesen
Übergangsstand begrenzt. Zwei Sicherungen: Der vorläufige Text trägt die Klasse
`ueber-inhaber__platzhalter` und erscheint gedämpft und kursiv; in
`docs/go-live-checkliste.md` steht der Austausch als **Position 1b**, also vor dem
Aufheben der Indexierungssperre. Sobald Maiks Sätze vorliegen: Text ersetzen, Klasse
entfernen, Kommentar auflösen.

**Entschieden am 15.09.2026 (Auftraggeber):**

- Der Leitsatz „Gartenbau mit Handschlagqualität." bleibt auf dieser Seite, obwohl er in
  AP-285 von der Startseite gestrichen wurde.
- **Hausverwaltungen** sind als Auftraggebergruppe bestätigt; die zweite Karte heißt
  „Gewerbe und Hausverwaltungen".
- Kommunale Auftraggeber sind bestätigt und stehen wieder als eigene, dritte Karte.
  (Eine Zwischenfassung desselben Tages hatte sie in die Gewerbekarte gezogen; der dritte
  Entwurf hat sie zurückgeholt.)
- Das **Hundefoto** kommt zurück. Es war in AP-318/319 entfernt worden, weil es auf keiner
  Seite mehr stand; jetzt trägt es das Fotoband. Die fünf Ableitungen sind byte-genau aus
  der Historie zurückgeholt (`git show 9a5354f^:…`), der Eintrag steht wieder in
  `.github/scripts/build-images.mjs`. **Der Schlüssel `ueber-hund` fehlt weiterhin in
  `data/images.json`** — `build-images.mjs` wurde nicht ausgeführt, weil ein Lauf sämtliche
  Derivate und das ganze Manifest neu schriebe. Folgenlos, solange die Seite die Dateien
  direkt einbindet; beim nächsten regulären Lauf kommt der Schlüssel von selbst zurück.
- Das Projektkarussell greift nur bis 860 px; darüber stehen die drei Karten nebeneinander.
  Es stand auf Wunsch zunächst direkt unter der Chip-Zeile; seit deren Wegfall folgt es
  unmittelbar auf den Betriebsabschnitt.
- Schrift bleibt Outfit/Inter — das im Entwurf angebotene Nunito wurde verworfen.
- **Am 16.09.2026 entfallen:** die Chip-Zeile mit den vier Nachweisen und die Belegleiste
  („4,9 aus 68 Google-Bewertungen" samt Verweis ins Profil). Die Bewertungen kommen auf
  dieser Seite damit nicht mehr vor; auf der Startseite stehen sie unverändert.

**Die Qualifikationen stehen nur noch in der FAQ.** Erst ist die Sektion „Wofür wir
geradestehen" mit ihren vier erklärten Karten entfallen, dann am 16.09.2026 auf Wunsch des
Auftraggebers auch die Chip-Zeile, die an ihre Stelle getreten war. Damit sind aus dem
sichtbaren Text verschwunden: die ausstellenden Stellen („Landwirtschaftskammer",
„Sachgebiet 2.4.1"), die drei Verweise auf Baumkontrolle, Begutachtung und Gartenpflege —
und die Nachweise selbst, bis auf die FAQ-Antwort „Was bringt mir ein Meisterbetrieb?".
Im `Person`-Knoten des JSON-LD stehen weiter alle vier.

Das ist eine bewusste Entscheidung, aber sie hat eine gemessene Kehrseite: Die vier Chips
der Startseite hängen in `.gate-welcome`, und dieser Block ist ab 901 px `display: none`.
Auf dem Desktop kommen „Sachverständiger", „Sachkundiger" und „Baumkontrolleur" damit auf
der ganzen Website nur in dieser einen FAQ-Antwort vor. Das Kundenfeedback vom August
verlangt das Gegenteil („sodass jeder Kunde sie zu 100 % sieht").
**Die saubere Lösung wäre, die Chips auf der Startseite auch im Desktop einzuschalten** —
eigenes AP an der Startseite, hier nicht entschieden.

**Wortlaut aus dem Entwurf, nicht aus den Projektunterlagen belegt:** „Wir schauen uns auch
an, wie es drinnen aussieht …", der Text des Panels „Auch für die kleine Sache." und die
FAQ-Antwort zum gefallenen Meisterzwang (fachlich richtig — der Garten- und Landschaftsbau
ist zulassungsfreies Handwerk). Die Sätze stammen aus dem Entwurf des Auftraggebers.

**Nicht übernommen aus den Entwürfen:** Die Projektkacheln des zweiten Entwurfs trugen
Ortsangaben („Herne", „Bochum"), die es zu den verwendeten Fotos nicht gibt — die Bilder
stammen aus `content/galerie-teaser.json` und haben weder Ort noch Projekttitel. Die
Kacheln zeigen deshalb drei echte Projekte aus `data/projekte-index.json`.

---

## AP-339 — Startseiten-Footer auch auf `/ueber-uns/`, „Über uns" ins Hauptmenü

**Auftrag vom 16.09.2026:** „Übernehme 1:1 den Footer aus der Homepage für die Über Uns
Unterseite und füge im Menü Über Uns ein."

### Was der Unterschied tatsächlich war

Beide Seiten bekamen ihren Footer schon vorher aus derselben Vorlage. Verschieden waren nur
die drei Platzhalter aus [AP-254](#ap-254--footer-generator-löschte-die-mobilen-startseiten-bausteine)
— und die sind **reine Handy-Bauteile**: außerhalb von `@media (max-width: 480px)` standen
sie auf `display: none`. Ab 481 px waren die beiden Footer bereits deckungsgleich. Der
Auftrag betraf in der Sache also die Ansicht auf dem Telefon.

### Die zwei Gründe aus AP-254 sind aufgelöst

Dort steht, die Bausteine gehörten „nachweislich nur auf die Startseite". Beide Begründungen
gelten nicht mehr:

- **`#anfrage` gibt es nur in `index.html`.** Der Link bekommt sein Präfix jetzt aus `base`.
  Auf der Startseite bleibt es zeichengleich `#anfrage`, von `/ueber-uns/` aus wird
  `../#anfrage` daraus — der Sprung landet im Formular der Startseite. `/kontakt/` kam als
  Ziel nicht in Frage: die Seite hat kein Formular.
- **Die Gestaltung steht in `home-dark.css`.** Sie steht jetzt in
  `assets/css/footer-kontakt.css` und wird von beiden Seiten geladen.

Die Platzhalter heißen deshalb nicht mehr `{{startseiteFormularLink}}` / `{{startseiteSocial}}`,
sondern `{{handyFormularLink}}` / `{{handySocial}}`. Welche Seiten sie bekommen, steht in
`HANDY_FOOTER_SEITEN` in [render.mjs](../.github/scripts/lib/render.mjs). **Wer dort eine
Seite einträgt, muss `footer-kontakt.css` auf ihr auch einbinden** — sonst liegt das Markup
in der Seite und ist unsichtbar.

### Eine stille Doppelung, die dabei aufflog

`home-dark.css:198` setzte `.site-footer` auf `var(--bg-dark)` — denselben Wert, den
`styles.css:1426` ohnehin vergibt. Wirkungslos, solange beide dasselbe sagen. Beim Umzug
war sie es nicht mehr: mit zwei Klassen und einem Element stach sie die entschärfte
Handy-Regel aus, und die Startseite zeigte unter 481 px plötzlich `#0E100D` statt `#171916`.
Der Selektor ist ersatzlos entfallen; `.fork` bleibt in der Regel stehen.

Gemessen: Startseite bei 375 px vorher wie nachher `rgb(23, 25, 22)`, bei 1280 px
`rgb(14, 16, 13)`. Pixelvergleich der ganzen Startseite gegen den Stand davor — bei 375 px
und 1280 px **identisch**, abgesehen vom neuen Menüpunkt.

### Was auf `/ueber-uns/` nicht 1:1 wird

Der Footer ist in Aufbau, Farbe, Radius, Rasterung und Sichtbarkeitsschaltung identisch
(gemessen bei 375 px und 1280 px). Zwei Dinge bleiben verschieden, und beide sind
Eigenschaften der **Seite**, nicht des Footers:

- **Schriftgröße.** `home-dark.css:1398` gibt der Startseite unter 480 px eine fließende
  Wurzelgröße (14,93 px bei 375 px). Unterseiten stehen auf 16 px. Der Footer erbt das und
  ist dadurch rund 5 % größer: 528 px hoch statt 500 px, das Logo 295 px breit statt 280 px.
  Nachziehen ließe sich das nur über die Wurzelgröße — also für die ganze Seite.
- **Schriftart.** Nunito gilt bewusst nur für die Startseite, Unterseiten behalten
  Outfit/Inter. So entschieden in AP-327.

### Menüpunkt

`<li><a href="{{base}}ueber-uns/">Über uns</a></li>`, eingefügt **nach** „Galerie", auf allen
37 ausgelieferten Seiten und in `templates/_header.html`. Auf `/ueber-uns/` selbst steht er
wie bei `/kontakt/` und `/projekte/` als `<a href="./" aria-current="page">`.

Die erzeugten Seiten wurden **nicht** über `build-leistungen.mjs` neu gebaut — der Lauf
reißt handgesetzte Klassen mit (siehe `saved-gewerbe-link`). Vorlage und Seiten tragen
trotzdem dieselbe Zeile.

Gemessen bei 901 / 1024 / 1280 px: sechs Punkte, eine Zeile, Menübreite 515 px, kleinster
Abstand zu den Kopfknöpfen 37 px (bei 901 px, direkt über dem Umbruch auf das Hamburger-Menü).
Kein waagerechter Überlauf. Im offenen Handy-Menü sind alle Punkte 47 px hoch.

---

## AP-376 — Betriebsabschnitt der Über-uns-Seite: Wortlaut der alten Website

> **Überholt durch [AP-411](#ap-411--einstiegssektion-des-betriebsabschnitts-variante-d)
> (23.09.2026).** Der Auftraggeber hat die Entscheidung vom 20.09.2026, den Wortlaut der
> alten Website wörtlich zu übernehmen, ausdrücklich aufgehoben und die Kürzung angeordnet.
> Der Abschnitt bleibt als Vorgeschichte stehen — insbesondere die Liste der Werbesprache
> unten, denn genau diese Stellen sind jetzt gestrichen. Was in AP-376 als „nicht zu
> glätten" markiert ist, gilt seit AP-411 **nicht mehr**.

Der Fließtext in `<div class="ueber-betrieb__wort">` war vom 20.09.2026 bis zum 23.09.2026 der
Text der **alten Website des Auftraggebers**, auf seine ausdrückliche Ansage wörtlich
übernommen. Er löste die zwei Absätze aus AP-220/AP-327 ab.

### Bewusste Abweichung von Grundregel 5

Der Text enthält Werbesprache, die Grundregel 5 (`CLAUDE.md`, „Keine Superlative, keine
Werbesprache") sonst ausschließt. Der Auftraggeber wurde auf den Konflikt hingewiesen und hat
sich für die wörtliche Übernahme entschieden. **Diese Stellen sind kein Versehen und nicht zu
glätten:**

- „seit über 20 Jahren **erfolgreich**!" — wertende Selbstbeschreibung samt Ausrufezeichen
- „**anspruchsvoller** Außenanlagen", „**anspruchsvoller** Privatgärten" (2×)
- „**hochwertiger** … Privatgärten", „qualitativ **hochwertigen** Gartenanlage"
- „**partnerschaftliche** Zusammenarbeit", „**langjährigen** Geschäftsbeziehungen"
- „Getroffene Absprachen haben für uns den gleichen Stellenwert wie schriftliche Verträge"
- „**alle** Arbeiten aus einer Hand"

### Zwei Aussagen, die neu belegt sind

Beide standen bisher in keinem Dokument des Teils B. **Belegquelle ist die alte Website des
Auftraggebers**, überbracht am 20.09.2026:

| Aussage | Bisheriger Stand |
|---|---|
| Ausführung von Außenanlagen im **öffentlichen** Bereich | Kommunen waren seit 15.09.2026 als Auftraggebergruppe bestätigt, die Leistungen dort aber offen |
| **Spezialisten aus angrenzenden Gewerken, etwa der Entwässerungstechnik** | Teil B kannte nur „Partnerfirma in Bochum (Details offen)" |

**Weiterhin offen:** *welche* Leistungen der Betrieb für Kommunen konkret übernimmt und ob
eine Referenzkommune genannt werden darf. Der Alttext sagt nur, **dass** im öffentlichen
Bereich gearbeitet wird. Die Kachel „Kommunen und öffentliche Auftraggeber" bleibt deshalb
bei ihrem zurückhaltenden Satz und ohne Link.

### Einzige inhaltliche Änderung am Original

„seit **über** 20 Jahren" statt „seit 20 Jahren". Die Seite nennt an drei Stellen das
Gründungsjahr 2003 — in der Meta-Beschreibung, im JSON-LD und in der FAQ („Seit 2003, mit
Sitz in Herne"). Bei Stand 2026 sind das 23 Jahre; ohne das „über" widerspräche sich die
Seite selbst. Der Auftraggeber hat der Ergänzung zugestimmt.

### „Deutschlandweit" steht nicht mehr auf dieser Seite

Der bisherige Text sagte „nach Anfrage und Absprache auch gerne deutschlandweit", der
Alttext kennt die Angabe nicht. Teil H.6 des Umsetzungsplans will sie ohnehin nur an einer
Stelle — in der Bildunterschrift der Einsatzgebiets-Karte der Startseite. Der Wegfall bringt
die Seite also näher an die Vorgabe. `areaServed` im JSON-LD bleibt unverändert.

### Was stehen geblieben ist

- **Der Absatz unter „Über uns"** (`.ueber-aufschlag`, „Maik Rohdich führt seinen
  Meisterbetrieb seit 2003 …") — unverändert, obwohl ursprünglich mitmarkiert. Entscheidung
  des Auftraggebers: der ganze Alttext kommt in den unteren Abschnitt.
- **Der Merksatz** „Was nicht sinnvoll ist, sagen wir Ihnen vorher." (Beleg: Teil A.4). Er
  sitzt jetzt zwischen Liste und Absprachen-Absatz — beide handeln davon, worauf man sich
  ohne Papier verlassen kann.
- **Die drei Kacheln „Für wen wir arbeiten".** Sie überschneiden sich teilweise mit den fünf
  Tätigkeitsschwerpunkten, sagen aber etwas anderes: die Liste, *welche* Arbeiten der Betrieb
  macht, die Kacheln, *für wen* — mit den Links dorthin. Auftraggeber-Entscheidung, beides zu
  behalten.

### Technische Notizen

- Die Liste trägt `class="lp-list lead"`. `.lp-list` (`styles.css:3014`) ist der
  Projektstandard für Aufzählungen im Fließtext und steht in einer Datei, die die Seite
  ohnehin lädt — kein seitenweites Cache-Busting nötig. Das zweite `lead` ist **nicht**
  Zierde: Die Abstandsregeln in `ueber-uns.css` arbeiten mit dem Nachbar-Kombinator und
  kennen nur `.lead`. Ohne die Klasse fielen die Abstände vor und hinter der Liste auf 0.
- `.ueber-betrieb__raster` steht auf `align-items: center` statt `start`. Der Textblock ist
  bei 1280 px 993 px hoch, das Foto 390 px; mit `start` blieben darunter rund 600 px
  Leerfläche. Gemessen nach der Änderung: 302 px über und 302 px unter dem Foto.
- `ueber-uns.css` wird nur von dieser einen Seite geladen — `?v=` nur dort hochzählen.

---

## AP-381 — Der Leitsatz wird Überschrift des Betriebsabschnitts

„Gartenbau mit Handschlagqualität" steht seit dem 21.09.2026 nicht mehr als Leitsatz im
Kopf der Über-uns-Seite, sondern als Überschrift über dem Abschnitt, der den Betrieb
beschreibt. Er ersetzt dort „Ein Betrieb, der die Arbeit selbst macht" (Sektionstitel seit
AP-220). Ansage des Auftraggebers.

### Verhältnis zu den bisherigen Entscheidungen

Die Festlegung vom 15.09.2026 lautet: „Der Leitsatz bleibt **auf dieser Seite**, obwohl er in
AP-285 von der Startseite gestrichen wurde." Sie gilt unverändert — der Satz bleibt auf der
Seite, nur an anderer Stelle. Eine Entscheidung, die ihn an den **Kopf** bindet, gibt es
nicht; geprüft in `docs/` und in der Commit-Historie.

Ebenfalls unverändert gilt E7 vom 06.09.2026: **ohne Anführungszeichen**, damit er kein Zitat
vortäuscht. Das ist beim Umzug so geblieben.

**Neu ist der fehlende Schlusspunkt.** Bisher stand „Handschlagqualität." mit Punkt. Als
Überschrift steht er ohne — alle drei anderen Überschriften mit grünem Steg
(„Was daraus wird", „Häufige Fragen zum Betrieb", vormals „Ein Betrieb …") stehen ebenfalls
ohne. Punkte tragen auf dieser Seite nur die beiden eigenständig gestalteten
Aussage-Überschriften und der Merksatz.

### Der Kopfbereich ist damit leer

Er trägt nur noch Brotkrumen und die H1 „Über uns". Das ist die dritte Entnahme in Folge:
AP-377 der Faktensatz, AP-380 die Mustergarten-Sektion, AP-381 der Leitsatz. Vom Auftraggeber
so gewollt. Nächstes Vorbild im Projekt ist `kontakt/index.html` — dort besteht der Kopf
ebenfalls nur aus Brotkrumen und H1.

### Was technisch mitwandern musste

`.ueber-leitsatz` und `.ueber-leitsatz em` sind entfallen, ebenso der Eintrag
`max-width: none` in der 860px-Medienabfrage — die Klasse kam im Repo sonst nirgends vor.

Die Auszeichnung des Wortes brauchte dagegen einen neuen Träger. Ohne Regel wäre
„Handschlagqualität" in der Überschrift **kursiv und ohne Akzentfarbe** erschienen: Es gibt
im Projekt keine `em`-Regel, die `.type-section-title` trifft, und Outfit ist nur mit
`font-style: normal` geladen — der Browser hätte synthetisch geschrägt. Die Behandlung steht
deshalb jetzt an der Überschrift:

```css
.ueber-betrieb__wort .type-section-title em {
  font-style: normal;
  color: var(--home-lime);
}
```

Gemessen nach der Änderung: `rgb(140, 198, 63)`, `font-style: normal`, restliche Überschrift
in `--ink`, grüner Steg unverändert `4px solid rgb(140, 198, 63)`. Bei 375 px wie bei 1280 px
bricht „Handschlagqualität" auf eine eigene Zeile — grüner Balken und grünes Wort stehen also
nicht nebeneinander in derselben Zeile.

`id="betrieb-title"` ist erhalten geblieben; das `aria-labelledby` der Sektion löst weiterhin
auf. Kein Sprungziel im Menü verweist darauf.

---

## AP-383/384 — Die Inhaber-Sektion wird zur Team-Sektion

Am 21.09.2026 auf Ansage des Auftraggebers:

- Die Überschrift heißt statt „**Die Person** hinter dem Betrieb." jetzt
  „**Das Team** hinter dem Betrieb." (AP-383).
- Der Absatz darunter trägt den Text des Auftraggebers und **keinen Platzhalter mehr**
  (AP-384). Die Klasse `ueber-inhaber__platzhalter` ist dort entfernt, der Text steht
  aufrecht und in der normalen Textfarbe statt gedämpft und kursiv.

Der neue Wortlaut:

> Auf der Baustelle treffen Sie unser Team – Leute vom Fach, die ansprechbar sind und Ihnen
> gern erklären, was sie gerade tun. Mit Ihrem Grundstück gehen wir sorgfältig um –
> schließlich wird es auch während der Bauzeit weiter genutzt.

### Was damit hinfällig ist

Die Sektion war als **Personen-Sektion** angelegt: „Wer auf der Startseite ‚Mehr über Maik
Rohdich' klickt, sucht die Person und findet sonst einen Betrieb." Gebraucht wurden dafür
„drei bis vier Sätze in der **Ich-Form** von Maik Rohdich — warum er 2003 angefangen hat,
worauf er bei einem Grundstück zuerst schaut, warum er lieber abrät".

**Dieser Text wird nicht mehr gebraucht.** Der gelieferte Absatz steht in der Wir-Form und
handelt vom Team auf der Baustelle, nicht vom Inhaber. Die Anforderung ist damit nicht
offen, sondern gegenstandslos — sie ist in `docs/go-live-checkliste.md` unter 1b als erledigt
abgehakt, nicht gestrichen, damit die Änderung nachvollziehbar bleibt.

### Was offen bleibt

- **Das Zitat** darunter ist weiter Platzhalter („Ein Satz von Maik – der, mit dem er abrät
  …") und trägt weiter `ueber-inhaber__platzhalter`. Es ist die letzte Stelle auf der Seite,
  die von Grundregel 2 abweicht, und steht als einziger verbleibender Punkt unter 1b.
- **Die Namenszeile** unter dem Zitat lautet „Maik Rohdich, Gartenbaumeister". Unter einer
  Team-Überschrift ist ein Einzelzitat vertretbar, solange es als Zitat erkennbar bleibt —
  beim Ersetzen aber mitzudenken.
- **Der Namensraum** der Sektion heißt weiterhin `.ueber-inhaber*`. Umbenennen erst, wenn
  entschieden ist, ob der vorbereitete, auskommentierte Block `.ueber-team*` („Wer bei uns
  arbeitet") kommt — der braucht Namen, Einwilligungen und eine Freigabe, die Grundregel 3
  aufhebt. Sonst kollidieren zwei Namensräume für dasselbe Thema.

### Grundregel 3 ist gewahrt

Der Text nennt weder Mitarbeiterzahlen noch Fuhrparkgrößen und verlangt kein Teamfoto.
„Leute vom Fach" ist eine Eigenschaft, keine Menge.

---

## AP-411 — Einstiegssektion des Betriebsabschnitts (Variante D)

Grundlage ist ein Auftragsdokument des Auftraggebers („Variante D",
`ap-einstiegssektion-variante-d.md`, 23.09.2026). Es ist **außerhalb des Repos** aus zwei
Screenshots und einem Nachbau entstanden; die Prüfung gegen den Ist-Stand hat mehrere
falsche Annahmen ergeben, die unten stehen.

### Entscheidungen des Auftraggebers, 23.09.2026

| Frage | Entscheidung |
|---|---|
| Fließtext | **Kürzen wie im Dokument**, einschließlich des neu formulierten Satzes |
| Schreibmaschine für die Prozesskette | **Ja**, `MODE = 'once'` |
| Knöpfe „Anrufen" und „WhatsApp" am Sektionsende | **Nein**, entfallen ersatzlos |
| Tätigkeitsschwerpunkte als Chips | **Nein**, die Liste bleibt eine Liste |

Die erste Entscheidung hebt AP-376 auf. Der Auftraggeber wurde darauf hingewiesen, dass er
damit seine eigene Festlegung vom 20.09.2026 umkehrt, und hat sie bestätigt.

### Was gestrichen ist

Von **212 auf 137 Wörter**. Das Dokument nennt 97 — die Differenz sind die fünf
Tätigkeitsschwerpunkte, die dort zu Chips werden und hier auf Ansage eine Liste bleiben.

- Gekürzt: der Herne-Satz („erfolgreich!", „anspruchsvoller" entfallen), der
  Bauzeiten-Satz, der Fachleute-Satz („aus dem Mitarbeiterkreis" entfällt).
- Ersatzlos: „Unsere Schwerpunkte liegen in der Realisierung hochwertiger und
  anspruchsvoller Privatgärten …"
- Umgebaut ohne Wortverlust: „Somit sind wir in der Lage, von der Planung … aus einer Hand
  zu erledigen." wird zur Zwischenüberschrift **„Alles aus einer Hand"** plus der Kette
  *Planung · Kostenermittlung · Realisierung · Koordinierung · Pflege*.

### Der eine neu formulierte Satz

> Im Mittelpunkt steht immer das Ziel, die Anlage termingerecht fertigzustellen. Grundlage
> dafür sind partnerschaftliche Zusammenarbeit und langjährige Geschäftsbeziehungen.

Er ersetzt zwei Originalsätze und ist die **einzige** Stelle, die nicht aus dem Bestand
stammt. Belegquelle ist damit allein dieses Auftragsdokument. Er bleibt bewusst bei
**„Ziel"** — „Der Termin ist Teil der Absprache" wäre eine Zusage statt einer Absicht und
unter §5 UWG eine andere Kategorie. **Nicht verschärfen.**

### Falsche Annahmen des Auftragsdokuments

| Annahme | Befund |
|---|---|
| Die Sektion stehe auf der Startseite, Branch `claude/kind-fermat-pyzy5p`, Basis `05ac78b` | Sie steht genau einmal, in `ueber-uns/index.html`. Gearbeitet wurde auf `codex/homepage-review`, Stand `ea0f33ec`. Die Begründung „die Startseite gilt ohnehin als zu lang" trägt hier nicht |
| Messwerte: Bild bei 1679 px, Sektion 1922 px | Aus dem Nachbau, nicht aus dem Repo. Gemessen bei 390×844: Bild bei **1517 px**, Raster **1787 px**. Die Wortzahl (211) stimmte dagegen auf ein Wort genau |
| Token `--rd-marke`, `--rd-inhalt`, `--muted` | **Existieren nicht.** `var(--rd-marke)` hat keinen Rückfallwert; die Regel wäre ungültig und der grüne Steg erschiene gar nicht. Verwendet: `--home-lime`, `--ink`, `--ink-mute` |
| Schrift `'Baloo 2'` | Steckt in `home-dark.css`, das diese Seite nicht lädt — die Angabe fiele auf `sans-serif` zurück. Verwendet: `var(--display)` (Outfit), wie am 15.09.2026 entschieden |
| Neues Farbtoken `#557927` für den Telefon-Knopf | Unnötig **und schlechter**: der vorhandene `.btn-primary` (`--green-700` #4A7A10) trägt auf Weiß 5,14 : 1, der neue Wert 5,06 : 1. Das Dokument hätte nach seiner eigenen §4-Regel den bestehenden Knopf nehmen müssen. Gegenstandslos, da die Knöpfe entfallen |
| §10.1 Telefonnummer sei offen | Ist sie nicht: beide Nummern stehen belegt in diesem Dokument, Zeile 18–19 |
| §10.4 „2001 gegen 2003 ungeklärt" | **2001 kommt im ganzen Repo nicht vor.** Quelle der Wahrheit ist `content/stammdaten.json` (`gegruendet: 2003-01-01`); „seit über 20 Jahren" ist am 20.09.2026 zugestimmt |
| §10.2 Chip-Ziele „aus `taxonomie.json` ableiten" | Von den sechs Beschriftungen hat nur „Baumpflege" eine existierende Seite. „Privatgärten" und „Landschaftsbau" existieren überhaupt nicht, und beide Hubs sind kein Linkziel (`/privatkunden/` hat keinen Index, `/gewerbekunden/` ist eine Weiterleitung). Durch die Entscheidung „Liste bleibt Liste" erledigt |

### Ein echter Fehler im gelieferten JavaScript

Das Skript aus §6 hängt den `IntersectionObserver` an `.intro-typer` — und dieses Element
startet `hidden`, ist damit `display: none` und hat ein Rechteck von 0×0. Ein Observer
meldet darauf dauerhaft `isIntersecting: false` bei `ratio: 0`; **die Animation wäre nie
angelaufen.** Gemessen in echtem Chrome: auf dem Typer `ratio 0`, auf der Kette `ratio 1`.
Beobachtet wird deshalb die Kette. Sie steht an derselben Stelle, ist sichtbar, und der
Observer ist getrennt, bevor `start()` sie wegklappt.

### Technische Notizen

- **Das Raster hat drei Kinder** (Text, Foto, Nachsatz); das Foto steht im Quelltext
  zwischen den Textblöcken. Gestapelt ergibt das die Reihenfolge der Variante D ohne `order`
  und ohne `display: contents`. Am Desktop verteilt `grid-template-areas` die Textblöcke auf
  Spalte 1 und lässt das Foto rechts über beide Zeilen stehen. **Die Bereichsnamen müssen im
  860-px-Block mit umgestellt werden**, sonst wirkt die zweispaltige Zuweisung weiter.
- `align-items: center` aus AP-376 ist zu `align-self: center` am Foto geworden.
- **Die Zusage-Kachel ist kein `blockquote` und trägt keine Anführungszeichen.** Der Satz ist
  kein Zitat, sondern der Betrieb über sich selbst — derselbe Grundsatz, der in AP-381 schon
  für die Überschrift galt.
- **Die Haltungszeile hat `ueber-steg` verloren.** Sie sitzt jetzt unter der H2, die den
  grünen Steg schon trägt; zwei Balken übereinander wären ein Fehler.
- **„Unsere Tätigkeitsschwerpunkte liegen in:" bleibt als Absatz stehen.** Das Dokument macht
  daraus eine Zwischenüberschrift, weil die Punkte dort zu Chips werden. Sie bleiben eine
  Liste, und ihre fünf Punkte stehen im Dativ — ohne den einleitenden Satz hinge die
  Aufzählung grammatisch in der Luft.
- **Der Pause-Knopf ist gebaut, bleibt aber `hidden`.** Bei `MODE = 'once'` wird er nie
  eingeblendet; wer auf `'loop'` stellt, braucht ihn nach WCAG 2.2.2 zwingend.
- `main.js` ist seitenweit: `?v=` in **37 ausgelieferten Seiten** hochgezählt. Die drei
  Vorlagen unter `.github/scripts/templates/` tragen `{{jsVersion}}` und werden **nicht** von
  Hand angefasst — der Wert wird per Regex aus `index.html` gelesen.

### Gemessen (390×844, echtes Chrome, `deviceScaleFactor: 1`)

| | vorher | nachher |
|---|---|---|
| Oberkante des Fotos ab Sektionsanfang | 1517 px | **646 px** |
| Raster (Text + Foto + Nachsatz) | 1787 px | **1440 px** |
| Sektion gesamt, mit „Für wen wir arbeiten" | 2349 px | **2002 px** |

Bei 1280 px: Foto unverändert 440 px breit, Raster 948 → 899 px.

Kontraste, alle über 4,5 : 1: Zusage-Satz 15,07 · Zusage-Begründung 7,50 · Faktenzeile und
Notiz 8,02 · Kettentext und Haltungszeile 16,10.

Schreibmaschine: läuft 10,2 s durch alle fünf Glieder, **Breite des Textfelds über den
ganzen Lauf konstant bei 143,83 px** (der unsichtbare Platzhalter hält sie fest, die Zeile
springt also nicht). Danach ist der Typer `hidden` und die Kette wieder sichtbar; erneutes
Hineinscrollen und ein Tabwechsel starten sie nicht neu. Bei
`prefers-reduced-motion: reduce` und mit abgeschaltetem JavaScript steht die Kette von
Anfang an vollständig da. Keine Konsolenmeldungen.

### Abnahmekriterium, das nicht erreicht ist

Das Dokument verlangt eine Sektionshöhe **≤ 1400 px**. Vergleichbar ist das Raster, und das
liegt bei **1440 px** — 40 px darüber. Der Grund ist die Entscheidung „Liste bleibt Liste":
Einleitsatz und Aufzählung kosten zusammen rund 320 px, als Chips wären es etwa 90 px
gewesen. Mit Chips wäre das Kriterium deutlich unterschritten worden. Das ist eine Folge der
Anweisung, kein Umsetzungsfehler — und der zweite Wert, die Oberkante des Fotos, liegt mit
646 px innerhalb der geforderten 650 px.

### Offen

- **Ein Beispiel zu „Was nicht sinnvoll ist, sagen wir Ihnen vorher."** (§10.6 des
  Dokuments). Ein konkreter Satz von Maik — wovon er schon einmal abgeraten hat — wäre der
  wertvollste Satz der Seite. Eigenes AP.
- **Welche Leistungen der Betrieb für Kommunen übernimmt** und ob eine Referenzkommune
  genannt werden darf. Unverändert offen seit AP-376.
- Der neu formulierte Satz hat als einzigen Beleg dieses Auftragsdokument. Falls Teil B je
  ergänzt wird, gehört er dort verankert.

---

## AP-413 — Kontaktseite: sieben Bausteine entfernt

Auf Ansage des Auftraggebers vom 23.09.2026 sind aus `kontakt/index.html` entfallen:

1. Die Überschrift **„Direkt erreichbar"** über der Kontaktkarte.
2. Der Kasten **„Gerade nicht erreichbar? Dann ist Maik wahrscheinlich auf einer
   Baustelle …"** samt Uhr-Pfeil-Symbol.
3. Die Ortsliste **„Herne · Bochum · Essen · Castrop-Rauxel · Recklinghausen ·
   Gelsenkirchen · Und Umgebung"**.
4. Die Überschrift **„Unser Einsatzgebiet"**.
5. Der Nachsatz **„WhatsApp-Nachrichten jederzeit – Antwort zu den Geschäftszeiten"**.
6. Das **Uhr-Symbol** neben den Öffnungszeiten.
7. Der Absatz **„Hier befinden sich unser Betrieb und der 1.500 m² Mustergarten.
   Besichtigungen und Beratungen finden ausschließlich nach vorheriger
   Terminvereinbarung statt."**

### Zwei Entscheidungen, ausdrücklich so gewollt

- **„Auch deutschlandweit nach Absprache" bleibt stehen** — samt der Trennlinie darüber.
  Der Auftraggeber wurde darauf hingewiesen, dass der Nachsatz damit ohne den Satz
  dasteht, auf den er sich bezieht, und hat sich dafür entschieden.
- **Der Mustergarten wird weiterhin genannt.** Der Hinweis unter der Karte („Bitte vorab
  Termin vereinbaren. So können wir uns Zeit für Ihre Beratung und die Besichtigung des
  Mustergartens nehmen.") bleibt wörtlich. Auf der Über-uns-Seite war die
  Mustergarten-Sektion in AP-380 vollständig entfallen; auf der Kontaktseite steht sie
  also weiter.

Dass ein Besuch nur nach Termin möglich ist, geht nicht verloren: Punkt 7 sagte es, der
bleibende Hinweis sagt es ebenfalls.

**Die Ortsliste des Einsatzgebiets steht damit nicht mehr auf der Kontaktseite.** Teil H.6
des Umsetzungsplans will die Angabe ohnehin nur an einer Stelle — in der Bildunterschrift
der Einsatzgebiets-Karte der Startseite. Der Wegfall bringt die Seite also näher an die
Vorgabe. `areaServed` im JSON-LD der Seite bleibt unberührt.

### Technische Notizen

- **Zwei `aria-labelledby` zeigten auf die entfernten Überschriften.** `aside.contact-direct-card`
  trägt jetzt `aria-label="Direkt erreichbar"` — unsichtbar, hält den Namen des
  Landmark-Bereichs. Aus `section.contact-coverage` ist ein `div` geworden: ohne Überschrift
  gibt es nichts mehr zu referenzieren, und ein `<section>` ohne Überschrift ist die falsche
  Auszeichnung. Nach der Änderung zeigt kein `aria-labelledby`/`aria-describedby` der Seite
  mehr ins Leere (geprüft).
- **`.contact-hours` war ein zweispaltiges Raster** `40px minmax(0,1fr)` für Symbol und Text.
  Ohne die Spaltendefinition wäre der verbleibende Text in die 40-px-Symbolspalte gerutscht
  und dort zerquetscht worden. Gemessen: Textbreite 237 → 289 px.
- **`form-trust-card.css` blieb unangetastet.** `form-trust-card__eyebrow` und
  `__coverage` benutzt auch die Startseite mit eigenem Markup. Gegenprobe: beide Bausteine
  dort vorher und nachher identisch.
- Tote Regeln in `kontakt.css` entfernt: `.contact-callback-note*`, `.contact-hours-icon*`,
  `.contact-hours small`, `.contact-coverage p span` (die AP-390-Bremse, die
  „Castrop-Rauxel" am Bindestrich zusammenhielt — sie stirbt mit der Ortsliste), die
  Abstandsregeln der beiden Überschriften und `.contact-location-copy > p`.

### Gemessen (375 px, echtes Chrome)

Höhe der Kontaktkarte **854 → 590 px**. Überschriftenebenen danach H1 → H2 ohne Sprung.
Keine Konsolenmeldungen.

---

## AP-414 — Kontaktseite: Einsatzgebiet-Rest und Geschäftszeiten entfernt

Nachtrag zu AP-413, am selben Tag auf Ansage des Auftraggebers. Aus der Kontaktkarte sind
die letzten beiden Blöcke entfallen:

1. **„Auch deutschlandweit nach Absprache"** — der Rest des Einsatzgebiet-Kastens, den
   AP-413 auf ausdrücklichen Wunsch noch hatte stehen lassen, samt der Trennlinie darüber.
2. **Die Geschäftszeiten** „Montag bis Freitag, 09:00–17:00 Uhr / Samstag, 09:00–12:00 Uhr ·
   Sonntag geschlossen".

Die Karte besteht damit nur noch aus den fünf Kontaktwegen (Mobil, Festnetz, E-Mail,
WhatsApp, Anfrageformular). Höhe bei 375 px: **590 → 452 px**; über AP-413 und AP-414
zusammen **854 → 452 px**.

### Wichtig: Auf dem Handy stehen die Geschäftszeiten jetzt nirgends mehr

Nachgemessen, nicht vermutet:

| Ort | Status |
|---|---|
| Fußzeile (`.footer-hours`) | **bis 480 px unsichtbar** (`display: none`, `footer-kontakt.css:260`), ab 481 px sichtbar |
| JSON-LD am Seitenkopf | `openingHoursSpecification` unverändert, auf jeder Breite |
| Kontaktkarte | entfernt |

Wer die Kontaktseite auf dem Telefon öffnet, findet die Geschäftszeiten also **nicht mehr**.
Am Desktop nennt sie weiterhin die Fußzeile. Maschinenlesbar bleiben sie über das JSON-LD
erhalten, für Suchmaschinen und das Google-Unternehmensprofil ändert sich nichts.

Das ist eine bewusste Entscheidung des Auftraggebers vom 23.09.2026 und kein Versehen.
**Falls die Zeiten auf dem Handy wieder auftauchen sollen**, ist der kleinste Weg, die Regel
in `footer-kontakt.css:260` zu streichen — dann zeigt die Fußzeile sie auf allen Breiten.

### Technische Notizen

- Alle drei `.contact-*`-Regelsätze der Karte sind damit tot und entfernt:
  `.contact-callback-note*` (AP-413), `.contact-coverage` und `.contact-hours*`. Keine der
  Klassen kommt im Repo noch vor.
- `form-trust-card.css` bleibt weiterhin unangetastet — denselben Baustein benutzt die
  Startseite mit eigenem Markup.
- Kein `aria-labelledby`/`aria-describedby` der Seite zeigt ins Leere (geprüft). Die Karte
  behält ihren Namen über das `aria-label` aus AP-413.
- Keine Konsolenmeldungen.

---

## AP-439 — Der Leitsatz verschwindet von der Über-uns-Seite

Die Überschrift des Betriebsabschnitts lautet seit dem **24.09.2026** auf Ansage des
Auftraggebers **„Ehrlich beraten, sauber gebaut"**. Grün steht die zweite Hälfte
(`<em>sauber gebaut</em>`) — dasselbe Muster wie zuvor, wo das ausgezeichnete Wort in der
zweiten Zeile stand. Der Auftraggeber hat den Teiler selbst gewählt.

### Was damit überholt ist

„Gartenbau mit Handschlagqualität" war der **Leitsatz** des Betriebs. Er stand bis AP-381
im Kopf der Seite und danach als Überschrift dieses Abschnitts. Mit AP-439 steht er
**nirgends mehr auf der Website** — auf der Startseite war er schon mit AP-285 gestrichen
worden.

Damit ist die Festlegung vom **15.09.2026** überholt: „Der Leitsatz bleibt **auf dieser
Seite**, obwohl er in AP-285 von der Startseite gestrichen wurde." Sie galt noch zu AP-381
unverändert. Die Ansage vom 24.09.2026 ist jünger und geht vor. **Kein Versehen, keine
stille Entnahme** — der Auftraggeber hat den Ersatztext wörtlich vorgegeben.

Ebenfalls gegenstandslos ist E7 vom 06.09.2026 („ohne Anführungszeichen, damit er kein
Zitat vortäuscht"): Es gibt keinen Leitsatz mehr, der als Zitat missverstanden werden
könnte.

**Falls der Leitsatz zurückkommen soll**, ist der kleinste Weg, ihn als eigenen Absatz
in den Betriebsabschnitt zu setzen — die Regel `.ueber-leitsatz` ist mit AP-381 entfallen
und müsste neu geschrieben werden.

### Technische Notizen

- Kein CSS geändert. Die Akzentfarbe kommt weiter aus
  `.ueber-betrieb__wort .type-section-title em` (AP-381); der neue `<em>` erbt sie
  unverändert. `?v=` der `ueber-uns.css` bleibt deshalb, wie es war.
- `id="betrieb-title"` unverändert — das `aria-labelledby` der Sektion löst weiter auf.
- Der Satz kam im Repo nur an dieser einen Stelle als sichtbarer Text vor. Kein JSON-LD,
  keine Meta-Angabe und kein Sprungziel nennt ihn.
- Der Schlusspunkt fehlt weiterhin, wie bei den anderen Überschriften mit grünem Steg.
- **`sauber&nbsp;gebaut` trägt ein geschütztes Leerzeichen.** Ohne es brach die Zeile bei
  390 px Fensterbreite zu „Ehrlich beraten, sauber" / „gebaut" — der grüne Teil begann dann
  mitten in der ersten Zeile. Bei 320 und 375 px trat das nicht auf, weil „sauber" dort schon
  nicht mehr in die erste Zeile passte. Mit dem geschützten Leerzeichen fällt der Umbruch auf
  jeder Breite hinter das Komma.

---

## AP-445 — Der Merksatz entfällt

Die Haltungszeile **„Was nicht sinnvoll ist, sagen wir Ihnen vorher."** steht seit dem
**24.09.2026** auf Ansage des Auftraggebers nicht mehr auf der Seite. Sie war seit AP-220
im Betriebsabschnitt und seit AP-411 direkt unter dessen Überschrift.

### Was damit überholt ist

Der Satz war **belegt**: Teil A.4 des Umsetzungsplans, „Der Inhaber sagt Kunden auch, wenn
etwas nicht sinnvoll ist." Die Tabelle der Belege weiter oben in diesem Dokument führt ihn
weiter — der Beleg bleibt ja richtig, nur steht der Satz nicht mehr auf der Seite.

Gegenstandslos wird damit der offene Punkt **„Ein Beispiel zu ‚Was nicht sinnvoll ist,
sagen wir Ihnen vorher.'"** (§10.6 des AP-376-Dokuments): Ohne den Satz gibt es nichts
mehr zu belegen. Falls der Satz je zurückkommt, kommt der Punkt mit ihm zurück.

**Kein Versehen, keine stille Entnahme** — der Auftraggeber hat den Absatz markiert und
seine Entfernung verlangt.

### Technische Notizen

- Die Klasse `.ueber-betrieb__haltung` kommt im Repo nirgends mehr vor; ihre beiden Regeln
  in `ueber-uns.css` sind entfernt.
- **Die Abstandskette musste nachgezogen werden.** Die Regel
  `.type-section-title + .ueber-betrieb__haltung { margin-top: 16px }` hielt den Abstand
  zur Überschrift. Neuer Nachbar der Überschrift ist die Faktenzeile, die von sich aus nur
  10 px trägt — zu knapp nach einer 32 px hohen Überschrift. Die Regel zielt jetzt auf
  `.ueber-betrieb__fakten` und hält dieselben 16 px.
- Der Kommentar zu AP-438 in `ueber-uns.css` nannte den Satz als Vorbild für das
  Schriftbild von „Alles aus einer Hand". Das Schriftbild kam nie von jenem Absatz, sondern
  von der Klasse `type-subsection-title`, die er trug — die Zwischenüberschrift ist von der
  Entfernung also nicht betroffen. Der Kommentar ist entsprechend nachgezogen.

---

## AP-450 — Zitat endgültig, Kachel „Kein Auftrag ist zu klein." entfallen

Zwei Ansagen des Auftraggebers vom **24.09.2026**, die zusammengehören.

**1. Das Zitat der Person-Sektion ist nicht mehr vorläufig.** Es lautet
**„Kein Auftrag ist uns zu klein."** Damit endet die Abweichung von Grundregel 2 (kein
sichtbarer Platzhaltertext), die seit dem 15.09.2026 auf ausdrückliche Entscheidung des
Auftraggebers bestand. Punkt **1b der Go-Live-Checkliste ist abgehakt**, die Klasse
`ueber-inhaber__platzhalter` ist aus Markup und CSS verschwunden.

**Der Satz ist nicht erfunden.** Der Auftraggeber gab die Richtung vor („irgendwas mit kein
Auftrag ist uns zu klein") und hat den genauen Wortlaut aus drei Vorschlägen gewählt. Alle
drei bestanden aus Wortlaut, der bereits auf der Seite stand und laut Markup-Kommentar zu
AP-327 vom Auftraggeber stammt.

**2. Die Kachel „Kein Auftrag ist zu klein." ist entfallen.** Sie stand seit AP-327 hinter
den Projekten und trug neben der Überschrift zwei Absätze und den Knopf „Kurz anrufen".
Ihre Aussage trägt jetzt das Zitat.

### Was damit verloren geht — und was nicht

- **Die beiden Absätze der Kachel** („Eine Stunde Hecke vor dem Geburtstag …" und „Dafür
  kommen wir mit denselben Leuten und demselben Gerät …") stehen nirgends mehr auf der
  Website. Sie waren die einzige Stelle, die diese Sorge ausbuchstabiert hat — das Zitat
  benennt sie, erklärt sie aber nicht. **Falls das zurückkommen soll**, ist der kleinste Weg
  ein Absatz in der Person-Sektion; die Kachelregeln sind entfernt und müssten neu
  geschrieben werden.
- **Der Knopf „Kurz anrufen"** fällt ersatzlos weg, so entschieden. Die Seite behält vier
  weitere Telefonlinks, dazu den Anrufknopf im Seitenkopf.

---

## AP-451 — Die FAQ der Über-uns-Seite entfällt

Auf Ansage des Auftraggebers vom **24.09.2026** ist die Sektion „Häufige Fragen zum
Betrieb" entfallen — vier Fragen in zwei Gruppen, dazu der `FAQPage`-Block im Seitenkopf.

### Was damit verloren geht

**Es war keine Dublette.** Der Markup-Kommentar zu AP-327 hielt ausdrücklich fest: Die FAQ
der Startseite beantwortet den Ablauf einer Anfrage, diese hier den Betrieb selbst. Die vier
Antworten stehen damit **nirgends mehr auf der Website**:

| Frage | Was die Antwort enthielt |
|---|---|
| Seit wann gibt es den Betrieb? | Seit 2003, Sitz Herne, geführt von Gartenbaumeister Maik Rohdich, tätig in ganz NRW |
| Was bringt mir ein Meisterbetrieb? | Meisterzwang gefallen, Meisterbrief als geprüfte fachliche Leitung und Ausbildungsberechtigung, dazu Baumkontrolleur der Landwirtschaftskammer, Sachverständigentitel 2.4.1, Sachkundenachweis Pflanzenschutz |
| Arbeiten Sie auch für Kommunen und Hausverwaltungen? | Ja — privat, Gewerbe, Hausverwaltungen, kommunal |
| Ist ein kleiner Auftrag zu klein? | „Eine Stunde Hecke zählt genauso wie ein ganzer Garten." |

Die dritte und vierte Antwort sind die letzten Stellen, an denen die Website den
kommunalen Auftraggeber und die kleinen Aufträge erklärt hat — die Kachel dazu ist mit
AP-450 entfallen, die Kundenkarte „Kommunen" nennt die Gruppe, ohne sie zu erklären.

**Der Meisterbrief-Absatz war der einzige Ort**, an dem die vier Qualifikationen in einem
Satz zusammenstanden und erklärt wurden. Die Startseite nennt sie am Tor als Schilder, ohne
Erläuterung.

### SEO

`FAQPage` musste mitgehen. Strukturierte Daten müssen den sichtbaren Inhalt abbilden; eine
`FAQPage` ohne sichtbare Fragen ist ein Richtlinienverstoß und bringt kein Rich Result,
sondern das Risiko einer manuellen Maßnahme. Der `LocalBusiness`-Graph der Seite bleibt
unberührt. Das Projekt ist laut `CLAUDE.md` ein SEO/GEO/AEO-Relaunch — der Wegfall eines
beantworteten Fragenblocks arbeitet gegen dieses Ziel und ist hier als bewusste
Entscheidung des Auftraggebers festgehalten.

**Falls die Fragen zurück sollen**, ist der kleinste Weg, sie in die FAQ der Startseite zu
übernehmen: Der Baustein `.faq-list` steht dort bereits, und der `FAQPage`-Block der
Startseite müsste um die vier Knoten wachsen.
