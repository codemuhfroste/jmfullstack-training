/**
 * SQL course — structure and grading. Lesson text lives in ./sql/*.md.
 *
 * Every lesson runs against a fresh copy of the database built by `setup`.
 * A lesson passes when its result matches the result of the solution in its
 * .md file, so there is no expected data to keep in sync by hand:
 *   - read lessons compare the last result set (row order only if `ordered`)
 *   - write lessons set `verify`, a query run afterwards on both databases
 */

export const BREWLINE_DB = `
CREATE TABLE menu (
  id       INTEGER PRIMARY KEY,
  name     TEXT    NOT NULL,
  category TEXT    NOT NULL,
  price    INTEGER NOT NULL
);

INSERT INTO menu (name, category, price) VALUES
  ('Espresso',       'coffee', 90),
  ('Latte',          'coffee', 120),
  ('Mocha',          'coffee', 135),
  ('Cold Brew',      'coffee', 110),
  ('Chai',           'tea',    100),
  ('Green Tea',      'tea',    85),
  ('Croissant',      'pastry', 75),
  ('Day-old Muffin', 'pastry', 40);

CREATE TABLE orders (
  id       INTEGER PRIMARY KEY,
  customer TEXT    NOT NULL,
  item_id  INTEGER NOT NULL REFERENCES menu (id),
  qty      INTEGER NOT NULL
);

INSERT INTO orders (customer, item_id, qty) VALUES
  ('Ana', 2, 2),
  ('Ben', 1, 1),
  ('Ana', 7, 1),
  ('Cy',  3, 2),
  ('Dee', 2, 1),
  ('Ben', 5, 3),
  ('Eli', 4, 2);
`;

const lesson = (id, extra = {}) => ({ id, setup: BREWLINE_DB, ...extra });

export default {
  id: 'sql',
  title: 'SQL',
  layer: 'Data',
  mark: 'SQL',
  color: '#3ddc97',
  kind: 'sql',
  tagline: 'Remember everything.',
  description: 'The bottom of the stack: the database. Query, add, change and combine data with real SQLite running in your browser.',
  chapters: [
    {
      id: 'reading',
      title: 'Reading data',
      summary: 'SELECT, and choosing which rows come back.',
      lessons: [lesson('select'), lesson('where'), lesson('order-limit', { ordered: true })],
    },
    {
      id: 'writing',
      title: 'Changing data',
      summary: 'INSERT, UPDATE and DELETE.',
      lessons: [
        lesson('insert', { verify: "SELECT name, category, price FROM menu WHERE name = 'Matcha Latte' OR id > 8 ORDER BY id" }),
        lesson('update-delete', { verify: 'SELECT id, name, category, price FROM menu ORDER BY id' }),
      ],
    },
    {
      id: 'reports',
      title: 'Answering questions',
      summary: 'Aggregates, grouping, and joining tables.',
      lessons: [lesson('aggregate'), lesson('join', { ordered: true, challenge: true })],
    },
  ],
};
