> **Umsetzungsvermerk (24.09.2026) — umgesetzt als AP-453.**
>
> Der Befund nach §0 widerlegt die Grundannahme dieses Dokuments.
>
> | Dokument | Gemessen im Repo |
> |---|---|
> | „Dieses Muster existiert bereits auf rund 45 Leistungsseiten" | **Es existiert nicht.** Der Kopf der Leistungsseiten ist Text: Krümelpfad, Kicker, H1, Lead, Knopf. Kein Bild, keine Diagonale, keine Haarlinie, keine Blüte. Geprüft im Template auf `codex/homepage-review` **und** auf `claude/kind-fermat-pyzy5p` |
> | „rund 45 Leistungsseiten" | **24** |
> | Vorbild „Balkonkastenbepflanzung" | Seite existiert nicht |
> | 510 px Höhe, 5,7°, 43 px Abfall, 9,8 : 1 / 2,57 : 1 | Beziehen sich sämtlich auf das nicht vorhandene Muster |
> | Teamfoto als Bild | **Ausgeschlossen** — `docs/umsetzungsplan.md` A.3.3, „ausdrücklicher Wunsch des Betriebsinhabers". Vom Auftraggeber am 24.09.2026 bestätigt |
> | `ueber-team.jpg` sei das Teamfoto | Zeigt **eine Person von hinten, ohne Gesicht**, 560 × 700 px |
> | §8.5: Zitat-Platzhalter stehe live | Seit **AP-450** erledigt |
> | §2.3: H1 „Über uns" entfällt | Genau diese H1 war in **AP-452** auf Ansage des Auftraggebers gestaltet worden |
>
> **Das Muster wurde deshalb neu gebaut, nicht übernommen** — entgegen der Stop-Regel in
> §6, aber auf ausdrückliche Ansage des Auftraggebers, dem der Befund vorlag.
>
> **Entscheidungen des Auftraggebers**
>
> 1. **Bild:** das Baumarbeiten-Foto aus AP-441 statt eines Teamfotos. Es ist **gewandert**,
>    nicht kopiert — unter dem Zitat steht es nicht mehr.
> 2. **Überschrift im Bild:** „Über uns" statt „Das Team hinter dem Betrieb." Letzteres ist
>    bereits die Überschrift des Abschnitts darunter und hätte sich gedoppelt.
> 3. **Krümelpfad** bleibt über dem Bild, nicht darunter wie im Skelett in §4 — wie auf der
>    Kontakt- und der Galerieseite. Ein dritter Ort wäre ein drittes Muster.
>
> **Abweichungen im Bauteil selbst:** Der Winkel ist **7,1°** aus
> `--mobile-hero-slope-angle` (`home-dark.css:560`), nicht die 5,7° des Dokuments — das
> Projekt führt den Wert bereits. Der Schnitt ist ein Verlauf über die Eck-Diagonale, keine
> `clip-path`; damit läuft die Haarlinie zwangsläufig bis an beide Ränder.
>
> **Gemessen (390 px):** Hero **328 px** hoch (gefordert 300–340), randlos, Überschrift
> einzeilig mit **150 px** Abstand zur Schnittkante (gefordert ≥ 24), Diagonale fällt nach
> rechts mit **6,96°**, Haarlinie an beiden Rändern vorhanden, Blüte vollständig im Bild.
> **Kontrast der Überschrift gegen die hellsten 5 % des Hintergrunds: 8,92 : 1**
> (gefordert ≥ 4,5; Ausgangswert des Dokuments am fremden Vorbild war 2,57 : 1).
>
> **Keine Unterzeile.** §2.3 sieht eine vor, der Text liegt nicht vor und wurde nicht
> erfunden — Punkt in `docs/offene-punkte.md`.

---

# AP-XXX — Über uns: Startbild im Muster der Leistungsseiten

**Repo:** `afuchs-bit/MaikDemo`, Branch `claude/kind-fermat-pyzy5p`
**Seite:** Über uns (Handseite)
**Erstellt:** 24.09.2026
**Vorbild:** Hero der Leistungsseiten, z. B. „Balkonkastenbepflanzung"

> **Wichtigste Anweisung: nichts neu erfinden.** Dieses Muster existiert bereits auf rund 45 Leistungsseiten. Der Hero wird **übernommen**, nicht nachgebaut. Gleiche Klassen, gleiche CSS-Regeln, gleiche Bildpipeline. Dieses AP beschreibt nur, was sich für Über uns unterscheidet: **geringere Höhe**, anderer Inhalt, kein Zurück-Link.

