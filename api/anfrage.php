<?php
// api/anfrage.php
// AP-603 - Empfaenger fuer das Anfrageformular auf dem Hetzner-Webhosting.
//
// Gleicher Vertrag wie api/anfrage.js (Vercel): dieselben Statuscodes, Codes,
// Feldtexte und Grenzen. Das Formular im Browser (assets/js/anfrage.js) und die
// Seiten mit data-endpoint="/api/anfrage" bleiben dadurch unveraendert.
//
// Nichts wird gespeichert: keine Datenbank, kein Dateispeicher, Fotos werden nur
// aus tmp_name gelesen. Im Log steht hoechstens die Fehlerart, nie ein Inhalt.
// Einzige Ausnahme ist das Rate-Limit (E1): ein gesalzener Hash der IP mit
// Zeitstempeln fuer zehn Minuten, ausserhalb der Dokumentwurzel.
//
// Kompatibel ab PHP 8.1. Erreichbar nur ueber /api/anfrage (api/.htaccess).

declare(strict_types=1);

ini_set('display_errors', '0');      // nie Fehlertexte an Besucher
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

// --- Grenzen (wie api/anfrage.js) --------------------------------------------
const MAX_DATEIEN = 6;
const MAX_JE_DATEI = 1500000;
const MAX_GESAMT = 3500000;
const MIN_VERWEILDAUER_MS = 3000;
const MAX_ALTER_MS = 24 * 60 * 60 * 1000;
const LAENGE_NAME = 120;
const LAENGE_KONTAKT = 160;
const LAENGE_NACHRICHT = 4000;

// Rate-Limit (E1): hoechstens 5 Anfragen je IP in 10 Minuten.
const LIMIT_ANZAHL = 5;
const LIMIT_FENSTER_S = 600;

// Leerraum genau wie JavaScripts \s und trim(). PCREs \s waere nur ASCII.
const LEERRAUM = '\x{0009}-\x{000D}\x{0020}\x{00A0}\x{1680}\x{2000}-\x{200A}\x{2028}\x{2029}\x{202F}\x{205F}\x{3000}\x{FEFF}';

const MELDUNG_GESAMT = 'Die Fotos sind zusammen zu groß. Bitte entfernen Sie ein Foto oder wählen Sie kleinere Dateien aus.';

// --- Antworten -----------------------------------------------------------------

