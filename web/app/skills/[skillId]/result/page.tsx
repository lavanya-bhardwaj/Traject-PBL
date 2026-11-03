import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { getLatestAssessment, getSkill, listSkillsForUser } from "@/lib/skills";
import { QUESTIONS } from "@/lib/assessments/questions";
import { pickNextSkill } from "@/lib/assessments/next-skill";
import { CHECK_LEVEL_COUNT } from "@/lib/assessments/skill-info";
import { EmptyState } from "@/components/empty-state";

export default function SkillResultPage({ params }: { params: Promise<{ skillId: string }> }) {
  return (
    <Suspense fallback={<p className="page container">Loading result…</p>}>
      <SkillResult params={params} />
    </Suspense>
  );
}

async function SkillResult({ params }: { params: Promise<{ skillId: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { skillId } = await params;
  const skill = await getSkill(skillId);
  if (!skill) notFound();

  const latest = await getLatestAssessment(user.id, skillId);
  if (!latest) redirect(`/skills/${skillId}`);

  const [{ missed }] = await query<{ missed: string[] }>(
    `SELECT missed FROM assessments
      WHERE user_id = $1 AND skill_id = $2
      ORDER BY taken_at DESC
      LIMIT 1`,
    [user.id, skillId],
  );

  // Only the questions answered wrong are shown, with the correct answer, as things to review.
  const review = QUESTIONS[skillId].filter((q) => missed.includes(q.id));
  const score = Math.round((100 * latest.correct) / latest.total);

  const skills = await listSkillsForUser(user.id);
  const next = pickNextSkill(
    skills.map((s) => ({ id: s.id, name: s.name, level: s.level })),
    skillId,
  );

  return (
    <main className="page container dash">
      <section className="card dash-card dash-hero" aria-labelledby="result-heading">
        <div>
          <span className="eyebrow">Assessment complete</span>
          <h1 id="result-heading" style={{ marginTop: 14 }}>{skill.name}</h1>
          <p className="dash-muted" style={{ marginTop: 6 }}>
            Your verified level is saved to your profile and counts toward your score.
          </p>
        </div>
        <div className="assess-level">
          <span className="dash-muted">Verified level</span>
          <strong>{latest.level}</strong>
          <span className="dash-muted">of {CHECK_LEVEL_COUNT}</span>
        </div>
      </section>

      <section className="dash-grid" aria-label="Result summary">
        <div className="card dash-card">
          <div className="dash-card-head">Score</div>
          <div className="dash-stat">{score}<span>%</span></div>
        </div>
        <div className="card dash-card">
          <div className="dash-card-head">Correct answers</div>
          <div className="dash-stat">{latest.correct}<span> / {latest.total}</span></div>
        </div>
      </section>

      <div className="dash-two">
        <section aria-labelledby="improve-heading">
          <h2 id="improve-heading" className="dash-section-title">Areas to improve</h2>
          <div className="card dash-card">
            {review.length === 0 ? (
              <p className="dash-muted">You answered every question correctly. There is nothing to review.</p>
            ) : (
              <ul className="assess-review">
                {review.map((q) => (
                  <li key={q.id}>
                    <div>{q.prompt}</div>
                    <div className="dash-muted" style={{ fontSize: 14 }}>
                      Correct answer: <strong style={{ color: "var(--ink)" }}>{q.choices[q.answer]}</strong>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section aria-labelledby="next-heading">
          <h2 id="next-heading" className="dash-section-title">Recommended next assessment</h2>
          <div className="card dash-card dash-next">
            {next ? (
              <>
                <div className="name" style={{ fontWeight: 700, color: "var(--ink)" }}>{next.name}</div>
                <p className="dash-muted" style={{ marginTop: 6, fontSize: 14 }}>
                  {next.level === null ? "Not verified yet." : `Current verified level: ${next.level} of ${CHECK_LEVEL_COUNT}.`}
                </p>
                <Link href={`/skills/${next.id}`} className="btn btn-primary" style={{ marginTop: 14 }}>
                  Start {next.name} assessment
                </Link>
              </>
            ) : (
              <EmptyState
                title="No other checks to take"
                body="You have a check for every skill. Review your skills or retake this one later."
                actionHref="/skills"
                actionLabel="Back to your skills"
              />
            )}
          </div>
        </section>
      </div>

      <p>
        <Link href="/skills" style={{ color: "var(--primary)", fontWeight: 600 }}>
          Back to your skills
        </Link>
      </p>
    </main>
  );
}
