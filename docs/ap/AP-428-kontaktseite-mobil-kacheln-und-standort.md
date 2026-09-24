> **Umsetzungsvermerk (24.09.2026).** Dieses Dokument kam als `AP-411`. Diese Nummer ist im
> Repo seit dem 23.09.2026 die Einstiegssektion der Ueber-uns-Seite; umgesetzt wurde es
> deshalb als **AP-428**. Alle Nummernnennungen unten sind entsprechend zu lesen.
>
> Das Dokument ist gegen `ea0f33e` geschrieben, also gegen den Stand vor AP-411 bis AP-427.
> Vieles aus Abschnitt 2 und 3.2 war dadurch bereits erledigt. Drei Vorgaben wurden auf
> ausdrueckliche Entscheidung des Auftraggebers **nicht** uebernommen beziehungsweise
> abgewandelt; die Begruendungen stehen in der Commit-Nachricht zu AP-428 und in den
> Kommentaren in `assets/css/kontakt.css`:
>
> 1. Abschnitt 3.3 "Einzelkachel" wurde **nicht** uebernommen - die Kacheln behalten das
>    Aussehen aus AP-418 (Kanalkacheln der Startseite). Nur die Innenmasse der vier
>    Halbkacheln sind enger, sonst lief die Seite waagerecht ueber.
> 2. Die Mobil-Breitkachel traegt die AP-418-Masse (64px hoch, 40px Symbolspalte) statt
>    62px/36px, damit sie mit den vier Kacheln daneben fluchtet.
> 3. Die H1 bleibt bei den 31px aus AP-415 statt der 2.05rem des Dokuments - Abschnitt 3.3
>    verlangt dort selbst, eine abweichende lokale Groesse zu melden statt zu ueberschreiben.
>
> Der Eyebrow "Direkt erreichbar" wird nicht unsichtbar gesetzt, sondern ist seit AP-413 ganz
> entfernt; die Karte traegt stattdessen `aria-label`. Die Gliederung lautet daher
> h1 -> h2 "Unser Standort in Herne".

# AP-411: Kontaktseite mobil – Mobil als Breitkachel, Kachelraster, Standort entzerrt

> **AP-Nummer vorläufig.** Vor dem Commit prüfen: `git log --oneline | grep -oE "AP-[0-9]+" | sort -t- -k2 -n -u | tail -3`
> und `grep -rhoE "AP-[0-9]{3}" assets kontakt index.html docs/ap | sort -t- -k2 -n -u | tail -3`.
> Im gepushten Stand ist die höchste Nummer **AP-410**. Ist lokal schon 411 oder höher vergeben, die nächste freie nehmen und überall in diesem Dokument und in den CSS-Kommentaren ersetzen.

Visuelle Referenz: `mockup-kontakt-mobil.html`, Fassung **A2 · Lindgrün**. Die Fassungen A1, A3 und B sind verworfen.

---

## 0 · Ausgangslage – zuerst lesen

Dieses AP wurde gegen den gepushten Branch `codex/homepage-review` (Commit `ea0f33e`) und einen Screenshot des **lokalen, nicht gepushten** Stands geschrieben. Der lokale Stand ist weiter.

**Deshalb vor jeder Änderung:**

1. `kontakt/index.html` (nur `<main>`) und `assets/css/kontakt.css` lesen.
2. Mit den Selektoren und dem Markup unten abgleichen. Wo lokal etwas schon so ist wie im Ziel, nichts tun.
3. Abweichungen, die **nicht** in diesem Dokument stehen, nicht selbstständig „mitreparieren“. Im Abschlussbericht auflisten.

Laut Screenshot sind lokal bereits entfernt oder ausgeblendet: der Lead-Absatz der Standortkarte, der grüne Kartenhintergrund der Kontaktkachel-Gruppe und die Eyebrow „Direkt erreichbar“. Laut Screenshot folgt die Standortkarte direkt auf die Kacheln. Rückrufhinweis, Einsatzgebiet und Öffnungszeiten sind dort also schon nicht sichtbar – im Markup trotzdem prüfen (siehe Schritt 2).

`kontakt/index.html` ist **handgeschrieben**. `build-leistungen.mjs` schreibt dort nur zwischen den Markern `BUILD:leistungen-submenu` und `BUILD:site-footer`. Änderungen in `<main>` sind erlaubt, die Marker-Bereiche nicht anfassen.

---

## 1 · Ziel in einem Satz

