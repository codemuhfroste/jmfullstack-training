/**
 * pages/home.js — the dashboard: where you are, what to do next, and the
 * courses that make up the stack.
 *
 * Everything is derived from the store on each render; the page is rebuilt
 * every time you navigate to it, so it is always up to date.
 */

import { el, icon, progressBar, courseMark, shortDate, plural } from '../ui.js';
import { courses } from '../courses/index.js';
import { BADGES } from '../store.js';

const lessonPath = (lesson) => `#/lesson/${lesson.courseId}/${lesson.id}`;

export function homePage(_params, { store }) {
  const stats = store.stats();
  const level = store.level();
  const resume = store.resumeLesson();
  const resumeCourse = resume && courses.find((course) => course.id === resume.courseId);
  const name = store.state.profile.name.trim();
  const started = stats.completed > 0 || Boolean(store.state.lastLesson);

  // ---- Hero: greeting + what to do next ---------------------------------
  const hero = el(
    'section',
    { class: 'card hero' },
    el(
      'div',
      { class: 'hero-main' },
      el('p', { class: 'eyebrow' }, started ? 'Welcome back' : 'Full Stack Training'),
      el('h1', {}, started ? (name ? `Keep climbing, ${name}.` : 'Keep climbing.') : 'Learn the whole stack, one layer at a time.'),
      el(
        'p',
        { class: 'muted hero-text' },
        started
          ? `${stats.completed} of ${plural(stats.total, 'lesson')} complete across ${courses.length} courses.`
          : `${courses.length} short courses take you from your first HTML tag to a back end with a database. Lessons run real code, right here in the browser.`,
      ),
    ),
    resume
      ? el(
          'a',
          { class: 'resume', href: lessonPath(resume), style: `--course:${resumeCourse.color}` },
          courseMark(resumeCourse, 'lg'),
          el(
            'span',
            { class: 'resume-text' },
            el('span', { class: 'eyebrow' }, started ? 'Continue' : 'Start here'),
            el('strong', {}, resume.title),
            el('span', { class: 'muted small' }, `${resumeCourse.title} · ${resume.chapterTitle} · ${resume.xp} XP`),
          ),
          el('span', { class: 'btn btn-primary btn-icon', 'aria-hidden': 'true' }, icon('play', 18)),
        )
      : el('div', { class: 'resume resume-done' }, el('strong', {}, 'You finished every lesson.'), el('span', { class: 'muted small' }, 'The whole stack is yours. Try building something in the playground.')),
  );

  // ---- Stat tiles ---------------------------------------------------------
  const streakHint = stats.streak === 0 ? 'Run some code to start one' : store.activeToday() ? 'Today is counted' : 'Practise today to keep it';
  const stat = (label, value, sub, extra = null) => el('div', { class: 'card tile' }, el('p', { class: 'tile-label' }, label), el('p', { class: 'tile-value' }, value), extra, el('p', { class: 'tile-sub muted' }, sub));

  const tiles = el(
    'section',
    { class: 'tiles' },
    stat('Level', `${level.level}`, `${level.title} · ${level.toNext} XP to level ${level.level + 1}`, progressBar(level.pct, 'xp small')),
    stat('Total XP', stats.xp, `from ${plural(stats.completed, 'lesson')}`),
    stat('Day streak', stats.streak, streakHint),
    stat('Badges', `${store.earnedBadges().length}/${BADGES.length}`, 'See them all on your profile'),
  );

  // ---- The stack ----------------------------------------------------------
  const stack = el(
    'section',
    { class: 'stack', id: 'courses' },
    courses.map((course, i) => {
      const progress = store.courseProgress(course);
      const next = store.nextLesson(course);
      return el(
        'a',
        { class: `card course-card ${progress.pct === 100 ? 'done' : ''}`, href: `#/course/${course.id}`, style: `--course:${course.color}` },
        el('div', { class: 'course-card-top' }, courseMark(course, 'lg'), el('span', { class: 'layer-tag' }, `Layer ${i + 1} · ${course.layer}`)),
        el('h3', {}, course.title),
        el('p', { class: 'muted course-tagline' }, course.tagline),
        el(
          'div',
          { class: 'course-card-foot' },
          progressBar(progress.pct, 'course small'),
          el(
            'div',
            { class: 'course-card-meta muted small' },
            el('span', {}, `${progress.done}/${progress.total} lessons`),
            el('span', {}, progress.pct === 100 ? 'Complete' : next && progress.done ? `Next: ${next.title}` : `${progress.xpTotal} XP`),
          ),
        ),
      );
    }),
  );

  // ---- Activity strip (last 30 days) -------------------------------------
  const days = store.activityLastDays(30);
  const max = Math.max(1, ...days.map((d) => d.count));
  const heat = (count) => (count === 0 ? 0 : count >= max * 0.66 ? 3 : count >= max * 0.33 ? 2 : 1);
  const activeDays = days.filter((d) => d.count > 0).length;
  const activity = el(
    'section',
    { class: 'card' },
    el('div', { class: 'card-heading-row' }, el('h2', { class: 'card-heading' }, 'Activity'), el('span', { class: 'muted small' }, `${plural(activeDays, 'active day')} in the last 30`)),
    el(
      'div',
      { class: 'activity-strip', role: 'img', 'aria-label': `Runs per day over the last 30 days: ${plural(activeDays, 'active day')}` },
      days.map((d) => el('div', { class: `day lvl-${heat(d.count)}`, title: `${shortDate(d.key)}: ${plural(d.count, 'run')}` })),
    ),
    el('div', { class: 'activity-legend muted small' }, el('span', {}, shortDate(days[0].key)), el('span', { class: 'legend-scale' }, 'Less', [0, 1, 2, 3].map((l) => el('span', { class: `day lvl-${l}` })), 'More'), el('span', {}, 'Today')),
  );

  // ---- Latest badges ------------------------------------------------------
  const earned = store
    .earnedBadges()
    .sort((a, b) => (store.state.badges[a.id] < store.state.badges[b.id] ? 1 : -1))
    .slice(0, 4);
  const nextBadge = BADGES.find((badge) => !store.state.badges[badge.id]);
  const badges = el(
    'section',
    { class: 'card' },
    el('div', { class: 'card-heading-row' }, el('h2', { class: 'card-heading' }, 'Badges'), el('a', { class: 'small', href: '#/profile' }, 'View all')),
    earned.length
      ? el(
          'ul',
          { class: 'badge-row' },
          earned.map((badge) => el('li', { title: badge.description }, el('span', { class: 'badge-icon' }, badge.icon), el('span', { class: 'small' }, badge.title))),
        )
      : el('p', { class: 'muted small' }, 'No badges yet. Your first one is a single lesson away.'),
    nextBadge ? el('p', { class: 'muted small next-badge' }, el('strong', {}, `Next: ${nextBadge.title}. `), nextBadge.description) : null,
  );

  const root = el(
    'section',
    { class: 'page page-home' },
    hero,
    tiles,
    el('div', { class: 'section-heading-row' }, el('h2', { class: 'section-heading' }, 'The stack'), el('p', { class: 'muted small' }, 'Start at the top or jump to the layer you need.')),
    stack,
    el('div', { class: 'two-col' }, activity, badges),
  );

  return { el: root };
}
