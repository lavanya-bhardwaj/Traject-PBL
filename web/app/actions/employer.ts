"use server";

import { createHash, randomBytes } from "node:crypto";
import { query } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";
import { validateEmployer } from "@/lib/employer/rules";
import { newEmployerCode } from "@/lib/employer/code";
import { DOC_KINDS, DOC_MAX_BYTES, detectType, saveDocument, type DocKind } from "@/lib/employer/documents";

export type RegisterState =
  | { message?: string; errors?: Record<string, string>; devVerifyLink?: string }
  | undefined;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN_HOURS = 24;

function field(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function passwordProblems(password: string): string[] {
  const problems: string[] = [];
  if (password.length < 8) problems.push("be at least 8 characters long");
  if (!/[a-zA-Z]/.test(password)) problems.push("contain at least one letter");
  if (!/[0-9]/.test(password)) problems.push("contain at least one number");
  return problems;
}

// Registers an employer: login account, company record with a generated ID, documents, and an email verification token.
// The account is NOT verified after this. It is verified only when an administrator approves the company.
export async function registerEmployer(_state: RegisterState, formData: FormData): Promise<RegisterState> {
  const raw: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") raw[key] = value;
  }

  const workEmail = field(formData, "workEmail").toLowerCase();
  const password = field(formData, "password");
  const errors: Record<string, string> = {};
  if (!EMAIL_PATTERN.test(workEmail)) errors.workEmail = "Enter your work email address.";
  const pw = passwordProblems(password);
  if (pw.length > 0) errors.password = `Password must ${pw.join(", ")}.`;

  const company = validateEmployer(raw);
  if (!company.ok) Object.assign(errors, company.errors);

  // Documents: each kind has its own file input. At least one is required.
  const uploads: Array<{ kind: DocKind; name: string; size: number; bytes: Uint8Array; mime: string }> = [];
  for (const kind of DOC_KINDS) {
    const file = formData.get(`doc-${kind}`);
    if (!(file instanceof File) || file.size === 0) continue;
    if (file.size > DOC_MAX_BYTES) {
      errors[`doc-${kind}`] = "Each document must be 2 MB or smaller.";
      continue;
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    const mime = detectType(bytes);
    if (!mime) {
      errors[`doc-${kind}`] = "Upload a PDF, JPG or PNG file.";
      continue;
    }
    uploads.push({ kind, name: file.name, size: file.size, bytes, mime });
  }
  if (uploads.length === 0) errors.documents = "Upload at least one verification document.";

  if (Object.keys(errors).length > 0 || !company.ok) {
    return { message: "Please fix the highlighted fields.", errors };
  }
  const v = company.value;

  const passwordHash = await hashPassword(password);
  let userId: string;
  try {
    const [user] = await query<{ id: string }>(
      "INSERT INTO users (email, name, password_hash, role) VALUES ($1, $2, $3, 'employer') RETURNING id",
      [workEmail, v.recruiterName, passwordHash],
    );
    userId = user.id;
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { message: "An account with this work email already exists. Log in instead." };
    }
    throw error;
  }

  try {
    let employerId: string | null = null;
    for (let attempt = 0; attempt < 3 && !employerId; attempt++) {
      try {
        const [row] = await query<{ id: string }>(
          `INSERT INTO employers (
             user_id, employer_code, company_name, website, company_email, company_phone,
             country, state, city, address, industry, company_size, established_year, legal_type,
             cin, llpin, gstin, udyam_number, other_identifier,
             recruiter_name, designation, department, recruiter_phone)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
           RETURNING id`,
          [
            userId, newEmployerCode(), v.companyName, v.website, v.companyEmail, v.companyPhone,
            v.country, v.state, v.city, v.address, v.industry, v.companySize, v.establishedYear, v.legalType,
            v.cin, v.llpin, v.gstin, v.udyamNumber, v.otherIdentifier,
            v.recruiterName, v.designation, v.department, v.recruiterPhone,
          ],
        );
        employerId = row.id;
      } catch (error) {
        if (!isUniqueViolation(error)) throw error;
      }
    }
    if (!employerId) throw new Error("Could not generate a unique employer ID");

    for (const upload of uploads) {
      const { storagePath } = await saveDocument(upload.bytes, upload.mime);
      await query(
        `INSERT INTO employer_documents (employer_id, kind, original_name, mime_type, size_bytes, storage_path)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [employerId, upload.kind, upload.name.slice(0, 200), upload.mime, upload.size, storagePath],
      );
    }
    await query(
      "INSERT INTO verification_audit_log (employer_id, admin_id, action, note) VALUES ($1, NULL, 'registered', 'Registration submitted')",
      [employerId],
    );
  } catch (error) {
    // Roll back the account so a half-finished registration cannot log in.
    await query("DELETE FROM users WHERE id = $1", [userId]);
    throw error;
  }

  // Email verification token. Only a hash is stored.
  const token = randomBytes(32).toString("base64url");
  await query(
    "INSERT INTO email_tokens (token_hash, user_id, expires_at) VALUES ($1, $2, now() + make_interval(hours => $3))",
    [hashToken(token), userId, TOKEN_HOURS],
  );

  await createSession(userId);

  // No email provider is configured yet. In development the link is shown on the page.
  if (process.env.NODE_ENV !== "production") {
    console.log(`[dev] employer email verification link: /employer/verify-email?token=${token}`);
    return { devVerifyLink: `/employer/verify-email?token=${token}` };
  }
  return { message: "Registered. Email sending is not configured on this server yet, so verification cannot be completed." };
}

// Confirms the work email from a link. Called by the verify-email page on the server.
export async function confirmEmail(token: string): Promise<{ ok: boolean; message: string }> {
  if (!token || token.length > 200) return { ok: false, message: "This link is not valid." };
  const rows = await query<{ user_id: string }>(
    `UPDATE email_tokens SET used_at = now()
      WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()
      RETURNING user_id`,
    [hashToken(token)],
  );
  if (rows.length === 0) return { ok: false, message: "This link has expired or was already used." };
  await query("UPDATE users SET email_verified_at = now() WHERE id = $1", [rows[0].user_id]);
  return { ok: true, message: "Your email is confirmed." };
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "23505";
}
