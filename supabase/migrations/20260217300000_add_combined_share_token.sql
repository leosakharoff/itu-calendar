-- Add combined_share_token column to user_settings for combined iCal export
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS combined_share_token TEXT;
