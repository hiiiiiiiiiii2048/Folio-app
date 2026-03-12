-- Notifications table: stores every broadcast notification sent to users
CREATE TABLE IF NOT EXISTS public.notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      TEXT NOT NULL,           -- Clerk user ID who receives this
  title        TEXT NOT NULL,
  message      TEXT NOT NULL,
  urgency      TEXT NOT NULL DEFAULT 'info',  -- 'info' | 'warning' | 'critical'
  scope        TEXT NOT NULL DEFAULT 'global', -- 'global' | 'pro' | 'inactive' | 'new'
  is_read      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  broadcast_id UUID                       -- groups notifications from same broadcast
);

-- Broadcast log: one row per dispatch event
CREATE TABLE IF NOT EXISTS public.notification_broadcasts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject      TEXT NOT NULL,
  message      TEXT NOT NULL,
  urgency      TEXT NOT NULL DEFAULT 'info',
  scope        TEXT NOT NULL DEFAULT 'global',
  recipients   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_broadcasts ENABLE ROW LEVEL SECURITY;

-- Users can only read their own notifications
CREATE POLICY "Users read own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid()::text);

-- Only service role can insert (admin bypass)
-- No INSERT policy needed; inserts happen via service role key

-- Index for fast per-user lookups
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id, is_read, created_at DESC);
