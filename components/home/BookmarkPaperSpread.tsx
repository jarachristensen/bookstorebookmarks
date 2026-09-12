"use client";

import React, { useState } from "react";
import Image from "next/image";
import { BookmarkWithDetails } from "@/lib/db/queries";
import { parseDimensions } from "@/lib/utils/dimensions";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Eye, RotateCcw, MapPin, Calendar, Building2 } from "lucide-react";

export interface BookmarkPaperSpreadProps {
  bookmarks: BookmarkWithDetails[];
  onInspectBookmark: (bookmark: BookmarkWithDetails) => void;
  onResetFilters?: () => void;
}

export function BookmarkPaperSpread({
  bookmarks,
  onInspectBookmark,
  onResetFilters,
}: BookmarkPaperSpreadProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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
    <div className="w-full py-4 sm:py-6">
      {/* 
        Dense Minimalist Papercraft Specimen Grid
        Responsive: 2 cols on mobile, up to 8 cols on ultrawide monitors
      */}
      <motion.div
        layout
        className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 sm:gap-6 items-end"
      >
        <AnimatePresence>
          {bookmarks.map((bm, index) => {
            const parsedDim = parseDimensions(bm.dimensions);
            const isHovered = hoveredId === bm.id;
            const store = bm.bookstore;
            const locationStr = [store?.city, store?.stateProvince || store?.country]
              .filter(Boolean)
              .join(", ");

            // Calculate natural aspect ratio style
            const isLandscape = parsedDim.isLandscape;
            const aspectRatioStyle = isLandscape ? "aspect-[3.2/1]" : "aspect-[1/3.2]";

            return (
              <motion.div
                key={bm.id}
                layout
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.22, delay: Math.min(index * 0.015, 0.3) }}
                onHoverStart={() => setHoveredId(bm.id)}
                onHoverEnd={() => setHoveredId(null)}
                className="relative flex flex-col items-center justify-end group cursor-pointer"
              >
                {/* Floating Risograph Tooltip on Hover */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.92 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute -top-12 z-30 pointer-events-none px-2.5 py-1.5 rounded-lg bg-stone-900 text-white shadow-xl border border-stone-700/60 flex items-center gap-1.5 whitespace-nowrap text-left max-w-[200px]"
                    >
                      <div className="truncate">
                        <p className="font-bold text-[11px] text-amber-200 truncate">
                          {store?.name || bm.title}
                        </p>
                        <p className="text-[9.5px] text-stone-300 flex items-center gap-1 truncate">
                          {locationStr && <span>{locationStr}</span>}
                          {bm.yearProduced && <span>· {bm.yearProduced}</span>}
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
                  onClick={() => onInspectBookmark(bm)}
                  aria-label={`Inspect ${bm.title}`}
                  className="relative w-full flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded-lg transition-transform"
                >
                  <motion.div
                    whileHover={{
                      y: -8,
                      scale: 1.04,
                      transition: { duration: 0.2, ease: "easeOut" },
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="relative w-full flex items-center justify-center select-none"
                  >
                    {/* Authentic Soft Paper Drop Shadow */}
                    <div
                      className={`relative w-full ${aspectRatioStyle} max-h-[380px] drop-shadow-[0_6px_14px_rgba(24,24,27,0.14)] group-hover:drop-shadow-[0_16px_28px_rgba(24,24,27,0.22)] transition-all duration-200 flex items-center justify-center`}
                    >
                      <Image
                        src={bm.frontImageUrl}
                        alt={bm.title}
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 15vw"
                        className="object-contain filter contrast-[1.02] brightness-[0.99] rounded-xs"
                        priority={index < 8}
                      />
                    </div>
                  </motion.div>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
