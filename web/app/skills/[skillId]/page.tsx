import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { getSkill } from "@/lib/skills";
import { QUESTIONS } from "@/lib/assessments/questions";
import { CHECK_LENGTH } from "@/lib/assessments/adaptive";
import { CHECK_LEVEL_COUNT, CHECK_TIME_ESTIMATE, SKILL_DESCRIPTIONS } from "@/lib/assessments/skill-info";
import { startCheck } from "@/app/actions/skills";
import { QuizForm } from "./quiz-form";

// The known skills are prerendered. proxy.ts returns the 404 status for any other ID;
// the check here is a fallback.
export function generateStaticParams() {
  return Object.keys(QUESTIONS).map((skillId) => ({ skillId }));
}

export default function SkillCheckPage({ params }: { params: Promise<{ skillId: string }> }) {
  return (
    <Suspense fallback={<p className="page container">Loading check…</p>}>
      <SkillCheckLoader params={params} />
    </Suspense>
  );
}

// params is read inside Suspense, as Next requires for dynamic route params.
async function SkillCheckLoader({ params }: { params: Promise<{ skillId: string }> }) {
  const { skillId } = await params;
  if (!Object.hasOwn(QUESTIONS, skillId)) notFound();
  return <SkillCheck skillId={skillId} />;
}

async function SkillCheck({ skillId }: { skillId: string }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const skill = await getSkill(skillId);
  if (!skill) notFound();

  const session = (
    await query<{ current_id: string; asked: string[] }>(
      "SELECT current_id, asked FROM assessment_sessions WHERE user_id = $1 AND skill_id = $2",
      [user.id, skillId],
    )
  )[0];
  const current = session && QUESTIONS[skillId].find((q) => q.id === session.current_id);

  return (
    <main className="page container">
      <h1>{skill.name} check</h1>

      {current && session ? (
        <>
          <p style={{ color: "var(--muted)", margin: "8px 0 28px" }}>
            Question {session.asked.length + 1} of {CHECK_LENGTH}. Harder or easier questions follow your answers.
          </p>
          {/* Only the prompt and choices go to the browser. The answer index stays on the server. */}
          <QuizForm
            skillId={skillId}
            question={{ id: current.id, prompt: current.prompt, choices: current.choices }}
            number={session.asked.length + 1}
          />
        </>
      ) : (
        <>
          <div className="card dash-card" style={{ marginTop: 20, maxWidth: 640 }}>
            <h2 style={{ fontSize: 22 }}>{skill.name} assessment</h2>
            <p className="dash-muted" style={{ marginTop: 6, fontSize: 15 }}>
              {SKILL_DESCRIPTIONS[skillId] ?? `Evaluate your practical ${skill.name} knowledge.`}
            </p>
            <dl className="assess-facts">
              <div>
                <dt>Questions</dt>
                <dd>{CHECK_LENGTH}</dd>
              </div>
              <div>
                <dt>Time</dt>
                <dd>{CHECK_TIME_ESTIMATE}</dd>
              </div>
              <div>
                <dt>Levels</dt>
                <dd>{CHECK_LEVEL_COUNT}</dd>
              </div>
            </dl>
            <p className="dash-muted" style={{ fontSize: 14 }}>
              Your skill level is based on how hard the questions you answer correctly are. The next question adapts to your answers.
            </p>
            <form action={startCheck} style={{ marginTop: 18 }}>
              <input type="hidden" name="skillId" value={skillId} />
              <button className="btn btn-primary btn-large" type="submit">
                Start assessment
              </button>
            </form>
          </div>
        </>
      )}

      <p style={{ marginTop: 20 }}>
        <Link href="/skills" style={{ color: "var(--primary)", fontWeight: 600 }}>
          Cancel
        </Link>
      </p>
    </main>
  );
}
