"use server";

import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { suggestSkills, type SkillSuggestion } from "@/lib/ai/skill-mapping";
import { checkResumeFile, extractResumeText } from "@/lib/resume/extract";
import { keywordSkills } from "@/lib/resume/keyword-skills";
import { removeResume, saveResume } from "@/lib/resume/store";
import { revalidatePath } from "next/cache";

export type ResumeState =
  | { message?: string; suggestions?: SkillSuggestion[]; names?: Record<string, string>; source?: "ai" | "keywords" }
  | undefined;

// Reads an uploaded resume and suggests skills from it. Nothing is saved here: the candidate
// ticks the skills they agree with, and the existing saveClaims action stores them as claims.
export async function analyzeResume(_state: ResumeState, formData: FormData): Promise<ResumeState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const file = formData.get("resume");
  if (!(file instanceof File)) {
    return { message: "Choose a resume file to upload." };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const check = checkResumeFile(file.name, file.size, bytes);
  if (!check.ok) return { message: check.message };

  let text: string;
  try {
    text = await extractResumeText(bytes, check.isPdf);
  } catch {
    return { message: "We could not read text from this file. Scanned PDFs are not supported; try a text-based PDF or a .txt file." };
  }
  if (text.length < 50) {
    return { message: "We could not find enough text in this file. Scanned PDFs are not supported." };
  }

  // Keep the readable resume as the student's current one. Replaces any earlier upload.
  await saveResume(user.id, bytes, check.isPdf ? "application/pdf" : "text/plain", file.name);

  const taxonomy = await query<{ id: string; name: string }>("SELECT id, name FROM skills ORDER BY name");
  const names = Object.fromEntries(taxonomy.map((skill) => [skill.id, skill.name]));

  let suggestions: SkillSuggestion[];
  let source: "ai" | "keywords" = "ai";
  try {
    suggestions = await suggestSkills(text, taxonomy);
  } catch {
    // Ollama or the model is unavailable: fall back to matching skill names and aliases.
    suggestions = keywordSkills(text, taxonomy);
    source = "keywords";
  }

  if (suggestions.length === 0) {
    return { message: "No skills in the list clearly matched this resume. Try a more detailed resume." };
  }
  return { suggestions, names, source };
}

// Deletes the stored resume file and its record. Only the signed-in student can remove their own.
export async function deleteStoredResume(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  await removeResume(user.id);
  revalidatePath("/resume");
}
