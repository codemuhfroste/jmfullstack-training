/**
 * storage.js — tiny localStorage wrapper.
 *
 * localStorage can throw (private browsing, quota exceeded, disabled storage,
 * corrupted JSON), so every access is wrapped in try/catch and the app keeps
 * working with in-memory state if persistence is unavailable.
 *
 * The *meaning* of the fields lives in store.js; this file only reads/writes
 * and upgrades data saved by the app's previous life as "PHP Terminal Trainer".
 */

const STORAGE_KEY = 'fstraining';
const LEGACY_KEY = 'php-terminal-trainer';

/**
 * Shape of what we persist. Everything has a default.
 * Lesson keys are "<courseId>/<lessonId>", e.g. "php/03-fizzbuzz".
 */
export const DEFAULT_STATE = {
  version: 3,
  profile: { name: '', avatar: 0 },
  settings: { unlockAll: false },
  completed: {}, // { [lessonKey]: ISO date string of first completion }
  earned: {}, // { [lessonKey]: XP awarded for that lesson }
  firstTry: {}, // { [lessonKey]: true } passed on the very first check
  attempts: {}, // { [lessonKey]: number of failed checks }
  submits: {}, // { [lessonKey]: number of checks, pass or fail }
  hintsShown: {}, // { [lessonKey]: number of hints revealed }
  solutionViewed: {}, // { [lessonKey]: true }
  drafts: {}, // { [lessonKey]: { [fileName]: code } }
  activity: {}, // { 'YYYY-MM-DD': number of runs/checks that day }
  badges: {}, // { [badgeId]: ISO date string when it was earned }
  reviewed: {}, // { '<courseId>/<sectionIndex>': true } reviewer sections ticked off
  playground: {}, // { [mode]: { [fileName]: code } }
  playgroundRuns: 0,
  lastLesson: null, // lessonKey of the lesson opened most recently
  history: [], // last N PHP console commands
};

const clone = (value) => structuredClone(value);

/** Convert state saved by PHP Terminal Trainer (v1/v2) to the v3 shape. */
function fromLegacy(old) {
  const state = clone(DEFAULT_STATE);
  const rekey = (map) => Object.fromEntries(Object.entries(map || {}).map(([id, value]) => [`php/${id}`, value]));

  state.completed = rekey(old.completed);
  for (const key of Object.keys(state.completed)) {
    // v1 stored `true`; later versions store the completion date.
    if (state.completed[key] === true) state.completed[key] = new Date().toISOString();
  }
  state.attempts = rekey(old.attempts);
  state.submits = rekey(old.submits);
  state.hintsShown = rekey(old.hintsShown);
  state.solutionViewed = rekey(old.solutionViewed);
  state.drafts = Object.fromEntries(
    Object.entries(rekey(old.drafts))
      .filter(([, code]) => typeof code === 'string')
      .map(([key, code]) => [key, { 'main.php': code }]),
  );
  state.activity = { ...(old.activity || {}) };
  state.history = Array.isArray(old.history) ? old.history : [];
  return state;
}

/**
 * Read the whole saved state. Never throws.
 * @returns {typeof DEFAULT_STATE}
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const defaults = clone(DEFAULT_STATE);
      // Merge with defaults so fields added in later versions are never undefined.
      return {
        ...defaults,
        ...parsed,
        profile: { ...defaults.profile, ...parsed.profile },
        settings: { ...defaults.settings, ...parsed.settings },
      };
    }
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) return fromLegacy(JSON.parse(legacy));
  } catch (err) {
    console.warn('[storage] could not read progress:', err);
  }
  return clone(DEFAULT_STATE);
}

/**
 * Persist the whole state object. Never throws.
 * @returns {boolean} true if the write succeeded
 */
export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    console.warn('[storage] could not save progress:', err);
    return false;
  }
}
