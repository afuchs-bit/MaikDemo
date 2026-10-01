#!/usr/bin/env node

import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderNavSubmenu } from './lib/render.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const TEMPLATE = path.join(__dirname, 'templates', '_header.html');
const CSS_VERSION = '20260930d';
const JS_VERSION = '20260930b';
const FOOTER_CSS_VERSION = '20260930b';
const SKIP_DIRS = new Set(['.git', '.github', 'assets', 'node_modules', 'tmp']);

function pageBase(file) {
  if (path.basename(file) === '404.html') return '/';
  const relativeDir = path.dirname(path.relative(REPO_ROOT, file));
  if (relativeDir === '.') return '';
  return '../'.repeat(relativeDir.split(path.sep).length);
}

async function findPublishedHtml(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await findPublishedHtml(target));
    else if (entry.isFile() && (entry.name === 'index.html' || entry.name === '404.html')) files.push(target);
  }
  return files;
}

function replaceBetween(html, startMarker, endMarker, content) {
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker, start + startMarker.length);
  if (start === -1 || end === -1) return null;
  return html.slice(0, start + startMarker.length)
    + `\n          ${content}\n          `
    + html.slice(end);
}

function replaceServicesTrigger(html, trigger) {
  const oldOrNewTrigger = /(?:<span class="menu-label">Leistungen(?: A bis Z)?<\/span>\s*)?<button type="button" class="submenu-toggle"[^>]*>[\s\S]*?<\/button>/;
  return oldOrNewTrigger.test(html) ? html.replace(oldOrNewTrigger, trigger) : null;
}

function updateAssetVersions(html) {
  return html
    .replace(/styles\.css\?v=[\w.-]+/g, `styles.css?v=${CSS_VERSION}`)
    .replace(/footer-kontakt\.css\?v=[\w.-]+/g, `footer-kontakt.css?v=${FOOTER_CSS_VERSION}`)
    .replace(/main\.js\?v=[\w.-]+/g, `main.js?v=${JS_VERSION}`);
}

async function main() {
  const template = await readFile(TEMPLATE, 'utf8');
  const trigger = template.match(/<button type="button" class="submenu-toggle"[^>]*>[\s\S]*?<\/button>/)?.[0];
  if (!trigger) throw new Error('Leistungen-Ausloeser fehlt in templates/_header.html');
  const files = await findPublishedHtml(REPO_ROOT);

  let updated = 0;
  for (const file of files) {
    const html = await readFile(file, 'utf8');
    if (!html.includes('class="site-header"')) continue;
    const base = pageBase(file);
    const withTrigger = replaceServicesTrigger(html, trigger);
    if (withTrigger === null) throw new Error(`Leistungen-Ausloeser fehlt: ${path.relative(REPO_ROOT, file)}`);
    const withSubmenu = replaceBetween(
      withTrigger,
      '<!-- BUILD:leistungen-submenu:start -->',
      '<!-- BUILD:leistungen-submenu:end -->',
      renderNavSubmenu(base),
    );
    if (withSubmenu === null) throw new Error(`Submenu-Marker fehlen: ${path.relative(REPO_ROOT, file)}`);
    const next = updateAssetVersions(withSubmenu);
    if (next !== html) {
      await writeFile(file, next, 'utf8');
      updated += 1;
    }
  }

  console.log(`✅ Leistungen-Menü in ${updated} von ${files.length} veröffentlichten Seiten aktualisiert.`);
}

main().catch((error) => {
  console.error(`❌ Header-Build fehlgeschlagen: ${error.message}`);
  process.exit(1);
});
