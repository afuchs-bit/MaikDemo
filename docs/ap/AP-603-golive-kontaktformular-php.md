# AP-603 — Go-live: Kontaktformular-Backend in PHP für Hetzner

Stand 09.10.2026 · Basis `1db06c5f` (`claude/kind-fermat-pyzy5p`)
Go-live-Block AP-600 bis AP-605 · Hosting **Hetzner** (Entscheidung des Auftraggebers vom 08.10.2026)

> **Vorrang:** Hosting ist ab dem 08.10.2026 Hetzner, nicht Vercel oder Cloudflare. Wo
> `docs/umsetzungsplan.md` (Teil C, AP-14) oder `docs/go-live-checkliste.md` (Abschnitt 2 und 4)
> Vercel oder Cloudflare nennen, gilt dieser AP. Die Dokumente zieht AP-604 nach.

## Auftrag

Der heutige Empfänger `api/anfrage.js` ist eine Vercel-Funktion (Node, nodemailer). Auf dem
Hetzner-Webhosting läuft PHP, kein Node. Der Empfänger wird deshalb nach PHP übertragen –
**mit genau demselben Vertrag**, damit das Formular im Browser (`assets/js/anfrage.js`) und die
39 Seiten mit `data-endpoint="/api/anfrage"` unverändert weiterarbeiten.

Versand per SMTP über ein Postfach der Domain bei Hetzner. Keine Datenbank, kein Dateispeicher,
keine Formularinhalte im Log – wie bisher.

## Befund

### Vertrag des heutigen Endpunkts (`api/anfrage.js`)

| Fall | Status | Antwort |
|---|---|---|
| nicht POST | 405 | `{ok:false, code:"method"}` |
| nicht `multipart/form-data` | 415 | `code:"request_format"` |
| Honeypot `_hp_website` gefüllt | 200 | `{ok:true}` ohne Versand |
| Pflichtfeld fehlt/ungültig | 422 | `code:"validation", fields:{name|kontakt|nachricht: "<Text>"}` |
| `geladen_um` fehlt, in der Zukunft oder > 24 h alt | 422 | `code:"form_expired"` |
| `geladen_um` < 3 s alt | 422 | `code:"form_too_fast"` |
| > 6 Fotos | 422 | `fields.fotos` |
| Foto > 1 500 000 B / zusammen > 3 500 000 B | 413 | `fields.fotos` |
| Bildbytes nicht JPEG/PNG/WebP | 415 | `fields.fotos` |
| Fotos ohne `foto_freigabe=1` | 422 | `fields.foto_freigabe` |
| Empfänger/Absender/SMTP-Host fehlt | 503 | `code:"mail_unconfigured"` |
| SMTP-Fehler | 502 | `code:"mail_failed"` |
| Erfolg | 200 | `{ok:true}` |

Alle Antworten: `Content-Type: application/json; charset=utf-8`, `Cache-Control: no-store`.
Die Feldtexte stehen wörtlich in `api/anfrage.js` Z. 115–120 und 132–157. Die PHP-Fassung übernimmt sie
**zeichengleich**.

Längen: Name 120, Kontakt 160, Nachricht 4 000. Kontakt gilt als gültig, wenn er dem E-Mail-Muster
(Z. 49) entspricht oder eine Telefonnummer mit 6–20 Ziffern ist (Z. 50–51).

`scripts/preview.mjs` prüft zusätzlich den `Origin`-Header (403 `code:"origin"`). Das übernimmt PHP.

### Der Browser schickt die Fotos unter einem Feldnamen ohne `[]`

`assets/js/anfrage.js` Z. 501–502:
```js
daten.delete('fotos');
vorbereitet.forEach((foto, index) => daten.append('fotos', foto.datei, 'foto-' + (index + 1) + '.jpg'));
```
PHP legt mehrere Dateien mit demselben Feldnamen **nur dann als Liste** in `$_FILES` ab, wenn der Name
auf `[]` endet. Sonst bleibt nur das letzte Foto übrig – stillschweigend. Der Feldname muss deshalb
auf `fotos[]` umgestellt werden (Schritt 4).

### Was erst morgen mit dem Hetzner-Zugang feststeht

PHP-Version, `upload_max_filesize`, `post_max_size`, Dokumentwurzel (für den Ort der
Konfigurationsdatei), SMTP-Server und Zugangsdaten des Postfachs. Der Code liest diese Werte aus der
Konfiguration und setzt nichts davon voraus.

