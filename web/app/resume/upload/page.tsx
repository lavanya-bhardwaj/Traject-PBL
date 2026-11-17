import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ResumeUploadForm } from "./upload-form";

export default function ResumeUploadPage() {
  return (
    <Suspense fallback={<p className="page container">Loading…</p>}>
      <ResumeUpload />
    </Suspense>
  );
}

async function ResumeUpload() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <main className="page page-narrow" style={{ width: "min(640px, 100% - 32px)" }}>
      <div className="card form-card">
        <h1>Upload your resume</h1>
        <p className="hint">
          We read your resume and suggest skills. Suggestions are claims until you pass the skill check
          for each one. Your resume is stored privately, so only you can download or replace it. Uploading again replaces the old file.
        </p>
        <ResumeUploadForm />
        <p className="form-footer">
          <Link href="/resume">View your resume and role matches</Link>
        </p>
      </div>
    </main>
  );
}
