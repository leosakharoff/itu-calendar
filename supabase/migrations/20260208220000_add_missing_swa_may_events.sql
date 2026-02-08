-- Add missing Software Architecture events for May 2026
-- Course ID: eeeb2ca3-44e0-4d1f-b212-19ea53d1b126

-- Check if L14 exists, if not insert it
INSERT INTO events (course_id, title, date, type, notes)
SELECT 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'L14: Legacy systems & Ethics', '2026-05-04', 'lecture', 'ScrollBar, 10:15-12:00'
WHERE NOT EXISTS (
    SELECT 1 FROM events
    WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126'
    AND title LIKE 'L14%'
);

-- D6: Architecture Recovery (May 3, Sunday)
INSERT INTO events (course_id, title, date, type, notes)
SELECT 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'D6: Architecture Recovery', '2026-05-03', 'deliverable', 'Due Sunday 24:00'
WHERE NOT EXISTS (
    SELECT 1 FROM events
    WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126'
    AND title LIKE 'D6%'
);

-- R6: Recovery review (May 17, Sunday - week after)
INSERT INTO events (course_id, title, date, type, notes)
SELECT 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'R6: Recovery review', '2026-05-17', 'presentation', 'Peer review'
WHERE NOT EXISTS (
    SELECT 1 FROM events
    WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126'
    AND title LIKE 'R6%'
);

-- D7: Report Submission (May 17, Sunday)
INSERT INTO events (course_id, title, date, type, notes)
SELECT 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'D7: Report Submission', '2026-05-17', 'deliverable', 'Final report due Sunday 24:00'
WHERE NOT EXISTS (
    SELECT 1 FROM events
    WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126'
    AND title LIKE 'D7%'
);
