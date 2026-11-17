// Private file storage in Postgres (table file_blobs). Nothing serves these bytes directly;
// only server routes that check the user read them back.
import { randomUUID } from "node:crypto";
import { query } from "@/lib/db";

export async function putBlob(bytes: Uint8Array, ext: string): Promise<string> {
  const storagePath = `${randomUUID()}.${ext}`;
  await query("INSERT INTO file_blobs (storage_path, bytes) VALUES ($1, $2)", [storagePath, Buffer.from(bytes)]);
  return storagePath;
}

export async function getBlob(storagePath: string): Promise<Uint8Array | null> {
  const rows = await query<{ bytes: Buffer }>("SELECT bytes FROM file_blobs WHERE storage_path = $1", [storagePath]);
  return rows[0] ? new Uint8Array(rows[0].bytes) : null;
}

export async function deleteBlob(storagePath: string): Promise<void> {
  await query("DELETE FROM file_blobs WHERE storage_path = $1", [storagePath]);
}
