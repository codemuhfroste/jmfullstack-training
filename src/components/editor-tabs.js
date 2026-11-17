/**
 * components/editor-tabs.js — one code editor per file, with a tab strip.
 *
 * Used by lessons (index.html / style.css / script.js) and the playground.
 * Each file keeps its own CodeMirror instance so undo history and scroll
 * position survive switching tabs.
 */

import { el } from '../ui.js';
import { createCodeEditor } from '../editor.js';

/**
 * @param {object} options
 * @param {{ name: string, lang: string, code: string, readOnly?: boolean }[]} options.files
 * @param {string} [options.active]                     file shown first
 * @param {(name: string, code: string) => void} [options.onChange]
 * @param {() => void} [options.onSubmit]               Ctrl/Cmd+Enter
 */
export function createEditorTabs({ files, active, onChange, onSubmit }) {
  const tabsEl = el('div', { class: 'file-tabs', role: 'tablist', 'aria-label': 'Files' });
  const hostsEl = el('div', { class: 'editor-hosts' });

  const entries = files.map((file) => {
    const host = el('div', { class: 'editor-host', role: 'tabpanel', hidden: true });
    const tab = el(
      'button',
      { class: 'file-tab', type: 'button', role: 'tab', onclick: () => select(file.name), title: file.readOnly ? 'Read-only: this file is given' : null },
      file.name,
      file.readOnly ? el('span', { class: 'file-tab-note' }, 'read-only') : null,
    );
    const editor = createCodeEditor({
      parent: host,
      doc: file.code,
      lang: file.lang,
      readOnly: file.readOnly,
      onSubmit,
      onChange: (code) => onChange?.(file.name, code),
    });
    tabsEl.append(tab);
    hostsEl.append(host);
    return { file, host, tab, editor };
  });

  let current = null;

  function select(name) {
    const target = entries.find((entry) => entry.file.name === name) || entries[0];
    for (const entry of entries) {
      const on = entry === target;
      entry.host.hidden = !on;
      entry.tab.classList.toggle('active', on);
      entry.tab.setAttribute('aria-selected', String(on));
    }
    current = target;
    // A CodeMirror view created while hidden has to re-measure once visible.
    target.editor.view.requestMeasure();
  }

  select(active);

  return {
    tabsEl,
    el: hostsEl,
    select,
    /** @returns {Record<string, string>} every file, including read-only ones */
    getFiles: () => Object.fromEntries(entries.map((entry) => [entry.file.name, entry.editor.getCode()])),
    setFile(name, code) {
      entries.find((entry) => entry.file.name === name)?.editor.setCode(code);
    },
    focus: () => current?.editor.focus(),
    destroy() {
      for (const entry of entries) entry.editor.destroy();
    },
  };
}
