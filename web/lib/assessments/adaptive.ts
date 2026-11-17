// Adaptive question selection. Pure logic, no database or framework code, so it can be tested directly.
// Each check asks CHECK_LENGTH questions. A correct answer raises the target difficulty, a wrong one lowers it.
import type { Question } from "./grading";

export type AdaptiveQuestion = Question & { difficulty: number };

export const CHECK_LENGTH = 6;
export const START_DIFFICULTY = 3;

const MIN_DIFFICULTY = 1;
const MAX_DIFFICULTY = 5;

function clamp(value: number): number {
  return Math.min(MAX_DIFFICULTY, Math.max(MIN_DIFFICULTY, value));
}

export function nextDifficulty(current: number, wasCorrect: boolean): number {
  return clamp(wasCorrect ? current + 1 : current - 1);
}

// The unasked question closest to the target difficulty. Ties keep the bank's order, so results are repeatable.
export function pickQuestion(
  pool: AdaptiveQuestion[],
  asked: string[],
  difficulty: number,
): AdaptiveQuestion | null {
  let best: AdaptiveQuestion | null = null;
  for (const question of pool) {
    if (asked.includes(question.id)) continue;
    if (!best || Math.abs(question.difficulty - difficulty) < Math.abs(best.difficulty - difficulty)) {
      best = question;
    }
  }
  return best;
}

// The level is the difficulty the check ended on: 1 (struggled) to 5 (answered hard questions).
export function levelFromDifficulty(finalDifficulty: number): number {
  return clamp(Math.round(finalDifficulty));
}
