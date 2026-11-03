-- Market insight placeholders. Every row says it is illustrative: replace with a cited source before presenting.
-- Safe to re-run: existing rows are left alone.
INSERT INTO role_market (role_id, demand_level, as_of, source_note) VALUES
    ('junior-software-engineer', 'high',   '2026-11-03', 'Illustrative placeholder, not sourced data.'),
    ('data-analyst',             'high',   '2026-11-03', 'Illustrative placeholder, not sourced data.'),
    ('full-stack-developer',     'medium', '2026-11-03', 'Illustrative placeholder, not sourced data.')
ON CONFLICT (role_id) DO NOTHING;

INSERT INTO skill_trends (skill_id, demand_level, trend, as_of, source_note) VALUES
    ('python',          'high',   'rising',  '2026-11-03', 'Illustrative placeholder, not sourced data.'),
    ('javascript',      'high',   'stable',  '2026-11-03', 'Illustrative placeholder, not sourced data.'),
    ('sql',             'high',   'stable',  '2026-11-03', 'Illustrative placeholder, not sourced data.'),
    ('data-analysis',   'high',   'rising',  '2026-11-03', 'Illustrative placeholder, not sourced data.'),
    ('problem-solving', 'medium', 'stable',  '2026-11-03', 'Illustrative placeholder, not sourced data.'),
    ('communication',   'medium', 'stable',  '2026-11-03', 'Illustrative placeholder, not sourced data.')
ON CONFLICT (skill_id) DO NOTHING;
