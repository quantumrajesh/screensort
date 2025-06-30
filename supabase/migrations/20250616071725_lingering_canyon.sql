/*
  # Fix storage policies for screenshots bucket

  1. Storage Setup
    - Create screenshots bucket if it doesn't exist
    - Set bucket to public for file access
    - Configure proper RLS policies for storage

  2. Security
    - Users can only access files in their own user folder
    - All CRUD operations are restricted to authenticated users
    - Files are organized by user ID for security
*/

-- Create the screenshots bucket if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'screenshots', 
    'screenshots', 
    true, 
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  );
EXCEPTION WHEN unique_violation THEN
  -- Bucket already exists, update its properties
  UPDATE storage.buckets 
  SET 
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  WHERE id = 'screenshots';
END $$;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can upload screenshots to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own screenshots" ON storage.objects;

-- Create storage policies using Supabase's storage policy functions
-- Policy for uploading files
CREATE POLICY "Users can upload screenshots to their own folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'screenshots' AND
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Policy for viewing files
CREATE POLICY "Users can view their own screenshots"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'screenshots' AND
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Policy for updating files
CREATE POLICY "Users can update their own screenshots"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'screenshots' AND
  auth.uid()::text = (string_to_array(name, '/'))[1]
)
WITH CHECK (
  bucket_id = 'screenshots' AND
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Policy for deleting files
CREATE POLICY "Users can delete their own screenshots"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'screenshots' AND
  auth.uid()::text = (string_to_array(name, '/'))[1]
);