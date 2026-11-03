import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { listRoles, getRole } from "@/lib/roles";
import { verifiedLevels } from "@/lib/candidate-levels";
import { formatPercent, improveAction, recommendRoles, STATUS_LABEL } from "@/lib/resume/recommend";
import { listInterests } from "@/lib/profile-sections";

export default function RolesPage() {
  return (
    <Suspense fallback={<p className="page container">Loading roles…</p>}>
      <Roles />
    </Suspense>
  );
}

async function Roles() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const levels = await verifiedLevels(user.id);
  const claimedRows = await query<{ skill_id: string }>(
    "SELECT skill_id FROM skill_claims WHERE user_id = $1",
    [user.id],
  );
  const claimed = new Set(claimedRows.map((row) => row.skill_id));

  const roles = await listRoles();
  const details = (await Promise.all(roles.map((r) => getRole(r.id)))).filter((r) => r !== null);
  const descriptions = Object.fromEntries(roles.map((r) => [r.id, r.description]));
  const recommendations = recommendRoles(details, levels, claimed);
  const interests = new Set(await listInterests(user.id));

  return (
    <main className="page container">
      <h1>Roles</h1>
      <p className="hint" style={{ color: "var(--muted)", marginTop: 8 }}>
        Verified skill match counts only skills you have proven. Compatibility also counts skills you have
        claimed, so it shows how much of the role you already cover.
      </p>
      <ul className="skill-list">
        {recommendations.map((rec) => (
          <li key={rec.roleId} className="card skill-item" style={{ alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div className="name">{rec.title}</div>
              <div className="meta">{descriptions[rec.roleId]}</div>
              <div className="meta" style={{ marginTop: 10, display: "flex", gap: 18, flexWrap: "wrap" }}>
                <span>
                  <strong style={{ color: "var(--ink)" }}>{formatPercent(rec.verifiedMatch)}</strong> verified skill match
                </span>
                <span>
                  <strong style={{ color: "var(--ink)" }}>{formatPercent(rec.compatibility)}</strong> compatibility
                </span>
                <span>
                  <strong style={{ color: "var(--ink)" }}>{rec.missing.length}</strong>{" "}
                  {rec.missing.length === 1 ? "skill" : "skills"} to improve
                </span>
              </div>
              <p style={{ marginTop: 10, fontSize: 14, color: "var(--text)" }}>
                {improveAction(rec.missing.map((m) => m.name))}
              </p>
            </div>
            <div style={{ display: "grid", gap: 10, justifyItems: "end" }}>
              <span className="level-pill">{STATUS_LABEL[rec.status]}</span>
              {interests.has(rec.roleId) && <span className="level-pill">Your interest</span>}
              <Link href={`/roles/${rec.roleId}`} className="btn btn-outline">
                View gaps
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
