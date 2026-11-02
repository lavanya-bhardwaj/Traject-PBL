// Orders a candidate's skill gaps for a role and writes a short action for each one.
// The model can reorder and phrase the steps. It cannot add skills that are not gaps,
// and every gap is always covered, using a fixed fallback if the model fails.
import { askLlm, AiNotConfiguredError } from "./llm.ts";

export type GapItem = {
  skillId: string;
  name: string;
  current: number;
  required: number;
  gap: number;
};

export type PathStep = { skillId: string; name: string; action: string };
export type PathResult = { steps: PathStep[]; source: "ai" | "fallback"; note?: string };

const SYSTEM_PROMPT = `You write a learning plan for a person who wants a job role.
You get the skills they are missing, with their current and required levels (1-5).
Order the skills so the most important gap comes first, and write one short, concrete action per skill.
Use only the skill IDs given. Do not add skills.
Reply with JSON only: {"steps":[{"skillId":"<id>","action":"<one or two sentences>"}]}`;

export function fallbackAction(item: GapItem): string {
  return `Practise ${item.name} to reach level ${item.required}, then pass the ${item.name} check.`;
}

export function fallbackPath(gaps: GapItem[]): PathStep[] {
  return [...gaps]
    .sort((a, b) => b.gap - a.gap || a.name.localeCompare(b.name))
    .map((item) => ({ skillId: item.skillId, name: item.name, action: fallbackAction(item) }));
}

export function buildPathPrompt(roleTitle: string, gaps: GapItem[]): string {
  const lines = gaps.map(
    (g) => `- ${g.skillId} (${g.name}): current level ${g.current}, required ${g.required}`,
  );
  return `Role: ${roleTitle}\nMissing skills:\n${lines.join("\n")}`;
}

// Parses the model reply. Returns null when nothing usable came back, so the caller falls back.
export function parseLearningPath(raw: string, gaps: GapItem[]): PathStep[] | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end <= start) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }

  const steps = (parsed as { steps?: unknown })?.steps;
  if (!Array.isArray(steps)) return null;

  const byId = new Map(gaps.map((g) => [g.skillId, g]));
  const used = new Set<string>();
  const result: PathStep[] = [];
  for (const step of steps) {
    if (typeof step !== "object" || step === null) continue;
    const { skillId, action } = step as { skillId?: unknown; action?: unknown };
    if (typeof skillId !== "string" || !byId.has(skillId) || used.has(skillId)) continue;
    used.add(skillId);
    const item = byId.get(skillId)!;
    const text = typeof action === "string" && action.trim() ? action.trim().slice(0, 300) : fallbackAction(item);
    result.push({ skillId, name: item.name, action: text });
  }

  if (result.length === 0) return null;

  // Any gap the model left out is appended with the fallback action, so no gap is dropped.
  for (const item of fallbackPath(gaps)) {
    if (!used.has(item.skillId)) result.push(item);
  }
  return result;
}

export async function buildLearningPath(roleTitle: string, gaps: GapItem[]): Promise<PathResult> {
  if (gaps.length === 0) return { steps: [], source: "fallback" };

  try {
    const raw = await askLlm(SYSTEM_PROMPT, buildPathPrompt(roleTitle, gaps));
    const steps = parseLearningPath(raw, gaps);
    if (steps) return { steps, source: "ai" };
    return { steps: fallbackPath(gaps), source: "fallback", note: "The AI reply could not be used, so this plan is ordered by gap size." };
  } catch (error) {
    const note =
      error instanceof AiNotConfiguredError
        ? "AI is not available, so this plan is ordered by gap size."
        : "The AI service could not be reached, so this plan is ordered by gap size.";
    return { steps: fallbackPath(gaps), source: "fallback", note };
  }
}
