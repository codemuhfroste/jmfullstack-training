/**
 * GET    /api/me                     who is logged in, and how sign-up works here
 * PATCH  /api/me   { password, newPassword }   change the password
 * DELETE /api/me   { password }      delete the account and everything saved for it
 */

import { db } from './_lib/db.js';
import { route, send, readJson, HttpError } from './_lib/http.js';
import { currentUser, requireUser, verifyPassword, checkPassword, hashPassword, startSession, endSession, throttle, record } from './_lib/auth.js';

/** Sensitive changes ask for the current password again. */
async function confirmPassword(user, password) {
  const key = `confirm:${user.id}`;
  await throttle(key, 8, 900);
  const row = (await (await db()).execute({ sql: 'SELECT password_hash FROM users WHERE id = ?', args: [user.id] })).rows[0];
  if (!row || !(await verifyPassword(String(password ?? '').slice(0, 200), row.password_hash))) {
    await record(key);
    throw new HttpError(403, 'That is not your current password.');
  }
}

export default route({
  async GET(req, res) {
    await db(); // answers 503 when no database is configured
    const user = await currentUser(req);
    send(res, 200, { user: user ? { username: user.username } : null, inviteOnly: Boolean(process.env.SIGNUP_CODE) });
  },

  async PATCH(req, res) {
    const user = await requireUser(req);
    const body = await readJson(req);
    await confirmPassword(user, body.password);
    const newHash = await hashPassword(checkPassword(body.newPassword));

    const client = await db();
    // Changing the password logs out every other device.
    await client.batch(
      [
        { sql: 'UPDATE users SET password_hash = ? WHERE id = ?', args: [newHash, user.id] },
        { sql: 'DELETE FROM sessions WHERE user_id = ?', args: [user.id] },
      ],
      'write',
    );
    await startSession(req, res, user.id);
    send(res, 200, { ok: true });
  },

  async DELETE(req, res) {
    const user = await requireUser(req);
    const body = await readJson(req);
    await confirmPassword(user, body.password);

    const client = await db();
    await client.batch(
      [
        { sql: 'DELETE FROM progress WHERE user_id = ?', args: [user.id] },
        { sql: 'DELETE FROM sessions WHERE user_id = ?', args: [user.id] },
        { sql: 'DELETE FROM users WHERE id = ?', args: [user.id] },
      ],
      'write',
    );
    await endSession(req, res);
    send(res, 200, { ok: true });
  },
});
