-- ============================================================
-- FINAL RLS RESET: Restore Supabase defaults + proper policies
-- ============================================================
-- Previous migrations may have broken the grant chain.
-- This migration resets everything to a known working state.

-- 1. Drop ALL existing policies on courses and events
DROP POLICY IF EXISTS "courses_user_policy" ON courses;
DROP POLICY IF EXISTS "events_user_policy" ON events;
DROP POLICY IF EXISTS "Users manage own courses" ON courses;
DROP POLICY IF EXISTS "Users manage own events" ON events;
DROP POLICY IF EXISTS "courses_owner_access" ON courses;
DROP POLICY IF EXISTS "events_owner_access" ON events;

-- 2. Enable RLS (not FORCE — FORCE blocks even the table owner/service_role)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses NO FORCE ROW LEVEL SECURITY;
ALTER TABLE events NO FORCE ROW LEVEL SECURITY;

-- 3. Restore Supabase default grants
-- Supabase needs both anon and authenticated to have table access.
-- RLS policies will control what each role can actually see.
GRANT ALL ON courses TO anon;
GRANT ALL ON courses TO authenticated;
GRANT ALL ON events TO anon;
GRANT ALL ON events TO authenticated;

-- Grant sequence usage (needed for inserts if there are serial columns)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 4. Create simple, clear RLS policies
-- Authenticated users can do everything with their own data
CREATE POLICY "courses_owner_all" ON courses
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "events_owner_all" ON events
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Anon gets nothing (no policy = no access when RLS is enabled)
-- We explicitly do NOT create any policy for anon.

-- 5. Clean up debug functions (no longer needed)
DROP FUNCTION IF EXISTS debug_auth();
DROP FUNCTION IF EXISTS debug_my_auth();
