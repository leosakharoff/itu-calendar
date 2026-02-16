-- Create a debug function to check auth context
CREATE OR REPLACE FUNCTION debug_auth()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'auth_uid', auth.uid(),
    'auth_role', auth.role(),
    'current_user', current_user,
    'session_user', session_user,
    'policies', (
      SELECT json_agg(json_build_object('table', tablename, 'name', policyname, 'cmd', cmd, 'roles', roles, 'qual', qual))
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename IN ('courses', 'events')
    ),
    'rls_enabled', (
      SELECT json_agg(json_build_object('table', relname, 'rls', relrowsecurity, 'force_rls', relforcerowsecurity))
      FROM pg_class
      WHERE relname IN ('courses', 'events') AND relnamespace = 'public'::regnamespace
    ),
    'course_count_direct', (SELECT count(*) FROM courses),
    'user_id_type', (
      SELECT data_type FROM information_schema.columns
      WHERE table_name = 'courses' AND column_name = 'user_id'
    )
  );
$$;
