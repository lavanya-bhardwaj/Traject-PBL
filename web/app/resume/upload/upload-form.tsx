"use client";

import { useActionState } from "react";
import { analyzeResume } from "@/app/actions/resume";
import { saveClaims } from "@/app/actions/claims";

export function ResumeUploadForm() {
  const [analysis, analyzeAction, analyzing] = useActionState(analyzeResume, undefined);
  const [saved, saveAction, saving] = useActionState(saveClaims, undefined);

  return (
    <>
      <form action={analyzeAction}>
        <div className="field">
          <label htmlFor="resume">Resume (PDF or .txt, up to 2 MB)</label>
          <input id="resume" name="resume" type="file" accept=".pdf,.txt,application/pdf,text/plain" required />
        </div>
        <button className="btn btn-primary" disabled={analyzing} type="submit">
          {analyzing ? "Reading your resume…" : "Read my resume"}
        </button>
      </form>

      {analysis?.message && <p className="alert" role="alert" style={{ marginTop: 16 }}>{analysis.message}</p>}

      {analysis?.suggestions && (
        <form action={saveAction} style={{ marginTop: 24 }}>
          <p className="hint">
            {analysis.source === "keywords"
              ? "The AI was unavailable, so these skills were matched by name. "
              : ""}
            Tick the skills that fit. Each one becomes a claim, and you can take its check to verify it.
          </p>
          {analysis.suggestions.map((item) => (
            <label key={item.skillId} className="choice" style={{ alignItems: "flex-start" }}>
              <input type="checkbox" name="skillId" value={item.skillId} defaultChecked />
              <input type="hidden" name={`evidence-${item.skillId}`} value={item.evidence} />
              <span>
                <strong>{analysis.names?.[item.skillId] ?? item.skillId}</strong>
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
