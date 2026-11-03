import { STATUS_COPY, type VerificationStatus } from "@/lib/employer/rules";

// The badge appears only when the backend status is "verified". Any other status shows its real label.
export function VerificationBadge({ status }: { status: VerificationStatus }) {
  if (status === "verified") {
    return <span className="level-pill" aria-label="Verified employer">Verified Employer</span>;
  }
  const labels: Record<VerificationStatus, string> = {
    pending: "Verification pending",
    under_review: "Under review",
    verified: "Verified Employer",
    rejected: "Not verified",
    suspended: "Suspended",
  };
  return (
    <span className="level-pill" title={STATUS_COPY[status]}>
      {labels[status]}
    </span>
  );
}
