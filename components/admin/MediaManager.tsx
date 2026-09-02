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
}

export function MediaManager({ mediaList, onChange }: MediaManagerProps) {
  const [ocrLoadingIndex, setOcrLoadingIndex] = useState<number | null>(null);
  const [ocrStatusText, setOcrStatusText] = useState<string>("");
  const [ocrError, setOcrError] = useState<string>("");
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

        newItems.push({
          id: `media-${Date.now()}-${i}`,
          mediaType: isLikelyPhoto ? "photo" : "newspaper",
          imageUrl: data.url,
          caption: parsed.caption || "Archival Press Clipping",
          sourcePublication: parsed.sourcePublication || "",
          publicationDate: parsed.publicationDate || "",
          transcriptionText: "",
          isStorefront: file.name.toLowerCase().includes("storefront"),
        });
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

  const handleRunOcr = async (index: number) => {
    const item = mediaList[index];
    if (!item || !item.imageUrl) {
      setOcrError("Please upload a clipping scan first before running OCR.");
      return;
    }

    setOcrError("");
    setOcrLoadingIndex(index);
    setOcrStatusText("Preparing OCR engine...");

    // 30-second timeout guard to ensure OCR never spins indefinitely
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              "OCR processing timed out. You can enter or paste the transcription text manually below."
            )
          ),
        30000
      )
    );

    try {
      const ocrTask = (async () => {
        // 1. Attempt client-side browser WebAssembly OCR first
        try {
          setOcrStatusText("Loading Tesseract...");
          const Tesseract = await import("tesseract.js");

          setOcrStatusText("Recognizing scan...");
          const result = await Tesseract.recognize(item.imageUrl, "eng", {
            logger: (m) => {
              if (m.status === "recognizing text" && typeof m.progress === "number") {
                setOcrStatusText(`Scanning: ${Math.round(m.progress * 100)}%`);
              } else if (m.status) {
                setOcrStatusText(`${m.status.replace(/_/g, " ")}...`);
              }
            },
          });

          const extracted = (result.data.text || "")
            .replace(/\r\n/g, "\n")
            .replace(/[ \t]+/g, " ")
            .replace(/\n{3,}/g, "\n\n")
            .trim();

          return extracted;
        } catch (clientErr) {
          console.warn("Client-side OCR failed, falling back to server route:", clientErr);

          // 2. Fallback to API route if client-side WASM encounters issues
          setOcrStatusText("Processing on server...");
          const res = await fetch("/api/ocr", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl: item.imageUrl }),
          });

          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || "OCR extraction failed");
          }
          return data.text as string;
        }
      })();

      const text = await Promise.race([ocrTask, timeoutPromise]);

      if (text && text.trim().length > 0) {
        updateMedia(index, { transcriptionText: text.trim() });
      } else {
        setOcrError("No legible text recognized in this scan. You can enter the transcription manually below.");
      }
    } catch (err: any) {
      console.error("OCR Extraction Error:", err);
      setOcrError(err.message || "Failed to extract text via OCR. You can type the transcription manually below.");
    } finally {
      setOcrLoadingIndex(null);
      setOcrStatusText("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-serif text-base font-bold text-ink flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-archival-oxblood" />
            <span>Archival Photos &amp; Newspaper Clippings</span>
          </h3>
          <p className="text-xs text-ink-muted font-serif italic">
            Upload scans for automatic publication and date detection, or bulk drop multiple clippings at once.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => bulkFileInputRef.current?.click()}
            disabled={bulkUploading}
            className="text-xs font-serif flex items-center gap-1.5 bg-amber-50/60 border-amber-300/80 hover:bg-amber-100/70 text-ink"
          >
            {bulkUploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-archival-oxblood" />
            ) : (
              <UploadCloud className="w-3.5 h-3.5 text-archival-oxblood" />
            )}
            <span>Bulk Upload Scans</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addMedia}
            className="text-xs font-serif flex items-center gap-1"
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
        className="border-2 border-dashed border-archival-oxblood/30 hover:border-archival-oxblood rounded-xl p-4 text-center cursor-pointer bg-amber-50/30 hover:bg-amber-50/60 transition-all flex items-center justify-center gap-3"
      >
        {bulkUploading ? (
          <div className="flex items-center gap-2 text-archival-oxblood text-xs font-serif font-semibold">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{bulkProgress}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-serif text-ink-light">
            <UploadCloud className="w-4 h-4 text-archival-oxblood" />
            <span>
              <strong className="text-ink font-semibold">Drag &amp; drop multiple scans here</strong> to bulk upload newspaper clippings &amp; photos at once.
            </span>
          </div>
        )}
      </div>

      {ocrError && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-serif">
          {ocrError}
        </div>
      )}

      {mediaList.length === 0 ? (
        <div className="p-8 border-2 border-dashed border-parchment-border rounded-xl text-center space-y-2 bg-parchment/30">
          <ImageIcon className="w-8 h-8 text-ink-muted/50 mx-auto" />
          <p className="font-serif text-sm text-ink-light">
            No archival media or press clippings attached yet.
          </p>
          <p className="text-xs text-ink-muted font-serif italic">
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
                  ? "border-amber-400 bg-amber-50/40 shadow-xs"
                  : "border-parchment-border bg-parchment/40 shadow-2xs"
              } space-y-4`}
            >
              <div className="flex items-center justify-between border-b border-parchment-border pb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-archival-oxblood">
                    #{index + 1}
                  </span>
                  <select
                    value={item.mediaType}
                    onChange={(e) => updateMedia(index, { mediaType: e.target.value })}
                    className="text-xs font-mono bg-white border border-parchment-border rounded px-2 py-1 text-ink"
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
                        ? "bg-amber-500 text-stone-900 border-amber-600 font-bold shadow-2xs"
                        : "bg-white text-ink-muted border-parchment-border hover:text-ink hover:border-amber-400"
                    }`}
                    title="Feature this photo as the Storefront Hero image at the top of the Bookstore page"
                  >
                    <Star
                      className={`w-3 h-3 ${
                        item.isStorefront ? "fill-stone-900 text-stone-900" : "text-amber-500"
                      }`}
                    />
                    <span>{item.isStorefront ? "Storefront Hero" : "Tag as Storefront"}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeMedia(index)}
                  className="text-ink-muted hover:text-rose-700 transition-colors p-1"
                  title="Remove Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Image Upload Column */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-mono text-ink-light">
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
                    <label className="block text-[11px] font-mono text-ink-light mb-1">
                      CAPTION / TITLE *
                    </label>
                    <input
                      type="text"
                      value={item.caption}
                      onChange={(e) => updateMedia(index, { caption: e.target.value })}
                      placeholder="e.g. San Francisco Chronicle (May 29, 2026)"
                      required
                      className="w-full px-3 py-1.5 text-xs bg-white border border-parchment-border rounded-lg text-ink focus:outline-none font-serif"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-ink-light mb-1">
                        SOURCE PUBLICATION
                      </label>
                      <input
                        type="text"
                        value={item.sourcePublication || ""}
                        onChange={(e) => updateMedia(index, { sourcePublication: e.target.value })}
                        placeholder="e.g. San Francisco Chronicle"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-parchment-border rounded-lg text-ink focus:outline-none font-serif"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-ink-light mb-1">
                        PUBLICATION DATE
                      </label>
                      <input
                        type="text"
                        value={item.publicationDate || ""}
                        onChange={(e) => updateMedia(index, { publicationDate: e.target.value })}
                        placeholder="e.g. May 29, 2026"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-parchment-border rounded-lg text-ink focus:outline-none font-serif"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-mono text-ink-light">
                        ARTICLE TRANSCRIPTION (FOR FADED / SMALL NEWSPRINT)
                      </label>
                      {item.imageUrl && (
                        <button
                          type="button"
                          disabled={ocrLoadingIndex === index}
                          onClick={() => handleRunOcr(index)}
                          className="inline-flex items-center gap-1 text-[11px] font-mono text-archival-oxblood hover:underline disabled:opacity-60 cursor-pointer font-bold"
                        >
                          {ocrLoadingIndex === index ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>{ocrStatusText || "Running OCR..."}</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3 text-archival-amber" />
                              <span>Extract Text via OCR</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={3}
                      value={item.transcriptionText || ""}
                      onChange={(e) => updateMedia(index, { transcriptionText: e.target.value })}
                      placeholder="Type or paste the transcribed text of the article, or click 'Extract Text via OCR' above..."
                      className="w-full px-3 py-2 text-xs bg-white border border-parchment-border rounded-lg text-ink focus:outline-none font-serif"
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
