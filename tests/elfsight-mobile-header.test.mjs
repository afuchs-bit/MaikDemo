import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { JSDOM, VirtualConsole } from 'jsdom';

const source = await readFile(new URL('../assets/js/elfsight-mobile-header.js', import.meta.url), 'utf8');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const flush = () => wait(40);

function setup(isMobile = true, priorInert = false, viewportSize = null) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => {
    if (!error.message.startsWith('Not implemented: navigation')) errors.push(error);
  });
  const dom = new JSDOM(`<header id="siteHeader"><nav class="primary-nav"><div class="menu"><a id="faq-link" href="#faq">FAQ</a></div></nav><button id="navToggle" aria-expanded="false">Menü</button><button id="callBtn">Telefon</button><a id="phone" href="tel:+491711738943">Mobil</a><a id="whatsapp" href="https://wa.me/491711738943">WhatsApp</a></header><main${priorInert ? ' inert="original"' : ''}></main><footer class="site-footer"></footer>`, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://example.test/', virtualConsole });
  const { window } = dom;
  const { document } = window;
  const nav = document.querySelector('.primary-nav');
  const menu = open => {
    nav.classList.toggle('is-open', open);
    document.getElementById('navToggle').setAttribute('aria-expanded', String(open));
  };
  document.getElementById('navToggle').addEventListener('click', () => {
    if (media.matches) menu(!nav.classList.contains('is-open'));
  });
  document.getElementById('faq-link').addEventListener('click', () => menu(false));
  if (viewportSize) {
    const viewport = new window.EventTarget();
    Object.assign(viewport, viewportSize);
    window.visualViewport = viewport;
  }
  let pageX = 0;
  let pageY = 600;
  Object.defineProperties(window, {
    scrollX: { get: () => pageX },
    scrollY: { get: () => pageY }
  });
  window.scrollTo = (x, y) => {
    pageX = typeof x === 'object' ? x.left : x;
    pageY = typeof x === 'object' ? x.top : y;
  };
  const observers = [];
  const NativeObserver = window.MutationObserver;
  window.MutationObserver = class extends NativeObserver {
    constructor(callback) { super(callback); observers.push(this); }
  };
  const media = new window.EventTarget();
  media.matches = isMobile;
  window.matchMedia = () => media;
  let bottom = 82;
  let resized;
  window.ResizeObserver = class {
    constructor(callback) { resized = callback; }
    observe() {}
  };
  document.getElementById('siteHeader').getBoundingClientRect = () => ({ bottom });
  const portal = document.createElement('div');
  portal.className = 'es-portal-root eapps-google-reviews-d265013d-d9f3-4b6b-8ab8-d050171ce838-custom-css-root';
  document.body.append(portal);
  window.eval(source);
  const popup = () => {
    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = '<div class="es-popup-wrapper" role="dialog" aria-modal="true"><div class="es-backdrop-container"></div><div class="es-popup-container"><button class="es-popup-close-button">Close</button></div></div>';
    const dialog = shadow.querySelector('[role="dialog"]');
    const close = shadow.querySelector('button');
    close.addEventListener('click', () => dialog.remove());
    portal.append(host);
    return { host, shadow, dialog, close };
  };
  return { dom, window, document, portal, popup, media, menu,
    scroll(value) { pageY = value; window.dispatchEvent(new window.Event('scroll')); },
    resize(value) { bottom = value; resized(); }, close() {
    observers.forEach(observer => observer.disconnect());
    window.close();
    assert.deepEqual(errors, []);
  } };
}

test('mobile popup preserves header access and restores previous attributes on close', async () => {
  const s = setup(true, true);
  try {
    const p = s.popup();
    await flush();
    assert.equal(s.document.getElementById('siteHeader').hasAttribute('inert'), false);
    assert.equal(s.document.querySelector('main').hasAttribute('inert'), true);
    assert.equal(s.document.querySelector('footer').hasAttribute('inert'), true);
    assert.equal(p.dialog.getAttribute('aria-modal'), 'false');
    assert.equal(s.document.documentElement.style.getPropertyValue('--maik-reviews-top'), '82px');
    s.resize(103.4);
    assert.equal(s.document.documentElement.style.getPropertyValue('--maik-reviews-top'), '104px');
    p.close.click();
    assert.equal(s.document.querySelector('main').getAttribute('inert'), 'original');
    assert.equal(s.document.querySelector('footer').hasAttribute('inert'), false);
    await flush();
    assert.equal(p.dialog.getAttribute('aria-modal'), 'true');
    assert.equal(s.document.documentElement.classList.contains('maik-reviews-panel-open'), false);
    assert.equal(s.document.documentElement.style.getPropertyValue('--maik-reviews-top'), '');
  } finally { s.close(); }
});

