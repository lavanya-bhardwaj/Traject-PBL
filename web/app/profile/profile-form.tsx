"use client";

import { useActionState } from "react";
import { saveProfile } from "@/app/actions/profile";

export function ProfileForm({ name, headline }: { name: string; headline: string }) {
  const [state, action, pending] = useActionState(saveProfile, undefined);

  return (
    <form action={action}>
      {state?.message && <p className="alert" role="alert">{state.message}</p>}
      {state?.saved && <p className="hint" style={{ color: "var(--green)", marginBottom: 12 }}>Saved.</p>}

      <div className="field">
        <label htmlFor="name">Name</label>
        <input id="name" name="name" defaultValue={name} required />
      </div>
      <div className="field">
        <label htmlFor="headline">Headline</label>
        <input id="headline" name="headline" defaultValue={headline} maxLength={120} placeholder="e.g. Final-year student, data enthusiast" />
      </div>

      <button className="btn btn-primary" disabled={pending} type="submit">
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
