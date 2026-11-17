/**
 * pages/lesson.js — one lesson: explanation and task on the left, editor and
 * output on the right. "Check answer" grades the code and awards XP.
 */

import { el, setChildren, debounce, icon, progressBar, courseMark, toast, openModal, confetti, plural } from '../ui.js';
import { findLesson } from '../courses/index.js';
import { renderMarkdown } from '../markdown.js';
import { createEditorTabs } from '../components/editor-tabs.js';
import { createOutputPanel } from '../components/output-panel.js';
import { createQuiz } from '../components/quiz.js';
import { pendingChecks, runLesson, checkLesson } from '../runners/index.js';
import { describeTables, expectedResult } from '../runners/sql.js';

const SOLUTION_UNLOCK_AFTER = 3; // failed checks before the solution can be shown
const WIDE = '(min-width: 960px)';

const OUTPUT_TABS = {
  web: ['preview', 'console', 'checks'],
  js: ['console', 'checks'],
  php: ['console', 'checks'],
  sql: ['result', 'expected', 'tables', 'checks'],
  quiz: ['checks'],
};

const lessonPath = (lesson) => `#/lesson/${lesson.courseId}/${lesson.id}`;

function messagePage(title, text, href, linkText) {
  return {
    el: el('section', { class: 'page page-narrow' }, el('div', { class: 'card empty-state' }, el('h1', {}, title), el('p', { class: 'muted' }, text), el('a', { class: 'btn btn-primary', href }, linkText))),
  };
}

