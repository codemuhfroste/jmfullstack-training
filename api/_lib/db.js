/**
 * api/_lib/db.js — the database connection and schema.
 *
 * Production: Turso, configured through two environment variables
 *   TURSO_DATABASE_URL   libsql://<database>-<org>.turso.io
 *   TURSO_AUTH_TOKEN     a database token
 * Local development: with no TURSO_DATABASE_URL set, a SQLite file at
 * .data/local.db is used, so the app runs without any account.
 *
 * (Files and folders starting with "_" are not turned into routes by Vercel.)
 */

import { mkdirSync } from 'node:fs';

/** Thrown when the deployment has no database configured. */
export class NotConfiguredError extends Error {}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
     id            INTEGER PRIMARY KEY,
     username      TEXT    NOT NULL UNIQUE,
     password_hash TEXT    NOT NULL,
     created_at    INTEGER NOT NULL
   )`,
  // Only the SHA-256 of a session token is stored, never the token itself.
  `CREATE TABLE IF NOT EXISTS sessions (
     token_hash TEXT    PRIMARY KEY,
     user_id    INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
     expires_at INTEGER NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS sessions_user ON sessions (user_id)`,
  // One row per user: the saved progress, plus the numbers the leaderboard shows.
  `CREATE TABLE IF NOT EXISTS progress (
     user_id      INTEGER PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
     state        TEXT    NOT NULL,
     display_name TEXT    NOT NULL DEFAULT '',
     avatar       INTEGER NOT NULL DEFAULT 0,
     xp           INTEGER NOT NULL DEFAULT 0,
     lessons      INTEGER NOT NULL DEFAULT 0,
     streak       INTEGER NOT NULL DEFAULT 0,
     updated_at   INTEGER NOT NULL
   )`,
  // Failed logins and sign-ups, for rate limiting.
  `CREATE TABLE IF NOT EXISTS attempts (
     key TEXT    NOT NULL,
     at  INTEGER NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS attempts_key ON attempts (key, at)`,
];

let ready = null;

async function connect() {
  const url = process.env.TURSO_DATABASE_URL;

  if (!url) {
    // On Vercel the filesystem is read-only: a local file would never work.
    if (process.env.VERCEL) throw new NotConfiguredError('TURSO_DATABASE_URL is not set');
    mkdirSync('.data', { recursive: true });
  }

  // A remote database only needs HTTP, so use the client without the native
  // SQLite library. The local file is the one case that needs the full one.
  const { createClient } = url ? await import('@libsql/client/web') : await import('@libsql/client');
  const client = createClient({
    url: url || 'file:.data/local.db',
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  await client.batch(SCHEMA, 'write');
  return client;
}

/**
 * The shared client. The schema is created on first use, once per server
 * instance, so a brand-new Turso database needs no manual setup.
 * @returns {Promise<import('@libsql/client').Client>}
 */
export function db() {
  ready ??= connect();
  // A failed connection should be retried on the next request.
  ready.catch(() => {
    ready = null;
  });
  return ready;
}
