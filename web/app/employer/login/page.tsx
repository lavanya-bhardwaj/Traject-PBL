import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { EmployerLoginForm } from "./login-form";

export default function EmployerLoginPage() {
  return (
    <Suspense fallback={<p className="page container">Loading…</p>}>
      <EmployerLogin />
    </Suspense>
  );
}

async function EmployerLogin() {
  const user = await getCurrentUser();
  if (user?.role === "employer") redirect("/employer");

  return (
    <main className="page page-narrow">
      <div className="card form-card">
        <h1>Employer login</h1>
        <p className="hint">Log in with the work email you registered with.</p>
        <EmployerLoginForm />
        <p className="form-footer">
          New employer? <Link href="/employer/register">Register your company</Link>
          {" · "}
          <Link href="/login">Student login</Link>
        </p>
      </div>
    </main>
  );
}
