/**
 * Client-side Image Compression Utility
 * Resizes and compresses images in the browser before uploading to server.
 * Includes automatic JPEG fallback for mobile browsers that don't support WebP canvas encoding,
 * and returns a ready-to-use Base64 Data URL so images always display reliably.
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
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number; // percentage saved
  width: number;
  height: number;
}

function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve((r.result as string) || "");
    r.onerror = (err) => reject(err);
    r.readAsDataURL(file);
  });
}

export async function compressImageClient(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressedResult> {
  const {
    maxWidth = 1400,
    maxHeight = 1200,
    quality = 0.8,
    mimeType = "image/webp",
  } = options;

  // Don't compress SVG or animated GIF
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    const dataUrl = await fileToDataUrl(file);
    return {
      file,
      previewUrl: dataUrl,
      dataUrl,
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
      const originalDataUrl = (e.target?.result as string) || "";
      const img = new Image();

      img.onload = () => {
        let width = img.width || 800;
        let height = img.height || 600;

        // Calculate aspect-ratio scale
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.max(1, Math.round(width * ratio));
          height = Math.max(1, Math.round(height * ratio));
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve({
            file,
            previewUrl: originalDataUrl,
            dataUrl: originalDataUrl,
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

        // Generate Data URL (try WebP first, fallback to JPEG if browser doesn't encode WebP)
        let dataUrl = canvas.toDataURL(mimeType, quality);
        let actualMime = mimeType;
        if (
          mimeType === "image/webp" &&
          !dataUrl.startsWith("data:image/webp")
        ) {
          actualMime = "image/jpeg";
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({
                file,
                previewUrl: dataUrl || originalDataUrl,
                dataUrl: dataUrl || originalDataUrl,
                originalSize: file.size,
                compressedSize: file.size,
                compressionRatio: 0,
                width,
                height,
              });
              return;
            }

            const originalBase =
              file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_") ||
              "image";
            const ext = actualMime === "image/webp" ? "webp" : "jpg";
            const newFileName = `${originalBase}.${ext}`;

            const compressedFile = new File([blob], newFileName, {
              type: actualMime,
              lastModified: Date.now(),
            });

            const ratio = Math.max(
              0,
              Math.round(((file.size - compressedFile.size) / file.size) * 100)
            );

            resolve({
              file: compressedFile,
              previewUrl: dataUrl,
              dataUrl,
              originalSize: file.size,
              compressedSize: compressedFile.size,
              compressionRatio: ratio,
              width,
              height,
            });
          },
          actualMime,
          quality
        );
      };

      img.onerror = () => {
        resolve({
          file,
          previewUrl: originalDataUrl,
          dataUrl: originalDataUrl,
          originalSize: file.size,
          compressedSize: file.size,
          compressionRatio: 0,
          width: 0,
          height: 0,
        });
      };

      img.src = originalDataUrl;
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
