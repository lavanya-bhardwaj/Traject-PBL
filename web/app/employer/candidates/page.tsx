import Link from "next/link";
import { Suspense } from "react";
import { query } from "@/lib/db";
import { requireRole } from "@/lib/authz";
import { getEmployerForUser, searchCandidates, PAGE_SIZE, type CandidateFilters } from "@/lib/employer/queries";
import { canRecruit } from "@/lib/employer/rules";
import { addToShortlist } from "@/app/actions/shortlist";

type Params = Promise<Record<string, string | string[] | undefined>>;

export default function CandidatesPage({ searchParams }: { searchParams: Params }) {
  return (
    <Suspense fallback={<p className="page container">Loading candidates…</p>}>
      <Candidates searchParams={searchParams} />
    </Suspense>
  );
}

function one(value: string | string[] | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseFilters(sp: Record<string, string | string[] | undefined>): CandidateFilters {
  const level = Number(one(sp.minLevel));
  const page = Math.max(1, Number(one(sp.page)) || 1);
  return {
    name: one(sp.name).slice(0, 80),
    skillId: one(sp.skill).slice(0, 80),
    minLevel: level >= 1 && level <= 5 ? level : 1,
    education: one(sp.education).slice(0, 80),
    graduationYear: one(sp.year).replace(/[^0-9]/g, "").slice(0, 4),
    hasProject: one(sp.project) === "1",
    hasCertification: one(sp.certification) === "1",
    hasExperience: one(sp.experience) === "1",
    sort: one(sp.sort) === "skill_level" ? "skill_level" : "name",
    page,
  };
}

async function Candidates({ searchParams }: { searchParams: Params }) {
  const user = await requireRole("employer");
  const employer = await getEmployerForUser(user.id);
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const recruiting = employer ? canRecruit(employer.status) : false;

  const skills = await query<{ id: string; name: string }>("SELECT id, name FROM skills ORDER BY name");
  const { rows, total } = recruiting ? await searchCandidates(filters) : { rows: [], total: 0 };
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const link = (overrides: Partial<CandidateFilters>) => {
    const merged = { ...filters, ...overrides };
    const params = new URLSearchParams();
    if (merged.name) params.set("name", merged.name);
    if (merged.skillId) {
      params.set("skill", merged.skillId);
      params.set("minLevel", String(merged.minLevel));
    }
    if (merged.education) params.set("education", merged.education);
    if (merged.graduationYear) params.set("year", merged.graduationYear);
    if (merged.hasProject) params.set("project", "1");
    if (merged.hasCertification) params.set("certification", "1");
    if (merged.hasExperience) params.set("experience", "1");
    if (merged.sort === "skill_level") params.set("sort", "skill_level");
    if (merged.page > 1) params.set("page", String(merged.page));
    return `/employer/candidates?${params.toString()}`;
  };

  return (
    <main className="page container">
      <h1>Find candidates</h1>
      <p className="hint" style={{ marginTop: 8 }}>
        Only students who chose to be found appear here. Skill levels come from passed Traject checks, not from self-rating.
      </p>

      {!recruiting && (
        <div className="alert" role="alert" style={{ marginTop: 16 }}>
          Candidate search opens once your company is verified. Your registration status is shown on the employer dashboard.
        </div>
      )}

      {recruiting && (
        <form method="get" className="card" style={{ padding: 20, marginTop: 20, display: "grid", gap: 12 }}>
          <div className="reg-grid">
            <div className="field">
              <label htmlFor="name">Candidate name</label>
              <input id="name" name="name" defaultValue={filters.name} />
            </div>
            <div className="field">
              <label htmlFor="skill">Verified skill</label>
              <select id="skill" name="skill" defaultValue={filters.skillId}>
                <option value="">Any skill</option>
                {skills.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="minLevel">Minimum level</label>
              <select id="minLevel" name="minLevel" defaultValue={String(filters.minLevel)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n} or higher</option>
                ))}
              </select>
            </div>
          </div>
          <div className="reg-grid">
            <div className="field">
              <label htmlFor="education">Education (degree or institution)</label>
              <input id="education" name="education" defaultValue={filters.education} />
            </div>
            <div className="field">
              <label htmlFor="year">Graduation year</label>
              <input id="year" name="year" inputMode="numeric" defaultValue={filters.graduationYear} placeholder="e.g. 2027" />
            </div>
            <div className="field">
              <label htmlFor="sort">Sort by</label>
              <select id="sort" name="sort" defaultValue={filters.sort}>
                <option value="name">Name</option>
                <option value="skill_level">Skill level (needs a skill)</option>
              </select>
            </div>
          </div>
          <fieldset style={{ border: "none", padding: 0, display: "flex", gap: 16, flexWrap: "wrap" }}>
            <label className="choice"><input type="checkbox" name="project" value="1" defaultChecked={filters.hasProject} /> Has projects</label>
            <label className="choice"><input type="checkbox" name="certification" value="1" defaultChecked={filters.hasCertification} /> Has certifications</label>
            <label className="choice"><input type="checkbox" name="experience" value="1" defaultChecked={filters.hasExperience} /> Has experience</label>
          </fieldset>
          <div>
            <button className="btn btn-primary" type="submit">Search</button>
          </div>
          <p className="hint" style={{ fontSize: 13 }}>
            Not filterable yet: location and availability. Traject does not collect that information from students yet.
          </p>
        </form>
      )}

      {recruiting && (
        <>
          <p className="hint" style={{ marginTop: 20 }}>
            {total} {total === 1 ? "candidate" : "candidates"} found
          </p>
          {rows.length === 0 ? (
            <div className="card dash-card" style={{ marginTop: 12 }}>
              <h2 style={{ fontSize: 18 }}>No candidates match these filters yet</h2>
              <p className="dash-muted" style={{ marginTop: 6 }}>Try a lower minimum level or fewer filters.</p>
            </div>
          ) : (
            <ul className="skill-list">
              {rows.map((c) => (
                <li key={c.id} className="card skill-item" style={{ alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <Link href={`/employer/candidates/${c.id}`} className="name">{c.name}</Link>
                    <div className="meta">{c.headline || "No headline yet"}</div>
                    <div className="meta" style={{ marginTop: 6 }}>
                      {c.education ? `Education: ${c.education}` : "No education added yet"} · {c.verified_count} verified {c.verified_count === 1 ? "skill" : "skills"}
                      {filters.skillId && c.skill_level !== null && <> · Level {c.skill_level} of 5 in {skills.find((s) => s.id === filters.skillId)?.name}</>}
                      {filters.skillId && c.skill_level === null && <> · Not yet assessed in this skill</>}
                    </div>
                  </div>
                  <form action={addToShortlist}>
                    <input type="hidden" name="candidateId" value={c.id} />
                    <button className="btn btn-outline" type="submit">Shortlist</button>
                  </form>
                </li>
              ))}
            </ul>
          )}

          {pages > 1 && (
            <nav aria-label="Pages" style={{ display: "flex", gap: 12, marginTop: 20, alignItems: "center" }}>
              {filters.page > 1 && <Link href={link({ page: filters.page - 1 })} className="btn btn-outline">Previous</Link>}
              <span className="dash-muted">Page {filters.page} of {pages}</span>
              {filters.page < pages && <Link href={link({ page: filters.page + 1 })} className="btn btn-outline">Next</Link>}
            </nav>
          )}
        </>
      )}
    </main>
  );
}
