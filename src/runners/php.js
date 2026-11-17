/**
 * runners/php.js — builds the scripts PHP lessons run and reads the results.
 *
 * The PHP itself executes in php-worker.js (WebAssembly); this file only
 * prepares source text and parses output.
 */

import { Repl } from '../repl.js';

/**
 * Prepare learner code for execution: strip the PHP tags they may have typed
 * and put a single `<?php` back. If the code already started with the tag we
 * keep it on the same line, so error line numbers match the editor exactly;
 * otherwise our added line shifts everything down by one (lineOffset = 1).
 *
 * @returns {{ snippet: string, header: string, lineOffset: number }}
 */
function prepareUserCode(userCode, prelude = '') {
  const snippet = Repl.stripTags(userCode);
  const hadTag = /^[ \t]*<\?(php)?\b/i.test(userCode);
  // The prelude is a single line, so it never shifts the learner's line numbers.
  const open = prelude ? `<?php ${prelude} ` : '<?php';
  return hadTag ? { snippet, header: open, lineOffset: 0 } : { snippet, header: `${open}\n`, lineOffset: 1 };
}

/**
 * Build a plain script for the "Run" button (no tests, just the learner's code).
 * @returns {{ script: string, lineOffset: number }}
 */
export function buildRunScript(userCode, prelude = '') {
  const { snippet, header, lineOffset } = prepareUserCode(userCode, prelude);
  return { script: header + snippet, lineOffset };
}

/**
 * A marker that separates the learner's own output from the harness JSON.
 * Chosen to be something nobody would echo by accident.
 */
const MARKER = '__FSTRAINING_RESULTS__';

/**
 * Append the hidden test harness to the learner's code.
 *
 * The harness calls the lesson's function once per test with the test's
 * `input` array spread as arguments, captures anything printed during the
 * call (warnings, stray echos), catches exceptions, and prints everything
 * as one JSON document after the marker. parseTestOutput() splits on the
 * marker; the caller compares values.
 *
 * @param {{ functionName: string, tests: { input: any[] }[] }} lesson
 * @param {string} userCode  `<?php` optional
 * @returns {{ script: string, lineOffset: number }}
 */
export function buildTestScript(lesson, userCode, prelude = '') {
  const { snippet, header, lineOffset } = prepareUserCode(userCode, prelude);
  // Tests travel as base64 so quotes/backslashes in inputs never break the PHP string.
  const inputs = lesson.tests.map((t) => t.input);
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(inputs))));
  const fn = JSON.stringify(lesson.functionName); // safe PHP string literal

  const harness = `
// ===== hidden test harness (added by FSTraining) =====
echo "\\n${MARKER}\\n";
$__fn = ${fn};
if (!function_exists($__fn)) {
    echo json_encode(['error' => "Function {$__fn}() is not defined. Did you keep the function name from the starter code?"]);
    exit;
}
$__tests = json_decode(base64_decode('${encoded}'), true);
$__results = [];
foreach ($__tests as $__args) {
    ob_start();
    try {
        $__value = $__fn(...$__args);
        $__results[] = ['ok' => true, 'value' => $__value, 'output' => ob_get_clean()];
    } catch (\\Throwable $__e) {
        $__results[] = ['ok' => false, 'error' => get_class($__e) . ': ' . $__e->getMessage(), 'output' => ob_get_clean()];
    }
}
echo json_encode(['results' => $__results], JSON_PARTIAL_OUTPUT_ON_ERROR | JSON_INVALID_UTF8_SUBSTITUTE);
`;

  return { script: `${header}${snippet}\n${harness}`, lineOffset };
}

/**
 * Split PHP's stdout into the learner's own output and the harness results.
 * @returns {{ userOutput: string, results?: object[], error?: string }}
 */
export function parseTestOutput(stdout) {
  const at = stdout.indexOf(MARKER);
  if (at === -1) {
    // The harness never ran: a parse/fatal error in the learner's code.
    return { userOutput: '', error: stdout.trim() || 'No output from PHP (did the script exit early?)' };
  }

  const userOutput = stdout.slice(0, at).replace(/\n$/, '');
  const jsonText = stdout.slice(at + MARKER.length).trim();

  try {
    const data = JSON.parse(jsonText);
    if (data.error) return { userOutput, error: data.error };
    return { userOutput, results: data.results };
  } catch {
    return { userOutput, error: `Could not read test results:\n${jsonText}` };
  }
}
