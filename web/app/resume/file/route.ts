import { getCurrentUser } from "@/lib/auth";
import { getResume, readResume } from "@/lib/resume/store";

// Downloads the signed-in student's own resume. Anyone else gets a plain 404.
export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") return new Response("Not found", { status: 404 });

  const resume = await getResume(user.id);
  if (!resume) return new Response("Not found", { status: 404 });

  const bytes = await readResume(resume.storagePath);
  const safeName = resume.originalName.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 120) || "resume";
  return new Response(new Blob([bytes as BlobPart], { type: resume.mimeType }), {
    headers: {
      "Content-Type": resume.mimeType,
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
