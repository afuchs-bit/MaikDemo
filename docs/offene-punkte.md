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
| Zertifizierungsstandard der Baumkontrolle (FLL o. a.) | `gewerbekunden/index.html`, `content/leistungen/gewerbe/baumkontrolle.json` | AP-13 / AP-33 |
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
