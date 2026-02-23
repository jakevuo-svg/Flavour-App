-- Remove duplicate Flavour Studio (keep the one created first)
DELETE FROM locations
WHERE name = 'FLAVOUR STUDIO'
  AND id != (
    SELECT id FROM locations
    WHERE name = 'FLAVOUR STUDIO'
    ORDER BY created_at ASC
    LIMIT 1
  );
