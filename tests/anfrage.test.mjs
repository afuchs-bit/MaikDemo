import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import nodemailer from 'nodemailer';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const script = await readFile(new URL('../assets/js/anfrage.js', import.meta.url), 'utf8');

// Kein Browser und keine Netzwerkzugriffe: echte Formular-Events im DOM,
// Bildcodec und Versand werden an ihren Systemgrenzen ersetzt.
function formular(t, options = {}) {
  const dom = new JSDOM(html, { runScripts: 'outside-only', url: 'http://127.0.0.1:8080/' });
  const w = dom.window;
  t.after(() => w.close());
  const urls = new Map();
  const revoked = [];
  const pending = [];
  const requests = [];
  let number = 0;
  w.URL.createObjectURL = (file) => { const url = 'blob:test/' + ++number; urls.set(url, file); return url; };
  w.URL.revokeObjectURL = (url) => { revoked.push(url); urls.delete(url); };
  w.Image = class {
    naturalWidth = 2400;
    naturalHeight = 1800;
    set src(url) {
      const file = urls.get(url);
      const load = () => file.name.startsWith('broken') ? this.onerror() : this.onload();
      options.pause ? pending.push(load) : queueMicrotask(load);
    }
  };
  w.HTMLCanvasElement.prototype.getContext = () => ({ drawImage() {} });
  w.HTMLCanvasElement.prototype.toBlob = function (callback, type) {
    queueMicrotask(() => callback(new w.Blob(['new image pixels'], { type })));
  };
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.fetch = async (url, init) => {
    requests.push({ url, ...init });
    return options.response ? options.response() : { ok: true, json: async () => ({ ok: true }) };
  };
  w.eval(script);
  const form = w.document.querySelector('[data-anf-form]');
  form.elements.namedItem('name').value = 'Testperson';
  form.elements.namedItem('kontakt').value = 'test@example.com';
  form.elements.namedItem('nachricht').value = 'Bitte gestalten Sie meinen Vorgarten.';
  const input = form.querySelector('[data-anf-fotos]');
  const consent = form.querySelector('[name="foto_freigabe"]');
  const button = form.querySelector('[data-anf-senden]');
  const status = form.querySelector('[data-anf-status]');
  const file = (name) => new w.File(['original EXIF GPS data'], name, { type: 'image/jpeg', lastModified: 42 });
  const select = (files) => {
    Object.defineProperty(input, 'files', { configurable: true, value: files });
    input.dispatchEvent(new w.Event('change', { bubbles: true }));
  };
  const submit = () => form.dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
  const pictures = () => [...form.querySelectorAll('.anf__foto-vorschau img')];
  const remove = (i) => form.querySelectorAll('.anf__foto-entfernen')[i].click();
  return { w, form, input, consent, button, status, file, select, submit, pictures, remove, requests, urls, revoked, pending };
}

async function until(predicate) {
  for (let i = 0; i < 40; i++) {
    if (predicate()) return;
    await new Promise((resolve) => setImmediate(resolve));
  }
  assert.ok(predicate(), 'Erwarteter Formularzustand nicht erreicht');
}

test('Fotos nacheinander und gesammelt hinzufügen; Abbrechen und Duplikate erhalten die Auswahl', async (t) => {
  const f = formular(t);
  const first = f.file('garten.jpg');
  f.select([first]);
  await until(() => f.pictures().length === 1 && !f.button.disabled);
  const firstURL = f.pictures()[0].src;
  f.select([f.file('terrasse.jpg'), f.file('baum.jpg')]);
  await until(() => f.pictures().length === 3 && !f.button.disabled);
  assert.equal(f.pictures()[0].src, firstURL);
  f.select([]);
  f.select([first]);
  assert.equal(f.pictures().length, 3);
  assert.match(f.form.querySelector('.anf__foto-wort').textContent, /Weitere Fotos/);
  assert.equal(f.input.getAttribute('aria-invalid'), 'false');
});

