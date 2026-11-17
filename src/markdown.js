/**
 * markdown.js — renders the small Markdown subset lesson text is written in.
 *
 * Supported: paragraphs, `### headings`, `- bullets`, `1. numbered lists`,
 * `> callouts`, fenced ``` code blocks, `| tables |`, `Q:` / `A:` self-check
 * pairs (the answer is hidden until clicked), and inline `code` / **bold** / *italic*.
 * Everything is built with el(), so lesson text can never inject HTML.
 */

import { el } from './ui.js';

/** Split a line into text, `code` and **bold** nodes. */
function inline(text) {
  const nodes = [];
  // ``double backticks`` allow a single ` inside the code.
  const pattern = /``(.+?)``|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*\s][^*]*)\*/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const code = match[1] ?? match[2];
    if (code !== undefined) nodes.push(el('code', {}, code.trim()));
    else nodes.push(match[3] !== undefined ? el('strong', {}, match[3]) : el('em', {}, match[4]));
    last = match.index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/**
 * @param {string} source
 * @returns {HTMLElement[]}
 */
export function renderMarkdown(source = '') {
  const out = [];
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  let i = 0;

  /** Collect consecutive lines matching `pattern`, with the marker removed. */
  const take = (pattern) => {
    const items = [];
    while (i < lines.length && pattern.test(lines[i])) items.push(lines[i++].replace(pattern, ''));
    return items;
  };

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
    } else if (line.startsWith('```')) {
      const code = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) code.push(lines[i++]);
      i++; // closing fence
      out.push(el('pre', { class: 'code-block' }, code.join('\n')));
    } else if (/^#{2,3} /.test(line)) {
      out.push(el('h3', {}, inline(line.replace(/^#+ /, ''))));
      i++;
    } else if (/^- /.test(line)) {
      out.push(el('ul', {}, take(/^- /).map((item) => el('li', {}, inline(item)))));
    } else if (/^\d+\. /.test(line)) {
      out.push(el('ol', {}, take(/^\d+\. /).map((item) => el('li', {}, inline(item)))));
    } else if (line.startsWith('|')) {
      // | head | head |  then  |---|---|  then one row per line
      const rows = take(/^\|/).map((row) => row.replace(/\|\s*$/, '').split('|').map((cell) => cell.trim()));
      const hasHead = rows.length > 1 && rows[1].every((cell) => /^:?-+:?$/.test(cell));
      const body = hasHead ? rows.slice(2) : rows;
      out.push(
        el(
          'div',
          { class: 'table-scroll' },
          el(
            'table',
            { class: 'md-table' },
            hasHead ? el('thead', {}, el('tr', {}, rows[0].map((cell) => el('th', { scope: 'col' }, inline(cell))))) : null,
            el('tbody', {}, body.map((row) => el('tr', {}, row.map((cell) => el('td', {}, inline(cell)))))),
          ),
        ),
      );
    } else if (line.startsWith('Q: ')) {
      const question = line.slice(3);
      i++;
      const answer = [];
      while (i < lines.length && lines[i].trim() && !lines[i].startsWith('Q: ')) answer.push(lines[i++].replace(/^A: /, ''));
      out.push(el('details', { class: 'qa' }, el('summary', {}, inline(question)), el('p', {}, inline(answer.join(' ')))));
    } else if (line.startsWith('> ')) {
      out.push(el('p', { class: 'callout' }, inline(take(/^> /).join(' '))));
    } else {
      const paragraph = [];
      while (i < lines.length && lines[i].trim() && !/^(```|#{2,3} |- |\d+\. |> |\||Q: )/.test(lines[i])) paragraph.push(lines[i++]);
      out.push(el('p', {}, inline(paragraph.join(' '))));
    }
  }

  return out;
}
