-- Change capacity from INTEGER to TEXT to allow descriptive text
-- e.g. "Istumaan 50-300 hlö, Seisomaan 50-650 hlö"
-- Run in Supabase SQL Editor

ALTER TABLE locations ALTER COLUMN capacity TYPE TEXT USING capacity::TEXT;
