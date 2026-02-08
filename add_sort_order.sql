-- Add sort_order column to courses table
ALTER TABLE courses ADD COLUMN sort_order INTEGER DEFAULT 0;

-- Set initial sort_order based on current order
UPDATE courses SET sort_order = subquery.row_num - 1
FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY name) as row_num FROM courses) AS subquery
WHERE courses.id = subquery.id;
