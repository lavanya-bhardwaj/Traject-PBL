import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/authz";
import { getEmployerForUser, getDiscoverableCandidate } from "@/lib/employer/queries";
import { canRecruit } from "@/lib/employer/rules";
import { getRole, listRoles } from "@/lib/roles";
import { addToShortlist } from "@/app/actions/shortlist";

const SECTION_HEADINGS: Record<string, string> = {
  education: "Education",
  experience: "Experience",
  project: "Projects",
  certification: "Certifications",
};

export default function CandidateProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ role?: string }>;
}) {
  return (
    <Suspense fallback={<p className="page container">Loading candidate…</p>}>
      <CandidateProfile params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function CandidateProfile({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ role?: string }>;
}) {
  const user = await requireRole("employer");
  const employer = await getEmployerForUser(user.id);
  const recruiting = employer ? canRecruit(employer.status) : false;

  const { id } = await params;
  const { role } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const candidate = await getDiscoverableCandidate(id);
  if (!candidate) notFound();

  const roles = await listRoles();
  const selected = roles.find((r) => r.id === role);
  const detail = selected ? await getRole(selected.id) : null;

  // Compatibility is a count of required skills at or above the required level. It is not a prediction of performance.
  let matchLine: string | null = null;
  if (detail) {
    const required = Object.entries(detail.requirements);
    const met = required.filter(([skillId, req]) => (candidate.levels[skillId] ?? 0) >= req.required).length;
    matchLine = `Candidate meets ${met} of the ${required.length} required skills for ${detail.title}.`;
  }

  return (
    <main className="page container">
      <Link href="/employer/candidates" style={{ color: "var(--primary)", fontWeight: 600 }}>← Back to candidates</Link>

      <div className="card dash-card" style={{ marginTop: 16 }}>
        <h1>{candidate.name}</h1>
        <p className="hint" style={{ marginTop: 6 }}>{candidate.headline || "No headline yet"}</p>
        {candidate.interests.length > 0 && (
          <p style={{ marginTop: 10 }}><strong>Career interests:</strong> {candidate.interests.join(", ")}</p>
        )}
        {recruiting ? (
          <form action={addToShortlist} style={{ marginTop: 14 }}>
            <input type="hidden" name="candidateId" value={candidate.id} />
            <button className="btn btn-primary" type="submit">Shortlist candidate</button>
          </form>
        ) : (
          <p className="alert" role="alert" style={{ marginTop: 14 }}>
            Shortlisting opens once your company is verified.
          </p>
        )}
      </div>

      <section className="card dash-card" style={{ marginTop: 20 }} aria-labelledby="skills-heading">
        <h2 id="skills-heading" style={{ fontSize: 20 }}>Verified competencies</h2>
        <p className="hint" style={{ marginTop: 6 }}>Levels come from passed Traject checks. Claimed skills are not shown here.</p>
        {Object.keys(candidate.levels).length === 0 ? (
          <p className="dash-muted" style={{ marginTop: 10 }}>No skill checks passed yet.</p>
        ) : (
          <ul className="section-list">
            {Object.entries(candidate.levels).map(([skillId, level]) => (
              <li key={skillId}>
                <strong>{candidate.skillNames[skillId]}</strong>: level {level} of 5
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card dash-card" style={{ marginTop: 20 }} aria-labelledby="role-heading">
        <h2 id="role-heading" style={{ fontSize: 20 }}>Role compatibility</h2>
        <form method="get" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
          <select name="role" defaultValue={role ?? ""} aria-label="Role to compare">
            <option value="">Choose a role</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>
          <button className="btn btn-outline" type="submit">Compare</button>
        </form>
        {matchLine && <p style={{ marginTop: 12 }}>{matchLine}</p>}
      </section>

      {["education", "experience", "project", "certification"].map((kind) => {
        const items = candidate.entries.filter((e) => e.kind === kind);
        if (items.length === 0) return null;
        return (
          <section key={kind} className="card dash-card" style={{ marginTop: 20 }}>
            <h2 style={{ fontSize: 20 }}>{SECTION_HEADINGS[kind]}</h2>
            <ul className="section-list">
              {items.map((e, i) => (
                <li key={`${kind}-${i}`}>
                  <strong>{e.title}</strong>
                  {e.organization && <span className="dash-muted"> · {e.organization}</span>}
                  {e.period && <span className="dash-muted"> · {e.period}</span>}
                  {e.details && <p className="dash-muted" style={{ fontSize: 14, marginTop: 4 }}>{e.details}</p>}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </main>
  );
}
