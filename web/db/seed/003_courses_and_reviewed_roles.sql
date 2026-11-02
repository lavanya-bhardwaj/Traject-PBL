-- Courses supplied by the team, and the reviewed role set that replaces the drafts.
-- Safe to re-run. Roles not in the reviewed set are removed.

INSERT INTO courses (id, title, provider, url) VALUES
    ('python-everybody-coursera', 'Programming for Everybody (Getting Started with Python)', 'Coursera', 'https://www.coursera.org/learn/python'),
    ('python-cs-nptel', 'Introduction to Computer Science and Programming Using Python', 'NPTEL', 'https://onlinecourses.nptel.ac.in/'),
    ('javascript-algorithms-skillindia', 'JavaScript Algorithms and Data Structures', 'Skill India', 'https://www.skillindiadigital.gov.in/'),
    ('sql-intro-coursera', 'Introduction to Databases and SQL', 'Coursera', 'https://www.coursera.org/learn/sql-databases'),
    ('data-analysis-python-nptel', 'Data Analysis with Python', 'NPTEL', 'https://onlinecourses.nptel.ac.in/'),
    ('communication-software-skillindia', 'Professional Communication for Software Engineers', 'Skill India', 'https://www.skillindiadigital.gov.in/'),
    ('data-analysis-pandas-coursera', 'Data Analysis with Python and Pandas', 'Coursera', 'https://www.coursera.org/learn/data-analysis-with-python'),
    ('problem-solving-nptel', 'Introduction to Problem Solving and Programming', 'NPTEL', 'https://onlinecourses.nptel.ac.in/'),
    ('communication-soft-skills-nptel', 'Soft Skills and Business Communication', 'NPTEL', 'https://onlinecourses.nptel.ac.in/'),
    ('javascript-modern-skillindia', 'Modern JavaScript: From Novice to Ninja', 'Skill India', 'https://www.skillindiadigital.gov.in/'),
    ('big-data-sql-coursera', 'Managing Big Data with SQL and SQLite', 'Coursera', 'https://www.coursera.org/learn/sql-databases')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, provider = EXCLUDED.provider, url = EXCLUDED.url;

DELETE FROM course_skills WHERE course_id IN (
    'python-everybody-coursera', 'python-cs-nptel', 'javascript-algorithms-skillindia', 'sql-intro-coursera',
    'data-analysis-python-nptel', 'communication-software-skillindia', 'data-analysis-pandas-coursera',
    'problem-solving-nptel', 'communication-soft-skills-nptel', 'javascript-modern-skillindia', 'big-data-sql-coursera');

INSERT INTO course_skills (course_id, skill_id) VALUES
    ('python-everybody-coursera', 'python'), ('python-everybody-coursera', 'problem-solving'),
    ('python-cs-nptel', 'python'), ('python-cs-nptel', 'problem-solving'),
    ('javascript-algorithms-skillindia', 'javascript'), ('javascript-algorithms-skillindia', 'problem-solving'),
    ('sql-intro-coursera', 'sql'),
    ('data-analysis-python-nptel', 'data-analysis'), ('data-analysis-python-nptel', 'python'),
    ('communication-software-skillindia', 'communication'), ('communication-software-skillindia', 'problem-solving'),
    ('data-analysis-pandas-coursera', 'data-analysis'), ('data-analysis-pandas-coursera', 'python'),
    ('problem-solving-nptel', 'problem-solving'),
    ('communication-soft-skills-nptel', 'communication'),
    ('javascript-modern-skillindia', 'javascript'),
    ('big-data-sql-coursera', 'sql')
ON CONFLICT DO NOTHING;

-- Reviewed roles. Only these three remain.
DELETE FROM roles WHERE id NOT IN ('junior-software-engineer', 'data-analyst', 'full-stack-developer');

INSERT INTO roles (id, title, description) VALUES
    ('junior-software-engineer', 'Junior Software Engineer', 'Builds and maintains features under guidance.'),
    ('data-analyst', 'Data Analyst', 'Turns data into reports and decisions.'),
    ('full-stack-developer', 'Full Stack Developer', 'Builds both the interface and the server side of web applications.')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

DELETE FROM role_skills WHERE role_id IN ('junior-software-engineer', 'data-analyst', 'full-stack-developer');

INSERT INTO role_skills (role_id, skill_id, required_level, weight) VALUES
    ('junior-software-engineer', 'python', 2, 1),
    ('junior-software-engineer', 'javascript', 2, 1),
    ('junior-software-engineer', 'sql', 1, 1),
    ('junior-software-engineer', 'problem-solving', 2, 1),
    ('junior-software-engineer', 'communication', 2, 1),
    ('data-analyst', 'python', 2, 1),
    ('data-analyst', 'sql', 2, 1),
    ('data-analyst', 'data-analysis', 3, 2),
    ('data-analyst', 'problem-solving', 2, 1),
    ('data-analyst', 'communication', 2, 1),
    ('full-stack-developer', 'python', 2, 1),
    ('full-stack-developer', 'javascript', 3, 2),
    ('full-stack-developer', 'sql', 2, 1),
    ('full-stack-developer', 'problem-solving', 3, 2),
    ('full-stack-developer', 'communication', 2, 1);
