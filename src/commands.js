/**
 * commands.js — what you can type in the Playground's PHP console.
 *
 * Rule: if the first word is a known command it runs that command; anything
 * else is PHP and goes to the persistent REPL.
 */

import { TimeoutError } from './php-runner.js';
import { splitPhpOutput } from './php-output.js';

const PROMPT = 'php >';

/**
 * @param {object} deps
 * @param {import('./terminal.js').Terminal} deps.term
 * @param {import('./php-runner.js').PhpRunner} deps.php
 * @param {import('./repl.js').Repl} deps.repl
 * @param {ReturnType<import('./store.js').createStore>} deps.store
 */
export function createCommands({ term, php, repl, store }) {
  let pendingConfirm = null; // (answer: string) => void, set by `reset`

  const commands = {
    help: { usage: 'help', description: 'List all commands', run: cmdHelp },
    clear: { usage: 'clear', description: 'Clear the screen (also Ctrl+L)', run: () => term.clear() },
    history: { usage: 'history', description: 'Show command history', run: cmdHistory },
    reset: { usage: 'reset', description: 'Forget all variables, functions and classes', run: cmdReset },
    php: { usage: 'php -v', description: 'Show the PHP version of the runtime', run: cmdPhp },
    exit: { usage: 'exit', description: '', run: cmdExit, hidden: true },
    quit: { usage: 'quit', description: '', run: cmdExit, hidden: true },
    '?': { usage: '?', description: '', run: cmdHelp, hidden: true },
  };

  // -------------------------------------------------------------------
  // Entry points
  // -------------------------------------------------------------------

  async function handleInput(raw) {
    const text = raw.trim();

    if (pendingConfirm) {
      const confirm = pendingConfirm;
      pendingConfirm = null;
      confirm(text.toLowerCase());
      return;
    }

    if (!text) return;

    const [first, ...args] = text.split(/\s+/);
    const command = commands[first.toLowerCase()];
    if (command) {
      await command.run(args, text);
      return;
    }

    await runPhp(raw);
  }

  /** Tab completion candidates for the text before the caret. */
  function complete(before) {
    const words = before.split(/\s+/);
    const partial = words[words.length - 1].toLowerCase();

    if (words.length === 1) {
      return Object.keys(commands)
        .filter((name) => !commands[name].hidden && name.startsWith(partial))
        .sort();
    }
    return words[0].toLowerCase() === 'php' ? ['-v'].filter((option) => option.startsWith(partial)) : [];
  }

  // -------------------------------------------------------------------
  // PHP
  // -------------------------------------------------------------------

  async function runPhp(code) {
    term.setBusy(true);
    const waiting = php.version ? null : term.print('Starting PHP. The first run downloads about 20 MB...', 'sys');

    try {
      const result = await repl.run(code);
      waiting?.remove();
      store.recordPlaygroundRun();

      for (const line of splitPhpOutput(result.stdout, result.stderr)) term.print(line.text, line.kind);

      if (!result.stdout.trim() && !result.stderr.trim()) {
        if (result.failed) term.print(`(PHP exited with code ${result.exitCode})`, 'err');
        else term.print('✓ ok (no output)', 'sys');
      }
      if (result.terminates && !result.failed) {
        term.print('Note: snippets that call exit/die are not kept in the session.', 'sys');
      }
    } catch (err) {
      waiting?.remove();
      if (err instanceof TimeoutError) {
        term.print(`${err.message}. PHP was stopped and a fresh copy is starting.`, 'err');
        term.print('Your variables are safe. Check for a loop that never ends (while(true), a missing $i++ ...).', 'hint');
      } else {
        term.print(`Runtime error: ${err.message}`, 'err');
      }
    } finally {
      term.setBusy(false);
    }
  }

  // -------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------

  function cmdHelp() {
    term.print('Console commands', 'hint');
    const visible = Object.values(commands).filter((c) => !c.hidden);
    const width = Math.max(...visible.map((c) => c.usage.length)) + 2;
    for (const c of visible) {
      term.printRich([
        { text: '  ' + c.usage.padEnd(width), kind: 'cyan' },
        { text: c.description },
      ]);
    }
    term.print('');
    term.print('Anything else is run as PHP. The leading <?php is optional; variables persist between commands.', 'sys');
    term.print('Enter runs the input, Shift+Enter adds a line, Up/Down browse history, Tab completes commands.', 'sys');
  }

  function cmdHistory() {
    const history = term.getHistory();
    if (history.length === 0) {
      term.print('(history is empty)', 'sys');
      return;
    }
    const width = String(history.length).length;
    history.forEach((entry, i) => {
      term.printRich([
        { text: `${String(i + 1).padStart(width)}  `, kind: 'sys' },
        { text: entry.replace(/\n/g, ' ⏎ ') },
      ]);
    });
  }

  function cmdReset() {
    term.print(`Reset the session (${repl.size} remembered snippet${repl.size === 1 ? '' : 's'})? [y/N]`, 'hint');
    pendingConfirm = (answer) => {
      if (answer !== 'y' && answer !== 'yes') {
        term.print('Cancelled.', 'sys');
        return;
      }
      repl.reset();
      term.print('Session cleared. All variables, functions and classes are gone.', 'ok');
    };
  }

  function cmdPhp(args) {
    const flag = args[0];
    if (flag === '-v' || flag === '--version') {
      if (!php.version) {
        term.print('PHP is still starting. Try again in a moment.', 'sys');
        return;
      }
      term.print(`PHP ${php.version} (WebAssembly, @php-wasm/web — runs entirely in your browser)`);
      return;
    }
    term.print('There is no php binary here: this whole console is PHP. Just type code, e.g.  echo 1 + 1;', 'hint');
  }

  function cmdExit() {
    term.print("There's no shell to exit to. Try `clear`. (If you meant PHP's exit, add a semicolon: exit;)", 'sys');
  }

  term.setPrompt(PROMPT);

  return { handleInput, complete };
}
