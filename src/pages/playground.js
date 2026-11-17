/**
 * pages/playground.js — a scratchpad for every language in the stack.
 *
 * Nothing here is graded. Each mode keeps its own code, saved as you type:
 *   web      HTML + CSS + JS with a live preview
 *   js       JavaScript with console output
 *   php      a PHP script
 *   sql      SQL against the sample database
 *   console  an interactive PHP prompt (variables persist between lines)
 */

import { el, debounce, icon, toast } from '../ui.js';
import { createEditorTabs } from '../components/editor-tabs.js';
import { createOutputPanel } from '../components/output-panel.js';
import { runLesson } from '../runners/index.js';
import { describeTables } from '../runners/sql.js';
import { langOf } from '../courses/lesson-file.js';
import { BREWLINE_DB } from '../courses/sql.js';
import { Terminal } from '../terminal.js';
import { createCommands } from '../commands.js';

const lines = (...rows) => `${rows.join('\n')}\n`;

const MODES = [
  {
    id: 'web',
    label: 'Web page',
    kind: 'web',
    main: 'index.html',
    tabs: ['preview', 'console'],
    hint: 'The preview updates as you type.',
    files: {
      'index.html': lines(
        '<!DOCTYPE html>',
        '<html lang="en">',
        '  <head>',
        '    <title>Playground</title>',
        '    <link rel="stylesheet" href="style.css">',
        '  </head>',
        '  <body>',
        '    <h1>Hello, stack!</h1>',
        '    <button id="hi">Click me</button>',
        '    <p id="out"></p>',
        '',
        '    <script src="script.js"></script>',
        '  </body>',
        '</html>',
      ),
      'style.css': lines('body {', '  font-family: Verdana, sans-serif;', '  padding: 16px;', '}', '', 'h1 {', '  color: #7c5cff;', '}'),
      'script.js': lines(
        'let clicks = 0;',
        '',
        'document.querySelector("#hi").addEventListener("click", () => {',
        '  clicks += 1;',
        '  document.querySelector("#out").textContent = "Clicked " + clicks + " times";',
        '  console.log("clicks:", clicks);',
        '});',
      ),
    },
  },
  {
    id: 'js',
    label: 'JavaScript',
    kind: 'js',
    main: 'script.js',
    tabs: ['console'],
    hint: 'Ctrl+Enter runs the code.',
    files: { 'script.js': lines('const drinks = ["Espresso", "Latte", "Mocha"];', '', 'for (const drink of drinks) {', '  console.log(drink.toUpperCase());', '}') },
  },
  {
    id: 'php',
    label: 'PHP',
    kind: 'php',
    main: 'main.php',
    tabs: ['console'],
    hint: 'Ctrl+Enter runs the script. The first run downloads PHP (about 20 MB).',
    files: { 'main.php': lines('<?php', '$drinks = ["Espresso" => 90, "Latte" => 120];', '', 'foreach ($drinks as $name => $price) {', '    echo "$name costs $price\\n";', '}') },
  },
  {
    id: 'sql',
    label: 'SQL',
    kind: 'sql',
    main: 'query.sql',
    setup: BREWLINE_DB,
    tabs: ['result', 'tables'],
    hint: 'Each run starts from a fresh copy of the sample database.',
    files: { 'query.sql': lines('SELECT category, COUNT(*) AS items', 'FROM menu', 'GROUP BY category;') },
  },
  { id: 'console', label: 'PHP console' },
];

/** The PHP console keeps its scrollback and session across page switches. */
let consoleInstance = null;

function buildConsole({ store, php, repl }) {
  const output = el('div', { class: 'term-output', role: 'log', 'aria-live': 'polite' });
  const promptEl = el('span', { class: 'prompt' });
  const input = el('textarea', { class: 'term-input', rows: '1', spellcheck: false, autocapitalize: 'off', autocorrect: 'off', autocomplete: 'off', 'aria-label': 'PHP console input' });
  const screen = el('div', { class: 'term-screen' }, output, el('div', { class: 'term-input-row' }, promptEl, input));
  const root = el('div', { class: 'card terminal' }, screen);

  // Submitted inputs run one after another, never overlapping.
  let queue = Promise.resolve();
  const term = new Terminal({
    root,
    screen,
    output,
    promptEl,
    input,
    history: store.state.history,
    onSubmit: (text) => {
      store.setHistory(term.getHistory());
      queue = queue.then(() => commands.handleInput(text)).catch(console.error);
    },
    onComplete: (before) => commands.complete(before),
  });
  const commands = createCommands({ term, php, repl, store });

  term.print('Interactive PHP. Type a line and press Enter; variables, functions and classes stay defined.', 'sys');
  term.print('`help` lists the commands. Shift+Enter adds a line, Up/Down browse history.', 'sys');

  return {
    el: root,
    term,
    exec(text) {
      term.setInput(text);
      term.submit();
      return queue;
    },
    text: () => output.innerText,
  };
}

