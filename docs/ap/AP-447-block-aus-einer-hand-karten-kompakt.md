> **Umsetzungsvermerk (24.09.2026) — umgesetzt als AP-447.**
>
> Das Dokument ist gegen `claude/kind-fermat-pyzy5p` geschrieben, umgesetzt wurde auf
> `codex/homepage-review`. Der Befund nach §0 ergab **fünf Stellen, an denen es nicht
> zutrifft**, und drei Entscheidungen des Auftraggebers.
>
> **Befund — Abweichungen vom Dokument**
>
> | Dokument | Gemessen im Repo |
> |---|---|
> | Token `--rd-marke` sei vorhanden | Gibt es nicht. Das Grün heißt `--green-500` / `--home-lime`, beide `#8CC63F` |
> | Token `--muted` | Gibt es nicht. Das Pendant heißt `--ink-mute` |
> | `--bg-elev` sei `#23262D`, Karten darauf umstellen | `--bg-elev` ist `#20241D`, und die Karten **trugen es bereits**. Die Flächenänderung war ein Leerlauf |
> | Kontrast 7,7 : 1 | Auf `#20241D` neu gemessen: **7,71 : 1** für den Kartentitel, **11,54 : 1** für den Kartentext |
> | „Baloo 2" sei einsetzbar | `ueber-uns.css` hatte kein `@font-face`. Ohne Portierung wäre jede Regel still auf die Ersatzschrift zurückgefallen — die Schnitte sind mit übernommen |
>
> Auch die Zielwerte wichen ab, weil seit AP-438/440/445 gekürzt wurde: Etikett 22,4 statt
> ~25 px, animiertes Wort 16,8 statt ~16 px, „Für wen wir arbeiten" 19,2 statt ~20 px,
> Block 961 statt 1046 px, Karten begannen nach 599 statt 619 px. Die Kritik trug trotzdem:
> Das animierte Wort war kleiner als das Etikett darüber.
>
> **Entscheidungen des Auftraggebers**
>
> 1. **Dritte Karte:** Text wird nachgeliefert. Bis dahin bleibt die Karte mit der heutigen
>    Zeile; die Variante „zwei Karten plus Zeile" aus §4 wurde nicht gewählt.
> 2. **Linkziele:** Alle drei Karten zeigen auf `../#leistungen`, die A-bis-Z-Leistungen der
>    Startseite. Von den drei Vorschlägen des Dokuments taugte **keiner**: `privatkunden/`
>    wurde in AP-F8 gelöscht, `gewerbekunden/` ist eine Weiterleitung auf die Startseite mit
>    `noindex, nofollow`, eine Kommunenseite gibt es nicht.
> 3. **Kartentexte:** Die heutigen Sätze bleiben, ergänzt um „Zäune" und „Baumpflege" in
>    Karte 1. Die Kurzfassung aus §4 wurde nicht genommen.
>
> **Nicht übernommen aus §4**, weil §0.5 ausdrücklich die vorhandene Komponente verlangt und
> zwei Kachelmaße nebeneinander der Fehler wären: die Klassennamen `.whofor*` (die Komponente
> heißt `.ueber-fuerwen__*`), `border-radius: 14px` (die Seite nutzt `var(--radius)`),
> `padding: 14px 16px 13px` (die Seite nutzt `clamp(16px, 2vw, 22px)`), `gap: 12px` samt der
> 900-px-Umbruchstelle (die Liste bricht im 860-px-Block, demselben Punkt wie der Rest der
> Seite) und die Textfarbe `--muted` (die Karten tragen `--ink-2`, `--ink-mute` wäre dunkler).
>
> **Ergebnis, gemessen bei 390 px:** Block 961 → **653 px** (Abnahmekriterium ≤ 720),
> Karten beginnen nach 599 → **251 px** (Kriterium ≤ 330), alle drei Karten sind Links.
>
> **Gemeldet, nicht hier gelöst:** Die „Baloo 2"-Deklaration steht jetzt zum dritten Mal im
> Projekt; die Zusammenlegung nach `styles.css` ist als eigenes AP angeboten. Der Block
> springt am Ende der Schreibmaschine um 26 px (vorher 32 px) — die statische Kette blieb
> nach §2 bei ihren 16 px.