## Umsetzung

### 1. Dateien

| Datei | Zweck | ausgeliefert |
|---|---|---|
| `api/anfrage.php` | Empfänger | ja |
| `api/.htaccess` | `/api/anfrage` → `anfrage.php`, alles andere unter `/api/` gesperrt | ja |
| `api/lib/PHPMailer/` | PHPMailer 6.x: `src/PHPMailer.php`, `src/SMTP.php`, `src/Exception.php`, `LICENSE` | ja |
| `api/lib/.htaccess` | `Require all denied` | ja |
| `api/lib/README.md` | Version, Quelle, SHA-256 der drei PHP-Dateien | nein (AP-604-Allowlist) |
| `server/anfrage-config.example.php` | Vorlage der Konfiguration, ohne Werte | nein |
| `tests/anfrage-php.test.mjs` | Vertragstests gegen `php -S` | nein |

PHPMailer als **neueste 6.x-Version von github.com/PHPMailer/PHPMailer/releases** (Tag), nur die drei
Dateien plus Lizenz (LGPL 2.1). Kein Composer auf dem Server nötig.

`api/.htaccess`:
```apache
# AP-603: Formularempfaenger. Nur /api/anfrage ist erreichbar.
RewriteEngine On
RewriteBase /api/
RewriteRule ^anfrage$ anfrage.php [L]
RewriteCond %{ENV:REDIRECT_STATUS} ^$
RewriteRule ^anfrage\.php$ - [R=404,L]
<FilesMatch "\.(md|json|example\.php)$">
  Require all denied
</FilesMatch>
```
Die zweite Regel sperrt den direkten Aufruf von `anfrage.php`, sodass es nur eine öffentliche Adresse gibt.

### 2. Konfiguration außerhalb der Dokumentwurzel

`server/anfrage-config.example.php`:
```php
<?php
// AP-603: Vorlage. Echte Datei liegt NUR auf dem Server, eine Ebene ueber der
// Dokumentwurzel, und ist nie im Repository.
return [
  'empfaenger'      => '',          // Postfach fuer Anfragen
  'absender'        => '',          // eigenes Postfach der Domain, z. B. website@rohdich.de
  'absender_name'   => 'Website rohdich.de',
  'smtp_host'       => '',
  'smtp_port'       => 587,         // 587 STARTTLS, 465 SMTPS
  'smtp_user'       => '',
  'smtp_pass'       => '',
  'erlaubte_origins'=> ['https://rohdich.de', 'https://www.rohdich.de'], // Testumgebung ergaenzen
  'ratelimit_dir'   => null,        // nur bei E1 = ja: Verzeichnis ausserhalb der Dokumentwurzel
];
```

Suchreihenfolge in `anfrage.php`:
1. `getenv('ANFRAGE_CONFIG')` – nur für Tests
2. `dirname($_SERVER['DOCUMENT_ROOT']) . '/anfrage-config.php'`
3. `dirname(__DIR__, 2) . '/anfrage-config.php'`

Datei fehlt oder Pflichtwert leer → 503 `mail_unconfigured`.

### 3. `api/anfrage.php` – Ablauf

```php
<?php
declare(strict_types=1);
ini_set('display_errors', '0');      // nie Fehlertexte an Besucher
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
```

In dieser Reihenfolge, jeweils mit dem Status aus der Vertragstabelle:

1. Methode `POST`, sonst 405.
2. `Origin` gesetzt und nicht in `erlaubte_origins` → 403 `origin`.
3. `CONTENT_TYPE` beginnt mit `multipart/form-data`, sonst 415.
4. **Größe:** Ist `$_SERVER['CONTENT_LENGTH']` größer als `post_max_size`, sind `$_POST` und `$_FILES`
   leer. Dann 413 mit der Gesamt-Meldung aus Z. 140. Dasselbe bei `UPLOAD_ERR_INI_SIZE`/`UPLOAD_ERR_FORM_SIZE`.
5. Honeypot → 200 `{ok:true}`.
6. Textfelder bereinigen wie `einzeilig()`/`mehrzeilig()`: Steuerzeichen raus,
   Leerraum zusammenfassen, kürzen auf Grenze + 1 (Z. 58–65). Validieren, Feldfehler sammeln → 422.
