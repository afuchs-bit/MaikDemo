<?php
declare(strict_types=1);

header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

// TODO VOR LIVEGANG: Diese Empfängeradresse ist nur vorläufig. Vor der finalen
// Veröffentlichung auf das freigegebene betriebliche Anfragepostfach umstellen.
const FORM_RECIPIENT = 'kien.david2020@gmail.com';

function post_value(string $key): string
{
    if (!isset($_POST[$key]) || is_array($_POST[$key])) {
        return '';
    }
    return trim((string) $_POST[$key]);
}

function post_values(string $key): array
{
    if (!isset($_POST[$key]) || !is_array($_POST[$key])) {
        return array();
    }
    $values = array();
    foreach ($_POST[$key] as $value) {
        if (!is_array($value)) {
            $clean = trim((string) $value);
            if ($clean !== '') {
                $values[] = $clean;
            }
        }
    }
    return array_values(array_unique($values));
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

function valid_keys(array $values, array $allowed): bool
{
    foreach ($values as $value) {
        if (!isset($allowed[$value])) {
            return false;
        }
    }
    return true;
}

function has_exclusive_conflict(array $values, array $exclusive): bool
{
    if (count($values) < 2) {
        return false;
    }
    foreach ($exclusive as $value) {
        if (in_array($value, $values, true)) {
            return true;
        }
    }
    return false;
}

function labels(array $values, array $options): string
{
    return implode(', ', array_map(static fn(string $value): string => $options[$value], $values));
}

function h(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function wants_json(): bool
{
    $accept = isset($_SERVER['HTTP_ACCEPT']) ? (string) $_SERVER['HTTP_ACCEPT'] : '';
    $requestedWith = isset($_SERVER['HTTP_X_REQUESTED_WITH']) ? strtolower((string) $_SERVER['HTTP_X_REQUESTED_WITH']) : '';
    return strpos($accept, 'application/json') !== false || $requestedWith === 'xmlhttprequest';
}

function render_fallback_error(string $state): void
{
    $messages = array(
        'validation' => 'Bitte prüfen Sie die markierten Angaben. Ihre bisherigen Eingaben wurden übernommen.',
        'files' => 'Mindestens eine Datei konnte nicht verarbeitet werden. Dateien müssen erneut ausgewählt werden.',
        'send' => 'Die Anfrage konnte technisch nicht versendet werden. Bitte versuchen Sie es erneut oder rufen Sie uns an.',
        'spam' => 'Die Anfrage konnte nicht verarbeitet werden.',
    );
    $paths = array(
        'garten' => 'Garten neu anlegen und umgestalten',
        'vorgarten' => 'Vorgarten neu gestalten',
        'baulich' => 'Terrassen, Wege, Einfahrten, Mauern und Zäune',
        'bepflanzung_pflege' => 'Bepflanzung und Gartenpflege',
        'baeume' => 'Bäume schneiden, fällen und kontrollieren',
        'wasser' => 'Teiche, Wasserspiele und Poolumfeld',
        'weitere' => 'Weitere Leistungen',
        'unsicher' => 'Ich bin noch nicht sicher, was ich benötige',
        'sturmschaden' => 'Akuter Sturm- oder Baumschaden',
    );
    $selectedPath = post_value('hauptpfad');
    http_response_code($state === 'send' ? 500 : 422);
    header('Content-Type: text/html; charset=UTF-8');
    ?>
<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Anfrage prüfen | Maik Rohdich</title>
<link rel="stylesheet" href="../assets/css/styles.css?v=20260806a">
<style>
body{margin:0;background:#eef1e7;color:#1d2714}.fallback{width:min(760px,calc(100% - 32px));margin:48px auto;padding:clamp(24px,5vw,48px);border:1px solid rgba(49,82,0,.15);border-radius:24px 24px 42px 24px;background:#fff;box-shadow:0 30px 60px -46px rgba(19,26,8,.55)}.fallback h1{margin:0;color:#203506;font-size:clamp(2rem,5vw,3.3rem)}.fallback-status{margin:18px 0 26px;padding:14px 16px;border-left:3px solid #c64d2d;background:#fff2ed}.fallback-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.fallback label{display:grid;gap:7px;margin:0 0 18px}.fallback input,.fallback select,.fallback textarea{width:100%;box-sizing:border-box}.fallback .wide{grid-column:1/-1}.fallback-consent{display:flex!important;grid-column:1/-1;align-items:flex-start}.fallback-consent input{width:auto;margin-top:4px}@media(max-width:620px){.fallback-grid{grid-template-columns:1fr}.fallback .wide{grid-column:auto}}
</style>
</head>
<body>
<main class="fallback">
  <p class="kicker">Gartenanfrage</p>
  <h1>Bitte prüfen Sie Ihre Angaben.</h1>
  <p class="fallback-status" role="alert"><?php echo h($messages[$state] ?? $messages['send']); ?></p>
  <form action="anfrage.php" method="post">
    <input type="hidden" name="js_enabled" value="0">
    <div class="fallback-grid">
      <label class="wide"><span>Worum geht es? *</span><select name="hauptpfad" required><option value="">Bitte auswählen</option><?php foreach ($paths as $value => $label): ?><option value="<?php echo h($value); ?>"<?php echo $selectedPath === $value ? ' selected' : ''; ?>><?php echo h($label); ?></option><?php endforeach; ?></select></label>
      <label><span>Postleitzahl *</span><input name="plz" inputmode="numeric" pattern="[0-9]{5}" maxlength="5" value="<?php echo h(post_value('plz')); ?>" required></label>
      <label><span>Ort *</span><input name="ort" maxlength="120" value="<?php echo h(post_value('ort')); ?>" required></label>
      <label class="wide"><span>Beschreiben Sie Ihr Anliegen kurz *</span><textarea name="beschreibung" rows="5" maxlength="3000" required><?php echo h(post_value('beschreibung')); ?></textarea></label>
      <label class="wide"><span>Ihr Name *</span><input name="name" maxlength="160" value="<?php echo h(post_value('name')); ?>" required></label>
      <label><span>Telefonnummer</span><input name="telefon" maxlength="50" value="<?php echo h(post_value('telefon')); ?>"></label>
      <label><span>E-Mail-Adresse</span><input type="email" name="email" maxlength="190" value="<?php echo h(post_value('email')); ?>"></label>
      <label class="fallback-consent"><input type="checkbox" name="datenschutz" value="1"<?php echo post_value('datenschutz') === '1' ? ' checked' : ''; ?> required><span>Ich habe die <a href="../datenschutz/" target="_blank" rel="noopener">Datenschutzerklärung</a> gelesen und stimme der Verarbeitung meiner Angaben zur Bearbeitung meiner Anfrage zu. *</span></label>
    </div>
    <button class="btn btn-primary" type="submit">Anfrage senden</button>
  </form>
  <p><a href="./#anfrage">Zurück zur ausführlichen Gartenanfrage</a></p>
</main>
</body>
</html>
    <?php
    exit;
}

function finish(string $status): void
{
    $allowed = array('success', 'validation', 'files', 'send', 'spam');
    if (!in_array($status, $allowed, true)) {
        $status = 'send';
    }
    if (wants_json()) {
        $ok = $status === 'success';
        http_response_code($ok ? 200 : ($status === 'send' ? 500 : 422));
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(array('ok' => $ok, 'state' => $status), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }
    if ($status !== 'success') {
        render_fallback_error($status);
    }
    header('Location: ./?status=success#anfrage-erfolg', true, 303);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    http_response_code(405);
    echo 'Method Not Allowed';
    exit;
}
if (post_value('website') !== '') {
    finish('success');
}

$paths = array(
    'garten' => 'Garten neu anlegen und umgestalten',
    'vorgarten' => 'Vorgarten neu gestalten',
    'baulich' => 'Terrassen, Wege, Einfahrten, Mauern und Zäune',
    'bepflanzung_pflege' => 'Bepflanzung und Gartenpflege',
    'baeume' => 'Bäume schneiden, fällen und kontrollieren',
    'wasser' => 'Teiche, Wasserspiele und Poolumfeld',
    'weitere' => 'Weitere Leistungen',
    'unsicher' => 'Ich bin noch nicht sicher, was ich benötige',
    'sturmschaden' => 'Akuter Sturm- oder Baumschaden',
);
$gardenOptions = array('komplett'=>'Garten komplett neu anlegen','teilweise'=>'Garten teilweise umgestalten','modernisieren'=>'Garten modernisieren','erdarbeiten'=>'Erdarbeiten oder Geländeanpassungen','rasen'=>'Rasen oder neue Rasenfläche','bepflanzung'=>'Bepflanzung','bewaesserung'=>'Bewässerung','beleuchtung'=>'Gartenbeleuchtung','gesamtprojekt'=>'Mehrere Bereiche / Gesamtprojekt','unsicher'=>'Noch nicht sicher');
$frontGardenOptions = array('komplett'=>'Vorgarten komplett neu gestalten','umgestalten'=>'Bestehenden Vorgarten umgestalten','eingang'=>'Hauseingang oder Zugangsweg','pflaster'=>'Pflaster- oder Natursteinflächen','bepflanzung'=>'Bepflanzung','pflegeleicht'=>'Pflegeleichte Gestaltung','rasen'=>'Rasenfläche','beleuchtung'=>'Beleuchtung','sichtschutz'=>'Sichtschutz oder Abgrenzung','unsicher'=>'Noch nicht sicher');
$constructionOptions = array('terrasse'=>'Terrasse oder Sitzplatz','gartenweg'=>'Gartenweg','hauseingang'=>'Hauseingang oder Zuwegung','einfahrt'=>'Einfahrt oder Stellplatz','pflaster'=>'Weitere Pflasterflächen','naturstein'=>'Natursteinarbeiten','mauer'=>'Mauer oder Einfassung','treppen'=>'Treppen oder Stufen','hangbefestigung'=>'Hangbefestigung','zaun'=>'Zaun','sichtschutz'=>'Sichtschutz','unsicher'=>'Noch nicht sicher');
// Altwerte bleiben für bereits zwischengespeicherte Formularversionen gültig.
$careOptions = array('neupflanzung'=>'Neue Bepflanzung','beete'=>'Beete umgestalten','rasen'=>'Rasen','hecken'=>'Hecken und Sträucher','gehoelze'=>'Gehölze','palmen'=>'Palmen oder mediterrane Pflanzen','allgemein'=>'Allgemeine Gartenpflege','saisonal'=>'Saisonale Gartenpflege','regelmaessig'=>'Regelmäßige Gartenpflege','einmalig'=>'Einmalige Gartenpflege','mehrere'=>'Mehrere Bereiche','unsicher'=>'Noch nicht sicher');
$careTriggers = array('allgemein','saisonal','regelmaessig','einmalig');
$careIntervals = array('einmalig'=>'Einmalig','saisonal'=>'Gelegentlich oder saisonal','regelmaessig'=>'Regelmäßig','offen'=>'Noch offen');
$treeOptions = array('faellung'=>'Baum fällen','rueckschnitt'=>'Rückschnitt oder Baumpflege','aeste'=>'Beschädigte oder abgestorbene Äste','stubben'=>'Wurzelstock oder Stubben entfernen','sonstige'=>'Sonstige Baumarbeiten','verkehrssicherheit'=>'Zustand oder Verkehrssicherheit eines Baums prüfen','schaeden'=>'Schäden oder Auffälligkeiten beurteilen','grenze'=>'Baum an einer Grundstücksgrenze beurteilen','schriftlich'=>'Schriftliche Baumkontrolle oder Einschätzung','arbeiten_pruefen'=>'Ausgeführte Arbeiten fachlich beurteilen','angebot_pruefen'=>'Angebot oder Abrechnung fachlich einordnen','fachlich_anders'=>'Anderes fachliches Anliegen','unsicher'=>'Noch nicht sicher');
$assessmentTreeValues = array('verkehrssicherheit','schaeden','grenze','schriftlich','arbeiten_pruefen','angebot_pruefen','fachlich_anders');
$treeCounts = array('1'=>'1','2_3'=>'2–3','4_10'=>'4–10','ueber_10'=>'Mehr als 10','unbekannt'=>'Weiß ich nicht');
$treeAccess = array('gut'=>'Gut erreichbar','eingeschraenkt'=>'Eingeschränkt erreichbar','unbekannt'=>'Weiß ich nicht');
$writtenAssessments = array('ja'=>'Ja','nein'=>'Nein','offen'=>'Noch offen');
$waterOptions = array('teich_neu'=>'Neuen Gartenteich anlegen','teich_umgestalten'=>'Bestehenden Teich umgestalten','teich_sanieren'=>'Teich sanieren','uferzone'=>'Uferzone gestalten','teichbepflanzung'=>'Teichbepflanzung','technik'=>'Teich- oder Pumpentechnik','wasserspiel'=>'Wasserspiel oder Springbrunnen','poolumfeld'=>'Bereich rund um einen Pool gestalten','whirlpoolumfeld'=>'Bereich rund um einen Whirlpool gestalten','sichtschutz'=>'Sichtschutz am Pool oder Whirlpool','belaege'=>'Beläge oder Wege am Pool oder Whirlpool','unsicher'=>'Noch nicht sicher');
$otherTypes = array('dach'=>'Dachbegrünung','holz'=>'Brennholz und Stammholz','anderes'=>'Anderes Anliegen');
$roofObjects = array('garage'=>'Garage','carport'=>'Carport','anbau'=>'Anbau','anderes'=>'Anderes Gebäude','unsicher'=>'Noch nicht sicher');
$roofForms = array('flachdach'=>'Flachdach','geneigt'=>'Leicht geneigtes Dach','unbekannt'=>'Weiß ich nicht');
$woodTypes = array('brennholz'=>'Brennholz','stammholz'=>'Stammholz','beides'=>'Beides');
$woodTransfers = array('abholung'=>'Abholung','anlieferung'=>'Anlieferung','besprechen'=>'Möchte ich besprechen');
$areas = array('unter_25'=>'Unter 25 m²','25_50'=>'25–50 m²','50_100'=>'50–100 m²','100_200'=>'100–200 m²','ueber_200'=>'Über 200 m²','100_250'=>'100–250 m²','ueber_250'=>'Über 250 m²','unter_50'=>'Unter 50 m²','50_150'=>'50–150 m²','150_300'=>'150–300 m²','300_600'=>'300–600 m²','ueber_600'=>'Über 600 m²','unbekannt'=>'Weiß ich nicht');
$roofAreas = array('unter_25'=>'Unter 25 m²','25_50'=>'25–50 m²','50_100'=>'50–100 m²','ueber_100'=>'Über 100 m²','unbekannt'=>'Weiß ich nicht');
$specials = array('zufahrt'=>'Schmale oder eingeschränkte Zufahrt','hauszugang'=>'Zugang nur durch das Haus','hanglage'=>'Hanglage','grenze'=>'Grundstücksgrenze oder Nachbarschaft relevant','leitungen'=>'Leitungen oder Entwässerung könnten relevant sein','keine'=>'Keine Besonderheiten','unbekannt'=>'Weiß ich nicht','stellplatz'=>'Zufahrt oder Stellplatz betroffen','eingang'=>'Hauseingang betroffen','stufen'=>'Höhenunterschiede oder Stufen','entwaesserung'=>'Entwässerung könnte relevant sein','gut'=>'Gut zugänglich','rueckbau'=>'Bestehende Bauteile müssen entfernt werden','eingeschraenkt'=>'Eingeschränkter Zugang','bestand'=>'Bestehende Anlage vorhanden');
$planningStates = array('anfang'=>'Noch ganz am Anfang','erste_ideen'=>'Erste Vorstellungen vorhanden','material'=>'Material oder Gestaltung bereits ausgewählt','konkret'=>'Konkrete Planung vorhanden','unterlagen'=>'Pläne oder Unterlagen vorhanden','beratung'=>'Zunächst fachliche Beratung gewünscht');
$budgets = array('unter_5000'=>'Unter 5.000 €','5000_10000'=>'5.000–10.000 €','10000_25000'=>'10.000–25.000 €','25000_50000'=>'25.000–50.000 €','ueber_50000'=>'Über 50.000 €');
$timeframes = array('bald'=>'So bald wie möglich','drei_monate'=>'Innerhalb von drei Monaten','sechs_monate'=>'Innerhalb von sechs Monaten','zwoelf_monate'=>'Innerhalb von zwölf Monaten','spaeter'=>'Später','offen'=>'Noch offen','pflege_bald'=>'Möglichst bald','pflege_wochen'=>'Innerhalb der nächsten Wochen','pflege_monate'=>'Innerhalb der nächsten Monate','pflege_regelmaessig'=>'Regelmäßige Pflege gesucht','pflege_saisonal'=>'Saisonal','pflege_offen'=>'Noch offen','baum_bald'=>'So bald wie möglich','baum_wochen'=>'Innerhalb der nächsten Wochen','baum_monate'=>'Innerhalb der nächsten Monate','baum_flexibel'=>'Termin flexibel','baum_offen'=>'Noch offen','allgemein_bald'=>'Möglichst bald','allgemein_wochen'=>'Innerhalb der nächsten Wochen','allgemein_monate'=>'Innerhalb der nächsten Monate','allgemein_spaeter'=>'Später','allgemein_offen'=>'Noch offen','dach_bald'=>'Möglichst bald','dach_drei_monate'=>'Innerhalb von drei Monaten','dach_sechs_monate'=>'Innerhalb von sechs Monaten','dach_spaeter'=>'Später','dach_offen'=>'Noch offen','holz_bald'=>'Möglichst bald','holz_wochen'=>'In den nächsten Wochen','holz_spaeter'=>'Später','holz_flexibel'=>'Flexibel');
$timeframeRules = array(
    'garten'=>array('bald','drei_monate','sechs_monate','zwoelf_monate','spaeter','offen'),
    'vorgarten'=>array('bald','drei_monate','sechs_monate','zwoelf_monate','spaeter','offen'),
    'baulich'=>array('bald','drei_monate','sechs_monate','zwoelf_monate','spaeter','offen'),
    'bepflanzung_pflege'=>array('pflege_bald','pflege_wochen','pflege_monate','pflege_regelmaessig','pflege_saisonal','pflege_offen'),
    'baeume'=>array('baum_bald','baum_wochen','baum_monate','baum_flexibel','baum_offen'),
    'wasser'=>array('bald','drei_monate','sechs_monate','zwoelf_monate','spaeter','offen'),
    'unsicher'=>array('allgemein_bald','allgemein_wochen','allgemein_monate','allgemein_spaeter','allgemein_offen'),
    'dach'=>array('dach_bald','dach_drei_monate','dach_sechs_monate','dach_spaeter','dach_offen'),
    'holz'=>array('holz_bald','holz_wochen','holz_spaeter','holz_flexibel'),
    'anderes'=>array('allgemein_bald','allgemein_wochen','allgemein_monate','allgemein_offen'),
);
$contactPreferences = array('telefon'=>'Telefonisch','email'=>'Per E-Mail','whatsapp'=>'Per WhatsApp','egal'=>'Keine Präferenz');
$dangerValues = array('ja'=>'Ja','nein'=>'Nein','unklar'=>'Unklar');
$damageValues = array('baum_ast'=>'Baum oder größerer Ast','gebaeude'=>'Gebäude','fahrzeug'=>'Fahrzeug','zufahrt'=>'Zufahrt','nachbar'=>'Nachbargrundstück','oeffentlich'=>'Öffentliche Fläche','anderes'=>'Anderes');

$enhanced = post_value('js_enabled') === '1';
$path = post_value('hauptpfad');
$street = post_value('strasse');
$postalCode = post_value('plz');
$city = post_value('ort');
$description = post_value('beschreibung');
$name = post_value('name');
$email = clean_header_value(post_value('email'));
$phone = post_value('telefon');
$contactPreference = post_value('kontaktpraeferenz');
$privacy = post_value('datenschutz');
$timeframe = post_value('zeitrahmen');

if (!isset($paths[$path]) || !preg_match('/^[0-9]{5}$/', $postalCode) || $city === '' || $name === '' || ($email === '' && $phone === '') || $privacy !== '1') {
    finish('validation');
}
if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    finish('validation');
}
if ($contactPreference !== '' && !isset($contactPreferences[$contactPreference])) {
    finish('validation');
}
if (($contactPreference === 'email' && $email === '') || (($contactPreference === 'telefon' || $contactPreference === 'whatsapp') && $phone === '')) {
    finish('validation');
}
if (strlen($street)>180 || strlen($city)>120 || strlen($description)>3000 || strlen($name)>160 || strlen($email)>190 || strlen($phone)>50) {
    finish('validation');
}

$selected = array();
$otherType = '';
$careInterval = '';
$treeReachability = '';
$writtenAssessment = '';
$treeCount = '';
$area = '';
$roofArea = '';
$roofObject = '';
$roofForm = '';
$woodType = '';
$woodTransfer = '';
$woodAmount = '';
$specialValues = array();
$planningState = '';
$budget = '';
$danger = '';
$selectedDamage = array();
$activeOptions = array();
$activeLabel = '';
$allowUpload = true;

if (!$enhanced) {
    if ($description === '') {
        finish('validation');
    }
} elseif ($path === 'sturmschaden') {
    $danger = post_value('gefahr');
    $selectedDamage = post_values('schaden');
    if (!isset($dangerValues[$danger]) || count($selectedDamage)<1 || !valid_keys($selectedDamage,$damageValues) || $street==='' || $description==='' || $phone==='') {
        finish('validation');
    }
    $email = '';
    $contactPreference = '';
    $timeframe = '';
} else {
    $otherType = $path === 'weitere' ? post_value('weitere_art') : '';
    if ($path === 'weitere' && !isset($otherTypes[$otherType])) {
        finish('validation');
    }
    $timeframeKey = $path === 'weitere' ? $otherType : $path;
    if (!isset($timeframeRules[$timeframeKey]) || !in_array($timeframe,$timeframeRules[$timeframeKey],true)) {
        finish('validation');
    }
    if (!($path === 'weitere' && $otherType === 'holz') && $description === '') {
        finish('validation');
    }

    if ($path === 'garten') {
        $selected=post_values('gartenprojekt'); $activeOptions=$gardenOptions; $activeLabel='Geplante Gartenarbeiten';
        if (count($selected)>0 && (!valid_keys($selected,$activeOptions) || has_exclusive_conflict($selected,array('gesamtprojekt','unsicher')))) finish('validation');
    } elseif ($path === 'vorgarten') {
        $selected=post_values('vorgartenprojekt'); $activeOptions=$frontGardenOptions; $activeLabel='Geplante Vorgartenarbeiten';
        if (count($selected)>0 && (!valid_keys($selected,$activeOptions) || has_exclusive_conflict($selected,array('unsicher')))) finish('validation');
    } elseif ($path === 'baulich') {
        $selected=post_values('bauprojekt'); $activeOptions=$constructionOptions; $activeLabel='Geplante Außenarbeiten';
        if (count($selected)>0 && (!valid_keys($selected,$activeOptions) || has_exclusive_conflict($selected,array('unsicher')))) finish('validation');
    } elseif ($path === 'bepflanzung_pflege') {
        $selected=post_values('pflegeprojekt'); $activeOptions=$careOptions; $activeLabel='Bepflanzung und Pflege';
        if (count($selected)>0 && (!valid_keys($selected,$activeOptions) || has_exclusive_conflict($selected,array('mehrere','unsicher')))) finish('validation');
        $needsInterval = count(array_intersect($selected,$careTriggers))>0;
        $careInterval = $needsInterval ? post_value('pflegeturnus') : '';
        if ($needsInterval && !isset($careIntervals[$careInterval])) finish('validation');
    } elseif ($path === 'baeume') {
        $selected=post_values('baumleistung'); $activeOptions=$treeOptions; $activeLabel='Baumarbeiten und Kontrollen';
        $treeReachability=post_value('baumerreichbarkeit');
        if ((count($selected)>0 && (!valid_keys($selected,$activeOptions) || has_exclusive_conflict($selected,array('unsicher')))) || !isset($treeAccess[$treeReachability])) finish('validation');
        if (count(array_intersect($selected,$assessmentTreeValues))>0) {
            $writtenAssessment=post_value('schriftliche_einschaetzung');
            if ($writtenAssessment!=='' && !isset($writtenAssessments[$writtenAssessment])) finish('validation');
        }
    } elseif ($path === 'wasser') {
        $selected=post_values('wasserprojekt'); $activeOptions=$waterOptions; $activeLabel='Geplante Wasser- und Poolarbeiten';
        if (count($selected)>0 && (!valid_keys($selected,$activeOptions) || has_exclusive_conflict($selected,array('unsicher')))) finish('validation');
    } elseif ($path === 'weitere' && $otherType === 'dach') {
        $roofObject=post_value('dachobjekt'); $roofForm=post_value('dachform');
        if (!isset($roofObjects[$roofObject]) || !isset($roofForms[$roofForm])) finish('validation');
    } elseif ($path === 'weitere' && $otherType === 'holz') {
        $woodType=post_value('holzart'); $woodTransfer=post_value('holzuebergabe'); $woodAmount=post_value('holzmenge'); $allowUpload=false;
        if (!isset($woodTypes[$woodType]) || !isset($woodTransfers[$woodTransfer]) || strlen($woodAmount)>160) finish('validation');
        $description='';
    }

    if (in_array($path,array('garten','vorgarten','baulich','bepflanzung_pflege','wasser'),true)) {
        $area=post_value('flaeche');
        if ($area!=='' && !isset($areas[$area])) finish('validation');
        $specialValues=post_values('besonderheiten');
        if (!valid_keys($specialValues,$specials) || has_exclusive_conflict($specialValues,array('keine','unbekannt','gut'))) finish('validation');
    }
    if ($path === 'baeume') {
        $treeCount=post_value('baumanzahl');
        if ($treeCount!=='' && !isset($treeCounts[$treeCount])) finish('validation');
    }
    if ($path === 'weitere' && $otherType === 'dach') {
        $roofArea=post_value('dachflaeche');
        if ($roofArea!=='' && !isset($roofAreas[$roofArea])) finish('validation');
    }
    if (in_array($path,array('garten','vorgarten','baulich','wasser'),true)) {
        $planningState=post_value('planungsstand'); $budget=post_value('budget');
        if (($planningState!=='' && !isset($planningStates[$planningState])) || ($budget!=='' && !isset($budgets[$budget]))) finish('validation');
    }
}

$allowedFiles = array('pdf'=>array('application/pdf'),'jpg'=>array('image/jpeg'),'jpeg'=>array('image/jpeg'),'png'=>array('image/png'),'webp'=>array('image/webp'),'heic'=>array('image/heic','image/heif','application/octet-stream'),'heif'=>array('image/heif','image/heic','application/octet-stream'));
$attachments=array(); $totalBytes=0; $maxTotalBytes=12*1024*1024; $maxFiles=5;
if ($allowUpload && isset($_FILES['unterlagen']) && is_array($_FILES['unterlagen']['name'])) {
    $names=$_FILES['unterlagen']['name']; $tempNames=$_FILES['unterlagen']['tmp_name']; $errors=$_FILES['unterlagen']['error']; $sizes=$_FILES['unterlagen']['size']; $submittedCount=0;
    foreach ($names as $index=>$originalName) {
        $error=isset($errors[$index])?(int)$errors[$index]:UPLOAD_ERR_NO_FILE;
        if ($error===UPLOAD_ERR_NO_FILE) continue;
        $submittedCount++;
        if ($submittedCount>$maxFiles || $error!==UPLOAD_ERR_OK) finish('files');
        $tempName=isset($tempNames[$index])?(string)$tempNames[$index]:''; $size=isset($sizes[$index])?(int)$sizes[$index]:0; $totalBytes+=$size;
        if ($size<=0 || $totalBytes>$maxTotalBytes || !is_uploaded_file($tempName)) finish('files');
        $filename=safe_filename((string)$originalName); $extension=strtolower((string)pathinfo($filename,PATHINFO_EXTENSION));
        if (!isset($allowedFiles[$extension])) finish('files');
        $mime='application/octet-stream';
        if (function_exists('finfo_open')) { $finfo=finfo_open(FILEINFO_MIME_TYPE); if ($finfo!==false) { $detected=finfo_file($finfo,$tempName); finfo_close($finfo); if (is_string($detected)&&$detected!=='') $mime=$detected; } }
        if (!in_array($mime,$allowedFiles[$extension],true)) finish('files');
        $content=file_get_contents($tempName); if ($content===false) finish('files');
        $attachments[]=array('name'=>$filename,'mime'=>$mime,'content'=>$content);
    }
}

$lines=array('Neue private Anfrage über rohdich.de','======================================','','Hauptanliegen: '.$paths[$path]);
if ($path==='weitere') $lines[]='Weitere Leistung: '.$otherTypes[$otherType];
if (count($selected)>0) $lines[]=$activeLabel.': '.labels($selected,$activeOptions);
if ($careInterval!=='') $lines[]='Pflegeturnus: '.$careIntervals[$careInterval];
if ($treeReachability!=='') $lines[]='Erreichbarkeit der Bäume: '.$treeAccess[$treeReachability];
if ($treeCount!=='') $lines[]='Anzahl betroffener Bäume: '.$treeCounts[$treeCount];
if ($writtenAssessment!=='') $lines[]='Schriftliche Einschätzung: '.$writtenAssessments[$writtenAssessment];
if ($roofObject!=='') $lines[]='Art des Objekts: '.$roofObjects[$roofObject];
if ($roofForm!=='') $lines[]='Dachform: '.$roofForms[$roofForm];
if ($roofArea!=='') $lines[]='Ungefähre Dachfläche: '.$roofAreas[$roofArea];
if ($woodType!=='') $lines[]='Holzart: '.$woodTypes[$woodType];
if ($woodTransfer!=='') $lines[]='Übergabe: '.$woodTransfers[$woodTransfer];
if ($woodAmount!=='') $lines[]='Benötigte Menge: '.$woodAmount;
if ($path==='sturmschaden') { $lines[]='Unmittelbare Gefahr: '.$dangerValues[$danger]; $lines[]='Betroffen: '.labels($selectedDamage,$damageValues); }
if ($area!=='') $lines[]='Betroffene Fläche: '.$areas[$area];
if (count($specialValues)>0) $lines[]='Zugang und Besonderheiten: '.labels($specialValues,$specials);
if ($planningState!=='') $lines[]='Planungsstand: '.$planningStates[$planningState];
if ($budget!=='') $lines[]='Investitionsrahmen: '.$budgets[$budget];
$lines[]='Straße und Hausnummer: '.($street!==''?$street:'–');
$lines[]='Postleitzahl: '.$postalCode;
$lines[]='Ort: '.$city;
if ($timeframe!=='') $lines[]='Zeitrahmen: '.$timeframes[$timeframe];
if ($description!=='') { $lines[]=''; $lines[]='Beschreibung'; $lines[]='------------'; $lines[]=$description; }
$lines[]=''; $lines[]='Kontaktdaten'; $lines[]='------------'; $lines[]='Name: '.$name; $lines[]='E-Mail: '.($email!==''?$email:'–'); $lines[]='Telefon: '.($phone!==''?$phone:'–'); $lines[]='Kontaktpräferenz: '.($contactPreference!==''?$contactPreferences[$contactPreference]:'–'); $lines[]=''; $lines[]='Anhänge: '.count($attachments); $lines[]='Datenschutzhinweis bestätigt: Ja';
$messageText=implode("\r\n",$lines);

$boundary='=_Rohdich_'.bin2hex(random_bytes(12));
$mailBody='--'.$boundary."\r\n";
$mailBody.="Content-Type: text/plain; charset=UTF-8\r\n";
$mailBody.="Content-Transfer-Encoding: base64\r\n\r\n";
$mailBody.=chunk_split(base64_encode($messageText))."\r\n";
foreach ($attachments as $attachment) {
    $encodedName='=?UTF-8?B?'.base64_encode($attachment['name']).'?=';
    $mailBody.='--'.$boundary."\r\n";
    $mailBody.='Content-Type: '.$attachment['mime'].'; name="'.$encodedName.'"'."\r\n";
    $mailBody.="Content-Transfer-Encoding: base64\r\n";
    $mailBody.='Content-Disposition: attachment; filename="'.$encodedName.'"'."\r\n\r\n";
    $mailBody.=chunk_split(base64_encode($attachment['content']))."\r\n";
}
$mailBody.='--'.$boundary."--\r\n";
$subjectText='Private Anfrage: '.$paths[$path].' – '.$name;
$subject='=?UTF-8?B?'.base64_encode($subjectText).'?=';
$headers=array('From: Rohdich Website <website@rohdich.de>','MIME-Version: 1.0','Content-Type: multipart/mixed; boundary="'.$boundary.'"','X-Mailer: PHP/'.phpversion());
if ($email!=='') $headers[]='Reply-To: '.$email;
$sent=mail(FORM_RECIPIENT,$subject,$mailBody,implode("\r\n",$headers));
finish($sent?'success':'send');
