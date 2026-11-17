/**
 * account.js — the browser side of accounts: logging in and keeping progress
 * in step with the server (the /api routes, backed by Turso).
 *
 * The app stays "local first". Progress is always saved in localStorage, and
 * everything works signed out. With an account, the same progress is also
 * pushed to the server a moment after each change, and pulled on start-up.
 *
 * Two copies of progress (this device and the server, or two devices) are
 * combined with mergeProgress(): a lesson completed anywhere stays completed,
 * counters keep the higher value. Nothing earned is ever lost by syncing.
 */

import { DEVICE_ONLY } from './store.js';

const PUSH_DELAY_MS = 2500;

// ---------------------------------------------------------------------------
// Merging two copies of progress
// ---------------------------------------------------------------------------

/** The part of the state that belongs to the account. */
function snapshot(state) {
  return Object.fromEntries(Object.entries(state).filter(([key]) => !DEVICE_ONLY.includes(key)));
}

/** Combine two { key: value } maps, resolving keys present in both with `pick`. */
function mergeMaps(a = {}, b = {}, pick) {
  const out = { ...a };
  for (const [key, value] of Object.entries(b)) out[key] = key in a ? pick(a[key], value) : value;
  return out;
}

const higher = (a, b) => Math.max(Number(a) || 0, Number(b) || 0);
const either = (a, b) => Boolean(a || b);
/** The earlier of two ISO dates (older saves stored `true` instead of a date). */
const earlier = (a, b) => (typeof a === 'string' && typeof b === 'string' ? (a < b ? a : b) : typeof a === 'string' ? a : b);

/**
 * @param {object} local   progress on this device
 * @param {object} remote  progress from the server
 */
export function mergeProgress(local, remote) {
  return {
    // The name saved in the account wins, so it is the same on every device.
    profile: remote.profile?.name ? remote.profile : (local.profile ?? remote.profile),
    completed: mergeMaps(local.completed, remote.completed, earlier),
    earned: mergeMaps(local.earned, remote.earned, higher),
    firstTry: mergeMaps(local.firstTry, remote.firstTry, either),
    attempts: mergeMaps(local.attempts, remote.attempts, higher),
    submits: mergeMaps(local.submits, remote.submits, higher),
    hintsShown: mergeMaps(local.hintsShown, remote.hintsShown, higher),
    solutionViewed: mergeMaps(local.solutionViewed, remote.solutionViewed, either),
    // Code being worked on right here is more current than the saved copy.
    drafts: { ...remote.drafts, ...local.drafts },
    activity: mergeMaps(local.activity, remote.activity, higher),
    badges: mergeMaps(local.badges, remote.badges, earlier),
    reviewed: mergeMaps(local.reviewed, remote.reviewed, either),
    playgroundRuns: higher(local.playgroundRuns, remote.playgroundRuns),
    lastLesson: local.lastLesson || remote.lastLesson || null,
  };
}

// ---------------------------------------------------------------------------
// Talking to the API
// ---------------------------------------------------------------------------

