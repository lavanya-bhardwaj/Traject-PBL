import Link from "next/link";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/app/actions/auth";

function GuestActions() {
  return (
    <>
      <Link href="/login" className="btn btn-outline">
        Log In
      </Link>
    </>
  );
}

// Reads the session, so it sits behind a Suspense boundary. While it loads, the slot is
// left empty, so a signed-in user never sees the guest buttons flash.
export function AuthNav() {
  return (
    <Suspense fallback={<span className="nav-actions-placeholder" aria-hidden="true" />}>
      <SignedInOrGuest />
    </Suspense>
  );
}

async function SignedInOrGuest() {
  const user = await getCurrentUser();
  if (!user) return <GuestActions />;

  // Employers and admins get their own home links, not the student dashboard.
  if (user.role !== "student") {
    return (
      <>
        <Link href={user.role === "employer" ? "/employer" : "/admin"} className="btn btn-outline">
          {user.role === "employer" ? "Employer portal" : "Admin"}
        </Link>
        <form action={logout}>
          <button className="btn btn-primary" type="submit">Log out</button>
        </form>
      </>
    );
  }

  return (
    <>
      <Link href="/jobs" className="btn btn-outline">
        Find jobs
      </Link>
      <Link href="/dashboard" className="btn btn-outline">
        Dashboard
      </Link>
      <details className="profile-menu">
        <summary className="btn btn-outline">Account</summary>
        <div className="profile-menu-panel">
          <Link href="/profile">My Profile</Link>
          <Link href="/resume">My Resume</Link>
          <Link href="/network">My Network</Link>
          <form action={logout}>
            <button type="submit">Log out</button>
          </form>
        </div>
      </details>
    </>
  );
}
