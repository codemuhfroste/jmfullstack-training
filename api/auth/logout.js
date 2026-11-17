/**
 * POST /api/auth/logout
 */

import { route, send } from '../_lib/http.js';
import { endSession } from '../_lib/auth.js';

export default route({
  async POST(req, res) {
    await endSession(req, res);
    send(res, 200, { ok: true });
  },
});
