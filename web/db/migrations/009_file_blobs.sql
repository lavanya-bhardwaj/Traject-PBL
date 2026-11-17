-- Uploaded file bytes live in the database. Serverless hosts such as Vercel have no writable,
-- persistent disk, so files written to the project folder fail or vanish between requests.
-- resumes.storage_path and employer_documents.storage_path are keys into this table.
CREATE TABLE file_blobs (
    storage_path TEXT PRIMARY KEY,
    bytes        BYTEA NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
