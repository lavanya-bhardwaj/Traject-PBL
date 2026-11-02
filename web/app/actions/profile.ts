"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { updateProfile } from "@/lib/profile";
import { profileError } from "@/lib/validation";

export type ProfileState = { message?: string; saved?: boolean } | undefined;

export async function saveProfile(_state: ProfileState, formData: FormData): Promise<ProfileState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const headline = String(formData.get("headline") ?? "").trim();

  const error = profileError({ name, headline });
  if (error) return { message: error };

  await updateProfile(user.id, name, headline);
  return { saved: true };
}
