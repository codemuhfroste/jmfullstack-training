/**
 * api/_lib/auth.js — passwords, sessions and rate limiting.
 *
 * Passwords are hashed with scrypt (built into Node) and a random salt per
 * user. A session is a random token in an HttpOnly cookie; the database
 * only holds the token's SHA-256, so a leaked database cannot be used to
 * impersonate anyone.
 */

import { scrypt, randomBytes, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { db } from './db.js';
import { HttpError, readCookie, isHttps } from './http.js';

const scryptAsync = promisify(scrypt);

const COOKIE = 'fst_session';
const SESSION_DAYS = 30;
const SCRYPT = { N: 16384, r: 8, p: 1, keyLength: 64 };

export const now = () => Math.floor(Date.now() / 1000);

// ---------------------------------------------------------------------------
// Input rules
// ---------------------------------------------------------------------------

/** Usernames are stored lower-case: 3–20 letters, digits or underscores. */
export function cleanUsername(value) {
  const username = String(value ?? '').trim().toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(username)) throw new HttpError(400, 'Usernames are 3 to 20 characters: letters, numbers and underscores.');
  return username;
}

export function checkPassword(value) {
  const password = String(value ?? '');
  if (password.length < 8) throw new HttpError(400, 'Passwords need at least 8 characters.');
  if (password.length > 200) throw new HttpError(400, 'That password is too long.');
  return password;
}

// ---------------------------------------------------------------------------
// Passwords
// ---------------------------------------------------------------------------

/** @returns {Promise<string>} "scrypt$N$r$p$salt$hash" (base64 parts) */
export async function hashPassword(password) {
  const salt = randomBytes(16);
  const { N, r, p, keyLength } = SCRYPT;
  const hash = await scryptAsync(password, salt, keyLength, { N, r, p });
  return ['scrypt', N, r, p, salt.toString('base64'), hash.toString('base64')].join('$');
}

export async function verifyPassword(password, stored) {
  const [scheme, N, r, p, salt, hash] = String(stored).split('$');
  if (scheme !== 'scrypt') return false;
  const expected = Buffer.from(hash, 'base64');
  const actual = await scryptAsync(password, Buffer.from(salt, 'base64'), expected.length, { N: Number(N), r: Number(r), p: Number(p) });
  return timingSafeEqual(actual, expected);
}

/** Spend the same time as a real check, so a missing user is not detectable by timing. */
export async function fakeVerify(password) {
  await scryptAsync(password, Buffer.alloc(16), SCRYPT.keyLength, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p });
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

const hashToken = (token) => createHash('sha256').update(token).digest('hex');

function cookieHeader(req, value, maxAge) {
  const parts = [`${COOKIE}=${value}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${maxAge}`];
  if (isHttps(req)) parts.push('Secure');
  return parts.join('; ');
}

/** Create a session for the user and set the cookie. */
export async function startSession(req, res, userId) {
  const token = randomBytes(32).toString('base64url');
  const client = await db();
  await client.batch(
    [
      { sql: 'DELETE FROM sessions WHERE expires_at < ?', args: [now()] },
      { sql: 'INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)', args: [hashToken(token), userId, now() + SESSION_DAYS * 86400] },
    ],
    'write',
  );
  res.setHeader('Set-Cookie', cookieHeader(req, token, SESSION_DAYS * 86400));
}

/** Delete the current session and clear the cookie. */
export async function endSession(req, res) {
  const token = readCookie(req, COOKIE);
  if (token) await (await db()).execute({ sql: 'DELETE FROM sessions WHERE token_hash = ?', args: [hashToken(token)] });
  res.setHeader('Set-Cookie', cookieHeader(req, '', 0));
}

/** @returns {Promise<{ id: number, username: string } | null>} */
export async function currentUser(req) {
  const token = readCookie(req, COOKIE);
  if (!token) return null;
  const result = await (await db()).execute({
    sql: `SELECT users.id, users.username
          FROM sessions JOIN users ON users.id = sessions.user_id
          WHERE sessions.token_hash = ? AND sessions.expires_at > ?`,
    args: [hashToken(token), now()],
  });
  const row = result.rows[0];
  return row ? { id: Number(row.id), username: String(row.username) } : null;
}

export async function requireUser(req) {
  const user = await currentUser(req);
  if (!user) throw new HttpError(401, 'Please log in first.');
  return user;
}

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------

/**
 * Refuse the request if `key` has been recorded `limit` times within the
 * window. Call record() for each event that should count.
 */
export async function throttle(key, limit, windowSeconds) {
  const result = await (await db()).execute({ sql: 'SELECT COUNT(*) AS n FROM attempts WHERE key = ? AND at > ?', args: [key, now() - windowSeconds] });
  if (Number(result.rows[0].n) >= limit) throw new HttpError(429, 'Too many attempts. Please wait a few minutes and try again.');
}

export async function record(...keys) {
  const client = await db();
  await client.batch(
    [{ sql: 'DELETE FROM attempts WHERE at < ?', args: [now() - 86400] }, ...keys.map((key) => ({ sql: 'INSERT INTO attempts (key, at) VALUES (?, ?)', args: [key, now()] }))],
    'write',
  );
}
