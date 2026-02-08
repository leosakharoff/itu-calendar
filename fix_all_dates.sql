-- COMPLETE CLEANUP AND RE-INSERT
-- Run this to fix all dates

-- ============================================
-- DELETE ALL EVENTS FOR SWA AND DEVOPS
-- ============================================
DELETE FROM events WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126';
DELETE FROM events WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5';

-- ============================================
-- SOFTWARE ARCHITECTURE (Mondays)
-- Course ID: eeeb2ca3-44e0-4d1f-b212-19ea53d1b126
-- ============================================

-- Lectures on Mondays (M)
INSERT INTO events (course_id, title, date, type) VALUES
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Lecture 1', '2026-01-26', 'lecture'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Lecture 2', '2026-02-02', 'lecture'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Lecture 3', '2026-02-09', 'lecture'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Lecture 4', '2026-02-16', 'lecture'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Lecture 5', '2026-02-23', 'lecture'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Lecture 6', '2026-03-02', 'lecture'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Lecture 7', '2026-03-09', 'lecture'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Lecture 8', '2026-03-16', 'lecture'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Lecture 9', '2026-03-23', 'lecture'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Lecture 10', '2026-03-30', 'lecture'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Lecture 11', '2026-04-06', 'lecture'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Lecture 12', '2026-04-13', 'lecture'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Lecture 13', '2026-04-20', 'lecture'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Lecture 14', '2026-04-27', 'lecture');

-- Deliverables (biweekly on Mondays)
INSERT INTO events (course_id, title, date, type) VALUES
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Deliverable 1 DUE', '2026-02-16', 'deliverable'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Deliverable 2 DUE', '2026-03-02', 'deliverable'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Deliverable 3 DUE', '2026-03-16', 'deliverable'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Deliverable 4 DUE', '2026-03-30', 'deliverable'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Deliverable 5 DUE', '2026-04-13', 'deliverable'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Deliverable 6 DUE', '2026-04-27', 'deliverable'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Deliverable 7 DUE', '2026-05-11', 'deliverable');

-- Presentation
INSERT INTO events (course_id, title, date, type) VALUES
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Presentation', '2026-03-09', 'presentation');

-- Oral Exams (June)
INSERT INTO events (course_id, title, date, type) VALUES
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Oral Exam', '2026-06-23', 'exam'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Oral Exam', '2026-06-24', 'exam'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Oral Exam', '2026-06-25', 'exam'),
('eeeb2ca3-44e0-4d1f-b212-19ea53d1b126', 'Oral Exam', '2026-06-26', 'exam');

-- ============================================
-- DEVOPS (Fridays for lectures, Thursdays for deliverables)
-- Course ID: e69384b2-80de-4e94-96de-cc176c21ecc5
-- ============================================

-- Lectures on Fridays (F)
INSERT INTO events (course_id, title, date, type) VALUES
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
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Lecture 14', '2026-05-01', 'lecture');

-- Weekly deliverables on Thursdays (T)
INSERT INTO events (course_id, title, date, type) VALUES
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
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Weekly 14 DUE', '2026-05-07', 'deliverable');

-- Report submission
INSERT INTO events (course_id, title, date, type) VALUES
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Report DUE', '2026-05-18', 'deliverable');

-- Exams (June)
INSERT INTO events (course_id, title, date, type) VALUES
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Exam', '2026-06-02', 'exam'),
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Exam', '2026-06-03', 'exam'),
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Exam', '2026-06-04', 'exam'),
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Exam', '2026-06-05', 'exam');
