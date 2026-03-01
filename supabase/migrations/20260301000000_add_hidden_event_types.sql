ALTER TABLE user_settings
  ADD COLUMN hidden_event_types TEXT[] NOT NULL DEFAULT '{}';
