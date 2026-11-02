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
      <Link href="/signup" className="btn btn-primary">
        Get Started →
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

  return (
    <>
      <Link href="/dashboard" className="btn btn-outline">
        Dashboard
      </Link>
      <form action={logout}>
        <button className="btn btn-primary" type="submit">
          Log out
        </button>
      </form>
    </>
  );
}
