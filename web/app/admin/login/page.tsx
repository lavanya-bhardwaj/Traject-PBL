import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminLoginForm } from "./login-form";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<p className="page container">Loading…</p>}>
      <AdminLogin />
    </Suspense>
  );
}

async function AdminLogin() {
  const user = await getCurrentUser();
  if (user?.role === "admin") redirect("/admin");

  return (
    <main className="page page-narrow">
      <div className="card form-card">
        <h1>Administrator login</h1>
        <p className="hint">For Traject verification staff only.</p>
        <AdminLoginForm />
        <p className="form-footer">
          <Link href="/login">Student login</Link>
        </p>
      </div>
    </main>
  );
}
