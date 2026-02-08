-- Fix Software Architecture deliverable dates to Sundays (due Sunday 24:00)
-- Course ID: eeeb2ca3-44e0-4d1f-b212-19ea53d1b126

-- D1: Analysis - was Feb 16 (Mon), should be Feb 15 (Sun)
UPDATE events SET date = '2026-02-15' WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126' AND title LIKE 'D1%';

-- D2: Synthesis - was Mar 2 (Mon), should be Mar 1 (Sun)
UPDATE events SET date = '2026-03-01' WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126' AND title LIKE 'D2%';

-- D3: Prototyping - was Mar 16 (Mon), should be Mar 15 (Sun)
UPDATE events SET date = '2026-03-15' WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126' AND title LIKE 'D3%';

-- D4: Architectural Evaluation - was Apr 13 (Mon), should be Apr 12 (Sun)
UPDATE events SET date = '2026-04-12' WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126' AND title LIKE 'D4%';

-- D6: Architecture Recovery - was May 4 (Mon), should be May 3 (Sun)
UPDATE events SET date = '2026-05-03' WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126' AND title LIKE 'D6%';

-- D7: Report Submission - was May 28, check if it should be May 17 (Sun) based on schedule showing week 20
UPDATE events SET date = '2026-05-17' WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126' AND title LIKE 'D7%';
