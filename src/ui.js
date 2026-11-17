/**
 * ui.js — tiny DOM helpers used by every page.
 *
 * `el()` builds elements without innerHTML, so text from lessons or program
 * output is always inserted as text, never parsed as HTML.
 */

/**
 * Create an element.
 *
 *   el('button', { class: 'btn', onclick: fn, disabled: true }, 'Run')
 *
 * - `class`            → className
 * - `onxxx` functions  → event listeners
 * - `dataset`          → data-* attributes
 * - boolean/known DOM props (hidden, disabled, value, …) → set as properties
 * - everything else    → setAttribute
 * - children: strings, numbers, nodes, arrays, or null/false (skipped)
 *
 * @param {string} tag
 * @param {Record<string, any>} [attrs]
 * @param {...any} children
 * @returns {HTMLElement}
 */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (typeof value === 'boolean' || key === 'value' || key === 'textContent') node[key] = value;
    else node.setAttribute(key, value);
  }

  appendChildren(node, children);
  return node;
}

function appendChildren(node, children) {
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
}

/** Replace all children of `node` with the given children. */
export function setChildren(node, ...children) {
  node.replaceChildren();
  appendChildren(node, children);
  return node;
}

/** Call `fn` at most once per `ms` after the last call (for autosave). */
export function debounce(fn, ms) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/** "Nov 10" style short date from a YYYY-MM-DD key or an ISO date string. */
export function shortDate(value) {
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

// ---------------------------------------------------------------------------
// Icons — a handful of hand-drawn 24×24 stroke icons.
// ---------------------------------------------------------------------------

const SVG_NS = 'http://www.w3.org/2000/svg';

const ICONS = {
  home: ['M3 11.5 12 4l9 7.5', 'M5.5 10v10h13V10'],
  layers: ['M12 3 21 8l-9 5-9-5 9-5Z', 'm3 13 9 5 9-5', 'm3 17.5 9 5 9-5'],
  code: ['m8 7-5 5 5 5', 'm16 7 5 5-5 5'],
  user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M4 21c0-4 3.6-6.500 8-6.500s8 2.500 8 6.500'],
  bolt: ['M13 2 4 14h7l-1 8 9-12h-7l1-8Z'],
  lock: ['M6 11h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z', 'M8 11V8a4 4 0 0 1 8 0v3'],
  check: ['m5 12.500 4.500 4.500L19 7.500'],
  x: ['M6 6l12 12', 'M18 6 6 18'],
  play: ['M7 4.500v15l12-7.500L7 4.500Z'],
  star: ['m12 3 2.700 5.600 6.100.900-4.400 4.300 1 6.100L12 17l-5.400 2.900 1-6.100-4.400-4.300 6.100-.900L12 3Z'],
  right: ['m9 5 7 7-7 7'],
  left: ['m15 5-7 7 7 7'],
  reset: ['M4 12a8 8 0 1 0 2.500-5.800', 'M4 4v5h5'],
  bulb: ['M9 18h6', 'M10 21h4', 'M8 14a6 6 0 1 1 8 0c-.700.700-1 1.500-1 2.500H9c0-1-.300-1.800-1-2.500Z'],
  eye: ['M2 12s3.500-7 10-7 10 7 10 7-3.500 7-10 7S2 12 2 12Z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'],
  terminal: ['m5 8 4 4-4 4', 'M12 16h7'],
  flag: ['M5 21V4', 'M5 4h12l-2 4 2 4H5'],
  trophy: ['M8 4h8v6a4 4 0 0 1-8 0V4Z', 'M8 6H5a3 3 0 0 0 3 4', 'M16 6h3a3 3 0 0 1-3 4', 'M12 14v4', 'M8 20h8'],
  book: ['M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2V5Z', 'M4 20a2 2 0 0 0 2 2h13v-4', 'M9 8h6'],
  print: ['M7 9V3h10v6', 'M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2', 'M7 14h10v7H7z'],
};

/** @returns {SVGSVGElement} */
export function icon(name, size = 18) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('icon');
  for (const d of ICONS[name] || []) {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', d);
    svg.append(path);
  }
  return svg;
}

// ---------------------------------------------------------------------------
// Small shared widgets
// ---------------------------------------------------------------------------

export function progressBar(pct, extraClass = '') {
  return el(
    'div',
    { class: `progress ${extraClass}`, role: 'progressbar', 'aria-valuenow': pct, 'aria-valuemin': 0, 'aria-valuemax': 100 },
    el('div', { class: 'progress-fill', style: `width:${pct}%` }),
  );
}

/** The square coloured tile that identifies a course ("</>", "JS", …). */
export function courseMark(course, size = '') {
  return el('span', { class: `course-mark ${size}`, style: `--course:${course.color}`, 'aria-hidden': 'true' }, course.mark);
}

const AVATAR_COLORS = ['#7c5cff', '#ff7a59', '#4da3ff', '#3ddc97', '#f5c542', '#ff6b9d'];
export const AVATAR_COUNT = AVATAR_COLORS.length;

/** Round avatar showing the first letter of the learner's name. */
export function avatar(profile, size = '') {
  const letter = (profile.name || '').trim().charAt(0).toUpperCase() || '?';
  return el('span', { class: `avatar ${size}`, style: `--avatar:${AVATAR_COLORS[profile.avatar % AVATAR_COLORS.length]}`, 'aria-hidden': 'true' }, letter);
}

/** Show a short message at the bottom of the screen. */
export function toast(message, kind = '') {
  let host = document.querySelector('.toasts');
  if (!host) {
    host = el('div', { class: 'toasts', role: 'status', 'aria-live': 'polite' });
    document.body.append(host);
  }
  const node = el('div', { class: `toast ${kind}` }, message);
  host.append(node);
  setTimeout(() => node.classList.add('leaving'), 2600);
  setTimeout(() => node.remove(), 3000);
}

/**
 * Open a modal dialog. Closes on Esc, on a backdrop click, or by calling
 * the returned function.
 * @param {HTMLElement} content
 * @param {{ onClose?: () => void }} [options]
 * @returns {() => void} close
 */
export function openModal(content, { onClose } = {}) {
  const previousFocus = document.activeElement;
  const dialog = el('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true' }, content);
  const backdrop = el('div', { class: 'modal-backdrop' }, dialog);

  function close() {
    document.removeEventListener('keydown', onKey);
    backdrop.remove();
    previousFocus?.focus?.();
    onClose?.();
  }
  function onKey(event) {
    if (event.key === 'Escape') close();
  }

  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) close();
  });
  document.addEventListener('keydown', onKey);
  document.body.append(backdrop);
  (dialog.querySelector('[autofocus]') || dialog.querySelector('button, a'))?.focus();
  return close;
}

/** A burst of falling paper, purely decorative. */
export function confetti() {
  const colors = ['#7c5cff', '#ffc247', '#3ddc97', '#ff7a59', '#4da3ff'];
  return el(
    'div',
    { class: 'confetti', 'aria-hidden': 'true' },
    Array.from({ length: 28 }, (_, i) =>
      el('i', {
        style: `left:${(i * 37) % 100}%;background:${colors[i % colors.length]};animation-delay:${(i % 7) * 0.08}s;animation-duration:${1.6 + (i % 5) * 0.25}s`,
      }),
    ),
  );
}
