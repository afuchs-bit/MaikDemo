# AP-586 — Einheitliche Favicon-Einbindung für Safari (07.10.2026)

Homepage und Über uns verwiesen bereits korrekt auf dieselbe 64-px-PNG-Datei.
Ein falscher relativer Pfad wurde nicht gefunden. Der unterschiedliche sichtbare
Stand deutet auf einen gespeicherten Safari-Iconzustand hin; dessen Cache konnte
hier nicht direkt untersucht werden. `/favicon.ico` lieferte zuvor HTTP 404;
ein Apple-Touch-Icon fehlte ebenfalls.

## Umsetzung

- Neue Dateinamen `20261007b` für PNG 32/64, ICO 16/32/48/64 und Apple 180.
- Das vorhandene 64-px-Blütenmotiv bleibt bytegleich. Das größere Apple-Symbol
  entsteht aus der bestehenden Originalblüte mit dunklem Hintergrund und Rand.
- `favicon.ico` und `apple-touch-icon.png` als zusätzliche Root-Fallbacks.
- Identische Einbindungen in allen 45 öffentlichen Seiten mit Header und vier
  Seitenvorlagen. Gemeinsame Erzeugung/Normalisierung in `lib/favicons.mjs`;
  der Header-Generator übernimmt sie bei künftigen Läufen.
- Reproduzierbarer Bildgenerator `build-favicons.mjs`; keine neuen Abhängigkeiten.

## Prüfung

- Alle sechs ausgelieferten Icon-Pfade: HTTP 200, passende Bild-MIME-Typen.
- PNG-/Apple-Abmessungen und alle vier ICO-Einträge geprüft.
- Alle 45 Seiten und vier Vorlagen: genau vier Icon-Links, richtige relative
  Pfade, Normalisierung idempotent. Seiten vor/nachher außerhalb der Icon-Links
  bytegleich; bestehende uncommittete Arbeiten erhalten.
- Neue Links im geladenen Homepage-DOM und Blütenmotiv in der In-App-Vorschau
  geprüft. Kein direkter Safari-App-Test: Computer-Use-Zugriff nicht freigegeben.
- Syntaxprüfung der Generatoren und `git diff --check` erfolgreich.

Apple beschreibt die separate Einbindung des Touch-Icons in der
[Safari-Dokumentation](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html).

Lokal umgesetzt; kein Commit/Push. Prüfbasis: `tmp/favicon-safari-20261007/`.
