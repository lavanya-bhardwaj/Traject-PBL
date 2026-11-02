-- Skills a candidate says they have, from a text description. A claim is not a verified level:
-- only passing a skill check creates an assessment, and only assessments feed the scores.
CREATE TABLE skill_claims (
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id    TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    evidence    TEXT NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, skill_id)
);
