import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="page container">Loading…</p>}>
      <Login />
    </Suspense>
  );
}

async function Login() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <main className="page page-narrow">
      <div className="card form-card">
        <h1>Welcome back</h1>
        <p className="hint">Log in to see your skills and matches.</p>
        <LoginForm />
        <p className="form-footer">
          New here? <Link href="/signup">Create an account</Link>
        </p>
      </div>

      <section className="employer-callout" aria-labelledby="employer-callout-heading">
        <h2 id="employer-callout-heading">Looking to hire students?</h2>
        <p className="employer-callout-text">
          Discover skilled, verified candidates and recruit based on demonstrated competencies.
        </p>
        <div className="employer-callout-actions">
          <Link href="/employer/register" className="btn btn-primary employer-callout-btn">Register as an Employer</Link>
          <Link href="/employer/login" className="btn btn-outline employer-callout-btn">Employer Login</Link>
        </div>
        <p className="employer-callout-note">Employer accounts are separate from student accounts.</p>
      </section>
    </main>
  );
}