export function playgroundPage(params, ctx) {
  const { store } = ctx;
  const mode = MODES.find((m) => m.id === params.mode) || MODES.find((m) => m.id === store.state.playground.lastMode) || MODES[0];
  if (store.state.playground.lastMode !== mode.id) store.setPlayground('lastMode', mode.id);

  const switcher = el(
    'nav',
    { class: 'segmented', 'aria-label': 'Playground language' },
    MODES.map((m) => el('a', { class: m === mode ? 'active' : '', href: `#/playground/${m.id}`, 'aria-current': m === mode ? 'page' : null }, m.id === 'console' ? icon('terminal', 16) : null, m.label)),
  );
  const hint = el('p', { class: 'muted small playground-hint' });
  const head = el('header', { class: 'playground-head' }, el('div', {}, el('h1', {}, 'Playground'), hint), switcher);

  // ---- PHP console ---------------------------------------------------------
  if (mode.id === 'console') {
    consoleInstance ??= buildConsole({ store, php: ctx.php(), repl: ctx.repl() });
    hint.textContent = 'A PHP prompt, like php -a. Nothing here is graded.';
    return {
      el: el('section', { class: 'page page-playground' }, head, consoleInstance.el),
      mount() {
        consoleInstance.term.scrollToBottom();
        if (window.matchMedia('(min-width: 960px)').matches) consoleInstance.term.focus();
      },
      exec: (text) => consoleInstance.exec(text),
      output: () => consoleInstance.text(),
    };
  }

  // ---- Editor modes --------------------------------------------------------
  hint.textContent = mode.hint;
  const saved = store.getPlayground(mode.id) || {};
  const isWeb = mode.kind === 'web';

  const output = createOutputPanel({ tabs: mode.tabs });
  const refreshPreview = debounce(() => output.setPreview(editors.getFiles()), 350);
  const save = debounce(() => store.setPlayground(mode.id, editors.getFiles()), 500);

  const editors = createEditorTabs({
    files: Object.entries(mode.files).map(([name, code]) => ({ name, lang: langOf(name), code: saved[name] ?? code })),
    active: mode.main,
    onSubmit: run,
    onChange: () => {
      save();
      if (isWeb) refreshPreview();
    },
  });

  const runBtn = el('button', { class: 'btn btn-primary', type: 'button', onclick: run }, icon(isWeb ? 'reset' : 'play', 16), isWeb ? 'Reload' : 'Run');
  const resetBtn = el(
    'button',
    {
      class: 'btn btn-ghost btn-sm',
      type: 'button',
      onclick: () => {
        if (!window.confirm('Replace your playground code with the example?')) return;
        for (const [name, code] of Object.entries(mode.files)) editors.setFile(name, code);
      },
    },
    'Reset',
  );

  async function run() {
    if (runBtn.disabled) return;
    const files = editors.getFiles();

    if (isWeb) {
      output.setPreview(files);
      output.show('preview');
    } else {
      runBtn.disabled = true;
      const sql = mode.kind === 'sql';
      output.show(sql ? 'result' : 'console');
      if (sql) output.setPaneMessage('result', 'Running…');
      else output.setConsoleMessage(mode.kind === 'php' && !ctx.php().version ? 'Starting PHP. The first run downloads about 20 MB…' : 'Running…');

      try {
        const result = await runLesson(mode, files, ctx);
        if (!sql) output.setLines(result.lines, '(nothing was printed)');
        else if (result.lines.length) output.setPaneMessage('result', result.lines.map((line) => line.text).join('\n'), 'out-err');
        else output.setTables('result', result.sets, result.note);
      } catch (err) {
        const text = `Could not run the code: ${err.message}`;
        if (sql) output.setPaneMessage('result', text, 'out-err');
        else output.setLines([{ kind: 'err', text }]);
      } finally {
        runBtn.disabled = false;
      }
    }

    for (const badge of store.recordPlaygroundRun()) toast(`New badge: ${badge.title}`, 'good');
  }

  const root = el(
    'section',
    { class: 'page page-playground' },
    head,
    el(
      'div',
      { class: 'playground-grid' },
      el('section', { class: 'card card-editor' }, el('div', { class: 'toolbar' }, editors.tabsEl, el('div', { class: 'toolbar-actions' }, resetBtn, runBtn)), editors.el),
      output.el,
    ),
  );

  let alive = true;

  return {
    el: root,
    mount() {
      if (isWeb) output.setPreview(editors.getFiles());
      if (mode.kind === 'php') ctx.php();
      if (mode.kind === 'sql') {
        output.setPaneMessage('result', 'Press Run to execute your query.');
        output.setPaneMessage('tables', 'Loading…');
        describeTables(mode.setup)
          .then((tables) => alive && output.setTables('tables', tables))
          .catch((err) => alive && output.setPaneMessage('tables', `The SQL engine could not be loaded: ${err.message}`, 'out-err'));
      }
      if (window.matchMedia('(min-width: 960px)').matches) editors.focus();
    },
    unmount() {
      alive = false;
      store.setPlayground(mode.id, editors.getFiles());
      editors.destroy();
      output.destroy();
    },
    getFiles: () => editors.getFiles(),
    setFile: (name, code) => editors.setFile(name, code),
    run,
  };
}
