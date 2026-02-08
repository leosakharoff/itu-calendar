-- Clean up duplicate exam entries using DISTINCT ON

-- Remove all exam duplicates by keeping only one exam per course per date
WITH duplicates AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY course_id, date, type ORDER BY created_at) as rn
    FROM events
    WHERE type = 'exam'
)
DELETE FROM events
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);
