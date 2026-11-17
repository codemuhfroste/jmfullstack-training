/**
 * GET /api/progress                         the saved progress of the logged-in user
 * PUT /api/progress { state, xp, streak, base }   save it
 *
 * `state` is the app's progress object, stored as-is (JSON). `base` is the
 * `updatedAt` the client last saw: if someone saved from another device in
 * the meantime the answer is 409 with the newer state, so the client can
 * merge the two and try again instead of overwriting.
 */

import { db } from './_lib/db.js';
import { route, send, readJson, HttpError } from './_lib/http.js';
import { requireUser, now } from './_lib/auth.js';

const MAX_STATE_BYTES = 400_000;
const MAX_XP_PER_LESSON = 25;

const clampInt = (value, min, max) => Math.min(max, Math.max(min, Math.trunc(Number(value)) || 0));

async function load(userId) {
  const result = await (await db()).execute({ sql: 'SELECT state, updated_at FROM progress WHERE user_id = ?', args: [userId] });
  const row = result.rows[0];
  return row ? { state: JSON.parse(String(row.state)), updatedAt: Number(row.updated_at) } : { state: null, updatedAt: 0 };
}

export default route({
  async GET(req, res) {
    const user = await requireUser(req);
    send(res, 200, await load(user.id));
  },

  async PUT(req, res) {
    const user = await requireUser(req);
    const body = await readJson(req);
    const state = body.state;
    if (state === null || typeof state !== 'object' || Array.isArray(state)) throw new HttpError(400, 'Missing progress.');

    const json = JSON.stringify(state);
    if (json.length > MAX_STATE_BYTES) throw new HttpError(413, 'Your saved code is too large to sync. Reset a few lessons to their starter code.');

    const current = await load(user.id);
    if (current.updatedAt !== clampInt(body.base, 0, Number.MAX_SAFE_INTEGER)) {
      return send(res, 409, { error: 'Progress was saved from another device.', ...current });
    }

    // The leaderboard numbers come from the browser, which could lie. Keep
    // them at least plausible: nobody has more XP than their lessons allow.
    const completed = state.completed && typeof state.completed === 'object' ? Object.keys(state.completed).length : 0;
    const lessons = clampInt(completed, 0, 10_000);
    const xp = clampInt(body.xp, 0, lessons * MAX_XP_PER_LESSON);
    const streak = clampInt(body.streak, 0, 3650);
    const displayName = String(state.profile?.name ?? '').trim().slice(0, 24);
    const avatar = clampInt(state.profile?.avatar, 0, 5);

    // Two saves in the same second must still get different version numbers.
    const updatedAt = Math.max(now(), current.updatedAt + 1);

    await (await db()).execute({
      sql: `INSERT INTO progress (user_id, state, display_name, avatar, xp, lessons, streak, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (user_id) DO UPDATE SET
              state = excluded.state, display_name = excluded.display_name, avatar = excluded.avatar,
              xp = excluded.xp, lessons = excluded.lessons, streak = excluded.streak, updated_at = excluded.updated_at`,
      args: [user.id, json, displayName, avatar, xp, lessons, streak, updatedAt],
    });

    send(res, 200, { updatedAt });
  },
});
