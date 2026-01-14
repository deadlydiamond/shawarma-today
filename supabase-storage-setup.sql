-- ============================================================================
-- SUPABASE STORAGE SETUP FOR MENU IMAGES
-- ============================================================================
-- 
-- Run this in your Supabase SQL Editor to set up storage for menu item images.
-- 
-- IMPORTANT: Storage buckets can also be created via the Supabase Dashboard:
-- 1. Go to Storage in the sidebar
-- 2. Click "New Bucket"
-- 3. Name: "menu-images"
-- 4. Public bucket: Yes
-- 5. Click "Create Bucket"
-- 
-- Then set up the policy via UI or run the SQL below.
-- ============================================================================

-- Create the storage bucket for menu images (if using SQL)
-- Note: This might need to be done via the Supabase Dashboard if SQL doesn't have permissions
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'menu-images',
  'menu-images',
  true, -- Public bucket so images can be accessed without authentication
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

-- Allow public read access to all files in the bucket
CREATE POLICY "Public read access for menu images"
ON storage.objects FOR SELECT
USING (bucket_id = 'menu-images');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload menu images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'menu-images');

-- Allow authenticated users to update their uploaded files
CREATE POLICY "Authenticated users can update menu images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'menu-images');

-- Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete menu images"
ON storage.objects FOR DELETE
USING (bucket_id = 'menu-images');

-- ============================================================================
-- ALTERNATIVE: More permissive policies (for development)
-- ============================================================================
-- If you're having issues with the above policies, you can use these more
-- permissive policies instead. NOT RECOMMENDED FOR PRODUCTION.
-- 
-- DROP POLICY IF EXISTS "Public read access for menu images" ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated users can upload menu images" ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated users can update menu images" ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated users can delete menu images" ON storage.objects;
-- 
-- CREATE POLICY "Allow all operations on menu-images"
-- ON storage.objects FOR ALL
-- USING (bucket_id = 'menu-images')
-- WITH CHECK (bucket_id = 'menu-images');
-- ============================================================================

-- ============================================================================
-- VERIFY SETUP
-- ============================================================================
-- Run this to verify the bucket was created:
-- SELECT * FROM storage.buckets WHERE id = 'menu-images';
-- 
-- Run this to verify the policies:
-- SELECT * FROM pg_policies WHERE tablename = 'objects';