---

# AP-XXX — Über uns: „Alles aus einer Hand" und „Für wen wir arbeiten" zusammenführen

**Repo:** `afuchs-bit/MaikDemo`, Branch `claude/kind-fermat-pyzy5p`
**Seite:** Über uns
**Erstellt:** 24.09.2026
**Grundlage:** Abnahme „Neu / Karten kompakt" aus `block-aus-einer-hand-mockup.html`

> **Das ist eine Änderung an bereits ausgelieferter Arbeit**, nicht ein Neubau. Die Schreibmaschine läuft live (AP-446). Dieses AP korrigiert ihre Dimensionierung und räumt den Block darunter auf. Vorhandene Klassen, IDs und JS **wiederverwenden**, nicht parallel neu anlegen.

> **AP-Nummer selbst ermitteln.** Per `grep -rn "AP-[0-9]" --include=*.html --include=*.css --include=*.js --include=*.md .` **und** `git log --oneline | head -40`. Die höchste mir bekannte Nummer ist AP-446, das ist aber nur ein Anhaltspunkt. Commit: `AP-XXX: Tätigkeitsschwerpunkte in die Kundenkarten überführen`.

---

## 0. Vorab: Befund erheben

1. **Datei und Markup** des Blocks „Alles aus einer Hand" bis einschließlich „Für wen wir arbeiten": Pfad, vollständiges Markup, verwendete Klassennamen.
2. **Welche CSS-Regeln** setzen aktuell die Größe von „Alles aus einer Hand", „Für wen wir arbeiten" und des animierten Worts? Datei, Selektor, Wert.
3. **Wie heißt die Schreibmaschinen-Struktur aus AP-446?** Klassen für Wrapper, Ausgabe-Span, Platzhalter-Span, und die Klasse, die während der Animation die Kette versteckt. Dieses AP ändert daran **nur Schriftgrößen**, keine Logik.
4. **Zielseiten für die drei Karten.** Existieren `privatkunden/` und `gewerbekunden/`? Gibt es eine Seite für Kommunen / öffentliche Auftraggeber? Pfade berichten, nicht raten.
5. **Gibt es bereits eine Kartenkomponente** auf der Website (gleiche Optik, anderer Ort)? Falls ja, die vorhandene erweitern statt eine zweite zu bauen.
6. **Messung vorher** mit Playwright/Chromium bei 390 × 844, `deviceScaleFactor: 1`: Gesamthöhe des Blocks von der Oberkante „Alles aus einer Hand" bis zur Unterkante der letzten Karte.

---

## 1. Zielwerte

Vermessung des abgenommenen Nachbaus bei 390 px:

| | Ist | Neu, Karten kompakt |
|---|---|---|
| Block gesamt | 1046 px | **648 px** |
| Karten beginnen bei | 619 px | **278 px** |
| Wörter | 153 | 101 |
| Anklickbare Karten | **0** | 3 |

**Abnahmekriterien:** Block ≤ 720 px, Karten beginnen ≤ 330 px, alle drei Karten sind Links.

---

## 2. Änderung 1 — Schriftgrößen tauschen

Aktuell gemessen: Etikett „Alles aus einer Hand" ~25 px, animiertes Wort ~16 px. Damit ist die Animation kleiner als der Fließtext ringsum und liest sich als Ladeanzeige. Die beiden Rollen gehören vertauscht: **das Etikett benennt, die Kette ist die Aussage.**

```css
/* Etikett — gilt für „Alles aus einer Hand" UND „Für wen wir arbeiten" */
.<kicker-klasse> {
  font-family: 'Baloo 2', system-ui, sans-serif;
  font-weight: 700;
  font-size: 16px;
  line-height: 1.2;
  margin: 0;
}

/* Animiertes Wort und statische Kette */
.<typerbox-klasse> {
  font-family: 'Baloo 2', system-ui, sans-serif;
  font-weight: 700;
  font-size: clamp(1.375rem, 1.1899rem + 0.759vw, 1.75rem);  /* 22 → 28 px */
  line-height: 1.2;
}
```

