/**
 * courses/index.js — the course catalogue.
 *
 * A course is two things:
 *   - `<course>.js`           structure (chapters, lesson order) and grading rules
 *   - `<course>/<lesson>.md`  each lesson's text, starter code and solution
 *                             (format: see lesson-file.js)
 *
 * normalize() merges the two and fills in defaults so the rest of the app can
 * rely on one lesson shape:
 *
 *   {
 *     id, key ("<courseId>/<id>"), courseId, index, chapterTitle,
 *     title, xp, challenge,
 *     kind: 'web' | 'js' | 'php' | 'sql' | 'quiz',
 *     learn, task,                  Markdown (see markdown.js)
 *     files: [{ name, lang, code, readOnly }],
 *     main,                         name of the file that gets graded
 *     hints: string[],
 *     solution: { [fileName]: code }, solutionCode (the main file's solution),
 *
 *     // grading — one of:
 *     checks: [{ label, test }]     web: runs inside the preview iframe
 *     functionName + tests          js/php: call a function, compare results
 *     expectOutput                  js/php: compare printed output
 *     setup (+ verify, ordered)     sql: compare with the solution's result
 *     sourceChecks: [{ label, test(code) }]   optional extra checks on the source
 *     questions (+ answerKey)       quiz: from the "## Quiz" section of the .md file
 *   }
 *
 * Each course also gets `reviewer`: { intro, sections: [{ title, body }] },
 * read from `<course>/_reviewer.md` (one section per chapter).
 *
 * See README.md for how to add a lesson.
 */

import html from './html.js';
import css from './css.js';
import javascript from './javascript.js';
import async from './async.js';
import php from './php.js';
import sql from './sql.js';
import backend from './backend.js';
import git from './git.js';
import { parseLessonFile, parseReviewer, langOf } from './lesson-file.js';

// `eager` + `?raw` inlines every lesson file into the bundle as a string.
const lessonFiles = import.meta.glob('./*/*.md', { query: '?raw', import: 'default', eager: true });

const DEFAULT_FILE = { web: 'index.html', js: 'script.js', php: 'main.php', sql: 'query.sql', quiz: 'answers.json' };

function normalize(course) {
  const lessons = [];

  const chapters = course.chapters.map((chapter, chapterIndex) => ({
    ...chapter,
    number: chapterIndex + 1,
    lessons: chapter.lessons.map((fromCourse) => {
      const text = lessonFiles[`./${course.id}/${fromCourse.id}.md`];
      const raw = { ...(text ? parseLessonFile(text) : {}), ...fromCourse };
      const kind = raw.kind || course.kind;
      const defaultName = DEFAULT_FILE[kind];

      // A quiz has no code. Its answers travel as a tiny JSON "file", so
      // drafts, grading and fst.verify() work the same as for every lesson.
      if (kind === 'quiz') {
        raw.answerKey = raw.questions.map((question) => (question.type === 'choice' ? question.options[question.answer] : question.accept[0]));
        raw.starter = '[]';
        raw.solution = JSON.stringify(raw.questions.map((question) => (question.type === 'choice' ? question.answer : question.accept[0])));
        raw.task ||= `Answer all ${raw.questions.length} questions, then press **Check answer**. You can change your answers and check as often as you like.`;
      }

      const files = (raw.files || [{ code: raw.starter ?? '' }]).map((file) => {
        const name = file.name || defaultName;
        return { name, lang: langOf(name), code: file.code, readOnly: Boolean(file.readOnly) };
      });
      const main = raw.main || (files.find((file) => !file.readOnly) || files[0]).name;

      // A solution without a file name belongs to the main file.
      const given = typeof raw.solution === 'string' ? { '': raw.solution } : raw.solution || {};
      const solution = Object.fromEntries(Object.entries(given).map(([name, code]) => [name || main, code]));

      const lesson = {
        learn: '',
        task: '',
        hints: [],
        ...raw,
        kind,
        files,
        main,
        solution,
        solutionCode: solution[main] ?? '',
        challenge: Boolean(raw.challenge),
        xp: raw.xp ?? (raw.challenge ? 25 : 10),
        courseId: course.id,
        key: `${course.id}/${raw.id}`,
        index: lessons.length,
        chapterTitle: chapter.title,
      };
      lessons.push(lesson);
      return lesson;
    }),
  }));

  return { ...course, chapters, lessons, reviewer: parseReviewer(lessonFiles[`./${course.id}/_reviewer.md`]) };
}

/** Courses in the order of the stack: what the browser shows first, data last. */
export const courses = [html, css, javascript, async, php, sql, backend, git].map(normalize);

export const allLessons = courses.flatMap((course) => course.lessons);

export const findCourse = (id) => courses.find((course) => course.id === id) || null;

/** @returns {{ course: object, lesson: object } | null} */
export function findLesson(courseId, lessonId) {
  const course = findCourse(courseId);
  const lesson = course?.lessons.find((l) => l.id === lessonId);
  return lesson ? { course, lesson } : null;
}
