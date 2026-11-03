// Role recommendations from verified levels and claimed skills. Pure logic, no database code.
// Claims never change a score or a match: they only show how close a role is and which checks to take.
import { competencyGaps, roleMatch, type Levels, type RoleRequirements } from "../scoring/scoring.ts";

export type RoleInput = {
  id: string;
  title: string;
  requirements: RoleRequirements;
  names: Record<string, string>;
};

export type RoleStatus = "apply" | "close" | "explore" | "not-yet";

export const STATUS_LABEL: Record<RoleStatus, string> = {
  apply: "Apply now",
  close: "Close: fill a few gaps",
  explore: "Compatible: build skills first",
  "not-yet": "Not a fit yet",
};

export type Recommendation = {
  roleId: string;
  title: string;
  status: RoleStatus;
  verifiedMatch: number; // percent, verified levels only
  compatibility: number; // percent of the role's skills you have verified or claimed
  missing: Array<{ skillId: string; name: string; required: number; current: number; claimed: boolean }>;
};

// Whole percents for display only. The stored and compared values keep their precision.
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

// The action line under a role. Lists up to three skills, using their real names.
export function improveAction(names: string[]): string {
  if (names.length === 0) return "You meet every skill requirement for this role.";
  const shown = names.slice(0, 3);
  const list =
    shown.length === 1
      ? shown[0]
      : `${shown.slice(0, -1).join(", ")}${shown.length > 2 ? "," : ""} and ${shown[shown.length - 1]}`;
  return `Improve your match by verifying ${list}.`;
}

export const APPLY_MATCH = 80;
export const CLOSE_MATCH = 50;

const STATUS_ORDER: Record<RoleStatus, number> = { apply: 0, close: 1, explore: 2, "not-yet": 3 };

export function recommendRoles(roles: RoleInput[], levels: Levels, claimed: Set<string>): Recommendation[] {
  const results = roles.map((role) => {
    const skillIds = Object.keys(role.requirements);
    const known = skillIds.filter((id) => (levels[id] ?? 0) > 0 || claimed.has(id)).length;
    const compatibility = skillIds.length === 0 ? 0 : Math.round((100 * known) / skillIds.length);
    const verifiedMatch = roleMatch(levels, role.requirements);

    const gaps = competencyGaps(levels, role.requirements);
    const missing = Object.keys(gaps).map((skillId) => ({
      skillId,
      name: role.names[skillId] ?? skillId,
      required: role.requirements[skillId].required,
      current: levels[skillId] ?? 0,
      claimed: claimed.has(skillId),
    }));

    let status: RoleStatus;
    if (verifiedMatch >= APPLY_MATCH) status = "apply";
    else if (verifiedMatch >= CLOSE_MATCH) status = "close";
    else if (compatibility > 0) status = "explore";
    else status = "not-yet";

    return { roleId: role.id, title: role.title, status, verifiedMatch, compatibility, missing };
  });

  return results.sort(
    (a, b) =>
      STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
      b.verifiedMatch - a.verifiedMatch ||
      b.compatibility - a.compatibility ||
      a.title.localeCompare(b.title),
  );
}
