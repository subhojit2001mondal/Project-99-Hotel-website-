import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../services/firebase';

/**
 * Compresses an image file client-side using HTMLCanvas.
 * Ensures images fit within reasonable bandwidth and dimensions.
 */
export async function compressImage(file: File, maxWidth = 1200, quality = 0.75): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, dataUrl });
            } else {
              reject(new Error('Failed to create image blob'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

/**
 * Uploads an image to Firebase Storage, with fallback to compressed data URL.
 */
export async function uploadImageWithFallback(
  file: File,
  folder = 'uploads',
  onProgress?: (progress: number) => void
): Promise<string> {
  onProgress?.(15);
  try {
    const { blob, dataUrl } = await compressImage(file);
    onProgress?.(45);

    try {
      const filename = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.jpg`;
      const storageRef = ref(storage, filename);
      const snapshot = await uploadBytes(storageRef, blob, {
        contentType: 'image/jpeg',
      });
      onProgress?.(85);
      const downloadURL = await getDownloadURL(snapshot.ref);
      onProgress?.(100);
      return downloadURL;
    } catch (storageError) {
      console.warn('Storage upload encountered an issue, using compressed fallback data URL:', storageError);
      // Fallback: Use compressed dataUrl directly so data is always saved and works everywhere
      onProgress?.(100);
      return dataUrl;
    }
  } catch (compressError) {
    console.error('Image compression failed:', compressError);
    throw compressError;
  }
}
