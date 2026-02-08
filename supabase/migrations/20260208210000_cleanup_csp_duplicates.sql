-- Clean up duplicate CSP events
-- Remove old generic lecture entries that were replaced with detailed topics
-- Course ID: 18625cb2-1668-46ae-89d8-9670899c0f32

-- Delete old generic lectures (L1, L2, etc. without topics)
DELETE FROM events
WHERE course_id = '18625cb2-1668-46ae-89d8-9670899c0f32'
AND type = 'lecture'
AND title ~ '^L[0-9]+$';

-- Remove separate presentation events - combine into lecture notes instead
DELETE FROM events
WHERE course_id = '18625cb2-1668-46ae-89d8-9670899c0f32'
AND type = 'presentation';

-- Update L6 notes to mention Project 1 presentation
UPDATE events
SET notes = 'Aud3/2A56, 14:15-16:00 | Project 1 Progress Presentation'
WHERE course_id = '18625cb2-1668-46ae-89d8-9670899c0f32'
AND title LIKE 'L6:%';

-- Update L12 notes to mention Project 2 presentation
UPDATE events
SET notes = 'Aud3/2A56, 14:15-16:00 | Project 2 Progress Presentation'
WHERE course_id = '18625cb2-1668-46ae-89d8-9670899c0f32'
AND title LIKE 'L12:%';
