/**
 * lesson-file.js — reads a lesson's Markdown file.
 *
 * Lesson text and code live in `src/courses/<course>/<lesson-id>.md` so they
 * can be written as ordinary Markdown, with no JavaScript escaping:
 *
 *     # Lesson title
 *
 *     Explanation shown under "Learn" (use ### for sub-headings).
 *
 *     ## Task
 *     What the learner has to do.
 *
 *     ## Hints
 *     - First hint
 *     - Second hint
 *
 *     ## Given: index.html        ← optional read-only file(s)
 *     ```html
 *     ...
 *     ```
 *
 *     ## Starter: style.css       ← the file(s) the learner edits
 *     ```css
 *     ...
 *     ```
 *
 *     ## Solution: style.css
 *     ```css
 *     ...
 *     ```
 *
 * The file name after "Starter"/"Solution" may be left out when the lesson
 * has a single file. How a lesson is graded lives in the course's .js file.
 *
 * In JavaScript and PHP lessons a "Given" file holds helper functions: it is
 * shown read-only in its own tab and runs before the learner's code.
 *
 * Quiz lessons have a "## Quiz" section instead of code (see parseQuiz).
 */

const LANG_BY_EXTENSION = { html: 'html', css: 'css', js: 'javascript', php: 'php', sql: 'sql', json: 'javascript' };

/** Split the text into `## ` sections, ignoring headings inside code fences. */
function splitSections(text) {
  const sections = [{ heading: '', lines: [] }];
  let inFence = false;
  for (const line of text.replace(/\r\n/g, '\n').split('\n')) {
    if (line.startsWith('```')) inFence = !inFence;
    if (!inFence && line.startsWith('## ')) sections.push({ heading: line.slice(3).trim(), lines: [] });
    else sections.at(-1).lines.push(line);
  }
  return sections;
}

/** The contents of the first code fence in a section. */
function fenceContent(lines) {
  const start = lines.findIndex((line) => line.startsWith('```'));
  if (start === -1) return '';
  const end = lines.findIndex((line, i) => i > start && line.startsWith('```'));
  return `${lines.slice(start + 1, end === -1 ? undefined : end).join('\n')}\n`;
}

/** "- a\n  more\n- b" → ['a more', 'b'] */
function bullets(lines) {
  const items = [];
  for (const line of lines) {
    if (line.startsWith('- ')) items.push(line.slice(2).trim());
    else if (line.trim() && items.length) items[items.length - 1] += ` ${line.trim()}`;
  }
  return items;
}

/**
 * A "## Quiz" section: each question starts with "? ". It is followed either
 * by "- " options (the correct one ends in " *") or by "= " lines listing the
 * accepted typed answers. An accepted answer written as /pattern/ is a
 * regular expression; list a plain one first, it is shown as the solution.
 *
 *     ? Which command creates a repository?
 *     - git start
 *     - git init *
 *
 *     ? Type the command that shows what has changed.
 *     = git status
 */
function parseQuiz(lines) {
  const questions = [];
  let current = null;
  for (const line of lines) {
    if (line.startsWith('? ')) {
      current = { prompt: line.slice(2).trim(), options: [], accept: [], answer: -1 };
      questions.push(current);
    } else if (current && line.startsWith('- ')) {
      const text = line.slice(2).trim();
      const correct = text.endsWith(' *');
      if (correct) current.answer = current.options.length;
      current.options.push(correct ? text.slice(0, -2).trim() : text);
    } else if (current && line.startsWith('= ')) {
      current.accept.push(line.slice(2).trim());
    } else if (current && line.trim()) {
      current.prompt += ` ${line.trim()}`;
    }
  }
  return questions.map(({ prompt, options, accept, answer }) => (options.length ? { type: 'choice', prompt, options, answer } : { type: 'text', prompt, accept }));
}

/**
 * A course's reviewer (`_reviewer.md`): an optional intro followed by one
 * "## " section per chapter, in chapter order.
 * @returns {{ intro: string, sections: { title: string, body: string }[] }}
 */
export function parseReviewer(text = '') {
  const [intro, ...sections] = splitSections(text);
  return {
    intro: intro.lines
      .filter((line) => !line.startsWith('# '))
      .join('\n')
      .trim(),
    sections: sections.map(({ heading, lines }) => ({ title: heading, body: lines.join('\n').trim() })),
  };
}

/**
 * @param {string} text  the raw Markdown file
 * @returns {{ title?: string, learn: string, task?: string, hints?: string[], questions?: object[],
 *             files?: { name: string, lang: string, code: string, readOnly: boolean }[],
 *             solution?: Record<string, string> }}
 */
export function parseLessonFile(text) {
  const [intro, ...sections] = splitSections(text);
  const lesson = {};

  const titleAt = intro.lines.findIndex((line) => line.startsWith('# '));
  if (titleAt !== -1) lesson.title = intro.lines[titleAt].slice(2).trim();
  lesson.learn = intro.lines
    .filter((_, i) => i !== titleAt)
    .join('\n')
    .trim();

  const files = [];
  const solution = {};

  for (const { heading, lines } of sections) {
    const [, word, name = ''] = /^(\w+)(?::\s*(.+))?$/.exec(heading) || [];
    switch ((word || '').toLowerCase()) {
      case 'task':
        lesson.task = lines.join('\n').trim();
        break;
      case 'hints':
        lesson.hints = bullets(lines);
        break;
      case 'quiz':
        lesson.questions = parseQuiz(lines);
        break;
      case 'starter':
      case 'given':
        files.push({ name, code: fenceContent(lines), readOnly: word.toLowerCase() === 'given' });
        break;
      case 'solution':
        solution[name] = fenceContent(lines);
        break;
      default:
        throw new Error(`Unknown section "## ${heading}" in a lesson file`);
    }
  }

  if (files.length) lesson.files = files;
  if (Object.keys(solution).length) lesson.solution = solution;
  return lesson;
}

export const langOf = (fileName) => LANG_BY_EXTENSION[fileName.split('.').pop()] || 'html';
