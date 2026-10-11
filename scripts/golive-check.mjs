#!/usr/bin/env node
// AP-601: Go-live-Prüfung. Belegt vor jedem Deploy, dass die SEO-Grundregeln stehen.
//
//   npm run check:golive                                   Repo-Wurzel, Ziel demo
//   npm run check:golive -- --root _site --ziel live       Deploy-Stand vor dem Go-live (AP-604)
//   npm run check:golive -- --nur-bericht                  Fehler ausgeben, Exit-Code bleibt 0
//
// Aufbau in Abschnitten: jede Prüffunktion liefert eine Liste von Befunden
// { stufe: 'Fehler' | 'Warnung', regel, datei, detail }. AP-602 und AP-605 hängen
// weitere Abschnitte an ABSCHNITTE an (pruefeLinks, pruefeAlt, pruefeFremdquellen).
// Keine Abhängigkeiten – Regex und JSON.parse reichen für die eigenen, bekannten Seiten.

import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = 'https://rohdich.de';
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Gespiegelt aus SITEMAP_SKIP_DIRS in .github/scripts/build-index.mjs (dort nicht
// exportierbar, das Skript baut beim Import). Ordner mit führendem Punkt werden wie
// dort immer übersprungen. Ändert sich die Liste dort, hier mitziehen.
const SKIP_DIRS = new Set([
  '.git', '.github', '.claude', 'admin', 'node_modules',
  'assets', 'content', 'data', 'docs', 'scripts',
]);

// ---------- Aufruf ----------
function parseArgs(argv) {
  const opts = { root: REPO_ROOT, ziel: 'demo', nurBericht: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--root') opts.root = path.resolve(argv[++i] ?? '');
    else if (a === '--ziel') opts.ziel = argv[++i];
    else if (a === '--nur-bericht') opts.nurBericht = true;
    else throw new Error(`Unbekannter Parameter: ${a}`);
  }
  if (!['demo', 'staging', 'live'].includes(opts.ziel)) {
    throw new Error(`--ziel muss demo, staging oder live sein (ist: ${opts.ziel})`);
  }
  return opts;
}

// ---------- HTML-Werkzeuge ----------
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
function decode(s) {
  return String(s)
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
}

function attrs(tag) {
  const out = {};
  for (const m of tag.matchAll(/([a-zA-Z_:][\w:.-]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
    out[m[1].toLowerCase()] = decode(m[3] ?? m[4] ?? m[5] ?? '');
  }
  return out;
}

// Kommentare entfernen, damit auskommentierte Tags und Notizen nicht mitzählen.
function ohneKommentare(html) {
  return html.replace(/<!--[\s\S]*?-->/g, '');
}

function analysiere(rohHtml) {
  const html = ohneKommentare(rohHtml);
  const tags = (name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map((m) => attrs(m[0]));
  const metas = tags('meta');
  const links = tags('link');
  const meta = (key, wert) => metas.filter((m) => (m[key] || '').toLowerCase() === wert).map((m) => m.content ?? '');
  const robots = meta('name', 'robots').join(',').toLowerCase();
  return {
    titel: [...html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)].map((m) => decode(m[1]).trim().replace(/\s+/g, ' ')),
    description: meta('name', 'description'),
    h1: (html.match(/<h1[\s>]/gi) || []).length,
    canonical: links.filter((l) => (l.rel || '').toLowerCase().split(/\s+/).includes('canonical')).map((l) => l.href),
    og: Object.fromEntries(['title', 'description', 'url', 'image'].map((k) => [k, meta('property', `og:${k}`)])),
    lang: (html.match(/<html\b[^>]*>/i) || [''])[0],
    noindex: robots.includes('noindex'),
    weiterleitung: metas.some((m) => (m['http-equiv'] || '').toLowerCase() === 'refresh'),
    jsonLd: [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]),
  };
}

async function existiert(p) {
  try { await access(p); return true; } catch { return false; }
}

// URL aus der Sitemap → Datei unter --root. Ordnernamen sind prozentkodiert (AP-399).
function urlZuDatei(root, url) {
  const rel = decodeURIComponent(url.slice(SITE.length).replace(/^\//, ''));
  return path.join(root, rel, rel === '' || rel.endsWith('/') ? 'index.html' : '');
}

async function alleIndexSeiten(root) {
  const found = [];
  async function walk(abs, rel) {
    const entries = await readdir(abs, { withFileTypes: true });
    if (entries.some((e) => e.isFile() && e.name === 'index.html')) found.push(rel);
    for (const e of entries) {
      if (!e.isDirectory() || e.name.startsWith('.') || SKIP_DIRS.has(e.name)) continue;
      await walk(path.join(abs, e.name), rel === '' ? e.name : `${rel}/${e.name}`);
    }
  }
  await walk(root, '');
  return found;
}

function enthaeltTyp(knoten, typen) {
  if (Array.isArray(knoten)) return knoten.some((k) => enthaeltTyp(k, typen));
  if (!knoten || typeof knoten !== 'object') return false;
  for (const [k, v] of Object.entries(knoten)) {
    if (k === '@type' && [].concat(v).some((t) => typen.includes(t))) return true;
    if (k === 'aggregateRating' || k === 'review') return true;
    if (enthaeltTyp(v, typen)) return true;
  }
  return false;
}

// ---------- Abschnitt SEO ----------
async function pruefeSeo({ root, ziel }) {
  const befunde = [];
  const fehler = (regel, datei, detail = '') => befunde.push({ stufe: 'Fehler', regel, datei, detail });
  const warnung = (regel, datei, detail = '') => befunde.push({ stufe: 'Warnung', regel, datei, detail });

  const sitemapPfad = path.join(root, 'sitemap.xml');
  if (!(await existiert(sitemapPfad))) {
    fehler('sitemap.xml', 'sitemap.xml', 'fehlt');
    return befunde;
  }
  const urls = [...(await readFile(sitemapPfad, 'utf8')).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decode(m[1]).trim());
  const titelIndex = new Map();
  const descIndex = new Map();
  const sitemapDateien = new Set();

  for (const url of urls) {
    const datei = urlZuDatei(root, url);
    const rel = path.relative(root, datei);
    sitemapDateien.add(rel);
    if (!(await existiert(datei))) { fehler('Sitemap-Seite fehlt', rel, url); continue; }
    const s = analysiere(await readFile(datei, 'utf8'));

    if (s.titel.length !== 1) fehler('genau ein <title>', rel, `${s.titel.length} gefunden`);
    const titel = s.titel[0] ?? '';
    if (titel.length > 65) fehler('Titellänge', rel, `${titel.length} Zeichen: ${titel}`);
    else if (titel.length > 60) warnung('Titellänge', rel, `${titel.length} Zeichen: ${titel}`);
    if (titel) titelIndex.set(titel, [...(titelIndex.get(titel) || []), rel]);

    const desc = s.description[0];
    if (desc === undefined) fehler('Meta-Description', rel, 'fehlt');
    else if (desc.length < 70 || desc.length > 160) fehler('Meta-Description', rel, `${desc.length} Zeichen (70–160)`);
    if (desc) descIndex.set(desc, [...(descIndex.get(desc) || []), rel]);

    if (s.h1 !== 1) fehler('genau eine <h1>', rel, `${s.h1} gefunden`);

    const canonical = s.canonical[0];
    if (!canonical) fehler('rel="canonical"', rel, 'fehlt');
    else if (canonical !== url) fehler('rel="canonical"', rel, `${canonical} ≠ Sitemap ${url}`);

    for (const k of ['title', 'description', 'url', 'image']) {
      if (!s.og[k].length || !s.og[k][0]) fehler(`og:${k}`, rel, 'fehlt');
    }
    if (s.og.url[0] && canonical && s.og.url[0] !== canonical) fehler('og:url', rel, `${s.og.url[0]} ≠ Canonical`);
    const ogImage = s.og.image[0];
    if (ogImage) {
      const lokal = ogImage.startsWith(SITE) ? decodeURIComponent(ogImage.slice(SITE.length)) : null;
      if (!lokal) fehler('og:image', rel, `nicht auf ${SITE}: ${ogImage}`);
      else if (!(await existiert(path.join(root, lokal)))) fehler('og:image', rel, `Datei fehlt: ${lokal}`);
    }

    if (!/\blang\s*=\s*["']de["']/i.test(s.lang)) fehler('<html lang="de">', rel, 'fehlt');

    for (const block of s.jsonLd) {
      let daten;
      try { daten = JSON.parse(block); } catch (e) { fehler('JSON-LD', rel, `nicht parsebar: ${e.message}`); continue; }
      if (enthaeltTyp(daten, ['AggregateRating', 'Review'])) fehler('JSON-LD', rel, 'AggregateRating/Review enthalten');
    }

    if (ziel === 'live' && s.noindex) fehler('noindex (live)', rel, 'Sitemap-Seite trägt noindex');
    if (ziel !== 'live' && !s.noindex) fehler(`noindex (${ziel})`, rel, 'Demo-Sperre fehlt');
  }

  for (const [titel, dateien] of titelIndex) if (dateien.length > 1) fehler('Titel doppelt', dateien.join(', '), titel);
  for (const [desc, dateien] of descIndex) if (dateien.length > 1) fehler('Description doppelt', dateien.join(', '), desc.slice(0, 60) + '…');

  // Verwaiste Seiten: index.html ausserhalb der Sitemap ohne noindex/Weiterleitung.
  for (const ordner of await alleIndexSeiten(root)) {
    const rel = path.join(ordner, 'index.html');
    if (sitemapDateien.has(rel)) continue;
    const s = analysiere(await readFile(path.join(root, rel), 'utf8'));
    if (!s.noindex && !s.weiterleitung) fehler('verwaiste Seite', rel, 'nicht in sitemap.xml, ohne noindex und ohne Weiterleitung');
  }

  // Dauerhaft noindex – gilt in jedem Ziel, im Live-Ziel ist es die eigentliche Probe.
  for (const rel of ['admin/index.html', '404.html']) {
    const p = path.join(root, rel);
    if (!(await existiert(p))) continue;
    if (!analysiere(await readFile(p, 'utf8')).noindex) fehler('noindex dauerhaft', rel, 'muss noindex tragen');
  }

  if (ziel === 'live') {
    const robotsPfad = path.join(root, 'robots.txt');
    if (!(await existiert(robotsPfad))) fehler('robots.txt', 'robots.txt', 'fehlt');
    else {
      const zeilen = (await readFile(robotsPfad, 'utf8')).split(/\r?\n/).map((z) => z.replace(/#.*/, '').trim());
      if (!zeilen.some((z) => /^sitemap:\s*https:\/\/rohdich\.de\/sitemap\.xml$/i.test(z))) {
        fehler('robots.txt', 'robots.txt', 'Zeile "Sitemap: https://rohdich.de/sitemap.xml" fehlt');
      }
      if (zeilen.some((z) => /^disallow:\s*\/$/i.test(z))) fehler('robots.txt', 'robots.txt', '"Disallow: /" sperrt die ganze Seite');
    }
  }

  return befunde;
}

// ---------- Ausgabe ----------
const ABSCHNITTE = [
  ['SEO', pruefeSeo],
  // AP-602/605: ['Links', pruefeLinks], ['Alt-Texte', pruefeAlt], ['Fremdquellen', pruefeFremdquellen]
];

function tabelle(befunde) {
  const zeilen = [['Stufe', 'Regel', 'Datei', 'Detail'], ...befunde.map((b) => [b.stufe, b.regel, b.datei, b.detail])];
  const breiten = [0, 1, 2].map((i) => Math.max(...zeilen.map((z) => z[i].length)));
  return zeilen.map((z) => z.map((c, i) => (i < 3 ? c.padEnd(breiten[i]) : c)).join('  ')).join('\n');
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  console.log(`Go-live-Prüfung · root ${path.relative(process.cwd(), opts.root) || '.'} · ziel ${opts.ziel}\n`);
  let fehlerGesamt = 0;
  let warnungenGesamt = 0;
  for (const [name, pruefe] of ABSCHNITTE) {
    const befunde = await pruefe(opts);
    const f = befunde.filter((b) => b.stufe === 'Fehler').length;
    fehlerGesamt += f;
    warnungenGesamt += befunde.length - f;
    console.log(`## ${name}: ${f} Fehler, ${befunde.length - f} Warnungen`);
    if (befunde.length) console.log(tabelle(befunde));
    console.log('');
  }
  console.log(`Gesamt: ${fehlerGesamt} Fehler, ${warnungenGesamt} Warnungen.`);
  if (fehlerGesamt && !opts.nurBericht) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e.message);
  process.exitCode = 2;
});
