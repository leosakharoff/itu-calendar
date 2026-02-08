-- Add Computer Systems Performance events
-- Course ID: 18625cb2-1668-46ae-89d8-9670899c0f32
-- Lectures on Wednesdays (O in Danish), 14:15-16:00 in Aud3/2A56
-- Breaks: Mar 25, Apr 1 (Easter), Apr 15

-- Lectures (12 total)
INSERT INTO events (course_id, title, date, type, notes) VALUES
('18625cb2-1668-46ae-89d8-9670899c0f32', 'L1: Intro, Performance Analysis, Experimental Design', '2026-01-28', 'lecture', 'Aud3/2A56, 14:15-16:00'),
('18625cb2-1668-46ae-89d8-9670899c0f32', 'L2: Hardware: Memory Hierarchy & Parallelism', '2026-02-04', 'lecture', 'Aud3/2A56, 14:15-16:00'),
('18625cb2-1668-46ae-89d8-9670899c0f32', 'L3: Profiling', '2026-02-11', 'lecture', 'Aud3/2A56, 14:15-16:00'),
('18625cb2-1668-46ae-89d8-9670899c0f32', 'L4: Queuing Theory, Common Mistakes, Plotting Graphs', '2026-02-18', 'lecture', 'Aud3/2A56, 14:15-16:00'),
('18625cb2-1668-46ae-89d8-9670899c0f32', 'L5: Operating Systems Overview', '2026-02-25', 'lecture', 'Aud3/2A56, 14:15-16:00'),
('18625cb2-1668-46ae-89d8-9670899c0f32', 'L6: Standardized Benchmarks & Benchmarking', '2026-03-04', 'lecture', 'Aud3/2A56, 14:15-16:00'),
('18625cb2-1668-46ae-89d8-9670899c0f32', 'L7: Hardware: Storage Devices', '2026-03-11', 'lecture', 'Aud3/2A56, 14:15-16:00'),
('18625cb2-1668-46ae-89d8-9670899c0f32', 'L8: Guest Lecture - Bjørn', '2026-03-18', 'lecture', 'Aud3/2A56, 14:15-16:00'),
('18625cb2-1668-46ae-89d8-9670899c0f32', 'L9: Hardware: Acceleration & GPUs', '2026-04-08', 'lecture', 'Aud3/2A56, 14:15-16:00'),
('18625cb2-1668-46ae-89d8-9670899c0f32', 'L10: AI Performance', '2026-04-22', 'lecture', 'Aud3/2A56, 14:15-16:00'),
('18625cb2-1668-46ae-89d8-9670899c0f32', 'L11: Cloud', '2026-04-29', 'lecture', 'Aud3/2A56, 14:15-16:00'),
('18625cb2-1668-46ae-89d8-9670899c0f32', 'L12: Guest Lecture - Neil', '2026-05-06', 'lecture', 'Aud3/2A56, 14:15-16:00');

-- Project Presentations
INSERT INTO events (course_id, title, date, type, notes) VALUES
('18625cb2-1668-46ae-89d8-9670899c0f32', 'P1: Project 1 Progress Presentation', '2026-03-04', 'presentation', 'During lecture'),
('18625cb2-1668-46ae-89d8-9670899c0f32', 'P2: Project 2 Progress Presentation', '2026-05-06', 'presentation', 'During lecture');

-- Deliverables
INSERT INTO events (course_id, title, date, type, notes) VALUES
('18625cb2-1668-46ae-89d8-9670899c0f32', 'D1: Final Submission', '2026-05-22', 'deliverable', 'Hard deadline @2pm (SAP)');

-- Oral Exams (June 10-12, 2026)
INSERT INTO events (course_id, title, date, type, notes) VALUES
('18625cb2-1668-46ae-89d8-9670899c0f32', 'Oral Exam', '2026-06-10', 'exam', 'Room 3A12-14, individual'),
('18625cb2-1668-46ae-89d8-9670899c0f32', 'Oral Exam', '2026-06-11', 'exam', 'Room 3A12-14, individual'),
('18625cb2-1668-46ae-89d8-9670899c0f32', 'Oral Exam', '2026-06-12', 'exam', 'Room 3A12-14, individual');
