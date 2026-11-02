"use server";

import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";

export type AuthState =
  | {
      errors?: { name?: string[]; email?: string[]; password?: string[] };
      message?: string;
    }
  | undefined;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function signup(_state: AuthState, formData: FormData): Promise<AuthState> {
  const name = readField(formData, "name");
  const email = readField(formData, "email").toLowerCase();
  const password = readField(formData, "password");

  const errors: { name?: string[]; email?: string[]; password?: string[] } = {};
  if (name.length < 2) errors.name = ["Name must be at least 2 characters long."];
  if (!EMAIL_PATTERN.test(email)) errors.email = ["Please enter a valid email."];

  const passwordProblems: string[] = [];
  if (password.length < 8) passwordProblems.push("Be at least 8 characters long");
  if (!/[a-zA-Z]/.test(password)) passwordProblems.push("Contain at least one letter");
  if (!/[0-9]/.test(password)) passwordProblems.push("Contain at least one number");
  if (passwordProblems.length > 0) errors.password = passwordProblems;

  if (Object.keys(errors).length > 0) return { errors };

  const existing = await query("SELECT 1 FROM users WHERE email = $1", [email]);
  if (existing.length > 0) {
    return { message: "An account with this email already exists." };
  }

  const passwordHash = await hashPassword(password);
  const [user] = await query<{ id: string }>(
    "INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING id",
    [email, name, passwordHash],
  );

  await createSession(user.id);
  redirect("/dashboard");
}

export async function login(_state: AuthState, formData: FormData): Promise<AuthState> {
  const email = readField(formData, "email").toLowerCase();
  const password = readField(formData, "password");

  if (!email || !password) {
    return { message: "Enter your email and password." };
  }

  const [user] = await query<{ id: string; password_hash: string }>(
    "SELECT id, password_hash FROM users WHERE email = $1",
    [email],
  );

  // Same message whether the email or the password is wrong, so the form can't be used to find accounts.
  const ok = user ? await verifyPassword(password, user.password_hash) : false;
  if (!user || !ok) {
    return { message: "Email or password is incorrect." };
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/login");
}
