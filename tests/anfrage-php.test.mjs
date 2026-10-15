// AP-603: Vertragstests fuer den PHP-Empfaenger api/anfrage.php.
//
// Jeder Fall startet einen eigenen `php -S` mit Router und Konfiguration in einem
// temporaeren Verzeichnis. Die Konfiguration liegt dort eine Ebene ueber der
// Dokumentwurzel - genau wie auf dem Server. Der Mailversand laeuft ueber den
// Testtransport `datei`, den anfrage.php nur unter dem Entwicklungsserver zulaesst.
//
// Ohne PHP werden die Tests uebersprungen. PHP_BIN waehlt eine bestimmte Version.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { cp, mkdtemp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PHP = process.env.PHP_BIN || 'php';
const PHP_DA = spawnSync(PHP, ['-v']).status === 0;

const ROUTER = `<?php
// Bildet api/.htaccess nach: nur /api/anfrage ist erreichbar.
$pfad = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if ($pfad === '/api/anfrage') {
    require __DIR__ . '/docroot/api/anfrage.php';
    return true;
}
http_response_code(404);
echo 'not found';
return true;
`;

const freierPort = () => new Promise((resolve) => {
  const server = createServer();
  server.listen(0, '127.0.0.1', () => { const { port } = server.address(); server.close(() => resolve(port)); });
});

async function starte(t, { konfig = {}, ohneKonfig = false, ini = {} } = {}) {
  const dir = await mkdtemp(join(tmpdir(), 'anfrage-php-'));
  await mkdir(join(dir, 'docroot'));
  await cp(join(ROOT, 'api'), join(dir, 'docroot', 'api'), { recursive: true });
  await mkdir(join(dir, 'mails'));
  await writeFile(join(dir, 'router.php'), ROUTER);
  if (!ohneKonfig) {
    const werte = {
      empfaenger: 'anfragen@example.com', absender: 'website@example.com', absender_name: 'Website rohdich.de',
      transport: 'datei', mail_dir: join(dir, 'mails'), erlaubte_origins: ['https://rohdich.de'], ...konfig
    };
    const b64 = Buffer.from(JSON.stringify(werte)).toString('base64');
    await writeFile(join(dir, 'anfrage-config.php'), `<?php return json_decode(base64_decode('${b64}'), true);\n`);
  }
  const port = await freierPort();
  const einstellungen = { display_errors: '0', log_errors: '1', post_max_size: '8M', upload_max_filesize: '4M', ...ini };
  const args = [...Object.entries(einstellungen).flatMap(([k, v]) => ['-d', `${k}=${v}`]), '-S', `127.0.0.1:${port}`, '-t', join(dir, 'docroot'), join(dir, 'router.php')];
  const proc = spawn(PHP, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  let log = '';
  proc.stdout.on('data', (d) => { log += d; });
  proc.stderr.on('data', (d) => { log += d; });
  t.after(async () => { proc.kill(); await rm(dir, { recursive: true, force: true }); });
  const url = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 100; i++) {
    try { await fetch(url + '/'); break; } catch { await new Promise((r) => setTimeout(r, 50)); }
  }
  return { url, dir, log: () => log, mails: async () => (await readdir(join(dir, 'mails'))).filter((f) => f.endsWith('.eml')) };
}

const JPEG = () => new Uint8Array([255, 216, 255, 0, 1, 2, 3, 4, 5, 6, 7, 8]);

function formular({ fotos = 0, freigabe = true, felder = {}, foto = null } = {}) {
  const data = new FormData();
  const werte = { name: 'Testperson', kontakt: 'test@example.com', nachricht: 'Anfrage\nmit zwei Zeilen', leistung: 'Baumpflege', geladen_um: String(Date.now() - 5000), ...felder };
  for (const [k, v] of Object.entries(werte)) if (v !== undefined) data.set(k, v);
  if (freigabe) data.set('foto_freigabe', '1');
  for (let i = 0; i < fotos; i++) data.append('fotos[]', new Blob([JPEG()], { type: 'image/jpeg' }), 'original.jpg');
  if (foto) data.append('fotos[]', foto, 'bild.jpg');
  return data;
}

