import { test } from "node:test";
import assert from "node:assert/strict";
import { competencyGaps, profileScore, roleMatch } from "./scoring.ts";

test("profile score is 0 when nothing is verified", () => {
  assert.equal(profileScore({}, ["python", "sql"]), 0);
});

test("profile score averages levels against the maximum", () => {
  // (5 + 1) / (5 + 5) = 60%
  assert.equal(profileScore({ python: 5, sql: 1 }, ["python", "sql"]), 60);
});

test("unverified skills count as zero", () => {
  // 3 / (6 skills * 5) = 10%
  const skills = ["python", "sql", "git", "javascript", "data-analysis", "communication"];
  assert.equal(profileScore({ python: 3 }, skills), 10);
});

test("profile score respects weights", () => {
  // (3*5 + 1*1) / (3*5 + 1*5) = 16 / 20 = 80%
  assert.equal(profileScore({ python: 5, sql: 1 }, ["python", "sql"], { python: 3 }), 80);
});

test("role match is 100 when every requirement is met", () => {
  const requirements = {
    python: { required: 3, weight: 2 },
    sql: { required: 2, weight: 1 },
  };
  assert.equal(roleMatch({ python: 4, sql: 2 }, requirements), 100);
});

test("role match caps each skill at its requirement", () => {
  const requirements = { python: { required: 2, weight: 1 } };
  assert.equal(roleMatch({ python: 5 }, requirements), 100);
});

test("role match counts unverified skills as zero", () => {
  const requirements = {
    python: { required: 4, weight: 1 },
    sql: { required: 4, weight: 1 },
  };
  // (2 + 0) / (4 + 4) = 25%
  assert.equal(roleMatch({ python: 2 }, requirements), 25);
});

test("competency gaps list only shortfalls, largest first", () => {
  const requirements = {
    python: { required: 4, weight: 1 },
    sql: { required: 3, weight: 1 },
    git: { required: 2, weight: 1 },
  };
  assert.deepEqual(competencyGaps({ python: 2, sql: 3, git: 1 }, requirements), {
    python: 2,
    git: 1,
  });
});

test("unverified skills show their full required level as a gap", () => {
  const requirements = { sql: { required: 3, weight: 1 } };
  assert.deepEqual(competencyGaps({}, requirements), { sql: 3 });
});
