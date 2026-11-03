import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { listRoles, getRole } from "@/lib/roles";
import { verifiedLevels } from "@/lib/candidate-levels";
import { recommendRoles, STATUS_LABEL } from "@/lib/resume/recommend";
import { searchJobsByTitle, type JobPosting, type JobSearchResult } from "@/lib/jobs/jobspipe";
import { EmptyState } from "@/components/empty-state";

export default function JobsPage() {
  return (
    <Suspense fallback={<p className="page container">Finding jobs…</p>}>
      <Jobs />
    </Suspense>
  );
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

async function Jobs() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "student") notFound();

  const levels = await verifiedLevels(user.id);
  const claimedRows = await query<{ skill_id: string }>("SELECT skill_id FROM skill_claims WHERE user_id = $1", [user.id]);
  const claimed = new Set(claimedRows.map((row) => row.skill_id));
  const roles = await listRoles();
  const details = (await Promise.all(roles.map((r) => getRole(r.id)))).filter((r) => r !== null);
  const top = recommendRoles(details, levels, claimed).slice(0, 3);

  const results: JobSearchResult[] = await Promise.all(top.map((rec) => searchJobsByTitle(rec.title)));

  return (
    <main className="page container">
      <h1>Jobs for your top roles</h1>
      <p className="hint" style={{ marginTop: 8 }}>
        Postings come from JobsPipe and are matched by job title. Apply opens the employer&apos;s posting in a new tab.
        Traject does not apply for you.
      </p>

      {top.map((rec, index) => {
        const result = results[index];
        return (
          <section key={rec.roleId} className="card dash-card" style={{ marginTop: 20 }} aria-labelledby={`role-${rec.roleId}`}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <h2 id={`role-${rec.roleId}`} style={{ fontSize: 20 }}>{rec.title}</h2>
              <span className="level-pill">{STATUS_LABEL[rec.status]}</span>
            </div>
            <JobList result={result} />
          </section>
        );
      })}

      {top.length === 0 && (
        <div style={{ marginTop: 20 }}>
          <EmptyState title="No roles to search yet" body="Verify a skill or upload your resume to get role recommendations." actionHref="/resume/upload" actionLabel="Upload resume" />
        </div>
      )}

      <p style={{ marginTop: 24 }}>
        <Link href="/resume" style={{ color: "var(--primary)", fontWeight: 600 }}>← Back to your resume</Link>
      </p>
    </main>
  );
}

function JobList({ result }: { result: JobSearchResult }) {
  if (!result.ok && result.reason === "not_configured") {
    return <p className="dash-muted" style={{ marginTop: 12 }}>Job search is not set up on this server yet.</p>;
  }
  if (!result.ok) {
    return <p className="dash-muted" style={{ marginTop: 12 }}>Job results could not be loaded right now. Try again later.</p>;
  }
  if (result.jobs.length === 0) {
    return <p className="dash-muted" style={{ marginTop: 12 }}>No open postings found for this role right now.</p>;
  }
  return (
    <ul className="section-list">
      {result.jobs.map((job: JobPosting) => (
        <li key={job.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <strong>{job.title}</strong>
            <div className="dash-muted" style={{ fontSize: 14 }}>
              {job.company}{job.location ? ` · ${job.location}` : ""}{job.postedAt ? ` · posted ${formatDate(job.postedAt)}` : ""}
            </div>
          </div>
          <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
            Apply
          </a>
        </li>
      ))}
    </ul>
  );
}
