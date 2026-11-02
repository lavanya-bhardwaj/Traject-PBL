// Turns a free-text description of experience into skill suggestions.
// The model only proposes; a suggestion is a claim until the candidate passes the check.
import { askLlm } from "./llm.ts";

export type TaxonomySkill = { id: string; name: string };
export type SkillSuggestion = { skillId: string; evidence: string };

export const MAX_TEXT_LENGTH = 2000;

const SYSTEM_PROMPT = `You map a person's description of their experience to a fixed list of skills.
Only use skill IDs from the list you are given. Do not invent IDs.
Only include a skill when the text clearly supports it. Quote a short phrase from the text as evidence.
Reply with JSON only, in this shape: {"skills":[{"skillId":"<id>","evidence":"<short quote>"}]}
If nothing clearly matches, reply {"skills":[]}.`;

export function buildSkillPrompt(taxonomy: TaxonomySkill[], text: string): string {
  const list = taxonomy.map((skill) => `- ${skill.id}: ${skill.name}`).join("\n");
  return `Skills:\n${list}\n\nExperience description:\n"""\n${text}\n"""`;
}

// Small models often return "python:Python" or "python (Python)" instead of the bare ID.
// Accept those only when the leading word is a real taxonomy ID.
function resolveSkillId(raw: string, validIds: Set<string>): string | null {
  if (validIds.has(raw)) return raw;
  const lead = raw.split(/[:\s(]/)[0].trim().toLowerCase();
  return validIds.has(lead) ? lead : null;
}

// Parses the model reply and keeps only suggestions whose skillId is in the taxonomy.
// Anything malformed is dropped rather than trusted.
export function parseSkillSuggestions(raw: string, validIds: Set<string>): SkillSuggestion[] {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end <= start) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.slice(start, end + 1));
  } catch {
    return [];
  }

  const skills = (parsed as { skills?: unknown })?.skills;
  if (!Array.isArray(skills)) return [];

  const seen = new Set<string>();
  const suggestions: SkillSuggestion[] = [];
  for (const item of skills) {
    if (typeof item !== "object" || item === null) continue;
    const { skillId: rawId, evidence } = item as { skillId?: unknown; evidence?: unknown };
    if (typeof rawId !== "string") continue;
    const skillId = resolveSkillId(rawId, validIds);
    if (!skillId || seen.has(skillId)) continue;
    seen.add(skillId);
    suggestions.push({
      skillId,
      evidence: typeof evidence === "string" ? evidence.slice(0, 200) : "",
    });
  }
  return suggestions;
}

export async function suggestSkills(text: string, taxonomy: TaxonomySkill[]): Promise<SkillSuggestion[]> {
  const raw = await askLlm(SYSTEM_PROMPT, buildSkillPrompt(taxonomy, text));
  return parseSkillSuggestions(raw, new Set(taxonomy.map((skill) => skill.id)));
}
