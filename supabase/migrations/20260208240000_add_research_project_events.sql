-- Add Research Project events
-- Course ID: Research Project (pink) - need to find the ID

-- First, get the Research Project course ID
-- From the app, it should be the one with pink color

-- Research Project events
INSERT INTO events (course_id, title, date, type, notes)
SELECT id, 'Information Meeting', '2026-01-26', 'lecture', 'Aud. 2, 16:15-17:30'
FROM courses WHERE name ILIKE '%Research%' LIMIT 1;

INSERT INTO events (course_id, title, date, type, notes)
SELECT id, 'D1: Group Formation', '2026-02-13', 'deliverable', 'Deadline for creating/joining a group in LearnIT'
FROM courses WHERE name ILIKE '%Research%' LIMIT 1;

INSERT INTO events (course_id, title, date, type, notes)
SELECT id, 'D2: Preliminary Project Statement', '2026-02-20', 'deliverable', 'Deadline for settling Preliminary Project Statement'
FROM courses WHERE name ILIKE '%Research%' LIMIT 1;

INSERT INTO events (course_id, title, date, type, notes)
SELECT id, 'D3: Project Report', '2026-05-15', 'deliverable', 'Deadline for submitting Project Report in LearnIT'
FROM courses WHERE name ILIKE '%Research%' LIMIT 1;
