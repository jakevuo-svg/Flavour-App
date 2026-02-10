-- Create event_assignments table for worker-event access control
-- Workers can only see events they are assigned to by an admin

CREATE TABLE IF NOT EXISTS event_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  role VARCHAR(50) DEFAULT 'staff',
  assigned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- RLS policies for event_assignments
ALTER TABLE event_assignments ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins full access to event_assignments"
  ON event_assignments FOR ALL
  USING (is_admin() AND is_active_user());

-- Workers can read their own assignments
CREATE POLICY "Workers can view own assignments"
  ON event_assignments FOR SELECT
  USING (auth.uid() = user_id AND is_active_user());

-- Grant access
GRANT ALL ON event_assignments TO authenticated;
