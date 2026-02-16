-- Enable RLS on courses and events (if not already enabled)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Drop any existing overly-permissive policies
DROP POLICY IF EXISTS "Enable access for authenticated users" ON courses;
DROP POLICY IF EXISTS "Enable access for authenticated users" ON events;
DROP POLICY IF EXISTS "Enable read access for all users" ON courses;
DROP POLICY IF EXISTS "Enable read access for all users" ON events;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON courses;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON events;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON courses;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON events;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON courses;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON events;
DROP POLICY IF EXISTS "Users manage own courses" ON courses;
DROP POLICY IF EXISTS "Users manage own events" ON events;

-- Courses: users can only see and manage their own courses
CREATE POLICY "Users manage own courses" ON courses
  FOR ALL USING (auth.uid() = user_id);

-- Events: users can only see and manage their own events
CREATE POLICY "Users manage own events" ON events
  FOR ALL USING (auth.uid() = user_id);
