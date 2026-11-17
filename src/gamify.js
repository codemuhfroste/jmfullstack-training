/**
 * gamify.js — XP levels, rank titles and badges.
 *
 * Pure functions and data only: the store decides *when* something is earned,
 * this file decides *what* there is to earn.
 */

/** Rank title per level; the last one repeats for every higher level. */
const RANKS = ['Newcomer', 'Tinkerer', 'Apprentice', 'Builder', 'Coder', 'Developer', 'Engineer', 'Architect', 'Full Stack Hero'];

/** Total XP needed to *reach* a level: 0, 20, 60, 120, 200, 300, 420, 560, … */
export const xpForLevel = (level) => 10 * level * (level - 1);

/**
 * @param {number} xp total XP
 * @returns {{ level: number, title: string, into: number, span: number, pct: number, toNext: number }}
 */
export function levelInfo(xp) {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level++;
  const floor = xpForLevel(level);
  const span = xpForLevel(level + 1) - floor;
  const into = xp - floor;
  return {
    level,
    title: RANKS[Math.min(level, RANKS.length) - 1],
    into,
    span,
    pct: Math.round((into / span) * 100),
    toNext: span - into,
  };
}

/**
 * Badge catalogue.
 *
 * `test` receives the stats object built by store.stats():
 *   { completed, xp, streak, noHelp, firstTries, playgroundRuns,
 *     coursesDone: string[], courseCount }
 *
 * @param {{ id: string, title: string, color: string }[]} courses
 */
export function buildBadges(courses) {
  const courseBadges = courses.map((course) => ({
    id: `course-${course.id}`,
    icon: '🏁',
    title: `${course.title} complete`,
    description: `Finish every lesson in ${course.title}.`,
    color: course.color,
    test: (s) => s.coursesDone.includes(course.id),
  }));

  return [
    { id: 'first-step', icon: '👣', title: 'First step', description: 'Complete your first lesson.', test: (s) => s.completed >= 1 },
    { id: 'five-lessons', icon: '🖐️', title: 'High five', description: 'Complete 5 lessons.', test: (s) => s.completed >= 5 },
    { id: 'fifteen-lessons', icon: '📚', title: 'Bookworm', description: 'Complete 15 lessons.', test: (s) => s.completed >= 15 },
    { id: 'thirty-lessons', icon: '🧗', title: 'Climber', description: 'Complete 30 lessons.', test: (s) => s.completed >= 30 },
    { id: 'xp-100', icon: '⚡', title: 'Charged up', description: 'Earn 100 XP.', test: (s) => s.xp >= 100 },
    { id: 'xp-300', icon: '🔋', title: 'Fully charged', description: 'Earn 300 XP.', test: (s) => s.xp >= 300 },
    { id: 'streak-3', icon: '🔥', title: 'Warming up', description: 'Practise 3 days in a row.', test: (s) => s.streak >= 3 },
    { id: 'streak-7', icon: '☄️', title: 'On fire', description: 'Practise 7 days in a row.', test: (s) => s.streak >= 7 },
    { id: 'first-try-3', icon: '🎯', title: 'Sharpshooter', description: 'Pass 3 lessons on the first check.', test: (s) => s.firstTries >= 3 },
    { id: 'no-help-5', icon: '🧠', title: 'Self-made', description: 'Complete 5 lessons without hints or the solution.', test: (s) => s.noHelp >= 5 },
    { id: 'tinkerer', icon: '🧪', title: 'Mad scientist', description: 'Run code in the playground 10 times.', test: (s) => s.playgroundRuns >= 10 },
    ...courseBadges,
    {
      id: 'full-stack',
      icon: '🏆',
      title: 'Full stack',
      description: 'Finish every course in the stack.',
      test: (s) => s.coursesDone.length === s.courseCount,
    },
  ];
}
