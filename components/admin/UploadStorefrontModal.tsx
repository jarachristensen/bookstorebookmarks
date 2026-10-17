"use client";

import React, { useState, useRef, useMemo } from "react";
import Image from "next/image";
import {
  Upload,
  X,
  Loader2,
  Store,
  CheckCircle2,
  AlertCircle,
  FileImage,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatStoreNameFromFilename } from "@/lib/utils/storefront";

export interface UploadStorefrontModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookstores: Array<{ id: string; name: string; city?: string | null }>;
  onSuccess: (result: {
    bookstoreId: string;
    bookstoreName: string;
    imageUrl: string;
    isNew: boolean;
  }) => void;
}

export function UploadStorefrontModal({
  isOpen,
  onClose,
  bookstores,
  onSuccess,
}: UploadStorefrontModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedBookstoreId, setSelectedBookstoreId] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-derived store name proposal from chosen filename
  const derivedStoreName = useMemo(() => {
    if (!file) return "";
    return formatStoreNameFromFilename(file.name);
  }, [file]);

  // Clean up object URL when modal closes or file changes
  const resetState = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
    setSelectedBookstoreId("");
    setError("");
    setIsUploading(false);
    setIsDragOver(false);
  };

  const handleClose = () => {
    if (isUploading) return;
    resetState();
    onClose();
  };

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile) return;
    setError("");

    // Verify it is an image
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select an image file (.png, .jpg, or .webp).");
      return;
    }

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));

    // Try to auto-match with existing bookstores by derived name
    const derivedName = formatStoreNameFromFilename(selectedFile.name).toLowerCase();
    const matchedStore = bookstores.find(
      (b) => b.name.toLowerCase() === derivedName
    );
    if (matchedStore) {
      setSelectedBookstoreId(matchedStore.id);
    } else {
      setSelectedBookstoreId(""); // Default to auto-create / new store
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a storefront image to upload.");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (selectedBookstoreId) {
        formData.append("bookstoreId", selectedBookstoreId);
      }

      const res = await fetch("/api/storefronts/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload storefront image");
      }

      onSuccess({
        bookstoreId: data.bookstoreId,
        bookstoreName: data.bookstoreName,
        imageUrl: data.imageUrl,
        isNew: data.isNew,
      });

      resetState();
      onClose();
    } catch (err: any) {
      console.error("Storefront upload failed:", err);
      setError(err.message || "Failed to upload storefront image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  // Sorted list of bookstores for selection
  const sortedBookstores = [...bookstores].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-[#FAF8F5] border border-[#E8E2D5] rounded-xl shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8E2D5] flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#2563EB]/10 rounded-lg text-[#2563EB]">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-900 font-serif">
                Upload Storefront Cutout
              </h2>
              <p className="text-xs text-stone-500 font-serif">
                Add storefront artwork directly to Curator&apos;s Cabinet
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs font-serif flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Drag & Drop Zone */}
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5 font-serif">
              Storefront Cutout Image <span className="text-rose-500">*</span>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            {!file ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                  isDragOver
                    ? "border-[#2563EB] bg-[#2563EB]/5"
                    : "border-stone-300 hover:border-[#2563EB]/60 hover:bg-stone-50/50"
                }`}
              >
                <div className="p-3 bg-stone-100 rounded-full text-stone-600">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm font-medium text-stone-800 font-serif">
                  Drag and drop cutout image here, or{" "}
                  <span className="text-[#2563EB] underline">browse</span>
                </div>
                <p className="text-xs text-stone-400 font-serif">
                  PNG with transparent cutout recommended (e.g.,{" "}
                  <code>bookbaron-storefront.png</code>)
                </p>
              </div>
            ) : (
              <div className="relative border border-[#E8E2D5] rounded-xl p-4 bg-white shadow-2xs flex flex-col items-center gap-3">
                {previewUrl && (
                  <div className="relative w-full h-44 bg-stone-50 rounded-lg border border-stone-200 overflow-hidden flex items-center justify-center p-2">
                    <img
                      src={previewUrl}
                      alt="Storefront Preview"
                      className="max-h-full max-w-full object-contain drop-shadow-sm"
                    />
                  </div>
                )}
                <div className="w-full flex items-center justify-between text-xs font-serif text-stone-600 px-1">
                  <div className="flex items-center gap-1.5 truncate max-w-[280px]">
                    <FileImage className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                    <span className="font-medium text-stone-900 truncate">
                      {file.name}
                    </span>
                    <span className="text-stone-400 shrink-0">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      resetState();
                      fileInputRef.current?.click();
                    }}
                    className="text-xs text-[#2563EB] hover:bg-blue-50 cursor-pointer h-7 px-2"
                  >
                    Change
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Bookstore Association */}
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5 font-serif">
              Associate With Bookstore
            </label>
            <select
              value={selectedBookstoreId}
              onChange={(e) => setSelectedBookstoreId(e.target.value)}
              className="w-full text-xs font-serif bg-white border border-[#E8E2D5] rounded-lg px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 cursor-pointer"
            >
              <option value="">
                {derivedStoreName
                  ? `✨ Auto-create new bookstore ("${derivedStoreName}")`
                  : "✨ Auto-create new bookstore from filename"}
              </option>
              <optgroup label="Or link to existing bookstore:">
                {sortedBookstores.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} {b.city ? `(${b.city})` : ""}
                  </option>
                ))}
              </optgroup>
            </select>
            <p className="mt-1.5 text-xs text-stone-500 font-serif">
              {selectedBookstoreId ? (
                <span>
                  This image will be set as the official storefront for the selected bookstore.
                </span>
              ) : derivedStoreName ? (
                <span className="text-stone-600 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#2563EB]" />
                  A new bookstore named <strong>&quot;{derivedStoreName}&quot;</strong> will be created if it does not already exist.
                </span>
              ) : (
                <span>
                  The bookstore name will be automatically derived from the uploaded filename.
                </span>
              )}
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#E8E2D5] flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isUploading}
              className="text-xs font-serif border-[#E8E2D5] text-stone-600 hover:text-stone-900 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!file || isUploading}
              className="text-xs font-serif bg-[#2563EB] hover:bg-blue-700 text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading Storefront...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Storefront</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
