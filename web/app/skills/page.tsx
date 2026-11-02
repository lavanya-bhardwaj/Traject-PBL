import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listSkillsForUser } from "@/lib/skills";
import { profileScore } from "@/lib/scoring/scoring";

export default function SkillsPage() {
  return (
    <Suspense fallback={<p className="page container">Loading your skills…</p>}>
      <Skills />
    </Suspense>
  );
}

async function Skills() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const skills = await listSkillsForUser(user.id);

  const levels: Record<string, number> = {};
  for (const skill of skills) {
    if (skill.level !== null) levels[skill.id] = skill.level;
  }
  const verified = Object.keys(levels).length;

  return (
    <main className="page container">
      <div className="page-head">
        <h1>Your skills</h1>
        <p className="hint">Levels come from short checks you pass, not from self-rating.</p>
      </div>

      <div className="card" style={{ padding: 22, marginTop: 24, maxWidth: 560 }}>
        <div style={{ color: "var(--muted)", fontSize: 14 }}>Profile score</div>
        <div style={{ fontSize: 40, fontWeight: 800, color: "var(--ink)" }}>
          {profileScore(levels, skills.map((s) => s.id))}
          <span style={{ fontSize: 18, color: "var(--muted)", fontWeight: 600 }}> / 100</span>
        </div>
        <div style={{ color: "var(--muted)", fontSize: 14 }}>
          {verified} of {skills.length} skills verified
        </div>
      </div>

      <p style={{ marginTop: 16 }}>
        <Link href="/skills/describe" className="btn btn-outline">
          Describe your experience
        </Link>
      </p>

      <ul className="skill-list">
        {skills.map((skill) => (
          <li key={skill.id} className="card skill-item">
            <div>
              <div className="name">{skill.name}</div>
              <div className="meta">{skill.category}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", justifyContent: "flex-end" }}>
              {skill.level === null ? (
                skill.claimed ? (
                  <span className="meta" style={{ color: "#b45309" }}>Claimed · not verified</span>
                ) : (
                  <span className="meta">Not checked yet</span>
                )
              ) : (
                <span className="level-pill">
                  Level {skill.level} of 5 · {skill.correct}/{skill.total} correct
                </span>
              )}
              <Link href={`/skills/${skill.id}`} className="btn btn-outline">
                {skill.level === null ? "Take the check" : "Retake"}
              </Link>
            </div>
          </li>
        ))}
      </ul>

      <p style={{ marginTop: 24 }}>
        <Link href="/dashboard" style={{ color: "var(--primary)", fontWeight: 600 }}>
          ← Back to dashboard
        </Link>
      </p>
    </main>
  );
}