const senden = (server, body, headers = {}) => fetch(server.url + '/api/anfrage', { method: 'POST', body, headers });

// Rohtext gegen JSON.stringify - so wuerde api/anfrage.js antworten.
async function erwarte(res, status, erwartet) {
  assert.equal(res.status, status);
  assert.equal(res.headers.get('content-type'), 'application/json; charset=utf-8');
  assert.equal(res.headers.get('cache-control'), 'no-store');
  assert.equal(await res.text(), JSON.stringify(erwartet));
}

const t2 = (name, fn) => test('PHP: ' + name, async (t) => {
  if (!PHP_DA) return t.skip('php nicht installiert');
  await fn(t);
});

t2('sechs Fotos kommen als sechs Anhänge mit Absender und Antwortadresse an', async (t) => {
  const s = await starte(t);
  await erwarte(await senden(s, formular({ fotos: 6 })), 200, { ok: true });
  const mails = await s.mails();
  assert.equal(mails.length, 1);
  const mime = await readFile(join(s.dir, 'mails', mails[0]), 'utf8');
  assert.match(mime, /^From: "?Website rohdich\.de"? <website@example\.com>\r?$/m);
  assert.match(mime, /^To: anfragen@example\.com\r?$/m);
  assert.match(mime, /^Reply-To: test@example\.com\r?$/m);
  assert.match(mime, /^Subject: Gartenanfrage von Testperson\r?$/m);
  assert.match(mime, /Leistung: Baumpflege/);
  assert.match(mime, /6 Fotos im Anhang\./);
  const namen = [...mime.matchAll(/filename="?([^";\r\n]+)"?/g)].map((m) => m[1]);
  assert.deepEqual(namen, Array.from({ length: 6 }, (_, i) => `foto-${i + 1}.jpg`));
  const inhalt = mime.split(/filename="?foto-1\.jpg"?\r?\n\r?\n/)[1].split(/\r?\n\r?\n|--/)[0].replace(/\s/g, '');
  assert.deepEqual([...Buffer.from(inhalt, 'base64')], [...JPEG()]);
});

t2('Telefonnummer als Kontakt: kein Reply-To', async (t) => {
  const s = await starte(t);
  await erwarte(await senden(s, formular({ felder: { kontakt: '0171 / 173 89 43' } })), 200, { ok: true });
  const mime = await readFile(join(s.dir, 'mails', (await s.mails())[0]), 'utf8');
  assert.doesNotMatch(mime, /^Reply-To:/m);
  assert.match(mime, /Keine Fotos\./);
});

t2('sieben Fotos werden abgelehnt', async (t) => {
  const s = await starte(t);
  await erwarte(await senden(s, formular({ fotos: 7 })), 422, { ok: false, code: 'validation', fields: { fotos: 'Bitte wählen Sie höchstens sechs Fotos aus.' } });
  assert.equal((await s.mails()).length, 0);
});

t2('Fotos ohne Freigabe werden abgelehnt', async (t) => {
  const s = await starte(t);
  await erwarte(await senden(s, formular({ fotos: 1, freigabe: false })), 422, { ok: false, code: 'validation', fields: { foto_freigabe: 'Bitte bestätigen Sie, dass Sie die ausgewählten Fotos weitergeben dürfen.' } });
});

t2('falsche Bildbytes und nicht unterstützte Bildart', async (t) => {
  const s = await starte(t);
  await erwarte(await senden(s, formular({ foto: new Blob(['not an image at all'], { type: 'image/jpeg' }) })), 415,
    { ok: false, code: 'validation', fields: { fotos: 'Foto 1 konnte nicht gelesen werden. Bitte entfernen Sie es und wählen Sie eine andere Bilddatei aus.' } });
  await erwarte(await senden(s, formular({ foto: new Blob([JPEG()], { type: 'image/gif' }) })), 415,
    { ok: false, code: 'validation', fields: { fotos: 'Foto 1 hat kein unterstütztes Bildformat. Bitte wählen Sie JPG, PNG oder WebP.' } });
});

