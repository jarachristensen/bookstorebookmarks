"use client";

import React, { useState } from "react";
import { Plus, Trash2, Newspaper, Image as ImageIcon, FileText, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ImageDropzone } from "./ImageDropzone";
import { parseClippingFilename } from "@/lib/utils/clipping-parser";

export interface MediaItem {
  id?: string;
  mediaType: string;
  imageUrl: string;
  caption: string;
  sourcePublication?: string;
  publicationDate?: string;
  transcriptionText?: string;
}

export interface MediaManagerProps {
  mediaList: MediaItem[];
  onChange: (newList: MediaItem[]) => void;
}

export function MediaManager({ mediaList, onChange }: MediaManagerProps) {
  const [ocrLoadingIndex, setOcrLoadingIndex] = useState<number | null>(null);
  const [ocrStatusText, setOcrStatusText] = useState<string>("");
  const [ocrError, setOcrError] = useState<string>("");

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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-base font-bold text-ink flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-archival-oxblood" />
            <span>Archival Photos &amp; Newspaper Clippings</span>
          </h3>
          <p className="text-xs text-ink-muted font-serif italic">
            Upload scans (e.g. <code className="text-archival-oxblood font-mono">San_Francisco_Chronicle_2026_05_29_B8.jpg</code>) for automatic publication and date detection.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addMedia}
          className="text-xs font-serif flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Media Item</span>
        </Button>
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
              className="p-4 rounded-xl border border-parchment-border bg-parchment/40 space-y-4 shadow-xs"
            >
              <div className="flex items-center justify-between border-b border-parchment-border pb-2">
                <div className="flex items-center gap-2">
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
                    label="Drop Clipping"
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
