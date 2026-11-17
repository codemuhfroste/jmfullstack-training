/**
 * PHP course — structure and grading.
 *
 * Two kinds of lesson live in ./php/:
 *   - `<id>.md` alone: a complete lesson, graded on printed output.
 *   - `<id>.json` (+ an optional `<id>.md` with the "Learn" text): a function
 *     exercise graded by a hidden test harness. The JSON format is described
 *     in README.md.
 */

const modules = import.meta.glob('./php/*.json', { eager: true });
const exercises = Object.fromEntries(Object.values(modules).map((module) => [module.default.id, module.default]));

const XP_BY_LEVEL = { basics: 15, strings: 15, arrays: 20, functions: 20, oop: 25, practical: 25 };

/** Adapt an exercise JSON file to the lesson shape. */
function exercise(id) {
  const data = exercises[id];
  return {
    id,
    title: data.title,
    task: data.prompt,
    taskPlain: true, // the prompt is pre-formatted text, not Markdown
    starter: data.starterCode,
    solution: data.solution,
    hints: data.hints,
    functionName: data.functionName,
    tests: data.tests,
    xp: XP_BY_LEVEL[data.level] ?? 15,
  };
}

export default {
  id: 'php',
  title: 'PHP',
  layer: 'Server',
  mark: 'php',
  color: '#9b8cff',
  kind: 'php',
  tagline: 'Move to the back end.',
  description: 'Real PHP 8.4 running in your browser. Go from echo to classes, then validate a form and crunch JSON like a production back end.',
  chapters: [
    {
      id: 'hello',
      title: 'Hello, server',
      summary: 'What the back end is, and your first lines of PHP.',
      lessons: [
        { id: 'hello-server', expectOutput: 'Hello from the server!' },
        {
          id: 'variables-math',
          expectOutput: '3 x Latte = 360',
          sourceChecks: [
            { label: 'Stores the result in $total', test: (code) => /\$total\s*=/.test(code) },
            { label: 'Builds the line from the variables', test: (code) => !/360/.test(code) && !/x Latte/.test(code) },
          ],
        },
      ],
    },
    {
      id: 'basics',
      title: 'The basics',
      summary: 'Functions, decisions and loops.',
      lessons: [exercise('01-greeting'), exercise('02-grade-letter'), exercise('03-fizzbuzz')],
    },
    {
      id: 'strings',
      title: 'Strings',
      summary: 'Splitting, cleaning and comparing text.',
      lessons: [exercise('04-reverse-words'), exercise('05-palindrome')],
    },
    {
      id: 'arrays',
      title: 'Arrays',
      summary: 'Lists, records, and processing them in one go.',
      lessons: [exercise('06-square-evens'), exercise('07-group-by')],
    },
    {
      id: 'functions',
      title: 'Functions in depth',
      summary: 'Default parameters and recursion.',
      lessons: [exercise('08-slugify'), exercise('09-flatten')],
    },
    {
      id: 'objects',
      title: 'Objects',
      summary: 'Classes, methods and exceptions.',
      lessons: [exercise('10-bank-account')],
    },
    {
      id: 'real-world',
      title: 'Real-world PHP',
      summary: 'The jobs a back end does every day.',
      lessons: [
        { ...exercise('11-validate-form'), challenge: true },
        { ...exercise('12-json-summary'), challenge: true },
      ],
    },
  ],
};
