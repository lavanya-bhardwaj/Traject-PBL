import Link from "next/link";
import { Suspense } from "react";
import { query } from "@/lib/db";
import { requireRole } from "@/lib/authz";
import { getEmployerForUser } from "@/lib/employer/queries";
import { canRecruit } from "@/lib/employer/rules";
import { removeFromShortlist } from "@/app/actions/shortlist";
import { EmptyState } from "@/components/empty-state";

export default function ShortlistPage() {
  return (
    <Suspense fallback={<p className="page container">Loading shortlist…</p>}>
      <Shortlist />
    </Suspense>
  );
}

async function Shortlist() {
  const user = await requireRole("employer");
  const employer = await getEmployerForUser(user.id);
  if (!employer) return <main className="page container"><p>No company profile is linked to this account.</p></main>;

  // Each query is scoped to this employer, so one company never sees another company's shortlist.
  const rows = await query<{ id: string; name: string; headline: string }>(
    `SELECT u.id, u.name, u.headline
       FROM candidate_shortlists s
       JOIN users u ON u.id = s.candidate_id
      WHERE s.employer_id = $1
      ORDER BY s.created_at DESC`,
    [employer.id],
  );
  const recruiting = canRecruit(employer.status);

  return (
    <main className="page container">
      <h1>Shortlisted candidates</h1>
      <p className="hint" style={{ marginTop: 8 }}>Only your company can see this list.</p>

      {rows.length === 0 ? (
        <div style={{ marginTop: 20 }}>
          <EmptyState
            title="No candidates shortlisted yet"
            body="Shortlist students from search results or their profiles. Your list stays private to your company."
            actionHref={recruiting ? "/employer/candidates" : "/employer"}
            actionLabel={recruiting ? "Find candidates" : "Back to the dashboard"}
          />
        </div>
      ) : (
        <ul className="skill-list">
          {rows.map((c) => (
            <li key={c.id} className="card skill-item">
              <div>
                <Link href={`/employer/candidates/${c.id}`} className="name">{c.name}</Link>
                <div className="meta">{c.headline || "No headline yet"}</div>
              </div>
              <form action={removeFromShortlist}>
                <input type="hidden" name="candidateId" value={c.id} />
                <button className="btn btn-outline" type="submit">Remove</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
