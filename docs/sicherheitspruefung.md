# Sicherheitsprüfung vor dem Go-live (AP-600)

Stand 11.10.2026 · geprüfter Auslieferungsstand `1db06c5f` (Spitze von `claude/kind-fermat-pyzy5p`)
Auftrag: [docs/ap/AP-600-golive-sicherheitspruefung.md](ap/AP-600-golive-sicherheitspruefung.md)

Dieser Bericht ist öffentlich lesbar. Er nennt deshalb keine Schlüsselwerte, Koordinaten,
Telefonnummern oder Namen Dritter, nur Fundstellen und Bewertung.

## Ergebnis in Kürze

- **Keine Zugangsdaten und keine Schlüssel** in der Historie (853 Commits, alle Refs) oder in den
  auslieferbaren Dateien.
- **Zwei Befunde mit personenbezogenen Daten sind behoben:** GPS-Positionen in 14 Bildern (E4) und der
  ungenutzte Rezensionen-Entwurf mit Namen Dritter (E1). Beide stehen weiterhin in der öffentlichen
  Historie, siehe [Grenzen](#grenzen-der-prüfung) und E2.
- **Offen:** E2 (Repo privat), E3 (Elfsight) und die Auslieferungs-Allowlist in AP-604.

## Werkzeuge

| Werkzeug | Version | Herkunft |
|---|---|---|
| gitleaks | 8.30.1 | Release-Binary von GitHub, SHA-256 gegen `gitleaks_8.30.1_checksums.txt` geprüft |
| ExifTool | 13.59 | offizieller SourceForge-Spiegel, SHA-256 gegen exiftool.org/checksums.txt geprüft |
| git | 2.50.1 | – |
| sharp | aus `.github/scripts/node_modules` | Pixelvergleich vor und nach dem Metadaten-Eingriff |

Werkzeuge, Prüfskripte und Fundberichte lagen außerhalb des Repos und sind nicht eingecheckt.

## Umfang

**Historie.** Das Repo ist vollständig, nicht flach geklont. Zusätzlich zu den Branches wurden die
PR-Refs geholt, nichts wurde gelöscht (kein Prune).

| | Anzahl |
|---|---|
| Commits über alle Refs | 853 (davon 107 Merges) |
| davon öffentlich auf GitHub erreichbar | 837 |
| öffentliche Refs | 9 Branches, 3 Pull-Request-Refs, keine Tags |
| nur lokal (mitgeprüft, nicht öffentlich) | 16 Commits auf 23 lokalen Branches, 1 Stash, 13 Worktrees |

**Auslieferung.** Geprüft wurden alle versionierten Dateien des Stands `1db06c5f` außer `docs/`,
`.github/`, `tests/`, `scripts/`, `node_modules/` und `.claude/`: zusammen 2.112 Dateien.
Davon wurden 182 Textdateien (HTML, JSON, JS, CSS, SVG, Markdown, TXT, YML, XML, `_headers`,
`.env.example` u. a.) auf Inhalte geprüft und 1.931 Bild-, Video- und SVG-Dateien auf Metadaten.
Gegenüber dem AP ist der Umfang erweitert: Markdown im Wurzelordner, `_headers`, `vercel.json`,
`.env.example` und die Bildmetadaten liegen heute ebenfalls auf dem Server.

## Ergebnis: Schlüssel und Zugangsdaten

| Prüfung | Umfang | Ergebnis |
|---|---|---|
| gitleaks, Historie | alle Refs, 742 Commits mit Inhalt | 0 Funde |
| gitleaks, Merge-Commits (Diff zum ersten Elternteil) | 104 Merges mit Inhalt | 0 Funde |
| Projektmuster in `git log --all -p`: SMTP-Passwort, Empfänger-Zuweisung, Google-API-Schlüssel, htpasswd-Datei, PEM-Privatschlüssel | alle Refs | 2 Treffer „Empfänger-Zuweisung“ in `tests/anfrage.test.mjs` (Commit `4ecc9e27`): Testwerte mit `example.com`, **kein Fund** |
| gitleaks, Arbeitsbaum am Stand `1db06c5f` | versionierte und unversionierte Dateien | 0 Funde |
| gitleaks, lokaler Projektordner inkl. aller unversionierten Dateien | ca. 3,2 GB | 76 Treffer mit 8 verschiedenen Werten, **kein Projektgeheimnis** (siehe unten) |

Alle 76 Treffer im lokalen Ordner liegen im Chrome-Profil für Messläufe unter
`.claude/preview/chrome-profile/`. Der Ordner ist per `.gitignore` ausgeschlossen und war nie
committet. Es handelt sich um Chromes eigenen Dienstschlüssel für die Optimierungsdaten, um
öffentliche Schlüssel von Chrome-Komponenten-Erweiterungen und um browserinterne Tokens.
Keiner davon gehört zum Projekt. Der Ordner ist trotzdem relevant für den Deploy, siehe B7.

## Ergebnis: auslieferbare Dateien

| Suchmuster | Treffer | Bewertung |
|---|---|---|
| Entwicklungsadressen (`localhost`, `127.0.0.1`, `*.vercel.app`, `*.pages.dev`, `github.io`, `*.workers.dev`) | 4: `.env.example` und `README.md` (lokale Testadresse), `robots.txt` (Kommentar zur Pages-Vorschau), `admin/config.yml` (Adresse des OAuth-Workers) | kein Geheimnis. `.env.example`, `README.md` und die Demo-`robots.txt` gehören nicht auf den Server → AP-604 |
| E-Mail-Adressen außer `maik@` und `info@rohdich.de` | 2: Lizenzhinweis im GSAP-Bibliothekscode (`assets/vendor/gsap/`) | unbedenklich |
| Telefonnummern außer den beiden freigegebenen | 0 echte Nummern. Fehltreffer: Koordinaten in SVG-Pfaden, Unicode-Bereiche in Schrift-CSS, zwei Demo-Nummern in `README.md` | die freigegebenen Nummern stehen in 56 bzw. 54 Dateien. `README.md` → AP-604 |
| Personennamen außerhalb freigegebener Inhalte | Namen aus dem Rezensionen-Entwurf: 0 an anderer Stelle. „Herr Rohdich“ in 3 JS-Dateien (Inhaber). Ein Team-Kürzel in einem HTML-Kommentar (`index.html`), ein GitHub-Kontoname in `admin/config.yml` | Inhaber freigegeben. Kommentar → AP-604. Kontoname ist für das CMS nötig |
| Straßenadressen, PLZ + Ort | nur die Betriebsadresse (in einem CSS-Kommentar), dazu 2 Fehltreffer in `ASSETS.md` (Dateigrößen) | unbedenklich |
| HTML-Kommentare | 680, davon 119 mit AP-Verweis und 14 mit `OFFEN` | interne Notizen, kein Geheimnis → AP-604 |
| Fremdskript | Elfsight-Plattformskript auf der Startseite | E3 → AP-604 |

## Ergebnis: Bild- und Videometadaten

| Prüfung | vorher | nachher |
|---|---|---|
| Dateien mit GPS-Position | 14 | 0 |
| Dateien mit Kamerahersteller oder -modell (auch `HostComputer`, `LensModel`) | 14 | 0 |
| sonstige Personen- oder Ortsangaben (Urheber, Copyright, Besitzer, Seriennummer, Beschreibung) | keine. Die Bildbeschreibung der Drohnenaufnahme ist nur der Standard-Dateipfad der Kamera | – |

Betroffen waren:

- `assets/img/galerie-teaser/originale/gartenanlage-pool-drohnenaufnahme.jpeg` (Drohne)
- `assets/img/gewerbe/partner-musterflaechen-480.jpg`, `-800.jpg`
- `assets/img/gewerbe/partner-pflanzen-technik-480.jpg`, `-800.jpg`
- `assets/img/projektablauf/pflege-480|640|960.avif` und `.webp`
- `assets/img/ueber/ueber-1.jpg`, `ueber-2.jpg`, `ueber-3.jpg`

**Behebung (E4):** In diesen 14 Dateien wurden GPS-Block, MakerNotes, `Make`, `Model`, `HostComputer`,
`LensMake` und `LensModel` entfernt, ohne Neukodierung. Der Nachweis wurde per Rohpixel-Hash geführt
(dekodiert ohne Drehung): vorher und nachher gleich in 14 von 14 Dateien. Ebenfalls unverändert sind
Abmessungen, Orientation (`ueber-3.jpg` = 6) und Farbprofil. Aufnahmezeit und Belichtungsdaten sind
geblieben, sie enthalten keine Ortsangabe. Die eingebetteten Vorschaubilder der pflege-Dateien haben
keine eigenen Metadaten.

**Woher die Daten kamen:** Die Build-Skripte (`.github/scripts/build-*.mjs`) erzeugen Ableitungen mit
sharp und übernehmen keine Metadaten. Das CMS kodiert Fotos laut `admin/config.yml`
(`transformations.raster_image`) im Browser zu WebP um, dabei gehen EXIF-Daten üblicherweise
verloren. Einen Testupload dazu gab es nicht. Die Lücke sind von Hand committete Originale, etwa in
`…/originale/`-Ordnern, die ungefiltert ausgeliefert werden. So ist die Drohnenaufnahme hineingekommen.

## Befunde und Status

| Nr. | Befund | Status |
|---|---|---|
| B1 | Repo öffentlich: Code, Historie und `docs/` für jeden lesbar | offen → E2 |
| B2 | `data/kundenstimmen-entwurf.json`: Namen und Volltexte von Google-Rezensenten, von nichts geladen | **erledigt (E1)**: gelöscht. In der Historie seit Commit `a6ee45dd` weiter vorhanden |
| B3 | GPS-Positionen und Gerätedaten in 14 ausgelieferten Bildern | **erledigt (E4)**. Alte Fassungen bleiben in der Historie |
| B4 | Fremdskript Elfsight auf der Startseite | offen → E3 / AP-604 |
| B5 | Interne Notizen in 680 HTML-Kommentaren, darunter ein Team-Kürzel | offen → AP-604 |
| B6 | Dateien ohne Zweck für Besucher werden heute ausgeliefert: `CLAUDE.md`, `README.md`, `ASSETS.md`, `package.json`, `package-lock.json`, `vercel.json`, `.env.example`, Demo-`robots.txt` | offen → Allowlist in AP-604 |
| B7 | Lokaler Projektordner enthält ein Chrome-Profil (ca. 950 MB, browserinterne Tokens) und Worktrees | nicht im Repo. Der Hetzner-Deploy darf nur aus einem sauberen CI-Checkout mit Allowlist hochladen, nie aus einem lokalen Ordner → AP-604/605 |
| B8 | Keine automatische Sperre gegen neue Bilder mit GPS | Empfehlung: Prüfschritt im Build, der bei GPS-Metadaten abbricht. Workflow-Änderung durch Sascha im GitHub-Web-UI → AP-605 |

## Grenzen der Prüfung

- **Die Historie ist nicht bereinigt** (Stoppregel). Die alten Bildfassungen mit GPS und der
  Rezensionen-Entwurf sind über frühere Commits weiter öffentlich abrufbar. GitHub hält zudem
  Commits vor, die nur noch per SHA erreichbar sind, und es kann Klone, Forks und Caches geben.
  Öffentlich entfernen lässt sich das nur über E2 (Repo privat) oder `git filter-repo` mit
  Force-Push. Beides entscheidet Sascha.
- Unerreichbare Objekte auf GitHub, etwa nach früheren Force-Pushes, lassen sich nicht aufzählen
  und sind nicht geprüft.
- Personennamen wurden musterbasiert gesucht (Rezensentennamen, Anreden, Namensfelder,
  Team-Kürzel). Eine vollständige Namenserkennung ist das nicht.
- Dass das CMS beim Umkodieren die Metadaten entfernt, ist aus der Konfiguration abgeleitet und
  nicht per Testupload belegt.

## Offene Entscheidungen

- **E2 – Repo auf privat stellen?** Abwägung wie im Auftrag beschrieben (Pages-Vorschau, OAuth-Scope
  `repo` für Sveltia, Actions-Minuten, `docs/` nicht mehr öffentlich). Neu aus dieser Prüfung:
  Nur E2 nimmt B2 und B3 auch aus der öffentlichen Historie, ohne die Historie umzuschreiben.
- **E3 – Elfsight auf der Startseite:** Entscheidung in AP-604.