Auf dem Handy (≤ 600 px) sieht die Kontaktseite aus wie die Startseite: Baloo 2 und Nunito, fünf Kontaktwege als Kacheln im Footer-Stil. Mobil ist dabei eine lindgrüne Breitkachel ohne Knopf. Der Standort folgt als zentrierter Kopf in Logo-Grün, darunter eine Karte mit Karte → Adresse → Route → Hinweis untereinander.

---

## 2 · Markup-Änderungen (`kontakt/index.html`)

Markup-Änderungen gelten für alle Breiten. Die Desktop-Folgen sind in Abschnitt 5 geregelt.

### 2.1 Kontaktwege: Reihenfolge, Klasse, Label

Zielreihenfolge in `address.contact-direct-list`:

1. Mobil – bekommt zusätzlich die Klasse `contact-direct-mobile`
2. Festnetz
3. WhatsApp
4. E-Mail
5. Formular

Im gepushten Stand steht E-Mail vor WhatsApp. Die beiden `<a>` tauschen, den Inhalt nicht ändern.

```html
<!-- vorher -->
<a href="tel:+491711738943"><span class="form-trust-card__action-icon" …

<!-- nachher -->
<a class="contact-direct-mobile" href="tel:+491711738943"><span class="form-trust-card__action-icon" …
```

Label der Formular-Kachel:

```html
<!-- vorher -->
<small>Anfrageformular</small><strong>Anfrage senden</strong>
<!-- nachher -->
<small>Formular</small><strong>Anfrage senden</strong>
```

Grund: Auf 390 px ist „ANFRAGEFORMULAR“ mit Sperrung breiter als die Textspalte der Halbkachel.

### 2.2 Erreichbarkeit komplett entfernen

Innerhalb von `aside.contact-direct-card` diese beiden Blöcke löschen, **falls lokal noch vorhanden**:

- `<div class="contact-callback-note">…</div>` („Gerade nicht erreichbar?“)
- `<div class="contact-hours">…</div>` (Öffnungszeiten und WhatsApp-Hinweis)

Die Öffnungszeiten bleiben im Footer (`.footer-hours`, build-generiert) – **den nicht anfassen**.

`section.contact-coverage` (Einsatzgebiet): **nicht anfassen.** Falls es lokal noch im Markup steht, im Abschlussbericht melden. Die Entscheidung dazu ist offen (siehe Abschnitt 8).

### 2.3 Standort: Kopf aus der Karte heraus, Karte wird eigene Fläche

Der Kopf (Label und H2) steht im Mockup **über** der Karte, nicht in ihr. Dafür bekommt der Standort einen Außen-Wrapper.

```html
<!-- vorher (gepushter Stand, gekürzt) -->
<section class="contact-location-card reveal" aria-labelledby="contact-location-title">
  <div class="contact-location-card-grid">
    <div class="contact-location-copy">
      <span class="contact-location-label">Anfahrt &amp; Besuch</span>
      <h2 class="type-subsection-title" id="contact-location-title">Unser Standort in Herne</h2>
      <p>…</p>                                   <!-- lokal schon entfernt -->
      <div class="contact-location-actions">…</div>
    </div>
    <div class="contact-map-shell" …>…</div>
  </div>
  <div class="contact-location-footer">
    <p class="contact-visit-note">…</p>
  </div>
</section>

<!-- nachher -->
<section class="contact-location reveal" aria-labelledby="contact-location-title">
  <div class="contact-location-head">
    <span class="contact-location-label">Anfahrt &amp; Besuch</span>
    <h2 class="type-subsection-title" id="contact-location-title">Unser Standort in Herne</h2>
  </div>
  <div class="contact-location-card">
    <div class="contact-location-card-grid">
      <div class="contact-location-copy">
        <div class="contact-location-actions">…unverändert…</div>
      </div>
      <div class="contact-map-shell" …>…unverändert…</div>
    </div>
    <div class="contact-location-footer">
      <p class="contact-visit-note"><strong>Besichtigungen nach Absprache</strong> – damit wir uns persönlich Zeit für Sie nehmen können.</p>
    </div>
  </div>
</section>
```

Hinweise dazu:

