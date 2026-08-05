<?php
declare(strict_types=1);

header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

function redirect_with_status(string $status): void
{
    $allowed = array('success', 'validation', 'files', 'send', 'spam');
    if (!in_array($status, $allowed, true)) {
        $status = 'send';
    }
    header('Location: ./?status=' . rawurlencode($status) . '#anfrage', true, 303);
    exit;
}

function post_value(string $key): string
{
    if (!isset($_POST[$key]) || is_array($_POST[$key])) {
        return '';
    }
    return trim((string) $_POST[$key]);
}

function clean_header_value(string $value): string
{
    return trim(str_replace(array("\r", "\n"), '', $value));
}

function safe_filename(string $name): string
{
    $name = basename($name);
    $name = preg_replace('/[^A-Za-z0-9._-]/u', '_', $name);
    return $name !== '' ? $name : 'anlage';
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    http_response_code(405);
    echo 'Method Not Allowed';
    exit;
}

// Honeypot: automatisierte Einträge werden nach außen wie erfolgreiche Anfragen behandelt.
if (post_value('website') !== '') {
    redirect_with_status('success');
}

$concerns = array(
    'objektpflege' => 'Laufende Objektpflege',
    'umbau' => 'Bepflanzung / Umgestaltung',
    'erdarbeiten' => 'Erd- / Baggerarbeiten',
    'baumkontrolle' => 'Baumkontrolle',
    'baumarbeiten' => 'Baumarbeiten / Fällung',
    'begutachtung' => 'Fachliche Begutachtung',
    'grenzbaum' => 'Baum oder Gehölz an Grundstücksgrenze',
    'begruenung' => 'Dach-, Fassaden- oder Stellplatzbegrünung',
    'sturmnotdienst' => 'Akuter Sturmschaden',
    'ausschreibung' => 'Ausschreibung / Leistungsverzeichnis',
);

$concern = post_value('anliegen');
$company = post_value('firma');
$contactName = post_value('ansprechpartner');
$email = clean_header_value(post_value('email'));
$phone = post_value('telefon');
$location = post_value('standort');
$description = post_value('beschreibung');
$privacy = post_value('datenschutz');

if (
    !isset($concerns[$concern]) ||
    $company === '' ||
    $contactName === '' ||
    ($email === '' && $phone === '') ||
    $location === '' ||
    $description === '' ||
    $privacy !== '1'
) {
    redirect_with_status('validation');
}

$objectTypes = array(
    'buero' => 'Büro- / Verwaltungsgebäude',
    'wohnen' => 'Wohnanlage / WEG',
    'gewerbe' => 'Gewerbe- / Industrieobjekt',
    'institution' => 'Pflege- / Bildungseinrichtung',
    'handel' => 'Einzelhandel / Kundenfläche',
    'sonstiges' => 'Sonstiges',
);
$turnuses = array(
    'woechentlich' => 'Wöchentlich',
    '14-taegig' => '14-tägig',
    'monatlich' => 'Monatlich',
    'saisonal' => 'Saisonal',
    'bedarf' => 'Einmalig / nach Bedarf',
);
$startWindows = array(
    'sofort' => 'So bald wie möglich',
    '1-3-monate' => 'In 1–3 Monaten',
    '3-6-monate' => 'In 3–6 Monaten',
    'spaeter' => 'Später / langfristige Planung',
);
$contactWays = array(
    'telefon' => 'Telefon',
    'email' => 'E-Mail',
    'whatsapp' => 'WhatsApp',
);
$callbackWindows = array(
    '08-10' => '08:00–10:00 Uhr',
    '10-12' => '10:00–12:00 Uhr',
    '12-14' => '12:00–14:00 Uhr',
    '14-16' => '14:00–16:00 Uhr',
    '16-18' => '16:00–18:00 Uhr',
);

$objectType = post_value('objektart');
$objectCount = post_value('anzahl_objekte');
$area = post_value('flaeche');
$turnus = post_value('turnus');
$startWindow = post_value('startzeitraum');
$contactWay = post_value('kontaktweg');
$callbackWindow = post_value('rueckruf');

if (
    ($objectType !== '' && !isset($objectTypes[$objectType])) ||
    ($objectCount !== '' && (!ctype_digit($objectCount) || (int) $objectCount < 1 || (int) $objectCount > 999)) ||
    strlen($area) > 100 ||
    ($turnus !== '' && !isset($turnuses[$turnus])) ||
    ($startWindow !== '' && !isset($startWindows[$startWindow])) ||
    ($contactWay !== '' && !isset($contactWays[$contactWay])) ||
    ($callbackWindow !== '' && !isset($callbackWindows[$callbackWindow]))
) {
    redirect_with_status('validation');
}

if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    redirect_with_status('validation');
}

if (
    strlen($company) > 160 ||
    strlen($contactName) > 120 ||
    strlen($email) > 190 ||
    strlen($phone) > 50 ||
    strlen($location) > 200 ||
    strlen($description) > 3000
) {
    redirect_with_status('validation');
}

$allowedFiles = array(
    'pdf' => array('application/pdf'),
    'doc' => array('application/msword', 'application/octet-stream'),
    'docx' => array('application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip', 'application/octet-stream'),
    'xls' => array('application/vnd.ms-excel', 'application/octet-stream'),
    'xlsx' => array('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip', 'application/octet-stream'),
    'jpg' => array('image/jpeg'),
    'jpeg' => array('image/jpeg'),
    'png' => array('image/png'),
    'webp' => array('image/webp'),
);

