<?php
// AP-603: Vorlage. Die echte Datei heisst anfrage-config.php und liegt NUR auf dem
// Server, eine Ebene ueber der Dokumentwurzel (Rechte 600). Nie ins Repository.
return [
  'empfaenger'      => '',          // Postfach fuer Anfragen
  'absender'        => '',          // eigenes Postfach der Domain, z. B. website@rohdich.de
  'absender_name'   => 'Website rohdich.de',
  'smtp_host'       => '',
  'smtp_port'       => 587,         // 587 STARTTLS, 465 SMTPS
  'smtp_user'       => '',
  'smtp_pass'       => '',
  'erlaubte_origins'=> ['https://rohdich.de', 'https://www.rohdich.de'], // Testumgebung ergaenzen
  'ratelimit_dir'   => null,        // E1: Verzeichnis ausserhalb der Dokumentwurzel, z. B. eine Ebene hoeher /anfrage-limit
];
