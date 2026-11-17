import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getEmployerByCode } from "@/lib/employer/queries";
import { VerificationBadge } from "@/components/verification-badge";

// Public company information. Shows the verification status students need to judge a company.
// Legal identifiers, documents and recruiter details are never shown here.
export default function PublicEmployerPage({ params }: { params: Promise<{ code: string }> }) {
  return (
    <Suspense fallback={<p className="page container">Loading company…</p>}>
      <PublicEmployer params={params} />
    </Suspense>
  );
}

async function PublicEmployer({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!/^TRAJ-EMP-[0-9A-F]{8}$/.test(code)) notFound();

  const employer = await getEmployerByCode(code);
  if (!employer) notFound();

  return (
    <main className="page container">
      <div className="card dash-card">
        <h1>{employer.company_name}</h1>
        <p className="dash-muted" style={{ marginTop: 6 }}>Traject Employer ID: {employer.employer_code}</p>
        <div style={{ marginTop: 12 }}><VerificationBadge status={employer.status} /></div>
        <p className="hint" style={{ marginTop: 14 }}>
          {employer.status === "verified"
            ? "Traject has approved this company after review."
            : "This company is not a Verified Employer on Traject. Check its status before sharing personal information."}
        </p>
        <dl className="assess-facts" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
          <div><dt>Industry</dt><dd>{employer.industry || "—"}</dd></div>
          <div><dt>Website</dt><dd>{employer.website || "—"}</dd></div>
          <div><dt>Location</dt><dd>{[employer.city, employer.state, employer.country].filter(Boolean).join(", ") || "—"}</dd></div>
        </dl>
      </div>
    </main>
  );
}
