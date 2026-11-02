"use server";

import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { connectionStatus } from "@/lib/social/connections";
import { isUuid } from "@/lib/validation";

// Each action checks the current user and the relationship on the server, so a crafted
// request cannot accept a request that was not sent to this user.

async function otherUserId(formData: FormData): Promise<string | null> {
  const value = formData.get("otherId");
  return isUuid(value) ? value : null;
}

export async function sendRequest(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const otherId = await otherUserId(formData);
  if (!otherId || (await connectionStatus(user.id, otherId)) !== "none") return;

  await query(
    "INSERT INTO connections (requester_id, addressee_id, status) VALUES ($1, $2, 'pending')",
    [user.id, otherId],
  );
}

export async function acceptRequest(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const otherId = await otherUserId(formData);
  if (!otherId) return;

  await query(
    `UPDATE connections SET status = 'accepted'
      WHERE requester_id = $1 AND addressee_id = $2 AND status = 'pending'`,
    [otherId, user.id],
  );
}

// Removes a pending or accepted connection, or withdraws a request the user sent.
export async function removeConnection(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const otherId = await otherUserId(formData);
  if (!otherId) return;

  await query(
    `DELETE FROM connections
      WHERE (requester_id = $1 AND addressee_id = $2) OR (requester_id = $2 AND addressee_id = $1)`,
    [user.id, otherId],
  );
}