- `reveal` wandert vom Kartenelement auf den Wrapper, `aria-labelledby` ebenfalls.
- Der Hinweistext oben ist der Text aus dem lokalen Screenshot. Er ist identisch mit dem Satz unter „1.500 m² Mustergarten“ auf der Startseite. Ist der lokale Wortlaut schon so, nicht ändern. Steht lokal noch der alte Text mit Link „Termin anfragen“ (AP-397), durch diesen Satz ersetzen und im Bericht erwähnen.
- **Den Datenschutz-Hinweis im Karten-Platzhalter (`#contact-map-disclosure`) nicht kürzen.** Im Mockup ist er aus Platzgründen verkürzt. Der Wortlaut aus AP-394 (Empfänger, Umfang, Widerruf, Link) bleibt vollständig.

---

## 3 · CSS (`assets/css/kontakt.css`)

### 3.1 Schriften laden (oberste Ebene, Dateianfang)

`home-dark.css` wird nur auf der Startseite geladen. Die Kontaktseite braucht die Font-Faces selbst. Die Deklarationen 1:1 aus `home-dark.css:3–29` kopieren, nicht neu schreiben. Das sind **drei** Blöcke:

- Nunito normal: `nunito-latin.woff2`, Gewicht 200–1000
- Baloo 2 variabel: `baloo2-variable-latin.woff2`, Gewicht 400–600
- Baloo 2 700: `baloo2-700-latin.woff2`

Den Kursivschnitt von Nunito **nicht** übernehmen, er wird hier nicht gebraucht. Pfade relativ `../fonts/…`, wie dort.

In `kontakt/index.html` die beiden `preload`-Zeilen für `outfit-latin.woff2` und `inter-latin.woff2` **stehen lassen** – Header und Footer nutzen sie weiterhin. Keine neuen Preloads.

### 3.2 Bestehende Regeln, die kollidieren

| Stelle | Regel | Umgang |
|---|---|---|
| `@media (max-width:1050px)` | `.contact-direct-form { grid-column: 1 / -1; }` | Im neuen ≤600-Block auf `auto` zurücksetzen (siehe 3.3). Oberhalb von 600 px bleibt sie, weil dort das 2-Spalten-Raster mit 5 Einträgen gilt. |
| `@media (max-width:600px)` | `.contact-direct-list { grid-template-columns: 1fr; }` | Wird durch den neuen Block überschrieben. Die alte Zeile **löschen**, damit nicht zwei Regeln gegeneinander laufen. |
| `@media (max-width:600px)` | `.contact-direct-card { padding: 26px 22px; border-radius: … }` | Löschen – der neue Block setzt die Karte auf „keine Fläche“. |
| `@media (max-width:600px)` | `.contact-callback-note …` (2 Zeilen) | Löschen, das Element gibt es nicht mehr. |
| `@media (max-width:600px)` | `.contact-location-card { border-radius:19px }`, `{ padding: 26px 22px }`, `.contact-map-shell { height:340px; min-height:340px }` | Löschen, der neue Block regelt das. |
| Basisregeln `.contact-callback-note*`, `.contact-hours*` | ganze Blöcke | Löschen. Vorher mit `grep -rn "contact-callback-note\|contact-hours" --include=*.html --include=*.css --include=*.js .` prüfen, dass sie nirgends sonst vorkommen. Im gepushten Stand gibt es keine Fundstelle außerhalb von `kontakt.css` und `kontakt/index.html`. |
| `@media (min-width:1051px)` | `.contact-location-card { align-self: center; height: auto; }` | Selektor auf `.contact-location` ändern – das Grid-Kind der `.contact-hub` ist jetzt der Wrapper. |
| Basisregel | `.contact-location-copy h2 { margin: 10px 0 12px; … }` | Selektor auf `.contact-location-head h2` ändern – die H2 steht nicht mehr in `.contact-location-copy`. Ohne diese Änderung verliert sie auf Desktop Größe und Abstände. |

### 3.3 Neuer Block am Dateiende

Direkt **vor** dem bestehenden `@media (max-width: 480px)`-Block (Seitengrund `#1B1E19`, AP-388) einfügen. Kommentarstil wie im Rest der Datei: Deutsch, Umlaute als ae/oe/ue.

