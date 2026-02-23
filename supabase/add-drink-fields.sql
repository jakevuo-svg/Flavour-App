-- Add drink service fields to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS "drinkService" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE events ADD COLUMN IF NOT EXISTS "drinkNotes" TEXT DEFAULT '';
