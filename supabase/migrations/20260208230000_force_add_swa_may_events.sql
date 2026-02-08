-- Force add missing Software Architecture events for May 2026
-- Course ID: eeeb2ca3-44e0-4d1f-b212-19ea53d1b126

-- Delete any existing May events for SWA that might be incorrectly dated
DELETE FROM events
WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126'
AND (title LIKE 'L14%' OR title LIKE 'D6%' OR title LIKE 'D7%' OR title LIKE 'R6%');

-- L14: Legacy systems & Ethics (May 4, Monday)
INSERT INTO events (course_id, title, date, type, notes)
VALUES ('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'L14: Legacy systems & Ethics', '2026-05-04', 'lecture', 'ScrollBar, 10:15-12:00');

-- D6: Architecture Recovery (May 3, Sunday)
INSERT INTO events (course_id, title, date, type, notes)
VALUES ('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'D6: Architecture Recovery', '2026-05-03', 'deliverable', 'Due Sunday 24:00');

-- R6: Recovery review (May 17, Sunday)
INSERT INTO events (course_id, title, date, type, notes)
VALUES ('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'R6: Recovery review', '2026-05-17', 'presentation', 'Peer review');

-- D7: Report Submission (May 17, Sunday)
INSERT INTO events (course_id, title, date, type, notes)
VALUES ('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'D7: Report Submission', '2026-05-17', 'deliverable', 'Final report due Sunday 24:00');
