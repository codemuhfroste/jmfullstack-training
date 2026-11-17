/**
 * pages/course.js — one course as a winding path of lessons, chapter by
 * chapter. Completed lessons are filled in, the next one pulses, and the
 * rest stay locked until you get there.
 */

import { el, icon, progressBar, courseMark } from '../ui.js';
import { courses, findCourse } from '../courses/index.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

// Geometry of the path, in CSS pixels. Keep in sync with .path in style.css.
const ROW = 88; // vertical distance between lessons
const LANE = 190; // width of the lane the path winds through
const SWING = 48; // how far a node moves left/right of the lane's centre

const nodeX = (i) => LANE / 2 + Math.round(Math.sin((i * Math.PI) / 2.5) * SWING);
const nodeY = (i) => i * ROW + ROW / 2;

/** A smooth curve through the first `count` nodes of a chapter. */
function pathData(count, startIndex) {
  let d = '';
  for (let i = 0; i < count; i++) {
    const x = nodeX(startIndex + i);
    const y = nodeY(i);
    if (i === 0) {
      d = `M ${x} ${y}`;
    } else {
      const previousX = nodeX(startIndex + i - 1);
      const middle = y - ROW / 2;
      d += ` C ${previousX} ${middle}, ${x} ${middle}, ${x} ${y}`;
    }
  }
  return d;
}

function svgPath(d, className) {
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', d);
  path.setAttribute('class', className);
  return path;
}

export function coursePage(params, { store }) {
  const course = findCourse(params.id);
  if (!course) {
    return { el: el('section', { class: 'page page-narrow' }, el('div', { class: 'card empty-state' }, el('h1', {}, 'Course not found'), el('a', { class: 'btn btn-primary', href: '#/' }, 'Back to the stack'))) };
  }

  const progress = store.courseProgress(course);
  const upNext = store.nextLesson(course);

  const header = el(
    'header',
    { class: 'card course-hero', style: `--course:${course.color}` },
    el('a', { class: 'crumb-back', href: '#/' }, icon('left', 16), 'The stack'),
    el(
      'div',
      { class: 'course-hero-main' },
      courseMark(course, 'xl'),
      el('div', {}, el('p', { class: 'eyebrow' }, `Layer ${courses.indexOf(course) + 1} · ${course.layer}`), el('h1', {}, course.title), el('p', { class: 'muted' }, course.description)),
    ),
    el(
      'div',
      { class: 'course-hero-foot' },
      el('div', { class: 'course-hero-progress' }, progressBar(progress.pct, 'course'), el('p', { class: 'muted small' }, `${progress.done} of ${progress.total} lessons · ${progress.xp} of ${progress.xpTotal} XP`)),
      upNext
        ? el('a', { class: 'btn btn-primary', href: `#/lesson/${course.id}/${upNext.id}` }, icon('play', 16), progress.done ? 'Continue' : 'Start course')
        : el('span', { class: 'chip chip-completed' }, icon('check', 14), 'Course complete'),
      el('a', { class: 'btn', href: `#/reviewer/${course.id}` }, icon('book', 16), 'Reviewer'),
    ),
  );

  const chapters = course.chapters.map((chapter) => {
    const start = chapter.lessons[0].index;
    const height = chapter.lessons.length * ROW;
    const done = chapter.lessons.filter((lesson) => store.isCompleted(lesson.key)).length;
    // The coloured part of the path reaches as far as the learner has got.
    const reached = chapter.lessons.filter((lesson) => store.isCompleted(lesson.key) || lesson === upNext).length;

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'path-line');
    svg.setAttribute('width', LANE);
    svg.setAttribute('height', height);
    svg.setAttribute('aria-hidden', 'true');
    svg.append(svgPath(pathData(chapter.lessons.length, start), 'track'));
    if (reached > 1) svg.append(svgPath(pathData(reached, start), 'walked'));

    const steps = chapter.lessons.map((lesson) => {
      const completed = store.isCompleted(lesson.key);
      const unlocked = store.isUnlocked(lesson);
      const state = completed ? 'completed' : lesson === upNext && unlocked ? 'current' : unlocked ? 'open' : 'locked';
      const glyph = completed ? 'check' : !unlocked ? 'lock' : lesson.challenge ? 'star' : 'play';
      const meta = [lesson.challenge ? 'Challenge' : `Lesson ${lesson.index + 1}`, `${lesson.xp} XP`];
      if (completed) meta.push('Done');
      else if (state === 'current') meta.push(store.status(lesson.key) === 'in-progress' ? 'In progress' : 'Up next');
      else if (!unlocked) meta.push('Locked');

      const content = [
        el('span', { class: 'step-node', style: `margin-left:${nodeX(lesson.index) - 28}px` }, icon(glyph, 22)),
        el('span', { class: 'step-text' }, el('strong', {}, lesson.title), el('span', { class: 'muted small' }, meta.join(' · '))),
      ];

      return el(
        'li',
        { class: `step ${state} ${lesson.challenge ? 'challenge' : ''}` },
        unlocked
          ? el('a', { class: 'step-link', href: `#/lesson/${course.id}/${lesson.id}` }, content)
          : el('span', { class: 'step-link', title: 'Finish the lesson before this one to unlock it', 'aria-disabled': 'true' }, content),
      );
    });

    return el(
      'section',
      { class: 'chapter', style: `--course:${course.color}` },
      el(
        'div',
        { class: 'chapter-head' },
        el('span', { class: 'chapter-number' }, chapter.number),
        el('div', {}, el('h2', {}, chapter.title), el('p', { class: 'muted small' }, chapter.summary)),
        el('span', { class: `chip ${done === chapter.lessons.length ? 'chip-completed' : ''}` }, `${done}/${chapter.lessons.length}`),
      ),
      el('div', { class: 'path', style: `height:${height}px` }, svg, el('ol', { class: 'steps' }, steps)),
    );
  });

  return { el: el('section', { class: 'page page-course' }, header, chapters) };
}
