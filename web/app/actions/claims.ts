"use server";

import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { AiNotConfiguredError } from "@/lib/ai/llm";
import { MAX_TEXT_LENGTH, suggestSkills, type SkillSuggestion } from "@/lib/ai/skill-mapping";

export type SuggestState =
  | { message?: string; suggestions?: SkillSuggestion[]; names?: Record<string, string> }
  | undefined;

export async function suggestClaims(_state: SuggestState, formData: FormData): Promise<SuggestState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const text = formData.get("text");
  const trimmed = typeof text === "string" ? text.trim() : "";
  if (trimmed.length < 20) {
    return { message: "Describe your experience in at least 20 characters." };
  }
  if (trimmed.length > MAX_TEXT_LENGTH) {
    return { message: `Keep the description under ${MAX_TEXT_LENGTH} characters.` };
  }

  const taxonomy = await query<{ id: string; name: string }>("SELECT id, name FROM skills ORDER BY name");

  try {
    const suggestions = await suggestSkills(trimmed, taxonomy);
    const names = Object.fromEntries(taxonomy.map((skill) => [skill.id, skill.name]));
    if (suggestions.length === 0) {
      return { message: "No skills in the list clearly matched that description. Try adding more detail." };
    }
    return { suggestions, names };
  } catch (error) {
    if (error instanceof AiNotConfiguredError) {
      return { message: error.message };
    }
    return { message: "The AI service could not be reached. Please try again." };
  }
}

// Saves only the skills the candidate ticked. Each ID is checked against the taxonomy again,
// so a tampered form cannot add a skill that does not exist.
export async function saveClaims(_state: SuggestState, formData: FormData): Promise<SuggestState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const skillIds = formData.getAll("skillId").filter((v): v is string => typeof v === "string");
  if (skillIds.length === 0) {
    return { message: "Tick at least one skill to save." };
  }

  const known = await query<{ id: string }>("SELECT id FROM skills WHERE id = ANY($1)", [skillIds]);
  const knownIds = new Set(known.map((row) => row.id));

  for (const skillId of new Set(skillIds)) {
    if (!knownIds.has(skillId)) continue;
    const evidence = String(formData.get(`evidence-${skillId}`) ?? "").slice(0, 200);
    await query(
      `INSERT INTO skill_claims (user_id, skill_id, evidence)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, skill_id)
       DO UPDATE SET evidence = EXCLUDED.evidence, created_at = now()`,
      [user.id, skillId, evidence],
    );
  }

  redirect("/skills");
}
