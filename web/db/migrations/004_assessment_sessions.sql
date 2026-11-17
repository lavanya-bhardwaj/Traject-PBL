-- One in-progress adaptive check per user per skill. Deleted when the check finishes.

CREATE TABLE assessment_sessions (
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id   TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    current_id TEXT NOT NULL,
    difficulty SMALLINT NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
    asked      TEXT[] NOT NULL DEFAULT '{}',
    correct    SMALLINT NOT NULL DEFAULT 0 CHECK (correct >= 0),
    PRIMARY KEY (user_id, skill_id)
);
