-- Add location column to events table
ALTER TABLE events ADD COLUMN location TEXT;

-- Migrate room/location data from notes into the new location column
-- Pattern: "RoomName | rest of notes..." → location = RoomName, notes = rest

-- Software Architecture (SWA): location = ScrollBar
UPDATE events
SET location = 'ScrollBar',
    notes = NULLIF(TRIM(REGEXP_REPLACE(notes, '^ScrollBar\s*\|\s*', '')), '')
WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126'
  AND type = 'lecture'
  AND notes LIKE 'ScrollBar%';

-- Computer Systems Performance (CSP): location = Aud3/2A56
UPDATE events
SET location = 'Aud3/2A56',
    notes = NULLIF(TRIM(REGEXP_REPLACE(notes, '^Aud3/2A56\s*\|\s*', '')), '')
WHERE course_id = '18625cb2-1668-46ae-89d8-9670899c0f32'
  AND type = 'lecture'
  AND notes LIKE 'Aud3/2A56%';

-- DevOps: location = Aud 2
UPDATE events
SET location = 'Aud 2',
    notes = NULLIF(TRIM(REGEXP_REPLACE(notes, '^Aud 2\s*\|\s*', '')), '')
WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5'
  AND type = 'lecture'
  AND notes LIKE 'Aud 2%';

-- Now update SWA lectures: new time 16:00-20:00 and room 4A14
UPDATE events
SET start_time = '16:00',
    end_time = '20:00',
    location = '4A14'
WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126'
  AND type = 'lecture';
