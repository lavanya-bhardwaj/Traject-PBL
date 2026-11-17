"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { registerEmployer } from "@/app/actions/employer";
import { LEGAL_TYPES, LEGAL_TYPE_LABELS, type LegalType } from "@/lib/employer/rules";
import { DOC_KINDS, DOC_LABELS } from "@/lib/employer/doc-kinds";

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerEmployer, undefined);
  const [legalType, setLegalType] = useState<LegalType>("company");
  const err = (key: string) => state?.errors?.[key];

  return (
    <form action={action} className="section-form" encType="multipart/form-data">
      {state?.message && <p className="alert" role="alert">{state.message}</p>}
      {state?.devVerifyLink && (
        <p className="alert" role="status">
          Development mode: email sending is not configured, so use this link to verify your work email:{" "}
          <Link href={state.devVerifyLink}>Verify my email</Link>
        </p>
      )}

      <fieldset className="reg-section">
        <legend>A. Company details</legend>
        <Text name="companyName" label="Company legal name" required error={err("companyName")} />
        <Text name="website" label="Company website" placeholder="https://" error={err("website")} />
        <Text name="companyEmail" label="Company email address" type="email" required error={err("companyEmail")} />
        <Text name="companyPhone" label="Official business phone number" required error={err("companyPhone")} />
        <div className="reg-grid">
          <Text name="country" label="Country" defaultValue="India" required error={err("country")} />
          <Text name="state" label="State" required error={err("state")} />
          <Text name="city" label="City" required error={err("city")} />
        </div>
        <Text name="address" label="Company address" required error={err("address")} />
        <div className="reg-grid">
          <Text name="industry" label="Industry" required error={err("industry")} />
          <Select name="companySize" label="Company size" error={err("companySize")} options={COMPANY_SIZES} />
          <Text name="establishedYear" label="Year of establishment" type="number" error={err("establishedYear")} />
        </div>
      </fieldset>

      <fieldset className="reg-section">
        <legend>B. Legal identity</legend>
        <p className="hint">Not every business has these identifiers. Fill in only the ones that apply to you.</p>
        <div className="field">
          <label htmlFor="legalType">Business registration type</label>
          <select id="legalType" name="legalType" value={legalType} onChange={(e) => setLegalType(e.target.value as LegalType)}>
            {LEGAL_TYPES.map((type) => (
              <option key={type} value={type}>{LEGAL_TYPE_LABELS[type]}</option>
            ))}
          </select>
          {err("legalType") && <p className="field-error">{err("legalType")}</p>}
        </div>
        {legalType === "company" && (
          <Text name="cin" label="CIN (Corporate Identification Number)" required error={err("cin")} placeholder="U72900PB2015PTC045678" />
        )}
        {legalType === "llp" && <Text name="llpin" label="LLPIN" required error={err("llpin")} placeholder="AAB-1234" />}
        {legalType === "other" && (
          <Text name="otherIdentifier" label="Registration number and issuing authority" required error={err("otherIdentifier")} />
        )}
        <Text name="gstin" label="GSTIN (if registered for GST)" error={err("gstin")} placeholder="03ABCDE1234F1Z5" />
        <Text name="udyamNumber" label="Udyam registration number (if you have one)" error={err("udyamNumber")} placeholder="UDYAM-XX-00-0000000" />
        <p className="hint">
          Identifiers you enter are checked for format only. Traject does not confirm them with government registries yet.
          Your company shows as verified only after an administrator approves it.
        </p>
      </fieldset>

      <fieldset className="reg-section">
        <legend>C. Recruiter details</legend>
        <Text name="recruiterName" label="Recruiter's full name" required error={err("recruiterName")} />
        <div className="reg-grid">
          <Text name="designation" label="Designation" required error={err("designation")} />
          <Text name="department" label="Department" required error={err("department")} />
        </div>
        <Text name="workEmail" label="Work email address (you log in with this)" type="email" required error={err("workEmail")} />
        <Text name="recruiterPhone" label="Official phone number" required error={err("recruiterPhone")} />
        <Text name="password" label="Password" type="password" required error={err("password")} />
        <p className="hint">You must verify your work email before you can use the employer portal.</p>
      </fieldset>

      <fieldset className="reg-section">
        <legend>D. Verification documents</legend>
        <p className="hint">Upload at least one document. PDF, JPG or PNG, up to 2 MB each. Documents are private and only reviewed by Traject administrators.</p>
        {DOC_KINDS.map((kind) => (
          <div className="field" key={kind}>
            <label htmlFor={`doc-${kind}`}>{DOC_LABELS[kind]}</label>
            <input id={`doc-${kind}`} name={`doc-${kind}`} type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" />
            {err(`doc-${kind}`) && <p className="field-error">{err(`doc-${kind}`)}</p>}
          </div>
        ))}
        {err("documents") && <p className="field-error">{err("documents")}</p>}
      </fieldset>

      <button className="btn btn-primary btn-large" disabled={pending} type="submit">
        {pending ? "Submitting…" : "Register your company"}
      </button>
    </form>
  );
}

function Text({
  name,
  label,
  type = "text",
  required,
  defaultValue,
  placeholder,
  error,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
      />
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

function Select({ name, label, options, error }: { name: string; label: string; options: string[]; error?: string }) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <select id={name} name={name} defaultValue="">
        <option value="" disabled>Choose</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
