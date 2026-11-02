import { test } from "node:test";
import assert from "node:assert/strict";
import { parseSkillSuggestions } from "./skill-mapping.ts";

const valid = new Set(["python", "sql"]);

test("keeps valid suggestions with their evidence", () => {
  const raw = '{"skills":[{"skillId":"python","evidence":"wrote Python scripts"}]}';
  assert.deepEqual(parseSkillSuggestions(raw, valid), [
    { skillId: "python", evidence: "wrote Python scripts" },
  ]);
});

test("drops skill IDs that are not in the taxonomy", () => {
  const raw = '{"skills":[{"skillId":"rust","evidence":"x"},{"skillId":"sql","evidence":"y"}]}';
  assert.deepEqual(parseSkillSuggestions(raw, valid), [{ skillId: "sql", evidence: "y" }]);
});

test("ignores duplicates", () => {
  const raw = '{"skills":[{"skillId":"sql","evidence":"a"},{"skillId":"sql","evidence":"b"}]}';
  assert.equal(parseSkillSuggestions(raw, valid).length, 1);
});

test("tolerates prose around the JSON", () => {
  const raw = 'Here you go: {"skills":[{"skillId":"python","evidence":"e"}]} thanks';
  assert.equal(parseSkillSuggestions(raw, valid)[0].skillId, "python");
});

test("returns nothing for malformed or unexpected replies", () => {
  assert.deepEqual(parseSkillSuggestions("no json here", valid), []);
  assert.deepEqual(parseSkillSuggestions("{not json}", valid), []);
  assert.deepEqual(parseSkillSuggestions('{"skills":"python"}', valid), []);
  assert.deepEqual(parseSkillSuggestions('{"skills":[null, 3]}', valid), []);
});

test("truncates long evidence", () => {
  const long = "x".repeat(500);
  const raw = `{"skills":[{"skillId":"python","evidence":"${long}"}]}`;
  assert.equal(parseSkillSuggestions(raw, valid)[0].evidence.length, 200);
});

test("accepts a valid ID with a name attached", () => {
  const raw = '{"skills":[{"skillId":"python:Python","evidence":"e"},{"skillId":"sql (SQL)","evidence":"f"}]}';
  assert.deepEqual(parseSkillSuggestions(raw, valid).map((s) => s.skillId), ["python", "sql"]);
});

test("does not accept an unknown ID just because it has a name attached", () => {
  const raw = '{"skills":[{"skillId":"rust:Rust","evidence":"e"}]}';
  assert.deepEqual(parseSkillSuggestions(raw, valid), []);
});
