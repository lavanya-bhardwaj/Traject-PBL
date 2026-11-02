import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { MAX_TEXT_LENGTH } from "@/lib/ai/skill-mapping";
import { DescribeForm } from "./describe-form";

export default function DescribePage() {
  return (
    <Suspense fallback={<p className="page container">Loading…</p>}>
      <Describe />
    </Suspense>
  );
}

async function Describe() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <main className="page page-narrow" style={{ width: "min(640px, 100% - 32px)" }}>
      <div className="card form-card">
        <h1>Describe your experience</h1>
        <p className="hint">
          Write about projects, jobs or courses. We suggest skills from your words. A suggestion is a
          claim until you pass the skill check.
        </p>
        <DescribeForm maxLength={MAX_TEXT_LENGTH} />
        <p className="form-footer">
          <Link href="/skills">Back to your skills</Link>
        </p>
      </div>
    </main>
  );
}
