-- Add end_date column to events table
-- For events that span past midnight (e.g. 19:00 - 02:00)
ALTER TABLE events ADD COLUMN IF NOT EXISTS end_date DATE;
