"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { requireRole } from "@/lib/authz";
import { canRecruit } from "@/lib/employer/rules";
import { getEmployerForUser, getDiscoverableCandidate } from "@/lib/employer/queries";

const UUID = /^[0-9a-f-]{36}$/i;

// Adds a candidate to this employer's shortlist. Verified employers only.
export async function addToShortlist(formData: FormData): Promise<void> {
  const user = await requireRole("employer");
  const employer = await getEmployerForUser(user.id);
  if (!employer || !canRecruit(employer.status)) return;

  const candidateId = formData.get("candidateId");
  if (typeof candidateId !== "string" || !UUID.test(candidateId)) return;
  // Only students who opted in can be shortlisted.
  if (!(await getDiscoverableCandidate(candidateId))) return;

  await query(
    "INSERT INTO candidate_shortlists (employer_id, candidate_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
    [employer.id, candidateId],
  );
  revalidatePath("/employer/shortlist");
  revalidatePath(`/employer/candidates/${candidateId}`);
}

// Removes from this employer's own shortlist only. The WHERE clause checks the employer ID.
export async function removeFromShortlist(formData: FormData): Promise<void> {
  const user = await requireRole("employer");
  const employer = await getEmployerForUser(user.id);
  if (!employer) return;

  const candidateId = formData.get("candidateId");
  if (typeof candidateId !== "string" || !UUID.test(candidateId)) return;

  await query("DELETE FROM candidate_shortlists WHERE employer_id = $1 AND candidate_id = $2", [employer.id, candidateId]);
  revalidatePath("/employer/shortlist");
}
