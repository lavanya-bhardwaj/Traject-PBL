import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listRoles, getRole } from "@/lib/roles";
import { verifiedLevels } from "@/lib/candidate-levels";
import { roleMatch } from "@/lib/scoring/scoring";

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
  const roles = await listRoles();
  const matches = await Promise.all(
    roles.map(async (role) => {
      const detail = await getRole(role.id);
      return { role, match: detail ? roleMatch(levels, detail.requirements) : 0 };
    }),
  );
  matches.sort((a, b) => b.match - a.match);

  return (
    <main className="page container">
      <h1>Roles</h1>
      <p className="hint" style={{ color: "var(--muted)", marginTop: 8 }}>
        Matches use only skills you have verified. Claimed skills do not count yet.
      </p>
      <ul className="skill-list">
        {matches.map(({ role, match }) => (
          <li key={role.id} className="card skill-item">
            <div>
              <div className="name">{role.title}</div>
              <div className="meta">{role.description}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span className="level-pill">{match}% match</span>
              <Link href={`/roles/${role.id}`} className="btn btn-outline">
                View gaps
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
