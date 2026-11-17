-- Profile sections. Every field is optional: students complete them gradually.

CREATE TABLE profile_entries (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind         TEXT NOT NULL CHECK (kind IN ('education', 'experience', 'project', 'certification')),
    title        TEXT NOT NULL,
    organization TEXT NOT NULL DEFAULT '',
    period       TEXT NOT NULL DEFAULT '',
    details      TEXT NOT NULL DEFAULT '',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX profile_entries_user_idx ON profile_entries (user_id, kind, created_at);

-- Career interests point at the existing roles, so they connect to the career explorer.
CREATE TABLE career_interests (
    user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id  TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);
