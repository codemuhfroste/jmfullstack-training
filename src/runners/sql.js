/**
 * runners/sql.js — SQL lessons, powered by SQLite compiled to WebAssembly
 * (sql.js). The engine is only downloaded the first time a SQL lesson or the
 * SQL playground is opened.
 *
 * Every run starts from a fresh in-memory database built from the lesson's
 * `setup` script, so a mistaken DELETE never carries over to the next try.
 */

import { deepEqual } from './compare.js';

let enginePromise = null;

function loadEngine() {
  enginePromise ??= Promise.all([import('sql.js'), import('sql.js/dist/sql-wasm-browser.wasm?url')]).then(([module, wasm]) =>
    (module.default || module)({ locateFile: () => wasm.default }),
  );
  // A failed download should be retried on the next run, not cached forever.
  enginePromise.catch(() => {
    enginePromise = null;
  });
  return enginePromise;
}

/** @typedef {{ columns: string[], values: any[][] }} ResultSet */

async function freshDatabase(setup) {
  const SQL = await loadEngine();
  const db = new SQL.Database();
  if (setup) db.run(setup);
  return db;
}

/**
 * Run SQL against a fresh copy of the database.
 * @returns {Promise<{ sets: ResultSet[], error: string|null, changes: number }>}
 */
export async function runSql(setup, code) {
  const db = await freshDatabase(setup);
  try {
    const sets = db.exec(code);
    return { sets, error: null, changes: db.getRowsModified() };
  } catch (err) {
    return { sets: [], error: err.message || String(err), changes: 0 };
  } finally {
    db.close();
  }
}

/** Every table in the database with all of its rows. */
export async function describeTables(setup) {
  const db = await freshDatabase(setup);
  try {
    const names = db.exec("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY rowid")[0]?.values ?? [];
    return names.map(([name]) => ({ name, ...(db.exec(`SELECT * FROM "${name}"`)[0] ?? { columns: [], values: [] }) }));
  } finally {
    db.close();
  }
}

const normalizeColumn = (name) => name.toLowerCase().replace(/\s+/g, '');

/**
 * Grade a SQL lesson.
 *
 * Read lessons compare the learner's last result set with the solution's.
 * Write lessons (INSERT/UPDATE/DELETE) define `verify`: a query run after
 * both scripts whose results must match.
 *
 * @param {{ setup: string, solutionCode: string, verify?: string, ordered?: boolean, anyColumns?: boolean }} lesson
 * @param {string} code
 * @returns {Promise<{ error: string|null, sets: ResultSet[], got: ResultSet|null, want: ResultSet|null,
 *                     columnsOk: boolean, rowsOk: boolean }>}
 */
export async function gradeSql(lesson, code) {
  const [userDb, referenceDb] = await Promise.all([freshDatabase(lesson.setup), freshDatabase(lesson.setup)]);
  try {
    const referenceSets = referenceDb.exec(lesson.solutionCode);
    let sets;
    try {
      sets = userDb.exec(code);
    } catch (err) {
      return { error: err.message || String(err), sets: [], got: null, want: null, columnsOk: false, rowsOk: false };
    }

    const want = (lesson.verify ? referenceDb.exec(lesson.verify)[0] : referenceSets.at(-1)) ?? { columns: [], values: [] };
    const got = (lesson.verify ? userDb.exec(lesson.verify)[0] : sets.at(-1)) ?? null;

    const columnsOk =
      Boolean(got) &&
      got.columns.length === want.columns.length &&
      (lesson.verify || lesson.anyColumns || got.columns.every((name, i) => normalizeColumn(name) === normalizeColumn(want.columns[i])));

    const sorted = (rows) => (lesson.ordered ? rows : [...rows].sort((a, b) => (JSON.stringify(a) < JSON.stringify(b) ? -1 : 1)));
    const rowsOk = Boolean(got) && got.columns.length === want.columns.length && deepEqual(sorted(got.values), sorted(want.values));

    return { error: null, sets, got, want, columnsOk: Boolean(columnsOk), rowsOk };
  } finally {
    userDb.close();
    referenceDb.close();
  }
}

/** The result a correct answer produces, for the "Expected" tab. */
export async function expectedResult(lesson) {
  const db = await freshDatabase(lesson.setup);
  try {
    const sets = db.exec(lesson.solutionCode);
    return (lesson.verify ? db.exec(lesson.verify)[0] : sets.at(-1)) ?? { columns: [], values: [] };
  } finally {
    db.close();
  }
}