### Herleitung der clamp()-Formel

Stützstellen 390 px und 1180 px Viewport, Ziel 22 → 28 px:

```
m = (28 − 22) / (1180 − 390) = 6 / 790 = 0,0075949 px/px = 0,7595 vw
b = 22 − 0,0075949 × 390 = 22 − 2,962 = 19,038 px = 1,1899 rem
```

Gegenprobe bei 1180 px: 19,038 + 0,0075949 × 1180 = 28,0 px ✓

**Beide Etiketten bekommen dieselbe Größe.** Aktuell stehen „Alles aus einer Hand" (~25 px) und „Für wen wir arbeiten" (~20 px) auf derselben Ebene in zwei Größen.

An der Kette selbst (14,5 px, grüne Pfeile) ändert sich nichts.

---

## 3. Änderung 2 — Die Volltextliste ersatzlos entfernen

Zu entfernen: der Absatz „Unsere Tätigkeitsschwerpunkte liegen in:" und die gesamte Liste darunter.

### Warum das geht

Liste und Karten sind zwei Schnitte durch dieselbe Menge. Jeder Listenpunkt hat eine Entsprechung in den Karten:

| Listenpunkt | Entsprechung |
|---|---|
| der Planung, dem Bau und der Pflege anspruchsvoller Privatgärten | Karte „Private Gärten" |
| der Planung, dem Bau und der Pflege von Teichen und Zäunen | Karte „Private Gärten" (Teich, Zäune) |
| dem Landschaftsbau und dem Bau gewerblicher Außenanlagen | Karte „Gewerbe und Hausverwaltungen" |
| der dauerhaften Pflege von privaten und gewerblichen Außenanlagen | beide Karten |
| der Baumpflege | Karte „Private Gärten" (Baumpflege), Karte „Gewerbe" (Baumkontrollen, Gutachten) |

Die Verben „Planung, Bau, Pflege" stehen bereits in der Kette darüber — einmal, gültig für alles. Die Karten nennen die Gegenstände und sind nach Kunde sortiert, was der Besucher von sich selbst weiß. Der Leistungsbegriff „Landschaftsbau" ist dagegen eine Kategorie, in die sich niemand selbst einsortiert.

**„Zäune" und „Baumpflege" wandern dafür in die erste Karte** — das ist alles, was sonst verloren ginge. Siehe Abschnitt 4.

Prüfen, ob die CSS-Regeln der Liste danach noch von anderer Stelle genutzt werden. Nur entfernen, wenn sie exklusiv hierfür existieren.

---

## 4. Änderung 3 — Karten

### Was sich ändert

- **Fläche:** heute gemessen `rgb(33, 36, 30)` gegen Seitenhintergrund `rgb(28, 30, 25)` — fünf Stufen Unterschied, die Fläche trägt nichts. Neu: `var(--bg-elev)`, dasselbe Material wie die Absprachen-Kachel. Ein Flächentyp weniger im System.
- **Verlinkt:** das gesamte Kartenrechteck ist der Link, nicht nur die Überschrift. Größere Trefferfläche auf dem Handy.
- **Kurztexte** statt voller Sätze.
- **Kartentitel** in Baloo 2, 17 px, `var(--rd-marke)`.

### Markup

