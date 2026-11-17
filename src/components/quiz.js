/**
 * components/quiz.js — the question form of a quiz lesson.
 *
 * It deliberately exposes the same interface as the code editor
 * (components/editor-tabs.js): the answers are read and written as the
 * contents of a single "file", answers.json. That lets the lesson page,
 * drafts and grading treat a quiz like any other lesson.
 */

import { el, icon } from '../ui.js';
import { renderMarkdown } from '../markdown.js';
import { parseAnswers } from '../runners/quiz.js';

const FILE = 'answers.json';

/**
 * @param {object} options
 * @param {object[]} options.questions           from the lesson's "## Quiz" section
 * @param {string} [options.answers]             saved answers (JSON)
 * @param {(name: string, code: string) => void} [options.onChange]
 * @param {() => void} [options.onSubmit]        Enter in a text answer
 */
export function createQuiz({ questions, answers: saved = '[]', onChange, onSubmit }) {
  let answers = parseAnswers(saved);
  const tabsEl = el('span', { class: 'quiz-title' }, `Quiz · ${questions.length} question${questions.length === 1 ? '' : 's'}`);
  const root = el('div', { class: 'quiz' });
  let cards = [];

  function changed(index, value) {
    answers[index] = value;
    cards[index].classList.remove('right', 'wrong');
    cards[index].querySelector('.quiz-mark').replaceChildren();
    onChange?.(FILE, JSON.stringify(answers));
  }

  function render() {
    cards = questions.map((question, index) => {
      const name = `quiz-${index}`;
      const input =
        question.type === 'choice'
          ? el(
              'div',
              { class: 'quiz-options' },
              question.options.map((option, optionIndex) =>
                el(
                  'label',
                  { class: 'quiz-option' },
                  el('input', { type: 'radio', name, checked: answers[index] === optionIndex, onchange: () => changed(index, optionIndex) }),
                  el('span', {}, renderInline(option)),
                ),
              ),
            )
          : el('input', {
              class: 'input quiz-text',
              type: 'text',
              spellcheck: false,
              autocapitalize: 'off',
              autocomplete: 'off',
              placeholder: 'Type your answer',
              'aria-label': `Answer to question ${index + 1}`,
              value: typeof answers[index] === 'string' ? answers[index] : '',
              oninput: (event) => changed(index, event.target.value),
              onkeydown: (event) => {
                if (event.key === 'Enter') onSubmit?.();
              },
            });

      return el(
        'fieldset',
        { class: 'quiz-question' },
        el('legend', {}, el('span', { class: 'quiz-number' }, `Question ${index + 1}`), el('span', { class: 'quiz-mark' })),
        el('div', { class: 'quiz-prompt' }, renderMarkdown(question.prompt)),
        input,
      );
    });
    root.replaceChildren(...cards);
  }

  /** Inline Markdown without the wrapping paragraph. */
  function renderInline(text) {
    return Array.from(renderMarkdown(text)[0]?.childNodes ?? []);
  }

  render();

  return {
    tabsEl,
    el: root,
    getFiles: () => ({ [FILE]: JSON.stringify(answers) }),
    setFile(_name, code) {
      answers = parseAnswers(code);
      render();
      onChange?.(FILE, JSON.stringify(answers));
    },
    /** Show which questions were right after a check. */
    mark(results) {
      cards.forEach((card, index) => {
        const ok = Boolean(results[index]);
        card.classList.toggle('right', ok);
        card.classList.toggle('wrong', !ok);
        card.querySelector('.quiz-mark').replaceChildren(icon(ok ? 'check' : 'x', 14), ok ? 'Correct' : 'Try again');
      });
    },
    select() {},
    focus() {},
    destroy() {},
  };
}
