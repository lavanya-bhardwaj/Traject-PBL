// Pure input rules shared by server actions and pages. No database or framework code.

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

export type ProfileInput = { name: string; headline: string };

// Returns an error message, or null when the input is acceptable.
export function profileError(input: ProfileInput): string | null {
  if (input.name.length < 2 || input.name.length > 80) return "Name must be 2 to 80 characters.";
  if (input.headline.length > 120) return "Headline must be 120 characters or fewer.";
  return null;
}

export function clampLevel(value: string | undefined, fallback = 3): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(5, Math.max(1, parsed));
}
