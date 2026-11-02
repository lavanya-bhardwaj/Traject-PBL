-- Core schema for the Traject competency platform.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT NOT NULL UNIQUE,
    name          TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    headline      TEXT NOT NULL DEFAULT '',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
    id         TEXT PRIMARY KEY,
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL
);

-- Skills are the shared vocabulary for assessments, roles and courses.
CREATE TABLE skills (
    id       TEXT PRIMARY KEY,
    name     TEXT NOT NULL,
    category TEXT NOT NULL
);

-- A role lists the skills it needs, the minimum level (1-5) and an importance weight.
CREATE TABLE roles (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT ''
);

CREATE TABLE role_skills (
    role_id        TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    skill_id       TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    required_level SMALLINT NOT NULL CHECK (required_level BETWEEN 1 AND 5),
    weight         NUMERIC(4,2) NOT NULL CHECK (weight > 0),
    PRIMARY KEY (role_id, skill_id)
);

CREATE TABLE courses (
    id       TEXT PRIMARY KEY,
    title    TEXT NOT NULL,
    provider TEXT NOT NULL,
    url      TEXT NOT NULL
);

CREATE TABLE course_skills (
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    skill_id  TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, skill_id)
);

-- Each row is one completed skill check. The latest row per skill is the candidate's current level.
CREATE TABLE assessments (
    id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    correct  SMALLINT NOT NULL CHECK (correct >= 0),
    total    SMALLINT NOT NULL CHECK (total > 0 AND correct <= total),
    level    SMALLINT NOT NULL CHECK (level BETWEEN 1 AND 5),
    taken_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX assessments_user_skill_idx ON assessments (user_id, skill_id, taken_at DESC);

CREATE TABLE connections (
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    addressee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status       TEXT NOT NULL CHECK (status IN ('pending', 'accepted')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (requester_id, addressee_id),
    CHECK (requester_id <> addressee_id)
);
