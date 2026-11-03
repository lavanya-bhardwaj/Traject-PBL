// Database access for profile sections and career interests. Every write is limited to the signed-in user.
import { query } from "@/lib/db";
import type { EntryInput, EntryKind } from "@/lib/profile-sections-validate";

export type ProfileEntry = EntryInput & { id: string; createdAt: Date };

export async function listEntries(userId: string): Promise<ProfileEntry[]> {
  const rows = await query<{
    id: string;
    kind: EntryKind;
    title: string;
    organization: string;
    period: string;
    details: string;
    created_at: Date;
  }>(
    `SELECT id, kind, title, organization, period, details, created_at
       FROM profile_entries
      WHERE user_id = $1
      ORDER BY kind, created_at DESC`,
    [userId],
  );
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    title: r.title,
    organization: r.organization,
    period: r.period,
    details: r.details,
    createdAt: r.created_at,
  }));
}

export async function addEntry(userId: string, entry: EntryInput): Promise<void> {
  await query(
    `INSERT INTO profile_entries (user_id, kind, title, organization, period, details)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, entry.kind, entry.title, entry.organization, entry.period, entry.details],
  );
}

export async function deleteEntry(userId: string, entryId: string): Promise<void> {
  await query("DELETE FROM profile_entries WHERE id = $1 AND user_id = $2", [entryId, userId]);
}

export async function listInterests(userId: string): Promise<string[]> {
  const rows = await query<{ role_id: string }>(
    "SELECT role_id FROM career_interests WHERE user_id = $1",
    [userId],
  );
  return rows.map((r) => r.role_id);
}

// Replaces the interests with the given roles. Only role IDs that exist are stored.
export async function setInterests(userId: string, roleIds: string[]): Promise<void> {
  const known = await query<{ id: string }>("SELECT id FROM roles WHERE id = ANY($1)", [roleIds]);
  const valid = known.map((r) => r.id);
  await query("DELETE FROM career_interests WHERE user_id = $1", [userId]);
  for (const roleId of valid) {
    await query("INSERT INTO career_interests (user_id, role_id) VALUES ($1, $2)", [userId, roleId]);
  }
}
