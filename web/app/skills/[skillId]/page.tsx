import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getSkill } from "@/lib/skills";
import { QUESTIONS } from "@/lib/assessments/questions";
import { QuizForm } from "./quiz-form";

// The known skills are prerendered. proxy.ts returns the 404 status for any other ID;
// the check here is a fallback.
export function generateStaticParams() {
  return Object.keys(QUESTIONS).map((skillId) => ({ skillId }));
}

export default async function SkillCheckPage({ params }: { params: Promise<{ skillId: string }> }) {
  const { skillId } = await params;
  if (!Object.hasOwn(QUESTIONS, skillId)) notFound();

  return (
    <Suspense fallback={<p className="page container">Loading check…</p>}>
      <SkillCheck skillId={skillId} />
    </Suspense>
  );
}

async function SkillCheck({ skillId }: { skillId: string }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const skill = await getSkill(skillId);
  if (!skill) notFound();

  // Only the prompt and choices go to the browser. The answer index stays on the server.
  const questions = QUESTIONS[skillId].map(({ id, prompt, choices }) => ({ id, prompt, choices }));

  return (
    <main className="page container">
      <h1>{skill.name} check</h1>
      <p style={{ color: "var(--muted)", margin: "8px 0 28px" }}>
        Answer all {questions.length} questions. Your level is based on how many you get right.
      </p>
      <QuizForm skillId={skillId} questions={questions} />
      <p style={{ marginTop: 20 }}>
        <Link href="/skills" style={{ color: "var(--primary)", fontWeight: 600 }}>
          Cancel
        </Link>
      </p>
    </main>
  );
}
