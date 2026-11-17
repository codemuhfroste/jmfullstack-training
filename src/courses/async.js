/**
 * Async JavaScript course — structure and grading. Lesson text lives in ./async/*.md.
 *
 * Lessons with a "Given: helpers.js" file get `fetchPrice()` defined before
 * the learner's code runs. Test functions may be async: results are awaited.
 */

const ORDER = JSON.stringify([
  { name: 'Latte', price: 120, qty: 2 },
  { name: 'Croissant', price: 75, qty: 1 },
]);

export default {
  id: 'async',
  title: 'Async JavaScript',
  layer: 'Network',
  mark: 'API',
  color: '#ff8fb1',
  kind: 'js',
  tagline: 'Talk to a server.',
  description: 'The bridge between front end and back end: JSON, promises, async/await, and handling the errors every network eventually throws at you.',
  chapters: [
    {
      id: 'data',
      title: 'Data in transit',
      summary: 'JSON, the format the two halves of the stack speak.',
      lessons: [
        {
          id: 'json',
          functionName: 'orderTotal',
          tests: [
            { input: ['[{"name":"Latte","price":120,"qty":2}]'], expected: 240 },
            { input: [ORDER], expected: 315 },
            { input: ['[]'], expected: 0 },
          ],
        },
      ],
    },
    {
      id: 'waiting',
      title: 'Waiting for answers',
      summary: 'Promises, async/await, and failures.',
      lessons: [
        {
          id: 'promises',
          functionName: 'priceLabel',
          tests: [
            { input: ['Latte'], expected: 'Latte: 120' },
            { input: ['Cold Brew'], expected: 'Cold Brew: 110' },
          ],
        },
        {
          id: 'async-await',
          functionName: 'orderTotal',
          tests: [
            { input: [['Latte', 'Mocha']], expected: 255 },
            { input: [['Espresso', 'Espresso', 'Cold Brew']], expected: 290 },
            { input: [[]], expected: 0 },
          ],
        },
        {
          id: 'errors',
          functionName: 'safePrice',
          tests: [
            { input: ['Latte'], expected: 120 },
            { input: ['Tea'], expected: -1 },
            { input: ['Espresso'], expected: 90 },
          ],
        },
      ],
    },
    {
      id: 'parallel',
      title: 'Many at once',
      summary: 'Running requests side by side.',
      lessons: [
        {
          id: 'promise-all',
          challenge: true,
          functionName: 'menuReport',
          tests: [
            { input: [['Espresso', 'Mocha', 'Latte']], expected: { total: 345, priciest: 'Mocha' } },
            { input: [['Cold Brew']], expected: { total: 110, priciest: 'Cold Brew' } },
            { input: [['Latte', 'Espresso']], expected: { total: 210, priciest: 'Latte' } },
          ],
          sourceChecks: [{ label: 'Uses Promise.all', test: (code) => /Promise\.all\s*\(/.test(code) }],
        },
      ],
    },
  ],
};
