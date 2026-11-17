/**
 * PHP + SQL course — structure and grading. Lesson text lives in ./backend/*.md.
 *
 * Every lesson ships a "Given: helpers.php" file whose db() function returns
 * a PDO connection to an in-memory SQLite database. All tests of one check
 * share that connection, so in the write lessons each test sees the rows
 * added by the tests before it (ids count up: 6, 7, …).
 */

const usesPrepare = { label: 'Uses a prepared statement', test: (code) => /->\s*prepare\s*\(/.test(code) };

export default {
  id: 'backend',
  title: 'PHP + SQL',
  layer: 'Full stack',
  mark: 'PDO',
  color: '#ff9f43',
  kind: 'php',
  tagline: 'Connect the layers.',
  description: 'Where it all comes together: PHP querying a real database with PDO, safely, then handling a complete order from validation to saved row.',
  chapters: [
    {
      id: 'connecting',
      title: 'Connecting',
      summary: 'PDO, queries, and reading results.',
      lessons: [
        {
          id: 'query',
          xp: 15,
          functionName: 'menuNames',
          tests: [{ input: [], expected: ['Espresso', 'Latte', 'Mocha', 'Chai', 'Croissant'] }],
        },
      ],
    },
    {
      id: 'safe-queries',
      title: 'Safe queries',
      summary: 'Prepared statements and single rows.',
      lessons: [
        {
          id: 'prepared',
          xp: 15,
          functionName: 'itemsUnder',
          tests: [
            { input: [100], expected: [{ name: 'Croissant', price: 75 }, { name: 'Espresso', price: 90 }] },
            { input: [80], expected: [{ name: 'Croissant', price: 75 }] },
            { input: [10], expected: [] },
            { input: [1000], expected: [{ name: 'Croissant', price: 75 }, { name: 'Espresso', price: 90 }, { name: 'Chai', price: 100 }, { name: 'Latte', price: 120 }, { name: 'Mocha', price: 135 }] },
          ],
          sourceChecks: [usesPrepare],
        },
        {
          id: 'fetch-one',
          xp: 15,
          functionName: 'findItem',
          tests: [
            { input: ['Latte'], expected: { id: 2, name: 'Latte', category: 'coffee', price: 120 } },
            { input: ['Tea'], expected: null },
            { input: ['Croissant'], expected: { id: 5, name: 'Croissant', category: 'pastry', price: 75 } },
          ],
          sourceChecks: [usesPrepare],
        },
      ],
    },
    {
      id: 'writing',
      title: 'Writing data',
      summary: 'Inserts, new ids, and a complete request.',
      lessons: [
        {
          id: 'insert',
          xp: 15,
          functionName: 'addItem',
          tests: [
            { input: ['Matcha Latte', 'tea', 150], expected: 6 },
            { input: ['Bagel', 'pastry', 60], expected: 7 },
          ],
          sourceChecks: [usesPrepare],
        },
        {
          id: 'place-order',
          challenge: true,
          functionName: 'placeOrder',
          tests: [
            { input: ['Ana', 'Latte', 2], expected: { ok: true, orderId: 1, total: 240 } },
            { input: ['Ben', 'Tea', 1], expected: { ok: false, error: 'Unknown item' } },
            { input: ['Cy', 'Mocha', 0], expected: { ok: false, error: 'Quantity must be at least 1' } },
            { input: ['Dee', 'Croissant', 3], expected: { ok: true, orderId: 2, total: 225 } },
          ],
          sourceChecks: [usesPrepare],
        },
      ],
    },
  ],
};
