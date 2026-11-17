/**
 * verify.js — a self-test for lesson authors.
 *
 * Runs every lesson twice through the real grader:
 *   - with its solution, which must pass every check, and
 *   - with its starter code, which must NOT pass (otherwise the lesson
 *     would be complete before the learner typed anything).
 *
 * Loaded on demand from the browser console:   await fst.verify()
 * Limit it to one course with:                 await fst.verify({ course: 'sql' })
 */

import { courses } from './courses/index.js';
import { checkLesson } from './runners/index.js';

const filesOf = (lesson, overrides = {}) => Object.fromEntries(lesson.files.map((file) => [file.name, overrides[file.name] ?? file.code]));

/**
 * @returns {Promise<{ lessons: number, problems: { lesson: string, problem: string, failed?: string[] }[] }>}
 */
export async function verifyAll(ctx, { course: only } = {}) {
  const problems = [];
  let lessons = 0;

  for (const course of courses) {
    if (only && course.id !== only) continue;
    for (const lesson of course.lessons) {
      lessons++;
      try {
        if (!lesson.title) problems.push({ lesson: lesson.key, problem: 'has no title' });
        if (!lesson.task) problems.push({ lesson: lesson.key, problem: 'has no task text' });
        if (!lesson.solutionCode) problems.push({ lesson: lesson.key, problem: 'has no solution' });

        const solved = await checkLesson(lesson, filesOf(lesson, lesson.solution), ctx);
        const failed = solved.checks.filter((check) => !check.ok);
        if (failed.length || !solved.checks.length) {
          problems.push({ lesson: lesson.key, problem: 'the solution does not pass', failed: failed.map((check) => `${check.label} ${JSON.stringify(check.details || '')}`), fatal: solved.fatal });
        }

        const untouched = await checkLesson(lesson, filesOf(lesson), ctx);
        if (untouched.checks.length && untouched.checks.every((check) => check.ok)) {
          problems.push({ lesson: lesson.key, problem: 'the starter code already passes' });
        }
      } catch (err) {
        problems.push({ lesson: lesson.key, problem: `threw: ${err.message}` });
      }
    }
  }

  return { lessons, problems };
}
