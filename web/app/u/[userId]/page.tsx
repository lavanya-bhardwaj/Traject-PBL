import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getProfile, profileSummary } from "@/lib/profile";
import { connectionStatus } from "@/lib/social/connections";
import { ConnectionControls } from "./connection-controls";
import { isUuid } from "@/lib/validation";

export default function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  return (
    <Suspense fallback={<p className="page container">Loading profile…</p>}>
      <PublicProfile params={params} />
    </Suspense>
  );
}

async function PublicProfile({ params }: { params: Promise<{ userId: string }> }) {
  const viewer = await getCurrentUser();
  if (!viewer) redirect("/login");

  const { userId } = await params;
  if (!isUuid(userId)) notFound();

  const profile = await getProfile(userId);
  if (!profile) notFound();

  const { verified, claimed, score } = await profileSummary(userId);
  const status = await connectionStatus(viewer.id, userId);
  const isMe = viewer.id === userId;

  return (
    <main className="page container">
      <div className="card" style={{ padding: 28, maxWidth: 720 }}>
        <h1>{profile.name}</h1>
        {profile.headline && <p style={{ marginTop: 6 }}>{profile.headline}</p>}

        <div style={{ display: "flex", gap: 28, marginTop: 22, flexWrap: "wrap" }}>
          <div>
            <div style={{ color: "var(--muted)", fontSize: 14 }}>Profile score</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: "var(--ink)" }}>{score} / 100</div>
          </div>
          <div>
            <div style={{ color: "var(--muted)", fontSize: 14 }}>Verified skills</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: "var(--ink)" }}>{verified.length}</div>
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          {isMe ? (
            <Link href="/profile" className="btn btn-outline">Edit your profile</Link>
          ) : (
            <ConnectionControls otherId={userId} status={status} />
          )}
        </div>
      </div>

      <h2 style={{ marginTop: 32, fontSize: 22 }}>Verified skills</h2>
      {verified.length === 0 ? (
        <p style={{ marginTop: 10 }}>No verified skills yet.</p>
      ) : (
        <ul className="skill-list">
          {verified.map((skill) => (
            <li key={skill.id} className="card skill-item">
              <div>
                <div className="name">{skill.name}</div>
                <div className="meta">{skill.category}</div>
              </div>
              <span className="level-pill">Level {skill.level} of 5</span>
            </li>
          ))}
        </ul>
      )}

      {claimed.length > 0 && (
        <>
          <h2 style={{ marginTop: 32, fontSize: 22 }}>Claimed, not verified</h2>
          <p className="hint" style={{ color: "var(--muted)", marginTop: 6 }}>
            Described in their own words. These are not counted in the score.
          </p>
          <ul style={{ marginTop: 12, paddingLeft: 20, color: "var(--text)" }}>
            {claimed.map((skill) => (
              <li key={skill.id}>{skill.name}</li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
