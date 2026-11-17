"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { addEntry, deleteEntry, setInterests } from "@/lib/profile-sections";
import { parseRoleIds, validateEntry } from "@/lib/profile-sections-validate";

export type SectionState = { message?: string; saved?: boolean } | undefined;

export async function addProfileEntry(_state: SectionState, formData: FormData): Promise<SectionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const result = validateEntry({
    kind: String(formData.get("kind") ?? ""),
    title: String(formData.get("title") ?? ""),
    organization: String(formData.get("organization") ?? ""),
    period: String(formData.get("period") ?? ""),
    details: String(formData.get("details") ?? ""),
  });
  if (!result.ok) return { message: result.message };

  await addEntry(user.id, result.value);
  revalidatePath("/profile");
  revalidatePath("/resume");
  return { saved: true };
}

export async function deleteProfileEntry(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const entryId = formData.get("entryId");
  if (typeof entryId !== "string" || !/^[0-9a-f-]{36}$/i.test(entryId)) return;

  await deleteEntry(user.id, entryId);
  revalidatePath("/profile");
  revalidatePath("/resume");
}

export async function saveCareerInterests(_state: SectionState, formData: FormData): Promise<SectionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await setInterests(user.id, parseRoleIds(formData.getAll("roleId")));
  revalidatePath("/profile");
  revalidatePath("/roles");
  return { saved: true };
}

// Students choose whether employers can find them. Off by default. Only the student can change this.
export async function setDiscoverable(_state: SectionState, formData: FormData): Promise<SectionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "student") return { message: "Only student accounts have this setting." };

  const on = formData.get("discoverable") === "on";
  await query("UPDATE users SET discoverable = $2 WHERE id = $1 AND role = 'student'", [user.id, on]);
  revalidatePath("/profile");
  return { saved: true };
}
