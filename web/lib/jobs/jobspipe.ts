// JobsPipe job search. Server-only: the API key never reaches the browser.
// Each job returned costs one credit, so results are cached per title for 12 hours.

export type JobPosting = {
  id: string;
  title: string;
  company: string;
  location: string;
  applyUrl: string;
  postedAt: string;
};

export type JobSearchResult =
  | { ok: true; jobs: JobPosting[]; cached: boolean }
  | { ok: false; reason: "not_configured" | "unavailable" };

const API_URL = "https://api.jobspipe.dev/v1/jobs/search";
const CACHE_MS = 12 * 60 * 60 * 1000;
const PAGE_SIZE = 5;
const COUNTRY = "IN";

type RawJob = {
  id?: unknown;
  job_title?: unknown;
  company?: unknown;
  location?: unknown;
  url?: unknown;
  date_posted?: unknown;
  status?: unknown;
};

// Keeps only active postings with a link, and maps them to the fields the page shows.
export function parseJobs(raw: unknown): JobPosting[] {
  const data = (raw as { data?: unknown })?.data;
  if (!Array.isArray(data)) return [];
  const jobs: JobPosting[] = [];
  for (const item of data as RawJob[]) {
    if (item.status !== "active") continue;
    if (typeof item.url !== "string" || !/^https?:\/\//.test(item.url)) continue;
    jobs.push({
      id: String(item.id ?? item.url),
      title: String(item.job_title ?? "Untitled role"),
      company: String(item.company ?? "Unknown company"),
      location: String(item.location ?? ""),
      applyUrl: item.url,
      postedAt: typeof item.date_posted === "string" ? item.date_posted : "",
    });
  }
  return jobs;
}

const cache = new Map<string, { at: number; jobs: JobPosting[] }>();

export async function searchJobsByTitle(title: string): Promise<JobSearchResult> {
  const key = process.env.JOBSPIPE_API_KEY;
  if (!key) return { ok: false, reason: "not_configured" };

  const cacheKey = `${COUNTRY}:${title.toLowerCase()}`;
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < CACHE_MS) return { ok: true, jobs: hit.jobs, cached: true };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ job_title_or: [title], job_country_code_or: [COUNTRY], limit: PAGE_SIZE }),
      cache: "no-store",
    });
    if (!response.ok) return { ok: false, reason: "unavailable" };
    const jobs = parseJobs(await response.json());
    cache.set(cacheKey, { at: Date.now(), jobs });
    return { ok: true, jobs, cached: false };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}
