import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getSkill, listSkillsForUser } from "@/lib/skills";
import { searchCandidates } from "@/lib/profile";
import { clampLevel } from "@/lib/validation";

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ skill?: string; min?: string }>;
}) {
  return (
    <Suspense fallback={<p className="page container">Searching…</p>}>
      <Search searchParams={searchParams} />
    </Suspense>
  );
}

async function Search({ searchParams }: { searchParams: Promise<{ skill?: string; min?: string }> }) {
  const viewer = await getCurrentUser();
  if (!viewer) redirect("/login");
  // Student-to-student search. Employers use their own candidate search, which only shows opted-in students.
  if (viewer.role !== "student") notFound();

  const { skill: skillParam, min: minParam } = await searchParams;
  const allSkills = await listSkillsForUser(viewer.id);
  const skill = skillParam ? await getSkill(skillParam) : null;
  const minLevel = clampLevel(minParam);

  const hits = skill ? await searchCandidates(skill.id, minLevel, viewer.id) : [];

  return (
    <main className="page container">
      <h1>Find candidates</h1>
      <p className="hint" style={{ color: "var(--muted)", marginTop: 8 }}>
        Search by verified skill level. Claimed skills are not shown here.
      </p>

      <form method="get" className="card" style={{ padding: 22, marginTop: 24, maxWidth: 640, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div className="field" style={{ marginBottom: 0, flex: "1 1 220px" }}>
          <label htmlFor="skill">Skill</label>
          <select id="skill" name="skill" defaultValue={skill?.id ?? ""} required style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid var(--line)", font: "inherit" }}>
            <option value="" disabled>Choose a skill</option>
            {allSkills.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="field" style={{ marginBottom: 0, flex: "0 1 140px" }}>
          <label htmlFor="min">Minimum level</label>
          <select id="min" name="min" defaultValue={String(minLevel)} style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid var(--line)", font: "inherit" }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" type="submit">Search</button>
      </form>

      {skill && (
        <section style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: 22 }}>
            {hits.length} {hits.length === 1 ? "candidate" : "candidates"} at level {minLevel}+ in {skill.name}
          </h2>
          <ul className="skill-list">
            {hits.map((hit) => (
              <li key={hit.id} className="card skill-item">
                <div>
                  <Link href={`/u/${hit.id}`} className="name">{hit.name}</Link>
                  <div className="meta">{hit.headline || "No headline yet"}</div>
                </div>
                <span className="level-pill">Level {hit.level} of 5</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