test('Einzelnes Entfernen gibt Speicher frei, setzt Fokus und erlaubt erneutes Hinzufügen', async (t) => {
  const f = formular(t);
  const files = ['a.jpg', 'b.jpg', 'c.jpg'].map(f.file);
  f.select(files);
  await until(() => f.pictures().length === 3 && !f.button.disabled);
  const removedURL = f.pictures()[1].src;
  f.consent.checked = true;
  f.remove(1);
  assert.equal(f.pictures().length, 2);
  assert.ok(f.revoked.includes(removedURL));
  assert.equal(f.w.document.activeElement.getAttribute('aria-label'), 'Foto 2 entfernen');
  assert.equal(f.consent.checked, true);
  f.select([files[1]]);
  await until(() => f.pictures().length === 3 && !f.button.disabled);
  f.remove(2); f.remove(1); f.remove(0);
  assert.equal(f.consent.checked, false);
  assert.equal(f.form.querySelector('[data-anf-foto-freigabe]').hidden, true);
  assert.equal(f.form.querySelector('.anf__foto-vorschauen').hidden, true);
  assert.equal(f.w.document.activeElement, f.input);
  assert.equal(f.urls.size, 0);
});

test('Sechs Fotos sind möglich; Überschreitung und unlesbare Dateien löschen keine bestehenden Fotos', async (t) => {
  const f = formular(t);
  f.select([f.file('a.jpg')]);
  await until(() => f.pictures().length === 1 && !f.button.disabled);
  f.select([f.file('broken.jpg'), f.file('b.jpg')]);
  await until(() => f.pictures().length === 2 && !f.button.disabled);
  assert.match(f.form.querySelector('[data-anf-foto-auswahl]').textContent, /nicht gelesen/);
  f.select(['c.jpg', 'd.jpg', 'e.jpg', 'f.jpg'].map(f.file));
  await until(() => f.pictures().length === 6 && !f.button.disabled);
  f.select([f.file('g.jpg')]);
  assert.equal(f.pictures().length, 6);
  assert.equal(f.input.getAttribute('aria-invalid'), 'true');
  f.remove(0);
  f.select([f.file('g.jpg')]);
  await until(() => f.pictures().length === 6 && !f.button.disabled);
});

test('Während der Bildaufbereitung wird nichts gesendet; Reset verhindert verspätete Vorschauen', async (t) => {
  const f = formular(t, { pause: true });
  f.select([f.file('a.jpg')]);
  assert.equal(f.button.disabled, true);
  assert.equal(f.input.disabled, true);
  f.submit();
  assert.equal(f.requests.length, 0);
  f.form.reset();
  f.pending.shift()();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(f.pictures().length, 0);
  assert.equal(f.urls.size, 0);
  assert.equal(f.button.disabled, false);
});

test('Nur verbleibende, aufbereitete Fotos werden gesendet; Rechtebestätigung ist erforderlich', async (t) => {
  const f = formular(t);
  f.select(['a.jpg', 'b.jpg', 'c.jpg'].map(f.file));
  await until(() => f.pictures().length === 3 && !f.button.disabled);
  f.remove(1);
  f.submit();
  assert.equal(f.requests.length, 0);
  assert.equal(f.w.document.activeElement, f.consent);
  f.consent.checked = true;
  f.submit();
  await until(() => f.status.getAttribute('data-art') === 'erfolg');
  const sent = f.requests[0].body.getAll('fotos');
  assert.deepEqual(sent.map((file) => file.name), ['foto-1.jpg', 'foto-2.jpg']);
  assert.ok(sent.every((file) => file.type === 'image/jpeg' && file.size !== f.file('a.jpg').size));
  assert.equal(f.requests[0].url, '/api/anfrage');
  assert.equal(f.pictures().length, 0);
  assert.equal(f.urls.size, 0);
});

test('Versandfehler erhalten Texte und Fotos und nennen eine nötige Mailaktivierung', async (t) => {
  const f = formular(t, { response: async () => ({ ok: false, json: async () => ({ ok: false, code: 'mail_activation_required' }) }) });
  f.form.querySelector('[name="nachricht"]').value = 'Meine Terrasse';
  f.select([f.file('a.jpg')]);
  await until(() => f.pictures().length === 1 && !f.button.disabled);
  f.consent.checked = true;
  f.submit();
  await until(() => !f.button.disabled && f.requests.length === 1);
  assert.equal(f.form.querySelector('[name="nachricht"]').value, 'Meine Terrasse');
  assert.equal(f.pictures().length, 1);
  assert.match(f.status.textContent, /Aktivierungsmail/);
  assert.equal(f.status.getAttribute('data-art'), 'hinweis');
});

