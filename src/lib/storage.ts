import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import type { FirebaseApp } from 'firebase/app';

/**
 * Upload an image to Firebase Storage
 * @param app Firebase app instance
 * @param file Image file to upload
 * @param path Storage path (e.g., 'news-images/article-123')
 * @returns Download URL of the uploaded image
 */
export async function uploadImage(
  app: FirebaseApp,
  file: File,
  path: string
): Promise<string> {
  try {
    const storage = getStorage(app);
    const storageRef = ref(storage, path);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Delete an image from Firebase Storage
 * @param app Firebase app instance
 * @param path Storage path of the image to delete
 */
export async function deleteImage(
  app: FirebaseApp,
  path: string
): Promise<void> {
  try {
    const storage = getStorage(app);
    const storageRef = ref(storage, path);
    
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image');
  }
}

/**
 * Generate a unique filename for an image
 * @param originalFilename Original filename
 * @returns Unique filename with timestamp
 */
export function generateImageFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const extension = originalFilename.split('.').pop();
  
  return `${timestamp}-${randomStr}.${extension}`;
}

/**
 * Validate image file
 * @param file File to validate
 * @returns Object with validation result and error message
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }
  
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return { valid: false, error: 'Image must be less than 5MB' };
  }
  
  // Check supported formats
  const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!supportedFormats.includes(file.type)) {
    return { valid: false, error: 'Supported formats: JPEG, PNG, WebP, GIF' };
  }
  
  return { valid: true };
}
