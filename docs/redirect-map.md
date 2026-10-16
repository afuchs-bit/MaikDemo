# Weiterleitungen der alten Seite (AP-604)

Quelle der Regeln in Abschnitt 4 von `server/htaccess-live` (gleiche Reihenfolge). Alle mit 301,
nicht pauschal auf die Startseite. `/index.html` erledigt die allgemeine Regel 3 (`…/index.html` → `…/`).

Ergänzungen aus dem Search-Console-Export (Leistung → Seiten) als neue Zeilen eintragen und danach
als `RewriteRule ^<alt>$ <neu> [R=301,L]` nach `server/htaccess-live` übertragen. Ziele mit `#`
brauchen das Flag `NE`.

| Alt | Neu | Status | Sicherheit | Quelle |
|---|---|---|---|---|
| `/index.html` | `/` | 301 | sicher | Navigation alte Seite, 09.10.2026 (Regel 3) |
| `/unternehmen.html` | `/ueber-uns/` | 301 | sicher | Navigation |
| `/galerie.html` | `/projekte/` | 301 | sicher | Navigation |
| `/fachgebiete_gartenbau.html` | `/privatkunden/leistungen/gartengestaltung/` | 301 | Inhalt vergleichen | Navigation |
| `/fachgebiete_vorgarten.html` | `/privatkunden/leistungen/vorgarten/` | 301 | sicher | Navigation |
| `/fachgebiete_pflasterarbeiten.html` | `/privatkunden/leistungen/terrasse-pflasterarbeiten/` | 301 | sicher | Navigation |
| `/fachgebiete_gruenpflege.html` | `/privatkunden/leistungen/gartenpflege/` | 301 | Inhalt vergleichen | Navigation |
| `/fachgebiete_rollrasen.html` | `/privatkunden/leistungen/rollrasen/` | 301 | sicher | Navigation |
| `/fachgebiete_baumpflege.html` | `/privatkunden/leistungen/baumpflege/` | 301 | sicher | Navigation |
| `/fachgebiete_teichbau.html` | `/privatkunden/leistungen/teichbau/` | 301 | sicher | Navigation |
| `/fachgebiete_dachbegruenung.html` | `/privatkunden/leistungen/dachbegruenung/` | 301 | sicher | Navigation |
| `/fachgebiete_natursteine.html` | `/privatkunden/leistungen/findlinge-natursteineinfassungen/` | 301 | Inhalt vergleichen | Navigation |
| `/fachgebiete_erdarbeiten.html` | `/privatkunden/leistungen/erd-baggerarbeiten/` | 301 | Inhalt vergleichen | Navigation |
| `/kaminholz.html` | `/privatkunden/leistungen/holzverkauf/` | 301 | sicher | Navigation |
| `/baumkontrolle.html` | `/privatkunden/leistungen/baumkontrolle/` | 301 | sicher | Navigation |
| `/anfahrt.html` | `/kontakt/` | 301 | sicher | Navigation |
| `/formular.html` | `/kontakt/` | 301 | sicher | Navigation |
| `/impressum.html` | `/impressum/` | 301 | sicher | Navigation |
| `/dsgvo.html` | `/datenschutz/` | 301 | sicher | Navigation |
| `/steuerrecht.html` | `/#faq` (Frage „Kann ich Gartenarbeiten steuerlich geltend machen?“) | 301 (`NE`) | E5 entschieden: `/#faq` | Navigation |

Struktur der neuen Seite (Abschnitt 5 der `.htaccess`):

| Alt | Neu | Status | Grund |
|---|---|---|---|
| `/privatkunden/` | `/` | 301 | Hub seit AP-F8 in der Startseite (Teil H.5) |
| `/gewerbekunden/` | `/` | **302** | vorübergehend deaktiviert (AP-602 E1); Adresse bleibt für die Reaktivierung frei |
