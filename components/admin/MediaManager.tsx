"use client";

import React from "react";
import { Plus, Trash2, Newspaper, Image as ImageIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ImageDropzone } from "./ImageDropzone";

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-base font-bold text-ink flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-archival-oxblood" />
            <span>Archival Photos &amp; Newspaper Clippings</span>
          </h3>
          <p className="text-xs text-ink-muted font-serif italic">
            Add historical press articles, exterior bookstore photographs, and readable transcriptions.
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

      {mediaList.length === 0 ? (
        <div className="p-6 rounded-xl border border-dashed border-parchment-border text-center bg-parchment-light space-y-2">
          <p className="text-xs text-ink-muted font-serif italic">
            No historical clippings added yet. Add newspaper scans or photos to enrich your bookstore research.
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addMedia}
            className="text-xs font-serif"
          >
            + Add First Clipping / Photo
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {mediaList.map((item, index) => (
            <div
              key={item.id || index}
              className="p-4 rounded-xl bg-parchment-light border border-parchment-border shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-parchment-border">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-archival-oxblood">
                    ITEM #{index + 1}
                  </span>
                  <select
                    value={item.mediaType}
                    onChange={(e) => updateMedia(index, { mediaType: e.target.value })}
                    className="px-2 py-1 text-xs bg-white border border-parchment-border rounded text-ink focus:outline-none font-serif"
                  >
                    <option value="newspaper">Newspaper Article</option>
                    <option value="photo">Archival Photo</option>
                    <option value="postcard">Vintage Postcard</option>
                    <option value="ephemera">Receipt / Ephemera</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => removeMedia(index)}
                  className="p-1 rounded text-rose-700 hover:bg-rose-100 transition-colors"
                  title="Remove this item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                {/* Image Dropzone */}
                <div className="md:col-span-4">
                  <ImageDropzone
                    label="Media Scan / Photo"
                    value={item.imageUrl}
                    onChange={(url) => updateMedia(index, { imageUrl: url })}
                    aspectRatio="photo"
                    required
                  />
                </div>

                {/* Form fields */}
                <div className="md:col-span-8 space-y-3">
                  <div>
                    <label className="block text-[11px] font-mono text-ink-light mb-1">
                      CAPTION / HEADLINE *
                    </label>
                    <input
                      type="text"
                      value={item.caption}
                      onChange={(e) => updateMedia(index, { caption: e.target.value })}
                      placeholder="e.g. The New York Times: 'Frances Steloff & Her Haven on 47th St'"
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
                        placeholder="e.g. Chicago Tribune"
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
                        placeholder="e.g. Oct 14, 1957"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-parchment-border rounded-lg text-ink focus:outline-none font-serif"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-ink-light mb-1">
                      ARTICLE TRANSCRIPTION (FOR FADED / SMALL NEWSPRINT)
                    </label>
                    <textarea
                      rows={3}
                      value={item.transcriptionText || ""}
                      onChange={(e) => updateMedia(index, { transcriptionText: e.target.value })}
                      placeholder="Type or paste the transcribed text of the article for readers to read easily in the lightbox..."
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
