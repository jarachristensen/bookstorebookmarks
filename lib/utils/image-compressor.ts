/**
 * Client-side image compressor utility.
 * Shrinks oversized raw camera/scanner images (> 3MB) to optimal high-resolution display size
 * in the browser before upload, while preserving 100% alpha transparency for PNGs with non-square cutouts.
 */
export async function compressImageIfNeeded(file: File, maxDimension: number = 2400): Promise<File> {
  // If not an image or SVG, return original
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return file;
  }

  // If already under 3MB, keep original file without touching pixels
  if (file.size <= 3 * 1024 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Scale down if dimensions exceed maxDimension (e.g. 2400px)
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        // Clear canvas with transparent alpha
        ctx.clearRect(0, 0, width, height);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Preserve alpha transparency for PNG and WebP files
        const isTransparentFormat = file.type === "image/png" || file.type === "image/webp";
        const outputMime = isTransparentFormat ? "image/webp" : "image/jpeg";
        const ext = isTransparentFormat ? ".webp" : ".jpg";

        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ext), {
                type: outputMime,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          outputMime,
          0.92 // 92% quality with full alpha transparency
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}
