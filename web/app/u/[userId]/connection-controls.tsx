import { acceptRequest, removeConnection, sendRequest } from "@/app/actions/connections";
import type { ConnectionStatus } from "@/lib/social/connections";

// Plain server-action forms, so no client code is needed.
export function ConnectionControls({ otherId, status }: { otherId: string; status: ConnectionStatus }) {
  if (status === "connected") {
    return (
      <form action={removeConnection} style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <input type="hidden" name="otherId" value={otherId} />
        <span className="level-pill">Connected</span>
        <button className="btn btn-outline" type="submit">Remove connection</button>
      </form>
    );
  }

  if (status === "outgoing") {
    return (
      <form action={removeConnection} style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <input type="hidden" name="otherId" value={otherId} />
        <span className="meta">Request sent</span>
        <button className="btn btn-outline" type="submit">Withdraw</button>
      </form>
    );
  }

  if (status === "incoming") {
    return (
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <form action={acceptRequest}>
          <input type="hidden" name="otherId" value={otherId} />
          <button className="btn btn-primary" type="submit">Accept request</button>
        </form>
        <form action={removeConnection}>
          <input type="hidden" name="otherId" value={otherId} />
          <button className="btn btn-outline" type="submit">Decline</button>
        </form>
      </div>
    );
  }

  return (
    <form action={sendRequest}>
      <input type="hidden" name="otherId" value={otherId} />
      <button className="btn btn-primary" type="submit">Connect</button>
    </form>
  );
}