function antwort(bool $ok, int $status = 200, ?string $code = null, ?array $fields = null): never
{
    $daten = ['ok' => $ok];
    if ($code !== null) $daten['code'] = $code;
    if ($fields !== null) $daten['fields'] = $fields;
    http_response_code($status);
    echo json_encode($daten, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// --- Zeichenwerkzeuge (Nachbildung der JavaScript-Semantik) ------------------

function utf8(mixed $wert): string
{
    $s = is_string($wert) ? $wert : '';
    // Ungueltige Bytefolgen ersetzen, sonst brechen die /u-Muster ab.
    return mb_check_encoding($s, 'UTF-8') ? $s : mb_convert_encoding($s, 'UTF-8', 'UTF-8');
}

// Laenge in UTF-16-Einheiten wie String.prototype.length.
function laenge(string $s): int
{
    return intdiv(strlen(mb_convert_encoding($s, 'UTF-16LE', 'UTF-8')), 2);
}

// slice(0, $max) in UTF-16-Einheiten. JavaScript schneidet dabei notfalls mitten
// durch ein Emoji und behaelt eine halbe Einheit; UTF-8 kann das nicht darstellen.
// Deshalb wird hier das angeschnittene Zeichen ganz behalten: Das Ergebnis ist dann
// eine Einheit laenger, die Pruefung "laenger als die Grenze" faellt aber genauso aus
// wie in anfrage.js (61 Emoji im Namen sind dort wie hier zu lang).
function kuerzen(string $s, int $max): string
{
    if (laenge($s) <= $max) return $s;
    $out = '';
    $einheiten = 0;
    foreach (mb_str_split($s, 1, 'UTF-8') as $zeichen) {
        if ($einheiten >= $max) break;
        $out .= $zeichen;
        $einheiten += mb_ord($zeichen, 'UTF-8') > 0xFFFF ? 2 : 1;
    }
    return $out;
}

function jsTrim(string $s): string
{
    return (string) preg_replace('/^[' . LEERRAUM . ']+|[' . LEERRAUM . ']+$/uD', '', $s);
}

// Einzeilig: alle Steuerzeichen raus, auch Zeilenumbrueche. Diese Werte landen
// in Betreff und Reply-To - ein eingeschmuggeltes \r\n darf dort nicht ankommen.
function einzeilig(mixed $wert, int $max): string
{
    $s = preg_replace('/[\x{0000}-\x{001F}\x{007F}]/u', ' ', utf8($wert));
    $s = preg_replace('/[' . LEERRAUM . ']+/u', ' ', (string) $s);
    return kuerzen(jsTrim((string) $s), $max);
}

// Mehrzeilig: Zeilenumbrueche bleiben, der Rest faellt weg.
function mehrzeilig(mixed $wert, int $max): string
{
    $s = preg_replace('/\r\n?/', "\n", utf8($wert));
    $s = preg_replace('/[\x{0000}-\x{0009}\x{000B}\x{000C}\x{000E}-\x{001F}\x{007F}]/u', '', (string) $s);
    return kuerzen(jsTrim((string) $s), $max);
}

function feld(string $name): mixed
{
    return $_POST[$name] ?? null;
}

function emailGueltig(string $wert): bool
{
    $ohne = '[^' . LEERRAUM . '@,;:<>"]';
    return preg_match('/^' . $ohne . '+@' . $ohne . '+\.[A-Za-z]{2,}$/uD', $wert) === 1;
}

function kontaktGueltig(string $wert): bool
{
    if (emailGueltig($wert)) return true;
    if (preg_match('/^\+?[0-9' . LEERRAUM . '().\/-]+$/uD', $wert) !== 1) return false;
    $ziffern = preg_match_all('/[0-9]/', $wert);
    return $ziffern >= 6 && $ziffern <= 20;
}

// Number(wert) aus JavaScript, soweit fuer einen Zeitstempel noetig.
function jsZahl(mixed $wert): float
{
    $s = jsTrim(utf8($wert));
    if ($s === '') return 0.0;
    if (preg_match('/^0[xX][0-9a-fA-F]+$/D', $s)) return (float) hexdec(substr($s, 2));
    if (preg_match('/^0[bB][01]+$/D', $s)) return (float) bindec(substr($s, 2));
    if (preg_match('/^0[oO][0-7]+$/D', $s)) return (float) octdec(substr($s, 2));
    if (preg_match('/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/D', $s)) return (float) $s;
    if (preg_match('/^[+-]?Infinity$/D', $s)) return $s[0] === '-' ? -INF : INF;
    return NAN;
}

function bytesAusIni(string $wert): int
{
    $wert = trim($wert);
    if ($wert === '' || $wert === '-1') return 0;
    $zahl = (int) $wert;
    $einheit = strtolower(substr($wert, -1));
    return match ($einheit) {
        'g' => $zahl * 1024 ** 3,
        'm' => $zahl * 1024 ** 2,
        'k' => $zahl * 1024,
        default => $zahl,
    };
}

// --- Konfiguration -------------------------------------------------------------

// Ausserhalb der Dokumentwurzel, nie im Repository (Vorlage: server/anfrage-config.example.php).
function konfiguration(): ?array
{
    $kandidaten = [];
    if (PHP_SAPI === 'cli-server' && getenv('ANFRAGE_CONFIG')) $kandidaten[] = (string) getenv('ANFRAGE_CONFIG');
    if (!empty($_SERVER['DOCUMENT_ROOT'])) $kandidaten[] = dirname((string) $_SERVER['DOCUMENT_ROOT']) . '/anfrage-config.php';
    $kandidaten[] = dirname(__DIR__, 2) . '/anfrage-config.php';
    foreach ($kandidaten as $pfad) {
        if (is_file($pfad) && is_readable($pfad)) {
            $werte = include $pfad;
            return is_array($werte) ? $werte : null;
        }
    }
    return null;
}

// --- Rate-Limit (E1) -----------------------------------------------------------

// Der Dateiname ist ein Hash aus IP und einem zufaelligen Tagessalz. Ohne das
// Salz liesse sich der Hash einer IPv4-Adresse durch Ausprobieren zurueckrechnen.
function rateLimitUeberschritten(array $konfig): bool
{
    $verzeichnis = $konfig['ratelimit_dir'] ?? null;
    if (!is_string($verzeichnis) || $verzeichnis === '' || !is_dir($verzeichnis) || !is_writable($verzeichnis)) return false;

    $jetzt = time();
    $tag = gmdate('Y-m-d', $jetzt);
    $saltDatei = $verzeichnis . '/salt-' . $tag;
    if (!is_file($saltDatei)) {
        @file_put_contents($saltDatei, bin2hex(random_bytes(32)), LOCK_EX);
        @chmod($saltDatei, 0600);
    }
    $salt = (string) @file_get_contents($saltDatei);
    if ($salt === '') return false;

    // Aufraeumen: alte Salze und Eintraege ohne Aktivitaet seit zehn Minuten.
    foreach (glob($verzeichnis . '/salt-*') ?: [] as $alt) {
        if ($alt !== $saltDatei) @unlink($alt);
    }
    foreach (glob($verzeichnis . '/ip-*') ?: [] as $eintrag) {
        if (@filemtime($eintrag) < $jetzt - LIMIT_FENSTER_S) @unlink($eintrag);
    }

    $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? '');
    $datei = $verzeichnis . '/ip-' . hash('sha256', $ip . $salt);
    $griff = @fopen($datei, 'c+');
    if ($griff === false) return false;
    try {
        flock($griff, LOCK_EX);
        $zeiten = array_filter(
            array_map('intval', explode("\n", (string) stream_get_contents($griff))),
            static fn (int $t): bool => $t > $jetzt - LIMIT_FENSTER_S
        );
        if (count($zeiten) >= LIMIT_ANZAHL) return true;
        $zeiten[] = $jetzt;
        ftruncate($griff, 0);
        rewind($griff);
        fwrite($griff, implode("\n", $zeiten));
        return false;
    } finally {
        flock($griff, LOCK_UN);
        fclose($griff);
        @chmod($datei, 0600);
    }
}

// --- Fotos ---------------------------------------------------------------------

// $_FILES['fotos'] in eine Liste bringen. Der Browser sendet seit AP-603 fotos[];
// ein einzelnes fotos ohne [] wird ebenfalls angenommen.
function fotoListe(): array
{
    $roh = $_FILES['fotos'] ?? null;
    if (!is_array($roh) || !isset($roh['name'])) return [];
    $liste = [];
    if (is_array($roh['name'])) {
        foreach (array_keys($roh['name']) as $i) {
            $liste[] = [
                'type' => $roh['type'][$i] ?? '',
                'tmp_name' => $roh['tmp_name'][$i] ?? '',
                'error' => (int) ($roh['error'][$i] ?? UPLOAD_ERR_NO_FILE),
                'size' => (int) ($roh['size'][$i] ?? 0),
            ];
        }
    } else {
        $liste[] = ['type' => $roh['type'] ?? '', 'tmp_name' => $roh['tmp_name'] ?? '', 'error' => (int) ($roh['error'] ?? UPLOAD_ERR_NO_FILE), 'size' => (int) ($roh['size'] ?? 0)];
    }
    return $liste;
}

// Die ersten Bytes, nicht die Dateiendung. Gleiche Pruefung wie MAGIE in anfrage.js.
function bildBytesPassen(string $typ, string $b): bool
{
    if (strlen($b) < 12) return false;
    return match ($typ) {
        'image/jpeg' => $b[0] === "\xFF" && $b[1] === "\xD8" && $b[2] === "\xFF",
        'image/png' => substr($b, 0, 4) === "\x89PNG",
        'image/webp' => substr($b, 0, 4) === 'RIFF' && substr($b, 8, 4) === 'WEBP',
        default => false,
    };
}

// --- Ablauf --------------------------------------------------------------------

// 1. Methode
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') antwort(false, 405, 'method');

// Die Konfiguration wird frueh gelesen, weil die erlaubten Origins darin stehen.
// Fehlt sie, entfaellt die Origin-Pruefung; die Anfrage endet dann mit 503.
$konfig = konfiguration();

// 2. Origin
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$erlaubt = $konfig['erlaubte_origins'] ?? null;
if ($origin !== '' && is_array($erlaubt) && !in_array($origin, $erlaubt, true)) antwort(false, 403, 'origin');

// 3. Format
$art = strtolower((string) ($_SERVER['CONTENT_TYPE'] ?? ''));
if (!str_starts_with($art, 'multipart/form-data')) antwort(false, 415, 'request_format');

// Rate-Limit vor jeder weiteren Arbeit; zaehlt auch Bot-Anfragen.
if ($konfig !== null && rateLimitUeberschritten($konfig)) antwort(false, 429, 'rate_limited');

// 4. Groesse: Ueber post_max_size verwirft PHP $_POST und $_FILES komplett.
$grenze = bytesAusIni((string) ini_get('post_max_size'));
if ($grenze > 0 && (int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > $grenze) antwort(false, 413, 'validation', ['fotos' => MELDUNG_GESAMT]);
$fotos = fotoListe();
foreach ($fotos as $foto) {
    if (in_array($foto['error'], [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true)) antwort(false, 413, 'validation', ['fotos' => MELDUNG_GESAMT]);
    if (!in_array($foto['error'], [UPLOAD_ERR_OK, UPLOAD_ERR_NO_FILE], true)) antwort(false, 400, 'request_format');
}

// 5. Honeypot: verraet Bots nicht, woran sie gescheitert sind.
if (einzeilig(feld('_hp_website'), 200) !== '') antwort(true);

// 6. Textfelder
$name = einzeilig(feld('name'), LAENGE_NAME + 1);
$kontakt = einzeilig(feld('kontakt'), LAENGE_KONTAKT + 1);
$nachricht = mehrzeilig(feld('nachricht'), LAENGE_NACHRICHT + 1);
$felder = [];
if ($name === '') $felder['name'] = 'Bitte geben Sie Ihren Namen ein.';
elseif (laenge($name) > LAENGE_NAME) $felder['name'] = 'Bitte kürzen Sie Ihren Namen auf höchstens 120 Zeichen.';
if ($kontakt === '') $felder['kontakt'] = 'Bitte geben Sie eine Telefonnummer oder E-Mail-Adresse an, damit wir Sie erreichen können.';
elseif (laenge($kontakt) > LAENGE_KONTAKT || !kontaktGueltig($kontakt)) $felder['kontakt'] = 'Bitte geben Sie eine gültige Telefonnummer oder E-Mail-Adresse ein.';
if ($nachricht === '') $felder['nachricht'] = 'Bitte beschreiben Sie kurz Ihr Vorhaben. Fotos ergänzen die Beschreibung.';
elseif (laenge($nachricht) > LAENGE_NACHRICHT) $felder['nachricht'] = 'Bitte kürzen Sie Ihre Beschreibung auf höchstens 4.000 Zeichen.';
if ($felder) antwort(false, 422, 'validation', $felder);

// 7. Zeitfalle
$geladen = jsZahl(feld('geladen_um'));
$verweilt = is_finite($geladen) && $geladen > 0 ? round(microtime(true) * 1000) - $geladen : null;
if ($verweilt === null || $verweilt > MAX_ALTER_MS || $verweilt < 0) antwort(false, 422, 'form_expired');
if ($verweilt < MIN_VERWEILDAUER_MS) antwort(false, 422, 'form_too_fast');

// 8. Fotos: nur lesen, nichts verschieben oder speichern.
$fotos = array_values(array_filter($fotos, static fn (array $f): bool => $f['error'] === UPLOAD_ERR_OK && $f['size'] > 0));
if (count($fotos) > MAX_DATEIEN) antwort(false, 422, 'validation', ['fotos' => 'Bitte wählen Sie höchstens sechs Fotos aus.']);

$gesamt = 0;
$anhaenge = [];
foreach ($fotos as $i => $foto) {
    $nr = $i + 1;
    if ($foto['size'] > MAX_JE_DATEI) antwort(false, 413, 'validation', ['fotos' => 'Foto ' . $nr . ' ist zu groß. Bitte wählen Sie eine kleinere Datei aus.']);
    $gesamt += $foto['size'];
    if ($gesamt > MAX_GESAMT) antwort(false, 413, 'validation', ['fotos' => MELDUNG_GESAMT]);

    $typ = strtolower((string) $foto['type']);
    if (!in_array($typ, ['image/jpeg', 'image/png', 'image/webp'], true)) {
        antwort(false, 415, 'validation', ['fotos' => 'Foto ' . $nr . ' hat kein unterstütztes Bildformat. Bitte wählen Sie JPG, PNG oder WebP.']);
    }
    $bytes = is_uploaded_file($foto['tmp_name']) ? (string) file_get_contents($foto['tmp_name']) : '';
    if (!bildBytesPassen($typ, $bytes)) {
        antwort(false, 415, 'validation', ['fotos' => 'Foto ' . $nr . ' konnte nicht gelesen werden. Bitte entfernen Sie es und wählen Sie eine andere Bilddatei aus.']);
    }
    // Der Dateiname wird hier vergeben, nicht uebernommen.
    $endung = $typ === 'image/png' ? 'png' : ($typ === 'image/webp' ? 'webp' : 'jpg');
    $anhaenge[] = ['name' => 'foto-' . $nr . '.' . $endung, 'bytes' => $bytes, 'typ' => $typ];
}

// 9. Wer Bilder schickt, bestaetigt die Rechte daran.
if ($anhaenge && feld('foto_freigabe') !== '1') {
    antwort(false, 422, 'validation', ['foto_freigabe' => 'Bitte bestätigen Sie, dass Sie die ausgewählten Fotos weitergeben dürfen.']);
}

// 10. Konfiguration
// Der Dateitransport legt die fertige Mail fuer die Vertragstests ab. Er ist nur
// unter dem eingebauten Entwicklungsserver erlaubt, auf dem Webhosting nie.
$dateiTransport = PHP_SAPI === 'cli-server' && ($konfig['transport'] ?? '') === 'datei';
$empfaenger = (string) ($konfig['empfaenger'] ?? '');
$absender = (string) ($konfig['absender'] ?? '');
$vollstaendig = $konfig !== null && emailGueltig($empfaenger) && emailGueltig($absender)
    && ($dateiTransport ? is_dir((string) ($konfig['mail_dir'] ?? '')) : (string) ($konfig['smtp_host'] ?? '') !== '');
if (!$vollstaendig) {
    error_log('anfrage: Konfiguration unvollstaendig');
    antwort(false, 503, 'mail_unconfigured');
}

// 11. Versand
require __DIR__ . '/lib/PHPMailer/src/Exception.php';
require __DIR__ . '/lib/PHPMailer/src/PHPMailer.php';
require __DIR__ . '/lib/PHPMailer/src/SMTP.php';

$leistung = einzeilig(feld('leistung'), 200);
$zeilen = [
    'Name:    ' . ($name !== '' ? $name : '(keine Angabe)'),
    'Kontakt: ' . ($kontakt !== '' ? $kontakt : '(keine Angabe)'),
    'Leistung: ' . ($leistung !== '' ? $leistung : 'Allgemeine Gartenanfrage'),
    '',
    'Anliegen:',
    $nachricht !== '' ? $nachricht : '(keine Angabe)',
    '',
    $anhaenge
        ? count($anhaenge) . ' Foto' . (count($anhaenge) > 1 ? 's' : '') . ' im Anhang. Ortsangaben wurden im Browser entfernt.'
        : 'Keine Fotos.',
    '',
    'Gesendet über das Anfrageformular auf rohdich.de.',
];

try {
    $mail = new PHPMailer\PHPMailer\PHPMailer(true);
    $mail->CharSet = PHPMailer\PHPMailer\PHPMailer::CHARSET_UTF8;
    // Absender ist immer das eigene Postfach. Stuende hier die Kundenadresse,
    // scheiterte SPF und die Anfrage landete im Spam-Ordner.
    $mail->setFrom($absender, (string) ($konfig['absender_name'] ?? ''));
    $mail->addAddress($empfaenger);
    if (emailGueltig($kontakt)) $mail->addReplyTo($kontakt);
    $mail->Subject = $name !== '' ? 'Gartenanfrage von ' . $name : 'Gartenanfrage über die Website';
    $mail->isHTML(false);
    $mail->Body = implode("\n", $zeilen);
    foreach ($anhaenge as $anhang) {
        $mail->addStringAttachment($anhang['bytes'], $anhang['name'], PHPMailer\PHPMailer\PHPMailer::ENCODING_BASE64, $anhang['typ']);
    }

    if ($dateiTransport) {
        $mail->preSend();
        $ziel = rtrim((string) $konfig['mail_dir'], '/') . '/mail-' . bin2hex(random_bytes(6)) . '.eml';
        if (file_put_contents($ziel, $mail->getSentMIMEMessage()) === false) throw new RuntimeException('Testablage');
    } else {
        $port = (int) ($konfig['smtp_port'] ?? 587);
        $mail->isSMTP();
        $mail->Host = (string) $konfig['smtp_host'];
        $mail->Port = $port;
        $mail->SMTPSecure = $port === 465 ? PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS : PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        $mail->SMTPAuth = (string) ($konfig['smtp_user'] ?? '') !== '';
        $mail->Username = (string) ($konfig['smtp_user'] ?? '');
        $mail->Password = (string) ($konfig['smtp_pass'] ?? '');
        $mail->Timeout = 10;
        $mail->send();
    }
} catch (Throwable $e) {
    // 12. Nur die Fehlerart ins Log, nie Inhalt oder Servermeldung.
    error_log('anfrage: Versand fehlgeschlagen ' . get_class($e));
    antwort(false, 502, 'mail_failed');
}

// 13. Erfolg
antwort(true);
