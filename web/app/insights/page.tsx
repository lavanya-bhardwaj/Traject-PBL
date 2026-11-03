import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listRoleMarket, listSkillTrends } from "@/lib/market";
import { getRole, listRoles } from "@/lib/roles";

export default function InsightsPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  return (
    <Suspense fallback={<p className="page container">Loading insights…</p>}>
      <Insights searchParams={searchParams} />
    </Suspense>
  );
}

async function Insights({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { role } = await searchParams;
  const roles = await listRoles();
  const selectedId = roles.some((r) => r.id === role) ? (role as string) : "";

  const [roleRows, skillRows, detail] = await Promise.all([
    listRoleMarket(),
    listSkillTrends(),
    selectedId ? getRole(selectedId) : Promise.resolve(null),
  ]);

  // Filters that the data supports: role (which also narrows skills to that role's requirements).
  const visibleRoles = selectedId ? roleRows.filter((r) => r.roleId === selectedId) : roleRows;
  const visibleSkills = detail
    ? skillRows.filter((s) => Object.prototype.hasOwnProperty.call(detail.requirements, s.skillId))
    : skillRows;

  const asOf = roleRows[0]?.asOf ?? skillRows[0]?.asOf;

  return (
    <main className="page container">
      <div className="card" style={{ padding: 20, borderStyle: "dashed" }}>
        <span className="level-pill">Demo</span>
        <p style={{ marginTop: 10, fontWeight: 600, color: "var(--ink)" }}>
          These figures are demo data for layout and testing. They are not from a labour-market source.
        </p>
        <p className="hint" style={{ marginTop: 6 }}>
          Do not use them for decisions. Source: none yet. Last updated {asOf ?? "not set"}.
        </p>
      </div>

      <h1 style={{ marginTop: 28 }}>Career insights</h1>

      <form method="get" className="card" style={{ padding: 20, marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div className="field" style={{ minWidth: 240, marginBottom: 0 }}>
          <label htmlFor="role">Role</label>
          <select id="role" name="role" defaultValue={selectedId}>
            <option value="">All roles</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" type="submit">Apply</button>
      </form>
      <p className="hint" style={{ marginTop: 10 }}>
        Industry, location, experience level and time period are not filterable yet. They need a data source first.
      </p>

      <h2 style={{ marginTop: 32, fontSize: 22 }}>Roles</h2>
      <ul className="skill-list">
        {visibleRoles.map((r) => (
          <li key={r.roleId} className="card skill-item">
            <div>
              <div className="name">{r.title}</div>
              <div className="meta">
                Demand (demo): {r.demandLevel} · As of {r.asOf} · Source: {r.sourceNote}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <h2 style={{ marginTop: 32, fontSize: 22 }}>{selectedId ? "Skills for this role" : "Skills"}</h2>
      <ul className="skill-list">
        {visibleSkills.map((s) => (
          <li key={s.skillId} className="card skill-item">
            <div>
              <div className="name">{s.name}</div>
              <div className="meta">
                Demand (demo): {s.demandLevel} · Trend (demo): {s.trend} · As of {s.asOf} · Source: {s.sourceNote}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
