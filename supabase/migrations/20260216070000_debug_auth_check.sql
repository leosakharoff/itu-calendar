-- Create function that authenticated users can call to debug their own auth
CREATE OR REPLACE FUNCTION debug_my_auth()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  uid uuid;
BEGIN
  uid := auth.uid();
  SELECT json_build_object(
    'auth_uid', uid,
    'auth_uid_text', uid::text,
    'auth_role', auth.role(),
    'matching_courses_count', (SELECT count(*) FROM courses WHERE user_id = uid),
    'sample_course_user_id', (SELECT user_id::text FROM courses LIMIT 1),
    'ids_equal', (SELECT user_id = uid FROM courses LIMIT 1),
    'uid_is_null', (uid IS NULL)
  ) INTO result;
  RETURN result;
END;
$$;
