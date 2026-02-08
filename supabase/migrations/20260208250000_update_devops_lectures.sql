-- Update DevOps lecture titles with topics
-- Course ID: e69384b2-80de-4e94-96de-cc176c21ecc5
-- Lectures on Fridays 12:00-14:00, Aud 2 (0A35)

-- L1: Jan 30 - Project start, SSH, SCP, Bash
UPDATE events SET title = 'L1: Project start, SSH, SCP, Bash', notes = 'Aud 2, 12:00-14:00 | Helge'
WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'L1';

-- L2: Feb 6 - Containerization with Docker
UPDATE events SET title = 'L2: Containerization with Docker', notes = 'Aud 2, 12:00-14:00 | Helge'
WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'L2';

-- L3: Feb 13 - Provision of VMs
UPDATE events SET title = 'L3: Provision of VMs (Vagrant, DigitalOcean)', notes = 'Aud 2, 12:00-14:00 | Helge'
WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'L3';

-- L4: Feb 20 - Guest Lecture + CI/CD
UPDATE events SET title = 'L4: Guest Lecture (Eficode) + CI/CD', notes = 'Aud 2, 12:00-14:00 | Helge'
WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'L4';

-- L5: Feb 27 - DevOps & Configuration Management
UPDATE events SET title = 'L5: DevOps & Configuration Management', notes = 'Aud 2, 12:00-14:00 | Helge | Simulator starts'
WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'L5';

-- L6: Mar 6 - Monitoring
UPDATE events SET title = 'L6: Monitoring (Prometheus, Grafana)', notes = 'Aud 2, 12:00-14:00 | Helge'
WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'L6';

-- L7: Mar 13 - Software Quality & Technical Debt
UPDATE events SET title = 'L7: Software Quality & Technical Debt', notes = 'Aud 2, 12:00-14:00 | Helge'
WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'L7';

-- L8: Mar 20 - Logging & Log Analysis
UPDATE events SET title = 'L8: Logging & Log Analysis', notes = 'Aud 2, 12:00-14:00 | Mircea'
WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'L8';

-- L9: Mar 27 - Availability
UPDATE events SET title = 'L9: Availability', notes = 'Aud 2, 12:00-14:00 | Mircea'
WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'L9';

-- Easter break Apr 3 - no lecture

-- L10: Apr 10 - TLS Tutorial
UPDATE events SET title = 'L10: TLS Tutorial', notes = 'Aud 2, 12:00-14:00 | Mircea'
WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'L10';

-- L11: Apr 17 - Security
UPDATE events SET title = 'L11: Security', notes = 'Aud 2, 12:00-14:00 | Mircea'
WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'L11';

-- L12: Apr 24 - Infrastructure as Code
UPDATE events SET title = 'L12: Infrastructure as Code', notes = 'Aud 2, 12:00-14:00 | Mircea'
WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'L12';

-- L13: May 1 - Guest Lecture (Kubernetes)
UPDATE events SET title = 'L13: Guest Lecture (Kubernetes) + Documentation', notes = 'Aud 2, 12:00-14:00 | Mircea | Simulator stops'
WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'L13';

-- L14: May 8 - Exam prep
UPDATE events SET title = 'L14: Exam prep, Thesis topics, Evaluation', notes = 'Aud 2, 12:00-14:00 | Helge'
WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'L14';

-- Update D15 (Report) with correct deadline
UPDATE events SET title = 'D15: Report Submission', date = '2026-05-18', notes = 'Deadline 14:00 via WISEflow'
WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'D15: Report';

-- Add exam period
INSERT INTO events (course_id, title, date, type, notes) VALUES
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Exam', '2026-06-01', 'exam', 'Exam period Jun 1-4'),
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Exam', '2026-06-02', 'exam', 'Exam period Jun 1-4'),
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Exam', '2026-06-03', 'exam', 'Exam period Jun 1-4'),
('e69384b2-80de-4e94-96de-cc176c21ecc5', 'Exam', '2026-06-04', 'exam', 'Exam period Jun 1-4');
