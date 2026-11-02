// Pure scoring formulas. No database or framework code, so they can be tested directly.
// Levels are 0 (not verified) to 5. Levels come from assessments, never from self-rating.

export const MAX_LEVEL = 5;

export type Levels = Record<string, number>;

export type RoleRequirement = { required: number; weight: number };
export type RoleRequirements = Record<string, RoleRequirement>;

// Profile score = 100 * sum(w_i * level_i) / sum(w_i * MAX_LEVEL), over every skill in
// skillIds. A skill the candidate has not verified counts as level 0. Weights default to 1.
export function profileScore(
  levels: Levels,
  skillIds: string[],
  weights: Record<string, number> = {},
): number {
  let earned = 0;
  let possible = 0;
  for (const skillId of skillIds) {
    const weight = weights[skillId] ?? 1;
    earned += weight * (levels[skillId] ?? 0);
    possible += weight * MAX_LEVEL;
  }
  if (possible === 0) return 0;
  return round2(100 * (earned / possible));
}

// Role match = 100 * sum(w_i * min(level_i, required_i)) / sum(w_i * required_i).
// Capping at the requirement means exceeding a skill cannot push the match above 100.
// A skill the candidate has not verified counts as level 0.
export function roleMatch(levels: Levels, requirements: RoleRequirements): number {
  let earned = 0;
  let possible = 0;
  for (const [skillId, req] of Object.entries(requirements)) {
    const level = levels[skillId] ?? 0;
    earned += req.weight * Math.min(level, req.required);
    possible += req.weight * req.required;
  }
  if (possible === 0) return 0;
  return round2(100 * (earned / possible));
}

// Gap_i = max(0, required_i - level_i). Returns only the shortfalls, largest first.
export function competencyGaps(levels: Levels, requirements: RoleRequirements): Record<string, number> {
  const gaps: Array<[string, number]> = [];
  for (const [skillId, req] of Object.entries(requirements)) {
    const gap = Math.max(0, req.required - (levels[skillId] ?? 0));
    if (gap > 0) gaps.push([skillId, gap]);
  }
  gaps.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return Object.fromEntries(gaps);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
