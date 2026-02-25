-- Add is_archived column to events table for archive functionality
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- Index for fast filtering of active vs archived events
CREATE INDEX IF NOT EXISTS idx_events_is_archived ON events(is_archived);