export function lessonPage(params, ctx) {
  const found = findLesson(params.course, params.id);
  if (!found) return messagePage('Lesson not found', 'That lesson does not exist (any more).', '#/', 'Back to the stack');

  const { course, lesson } = found;
  const { store } = ctx;
  const key = lesson.key;
  const prev = course.lessons[lesson.index - 1];
  const next = course.lessons[lesson.index + 1];

  if (!store.isUnlocked(lesson)) {
    return messagePage(
      'This lesson is still locked',
      `Finish "${prev.title}" first. Lessons open one at a time so each builds on the last. You can switch that off under Profile.`,
      `#/course/${course.id}`,
      `Back to ${course.title}`,
    );
  }

  store.setLastLesson(key);

  // ---- Header -------------------------------------------------------------
  const statusChip = el('span', { class: 'chip' });
  const header = el(
    'header',
    { class: 'lesson-header', style: `--course:${course.color}` },
    el(
      'div',
      { class: 'lesson-crumbs' },
      el('a', { class: 'crumb-back', href: `#/course/${course.id}` }, icon('left', 16), courseMark(course, 'sm'), course.title),
      el('span', { class: 'muted' }, `${lesson.chapterTitle} · Lesson ${lesson.index + 1} of ${course.lessons.length}`),
    ),
    el(
      'div',
      { class: 'lesson-title-row' },
      el('h1', {}, lesson.title),
      lesson.challenge ? el('span', { class: 'chip chip-challenge' }, icon('star', 14), 'Challenge') : null,
      el('span', { class: 'chip chip-xp' }, icon('bolt', 14), `${lesson.xp} XP`),
      statusChip,
      el(
        'nav',
        { class: 'pager', 'aria-label': 'Lessons' },
        prev ? el('a', { class: 'btn btn-ghost btn-sm btn-icon', href: lessonPath(prev), title: `Previous: ${prev.title}`, 'aria-label': `Previous lesson: ${prev.title}` }, icon('left', 16)) : null,
        next && store.isUnlocked(next)
          ? el('a', { class: 'btn btn-ghost btn-sm btn-icon', href: lessonPath(next), title: `Next: ${next.title}`, 'aria-label': `Next lesson: ${next.title}` }, icon('right', 16))
          : null,
      ),
    ),
  );

  // ---- Left column: learn, task, hints, solution --------------------------
  const hintsList = el('ol', { class: 'hints-list' });
  const hintBtn = el('button', { class: 'btn btn-sm', type: 'button', onclick: revealHint });
  const solutionBtn = el('button', { class: 'btn btn-sm', type: 'button', onclick: toggleSolution });
  const solutionNote = el('p', { class: 'muted small' });
  const solutionBox = el('div', { class: 'solution-box', hidden: true });

  const side = el(
    'div',
    { class: 'lesson-side' },
    lesson.learn ? el('section', { class: 'card prose' }, el('h2', { class: 'card-heading' }, 'Learn'), renderMarkdown(lesson.learn)) : null,
    el(
      'section',
      { class: 'card card-task prose' },
      el('h2', { class: 'card-heading' }, icon('flag', 16), 'Your task'),
      lesson.taskPlain ? el('pre', { class: 'prompt-text' }, lesson.task) : renderMarkdown(lesson.task),
    ),
    lesson.hints.length
      ? el('section', { class: 'card' }, el('div', { class: 'card-heading-row' }, el('h2', { class: 'card-heading' }, icon('bulb', 16), 'Hints'), hintBtn), hintsList)
      : null,
    el('section', { class: 'card' }, el('div', { class: 'card-heading-row' }, el('h2', { class: 'card-heading' }, icon('eye', 16), 'Solution'), solutionBtn), solutionNote, solutionBox),
  );

  // ---- Right column: editor + output --------------------------------------
  const draft = store.getDraft(key) || {};
  const starter = Object.fromEntries(lesson.files.map((file) => [file.name, file.code]));
  const isWeb = lesson.kind === 'web';
  const isQuiz = lesson.kind === 'quiz';

  const output = createOutputPanel({ tabs: OUTPUT_TABS[lesson.kind] });
  const refreshPreview = debounce(() => output.setPreview(editors.getFiles()), 350);

  const saveDraft = debounce(() => {
    const files = editors.getFiles();
    const changed = Object.fromEntries(lesson.files.filter((file) => !file.readOnly && files[file.name] !== file.code).map((file) => [file.name, files[file.name]]));
    store.setDraft(key, Object.keys(changed).length ? changed : null);
  }, 400);

  // A quiz swaps the code editor for a question form with the same interface.
  const editors = isQuiz
    ? createQuiz({ questions: lesson.questions, answers: draft[lesson.main], onSubmit: check, onChange: () => saveDraft() })
    : createEditorTabs({
        files: lesson.files.map((file) => ({ ...file, code: file.readOnly ? file.code : (draft[file.name] ?? file.code) })),
        active: lesson.main,
        onSubmit: check,
        onChange: () => {
          saveDraft();
          if (isWeb) refreshPreview();
        },
      });

  const runBtn = el(
    'button',
    { class: 'btn', type: 'button', onclick: run, title: isWeb ? 'Reload the preview' : 'Run the code and show what it prints' },
    icon(isWeb ? 'reset' : 'play', 16),
    isWeb ? 'Reload' : 'Run',
  );
  const checkBtn = el('button', { class: 'btn btn-primary', type: 'button', onclick: check, title: 'Check your answer (Ctrl+Enter)' }, icon('check', 16), 'Check answer');
  const resetBtn = el('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: resetCode, title: isQuiz ? 'Clear your answers' : 'Go back to the starter code' }, 'Reset');
  runBtn.hidden = isQuiz; // nothing to run

  const work = el(
    'div',
    { class: 'lesson-work' },
    el('section', { class: `card card-editor ${isQuiz ? 'card-quiz' : ''}` }, el('div', { class: 'toolbar' }, editors.tabsEl, el('div', { class: 'toolbar-actions' }, resetBtn, runBtn, checkBtn)), editors.el),
    output.el,
  );

  const root = el('section', { class: 'page page-lesson' }, header, el('div', { class: 'lesson-grid' }, side, work));

  // ---- Rendering helpers --------------------------------------------------
  const STATUS_LABEL = { completed: 'Completed', 'in-progress': 'In progress', new: 'Not started' };

  function renderStatus() {
    const status = store.status(key);
    statusChip.className = `chip chip-${status}`;
    setChildren(statusChip, status === 'completed' ? icon('check', 14) : null, STATUS_LABEL[status]);
  }

  function renderHints() {
    if (!lesson.hints.length) return;
    const shown = store.hintsShown(key);
    const total = lesson.hints.length;
    if (shown === 0) {
      setChildren(hintsList, el('li', { class: 'placeholder muted small' }, 'Stuck? Hints are revealed one at a time. Try it on your own first.'));
    } else {
      setChildren(hintsList, lesson.hints.slice(0, shown).map((hint) => el('li', {}, renderMarkdown(hint))));
    }
    hintBtn.disabled = shown >= total;
    hintBtn.textContent = shown >= total ? 'All hints shown' : `Show hint ${shown + 1} of ${total}`;
  }

  function renderSolutionButton() {
    if (!solutionBox.hidden) {
      solutionBtn.textContent = 'Hide solution';
      solutionBtn.disabled = false;
      solutionNote.hidden = true;
      return;
    }
    const attempts = store.attempts(key);
    const done = store.isCompleted(key);
    const unlocked = done || attempts >= SOLUTION_UNLOCK_AFTER;
    solutionBtn.disabled = !unlocked;
    solutionBtn.textContent = 'Show solution';
    solutionNote.hidden = done && !store.solutionViewed(key) ? false : done;
    if (done) solutionNote.textContent = 'Compare your answer with the reference solution.';
    else if (!unlocked) solutionNote.textContent = `Unlocks after ${SOLUTION_UNLOCK_AFTER} unsuccessful checks (${attempts} so far).`;
    else if (store.solutionViewed(key)) solutionNote.textContent = `You have seen the solution, so this lesson is now worth ${store.xpOnOffer(lesson)} XP.`;
    else solutionNote.textContent = `Looking at the solution before you solve it halves the reward to ${Math.ceil(lesson.xp / 2)} XP.`;
  }

  /** The Checks tab: pending circles before a check, ticks and crosses after. */
  function renderChecks(results) {
    const pane = output.pane('checks');
    const rows = results || pendingChecks(lesson).map((label) => ({ label, pending: true }));
    const passed = rows.filter((row) => row.ok).length;

    setChildren(
      pane,
      results
        ? null
        : el('p', { class: 'muted small pane-note' }, `Press "Check answer" to test your code against ${plural(rows.length, 'check')}.`),
      el(
        'ul',
        { class: 'checks' },
        rows.map((row) =>
          el(
            'li',
            { class: `check ${row.pending ? 'pending' : row.ok ? 'pass' : 'fail'}` },
            el('span', { class: 'check-icon' }, row.pending ? null : icon(row.ok ? 'check' : 'x', 14)),
            el(
              'div',
              { class: 'check-body' },
              el('span', { class: 'check-label' }, row.label),
              (row.details || []).map((detail) => el('div', { class: 'check-detail' }, el('span', { class: 'label' }, detail.label), el('code', { class: detail.bad ? 'bad' : '' }, detail.value))),
              row.output ? el('pre', { class: 'check-output' }, row.output) : null,
            ),
          ),
        ),
      ),
    );

    if (results) output.setBadge('checks', `${passed}/${rows.length}`, passed === rows.length ? 'good' : 'bad');
    else output.setBadge('checks', String(rows.length));
  }

  function setBusy(busy) {
    runBtn.disabled = busy;
    checkBtn.disabled = busy;
    root.classList.toggle('busy', busy);
  }

  /** PHP is downloaded on first use; say so instead of looking frozen. */
  function waitingText(action) {
    return lesson.kind === 'php' && !ctx.php().version ? 'Starting PHP. The first run downloads about 20 MB, later runs are instant…' : action;
  }

  function showOutput(result) {
    if (lesson.kind === 'sql') {
      if (result.lines?.length) output.setPaneMessage('result', result.lines.map((line) => line.text).join('\n'), 'out-err');
      else output.setTables('result', result.sets || [], result.note || (result.sets?.length ? '' : 'The script returned no rows. Add a SELECT to see data.'));
    } else if (!isWeb && !isQuiz) {
      output.setLines(result.lines || [], '(nothing was printed)');
    }
  }

  // ---- Actions ------------------------------------------------------------
  function revealHint() {
    if (store.hintsShown(key) >= lesson.hints.length) return;
    store.revealHint(key);
    renderHints();
    renderStatus();
  }

  function toggleSolution() {
    if (!solutionBox.hidden) {
      solutionBox.hidden = true;
      renderSolutionButton();
      return;
    }
    store.markSolutionViewed(key);
    setChildren(
      solutionBox,
      isQuiz ? null : el('p', { class: 'muted small' }, 'There is usually more than one correct answer. Compare the approach, not the exact code.'),
      isQuiz
        ? el('ol', { class: 'answer-key' }, lesson.answerKey.map((answer) => el('li', {}, el('code', {}, answer))))
        : Object.entries(lesson.solution).map(([name, code]) => [
            Object.keys(lesson.solution).length > 1 || lesson.files.length > 1 ? el('p', { class: 'file-name' }, name) : null,
            el('pre', { class: 'code-block' }, code.trimEnd()),
          ]),
      el(
        'button',
        {
          class: 'btn btn-ghost btn-sm',
          type: 'button',
          onclick: () => {
            for (const [name, code] of Object.entries(lesson.solution)) editors.setFile(name, code);
            editors.select(lesson.main);
          },
        },
        isQuiz ? 'Fill in the answers' : 'Load into editor',
      ),
    );
    solutionBox.hidden = false;
    renderSolutionButton();
  }

  function resetCode() {
    if (!window.confirm(isQuiz ? 'Clear all your answers?' : 'Replace your code with the starter code?')) return;
    for (const file of lesson.files) if (!file.readOnly) editors.setFile(file.name, starter[file.name]);
    store.setDraft(key, null);
    renderChecks(null);
  }

  /** Run the code as it is, without grading. */
  async function run() {
    if (runBtn.disabled) return;
    if (isWeb) {
      output.setPreview(editors.getFiles());
      output.show('preview');
      return;
    }
    setBusy(true);
    const tab = lesson.kind === 'sql' ? 'result' : 'console';
    output.show(tab);
    if (lesson.kind === 'sql') output.setPaneMessage('result', 'Running…');
    else output.setConsoleMessage(waitingText('Running…'));
    try {
      showOutput(await runLesson(lesson, editors.getFiles(), ctx));
      store.recordActivity();
    } catch (err) {
      showOutput({ lines: [{ kind: 'err', text: `Could not run the code: ${err.message}` }] });
    } finally {
      setBusy(false);
    }
  }

  /** Grade the code; on success award XP and celebrate. */
  async function check() {
    if (checkBtn.disabled) return;
    const files = editors.getFiles();
    saveDraft();
    setBusy(true);
    if (lesson.kind === 'sql') output.setPaneMessage('result', 'Checking…');
    else if (!isWeb) output.setConsoleMessage(waitingText('Checking…'));

    let result;
    try {
      result = await checkLesson(lesson, files, ctx);
    } catch (err) {
      result = { checks: pendingChecks(lesson).map((label) => ({ label, ok: false })), lines: [{ kind: 'err', text: err.message }], fatal: `Could not check the code: ${err.message}` };
    }

    if (isWeb) output.setPreview(files);
    showOutput(result);
    renderChecks(result.checks);
    editors.mark?.(result.checks.map((row) => row.ok));

    const passed = result.checks.length > 0 && result.checks.every((row) => row.ok);
    store.recordSubmit(key, passed);

    if (passed) {
      output.show('checks');
      const outcome = store.complete(lesson);
      if (outcome.firstTime) celebrate(outcome);
      else toast('All checks passed. This lesson was already complete.', 'good');
    } else {
      if (result.fatal) {
        // The error itself is the most useful thing to look at.
        const pane = output.pane('checks');
        pane.prepend(el('p', { class: 'check-fatal' }, result.fatal));
        output.show(isWeb ? 'checks' : lesson.kind === 'sql' ? 'result' : 'console');
      } else {
        output.show('checks');
      }
      const passedCount = result.checks.filter((row) => row.ok).length;
      toast(result.fatal ? 'The code could not be checked. See the error.' : `${passedCount} of ${result.checks.length} checks passed. Keep going!`, 'warn');
    }

    setBusy(false);
    renderStatus();
    renderSolutionButton();
  }

  function celebrate(outcome) {
    const { level } = outcome;
    const courseDone = !store.nextLesson(course);
    let close = () => {};

    const content = el(
      'div',
      { class: 'celebrate', style: `--course:${course.color}` },
      confetti(),
      el('div', { class: 'celebrate-badge' }, icon(courseDone ? 'star' : 'check', 34)),
      el('h2', {}, courseDone ? `${course.title} complete!` : lesson.challenge ? 'Challenge complete!' : 'Lesson complete!'),
      el('p', { class: 'celebrate-xp' }, icon('bolt', 18), `+${outcome.xp} XP`),
      el(
        'div',
        { class: 'celebrate-level' },
        el('div', { class: 'level-line' }, el('strong', {}, `Level ${level.level} · ${level.title}`), el('span', { class: 'muted small' }, `${level.toNext} XP to level ${level.level + 1}`)),
        progressBar(level.pct, 'xp'),
        outcome.leveledUp ? el('p', { class: 'level-up' }, `Level up! You are now a ${level.title}.`) : null,
      ),
      outcome.badges.length
        ? el(
            'ul',
            { class: 'celebrate-badges' },
            outcome.badges.map((badge) => el('li', {}, el('span', { class: 'badge-icon' }, badge.icon), el('span', {}, el('strong', {}, `New badge: ${badge.title}`), el('br'), el('span', { class: 'muted small' }, badge.description)))),
          )
        : null,
      el(
        'div',
        { class: 'celebrate-actions' },
        next
          ? el('a', { class: 'btn btn-primary btn-lg', href: lessonPath(next), autofocus: true, onclick: () => close() }, 'Next lesson', icon('right', 18))
          : el('a', { class: 'btn btn-primary btn-lg', href: '#/', autofocus: true, onclick: () => close() }, 'Back to the stack', icon('right', 18)),
        courseDone ? el('a', { class: 'btn', href: `#/reviewer/${course.id}`, onclick: () => close() }, 'Open the reviewer') : null,
        el('button', { class: 'btn btn-ghost', type: 'button', onclick: () => close() }, 'Stay here'),
      ),
    );

    document.querySelector('.toasts')?.replaceChildren(); // no stale "keep going" over the dialog
    close = openModal(content);
  }

  // ---- First render -------------------------------------------------------
  renderStatus();
  renderHints();
  renderSolutionButton();
  renderChecks(null);

  let alive = true;

  return {
    el: root,
    lesson,
    mount() {
      if (isWeb) output.setPreview(editors.getFiles());

      if (lesson.kind === 'php') ctx.php(); // start downloading PHP while the learner reads

      if (lesson.kind === 'sql') {
        output.setPaneMessage('result', 'Press Run to execute your query.');
        output.setPaneMessage('expected', 'Loading…');
        output.setPaneMessage('tables', 'Loading…');
        Promise.all([describeTables(lesson.setup), expectedResult(lesson)])
          .then(([tables, expected]) => {
            if (!alive) return;
            output.setTables('tables', tables);
            output.setTables('expected', [expected], lesson.verify ? 'This is what the table should contain after your statements have run.' : 'Your query should return exactly this.');
          })
          .catch((err) => {
            if (!alive) return;
            const text = `The SQL engine could not be loaded: ${err.message}`;
            output.setPaneMessage('tables', text, 'out-err');
            output.setPaneMessage('expected', text, 'out-err');
          });
      }

      // Don't steal focus on phones: it would pop the keyboard immediately.
      if (window.matchMedia(WIDE).matches) editors.focus();
    },
    unmount() {
      alive = false;
      editors.destroy();
      output.destroy();
    },
    getFiles: () => editors.getFiles(),
    setFile: (name, code) => editors.setFile(name, code),
    run,
    check,
  };
}
