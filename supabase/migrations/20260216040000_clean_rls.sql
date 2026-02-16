-- Clean slate: drop all existing policies
DROP POLICY IF EXISTS "courses_user_policy" ON courses;
DROP POLICY IF EXISTS "events_user_policy" ON events;
DROP POLICY IF EXISTS "Users manage own courses" ON courses;
DROP POLICY IF EXISTS "Users manage own events" ON events;

-- Ensure RLS is enabled (not forced - Supabase PostgREST uses authenticated role, not owner)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policies scoped to authenticated role only
CREATE POLICY "courses_owner_access" ON courses
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "events_owner_access" ON events
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Also need to explicitly deny anon access (Supabase grants anon role access by default)
-- By having RLS enabled with NO policy for anon, anon gets nothing. But let's be explicit:
-- Revoke direct table access for anon (RLS policies only grant to authenticated)
REVOKE ALL ON courses FROM anon;
REVOKE ALL ON events FROM anon;

-- Re-grant SELECT for anon so PostgREST can connect, but RLS will block (no policy for anon)
GRANT SELECT ON courses TO anon;
GRANT SELECT ON events TO anon;
