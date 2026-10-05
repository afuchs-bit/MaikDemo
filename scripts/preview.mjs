// Lokale Vorschau mit demselben Formular-Handler wie im Deployment.
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
try { process.loadEnvFile(resolve(root, '.env.local')); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const { default: anfrage } = await import('../api/anfrage.js');
const maxBody = 4_000_000;
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.mp4': 'video/mp4',
  '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.pdf': 'application/pdf'
};
const privatePaths = new Set(['api', 'scripts', 'tests', 'node_modules', 'tmp']);
const sendJSON = (res, status, code) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify({ ok: false, code }));
};

const server = createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');
  try {
    const url = new URL(req.url, 'http://' + req.headers.host);
    if (url.pathname === '/api/anfrage') {
      if (req.method !== 'POST') return sendJSON(res, 405, 'method');
      if (req.headers.origin && req.headers.origin !== url.origin) return sendJSON(res, 403, 'origin');
      if (Number(req.headers['content-length']) > maxBody) return sendJSON(res, 413, 'size');
      const body = await new Promise((done, reject) => {
        let length = 0;
        const parts = [];
        req.on('data', (part) => { length += part.length; if (length <= maxBody) parts.push(part); });
        req.on('end', () => done(length > maxBody ? null : Buffer.concat(parts)));
        req.on('error', reject);
      });
      if (!body) return sendJSON(res, 413, 'size');
      const response = await anfrage.fetch(new Request(url, { method: 'POST', headers: req.headers, body }));
      res.writeHead(response.status, Object.fromEntries(response.headers));
      return res.end(Buffer.from(await response.arrayBuffer()));
    }
    if (!['GET', 'HEAD'].includes(req.method)) return sendJSON(res, 405, 'method');
    const pathname = decodeURIComponent(url.pathname);
    const segments = pathname.split('/').filter(Boolean);
    if (segments.some((s) => s.startsWith('.')) || privatePaths.has(segments[0]) ||
        /^(?:package(?:-lock)?\.json|vercel\.json)$/.test(segments[0] || '')) {
      return sendJSON(res, 404, 'not_found');
    }
    let file = resolve(root, '.' + pathname);
    if ((await stat(file)).isDirectory()) {
      if (!url.pathname.endsWith('/')) { res.writeHead(301, { Location: url.pathname + '/' + url.search }); return res.end(); }
      file = resolve(file, 'index.html');
    }
    file = await realpath(file);
    if (!file.startsWith(root + sep)) return sendJSON(res, 404, 'not_found');
    const info = await stat(file);
    if (!info.isFile()) return sendJSON(res, 404, 'not_found');
    res.setHeader('Content-Type', types[extname(file).toLowerCase()] || 'application/octet-stream');
    res.setHeader('Accept-Ranges', 'bytes');
    let start = 0;
    let end = info.size - 1;
    let status = 200;
    if (req.headers.range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if (!match || (!match[1] && !match[2])) return sendJSON(res, 416, 'range');
      start = match[1] ? Number(match[1]) : Math.max(0, info.size - Number(match[2]));
      end = match[1] && match[2] ? Math.min(Number(match[2]), info.size - 1) : info.size - 1;
      if (start > end || start >= info.size) { res.setHeader('Content-Range', 'bytes */' + info.size); return sendJSON(res, 416, 'range'); }
      status = 206;
      res.setHeader('Content-Range', `bytes ${start}-${end}/${info.size}`);
    }
    res.setHeader('Content-Length', Math.max(0, end - start + 1));
    res.writeHead(status);
    if (req.method === 'HEAD' || !info.size) return res.end();
    await pipeline(createReadStream(file, { start, end }), res);
  } catch (error) {
    if (!res.headersSent) sendJSON(res, ['ENOENT', 'ENOTDIR', 'URIError'].includes(error.code || error.name) ? 404 : 500, 'preview_error');
    else res.destroy();
  }
});
server.requestTimeout = 30_000;
server.listen(Number(process.env.PREVIEW_PORT || 8080), '0.0.0.0', () => {
  console.log(`Vorschau: http://127.0.0.1:${server.address().port}/`);
});
