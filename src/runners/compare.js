/**
 * compare.js — value comparison and formatting shared by the runners.
 */

/**
 * Compare a value returned by learner code with the expected value.
 *  - numbers: exact for integers, 1e-9 tolerance for floats
 *  - arrays: same length, same order
 *  - objects: same keys (any order), values compared recursively
 *  - PHP encodes an empty array as `[]` even when an object was intended, so
 *    `[]` and `{}` are considered equal.
 */
export function deepEqual(a, b) {
  if (typeof a === 'number' && typeof b === 'number') {
    if (Number.isInteger(a) && Number.isInteger(b)) return a === b;
    return Math.abs(a - b) < 1e-9;
  }
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    return a === b;
  }
  const aIsArray = Array.isArray(a);
  const bIsArray = Array.isArray(b);
  if (aIsArray !== bIsArray) {
    return Object.keys(a).length === 0 && Object.keys(b).length === 0;
  }
  if (aIsArray) {
    return a.length === b.length && a.every((v, i) => deepEqual(v, b[i]));
  }
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  return aKeys.length === bKeys.length && aKeys.every((k) => k in b && deepEqual(a[k], b[k]));
}

/** Compact one-line representation of a value for the check report. */
export function formatValue(value) {
  const text = JSON.stringify(value);
  return text === undefined ? 'undefined' : text;
}

/** `fizzBuzz(5)` style call signature for the report. */
export function formatCall(fnName, args) {
  return `${fnName}(${args.map(formatValue).join(', ')})`;
}

/** Printed output with trailing spaces and surrounding blank lines ignored. */
export function normalizeOutput(text = '') {
  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}
