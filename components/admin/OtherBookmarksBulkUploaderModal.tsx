"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  Upload,
  Plus,
  Trash2,
  X,
  Check,
  Tag,
  Loader2,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowRight,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { compressImageIfNeeded } from "@/lib/utils/image-compressor";

export interface BulkUploaderRow {
  id: string;
  title: string;
  frontFile: File | null;
  frontUrl: string;
  frontUploading: boolean;
  backFile: File | null;
  backUrl: string;
  backUploading: boolean;
  tags: string[];
  quantity: number;
  notes: string;
  error?: string;
}

export interface OtherBookmarksBulkUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableTags: string[];
  onTagsUpdated: (newTags: string[]) => void;
  onSuccess: () => void;
}

export function OtherBookmarksBulkUploaderModal({
  isOpen,
  onClose,
  availableTags,
  onTagsUpdated,
  onSuccess,
}: OtherBookmarksBulkUploaderModalProps) {
  const [batchTags, setBatchTags] = useState<string[]>([]);

  function createEmptyRow(initialTags?: string[]): BulkUploaderRow {
    return {
      id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: "",
      frontFile: null,
      frontUrl: "",
      frontUploading: false,
      backFile: null,
      backUrl: "",
      backUploading: false,
      tags: initialTags && initialTags.length > 0 ? [...initialTags] : ["General Ephemera"],
      quantity: 1,
      notes: "",
    };
  }

  const [rows, setRows] = useState<BulkUploaderRow[]>(() => [createEmptyRow()]);
  const [newTagInput, setNewTagInput] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [activeDropdownRowId, setActiveDropdownRowId] = useState<string | null>(null);

  const batchFileInputRef = useRef<HTMLInputElement>(null);

  // Upload an image file to /api/upload
  const uploadImageFile = async (file: File): Promise<string> => {
    const optimized = await compressImageIfNeeded(file);
    const formData = new FormData();
    formData.append("file", optimized);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Upload failed" }));
      throw new Error(err.error || "Upload failed");
    }

    const data = await res.json();
    return data.url || data.path;
  };

  // Handle single slot file drop / selection
  const handleSingleImageUpload = async (
    rowId: string,
    file: File,
    side: "front" | "back"
  ) => {
    if (!file) return;

    // Set uploading state
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        return {
          ...r,
          [side === "front" ? "frontUploading" : "backUploading"]: true,
          [side === "front" ? "frontFile" : "backFile"]: file,
          error: undefined,
        };
      })
    );

    try {
      const uploadedUrl = await uploadImageFile(file);

      // Clean title suggestion from filename if title is empty
      const cleanedTitle = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase())
        .trim();

      setRows((prev) =>
        prev.map((r) => {
          if (r.id !== rowId) return r;
          return {
            ...r,
            [side === "front" ? "frontUrl" : "backUrl"]: uploadedUrl,
            [side === "front" ? "frontUploading" : "backUploading"]: false,
            title: r.title || (side === "front" ? cleanedTitle : r.title),
          };
        })
      );
    } catch (err: any) {
      setRows((prev) =>
        prev.map((r) => {
          if (r.id !== rowId) return r;
          return {
            ...r,
            [side === "front" ? "frontUploading" : "backUploading"]: false,
            error: err.message || "Failed to upload image",
          };
        })
      );
    }
  };

  // Handle dropping batch of files at top
  const handleBatchFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArray.length === 0) return;

    const newRows: BulkUploaderRow[] = fileArray.map((file, i) => {
      const cleanedTitle = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase())
        .trim();

      return {
        id: `batch-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        title: cleanedTitle,
        frontFile: file,
        frontUrl: "",
        frontUploading: true,
        backFile: null,
        backUrl: "",
        backUploading: false,
        tags: batchTags.length > 0 ? [...batchTags] : ["General Ephemera"],
        quantity: 1,
        notes: "",
      };
    });

    // Replace initial empty row if unmodified, or append
    setRows((prev) => {
      const filtered = prev.filter((r) => r.frontUrl || r.title.trim() || r.frontUploading);
      return [...filtered, ...newRows];
    });

    // Upload files concurrently
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const targetRow = newRows[i];
      try {
        const url = await uploadImageFile(file);
        setRows((prev) =>
          prev.map((r) => (r.id === targetRow.id ? { ...r, frontUrl: url, frontUploading: false } : r))
        );
      } catch (err: any) {
        setRows((prev) =>
          prev.map((r) =>
            r.id === targetRow.id
              ? { ...r, frontUploading: false, error: err.message || "Upload failed" }
              : r
          )
        );
      }
    }
  };

  // Quick tag creation
  const handleCreateNewTag = async (tagName: string) => {
    const trimmed = tagName.trim();
    if (!trimmed) return;
    setIsCreatingTag(true);
    try {
      const res = await fetch("/api/other-bookmarks/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.tags) {
          onTagsUpdated(data.tags);
        }
        setNewTagInput("");
        return trimmed;
      }
    } catch (err) {
      console.error("Failed to create tag:", err);
    } finally {
      setIsCreatingTag(false);
    }
    return trimmed;
  };

  // Toggle tag for a specific row
  const toggleRowTag = (rowId: string, tag: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        const exists = r.tags.includes(tag);
        const updated = exists ? r.tags.filter((t) => t !== tag) : [...r.tags, tag];
        return { ...r, tags: updated.length > 0 ? updated : ["General Ephemera"] };
      })
    );
  };

  // Apply batch tags to all rows
  const applyBatchTagsToAll = () => {
    if (batchTags.length === 0) return;
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        tags: Array.from(new Set([...r.tags.filter((t) => t !== "General Ephemera"), ...batchTags])),
      }))
    );
  };

  // Save all rows
  const handleSaveAll = async () => {
    setSubmitError("");

    // Validate rows
    const validRows = rows.filter((r) => r.title.trim() && r.frontUrl.trim());
    if (validRows.length === 0) {
      setSubmitError("Please add at least one complete bookmark with a Title and Front Image.");
      return;
    }

    const anyUploading = rows.some((r) => r.frontUploading || r.backUploading);
    if (anyUploading) {
      setSubmitError("Please wait for all images to finish uploading before saving.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = validRows.map((r, idx) => ({
        title: r.title.trim(),
        tags: r.tags,
        category: r.tags[0] || "General Ephemera",
        frontImageUrl: r.frontUrl.trim(),
        backImageUrl: r.backUrl.trim() || null,
        tradeQuantity: r.quantity,
        notes: r.notes.trim() || null,
        displayOrder: idx,
      }));

      const res = await fetch("/api/other-bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Failed to save bookmarks" }));
        throw new Error(data.error || "Failed to save bookmarks");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred while saving.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF8F5] border border-[#E8E2D5] rounded-3xl w-full max-w-6xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#E8E2D5]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#2563EB]/10 rounded-xl text-[#2563EB]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-black text-lg text-stone-900">
                Bulk Bookmark Uploader & Multi-Tag Studio
              </h2>
              <p className="font-serif text-xs text-stone-500">
                Drag and drop scans, auto-trim margins, assign multiple tags, and set stock quantities in batch.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Top Multi-file Dropzone Intake */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (e.dataTransfer.files) {
                handleBatchFiles(e.dataTransfer.files);
              }
            }}
            onClick={() => batchFileInputRef.current?.click()}
            className="border-2 border-dashed border-[#2563EB]/40 hover:border-[#2563EB] bg-blue-50/40 hover:bg-blue-50/70 transition-all rounded-2xl p-6 text-center cursor-pointer group flex flex-col items-center justify-center gap-2"
          >
            <input
              ref={batchFileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  handleBatchFiles(e.target.files);
                }
              }}
            />
            <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-blue-200 flex items-center justify-center text-[#2563EB] group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <p className="font-serif font-bold text-sm text-stone-800">
                Drag and drop multiple bookmark scans here, or click to browse
              </p>
              <p className="font-serif text-xs text-stone-500">
                Supports PNG, JPEG, WEBP. Transparency padding is auto-cropped instantly.
              </p>
            </div>
          </div>

          {/* Batch Tags Toolbar */}
          <div className="bg-white border border-[#E8E2D5] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-serif text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#2563EB]" />
                Batch Tag Presets:
              </span>
              {availableTags.map((tag) => {
                const selected = batchTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      setBatchTags((prev) =>
                        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                      )
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs font-serif transition-all cursor-pointer ${
                      selected
                        ? "bg-[#2563EB] text-white font-bold shadow-xs"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}

              {/* Inline Add New Tag */}
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="+ New tag..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter" && newTagInput.trim()) {
                      e.preventDefault();
                      const created = await handleCreateNewTag(newTagInput);
                      if (created) {
                        setBatchTags((prev) => [...prev, created]);
                      }
                    }
                  }}
                  className="px-2 py-1 text-xs border border-[#E8E2D5] rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB] w-28 font-serif"
                />
                {newTagInput.trim() && (
                  <button
                    type="button"
                    onClick={async () => {
                      const created = await handleCreateNewTag(newTagInput);
                      if (created) {
                        setBatchTags((prev) => [...prev, created]);
                      }
                    }}
                    disabled={isCreatingTag}
                    className="p-1 bg-[#18181B] text-white rounded-md text-xs cursor-pointer"
                  >
                    {isCreatingTag ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                  </button>
                )}
              </div>
            </div>

            {batchTags.length > 0 && (
              <button
                type="button"
                onClick={applyBatchTagsToAll}
                className="px-3 py-1 bg-blue-50 text-[#2563EB] hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-serif font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Apply Selected Tags to All Rows
              </button>
            )}
          </div>

          {/* Staging Rows Table / Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-serif text-xs font-bold text-stone-600 uppercase tracking-wider">
                Staged Bookmarks ({rows.length})
              </span>
              <button
                type="button"
                onClick={() => setRows((prev) => [...prev, createEmptyRow()])}
                className="text-xs font-serif font-bold text-[#2563EB] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Another Row
              </button>
            </div>

            <div className="space-y-3">
              {rows.map((row, index) => (
                <div
                  key={row.id}
                  className="bg-white border border-[#E8E2D5] rounded-2xl p-4 shadow-2xs flex flex-col lg:flex-row items-start lg:items-center gap-4 transition-all hover:border-stone-400"
                >
                  {/* Row Number */}
                  <span className="font-mono text-xs font-bold text-stone-400 w-6 text-center shrink-0">
                    #{index + 1}
                  </span>

                  {/* Front Image Dropzone Slot */}
                  <div className="relative w-20 h-24 bg-stone-50 border-2 border-dashed border-[#E8E2D5] hover:border-[#2563EB] rounded-xl overflow-hidden shrink-0 flex flex-col items-center justify-center cursor-pointer group">
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleSingleImageUpload(row.id, e.target.files[0], "front");
                        }
                      }}
                    />
                    {row.frontUploading ? (
                      <div className="flex flex-col items-center gap-1 text-[#2563EB]">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-[10px] font-serif">Uploading</span>
                      </div>
                    ) : row.frontUrl ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={row.frontUrl}
                          alt="Front"
                          fill
                          className="object-contain p-1"
                          unoptimized
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] text-center font-mono py-0.5">
                          Front ✓
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-stone-400 group-hover:text-[#2563EB]">
                        <Upload className="w-4 h-4" />
                        <span className="text-[10px] font-serif font-bold text-center leading-tight">
                          + Front *
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Back Image Dropzone Slot */}
                  <div className="relative w-20 h-24 bg-stone-50 border-2 border-dashed border-[#E8E2D5] hover:border-[#2563EB] rounded-xl overflow-hidden shrink-0 flex flex-col items-center justify-center cursor-pointer group">
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleSingleImageUpload(row.id, e.target.files[0], "back");
                        }
                      }}
                    />
                    {row.backUploading ? (
                      <div className="flex flex-col items-center gap-1 text-[#2563EB]">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-[10px] font-serif">Uploading</span>
                      </div>
                    ) : row.backUrl ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={row.backUrl}
                          alt="Back"
                          fill
                          className="object-contain p-1"
                          unoptimized
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] text-center font-mono py-0.5">
                          Back ✓
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-stone-400 group-hover:text-[#2563EB]">
                        <Upload className="w-4 h-4" />
                        <span className="text-[10px] font-serif text-center leading-tight">
                          + Back (Opt)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Title & Notes */}
                  <div className="flex-1 space-y-2 w-full min-w-[200px]">
                    <div>
                      <label className="block text-[11px] font-serif font-bold text-stone-700 mb-0.5">
                        Bookmark Title *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Seattle Public Library Vintage Card"
                        value={row.title}
                        onChange={(e) =>
                          setRows((prev) =>
                            prev.map((r) => (r.id === row.id ? { ...r, title: e.target.value } : r))
                          )
                        }
                        className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-[#E8E2D5] rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB] font-serif"
                      />
                    </div>

                    {/* Multi-Tag Chips & Dropdown Selector */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-serif font-bold text-stone-700">
                          Tags (Multi-select)
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveDropdownRowId((prev) => (prev === row.id ? null : row.id))
                          }
                          className="text-[11px] font-serif text-[#2563EB] hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <Tag className="w-3 h-3" />
                          {activeDropdownRowId === row.id ? "Close Tags" : "+ Select Tags"}
                        </button>
                      </div>

                      {/* Selected tags badges */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {row.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#2563EB]/10 text-[#2563EB] font-serif text-[11px] font-bold border border-[#2563EB]/20"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => toggleRowTag(row.id, tag)}
                              className="hover:text-red-500 cursor-pointer ml-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>

                      {/* Tag Dropdown Menu for this row */}
                      {activeDropdownRowId === row.id && (
                        <div className="mt-2 p-2.5 bg-stone-50 border border-[#E8E2D5] rounded-xl flex flex-wrap items-center gap-1.5 shadow-2xs">
                          {availableTags.map((tag) => {
                            const isSelected = row.tags.includes(tag);
                            return (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => toggleRowTag(row.id, tag)}
                                className={`px-2 py-0.5 rounded text-[11px] font-serif cursor-pointer transition-colors ${
                                  isSelected
                                    ? "bg-[#2563EB] text-white font-bold"
                                    : "bg-white border border-[#E8E2D5] text-stone-700 hover:bg-stone-100"
                                }`}
                              >
                                {tag} {isSelected && "✓"}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="shrink-0 w-28">
                    <label className="block text-[11px] font-serif font-bold text-stone-700 mb-1">
                      Qty Available
                    </label>
                    <div className="flex items-center border border-[#E8E2D5] rounded-lg bg-stone-50 overflow-hidden">
                      <button
                        type="button"
                        onClick={() =>
                          setRows((prev) =>
                            prev.map((r) =>
                              r.id === row.id ? { ...r, quantity: Math.max(0, r.quantity - 1) } : r
                            )
                          )
                        }
                        className="px-2 py-1.5 bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold border-r border-[#E8E2D5] cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={row.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setRows((prev) =>
                            prev.map((r) =>
                              r.id === row.id ? { ...r, quantity: isNaN(val) ? 0 : Math.max(0, val) } : r
                            )
                          );
                        }}
                        className="w-full text-center text-xs font-mono font-bold bg-transparent focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setRows((prev) =>
                            prev.map((r) => (r.id === row.id ? { ...r, quantity: r.quantity + 1 } : r))
                          )
                        }
                        className="px-2 py-1.5 bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold border-l border-[#E8E2D5] cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Remove Row */}
                  <button
                    type="button"
                    onClick={() => {
                      if (rows.length > 1) {
                        setRows((prev) => prev.filter((r) => r.id !== row.id));
                      } else {
                        setRows([createEmptyRow()]);
                      }
                    }}
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Remove row"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {submitError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-serif flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-[#E8E2D5]">
          <div className="font-serif text-xs text-stone-500">
            {rows.filter((r) => r.title.trim() && r.frontUrl).length} of {rows.length} bookmarks ready to upload
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSaveAll}
              disabled={isSubmitting}
              className="bg-[#18181B] text-white hover:bg-black font-serif flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving All Bookmarks...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Save All ({rows.filter((r) => r.title.trim() && r.frontUrl).length}) Bookmarks
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
