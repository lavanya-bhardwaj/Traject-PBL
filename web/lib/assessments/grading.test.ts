import { test } from "node:test";
import assert from "node:assert/strict";
import { gradeAnswers, levelFromPercent, type Question } from "./grading.ts";

const questions: Question[] = [1, 2, 3, 4, 5].map((n) => ({
  id: `q${n}`,
  prompt: `Question ${n}`,
  choices: ["a", "b", "c"],
  answer: 0,
}));

test("levels map from percentages in steps of 20", () => {
  assert.equal(levelFromPercent(0), 1);
  assert.equal(levelFromPercent(20), 1);
  assert.equal(levelFromPercent(40), 2);
  assert.equal(levelFromPercent(60), 3);
  assert.equal(levelFromPercent(80), 4);
  assert.equal(levelFromPercent(100), 5);
});

test("all correct gives level 5", () => {
  assert.deepEqual(gradeAnswers(questions, [0, 0, 0, 0, 0]), {
    correct: 5, total: 5, percent: 100, level: 5,
  });
});

test("counts only correct answers", () => {
  assert.deepEqual(gradeAnswers(questions, [0, 1, 0, 2, 2]), {
    correct: 2, total: 5, percent: 40, level: 2,
  });
});

test("rejects the wrong number of answers", () => {
  assert.throws(() => gradeAnswers(questions, [0, 0]), /expected 5 answers/);
});

test("rejects out-of-range or non-integer answers", () => {
  assert.throws(() => gradeAnswers(questions, [0, 0, 0, 0, 3]), /out of range/);
  assert.throws(() => gradeAnswers(questions, [0, 0, 0, 0, 0.5]), /out of range/);
  assert.throws(() => gradeAnswers(questions, [0, 0, 0, 0, -1]), /out of range/);
});
