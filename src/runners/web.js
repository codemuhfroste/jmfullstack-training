/**
 * runners/web.js — HTML/CSS/JS lessons.
 *
 * The learner's files are combined into one HTML document and loaded into a
 * sandboxed iframe (`sandbox="allow-scripts"`, no same-origin), so their page
 * can run scripts but can never reach this app's storage or DOM.
 *
 * Checks therefore cannot be called from out here. Instead each check
 * function is serialised with toString(), appended to the document, executed
 * *inside* the iframe, and the results come back through postMessage.
 * That is why check functions in the course files must be self-contained:
 * they may only use their four arguments (doc, win, h, src).
 */

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const safeScript = (code) => code.replace(/<\/script/gi, '<\\/script');
const safeStyle = (code) => code.replace(/<\/style/gi, '<\\/style');
const newToken = () => `fst-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;

/**
 * Combine the lesson files into a single document: `<link href="style.css">`
 * becomes an inline <style>, `<script src="script.js">` an inline <script>.
 * Files the page does not reference are left out, exactly as a browser would.
 *
 * @param {Record<string, string>} files  file name → code
 * @param {string} [headInject]           markup placed at the top of the document
 */
export function buildDocument(files, headInject = '') {
  let html = files['index.html'] ?? '';

  for (const [name, code] of Object.entries(files)) {
    const file = escapeRegExp(name);
    if (name.endsWith('.css')) {
      const link = new RegExp(`<link\\b[^>]*\\bhref=["']${file}["'][^>]*>`, 'gi');
      html = html.replace(link, () => `<style>\n${safeStyle(code)}\n</style>`);
    } else if (name.endsWith('.js')) {
      const script = new RegExp(`<script\\b[^>]*\\bsrc=["']${file}["'][^>]*>\\s*</script>`, 'gi');
      html = html.replace(script, () => `<script>\n${safeScript(code)}\n</script>`);
    }
  }

  return headInject ? injectHead(html, headInject) : html;
}

/** Insert markup as early as possible without pushing the doctype down. */
function injectHead(html, snippet) {
  for (const pattern of [/<head\b[^>]*>/i, /<html\b[^>]*>/i, /<!doctype[^>]*>/i]) {
    const match = pattern.exec(html);
    if (match) {
      const at = match.index + match[0].length;
      return html.slice(0, at) + snippet + html.slice(at);
    }
  }
  return snippet + html;
}

// ---------------------------------------------------------------------------
// Code that runs INSIDE the iframe. These functions are never called here;
// they are turned into source text with toString().
// ---------------------------------------------------------------------------

/** Forward console output and errors to the app, and keep links from navigating. */
function previewPrelude(token) {
  const format = (value) => {
    if (typeof value === 'string') return value;
    try {
      if (value instanceof Error) return `${value.name}: ${value.message}`;
      if (value instanceof Element) return `<${value.tagName.toLowerCase()}>`;
      if (typeof value === 'object' && value !== null) return JSON.stringify(value);
    } catch {
      /* fall through */
    }
    return String(value);
  };
  const send = (kind, args) => {
    try {
      parent.postMessage({ fst: token, type: 'console', kind, text: args.map(format).join(' ') }, '*');
    } catch {
      /* the parent is gone */
    }
  };

  for (const [method, kind] of [['log', 'out'], ['info', 'out'], ['debug', 'out'], ['warn', 'err'], ['error', 'err']]) {
    const original = console[method];
    console[method] = (...args) => {
      send(kind, args);
      original.apply(console, args);
    };
  }
  addEventListener('error', (event) => send('err', [event.message || 'Script error']));
  addEventListener('unhandledrejection', (event) => send('err', ['Unhandled promise rejection:', event.reason]));

  // A link or form would replace the preview with another page.
  document.addEventListener(
    'click',
    (event) => {
      const link = event.target.closest && event.target.closest('a[href]');
      if (link && !link.getAttribute('href').startsWith('#')) event.preventDefault();
    },
    true,
  );
  document.addEventListener('submit', (event) => event.preventDefault());
}

