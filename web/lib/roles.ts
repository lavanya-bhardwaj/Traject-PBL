import { query } from "@/lib/db";
import type { RoleRequirements } from "@/lib/scoring/scoring";

export type RoleSummary = { id: string; title: string; description: string };
export type RoleDetail = RoleSummary & { requirements: RoleRequirements; names: Record<string, string> };

export async function listRoles(): Promise<RoleSummary[]> {
  return query<RoleSummary>("SELECT id, title, description FROM roles ORDER BY title");
}

// Every role with its requirements in two queries. Calling getRole once per role costs two
// database round trips each, which made pages listing all roles take several seconds.
export async function listRoleDetails(): Promise<RoleDetail[]> {
  const [roles, rows] = await Promise.all([
    listRoles(),
    query<{ role_id: string; skill_id: string; name: string; required_level: number; weight: string }>(
      `SELECT rs.role_id, rs.skill_id, s.name, rs.required_level, rs.weight
         FROM role_skills rs
         JOIN skills s ON s.id = rs.skill_id`,
    ),
  ]);
  const byId = new Map<string, RoleDetail>(roles.map((r) => [r.id, { ...r, requirements: {}, names: {} }]));
  for (const row of rows) {
    const role = byId.get(row.role_id);
    if (!role) continue;
    role.requirements[row.skill_id] = { required: row.required_level, weight: Number(row.weight) };
    role.names[row.skill_id] = row.name;
  }
  return [...byId.values()];
}

export async function getRole(roleId: string): Promise<RoleDetail | null> {
  const roles = await query<RoleSummary>("SELECT id, title, description FROM roles WHERE id = $1", [roleId]);
  if (roles.length === 0) return null;

  const rows = await query<{ skill_id: string; name: string; required_level: number; weight: string }>(
    `SELECT rs.skill_id, s.name, rs.required_level, rs.weight
       FROM role_skills rs
       JOIN skills s ON s.id = rs.skill_id
      WHERE rs.role_id = $1`,
    [roleId],
  );

  const requirements: RoleRequirements = {};
  const names: Record<string, string> = {};
  for (const row of rows) {
    requirements[row.skill_id] = { required: row.required_level, weight: Number(row.weight) };
    names[row.skill_id] = row.name;
  }
  return { ...roles[0], requirements, names };
}
