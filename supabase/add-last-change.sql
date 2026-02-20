-- Add last_change column to track what was last modified
ALTER TABLE events ADD COLUMN IF NOT EXISTS last_change TEXT DEFAULT '';
