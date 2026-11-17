/**
 * runners/index.js — one interface over the four ways lessons are executed.
 *
 *   kind 'web'  → sandboxed iframe + DOM checks        (runners/web.js)
 *   kind 'js'   → Web Worker                           (runners/javascript.js)
 *   kind 'php'  → PHP 8.4 WebAssembly worker           (runners/php.js + php-runner.js)
 *   kind 'sql'  → SQLite WebAssembly                   (runners/sql.js)
 *   kind 'quiz' → no code: answers are compared        (runners/quiz.js)
 *
 * JavaScript and PHP lessons may ship read-only helper files ("Given" files).
 * Their code is placed in front of the learner's code as a single line, so
 * the helpers are defined and error line numbers still match the editor.
 *
 * Pages call runLesson() for the Run button and checkLesson() for
 * "Check answer"; both return plain data the output panel can render.
 *
 * @typedef {{ kind: 'out'|'err', text: string }} Line
 * @typedef {{ label: string, value: string, bad?: boolean }} Detail
 * @typedef {{ label: string, ok: boolean, details?: Detail[], output?: string }} CheckResult
 */

import { deepEqual, formatValue, formatCall, normalizeOutput } from './compare.js';
import { runWebChecks } from './web.js';
import { runJavaScript } from './javascript.js';
import { runSql, gradeSql } from './sql.js';
import { gradeAnswer, isAnswered, parseAnswers } from './quiz.js';
import { buildRunScript, buildTestScript, parseTestOutput } from './php.js';
import { splitPhpOutput, hasFatalError } from '../php-output.js';
import { shiftLineNumbers } from '../repl.js';
import { TimeoutError } from '../php-runner.js';

const OUTPUT_LABEL = 'Prints exactly the expected output';
const SQL_LABELS = {
  runs: 'Runs without errors',
  columns: 'Returns the right columns',
  rows: 'Returns the right rows',
  data: 'Leaves the right data in the table',
};

/** Labels of everything checkLesson() will verify, for the "to do" list. */
export function pendingChecks(lesson) {
  const source = (lesson.sourceChecks || []).map((check) => check.label);
  if (lesson.kind === 'web') return lesson.checks.map((check) => check.label);
  if (lesson.kind === 'quiz') return lesson.questions.map((question, i) => `Question ${i + 1}`);
  if (lesson.kind === 'sql') {
    return lesson.verify ? [SQL_LABELS.runs, SQL_LABELS.data, ...source] : [SQL_LABELS.runs, SQL_LABELS.columns, SQL_LABELS.rows, ...source];
  }
  if (lesson.tests) return [...lesson.tests.map((test) => formatCall(lesson.functionName, test.input)), ...source];
  return [OUTPUT_LABEL, ...source];
}

const errLine = (text) => ({ kind: 'err', text });
const failAll = (lesson) => pendingChecks(lesson).map((label) => ({ label, ok: false }));

/** Explain a thrown runner error (PHP timeout, worker crash, …). */
function describeFailure(err) {
  if (err instanceof TimeoutError) {
    return `${err.message}. PHP was restarted — check for a loop that never ends (while (true), a missing $i++ …).`;
  }
  return `Could not run the code: ${err.message}`;
}

/**
 * Helper files as one line of code: comment lines dropped, PHP tags removed,
 * line breaks collapsed. (Helpers must not use trailing // comments.)
 */
