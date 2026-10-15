"use client";

import React, { useState, useRef } from "react";
import {
  Plus,
  Trash2,
  Newspaper,
  Image as ImageIcon,
  FileText,
  Sparkles,
  Loader2,
  UploadCloud,
  Star,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ImageDropzone } from "./ImageDropzone";
import { parseClippingFilename } from "@/lib/utils/clipping-parser";
import { compressImageIfNeeded } from "@/lib/utils/image-compressor";
import { CustomTimelineEvent } from "@/db/schema";

export interface MediaItem {
  id?: string;
  mediaType: string;
  imageUrl: string;
  caption: string;
  sourcePublication?: string;
  publicationDate?: string;
  transcriptionText?: string;
  isStorefront?: boolean;
  mediaTag?: string;
}

export interface MediaManagerProps {
  mediaList: MediaItem[];
  onChange: (newList: MediaItem[]) => void;
  timelineEvents?: CustomTimelineEvent[];
  onTimelineEventsChange?: (newEvents: CustomTimelineEvent[]) => void;
  onAutoAddToTimeline?: (entry: {
    year: number;
    label: string;
    description: string;
    mediaItem: MediaItem;
  }) => void;
  bookstoreName?: string;
  autoAddToTimeline?: boolean;
}

export function MediaManager({
  mediaList,
  onChange,
  timelineEvents,
  onTimelineEventsChange,
  onAutoAddToTimeline,
  bookstoreName,
  autoAddToTimeline: initialAutoAdd = true,
}: MediaManagerProps) {
  const [autoAddToTimeline, setAutoAddToTimeline] = useState<boolean>(initialAutoAdd);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<string>("");
  const bulkFileInputRef = useRef<HTMLInputElement>(null);

  const addMedia = () => {
    onChange([
      ...mediaList,
      {
        id: `media-${Date.now()}`,
        mediaType: "newspaper",
        imageUrl: "",
        caption: "Archival Press Clipping",
        sourcePublication: "",
        publicationDate: "",
        transcriptionText: "",
        isStorefront: false,
      },
    ]);
  };

  const removeMedia = (index: number) => {
    onChange(mediaList.filter((_, i) => i !== index));
  };

  const updateMedia = (index: number, updated: Partial<MediaItem>) => {
    const next = [...mediaList];
    next[index] = { ...next[index], ...updated };
    onChange(next);
  };

  const setStorefrontHero = (selectedIndex: number) => {
    const next = mediaList.map((item, idx) => ({
      ...item,
      isStorefront: idx === selectedIndex ? !item.isStorefront : false,
    }));
    onChange(next);
  };

  const isItemInTimeline = (item: MediaItem, index: number): boolean => {
    if (!timelineEvents) return false;
    return timelineEvents.some((ev) => {
      if (item.id && ev.mediaId) {
        return ev.mediaId === item.id;
      }
      if (item.id) {
        return ev.id === `ev-${item.id}` || ev.id.startsWith(`ev-${item.id}-`);
      }
      if (item.imageUrl && ev.mediaUrl) {
        return ev.mediaUrl === item.imageUrl;
      }
      return ev.id === `ev-media-${index}`;
    });
  };

  const handleToggleItemTimeline = (index: number, willAdd: boolean) => {
    const item = mediaList[index];
    if (!item) return;

    if (willAdd) {
      const matchYear = (text?: string): number => {
        if (!text) return 1950;
        const normalized = text.replace(/[_/\\.-]/g, " ");
        const m = normalized.match(/\b(18\d{2}|19\d{2}|20\d{2})\b/);
        return m ? parseInt(m[1], 10) : 1950;
      };

      const year =
        matchYear(item.publicationDate) !== 1950
          ? matchYear(item.publicationDate)
          : matchYear(item.caption);

      const label = (
        item.caption ||
        item.sourcePublication ||
        "Archival Press Clipping"
      ).toUpperCase();

      const pubName = item.sourcePublication || "press archives";
      const dateText = item.publicationDate || String(year);
      const description = `Historical press documentation published in ${pubName} (${dateText}).`;

      const milestoneId = `ev-${item.id || Date.now()}-${index}`;
      const newEvent: CustomTimelineEvent = {
        id: milestoneId,
        year,
        label,
        description,
        type: "press",
        mediaId: item.id,
        mediaUrl: item.imageUrl,
        mediaCaption: label,
      };

      if (onTimelineEventsChange) {
        const currentEvents = timelineEvents || [];
        const filtered = currentEvents.filter(
          (ev) =>
            ev.mediaId !== item.id &&
            ev.id !== milestoneId &&
            ev.id !== `ev-${item.id}` &&
            !ev.id.startsWith(`ev-${item.id}-`) &&
            (!item.imageUrl || ev.mediaUrl !== item.imageUrl)
        );
        onTimelineEventsChange([...filtered, newEvent]);
      }

      if (onAutoAddToTimeline) {
        onAutoAddToTimeline({
          year,
          label,
          description,
          mediaItem: item,
        });
      }
    } else {
      if (onTimelineEventsChange && timelineEvents) {
        const filtered = timelineEvents.filter((ev) => {
          if (item.id && ev.mediaId) {
            return ev.mediaId !== item.id;
          }
          if (item.id) {
            return ev.id !== `ev-${item.id}` && !ev.id.startsWith(`ev-${item.id}-`);
          }
          if (item.imageUrl && ev.mediaUrl) {
            return ev.mediaUrl !== item.imageUrl;
          }
          return ev.id !== `ev-media-${index}`;
        });
        onTimelineEventsChange(filtered);
      }
    }
  };

  const handleImageUploaded = (index: number, url: string, file?: File) => {
    const item = mediaList[index];
    if (!item) return;

    let updates: Partial<MediaItem> = { imageUrl: url };

    // Auto-parse filename if file is available
    if (file && file.name) {
      const parsed = parseClippingFilename(file.name);
      if (parsed.sourcePublication && (!item.sourcePublication || item.sourcePublication === "")) {
        updates.sourcePublication = parsed.sourcePublication;
      }
      if (parsed.publicationDate && (!item.publicationDate || item.publicationDate === "")) {
        updates.publicationDate = parsed.publicationDate;
      }
      if (
        parsed.caption &&
        (!item.caption || item.caption === "" || item.caption === "Archival Press Clipping")
      ) {
        updates.caption = parsed.caption;
      }
    }

    updateMedia(index, updates);
  };

  /**
   * Bulk upload multiple scans at once, auto-parsing titles & dates from filenames
   */
  const handleBulkUploadFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArray.length === 0) return;

    setBulkUploading(true);
    setOcrError("");

    const newItems: MediaItem[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setBulkProgress(`Uploading ${i + 1} of ${fileArray.length}: ${file.name}...`);

      try {
        const optimizedFile = await compressImageIfNeeded(file);
        const formData = new FormData();
        formData.append("file", optimizedFile);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          console.error("Bulk upload failed for file:", file.name);
          continue;
        }

        const data = await res.json();
        const parsed = parseClippingFilename(file.name);

        const isLikelyPhoto =
          file.name.toLowerCase().includes("storefront") ||
          file.name.toLowerCase().includes("exterior") ||
          file.name.toLowerCase().includes("interior") ||
          file.name.toLowerCase().includes("photo");

        const newItem: MediaItem = {
          id: `media-${Date.now()}-${i}`,
          mediaType: isLikelyPhoto ? "photo" : "newspaper",
          imageUrl: data.url,
          caption: parsed.caption || "Archival Press Clipping",
          sourcePublication: parsed.sourcePublication || "",
          publicationDate: parsed.publicationDate || "",
          transcriptionText: "",
          isStorefront: file.name.toLowerCase().includes("storefront"),
        };
        newItems.push(newItem);
      } catch (err) {
        console.error("Failed uploading bulk file:", file.name, err);
      }
    }

    if (newItems.length > 0) {
      onChange([...mediaList, ...newItems]);
    }

    setBulkUploading(false);
    setBulkProgress("");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-[#F43F7A]" />
            <span>Archival Photos &amp; Newspaper Clippings</span>
          </h3>
          <p className="text-xs text-stone-500 font-serif">
            Upload scans for automatic publication and date detection, or bulk drop multiple clippings at once.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => bulkFileInputRef.current?.click()}
            disabled={bulkUploading}
            className="text-xs font-serif flex items-center gap-1.5 bg-[#FAF8F5] border-[#E8E2D5] hover:bg-white text-stone-900"
          >
            {bulkUploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F43F7A]" />
            ) : (
              <UploadCloud className="w-3.5 h-3.5 text-[#F43F7A]" />
            )}
            <span>Bulk Upload Scans</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addMedia}
            className="text-xs font-serif flex items-center gap-1 border-[#E8E2D5] hover:bg-white"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Single Item</span>
          </Button>
        </div>
      </div>

      {/* Hidden Multi-file input */}
      <input
        ref={bulkFileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleBulkUploadFiles(e.target.files);
            e.target.value = "";
          }
        }}
        className="hidden"
      />

      {/* Bulk Dropzone Hero Strip */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleBulkUploadFiles(e.dataTransfer.files);
          }
        }}
        onClick={() => bulkFileInputRef.current?.click()}
        className="border-2 border-dashed border-[#F43F7A]/30 hover:border-[#F43F7A] rounded-xl p-4 text-center cursor-pointer bg-[#FAF8F5] hover:bg-white transition-all flex items-center justify-center gap-3"
      >
        {bulkUploading ? (
          <div className="flex items-center gap-2 text-[#F43F7A] text-xs font-serif font-semibold">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{bulkProgress}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-serif text-stone-700">
            <UploadCloud className="w-4 h-4 text-[#F43F7A]" />
            <span>
              <strong className="text-stone-900 font-semibold">Drag &amp; drop multiple scans here</strong> to bulk upload newspaper clippings &amp; photos at once.
            </span>
          </div>
        )}
      </div>

      {mediaList.length === 0 ? (
        <div className="p-8 border-2 border-dashed border-[#E8E2D5] rounded-xl text-center space-y-2 bg-[#FAF8F5]">
          <ImageIcon className="w-8 h-8 text-stone-400 mx-auto" />
          <p className="font-serif text-sm text-stone-700">
            No archival media or press clippings attached yet.
          </p>
          <p className="text-xs text-stone-500 font-serif">
            Add newspaper articles, historic shop photos, or ephemera to build the dossier.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {mediaList.map((item, index) => (
            <div
              key={item.id || `media-${index}`}
              className={`p-4 rounded-xl border transition-all ${
                item.isStorefront
                  ? "border-[#F59E0B] bg-[#F59E0B]/10 shadow-xs"
                  : "border-[#E8E2D5] bg-[#FAF8F5] shadow-2xs"
              } space-y-4`}
            >
              <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-[#F43F7A]">
                    #{index + 1}
                  </span>
                  <select
                    value={item.mediaType}
                    onChange={(e) => updateMedia(index, { mediaType: e.target.value })}
                    className="text-xs font-mono bg-white border border-[#E8E2D5] rounded px-2 py-1 text-stone-900"
                  >
                    <option value="newspaper">Newspaper Clipping</option>
                    <option value="photo">Historic Photo</option>
                    <option value="ephemera">Print Ephemera</option>
                  </select>

                  {/* Storefront Hero Tag */}
                  <button
                    type="button"
                    onClick={() => setStorefrontHero(index)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-serif transition-colors cursor-pointer border ${
                      item.isStorefront
                        ? "bg-[#F59E0B] text-stone-900 border-[#F59E0B] font-bold shadow-2xs"
                        : "bg-white text-stone-500 border-[#E8E2D5] hover:text-stone-900 hover:border-[#F59E0B]"
                    }`}
                    title="Feature this photo as the Storefront Hero image at the top of the Bookstore page"
                  >
                    <Star
                      className={`w-3 h-3 ${
                        item.isStorefront ? "fill-stone-900 text-stone-900" : "text-[#F59E0B]"
                      }`}
                    />
                    <span>{item.isStorefront ? "Storefront Hero" : "Tag as Storefront"}</span>
                  </button>

                  {/* Individual Timeline Checkbox for this specific item */}
                  <label className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-serif transition-colors cursor-pointer border bg-white border-[#E8E2D5] hover:border-[#F43F7A]">
                    <input
                      type="checkbox"
                      aria-label={`Add item #${index + 1} to Timeline`}
                      checked={isItemInTimeline(item, index)}
                      onChange={(e) => handleToggleItemTimeline(index, e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-[#E8E2D5] text-[#F43F7A] focus:ring-[#F43F7A]"
                    />
                    <Sparkles className="w-3 h-3 text-[#F43F7A]" />
                    <span className={isItemInTimeline(item, index) ? "font-bold text-stone-900" : "text-stone-600"}>
                      {isItemInTimeline(item, index) ? "In Timeline" : "Add to Timeline"}
                    </span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => removeMedia(index)}
                  className="text-stone-400 hover:text-rose-700 transition-colors p-1"
                  title="Remove Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Image Upload Column */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-mono text-stone-700">
                    CLIPPING / PHOTO SCAN
                  </label>
                  <ImageDropzone
                    label="Scan"
                    value={item.imageUrl}
                    onChange={(url, file) => handleImageUploaded(index, url, file)}
                    aspectRatio="photo"
                  />
                </div>

                {/* Metadata Column */}
                <div className="md:col-span-2 space-y-3">
                  <div>
                    <label className="block text-[11px] font-mono text-stone-700 mb-1">
                      CAPTION / TITLE *
                    </label>
                    <input
                      type="text"
                      data-1p-ignore
                      autoComplete="off"
                      value={item.caption}
                      onChange={(e) => updateMedia(index, { caption: e.target.value })}
                      placeholder="e.g. San Francisco Chronicle (May 29, 2026)"
                      required
                      className="w-full px-3 py-1.5 text-xs bg-white border border-[#E8E2D5] rounded-lg text-stone-900 focus:outline-none font-serif"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-stone-700 mb-1">
                        SOURCE PUBLICATION
                      </label>
                      <input
                        type="text"
                        data-1p-ignore
                        autoComplete="off"
                        value={item.sourcePublication || ""}
                        onChange={(e) => updateMedia(index, { sourcePublication: e.target.value })}
                        placeholder="e.g. San Francisco Chronicle"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#E8E2D5] rounded-lg text-stone-900 focus:outline-none font-serif"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-stone-700 mb-1">
                        PUBLICATION DATE
                      </label>
                      <input
                        type="text"
                        data-1p-ignore
                        autoComplete="off"
                        value={item.publicationDate || ""}
                        onChange={(e) => updateMedia(index, { publicationDate: e.target.value })}
                        placeholder="e.g. May 29, 2026"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#E8E2D5] rounded-lg text-stone-900 focus:outline-none font-serif"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-stone-700 mb-1">
                      ARTICLE TRANSCRIPTION (OPTIONAL - FOR FADED / SMALL NEWSPRINT)
                    </label>
                    <textarea
                      rows={3}
                      data-1p-ignore
                      autoComplete="off"
                      value={item.transcriptionText || ""}
                      onChange={(e) => updateMedia(index, { transcriptionText: e.target.value })}
                      placeholder="Type or paste article excerpts or key quotes..."
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E8E2D5] rounded-lg text-stone-900 focus:outline-none font-serif"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
