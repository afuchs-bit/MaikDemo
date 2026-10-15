# api/lib – eingebundene Bibliotheken

Wird nicht ausgeliefert (Allowlist in AP-604). Der Ordner selbst ist per `.htaccess` gesperrt.

## PHPMailer

| | |
|---|---|
| Version | 7.1.1 (Tag `v7.1.1`, 18.05.2026) |
| Quelle | https://github.com/PHPMailer/PHPMailer/archive/refs/tags/v7.1.1.tar.gz |
| SHA-256 Archiv | `6c8210a20f2bdca42f398ea688042a17c572a52369449e80f5bf6ec7fbfce3e5` |
| Lizenz | LGPL 2.1 (`PHPMailer/LICENSE`) |

Übernommen sind nur die drei Dateien, die `api/anfrage.php` braucht. Composer ist nicht nötig.

| Datei | SHA-256 |
|---|---|
| `src/PHPMailer.php` | `45599a196ae7944ee2dcd4f3d3da0ac4243513d346b2d77bbd15dbd0c37f7064` |
| `src/SMTP.php` | `522bcf0d07be7e7e00114711db5c9ce2b4d59ac041c5ec36eaadd979d5fa7046` |
| `src/Exception.php` | `22ab858ae438d98f58f41f38ad2191d1b0d59570aebea0463a7948cfae1021b7` |
| `LICENSE` | `a1a33180d02960ab1c5de36cf20b1a2f0fe9888d83826ad263da5db52f1b183b` |

AP-603 sah „neueste 6.x“ vor. 6.12.0 (10/2025) war die letzte 6.x. Version 7.0.0 ist laut
Projekt inhaltlich 6.11.1 mit einer Änderung an statischen Sprachmethoden, die hier nicht
genutzt werden. Gepflegt wird nur noch 7.x.

**Aktualisieren:** neues Tag-Archiv laden, die drei Dateien und `LICENSE` ersetzen, Prüfsummen
hier eintragen, `npm test` mit PHP im PATH laufen lassen.
