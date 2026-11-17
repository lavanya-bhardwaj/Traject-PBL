// Validation for profile section entries. Pure logic: no database or framework code, so it can be tested directly.
export const ENTRY_KINDS = ["education", "experience", "project", "certification"] as const;
export type EntryKind = (typeof ENTRY_KINDS)[number];

export const ENTRY_LABELS: Record<EntryKind, string> = {
  education: "Education",
  experience: "Experience",
  project: "Project",
  certification: "Certification",
};

export type EntryInput = {
  kind: EntryKind;
  title: string;
  organization: string;
  period: string;
  details: string;
};

export type EntryResult = { ok: true; value: EntryInput } | { ok: false; message: string };

export function validateEntry(raw: {
  kind: string | null;
  title: string;
  organization: string;
  period: string;
  details: string;
}): EntryResult {
  if (!raw.kind || !(ENTRY_KINDS as readonly string[]).includes(raw.kind)) {
    return { ok: false, message: "Choose what kind of entry this is." };
  }
  const title = raw.title.trim();
  if (title.length < 2 || title.length > 120) {
    return { ok: false, message: "Title must be 2 to 120 characters." };
  }
  const organization = raw.organization.trim();
  const period = raw.period.trim();
  const details = raw.details.trim();
  if (organization.length > 120) return { ok: false, message: "Organization must be 120 characters or fewer." };
  if (period.length > 60) return { ok: false, message: "Period must be 60 characters or fewer." };
  if (details.length > 1000) return { ok: false, message: "Details must be 1000 characters or fewer." };

  return {
    ok: true,
    value: { kind: raw.kind as EntryKind, title, organization, period, details },
  };
}

// Keeps only plain role IDs from a form. The database check happens in the action.
export function parseRoleIds(values: FormDataEntryValue[]): string[] {
  const ids = values.filter((v): v is string => typeof v === "string" && /^[a-z0-9-]{1,80}$/.test(v));
  return [...new Set(ids)];
}