> **AP-Nummer selbst ermitteln** per `grep -rn "AP-[0-9]"` über HTML, CSS, JS und MD **und** `git log --oneline | head -40`. Höchste mir bekannte Nummer: AP-448, nur ein Anhaltspunkt. Commit: `AP-XXX: Über uns mit Startbild im Leistungsseiten-Muster`.

---

## 0. Vorab: Befund erheben

1. **Wo liegt das Hero-Markup der Leistungsseiten?** Vermutlich in `lib/render.mjs` oder `build-leistungen.mjs`. Vollständiges Markup und alle Klassennamen berichten.
2. **Wo liegen die CSS-Regeln dazu?** Datei und Selektoren. Besonders: wie sind Diagonalschnitt, grüne Haarlinie und die Blüte umgesetzt — `clip-path`, SVG, Pseudoelement?
3. **Wie wird die Hero-Höhe heute gesetzt?** Fester Wert, `aspect-ratio`, `vh`, `clamp`? Der gemessene Ist-Wert liegt bei rund **510 px** auf dem Handy.
4. **Welches Skript erzeugt die Hero-Bildableitungen?** Laut Projektregeln ist `build-hero-images.mjs` das richtige, `build-images.mjs` bedient die CMS-Datenschicht und darf hier nicht verwendet werden. Bestätigen.
5. **Liegt das Teamfoto schon im Repo?** Pfad, Originalmaße, vorhandene Ableitungen. Falls nicht: `[OFFEN]` setzen und melden, kein Ersatzbild einsetzen.
6. **Wie ist der Seitenkopf über dem Hero gesetzt?** Liegt er über dem Bild oder darüber auf Schwarz? Im Vorbild sitzt er auf Schwarz, das Bild beginnt an seiner Unterkante — bestätigen.
7. **Messung vorher** bei 390 × 844, `deviceScaleFactor: 1`: Hero-Höhe einer Leistungsseite, und auf Über uns die Oberkante der Überschrift „Ehrlich beraten, sauber gebaut".

**Weicht etwas von diesem Dokument ab, gilt der Repo-Zustand. Erst melden, dann bauen.**

---

## 1. Was übernommen wird

Aus dem Leistungsseiten-Hero unverändert:

- Randloses Bild direkt unter dem Seitenkopf, keine Seitenränder, keine runden Ecken oben
- Überschrift **im Bild**, oben links, weiß, Baloo 2
- Diagonaler Abschluss unten, nach rechts fallend
- Grüne Haarlinie entlang der Schnittkante
- Blüte unten rechts, auf der Schnittkante sitzend
- Unterzeile unterhalb des Schnitts auf dunklem Grund

Gemessene Geometrie der Diagonale: Neigung **5,7°**, Abfall über die Bildbreite **rund 43 px** bei 390 px Viewport. Falls das CSS bereits einen Wert dafür führt, **dieser gilt** — nicht überschreiben.

---

## 2. Was sich für Über uns unterscheidet

### 2.1 Geringere Höhe

Ist rund 510 px, Ziel rund **330 px** auf dem Handy.

```css
.<hero-klasse>--ueberuns {
  min-height: clamp(300px, 84vw, 400px);
}
@media (min-width: 900px) {
  .<hero-klasse>--ueberuns { min-height: 380px; aspect-ratio: 21 / 9; }
}
```

84 vw bei 390 px Viewport = 328 px. Als Modifier-Klasse auf die bestehende Hero-Klasse legen, damit die Leistungsseiten unberührt bleiben.

> **Das hat eine Folge, die vor der Umsetzung entschieden werden muss.** Siehe Abschnitt 6, Punkt 1. Kurz: mit 330 px steht „Ehrlich beraten, sauber gebaut" rechnerisch bei etwa 660 px und ragt damit rund 135 px in den ersten Bildschirm. Das widerspricht einer früheren Vorgabe. **Nicht eigenmächtig auflösen.**

### 2.2 Kein Zurück-Link

„← Alle Leistungen" hat auf Über uns keine Entsprechung. Der Link entfällt. Die Brotkrume steht unterhalb des Hero, wie heute.

### 2.3 Inhalt

| Slot | Inhalt |
|---|---|
| Bild | Teamfoto, `[OFFEN: Pfad]` |
| Überschrift im Bild | **Das Team hinter dem Betrieb.** |
| Unterzeile unter dem Schnitt | `[OFFEN: eine Zeile von Maik, Pendant zu „Ein Stück Garten vor Ihrem Fenster"]` |

Die bisherige H1 „Über uns" entfällt — die Brotkrume sagt das bereits, und zwei Überschriften direkt übereinander konkurrieren. Ebenso entfällt die gelbe Kursivsetzung von „Das Team"; der Hero ist weiß auf Bild.

Liegt die Unterzeile nicht vor: Slot leer lassen und melden, **keinen Satz erfinden**.