t2('Pflichtfelder fehlen auch bei einer Anfrage mit Fotos', async (t) => {
  const s = await starte(t);
  await erwarte(await senden(s, formular({ fotos: 2, felder: { name: ' ', kontakt: '', nachricht: '\n\t' } })), 422, {
    ok: false, code: 'validation', fields: {
      name: 'Bitte geben Sie Ihren Namen ein.',
      kontakt: 'Bitte geben Sie eine Telefonnummer oder E-Mail-Adresse an, damit wir Sie erreichen können.',
      nachricht: 'Bitte beschreiben Sie kurz Ihr Vorhaben. Fotos ergänzen die Beschreibung.'
    }
  });
});

t2('ungültiger Kontakt, zu langer Name und zu lange Beschreibung', async (t) => {
  const s = await starte(t);
  await erwarte(await senden(s, formular({ felder: { kontakt: 'nicht erreichbar' } })), 422, { ok: false, code: 'validation', fields: { kontakt: 'Bitte geben Sie eine gültige Telefonnummer oder E-Mail-Adresse ein.' } });
  await erwarte(await senden(s, formular({ felder: { name: 'x'.repeat(121) } })), 422, { ok: false, code: 'validation', fields: { name: 'Bitte kürzen Sie Ihren Namen auf höchstens 120 Zeichen.' } });
  await erwarte(await senden(s, formular({ felder: { nachricht: 'a'.repeat(4001) } })), 422, { ok: false, code: 'validation', fields: { nachricht: 'Bitte kürzen Sie Ihre Beschreibung auf höchstens 4.000 Zeichen.' } });
  // Grenzfall: genau 4.000 Zeichen sind erlaubt, Emoji zählen wie in JavaScript doppelt.
  await erwarte(await senden(s, formular({ felder: { nachricht: 'a'.repeat(4000) } })), 200, { ok: true });
  await erwarte(await senden(s, formular({ felder: { name: '🌳'.repeat(61) } })), 422, { ok: false, code: 'validation', fields: { name: 'Bitte kürzen Sie Ihren Namen auf höchstens 120 Zeichen.' } });
});

t2('zu schnell, abgelaufen und fehlender Zeitstempel', async (t) => {
  const s = await starte(t);
  await erwarte(await senden(s, formular({ felder: { geladen_um: String(Date.now()) } })), 422, { ok: false, code: 'form_too_fast' });
  await erwarte(await senden(s, formular({ felder: { geladen_um: String(Date.now() - 25 * 3600 * 1000) } })), 422, { ok: false, code: 'form_expired' });
  await erwarte(await senden(s, formular({ felder: { geladen_um: String(Date.now() + 60000) } })), 422, { ok: false, code: 'form_expired' });
  await erwarte(await senden(s, formular({ felder: { geladen_um: undefined } })), 422, { ok: false, code: 'form_expired' });
  assert.equal((await s.mails()).length, 0);
});

t2('Honeypot meldet Erfolg und versendet nichts', async (t) => {
  const s = await starte(t);
  await erwarte(await senden(s, formular({ felder: { _hp_website: 'https://spam.example' } })), 200, { ok: true });
  assert.equal((await s.mails()).length, 0);
});

t2('Origin, Methode und Format', async (t) => {
  const s = await starte(t);
  await erwarte(await senden(s, formular(), { Origin: 'https://fremd.example' }), 403, { ok: false, code: 'origin' });
  await erwarte(await senden(s, formular(), { Origin: 'https://rohdich.de' }), 200, { ok: true });
  await erwarte(await fetch(s.url + '/api/anfrage'), 405, { ok: false, code: 'method' });
  await erwarte(await senden(s, JSON.stringify({ name: 'x' }), { 'Content-Type': 'application/json' }), 415, { ok: false, code: 'request_format' });
});

