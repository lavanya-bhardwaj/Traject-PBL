import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import { requireRole } from "@/lib/authz";
import { getEmployerById } from "@/lib/employer/queries";
import { DOC_LABELS, type DocKind } from "@/lib/employer/documents";
import { LEGAL_TYPE_LABELS, type LegalType } from "@/lib/employer/rules";
import { VerificationBadge } from "@/components/verification-badge";
import { decideEmployer } from "@/app/actions/admin";

export default function AdminEmployerPage({ params }: { params: Promise<{ employerId: string }> }) {
  return (
    <Suspense fallback={<p className="page container">Loading company…</p>}>
      <AdminEmployer params={params} />
    </Suspense>
  );
}

async function AdminEmployer({ params }: { params: Promise<{ employerId: string }> }) {
  await requireRole("admin");
  const { employerId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(employerId)) notFound();

  const employer = await getEmployerById(employerId);
  if (!employer) notFound();

  const docs = await query<{ id: string; kind: DocKind; original_name: string; size_bytes: number; created_at: Date }>(
    "SELECT id, kind, original_name, size_bytes, created_at FROM employer_documents WHERE employer_id = $1 ORDER BY created_at",
    [employerId],
  );
  const audit = await query<{ action: string; note: string; created_at: Date; admin_name: string | null }>(
    `SELECT a.action, a.note, a.created_at, u.name AS admin_name
       FROM verification_audit_log a LEFT JOIN users u ON u.id = a.admin_id
      WHERE a.employer_id = $1 ORDER BY a.created_at DESC`,
    [employerId],
  );

  const identifiers: Array<[string, string]> = [
    ["CIN", employer.cin],
    ["LLPIN", employer.llpin],
    ["GSTIN", employer.gstin],
    ["Udyam number", employer.udyam_number],
    ["Other registration", employer.other_identifier],
  ].filter(([, value]) => value) as Array<[string, string]>;

  return (
    <main className="page container">
      <Link href="/admin" style={{ color: "var(--primary)", fontWeight: 600 }}>← Back to the queue</Link>

      <section className="card dash-card" style={{ marginTop: 16 }}>
        <h1>{employer.company_name}</h1>
        <p className="dash-muted" style={{ marginTop: 6 }}>Employer ID {employer.employer_code}</p>
        <div style={{ marginTop: 12 }}><VerificationBadge status={employer.status} /></div>
        {employer.rejection_reason && <p style={{ marginTop: 10 }}><strong>Last reason:</strong> {employer.rejection_reason}</p>}
      </section>

      <section className="card dash-card" style={{ marginTop: 20 }} aria-labelledby="details-heading">
        <h2 id="details-heading" style={{ fontSize: 20 }}>Submitted details</h2>
        <dl className="assess-facts" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
          <div><dt>Legal type</dt><dd>{LEGAL_TYPE_LABELS[employer.legal_type as LegalType] ?? employer.legal_type}</dd></div>
          <div><dt>Industry</dt><dd>{employer.industry || "—"}</dd></div>
          <div><dt>Company size</dt><dd>{employer.company_size || "—"}</dd></div>
          <div><dt>Established</dt><dd>{employer.established_year ?? "—"}</dd></div>
          <div><dt>Website</dt><dd>{employer.website || "—"}</dd></div>
          <div><dt>Company email</dt><dd>{employer.company_email}</dd></div>
          <div><dt>Company phone</dt><dd>{employer.company_phone}</dd></div>
          <div><dt>Address</dt><dd>{[employer.address, employer.city, employer.state, employer.country].filter(Boolean).join(", ")}</dd></div>
          <div><dt>Recruiter</dt><dd>{employer.recruiter_name}, {employer.designation}, {employer.department}</dd></div>
          <div><dt>Recruiter phone</dt><dd>{employer.recruiter_phone}</dd></div>
        </dl>
        <h3 style={{ marginTop: 18, fontSize: 16 }}>Legal identifiers</h3>
        {identifiers.length === 0 ? (
          <p className="dash-muted">None provided.</p>
        ) : (
          <ul className="section-list">
            {identifiers.map(([label, value]) => (
              <li key={label}><strong>{label}:</strong> {value}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="card dash-card" style={{ marginTop: 20 }} aria-labelledby="docs-heading">
        <h2 id="docs-heading" style={{ fontSize: 20 }}>Verification documents</h2>
        {docs.length === 0 ? (
          <p className="dash-muted">No documents uploaded.</p>
        ) : (
          <ul className="section-list">
            {docs.map((d) => (
              <li key={d.id}>
                <a href={`/admin/documents/${d.id}`} style={{ color: "var(--primary)", fontWeight: 600 }}>
                  {DOC_LABELS[d.kind] ?? d.kind}
                </a>
                <span className="dash-muted"> · {d.original_name} · {Math.round(d.size_bytes / 1024)} KB</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card dash-card" style={{ marginTop: 20 }} aria-labelledby="decision-heading">
        <h2 id="decision-heading" style={{ fontSize: 20 }}>Decision</h2>
        <p className="hint" style={{ marginTop: 6 }}>
          Check the documents against the details above before approving. Rejecting or suspending needs a reason the company can see.
        </p>
        <form action={decideEmployer} style={{ display: "grid", gap: 12, marginTop: 14 }}>
          <input type="hidden" name="employerId" value={employer.id} />
          <div className="field">
            <label htmlFor="action">Action</label>
            <select id="action" name="action" defaultValue="approve">
              <option value="review">Mark under review</option>
              <option value="approve">Approve (verified employer)</option>
              <option value="reject">Reject</option>
              <option value="suspend">Suspend</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="reason">Reason (required for reject and suspend)</label>
            <textarea id="reason" name="reason" rows={3} maxLength={500} />
          </div>
          <div>
            <button className="btn btn-primary" type="submit">Save decision</button>
          </div>
        </form>
      </section>

      <section className="card dash-card" style={{ marginTop: 20 }} aria-labelledby="audit-heading">
        <h2 id="audit-heading" style={{ fontSize: 20 }}>History</h2>
        {audit.length === 0 ? (
          <p className="dash-muted">No history yet.</p>
        ) : (
          <ul className="section-list">
            {audit.map((a, i) => (
              <li key={i}>
                <strong>{a.action}</strong>
                <span className="dash-muted"> · {a.created_at.toISOString().replace("T", " ").slice(0, 16)} UTC · by {a.admin_name ?? "registration"}</span>
                {a.note && <div className="dash-muted" style={{ fontSize: 14 }}>{a.note}</div>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
