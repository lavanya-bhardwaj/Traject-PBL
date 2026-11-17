// Stores each student's current resume in a private folder outside public/. Only the owner can download it.
import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { query } from "@/lib/db";

const ROOT = resolve(process.cwd(), "private-uploads", "resumes");

export type StoredResume = {
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: Date;
  storagePath: string;
};

function fullPath(storagePath: string): string {
  const full = resolve(ROOT, storagePath);
  if (!full.startsWith(ROOT + sep)) throw new Error("Invalid resume path");
  return full;
}

export async function getResume(userId: string): Promise<StoredResume | null> {
  const rows = await query<{
    original_name: string;
    mime_type: string;
    size_bytes: number;
    uploaded_at: Date;
    storage_path: string;
  }>(
    "SELECT original_name, mime_type, size_bytes, uploaded_at, storage_path FROM resumes WHERE user_id = $1",
    [userId],
  );
  const row = rows[0];
  if (!row) return null;
  return {
    originalName: row.original_name,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    uploadedAt: row.uploaded_at,
    storagePath: row.storage_path,
  };
}

// Saves the file and makes it the student's current resume. The previous file is deleted.
export async function saveResume(userId: string, bytes: Uint8Array, mimeType: string, originalName: string): Promise<void> {
  await mkdir(ROOT, { recursive: true });
  const ext = mimeType === "application/pdf" ? "pdf" : "txt";
  const storagePath = `${randomUUID()}.${ext}`;
  await writeFile(fullPath(storagePath), bytes);

  const previous = await getResume(userId);
  await query(
    `INSERT INTO resumes (user_id, original_name, mime_type, size_bytes, storage_path, uploaded_at)
     VALUES ($1, $2, $3, $4, $5, now())
     ON CONFLICT (user_id) DO UPDATE
       SET original_name = EXCLUDED.original_name, mime_type = EXCLUDED.mime_type,
           size_bytes = EXCLUDED.size_bytes, storage_path = EXCLUDED.storage_path, uploaded_at = now()`,
    [userId, originalName.slice(0, 200), mimeType, bytes.length, storagePath],
  );
  if (previous) await unlink(fullPath(previous.storagePath)).catch(() => undefined);
}

export async function readResume(storagePath: string): Promise<Uint8Array> {
  return new Uint8Array(await readFile(fullPath(storagePath)));
}

export async function removeResume(userId: string): Promise<void> {
  const previous = await getResume(userId);
  if (!previous) return;
  await query("DELETE FROM resumes WHERE user_id = $1", [userId]);
  await unlink(fullPath(previous.storagePath)).catch(() => undefined);
}
