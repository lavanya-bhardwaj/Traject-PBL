import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listNetwork } from "@/lib/social/connections";
import { acceptRequest, removeConnection } from "@/app/actions/connections";
import { EmptyState } from "@/components/empty-state";

export default function NetworkPage() {
  return (
    <Suspense fallback={<p className="page container">Loading network…</p>}>
      <Network />
    </Suspense>
  );
}

async function Network() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "student") notFound();

  const { incoming, outgoing, connected } = await listNetwork(user.id);

  return (
    <main className="page container">
      <h1>Your network</h1>

      <h2 style={{ marginTop: 28, fontSize: 20 }}>Requests for you</h2>
      {incoming.length === 0 ? (
        <EmptyState
          title="No requests waiting for you"
          body="When someone wants to connect, their request appears here. You can also reach out to people first."
          actionHref="/search"
          actionLabel="Find people"
        />
      ) : (
        <ul className="skill-list">
          {incoming.map((person) => (
            <li key={person.id} className="card skill-item">
              <div>
                <Link href={`/u/${person.id}`} className="name">{person.name}</Link>
                <div className="meta">{person.headline}</div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <form action={acceptRequest}>
                  <input type="hidden" name="otherId" value={person.id} />
                  <button className="btn btn-primary" type="submit">Accept</button>
                </form>
                <form action={removeConnection}>
                  <input type="hidden" name="otherId" value={person.id} />
                  <button className="btn btn-outline" type="submit">Decline</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h2 style={{ marginTop: 32, fontSize: 20 }}>Connections</h2>
      {connected.length === 0 ? (
        <EmptyState
          title="Build your professional network"
          body="Connect with students, alumni, mentors, and recruiters who share your career interests."
          actionHref="/search"
          actionLabel="Discover people"
        />
      ) : (
        <ul className="skill-list">
          {connected.map((person) => (
            <li key={person.id} className="card skill-item">
              <div>
                <Link href={`/u/${person.id}`} className="name">{person.name}</Link>
                <div className="meta">{person.headline}</div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h2 style={{ marginTop: 32, fontSize: 20 }}>Sent requests</h2>
      {outgoing.length === 0 ? (
        <EmptyState
          title="No requests sent"
          body="Requests you send to people appear here until they accept. Open a profile to send one."
          actionHref="/search"
          actionLabel="Find people"
        />
      ) : (
        <ul className="skill-list">
          {outgoing.map((person) => (
            <li key={person.id} className="card skill-item">
              <Link href={`/u/${person.id}`} className="name">{person.name}</Link>
              <form action={removeConnection}>
                <input type="hidden" name="otherId" value={person.id} />
                <button className="btn btn-outline" type="submit">Withdraw</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
