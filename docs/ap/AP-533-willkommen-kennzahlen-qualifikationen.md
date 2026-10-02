# AP-533 — Kennzahlen und Qualifikationen im Querformat (01.10.2026)

## Umsetzung

Auf Wunsch des Auftraggebers folgen die grünen Kennzahlen und Qualifikationen
derselben Breite und Spaltenausrichtung wie die Bild-Text-Zeile aus AP-532.
Die Anpassungen gelten ab 901 px sowie bis 900 px ausschließlich im Querformat.
Die mobile Hochkantdarstellung bleibt unverändert.

- Beide Module nutzen die volle Willkommensbreite: Desktop bis 1120 px;
  mobiles Querformat mit 32 px Seitenabstand zusätzlich zur Display-Sicherheitszone.
- Ein gemeinsamer Spaltenabstand richtet Bild, Text, Kennzahlen und das bestehende
  2×2-Raster der Qualifikationen aus. Desktop 48–160 px, mobil 24–36 px auf den
  geprüften Breiten.
- Die Anordnung aus AP-524 bleibt erhalten: 25+ und 1000+ nebeneinander,
  darunter „Ihr Fachteam“ und die Google-Bewertung. Die mittlere Bewertung bleibt
  auf 640 px begrenzt, damit ihre Zierlinien nicht überlang werden.
- Der bisherige Desktop-`zoom: 1.25` entfällt. Bildzeichen, Schrift, Blumen,
  Klickflächen und Abstände bekommen explizite fließende Größen.
- Kennzahlen-Bildhöhe: Desktop 44–56 px; Querformat 28–42 px nach realer
  Containerbreite. Die vorhandene optische Vergrößerung der 1000+-Datei bleibt.
  Begleittexte 18–20 px am Desktop und 15–18 px im mobilen Querformat.
- Qualifikationsschrift 18–23 px am Desktop; 15–19 px im Querformat, ebenfalls
  nach realer Containerbreite. Schmalere Fenster erlauben natürliche Umbrüche.
  Klickflächen sind mindestens 96 px beziehungsweise 80 px hoch.
- Geöffnete Details bleiben höchstens 760 px breit und zentriert. Textgrößen
  und Innenabstände passen zur Ansicht; das Zertifikat bleibt höchstens 352 px breit.
- Die Einblendungen, Inhalte, Werte, Bildmotive, DOM-Reihenfolge und JavaScript-
  Bedienung bleiben erhalten. Kein neues Layout-Skript und keine doppelten Inhalte.
- Gemeinsame CSS-Version `20261001h`; `mobile-social-proof.css` wird ebenfalls
  durch den vorhandenen Header-Generator versioniert. JavaScript unverändert.

## Lokale Prüfung

Die Vorschau läuft auf `codex/homepage-review` unter `http://127.0.0.1:8080/`.

| CSS-Viewport | Modulbreite | Spaltenbreiten | Seitlicher Überlauf |
|---|---:|---:|---:|
| 568 × 320 | 504 px | 240 / 240 px | 0 px |
| 667 × 375 | 603 px | 288 / 288 px | 0 px |
| 844 × 390 | 780 px | 373 / 373 px | 0 px |
| 900 × 420 | 836 px | 400 / 400 px | 0 px |
| 901 × 900 | 829 px | 390 / 390 px | 0 px |
| 1024 × 900 | 942 px | 433 / 433 px | 0 px |
| 1440 × 1000 | 1120 px | 480 / 480 px | 0 px |
| 1920 × 1080 | 1120 px | 480 / 480 px | 0 px |
| 2560 × 1440 | 1120 px | 480 / 480 px | 0 px |

- Hochkantvergleich bei 320, 390, 430, 768 und 900 px: Dokumentpositionen,
  Abmessungen, Schriftgrößen, Zeilenhöhen, Bilddarstellung und abgeschlossene
  Animationen aller elf erfassten Willkommen-Komponenten sind unverändert.
- 874 × 402 px mit simulierten zusätzlichen Sicherheitsabständen von je 59 px:
  Beide Module sind 692 px breit und folgen exakt den beiden 329-px-Spalten.
  Die Labels passen vollständig; das Zertifikat öffnet ohne seitlichen Überlauf.
- Alle vier Qualifikationen bei 568, 844, 901 und 1440 px per Tastatur geöffnet,
  gewechselt und geschlossen. Genau ein Panel sichtbar, `aria-expanded` synchron,
  Fokus sichtbar, Zertifikat geladen. Anklicken im Browser ebenfalls geprüft.
- Offenes Panel beim Wechsel 390 → 844 → 1024 → 390 px: Zustand bleibt erhalten;
  Detailbreite passt sich ohne Überlauf an. Danach normal geschlossen.
- 720 × 450 px als CSS-Reflow bei 200 % eines 1440×900-Fensters sowie das extreme
  Querformat 320 × 200 px geprüft: kein horizontaler Überlauf; Inhalte umbrechen.
  Eine echte Browser-Zoomstufe ist mit der verwendeten Browsersteuerung nicht bestätigt.
- Bestehende Regeln für reduzierte Bewegung bleiben unverändert. Eine Emulation
  der Systemeinstellung steht in der Browsersteuerung nicht zur Verfügung.
- Header-Generator zweimal: 51 aktualisierte Seiten, danach 0 Änderungen.
  HTML gegenüber dem Paket-Ausgangsstand ausschließlich mit neuen CSS-Versionen.
- Keine Konsolenfehler; `git diff --check` erfolgreich.

Messwerte, Referenzen und Screenshots liegen in `tmp/welcome-proof-20261001/`.
Kein Commit oder Push für dieses Paket ausgeführt.

## Bei der visuellen Prüfung behobener Bestandsfehler

Die statische Startseiten-Bildfolge unterhalb der Qualifikationen referenzierte
drei fehlende Bildableitungen. Ihre Originale waren vorhanden, jedoch nicht Teil
der redaktionellen Galerie-Liste. Der Galerie-Generator entfernte deshalb die
Ableitungen beim Aufräumen. Er erzeugt und behält jetzt auch diese drei vorhandenen
Startseiten-Motive separat. Bildfolge, HTML, Motive und die 94 Galerieeinträge
bleiben erhalten; das entfernte Balkonkastenfoto kehrt nicht zurück.

Der zweite Galerie-Build behält dieselben Bilddateien und denselben Dateninhalt.
AVIF/WebP werden wie bisher ohne Beschnitt innerhalb der bestehenden Größen- und
Dateibudgets erzeugt. Die Startseiten-Bildfolge lädt wieder vollständig.
