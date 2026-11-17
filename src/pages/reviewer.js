/**
 * pages/reviewer.js — study notes ("reviewers") for every course.
 *
 * A reviewer is a condensed summary of a course: one section per chapter with
 * the key points, a cheat sheet and a few self-check questions. The text
 * lives in `src/courses/<course>/_reviewer.md`.
 *
 *   #/reviewer            all reviewers
 *   #/reviewer/<course>   one course's reviewer (printable)
 */

import { el, icon, progressBar, courseMark, plural } from '../ui.js';
import { courses, findCourse } from '../courses/index.js';
import { renderMarkdown } from '../markdown.js';

export function reviewerIndexPage(_params, { store }) {
  const cards = courses.map((course, i) => {
    const total = course.reviewer.sections.length;
    const reviewed = store.reviewedCount(course);
    const progress = store.courseProgress(course);
    return el(
      'a',
      { class: 'card course-card', href: `#/reviewer/${course.id}`, style: `--course:${course.color}` },
      el('div', { class: 'course-card-top' }, courseMark(course, 'lg'), el('span', { class: 'layer-tag' }, `Layer ${i + 1} · ${course.layer}`)),
      el('h3', {}, `${course.title} reviewer`),
      el('p', { class: 'muted course-tagline' }, course.reviewer.sections.map((section) => section.title).join(' · ')),
      el(
        'div',
        { class: 'course-card-foot' },
        progressBar(total ? Math.round((reviewed / total) * 100) : 0, 'course small'),
        el('div', { class: 'course-card-meta muted small' }, el('span', {}, `${reviewed}/${plural(total, 'section')} reviewed`), el('span', {}, `${progress.done}/${progress.total} lessons done`)),
      ),
    );
  });

  return {
    el: el(
      'section',
      { class: 'page page-reviewer-index' },
      el(
        'header',
        { class: 'card hero reviewer-hero' },
        el(
          'div',
          { class: 'hero-main' },
          el('p', { class: 'eyebrow' }, 'Reviewer'),
          el('h1', {}, 'Everything you learned, on one page per course.'),
          el('p', { class: 'muted hero-text' }, 'Key points, cheat sheets and quick self-check questions for each chapter. Use them to revise before a quiz, or as a reference while you code. Every reviewer can be printed.'),
        ),
      ),
      el('div', { class: 'stack' }, cards),
    ),
  };
}

export function reviewerPage(params, { store }) {
  const course = findCourse(params.id);
  if (!course) {
    return { el: el('section', { class: 'page page-narrow' }, el('div', { class: 'card empty-state' }, el('h1', {}, 'Reviewer not found'), el('a', { class: 'btn btn-primary', href: '#/reviewer' }, 'All reviewers'))) };
  }

  const { sections, intro } = course.reviewer;
  const summary = el('span', { class: 'muted small' });
  const tocItems = [];
  const sectionEls = [];

  function renderSummary() {
    const reviewed = store.reviewedCount(course);
    summary.textContent = `${reviewed} of ${plural(sections.length, 'section')} reviewed`;
    tocItems.forEach((item, i) => item.classList.toggle('done', store.isReviewed(course.id, i)));
  }

  sections.forEach((section, i) => {
    const chapter = course.chapters[i];
    const done = chapter ? chapter.lessons.filter((lesson) => store.isCompleted(lesson.key)).length : 0;
    const practice = chapter && (chapter.lessons.find((lesson) => !store.isCompleted(lesson.key) && store.isUnlocked(lesson)) || chapter.lessons.find((lesson) => store.isUnlocked(lesson)));
    const checkboxId = `reviewed-${i}`;

    const card = el(
      'section',
      { class: 'card reviewer-section', 'aria-labelledby': `section-title-${i}` },
      el(
        'div',
        { class: 'reviewer-section-head' },
        el('span', { class: 'chapter-number' }, i + 1),
        el('h2', { id: `section-title-${i}` }, section.title),
        chapter ? el('span', { class: `chip no-print ${done === chapter.lessons.length ? 'chip-completed' : ''}` }, `${done}/${chapter.lessons.length} lessons`) : null,
      ),
      el('div', { class: 'prose' }, renderMarkdown(section.body)),
      el(
        'div',
        { class: 'reviewer-section-foot no-print' },
        el(
          'label',
          { class: 'reviewed-toggle', for: checkboxId },
          el('input', {
            type: 'checkbox',
            id: checkboxId,
            checked: store.isReviewed(course.id, i),
            onchange: (event) => {
              store.setReviewed(course.id, i, event.target.checked);
              renderSummary();
            },
          }),
          'I have reviewed this section',
        ),
        practice ? el('a', { class: 'btn btn-sm', href: `#/lesson/${course.id}/${practice.id}` }, icon('play', 14), store.isCompleted(practice.key) ? 'Practise again' : 'Practise this') : null,
      ),
    );
    sectionEls.push(card);

    tocItems.push(
      el(
        'button',
        { class: 'toc-item', type: 'button', onclick: () => card.scrollIntoView({ behavior: 'smooth', block: 'start' }) },
        el('span', { class: 'toc-mark' }, icon('check', 12)),
        section.title,
      ),
    );
  });

  function print() {
    // Answers are collapsed on screen; a printed reviewer should show them.
    for (const details of root.querySelectorAll('details')) details.open = true;
    window.print();
  }

  const header = el(
    'header',
    { class: 'card course-hero', style: `--course:${course.color}` },
    el('a', { class: 'crumb-back no-print', href: '#/reviewer' }, icon('left', 16), 'All reviewers'),
    el(
      'div',
      { class: 'course-hero-main' },
      courseMark(course, 'xl'),
      el('div', {}, el('p', { class: 'eyebrow' }, 'Reviewer'), el('h1', {}, `${course.title} reviewer`), el('p', { class: 'muted' }, intro || course.description)),
    ),
    el(
      'div',
      { class: 'course-hero-foot no-print' },
      summary,
      el('span', { class: 'spacer' }),
      el('button', { class: 'btn', type: 'button', onclick: print }, icon('print', 16), 'Print'),
      el('a', { class: 'btn btn-primary', href: `#/course/${course.id}` }, icon('layers', 16), 'Go to the lessons'),
    ),
  );

  const root = el(
    'section',
    { class: 'page page-reviewer', style: `--course:${course.color}` },
    header,
    sections.length
      ? el('div', { class: 'reviewer-grid' }, el('nav', { class: 'reviewer-toc no-print', 'aria-label': 'Sections' }, el('p', { class: 'eyebrow' }, 'Sections'), tocItems), el('div', { class: 'reviewer-sections' }, sectionEls))
      : el('div', { class: 'card empty-state' }, el('p', { class: 'muted' }, 'This course has no reviewer yet.')),
  );

  renderSummary();
  return { el: root };
}
