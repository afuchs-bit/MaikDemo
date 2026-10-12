// Eigene Dateinamen statt ausschliesslich ?v=: auch der Icon-Cache erhaelt neue URLs.
export const FAVICON_VERSION = '20261007b';

export function renderFavicons(base = '') {
  const dir = `${base}assets/img/logo/`;
  return `<link rel="icon" href="${dir}favicon-32-${FAVICON_VERSION}.png" type="image/png" sizes="32x32" />
<link rel="icon" href="${dir}favicon-64-${FAVICON_VERSION}.png" type="image/png" sizes="64x64" />
<link rel="icon" href="${dir}favicon-${FAVICON_VERSION}.ico" type="image/x-icon" sizes="16x16 32x32 48x48 64x64" />
<link rel="apple-touch-icon" href="${dir}apple-touch-icon-${FAVICON_VERSION}.png" sizes="180x180" />`;
}

export function ensureFavicons(html, base = '') {
  const links = renderFavicons(base);
  let replaced = false;
  const next = html.replace(/<link\b(?=[^>]*\brel=["'](?:shortcut\s+icon|icon|apple-touch-icon(?:-precomposed)?)["'])[^>]*>\s*/gi, () => {
    if (replaced) return '';
    replaced = true;
    return `${links}\n`;
  });
  return replaced ? next : next.replace('</head>', `${links}\n</head>`);
}
