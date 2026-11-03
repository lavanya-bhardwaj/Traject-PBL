import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listSkillsForUser } from "@/lib/skills";
import { listEntries, listInterests } from "@/lib/profile-sections";
import { listRoles } from "@/lib/roles";
import { ENTRY_KINDS, type EntryKind } from "@/lib/profile-sections-validate";

const SECTION_HEADINGS: Record<EntryKind, string> = {
  education: "Education",
  experience: "Experience",
  project: "Projects",
  certification: "Certifications",
};
import { deleteProfileEntry } from "@/app/actions/profile-sections";
import { ProfileForm } from "./profile-form";
import { AddEntryForm, InterestsForm } from "./section-forms";
import { DiscoverableForm } from "./discoverable-form";
import { query } from "@/lib/db";
import { EmptyState } from "@/components/empty-state";

const SECTION_EMPTY: Record<EntryKind, string> = {
  education: "Add your degree, diploma or courses.",
  experience: "Add internships, jobs or volunteer work.",
  project: "Add projects you have built, even small ones.",
  certification: "Add certificates you have earned.",
};

export default function ProfilePage() {
  return (
    <Suspense fallback={<p className="page container">Loading profile…</p>}>
      <Profile />
    </Suspense>
  );
}

async function Profile() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  // Employers have their own portal. The student profile is not available to them.
  if (user.role !== "student") notFound();

  const [visibility] = await query<{ discoverable: boolean }>("SELECT discoverable FROM users WHERE id = $1", [user.id]);
  const discoverable = visibility?.discoverable ?? false;

  const [skills, entries, interests, roles] = await Promise.all([
    listSkillsForUser(user.id),
    listEntries(user.id),
    listInterests(user.id),
    listRoles(),
  ]);

  const verified = skills.filter((s) => s.level !== null);
  const claimed = skills.filter((s) => s.level === null && s.claimed);

  return (
    <main className="page container" style={{ width: "min(760px, 100% - 32px)" }}>
      <div className="card form-card">
        <h1>Your profile</h1>
        <p className="hint">Other people see your name, headline, skills and the sections you fill in. Every field is optional.</p>
        <ProfileForm name={user.name} headline={user.headline} />
        <p className="form-footer">
          <Link href={`/u/${user.id}`}>View your public profile</Link>
          {" · "}
          <Link href="/resume">My resume</Link>
        </p>
      </div>

      <section className="card form-card" style={{ marginTop: 20 }} aria-labelledby="skills-heading">
        <h2 id="skills-heading" style={{ fontSize: 20 }}>Skills</h2>
        <p className="hint">Verified skills come from passed checks. Claimed skills come from your resume or description and count once you verify them.</p>
        <p style={{ marginTop: 12 }}>
          <strong>{verified.length}</strong> verified · <strong>{claimed.length}</strong> claimed
        </p>
        {claimed.length > 0 && (
          <ul className="section-list">
            {claimed.map((s) => (
              <li key={s.id}>
                {s.name} <Link href={`/skills/${s.id}`}>Take the check</Link>
              </li>
            ))}
          </ul>
        )}
        <p className="form-footer" style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Link href="/skills">Check your skills</Link>
          <Link href="/resume/upload">Upload a resume</Link>
        </p>
      </section>

      {ENTRY_KINDS.map((kind: EntryKind) => {
        const items = entries.filter((e) => e.kind === kind);
        return (
          <section key={kind} className="card form-card" style={{ marginTop: 20 }} aria-labelledby={`${kind}-heading`}>
            <h2 id={`${kind}-heading`} style={{ fontSize: 20 }}>{SECTION_HEADINGS[kind]}</h2>
            {items.length === 0 ? (
              <EmptyState
                title={`No ${SECTION_HEADINGS[kind].toLowerCase()} added yet`}
                body={SECTION_EMPTY[kind]}
                actionHref="#add-heading"
                actionLabel="Add an entry"
              />
            ) : (
              <ul className="section-list">
                {items.map((entry) => (
                  <li key={entry.id}>
                    <div>
                      <strong>{entry.title}</strong>
                      {entry.organization && <span className="dash-muted"> · {entry.organization}</span>}
                      {entry.period && <span className="dash-muted"> · {entry.period}</span>}
                    </div>
                    {entry.details && <p className="dash-muted" style={{ fontSize: 14, marginTop: 4 }}>{entry.details}</p>}
                    <form action={deleteProfileEntry}>
                      <input type="hidden" name="entryId" value={entry.id} />
                      <button type="submit" className="dash-text-link" style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
                        Remove
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}

      <section className="card form-card" style={{ marginTop: 20 }} aria-labelledby="add-heading">
        <h2 id="add-heading" style={{ fontSize: 20 }}>Add to your profile</h2>
        <AddEntryForm />
      </section>

      <section className="card form-card" style={{ marginTop: 20 }} aria-labelledby="visibility-heading">
        <h2 id="visibility-heading" style={{ fontSize: 20 }}>Employer visibility</h2>
        <DiscoverableForm initial={discoverable} />
      </section>

      <section className="card form-card" style={{ marginTop: 20 }} aria-labelledby="interests-heading">
        <h2 id="interests-heading" style={{ fontSize: 20 }}>Career interests</h2>
        <InterestsForm roles={roles} selected={interests} />
      </section>
    </main>
  );
}
