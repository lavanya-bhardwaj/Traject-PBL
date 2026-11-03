// Fallback when the AI is unavailable: finds skills by name or a known alias in the resume text.
// Whole-word matches only, so "sql" does not match inside another word.
import type { SkillSuggestion, TaxonomySkill } from "../ai/skill-mapping.ts";

export const SKILL_ALIASES: Record<string, string[]> = {
  python: ["python"],
  javascript: ["javascript", "js", "node.js", "nodejs"],
  sql: ["sql", "mysql", "postgresql", "postgres", "sqlite"],
  "data-analysis": ["data analysis", "data analytics", "pandas", "statistics"],
  "problem-solving": ["problem solving", "problem-solving", "debugging"],
  communication: ["communication", "written communication", "technical writing"],
};

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function keywordSkills(text: string, taxonomy: TaxonomySkill[]): SkillSuggestion[] {
  const suggestions: SkillSuggestion[] = [];
  for (const skill of taxonomy) {
    const terms = [skill.name, ...(SKILL_ALIASES[skill.id] ?? [])];
    for (const term of terms) {
      const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegex(term)}([^a-z0-9]|$)`, "i");
      const match = pattern.exec(text);
      if (!match) continue;
      const start = Math.max(0, match.index - 30);
      const evidence = text.slice(start, match.index + match[0].length + 30).trim();
      suggestions.push({ skillId: skill.id, evidence: evidence.slice(0, 200) });
      break;
    }
  }
  return suggestions;
}
