// Document kinds and labels. Pure constants, so client components can import them safely.
export const DOC_MAX_BYTES = 2 * 1024 * 1024;

export const DOC_KINDS = [
  "incorporation",
  "business_registration",
  "gst_certificate",
  "other",
] as const;
export type DocKind = (typeof DOC_KINDS)[number];

export const DOC_LABELS: Record<DocKind, string> = {
  incorporation: "Certificate of Incorporation",
  business_registration: "Business registration certificate",
  gst_certificate: "GST registration certificate",
  other: "Other supporting document",
};
