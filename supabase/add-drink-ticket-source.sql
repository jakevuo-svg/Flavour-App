-- Add drink ticket source field to events table
-- Values: 'asiakas' (from client) or 'me' (from Flavour Ventures)
ALTER TABLE events ADD COLUMN IF NOT EXISTS "drinkTicketSource" TEXT DEFAULT '';
