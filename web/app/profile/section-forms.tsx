"use client";

import { useActionState } from "react";
import { addProfileEntry, saveCareerInterests } from "@/app/actions/profile-sections";
import { ENTRY_LABELS, ENTRY_KINDS } from "@/lib/profile-sections-validate";

export function AddEntryForm() {
  const [state, action, pending] = useActionState(addProfileEntry, undefined);

  return (
    <form action={action} className="section-form">
      <h3>Add an entry</h3>
      <p className="hint">Only the title is required. Fill in the rest when you have it.</p>
      <div className="field">
        <label htmlFor="kind">Type</label>
        <select id="kind" name="kind" defaultValue="education" required>
          {ENTRY_KINDS.map((kind) => (
            <option key={kind} value={kind}>{ENTRY_LABELS[kind]}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="title">Title</label>
        <input id="title" name="title" maxLength={120} required placeholder="e.g. B.Tech in Computer Science" />
      </div>
      <div className="field">
        <label htmlFor="organization">Organization</label>
        <input id="organization" name="organization" maxLength={120} placeholder="School, company or issuer" />
      </div>
      <div className="field">
        <label htmlFor="period">Period</label>
        <input id="period" name="period" maxLength={60} placeholder="e.g. 2023 – 2027" />
      </div>
      <div className="field">
        <label htmlFor="details">Details</label>
        <textarea id="details" name="details" rows={3} maxLength={1000} />
      </div>
      {state?.message && <p className="alert" role="alert">{state.message}</p>}
      {state?.saved && <p className="hint" role="status">Saved.</p>}
      <button className="btn btn-primary" disabled={pending} type="submit">
        {pending ? "Saving…" : "Add entry"}
      </button>
    </form>
  );
}

export function InterestsForm({
  roles,
  selected,
}: {
  roles: Array<{ id: string; title: string }>;
  selected: string[];
}) {
  const [state, action, pending] = useActionState(saveCareerInterests, undefined);

  return (
    <form action={action} className="section-form">
      <p className="hint">Pick the roles you want to work towards. They are highlighted in the career explorer.</p>
      <div className="interest-grid">
        {roles.map((role) => (
          <label key={role.id} className="choice">
            <input type="checkbox" name="roleId" value={role.id} defaultChecked={selected.includes(role.id)} />
            {role.title}
          </label>
        ))}
      </div>
      {state?.saved && <p className="hint" role="status">Saved.</p>}
      <button className="btn btn-primary" disabled={pending} type="submit" style={{ marginTop: 14 }}>
        {pending ? "Saving…" : "Save interests"}
      </button>
    </form>
  );
}
