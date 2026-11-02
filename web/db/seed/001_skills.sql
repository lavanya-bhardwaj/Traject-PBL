-- Starter skill taxonomy. Safe to re-run: existing rows are left alone.
INSERT INTO skills (id, name, category) VALUES
    ('python',           'Python',           'Programming'),
    ('javascript',       'JavaScript',       'Programming'),
    ('sql',              'SQL',              'Data'),
    ('data-analysis',    'Data Analysis',    'Data'),
    ('problem-solving',  'Problem Solving',  'Professional'),
    ('communication',    'Written Communication', 'Professional')
ON CONFLICT (id) DO NOTHING;
