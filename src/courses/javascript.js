/**
 * JavaScript course — structure and grading. Lesson text lives in ./javascript/*.md.
 *
 * The first two chapters are pure logic and run in a Web Worker (kind 'js'):
 *   - `expectOutput`           compares what console.log printed
 *   - `functionName` + `tests` calls the function and compares return values
 * The last chapter works with a real page (kind 'web'); its checks follow the
 * rules described at the top of html.js.
 */

const MENU = [
  { name: 'Espresso', price: 90 },
  { name: 'Latte', price: 120 },
  { name: 'Mocha', price: 135 },
  { name: 'Cold Brew', price: 110 },
];

export default {
  id: 'javascript',
  title: 'JavaScript',
  layer: 'Behaviour',
  mark: 'JS',
  color: '#f5c542',
  kind: 'js',
  tagline: 'Make it do something.',
  description: 'Variables, decisions, loops and functions, then the part that matters on the web: reacting to clicks and building pages from data.',
  chapters: [
    {
      id: 'basics',
      title: 'Talking to the computer',
      summary: 'Output, variables, decisions and loops.',
      lessons: [
        { id: 'console-log', expectOutput: 'Welcome to Brewline!' },
        {
          id: 'variables',
          expectOutput: 'Latte x2 = 240',
          sourceChecks: [
            { label: 'Declares a variable named total', test: (code) => /\b(const|let|var)\s+total\b/.test(code) },
            { label: 'Builds the line from the variables', test: (code) => !/240/.test(code) && !/Latte x/.test(code) },
          ],
        },
        {
          id: 'conditionals',
          functionName: 'sizeLabel',
          tests: [
            { input: [240], expected: 'small' },
            { input: [299], expected: 'small' },
            { input: [300], expected: 'medium' },
            { input: [449], expected: 'medium' },
            { input: [450], expected: 'large' },
            { input: [600], expected: 'large' },
          ],
        },
        {
          id: 'loops',
          functionName: 'totalCups',
          tests: [
            { input: [[2, 1, 3]], expected: 6 },
            { input: [[5]], expected: 5 },
            { input: [[]], expected: 0 },
            { input: [[1, 1, 1, 1, 10]], expected: 14 },
          ],
        },
      ],
    },
    {
      id: 'data',
      title: 'Working with data',
      summary: 'Objects, arrays of objects, and the methods that tame them.',
      lessons: [
        {
          id: 'objects',
          functionName: 'countItems',
          tests: [
            { input: [['latte', 'mocha', 'latte']], expected: { latte: 2, mocha: 1 } },
            { input: [['chai']], expected: { chai: 1 } },
            { input: [[]], expected: {} },
            { input: [['a', 'b', 'a', 'c', 'a', 'b']], expected: { a: 3, b: 2, c: 1 } },
          ],
        },
        {
          id: 'array-methods',
          functionName: 'namesFrom',
          tests: [
            { input: [MENU, 100], expected: ['Latte', 'Mocha', 'Cold Brew'] },
            { input: [MENU, 120], expected: ['Latte', 'Mocha'] },
            { input: [MENU, 0], expected: ['Espresso', 'Latte', 'Mocha', 'Cold Brew'] },
            { input: [MENU, 500], expected: [] },
            { input: [[], 10], expected: [] },
          ],
        },
      ],
    },
    {
      id: 'page',
      title: 'Bringing pages to life',
      summary: 'The DOM, events, and rendering from data.',
      lessons: [
        {
          id: 'dom-select',
          kind: 'web',
          checks: [
            { label: '#status says "We are open!"', test: (doc, win, h) => h.text(h.q('#status')) === 'We are open!' || 'Set the textContent of #status to exactly: We are open!' },
            { label: '#status has the class "open"', test: (doc, win, h) => Boolean(h.q('#status.open')) || 'Use classList.add("open") on the element.' },
            { label: 'The text is set from script.js', test: (doc, win, h, src) => !/We are open/.test(src['index.html']) || 'Leave index.html as it is and set the text with JavaScript.' },
          ],
        },
        {
          id: 'events',
          kind: 'web',
          checks: [
            { label: 'The count starts at 0', test: (doc, win, h) => h.text(h.q('#count')) === '0' || 'Before any click, #count should still show 0.' },
            {
              label: 'One click shows 1',
              test: (doc, win, h) => {
                h.q('#add').click();
                return h.text(h.q('#count')) === '1' || 'After one click #count should show 1. Is the listener attached to #add?';
              },
            },
            {
              label: 'Three more clicks show 4',
              test: (doc, win, h) => {
                for (let i = 0; i < 3; i++) h.q('#add').click();
                return h.text(h.q('#count')) === '4' || 'Every click should add one. Keep the counter variable outside the listener.';
              },
            },
          ],
        },
        {
          id: 'render-menu',
          kind: 'web',
          challenge: true,
          checks: [
            { label: '#menu contains 4 list items', test: (doc, win, h) => h.all('#menu > li').length === 4 || 'Create one <li> per menu item and append it to #menu.' },
            {
              label: 'Each item reads "Name: price"',
              test: (doc, win, h) => {
                const items = h.all('#menu > li').map((li) => h.text(li));
                return (items[0] === 'Espresso: 90' && items[3] === 'Cold Brew: 110') || 'The first item should read exactly "Espresso: 90" and the last "Cold Brew: 110".';
              },
            },
            { label: '#total shows 455', test: (doc, win, h) => h.text(h.q('#total')) === '455' || 'Add up every price and put the sum in #total.' },
            {
              label: 'The list and total are calculated, not typed in',
              test: (doc, win, h, src) => (!/455/.test(src['script.js']) && !/Espresso:/.test(src['script.js'])) || 'Build the text from item.name and item.price, and add the prices up in the loop.',
            },
          ],
        },
      ],
    },
  ],
};