t2('fehlende Konfiguration meldet keinen Erfolg', async (t) => {
  const s = await starte(t, { ohneKonfig: true });
  await erwarte(await senden(s, formular()), 503, { ok: false, code: 'mail_unconfigured' });
});

t2('Größengrenzen: Einzelfoto, Summe und post_max_size', async (t) => {
  const s = await starte(t);
  const gross = (n) => { const b = new Uint8Array(n); b.set(JPEG()); return new Blob([b], { type: 'image/jpeg' }); };
  await erwarte(await senden(s, formular({ foto: gross(1_500_001) })), 413, { ok: false, code: 'validation', fields: { fotos: 'Foto 1 ist zu groß. Bitte wählen Sie eine kleinere Datei aus.' } });
  const drei = formular();
  for (let i = 0; i < 3; i++) drei.append('fotos[]', gross(1_400_000), 'b.jpg');
  await erwarte(await senden(s, drei), 413, { ok: false, code: 'validation', fields: { fotos: 'Die Fotos sind zusammen zu groß. Bitte entfernen Sie ein Foto oder wählen Sie kleinere Dateien aus.' } });
  const klein = await starte(t, { ini: { post_max_size: '1M' } });
  await erwarte(await senden(klein, formular({ foto: gross(1_200_000) })), 413, { ok: false, code: 'validation', fields: { fotos: 'Die Fotos sind zusammen zu groß. Bitte entfernen Sie ein Foto oder wählen Sie kleinere Dateien aus.' } });
});

t2('Rate-Limit: die sechste Anfrage in zehn Minuten wird abgewiesen, gespeichert ist nur ein Hash', async (t) => {
  const limitDir = await mkdtemp(join(tmpdir(), 'anfrage-limit-'));
  t.after(() => rm(limitDir, { recursive: true, force: true }));
  const s = await starte(t, { konfig: { ratelimit_dir: limitDir } });
  for (let i = 0; i < 5; i++) await erwarte(await senden(s, formular({ felder: { _hp_website: 'x' } })), 200, { ok: true });
  await erwarte(await senden(s, formular()), 429, { ok: false, code: 'rate_limited' });
  const dateien = await readdir(limitDir);
  const eintraege = dateien.filter((f) => f.startsWith('ip-'));
  assert.equal(eintraege.length, 1);
  assert.match(eintraege[0], /^ip-[0-9a-f]{64}$/);
  for (const f of dateien) assert.doesNotMatch(await readFile(join(limitDir, f), 'utf8'), /127\.0\.0\.1/);
});

t2('Direktaufruf von anfrage.php und lib/ sind nicht erreichbar', async (t) => {
  const s = await starte(t);
  assert.equal((await fetch(s.url + '/api/anfrage.php', { method: 'POST', body: formular() })).status, 404);
  assert.equal((await fetch(s.url + '/api/lib/PHPMailer/src/PHPMailer.php')).status, 404);
});

t2('SMTP-Fehler: 502 und kein Inhalt im Log', async (t) => {
  const tot = await freierPort();
  const s = await starte(t, { konfig: { transport: 'smtp', smtp_host: '127.0.0.1', smtp_port: tot, smtp_user: 'u', smtp_pass: 'p' } });
  await erwarte(await senden(s, formular({ felder: { name: 'Erika Mustermann', kontakt: 'erika@example.com' } })), 502, { ok: false, code: 'mail_failed' });
  await new Promise((r) => setTimeout(r, 100));
  assert.match(s.log(), /anfrage: Versand fehlgeschlagen PHPMailer\\PHPMailer\\Exception/);
  assert.doesNotMatch(s.log(), /Erika|erika@example|Anfrage\nmit/);
});
