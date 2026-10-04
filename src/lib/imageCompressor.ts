/**
 * Client-side Image Compression Utility
 * Resizes and compresses images in the browser before uploading to server.
 * Dramatically reduces upload bandwidth and saves disk space on VPS.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0 to 1
  mimeType?: "image/webp" | "image/jpeg" | "image/png";
}

export interface CompressedResult {
  file: File;
  previewUrl: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number; // percentage saved
  width: number;
  height: number;
}

export async function compressImageClient(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressedResult> {
  const {
    maxWidth = 1600,
    maxHeight = 1200,
    quality = 0.82,
    mimeType = "image/webp",
  } = options;

  // Don't compress SVG or animated GIF
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return {
      file,
      previewUrl: URL.createObjectURL(file),
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 0,
      width: 0,
      height: 0,
    };
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio scale
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          // Fallback if canvas context fails
          resolve({
            file,
            previewUrl: URL.createObjectURL(file),
            originalSize: file.size,
            compressedSize: file.size,
            compressionRatio: 0,
            width: img.width,
            height: img.height,
          });
          return;
        }

        // High quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({
                file,
                previewUrl: URL.createObjectURL(file),
                originalSize: file.size,
                compressedSize: file.size,
                compressionRatio: 0,
                width,
                height,
              });
              return;
            }

            // Derive safe file name with .webp extension
            const originalBase = file.name.replace(/\.[^/.]+$/, "");
            const ext = mimeType === "image/webp" ? "webp" : "jpg";
            const newFileName = `${originalBase}.${ext}`;

            const compressedFile = new File([blob], newFileName, {
              type: mimeType,
              lastModified: Date.now(),
            });

            const previewUrl = URL.createObjectURL(blob);
            const ratio = Math.max(
              0,
              Math.round(((file.size - compressedFile.size) / file.size) * 100)
            );

            resolve({
              file: compressedFile,
              previewUrl,
              originalSize: file.size,
              compressedSize: compressedFile.size,
              compressionRatio: ratio,
              width,
              height,
            });
          },
          mimeType,
          quality
        );
      };

      img.onerror = () => {
        // If image loading fails, return original
        resolve({
          file,
          previewUrl: URL.createObjectURL(file),
          originalSize: file.size,
          compressedSize: file.size,
          compressionRatio: 0,
          width: 0,
          height: 0,
        });
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Format bytes to readable string (e.g. 1.2 MB or 250 KB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
