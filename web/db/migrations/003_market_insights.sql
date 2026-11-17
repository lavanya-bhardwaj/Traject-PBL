-- Market insights: demand and trend per role and per skill, with the date and source of each row.

CREATE TABLE role_market (
    role_id      TEXT PRIMARY KEY REFERENCES roles(id) ON DELETE CASCADE,
    demand_level TEXT NOT NULL CHECK (demand_level IN ('low', 'medium', 'high')),
    as_of        DATE NOT NULL,
    source_note  TEXT NOT NULL
);

CREATE TABLE skill_trends (
    skill_id     TEXT PRIMARY KEY REFERENCES skills(id) ON DELETE CASCADE,
    demand_level TEXT NOT NULL CHECK (demand_level IN ('low', 'medium', 'high')),
    trend        TEXT NOT NULL CHECK (trend IN ('rising', 'stable', 'falling')),
    as_of        DATE NOT NULL,
    source_note  TEXT NOT NULL
);
