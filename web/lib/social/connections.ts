import { query } from "@/lib/db";

export type ConnectionStatus = "none" | "outgoing" | "incoming" | "connected";

// The relationship between the viewer and another user, from the viewer's side.
export async function connectionStatus(viewerId: string, otherId: string): Promise<ConnectionStatus> {
  if (viewerId === otherId) return "none";
  const rows = await query<{ requester_id: string; status: string }>(
    `SELECT requester_id, status FROM connections
      WHERE (requester_id = $1 AND addressee_id = $2) OR (requester_id = $2 AND addressee_id = $1)`,
    [viewerId, otherId],
  );
  const row = rows[0];
  if (!row) return "none";
  if (row.status === "accepted") return "connected";
  return row.requester_id === viewerId ? "outgoing" : "incoming";
}

export async function listNetwork(userId: string) {
  const incoming = await query<{ id: string; name: string; headline: string }>(
    `SELECT u.id, u.name, u.headline FROM connections c JOIN users u ON u.id = c.requester_id
      WHERE c.addressee_id = $1 AND c.status = 'pending' ORDER BY c.created_at DESC`,
    [userId],
  );
  const outgoing = await query<{ id: string; name: string; headline: string }>(
    `SELECT u.id, u.name, u.headline FROM connections c JOIN users u ON u.id = c.addressee_id
      WHERE c.requester_id = $1 AND c.status = 'pending' ORDER BY c.created_at DESC`,
    [userId],
  );
  const connected = await query<{ id: string; name: string; headline: string }>(
    `SELECT u.id, u.name, u.headline FROM connections c
       JOIN users u ON u.id = CASE WHEN c.requester_id = $1 THEN c.addressee_id ELSE c.requester_id END
      WHERE (c.requester_id = $1 OR c.addressee_id = $1) AND c.status = 'accepted'
      ORDER BY u.name`,
    [userId],
  );
  return { incoming, outgoing, connected };
}
