// Employer registration rules. Pure logic: no database, Node or framework code, so client components can import it.
// Nothing here marks a company as verified. Verification is a separate, admin-only step.

export const LEGAL_TYPES = ["company", "llp", "proprietorship", "partnership", "other"] as const;
export type LegalType = (typeof LEGAL_TYPES)[number];

export const LEGAL_TYPE_LABELS: Record<LegalType, string> = {
  company: "Registered company (Pvt Ltd, Public Ltd, OPC)",
  llp: "Limited Liability Partnership (LLP)",
  proprietorship: "Sole proprietorship",
  partnership: "Partnership firm",
  other: "Other registered entity",
};

export const VERIFICATION_STATUSES = ["pending", "under_review", "verified", "rejected", "suspended"] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

// Indian legal identifiers, in the formats the registries use.
export const ID_PATTERNS = {
  cin: /^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/, // 21 characters
  llpin: /^[A-Z]{3}-[0-9]{4}$/, // e.g. AAA-1234
  gstin: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/, // 15 characters
  udyam: /^UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}$/,
};

export type EmployerInput = {
  companyName: string;
  website: string;
  companyEmail: string;
  companyPhone: string;
  country: string;
  state: string;
  city: string;
  address: string;
  industry: string;
  companySize: string;
  establishedYear: number | null;
  legalType: LegalType;
  cin: string;
  llpin: string;
  gstin: string;
  udyamNumber: string;
  otherIdentifier: string;
  recruiterName: string;
  designation: string;
  department: string;
  recruiterPhone: string;
};

export type ValidationResult = { ok: true; value: EmployerInput } | { ok: false; errors: Record<string, string> };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[0-9 ()-]{8,18}$/;

function text(raw: Record<string, string>, key: string): string {
  return (raw[key] ?? "").trim();
}

export function validateEmployer(raw: Record<string, string>, now = new Date()): ValidationResult {
  const errors: Record<string, string> = {};
  const v = {
    companyName: text(raw, "companyName"),
    website: text(raw, "website"),
    companyEmail: text(raw, "companyEmail").toLowerCase(),
    companyPhone: text(raw, "companyPhone"),
    country: text(raw, "country"),
    state: text(raw, "state"),
    city: text(raw, "city"),
    address: text(raw, "address"),
    industry: text(raw, "industry"),
    companySize: text(raw, "companySize"),
    establishedYear: Number(text(raw, "establishedYear")) || null,
    legalType: text(raw, "legalType") as LegalType,
    cin: text(raw, "cin").toUpperCase(),
    llpin: text(raw, "llpin").toUpperCase(),
    gstin: text(raw, "gstin").toUpperCase(),
    udyamNumber: text(raw, "udyamNumber").toUpperCase(),
    otherIdentifier: text(raw, "otherIdentifier"),
    recruiterName: text(raw, "recruiterName"),
    designation: text(raw, "designation"),
    department: text(raw, "department"),
    recruiterPhone: text(raw, "recruiterPhone"),
  };

  if (v.companyName.length < 2 || v.companyName.length > 150) errors.companyName = "Enter the company's legal name (2 to 150 characters).";
  if (v.website && !/^https?:\/\/[^\s]+\.[^\s]+$/i.test(v.website)) errors.website = "Use a full web address starting with https://.";
  if (!EMAIL.test(v.companyEmail)) errors.companyEmail = "Enter a valid company email address.";
  if (!PHONE.test(v.companyPhone)) errors.companyPhone = "Enter a valid official phone number.";
  if (!v.country) errors.country = "Enter the country.";
  if (!v.state) errors.state = "Enter the state.";
  if (!v.city) errors.city = "Enter the city.";
  if (v.address.length < 5) errors.address = "Enter the company address.";
  if (!v.industry) errors.industry = "Enter the industry.";
  if (!v.companySize) errors.companySize = "Choose the company size.";
  if (v.establishedYear !== null && (v.establishedYear < 1800 || v.establishedYear > now.getFullYear())) {
    errors.establishedYear = `Enter a year between 1800 and ${now.getFullYear()}.`;
  }

  if (!(LEGAL_TYPES as readonly string[]).includes(v.legalType)) errors.legalType = "Choose the business registration type.";
  if (v.legalType === "company" && !ID_PATTERNS.cin.test(v.cin)) errors.cin = "A registered company needs a valid CIN (21 characters).";
  if (v.legalType === "llp" && !ID_PATTERNS.llpin.test(v.llpin)) errors.llpin = "An LLP needs a valid LLPIN (format AAA-1234).";
  if (v.legalType === "other" && v.otherIdentifier.length < 3) errors.otherIdentifier = "Enter your registration number and the issuing authority.";
  if (v.gstin && !ID_PATTERNS.gstin.test(v.gstin)) errors.gstin = "GSTIN must be 15 characters in the official format.";
  if (v.udyamNumber && !ID_PATTERNS.udyam.test(v.udyamNumber)) errors.udyamNumber = "Udyam number must look like UDYAM-XX-00-0000000.";

  if (v.recruiterName.length < 2) errors.recruiterName = "Enter the recruiter's full name.";
  if (!v.designation) errors.designation = "Enter the recruiter's designation.";
  if (!v.department) errors.department = "Enter the recruiter's department.";
  if (!PHONE.test(v.recruiterPhone)) errors.recruiterPhone = "Enter a valid phone number for the recruiter.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: v };
}

// Only verified employers can contact candidates or take recruitment actions.
export function canRecruit(status: VerificationStatus): boolean {
  return status === "verified";
}

export const STATUS_COPY: Record<VerificationStatus, string> = {
  pending: "Pending. Your registration is waiting for review.",
  under_review: "Under review. An administrator is checking your documents.",
  verified: "Verified employer.",
  rejected: "Not approved. See the reason below and update your details.",
  suspended: "Suspended. Recruitment activity is paused while this is resolved.",
};
