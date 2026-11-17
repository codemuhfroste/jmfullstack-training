/**
 * GET /api/leaderboard   everyone with an account, highest XP first
 *
 * Only for logged-in users, and it exposes nothing but what a leaderboard
 * needs: username, display name, avatar colour, XP, lessons and streak.
 */

import { db } from './_lib/db.js';
import { route, send } from './_lib/http.js';
import { requireUser, now } from './_lib/auth.js';

const STREAK_FRESH_SECONDS = 2 * 86400;

export default route({
  async GET(req, res) {
    const user = await requireUser(req);
    const result = await (await db()).execute(
      `SELECT users.username, progress.display_name, progress.avatar, progress.xp, progress.lessons, progress.streak, progress.updated_at
       FROM users LEFT JOIN progress ON progress.user_id = users.id
       ORDER BY COALESCE(progress.xp, 0) DESC, COALESCE(progress.lessons, 0) DESC, users.id ASC
       LIMIT 100`,
    );

    const cutoff = now() - STREAK_FRESH_SECONDS;
    send(res, 200, {
      players: result.rows.map((row) => ({
        username: String(row.username),
        name: String(row.display_name || ''),
        avatar: Number(row.avatar || 0),
        xp: Number(row.xp || 0),
        lessons: Number(row.lessons || 0),
        // A streak is only still alive if the player was here recently.
        streak: Number(row.updated_at || 0) >= cutoff ? Number(row.streak || 0) : 0,
        you: String(row.username) === user.username,
      })),
    });
  },
});
