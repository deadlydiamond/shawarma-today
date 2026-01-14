import { supabase } from './supabase'

const BUCKET_NAME = 'menu-images'

/**
 * Upload an image to Supabase Storage
 * @param file - The file to upload
 * @param folder - Optional folder path (e.g., 'menu-items', 'banners')
 * @returns The public URL of the uploaded image or null if failed
 */
export async function uploadImage(
  file: File,
  folder: string = 'menu-items'
): Promise<string | null> {
  try {
    // Generate a unique filename
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`

    // Upload the file
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Error uploading image:', error)
      return null
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path)

    return urlData.publicUrl
  } catch (error) {
    console.error('Error in uploadImage:', error)
    return null
  }
}

/**
 * Delete an image from Supabase Storage
 * @param imageUrl - The full URL of the image to delete
 * @returns true if successful, false otherwise
 */
export async function deleteImage(imageUrl: string): Promise<boolean> {
  try {
    // Extract the path from the URL
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split(`/storage/v1/object/public/${BUCKET_NAME}/`)
    
    if (pathParts.length < 2) {
      console.error('Invalid image URL format')
      return false
    }

    const filePath = pathParts[1]

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath])

    if (error) {
      console.error('Error deleting image:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in deleteImage:', error)
    return false
  }
}

/**
 * Check if a URL is a Supabase storage URL (vs external URL like Unsplash)
 */
export function isSupabaseStorageUrl(url: string): boolean {
  return url.includes('supabase.co/storage') || url.includes(BUCKET_NAME)
}
