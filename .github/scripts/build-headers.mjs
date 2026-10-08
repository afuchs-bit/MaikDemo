#!/usr/bin/env node

import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderNavSubmenu } from './lib/render.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const TEMPLATE = path.join(__dirname, 'templates', '_header.html');
const CSS_VERSION = '20261007d';
const PRIVATE_FORM_CSS_VERSION = '20261004d';
const MOBILE_SOCIAL_PROOF_CSS_VERSION = '20261005i';
const JS_VERSION = '20261006c';
const GALLERY_JS_VERSION = '20261001a';
const FOOTER_CSS_VERSION = '20261007a';
const PRIVATE_FORM_JS_VERSION = '20261006a';
const REQUEST_CSS_VERSION = '20261004b';
const HOME_SPACING_CSS_VERSION = '20261004c';
// AP-568: eigener Schluessel, damit eine Aenderung an leistung-mobile.css nicht
// den styles.css-Schluessel aller Seiten mitzieht.
const LEISTUNG_MOBILE_CSS_VERSION = '20261008b';
// AP-585: eigener Schluessel fuer ueber-uns.css - bisher an CSS_VERSION, dessen Heben
// styles.css auf allen Seiten mitgezogen haette.
const UEBER_CSS_VERSION = '20261007c';
const SOCIAL_BRAND_CSS_VERSION = '20261006b';
const BRAND_ARTWORK_VERSION = '20261007a';
const SKIP_DIRS = new Set(['admin', 'assets', 'content', 'data', 'docs', 'node_modules', 'tmp']);

function pageBase(file) {
  if (path.basename(file) === '404.html') return '/';
  const relativeDir = path.dirname(path.relative(REPO_ROOT, file));
  if (relativeDir === '.') return '';
  return '../'.repeat(relativeDir.split(path.sep).length);
}

async function findPublishedHtml(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && (entry.name.startsWith('.') || SKIP_DIRS.has(entry.name))) continue;
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await findPublishedHtml(target));
    else if (entry.isFile() && (entry.name === 'index.html' || entry.name === '404.html')) files.push(target);
  }
  return files;
}

function replaceHeader(html, header) {
  const marked = /<!-- BUILD:site-header:start -->[\s\S]*?<!-- BUILD:site-header:end -->/;
  if (marked.test(html)) return html.replace(marked, header);
  const legacy = /(?:<!-- ============ HEADER \/ NAV ============ -->\s*)?<header\b[^>]*class=(['"])site-header\1[^>]*>[\s\S]*?<\/header>/;
  return legacy.test(html) ? html.replace(legacy, header) : null;
}

function updateAssetVersions(html) {
  return html
    .replace(/styles\.css\?v=[\w.-]+/g, `styles.css?v=${CSS_VERSION}`)
    .replace(/header-home\.css\?v=[\w.-]+/g, `header-home.css?v=${CSS_VERSION}`)
    .replace(/home-process\.css\?v=[\w.-]+/g, `home-process.css?v=${CSS_VERSION}`)
    .replace(/home-spacing\.css\?v=[\w.-]+/g, `home-spacing.css?v=${HOME_SPACING_CSS_VERSION}`)
    .replace(/anfrage\.css\?v=[\w.-]+/g, `anfrage.css?v=${REQUEST_CSS_VERSION}`)
    .replace(/privat-form\.css\?v=[\w.-]+/g, `privat-form.css?v=${PRIVATE_FORM_CSS_VERSION}`)
    .replace(/home-dark\.css\?v=[\w.-]+/g, `home-dark.css?v=${CSS_VERSION}`)
    .replace(/mobile-social-proof\.css\?v=[\w.-]+/g, `mobile-social-proof.css?v=${MOBILE_SOCIAL_PROOF_CSS_VERSION}`)
    .replace(/cta-family-home\.css\?v=[\w.-]+/g, `cta-family-home.css?v=${CSS_VERSION}`)
    .replace(/leistung-mobile\.css\?v=[\w.-]+/g, `leistung-mobile.css?v=${LEISTUNG_MOBILE_CSS_VERSION}`)
    .replace(/kontakt\.css\?v=[\w.-]+/g, `kontakt.css?v=${CSS_VERSION}`)
    .replace(/ueber-uns\.css\?v=[\w.-]+/g, `ueber-uns.css?v=${UEBER_CSS_VERSION}`)
    .replace(/projekte\.css\?v=[\w.-]+/g, `projekte.css?v=${CSS_VERSION}`)
    .replace(/footer-kontakt\.css\?v=[\w.-]+/g, `footer-kontakt.css?v=${FOOTER_CSS_VERSION}`)
    .replace(/privat-form\.js\?v=[\w.-]+/g, `privat-form.js?v=${PRIVATE_FORM_JS_VERSION}`)
    .replace(/main\.js\?v=[\w.-]+/g, `main.js?v=${JS_VERSION}`)
    .replace(/home-header-morph\.js\?v=[\w.-]+/g, `home-header-morph.js?v=${JS_VERSION}`)
    .replace(/mobile-social-proof-gallery\.js\?v=[\w.-]+/g, `mobile-social-proof-gallery.js?v=${GALLERY_JS_VERSION}`)
    .replace(/(<link\b[^>]*href="[^"]*header-home\.css[^>]*?)\s+media="[^"]*"/g, '$1');
}

function ensureSocialBrandStyles(html, base) {
  const stylesheet = `<link rel="stylesheet" href="${base}assets/css/social-brand.css?v=${SOCIAL_BRAND_CSS_VERSION}" />`;
  const existing = /<link\b[^>]*href="[^"]*assets\/css\/social-brand\.css[^>]*>/;
  return existing.test(html)
    ? html.replace(existing, stylesheet)
    : html.replace('</head>', `${stylesheet}\n</head>`);
}