```html
<h3 class="intro-kicker">Für wen wir arbeiten</h3>

<ul class="whofor">
  <li>
    <a class="whofor-card" href="[OFFEN: privatkunden/]">
      <span class="whofor-go" aria-hidden="true"></span>
      <h4>Private Gärten</h4>
      <p>Gestaltung, Vorgarten, Terrasse, Teich, Zäune, Baumpflege und die Pflege danach.</p>
    </a>
  </li>
  <li>
    <a class="whofor-card" href="[OFFEN: gewerbekunden/]">
      <span class="whofor-go" aria-hidden="true"></span>
      <h4>Gewerbe und Hausverwaltungen</h4>
      <p>Pflege, Umgestaltung, Baumkontrollen, Gutachten.</p>
    </a>
  </li>
  <li>
    <a class="whofor-card" href="[OFFEN: Zielseite Kommunen]">
      <span class="whofor-go" aria-hidden="true"></span>
      <h4>Kommunen und öffentliche Auftraggeber</h4>
      <p>[OFFEN: eine Zeile von Maik — Grünpflege, Verkehrsgrün, Spielplätze, Baumkataster?]</p>
    </a>
  </li>
</ul>
```

Die Überschriftenebene (`h3`/`h4`) an die Seite anpassen, keine Ebene überspringen.

### Zur dritten Karte

Der heutige Text „Unser Team arbeitet auch mit Kommunen und öffentlichen Auftraggebern." ist die Überschrift als Satz wiederholt und nennt nichts. Er wird durch den `[OFFEN]`-Platzhalter ersetzt und **nicht** mit einer plausibel klingenden Leistung gefüllt.

Liegt bis zur Umsetzung nichts von Maik vor: **zwei Karten ausliefern und darunter eine schlichte Zeile** „Wir arbeiten auch für Kommunen und öffentliche Auftraggeber." Eine leere Karte neben zwei gefüllten sieht nach Lücke aus, eine Zeile nach Absicht. Diese Entscheidung vor der Umsetzung einholen, nicht selbst treffen.

### CSS

```css
.whofor {
  display: grid;
  gap: 12px;
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
}

.whofor-card {
  position: relative;
  display: block;
  padding: 14px 16px 13px;
  border-radius: 14px;
  background: var(--bg-elev);
  border: 1px solid rgba(250, 248, 241, 0.13);
  text-decoration: none;
  color: inherit;
  transition: border-color 0.16s ease;
}
.whofor-card:hover { border-color: var(--rd-marke); }
.whofor-card:focus-visible { outline: 2px solid var(--rd-marke); outline-offset: 3px; }

.whofor-card h4 {
  font-family: 'Baloo 2', system-ui, sans-serif;
  font-weight: 700;
  font-size: 17px;
  line-height: 1.2;
  margin: 0;
  padding-right: 26px;          /* Platz für den Pfeil */
  color: var(--rd-marke);
}
.whofor-card p {
  margin: 8px 0 0;
  font-size: 14.5px;
  line-height: 1.5;
  color: var(--muted, #A2A8B1);
}

.whofor-go {
  position: absolute;
  right: 16px;
  top: 17px;
  width: 14px;
  height: 10px;
  background: var(--rd-marke);
  clip-path: polygon(0 38%, 62% 38%, 62% 0, 100% 50%, 62% 100%, 62% 62%, 0 62%);
  opacity: 0.75;
}

@media (min-width: 900px) {
  .whofor { grid-template-columns: repeat(3, 1fr); gap: 16px; }
}

@media (prefers-reduced-motion: reduce) {
  .whofor-card { transition: none; }
}
```

Der Pfeil ist `clip-path` auf einem leeren Span, dieselbe Geometrie wie die Kettenpfeile — kein zweites Pfeilmotiv im System. `aria-hidden`, weil er nichts sagt, was der Link nicht schon sagt.

### Kontrast

`--rd-marke: #8CC63F` auf `--bg-elev: #23262D` ergibt **7,7 : 1**, gemessen. Kartentext `#A2A8B1` auf derselben Fläche prüfen und berichten; unter 4,5 : 1 aufhellen, nicht abdunkeln.

---

## 5. Cache-Busting

Versionsstring `?v=YYYYMMDD[Buchstabe]` an der geänderten CSS-Datei anheben. `index.html` ist die Quelle der Wahrheit, das Build-Skript verteilt auf die generierten Seiten; die Handseiten von Hand nachziehen. Danach Build laufen lassen und stichprobenartig prüfen. JS wird hier nicht geändert — falls doch, dessen Versionsstring mit anheben.

---

