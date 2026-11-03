import { test } from "node:test";
import assert from "node:assert/strict";
import { parseRoleIds, validateEntry } from "./profile-sections-validate.ts";
import { completionItems, completionPercent } from "./profile-completion.ts";

const base = { kind: "education", title: "B.Tech", organization: "", period: "", details: "" };

test("an entry needs a valid kind and a title of 2 to 120 characters", () => {
  assert.equal(validateEntry({ ...base, kind: null }).ok, false);
  assert.equal(validateEntry({ ...base, kind: "hobby" }).ok, false);
  assert.equal(validateEntry({ ...base, title: "A" }).ok, false);
  assert.equal(validateEntry({ ...base, title: "x".repeat(121) }).ok, false);
  assert.equal(validateEntry(base).ok, true);
});

test("only the title is required; other fields may be empty", () => {
  const result = validateEntry({ ...base, organization: "", period: "", details: "" });
  assert.deepEqual(result.ok && result.value, { kind: "education", title: "B.Tech", organization: "", period: "", details: "" });
});

test("entry text is trimmed and length-limited", () => {
  const result = validateEntry({ ...base, title: "  Data Lab  ", details: "d".repeat(1001) });
  assert.equal(result.ok, false);
  const trimmed = validateEntry({ ...base, title: "  Data Lab  " });
  assert.equal(trimmed.ok && trimmed.value.title, "Data Lab");
});

test("role IDs from the form are kept only when they look like IDs, without duplicates", () => {
  assert.deepEqual(parseRoleIds(["data-analyst", "data-analyst", "Bad ID!", "junior-software-engineer", 5 as unknown as string]), [
    "data-analyst",
    "junior-software-engineer",
  ]);
});

test("profile completion counts six checkpoints", () => {
  const empty = completionItems({ name: "Ann", headline: "", verifiedSkills: 0, claimedSkills: 0, profileEntries: 0, careerInterests: 0 });
  assert.equal(completionPercent(empty), 17);
  const full = completionItems({ name: "Ann", headline: "Analyst", verifiedSkills: 1, claimedSkills: 1, profileEntries: 1, careerInterests: 1 });
  assert.equal(completionPercent(full), 100);
});
