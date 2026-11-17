// Employer verification documents. Stored in the database, so no URL serves them directly.
// Only admin routes read them back (see app/admin/documents/[docId]/route.ts).
import { getBlob, putBlob } from "@/lib/blobs";

export { DOC_MAX_BYTES, DOC_KINDS, DOC_LABELS, type DocKind } from "@/lib/employer/doc-kinds";

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
  const ext = mime === "application/pdf" ? "pdf" : mime === "image/png" ? "png" : "jpg";
  return { storagePath: await putBlob(bytes, ext) };
}

// Returns null when the bytes are missing.
export async function readDocument(storagePath: string): Promise<Uint8Array | null> {
  return getBlob(storagePath);
}
