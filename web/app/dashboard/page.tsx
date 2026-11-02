import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/app/actions/auth";

export default function DashboardPage() {
  return (
    <Suspense fallback={<p className="page container">Loading your dashboard…</p>}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <main className="page container">
      <div className="card form-card" style={{ maxWidth: 560 }}>
        <h1>Welcome, {user.name}</h1>
        <p className="hint">{user.email}</p>
        <div className="stack-actions">
          <Link href="/skills" className="btn btn-primary">
            Check your skills
          </Link>
          <form action={logout}>
            <button type="submit" className="btn btn-outline">
              Log out
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
