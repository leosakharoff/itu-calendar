-- Fix Software Architecture review dates to Sundays (same as deliverable due dates)
-- Reviews happen the week after deliverable is due, but let's put them on Sunday too
-- Course ID: eeeb2ca3-44e0-4d1f-b212-19ea53d1b126

-- R1: Analysis review - was Feb 23 (Mon), should be Feb 22 (Sun)
UPDATE events SET date = '2026-02-22' WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126' AND title LIKE 'R1%';

-- R2: Synthesis review - was Mar 9 (Mon), should be Mar 8 (Sun)
UPDATE events SET date = '2026-03-08' WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126' AND title LIKE 'R2%';

-- R3: Prototyping review - was Mar 23 (Mon), should be Mar 22 (Sun)
UPDATE events SET date = '2026-03-22' WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126' AND title LIKE 'R3%';

-- R4: Evaluation review - was Apr 20 (Mon), should be Apr 19 (Sun)
UPDATE events SET date = '2026-04-19' WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126' AND title LIKE 'R4%';

-- R6: Recovery review - was May 18 (Mon), should be May 17 (Sun)
UPDATE events SET date = '2026-05-17' WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126' AND title LIKE 'R6%';
