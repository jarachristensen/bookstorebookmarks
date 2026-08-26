/**
 * Client-side image compressor utility.
 * Shrinks oversized raw camera/scanner images (> 4MB) to optimal high-resolution display size
 * in the browser before upload, ensuring lightning-fast uploads without gateway timeouts.
 */
export async function compressImageIfNeeded(file: File, maxDimension: number = 2400): Promise<File> {
  // If not an image or SVG, return original
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return file;
  }

  // If already under 3MB, no compression needed
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

        // High quality bicubic resampling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to high-quality JPEG
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          0.90 // 90% quality preserve deckled textures & fine print
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}
