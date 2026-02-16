ALTER TABLE notification_settings
  ADD COLUMN notify_event_types TEXT[] DEFAULT ARRAY['deliverable', 'exam']::TEXT[],
  ADD COLUMN sms_enabled BOOLEAN DEFAULT false,
  ADD COLUMN sms_phone_number TEXT;
