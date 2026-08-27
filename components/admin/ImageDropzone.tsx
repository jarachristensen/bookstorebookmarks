"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Link as LinkIcon, Loader2, RotateCw } from "lucide-react";
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
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [error, setError] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (rawFile: File) => {
    if (!rawFile) return;
    setError("");
    setUploading(true);
    setUploadProgress("Optimizing scan...");

    if (onFileSelected) {
      onFileSelected(rawFile);
    }

    try {
      // 1. Optimize oversized image in browser (< 2MB)
      const file = await compressImageIfNeeded(rawFile);

      setUploadProgress("Uploading to archive...");

      // 2. Upload via standard API route (supports Vercel Blob and local disk)
      const formData = new FormData();
      formData.append("file", file);

      // Abort controller with 30s timeout so it never hangs
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

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

      onChange(data.url, rawFile);
    } catch (err: any) {
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
    if (!value || uploading) return;

    setError("");
    setUploading(true);
    setUploadProgress("Rotating scan 90°...");

    try {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = value;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image for rotation"));
      });

      const canvas = document.createElement("canvas");
      // Swapping width & height for 90-degree turn
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
      setError(err.message || "Failed to rotate image");
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
      onChange(customUrl.trim());
      setShowUrlInput(false);
      setCustomUrl("");
    }
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
        <div className="flex items-center gap-2.5">
          {value && (
            <button
              type="button"
              onClick={handleRotate90}
              disabled={uploading}
              className="text-[11px] text-archival-oxblood hover:underline font-serif flex items-center gap-1 cursor-pointer bg-white/70 px-2 py-0.5 rounded border border-parchment-border hover:bg-white transition-colors"
              title="Rotate scan 90° Clockwise"
            >
              <RotateCw className="w-3 h-3 text-archival-amber" />
              <span>Rotate 90°</span>
            </button>
          )}

          {!value && (
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-[11px] text-archival-oxblood hover:underline font-serif flex items-center gap-1 cursor-pointer"
            >
              <LinkIcon className="w-3 h-3" />
              <span>{showUrlInput ? "Drop file instead" : "Paste URL"}</span>
            </button>
          )}

          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-[11px] text-archival-oxblood hover:underline font-serif flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Remove</span>
            </button>
          )}
        </div>
      </div>

      {showUrlInput && !value && (
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

      {value ? (
        <div
          className={`relative rounded-xl overflow-hidden border-2 border-parchment-border bg-stone-900 shadow-sm ${getAspectClasses()}`}
        >
          <Image
            src={value}
            alt={label}
            fill
            className="object-contain p-2"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRotate90}
              disabled={uploading}
              className="text-xs font-serif bg-white/90 text-ink flex items-center gap-1.5"
            >
              <RotateCw className="w-3 h-3 text-archival-amber" />
              <span>Rotate 90°</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-serif bg-white/90 text-ink"
            >
              Replace Scan
            </Button>
          </div>
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
                {aspectRatio === "landscape" ? "Horizontal landscape scan" : "High-res scans (PNG, JPG, WEBP, TIFF)"}
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
            handleFileUpload(e.target.files[0]);
          }
        }}
        className="hidden"
      />
    </div>
  );
}
