-- Migration: Add user_id and Row Level Security for multi-user support
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/aiepgqbxejtzpczqerhv/sql)

-- 1. Add user_id column to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Add user_id column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 3. Enable Row Level Security
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for courses
-- Users can only see their own courses
CREATE POLICY "Users can view own courses" ON courses
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own courses
CREATE POLICY "Users can insert own courses" ON courses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own courses
CREATE POLICY "Users can update own courses" ON courses
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own courses
CREATE POLICY "Users can delete own courses" ON courses
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Create policies for events
-- Users can only see their own events
CREATE POLICY "Users can view own events" ON events
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own events
CREATE POLICY "Users can insert own events" ON events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own events
CREATE POLICY "Users can update own events" ON events
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own events
CREATE POLICY "Users can delete own events" ON events
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Create index for faster queries
CREATE INDEX IF NOT EXISTS courses_user_id_idx ON courses(user_id);
CREATE INDEX IF NOT EXISTS events_user_id_idx ON events(user_id);
