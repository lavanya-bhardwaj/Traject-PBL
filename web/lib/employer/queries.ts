// Database reads for the employer portal and the admin verification dashboard.
// Candidate data is limited to students who opted in (users.discoverable = true) and to fields safe for recruiters.
import { query } from "@/lib/db";
import type { VerificationStatus } from "@/lib/employer/rules";

export type EmployerRow = {
  id: string;
  user_id: string;
  employer_code: string;
  company_name: string;
  website: string;
  company_email: string;
  company_phone: string;
  country: string;
  state: string;
  city: string;
  address: string;
  industry: string;
  company_size: string;
  established_year: number | null;
  legal_type: string;
  cin: string;
  llpin: string;
  gstin: string;
  udyam_number: string;
  other_identifier: string;
  recruiter_name: string;
  designation: string;
  department: string;
  recruiter_phone: string;
  status: VerificationStatus;
  rejection_reason: string;
  created_at: Date;
};

export async function getEmployerForUser(userId: string): Promise<EmployerRow | null> {
  const rows = await query<EmployerRow>("SELECT * FROM employers WHERE user_id = $1", [userId]);
  return rows[0] ?? null;
}

export async function getEmployerByCode(code: string): Promise<EmployerRow | null> {
  const rows = await query<EmployerRow>("SELECT * FROM employers WHERE employer_code = $1", [code]);
  return rows[0] ?? null;
}

export async function getEmployerById(id: string): Promise<EmployerRow | null> {
  const rows = await query<EmployerRow>("SELECT * FROM employers WHERE id = $1", [id]);
  return rows[0] ?? null;
}

// Candidate search. Filters run in SQL, with pagination, so the browser never receives every student.
export type CandidateFilters = {
  name: string;
  skillId: string;
  minLevel: number;
  education: string;
  graduationYear: string;
  hasProject: boolean;
  hasCertification: boolean;
  hasExperience: boolean;
  sort: "name" | "skill_level";
  page: number;
};

export const PAGE_SIZE = 20;

export type CandidateHit = {
  id: string;
  name: string;
  headline: string;
  verified_count: number;
  skill_level: number | null;
  education: string;
};

// Builds the WHERE clause and its parameters. Every value is a bound parameter, never inlined.
function buildCandidateWhere(f: CandidateFilters): { where: string; params: unknown[] } {
  const params: unknown[] = [];
  const clauses = ["u.role = 'student'", "u.discoverable = true"];
  const add = (value: unknown) => {
    params.push(value);
    return `$${params.length}`;
  };

  if (f.name) clauses.push(`u.name ILIKE ${add(`%${f.name}%`)}`);
  if (f.skillId) {
    clauses.push(`EXISTS (SELECT 1 FROM (
        SELECT DISTINCT ON (skill_id) skill_id, level FROM assessments
         WHERE user_id = u.id AND skill_id = ${add(f.skillId)}
         ORDER BY skill_id, taken_at DESC) la
      WHERE la.level >= ${add(f.minLevel)})`);
  }
  if (f.education) {
    const term = add(`%${f.education}%`);
    clauses.push(`EXISTS (SELECT 1 FROM profile_entries pe WHERE pe.user_id = u.id AND pe.kind = 'education' AND (pe.title ILIKE ${term} OR pe.organization ILIKE ${term}))`);
  }
  if (f.graduationYear) {
    clauses.push(`EXISTS (SELECT 1 FROM profile_entries pe WHERE pe.user_id = u.id AND pe.kind = 'education' AND pe.period ILIKE ${add(`%${f.graduationYear}%`)})`);
  }
  if (f.hasProject) clauses.push(`EXISTS (SELECT 1 FROM profile_entries pe WHERE pe.user_id = u.id AND pe.kind = 'project')`);
  if (f.hasCertification) clauses.push(`EXISTS (SELECT 1 FROM profile_entries pe WHERE pe.user_id = u.id AND pe.kind = 'certification')`);
  if (f.hasExperience) clauses.push(`EXISTS (SELECT 1 FROM profile_entries pe WHERE pe.user_id = u.id AND pe.kind = 'experience')`);

  return { where: clauses.join(" AND "), params };
}

export async function searchCandidates(f: CandidateFilters): Promise<{ rows: CandidateHit[]; total: number }> {
  const { where, params } = buildCandidateWhere(f);

  // The count query gets only the filter parameters. The row query adds one more for the skill level column.
  const [count] = await query<{ n: number }>(
    `SELECT COUNT(*)::int AS n FROM users u WHERE ${where}`,
    [...params],
  );

  const rowParams = [...params];
  const skillParam = f.skillId ? `$${rowParams.push(f.skillId)}` : "NULL";
  const order = f.sort === "skill_level" && f.skillId ? "skill_level DESC NULLS LAST, u.name" : "u.name";
  const offset = (f.page - 1) * PAGE_SIZE;

  const rows = await query<CandidateHit>(
    `SELECT u.id, u.name, u.headline,
            (SELECT COUNT(DISTINCT skill_id)::int FROM assessments WHERE user_id = u.id) AS verified_count,
            (SELECT level FROM assessments WHERE user_id = u.id AND skill_id = ${skillParam}
              ORDER BY taken_at DESC LIMIT 1) AS skill_level,
            (SELECT pe.title FROM profile_entries pe WHERE pe.user_id = u.id AND pe.kind = 'education'
              ORDER BY pe.created_at DESC LIMIT 1) AS education
       FROM users u
      WHERE ${where}
      ORDER BY ${order}
      LIMIT ${PAGE_SIZE} OFFSET ${offset}`,
    rowParams,
  );

  return { rows, total: count.n };
}

export type CandidateProfile = {
  id: string;
  name: string;
  headline: string;
  interests: string[];
  entries: Array<{ kind: string; title: string; organization: string; period: string; details: string }>;
  levels: Record<string, number>;
  skillNames: Record<string, string>;
};

// Returns a candidate only if they opted in. Everything else returns null, which the page shows as not found.
export async function getDiscoverableCandidate(id: string): Promise<CandidateProfile | null> {
  const users = await query<{ id: string; name: string; headline: string }>(
    "SELECT id, name, headline FROM users WHERE id = $1 AND role = 'student' AND discoverable = true",
    [id],
  );
  if (users.length === 0) return null;
  const user = users[0];

  const interests = await query<{ name: string }>(
    `SELECT r.title AS name FROM career_interests ci JOIN roles r ON r.id = ci.role_id WHERE ci.user_id = $1`,
    [id],
  );
  const entries = await query<{ kind: string; title: string; organization: string; period: string; details: string }>(
    `SELECT kind, title, organization, period, details FROM profile_entries
      WHERE user_id = $1 ORDER BY kind, created_at DESC`,
    [id],
  );
  const levelRows = await query<{ skill_id: string; name: string; level: number }>(
    `SELECT DISTINCT ON (a.skill_id) a.skill_id, s.name, a.level
       FROM assessments a JOIN skills s ON s.id = a.skill_id
      WHERE a.user_id = $1
      ORDER BY a.skill_id, a.taken_at DESC`,
    [id],
  );

  return {
    id: user.id,
    name: user.name,
    headline: user.headline,
    interests: interests.map((r) => r.name),
    entries,
    levels: Object.fromEntries(levelRows.map((r) => [r.skill_id, r.level])),
    skillNames: Object.fromEntries(levelRows.map((r) => [r.skill_id, r.name])),
  };
}
