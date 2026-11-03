-- Employer accounts, company verification, documents, email verification, shortlists.
-- Roles are enforced by the server. A student account never gets employer or admin access.

ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'employer', 'admin'));
ALTER TABLE users ADD COLUMN discoverable BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMPTZ;

CREATE TABLE employers (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    employer_code      TEXT NOT NULL UNIQUE,
    company_name       TEXT NOT NULL,
    website            TEXT NOT NULL DEFAULT '',
    company_email      TEXT NOT NULL DEFAULT '',
    company_phone      TEXT NOT NULL DEFAULT '',
    country            TEXT NOT NULL DEFAULT '',
    state              TEXT NOT NULL DEFAULT '',
    city               TEXT NOT NULL DEFAULT '',
    address            TEXT NOT NULL DEFAULT '',
    industry           TEXT NOT NULL DEFAULT '',
    company_size       TEXT NOT NULL DEFAULT '',
    established_year   INTEGER,
    legal_type         TEXT NOT NULL CHECK (legal_type IN ('company', 'llp', 'proprietorship', 'partnership', 'other')),
    cin                TEXT NOT NULL DEFAULT '',
    llpin              TEXT NOT NULL DEFAULT '',
    gstin              TEXT NOT NULL DEFAULT '',
    udyam_number       TEXT NOT NULL DEFAULT '',
    other_identifier   TEXT NOT NULL DEFAULT '',
    recruiter_name     TEXT NOT NULL,
    designation        TEXT NOT NULL DEFAULT '',
    department         TEXT NOT NULL DEFAULT '',
    recruiter_phone    TEXT NOT NULL DEFAULT '',
    status             TEXT NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending', 'under_review', 'verified', 'rejected', 'suspended')),
    rejection_reason   TEXT NOT NULL DEFAULT '',
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE employer_documents (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id   UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
    kind          TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type     TEXT NOT NULL,
    size_bytes    INTEGER NOT NULL CHECK (size_bytes > 0),
    storage_path  TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Email verification tokens are stored as hashes, never as plain text.
CREATE TABLE email_tokens (
    token_hash  TEXT PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ
);

CREATE TABLE verification_audit_log (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id  UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
    admin_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    action       TEXT NOT NULL,
    note         TEXT NOT NULL DEFAULT '',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shortlists belong to one employer. Other employers cannot read them.
CREATE TABLE candidate_shortlists (
    employer_id   UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
    candidate_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (employer_id, candidate_id)
);
