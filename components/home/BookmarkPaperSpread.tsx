"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import { BookmarkWithDetails } from "@/lib/db/queries";
import { parseDimensions } from "@/lib/utils/dimensions";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Eye, RotateCcw } from "lucide-react";

export interface BookmarkPaperSpreadProps {
  bookmarks: BookmarkWithDetails[];
  onInspectBookmark: (bookmark: BookmarkWithDetails) => void;
  onResetFilters?: () => void;
}

export type SpreadSlot =
  | {
      type: "portrait";
      id: string;
      bookmark: BookmarkWithDetails;
    }
  | {
      type: "landscape-stack";
      id: string;
      bookmarks: BookmarkWithDetails[]; // 1 or 2 landscape bookmarks stacked vertically
    };

/**
 * Determines whether a bookmark is horizontal/landscape based on:
 * 1. Explicitly detected landscape IDs (from image natural aspect ratio inspection)
 * 2. Specimen metadata keywords (e.g. Garcia Street Books, Shaker Mill Books, Scribner Book Store, or horizontal/landscape/strip)
 * 3. Numerical dimensions parsing (e.g. 7.5" × 2.25" or W > H)
 */
export function isBookmarkLandscape(
  bm: BookmarkWithDetails,
  detectedLandscapeIds?: Set<string>
): boolean {
  if (detectedLandscapeIds && detectedLandscapeIds.has(bm.id)) {
    return true;
  }

  const textToCheck = `${bm.title} ${bm.bookstore?.name || ""} ${bm.dimensions || ""}`.toLowerCase();
  if (
    textToCheck.includes("garcia street") ||
    textToCheck.includes("shaker mill") ||
    textToCheck.includes("scribner book") ||
    /\b(horizontal|landscape|wide|strip)\b/i.test(textToCheck)
  ) {
    return true;
  }

  const dim = parseDimensions(bm.dimensions);
  return dim.isLandscape;
}

/**
 * Groups bookmarks for the spread:
 * - Portrait bookmarks take 1 column.
 * - Landscape bookmarks are paired into stacked units spanning 2–3 columns.
 */
export function groupBookmarksForSpread(
  bookmarks: BookmarkWithDetails[],
  detectedLandscapeIds?: Set<string>
): SpreadSlot[] {
  const slots: SpreadSlot[] = [];

  // Collect all landscape bookmarks in current order
  const landscapeQueue: BookmarkWithDetails[] = [];
  for (const bm of bookmarks) {
    if (isBookmarkLandscape(bm, detectedLandscapeIds)) {
      landscapeQueue.push(bm);
    }
  }

  // Group landscape bookmarks into pairs
  const landscapePairs: BookmarkWithDetails[][] = [];
  for (let i = 0; i < landscapeQueue.length; i += 2) {
    if (i + 1 < landscapeQueue.length) {
      landscapePairs.push([landscapeQueue[i], landscapeQueue[i + 1]]);
    } else {
      landscapePairs.push([landscapeQueue[i]]);
    }
  }

  let pairIdx = 0;
  const processedLandscapeIds = new Set<string>();

  for (const bm of bookmarks) {
    if (!isBookmarkLandscape(bm, detectedLandscapeIds)) {
      slots.push({
        type: "portrait",
        id: bm.id,
        bookmark: bm,
      });
    } else {
      if (!processedLandscapeIds.has(bm.id)) {
        if (pairIdx < landscapePairs.length) {
          const pair = landscapePairs[pairIdx++];
          pair.forEach((b) => processedLandscapeIds.add(b.id));
          slots.push({
            type: "landscape-stack",
            id: `stack-${pair.map((b) => b.id).join("_")}`,
            bookmarks: pair,
          });
        }
      }
    }
  }

  return slots;
}