```css
/* AP-411: Kontaktseite mobil an die Startseite angeglichen.
   Referenz: mockup-kontakt-mobil.html, Fassung A2.
   - Baloo 2 fuer Ueberschriften und Nummern, Nunito fuer Text - wie home-dark.css.
   - Fuenf Kontaktwege als Kacheln wie im Footer (.footer-contact-link),
     Mobil als lindgruene Breitkachel ohne Knopf; die ganze Kachel ist der Link.
   - Standort: Kopf zentriert ueber der Karte, darin Karte, Adresse, Route,
     Hinweis untereinander. */


@media (max-width: 600px) {

  /* ---------- Kopf ---------- */
  .contact-hero { padding-top: 22px; }
  .contact-hero .breadcrumbs ol { justify-content: center; }
  .contact-hero-copy { text-align: center; }
  .contact-hero-copy h1 {
    font-family: "Baloo 2", var(--display);
    font-size: 2.05rem;
    font-weight: 700;
    line-height: 1.05;
    letter-spacing: -.01em;
  }

  /* ---------- Kachelgruppe: keine eigene Flaeche mehr ---------- */
  .contact-hub { margin-top: 26px; }
  .contact-direct-card {
    padding: 0;
    overflow: visible;
    border: 0;
    border-radius: 0;
    background: none;
    box-shadow: none;
  }

  /* Die h2 bleibt fuer die Gliederung (AP-396), ist aber nicht sichtbar. */
  .contact-direct-card > h2.form-trust-card__eyebrow {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
  }

  .contact-direct-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin: 0;
    font-family: "Nunito", var(--body);
  }
  .contact-direct-form { grid-column: auto; }

  /* ---------- Einzelkachel (Festnetz, WhatsApp, E-Mail, Formular) ---------- */
  .contact-direct-list > a {
    grid-template-columns: 36px minmax(0, 1fr);
    gap: 9px;
    min-height: 62px;
    padding: 10px 9px;
    border: 1px solid rgb(86 230 7 / .16);
    border-radius: 14px;
    background: #20241D; /* --bg-elev */
  }
  .contact-direct-list > a:hover,
  .contact-direct-list > a:active {
    border-color: rgb(86 230 7 / .45);
    background: #20241D;
  }

  .contact-direct-list .form-trust-card__action-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: #0E100D; /* --bg-dark */
    box-shadow: none;
    color: var(--mobile-logo-green);
  }
  .contact-direct-list > a:hover .form-trust-card__action-icon {
    background: #0E100D;
    transform: none;
  }
  .contact-direct-list .form-trust-card__action-icon svg { width: 18px; height: 18px; }

  /* Telefon-Glyph (AP-392): auf dem Handy immer gruen wie im Footer, nicht
     erst beim Antippen (AP-405). filter: none = PNG in #56E607. */
  .contact-direct-list a[href^="tel:"] .form-trust-card__action-icon::before {
    width: 22px;
    height: 22px;
    filter: none;
  }

  /* WhatsApp behaelt die gefuellte Markenkachel. */
  .contact-direct-list .form-trust-card__whatsapp .form-trust-card__action-icon,
  .contact-direct-list .form-trust-card__whatsapp:hover .form-trust-card__action-icon {
    background: #25D366;
    color: #fff;
  }
  .contact-direct-list .form-trust-card__whatsapp .form-trust-card__action-icon svg { width: 20px; height: 20px; }

  .contact-direct-list small {
    margin-bottom: 1px;
    color: var(--ink-mute);
    font-size: .6rem;
    font-weight: 800;
    letter-spacing: .1em;
  }
  .contact-direct-list strong {
    font-family: "Nunito", var(--body);
    font-size: .76rem;
    font-weight: 800;
    line-height: 1.25;
    letter-spacing: 0;
    overflow-wrap: normal;
  }
  /* Festnetznummer darf nicht umbrechen ("58 57 / 90" bei 390px ohne diese Zeile). */
  .contact-direct-list a[href^="tel:"] strong { white-space: nowrap; letter-spacing: -.01em; }

  /* ---------- Mobil: lindgruene Breitkachel (A2) ----------
     Flaeche, Schnitt oben rechts und versetzte Linie wie "Zum Kontaktformular"
     (cta-family.css). Der Schnitt entsteht ueber den Verlauf statt clip-path,
     damit drop-shadow der Kontur folgt: clip-path wuerde den Schatten mitschneiden.
     16px Schnitt entlang 45 Grad = 16 / Wurzel 2 = 11,3px Abstand zur Ecke. */
  .contact-direct-list > a.contact-direct-mobile {
    grid-column: 1 / -1;
    grid-template-columns: 36px minmax(0, 1fr);
    gap: 10px;
    min-height: 62px;
    height: 62px;
    padding: 0 9px;
    border: 0;
    border-radius: 14px 0 14px 14px;
    background: linear-gradient(225deg, transparent 11px, var(--home-lime) 11.8px);
    color: #171916;
    filter: drop-shadow(3px 3px 0 #1B1E19) drop-shadow(1px 1px 0 var(--home-lime));
  }
  .contact-direct-list > a.contact-direct-mobile:hover,
  .contact-direct-list > a.contact-direct-mobile:active {
    background: linear-gradient(225deg, transparent 11px, #9BD24E 11.8px);
  }
  .contact-direct-mobile .form-trust-card__action-icon,
  .contact-direct-list > a.contact-direct-mobile:hover .form-trust-card__action-icon {
    background: #171916;
  }
  .contact-direct-mobile small { color: rgb(23 25 22 / .66); }
  .contact-direct-mobile strong {
    color: #171916;
    font-family: "Baloo 2", var(--display);
    font-size: 1.22rem;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -.005em;
    white-space: nowrap;
  }

  /* ---------- Standort ---------- */
  .contact-location { margin-top: 44px; }
  .contact-location-head { margin-bottom: 18px; text-align: center; }
  .contact-location-label {
    color: var(--ink-mute);
    font-family: "Nunito", var(--body);
    font-size: .68rem;
    font-weight: 800;
    letter-spacing: .14em;
  }
  .contact-location-head h2 {
    margin: 8px 0 0;
    color: var(--mobile-logo-green);
    font-family: "Baloo 2", var(--display);
    font-size: 1.55rem;
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: -.01em;
  }

  .contact-location-card {
    padding: 10px 10px 18px;
    overflow: visible;
    border: 1px solid var(--line);
    border-radius: 20px;
    background: #20241D;
    box-shadow: var(--shadow-card);
  }
  .contact-location-card::before { content: none; } /* gruener Balken oben entfaellt */

  /* Bluete an der Kartenecke wie an den Fotos der Startseite.
     Mockup: 12px/16px ueber die Kartenecke hinaus, Karte sitzt 10px innen
     -> relativ zur Karte right:-2px, top:-6px. */
  .contact-location-card::after {
    content: "";
    position: absolute;
    top: -6px;
    right: -2px;
    z-index: 2;
    width: 54px;
    height: 54px;
    background: url("../img/icons/rohdich-blume.png") center / contain no-repeat;
    filter: drop-shadow(0 6px 8px rgba(0,0,0,.45));
    transform: rotate(-8deg);
    pointer-events: none;
  }

  .contact-location-card-grid {
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .contact-map-shell { order: -1; }

  /* Karte */
  .contact-map-shell {
    height: 260px;
    min-height: 260px;
    border: 0;
    border-radius: 14px;
    background:
      linear-gradient(36deg, transparent 47%, rgb(140 198 63 / .07) 48%, rgb(140 198 63 / .07) 51%, transparent 52%),
      radial-gradient(circle at 50% 30%, rgb(86 230 7 / .12), transparent 40%),
      #2A2F26; /* --bg-soft */
    box-shadow: none;
  }
  .contact-map-placeholder { gap: 6px; padding: 22px 18px; }
  .contact-map-pin {
    width: 48px;
    height: 48px;
    margin-bottom: 4px;
    border-radius: 14px;
    background: #0E100D;
    color: var(--mobile-logo-green);
    box-shadow: inset 0 0 0 1px rgb(86 230 7 / .3);
  }
  .contact-map-pin svg { width: 24px; height: 24px; }
  .contact-map-placeholder > div strong {
    font-family: "Baloo 2", var(--display);
    font-size: 1rem;
    font-weight: 700;
  }
  .contact-map-placeholder > div span { display: none; } /* Adresse steht direkt darunter */
  .contact-map-placeholder > p {
    max-width: 34ch;
    margin: 0 0 6px;
    color: var(--ink-mute);
    font-size: .7rem;
  }
  .contact-map-placeholder [data-map-load] {
    padding: 11px 22px;
    border: 0;
    border-radius: 99px;
    background: var(--ink);
    color: #171916;
    font-family: "Nunito", var(--body);
    font-size: .82rem;
    font-weight: 800;
    box-shadow: none;
  }

  /* Adresse: kein Kasten, kein Symbol */
  .contact-location-actions {
    display: block;
    margin: 0;
    padding: 20px 8px 0;
  }
  .contact-location-address,
  .contact-location-route {
    display: block;
    min-height: 0;
    padding: 0;
    border: 0;
    background: none;
    box-shadow: none;
  }
  .contact-location-address .contact-location-icon,
  .contact-location-route .contact-location-icon,
  .contact-location-route small { display: none; }
  .contact-location-address small {
    display: block;
    margin-bottom: 3px;
    color: var(--ink-mute);
    font-family: "Nunito", var(--body);
    font-size: .6rem;
    font-weight: 800;
    letter-spacing: .1em;
  }
  .contact-location-address strong {
    display: block;
    font-family: "Baloo 2", var(--display);
    font-size: 1.35rem;
    font-weight: 700;
    line-height: 1.1;
  }
  .contact-location-address > span:last-child > span {
    display: block;
    margin-top: 2px;
    color: var(--ink-2);
    font-family: "Nunito", var(--body);
    font-size: .9rem;
  }

  /* Route: roter Textlink wie im Footer (.footer-route) */
  .contact-location-route {
    display: inline-block;
    margin-top: 10px;
    transform: none;
  }
  .contact-location-route:hover { transform: none; box-shadow: none; }
  .contact-location-route strong {
    color: var(--coral);
    font-family: "Nunito", var(--body);
    font-size: .88rem;
    font-weight: 800;
  }
  .contact-location-route strong::after { content: " \2192"; }

  /* Hinweis */
  .contact-location-footer {
    margin: 16px 8px 0;
    padding: 0;
    border: 0;
  }
  .contact-visit-note {
    display: block;
    padding-left: 12px;
    border-left: 3px solid var(--coral);
    color: var(--ink-2);
    font-family: "Nunito", var(--body);
    font-size: .84rem;
    line-height: 1.5;
  }
  .contact-visit-note strong { font-family: inherit; color: var(--ink); }
}

/* Unter 360px reicht die Halbkachel nicht fuer "02325 / 58 57 90" in einer
   Zeile (Textspalte bei 320px: 70px). Dann eine Spalte. */
@media (max-width: 359px) {
  .contact-direct-list { grid-template-columns: 1fr; }
}
```

