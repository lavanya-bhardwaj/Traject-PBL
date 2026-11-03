import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CHECK_LENGTH,
  START_DIFFICULTY,
  levelFromDifficulty,
  nextDifficulty,
  pickQuestion,
  type AdaptiveQuestion,
} from "./adaptive.ts";

// Two questions at each difficulty, like the real banks.
const pool: AdaptiveQuestion[] = [1, 2, 3, 4, 5].flatMap((d) =>
  [1, 2].map((n) => ({
    id: `d${d}-${n}`,
    prompt: `Difficulty ${d}, question ${n}`,
    choices: ["a", "b"],
    answer: 0,
    difficulty: d,
  })),
);

// Simulates a check where every answer is right (or every answer is wrong).
function runCheck(alwaysCorrect: boolean): { difficulty: number; asked: string[] } {
  let difficulty = START_DIFFICULTY;
  const asked: string[] = [];
  for (let i = 0; i < CHECK_LENGTH; i++) {
    const question = pickQuestion(pool, asked, difficulty);
    assert.ok(question, "bank should never run out during a check");
    asked.push(question.id);
    difficulty = nextDifficulty(difficulty, alwaysCorrect);
  }
  return { difficulty, asked };
}

test("correct answers raise difficulty and wrong answers lower it", () => {
  assert.equal(nextDifficulty(3, true), 4);
  assert.equal(nextDifficulty(3, false), 2);
});

test("difficulty stays between 1 and 5", () => {
  assert.equal(nextDifficulty(5, true), 5);
  assert.equal(nextDifficulty(1, false), 1);
});

test("picks the unasked question closest to the target difficulty", () => {
  assert.equal(pickQuestion(pool, [], 4)?.difficulty, 4);
  assert.equal(pickQuestion(pool, ["d4-1"], 4)?.id, "d4-2");
});

test("never repeats a question within one check", () => {
  const { asked } = runCheck(true);
  assert.equal(new Set(asked).size, CHECK_LENGTH);
});

test("all correct ends at level 5 and all wrong ends at level 1", () => {
  assert.equal(levelFromDifficulty(runCheck(true).difficulty), 5);
  assert.equal(levelFromDifficulty(runCheck(false).difficulty), 1);
});

test("level is clamped to 1 to 5", () => {
  assert.equal(levelFromDifficulty(0), 1);
  assert.equal(levelFromDifficulty(9), 5);
  assert.equal(levelFromDifficulty(3), 3);
});
