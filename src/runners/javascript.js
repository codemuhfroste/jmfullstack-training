/**
 * runners/javascript.js — runs learner JavaScript in a throw-away Web Worker.
 *
 * A worker keeps the code away from the page (no DOM, no localStorage) and,
 * more importantly, can be terminated: an accidental `while (true) {}` only
 * freezes the worker until the timeout kills it.
 */

/** Runs INSIDE the worker; turned into source text with toString(). */
function workerMain() {
  const format = (value) => {
    if (typeof value === 'string') return value;
    if (value === undefined) return 'undefined';
    if (typeof value === 'function') return `[Function ${value.name || 'anonymous'}]`;
    if (value instanceof Error) return `${value.name}: ${value.message}`;
    try {
      const text = JSON.stringify(value);
      return text === undefined ? String(value) : text;
    } catch {
      return String(value);
    }
  };

  /** Error text plus the line in the learner's code, when the engine tells us. */
  const describe = (err) => {
    let text = err && err.name ? `${err.name}: ${err.message}` : String(err);
    // new Function() puts two lines of wrapper above the code.
    const where = err && err.stack && /<anonymous>:(\d+):\d+/.exec(err.stack);
    if (where && Number(where[1]) > 2) text += ` (line ${Number(where[1]) - 2})`;
    return text;
  };

  /** Make sure a return value can be posted back to the page. */
  const portable = (value) => {
    try {
      return structuredClone(value);
    } catch {
      return format(value);
    }
  };

  self.onmessage = async (event) => {
    const { code, fn, tests } = event.data;
    let lines = [];
    const push = (kind) => (...args) => lines.push({ kind, text: args.map(format).join(' ') });
    const fakeConsole = { log: push('out'), info: push('out'), debug: push('out'), table: push('out'), warn: push('err'), error: push('err') };
    const reply = { lines: [], error: null, missing: false, results: null };

    // Track timers that have not fired yet, so the run can wait for code that
    // is still "in flight" (await, setTimeout) before reporting its output.
    const realSetTimeout = self.setTimeout.bind(self);
    const realClearTimeout = self.clearTimeout.bind(self);
    const pendingTimers = new Set();
    self.setTimeout = (callback, ms, ...args) => {
      const id = realSetTimeout(() => {
        pendingTimers.delete(id);
        callback(...args);
      }, ms);
      pendingTimers.add(id);
      return id;
    };
    self.clearTimeout = (id) => {
      pendingTimers.delete(id);
      realClearTimeout(id);
    };
    const settle = async () => {
      const started = Date.now();
      do {
        await new Promise((resolve) => realSetTimeout(resolve, 5));
      } while (pendingTimers.size > 0 && Date.now() - started < 2000);
    };

    // A promise that fails with nobody listening would otherwise vanish.
    self.addEventListener('unhandledrejection', (rejection) => {
      rejection.preventDefault();
      lines.push({ kind: 'err', text: `Uncaught (in promise) ${describe(rejection.reason)}` });
    });

    try {
      // Returning the function from the same scope lets tests call it even
      // when it was declared with const or as an arrow function.
      const tail = fn ? `\n;return typeof ${fn} === "function" ? ${fn} : undefined;` : '';
      const target = new Function('console', code + tail)(fakeConsole);
      await settle(); // let promise callbacks and timers finish and log
      reply.lines = lines;

      if (fn && typeof target !== 'function') {
        reply.missing = true;
      } else if (fn) {
        reply.results = [];
        for (const args of tests) {
          lines = [];
          try {
            const value = await target(...args); // async functions are awaited
            reply.results.push({ ok: true, value: portable(value), output: lines.map((l) => l.text).join('\n') });
          } catch (err) {
            reply.results.push({ ok: false, error: describe(err), output: lines.map((l) => l.text).join('\n') });
          }
        }
      }
    } catch (err) {
      reply.lines = lines;
      reply.error = describe(err);
    }

    self.postMessage(reply);
  };
}

let workerUrl = null;

/**
 * @param {object} options
 * @param {string} options.code
 * @param {string} [options.fn]       name of the function the tests call
 * @param {any[][]} [options.tests]   one argument list per test
 * @param {number} [options.timeoutMs]
 * @returns {Promise<{ lines: {kind: 'out'|'err', text: string}[], error: string|null, missing: boolean,
 *                     results: object[]|null, timedOut?: boolean }>}
 */
export function runJavaScript({ code, fn = '', tests = [], timeoutMs = 3000 }) {
  workerUrl ??= URL.createObjectURL(new Blob([`(${workerMain.toString()})()`], { type: 'text/javascript' }));
  const worker = new Worker(workerUrl);

  return new Promise((resolve) => {
    const finish = (reply) => {
      clearTimeout(timer);
      worker.terminate();
      resolve(reply);
    };
    const failure = (error, extra = {}) => finish({ lines: [], error, missing: false, results: null, ...extra });

    const timer = setTimeout(
      () => failure(`Stopped after ${timeoutMs / 1000}s — check for a loop that never ends (a missing i++ or a condition that is always true).`, { timedOut: true }),
      timeoutMs,
    );

    worker.onmessage = (event) => finish(event.data);
    worker.onerror = (event) => {
      event.preventDefault();
      failure(event.message || 'The code crashed.');
    };
    worker.postMessage({ code, fn, tests });
  });
}