function touch(s, target, from, to, count = 1) {
  const send = (type, point) => {
    const event = new s.window.Event(type, { bubbles: true, composed: true, cancelable: true });
    Object.defineProperty(event, 'touches', { value: Array.from({ length: count }, (_, identifier) => ({
      identifier, clientX: point[0] + identifier * 30, clientY: point[1]
    })) });
    target.dispatchEvent(event);
    return event;
  };
  send('touchstart', from);
  return send('touchmove', to);
}

function scroller(s, parent, scrollTop = 40) {
  const element = s.document.createElement('div');
  element.className = 'es-scrollable-container';
  element.style.overflowY = 'auto';
  Object.defineProperties(element, {
    clientHeight: { value: 100 },
    scrollHeight: { value: 500 }
  });
  element.scrollTop = scrollTop;
  parent.append(element);
  return element;
}

test('escaped document scrolling is corrected while the mobile popup is open and released on close', async () => {
  const s = setup();
  try {
    const p = s.popup();
    await flush();
    s.document.documentElement.style.setProperty('scroll-behavior', 'smooth', 'important');
    s.scroll(800);
    assert.equal(s.window.scrollY, 600);
    assert.equal(s.document.documentElement.style.getPropertyValue('scroll-behavior'), 'smooth');
    assert.equal(s.document.documentElement.style.getPropertyPriority('scroll-behavior'), 'important');
    p.close.click();
    await flush();
    s.scroll(900);
    assert.equal(s.window.scrollY, 900);
  } finally { s.close(); }
});

test('popup follows the visible viewport when mobile browser chrome changes its height or offset', async () => {
  const s = setup(true, false, { height: 700, offsetTop: 0 });
  try {
    const p = s.popup();
    await flush();
    const root = s.document.documentElement;
    assert.equal(root.style.getPropertyValue('--maik-reviews-height'), '618px');
    s.window.visualViewport.height = 780;
    s.window.visualViewport.dispatchEvent(new s.window.Event('resize'));
    assert.equal(root.style.getPropertyValue('--maik-reviews-height'), '698px');
    s.window.visualViewport.offsetTop = 20;
    s.window.visualViewport.dispatchEvent(new s.window.Event('scroll'));
    assert.equal(root.style.getPropertyValue('--maik-reviews-height'), '718px');
    p.close.click();
    await flush();
    assert.equal(root.style.getPropertyValue('--maik-reviews-height'), '');
  } finally { s.close(); }
});

test('opening position survives asynchronous widget mounting and an immediate background gesture', async () => {
  const s = setup();
  try {
    const widget = s.document.createElement('div');
    widget.className = 'elfsight-app-d265013d-d9f3-4b6b-8ab8-d050171ce838';
    const trigger = s.document.createElement('button');
    widget.append(trigger);
    s.document.querySelector('main').append(widget);
    trigger.click();
    await flush();
    s.scroll(800);
    s.popup();
    await flush();
    assert.equal(s.window.scrollY, 600);
  } finally { s.close(); }
});

test('touch scrolling works inside a popup but stops at both scroll boundaries', async () => {
  const s = setup();
  try {
    const p = s.popup();
    const content = scroller(s, p.dialog);
    await flush();
    assert.equal(touch(s, content, [100, 200], [100, 180]).defaultPrevented, false);
    assert.equal(touch(s, content, [100, 200], [100, 220]).defaultPrevented, false);
    content.scrollTop = 0;
    assert.equal(touch(s, content, [100, 200], [100, 220]).defaultPrevented, true);
    content.scrollTop = 400;
    assert.equal(touch(s, content, [100, 200], [100, 180]).defaultPrevented, true);
  } finally { s.close(); }
});

test('the backdrop and non-scrollable photo areas cannot drag the document', async () => {
  const s = setup();
  try {
    const p = s.popup();
    await flush();
    assert.equal(touch(s, p.shadow.querySelector('.es-backdrop-container'), [100, 200], [100, 180]).defaultPrevented, true);
    assert.equal(touch(s, p.dialog.querySelector('.es-popup-container'), [100, 200], [100, 180]).defaultPrevented, true);
    assert.equal(touch(s, s.document.body, [100, 200], [100, 180]).defaultPrevented, true);
  } finally { s.close(); }
});

