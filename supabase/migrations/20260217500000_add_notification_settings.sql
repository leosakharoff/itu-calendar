CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  discord_webhook_url TEXT,
  discord_enabled BOOLEAN DEFAULT false,
  notify_day_before BOOLEAN DEFAULT true,
  notify_same_day BOOLEAN DEFAULT true,
  notify_time TEXT DEFAULT '08:00',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own notification settings"
  ON notification_settings FOR ALL
  USING (auth.uid() = user_id);

CREATE UNIQUE INDEX notification_settings_user_id_idx
  ON notification_settings(user_id);