### 2.4 Schriftgrad der Überschrift

„Das Team hinter dem Betrieb." ist länger als „Balkonkastenbepflanzung" und bricht auf dem Handy in zwei bis drei Zeilen. Bei geringerer Hero-Höhe muss der Grad mitgehen.

```
m = (56 − 34) / (1180 − 390) = 22 / 790 = 0,02785 px/px = 2,785 vw
b = 34 − 0,02785 × 390 = 34 − 10,86 = 23,14 px = 1,446 rem
```

Gegenprobe bei 1180 px: 23,14 + 32,86 = 56,0 px ✓

```css
.<hero-klasse>--ueberuns .<headline-klasse> {
  font-size: clamp(2.125rem, 1.446rem + 2.785vw, 3.5rem);
  line-height: 1.02;
}
```

**Bedingung:** Die Überschrift muss vollständig im Bild stehen und darf die Schnittkante nicht berühren. Mindestabstand zur Kante 24 px. Bricht sie bei 390 px in mehr als drei Zeilen, den Minimalwert auf 30 px senken und das melden — **nicht** die Hero-Höhe wieder erhöhen.

---

## 3. Lesbarkeit der Überschrift — verbindlich

Am Vorbild gemessen: Weiß gegen den Durchschnitt hinter der Überschrift **9,8 : 1**, gegen die hellsten 5 % desselben Bereichs — die Hauswand — nur **2,57 : 1**. Das unterschreitet auch die 3 : 1 für große Schrift. Auf dem Balkonkasten-Foto fällt es kaum auf, weil die Schrift überwiegend vor Bäumen steht. Ein Teamfoto mit Himmel im Rücken wäre streckenweise unlesbar.

Deshalb bekommt der Über-uns-Hero einen Scrim:

```css
.<hero-klasse>--ueberuns::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(23, 25, 30, 0.78) 0%,
    rgba(23, 25, 30, 0.45) 42%,
    rgba(23, 25, 30, 0) 70%
  );
}
.<hero-klasse>--ueberuns .<headline-klasse> { position: relative; z-index: 2; }
```

Der Scrim liegt nur auf dieser Seite, damit die Leistungsseiten unverändert bleiben. **Deckkraft am echten Foto nachjustieren, nicht blind übernehmen** — Abnahmekriterium ist die Messung in Abschnitt 7, nicht dieser Wert.

Falls das bestehende Hero-CSS bereits einen Scrim führt: diesen verwenden und nur die Deckkraft prüfen.

---

## 4. Markup

Struktur an das vorhandene Hero-Markup angleichen. Skelett:

```html
<section class="<hero-klasse> <hero-klasse>--ueberuns">
  <img class="<hero-img-klasse>"
       src="[OFFEN: Teamfoto aus build-hero-images.mjs]"
       srcset="[OFFEN: aus der Pipeline]"
       sizes="100vw"
       alt="[OFFEN: Alt-Text — beschreibt, wer zu sehen ist]"
       width="[OFFEN]" height="[OFFEN]"
       loading="eager" fetchpriority="high" decoding="async">

  <h1 class="<headline-klasse>">Das Team hinter dem Betrieb.</h1>

  <span class="<bluete-klasse>" aria-hidden="true"><!-- wie auf den Leistungsseiten --></span>
</section>

<p class="<unterzeile-klasse>">[OFFEN: Unterzeile]</p>

<nav class="<crumb-klasse>" aria-label="Brotkrumen">
  <a href="/">Startseite</a> <span aria-hidden="true">›</span> <b>Über uns</b>
</nav>
```

**Zum Bild:**

- Es ist das LCP-Element. **Niemals `loading="lazy"`.** `fetchpriority="high"` setzen.
- `width` und `height` sind Pflicht, sonst springt das Layout beim Laden.
- `object-fit: cover` plus `object-position` so wählen, dass die Gesichter bei 330 px Höhe nicht angeschnitten werden. Das ist der Grund, warum die Höhe sinkt und der Ausschnitt wichtiger wird — **visuell prüfen, nicht rechnen**.
- Die Blüte ist Dekoration und trägt `aria-hidden="true"`.

---

## 5. Cache-Busting

Versionsstring `?v=YYYYMMDD[Buchstabe]` an der geänderten CSS-Datei anheben. `index.html` ist die Quelle der Wahrheit, das Build-Skript verteilt auf die generierten Seiten; die Handseiten von Hand nachziehen. Danach Build laufen lassen und an einer generierten Leistungsseite stichprobenartig prüfen.

---

## 6. Stop-Regeln

