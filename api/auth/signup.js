/**
 * POST /api/auth/signup   { username, password, code? }
 *
 * Creates an account and logs it in. If the SIGNUP_CODE environment variable
 * is set, the same code must be supplied: a simple way to keep a public
 * deployment to you and the friends you share the code with.
 */

import { timingSafeEqual } from 'node:crypto';
import { db } from '../_lib/db.js';
import { route, send, readJson, clientIp, HttpError } from '../_lib/http.js';
import { cleanUsername, checkPassword, hashPassword, startSession, throttle, record, now } from '../_lib/auth.js';

function sameText(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export default route({
  async POST(req, res) {
    const body = await readJson(req);
    const ip = `signup:${clientIp(req)}`;
    await throttle(ip, 10, 3600);

    const required = process.env.SIGNUP_CODE;
    if (required && !sameText(String(body.code ?? '').trim(), required)) {
      await record(ip);
      throw new HttpError(403, 'That invite code is not right. Ask whoever runs this site for it.');
    }

    const username = cleanUsername(body.username);
    const password = checkPassword(body.password);
    const client = await db();

    const taken = await client.execute({ sql: 'SELECT 1 FROM users WHERE username = ?', args: [username] });
    if (taken.rows.length) throw new HttpError(409, 'That username is taken. Try another one.');

    let userId;
    try {
      const created = await client.execute({
        sql: 'INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)',
        args: [username, await hashPassword(password), now()],
      });
      userId = Number(created.lastInsertRowid);
    } catch (err) {
      // Two sign-ups for the same name at the same moment: the UNIQUE index decides.
      if (/UNIQUE/i.test(String(err.message))) throw new HttpError(409, 'That username is taken. Try another one.');
      throw err;
    }

    await record(ip);
    await startSession(req, res, userId);
    send(res, 201, { user: { username } });
  },
});
