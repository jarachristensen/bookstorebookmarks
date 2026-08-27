"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { BookmarkWithDetails } from "@/lib/db/queries";
import { packSpecimenTrays, TrayDrawer } from "@/lib/utils/bin-packing";
import { BookmarkCard } from "./BookmarkCard";
import { motion, AnimatePresence } from "framer-motion";
import { Inbox, ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface SpecimenTrayProps {
  bookmarks: BookmarkWithDetails[];
  currentPage: number;
  direction?: number; // 1 for next, -1 for prev
  onInspect: (bookmark: BookmarkWithDetails) => void;
  onPrevPage?: () => void;
  onNextPage?: () => void;
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
      className="relative w-full rounded-2xl p-3 sm:p-6 lg:p-8 bg-[#EAE3D2] border-4 border-[#D8CEB9] shadow-inner shadow-black/10 overflow-hidden"
    >
      {/* Linen Cloth Inlay Texture */}
      <div className="absolute inset-2 sm:inset-3 rounded-xl tray-linen-texture border border-[#D5C8B4] shadow-sm pointer-events-none" />

      {/* Decorative Brass Corner Plates */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-800/40 pointer-events-none" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-800/40 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-800/40 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-800/40 pointer-events-none" />

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
              <div className="w-16 h-16 rounded-full bg-parchment-border/40 mx-auto flex items-center justify-center text-ink-muted">
                <Inbox className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-lg font-bold text-ink">No Specimen Bookmarks Found</h3>
              <p className="text-sm text-ink-muted max-w-md mx-auto font-serif italic">
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

      {/* Tray Footnote & Quick Drawer Switcher */}
      <div className="relative z-10 mt-3 pt-3 border-t border-[#D5C8B4]/60 flex items-center justify-between text-[11px] font-mono text-ink-muted">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-archival-oxblood" />
          <span>TRUE-SCALE SPECIMEN TRAY</span>
        </div>

        <div className="flex items-center gap-2">
          {packedDrawers.length > 1 && (
            <span className="font-serif italic text-ink font-semibold">
              Drawer {activeDrawerIndex + 1} of {packedDrawers.length}
            </span>
          )}
          <span className="hidden sm:inline">· Arrow Keys (← / →) to slide drawers</span>
        </div>

        <span className="hidden xs:inline">ARCHIVAL PROPORTIONS</span>
      </div>
    </div>
  );
}
