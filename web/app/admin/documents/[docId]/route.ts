import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { readDocument } from "@/lib/employer/documents";

// Admin-only download of a verification document. Checked here on the server, not only in the UI.
// Anyone else, including signed-out visitors and other roles, gets a plain 404.
export async function GET(_request: Request, { params }: { params: Promise<{ docId: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return new Response("Not found", { status: 404 });
  }

  const { docId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(docId)) {
    return new Response("Not found", { status: 404 });
  }

  const rows = await query<{ storage_path: string; mime_type: string; original_name: string }>(
    "SELECT storage_path, mime_type, original_name FROM employer_documents WHERE id = $1",
    [docId],
  );
  if (rows.length === 0) return new Response("Not found", { status: 404 });

  const doc = rows[0];
  const bytes = await readDocument(doc.storage_path);
  const safeName = doc.original_name.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 120) || "document";

  return new Response(new Blob([bytes as BlobPart], { type: doc.mime_type }), {
    headers: {
      "Content-Type": doc.mime_type,
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
