// Employer verification documents. Stored outside the public folder, so no URL serves them directly.
// Only admin routes read them back (see app/admin/documents/[id]/route.ts).
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve, sep } from "node:path";

export { DOC_MAX_BYTES, DOC_KINDS, DOC_LABELS, type DocKind } from "@/lib/employer/doc-kinds";

// The folder is inside the project, but outside public/ so Next never serves it.
const ROOT = resolve(process.cwd(), "private-uploads", "employer-documents");

// Checks the real file type from its first bytes, not the file name the browser sends.
export function detectType(head: Uint8Array): "application/pdf" | "image/jpeg" | "image/png" | null {
  const text = new TextDecoder().decode(head.slice(0, 5));
  if (text.startsWith("%PDF")) return "application/pdf";
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return "image/jpeg";
  if (head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47) return "image/png";
  return null;
}

export async function saveDocument(
  bytes: Uint8Array,
  mime: string,
): Promise<{ storagePath: string }> {
  await mkdir(ROOT, { recursive: true });
  const ext = mime === "application/pdf" ? "pdf" : mime === "image/png" ? "png" : "jpg";
  const storagePath = `${randomUUID()}.${ext}`;
  await writeFile(join(ROOT, storagePath), bytes);
  return { storagePath };
}

// Reads a stored file. The path must stay inside ROOT, so a stored name cannot escape the folder.
export async function readDocument(storagePath: string): Promise<Uint8Array> {
  const full = resolve(ROOT, storagePath);
  if (!full.startsWith(ROOT + sep)) throw new Error("Invalid document path");
  return new Uint8Array(await readFile(full));
}
