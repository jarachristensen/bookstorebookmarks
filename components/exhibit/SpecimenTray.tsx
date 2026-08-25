"use client";

import React, { useEffect } from "react";
import { BookmarkWithDetails } from "@/lib/db/queries";
import { BookmarkCard } from "./BookmarkCard";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Inbox } from "lucide-react";

export interface SpecimenTrayProps {
  bookmarks: BookmarkWithDetails[];
  currentPage: number;
  direction?: number; // 1 for next, -1 for prev
  onInspect: (bookmark: BookmarkWithDetails) => void;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export function SpecimenTray({
  bookmarks,
  currentPage,
  direction = 1,
  onInspect,
  onPrevPage,
  onNextPage,
  hasPrev = false,
  hasNext = false,
}: SpecimenTrayProps) {
  // Keyboard Arrow Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && hasPrev && onPrevPage) {
        onPrevPage();
      } else if (e.key === "ArrowRight" && hasNext && onNextPage) {
        onNextPage();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasPrev, hasNext, onPrevPage, onNextPage]);

  // Framer motion variants for page turn / tray slide
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      rotateY: dir > 0 ? 4 : -4,
    }),
    center: {
      x: 0,
      opacity: 1,
      rotateY: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.25 },
      },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 80 : -80,
      opacity: 0,
      rotateY: dir < 0 ? 4 : -4,
      transition: { duration: 0.2 },
    }),
  };

  return (
    <div className="relative w-full rounded-2xl p-4 sm:p-6 lg:p-8 bg-[#EAE3D2] border-4 border-[#D8CEB9] shadow-inner shadow-black/10 overflow-hidden">
      {/* Linen Cloth Inlay Texture */}
      <div className="absolute inset-2 sm:inset-3 rounded-xl tray-linen-texture border border-[#D5C8B4] shadow-sm pointer-events-none" />

      {/* Decorative Brass Corner Plates */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-800/40 pointer-events-none" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-800/40 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-800/40 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-800/40 pointer-events-none" />

      {/* Animated Tray Contents */}
      <div className="relative z-10 min-h-[480px] flex items-center justify-center">
        <AnimatePresence custom={direction} mode="wait">
          {bookmarks.length === 0 ? (
            <motion.div
              key="empty-tray"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-16 text-center space-y-3"
            >
              <div className="w-16 h-16 rounded-full bg-parchment-border/40 mx-auto flex items-center justify-center text-ink-muted">
                <Inbox className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-lg font-bold text-ink">No Specimen Bookmarks Found</h3>
              <p className="text-sm text-ink-muted max-w-md mx-auto font-serif italic">
                No bookmarks matched the current search or filters. Try resetting the filters above.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={`tray-page-${currentPage}`}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 items-start py-4"
            >
              {bookmarks.map((bm, index) => (
                <BookmarkCard
                  key={bm.id}
                  bookmark={bm}
                  index={index}
                  onInspect={onInspect}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tray Subtle Footnote */}
      <div className="relative z-10 mt-4 pt-3 border-t border-[#D5C8B4]/60 flex items-center justify-between text-[11px] font-mono text-ink-muted">
        <span>CURATOR'S PHYSICAL EXHIBIT TRAY</span>
        <span className="hidden sm:inline">Use ← / → Arrow Keys to flip trays</span>
        <span>ACQUISITION ARCHIVE</span>
      </div>
    </div>
  );
}
