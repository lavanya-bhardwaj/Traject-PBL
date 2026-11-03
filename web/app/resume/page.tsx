import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { profileSummary } from "@/lib/profile";
import { listRoles, getRole } from "@/lib/roles";
import { listEntries, listInterests } from "@/lib/profile-sections";
import { ENTRY_KINDS, type EntryKind } from "@/lib/profile-sections-validate";
import { completionItems, completionPercent } from "@/lib/profile-completion";
import { formatPercent, improveAction, recommendRoles, STATUS_LABEL } from "@/lib/resume/recommend";
import { PrintButton } from "./print-button";
import { getResume } from "@/lib/resume/store";
import { deleteStoredResume } from "@/app/actions/resume";
import { EmptyState } from "@/components/empty-state";

export default function ResumePage() {
  return (
    <Suspense fallback={<p className="page container">Loading resume…</p>}>
      <Resume />
    </Suspense>
  );
}

const SECTION_HEADINGS: Record<EntryKind, string> = {
  education: "Education",
  experience: "Experience",
  project: "Projects",
  certification: "Certifications",
};

async function Resume() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "student") notFound();

  const stored = await getResume(user.id);
  const summary = await profileSummary(user.id);
  const levels = Object.fromEntries(summary.verified.map((s) => [s.id, s.level as number]));

  // Extracted skills: the claims that came from the resume or description, with the quote they came from.
  const claims = await query<{ skill_id: string; name: string; evidence: string }>(
    `SELECT c.skill_id, s.name, c.evidence
       FROM skill_claims c JOIN skills s ON s.id = c.skill_id
      WHERE c.user_id = $1
      ORDER BY s.name`,
    [user.id],
  );
  const claimed = new Set(claims.map((c) => c.skill_id));

  const [counts] = await query<{ entries: number; interests: number }>(
    `SELECT (SELECT COUNT(*)::int FROM profile_entries WHERE user_id = $1) AS entries,
            (SELECT COUNT(*)::int FROM career_interests WHERE user_id = $1) AS interests`,
    [user.id],
  );
  const completion = completionItems({
    name: user.name,
    headline: user.headline,
    verifiedSkills: summary.verified.length,
    claimedSkills: claims.length,
    profileEntries: counts.entries,
    careerInterests: counts.interests,
  });

  const roles = await listRoles();
  const details = (await Promise.all(roles.map((r) => getRole(r.id)))).filter((r) => r !== null);
  const recommendations = recommendRoles(details, levels, claimed);

  const entries = await listEntries(user.id);
  const interests = await listInterests(user.id);
  const interestTitles = details.filter((r) => interests.includes(r.id)).map((r) => r.title);

  return (
    <main className="page container resume">
      <div className="no-print" style={{ marginBottom: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <PrintButton />
        <Link href="/resume/upload" className="btn btn-outline">
          Upload a resume
        </Link>
        <Link href="/jobs" className="btn btn-outline">
          Find jobs
        </Link>
      </div>

      <section className="card dash-card no-print" aria-labelledby="upload-heading">
        <h2 id="upload-heading" style={{ fontSize: 20 }}>1. Upload your resume</h2>
        <p className="hint" style={{ marginTop: 6 }}>
          Upload a PDF or .txt file. We read it, suggest skills, and add the ones you confirm to your profile as claims.
        </p>
        {stored ? (
          <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
            <p>
              <strong>Stored resume:</strong> {stored.originalName}
              <span className="dash-muted"> · uploaded {stored.uploadedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="/resume/file" className="btn btn-outline">Download</a>
              <Link href="/resume/upload" className="btn btn-outline">Replace</Link>
              <form action={deleteStoredResume}>
                <button className="btn btn-outline" type="submit">Remove</button>
              </form>
            </div>
          </div>
        ) : (
          <Link href="/resume/upload" className="btn btn-primary" style={{ marginTop: 14 }}>
            Upload resume
          </Link>
        )}
      </section>

      <section className="card dash-card" style={{ marginTop: 20 }} aria-labelledby="extracted-heading">
        <h2 id="extracted-heading" style={{ fontSize: 20 }}>2. Extracted skills</h2>
        {claims.length === 0 ? (
          <div style={{ marginTop: 8 }}>
            <EmptyState
              title="No skills extracted yet"
              body="Upload your resume, then confirm the skills it suggests. Confirmed skills appear here."
              actionHref="/resume/upload"
              actionLabel="Upload resume"
            />
          </div>
        ) : (
          <ul className="section-list">
            {claims.map((c) => (
              <li key={c.skill_id}>
                <div>
                  <strong>{c.name}</strong>{" "}
                  <Link href={`/skills/${c.skill_id}`} className="no-print" style={{ color: "var(--primary)", fontWeight: 600 }}>
                    Take the check
                  </Link>
                </div>
                {c.evidence && <p className="dash-muted" style={{ fontSize: 14, marginTop: 4 }}>“{c.evidence}”</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card dash-card no-print" style={{ marginTop: 20 }} aria-labelledby="completion-heading">
        <h2 id="completion-heading" style={{ fontSize: 20 }}>3. Profile completion</h2>
        <div className="dash-stat" style={{ fontSize: 30 }}>{completionPercent(completion)}%</div>
        <div className="dash-progress" role="progressbar" aria-label="Profile completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={completionPercent(completion)}>
          <span style={{ width: `${completionPercent(completion)}%` }} />
        </div>
        <ul className="section-list">
          {completion.map((item) => (
            <li key={item.label}>
              {item.done ? "✓ " : "○ "}
              {item.label}
              {!item.done && (
                <>
                  {" "}
                  <Link href={item.href} style={{ color: "var(--primary)", fontWeight: 600 }}>
                    Add it
                  </Link>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="no-print" style={{ marginTop: 20 }} aria-labelledby="roles-heading">
        <h2 id="roles-heading" style={{ fontSize: 20 }}>4. Role recommendations</h2>
        <p className="hint" style={{ marginTop: 6 }}>
          Verified skill match counts only proven skills. Compatibility also counts claimed skills.
        </p>
        <ul className="skill-list">
          {recommendations.map((rec) => (
            <li key={rec.roleId} className="card skill-item" style={{ alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div className="name">{rec.title}</div>
                <div className="meta">
                  {STATUS_LABEL[rec.status]} · Verified match {formatPercent(rec.verifiedMatch)} · Compatibility {formatPercent(rec.compatibility)}
                </div>
                <p style={{ marginTop: 8, fontSize: 14 }}>{improveAction(rec.missing.map((m) => m.name))}</p>
              </div>
              <Link href={`/roles/${rec.roleId}`} className="btn btn-outline">
                View role
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 28 }} aria-labelledby="profile-heading">
        <h1>{user.name}</h1>
        {user.headline && <p style={{ marginTop: 6 }}>{user.headline}</p>}
        <p className="hint" style={{ marginTop: 6 }}>{user.email}</p>
        {interestTitles.length > 0 && (
          <p style={{ marginTop: 10 }}>
            <strong>Career interests:</strong> {interestTitles.join(", ")}
          </p>
        )}
        <h2 id="profile-heading" style={{ marginTop: 24, fontSize: 20 }}>Verified skills</h2>
        {summary.verified.length === 0 ? (
          <div style={{ marginTop: 6 }}>
            <EmptyState
              title="No verified skills yet"
              body="Verified skills come from passed checks. Take one to start your score."
              actionHref="/skills"
              actionLabel="Take a skill check"
            />
          </div>
        ) : (
          <ul style={{ marginTop: 8, paddingLeft: 20 }}>
            {summary.verified.map((s) => (
              <li key={s.id}>
                {s.name}: level {s.level} of 5
              </li>
            ))}
          </ul>
        )}
        <p style={{ marginTop: 10 }}>Profile score: {summary.score} / 100 (verified skills only)</p>

        {ENTRY_KINDS.map((kind) => {
          const items = entries.filter((e) => e.kind === kind);
          if (items.length === 0) return null;
          return (
            <div key={kind} style={{ marginTop: 22 }}>
              <h2 style={{ fontSize: 20 }}>{SECTION_HEADINGS[kind]}</h2>
              <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                {items.map((entry) => (
                  <li key={entry.id} style={{ marginBottom: 8 }}>
                    <strong>{entry.title}</strong>
                    {entry.organization && <> · {entry.organization}</>}
                    {entry.period && <> · {entry.period}</>}
                    {entry.details && <div style={{ fontSize: 14 }}>{entry.details}</div>}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>
    </main>
  );
}
