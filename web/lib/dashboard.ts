// Data for the student dashboard. Reuses the existing profile, role and recommendation logic.
// Nothing here is mocked: every number comes from the database or the existing scoring code.
import { query } from "@/lib/db";
import { profileSummary } from "@/lib/profile";
import { listRoles, getRole } from "@/lib/roles";
import { recommendRoles, type Recommendation } from "@/lib/resume/recommend";
import { completionItems, completionPercent } from "@/lib/profile-completion";
import type { Levels } from "@/lib/scoring/scoring";

export type NextStep = { title: string; body: string; href: string; cta: string };

export type ActivityItem = { kind: "assessment" | "claim"; skillName: string; level: number | null; at: Date };

export type DashboardRole = Recommendation & { description: string };

export type DashboardData = {
  profileScore: number;
  profileCompletion: number; // percent, from four checkpoints
  verifiedCount: number;
  totalSkills: number;
  bestRole: { title: string; match: number } | null;
  topRoles: DashboardRole[];
  nextStep: NextStep;
  activity: ActivityItem[];
};

export async function getDashboardData(
  userId: string,
  profile: { name: string; headline: string },
): Promise<DashboardData> {
  const summary = await profileSummary(userId);
  const levels: Levels = Object.fromEntries(summary.verified.map((s) => [s.id, s.level as number]));

  const claimedRows = await query<{ skill_id: string }>(
    "SELECT skill_id FROM skill_claims WHERE user_id = $1",
    [userId],
  );
  const claimed = new Set(claimedRows.map((row) => row.skill_id));

  const roleList = await listRoles();
  const details = (await Promise.all(roleList.map((r) => getRole(r.id)))).filter((r) => r !== null);
  const recommendations = recommendRoles(details, levels, claimed);

  const bestRole = recommendations.reduce<{ title: string; match: number } | null>((best, rec) => {
    if (!best || rec.verifiedMatch > best.match) return { title: rec.title, match: rec.verifiedMatch };
    return best;
  }, null);

  const [countRow] = await query<{ n: number }>("SELECT COUNT(*)::int AS n FROM skills");

  const activityRows = await query<{ kind: "assessment" | "claim"; skill_name: string; level: number | null; at: Date }>(
    `SELECT 'assessment' AS kind, s.name AS skill_name, a.level, a.taken_at AS at
       FROM assessments a JOIN skills s ON s.id = a.skill_id
      WHERE a.user_id = $1
     UNION ALL
     SELECT 'claim' AS kind, s.name AS skill_name, NULL AS level, c.created_at AS at
       FROM skill_claims c JOIN skills s ON s.id = c.skill_id
      WHERE c.user_id = $1
     ORDER BY at DESC
     LIMIT 5`,
    [userId],
  );

  const [counts] = await query<{ entries: number; interests: number }>(
    `SELECT (SELECT COUNT(*)::int FROM profile_entries WHERE user_id = $1) AS entries,
            (SELECT COUNT(*)::int FROM career_interests WHERE user_id = $1) AS interests`,
    [userId],
  );
  const completion = completionItems({
    name: profile.name,
    headline: profile.headline,
    verifiedSkills: summary.verified.length,
    claimedSkills: claimed.size,
    profileEntries: counts.entries,
    careerInterests: counts.interests,
  });

  return {
    profileScore: summary.score,
    profileCompletion: completionPercent(completion),
    verifiedCount: summary.verified.length,
    totalSkills: countRow.n,
    bestRole,
    topRoles: recommendations.slice(0, 3).map((rec) => ({
      ...rec,
      description: roleList.find((r) => r.id === rec.roleId)?.description ?? "",
    })),
    nextStep: pickNextStep({
      hasHeadline: Boolean(profile.headline),
      verifiedCount: summary.verified.length,
      claimedIds: [...claimed].filter((id) => (levels[id] ?? 0) === 0),
      claimedCount: claimed.size,
      topRole: recommendations[0] ?? null,
    }),
    activity: activityRows.map((row) => ({
      kind: row.kind,
      skillName: row.skill_name,
      level: row.level,
      at: row.at,
    })),
  };
}

// One next step, chosen by the first rule that applies. Each rule points to an existing page.
export function pickNextStep(input: {
  hasHeadline: boolean;
  verifiedCount: number;
  claimedIds: string[];
  claimedCount: number;
  topRole: Recommendation | null;
}): NextStep {
  if (input.claimedCount === 0) {
    return {
      title: "Upload your resume to discover relevant roles",
      body: "We read your resume and suggest skills. You confirm them, then verify each one with a short check.",
      href: "/resume/upload",
      cta: "Upload resume",
    };
  }
  if (input.verifiedCount === 0) {
    const skillId = input.claimedIds[0] ?? "";
    return {
      title: "Verify your first skill",
      body: "Skills you claimed do not count toward your score until you pass their check.",
      href: skillId ? `/skills/${skillId}` : "/skills",
      cta: "Start a check",
    };
  }
  if (input.claimedIds.length > 0) {
    return {
      title: "Verify a claimed skill",
      body: "One or more claimed skills still need a check before they count toward your match.",
      href: `/skills/${input.claimedIds[0]}`,
      cta: "Take the check",
    };
  }
  if (!input.hasHeadline) {
    return {
      title: "Complete your profile",
      body: "Add a headline so recruiters know what you are looking for.",
      href: "/profile",
      cta: "Edit profile",
    };
  }
  const gap = input.topRole?.missing[0];
  if (input.topRole && gap) {
    return {
      title: `Improve your ${input.topRole.title} match`,
      body: `Your next step is ${gap.name}. Passing its check raises your match for this role.`,
      href: `/skills/${gap.skillId}`,
      cta: "Take the check",
    };
  }
  return {
    title: "Explore roles that fit you",
    body: "Browse the roles and see which skills each one needs.",
    href: "/roles",
    cta: "Explore roles",
  };
}
