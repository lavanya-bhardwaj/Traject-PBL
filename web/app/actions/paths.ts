"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { getRole } from "@/lib/roles";
import { verifiedLevels } from "@/lib/candidate-levels";
import { competencyGaps } from "@/lib/scoring/scoring";
import { buildLearningPath, type PathResult } from "@/lib/ai/learning-path";

export type CourseRef = { id: string; title: string; provider: string; url: string };
export type PathStepWithCourses = { skillId: string; name: string; action: string; courses: CourseRef[] };
export type PathState =
  | { steps: PathStepWithCourses[]; source: PathResult["source"]; note?: string }
  | { message: string }
  | undefined;

export async function generateLearningPath(_state: PathState, formData: FormData): Promise<PathState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const roleId = formData.get("roleId");
  if (typeof roleId !== "string") return { message: "Choose a role first." };

  const role = await getRole(roleId);
  if (!role) return { message: "That role does not exist." };

  const levels = await verifiedLevels(user.id);
  const gaps = Object.entries(competencyGaps(levels, role.requirements)).map(([skillId, gap]) => ({
    skillId,
    name: role.names[skillId] ?? skillId,
    current: levels[skillId] ?? 0,
    required: role.requirements[skillId].required,
    gap,
  }));

  const result = await buildLearningPath(role.title, gaps);
  if (result.steps.length === 0) {
    return { steps: [], source: result.source, note: result.note };
  }

  // Courses come only from the database. The AI never supplies a link.
  const rows = await query<CourseRef & { skill_id: string }>(
    `SELECT cs.skill_id, c.id, c.title, c.provider, c.url
       FROM course_skills cs
       JOIN courses c ON c.id = cs.course_id
      WHERE cs.skill_id = ANY($1)
      ORDER BY c.provider, c.title`,
    [result.steps.map((step) => step.skillId)],
  );

  const bySkill = new Map<string, CourseRef[]>();
  for (const { skill_id, ...course } of rows) {
    bySkill.set(skill_id, [...(bySkill.get(skill_id) ?? []), course]);
  }

  return {
    source: result.source,
    note: result.note,
    steps: result.steps.map((step) => ({ ...step, courses: bySkill.get(step.skillId) ?? [] })),
  };
}
