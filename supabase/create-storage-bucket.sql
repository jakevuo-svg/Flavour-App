-- Create storage bucket for location files
-- Run in Supabase SQL Editor

INSERT INTO storage.buckets (id, name, public)
VALUES ('location-files', 'location-files', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload location files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'location-files');

-- Allow authenticated users to read files
CREATE POLICY "Anyone can view location files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'location-files');

-- Allow admins to delete files
CREATE POLICY "Admins can delete location files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'location-files' AND (select public.is_admin()));
