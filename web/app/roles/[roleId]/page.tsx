import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getRole } from "@/lib/roles";
import { getRoleMarket } from "@/lib/market";
import { verifiedLevels } from "@/lib/candidate-levels";
import { competencyGaps } from "@/lib/scoring/scoring";
import { query } from "@/lib/db";
import { formatPercent, improveAction, recommendRoles, STATUS_LABEL } from "@/lib/resume/recommend";
import { PathButton } from "./path-button";
import { EmptyState } from "@/components/empty-state";

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
  const claimedRows = await query<{ skill_id: string }>(
    "SELECT skill_id FROM skill_claims WHERE user_id = $1",
    [user.id],
  );
  const claimed = new Set(claimedRows.map((row) => row.skill_id));
  const [rec] = recommendRoles([role], levels, claimed);
  const gaps = competencyGaps(levels, role.requirements);
  const market = await getRoleMarket(roleId);

  return (
    <main className="page container">
      <h1>{role.title}</h1>
      <p className="hint" style={{ color: "var(--muted)", marginTop: 8 }}>{role.description}</p>

      <div className="card" style={{ padding: 22, marginTop: 24, maxWidth: 680 }}>
        <span className="level-pill">{STATUS_LABEL[rec.status]}</span>
        <div className="dash-grid" style={{ marginTop: 16 }}>
          <div>
            <div style={{ color: "var(--muted)", fontSize: 14 }}>Verified skill match</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: "var(--ink)" }}>{formatPercent(rec.verifiedMatch)}</div>
            <div className="dash-muted">Skills you have proven</div>
          </div>
          <div>
            <div style={{ color: "var(--muted)", fontSize: 14 }}>Compatibility</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: "var(--ink)" }}>{formatPercent(rec.compatibility)}</div>
            <div className="dash-muted">Skills claimed or proven</div>
          </div>
          <div>
            <div style={{ color: "var(--muted)", fontSize: 14 }}>Skills to improve</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: "var(--ink)" }}>{rec.missing.length}</div>
          </div>
        </div>
        <p style={{ marginTop: 18, fontSize: 15, color: "var(--text)" }}>
          {improveAction(rec.missing.map((m) => m.name))}
        </p>
      </div>

      {market && (
        <div className="card" style={{ padding: 22, marginTop: 24, maxWidth: 560 }}>
          <div style={{ color: "var(--muted)", fontSize: 14 }}>Demand (demo, no source yet)</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "var(--ink)", textTransform: "capitalize" }}>
            {market.demandLevel}
          </div>
          <div className="hint" style={{ color: "var(--muted)", marginTop: 6, fontSize: 13 }}>
            As of {market.asOf}. {market.sourceNote}{" "}
            <Link href="/insights" style={{ color: "var(--primary)", fontWeight: 600 }}>
              All insights
            </Link>
          </div>
        </div>
      )}

      <h2 style={{ marginTop: 32, fontSize: 22 }}>Skill gaps</h2>
      {Object.keys(gaps).length === 0 ? (
        <div style={{ marginTop: 12 }}>
          <EmptyState
            title="No gaps for this role"
            body="You meet every skill requirement. Explore other roles to compare."
            actionHref="/roles"
            actionLabel="Explore roles"
          />
        </div>
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
