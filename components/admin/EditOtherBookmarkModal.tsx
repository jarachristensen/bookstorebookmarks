"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Tag,
  Upload,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Sparkles,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NonBookstoreBookmark } from "@/db/schema";
import { compressImageIfNeeded } from "@/lib/utils/image-compressor";

export interface EditOtherBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmark: NonBookstoreBookmark | null;
  availableTags: string[];
  onTagsUpdated: (newTags: string[]) => void;
  onSuccess: (updated: NonBookstoreBookmark) => void;
}

export function EditOtherBookmarkModal({
  isOpen,
  onClose,
  bookmark,
  availableTags,
  onTagsUpdated,
  onSuccess,
}: EditOtherBookmarkModalProps) {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tradeQuantity, setTradeQuantity] = useState(1);
  const [frontImageUrl, setFrontImageUrl] = useState("");
  const [backImageUrl, setBackImageUrl] = useState("");
  const [notes, setNotes] = useState("");

  const [frontUploading, setFrontUploading] = useState(false);
  const [backUploading, setBackUploading] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);

  const frontFileInputRef = useRef<HTMLInputElement>(null);
  const backFileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when bookmark prop changes or modal opens
  useEffect(() => {
    if (bookmark && isOpen) {
      setTitle(bookmark.title || "");
      let parsedTags: string[] = [];
      if (bookmark.tags) {
        try {
          const p = JSON.parse(bookmark.tags);
          if (Array.isArray(p) && p.length > 0) parsedTags = p;
        } catch {}
      }
      if (parsedTags.length === 0 && bookmark.category) {
        parsedTags = [bookmark.category];
      }
      setTags(parsedTags.length > 0 ? parsedTags : ["General Ephemera"]);
      setTradeQuantity(bookmark.tradeQuantity ?? 1);
      setFrontImageUrl(bookmark.frontImageUrl || "");
      setBackImageUrl(bookmark.backImageUrl || "");
      setNotes(bookmark.notes || "");
      setError("");
      setIsTagDropdownOpen(false);
    }
  }, [bookmark, isOpen]);

  if (!isOpen || !bookmark) return null;

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

  const handleFrontImageUpload = async (file: File) => {
    if (!file) return;
    setFrontUploading(true);
    setError("");
    try {
      const url = await uploadImageFile(file);
      setFrontImageUrl(url);
    } catch (err: any) {
      setError(err.message || "Failed to upload front image");
    } finally {
      setFrontUploading(false);
    }
  };

  const handleBackImageUpload = async (file: File) => {
    if (!file) return;
    setBackUploading(true);
    setError("");
    try {
      const url = await uploadImageFile(file);
      setBackImageUrl(url);
    } catch (err: any) {
      setError(err.message || "Failed to upload back image");
    } finally {
      setBackUploading(false);
    }
  };

  const handleCreateNewTag = async () => {
    const trimmed = newTagInput.trim();
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
        if (!tags.includes(trimmed)) {
          setTags((prev) => [...prev.filter((t) => t !== "General Ephemera"), trimmed]);
        }
        setNewTagInput("");
      }
    } catch (err) {
      console.error("Failed to create tag:", err);
    } finally {
      setIsCreatingTag(false);
    }
  };

  const toggleTag = (tag: string) => {
    setTags((prev) => {
      const exists = prev.includes(tag);
      const updated = exists ? prev.filter((t) => t !== tag) : [...prev.filter((t) => t !== "General Ephemera"), tag];
      return updated.length > 0 ? updated : ["General Ephemera"];
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!frontImageUrl.trim()) {
      setError("Front Image URL is required.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const selectedTags = tags.length > 0 ? tags : ["General Ephemera"];
      const primaryCategory = selectedTags[0] || "General Ephemera";

      const payload = {
        title: title.trim(),
        category: primaryCategory,
        tags: selectedTags,
        tradeQuantity: Math.max(0, Number(tradeQuantity) || 0),
        frontImageUrl: frontImageUrl.trim(),
        backImageUrl: backImageUrl.trim() || null,
        dimensions: bookmark.dimensions || '2" × 7"',
        material: bookmark.material || "Printed Cardstock",
        condition: bookmark.condition || "Collectible",
        notes: notes.trim() || null,
      };

      const res = await fetch(`/api/other-bookmarks/${bookmark.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Failed to update bookmark" }));
        throw new Error(data.error || "Failed to update bookmark");
      }

      const updatedBookmark: NonBookstoreBookmark = {
        ...bookmark,
        title: payload.title,
        category: payload.category,
        tags: JSON.stringify(payload.tags),
        tradeQuantity: payload.tradeQuantity,
        frontImageUrl: payload.frontImageUrl,
        backImageUrl: payload.backImageUrl,
        dimensions: payload.dimensions,
        material: payload.material,
        condition: payload.condition,
        notes: payload.notes,
        updatedAt: new Date().toISOString(),
      };

      onSuccess(updatedBookmark);
      onClose();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF8F5] border border-[#E8E2D5] rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#E8E2D5]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
              <Edit className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-black text-lg text-stone-900">
                Edit Other Bookmark
              </h2>
              <p className="font-serif text-xs text-stone-500">
                Update scans, multi-tags, trade quantity, and catalog notes.
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

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-serif flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title & Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-xs font-serif font-bold text-stone-800 mb-1">
                Bookmark Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Seattle Public Library Vintage Card"
                className="w-full px-3 py-2 text-xs bg-white border border-[#E8E2D5] rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-600 font-serif"
              />
            </div>

            <div>
              <label className="block text-xs font-serif font-bold text-stone-800 mb-1">
                Trade Quantity
              </label>
              <div className="flex items-center border border-[#E8E2D5] rounded-xl bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setTradeQuantity((q) => Math.max(0, q - 1))}
                  className="px-2.5 py-2 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold border-r border-[#E8E2D5] cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  value={tradeQuantity}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    setTradeQuantity(isNaN(v) ? 0 : Math.max(0, v));
                  }}
                  className="w-full text-center text-xs font-mono font-bold bg-transparent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setTradeQuantity((q) => q + 1)}
                  className="px-2.5 py-2 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold border-l border-[#E8E2D5] cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Tags Studio */}
          <div className="p-4 bg-white border border-[#E8E2D5] rounded-2xl space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-serif font-bold text-stone-800 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-purple-600" />
                Tags (Multi-select)
              </label>
              <button
                type="button"
                onClick={() => setIsTagDropdownOpen((prev) => !prev)}
                className="text-xs font-serif text-purple-700 hover:underline font-bold cursor-pointer"
              >
                {isTagDropdownOpen ? "Close Tag Selector" : "+ Select / Add Tags"}
              </button>
            </div>

            {/* Selected Tags Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-100 text-purple-900 font-serif text-xs font-bold border border-purple-200"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="hover:text-red-600 cursor-pointer ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Tag Dropdown & Inline Creator */}
            {isTagDropdownOpen && (
              <div className="p-3 bg-[#FAF8F5] border border-[#E8E2D5] rounded-xl space-y-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {availableTags.map((tag) => {
                    const isSelected = tags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-serif cursor-pointer transition-all ${
                          isSelected
                            ? "bg-purple-600 text-white font-bold shadow-xs"
                            : "bg-white border border-[#E8E2D5] text-stone-700 hover:bg-stone-100"
                        }`}
                      >
                        {tag} {isSelected && "✓"}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[#E8E2D5]">
                  <input
                    type="text"
                    placeholder="Create new custom tag..."
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleCreateNewTag();
                      }
                    }}
                    className="flex-1 px-2.5 py-1 text-xs bg-white border border-[#E8E2D5] rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600 font-serif"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateNewTag}
                    disabled={isCreatingTag || !newTagInput.trim()}
                    className="bg-[#18181B] text-white hover:bg-black font-serif text-xs px-3"
                  >
                    {isCreatingTag ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5 mr-1" />}
                    Add Tag
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Front & Back Images */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Front Image */}
            <div className="p-4 bg-white border border-[#E8E2D5] rounded-2xl space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-serif font-bold text-stone-800">
                  Front Image (Required) *
                </span>
                <button
                  type="button"
                  onClick={() => frontFileInputRef.current?.click()}
                  className="text-xs font-serif text-[#2563EB] hover:underline font-bold cursor-pointer flex items-center gap-1"
                >
                  <Upload className="w-3 h-3" />
                  Replace Scan
                </button>
              </div>

              <input
                ref={frontFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFrontImageUpload(e.target.files[0]);
                }}
              />

              <div className="flex gap-3 items-center">
                <div className="relative w-20 h-28 bg-[#FAF8F5] border border-[#E8E2D5] rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                  {frontUploading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" />
                  ) : frontImageUrl ? (
                    <Image
                      src={frontImageUrl}
                      alt="Front Preview"
                      fill
                      unoptimized
                      className="object-cover object-top"
                    />
                  ) : (
                    <span className="text-[10px] font-serif text-stone-400">No Image</span>
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <input
                    type="text"
                    value={frontImageUrl}
                    onChange={(e) => setFrontImageUrl(e.target.value)}
                    placeholder="https://... or upload scan"
                    className="w-full px-2.5 py-1.5 text-xs bg-stone-50 border border-[#E8E2D5] rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB] font-mono text-[11px]"
                  />
                  <p className="text-[10px] font-serif text-stone-500">
                    Drop a new scan to auto-crop transparency margins and upload.
                  </p>
                </div>
              </div>
            </div>

            {/* Back Image */}
            <div className="p-4 bg-white border border-[#E8E2D5] rounded-2xl space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-serif font-bold text-stone-800">
                  Back Image (Optional)
                </span>
                <div className="flex items-center gap-2">
                  {backImageUrl && (
                    <button
                      type="button"
                      onClick={() => setBackImageUrl("")}
                      className="text-xs font-serif text-red-600 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => backFileInputRef.current?.click()}
                    className="text-xs font-serif text-[#2563EB] hover:underline font-bold cursor-pointer flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    {backImageUrl ? "Replace" : "Upload Scan"}
                  </button>
                </div>
              </div>

              <input
                ref={backFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleBackImageUpload(e.target.files[0]);
                }}
              />

              <div className="flex gap-3 items-center">
                <div className="relative w-20 h-28 bg-[#FAF8F5] border border-[#E8E2D5] rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                  {backUploading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" />
                  ) : backImageUrl ? (
                    <Image
                      src={backImageUrl}
                      alt="Back Preview"
                      fill
                      unoptimized
                      className="object-cover object-top"
                    />
                  ) : (
                    <span className="text-[10px] font-serif text-stone-400">No Back</span>
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <input
                    type="text"
                    value={backImageUrl}
                    onChange={(e) => setBackImageUrl(e.target.value)}
                    placeholder="https://... or upload back scan"
                    className="w-full px-2.5 py-1.5 text-xs bg-stone-50 border border-[#E8E2D5] rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB] font-mono text-[11px]"
                  />
                  <p className="text-[10px] font-serif text-stone-500">
                    Leave blank if this ephemera specimen is single-sided.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Curator Notes & Provenance */}
          <div className="p-4 bg-white border border-[#E8E2D5] rounded-2xl space-y-2 shadow-2xs">
            <label className="block text-xs font-serif font-bold text-stone-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Curator Notes / Provenance (Shown when bookmark is viewed up close)</span>
            </label>
            <p className="text-[11px] font-serif text-stone-500">
              Add any background details, publication context, historical provenance, or printing notes about this ephemera bookmark.
            </p>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Vintage 1980s library catalog promo distributed across Northwest branches. Features original typography and dual-sided letterpress printing..."
              className="w-full p-3 text-xs bg-[#FAF8F5] border border-[#E8E2D5] rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-600 font-serif leading-relaxed"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E2D5]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSaving || frontUploading || backUploading}
              className="bg-purple-600 hover:bg-purple-700 text-white font-serif font-bold flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Bookmark</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