## 6. Stop-Regeln

- **Der Seitenkopf bleibt unangetastet.**
- **Die Schreibmaschinen-Logik aus AP-446 wird nicht angefasst.** Dieses AP ändert an ihr ausschließlich Schriftgrößen. Kein Umbau von Timing, Modus oder Struktur.
- **Nur dieser Block.** Nichts darüber, nichts darunter, keine andere Seite.
- **Kein Text erfinden.** Jedes `[OFFEN: …]` bleibt stehen und wird im Bericht gelistet — besonders die dritte Karte und die drei Link-Ziele.
- **Die Liste wird nicht versteckt, sondern entfernt.** Kein `display: none`.
- **Kein neues Farbtoken.** `--bg-elev` und `--rd-marke` sind vorhanden.
- **Kein `overflow: hidden`** auf `.whofor` oder `.whofor-card` — der Fokusring braucht 3 px nach außen.
- Kein Perl. Mehrdateiige Ersetzungen mit Python, `encoding="utf-8"`, vor jedem Schreiben `assert s.count(old) == 1`.

---

## 7. QA

Playwright/Chromium, `deviceScaleFactor: 1`.

**Mobil, 390 × 844:**
- [ ] Block von „Alles aus einer Hand" bis Kartenunterkante **≤ 720 px** (Ausgangswert notieren, Differenz berichten)
- [ ] Karten beginnen **≤ 330 px** nach Blockbeginn
- [ ] Etikett 16 px, animiertes Wort 22 px, Kartentitel 17 px
- [ ] „Alles aus einer Hand" und „Für wen wir arbeiten" haben **denselben** Schriftgrad

**Desktop, 1280 × 800:**
- [ ] Animiertes Wort 28 px
- [ ] Karten dreispaltig, gleiche Höhe oder sauber oben ausgerichtet

**Schreibmaschine (Nicht-Regression):**
- [ ] Läuft weiterhin genau einmal durch und endet mit der vollständigen Kette
- [ ] Die Zeile springt während des Tippens nicht — Breite vor und nach dem Tippen messen, Differenz muss 0 sein
- [ ] Bei `prefers-reduced-motion: reduce` keine Animation, Kette von Anfang an sichtbar
- [ ] Ohne JavaScript ist die Kette vollständig sichtbar

**Karten:**
- [ ] Alle drei sind vollflächig anklickbar, nicht nur die Überschrift
- [ ] Trefferfläche mindestens 44 px hoch
- [ ] Fokusring sichtbar und nirgends abgeschnitten
- [ ] Kontrast Kartentitel und Kartentext auf `--bg-elev` gemessen, jeweils **≥ 4,5 : 1**

**Inhalt:**
- [ ] „Unsere Tätigkeitsschwerpunkte liegen in:" und die Liste sind aus dem HTML verschwunden — `curl` plus `grep`
- [ ] „Zäune" und „Baumpflege" stehen in der ersten Karte
- [ ] Keine Konsolenfehler

---

## 8. Offene Entscheidungen

1. **Inhalt der dritten Karte** — von Maik. Bis dahin: zwei Karten plus Zeile, siehe Abschnitt 4.
2. **Zielseiten der drei Karten.** Aus dem Befund belegen, nicht raten.
3. **Die Kurztexte kosten Konkretheit.** „Pflege, Umgestaltung, Baumkontrollen, Gutachten." ist knapper als der heutige volle Satz. Das Argument, mit dem die Liste entfallen kann, ist gerade, dass die Karten konkret sind — ich habe deshalb „Vorgarten" und „Baumpflege" wieder in Karte 1 aufgenommen. Falls sich beim Bauen zeigt, dass die Kurzform zu dünn wirkt: die Langfassung steht im Mockup unter „Karten gestapelt" bereit, das sind 108 px mehr Höhe.
4. **Verhältnis zur Kundenweiche.** Falls es an anderer Stelle der Website bereits einen Einstieg nach Privat / Gewerbe / Kommunen gibt, ist das hier ein zweiter. Fundstellen berichten, nichts ändern.
