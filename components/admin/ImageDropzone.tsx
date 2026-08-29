"use client";

import React, { useState, useRef, useEffect } from "react";
import { Upload, X, Link as LinkIcon, Loader2, RotateCw, AlertCircle, Scissors } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { compressImageIfNeeded } from "@/lib/utils/image-compressor";

export interface ImageDropzoneProps {
  label: string;
  value: string;
  onChange: (url: string, file?: File) => void;
  onFileSelected?: (file: File) => void;
  aspectRatio?: "bookmark" | "photo" | "landscape";
  placeholder?: string;
  required?: boolean;
}

export function ImageDropzone({
  label,
  value,
  onChange,
  onFileSelected,
  aspectRatio = "bookmark",
  placeholder,
  required = false,
}: ImageDropzoneProps) {
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [error, setError] = useState("");
  const [imageLoadError, setImageLoadError] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active image URL prioritizing instant local preview while uploading, then saved URL
  const displayUrl = localPreviewUrl || value;

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (localPreviewUrl && localPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  // Reset image load error when displayUrl changes
  useEffect(() => {
    setImageLoadError(false);
  }, [displayUrl]);

  const handleFileUpload = async (rawFile: File) => {
    if (!rawFile) return;
    setError("");
    setImageLoadError(false);
    setUploading(true);
    setUploadProgress("Preparing preview...");

    // 1. Instant client-side blob preview so the user sees the new image immediately!
    const objectUrl = URL.createObjectURL(rawFile);
    setLocalPreviewUrl(objectUrl);

    if (onFileSelected) {
      onFileSelected(rawFile);
    }

    try {
      // 2. Optimize oversized image in browser (< 3MB)
      setUploadProgress("Optimizing scan...");
      const file = await compressImageIfNeeded(rawFile);

      setUploadProgress("Uploading to archive...");

      // 3. Upload via standard API route (supports Vercel Blob and local disk)
      const formData = new FormData();
      formData.append("file", file);

      // Abort controller with 35s timeout so it never hangs
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Upload error (${res.status}): ${text.slice(0, 120)}`);
      }

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      // 4. Update parent state with permanent uploaded URL
      onChange(data.url, rawFile);
    } catch (err: any) {
      console.error("Image Upload Failed:", err);
      if (err.name === "AbortError") {
        setError("Upload timed out. Please check your connection and try again.");
      } else {
        setError(err.message || "Failed to upload image");
      }
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  /**
   * Rotates the current scan by 90 degrees clockwise in canvas and re-uploads it.
   */
  const handleRotate90 = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!displayUrl || uploading) return;

    setError("");
    setUploading(true);
    setUploadProgress("Rotating scan 90°...");

    try {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = displayUrl;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image for rotation"));
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.height;
      canvas.height = img.width;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not initialize 2D canvas");

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Rotate 90 deg clockwise around center
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((90 * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      const rotatedBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to convert canvas to blob"));
          },
          "image/webp",
          0.94
        );
      });

      const rotatedFile = new File([rotatedBlob], `rotated-${Date.now()}.webp`, {
        type: "image/webp",
        lastModified: Date.now(),
      });

      await handleFileUpload(rotatedFile);
    } catch (err: any) {
      console.error("Rotate error:", err);
      setError(err.message || "Failed to rotate image");
      setUploading(false);
      setUploadProgress("");
    }
  };

  /**
   * Automatically detects and trims white/blank scanner borders from all 4 edges.
   */
  const handleAutoTrim = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!displayUrl || uploading) return;

    setError("");
    setUploading(true);
    setUploadProgress("Auto-trimming scanner edges...");

    try {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = displayUrl;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image for auto-trimming"));
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("Could not initialize 2D canvas");

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { data, width, height } = imgData;

      // Helper: check if a pixel is white/blank scanner background
      const isScannerWhiteOrBlank = (r: number, g: number, b: number, a: number) => {
        if (a < 20) return true; // transparent
        const brightness = (r + g + b) / 3;
        const colorDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
        return brightness > 238 && colorDiff < 18;
      };

      // 1. Scan Top edge
      let top = 0;
      for (let y = 0; y < Math.floor(height * 0.25); y++) {
        let whitePixels = 0;
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          if (isScannerWhiteOrBlank(data[idx], data[idx + 1], data[idx + 2], data[idx + 3])) {
            whitePixels++;
          }
        }
        if (whitePixels / width > 0.88) {
          top = y + 1;
        } else {
          break;
        }
      }

      // 2. Scan Bottom edge
      let bottom = height;
      for (let y = height - 1; y >= Math.floor(height * 0.75); y--) {
        let whitePixels = 0;
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          if (isScannerWhiteOrBlank(data[idx], data[idx + 1], data[idx + 2], data[idx + 3])) {
            whitePixels++;
          }
        }
        if (whitePixels / width > 0.88) {
          bottom = y;
        } else {
          break;
        }
      }

      // 3. Scan Left edge
      let left = 0;
      for (let x = 0; x < Math.floor(width * 0.25); x++) {
        let whitePixels = 0;
        for (let y = 0; y < height; y++) {
          const idx = (y * width + x) * 4;
          if (isScannerWhiteOrBlank(data[idx], data[idx + 1], data[idx + 2], data[idx + 3])) {
            whitePixels++;
          }
        }
        if (whitePixels / height > 0.88) {
          left = x + 1;
        } else {
          break;
        }
      }

      // 4. Scan Right edge
      let right = width;
      for (let x = width - 1; x >= Math.floor(width * 0.75); x--) {
        let whitePixels = 0;
        for (let y = 0; y < height; y++) {
          const idx = (y * width + x) * 4;
          if (isScannerWhiteOrBlank(data[idx], data[idx + 1], data[idx + 2], data[idx + 3])) {
            whitePixels++;
          }
        }
        if (whitePixels / height > 0.88) {
          right = x;
        } else {
          break;
        }
      }

      // Add a 1-2px safety shave if borders detected, or 2px minimum trim
      if (top > 0 || bottom < height || left > 0 || right < width) {
        top = Math.min(top + 1, height - 10);
        bottom = Math.max(bottom - 1, top + 10);
        left = Math.min(left + 1, width - 10);
        right = Math.max(right - 1, left + 10);
      } else {
        // Shave 2px all around
        top = Math.min(2, Math.floor(height * 0.05));
        bottom = Math.max(height - 2, top + 10);
        left = Math.min(2, Math.floor(width * 0.05));
        right = Math.max(width - 2, left + 10);
      }

      const cropWidth = right - left;
      const cropHeight = bottom - top;

      if (cropWidth < 50 || cropHeight < 50) {
        throw new Error("Cropped area is too small to auto-trim.");
      }

      const cropCanvas = document.createElement("canvas");
      cropCanvas.width = cropWidth;
      cropCanvas.height = cropHeight;

      const cropCtx = cropCanvas.getContext("2d");
      if (!cropCtx) throw new Error("Could not initialize crop canvas");

      cropCtx.imageSmoothingEnabled = true;
      cropCtx.imageSmoothingQuality = "high";
      cropCtx.drawImage(canvas, left, top, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

      const trimmedBlob = await new Promise<Blob>((resolve, reject) => {
        cropCanvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to convert trimmed canvas to blob"));
          },
          "image/webp",
          0.94
        );
      });

      const trimmedFile = new File([trimmedBlob], `trimmed-${Date.now()}.webp`, {
        type: "image/webp",
        lastModified: Date.now(),
      });

      await handleFileUpload(trimmedFile);
    } catch (err: any) {
      console.error("Auto-trim error:", err);
      setError(err.message || "Failed to auto-trim scanner borders");
      setUploading(false);
      setUploadProgress("");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      setLocalPreviewUrl(null);
      onChange(customUrl.trim());
      setShowUrlInput(false);
      setCustomUrl("");
    }
  };

  const handleRemove = () => {
    setLocalPreviewUrl(null);
    onChange("");
    setError("");
    setImageLoadError(false);
  };

  const getAspectClasses = () => {
    if (aspectRatio === "bookmark") {
      return "aspect-[1/3.1] max-w-[200px] mx-auto";
    }
    if (aspectRatio === "landscape") {
      return "aspect-[3.2/1] w-full max-w-2xl mx-auto";
    }
    return "aspect-[16/10] w-full";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-mono font-medium text-ink-light">
          {label} {required && <span className="text-archival-oxblood">*</span>}
        </label>
        <div className="flex items-center gap-2">
          {displayUrl && (
            <>
              <button
                type="button"
                onClick={handleAutoTrim}
                disabled={uploading}
                className="text-[11px] text-archival-oxblood hover:underline font-serif flex items-center gap-1 cursor-pointer bg-white/80 px-2 py-0.5 rounded border border-parchment-border hover:bg-white transition-colors"
                title="Auto-detect and crop white scanner margins"
              >
                <Scissors className="w-3 h-3 text-archival-oxblood" />
                <span>Auto-Trim</span>
              </button>

              <button
                type="button"
                onClick={handleRotate90}
                disabled={uploading}
                className="text-[11px] text-archival-oxblood hover:underline font-serif flex items-center gap-1 cursor-pointer bg-white/80 px-2 py-0.5 rounded border border-parchment-border hover:bg-white transition-colors"
                title="Rotate scan 90° Clockwise"
              >
                <RotateCw className="w-3 h-3 text-archival-amber" />
                <span>Rotate 90°</span>
              </button>
            </>
          )}

          {!displayUrl && (
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-[11px] text-archival-oxblood hover:underline font-serif flex items-center gap-1 cursor-pointer"
            >
              <LinkIcon className="w-3 h-3" />
              <span>{showUrlInput ? "Drop file instead" : "Paste URL"}</span>
            </button>
          )}

          {displayUrl && (
            <button
              type="button"
              onClick={handleRemove}
              className="text-[11px] text-archival-oxblood hover:underline font-serif flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Remove</span>
            </button>
          )}
        </div>
      </div>

      {showUrlInput && !displayUrl && (
        <form onSubmit={handleApplyCustomUrl} className="flex gap-2">
          <input
            type="url"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="https://photos.smugmug.com/... or https://..."
            className="flex-1 px-3 py-1.5 text-xs bg-white border border-parchment-border rounded-lg text-ink font-serif focus:outline-none"
            autoFocus
          />
          <Button type="submit" variant="secondary" size="sm" className="text-xs font-serif">
            Apply URL
          </Button>
        </form>
      )}

      {displayUrl ? (
        <div
          className={`relative rounded-xl overflow-hidden border-2 border-parchment-border bg-stone-100 dark:bg-stone-900/40 shadow-xs flex items-center justify-center ${getAspectClasses()}`}
        >
          {/* Subtle archival paper checkerboard background for transparent scans */}
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(45deg, #e5e0d8 25%, transparent 25%), linear-gradient(-45deg, #e5e0d8 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e0d8 75%), linear-gradient(-45deg, transparent 75%, #e5e0d8 75%)",
              backgroundSize: "16px 16px",
              backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
            }}
          />

          {imageLoadError ? (
            <div className="relative z-10 p-4 text-center space-y-2">
              <AlertCircle className="w-6 h-6 text-rose-600 mx-auto" />
              <p className="text-xs font-serif text-rose-800 font-medium">
                Unable to load image preview
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] font-serif bg-white text-ink"
              >
                Choose New Scan
              </Button>
            </div>
          ) : (
            <div className="relative w-full h-full p-2 flex items-center justify-center z-10">
              <img
                key={displayUrl}
                src={displayUrl}
                alt={label}
                className="max-w-full max-h-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-all duration-200"
                onError={() => {
                  console.warn("Failed to render preview for:", displayUrl);
                  setImageLoadError(true);
                }}
              />
            </div>
          )}

          {/* Uploading overlay */}
          {uploading && (
            <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white p-3 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-amber-300" />
              <p className="text-xs font-serif font-semibold text-amber-100">
                {uploadProgress || "Updating scan..."}
              </p>
            </div>
          )}

          {/* Hover overlay for Replace, Rotate & Auto-Trim actions */}
          {!uploading && (
            <div className="absolute inset-0 z-20 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAutoTrim}
                className="text-xs font-serif bg-white/95 text-ink flex items-center gap-1.5 shadow-sm hover:bg-white"
                title="Auto-detect and crop white scanner margins"
              >
                <Scissors className="w-3.5 h-3.5 text-archival-oxblood" />
                <span>Auto-Trim</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRotate90}
                className="text-xs font-serif bg-white/95 text-ink flex items-center gap-1.5 shadow-sm hover:bg-white"
              >
                <RotateCw className="w-3.5 h-3.5 text-archival-amber" />
                <span>Rotate 90°</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-serif bg-white/95 text-ink shadow-sm hover:bg-white"
              >
                Replace Scan
              </Button>
            </div>
          )}
        </div>
      ) : (
        !showUrlInput && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed border-parchment-border hover:border-archival-amber rounded-xl p-6 text-center cursor-pointer bg-parchment-light hover:bg-parchment-muted/50 transition-colors flex flex-col items-center justify-center gap-2 ${
              aspectRatio === "bookmark"
                ? "aspect-[1/2.8] max-w-[200px] mx-auto"
                : aspectRatio === "landscape"
                ? "aspect-[3.2/1] w-full max-w-2xl mx-auto"
                : "aspect-[16/10] w-full"
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-parchment-muted flex items-center justify-center text-ink-muted">
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin text-archival-oxblood" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xs font-serif font-semibold text-ink">
                {uploading ? (uploadProgress || "Uploading scan...") : "Click or drop scan here"}
              </p>
              <p className="text-[10px] font-mono text-ink-muted">
                {aspectRatio === "landscape"
                  ? "Horizontal landscape scan"
                  : "High-res scans (PNG, JPG, WEBP, TIFF)"}
              </p>
            </div>
          </div>
        )
      )}

      {error && <p className="text-xs text-rose-700 font-serif">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            e.target.value = "";
            handleFileUpload(file);
          }
        }}
        className="hidden"
      />
    </div>
  );
}
