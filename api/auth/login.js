/**
 * POST /api/auth/login   { username, password }
 */

import { db } from '../_lib/db.js';
import { route, send, readJson, clientIp, HttpError } from '../_lib/http.js';
import { verifyPassword, fakeVerify, startSession, throttle, record } from '../_lib/auth.js';

export default route({
  async POST(req, res) {
    const body = await readJson(req);
    const username = String(body.username ?? '').trim().toLowerCase().slice(0, 40);
    const password = String(body.password ?? '').slice(0, 200);
    if (!username || !password) throw new HttpError(400, 'Enter your username and password.');

    // Slow down guessing: per account and per address.
    const byUser = `login:user:${username}`;
    const byIp = `login:ip:${clientIp(req)}`;
    await throttle(byUser, 8, 900);
    await throttle(byIp, 40, 900);

    const found = await (await db()).execute({ sql: 'SELECT id, username, password_hash FROM users WHERE username = ?', args: [username] });
    const user = found.rows[0];

    let ok = false;
    if (user) ok = await verifyPassword(password, user.password_hash);
    else await fakeVerify(password);

    if (!ok) {
      await record(byUser, byIp);
      // The same message either way, so nobody can test which usernames exist.
      throw new HttpError(401, 'Wrong username or password.');
    }

    await startSession(req, res, Number(user.id));
    send(res, 200, { user: { username: String(user.username) } });
  },
});
