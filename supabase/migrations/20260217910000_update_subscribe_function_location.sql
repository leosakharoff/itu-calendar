-- Update subscribe_to_share function to copy location, start_time, and end_time
CREATE OR REPLACE FUNCTION subscribe_to_share(p_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uid uuid;
  v_share shared_calendars%ROWTYPE;
  v_source_course courses%ROWTYPE;
  v_new_course_id uuid;
  v_result json;
  v_max_sort int;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Look up the share
  SELECT * INTO v_share
  FROM shared_calendars
  WHERE share_token = p_token AND is_active = true;

  IF v_share IS NULL THEN
    RAISE EXCEPTION 'Share link not found or inactive';
  END IF;

  -- Get source course
  SELECT * INTO v_source_course
  FROM courses
  WHERE id = v_share.course_id;

  IF v_source_course IS NULL THEN
    RAISE EXCEPTION 'Source course not found';
  END IF;

  -- Get max sort_order for the subscribing user
  SELECT COALESCE(MAX(sort_order), -1) INTO v_max_sort
  FROM courses
  WHERE user_id = v_uid;

  -- Create new course for subscribing user
  INSERT INTO courses (name, color, active, sort_order, user_id)
  VALUES (v_source_course.name, v_source_course.color, true, v_max_sort + 1, v_uid)
  RETURNING id INTO v_new_course_id;

  -- Copy all events (including location, start_time, end_time)
  INSERT INTO events (course_id, title, date, type, notes, location, start_time, end_time, user_id)
  SELECT v_new_course_id, e.title, e.date, e.type, e.notes, e.location, e.start_time, e.end_time, v_uid
  FROM events e
  WHERE e.course_id = v_share.course_id;

  -- Return the new course
  SELECT row_to_json(c) INTO v_result
  FROM courses c
  WHERE c.id = v_new_course_id;

  RETURN v_result;
END;
$$;
