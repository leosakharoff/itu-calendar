-- Update all lectures with proper start/end times (2h lecture + 2h exercises = 4h total)
-- and add "2h lecture + 2h exercises" to notes

-- Software Architecture (SWA): 10:00-14:00, ScrollBar
-- Course ID: eeeb2ca3-44e0-4d1f-b212-19ea53d1b126
UPDATE events
SET start_time = '10:00',
    end_time = '14:00',
    notes = 'ScrollBar | 2h lecture + 2h exercises'
WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126'
  AND type = 'lecture';

-- Computer Systems Performance (CSP): 14:00-18:00, Aud3/2A56
-- Course ID: 18625cb2-1668-46ae-89d8-9670899c0f32
UPDATE events
SET start_time = '14:00',
    end_time = '18:00',
    notes = 'Aud3/2A56 | 2h lecture + 2h exercises'
WHERE course_id = '18625cb2-1668-46ae-89d8-9670899c0f32'
  AND type = 'lecture';

-- DevOps: 12:00-16:00, Aud 2 (0A35)
-- Course ID: e69384b2-80de-4e94-96de-cc176c21ecc5
-- Preserve lecturer info from existing notes
UPDATE events
SET start_time = '12:00',
    end_time = '16:00',
    notes = 'Aud 2 | 2h lecture + 2h exercises | ' ||
            CASE
              WHEN notes LIKE '%Helge%Simulator starts%' THEN 'Helge | Simulator starts'
              WHEN notes LIKE '%Mircea%Simulator stops%' THEN 'Mircea | Simulator stops'
              WHEN notes LIKE '%Helge%' THEN 'Helge'
              WHEN notes LIKE '%Mircea%' THEN 'Mircea'
              ELSE ''
            END
WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5'
  AND type = 'lecture';

-- Clean up trailing " | " for DevOps lectures without lecturer info
UPDATE events
SET notes = RTRIM(notes, ' |')
WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5'
  AND type = 'lecture'
  AND notes LIKE '%| ';
