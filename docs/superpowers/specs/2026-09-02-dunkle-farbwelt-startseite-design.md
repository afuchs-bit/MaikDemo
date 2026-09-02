# Dunkle Farbwelt über die ganze Startseite

**Stand:** 02.09.2026 · Branch `codex/homepage-review` · nach `b9a3ace` (AP-F24)

## Warum

`index.html` trägt `html.home-theme-dark`. Hero und Social Proof laufen in der dunklen
Farbwelt. Alles ab „Gärten, die für sich sprechen." steht dagegen in der hellen Palette —
sichtbar als harter Bruch mitten auf der Seite.

Der Grund ist `merge-light.css`. Beim Zusammenführen der Privatkunden-Sektionen (AP-F1)
habe ich sie in `.merge-light-scope` gekapselt und darin die von `home-dark.css`
überschriebenen Token auf ihre hellen Ausgangswerte zurückgesetzt. Ohne diese Insel hätte
heller Text auf hellen Flächen gestanden. Der Kommentar in der Datei sagt es selbst:
*„Reines Gerüst für den Zwischenstand. Fällt in Phase 2 weg, sobald entschieden ist, welche
Sektionen bleiben und in welcher Farbwelt."*

Diese Entscheidung ist jetzt gefallen: **dunkel, über die ganze Seite.**

## Ausgangslage, gemessen

Die Insel wurde probeweise neutralisiert (Token auf `inherit`) und die Seite vermessen:

| Größe | Wert |
|---|---|
| Sektionshintergründe, die von allein dunkel werden | **5 von 6** |
| Sektionen mit fest kodiertem Hellwert | **1** (`.private-contact`, `rgb(238,241,231)`) |
| Elemente, die noch helle Flächen malen | **83** in rund **20 Bauteilgruppen** |
| Textstellen unter 4,5:1 | **59** von 165 geprüften |

Die beiden letzten Zahlen überlappen stark: Die meisten Textfehler entstehen nur, *weil* der
Text auf einer weiß gebliebenen Fläche sitzt. Fällt die Fläche, löst sich der Text mit auf.

In `privat-form.css` stehen **151 Regeln mit Hell-Literalen** in den betroffenen Sektionen.
Davon sind **53 `color:`-Angaben** — helle Schrift, meist bereits korrekt, weil sie auf
dunklen Flächen sitzt. Zu bearbeiten sind rund **97 Flächen- und Rahmenangaben**. Die im
Dateikopf von `merge-light.css` genannten „430 fest kodierten Hellwerte" beziehen sich auf
die ganze Datei, nicht auf das, was hier tatsächlich rendert.

## Die Besitzfrage entscheidet das Vorgehen

Nicht jede Datei darf umgebaut werden — mehrere bedienen auch helle Unterseiten.

| Datei | Seiten | Besitzt hier | Behandlung |
|---|---|---|---|
| `privat-form.css` | **1** | Galerie, Rezensionen, Kontaktfläche, Leistungskacheln, Anfragewege | **Literale → Token** |
| `anfrage.css` | **1** | Formularfelder (hat bereits eine `--anf-*`-Token-Brücke) | **Brückenwerte umhängen** |
| `home-dark.css` | **1** | die dunkle Schicht | nimmt Überschreibungen auf |
| `merge-light.css` | **1** | die helle Insel | **Token-Block entfällt** |
| `styles.css` | **39** | `.step-node`, `.chev`, `.faq-list` | **nur überschreiben** |
| `form-trust-card.css` | 3 | Vertrauenskarte | **nur überschreiben** |

`gewerbe.css` wird von `index.html` **nicht** geladen. Seine `.b2b-*`-Regeln sehen auf
dieser Seite nie das Licht und bleiben außen vor.

Daraus die Regel für die Umsetzung: **Gehört die Datei nur dieser Seite, wird sie
korrigiert. Bedient sie auch helle Seiten, wird ausschließlich unter
`html.home-theme-dark` überschrieben.** Nie umgekehrt.

## Entwurf

### 1. Die Insel fällt

Aus `merge-light.css` verschwinden der `.merge-light-scope`-Token-Block samt `background`,
`color` und `color-scheme` **und die Nahtlinie** (`border-top`) — eine Naht zwischen
dunkler Seite und heller Insel braucht es ohne Insel nicht mehr. Die Datei bleibt bestehen:
Ihre Rasterregeln (`.gate-doors`, `.fork-paths`) und die FAQ-Schalter-Optik haben mit Farbe
nichts zu tun.

**Der Wrapper `<div class="merge-light-scope">` in `index.html` wird mit entfernt.**
Geprüft: Die Klasse kommt nur in diesen beiden Regeln und dem Wrapper vor; keine der
verbleibenden Regeln ist unter ihr verschachtelt. Ebenfalls geprüft: Es gibt keine
Geschwister- oder Positionsselektoren auf Sektionsebene (`section + section`,
`:first-child` auf `main`-Ebene), die das Auspacken der sechs Sektionen treffen würden —
die vorhandenen `:first-child`- und `:nth-child`-Regeln greifen sämtlich innerhalb von
Sektionen.

### 2. Fünf Flächenrollen statt 83 Einzelfälle

