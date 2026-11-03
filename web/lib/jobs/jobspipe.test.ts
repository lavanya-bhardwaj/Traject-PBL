import { test } from "node:test";
import assert from "node:assert/strict";
import { parseJobs } from "./jobspipe.ts";

test("keeps only active postings that have a web link", () => {
  const jobs = parseJobs({
    data: [
      { id: "1", job_title: "Data Analyst", company: "Acme", location: "Chennai", url: "https://jobs.example.com/1", date_posted: "2026-11-01", status: "active" },
      { id: "2", job_title: "Closed role", company: "Acme", url: "https://jobs.example.com/2", status: "closed" },
      { id: "3", job_title: "No link", company: "Acme", url: "javascript:alert(1)", status: "active" },
      { id: "4", job_title: "Missing url", company: "Acme", status: "active" },
    ],
  });
  assert.equal(jobs.length, 1);
  assert.equal(jobs[0].title, "Data Analyst");
  assert.equal(jobs[0].applyUrl, "https://jobs.example.com/1");
});

test("returns no jobs for an unexpected response shape", () => {
  assert.deepEqual(parseJobs({ message: "error" }), []);
  assert.deepEqual(parseJobs(null), []);
});
