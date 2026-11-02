import { listSkillsForUser } from "@/lib/skills";
import type { Levels } from "@/lib/scoring/scoring";

// Verified levels only. Claimed skills (from text) are excluded, so they never count toward a match.
export async function verifiedLevels(userId: string): Promise<Levels> {
  const skills = await listSkillsForUser(userId);
  const levels: Levels = {};
  for (const skill of skills) {
    if (skill.level !== null) levels[skill.id] = skill.level;
  }
  return levels;
}
