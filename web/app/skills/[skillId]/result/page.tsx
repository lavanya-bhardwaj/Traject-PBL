import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getLatestAssessment, getSkill } from "@/lib/skills";

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

  return (
    <main className="page page-narrow">
      <div className="card form-card" style={{ textAlign: "center" }}>
        <span className="eyebrow">Check complete</span>
        <h1 style={{ marginTop: 16 }}>{skill.name}</h1>
        <div style={{ fontSize: 56, fontWeight: 800, color: "var(--primary)", margin: "12px 0 4px" }}>
          Level {latest.level}
        </div>
        <p className="hint">
          You got {latest.correct} of {latest.total} correct.
        </p>
        <Link href="/skills" className="btn btn-primary">
          Back to your skills
        </Link>
      </div>
    </main>
  );
}
