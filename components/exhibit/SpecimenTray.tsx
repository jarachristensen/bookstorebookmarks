"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { BookmarkWithDetails } from "@/lib/db/queries";
import { packSpecimenTrays, TrayDrawer } from "@/lib/utils/bin-packing";
import { BookmarkCard } from "./BookmarkCard";
import { motion, AnimatePresence } from "framer-motion";
import { Inbox, Layers, Dices } from "lucide-react";

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
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState<number>(1040);
  const [trayHeight, setTrayHeight] = useState<number>(450);

  // Measure exact inner canvas dimensions dynamically
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const measured = canvasRef.current.clientWidth;
        const width = measured > 50 ? measured : 1040;
        setCanvasWidth(width);

        // Adjust tray height responsively based on screen width
        if (width < 640) {
          setTrayHeight(380);
        } else if (width < 1024) {
          setTrayHeight(420);
        } else {
          setTrayHeight(450);
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

  // Pack bookmarks into true-scale 2D trays based on inner canvas width
  const effectiveWidth = canvasWidth > 50 ? canvasWidth : 1040;
  const effectiveHeight = trayHeight > 50 ? trayHeight : 540;

  const packedDrawers = useMemo(() => {
    if (!bookmarks || bookmarks.length === 0) return [];
    return packSpecimenTrays(bookmarks, {
      trayWidth: effectiveWidth,
      trayHeight: effectiveHeight,
      buffer: effectiveWidth < 640 ? 16 : 24,
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
    <div className="relative w-full max-w-[1240px] mx-auto py-2 sm:py-4 px-1 sm:px-6">
      {/* Outer Skeuomorphic Hardwood Serving Tray Container */}
      <div className="relative w-full rounded-2xl tray-antique-wood-outer p-3 sm:p-5 lg:p-7 border-[10px] sm:border-[16px] border-[#5a2e15] shadow-2xl">
        {/* Left Carved Wooden Handle (Matches reference photo) */}
        <div className="hidden sm:block absolute -left-5 top-1/2 -translate-y-1/2 w-5 h-24 rounded-l-xl tray-wood-handle border-l-2 border-y-2 border-[#3d1d0c] pointer-events-none z-0" />

        {/* Right Carved Wooden Handle (Matches reference photo) */}
        <div className="hidden sm:block absolute -right-5 top-1/2 -translate-y-1/2 w-5 h-24 rounded-r-xl tray-wood-handle border-r-2 border-y-2 border-[#3d1d0c] pointer-events-none z-0" />

        {/* Inner Beveled Wood Lip / Moulding */}
        <div className="absolute inset-1.5 sm:inset-2.5 rounded-xl tray-antique-wood-rim pointer-events-none" />

        {/* Luminous Gallery-Lit Archival Dark Red Velvet Floor */}
        <div className="absolute inset-3 sm:inset-4.5 rounded-lg tray-velvet-lit pointer-events-none" />

        {/* Mitered 45° Corner Bevel Accents */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-amber-300/30 pointer-events-none" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-amber-300/30 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-amber-300/30 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-amber-300/30 pointer-events-none" />

        {/* 2D Packed Canvas Drawer (Measured directly for exact pixel boundaries) */}
        <div
          ref={canvasRef}
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
                <div className="w-16 h-16 rounded-full bg-black/40 border border-white/10 mx-auto flex items-center justify-center text-amber-200/60">
                  <Inbox className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-lg font-bold text-amber-100">No Specimen Bookmarks Found</h3>
                <p className="text-sm text-amber-100/70 max-w-md mx-auto font-serif italic">
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

        {/* Tray Footnote Brass Inlay Plaque */}
        <div className="relative z-10 mt-3 pt-3 border-t border-amber-400/25 flex items-center justify-between text-[11px] font-mono text-amber-200/90">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span className="tracking-wider uppercase">Archival Velvet Specimen Tray</span>
          </div>

          <div className="flex items-center gap-3">
            {onShuffle && (
              <button
                type="button"
                onClick={onShuffle}
                className="inline-flex items-center gap-1 text-amber-300 hover:text-white transition-colors font-serif italic cursor-pointer hover:underline"
                title="Randomize bookmark layout"
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
            <span className="hidden sm:inline text-amber-200/60">· (← / →) to slide</span>
          </div>

          <span className="hidden xs:inline text-amber-200/60">TRUE PHYSICAL SCALE</span>
        </div>
      </div>
    </div>
  );
}
