import { test } from "node:test";
import assert from "node:assert/strict";
import { checkResumeFile, extractResumeText, MAX_RESUME_BYTES } from "./extract.ts";
import { keywordSkills } from "./keyword-skills.ts";
import { formatPercent, improveAction, recommendRoles, type RoleInput } from "./recommend.ts";

// Smallest valid one-page PDF with a line of text.
function tinyPdf(text: string): Uint8Array {
  const stream = `BT /F1 11 Tf 40 750 Td (${text}) Tj ET`;
  const objs = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let out = "%PDF-1.4\n";
  const offsets: number[] = [];
  objs.forEach((o, i) => {
    offsets.push(out.length);
    out += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  out += offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("");
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new TextEncoder().encode(out);
}

test("reading a PDF leaves the caller's bytes intact so the file can be stored", async () => {
  const bytes = tinyPdf("Python and SQL developer");
  const size = bytes.length;
  const text = await extractResumeText(bytes, true);
  assert.match(text, /Python and SQL developer/);
  assert.equal(bytes.length, size);
});

test("percents are shown as whole numbers", () => {
  assert.equal(formatPercent(14.29), "14%");
  assert.equal(formatPercent(11.11), "11%");
  assert.equal(formatPercent(60), "60%");
});

test("the improve action names up to three skills", () => {
  assert.equal(improveAction([]), "You meet every skill requirement for this role.");
  assert.equal(improveAction(["SQL"]), "Improve your match by verifying SQL.");
  assert.equal(improveAction(["SQL", "Python"]), "Improve your match by verifying SQL and Python.");
  assert.equal(
    improveAction(["Data Analysis", "Written Communication", "SQL", "Python"]),
    "Improve your match by verifying Data Analysis, Written Communication, and SQL.",
  );
});

const taxonomy = [
  { id: "python", name: "Python" },
  { id: "sql", name: "SQL" },
  { id: "communication", name: "Written Communication" },
];

const pdfHead = new TextEncoder().encode("%PDF-1.7");

test("accepts a real PDF and a text file, rejects others", () => {
  assert.deepEqual(checkResumeFile("cv.pdf", 100, pdfHead), { ok: true, isPdf: true });
  assert.deepEqual(checkResumeFile("cv.txt", 100, new Uint8Array()), { ok: true, isPdf: false });
  assert.equal(checkResumeFile("cv.docx", 100, pdfHead).ok, false);
  assert.equal(checkResumeFile("cv.pdf", 100, new TextEncoder().encode("hello")).ok, false);
  assert.equal(checkResumeFile("cv.pdf", 0, pdfHead).ok, false);
  assert.equal(checkResumeFile("cv.pdf", MAX_RESUME_BYTES + 1, pdfHead).ok, false);
});

test("keyword fallback finds skills by name or alias as whole words", () => {
  const found = keywordSkills("Wrote Python scripts and mysql reports.", taxonomy).map((s) => s.skillId);
  assert.deepEqual(found.sort(), ["python", "sql"]);
});

test("keyword fallback does not match inside another word", () => {
  assert.deepEqual(keywordSkills("I like pythonic code and sqlish tools", taxonomy), []);
});

const roles: RoleInput[] = [
  {
    id: "data-analyst",
    title: "Data Analyst",
    requirements: { sql: { required: 4, weight: 1 }, python: { required: 4, weight: 1 } },
    names: { sql: "SQL", python: "Python" },
  },
  {
    id: "junior",
    title: "Junior Software Engineer",
    requirements: { python: { required: 2, weight: 1 }, communication: { required: 2, weight: 1 } },
    names: { python: "Python", communication: "Written Communication" },
  },
];

test("a role with verified skills at the required level is marked apply", () => {
  const result = recommendRoles(roles, { python: 4, sql: 4 }, new Set());
  assert.equal(result[0].roleId, "data-analyst");
  assert.equal(result[0].status, "apply");
  assert.equal(result[0].verifiedMatch, 100);
});

test("claimed skills raise compatibility but not the match", () => {
  const result = recommendRoles(roles, { python: 2 }, new Set(["communication"]));
  const junior = result.find((r) => r.roleId === "junior")!;
  assert.equal(junior.verifiedMatch, 50);
  assert.equal(junior.compatibility, 100);
  assert.equal(junior.status, "close");
  assert.deepEqual(junior.missing.find((m) => m.skillId === "communication")?.claimed, true);
});

test("a role with no overlap is not a fit yet", () => {
  const result = recommendRoles(roles, {}, new Set(["communication"]));
  const analyst = result.find((r) => r.roleId === "data-analyst")!;
  assert.equal(analyst.status, "not-yet");
  assert.equal(analyst.compatibility, 0);
});
