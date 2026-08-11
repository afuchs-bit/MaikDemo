#!/usr/bin/env node

import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { footerTemplateData } from './lib/render.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const TEMPLATE = path.join(__dirname, 'templates', '_footer.html');
const EXCLUDED_DIRS = new Set([
  '.git', '.github', 'admin', 'assets', 'content', 'data', 'docs', 'node_modules',
]);

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

function pageContext(file) {
  const relative = path.relative(REPO_ROOT, file).split(path.sep).join('/');
  if (relative.startsWith('privatkunden/')) return 'private';
  if (relative.startsWith('gewerbekunden/')) return 'business';
  return 'neutral';
}

async function findHtmlFiles(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      // Versteckte Ordner immer ueberspringen – unter .claude/worktrees/ liegen
      // komplette Checkouts paralleler Sessions, deren Dateien uns nicht gehoeren.
      if (!entry.name.startsWith('.') && !EXCLUDED_DIRS.has(entry.name)) files.push(...await findHtmlFiles(path.join(dir, entry.name)));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(path.join(dir, entry.name));
    }
  }
  return files;
}

function replaceFooter(html, footer) {
  const marked = /<!-- BUILD:site-footer:start -->[\s\S]*?<!-- BUILD:site-footer:end -->/;
  if (marked.test(html)) return html.replace(marked, footer);

  const legacy = /<footer\b[^>]*class=(['"])site-footer\1[^>]*>[\s\S]*?<\/footer>/;
  if (legacy.test(html)) return html.replace(legacy, footer);
  return null;
}

async function main() {
  const template = await readFile(TEMPLATE, 'utf8');
  const htmlFiles = await findHtmlFiles(REPO_ROOT);
  let updated = 0;

  for (const file of htmlFiles) {
    const html = await readFile(file, 'utf8');
    if (!html.includes('class="site-footer"')) continue;

    const data = footerTemplateData(pageBase(file), pageContext(file));
    const footer = fill(template, data).trim();
    if (/\{\{footer|\{\{base\}\}/.test(footer)) {
      throw new Error(`Nicht aufgelöster Footer-Platzhalter in ${path.relative(REPO_ROOT, file)}`);
    }
    const next = replaceFooter(html, footer);
    if (next === null) throw new Error(`Footer konnte nicht ersetzt werden: ${path.relative(REPO_ROOT, file)}`);
    if (next !== html) {
      await writeFile(file, next, 'utf8');
      updated += 1;
    }
  }

  console.log(`✅ Einheitlicher Footer in ${updated} von ${htmlFiles.length} HTML-Dateien aktualisiert.`);
}

main().catch((error) => {
  console.error(`❌ Footer-Build fehlgeschlagen: ${error.message}`);
  process.exit(1);
});
