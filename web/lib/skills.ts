import { query } from "@/lib/db";

export type SkillWithLevel = {
  id: string;
  name: string;
  category: string;
  level: number | null;
  correct: number | null;
  total: number | null;
  takenAt: Date | null;
  claimed: boolean;
};

// Latest assessment per skill for one user. Skills never assessed have null fields.
// claimed is true when the user has described this skill, whether or not it is verified.
export async function listSkillsForUser(userId: string): Promise<SkillWithLevel[]> {
  return query<SkillWithLevel>(
    `SELECT s.id, s.name, s.category,
            a.level, a.correct, a.total, a.taken_at AS "takenAt",
            (c.skill_id IS NOT NULL) AS claimed
       FROM skills s
       LEFT JOIN skill_claims c ON c.user_id = $1 AND c.skill_id = s.id
       LEFT JOIN LATERAL (
         SELECT level, correct, total, taken_at
           FROM assessments
          WHERE user_id = $1 AND skill_id = s.id
          ORDER BY taken_at DESC
          LIMIT 1
       ) a ON true
      ORDER BY s.category, s.name`,
    [userId],
  );
}

export async function getSkill(skillId: string): Promise<{ id: string; name: string } | null> {
  const rows = await query<{ id: string; name: string }>(
    "SELECT id, name FROM skills WHERE id = $1",
    [skillId],
  );
  return rows[0] ?? null;
}

export async function getLatestAssessment(userId: string, skillId: string) {
  const rows = await query<{ level: number; correct: number; total: number; takenAt: Date }>(
    `SELECT level, correct, total, taken_at AS "takenAt"
       FROM assessments
      WHERE user_id = $1 AND skill_id = $2
      ORDER BY taken_at DESC
      LIMIT 1`,
    [userId, skillId],
  );
  return rows[0] ?? null;
}