7. Zeitfalle mit `(int) round(microtime(true) * 1000)`.
8. Fotos: `$_FILES['fotos']` in eine Liste normalisieren; leere Einträge (`UPLOAD_ERR_NO_FILE`) weglassen.
   Anzahl, Einzelgröße, Gesamtgröße prüfen; Bildart **an den ersten Bytes** (gleiche Prüfungen wie
   `MAGIE`, Z. 41–47), nicht an Endung oder `type`; Dateiname neu vergeben `foto-<n>.<jpg|png|webp>`.
   Nur aus `tmp_name` lesen, **nichts verschieben oder speichern**.
9. Fotos ohne `foto_freigabe === '1'` → 422.
10. Konfiguration laden → sonst 503.
11. Mail mit PHPMailer: `isSMTP()`, `CharSet = 'UTF-8'`, `Timeout = 10`, `SMTPSecure` =
    `ENCRYPTION_SMTPS` bei Port 465, sonst `ENCRYPTION_STARTTLS`. `From` = `absender` (nie die Kundenadresse,
    sonst scheitert SPF). `addReplyTo(kontakt)` nur, wenn Kontakt eine E-Mail ist. Betreff und
    Textkörper wie Z. 168–181 (letzte Zeile: „Gesendet über das Anfrageformular auf rohdich.de.“).
    Fotos per `addStringAttachment()`.
12. Fehler beim Versand: `error_log('anfrage: Versand fehlgeschlagen ' . get_class($e))` – **kein**
    Name, keine Telefonnummer, kein Anliegen, keine Fehlermeldung des Servers im Log. → 502.
13. Erfolg → 200.

`json_encode(..., JSON_UNESCAPED_UNICODE)`. Kompatibel ab PHP 8.1. Keine weiteren Abhängigkeiten.

**Rate-Limit nur bei E1 = ja:** höchstens 5 Anfragen je IP in 10 Minuten. Gespeichert wird nur
`hash('sha256', $ip . $tagesSalz)` als Dateiname mit Zeitstempeln in `ratelimit_dir` (außerhalb der
Dokumentwurzel), Einträge älter als 10 Minuten werden beim nächsten Aufruf gelöscht. Überschreitung
→ 429 `code:"rate_limited"`. Der Browser zeigt dafür die allgemeine Fehlermeldung, das reicht.

### 4. Browser: Feldname `fotos[]`

`assets/js/anfrage.js` Z. 502:
```js
// vorher
vorbereitet.forEach((foto, index) => daten.append('fotos', foto.datei, 'foto-' + (index + 1) + '.jpg'));
// nachher (AP-603: PHP liest mehrere Dateien nur mit [])
vorbereitet.forEach((foto, index) => daten.append('fotos[]', foto.datei, 'foto-' + (index + 1) + '.jpg'));
```
Z. 501 `daten.delete('fotos')` bleibt. Den Cache-Schlüssel von `anfrage.js` (heute `?v=20261004c`) auf
allen 40 Seiten, die das Skript laden, auf `20261010a` (bzw. Tag der Umsetzung) hochzählen: in den
hand-geschriebenen Seiten direkt, für die Leistungsseiten in `render.mjs` Z. 1458 (`anfrageJsVersion`)
und danach `node .github/scripts/build-leistungen.mjs`. Generierte Seiten nicht von Hand.

`api/anfrage.js` Z. 131 so erweitern, dass die lokale Node-Vorschau weiterläuft, bis AP-604 über ihren
Verbleib entscheidet:
```js
const roh = [...daten.getAll('fotos'), ...daten.getAll('fotos[]')].filter(/* unverändert */);
```
`tests/anfrage.test.mjs` an den neuen Feldnamen anpassen, wo er geprüft wird.

### 5. Tests `tests/anfrage-php.test.mjs`

- Überspringen (`t.skip`), wenn `php` nicht installiert ist. In der Claude-Code-Umgebung `php-cli`
  installieren, falls es fehlt.
- Je Test ein temporäres Verzeichnis mit `api/` (Kopie), eigener `anfrage-config.php` und Router für
  `php -S 127.0.0.1:<freier Port>`, der `/api/anfrage` auf `api/anfrage.php` abbildet.
- Mailversand im Test: Konfigurationswert `'transport' => 'datei'` legt die fertige MIME-Nachricht
  (`preSend()` + `getSentMIMEMessage()`) in ein Testverzeichnis. **Nur zulässig, wenn
  `PHP_SAPI === 'cli-server'`** – auf dem Server ist dieser Weg damit ausgeschlossen.
