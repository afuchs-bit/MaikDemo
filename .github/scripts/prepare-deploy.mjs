#!/usr/bin/env node
// AP-604: stellt aus dem Repo genau die auszuliefernden Dateien zusammen.
//
//   node .github/scripts/prepare-deploy.mjs --ziel staging|live --out _site
//
// Allowlist: Was hier nicht genannt ist, geht nicht auf den Server. Quelle sind
// die von git verfolgten Dateien (im CI-Checkout alles; lokal bleiben ungetrackte
// Dateien wie .claude/ oder node_modules/ automatisch draussen).
//
// Ziel staging: Demo-Sperre bleibt, robots.txt sperrt alles, .htaccess mit
//   Passwortschutz. Der Pfad zur .htpasswd kommt aus HTPASSWD_PFAD (GitHub-Secret,
//   nie im Repo) – fehlt er, bricht das Skript ab, statt einen Apache-500 zu bauen.
// Ziel live: noindex der Sitemap-Seiten und HTML-Kommentare (E4) fallen nur in der
//   Kopie weg, die Quellen bleiben unveraendert. robots.txt = robots-live.txt.
//
// In beiden Zielen werden die CSP-Hashes der Inline-Skripte aus den ausgelieferten
// Seiten berechnet und in die .htaccess eingesetzt. Wer ein Inline-Skript aendert,
// muss die CSP damit nicht von Hand nachziehen.

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { copyFile, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SITE = 'https://rohdich.de';

// Seiten, die in jedem Ziel noindex behalten.
const DAUERHAFT_NOINDEX = new Set(['admin/index.html', '404.html', 'gewerbekunden/index.html']);
const HTML_AUSGESCHLOSSEN = /^(docs|\.github|tests|scripts|content|server|node_modules|\.claude)\//;
const NUR_DIESE = new Set([
  'data/projekte-index.json', 'data/galerie-teaser.json',  // Laufzeit (Galerie, Teaser)
  'content/taxonomie.json',                                // Laufzeit (Galerie-Filter)
  'admin/index.html', 'admin/config.yml',                  // CMS
  'api/anfrage.php', 'api/.htaccess', 'api/lib/.htaccess', // Formular (AP-603)
  'api/lib/PHPMailer/src/PHPMailer.php', 'api/lib/PHPMailer/src/SMTP.php',
  'api/lib/PHPMailer/src/Exception.php', 'api/lib/PHPMailer/LICENSE',
  'sitemap.xml',
]);

// --- reine Funktionen (getestet in tests/prepare-deploy.test.mjs) -------------

export function wirdAusgeliefert(datei) {
  if (NUR_DIESE.has(datei)) return true;
  if (datei.endsWith('.html')) return !datei.endsWith('.saved.html') && !HTML_AUSGESCHLOSSEN.test(datei);
  if (datei.startsWith('assets/')) return !datei.endsWith('.md') && !datei.startsWith('assets/img/_src/');
  return false;
}

// Entfernt die Demo-Sperre (genau diese Zeile) samt direkt davorstehendem
// AP-01-Kommentar. Liefert den neuen Text und die Anzahl entfernter Sperren.
export function demoSperreEntfernen(html) {
  const zeilen = html.split('\n');
  const out = [];
  let entfernt = 0;
  for (const zeile of zeilen) {
    if (/^\s*<meta name="robots" content="noindex,nofollow"\s*\/?>\s*$/.test(zeile)) {
      entfernt++;
      if (out.length && /^\s*<!-- AP-01: Demo-Sperre[^]*-->\s*$/.test(out[out.length - 1])) out.pop();
      continue;
    }
    out.push(zeile);
  }
  return { html: out.join('\n'), entfernt };
}

// E4: HTML-Kommentare entfernen, ausser in script, style, pre und textarea (dort
// sind sie Inhalt) und bedingten Kommentaren. Umgebender Leerraum bleibt stehen,
// damit sich der Textinhalt der Seite nicht aendert.
export function kommentareEntfernen(html) {
  let out = '';
  let i = 0;
  let anzahl = 0;
  const roh = /<(script|style|pre|textarea)\b[^>]*>/gi;
  while (i < html.length) {
    const kommentar = html.indexOf('<!--', i);
    roh.lastIndex = i;
    const block = roh.exec(html);
    if (kommentar === -1 && !block) { out += html.slice(i); break; }
    if (block && (kommentar === -1 || block.index < kommentar)) {
      const ende = html.toLowerCase().indexOf(`</${block[1].toLowerCase()}`, roh.lastIndex);
      const bis = ende === -1 ? html.length : ende;
      out += html.slice(i, bis);
      i = bis;
      if (ende !== -1) { out += html.slice(bis, bis + 2); i = bis + 2; }
      continue;
    }
    out += html.slice(i, kommentar);
    const schluss = html.indexOf('-->', kommentar + 4);
    const stueck = schluss === -1 ? html.slice(kommentar) : html.slice(kommentar, schluss + 3);
    if (stueck.startsWith('<!--[if') || stueck.startsWith('<!--<![endif]')) out += stueck;
    else anzahl++;
    i = schluss === -1 ? html.length : schluss + 3;
  }
  return { html: out, anzahl };
}

// sha256 der Inline-Skripte (ohne src, ohne Datenbloecke wie JSON-LD) fuer die CSP.
export function inlineSkriptHashes(html) {
  const hashes = [];
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attribute = m[1];
    if (/\bsrc\s*=/i.test(attribute)) continue;
    const typ = (attribute.match(/\btype\s*=\s*["']?([^"'\s>]+)/i) || [])[1];
    if (typ && !/^(text\/javascript|module|application\/javascript)$/i.test(typ)) continue;
    if (!m[2].trim()) continue;
    hashes.push(`'sha256-${createHash('sha256').update(m[2], 'utf8').digest('base64')}'`);
  }
  return hashes;
}

// --- Ablauf -----------------------------------------------------------------

function args(argv) {
  const o = { ziel: null, out: '_site' };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--ziel') o.ziel = argv[++i];
    else if (argv[i] === '--out') o.out = argv[++i];
    else throw new Error(`Unbekannter Parameter: ${argv[i]}`);
  }
  if (!['staging', 'live'].includes(o.ziel)) throw new Error('--ziel staging|live fehlt');
  return o;
}

async function main() {
  const { ziel, out } = args(process.argv.slice(2));
  const ausgabe = path.resolve(ROOT, out);
  if (ausgabe === ROOT || !ausgabe.startsWith(ROOT + path.sep)) throw new Error(`--out muss ein Unterordner des Repos sein: ${out}`);

  const htpasswd = (process.env.HTPASSWD_PFAD || '').trim();
  if (ziel === 'staging' && !/^\/[^\s"']+$/.test(htpasswd)) {
    throw new Error('HTPASSWD_PFAD fehlt oder ist kein absoluter Pfad (GitHub-Secret HETZNER_HTPASSWD_PFAD).');
  }

  await rm(ausgabe, { recursive: true, force: true });
  const alle = execFileSync('git', ['-c', 'core.quotePath=false', 'ls-files', '-z'], { cwd: ROOT, encoding: 'utf8' }).split('\0').filter(Boolean);
  const dateien = alle.filter(wirdAusgeliefert);

  let sperren = 0;
  let kommentare = 0;
  const hashes = new Set();
  for (const rel of dateien) {
    const quelle = path.join(ROOT, rel);
    const ziel_ = path.join(ausgabe, rel);
    await mkdir(path.dirname(ziel_), { recursive: true });
    if (!rel.endsWith('.html')) { await copyFile(quelle, ziel_); continue; }
    let html = await readFile(quelle, 'utf8');
    if (ziel === 'live' && !DAUERHAFT_NOINDEX.has(rel)) {
      const r = demoSperreEntfernen(html);
      html = r.html;
      sperren += r.entfernt;
    }
    if (ziel === 'live') {
      const r = kommentareEntfernen(html);
      html = r.html;
      kommentare += r.anzahl;
    }
    if (!rel.startsWith('admin/')) inlineSkriptHashes(html).forEach((h) => hashes.add(h));
    await writeFile(ziel_, html);
  }

  // Erzeugte Dateien: robots.txt, .htaccess, admin/.htaccess
  await copyFile(path.join(ROOT, ziel === 'live' ? 'robots-live.txt' : 'robots.txt'), path.join(ausgabe, 'robots.txt'));
  let htaccess = await readFile(path.join(ROOT, 'server', `htaccess-${ziel}`), 'utf8');
  if (!htaccess.includes('__CSP_SCRIPT_HASHES__')) throw new Error(`server/htaccess-${ziel}: Platzhalter __CSP_SCRIPT_HASHES__ fehlt`);
  htaccess = htaccess.replace('__CSP_SCRIPT_HASHES__', [...hashes].sort().join(' '));
  if (ziel === 'staging') htaccess = htaccess.replace('__HTPASSWD_PFAD__', htpasswd);
  if (/__[A-Z_]+__/.test(htaccess)) throw new Error('.htaccess enthaelt noch einen Platzhalter');
  await writeFile(path.join(ausgabe, '.htaccess'), htaccess);
  await copyFile(path.join(ROOT, 'server', 'htaccess-admin'), path.join(ausgabe, 'admin', '.htaccess'));

  // Kontrolle: jede Sitemap-URL braucht eine Datei.
  const sitemap = await readFile(path.join(ROOT, 'sitemap.xml'), 'utf8');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const fehlend = [];
  for (const url of urls) {
    const rel = decodeURIComponent(url.slice(SITE.length).replace(/^\//, ''));
    try { await stat(path.join(ausgabe, rel, 'index.html')); } catch { fehlend.push(url); }
  }

  // Bericht
  const jeOrdner = new Map();
  for (const rel of [...dateien, 'robots.txt', '.htaccess', 'admin/.htaccess']) {
    const ordner = rel.includes('/') ? rel.split('/')[0] + '/' : '(Wurzel)';
    const groesse = (await stat(path.join(ausgabe, rel))).size;
    const [n, b] = jeOrdner.get(ordner) || [0, 0];
    jeOrdner.set(ordner, [n + 1, b + groesse]);
  }
  const oben = (f) => (f.includes('/') ? f.split('/')[0] + '/' : f);
  const geliefert = new Set(dateien.map(oben));
  const draussen = [...new Set(alle.map(oben))].filter((o) => !geliefert.has(o)).sort();
  console.log(`Auslieferung ${ziel} → ${path.relative(ROOT, ausgabe)}/`);
  for (const [o, [n, b]] of [...jeOrdner].sort()) console.log(`  ${o.padEnd(16)} ${String(n).padStart(5)} Dateien  ${(b / 1048576).toFixed(1).padStart(6)} MB`);
  console.log(`Nicht ausgeliefert: ${draussen.join(', ')}`);
  console.log(`CSP-Hashes der Inline-Skripte: ${hashes.size}`);
  if (ziel === 'live') console.log(`Demo-Sperre entfernt: ${sperren} von ${urls.length} Sitemap-Seiten · HTML-Kommentare entfernt: ${kommentare}`);
  if (fehlend.length) {
    console.error(`FEHLER: ${fehlend.length} Sitemap-URL(s) ohne Datei:\n  ${fehlend.join('\n  ')}`);
    process.exit(1);
  }
  if (ziel === 'live' && sperren !== urls.length) {
    console.error(`FEHLER: ${sperren} Demo-Sperren entfernt, erwartet ${urls.length} (Sitemap-Seiten).`);
    process.exit(1);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => { console.error(e.message); process.exit(1); });
}
