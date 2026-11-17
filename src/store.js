/**
 * store.js — progress model on top of storage.js.
 *
 * One object owns the persisted state and exposes small, named operations
 * (complete, recordSubmit, streak, …) so pages never poke at the raw
 * structure. Every mutating method saves immediately and notifies
 * subscribers (the top bar listens to keep XP and streak current).
 */

import { loadState, saveState, DEFAULT_STATE } from './storage.js';
import { courses, allLessons } from './courses/index.js';
import { levelInfo, buildBadges } from './gamify.js';

export const BADGES = buildBadges(courses);

/** Parts of the state that belong to this browser and are never synced to an account. */
export const DEVICE_ONLY = ['version', 'settings', 'playground', 'history'];

/** Local-time YYYY-MM-DD (toISOString would use UTC and shift the day). */
export function dayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function createStore() {
  const state = loadState();
  const listeners = new Set();

  const save = () => {
    saveState(state);
    for (const listener of listeners) listener();
  };

  /** Award any badge whose condition is now met; returns the new ones. */
  function awardBadges() {
    const stats = store.stats();
    const fresh = BADGES.filter((badge) => !state.badges[badge.id] && badge.test(stats));
    for (const badge of fresh) state.badges[badge.id] = new Date().toISOString();
    return fresh;
  }

  const store = {
    state,

    /** Call `fn` after every change. Returns an unsubscribe function. */
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },

    // ---- profile / settings ----------------------------------------------
    setProfile(patch) {
      Object.assign(state.profile, patch);
      save();
    },
    setSetting(name, value) {
      state.settings[name] = value;
      save();
    },

    // ---- completion / XP -------------------------------------------------
    isCompleted: (key) => Boolean(state.completed[key]),

    /** XP a lesson would award right now (half once the solution was viewed). */
    xpOnOffer(lesson) {
      return state.solutionViewed[lesson.key] && !state.completed[lesson.key] ? Math.ceil(lesson.xp / 2) : lesson.xp;
    },

    /**
     * Mark a lesson completed.
     * @returns {{ firstTime: boolean, xp: number, leveledUp: boolean, level: object, badges: object[] }}
     */
    complete(lesson) {
      const before = levelInfo(store.xp());
      const firstTime = !state.completed[lesson.key];
      let xp = 0;

      if (firstTime) {
        xp = store.xpOnOffer(lesson);
        state.completed[lesson.key] = new Date().toISOString();
        state.earned[lesson.key] = xp;
        if ((state.submits[lesson.key] || 0) <= 1) state.firstTry[lesson.key] = true;
      }

      const badges = awardBadges();
      save();
      const level = levelInfo(store.xp());
      return { firstTime, xp, leveledUp: level.level > before.level, level, badges };
    },

    /** Total XP. Lessons completed before XP existed count at full value. */
    xp() {
      let total = 0;
      for (const lesson of allLessons) {
        if (state.completed[lesson.key]) total += state.earned[lesson.key] ?? lesson.xp;
      }
      return total;
    },

    level: () => levelInfo(store.xp()),

    // ---- checks / attempts -----------------------------------------------
    attempts: (key) => state.attempts[key] || 0, // failed checks
    submits: (key) => state.submits[key] || 0, // all checks
    recordSubmit(key, passed) {
      state.submits[key] = (state.submits[key] || 0) + 1;
      if (!passed) state.attempts[key] = (state.attempts[key] || 0) + 1;
      store.recordActivity(false);
      save();
    },

    // ---- hints / solution ------------------------------------------------
    hintsShown: (key) => state.hintsShown[key] || 0,
    revealHint(key) {
      state.hintsShown[key] = (state.hintsShown[key] || 0) + 1;
      save();
    },
    solutionViewed: (key) => Boolean(state.solutionViewed[key]),
    markSolutionViewed(key) {
      state.solutionViewed[key] = true;
      save();
    },

    // ---- drafts ----------------------------------------------------------
    /** @returns {Record<string, string> | null} file name → code */
    getDraft: (key) => state.drafts[key] ?? null,
    setDraft(key, files) {
      if (files === null) delete state.drafts[key];
      else state.drafts[key] = files;
      save();
    },

    // ---- navigation helpers ----------------------------------------------
    setLastLesson(key) {
      if (state.lastLesson === key) return;
      state.lastLesson = key;
      save();
    },

    /** 'completed' | 'in-progress' | 'new' */
    status(key) {
      if (state.completed[key]) return 'completed';
      if (state.submits[key] || state.drafts[key] || state.hintsShown[key]) return 'in-progress';
      return 'new';
    },

    /** A lesson opens once the one before it in the course is done. */
    isUnlocked(lesson) {
      if (state.settings.unlockAll || lesson.index === 0 || state.completed[lesson.key]) return true;
      const course = courses.find((c) => c.id === lesson.courseId);
      return Boolean(state.completed[course.lessons[lesson.index - 1].key]);
    },

    /** First lesson of the course that is not completed yet (or null). */
    nextLesson: (course) => course.lessons.find((lesson) => !state.completed[lesson.key]) || null,

    courseProgress(course) {
      const done = course.lessons.filter((lesson) => state.completed[lesson.key]);
      return {
        done: done.length,
        total: course.lessons.length,
        pct: Math.round((done.length / course.lessons.length) * 100),
        xp: done.reduce((sum, lesson) => sum + (state.earned[lesson.key] ?? lesson.xp), 0),
        xpTotal: course.lessons.reduce((sum, lesson) => sum + lesson.xp, 0),
      };
    },

    /** Where the "Continue" button should go. */
    resumeLesson() {
      const last = allLessons.find((lesson) => lesson.key === state.lastLesson);
      if (last && !state.completed[last.key]) return last;
      const lastCourse = last && courses.find((c) => c.id === last.courseId);
      const ordered = lastCourse ? [lastCourse, ...courses.filter((c) => c !== lastCourse)] : courses;
      for (const course of ordered) {
        const next = store.nextLesson(course);
        if (next) return next;
      }
      return null;
    },

    // ---- activity / streak -----------------------------------------------
    /** Count one run/check for today. */
    recordActivity(persist = true) {
      const key = dayKey();
      state.activity[key] = (state.activity[key] || 0) + 1;
      if (persist) save();
    },

    recordPlaygroundRun() {
      state.playgroundRuns = (state.playgroundRuns || 0) + 1;
      store.recordActivity(false);
      const badges = awardBadges();
      save();
      return badges;
    },

    /** Last `days` days, oldest first: [{ key, count }]. */
    activityLastDays(days) {
      const out = [];
      const today = new Date();
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = dayKey(d);
        out.push({ key, count: state.activity[key] || 0 });
      }
      return out;
    },

    /** Consecutive days with activity, ending today (or yesterday if today is still empty). */
    streak() {
      const d = new Date();
      if (!state.activity[dayKey(d)]) d.setDate(d.getDate() - 1);
      let days = 0;
      while (state.activity[dayKey(d)]) {
        days++;
        d.setDate(d.getDate() - 1);
      }
      return days;
    },

    /** True if there was a run or check today. */
    activeToday: () => Boolean(state.activity[dayKey()]),

    // ---- aggregates ------------------------------------------------------
    stats() {
      const done = allLessons.filter((lesson) => state.completed[lesson.key]);
      const sum = (map) => Object.values(map).reduce((n, v) => n + v, 0);
      return {
        completed: done.length,
        total: allLessons.length,
        xp: store.xp(),
        streak: store.streak(),
        noHelp: done.filter((lesson) => !state.hintsShown[lesson.key] && !state.solutionViewed[lesson.key]).length,
        firstTries: done.filter((lesson) => state.firstTry[lesson.key]).length,
        playgroundRuns: state.playgroundRuns || 0,
        checks: sum(state.submits),
        failedChecks: sum(state.attempts),
        hints: sum(state.hintsShown),
        coursesDone: courses.filter((course) => course.lessons.every((lesson) => state.completed[lesson.key])).map((c) => c.id),
        courseCount: courses.length,
      };
    },

    earnedBadges: () => BADGES.filter((badge) => state.badges[badge.id]),

    // ---- reviewer --------------------------------------------------------
    isReviewed: (courseId, section) => Boolean(state.reviewed[`${courseId}/${section}`]),
    setReviewed(courseId, section, done) {
      if (done) state.reviewed[`${courseId}/${section}`] = true;
      else delete state.reviewed[`${courseId}/${section}`];
      save();
    },
    reviewedCount: (course) => course.reviewer.sections.filter((_, i) => state.reviewed[`${course.id}/${i}`]).length,

    // ---- account sync ------------------------------------------------------
    /**
     * Swap in different progress (after merging with the server, or when
     * logging out). The state object itself stays the same, because pages
     * hold on to it.
     */
    replaceProgress(next) {
      const fresh = structuredClone(DEFAULT_STATE);
      for (const key of Object.keys(fresh)) {
        if (DEVICE_ONLY.includes(key)) continue;
        state[key] = next[key] ?? fresh[key];
      }
      state.profile = { ...fresh.profile, ...next.profile };
      awardBadges();
      save();
    },

    // ---- PHP console history ---------------------------------------------
    setHistory(history) {
      state.history = history;
      save();
    },

    // ---- playground ------------------------------------------------------
    getPlayground: (mode) => state.playground[mode] ?? null,
    setPlayground(mode, files) {
      state.playground[mode] = files;
      save();
    },

    /** Wipe progress, XP and badges. Profile, settings and console history stay. */
    resetProgress() {
      const fresh = structuredClone(DEFAULT_STATE);
      const keep = ['profile', 'settings', 'history', 'playground'];
      for (const key of Object.keys(fresh)) {
        if (!keep.includes(key)) state[key] = fresh[key];
      }
      save();
    },
  };

  // Progress carried over from an older version may already deserve badges.
  if (awardBadges().length) saveState(state);

  return store;
}
