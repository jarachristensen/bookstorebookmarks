"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2, Camera, AlertCircle, Plus } from "lucide-react";
import { compressImageIfNeeded } from "@/lib/utils/image-compressor";

export interface TradeImageUploaderProps {
  images: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export function TradeImageUploader({
  images = [],
  onChange,
  maxImages = 5,
  disabled = false,
}: TradeImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAddMore = images.length < maxImages && !disabled;

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArray.length === 0) {
      setError("Please select image files (PNG, JPG, WebP).");
      return;
    }

    const availableSlots = maxImages - images.length;
    if (availableSlots <= 0) {
      setError(`You have reached the maximum of ${maxImages} images.`);
      return;
    }

    const filesToUpload = fileArray.slice(0, availableSlots);
    setUploading(true);
    setError("");

    try {
      const uploadedUrls: string[] = [];

      for (const rawFile of filesToUpload) {
        const compressed = await compressImageIfNeeded(rawFile);
        const formData = new FormData();
        formData.append("file", compressed, rawFile.name);

        const res = await fetch("/api/trades/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to upload ${rawFile.name}`);
        }

        const data = await res.json();
        if (data.url) {
          uploadedUrls.push(data.url);
        }
      }

      onChange([...images, ...uploadedUrls]);
    } catch (err: any) {
      console.error("Trade image upload error:", err);
      setError(err.message || "Failed to upload image(s).");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (indexToRemove: number) => {
    if (disabled) return;
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (canAddMore) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!canAddMore) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-mono text-stone-500 uppercase tracking-wider">
          Upload Photos of Your Bookmarks (Optional)
        </label>
        <span className="text-[10px] font-mono text-stone-400">
          {images.length} of {maxImages} uploaded
        </span>
      </div>

      {/* Grid of uploaded images + upload button */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
        {images.map((url, idx) => (
          <div
            key={`${url}-${idx}`}
            className="group relative aspect-3/4 rounded-xl overflow-hidden border border-[#E8E2D5] bg-stone-100 shadow-2xs"
          >
            <Image
              src={url}
              alt={`Offered bookmark ${idx + 1}`}
              fill
              unoptimized
              className="object-cover object-center"
            />
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-1 right-1 p-1 rounded-full bg-black/70 hover:bg-rose-600 text-white transition-colors cursor-pointer shadow-xs"
                title="Remove photo"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            <div className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-black/60 text-white">
              #{idx + 1}
            </div>
          </div>
        ))}

        {canAddMore && (
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`aspect-3/4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-2 text-center transition-all cursor-pointer ${
              isDragOver
                ? "border-[#2563EB] bg-blue-50/50"
                : "border-[#E8E2D5] hover:border-stone-400 bg-[#FAF8F5]/60 hover:bg-white"
            } ${uploading ? "opacity-60 pointer-events-none" : ""}`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-1">
                <Loader2 className="w-5 h-5 text-[#2563EB] animate-spin" />
                <span className="text-[10px] font-mono text-stone-500">Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 text-stone-500">
                <div className="p-1.5 rounded-full bg-stone-100 group-hover:bg-stone-200">
                  <Camera className="w-4 h-4 text-stone-600" />
                </div>
                <span className="text-[10px] font-serif font-semibold text-stone-700 leading-tight">
                  + Add Photo
                </span>
                <span className="text-[9px] font-mono text-stone-400">Drag or click</span>
              </div>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
            e.target.value = "";
          }
        }}
      />

      {error && (
        <div className="flex items-center gap-1.5 text-[11px] font-serif text-rose-600 pt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
