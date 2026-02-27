-- Add special_permissions JSONB column to users table
-- This stores per-user permission overrides (on top of role defaults)
-- Format: { "tab_menus": true, "card_pricing": false, ... }
ALTER TABLE users ADD COLUMN IF NOT EXISTS special_permissions JSONB DEFAULT '{}'::jsonb;

-- Comment for clarity
COMMENT ON COLUMN users.special_permissions IS 'Per-user permission overrides. Keys match PERMISSION_FEATURES keys. true = force allow, false = force deny, absent = use role default.';