test('Doppelte Submit-Events und Entfernen während eines laufenden Versands verändern die Anfrage nicht', async (t) => {
  let finish;
  const f = formular(t, { response: () => new Promise((resolve) => { finish = resolve; }) });
  f.select([f.file('a.jpg')]);
  await until(() => f.pictures().length === 1 && !f.button.disabled);
  f.consent.checked = true;
  f.submit(); f.submit(); f.remove(0);
  assert.equal(f.requests.length, 1);
  assert.equal(f.pictures().length, 1);
  finish({ ok: true, json: async () => ({ ok: true }) });
  await until(() => f.status.getAttribute('data-art') === 'erfolg');
});

test('Leeres Formular benennt alle fehlenden Pflichtangaben, markiert Felder und sendet nichts', (t) => {
  const f = formular(t);
  for (const name of ['name', 'kontakt', 'nachricht']) f.form.elements.namedItem(name).value = '  ';
  f.submit();
  assert.equal(f.requests.length, 0);
  assert.equal(f.status.getAttribute('data-art'), 'fehler');
  assert.equal(f.status.getAttribute('role'), 'alert');
  assert.equal(f.status.querySelectorAll('.anf__status-liste a').length, 3);
  assert.match(f.status.textContent, /Ihren Namen/);
  assert.match(f.status.textContent, /Telefonnummer oder E-Mail-Adresse/);
  assert.match(f.status.textContent, /beschreiben Sie kurz Ihr Vorhaben/);
  assert.doesNotMatch(f.status.textContent, /konnte nicht gesendet|kontaktieren Sie uns telefonisch/);
  assert.equal(f.w.document.activeElement, f.form.elements.namedItem('name'));
  for (const name of ['name', 'kontakt', 'nachricht']) {
    const input = f.form.elements.namedItem(name);
    assert.equal(input.required, true);
    assert.equal(input.getAttribute('aria-invalid'), 'true');
    assert.equal(f.w.document.getElementById(input.getAttribute('aria-describedby')).hidden, false);
  }
});

test('Nur Fotos reichen nicht aus; fehlende Angaben werden angezeigt und die Vorschauen bleiben erhalten', async (t) => {
  const f = formular(t);
  for (const name of ['name', 'kontakt', 'nachricht']) f.form.elements.namedItem(name).value = '';
  f.select([f.file('garten.jpg')]);
  await until(() => f.pictures().length === 1 && !f.button.disabled);
  f.consent.checked = true;
  f.submit();
  assert.equal(f.requests.length, 0);
  assert.equal(f.pictures().length, 1);
  assert.equal(f.status.querySelectorAll('.anf__status-liste a').length, 3);
  assert.match(f.form.querySelector('#anf-nachricht-fehler').textContent, /Fotos ergänzen/);
  f.status.querySelector('a[href="#anf-kontakt"]').click();
  assert.equal(f.w.document.activeElement, f.form.elements.namedItem('kontakt'));
});

test('Korrigierte Felder verlieren Fehler und Zusammenfassung sofort; anschließend funktioniert der Versand', async (t) => {
  const f = formular(t);
  for (const name of ['name', 'kontakt', 'nachricht']) f.form.elements.namedItem(name).value = '';
  f.submit();
  for (const [name, value] of [['name', 'Maria'], ['kontakt', '+49 (171) / 1234567'], ['nachricht', 'Ich möchte meine Terrasse erneuern.']]) {
    const input = f.form.elements.namedItem(name);
    input.value = value;
    input.dispatchEvent(new f.w.Event('input', { bubbles: true }));
    assert.equal(input.hasAttribute('aria-invalid'), false);
    assert.equal(f.form.querySelector('#' + input.id + '-fehler').hidden, true);
  }
  assert.equal(f.status.textContent, '');
  f.submit();
  await until(() => f.status.getAttribute('data-art') === 'erfolg');
  assert.equal(f.requests.length, 1);
});

test('Ungültiger Rückkontakt wird konkret benannt, ohne Namen und Nachricht als falsch zu markieren', (t) => {
  const f = formular(t);
  for (const invalid of ['kunde.gmail.com', 'abc', '123', '++++123456', 'kunde@']) {
    f.form.elements.namedItem('kontakt').value = invalid;
    f.submit();
    assert.equal(f.status.querySelectorAll('.anf__status-liste a').length, 1);
    assert.match(f.status.textContent, /gültige Telefonnummer oder E-Mail-Adresse/);
    assert.equal(f.form.elements.namedItem('name').hasAttribute('aria-invalid'), false);
    assert.equal(f.form.elements.namedItem('nachricht').hasAttribute('aria-invalid'), false);
  }
  assert.equal(f.requests.length, 0);
});