/** @returns {Promise<{ ok: boolean, status: number, data: any }>} status 0 = no connection */
async function call(path, method = 'GET', body) {
  try {
    const response = await fetch(`/api/${path}`, {
      method,
      credentials: 'same-origin',
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
    let data = {};
    try {
      data = await response.json();
    } catch {
      /* not JSON: a host without the API answers with an HTML page */
    }
    return { ok: response.ok, status: response.status, data };
  } catch {
    return { ok: false, status: 0, data: { error: 'Could not reach the server. Check your connection and try again.' } };
  }
}

const failure = (reply) => ({ ok: false, error: reply.data.error || 'Something went wrong. Please try again.' });

// ---------------------------------------------------------------------------
// The account object
// ---------------------------------------------------------------------------

/**
 * @param {ReturnType<import('./store.js').createStore>} store
 */
export function createAccount(store) {
  const listeners = new Set();

  /**
   * checked:    the first call to the server has finished
   * available:  this deployment has the API and a database
   * sync:       'idle' | 'syncing' | 'synced' | 'offline' | 'error'
   */
  const status = { checked: false, available: false, inviteOnly: false, user: null, sync: 'idle', error: '' };

  let base = 0; // the server's version of our progress that we last saw
  let lastPushed = ''; // JSON of the progress the server already has
  let applying = false; // true while we overwrite local progress ourselves
  let timer = null;
  let queue = Promise.resolve(); // pushes run one at a time

  function notify(patch) {
    Object.assign(status, patch);
    for (const listener of listeners) listener(status);
  }

  function apply(progress) {
    applying = true;
    try {
      store.replaceProgress(progress);
    } finally {
      applying = false;
    }
  }

  /** Fetch the saved progress and fold it into what is on this device. */
  async function pull() {
    const reply = await call('progress');
    if (!reply.ok) return reply;
    base = reply.data.updatedAt;
    if (reply.data.state) {
      lastPushed = JSON.stringify(reply.data.state);
      apply(mergeProgress(snapshot(store.state), reply.data.state));
    }
    return reply;
  }

  async function pushNow() {
    if (!status.user) return;

    for (let attempt = 0; attempt < 3; attempt++) {
      const state = snapshot(store.state);
      const json = JSON.stringify(state);
      if (json === lastPushed) return notify({ sync: 'synced', error: '' });

      notify({ sync: 'syncing', error: '' });
      const reply = await call('progress', 'PUT', { state, xp: store.xp(), streak: store.streak(), base });

      if (reply.ok) {
        base = reply.data.updatedAt;
        lastPushed = json;
        return notify({ sync: 'synced', error: '' });
      }
      if (reply.status === 409 && reply.data.state) {
        // Another device saved first: combine both and send the result.
        base = reply.data.updatedAt;
        apply(mergeProgress(state, reply.data.state));
        continue;
      }
      if (reply.status === 401) {
        base = 0;
        lastPushed = '';
        return notify({ user: null, sync: 'idle', error: 'You were logged out. Log in again to keep syncing.' });
      }
      return notify({ sync: reply.status === 0 ? 'offline' : 'error', error: reply.data.error || '' });
    }
  }

  /** Save progress to the account now. Resolves when it has been tried. */
  function push() {
    clearTimeout(timer);
    queue = queue.then(pushNow).catch((err) => console.warn('[account] sync failed:', err));
    return queue;
  }

  async function enter(user) {
    notify({ user, sync: 'syncing', error: '' });
    await pull();
    await push();
  }

  // Every change to progress is sent a moment later.
  store.subscribe(() => {
    if (!status.user || applying) return;
    clearTimeout(timer);
    timer = setTimeout(push, PUSH_DELAY_MS);
  });

  // Don't sit on unsent changes when the tab is hidden or closed.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && status.user && timer) push();
  });
  window.addEventListener('online', () => {
    if (status.user && status.sync === 'offline') push();
  });

  return {
    status,

    /** Call `fn(status)` whenever the status changes. Returns an unsubscribe function. */
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },

    /** Ask the server who we are. Safe to call when there is no API at all. */
    async init() {
      const reply = await call('me');
      const available = reply.ok && 'user' in reply.data;
      notify({ checked: true, available, inviteOnly: Boolean(reply.data.inviteOnly) });
      if (available && reply.data.user) await enter(reply.data.user);
      return status;
    },

    async signup({ username, password, code }) {
      const reply = await call('auth/signup', 'POST', { username, password, code });
      if (!reply.ok) return failure(reply);
      await enter(reply.data.user);
      return { ok: true };
    },

    async login({ username, password }) {
      const reply = await call('auth/login', 'POST', { username, password });
      if (!reply.ok) return failure(reply);
      await enter(reply.data.user);
      return { ok: true };
    },

    /**
     * Log out. Progress is saved first and then removed from this browser,
     * so the next person to use it starts clean.
     */
    async logout() {
      await push();
      if (!status.user) return { ok: true }; // the session had already expired
      if (status.sync !== 'synced') return { ok: false, error: 'Your latest progress could not be saved, so you are still logged in. Check your connection and try again.' };
      const reply = await call('auth/logout', 'POST', {});
      if (!reply.ok) return failure(reply);
      base = 0;
      lastPushed = '';
      notify({ user: null, sync: 'idle', error: '' });
      apply({});
      return { ok: true };
    },

    async changePassword({ password, newPassword }) {
      const reply = await call('me', 'PATCH', { password, newPassword });
      return reply.ok ? { ok: true } : failure(reply);
    },

    /** Delete the account on the server. Progress stays in this browser. */
    async deleteAccount({ password }) {
      const reply = await call('me', 'DELETE', { password });
      if (!reply.ok) return failure(reply);
      base = 0;
      lastPushed = '';
      notify({ user: null, sync: 'idle', error: '' });
      return { ok: true };
    },

    async leaderboard() {
      const reply = await call('leaderboard');
      return reply.ok ? { ok: true, players: reply.data.players } : failure(reply);
    },

    syncNow: push,
  };
}
