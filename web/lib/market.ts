import { query } from "@/lib/db";

export type RoleMarket = {
  roleId: string;
  title: string;
  demandLevel: string;
  asOf: string; // YYYY-MM-DD, formatted in SQL so the timezone cannot shift it
  sourceNote: string;
};

export type SkillTrend = {
  skillId: string;
  name: string;
  demandLevel: string;
  trend: string;
  asOf: string;
  sourceNote: string;
};

export async function listRoleMarket(): Promise<RoleMarket[]> {
  return query<RoleMarket>(
    `SELECT rm.role_id AS "roleId", r.title, rm.demand_level AS "demandLevel",
            to_char(rm.as_of, 'YYYY-MM-DD') AS "asOf", rm.source_note AS "sourceNote"
       FROM role_market rm
       JOIN roles r ON r.id = rm.role_id
      ORDER BY r.title`,
  );
}

export async function listSkillTrends(): Promise<SkillTrend[]> {
  return query<SkillTrend>(
    `SELECT st.skill_id AS "skillId", s.name, st.demand_level AS "demandLevel",
            st.trend, to_char(st.as_of, 'YYYY-MM-DD') AS "asOf", st.source_note AS "sourceNote"
       FROM skill_trends st
       JOIN skills s ON s.id = st.skill_id
      ORDER BY s.name`,
  );
}

export async function getRoleMarket(roleId: string): Promise<RoleMarket | null> {
  const rows = await query<RoleMarket>(
    `SELECT rm.role_id AS "roleId", r.title, rm.demand_level AS "demandLevel",
            to_char(rm.as_of, 'YYYY-MM-DD') AS "asOf", rm.source_note AS "sourceNote"
       FROM role_market rm
       JOIN roles r ON r.id = rm.role_id
      WHERE rm.role_id = $1`,
    [roleId],
  );
  return rows[0] ?? null;
}
