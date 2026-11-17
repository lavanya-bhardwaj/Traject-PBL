import Link from "next/link";
import { Suspense } from "react";
import { query } from "@/lib/db";
import { requireRole } from "@/lib/authz";
import { VerificationBadge } from "@/components/verification-badge";
import { VERIFICATION_STATUSES, type VerificationStatus } from "@/lib/employer/rules";

type Params = Promise<Record<string, string | string[] | undefined>>;

export default function AdminPage({ searchParams }: { searchParams: Params }) {
  return (
    <Suspense fallback={<p className="page container">Loading verification queue…</p>}>
      <AdminQueue searchParams={searchParams} />
    </Suspense>
  );
}

function one(value: string | string[] | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

async function AdminQueue({ searchParams }: { searchParams: Params }) {
  await requireRole("admin");
  const sp = await searchParams;
  const q = one(sp.q).slice(0, 80);
  const status = one(sp.status);
  const statusFilter = (VERIFICATION_STATUSES as readonly string[]).includes(status) ? status : "";

  const rows = await query<{
    id: string;
    employer_code: string;
    company_name: string;
    industry: string;
    legal_type: string;
    status: VerificationStatus;
    created_at: Date;
  }>(
    `SELECT id, employer_code, company_name, industry, legal_type, status, created_at
       FROM employers
      WHERE ($1 = '' OR company_name ILIKE '%' || $1 || '%' OR employer_code ILIKE '%' || $1 || '%')
        AND ($2 = '' OR status = $2)
      ORDER BY (status = 'pending') DESC, created_at ASC
      LIMIT 200`,
    [q, statusFilter],
  );

  return (
    <main className="page container">
      <h1>Verification queue</h1>
      <p className="hint" style={{ marginTop: 8 }}>
        Approving a company is a manual decision. Uploaded documents and a generated Employer ID do not verify a company on their own.
      </p>

      <form method="get" className="card" style={{ padding: 20, marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div className="field" style={{ minWidth: 240, marginBottom: 0 }}>
          <label htmlFor="q">Company name or Employer ID</label>
          <input id="q" name="q" defaultValue={q} />
        </div>
        <div className="field" style={{ minWidth: 200, marginBottom: 0 }}>
          <label htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={statusFilter}>
            <option value="">All statuses</option>
            {VERIFICATION_STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace("_", " ")}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" type="submit">Filter</button>
      </form>

      {rows.length === 0 ? (
        <p className="dash-muted" style={{ marginTop: 20 }}>No companies match these filters.</p>
      ) : (
        <ul className="skill-list">
          {rows.map((r) => (
            <li key={r.id} className="card skill-item">
              <div>
                <Link href={`/admin/${r.id}`} className="name">{r.company_name}</Link>
                <div className="meta">
                  {r.employer_code} · {r.industry || "no industry"} · registered {r.created_at.toISOString().slice(0, 10)}
                </div>
              </div>
              <VerificationBadge status={r.status} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
