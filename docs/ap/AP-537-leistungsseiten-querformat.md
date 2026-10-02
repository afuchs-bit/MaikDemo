# AP-537 — Leistungsseiten: Querformat-Regeln von AP-536 auf alle 38 Seiten

Stand 02.10.2026 · Branch `codex/homepage-review` · alle Leistungsseiten (37 Privat, 1 Gewerbe) · nur 481–900 px.
Hochformat (≤ 480 px) und Desktop (≥ 901 px) bleiben unverändert. Das Desktop-Trichter-Layout (AP-534) gilt weiter nur für die Balkonkasten-Seite.

## Auftrag

Auf der Balkonkasten-Seite wurde das Querformat freigegeben (AP-536). Der Auftraggeber hat dann angesagt: „Das, was wir verändert haben, soll bei den anderen Leistungsseiten auch sein.“ Der Plan mit der Liste der Änderungen je Seite wurde vor dem Start freigegeben.

## Änderung je Seite (bei 874 px quer)

| | vorher | nachher |
|---|---|---|
| Erstes Foto | 504 px | 470 px |
| Knopf unter dem Foto | 504 px | 470 px, bündig mit dem Foto |
| Absätze unter der ersten Überschrift | 367 px, Flattersatz | 470 px, Blocksatz |
| Hinweistexte unter der Liste | 326 px, Flattersatz | 470 px, Blocksatz |

Blocksatz bedeutet: Silbentrennung, letzte Zeile links, Wortgruppen `.lpv2-mobile-keep` dürfen umbrechen. Die Schriftgröße bleibt bei 18 px, der Zeilenabstand bei 30,6 px.

## Umsetzung

- `assets/css/leistung-mobile.css`: Im Querformat-Block von AP-536 ist der Selektor `.lpv2-page--desktop-trichter` durch `.lpv2-page--content-feature` ersetzt. Diese Klasse tragen alle 38 Seiten. Die Regeln sind unverändert, der Kommentar ist ergänzt.
- `content/leistungen/*/*.json`: `mobileCssVersion` steht bei allen 38 auf `20261002j`. Vorher standen 36 auf `20260930d`, Sturmnotdienst auf `20260927a12` und Balkonkasten auf `20261002i`.
- `node build-leistungen.mjs`: Alle 38 Seiten sind übernommen. Im Diff jeder Seite stehen genau zwei Zeilen: `leistung-mobile.css?v=` und auf 37 Seiten `main.js?v=20260930b → 20261002a`. Das ist der in AP-534 zurückgestellte Nachzug und hat auf diese Seiten keine Wirkung.

## Prüfung

- **Alle 38 Seiten bei 874 × 402:**
  - Foto und Knopf 470 px und bündig,
  - alle Absätze 470 px, an der Fotokante, im Blocksatz, 18 px / 30,6 px (2 bis 5 Absätze je Seite),
  - jeder Knopftext einzeilig.

  Keine Abweichung.
- **Stilvergleich vorher/nachher bei 402 und 1280 px** auf Baumpflege, Sturmnotdienst, Baumkontrolle, Außenanlagenpflege und Balkonkasten: jeweils **0 Abweichungen**.

## Beobachtung für den Auftraggeber

In Chrome reißt der Blocksatz an zwei Stellen große Wortlücken. Ursache ist jeweils ein langes Wort, das nicht getrennt wird und ganz in die nächste Zeile wandert:

- Baumkontrolle, erster Absatz: „Verkehrssicherungspflicht“, zweiter Absatz: „FLL-Baumkontrollrichtlinien“.
- Vorgarten, dritter Absatz: „PKW-Stellplatz“.

Safari auf dem iPhone trennt mit dem Wörterbuch des Systems und kann deshalb anders umbrechen. Auf dem Gerät ist das noch zu prüfen. Wenn es dort genauso aussieht, sind weiche Trennstellen (`&shy;`) in den betroffenen Wörtern der Inhaltsdateien möglich. Am Text selbst ändert das nichts.
