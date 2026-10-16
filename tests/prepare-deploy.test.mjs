// AP-604: Tests fuer .github/scripts/prepare-deploy.mjs und die .htaccess-Vorlagen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { demoSperreEntfernen, inlineSkriptHashes, kommentareEntfernen, wirdAusgeliefert } from '../.github/scripts/prepare-deploy.mjs';

test('Allowlist: Seiten, Assets und Laufzeitdaten ja – Interna nein', () => {
  for (const ja of ['index.html', '404.html', 'kontakt/index.html', 'privatkunden/leistungen/rollrasen/index.html',
    'assets/css/styles.css', 'assets/img/logo/maik-rohdich-logo.png', 'data/projekte-index.json', 'data/galerie-teaser.json',
    'content/taxonomie.json', 'admin/index.html', 'admin/config.yml', 'api/anfrage.php', 'api/.htaccess',
    'api/lib/PHPMailer/src/PHPMailer.php', 'api/lib/PHPMailer/LICENSE', 'sitemap.xml']) {
    assert.equal(wirdAusgeliefert(ja), true, ja);
  }
  for (const nein of ['docs/umsetzungsplan.md', 'README.md', 'CLAUDE.md', 'package.json', 'package-lock.json', 'vercel.json',
    'api/anfrage.js', 'api/lib/README.md', 'data/images.json', 'data/kundenstimmen-entwurf.json', 'content/stammdaten.json',
    'content/leistungen/privat/rollrasen.json', 'gewerbekunden/index.saved.html', 'server/htaccess-live',
    'server/anfrage-config.example.php', 'tests/anfrage.test.mjs', 'scripts/golive-check.mjs', '.github/scripts/build-index.mjs',
    '.github/scripts/templates/leistung-v2.html', 'docs/ap/x.html', 'assets/README.md', 'assets/img/_src/foto.jpg',
    'robots.txt', 'robots-live.txt', '.env.example', '_headers']) {
    assert.equal(wirdAusgeliefert(nein), false, nein);
  }
});

test('Demo-Sperre: genau die Meta-Zeile samt AP-01-Kommentar, sonst nichts', () => {
  const html = [
    '<head>',
    '<!-- AP-01: Demo-Sperre. Beim Go-Live entfernen, siehe docs/go-live-checkliste.md Position 1. -->',
    '<meta name="robots" content="noindex,nofollow" />',
    '<title>x</title>',
    '<meta name="viewport" content="width=device-width" />',
    '<meta name="robots" content="noindex,nofollow">',
    '</head>'
  ].join('\n');
  const r = demoSperreEntfernen(html);
  assert.equal(r.entfernt, 2);
  assert.equal(r.html, ['<head>', '<title>x</title>', '<meta name="viewport" content="width=device-width" />', '</head>'].join('\n'));
  // Andere Schreibweisen (404, Admin, Weiterleitung) bleiben.
  for (const bleibt of ['<meta name="robots" content="noindex" />', '<meta name="robots" content="noindex, nofollow">']) {
    assert.equal(demoSperreEntfernen(bleibt).entfernt, 0);
  }
});

test('Kommentare: entfernt, ausser in script, style, pre, textarea und bedingten Kommentaren', () => {
  const html = '<p>A<!-- intern -->B</p>\n<!-- AP-21: Notiz\n mehrzeilig -->\n'
    + '<script>var s = "<!-- bleibt -->";</script><style>/* <!-- bleibt --> */</style>'
    + '<pre><!-- bleibt --></pre><textarea><!-- bleibt --></textarea><!--[if IE]>x<![endif]--><!-- weg -->C';
  const r = kommentareEntfernen(html);
  assert.equal(r.anzahl, 3);
  assert.equal(r.html, '<p>AB</p>\n\n'
    + '<script>var s = "<!-- bleibt -->";</script><style>/* <!-- bleibt --> */</style>'
    + '<pre><!-- bleibt --></pre><textarea><!-- bleibt --></textarea><!--[if IE]>x<![endif]-->C');
});

test('CSP-Hashes: nur ausfuehrbare Inline-Skripte', () => {
  const code = 'document.documentElement.classList.add("js");';
  const html = `<script>${code}</script><script src="/a.js"></script>`
    + '<script type="application/ld+json">{"@type":"Thing"}</script><script type="module">import "./b.js";</script>';
  const erwartet = (s) => `'sha256-${createHash('sha256').update(s).digest('base64')}'`;
  assert.deepEqual(inlineSkriptHashes(html), [erwartet(code), erwartet('import "./b.js";')]);
});

test('htaccess-staging weicht nur in den vorgesehenen Bloecken von htaccess-live ab', async () => {
  const live = (await readFile(new URL('../server/htaccess-live', import.meta.url), 'utf8')).split('\n');
  const staging = (await readFile(new URL('../server/htaccess-staging', import.meta.url), 'utf8')).split('\n');
  // Kopf bis "Options", Regel 1 und die HSTS/X-Robots-Zeilen sind absichtlich verschieden.
  const normal = (zeilen) => {
    const ab = zeilen.findIndex((z) => z.startsWith('Options '));
    const r1 = zeilen.findIndex((z) => z.startsWith('# 1. '));
    const r2 = zeilen.findIndex((z) => z.startsWith('# 2. '));
    return [...zeilen.slice(ab, r1), ...zeilen.slice(r2)]
      .filter((z) => !/Strict-Transport-Security|X-Robots-Tag|# HSTS|# Testumgebung: kein HSTS/.test(z));
  };
  assert.deepEqual(normal(staging), normal(live));
  assert.ok(staging.some((z) => z.includes('Require valid-user')));
  assert.ok(!live.some((z) => /Auth(Type|UserFile)/.test(z)));
});
