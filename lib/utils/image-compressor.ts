/**
 * Client-side image compressor & transparency autocrop utility.
 * - Automatically detects and crops out excess transparent margins around bookmarks,
 *   tightly trimming the file to the exact physical bookmark shape.
 * - Preserves 100% alpha transparency for custom cutouts, deckled edges, and die-cut shapes.
 * - Shrinks oversized raw camera/scanner images (> 2400px) smoothly before upload.
 */

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Calculates the minimal bounding box enclosing all non-transparent pixels in an RGBA buffer.
 * @param data Uint8ClampedArray of RGBA pixel values
 * @param width image width
 * @param height image height
 * @param alphaThreshold minimum alpha value (0-255) to be considered visible (default: 15)
 * @returns BoundingBox or null if entirely transparent
 */
export function getNonTransparentBoundingBox(
  data: Uint8ClampedArray | Uint8Array,
  width: number,
  height: number,
  alphaThreshold: number = 15
): BoundingBox | null {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alphaIndex = (y * width + x) * 4 + 3;
      const alpha = data[alphaIndex];
      if (alpha > alphaThreshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return null; // Entirely transparent image
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

export async function compressImageIfNeeded(file: File, maxDimension: number = 2400): Promise<File> {
  // If not an image or SVG, return original
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const rawWidth = img.naturalWidth || img.width;
        const rawHeight = img.naturalHeight || img.height;

        if (rawWidth === 0 || rawHeight === 0) {
          resolve(file);
          return;
        }

        // Draw onto a full-sized temp canvas to read alpha pixel data
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = rawWidth;
        tempCanvas.height = rawHeight;
        const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });

        if (!tempCtx) {
          resolve(file);
          return;
        }

        tempCtx.clearRect(0, 0, rawWidth, rawHeight);
        tempCtx.drawImage(img, 0, 0);

        let cropX = 0;
        let cropY = 0;
        let cropWidth = rawWidth;
        let cropHeight = rawHeight;
        let hasTransparencyCrop = false;

        // Check for transparent borders
        try {
          const imgData = tempCtx.getImageData(0, 0, rawWidth, rawHeight);
          const bbox = getNonTransparentBoundingBox(imgData.data, rawWidth, rawHeight, 15);

          if (bbox && (bbox.x > 0 || bbox.y > 0 || bbox.width < rawWidth || bbox.height < rawHeight)) {
            cropX = bbox.x;
            cropY = bbox.y;
            cropWidth = bbox.width;
            cropHeight = bbox.height;
            hasTransparencyCrop = true;
          }
        } catch (e) {
          console.warn("Could not read image pixel data for transparency crop:", e);
        }

        // Check if resizing is needed
        let targetWidth = cropWidth;
        let targetHeight = cropHeight;

        if (targetWidth > maxDimension || targetHeight > maxDimension) {
          if (targetWidth > targetHeight) {
            targetHeight = Math.round((targetHeight * maxDimension) / targetWidth);
            targetWidth = maxDimension;
          } else {
            targetWidth = Math.round((targetWidth * maxDimension) / targetHeight);
            targetHeight = maxDimension;
          }
        }

        // If no crop was needed and no resize was needed and file is small, keep original
        if (!hasTransparencyCrop && targetWidth === rawWidth && targetHeight === rawHeight && file.size <= 3 * 1024 * 1024) {
          resolve(file);
          return;
        }

        const outCanvas = document.createElement("canvas");
        outCanvas.width = targetWidth;
        outCanvas.height = targetHeight;
        const outCtx = outCanvas.getContext("2d");

        if (!outCtx) {
          resolve(file);
          return;
        }

        outCtx.clearRect(0, 0, targetWidth, targetHeight);
        outCtx.imageSmoothingEnabled = true;
        outCtx.imageSmoothingQuality = "high";

        // Draw only the cropped bounding box from tempCanvas to outCanvas
        outCtx.drawImage(
          tempCanvas,
          cropX,
          cropY,
          cropWidth,
          cropHeight,
          0,
          0,
          targetWidth,
          targetHeight
        );

        // Preserve alpha transparency for PNG and WebP files or any file that was transparency-cropped
        const isTransparentFormat = file.type === "image/png" || file.type === "image/webp" || hasTransparencyCrop;
        const outputMime = isTransparentFormat ? "image/webp" : "image/jpeg";
        const ext = isTransparentFormat ? ".webp" : ".jpg";

        outCanvas.toBlob(
          (blob) => {
            if (blob) {
              const resultFile = new File([blob], file.name.replace(/\.[^/.]+$/, ext), {
                type: outputMime,
                lastModified: Date.now(),
              });
              resolve(resultFile);
            } else {
              resolve(file);
            }
          },
          outputMime,
          0.94 // 94% high archival quality with full alpha transparency
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}
