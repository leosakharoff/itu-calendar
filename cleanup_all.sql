-- COMPLETE CLEANUP - Delete ALL events and start fresh

DELETE FROM events;

-- ============================================
-- SOFTWARE ARCHITECTURE (Green) - Mondays
-- Course ID: eeeb2ca3-44e0-4d1f-b212-19ea53d1b126
-- ============================================

INSERT INTO events (course_id, title, date, type, notes) VALUES
-- Lectures
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
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'L14: Legacy systems & Ethics', '2026-05-04', 'lecture', 'Teacher: Konstantinos'),
-- Deliverables
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', '0. Project groups', '2026-01-26', 'deliverable', 'Group formation'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', '1. Analysis', '2026-02-16', 'deliverable', 'Group deliverable'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', '2. Synthesis', '2026-03-02', 'deliverable', 'Group deliverable'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', '3. Prototyping', '2026-03-16', 'deliverable', 'Group deliverable'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', '4. Architectural Evaluation', '2026-04-13', 'deliverable', 'Group deliverable'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', '6. Architecture Recovery', '2026-05-04', 'deliverable', 'Individual deliverable'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Report Submission', '2026-05-28', 'deliverable', 'Final report deadline'),
-- Reviews/Presentations
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Review deliverable 1', '2026-02-23', 'presentation', 'Analysis review'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Review deliverable 2', '2026-03-09', 'presentation', 'Synthesis review'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Review deliverable 3', '2026-03-23', 'presentation', 'Prototyping review'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Review deliverable 4', '2026-04-20', 'presentation', 'Evaluation review'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Review Architecture Recovery', '2026-05-18', 'presentation', 'Individual review'),
-- Exams
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Oral Exam', '2026-06-22', 'exam', NULL),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Oral Exam', '2026-06-23', 'exam', NULL),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Oral Exam', '2026-06-24', 'exam', NULL),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Oral Exam', '2026-06-25', 'exam', NULL),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Oral Exam', '2026-06-26', 'exam', NULL);

-- ============================================
-- DEVOPS (Blue) - Fridays for lectures, Thursdays for deliverables
-- Course ID: e69384b2-80de-4e94-96de-cc176c21ecc5
-- ============================================

INSERT INTO events (course_id, title, date, type) VALUES
-- Lectures on Fridays
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Lecture 1', '2026-01-30', 'lecture'),
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Lecture 2', '2026-02-06', 'lecture'),
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Lecture 3', '2026-02-13', 'lecture'),
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Lecture 4', '2026-02-20', 'lecture'),
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Lecture 5', '2026-02-27', 'lecture'),
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Lecture 6', '2026-03-06', 'lecture'),
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Lecture 7', '2026-03-13', 'lecture'),
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Lecture 8', '2026-03-20', 'lecture'),
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Lecture 9', '2026-03-27', 'lecture'),
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Lecture 10', '2026-04-03', 'lecture'),
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Lecture 11', '2026-04-10', 'lecture'),
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Lecture 12', '2026-04-17', 'lecture'),
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Lecture 13', '2026-04-24', 'lecture'),
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Lecture 14', '2026-05-01', 'lecture'),
-- Weekly deliverables on Thursdays
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Weekly 1 DUE', '2026-02-05', 'deliverable'),
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Weekly 2 DUE', '2026-02-12', 'deliverable'),
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Weekly 3 DUE', '2026-02-19', 'deliverable'),
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Weekly 4 DUE', '2026-02-26', 'deliverable'),
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Weekly 5 DUE', '2026-03-05', 'deliverable'),
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Weekly 6 DUE', '2026-03-12', 'deliverable'),
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Weekly 7 DUE', '2026-03-19', 'deliverable'),
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Weekly 8 DUE', '2026-03-26', 'deliverable'),
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Weekly 9 DUE', '2026-04-02', 'deliverable'),
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Weekly 10 DUE', '2026-04-09', 'deliverable'),
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Weekly 11 DUE', '2026-04-16', 'deliverable'),
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Weekly 12 DUE', '2026-04-23', 'deliverable'),
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Weekly 13 DUE', '2026-04-30', 'deliverable'),
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Weekly 14 DUE', '2026-05-07', 'deliverable'),
-- Report and Exams
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Report DUE', '2026-05-18', 'deliverable'),
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Exam', '2026-06-02', 'exam'),
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Exam', '2026-06-03', 'exam'),
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Exam', '2026-06-04', 'exam'),
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Exam', '2026-06-05', 'exam');

-- ============================================
-- HOLIDAYS
-- ============================================

INSERT INTO events (course_id, title, date, type, notes) VALUES
(NULL, 'Nytårsdag', '2026-01-01', 'holiday', 'New Year'),
(NULL, 'Skærtorsdag', '2026-04-02', 'holiday', 'Maundy Thursday'),
(NULL, 'Langfredag', '2026-04-03', 'holiday', 'Good Friday'),
(NULL, 'Påskedag', '2026-04-05', 'holiday', 'Easter Sunday'),
(NULL, '2. påskedag', '2026-04-06', 'holiday', 'Easter Monday'),
(NULL, 'Kristi himmelfartsdag', '2026-05-14', 'holiday', 'Ascension Day'),
(NULL, 'Pinsedag', '2026-05-24', 'holiday', 'Whit Sunday'),
(NULL, '2. pinsedag', '2026-05-25', 'holiday', 'Whit Monday'),
(NULL, 'Grundlovsdag', '2026-06-05', 'holiday', 'Constitution Day'),
(NULL, 'Første maj', '2026-05-01', 'holiday', 'May Day');
