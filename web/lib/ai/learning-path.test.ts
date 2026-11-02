import { test } from "node:test";
import assert from "node:assert/strict";
import { fallbackPath, parseLearningPath, type GapItem } from "./learning-path.ts";

const gaps: GapItem[] = [
  { skillId: "sql", name: "SQL", current: 0, required: 4, gap: 4 },
  { skillId: "python", name: "Python", current: 2, required: 3, gap: 1 },
  { skillId: "communication", name: "Written Communication", current: 1, required: 3, gap: 2 },
];

test("fallback orders gaps largest first", () => {
  assert.deepEqual(fallbackPath(gaps).map((s) => s.skillId), ["sql", "communication", "python"]);
});

test("parses steps in the model's order and keeps the action text", () => {
  const raw = '{"steps":[{"skillId":"python","action":"Build a small script."},{"skillId":"sql","action":"Write joins."}]}';
  const steps = parseLearningPath(raw, gaps)!;
  assert.deepEqual(steps.map((s) => s.skillId), ["python", "sql", "communication"]);
  assert.equal(steps[0].action, "Build a small script.");
});

test("drops skills that are not gaps", () => {
  const raw = '{"steps":[{"skillId":"rust","action":"x"},{"skillId":"sql","action":"Write joins."}]}';
  const steps = parseLearningPath(raw, gaps)!;
  assert.ok(!steps.some((s) => s.skillId === "rust"));
  assert.equal(steps[0].skillId, "sql");
});

test("appends gaps the model left out, so none are dropped", () => {
  const raw = '{"steps":[{"skillId":"sql","action":"Write joins."}]}';
  assert.deepEqual(parseLearningPath(raw, gaps)!.map((s) => s.skillId), ["sql", "communication", "python"]);
});

test("uses a fallback action when the model gives an empty one", () => {
  const raw = '{"steps":[{"skillId":"sql","action":"  "}]}';
  assert.match(parseLearningPath(raw, gaps)![0].action, /Practise SQL to reach level 4/);
});

test("returns null when the reply is unusable", () => {
  assert.equal(parseLearningPath("no json", gaps), null);
  assert.equal(parseLearningPath('{"steps":"sql"}', gaps), null);
  assert.equal(parseLearningPath('{"steps":[{"skillId":"rust","action":"x"}]}', gaps), null);
});