function preludeOf(lesson, files) {
  if (lesson.kind !== 'js' && lesson.kind !== 'php') return '';
  return (lesson.files || [])
    .filter((file) => file.readOnly)
    .map((file) => files[file.name] ?? file.code)
    .join('\n')
    .replace(/<\?php|\?>/g, '')
    .split('\n')
    .filter((line) => !/^\s*(\/\/|#)/.test(line))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function sourceResults(lesson, code) {
  return (lesson.sourceChecks || []).map((check) => ({ label: check.label, ok: Boolean(check.test(code)) }));
}

/** Turn harness results into check rows by comparing against the lesson's tests. */
function testResults(lesson, results) {
  return lesson.tests.map((test, i) => {
    const result = results[i];
    const ok = Boolean(result && result.ok && deepEqual(test.expected, result.value));
    const details = ok
      ? [{ label: 'returned', value: formatValue(result.value) }]
      : [
          { label: 'expected', value: formatValue(test.expected) },
          !result
            ? { label: 'actual', value: '(no result — the code stopped early)', bad: true }
            : result.ok
              ? { label: 'actual', value: formatValue(result.value), bad: true }
              : { label: 'threw', value: result.error, bad: true },
        ];
    return { label: formatCall(lesson.functionName, test.input), ok, details, output: result?.output?.trim() || '' };
  });
}

function outputResult(lesson, printed) {
  const ok = normalizeOutput(printed) === normalizeOutput(lesson.expectOutput);
  return {
    label: OUTPUT_LABEL,
    ok,
    details: ok
      ? []
      : [
          { label: 'expected', value: normalizeOutput(lesson.expectOutput) },
          { label: 'actual', value: normalizeOutput(printed) || '(nothing was printed)', bad: true },
        ],
  };
}

// ---------------------------------------------------------------------------
// Run: execute the code as-is
// ---------------------------------------------------------------------------

/**
 * @param {object} lesson  needs `kind`, `main`, and `setup` for SQL
 * @param {Record<string, string>} files
 * @param {{ php: () => import('../php-runner.js').PhpRunner }} ctx
 * @returns {Promise<{ lines: Line[], sets?: object[], note?: string }>}
 */
export async function runLesson(lesson, files, ctx) {
  const code = files[lesson.main] ?? '';
  const prelude = preludeOf(lesson, files);

  if (lesson.kind === 'js') {
    const reply = await runJavaScript({ code: prelude ? `${prelude} ${code}` : code });
    return { lines: reply.error ? [...reply.lines, errLine(reply.error)] : reply.lines };
  }

  if (lesson.kind === 'php') {
    try {
      const { script, lineOffset } = buildRunScript(code, prelude);
      const result = await ctx.php().run(script, '/main.php');
      return { lines: splitPhpOutput(shiftLineNumbers(result.stdout, lineOffset), result.stderr) };
    } catch (err) {
      return { lines: [errLine(describeFailure(err))] };
    }
  }

  if (lesson.kind === 'sql') {
    const result = await runSql(lesson.setup, code);
    if (result.error) return { lines: [errLine(result.error)], sets: [] };
    const note = result.sets.length ? '' : result.changes ? `Done — ${result.changes} row${result.changes === 1 ? '' : 's'} changed.` : 'Done — the statement returned no rows.';
    return { lines: [], sets: result.sets, note };
  }

  return { lines: [] }; // 'web' lessons use the live preview instead
}

// ---------------------------------------------------------------------------
// Check: run and grade
// ---------------------------------------------------------------------------

/**
 * @returns {Promise<{ checks: CheckResult[], lines: Line[], sets?: object[], fatal?: string }>}
 *          `fatal` is set when the code could not be graded at all.
 */
export async function checkLesson(lesson, files, ctx) {
  const code = files[lesson.main] ?? '';
  const prelude = preludeOf(lesson, files);

  if (lesson.kind === 'quiz') {
    const answers = parseAnswers(code);
    return {
      checks: lesson.questions.map((question, i) => {
        const ok = gradeAnswer(question, answers[i]);
        const hint = isAnswered(answers[i]) ? 'Not quite. Re-read the lesson, or reveal a hint.' : 'Not answered yet.';
        return { label: `Question ${i + 1}`, ok, details: ok ? [] : [{ label: 'hint', value: hint }] };
      }),
      lines: [],
    };
  }

  if (lesson.kind === 'web') {
    const { results, error } = await runWebChecks(lesson.checks, files);
    if (error) return { checks: failAll(lesson), lines: [], fatal: error };
    return {
      checks: lesson.checks.map((check, i) => ({
        label: check.label,
        ok: Boolean(results[i]?.ok),
        details: results[i]?.detail ? [{ label: 'hint', value: results[i].detail }] : [],
      })),
      lines: [],
    };
  }

  if (lesson.kind === 'sql') {
    const grade = await gradeSql(lesson, code);
    if (grade.error) return { checks: failAll(lesson), lines: [errLine(grade.error)], sets: [], fatal: grade.error };
    const graded = lesson.verify
      ? [{ label: SQL_LABELS.data, ok: grade.rowsOk }]
      : [
          {
            label: SQL_LABELS.columns,
            ok: grade.columnsOk,
            details: grade.columnsOk
              ? []
              : [
                  { label: 'expected', value: grade.want.columns.join(', ') },
                  { label: 'actual', value: grade.got ? grade.got.columns.join(', ') : '(the query returned no rows)', bad: true },
                ],
          },
          { label: SQL_LABELS.rows, ok: grade.rowsOk, details: grade.rowsOk ? [] : [{ label: 'hint', value: 'Compare the Result tab with the Expected tab.' }] },
        ];
    return { checks: [{ label: SQL_LABELS.runs, ok: true }, ...graded, ...sourceResults(lesson, code)], lines: [], sets: grade.sets };
  }

  if (lesson.kind === 'js') {
    const reply = await runJavaScript({ code: prelude ? `${prelude} ${code}` : code, fn: lesson.functionName, tests: lesson.tests?.map((test) => test.input) });
    const fatal = reply.error || (reply.missing ? `Function ${lesson.functionName}() is not defined. Did you keep the name from the starter code?` : '');
    if (fatal) return { checks: failAll(lesson), lines: [...reply.lines, errLine(fatal)], fatal };
    const printed = reply.lines.map((line) => line.text).join('\n');
    const graded = lesson.tests ? testResults(lesson, reply.results) : [outputResult(lesson, printed)];
    return { checks: [...graded, ...sourceResults(lesson, code)], lines: reply.lines };
  }

  // PHP
  try {
    if (lesson.tests) {
      const { script, lineOffset } = buildTestScript(lesson, code, prelude);
      const raw = await ctx.php().run(script, '/main.php');
      const report = parseTestOutput(shiftLineNumbers(raw.stdout, lineOffset));
      if (report.error) {
        const text = report.userOutput ? `${report.userOutput}\n${report.error}` : report.error;
        return { checks: failAll(lesson), lines: splitPhpOutput(text, raw.stderr), fatal: report.error };
      }
      return { checks: [...testResults(lesson, report.results), ...sourceResults(lesson, code)], lines: splitPhpOutput(report.userOutput, raw.stderr) };
    }

    const { script, lineOffset } = buildRunScript(code, prelude);
    const raw = await ctx.php().run(script, '/main.php');
    const stdout = shiftLineNumbers(raw.stdout, lineOffset);
    const lines = splitPhpOutput(stdout, raw.stderr);
    if (hasFatalError(stdout)) return { checks: failAll(lesson), lines, fatal: 'PHP stopped with an error.' };
    return { checks: [outputResult(lesson, stdout), ...sourceResults(lesson, code)], lines };
  } catch (err) {
    const fatal = describeFailure(err);
    return { checks: failAll(lesson), lines: [errLine(fatal)], fatal };
  }
}
