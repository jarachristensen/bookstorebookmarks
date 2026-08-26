"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Image as ImageIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface ImageDropzoneProps {
  label: string;
  value: string;
  onChange: (url: string, file?: File) => void;
  onFileSelected?: (file: File) => void;
  aspectRatio?: "bookmark" | "photo";
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
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setError("");
    setUploading(true);

    if (onFileSelected) {
      onFileSelected(file);
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        let errorMsg = "Upload failed";
        try {
          const data = JSON.parse(text);
          errorMsg = data.error || errorMsg;
        } catch {
          errorMsg = `Upload error (${res.status}): ${text.slice(0, 150)}`;
        }
        throw new Error(errorMsg);
      }

      const data = await res.json();
      onChange(data.url, file);
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-mono font-medium text-ink-light">
          {label} {required && <span className="text-archival-oxblood">*</span>}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-[11px] text-archival-oxblood hover:underline font-serif flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            <span>Remove</span>
          </button>
        )}
      </div>

      {value ? (
        <div
          className={`relative rounded-xl overflow-hidden border-2 border-parchment-border bg-stone-900 shadow-sm ${
            aspectRatio === "bookmark" ? "aspect-[1/3.1] max-w-[200px] mx-auto" : "aspect-[16/10] w-full"
          }`}
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
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-serif bg-white/90 text-ink"
            >
              Replace
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed border-parchment-border hover:border-archival-amber rounded-xl p-6 text-center cursor-pointer bg-parchment-light hover:bg-parchment-muted/50 transition-colors flex flex-col items-center justify-center gap-2 ${
            aspectRatio === "bookmark" ? "aspect-[1/2.8] max-w-[200px] mx-auto" : "aspect-[16/10] w-full"
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-parchment-muted flex items-center justify-center text-ink-muted">
            <Upload className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-serif font-semibold text-ink">
              {uploading ? "Uploading scan..." : "Click or drop scan here"}
            </p>
            <p className="text-[10px] font-mono text-ink-muted">PNG, JPG, WEBP, or SVG</p>
          </div>
        </div>
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
