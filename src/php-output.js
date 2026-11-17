/**
 * php-output.js — turn raw PHP stdout/stderr into coloured lines.
 *
 * Shared by the terminal (Playground) and the exercise page so both show
 * warnings, notices and fatal errors the same way.
 */

import { el } from './ui.js';

/** Lines that should be shown in red. */
const ERROR_LINE_RE = /^(PHP )?(Fatal error|Parse error|Warning|Notice|Deprecated|Uncaught)\b/;
/** From a fatal/parse error on, everything (stack trace) is red. */
const FATAL_LINE_RE = /^(PHP )?(Fatal error|Parse error)\b/;

/**
 * @returns {{ text: string, kind: 'out' | 'err' }[]}
 */
export function splitPhpOutput(stdout = '', stderr = '') {
  const lines = [];
  const text = stdout.replace(/\n$/, '');
  if (text) {
    let afterFatal = false;
    for (const line of text.split('\n')) {
      if (FATAL_LINE_RE.test(line)) afterFatal = true;
      lines.push({ text: line, kind: afterFatal || ERROR_LINE_RE.test(line) ? 'err' : 'out' });
    }
  }
  if (stderr && stderr.trim()) lines.push({ text: stderr.trim(), kind: 'err' });
  return lines;
}

/** True if the output contains a fatal or parse error. */
export function hasFatalError(stdout = '') {
  return /^(PHP )?(Fatal error|Parse error):/m.test(stdout);
}

/**
 * Render output into a <pre>-like container as coloured spans.
 * @param {HTMLElement} container
 * @param {string} stdout
 * @param {string} stderr
 * @param {string} [emptyText]  shown when there is no output at all
 */
export function renderPhpOutput(container, stdout, stderr, emptyText = '(no output)') {
  const lines = splitPhpOutput(stdout, stderr);
  container.replaceChildren();
  if (lines.length === 0) {
    container.append(el('span', { class: 'muted' }, emptyText));
    return;
  }
  lines.forEach((line, i) => {
    container.append(el('span', { class: line.kind === 'err' ? 'out-err' : 'out-line' }, line.text));
    if (i < lines.length - 1) container.append('\n');
  });
}
