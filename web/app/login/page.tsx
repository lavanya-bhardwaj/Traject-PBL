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
    </main>
  );
}
