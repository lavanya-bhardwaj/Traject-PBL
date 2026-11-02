import { test } from "node:test";
import assert from "node:assert/strict";
import { clampLevel, isUuid, profileError } from "./validation.ts";

test("accepts well-formed UUIDs only", () => {
  assert.equal(isUuid("3f2504e0-4f89-41d3-9a0c-0305e82c3301"), true);
  assert.equal(isUuid("not-a-uuid"), false);
  assert.equal(isUuid("3f2504e0-4f89-41d3-9a0c-0305e82c330"), false);
  assert.equal(isUuid(42), false);
});

test("profile name must be 2 to 80 characters", () => {
  assert.match(profileError({ name: "A", headline: "" }) ?? "", /Name must be/);
  assert.equal(profileError({ name: "Ab", headline: "" }), null);
  assert.match(profileError({ name: "x".repeat(81), headline: "" }) ?? "", /Name must be/);
});

test("headline is limited to 120 characters", () => {
  assert.equal(profileError({ name: "Ab", headline: "x".repeat(120) }), null);
  assert.match(profileError({ name: "Ab", headline: "x".repeat(121) }) ?? "", /Headline/);
});

test("levels are clamped to 1 to 5 with a default", () => {
  assert.equal(clampLevel(undefined), 3);
  assert.equal(clampLevel("abc"), 3);
  assert.equal(clampLevel("0"), 1);
  assert.equal(clampLevel("9"), 5);
  assert.equal(clampLevel("4"), 4);
});
