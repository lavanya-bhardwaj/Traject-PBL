import { query } from "@/lib/db";
import { listSkillsForUser, type SkillWithLevel } from "@/lib/skills";
import { profileScore } from "@/lib/scoring/scoring";

export type PublicProfile = {
  id: string;
  name: string;
  headline: string;
};

export async function getProfile(userId: string): Promise<PublicProfile | null> {
  const rows = await query<PublicProfile>("SELECT id, name, headline FROM users WHERE id = $1", [userId]);
  return rows[0] ?? null;
}

export async function updateProfile(userId: string, name: string, headline: string): Promise<void> {
  await query("UPDATE users SET name = $2, headline = $3 WHERE id = $1", [userId, name, headline]);
}

// Verified skills only feed the score. Claims are listed separately and never counted.
export async function profileSummary(userId: string) {
  const skills: SkillWithLevel[] = await listSkillsForUser(userId);
  const verified = skills.filter((s) => s.level !== null);
  const claimed = skills.filter((s) => s.level === null && s.claimed);
  const levels = Object.fromEntries(verified.map((s) => [s.id, s.level as number]));
  return {
    verified,
    claimed,
    score: profileScore(levels, skills.map((s) => s.id)),
  };
}

export type CandidateHit = { id: string; name: string; headline: string; level: number };

// Candidates whose latest verified level in a skill is at least minLevel. Claims never match.
export async function searchCandidates(
  skillId: string,
  minLevel: number,
  excludeUserId: string,
): Promise<CandidateHit[]> {
  return query<CandidateHit>(
    `SELECT u.id, u.name, u.headline, a.level
       FROM users u
       JOIN LATERAL (
         SELECT level FROM assessments
          WHERE user_id = u.id AND skill_id = $1
          ORDER BY taken_at DESC
          LIMIT 1
       ) a ON true
      WHERE a.level >= $2 AND u.id <> $3
      ORDER BY a.level DESC, u.name
      LIMIT 50`,
    [skillId, minLevel, excludeUserId],
  );
}
