import { test } from "node:test";
import assert from "node:assert/strict";
import { pickNextSkill } from "./next-skill.ts";

test("prefers a skill that has not been verified yet", () => {
  const skills = [
    { id: "python", name: "Python", level: 3 },
    { id: "sql", name: "SQL", level: null },
    { id: "communication", name: "Written Communication", level: 1 },
  ];
  assert.equal(pickNextSkill(skills, "python")?.id, "sql");
});

test("otherwise picks the lowest verified level", () => {
  const skills = [
    { id: "python", name: "Python", level: 4 },
    { id: "sql", name: "SQL", level: 2 },
    { id: "communication", name: "Written Communication", level: 5 },
  ];
  assert.equal(pickNextSkill(skills, "python")?.id, "sql");
});

test("never returns the skill that was just assessed", () => {
  const skills = [{ id: "python", name: "Python", level: null }];
  assert.equal(pickNextSkill(skills, "python"), null);
});