test('horizontal photo swipes, pinch gestures, and scrolling in the phone selector remain available', async () => {
  const s = setup();
  try {
    const p = s.popup();
    const phone = scroller(s, s.document.getElementById('siteHeader'));
    await flush();
    assert.equal(touch(s, p.dialog, [200, 200], [100, 205]).defaultPrevented, false);
    assert.equal(touch(s, p.dialog, [100, 200], [100, 180], 2).defaultPrevented, false);
    assert.equal(touch(s, phone, [100, 200], [100, 180]).defaultPrevented, false);
  } finally { s.close(); }
});

test('header link navigation can change the page position after dismissing the popup', async () => {
  const s = setup();
  try {
    s.popup();
    await flush();
    s.document.getElementById('phone').addEventListener('click', () => s.scroll(1000));
    s.document.getElementById('phone').click();
    assert.equal(s.window.scrollY, 1000);
    await flush();
    assert.equal(s.document.querySelector('main').hasAttribute('inert'), false);
  } finally { s.close(); }
});

test('desktop popup gestures and document scrolling are not intercepted', async () => {
  const s = setup(false);
  try {
    const p = s.popup();
    await flush();
    assert.equal(touch(s, p.dialog, [100, 200], [100, 180]).defaultPrevented, false);
    s.scroll(800);
    assert.equal(s.window.scrollY, 800);
  } finally { s.close(); }
});

test('desktop leaves dialogs, background, and header offset unchanged', async () => {
  const s = setup(false);
  try {
    const p = s.popup();
    await flush();
    assert.equal(p.dialog.getAttribute('aria-modal'), 'true');
    assert.equal(p.dialog.hasAttribute('data-maik-reviews-mobile'), false);
    assert.equal(s.document.querySelector('main').hasAttribute('inert'), false);
    assert.equal(s.document.documentElement.style.getPropertyValue('--maik-reviews-top'), '');
  } finally { s.close(); }
});

test('navigation and contact links release the popup before the original action without cancelling it', async () => {
  for (const id of ['faq-link', 'phone', 'whatsapp']) {
    const s = setup();
    try {
      const p = s.popup();
      await flush();
      let actionSawClosedPopup = false;
      s.document.getElementById(id).addEventListener('click', () => {
        actionSawClosedPopup = !p.dialog.isConnected && !s.document.querySelector('main').hasAttribute('inert');
      });
      const event = new s.window.MouseEvent('click', { bubbles: true, cancelable: true });
      s.document.getElementById(id).dispatchEvent(event);
      assert.equal(actionSawClosedPopup, true, id);
      assert.equal(event.defaultPrevented, false, id);
      await flush();
      assert.equal(s.document.documentElement.classList.contains('maik-reviews-panel-open'), false, id);
    } finally { s.close(); }
  }
});

test('mobile menu pauses the popup and preserves scroll position and background lock when dismissed', async () => {
  const s = setup();
  try {
    const p = s.popup();
    const content = scroller(s, p.dialog, 240);
    await flush();
    s.document.getElementById('navToggle').click();
    await flush();
    assert.equal(p.dialog.isConnected, true);
    assert.equal(p.dialog.getAttribute('aria-hidden'), 'true');
    assert.equal(p.dialog.hasAttribute('inert'), true);
    s.resize(550);
    assert.equal(s.document.documentElement.style.getPropertyValue('--maik-reviews-top'), '82px');
    // Eine Drehung kann den Scrollbereich des verdeckten Popups verkleinern.
    content.scrollTop = 0;
    s.scroll(800);
    assert.equal(s.window.scrollY, 600);
    assert.equal(s.document.querySelector('main').hasAttribute('inert'), true);
    s.resize(82);
    s.document.getElementById('navToggle').click();
    await flush();
    assert.equal(p.dialog.isConnected, true);
    assert.equal(p.dialog.hasAttribute('aria-hidden'), false);
    assert.equal(p.dialog.hasAttribute('inert'), false);
    assert.equal(content.scrollTop, 240);
    assert.equal(s.document.documentElement.classList.contains('maik-reviews-panel-open'), true);
    assert.equal(s.document.querySelector('main').hasAttribute('inert'), true);
  } finally { s.close(); }
});

test('menu dismissal through another header action resumes both popup levels and restores prior attributes', async () => {
  const s = setup();
  try {
    const review = s.popup();
    const photo = s.popup();
    photo.dialog.setAttribute('aria-hidden', 'false');
    await flush();
    for (let i = 0; i < 3; i++) {
      s.menu(true);
      await flush();
      assert.equal(review.dialog.hasAttribute('inert'), true);
      assert.equal(photo.dialog.hasAttribute('inert'), true);
      s.menu(false);
      await flush();
      assert.equal(review.dialog.hasAttribute('inert'), false);
      assert.equal(photo.dialog.hasAttribute('inert'), false);
      assert.equal(photo.dialog.getAttribute('aria-hidden'), 'false');
    }
    assert.equal(review.dialog.isConnected, true);
    assert.equal(photo.dialog.isConnected, true);
  } finally { s.close(); }
});

