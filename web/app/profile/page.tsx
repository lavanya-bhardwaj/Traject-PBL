import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ProfileForm } from "./profile-form";

export default function ProfilePage() {
  return (
    <Suspense fallback={<p className="page container">Loading profile…</p>}>
      <Profile />
    </Suspense>
  );
}

async function Profile() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <main className="page page-narrow" style={{ width: "min(640px, 100% - 32px)" }}>
      <div className="card form-card">
        <h1>Your profile</h1>
        <p className="hint">Other people see your name, headline and verified skills.</p>
        <ProfileForm name={user.name} headline={user.headline} />
        <p className="form-footer">
          <Link href={`/u/${user.id}`}>View your public profile</Link>
        </p>
      </div>
    </main>
  );
}