- Fälle (spiegeln `tests/anfrage.test.mjs` Z. 308–366):
  sechs Fotos mit Reply-To; sieben Fotos; fehlende Fotofreigabe; falsche Bildbytes; Pflichtfelder fehlen
  bei Fotos; ungültiger Kontakt; zu lange Beschreibung; zu schnell; abgelaufen; Honeypot (Erfolg ohne
  Mail); fremder Origin (403); GET (405); fehlende Konfiguration (503); Größenüberschreitung (413).
- Je Fall Status **und** JSON-Körper gegen die Vertragstabelle prüfen. Bei Erfolg: genau eine
  MIME-Datei, Anhänge `foto-1.jpg` … `foto-6.jpg`, `From` = Absender, `Reply-To` = Kundenadresse.

### 6. Dokumentation

- `README.md`, Abschnitt Vorschau: Wie man den PHP-Empfänger lokal testet (`php -S` mit Router
  aus dem Test, Konfiguration aus der Vorlage).
- `.env.example` bleibt, bis AP-604 die Node-Vorschau entscheidet.

## Stoppregeln

- Antworttexte, Statuscodes und Grenzen exakt wie heute. Kein neues Feld, keine neue Pflichtangabe.
- `data-endpoint` auf den 39 Seiten nicht ändern.
- Keine Zugangsdaten, Adressen oder Hostnamen von Hetzner in Repo-Dateien – nur in der Vorlage als leere Werte.
- Kein Speichern von Formularinhalten oder Fotos, auch nicht kurzzeitig außerhalb von `tmp_name`.
- Kein Drittanbieter im Versandweg (kein FormSubmit, kein reCAPTCHA).
- `vercel.json`, `.vercelignore` und den Node-Endpunkt nicht löschen – das entscheidet AP-604.

## Prüfung

- [ ] `npm test` grün, inkl. `tests/anfrage-php.test.mjs` (mit installiertem PHP, nicht übersprungen)
- [ ] Sechs Fotos kommen im Test als sechs Anhänge an (Beleg für `fotos[]`)
- [ ] `php -l api/anfrage.php` ohne Fehler
- [ ] `grep -rnE "smtp_pass'\s*=>\s*'[^']" server/ api/` liefert nichts
- [ ] Direktaufruf `/api/anfrage.php` im Router-Test → 404, `/api/lib/PHPMailer/src/PHPMailer.php` → 403/404
- [ ] Nachweis im Commit-Text: Vertragstabelle unverändert

Commit: `AP-603: Kontaktformular-Empfaenger in PHP fuer Hetzner`

## Morgen mit Hetzner-Zugang (Sascha)

- [ ] Postfach für den Versand anlegen (z. B. `website@rohdich.de`), SMTP-Server und Port aus dem Konto übernehmen
- [ ] `anfrage-config.php` aus der Vorlage eine Ebene über der Dokumentwurzel anlegen, Rechte `600`
- [ ] PHP-Version ≥ 8.1 einstellen; `post_max_size` ≥ 8M und `upload_max_filesize` ≥ 4M prüfen
- [ ] SPF, DKIM und DMARC für `rohdich.de` prüfen (nur ergänzen, nichts löschen)
- [ ] Datenschutzerklärung: Hetzner als Auftragsverarbeiter des Formularversands nennen
      (`content/rechtstexte/datenschutz.body.html` Z. 24, `OFFEN`), FormSubmit ist damit raus

## Offene Entscheidungen

- **E1 – Rate-Limit:** Empfehlung ja. Ein offenes Formular unter bekannter Adresse zieht Spam an, und
  Honeypot plus Zeitfalle halten nur einfache Bots auf. Gespeichert wird nur ein Hash der IP für
  zehn Minuten. Muss dann in der Datenschutzerklärung stehen.
- **E2 – Anhänge statt Links:** Die Fotos gehen wie heute als Anhang mit (max. 3,5 MB). Der Plan von AP-14
  (Upload-Speicher mit Links) entfällt, weil Hetzner kein R2 hat und Speichern hier bewusst vermieden wird.

---

## Nachtrag (15.10.2026, umgesetzt)

**Entscheidungen:** E1 Rate-Limit **ja**. E2 Anhänge statt Links wie vorgesehen. PHPMailer **7.1.1**
statt „neueste 6.x“: 6.12.0 (10/2025) war die letzte 6.x, 7.0.0 ist laut Projekt 6.11.1 mit einer
Änderung an statischen Sprachmethoden, die hier nicht genutzt werden.

