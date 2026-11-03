import { test } from "node:test";
import assert from "node:assert/strict";
import { canRecruit, validateEmployer } from "./rules.ts";
import { newEmployerCode } from "./code.ts";

const base: Record<string, string> = {
  companyName: "Acme Analytics Pvt Ltd",
  website: "https://acme.example.com",
  companyEmail: "hr@acme.example.com",
  companyPhone: "+91 98765 43210",
  country: "India",
  state: "Punjab",
  city: "Ludhiana",
  address: "12 Industrial Area, Phase 2",
  industry: "Analytics",
  companySize: "51-200",
  establishedYear: "2015",
  legalType: "company",
  cin: "U72900PB2015PTC045678",
  llpin: "",
  gstin: "",
  udyamNumber: "",
  otherIdentifier: "",
  recruiterName: "Riya Mehta",
  designation: "Talent Lead",
  department: "HR",
  recruiterPhone: "9876543210",
};

test("a registered company needs a valid CIN", () => {
  assert.equal(validateEmployer(base).ok, true);
  const bad = validateEmployer({ ...base, cin: "NOT-A-CIN" });
  assert.equal(bad.ok, false);
  assert.ok(!bad.ok && bad.errors.cin);
});

test("an LLP needs an LLPIN, not a CIN", () => {
  const llp = validateEmployer({ ...base, legalType: "llp", cin: "", llpin: "AAB-1234" });
  assert.equal(llp.ok, true);
  const missing = validateEmployer({ ...base, legalType: "llp", cin: "", llpin: "" });
  assert.ok(!missing.ok && missing.errors.llpin);
});

test("a sole proprietorship does not need CIN or GSTIN", () => {
  const sole = validateEmployer({ ...base, legalType: "proprietorship", cin: "" });
  assert.equal(sole.ok, true);
});

test("other registered entities must give their registration number", () => {
  const other = validateEmployer({ ...base, legalType: "other", cin: "", otherIdentifier: "" });
  assert.ok(!other.ok && other.errors.otherIdentifier);
});

test("optional GSTIN and Udyam numbers are checked only when given", () => {
  assert.equal(validateEmployer({ ...base, gstin: "" }).ok, true);
  assert.equal(validateEmployer({ ...base, gstin: "03ABCDE1234F1Z5" }).ok, true);
  const badGst = validateEmployer({ ...base, gstin: "123" });
  assert.ok(!badGst.ok && badGst.errors.gstin);
  const badUdyam = validateEmployer({ ...base, udyamNumber: "UDYAM-XX" });
  assert.ok(!badUdyam.ok && badUdyam.errors.udyamNumber);
});

test("establishment year must be realistic", () => {
  const future = validateEmployer({ ...base, establishedYear: "2999" });
  assert.ok(!future.ok && future.errors.establishedYear);
});

test("employer IDs have the TRAJ-EMP format and differ between calls", () => {
  const a = newEmployerCode();
  const b = newEmployerCode();
  assert.match(a, /^TRAJ-EMP-[0-9A-F]{8}$/);
  assert.notEqual(a, b);
});

test("only verified employers can recruit", () => {
  assert.equal(canRecruit("verified"), true);
  for (const status of ["pending", "under_review", "rejected", "suspended"] as const) {
    assert.equal(canRecruit(status), false, status);
  }
});
