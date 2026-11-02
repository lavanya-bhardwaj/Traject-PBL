"use client";

import { useActionState } from "react";
import { generateLearningPath } from "@/app/actions/paths";

export function PathButton({ roleId }: { roleId: string }) {
  const [state, action, pending] = useActionState(generateLearningPath, undefined);

  return (
    <section style={{ marginTop: 32 }}>
      <form action={action}>
        <input type="hidden" name="roleId" value={roleId} />
        <button className="btn btn-primary" disabled={pending} type="submit">
          {pending ? "Writing your plan…" : "Build my learning path"}
        </button>
      </form>

      {state && "message" in state && state.message && (
        <p className="alert" role="alert" style={{ marginTop: 16 }}>{state.message}</p>
      )}

      {state && "steps" in state && (
        <div style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 22 }}>Your learning path</h2>
          {state.note && <p className="hint" style={{ color: "var(--muted)", marginTop: 6 }}>{state.note}</p>}
          <ol style={{ marginTop: 16, paddingLeft: 22, display: "grid", gap: 12 }}>
            {state.steps.map((step) => (
              <li key={step.skillId}>
                <strong style={{ color: "var(--ink)" }}>{step.name}.</strong> {step.action}
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
