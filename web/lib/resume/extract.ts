// Reads text from an uploaded resume. PDF and plain text only. The file is kept in memory and never stored.
import { extractText } from "unpdf";

export const MAX_RESUME_BYTES = 2 * 1024 * 1024;
export const MAX_RESUME_CHARS = 6000;

export type ResumeCheck = { ok: true; isPdf: boolean } | { ok: false; message: string };

// Checks the type and size before any parsing. A PDF must start with "%PDF".
export function checkResumeFile(name: string, size: number, head: Uint8Array): ResumeCheck {
  if (size === 0) return { ok: false, message: "The file is empty." };
  if (size > MAX_RESUME_BYTES) return { ok: false, message: "Keep the resume under 2 MB." };

  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) {
    const magic = new TextDecoder().decode(head.slice(0, 4));
    if (magic !== "%PDF") return { ok: false, message: "That file is not a valid PDF." };
    return { ok: true, isPdf: true };
  }
  if (lower.endsWith(".txt")) return { ok: true, isPdf: false };
  return { ok: false, message: "Upload a PDF or a .txt file." };
}

export async function extractResumeText(bytes: Uint8Array, isPdf: boolean): Promise<string> {
  // pdf.js takes ownership of the buffer it is given and leaves it empty, so pass a copy.
  // Otherwise the caller would go on to store a 0-byte file.
  const raw = isPdf
    ? (await extractText(bytes.slice(), { mergePages: true })).text
    : new TextDecoder().decode(bytes);
  return raw.replace(/\s+/g, " ").trim().slice(0, MAX_RESUME_CHARS);
}