test('selecting a menu destination closes nested popups and allows the destination to scroll', async () => {
  const s = setup();
  try {
    const review = s.popup();
    const photo = s.popup();
    await flush();
    s.menu(true);
    await flush();
    s.document.getElementById('faq-link').addEventListener('click', () => s.scroll(1100));
    s.document.getElementById('faq-link').click();
    assert.equal(review.dialog.isConnected, false);
    assert.equal(photo.dialog.isConnected, false);
    assert.equal(s.window.scrollY, 1100);
    await flush();
    assert.equal(s.document.querySelector('main').hasAttribute('inert'), false);
    assert.equal(photo.dialog.hasAttribute('inert'), false);
    assert.equal(photo.dialog.hasAttribute('aria-hidden'), false);
  } finally { s.close(); }
});

test('resizing from a paused mobile popup to desktop restores the original dialog without closing it', async () => {
  const s = setup();
  try {
    const p = s.popup();
    await flush();
    s.menu(true);
    await flush();
    s.media.matches = false;
    s.media.dispatchEvent(new s.window.Event('change'));
    s.menu(false);
    await flush();
    assert.equal(p.dialog.isConnected, true);
    assert.equal(p.dialog.getAttribute('aria-modal'), 'true');
    assert.equal(p.dialog.hasAttribute('aria-hidden'), false);
    assert.equal(p.dialog.hasAttribute('inert'), false);
    assert.equal(p.dialog.hasAttribute('data-maik-reviews-suspended'), false);
    assert.equal(s.document.querySelector('main').hasAttribute('inert'), false);
    assert.equal(s.document.documentElement.style.getPropertyValue('--maik-reviews-height'), '');
  } finally { s.close(); }
});

test('phone number selector remains usable while popup stays open', async () => {
  const s = setup();
  try {
    const p = s.popup();
    await flush();
    let selected = false;
    s.document.getElementById('callBtn').addEventListener('click', () => { selected = true; });
    s.document.getElementById('callBtn').click();
    assert.equal(selected, true);
    assert.equal(p.dialog.isConnected, true);
  } finally { s.close(); }
});

test('nested photo popup closes without releasing the background until the review popup also closes', async () => {
  const s = setup();
  try {
    const review = s.popup();
    const photo = s.popup();
    await flush();
    photo.close.click();
    await flush();
    assert.equal(s.document.querySelector('main').hasAttribute('inert'), true);
    assert.equal(review.dialog.getAttribute('aria-modal'), 'false');
    review.close.click();
    await flush();
    assert.equal(s.document.querySelector('main').hasAttribute('inert'), false);
    assert.equal(s.document.documentElement.classList.contains('maik-reviews-panel-open'), false);
  } finally { s.close(); }
});

test('crossing the desktop breakpoint restores and reapplies popup state', async () => {
  const s = setup();
  try {
    const p = s.popup();
    await flush();
    s.media.matches = false;
    s.media.dispatchEvent(new s.window.Event('change'));
    await flush();
    assert.equal(p.dialog.getAttribute('aria-modal'), 'true');
    assert.equal(s.document.querySelector('main').hasAttribute('inert'), false);
    assert.equal(p.dialog.hasAttribute('data-maik-reviews-mobile'), false);
    s.media.matches = true;
    s.media.dispatchEvent(new s.window.Event('change'));
    await flush();
    assert.equal(p.dialog.getAttribute('aria-modal'), 'false');
    assert.equal(s.document.querySelector('main').hasAttribute('inert'), true);
  } finally { s.close(); }
});

test('late attached shadow root and duplicate script loading are handled', async () => {
  const s = setup();
  try {
    const host = s.document.createElement('div');
    s.portal.append(host);
    await flush();
    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = '<div class="es-popup-wrapper" role="dialog" aria-modal="true"></div>';
    await wait(150);
    s.window.eval(source);
    await flush();
    assert.equal(shadow.querySelector('[role="dialog"]').getAttribute('aria-modal'), 'false');
    assert.equal(shadow.querySelectorAll('style').length, 1);
    assert.equal(s.document.querySelectorAll('#maik-reviews-header-style').length, 1);
  } finally { s.close(); }
});
