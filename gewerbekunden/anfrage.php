<?php
declare(strict_types=1);

header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

// TODO VOR LIVEGANG: Diese Empfängeradresse ist nur vorläufig. Vor der finalen
// Veröffentlichung auf das freigegebene betriebliche Anfragepostfach umstellen.
const FORM_RECIPIENT = 'kien.david2020@gmail.com';

function redirect_with_status(string $status): void
{
    $allowed = array('success', 'validation', 'files', 'send', 'spam');
    if (!in_array($status, $allowed, true)) {
        $status = 'send';
    }

    $accept = isset($_SERVER['HTTP_ACCEPT']) ? (string) $_SERVER['HTTP_ACCEPT'] : '';
    $requestedWith = isset($_SERVER['HTTP_X_REQUESTED_WITH']) ? strtolower((string) $_SERVER['HTTP_X_REQUESTED_WITH']) : '';
    if (strpos($accept, 'application/json') !== false || $requestedWith === 'xmlhttprequest') {
        $ok = $status === 'success';
        http_response_code($ok ? 200 : ($status === 'send' ? 500 : 422));
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(array('ok' => $ok, 'state' => $status), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }

    $anchor = $status === 'success' ? '#anfrage-erfolg' : '#anfrage';
    header('Location: ./?status=' . rawurlencode($status) . $anchor, true, 303);
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
    'objektpflege' => 'Pflege und Instandhaltung',
    'umbau' => 'Umgestaltung und Außenanlagen',
    'begruenung' => 'Dach-, Fassaden- oder Stellplatzbegrünung',
    'baumkontrolle' => 'Baumkontrolle und Baumarbeiten',
    'sturmnotdienst' => 'Akuter Sturmschaden',
    'begutachtung' => 'Fachliche Begutachtung',
    'ausschreibung' => 'Ausschreibung / Leistungsverzeichnis',
    'sonstige' => 'Sonstige Objektanfrage',
);
$collaborations = array(
    'massnahme' => 'Einmalige Maßnahme',
    'projekt' => 'Einzelnes Projekt',
    'pflege' => 'Regelmäßige Pflege',
    'betreuung' => 'Wiederkehrende Betreuung',
    'pruefung' => 'Fachliche Prüfung oder Begutachtung',
    'ausschreibung' => 'Ausschreibung',
    'offen' => 'Noch offen',
);
$objectTypes = array(
    'unternehmen' => 'Unternehmensstandort',
    'wohnanlage' => 'Wohnanlage',
    'buero' => 'Büro- oder Verwaltungsgebäude',
    'gewerbe' => 'Gewerbeimmobilie',
    'institution' => 'Öffentliche oder institutionelle Fläche',
    'parkplatz' => 'Parkplatz oder Stellplatzanlage',
    'anderes' => 'Anderes Objekt',
);
$timeframes = array(
    'akut' => 'Akut',
    'vier_wochen' => 'Innerhalb von vier Wochen',
    'drei_monate' => 'Innerhalb von drei Monaten',
    'sechs_monate' => 'Innerhalb von sechs Monaten',
    'laufend' => 'Laufend oder wiederkehrend',
    'offen' => 'Noch offen',
);
$dangers = array(
    'ja' => 'Ja',
    'nein' => 'Nein',
    'unklar' => 'Unklar',
);
$contactWays = array(
    'telefon' => 'Telefonisch',
    'email' => 'Per E-Mail',
    'beides' => 'Telefonisch und per E-Mail',
);
$callbackWindows = array(
    'vormittags' => 'Vormittags',
    'nachmittags' => 'Nachmittags',
    'flexibel' => 'Flexibel',
);

$concern = post_value('anliegen');
$collaboration = post_value('zusammenarbeit');
$company = post_value('firma');
$contactName = post_value('ansprechpartner');
$email = clean_header_value(post_value('email'));
$phone = post_value('telefon');
$street = post_value('strasse');
$postalCode = post_value('plz');
$city = post_value('ort');
$objectType = post_value('objektart');
$timeframe = post_value('zeitrahmen');
$danger = post_value('gefaehrdung');
$description = post_value('beschreibung');
$additionalInfo = post_value('sonstige_infos');
$contactWay = post_value('kontaktweg');
$callbackWindow = post_value('rueckrufzeit');
$privacy = post_value('datenschutz');

if (
    !isset($concerns[$concern]) ||
    !isset($collaborations[$collaboration]) ||
    $company === '' ||
    $contactName === '' ||
    !preg_match('/^[0-9]{5}$/', $postalCode) ||
    $city === '' ||
    !isset($objectTypes[$objectType]) ||
    !isset($timeframes[$timeframe]) ||
    $description === '' ||
    !isset($contactWays[$contactWay]) ||
    $privacy !== '1'
) {
    redirect_with_status('validation');
}

if (($timeframe === 'akut' && !isset($dangers[$danger])) || ($callbackWindow !== '' && !isset($callbackWindows[$callbackWindow]))) {
    redirect_with_status('validation');
}

if (
    ($contactWay === 'telefon' && $phone === '') ||
    ($contactWay === 'email' && $email === '') ||
    ($contactWay === 'beides' && ($email === '' || $phone === ''))
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
    strlen($street) > 180 ||
    strlen($city) > 120 ||
    strlen($description) > 3000 ||
    strlen($additionalInfo) > 2000
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
    'Straße und Hausnummer' => $street,
    'Unmittelbare Gefährdung oder Einschränkung' => $timeframe === 'akut' ? $dangers[$danger] : '',
    'Rückrufzeitfenster' => $callbackWindow !== '' ? $callbackWindows[$callbackWindow] : '',
);

$lines = array(
    'Neue gewerbliche Anfrage über rohdich.de',
    '=========================================',
    '',
    'Anliegen: ' . $concerns[$concern],
    'Art der Zusammenarbeit: ' . $collaborations[$collaboration],
    'Firma / Organisation: ' . $company,
    'Ansprechpartner: ' . $contactName,
    'E-Mail: ' . ($email !== '' ? $email : '–'),
    'Telefon: ' . ($phone !== '' ? $phone : '–'),
    'Postleitzahl: ' . $postalCode,
    'Ort: ' . $city,
    'Objektart: ' . $objectTypes[$objectType],
    'Zeitrahmen: ' . $timeframes[$timeframe],
    'Gewünschte Rückmeldung: ' . $contactWays[$contactWay],
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
if ($additionalInfo !== '') {
    $lines[] = '';
    $lines[] = 'Sonstige Informationen';
    $lines[] = '-----------------------';
    $lines[] = $additionalInfo;
}
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

$subject = '=?UTF-8?B?' . base64_encode('Gewerbliche Objektanfrage: ' . $concerns[$concern] . ' – ' . $company) . '?=';
$headers = array(
    'From: Rohdich Website <website@rohdich.de>',
    'MIME-Version: 1.0',
    'Content-Type: multipart/mixed; boundary="' . $boundary . '"',
    'X-Mailer: PHP/' . phpversion(),
);
if ($email !== '') {
    $headers[] = 'Reply-To: ' . $email;
}

$sent = mail(FORM_RECIPIENT, $subject, $mailBody, implode("\r\n", $headers));
redirect_with_status($sent ? 'success' : 'send');
