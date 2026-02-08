-- Fix Software Architecture schedule based on actual course schedule
-- Course ID: eeeb2ca3-44e0-4d1f-b212-19ea53d1b126

-- Delete all existing SWA events
DELETE FROM events WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126';

-- Lectures (with proper titles from schedule)
INSERT INTO events (course_id, title, date, type, notes) VALUES
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'L1: Introduction & architectural attributes', '2026-01-26', 'lecture', 'Teacher: Konstantinos'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'L2: Architectural description', '2026-02-02', 'lecture', 'Teacher: Konstantinos'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'L3: Architectural synthesis', '2026-02-09', 'lecture', 'Teacher: Konstantinos'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'L4: Detailed design', '2026-02-16', 'lecture', 'Teacher: Konstantinos'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'L5: Architectural prototyping', '2026-02-23', 'lecture', 'Teacher: Konstantinos'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'L6: Agile architecture', '2026-03-02', 'lecture', 'Teacher: Konstantinos'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'L7: Architectural evaluation', '2026-03-09', 'lecture', 'Teacher: Konstantinos'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'L8: Software ecosystems', '2026-03-16', 'lecture', 'Teacher: Konstantinos'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'L9: Guest lecture', '2026-03-23', 'lecture', 'Teacher: Konstantinos'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'L10: Architectural reconstruction (1)', '2026-03-30', 'lecture', 'Teacher: Mircea'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'L11: Architectural reconstruction (2)', '2026-04-13', 'lecture', 'Teacher: Mircea'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'L12: Architectural reconstruction (3)', '2026-04-20', 'lecture', 'Teacher: Mircea'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'L13: Architectural reconstruction (4)', '2026-04-27', 'lecture', 'Teacher: Mircea'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'L14: Legacy systems & Ethics & Closure', '2026-05-04', 'lecture', 'Teacher: Konstantinos');

-- Deliverables (from schedule - note dates are when they are due)
INSERT INTO events (course_id, title, date, type, notes) VALUES
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', '0. Project groups', '2026-01-26', 'deliverable', 'Group formation'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', '1. Analysis', '2026-02-16', 'deliverable', 'Group deliverable'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', '2. Synthesis', '2026-03-02', 'deliverable', 'Group deliverable'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', '3. Prototyping', '2026-03-16', 'deliverable', 'Group deliverable'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', '4. Architectural Evaluation', '2026-04-13', 'deliverable', 'Group deliverable'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', '6. Architecture Recovery', '2026-05-04', 'deliverable', 'Individual deliverable'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Report Submission', '2026-05-28', 'deliverable', 'Final report deadline');

-- Presentations/Reviews
INSERT INTO events (course_id, title, date, type, notes) VALUES
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Review deliverable 1', '2026-02-23', 'presentation', 'Analysis student presentation'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Review deliverable 2', '2026-03-09', 'presentation', 'Synthesis student presentation'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Review deliverable 3', '2026-03-23', 'presentation', 'Prototyping student presentation'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Review deliverable 4', '2026-04-20', 'presentation', 'Evaluation student presentation'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Review Architecture Recovery', '2026-05-18', 'presentation', 'Individual review');

-- Exams (June 22-26, 2026)
INSERT INTO events (course_id, title, date, type) VALUES
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Oral Exam', '2026-06-22', 'exam'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Oral Exam', '2026-06-23', 'exam'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Oral Exam', '2026-06-24', 'exam'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Oral Exam', '2026-06-25', 'exam'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Oral Exam', '2026-06-26', 'exam');

-- Easter holiday (Week 15 - April 6, 2026)
INSERT INTO events (course_id, title, date, type, notes) VALUES
(NULL, 'Easter holidays', '2026-04-06', 'holiday', 'No lecture this week');
