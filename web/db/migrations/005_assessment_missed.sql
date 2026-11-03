-- Keep the question IDs a candidate got wrong, so the result page can show areas to improve.

ALTER TABLE assessment_sessions ADD COLUMN missed TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE assessments ADD COLUMN missed TEXT[] NOT NULL DEFAULT '{}';
