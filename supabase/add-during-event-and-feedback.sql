-- Add duringEvent and feedback columns to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS "duringEvent" TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS feedback TEXT;
