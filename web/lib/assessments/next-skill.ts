// Picks the next check to recommend after a finished one. Pure logic, no database code.
export type SkillLevel = { id: string; name: string; level: number | null };

// Prefers a skill with no verified level yet, then the lowest verified level. Never returns the current skill.
export function pickNextSkill(skills: SkillLevel[], currentId: string): SkillLevel | null {
  const others = skills.filter((s) => s.id !== currentId);
  const unverified = others.find((s) => s.level === null);
  if (unverified) return unverified;
  const lowest = [...others].sort((a, b) => (a.level ?? 0) - (b.level ?? 0) || a.name.localeCompare(b.name))[0];
  return lowest ?? null;
}
