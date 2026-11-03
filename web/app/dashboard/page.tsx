import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardData, type ActivityItem, type DashboardData } from "@/lib/dashboard";
import { formatPercent, STATUS_LABEL } from "@/lib/resume/recommend";
import { EmptyState } from "@/components/empty-state";
import { ArrowIcon, BoltIcon, BriefcaseIcon, CheckIcon, ClipboardIcon, CompassIcon, PeopleIcon, TargetIcon, UserIcon } from "@/components/icons";

export default function DashboardPage() {
  return (
    <Suspense fallback={<p className="page container">Loading your dashboard…</p>}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  // The student dashboard is for students only. Employers and admins have their own areas.
  if (user.role !== "student") redirect(user.role === "employer" ? "/employer" : "/admin");

  let data: DashboardData;
  try {
    data = await getDashboardData(user.id, { name: user.name, headline: user.headline });
  } catch {
    return (
      <main className="page container dash">
        <div className="card dash-card">
          <h1>Your dashboard</h1>
          <p className="alert" role="alert" style={{ marginTop: 12 }}>
            We could not load your dashboard. Refresh the page to try again.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="page container dash">
      <section className="card dash-hero" aria-labelledby="welcome-heading">
        <div>
          <span className="eyebrow">Your career dashboard</span>
          <h1 id="welcome-heading" style={{ marginTop: 14 }}>Welcome back, {user.name}!</h1>
          <p className="dash-muted" style={{ marginTop: 6 }}>Your next career step starts here.</p>
        </div>
        <div className="dash-progress-block">
          <div className="dash-muted">Profile {data.profileCompletion}% complete</div>
          <ProgressBar label="Profile completion" value={data.profileCompletion} />
        </div>
      </section>

      <section className="dash-grid" aria-label="Career overview">
        <div className="card dash-card">
          <div className="dash-card-head"><BoltIcon size={18} color="var(--primary)" /> Profile score</div>
          <div className="dash-stat">{data.profileScore}<span> / 100</span></div>
          <ProgressBar label="Profile score" value={data.profileScore} />
        </div>
        <div className="card dash-card">
          <div className="dash-card-head"><CheckIcon size={18} color="var(--primary)" /> Verified skills</div>
          <div className="dash-stat">{data.verifiedCount}<span> / {data.totalSkills}</span></div>
          <ProgressBar label="Verified skills" value={pct(data.verifiedCount, data.totalSkills)} />
        </div>
        <div className="card dash-card">
          <div className="dash-card-head"><TargetIcon size={18} color="var(--primary)" /> Best role match</div>
          {data.bestRole ? (
            <>
              <div className="dash-stat">{formatPercent(data.bestRole.match)}</div>
              <p className="dash-muted" style={{ marginTop: 6 }}>{data.bestRole.title}</p>
            </>
          ) : (
            <EmptyState
              title="No role match yet"
              body="Pass a skill check to see how you compare with the roles."
              actionHref="/skills"
              actionLabel="Check your skills"
            />
          )}
        </div>
      </section>

      <section className="card dash-card dash-next" aria-labelledby="next-heading">
        <div className="dash-card-head" id="next-heading">Recommended next step</div>
        <h2 style={{ fontSize: 22, marginTop: 8 }}>{data.nextStep.title}</h2>
        <p className="dash-muted" style={{ marginTop: 6 }}>{data.nextStep.body}</p>
        <div style={{ marginTop: 16 }}>
          <Link href={data.nextStep.href} className="btn btn-primary">
            {data.nextStep.cta} <ArrowIcon size={16} color="#fff" />
          </Link>
        </div>
      </section>

      <div className="dash-two">
        <section aria-labelledby="roles-heading">
          <h2 id="roles-heading" className="dash-section-title">Recommended roles</h2>
          {data.topRoles.length === 0 ? (
            <EmptyState
              title="No roles to show yet"
              body="Roles appear here once they are added. Upload your resume to see which roles fit your skills."
              actionHref="/resume/upload"
              actionLabel="Upload your resume"
            />
          ) : (
            <ul className="dash-role-list">
              {data.topRoles.map((role) => (
                <li key={role.roleId} className="card dash-card">
                  <div className="dash-role-head">
                    <div>
                      <div className="name">{role.title}</div>
                      <p className="dash-muted" style={{ fontSize: 14, marginTop: 2 }}>{role.description}</p>
                    </div>
                    <span className="level-pill">{STATUS_LABEL[role.status]}</span>
                  </div>
                  <div className="dash-role-stats">
                    <span><strong>{formatPercent(role.verifiedMatch)}</strong> verified skill match</span>
                    <span><strong>{formatPercent(role.compatibility)}</strong> compatibility</span>
                    <span><strong>{role.missing.length}</strong> {role.missing.length === 1 ? "skill" : "skills"} to improve</span>
                  </div>
                  <Link href={`/roles/${role.roleId}`} className="dash-text-link">
                    View skill gaps <ArrowIcon size={14} color="var(--primary)" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="activity-heading">
          <h2 id="activity-heading" className="dash-section-title">Recent activity</h2>
          <div className="card dash-card">
            <ActivityList items={data.activity} />
          </div>
        </section>
      </div>

      <section aria-labelledby="actions-heading">
        <h2 id="actions-heading" className="dash-section-title">Quick actions</h2>
        <div className="dash-actions">
          <QuickAction href="/skills" label="Check your skills" icon={<BoltIcon size={20} color="var(--primary)" />} />
          <QuickAction href="/roles" label="Explore roles" icon={<CompassIcon size={20} color="var(--primary)" />} />
          <QuickAction href="/profile" label="Edit profile" icon={<UserIcon size={20} color="var(--primary)" />} />
          <QuickAction href="/resume" label="My resume" icon={<ClipboardIcon size={20} color="var(--primary)" />} />
          <QuickAction href="/jobs" label="Find jobs" icon={<BriefcaseIcon size={20} color="var(--primary)" />} />
          <QuickAction href="/network" label="Network" icon={<PeopleIcon size={20} color="var(--primary)" />} />
        </div>
      </section>

      <div className="dash-footer">
        <span className="dash-muted">Signed in as {user.email}</span>
      </div>
    </main>
  );
}

function pct(part: number, total: number): number {
  return total === 0 ? 0 : Math.round((100 * part) / total);
}

function ProgressBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="dash-progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
      <span style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

function QuickAction({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link href={href} className="dash-action">
      <span className="dash-icon">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function ActivityList({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No activity yet"
        body="Your skill checks and the skills you add will show up here. Take a check to start."
        actionHref="/skills"
        actionLabel="Check your skills"
      />
    );
  }
  return (
    <ul className="dash-activity">
      {items.map((item, index) => (
        <li key={`${item.kind}-${item.skillName}-${index}`}>
          <span className="dash-activity-text">
            {item.kind === "assessment"
              ? `Completed ${item.skillName} check: level ${item.level}`
              : `Added ${item.skillName} as a claimed skill`}
          </span>
          <time className="dash-muted" dateTime={item.at.toISOString()}>
            {item.at.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
          </time>
        </li>
      ))}
    </ul>
  );
}