/** Helpers handed to every check as its third argument, `h`. */
function makeHelpers(document, window) {
  const css = (element, property) => (element ? window.getComputedStyle(element).getPropertyValue(property).trim() : '');

  /** Any CSS colour → the browser's canonical "rgb(r, g, b)" form. */
  const color = (value) => {
    const probe = document.createElement('span');
    probe.style.color = value;
    document.documentElement.append(probe);
    const resolved = window.getComputedStyle(probe).color;
    probe.remove();
    return resolved;
  };

  /** Every style rule in the page's stylesheets; `media` holds the @media condition, if any. */
  const rules = () => {
    const out = [];
    const walk = (list, media) => {
      for (const rule of Array.from(list)) {
        if (rule.selectorText) out.push({ selector: rule.selectorText, style: rule.style, media });
        else if (rule.cssRules) walk(rule.cssRules, rule.conditionText || (rule.media && rule.media.mediaText) || media);
      }
    };
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        walk(sheet.cssRules, '');
      } catch {
        /* cross-origin sheet */
      }
    }
    return out;
  };

  return {
    q: (selector) => document.querySelector(selector),
    all: (selector) => Array.from(document.querySelectorAll(selector)),
    /** Text of an element with whitespace collapsed. */
    text: (element) => (element ? element.textContent : '').replace(/\s+/g, ' ').trim(),
    css,
    /** A computed length in px as a number. */
    px: (element, property) => parseFloat(css(element, property)) || 0,
    color,
    sameColor: (element, property, expected) => Boolean(element) && color(css(element, property)) === color(expected),
    rules,
    wait: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  };
}

/** Wait for the page, run each check in order, report back. */
async function checkRunner(token, checks, makeHelpers, src) {
  const send = (message) => parent.postMessage(Object.assign({ fst: token }, message), '*');
  try {
    if (document.readyState !== 'complete') await new Promise((resolve) => addEventListener('load', resolve));
    await new Promise((resolve) => setTimeout(resolve, 30));

    const h = makeHelpers(document, window);
    const results = [];
    for (const check of checks) {
      try {
        const outcome = await check(document, window, h, src);
        results.push({ ok: outcome === true, detail: typeof outcome === 'string' ? outcome : '' });
      } catch (err) {
        results.push({ ok: false, detail: String((err && err.message) || err) });
      }
    }
    send({ type: 'checks', results });
  } catch (err) {
    send({ type: 'checks', results: [], error: String((err && err.message) || err) });
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * The document for the visible, live preview.
 * @returns {{ html: string, token: string }} token identifies its console messages
 */
export function buildPreview(files) {
  const token = newToken();
  const prelude = `<script>(${previewPrelude.toString()})(${JSON.stringify(token)})</script>`;
  return { html: buildDocument(files, prelude), token };
}

/**
 * Run a lesson's checks against the learner's files in a hidden iframe.
 *
 * @param {{ label: string, test: Function }[]} checks
 * @param {Record<string, string>} files
 * @returns {Promise<{ results: { ok: boolean, detail: string }[], error?: string }>}
 */
export function runWebChecks(checks, files, { timeoutMs = 5000 } = {}) {
  const token = newToken();
  // Escaping every '<' keeps the learner's own tags from ending this script early.
  const source = JSON.stringify(files).replace(/</g, '\\u003c');
  const script = `<script>(${checkRunner.toString()})(${JSON.stringify(token)}, [${checks
    .map((check) => safeScript(check.test.toString()))
    .join(',\n')}], ${makeHelpers.toString()}, ${source})</script>`;

  const frame = document.createElement('iframe');
  frame.setAttribute('sandbox', 'allow-scripts');
  frame.setAttribute('aria-hidden', 'true');
  frame.tabIndex = -1;
  // Off-screen but laid out at a desktop size, so computed styles and
  // media queries behave like a real window.
  frame.style.cssText = 'position:fixed;left:-10000px;top:0;width:1024px;height:768px;border:0;visibility:hidden';

  return new Promise((resolve) => {
    const finish = (value) => {
      clearTimeout(timer);
      window.removeEventListener('message', onMessage);
      frame.remove();
      resolve(value);
    };

    function onMessage(event) {
      const data = event.data;
      if (!data || data.fst !== token || data.type !== 'checks') return;
      finish({ results: data.results, error: data.error });
    }

    const timer = setTimeout(
      () =>
        finish({
          results: [],
          error:
            'The page never finished loading, so it could not be checked. Look for a tag that is opened but never closed (<title>, <style>, <script>, or a <!-- comment), or a loop that never ends.',
        }),
      timeoutMs,
    );

    window.addEventListener('message', onMessage);
    frame.srcdoc = `${buildDocument(files)}\n${script}`;
    document.body.append(frame);
  });
}
