"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getRole } from "@/lib/roles";
import { verifiedLevels } from "@/lib/candidate-levels";
import { competencyGaps } from "@/lib/scoring/scoring";
import { buildLearningPath, type PathResult } from "@/lib/ai/learning-path";

export type PathState = PathResult | { message: string } | undefined;

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

  return buildLearningPath(role.title, gaps);
}