**Vor dem Einfügen gegen das lokale Markup prüfen:**

- Heißt das Adress-Markup lokal noch `address.contact-location-address > span.contact-location-icon + span > small + strong + span`? Wenn nicht, die Selektoren in „Adresse“ anpassen, die Werte nicht.
- Trägt die Route lokal noch `strong` + `small`? Wenn ein eigener Pfeil schon im Markup steht, `strong::after` weglassen, damit er nicht doppelt erscheint.
- Setzt ein lokales AP schon eine abweichende H1-Größe für die Kontaktseite (`--type-page-h1-size`)? Dann 2.05rem nur übernehmen, wenn der Screenshot des Ergebnisses dem Mockup entspricht, sonst melden.

---

## 4 · Cache-Busting

`?v=` von `kontakt.css` in `kontakt/index.html` auf das heutige Datum mit Buchstaben setzen, z. B. `20260924a`. Ist lokal heute schon ein Buchstabe vergeben, den nächsten nehmen. Nur `kontakt.css` ändert sich – `styles.css` und `form-trust-card.css` **nicht** hochzählen.

---

## 5 · Stopp-Regeln – was sich nicht ändern darf

- **Header:** nichts, auch nicht Abstände oder Knöpfe.
- **Footer** und alles zwischen `BUILD:`-Markern: nichts.
- **`form-trust-card.css`:** nichts. Derselbe Baustein wird im Startseiten- und im Gewerbeformular benutzt. Alle Anpassungen gehen über `.contact-direct-list` in `kontakt.css`.
- **Datenschutz-Hinweis der Karte:** Wortlaut vollständig lassen.
- **Kein neuer Text** außer „Formular“ als Label. „Jetzt anrufen“ aus einer früheren Mockup-Fassung **nicht** einbauen, auch keinen Pfeil-Knopf in der Mobil-Kachel.
- **Desktop (> 600 px):** Die Kacheln und Farben bleiben wie bisher. Durch die Markup-Änderung in 2.3 steht der Standort-Kopf auf Desktop jetzt über der Karte statt in ihrer linken Spalte. Das ist gewollt. Wenn die Karte dadurch auf ≥ 1051 px nicht mehr bündig neben der Kontaktspalte sitzt, **melden, nicht selbst umbauen**.
- Keine Perl-Ersetzungen. Für Mehrstellen-Ersetzungen Python mit `encoding="utf-8"` und `assert s.count(old) == 1`.

