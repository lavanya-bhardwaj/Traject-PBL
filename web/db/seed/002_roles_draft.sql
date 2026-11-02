-- DRAFT role requirements for development. Levels and weights are placeholders to be
-- reviewed by the team before any demo. Safe to re-run.
INSERT INTO roles (id, title, description) VALUES
    ('data-analyst', 'Data Analyst', 'Turns data into reports and decisions.'),
    ('backend-developer', 'Backend Developer', 'Builds the server side of web applications.'),
    ('business-analyst', 'Business Analyst', 'Connects business needs with data and clear requirements.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO role_skills (role_id, skill_id, required_level, weight) VALUES
    ('data-analyst', 'sql', 4, 2),
    ('data-analyst', 'data-analysis', 4, 2),
    ('data-analyst', 'python', 3, 1),
    ('data-analyst', 'communication', 3, 1),
    ('backend-developer', 'python', 4, 2),
    ('backend-developer', 'sql', 3, 2),
    ('backend-developer', 'problem-solving', 3, 1),
    ('business-analyst', 'communication', 4, 2),
    ('business-analyst', 'data-analysis', 3, 2),
    ('business-analyst', 'sql', 3, 1),
    ('business-analyst', 'problem-solving', 3, 1)
ON CONFLICT (role_id, skill_id) DO NOTHING;