Jede helle Fläche bekommt die Rolle, die sie im Aufbau hat — nicht „irgendein Grau":

| Rolle | Token | Wert | Wofür |
|---|---|---|---|
| Grundfläche | `--bg` | `#171916` | Sektionshintergründe |
| Gehobene Karte | `--bg-elev` | `#20241D` | Karten, Kacheln, Eingabefelder |
| Weiche Fläche | `--bg-soft` | `#2A2F26` | eingelassene Flächen, Chevron-Kreise |
| Sektionswechsel | `--bg-hero` | `#1B1E19` | abgesetzte Sektionen (FAQ nutzt das schon) |
| Linien | `--line` / `--line-2` | Weiß 12 % / 8 % | Rahmen, Trenner |

Diese Token sind dieselben, aus denen Hero und Social Proof leben. Damit zieht die Seite
bei einer späteren Palettenänderung geschlossen mit.

### 3. Was ausdrücklich hell bleibt

- **Die Google-Rezensionskarte.** Entscheidung des Auftraggebers: Das weiße Feld mit dem
  G-Logo ist Wiedererkennung; dunkel eingefärbt verliert sie den Bezug.
- **`.private-service-face--back`.** Die aufgeklappte Rückseite der Leistungskacheln trägt
  bereits einen dunkelgrünen Verlauf mit weißer Schrift und funktioniert unverändert.
- **Die 53 hellen `color:`-Angaben.** Helle Schrift auf dunklem Grund ist das Ziel, nicht
  das Problem. Sie werden einzeln geprüft, aber im Regelfall nicht angefasst. Ein pauschaler
  Durchlauf über alle Hell-Literale würde genau hier Schaden anrichten.

### 4. Zustände, die man nicht sieht

Ein Teil der Regeln in `privat-form.css` gehört zu Zuständen, die im Ruhezustand der Seite
nicht rendern: Fehlermeldungen, der Akutpfad des Assistenten, Karussellzustände, offene
Aufklapper, `:hover`/`:focus`. Für diese wird die Diagnose **mit erzwungenen Zuständen**
zusätzlich gefahren, statt die Werte auf Verdacht zu ersetzen.

**Was sich nicht nachweisen lässt, wird nicht angefasst.**

## Prüfung

Maßgeblich ist dieselbe Messung, die die Ausgangslage erhoben hat — erneut über die ganze
Seite, nicht die Sichtprüfung.

| Kriterium | heute | Ziel |
|---|---|---|
| Textstellen unter 4,5:1 | 59 | **0** |
| Helle Flächen | 83 | **nur die Google-Karte** |
| Sektionen in heller Palette | 6 | **0** |

Dazu:

1. **Erzwungene Zustände** durchmessen: Assistent Schritt 1–4, Akutpfad, offene
   FAQ-Gruppen, Karussell weitergeschaltet, Leistungskacheln umgedreht, Formularfehler.
2. **Unterseiten unversehrt:** `gewerbekunden/`, `kontakt/` und eine Leistungsseite
   stichprobenartig ansehen — sie teilen sich `styles.css` und `form-trust-card.css` und
   müssen hell bleiben. Das ist die wichtigste Regression, die dieser Umbau auslösen kann.
3. **Sichtprüfung** bei 375 / 768 / 1200 px über die ganze Seite.
4. Eine `h1`, keine doppelten IDs, keine toten Anker, keine Konsolenfehler, kein Querlauf.

**Fallstrick beim Messen:** Im Vorschau-Panel friert `requestAnimationFrame` ein. Vor jeder
Messung `document.getAnimations().forEach(a => a.finish())` und die `.reveal`-Elemente hart
auf `opacity: 1`.

## Risiken

| Risiko | Gegenmaßnahme |
|---|---|
| Helle Unterseiten brechen, weil in `styles.css` geändert statt überschrieben wurde | Besitzregel oben; Stichprobe auf drei Unterseiten gehört zur Prüfung |
| Zustände, die im Ruhezustand nicht rendern, bleiben hell | Diagnose mit erzwungenen Zuständen |
| Pauschaler Durchlauf zerstört korrekte helle Schrift | `color:`-Angaben getrennt behandeln, nie im selben Durchlauf ersetzen |
| `?v=`-Durchlauf über 37 Dateien | `styles.css` wird nicht angefasst, nur überschrieben |

## Berührte Dateien

| Datei | Änderung |
|---|---|
| `assets/css/privat-form.css` | ~97 Flächen- und Rahmenliterale auf Token |
| `assets/css/anfrage.css` | Token-Brücke auf dunkle Werte |
| `assets/css/home-dark.css` | Überschreibungen für `styles.css`- und `form-trust-card.css`-Bauteile |
| `assets/css/merge-light.css` | Token-Block entfällt |
| `index.html` | `?v=` der vier geänderten Dateien; ggf. `.merge-light-scope` |

## Was dieser Entwurf nicht tut

- **Kein Eingriff in `styles.css`.**
- **Keine Änderung an Aufbau, Text oder Reihenfolge** — ausschließlich Farbe.
- **Keine neue Palette.** Es werden nur die Token verwendet, die Hero und Social Proof
  bereits nutzen.
- **Kein Deployment, kein Push.**
