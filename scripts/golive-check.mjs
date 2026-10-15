#!/usr/bin/env node
// AP-601: Go-live-Prüfung. Belegt vor jedem Deploy, dass die SEO-Grundregeln stehen.
//
//   npm run check:golive                                   Repo-Wurzel, Ziel demo
//   npm run check:golive -- --root _site --ziel live       Deploy-Stand vor dem Go-live (AP-604)
//   npm run check:golive -- --nur-bericht                  Fehler ausgeben, Exit-Code bleibt 0
//   npm run check:golive -- --extern                       externe Links zusätzlich per HEAD (AP-602)
//
// Der Abschnitt Alt-Texte braucht jsdom (devDependency) – vorher `npm ci`.
//
// Aufbau in Abschnitten: jede Prüffunktion liefert eine Liste von Befunden
// { stufe: 'Fehler' | 'Warnung', regel, datei, detail }. AP-602 und AP-605 hängen
// weitere Abschnitte an ABSCHNITTE an (pruefeLinks, pruefeAlt, pruefeFremdquellen).
// Keine Abhängigkeiten – Regex und JSON.parse reichen für die eigenen, bekannten Seiten.

import { readFile, readdir, access, stat } from 'node:fs/promises';
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
  const opts = { root: REPO_ROOT, ziel: 'demo', nurBericht: false, extern: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--root') opts.root = path.resolve(argv[++i] ?? '');
    else if (a === '--ziel') opts.ziel = argv[++i];
    else if (a === '--nur-bericht') opts.nurBericht = true;
    else if (a === '--extern') opts.extern = true;
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

// ---------- Auslieferbare HTML-Seiten (AP-602) ----------
// Alle .html unter --root ausser den Sitemap-Skip-Ordnern und den abgelegten
// Seitenständen (*.saved.html), die nur als Sicherung im Repo liegen.
async function alleHtmlSeiten(root) {
  const found = [];
  async function walk(abs, rel) {
    for (const e of await readdir(abs, { withFileTypes: true })) {
      const childRel = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) {
        if (!e.name.startsWith('.') && !SKIP_DIRS.has(e.name)) await walk(path.join(abs, e.name), childRel);
      } else if (e.name.endsWith('.html') && !e.name.endsWith('.saved.html')) {
        found.push(childRel);
      }
    }
  }
  await walk(root, '');
  return found.sort();
}

// ---------- Abschnitt Links (AP-602) ----------
const EXTERN_SCHEMA = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

function verweise(html) {
  // Kommentare und Skriptinhalte raus: dort stehen Template-Strings und Notizen,
  // keine echten Verweise. Das src-Attribut des <script>-Tags bleibt erhalten.
  const sauber = ohneKommentare(html).replace(/(<script\b[^>]*>)[\s\S]*?<\/script>/gi, '$1</script>');
  const out = [];
  for (const m of sauber.matchAll(/<[a-z][\w-]*\b[^>]*>/gi)) {
    const a = attrs(m[0]);
    for (const k of ['href', 'src', 'poster']) if (a[k] !== undefined) out.push(a[k].trim());
    for (const k of ['srcset', 'imagesrcset']) {
      if (a[k]) out.push(...a[k].split(',').map((s) => s.trim().split(/\s+/)[0]).filter(Boolean));
    }
  }
  return out;
}

function ankerIn(html) {
  return new Set([...ohneKommentare(html).matchAll(/\s(?:id|name)\s*=\s*["']([^"']+)["']/gi)].map((m) => decode(m[1])));
}

