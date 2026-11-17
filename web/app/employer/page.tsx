import Link from "next/link";
import { Suspense } from "react";
import { query } from "@/lib/db";
import { requireRole } from "@/lib/authz";
import { getEmployerForUser } from "@/lib/employer/queries";
import { canRecruit, STATUS_COPY } from "@/lib/employer/rules";
import { VerificationBadge } from "@/components/verification-badge";

export default function EmployerDashboardPage() {
  return (
    <Suspense fallback={<p className="page container">Loading employer portal…</p>}>
      <EmployerDashboard />
    </Suspense>
  );
}

async function EmployerDashboard() {
  const user = await requireRole("employer");
  const employer = await getEmployerForUser(user.id);

  if (!employer) {
    return (
      <main className="page container">
        <div className="card dash-card">
          <h1>Employer portal</h1>
          <p className="hint" style={{ marginTop: 8 }}>No company profile is linked to this account yet.</p>
        </div>
      </main>
    );
  }

  const [shortlist] = await query<{ n: number }>(
    "SELECT COUNT(*)::int AS n FROM candidate_shortlists WHERE employer_id = $1",
    [employer.id],
  );
  const recruiting = canRecruit(employer.status);

  return (
    <main className="page container dash">
      <section className="card dash-card dash-hero" aria-labelledby="welcome-heading">
        <div>
          <span className="eyebrow">Employer portal</span>
          <h1 id="welcome-heading" style={{ marginTop: 14 }}>Welcome to Traject, {employer.company_name}</h1>
          <p className="dash-muted" style={{ marginTop: 6 }}>
            Employer ID: <strong style={{ color: "var(--ink)" }}>{employer.employer_code}</strong>
            <span className="dash-muted"> · internal reference only, not a login</span>
          </p>
        </div>
        <div style={{ display: "grid", gap: 8, justifyItems: "end" }}>
          <VerificationBadge status={employer.status} />
          <span className="dash-muted" style={{ fontSize: 13 }}>{STATUS_COPY[employer.status]}</span>
        </div>
      </section>

      {!user.emailVerified && (
        <div className="alert" role="alert">
          Verify your work email before you can use the employer portal. Use the verification link sent when you registered.
        </div>
      )}

      {employer.status === "pending" || employer.status === "under_review" ? (
        <div className="card dash-card dash-muted" role="status">
          Your company registration is under review. You can complete your company profile while verification is pending,
          but candidate contact details and recruitment actions will remain restricted until verification is approved.
        </div>
      ) : null}

      {employer.status === "rejected" && (
        <div className="alert" role="alert">Reason from the reviewer: {employer.rejection_reason || "not given"}</div>
      )}
      {employer.status === "suspended" && (
        <div className="alert" role="alert">
          Recruitment activity is paused. Reason: {employer.rejection_reason || "not given"}
        </div>
      )}

      <section className="dash-grid" aria-label="Recruitment summary">
        <div className="card dash-card">
          <div className="dash-card-head">Shortlisted candidates</div>
          <div className="dash-stat">{shortlist.n}</div>
        </div>
        <div className="card dash-card">
          <div className="dash-card-head">Active job postings</div>
          <p className="dash-muted" style={{ marginTop: 10 }}>Not available yet. Job postings are coming in a later release.</p>
        </div>
        <div className="card dash-card">
          <div className="dash-card-head">Applications received</div>
          <p className="dash-muted" style={{ marginTop: 10 }}>Not available yet. Applications open with job postings.</p>
        </div>
      </section>

      <section aria-labelledby="actions-heading">
        <h2 id="actions-heading" className="dash-section-title">Quick actions</h2>
        <div className="dash-actions">
          {recruiting ? (
            <Link href="/employer/candidates" className="dash-action">
              <span>Find candidates</span>
            </Link>
          ) : (
            <div className="dash-action" aria-disabled="true" style={{ opacity: 0.6 }}>
              <span>Find candidates</span>
              <span className="dash-muted" style={{ fontSize: 13 }}>Available after verification</span>
            </div>
          )}
          <Link href="/employer/shortlist" className="dash-action">
            <span>View shortlisted candidates</span>
          </Link>
          <Link href={`/employers/${employer.employer_code}`} className="dash-action">
            <span>View public company page</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
