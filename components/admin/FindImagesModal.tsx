"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  X,
  Loader2,
  Check,
  ExternalLink,
  Sparkles,
  Camera,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ImageSearchResult } from "@/app/api/bookstores/search-images/route";

export interface SelectedImagePayload {
  url: string;
  title: string;
  year?: string;
  source?: string;
  description?: string;
  mediaTag: "storefront" | "interior" | "photo";
}

export interface FindImagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery: string;
  bookstoreName: string;
  onAddImages: (images: SelectedImagePayload[]) => void;
}

export function FindImagesModal({
  isOpen,
  onClose,
  initialQuery,
  bookstoreName,
  onAddImages,
}: FindImagesModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<ImageSearchResult[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [imageTags, setImageTags] = useState<
    Record<string, "storefront" | "interior" | "photo">
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Sync initial query when opened
  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setSelectedIds(new Set());
      setError("");
      if (initialQuery.trim()) {
        executeSearch(initialQuery.trim());
      }
    }
  }, [isOpen, initialQuery]);

  if (!isOpen) return null;

  const executeSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError("");
    setHasSearched(true);

    try {
      const res = await fetch(
        `/api/bookstores/search-images?q=${encodeURIComponent(searchQuery.trim())}`
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to search images.");
      }

      const data = await res.json();
      const items: ImageSearchResult[] = data.results || [];
      setResults(items);

      // Default tag for all new results is storefront
      const newTags: Record<string, "storefront" | "interior" | "photo"> = {};
      items.forEach((item) => {
        newTags[item.id] = "storefront";
      });
      setImageTags(newTags);
    } catch (err: any) {
      setError(err.message || "An error occurred while searching for images.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(results.map((r) => r.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleAddSelected = () => {
    const selectedItems = results.filter((r) => selectedIds.has(r.id));
    if (selectedItems.length === 0) return;

    const payload: SelectedImagePayload[] = selectedItems.map((item) => ({
      url: item.url,
      title: item.title || `${bookstoreName} Historical Photograph`,
      year: item.year,
      source: item.source,
      description: item.description,
      mediaTag: imageTags[item.id] || "storefront",
    }));

    onAddImages(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white border border-[#E8E2D5] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#E8E2D5] bg-[#FAF8F5] flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#2563EB]" />
              <span>Find Web &amp; Archival Images</span>
            </h3>
            <p className="text-xs font-serif text-stone-600">
              Search open archives, Wikimedia, and cultural heritage collections for{" "}
              <strong className="text-stone-900">{bookstoreName}</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-[#E8E2D5] bg-white">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search bookstore name, address, or city..."
                className="w-full pl-9 pr-3 py-2 text-xs font-serif bg-[#FAF8F5] border border-[#E8E2D5] rounded-xl text-stone-900 focus:outline-none focus:border-[#2563EB]"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !query.trim()}
              className="bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-serif gap-1.5 shrink-0"
              size="sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Search Archives</span>
                </>
              )}
            </Button>

            <a
              href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(
                query.trim() || bookstoreName
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E8E2D5] bg-[#FAF8F5] hover:bg-stone-100 text-stone-700 text-xs font-serif shrink-0 transition-colors cursor-pointer"
              title="Open Google Images search in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
              <span>Google Images ↗</span>
            </a>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                query.trim() || bookstoreName
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E8E2D5] bg-[#FAF8F5] hover:bg-stone-100 text-stone-700 text-xs font-serif shrink-0 transition-colors cursor-pointer"
              title="Open Google Maps place card and user photos in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
              <span>Google Maps Photos ↗</span>
            </a>
          </form>

          {/* Quick Selection Bar */}
          {results.length > 0 && (
            <div className="flex items-center justify-between pt-3 text-xs font-serif">
              <div className="text-stone-600">
                Found <strong>{results.length}</strong> image{results.length === 1 ? "" : "s"}.{" "}
                <span className="text-[#2563EB] font-bold">
                  {selectedIds.size} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-stone-600 hover:text-stone-900 underline cursor-pointer text-[11px]"
                >
                  Select all
                </button>
                <span className="text-stone-300">|</span>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="text-stone-600 hover:text-stone-900 underline cursor-pointer text-[11px]"
                >
                  Deselect all
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#FAF8F5]/40">
          {loading && results.length === 0 && (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
              <p className="font-serif text-xs text-stone-600">
                Querying Wikimedia Commons, cultural archives &amp; photography collections...
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-serif flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && hasSearched && results.length === 0 && !error && (
            <div className="py-16 text-center space-y-3">
              <Camera className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="font-serif font-bold text-stone-700 text-sm">
                No matching archival images found
              </p>
              <p className="text-xs font-serif text-stone-500 max-w-md mx-auto">
                Try shortening your query to just the bookstore name, or searching for the city and neighborhood (e.g. "{bookstoreName}").
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {results.map((item) => {
                const isSelected = selectedIds.has(item.id);
                const currentTag = imageTags[item.id] || "storefront";

                return (
                  <div
                    key={item.id}
                    onClick={() => toggleSelect(item.id)}
                    className={`group relative flex flex-col rounded-xl overflow-hidden border transition-all cursor-pointer bg-white text-left ${
                      isSelected
                        ? "border-[#2563EB] ring-2 ring-[#2563EB]/40 shadow-md"
                        : "border-[#E8E2D5] hover:border-stone-400 hover:shadow-xs"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-full h-36 bg-stone-100 overflow-hidden">
                      <Image
                        src={item.thumbnailUrl}
                        alt={item.title}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Selection Checkbox */}
                      <div
                        className={`absolute top-2 left-2 w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-[#2563EB] text-white shadow-xs"
                            : "bg-black/40 backdrop-blur-xs text-transparent border border-white/50"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </div>

                      {/* Source Badge */}
                      <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/70 backdrop-blur-xs text-white">
                        {item.source}
                      </div>

                      {/* Year badge if present */}
                      {item.year && (
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/90 text-white">
                          {item.year}
                        </div>
                      )}
                    </div>

                    {/* Metadata & Tag Selection */}
                    <div className="p-2.5 flex-1 flex flex-col justify-between gap-2">
                      <div className="space-y-1">
                        <h4
                          className="font-serif text-[11px] font-bold text-stone-900 line-clamp-2 leading-snug"
                          title={item.title}
                        >
                          {item.title}
                        </h4>
                        {item.description && (
                          <p className="text-[10px] text-stone-500 line-clamp-1 font-serif">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Tag selector */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="pt-1 border-t border-stone-100"
                      >
                        <label className="block text-[9px] font-mono text-stone-400 uppercase mb-0.5">
                          Attach As:
                        </label>
                        <select
                          value={currentTag}
                          onChange={(e) =>
                            setImageTags((prev) => ({
                              ...prev,
                              [item.id]: e.target.value as any,
                            }))
                          }
                          className="w-full text-[10px] font-serif py-1 px-1.5 bg-[#FAF8F5] border border-[#E8E2D5] rounded-md text-stone-800 focus:outline-none"
                        >
                          <option value="storefront">Storefront / Exterior</option>
                          <option value="interior">Inside / Interior</option>
                          <option value="photo">Archival Photo</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#E8E2D5] bg-white flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs font-serif"
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            disabled={selectedIds.size === 0}
            onClick={handleAddSelected}
            className="bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-serif gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              Add {selectedIds.size > 0 ? `${selectedIds.size} ` : ""}Selected to Bookstore Profile
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