async function pruefeLinks({ root, ziel, extern }) {
  const befunde = [];
  const fehler = (regel, datei, detail = '') => befunde.push({ stufe: 'Fehler', regel, datei, detail });
  const warnung = (regel, datei, detail = '') => befunde.push({ stufe: 'Warnung', regel, datei, detail });

  const cache = new Map();
  const lies = async (rel) => {
    if (!cache.has(rel)) cache.set(rel, await readFile(path.join(root, rel), 'utf8'));
    return cache.get(rel);
  };
  const externe = new Map();

  for (const seite of await alleHtmlSeiten(root)) {
    const html = await lies(seite);
    for (const roh of verweise(html)) {
      if (!roh || roh.includes('${') || roh.includes('{{')) continue;
      if (EXTERN_SCHEMA.test(roh)) {
        // Eigene Adressen (Canonical, og:url) sind interne Ziele; vor dem Go-live
        // liefert rohdich.de dort noch die alte Seite aus.
        if (extern && /^https?:/i.test(roh) && !roh.startsWith(SITE)) externe.set(roh, [...(externe.get(roh) || []), seite]);
        continue;
      }
      const [ohneAnker, anker = ''] = roh.split('#');
      const pfad = ohneAnker.split('?')[0];
      let zielRel;
      if (!pfad) {
        zielRel = seite;
      } else {
        let dekodiert;
        try { dekodiert = decodeURIComponent(pfad); } catch { fehler('Link', seite, `nicht dekodierbar: ${roh}`); continue; }
        zielRel = path.normalize(dekodiert.startsWith('/') ? dekodiert.slice(1) : path.join(path.dirname(seite), dekodiert));
        if (zielRel.startsWith('..')) { fehler('Ziel fehlt', seite, `${roh} zeigt aus --root heraus`); continue; }
        const abs = path.join(root, zielRel);
        if (dekodiert.endsWith('/') || (await istOrdner(abs))) zielRel = path.join(zielRel, 'index.html');
        if (!(await existiert(path.join(root, zielRel)))) { fehler('Ziel fehlt', seite, roh); continue; }
      }
      if (!zielRel.endsWith('.html')) continue;
      const zielHtml = await lies(zielRel);
      if (anker && !ankerIn(zielHtml).has(decode(anker))) fehler('Anker fehlt', seite, roh);
      if (pfad && zielRel !== seite) {
        const s = analysiere(zielHtml);
        if (s.weiterleitung) warnung('Ziel leitet weiter', seite, roh);
        else if (s.noindex && ziel === 'live') warnung('Ziel trägt noindex', seite, roh);
      }
    }
  }

  // Laufzeitdaten: die Galerie baut ihre Links und Bilder aus dem Projektindex.
  const indexPfad = path.join(root, 'data', 'projekte-index.json');
  if (await existiert(indexPfad)) {
    const { projekte = [] } = JSON.parse(await readFile(indexPfad, 'utf8'));
    for (const p of projekte) {
      if (!(await existiert(path.join(root, 'projekte', p.slug, 'index.html')))) fehler('Projektseite fehlt', 'data/projekte-index.json', p.slug);
      for (const b of p.bilder || []) {
        if (b.bild && !(await existiert(path.join(root, decodeURIComponent(b.bild).replace(/^\//, ''))))) {
          fehler('Projektbild fehlt', 'data/projekte-index.json', `${p.slug}: ${b.bild}`);
        }
      }
    }
  }

  // Externe Links nur auf Wunsch und nur als Warnung: Instagram, WhatsApp und
  // Google weisen automatische Abrufe oft ab, ohne dass der Link kaputt ist.
  for (const [url, seiten] of externe) {
    try {
      let antwort = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(8000) });
      // Manche Server (z. B. bkg.bund.de) lehnen nur HEAD ab – dann einmal per GET.
      if ([400, 403, 405, 501].includes(antwort.status)) {
        antwort = await fetch(url, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(8000) });
        await antwort.body?.cancel();
      }
      if (antwort.status >= 400) warnung('Externer Link', seiten[0], `${antwort.status} ${url} (${seiten.length}×)`);
    } catch (e) {
      warnung('Externer Link', seiten[0], `${e.name} ${url} (${seiten.length}×)`);
    }
  }

  return befunde;
}

async function istOrdner(p) {
  try { return (await stat(p)).isDirectory(); } catch { return false; }
}

// ---------- Abschnitt Alt-Texte (AP-602) ----------
const DATEINAME_ALT = /\.(?:jpe?g|png|webp|avif|gif|svg)\b|\bimg[_-]?\d|\bDSC/i;

async function pruefeAlt({ root }) {
  const befunde = [];
  const fehler = (regel, datei, detail = '') => befunde.push({ stufe: 'Fehler', regel, datei, detail });
  const warnung = (regel, datei, detail = '') => befunde.push({ stufe: 'Warnung', regel, datei, detail });

  let JSDOM;
  try { ({ JSDOM } = await import('jsdom')); } catch {
    fehler('jsdom', 'package.json', 'jsdom fehlt – vorher `npm ci` ausführen');
    return befunde;
  }

  for (const seite of await alleHtmlSeiten(root)) {
    const { document } = new JSDOM(await readFile(path.join(root, seite), 'utf8')).window;
    for (const img of document.querySelectorAll('img')) {
      const src = img.getAttribute('src') ?? '';
      if (!img.hasAttribute('alt')) {
        if (src) fehler('img ohne alt', seite, src);
        continue;
      }
      const alt = img.getAttribute('alt').trim();
      if (alt) {
        if (alt.length > 150) warnung('Alt-Text zu lang', seite, `${alt.length} Zeichen: ${src}`);
        if (DATEINAME_ALT.test(alt)) warnung('Alt-Text wie Dateiname', seite, `"${alt}"`);
        continue;
      }
      if (!src || schmueckend(img, src)) continue;
      const ordner = (src.match(/assets\/img\/([^/]+)/) || [, src])[1];
      warnung('Inhaltsbild ohne Beschreibung', seite, `[${ordner}] ${src}`);
    }
  }
  return befunde;
}

// alt="" ist richtig, wenn das Bild nur schmückt oder daneben derselbe Text steht.
function schmueckend(img, src) {
  if (img.closest('[aria-hidden="true"], [role="presentation"], [role="none"]')) return true;
  if (/assets\/img\/(?:icons|logo)\//.test(src)) return true;
  const traeger = img.parentElement?.closest('a, button, figure, li');
  return !!traeger && traeger.textContent.replace(/\s+/g, '').length >= 3;
}

// ---------- Ausgabe ----------
const ABSCHNITTE = [
  ['SEO', pruefeSeo],
  ['Links', pruefeLinks],
  ['Alt-Texte', pruefeAlt],
  // AP-605: ['Fremdquellen', pruefeFremdquellen]
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
