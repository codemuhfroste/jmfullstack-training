/**
 * components/output-panel.js — the tabbed panel under the editor.
 *
 * Depending on the language it shows a live page preview, console output,
 * SQL result tables, and (in lessons) the list of checks.
 */

import { el, setChildren } from '../ui.js';
import { buildPreview } from '../runners/web.js';

const TAB_LABELS = {
  preview: 'Preview',
  console: 'Console',
  result: 'Result',
  expected: 'Expected',
  tables: 'Tables',
  checks: 'Checks',
};

const MAX_ROWS = 200;
const MAX_CONSOLE_LINES = 500;

/** Render one SQL result set as a table. */
function dataTable({ name, columns, values }) {
  const shown = values.slice(0, MAX_ROWS);
  return el(
    'div',
    { class: 'data-table-wrap' },
    name ? el('p', { class: 'data-table-name' }, el('code', {}, name), el('span', { class: 'muted small' }, ` ${values.length} row${values.length === 1 ? '' : 's'}`)) : null,
    el(
      'table',
      { class: 'data-table' },
      el('thead', {}, el('tr', {}, columns.map((column) => el('th', { scope: 'col' }, column)))),
      el(
        'tbody',
        {},
        shown.map((row) =>
          el(
            'tr',
            {},
            row.map((value) => (value === null ? el('td', { class: 'null' }, 'NULL') : el('td', { class: typeof value === 'number' ? 'num' : '' }, String(value)))),
          ),
        ),
      ),
    ),
    values.length === 0 ? el('p', { class: 'muted small' }, 'No rows.') : null,
    values.length > MAX_ROWS ? el('p', { class: 'muted small' }, `Showing the first ${MAX_ROWS} of ${values.length} rows.`) : null,
  );
}

/**
 * @param {{ tabs: string[] }} options  ids from TAB_LABELS, in display order
 */
export function createOutputPanel({ tabs }) {
  const tabBar = el('div', { class: 'panel-tabs', role: 'tablist' });
  const body = el('div', { class: 'panel-body' });
  const root = el('section', { class: 'card output-panel' }, tabBar, body);

  const panes = {};
  const buttons = {};
  let active = null;
  let previewToken = null;

  for (const id of tabs) {
    const badge = el('span', { class: 'tab-badge', hidden: true });
    buttons[id] = el('button', { class: 'panel-tab', type: 'button', role: 'tab', onclick: () => show(id) }, TAB_LABELS[id], badge);
    buttons[id].badge = badge;
    panes[id] = el('div', { class: `pane pane-${id}`, role: 'tabpanel', hidden: true });
    tabBar.append(buttons[id]);
    body.append(panes[id]);
  }

  // ---- preview -----------------------------------------------------------
  let frame = null;
  if (panes.preview) {
    frame = el('iframe', { class: 'preview-frame', title: 'Page preview', sandbox: 'allow-scripts' });
    panes.preview.append(frame);
  }

  // ---- console -----------------------------------------------------------
  const consoleEl = panes.console ? el('pre', { class: 'console', 'aria-live': 'polite' }) : null;
  if (consoleEl) {
    panes.console.append(consoleEl);
    setConsoleMessage('Nothing has been printed yet.');
  }

  function setConsoleMessage(text) {
    if (consoleEl) setChildren(consoleEl, el('span', { class: 'muted' }, text));
    consoleEl?.classList.add('empty');
  }

  function appendLine({ kind, text }) {
    if (!consoleEl) return;
    if (consoleEl.classList.contains('empty')) {
      consoleEl.replaceChildren();
      consoleEl.classList.remove('empty');
    }
    if (consoleEl.childElementCount >= MAX_CONSOLE_LINES) return;
    consoleEl.append(el('span', { class: kind === 'err' ? 'out-err' : 'out-line' }, `${text}\n`));
    if (active !== 'console') setBadge('console', kind === 'err' ? '!' : '•', kind === 'err' ? 'bad' : '');
    panes.console.scrollTop = panes.console.scrollHeight;
  }

  /** Messages posted by the preview iframe's console (see runners/web.js). */
  function onMessage(event) {
    const data = event.data;
    if (!data || data.fst !== previewToken || data.type !== 'console') return;
    appendLine({ kind: data.kind, text: data.text });
  }
  if (frame) window.addEventListener('message', onMessage);

  // ---- tabs --------------------------------------------------------------
  function show(id) {
    if (!panes[id]) return;
    active = id;
    for (const key of tabs) {
      panes[key].hidden = key !== id;
      buttons[key].classList.toggle('active', key === id);
      buttons[key].setAttribute('aria-selected', String(key === id));
    }
    if (id === 'console') setBadge('console', '');
  }

  function setBadge(id, text, kind = '') {
    const badge = buttons[id]?.badge;
    if (!badge) return;
    badge.hidden = !text;
    badge.textContent = text;
    badge.className = `tab-badge ${kind}`;
  }

  show(tabs[0]);

  return {
    el: root,
    show,
    setBadge,
    /** The element of a tab, for content the caller manages itself (e.g. checks). */
    pane: (id) => panes[id],

    /** Load the learner's page into the live preview. */
    setPreview(files) {
      if (!frame) return;
      const { html, token } = buildPreview(files);
      previewToken = token;
      if (consoleEl) setConsoleMessage('console.log() output and errors from your page appear here.');
      setBadge('console', '');
      frame.srcdoc = html;
    },

    /** Replace the console contents. */
    setLines(lines, emptyText = '(no output)') {
      if (!consoleEl) return;
      if (lines.length === 0) {
        setConsoleMessage(emptyText);
        return;
      }
      consoleEl.replaceChildren();
      consoleEl.classList.remove('empty');
      for (const line of lines) appendLine(line);
    },

    setConsoleMessage,

    /** Show result sets (or a note when there are none) in a table tab. */
    setTables(id, sets, note = '') {
      const pane = panes[id];
      if (!pane) return;
      setChildren(pane, sets.map(dataTable), note ? el('p', { class: 'muted pane-note' }, note) : null);
      if (!sets.length && !note) pane.append(el('p', { class: 'muted pane-note' }, 'Nothing to show yet.'));
    },

    setPaneMessage(id, text, kind = 'muted') {
      if (panes[id]) setChildren(panes[id], el('p', { class: `${kind} pane-note` }, text));
    },

    destroy() {
      window.removeEventListener('message', onMessage);
    },
  };
}
