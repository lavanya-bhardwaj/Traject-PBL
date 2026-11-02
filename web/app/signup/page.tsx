import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <Suspense fallback={<p className="page container">Loading…</p>}>
      <Signup />
    </Suspense>
  );
}

async function Signup() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <main className="page page-narrow">
      <div className="card form-card">
        <h1>Create your account</h1>
        <p className="hint">Start with a free profile and a few skill checks.</p>
        <SignupForm />
        <p className="form-footer">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </div>
    </main>
  );
}
