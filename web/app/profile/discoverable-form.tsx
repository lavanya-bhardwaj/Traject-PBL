"use client";

import { useActionState } from "react";
import { setDiscoverable } from "@/app/actions/profile-sections";

export function DiscoverableForm({ initial }: { initial: boolean }) {
  const [state, action, pending] = useActionState(setDiscoverable, undefined);

  return (
    <form action={action} className="section-form">
      <label className="choice" style={{ alignItems: "flex-start" }}>
        <input type="checkbox" name="discoverable" defaultChecked={initial} />
        <span>
          <strong>Let verified employers find my profile</strong>
          <span className="dash-muted" style={{ display: "block", fontSize: 14 }}>
            When on, verified employers can search for you by your verified skills, education and projects. Your email and phone number are never shown to employers.
          </span>
        </span>
      </label>
      {state?.message && <p className="alert" role="alert">{state.message}</p>}
      {state?.saved && <p className="hint" role="status">Saved.</p>}
      <button className="btn btn-outline" disabled={pending} type="submit" style={{ marginTop: 10 }}>
        {pending ? "Saving…" : "Save visibility"}
      </button>
    </form>
  );
}
