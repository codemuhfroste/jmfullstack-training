/**
 * runners/quiz.js — grading for quiz lessons (multiple choice and typed answers).
 *
 * A learner's answers are an array aligned with the lesson's questions:
 * the index of the chosen option, or the text that was typed.
 */

const tidy = (text) =>
  String(text ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();

/**
 * @param {{ type: 'choice', answer: number } | { type: 'text', accept: string[] }} question
 * @param {number | string | null | undefined} given
 */
export function gradeAnswer(question, given) {
  if (question.type === 'choice') return given === question.answer;
  const typed = tidy(given);
  if (!typed) return false;
  return question.accept.some((accepted) => {
    // An accepted answer written as /pattern/ is a regular expression.
    const pattern = /^\/(.+)\/$/.exec(accepted);
    return pattern ? new RegExp(pattern[1], 'i').test(typed) : tidy(accepted) === typed;
  });
}

export const isAnswered = (given) => given !== null && given !== undefined && given !== '';

/** Answers as stored in a quiz lesson's `answers.json` file. Never throws. */
export function parseAnswers(json) {
  try {
    const answers = JSON.parse(json);
    return Array.isArray(answers) ? answers : [];
  } catch {
    return [];
  }
}