- **Der Seitenkopf bleibt unangetastet.**
- **Die Leistungsseiten bleiben unverändert.** Alle Abweichungen laufen über die Modifier-Klasse `--ueberuns`. Nach der Umsetzung eine generierte Leistungsseite gegen vorher screenshotten und Gleichheit nachweisen.
- **Build-generiertes HTML nicht direkt bearbeiten.** Änderungen gehen in Template und Build-Skript.
- **`build-images.mjs` nicht für dieses Bild verwenden.** Nur `build-hero-images.mjs`.
- **Kein Text erfinden.** Unterzeile und Alt-Text bleiben `[OFFEN]`, wenn sie nicht vorliegen.
- **Kein Ersatzbild.** Fehlt das Teamfoto, wird der Hero nicht mit einem Gartenfoto ausgeliefert — dann melden und warten.
- **Die Hero-Höhe wird nicht zurück erhöht**, um das Falz-Problem aus Abschnitt 6.1 zu lösen. Das ist eine Inhaltsentscheidung, keine technische.
- Kein Perl. Mehrdateiige Ersetzungen mit Python, `encoding="utf-8"`, vor jedem Schreiben `assert s.count(old) == 1`.

---

## 7. QA

Playwright/Chromium, `deviceScaleFactor: 1`.

**Mobil, 390 × 844:**
- [ ] Hero-Höhe **300–340 px** (Ist-Wert vorher notieren, Differenz berichten)
- [ ] Überschrift vollständig im Bild, mindestens **24 px** Abstand zur Schnittkante, höchstens drei Zeilen
- [ ] Gesichter im Bildausschnitt nicht angeschnitten — **visuelle Prüfung, Screenshot beilegen**
- [ ] Diagonale fällt nach rechts, grüne Haarlinie durchgehend, keine Lücke an den Rändern
- [ ] Blüte sitzt auf der Schnittkante, wird an keinem Rand abgeschnitten
- [ ] Oberkante von „Ehrlich beraten, sauber gebaut" messen und berichten

**Kontrast — Abnahmekriterium, nicht Augenmaß:**
- [ ] Rahmen der Überschrift rendern, Pixel darunter auswerten, Kontrast gegen die **hellsten 5 %** des Hintergrunds berechnen
- [ ] Ergebnis **≥ 4,5 : 1**. Wird es nicht erreicht: Scrim-Deckkraft erhöhen und erneut messen. Ausgangswert am Vorbild war 2,57 : 1.

**Desktop, 1280 × 800:**
- [ ] Hero 21:9, mindestens 380 px hoch
- [ ] Überschrift 56 px, einzeilig oder sauber zweizeilig

**Technik und Nicht-Regression:**
- [ ] Kein Layoutsprung beim Laden — `width`/`height` gesetzt
- [ ] Bild nicht lazy, `fetchpriority="high"`
- [ ] Screenshot-Vergleich einer generierten Leistungsseite vorher/nachher: identisch bis auf den Versionsstring
- [ ] Brotkrume unterhalb des Hero, „Über uns" als eigene H1 ist verschwunden
- [ ] Keine Konsolenfehler

---

## 8. Offene Entscheidungen

1. **Höhe gegen Falz — das muss vor der Umsetzung geklärt werden.** Rechnerisch, am Repo zu verifizieren:

   | Hero-Höhe | „Ehrlich beraten" beginnt bei | ragt in den ersten Bildschirm |
   |---|---|---|
   | 330 px (dieses AP) | ~660 px | ~135 px |
   | 465 px | ~795 px | 0 |
   | 510 px (heute) | ~840 px | 0 |

   Die Vorgabe „Bild kleiner" und die frühere Vorgabe „Überschrift erst beim Scrollen sichtbar" schließen sich bei der aktuellen Textmenge aus. **Es gibt einen dritten Weg:** sobald Maiks Zitat vorliegt und der Zitatblock zwischen Einleitung und Sektion steht, kommen rund 143 px dazu — dann trägt auch die 330-px-Höhe. Bis dahin ist zu entscheiden, was Vorrang hat. Nicht selbst entscheiden.

2. **Teamfoto** mit Pfad, Ableitungen und Alt-Text.

3. **Unterzeile** unter dem Schnitt — von Maik.

4. **Die Blüte erscheint zweimal im ersten Bildschirm**, im Logo und im Hero. Auf den Leistungsseiten ist das etabliert, deshalb hier keine Abweichung. Falls es am echten Teamfoto stört, ist das ein eigenes AP. Beobachtung berichten, nichts ändern.

5. **Der Zitat-Platzhalter steht weiterhin live.** „Ein Satz von Maik – der, mit dem er abrät, statt zu verkaufen, was nicht hält." ist ein Auftrag, kein Zitat, und trägt seinen Namen darunter. Unabhängig von diesem AP: raus, bis das echte Zitat vorliegt. Fundstelle berichten.
