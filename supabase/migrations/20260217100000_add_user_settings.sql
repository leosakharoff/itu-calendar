CREATE TABLE user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  calendar_start text NOT NULL DEFAULT '2026-01',
  calendar_end text NOT NULL DEFAULT '2026-06',
  week_start text NOT NULL DEFAULT 'monday',
  language text NOT NULL DEFAULT 'da',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);