$attachments = array();
$totalBytes = 0;
$maxTotalBytes = 12 * 1024 * 1024;
$maxFiles = 5;

if (isset($_FILES['unterlagen']) && is_array($_FILES['unterlagen']['name'])) {
    $names = $_FILES['unterlagen']['name'];
    $tempNames = $_FILES['unterlagen']['tmp_name'];
    $errors = $_FILES['unterlagen']['error'];
    $sizes = $_FILES['unterlagen']['size'];
    $submittedCount = 0;

    foreach ($names as $index => $originalName) {
        $error = isset($errors[$index]) ? (int) $errors[$index] : UPLOAD_ERR_NO_FILE;
        if ($error === UPLOAD_ERR_NO_FILE) {
            continue;
        }
        $submittedCount++;
        if ($submittedCount > $maxFiles || $error !== UPLOAD_ERR_OK) {
            redirect_with_status('files');
        }

        $tempName = isset($tempNames[$index]) ? (string) $tempNames[$index] : '';
        $size = isset($sizes[$index]) ? (int) $sizes[$index] : 0;
        $totalBytes += $size;
        if ($size <= 0 || $totalBytes > $maxTotalBytes || !is_uploaded_file($tempName)) {
            redirect_with_status('files');
        }

        $filename = safe_filename((string) $originalName);
        $extension = strtolower((string) pathinfo($filename, PATHINFO_EXTENSION));
        if (!isset($allowedFiles[$extension])) {
            redirect_with_status('files');
        }

        $mime = 'application/octet-stream';
        if (function_exists('finfo_open')) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            if ($finfo !== false) {
                $detected = finfo_file($finfo, $tempName);
                finfo_close($finfo);
                if (is_string($detected) && $detected !== '') {
                    $mime = $detected;
                }
            }
        }
        if (!in_array($mime, $allowedFiles[$extension], true)) {
            redirect_with_status('files');
        }

        $content = file_get_contents($tempName);
        if ($content === false) {
            redirect_with_status('files');
        }
        $attachments[] = array('name' => $filename, 'mime' => $mime, 'content' => $content);
    }
}

$optional = array(
    'Objektart' => $objectType !== '' ? $objectTypes[$objectType] : '',
    'Anzahl Objekte' => $objectCount,
    'Ungefähre Fläche' => $area,
    'Gewünschter Turnus' => $turnus !== '' ? $turnuses[$turnus] : '',
    'Gewünschter Startzeitraum' => $startWindow !== '' ? $startWindows[$startWindow] : '',
    'Bevorzugter Kontaktweg' => $contactWay !== '' ? $contactWays[$contactWay] : '',
    'Rückrufzeitfenster' => $callbackWindow !== '' ? $callbackWindows[$callbackWindow] : '',
);

$lines = array(
    'Neue gewerbliche Anfrage über rohdich.de',
    '=========================================',
    '',
    'Anliegen: ' . $concerns[$concern],
    'Firma / Organisation: ' . $company,
    'Ansprechpartner: ' . $contactName,
    'E-Mail: ' . ($email !== '' ? $email : '–'),
    'Telefon: ' . ($phone !== '' ? $phone : '–'),
    'Standort: ' . $location,
);

foreach ($optional as $label => $value) {
    if ($value !== '') {
        $lines[] = $label . ': ' . $value;
    }
}

$lines[] = '';
$lines[] = 'Beschreibung';
$lines[] = '------------';
$lines[] = $description;
$lines[] = '';
$lines[] = 'Anhänge: ' . count($attachments);
$lines[] = 'Datenschutzhinweis bestätigt: Ja';
$messageText = implode("\r\n", $lines);

$boundary = '=_Rohdich_' . bin2hex(random_bytes(12));
$mailBody = '--' . $boundary . "\r\n";
$mailBody .= "Content-Type: text/plain; charset=UTF-8\r\n";
$mailBody .= "Content-Transfer-Encoding: base64\r\n\r\n";
$mailBody .= chunk_split(base64_encode($messageText)) . "\r\n";

foreach ($attachments as $attachment) {
    $encodedName = '=?UTF-8?B?' . base64_encode($attachment['name']) . '?=';
    $mailBody .= '--' . $boundary . "\r\n";
    $mailBody .= 'Content-Type: ' . $attachment['mime'] . '; name="' . $encodedName . '"' . "\r\n";
    $mailBody .= "Content-Transfer-Encoding: base64\r\n";
    $mailBody .= 'Content-Disposition: attachment; filename="' . $encodedName . '"' . "\r\n\r\n";
    $mailBody .= chunk_split(base64_encode($attachment['content'])) . "\r\n";
}
$mailBody .= '--' . $boundary . "--\r\n";

$recipient = 'maik@rohdich.de';
$subject = '=?UTF-8?B?' . base64_encode('Gewerbliche Anfrage: ' . $concerns[$concern] . ' – ' . $company) . '?=';
$headers = array(
    'From: Rohdich Website <website@rohdich.de>',
    'MIME-Version: 1.0',
    'Content-Type: multipart/mixed; boundary="' . $boundary . '"',
    'X-Mailer: PHP/' . phpversion(),
);
if ($email !== '') {
    $headers[] = 'Reply-To: ' . $email;
}

$sent = mail($recipient, $subject, $mailBody, implode("\r\n", $headers));
redirect_with_status($sent ? 'success' : 'send');