function BookmarkPaperItem({
  bookmark,
  isLandscape,
  onInspectBookmark,
  hoveredId,
  setHoveredId,
  priority,
  onDetectedLandscape,
}: {
  bookmark: BookmarkWithDetails;
  isLandscape: boolean;
  onInspectBookmark: (bm: BookmarkWithDetails) => void;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  priority?: boolean;
  onDetectedLandscape?: (id: string) => void;
}) {
  const [naturalAspect, setNaturalAspect] = useState<number | null>(null);
  const effectiveLandscape =
    isLandscape ||
    (naturalAspect !== null && naturalAspect > 1.15) ||
    isBookmarkLandscape(bookmark);
  const isHovered = hoveredId === bookmark.id;
  const store = bookmark.bookstore;
  const locationStr = [store?.city, store?.stateProvince || store?.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      onMouseEnter={() => setHoveredId(bookmark.id)}
      onMouseLeave={() => setHoveredId(null)}
      className="relative flex flex-col items-center justify-end group cursor-pointer w-full"
    >
      {/* Floating Risograph Tooltip on Hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-12 z-30 pointer-events-none px-2.5 py-1.5 rounded-lg bg-stone-900 text-white shadow-xl border border-stone-700/60 flex items-center gap-1.5 whitespace-nowrap text-left max-w-[220px]"
          >
            <div className="truncate">
              <p className="font-bold text-[11px] text-amber-200 truncate">
                {store?.name || bookmark.title}
              </p>
              <p className="text-[9.5px] text-stone-300 flex items-center gap-1 truncate">
                {locationStr && <span>{locationStr}</span>}
                {bookmark.yearProduced && <span>· {bookmark.yearProduced}</span>}
              </p>
            </div>
            <div className="shrink-0 w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-white">
              <Eye className="w-2.5 h-2.5" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bookmark Paper Specimen Button */}
      <button
        type="button"
        onClick={() => onInspectBookmark(bookmark)}
        aria-label={`Inspect ${bookmark.title}`}
        className="relative w-full flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded-lg transition-transform"
      >
        <motion.div
          whileHover={{
            y: effectiveLandscape ? -5 : -8,
            scale: effectiveLandscape ? 1.03 : 1.04,
            transition: { duration: 0.2, ease: "easeOut" },
          }}
          whileTap={{ scale: 0.98 }}
          className="relative w-full flex items-center justify-center select-none"
        >
          {/* Authentic Soft Paper Drop Shadow */}
          <div
            style={
              effectiveLandscape && naturalAspect && naturalAspect > 1.15
                ? { aspectRatio: `${naturalAspect}` }
                : undefined
            }
            className={`relative w-full ${
              effectiveLandscape
                ? "aspect-[3.2/1] max-h-[170px] drop-shadow-[0_4px_10px_rgba(24,24,27,0.13)] group-hover:drop-shadow-[0_12px_22px_rgba(24,24,27,0.20)]"
                : "aspect-[1/3.2] max-h-[380px] drop-shadow-[0_6px_14px_rgba(24,24,27,0.14)] group-hover:drop-shadow-[0_16px_28px_rgba(24,24,27,0.22)]"
            } transition-all duration-200 flex items-center justify-center`}
          >
            <Image
              src={bookmark.frontImageUrl}
              alt={bookmark.title}
              fill
              sizes={
                effectiveLandscape
                  ? "(max-width: 640px) 95vw, (max-width: 1024px) 55vw, 38vw"
                  : "(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 15vw"
              }
              className="object-contain filter contrast-[1.02] brightness-[0.99] rounded-xs"
              priority={priority}
              onLoad={(e) => {
                const target = e.currentTarget;
                if (target.naturalWidth && target.naturalHeight) {
                  const ratio = target.naturalWidth / target.naturalHeight;
                  setNaturalAspect(ratio);
                  if (ratio > 1.15) {
                    onDetectedLandscape?.(bookmark.id);
                  }
                }
              }}
            />
          </div>
        </motion.div>
      </button>
    </div>
  );
}

