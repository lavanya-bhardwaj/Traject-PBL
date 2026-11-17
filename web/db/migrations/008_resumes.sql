-- The student's current uploaded resume. One row per student; uploading again replaces it.
CREATE TABLE resumes (
    user_id       UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    original_name TEXT NOT NULL,
    mime_type     TEXT NOT NULL,
    size_bytes    INTEGER NOT NULL CHECK (size_bytes > 0),
    storage_path  TEXT NOT NULL,
    uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
