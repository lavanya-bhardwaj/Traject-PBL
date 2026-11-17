"use client";

// Opens the browser print dialog. "Save as PDF" is picked there, so no PDF library is needed.
export function PrintButton() {
  return (
    <button type="button" className="btn btn-primary" onClick={() => window.print()}>
      Print / Save as PDF
    </button>
  );
}