### Nachweis: Vertrag unverändert

- **Parität:** 32 identische Anfragen gingen an `api/anfrage.js` (Node) und an `api/anfrage.php`, unter
  PHP 8.1.34 und 8.4.23. Status und Antworttext stimmten in allen Fällen Zeichen für Zeichen überein.
  Abgedeckt sind alle Fehlerfälle der Vertragstabelle sowie Grenzfälle: Unicode-Leerraum, Emoji in
  Längen, Steuerzeichen, Telefon mit 5/21 Ziffern, Zeitstempel mit Leerraum oder als Text,
  PNG-Typ mit JPEG-Bytes und der alte Feldname `fotos`.
- **Vertragstests** `tests/anfrage-php.test.mjs`: 15 Tests mit allen Fällen aus Schritt 5 plus
  Rate-Limit, SMTP-Fehler ohne Inhalt im Log und Grenzwerte (4.000 Zeichen erlaubt, 61 Emoji im Namen
  zu lang). Antworten werden als Rohtext gegen `JSON.stringify` verglichen. Bei Erfolg gibt es genau
  eine MIME-Datei mit sechs Anhängen `foto-1.jpg` … `foto-6.jpg`, dekodiert byte-gleich zum Original,
  sowie `From` = Absender und `Reply-To` = Kundenadresse.
- `npm test`: 56 von 56 grün (41 bestehende und 15 neue), je einmal mit PHP 8.1 und 8.4 im `PATH`,
  nichts übersprungen.
- `php -l` ohne Fehler unter 8.1 und 8.4. Die Prüfung auf `smtp_pass` mit Wert liefert nichts.
  gitleaks über `api/`, `server/` und `tests/` findet nichts.

### Präzisierungen gegenüber dem Plan

- **Bildart:** wie in Node zuerst der gemeldete Typ (unbekannt → „kein unterstütztes Bildformat“),
  dann die ersten Bytes passend zu diesem Typ (falsch → „konnte nicht gelesen werden“). Nur so sind
  beide Meldungen zeichengleich.
- **Längen:** wie in JavaScript in UTF-16-Einheiten. Wo JavaScript mitten durch ein Emoji schneidet,
  behält PHP das Zeichen ganz. Die Prüfung „zu lang“ fällt dadurch gleich aus.
- **Origin:** Die Konfiguration wird am Anfang gelesen, weil `erlaubte_origins` darin steht. Fehlt sie,
  entfällt die Origin-Prüfung, und die Anfrage endet regulär mit 503.
- **Rate-Limit:** Der Dateiname ist `sha256(IP + Tagessalz)`. Das Salz ist zufällig, wird täglich
  erneuert und liegt ebenfalls nur in `ratelimit_dir`. So lässt sich eine IPv4-Adresse nicht durch
  Ausprobieren zurückrechnen. Einträge ohne Aktivität seit zehn Minuten werden gelöscht. Ohne
  `ratelimit_dir` ist das Limit aus.
- `api/.htaccess` sperrt zusätzlich `.js`, damit `api/anfrage.js` nie als Quelltext ausgeliefert wird.
- Die Mail endet mit „Gesendet über …“ (Umlaut, UTF-8). Node schreibt dort „ueber“.
- `.gitignore`: `anfrage-config.php`.
- **Cache-Stand `anfrage.js`:** `20261015a` in `index.html` und `render.mjs`. Nach dem Build ändert sich
  auf den 38 Leistungsseiten nur diese Zeile. Die übrigen `?v=`-Stände wurden wie in AP-602 auf HEAD
  gehalten.

### Für Sascha mit dem Hetzner-Zugang (zusätzlich zur Liste oben)

- `display_errors = Off` und `log_errors = On` (Standard bei Hetzner, bitte bestätigen). Sonst
  erscheint bei zu großen Uploads eine PHP-Warnung vor der JSON-Antwort.
- Für E1 ein Verzeichnis außerhalb der Dokumentwurzel anlegen (z. B. `anfrage-limit/`, Rechte 700) und
  in `ratelimit_dir` eintragen. Datenschutzerklärung: Rate-Limit mit gesalzenem IP-Hash, 10 Minuten.
- `mod_rewrite` und `AllowOverride` für `api/.htaccess` prüfen. Auf dem Server soll `/api/anfrage.php`
  404 liefern und `/api/lib/…` 403.
