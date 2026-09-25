#!/usr/bin/env node

import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderNavSubmenu } from './lib/render.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const TEMPLATE = path.join(__dirname, 'templates', '_header.html');
const LEISTUNGS_ROOTS = [
  path.join(REPO_ROOT, 'privatkunden', 'leistungen'),
  path.join(REPO_ROOT, 'gewerbekunden', 'leistungen'),
];

function fill(template, data) {
  return template.replace(/\{\{([\w]+)\}\}/g, (match, key) => (
    Object.prototype.hasOwnProperty.call(data, key) ? String(data[key]) : match
  ));
}

function pageBase(file) {
  const relativeDir = path.dirname(path.relative(REPO_ROOT, file));
  if (relativeDir === '.') return '';
  return '../'.repeat(relativeDir.split(path.sep).length);
}

async function findIndexFiles(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await findIndexFiles(target));
    else if (entry.isFile() && entry.name === 'index.html') files.push(target);
  }
  return files;
}

function replaceHeader(html, header) {
  const marked = /<!-- BUILD:site-header:start -->[\s\S]*?<!-- BUILD:site-header:end -->/;
  if (marked.test(html)) return html.replace(marked, header);

  const legacy = /<!-- ============ HEADER \/ NAV ============ -->\s*<header\b[^>]*class=(['"])site-header\1[^>]*>[\s\S]*?<\/header>/;
  if (legacy.test(html)) return html.replace(legacy, header);

  const plain = /<header\b[^>]*class=(['"])site-header\1[^>]*>[\s\S]*?<\/header>/;
  if (plain.test(html)) return html.replace(plain, header);
  return null;
}

async function main() {
  const template = await readFile(TEMPLATE, 'utf8');
  const files = [path.join(REPO_ROOT, 'index.html')];
  for (const root of LEISTUNGS_ROOTS) files.push(...await findIndexFiles(root));

  let updated = 0;
  for (const file of files) {
    const html = await readFile(file, 'utf8');
    if (!html.includes('class="site-header"')) continue;
    const base = pageBase(file);
    const header = fill(template, { base, leistungenSubmenu: renderNavSubmenu(base) }).trim();
    if (/\{\{(?:base|leistungenSubmenu)\}\}/.test(header)) {
      throw new Error(`Nicht aufgeloester Header-Platzhalter in ${path.relative(REPO_ROOT, file)}`);
    }
    const next = replaceHeader(html, header);
    if (next === null) throw new Error(`Header konnte nicht ersetzt werden: ${path.relative(REPO_ROOT, file)}`);
    if (next !== html) {
      await writeFile(file, next, 'utf8');
      updated += 1;
    }
  }

  console.log(`✅ Einheitlicher Header in ${updated} von ${files.length} Seiten aktualisiert.`);
}

main().catch((error) => {
  console.error(`❌ Header-Build fehlgeschlagen: ${error.message}`);
  process.exit(1);
});
