import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listNetwork } from "@/lib/social/connections";
import { acceptRequest, removeConnection } from "@/app/actions/connections";

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

  const { incoming, outgoing, connected } = await listNetwork(user.id);

  return (
    <main className="page container">
      <h1>Your network</h1>

      <h2 style={{ marginTop: 28, fontSize: 20 }}>Requests for you</h2>
      {incoming.length === 0 ? (
        <p className="empty">No pending requests.</p>
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
        <p className="empty">No connections yet. Find people through recruiter search or their profiles.</p>
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
        <p className="empty">No requests waiting.</p>
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