test('Serverseitige Feldfehler landen am passenden Feld und erhalten Texte und Fotos', async (t) => {
  const f = formular(t, { response: async () => ({ ok: false, status: 422, json: async () => ({ ok: false, code: 'validation', fields: { kontakt: 'Bitte korrigieren Sie Ihre E-Mail-Adresse.' } }) }) });
  f.select([f.file('garten.jpg')]);
  await until(() => f.pictures().length === 1 && !f.button.disabled);
  f.consent.checked = true;
  f.submit();
  await until(() => f.status.getAttribute('data-art') === 'fehler' && !f.button.disabled);
  assert.match(f.form.querySelector('#anf-kontakt-fehler').textContent, /korrigieren Sie Ihre E-Mail-Adresse/);
  assert.equal(f.pictures().length, 1);
  assert.equal(f.form.elements.namedItem('name').value, 'Testperson');
});

test('Fotofreigabe wird gezielt erklärt und der Hinweis verschwindet nach Entfernen des letzten Fotos', async (t) => {
  const f = formular(t);
  f.select([f.file('garten.jpg')]);
  await until(() => f.pictures().length === 1 && !f.button.disabled);
  f.submit();
  assert.match(f.status.textContent, /Fotos weitergeben dürfen/);
  assert.equal(f.status.querySelectorAll('.anf__status-liste a').length, 1);
  f.remove(0);
  assert.equal(f.status.textContent, '');
  assert.equal(f.consent.hasAttribute('aria-invalid'), false);
});

test('Netzwerkfehler und Maildienstfehler werden als technische Probleme erklärt', async (t) => {
  const disconnected = formular(t, { response: async () => { throw new TypeError('Failed to fetch'); } });
  disconnected.submit();
  await until(() => disconnected.status.getAttribute('data-art') === 'fehler');
  assert.match(disconnected.status.textContent, /Verbindung|Internetverbindung/);
  assert.equal(disconnected.form.elements.namedItem('kontakt').hasAttribute('aria-invalid'), false);
  const unavailable = formular(t, { response: async () => ({ ok: false, status: 502, json: async () => ({ ok: false, code: 'mail_failed' }) }) });
  unavailable.submit();
  await until(() => unavailable.status.getAttribute('data-art') === 'fehler');
  assert.match(unavailable.status.textContent, /Angaben sind vollständig/);
  assert.match(unavailable.status.textContent, /Versanddienst/);
  assert.doesNotMatch(unavailable.status.textContent, /kontaktieren Sie uns telefonisch/);
});

function konfiguration(t, values) {
  for (const [key, value] of Object.entries(values)) {
    const before = process.env[key];
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
    t.after(() => { if (before === undefined) delete process.env[key]; else process.env[key] = before; });
  }
}

async function handler() { return (await import('../api/anfrage.js?test=' + Math.random())).default; }
function request(count = 0, consent = true) {
  const data = new FormData();
  data.set('name', 'Testperson'); data.set('kontakt', 'test@example.com');
  data.set('nachricht', 'Anfrage\nmit zwei Zeilen'); data.set('leistung', 'Baumpflege');
  data.set('geladen_um', String(Date.now() - 5000));
  if (consent) data.set('foto_freigabe', '1');
  for (let i = 0; i < count; i++) data.append('fotos', new Blob([new Uint8Array([255,216,255,0,1,2,3,4,5,6,7,8])], { type: 'image/jpeg' }), 'original.jpg');
  return new Request('http://127.0.0.1:8080/api/anfrage', { method: 'POST', body: data });
}

test('Mailhandler übergibt sechs geprüfte Fotoanhänge und Antwortadresse an SMTP', async (t) => {
  konfiguration(t, { MAIL_TRANSPORT: 'smtp', EMPFAENGER: 'recipient@example.com', SMTP_HOST: 'smtp.example.com', SMTP_USER: 'sender@example.com' });
  const original = nodemailer.createTransport;
  let mail;
  nodemailer.createTransport = () => ({ sendMail: async (value) => { mail = value; } });
  t.after(() => { nodemailer.createTransport = original; });
  const response = await (await handler()).fetch(request(6));
  assert.equal(response.status, 200);
  assert.equal(mail.to, 'recipient@example.com');
  assert.equal(mail.replyTo, 'test@example.com');
  assert.equal(mail.attachments.length, 6);
  assert.deepEqual(mail.attachments.map((file) => file.filename), Array.from({ length: 6 }, (_, i) => `foto-${i + 1}.jpg`));
  assert.match(mail.text, /Baumpflege/);
});

