-- First, drop ALL existing policies on courses and events to start clean
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'courses' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON courses', pol.policyname);
  END LOOP;

  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'events' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON events', pol.policyname);
  END LOOP;
END $$;

-- Force enable RLS (FORCE means even table owners are subject to RLS)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses FORCE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE events FORCE ROW LEVEL SECURITY;

-- Create restrictive policies: only owner can access their own data
CREATE POLICY "courses_user_policy" ON courses
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "events_user_policy" ON events
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