---

## 6 · QA-Checkliste

Playwright/Chromium, Screenshots bei **390 × 844**, **375 × 812**, **320 × 640**, **768 × 1024** und **1280 × 900**. Vor dem Screenshot `.reveal` sichtbar machen oder die Seite einmal durchscrollen.

**Mobil (390 px), gegen das Mockup A2:**

- [ ] H1 in Baloo 2, zentriert, zweizeilig „Kontakt zu / Maik Rohdich“.
- [ ] Mobil-Kachel über die volle Breite, **Höhe exakt 62 px** (`getBoundingClientRect().height`), lindgrün, Schnitt oben rechts, feine versetzte Linie rechts unten. Kein Knopf, kein Pfeil.
- [ ] Die anderen vier Kacheln: Höhe je 62 px, zwei Spalten, Reihenfolge Festnetz · WhatsApp / E-Mail · Formular.
- [ ] „02325 / 58 57 90“ einzeilig, keine Kachel läuft horizontal über (`scrollWidth <= clientWidth` für jede Kachel und für `document.documentElement`).
- [ ] Telefon-Glyphen grün ohne Antippen, WhatsApp-Kachel grün gefüllt.
- [ ] Kein Rückrufhinweis, keine Öffnungszeiten zwischen Kacheln und Standort.
- [ ] Standort-Kopf zentriert, H2 in `#56E607`, **außerhalb** der Karte.
- [ ] In der Karte von oben nach unten: Kartenplatzhalter, Adresse, „Route planen →“ in Rot, Hinweis mit roter Linie links. Kein grüner Balken oben, Blüte oben rechts über der Ecke.
- [ ] „Karte laden“ lädt weiterhin das iframe. Das iframe füllt 260 px Höhe, die Blüte liegt darüber und blockiert keine Klicks.
- [ ] Fonts laden: im Network-Tab `nunito-latin.woff2`, `baloo2-variable-latin.woff2`, `baloo2-700-latin.woff2` mit 200.

