-- Add feedback JSONB column to persons table
ALTER TABLE persons ADD COLUMN IF NOT EXISTS feedback JSONB DEFAULT '[]'::jsonb;
