import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getRole } from "@/lib/roles";
import { verifiedLevels } from "@/lib/candidate-levels";
import { competencyGaps, roleMatch } from "@/lib/scoring/scoring";
import { PathButton } from "./path-button";

export default function RolePage({ params }: { params: Promise<{ roleId: string }> }) {
  return (
    <Suspense fallback={<p className="page container">Loading role…</p>}>
      <Role params={params} />
    </Suspense>
  );
}

async function Role({ params }: { params: Promise<{ roleId: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { roleId } = await params;
  const role = await getRole(roleId);
  if (!role) notFound();

  const levels = await verifiedLevels(user.id);
  const match = roleMatch(levels, role.requirements);
  const gaps = competencyGaps(levels, role.requirements);

  return (
    <main className="page container">
      <h1>{role.title}</h1>
      <p className="hint" style={{ color: "var(--muted)", marginTop: 8 }}>{role.description}</p>

      <div className="card" style={{ padding: 22, marginTop: 24, maxWidth: 560 }}>
        <div style={{ color: "var(--muted)", fontSize: 14 }}>Your match</div>
        <div style={{ fontSize: 40, fontWeight: 800, color: "var(--ink)" }}>{match}%</div>
      </div>

      <h2 style={{ marginTop: 32, fontSize: 22 }}>Skill gaps</h2>
      {Object.keys(gaps).length === 0 ? (
        <p style={{ marginTop: 12 }}>No gaps. You meet every requirement for this role.</p>
      ) : (
        <ul className="skill-list">
          {Object.entries(gaps).map(([skillId, gap]) => (
            <li key={skillId} className="card skill-item">
              <div>
                <div className="name">{role.names[skillId]}</div>
                <div className="meta">
                  Level {levels[skillId] ?? 0} now, {role.requirements[skillId].required} needed
                </div>
              </div>
              <span className="level-pill">Gap {gap}</span>
            </li>
          ))}
        </ul>
      )}

      {Object.keys(gaps).length > 0 && <PathButton roleId={roleId} />}

      <p style={{ marginTop: 28 }}>
        <Link href="/roles" style={{ color: "var(--primary)", fontWeight: 600 }}>
          ← All roles
        </Link>
      </p>
    </main>
  );
}
