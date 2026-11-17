/**
 * editor.js — a CodeMirror 6 code editor with highlighting for every
 * language the courses teach.
 *
 * The caller owns the surrounding markup and buttons; this module only
 * provides the editing surface plus Ctrl/Cmd+Enter.
 */

import { EditorView, keymap } from '@codemirror/view';
import { EditorState, Prec } from '@codemirror/state';
import { indentWithTab } from '@codemirror/commands';
import { indentUnit } from '@codemirror/language';
import { basicSetup } from 'codemirror';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { php } from '@codemirror/lang-php';
import { sql, SQLite } from '@codemirror/lang-sql';
import { oneDark } from '@codemirror/theme-one-dark';

const LANGUAGES = {
  html: () => html(),
  css: () => css(),
  javascript: () => javascript(),
  php: () => php(),
  sql: () => sql({ dialect: SQLite, upperCaseKeywords: true }),
};

/** Let the app's own surface colour show through the One Dark theme. */
const appTheme = EditorView.theme(
  {
    '&': { backgroundColor: 'transparent', height: '100%' },
    '.cm-gutters': { backgroundColor: 'transparent', border: 'none' },
    '.cm-scroller': { fontFamily: 'var(--font-mono)', lineHeight: '1.55' },
    '&.cm-focused': { outline: 'none' },
  },
  { dark: true },
);

/**
 * @param {object} options
 * @param {HTMLElement} options.parent        element the editor mounts into
 * @param {string} [options.doc]              initial code
 * @param {'html'|'css'|'javascript'|'php'|'sql'} [options.lang]
 * @param {boolean} [options.readOnly]
 * @param {() => void} [options.onSubmit]     Ctrl/Cmd+Enter
 * @param {(code: string) => void} [options.onChange]
 */
export function createCodeEditor({ parent, doc = '', lang = 'php', readOnly = false, onSubmit, onChange }) {
  const extensions = [
    // Highest precedence so our shortcut wins over basicSetup's defaults.
    Prec.highest(keymap.of([{ key: 'Mod-Enter', run: () => (onSubmit?.(), true) }])),
    basicSetup,
    keymap.of([indentWithTab]),
    indentUnit.of(lang === 'php' ? '    ' : '  '),
    (LANGUAGES[lang] || LANGUAGES.php)(),
    appTheme,
    oneDark,
    EditorView.lineWrapping,
  ];

  if (readOnly) extensions.push(EditorState.readOnly.of(true), EditorView.editable.of(false));

  if (onChange) {
    extensions.push(
      EditorView.updateListener.of((update) => {
        if (update.docChanged) onChange(update.state.doc.toString());
      }),
    );
  }

  const view = new EditorView({
    parent,
    state: EditorState.create({ doc, extensions }),
  });

  return {
    view,
    getCode: () => view.state.doc.toString(),
    setCode(code) {
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: code } });
    },
    focus: () => view.focus(),
    destroy: () => view.destroy(),
  };
}