export function BookmarkPaperSpread({
  bookmarks,
  onInspectBookmark,
  onResetFilters,
}: BookmarkPaperSpreadProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Maintain reactive set of detected landscape IDs (initialized from localStorage cache)
  const [detectedLandscapeIds, setDetectedLandscapeIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("archive_landscape_bookmark_ids");
        if (cached) {
          const arr = JSON.parse(cached);
          if (Array.isArray(arr)) {
            arr.forEach((id) => initial.add(id));
          }
        }
      } catch {}
    }
    return initial;
  });

  const handleDetectedLandscape = useCallback((id: string) => {
    setDetectedLandscapeIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem("archive_landscape_bookmark_ids", JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  }, []);

  // Preload and detect image aspect ratios in the background
  useEffect(() => {
    if (typeof window === "undefined") return;

    bookmarks.forEach((bm) => {
      if (!bm.frontImageUrl || detectedLandscapeIds.has(bm.id)) return;

      if (isBookmarkLandscape(bm, detectedLandscapeIds)) {
        handleDetectedLandscape(bm.id);
        return;
      }

      const img = new window.Image();
      img.src = bm.frontImageUrl;
      img.onload = () => {
        if (img.naturalWidth && img.naturalHeight && img.naturalWidth / img.naturalHeight > 1.15) {
          handleDetectedLandscape(bm.id);
        }
      };
    });
  }, [bookmarks, detectedLandscapeIds, handleDetectedLandscape]);

  const slots = useMemo(
    () => groupBookmarksForSpread(bookmarks, detectedLandscapeIds),
    [bookmarks, detectedLandscapeIds]
  );

  if (bookmarks.length === 0) {
    return (
      <div className="w-full py-16 px-4 flex flex-col items-center justify-center text-center">
        <div className="relative p-8 max-w-md w-full rounded-2xl bg-white/80 border border-[#E8E2D5] shadow-sm backdrop-blur-xs space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF8F5] border border-[#E8E2D5] flex items-center justify-center text-[#F43F7A]">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900">
              No Bookmarks Found
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-stone-600 font-sans">
              No specimen bookmarks match your current search and filter selections.
            </p>
          </div>
          {onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2563EB] text-white text-xs font-semibold hover:bg-[#1D4ED8] transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pt-1 sm:pt-2 pb-6 sm:pb-8">
      {/* 
        Dense Minimalist Papercraft Specimen Grid
        Responsive: 2 cols on mobile, up to 8 cols on ultrawide monitors
      */}
      <motion.div
        layout
        className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 sm:gap-6 items-end grid-flow-dense"
      >
        <AnimatePresence>
          {slots.map((slot, slotIndex) => {
            if (slot.type === "portrait") {
              return (
                <motion.div
                  key={slot.id}
                  layout
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.22, delay: Math.min(slotIndex * 0.015, 0.3) }}
                  className="col-span-1 flex flex-col items-center justify-end self-end w-full"
                >
                  <BookmarkPaperItem
                    bookmark={slot.bookmark}
                    isLandscape={false}
                    onInspectBookmark={onInspectBookmark}
                    hoveredId={hoveredId}
                    setHoveredId={setHoveredId}
                    priority={slotIndex < 8}
                    onDetectedLandscape={handleDetectedLandscape}
                  />
                </motion.div>
              );
            }

            // Landscape stack: spans 2 or 3 columns, stacks 1 or 2 horizontal bookmarks vertically
            return (
              <motion.div
                key={slot.id}
                layout
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.22, delay: Math.min(slotIndex * 0.015, 0.3) }}
                className="col-span-2 sm:col-span-2 md:col-span-2 lg:col-span-3 xl:col-span-3 flex flex-col justify-end self-end w-full"
              >
                <div className="flex flex-col gap-3 sm:gap-4 justify-end w-full py-1">
                  {slot.bookmarks.map((bm) => (
                    <BookmarkPaperItem
                      key={bm.id}
                      bookmark={bm}
                      isLandscape={true}
                      onInspectBookmark={onInspectBookmark}
                      hoveredId={hoveredId}
                      setHoveredId={setHoveredId}
                      priority={slotIndex < 6}
                      onDetectedLandscape={handleDetectedLandscape}
                    />
                  ))}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