function ensureBrandArtwork(html, base) {
  const stylesheet = `<link rel="stylesheet" href="${base}assets/css/brand-artwork.css?v=${BRAND_ARTWORK_VERSION}" />`;
  const existing = /<link\b[^>]*href="[^"]*assets\/css\/brand-artwork\.css[^>]*>/;
  const withStyles = existing.test(html)
    ? html.replace(existing, stylesheet)
    : html.replace('</head>', `${stylesheet}\n</head>`);
  return withStyles
    .replace(/assets\/img\/logo\/favicon\.(?:svg|png)(?:\?v=[\w.-]+)?" type="image\/(?:svg\+xml|png)"(?: sizes="64x64")?/g,
      `assets/img/logo/favicon.png?v=${BRAND_ARTWORK_VERSION}" type="image/png" sizes="64x64"`)
    .replace(/(<svg\b[^>]*class="brand-logo brand-logo-light"[^>]*viewBox=")0 0 640 150"/g,
      (match, prefix) => `${prefix}0 0 527 150"`);
}

async function main() {
  const template = await readFile(TEMPLATE, 'utf8');
  const files = await findPublishedHtml(REPO_ROOT);

  let updated = 0;
  for (const file of files) {
    const html = await readFile(file, 'utf8');
    if (!html.includes('class="site-header"')) continue;
    const base = pageBase(file);
    const data = { base, leistungenSubmenu: renderNavSubmenu(base) };
    const header = template.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] ?? match).trim();
    if (/\{\{\w+\}\}/.test(header)) throw new Error('Nicht aufgeloester Header-Platzhalter');
    const withHeader = replaceHeader(html, header);
    if (withHeader === null) throw new Error(`Header fehlt: ${path.relative(REPO_ROOT, file)}`);
    const next = ensureBrandArtwork(ensureSocialBrandStyles(updateAssetVersions(withHeader), base), base);
    if (next !== html) {
      await writeFile(file, next, 'utf8');
      updated += 1;
    }
  }

  console.log(`✅ Einheitlicher Header in ${updated} von ${files.length} veröffentlichten Seiten aktualisiert.`);
}

main().catch((error) => {
  console.error(`❌ Header-Build fehlgeschlagen: ${error.message}`);
  process.exit(1);
});
