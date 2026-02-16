CREATE TABLE shared_calendars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  share_token text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Index for fast token lookups
CREATE INDEX idx_shared_calendars_token ON shared_calendars(share_token);

-- RLS: users can only manage their own shares
ALTER TABLE shared_calendars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own shares" ON shared_calendars
  FOR ALL USING (auth.uid() = user_id);

-- Public read access via token (for iCal endpoint and subscribe page)
CREATE POLICY "Public read via token" ON shared_calendars
  FOR SELECT USING (is_active = true);