test('Mailhandler lehnt zu viele Anhänge, fehlende Fotorechte und falsche Bildbytes ab', async () => {
  const api = await handler();
  assert.equal((await api.fetch(request(7))).status, 422);
  assert.equal((await api.fetch(request(1, false))).status, 422);
  const bad = await request().formData();
  bad.append('fotos', new Blob(['not an image at all'], { type: 'image/jpeg' }), 'bild.jpg');
  assert.equal((await api.fetch(new Request('http://localhost/api/anfrage', { method: 'POST', body: bad }))).status, 415);
});

test('Mailhandler nennt fehlende Pflichtfelder auch bei einer Anfrage mit Fotos', async () => {
  const data = await request(1).formData();
  for (const name of ['name', 'kontakt', 'nachricht']) data.set(name, '  ');
  const response = await (await handler()).fetch(new Request('http://localhost/api/anfrage', { method: 'POST', body: data }));
  assert.equal(response.status, 422);
  const body = await response.json();
  assert.equal(body.code, 'validation');
  assert.deepEqual(Object.keys(body.fields), ['name', 'kontakt', 'nachricht']);
});

test('Mailhandler gibt konkrete Fehler für falschen Rückkontakt und zu lange Beschreibung zurück', async () => {
  const data = await request().formData();
  data.set('kontakt', 'kunde.gmail.com');
  data.set('nachricht', 'a'.repeat(4001));
  const response = await (await handler()).fetch(new Request('http://localhost/api/anfrage', { method: 'POST', body: data }));
  assert.equal(response.status, 422);
  const body = await response.json();
  assert.match(body.fields.kontakt, /gültige Telefonnummer oder E-Mail-Adresse/);
  assert.match(body.fields.nachricht, /4.000 Zeichen/);
});

test('Zu schnelles Absenden und abgelaufene Formulare erzeugen keinen falschen Erfolg', async () => {
  const api = await handler();
  for (const [timestamp, code] of [[Date.now(), 'form_too_fast'], [Date.now() - 2 * 24 * 3600000, 'form_expired']]) {
    const data = await request().formData();
    data.set('geladen_um', String(timestamp));
    const response = await api.fetch(new Request('http://localhost/api/anfrage', { method: 'POST', body: data }));
    assert.equal(response.status, 422);
    const body = await response.json();
    assert.equal(body.ok, false);
    assert.equal(body.code, code);
  }
});

test('Fehlende Mailkonfiguration meldet keinen Erfolg', async (t) => {
  konfiguration(t, { EMPFAENGER: undefined, SMTP_HOST: undefined, MAIL_TRANSPORT: undefined });
  const response = await (await handler()).fetch(request());
  assert.equal(response.status, 503);
  assert.equal((await response.json()).code, 'mail_unconfigured');
});

test('Testdienst erhält multipart-Anhänge über den nativen Endpunkt; nur bestätigte Übergabe gilt als Erfolg', async (t) => {
  konfiguration(t, { MAIL_TRANSPORT: 'formsubmit', EMPFAENGER: 'recipient@example.com', FORMULAR_URL: 'http://127.0.0.1:8080/' });
  const previous = globalThis.fetch;
  t.after(() => { globalThis.fetch = previous; });
  let delivery;
  globalThis.fetch = async (url, init) => {
    delivery = { url, ...init };
    return new Response(null, { status: 302, headers: { Location: 'http://127.0.0.1:8080/?anfrage=gesendet' } });
  };
  const api = await handler();
  assert.equal((await api.fetch(request(2))).status, 200);
  assert.equal(delivery.url, 'https://formsubmit.co/recipient%40example.com');
  assert.equal(delivery.body.getAll('attachment1').length, 1);
  assert.equal(delivery.body.get('attachment2').name, 'foto-2.jpg');
  assert.equal(delivery.body.get('_replyto'), 'test@example.com');
  assert.equal(delivery.redirect, 'manual');
  globalThis.fetch = async () => new Response('<h1>Check your email</h1>');
  const activation = await api.fetch(request());
  assert.equal(activation.status, 409);
  assert.equal((await activation.json()).code, 'mail_activation_required');
  globalThis.fetch = async () => new Response('Unexpected page');
  assert.equal((await api.fetch(request())).status, 502);
});
