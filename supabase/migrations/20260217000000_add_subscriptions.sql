-- Subscriptions table: tracks live-sync subscriptions to shared courses
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_calendar_id uuid NOT NULL REFERENCES shared_calendars(id) ON DELETE CASCADE,
  source_course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  source_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  active boolean DEFAULT true,
  sort_order int NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(subscriber_id, shared_calendar_id)
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Subscribers can read their own subscriptions
CREATE POLICY "subscriptions_select_own" ON subscriptions
  FOR SELECT TO authenticated
  USING (subscriber_id = auth.uid());

-- Subscribers can insert their own subscriptions
CREATE POLICY "subscriptions_insert_own" ON subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (subscriber_id = auth.uid());

-- Subscribers can update their own subscriptions (active, sort_order)
CREATE POLICY "subscriptions_update_own" ON subscriptions
  FOR UPDATE TO authenticated
  USING (subscriber_id = auth.uid());

-- Subscribers can delete their own subscriptions (unsubscribe)
CREATE POLICY "subscriptions_delete_own" ON subscriptions
  FOR DELETE TO authenticated
  USING (subscriber_id = auth.uid());

-- Allow subscribers to read courses they are subscribed to
CREATE POLICY "courses_subscribed_read" ON courses
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM subscriptions
    WHERE subscriptions.source_course_id = courses.id
      AND subscriptions.subscriber_id = auth.uid()
  ));

-- Allow subscribers to read events belonging to courses they are subscribed to
CREATE POLICY "events_subscribed_read" ON events
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM subscriptions
    WHERE subscriptions.source_course_id = events.course_id
      AND subscriptions.subscriber_id = auth.uid()
  ));

-- Allow subscribers to read shared_calendars they have subscriptions to
CREATE POLICY "shared_calendars_subscribed_read" ON shared_calendars
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM subscriptions
    WHERE subscriptions.shared_calendar_id = shared_calendars.id
      AND subscriptions.subscriber_id = auth.uid()
  ));