**Weitere Breiten:**

- [ ] 375 px: wie 390 px, nichts bricht um.
- [ ] 320 px: Kacheln einspaltig, Mobil-Kachel weiterhin 62 px hoch, Nummer einzeilig.
- [ ] 768 px und 1280 px: keine Regression gegenüber vorher außer dem verschobenen Standort-Kopf (Abschnitt 5). Screenshots vorher/nachher beilegen.

**Zugänglichkeit:**

- [ ] Dokumentgliederung: h1 → h2 „Direkt erreichbar“ (unsichtbar) → h2 „Unser Standort in Herne“.
- [ ] Fokusring auf allen fünf Kacheln sichtbar. Achtung: Auf der Mobil-Kachel liegt `filter` – prüfen, dass der gelbe `outline` nicht abgeschnitten oder verfärbt wird. Falls doch, `outline` durch `box-shadow: 0 0 0 3px var(--yellow)` im `:focus-visible` ersetzen und melden.
- [ ] Kontrast messen und im Bericht angeben: `#171916` auf `#8CC63F` (Nummer und Label der Mobil-Kachel) sowie `#E22219` auf `#20241D` („Route planen“).

---

## 7 · Commit

Ein Commit:

```
AP-411: Kontaktseite mobil – Mobil als Breitkachel, Kachelraster, Standort entzerrt
```

Dieses Dokument als `docs/ap/AP-411-kontaktseite-mobil-kacheln-und-standort.md` mit committen.

---

## 8 · Offene Punkte (nicht in diesem AP lösen)

1. **Einsatzgebiet** (`.contact-coverage`): bleibt es auf der Kontaktseite? Laut lokalem Screenshot ist es nicht sichtbar. Hier nicht anfassen, Befund melden.
2. **„WhatsApp jederzeit – Antwort zu den Geschäftszeiten“** fällt mit dem Erreichbarkeitsblock weg. Soll der Satz woanders hin?
3. **Kontrast „Route planen“:** Rot `#E22219` auf `#20241D` liegt voraussichtlich unter 4,5:1. Im Footer steht dieselbe Farbe schon. Bei Bedarf eigenes AP für beide Stellen.
4. **Desktop-Layout** der Kontaktseite ist nicht gestaltet worden. Die Schriftumstellung (Baloo 2 / Nunito) gilt in diesem AP nur ≤ 600 px.
