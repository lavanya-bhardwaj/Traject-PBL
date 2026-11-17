"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { requireRole } from "@/lib/authz";
import { getEmployerById } from "@/lib/employer/queries";
import type { VerificationStatus } from "@/lib/employer/rules";

type Transition = { to: VerificationStatus; from: VerificationStatus[]; needsReason: boolean; label: string };

// The only status changes an administrator can make. Anything else is refused on the server.
const TRANSITIONS: Record<string, Transition> = {
  review: { to: "under_review", from: ["pending"], needsReason: false, label: "Marked under review" },
  approve: { to: "verified", from: ["pending", "under_review", "rejected", "suspended"], needsReason: false, label: "Approved" },
  reject: { to: "rejected", from: ["pending", "under_review"], needsReason: true, label: "Rejected" },
  suspend: { to: "suspended", from: ["verified"], needsReason: true, label: "Suspended" },
};

// Admin decision on one employer. Writes an audit row for every change.
export async function decideEmployer(formData: FormData): Promise<void> {
  const admin = await requireRole("admin");

  const employerId = formData.get("employerId");
  const action = formData.get("action");
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 500);
  if (typeof employerId !== "string" || typeof action !== "string") return;

  const transition = TRANSITIONS[action];
  if (!transition) return;

  const employer = await getEmployerById(employerId);
  if (!employer) return;
  if (!transition.from.includes(employer.status)) return;
  if (transition.needsReason && reason.length < 3) return;

  await query(
    `UPDATE employers
        SET status = $2,
            rejection_reason = CASE WHEN $2 = 'rejected' OR $2 = 'suspended' THEN $3 ELSE '' END,
            updated_at = now()
      WHERE id = $1`,
    [employerId, transition.to, reason],
  );
  await query(
    "INSERT INTO verification_audit_log (employer_id, admin_id, action, note) VALUES ($1, $2, $3, $4)",
    [employerId, admin.id, transition.label, reason],
  );

  revalidatePath("/admin");
  revalidatePath(`/admin/${employerId}`);
}
