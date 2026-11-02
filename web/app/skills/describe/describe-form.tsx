"use client";

import { useActionState } from "react";
import { saveClaims, suggestClaims } from "@/app/actions/claims";

export function DescribeForm({ maxLength }: { maxLength: number }) {
  const [suggest, suggestAction, suggesting] = useActionState(suggestClaims, undefined);
  const [saved, saveAction, saving] = useActionState(saveClaims, undefined);

  return (
    <>
      <form action={suggestAction}>
        <div className="field">
          <label htmlFor="text">Your experience</label>
          <textarea
            id="text"
            name="text"
            rows={7}
            maxLength={maxLength}
            required
            minLength={20}
            style={{ width: "100%", font: "inherit", padding: 12, borderRadius: 12, border: "1px solid var(--line)" }}
          />
        </div>
        <button className="btn btn-primary" disabled={suggesting} type="submit">
          {suggesting ? "Reading your description…" : "Suggest skills"}
        </button>
      </form>

      {suggest?.message && <p className="alert" role="alert" style={{ marginTop: 16 }}>{suggest.message}</p>}

      {suggest?.suggestions && (
        <form action={saveAction} style={{ marginTop: 24 }}>
          <p className="hint">Tick the skills that fit. You can take the check later to verify each one.</p>
          {suggest.suggestions.map((item) => (
            <label key={item.skillId} className="choice" style={{ alignItems: "flex-start" }}>
              <input type="checkbox" name="skillId" value={item.skillId} defaultChecked />
              <input type="hidden" name={`evidence-${item.skillId}`} value={item.evidence} />
              <span>
                <strong>{suggest.names?.[item.skillId] ?? item.skillId}</strong>
                {item.evidence && <span style={{ display: "block", color: "var(--muted)", fontSize: 14 }}>“{item.evidence}”</span>}
              </span>
            </label>
          ))}
          <div className="stack-actions">
            <button className="btn btn-primary" disabled={saving} type="submit">
              {saving ? "Saving…" : "Save as claimed skills"}
            </button>
          </div>
          {saved?.message && <p className="alert" role="alert" style={{ marginTop: 16 }}>{saved.message}</p>}
        </form>
      )}
    </>
  );
}
