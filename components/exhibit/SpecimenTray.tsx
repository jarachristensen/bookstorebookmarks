"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { BookmarkWithDetails } from "@/lib/db/queries";
import { packSpecimenTrays, TrayDrawer } from "@/lib/utils/bin-packing";
import { BookmarkCard } from "./BookmarkCard";
import { motion, AnimatePresence } from "framer-motion";
import { Inbox, ChevronLeft, ChevronRight, Layers, Dices, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface SpecimenTrayProps {
  bookmarks: BookmarkWithDetails[];
  currentPage: number;
  direction?: number; // 1 for next, -1 for prev
  onInspect: (bookmark: BookmarkWithDetails) => void;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  onShuffle?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  onTotalDrawersCalculated?: (total: number) => void;
}

export function SpecimenTray({
  bookmarks,
  currentPage,
  direction = 1,
  onInspect,
  onPrevPage,
  onNextPage,
  onShuffle,
  hasPrev = false,
  hasNext = false,
  onTotalDrawersCalculated,
}: SpecimenTrayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(1080);
  const [trayHeight, setTrayHeight] = useState<number>(540);

  // Measure container dimensions dynamically
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const measured = containerRef.current.clientWidth;
        const width = measured > 50 ? measured : 1080;
        setContainerWidth(width);

        // Adjust tray height responsively based on screen width
        if (width < 640) {
          setTrayHeight(440);
        } else if (width < 1024) {
          setTrayHeight(500);
        } else {
          setTrayHeight(540);
        }
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

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

  // Pack bookmarks into true-scale 2D trays
  const effectiveWidth = containerWidth > 50 ? containerWidth : 1080;
  const effectiveHeight = trayHeight > 50 ? trayHeight : 540;

  const packedDrawers = useMemo(() => {
    if (!bookmarks || bookmarks.length === 0) return [];
    return packSpecimenTrays(bookmarks, {
      trayWidth: effectiveWidth,
      trayHeight: effectiveHeight,
      buffer: effectiveWidth < 640 ? 12 : 20,
    });
  }, [bookmarks, effectiveWidth, effectiveHeight]);

  // Notify parent of calculated drawers count
  useEffect(() => {
    if (onTotalDrawersCalculated) {
      onTotalDrawersCalculated(Math.max(1, packedDrawers.length));
    }
  }, [packedDrawers.length, onTotalDrawersCalculated]);

  const activeDrawerIndex = Math.min(Math.max(0, currentPage - 1), Math.max(0, packedDrawers.length - 1));
  const currentDrawer: TrayDrawer<BookmarkWithDetails> | undefined = packedDrawers[activeDrawerIndex];

  // Framer motion variants for tray drawer slide transitions
  const drawerVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 260, damping: 28 },
        opacity: { duration: 0.2 },
      },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 100 : -100,
      opacity: 0,
      transition: { duration: 0.18 },
    }),
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl p-3 sm:p-5 lg:p-6 tray-wood-frame border-[6px] sm:border-8 border-[#3b2014] shadow-[0_20px_50px_rgba(0,0,0,0.45),inset_0_4px_16px_rgba(0,0,0,0.85)] overflow-hidden"
    >
      {/* Clean Archival Dark Red Velvet Inlay Lining */}
      <div className="absolute inset-2 sm:inset-3 rounded-xl tray-velvet-texture border border-amber-900/40 shadow-[inset_0_6px_28px_rgba(0,0,0,0.8)] pointer-events-none" />

      {/* Decorative Antique Brass Corner Plates with Depth */}
      <div className="absolute top-2 left-2 w-5 h-5 border-t-[3px] border-l-[3px] border-amber-500/70 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] pointer-events-none rounded-tl-xs" />
      <div className="absolute top-2 right-2 w-5 h-5 border-t-[3px] border-r-[3px] border-amber-500/70 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] pointer-events-none rounded-tr-xs" />
      <div className="absolute bottom-2 left-2 w-5 h-5 border-b-[3px] border-l-[3px] border-amber-500/70 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] pointer-events-none rounded-bl-xs" />
      <div className="absolute bottom-2 right-2 w-5 h-5 border-b-[3px] border-r-[3px] border-amber-500/70 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] pointer-events-none rounded-br-xs" />

      {/* 2D Packed Canvas Drawer */}
      <div
        style={{ height: `${effectiveHeight}px` }}
        className="relative z-10 w-full flex items-center justify-center overflow-hidden"
      >
        <AnimatePresence custom={direction} mode="wait">
          {!currentDrawer || currentDrawer.items.length === 0 ? (
            <motion.div
              key="empty-tray"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-16 text-center space-y-3"
            >
              <div className="w-16 h-16 rounded-full bg-black/40 border border-white/10 mx-auto flex items-center justify-center text-amber-200/50">
                <Inbox className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-lg font-bold text-amber-100">No Specimen Bookmarks Found</h3>
              <p className="text-sm text-stone-300/70 max-w-md mx-auto font-serif italic">
                No bookmarks matched the current search or filters. Try resetting your search above.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={`drawer-${activeDrawerIndex}`}
              custom={direction}
              variants={drawerVariants}
              initial="enter"
              animate="center"
              exit="exit"
              style={{ width: "100%", height: "100%" }}
              className="relative"
            >
              {currentDrawer.items.map((packed) => (
                <BookmarkCard
                  key={packed.item.id}
                  packedItem={packed}
                  onInspect={onInspect}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tray Footnote Brass Plaque */}
      <div className="relative z-10 mt-3 pt-3 border-t border-amber-500/20 flex items-center justify-between text-[11px] font-mono text-amber-200/80">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span className="tracking-wider">ARCHIVAL VELVET SPECIMEN TRAY</span>
        </div>

        <div className="flex items-center gap-3">
          {onShuffle && (
            <button
              type="button"
              onClick={onShuffle}
              className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-100 transition-colors font-serif italic cursor-pointer hover:underline"
              title="Randomize bookmark order"
            >
              <Dices className="w-3.5 h-3.5 text-amber-400" />
              <span>Randomize Tray</span>
            </button>
          )}

          {packedDrawers.length > 1 && (
            <span className="font-serif italic text-amber-100 font-semibold">
              Drawer {activeDrawerIndex + 1} of {packedDrawers.length}
            </span>
          )}
          <span className="hidden sm:inline text-stone-400">· (← / →) to slide</span>
        </div>

        <span className="hidden xs:inline text-stone-400">TRUE PHYSICAL SCALE</span>
      </div>
    </div>
  );
}
