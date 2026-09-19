# AP-352 — „Alle Google-Rezensionen ansehen" als Link in der Fußzeile

**Auftrag:** Die Fußzeile unter der Rezension („Google-Rezension ·
Vorgarten-Neugestaltung") soll „Alle Google-Rezensionen ansehen" heißen und zu allen
Google-Rezensionen führen. Entschieden: **alle vier** Fußzeilen, **nur am Handy**.

## Diagnose

Der Knopf „Alle Bewertungen auf Google ansehen" (`index.html`, über der Kachel) sitzt
in `.private-proof-summary`, und dieser Block steht unter 481 px auf `display: none`
(`privat-form.css:3727`). **Am Telefon führte bisher kein Weg zu den Rezensionen.**
Ab 481 px ist der Knopf sichtbar.

Damit fällt „nur am Handy" mit der Grenze des Knopfes zusammen: Der Link erscheint
genau dort, wo der Knopf fehlt — kein doppelter Weg, keine Lücke.

**Die URL wurde nicht erfunden** (Grundregel 1): `https://www.google.com/maps?cid=17269983059863253129`
stand bereits im Repo und wurde unverändert vom Knopf übernommen.

**Es geht keine Information verloren:** Der Zusatz „· Vorgarten-Neugestaltung"
wiederholt nur die Kategoriezeile oben in derselben Karte.

## Diff

**`index.html`** — vier `<figcaption>`: Der bisherige Text bleibt in einem
`<span class="private-review-quelle">`, daneben tritt

```html
<a class="private-review-alle" href="…" target="_blank" rel="noopener">Alle Google-Rezensionen ansehen</a>
```

`target`/`rel` wie beim vorhandenen Knopf. Die Wisch-Fassung entsteht aus geklonten
`<figure>`-Elementen, das Markup wandert also von allein mit (gemessen: 6 Vorkommen).

**`assets/css/privat-form.css`**

- Basis: `.private-review-alle { display: none; }` — ab 481 px ist der Link auch nicht
  im Zugänglichkeitsbaum, es entsteht dort kein zweiter, unsichtbarer Weg.
- Im `@media (max-width: 480px)`-Block: Quelle aus, Link an, in `--green-500`
  (#8CC63F), unterstrichen, 24 px Mindesthöhe, Fokusring in `--yellow`.

Die Unterstreichung ist kein Zierrat: Farbe allein darf einen Link nicht kenntlich
machen.

**Cache-Busting:** `privat-form.css` `?v=20260919b` → `?v=20260919c`.

## QA

| Prüfung | Ergebnis |
|---|---|
| 390 / 430 / 479 px | 6 Links „Alle Google-Rezensionen ansehen", Quelle `display: none` |
| `href` / `target` / `rel` | `…?cid=17269983059863253129` / `_blank` / `noopener` |
| Farbe, Unterstreichung | `rgb(140, 198, 63)` = #8CC63F, `underline`; 7,09 : 1 auf dem Kartengrund |
| Zielgröße | 24 px hoch — die Größe nach WCAG 2.5.8 |
| Fokusring (erzwungenes `:focus-visible` über CDP) | ohne Fokus `outline-style: none`, mit Fokus `3px solid rgb(242, 226, 12)`, Versatz 3 px |
| 481 px und 1280 px | Fußzeile unverändert „Google-Rezension · …", Link `display: none`, Knopf sichtbar (403 × 51 bzw. 315 × 54) |
| Kein Abschneiden, kein waagerechter Überlauf | bestätigt |
| Klammernbilanz, `index.html` 2722 Zeilen | ok |

**Die Karte ist gewachsen:** 440 → 447 px bei 390 px Breite (430 px: 459 → 464,
479 px: 481 → 484). Ursache ist die 24-px-Zielgröße des Links, die die Fußzeile von
35 auf 42 px hebt. Das war im Plan als Risiko notiert; die Messung zeigt, dass es
keines ist: Die Karte steht auf `height: auto`, nichts wird abgeschnitten, kein
Überlauf. Der Alternativweg — das Polster der Fußzeile verkleinern — hätte die
Zielgröße gekostet und bei jeder Breite einen anderen Betrag gebraucht (+7 / +5 / +3),
also drei Sonderfälle statt eines Verhaltens.

## Nicht angefasst

Der Knopf über der Kachel, die Kategoriezeilen, Fläche, Rand und Grünton aus
AP-348/349, die Wischpunkte, alles ab 481 px.
