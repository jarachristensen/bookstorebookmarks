"use client";

import React, { useState } from "react";
import { PopulatedDrawer } from "@/lib/utils/geographic-drawers";
import { BookmarkWithDetails } from "@/lib/db/queries";
import { SpecimenTray } from "./SpecimenTray";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderArchive,
  Layers,
  ChevronLeft,
  Sparkles,
  Compass,
} from "lucide-react";

export interface FlatFileCabinetProps {
  drawers: PopulatedDrawer[];
  activeDrawerId: string | null;
  onSelectDrawer: (drawerId: string | null) => void;
  onInspectBookmark: (bookmark: BookmarkWithDetails) => void;
  onShuffle?: () => void;
}

export function FlatFileCabinet({
  drawers,
  activeDrawerId,
  onSelectDrawer,
  onInspectBookmark,
  onShuffle,
}: FlatFileCabinetProps) {
  const [hoveredDrawerId, setHoveredDrawerId] = useState<string | null>(null);

  const activeDrawer = drawers.find((d) => d.id === activeDrawerId) || null;
  const isClosed = activeDrawerId === null;

  // Drawer slide animation variants
  const drawerSlideVariants = {
    closed: {
      opacity: 0,
      y: 40,
      scale: 0.98,
      transition: { duration: 0.25, ease: "easeIn" },
    },
    open: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 240,
        damping: 26,
      },
    },
    exit: {
      opacity: 0,
      y: 30,
      scale: 0.98,
      transition: { duration: 0.2 },
    },
  };

  return (
    <div className="w-full max-w-[1240px] mx-auto py-2 sm:py-4 px-2 sm:px-4">
      {/* Antique Hardwood Flat-File Cabinet Housing */}
      <div className="relative w-full rounded-2xl cabinet-antique-housing p-3 sm:p-6 lg:p-8 border-[8px] sm:border-[16px] border-[#3a1806] shadow-2xl overflow-hidden">
        {/* Mitered Brass Corner Protectors with Rivets */}
        <div className="absolute top-2.5 left-2.5 w-6 h-6 border-t-2 border-l-2 border-amber-400/80 pointer-events-none flex items-start justify-start p-0.5">
          <div className="brass-screw-head" />
        </div>
        <div className="absolute top-2.5 right-2.5 w-6 h-6 border-t-2 border-r-2 border-amber-400/80 pointer-events-none flex items-start justify-end p-0.5">
          <div className="brass-screw-head" />
        </div>
        <div className="absolute bottom-2.5 left-2.5 w-6 h-6 border-b-2 border-l-2 border-amber-400/80 pointer-events-none flex items-end justify-start p-0.5">
          <div className="brass-screw-head" />
        </div>
        <div className="absolute bottom-2.5 right-2.5 w-6 h-6 border-b-2 border-r-2 border-amber-400/80 pointer-events-none flex items-end justify-end p-0.5">
          <div className="brass-screw-head" />
        </div>

        {/* Cabinet Top Brass Engraved Header Plaque */}
        <div className="relative z-10 mb-5 sm:mb-7 pb-3 border-b border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-amber-950/80 border border-amber-400/60 flex items-center justify-center text-amber-300 shadow-inner">
              <FolderArchive className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif tracking-widest uppercase text-xs sm:text-sm font-bold text-amber-200 text-shadow">
                Archival Hardwood Specimen Flat-File
              </h2>
              <p className="text-[11px] text-amber-200/70 font-serif italic">
                Antique Library Card Catalog · Solid Walnut & Cast Brass Fixtures
              </p>
            </div>
          </div>

          {/* Quick status badge / Close button when drawer is pulled */}
          {!isClosed ? (
            <button
              type="button"
              onClick={() => onSelectDrawer(null)}
              aria-label="Close Cabinet"
              className="brass-button px-4 py-1.5 rounded-lg text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-md"
              title="Close active drawer and return to full cabinet"
            >
              <ChevronLeft className="w-4 h-4 text-amber-950" />
              <span>Close Cabinet</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-black/40 border border-amber-400/40 text-amber-300 text-xs font-serif italic shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>7 Regional Drawers Indexed</span>
            </div>
          )}
        </div>

        {/* Closed Cabinet State: Stacked Hardwood Drawer Fronts & Invitation Prompt */}
        <AnimatePresence>
          {isClosed ? (
            <motion.div
              key="closed-cabinet-stack"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* Tactile Callout Banner Prompt */}
              <div className="relative p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-amber-950/90 via-[#481c08] to-amber-950/90 border border-amber-400/50 text-center shadow-xl">
                <div className="flex items-center justify-center gap-2 text-amber-300 font-serif font-bold text-sm sm:text-base tracking-wide">
                  <Compass className="w-4 h-4 text-amber-400 animate-spin-slow" />
                  <span>✦ Pull Any Brass Drawer to Inspect Specimens ✦</span>
                  <Compass className="w-4 h-4 text-amber-400 animate-spin-slow" />
                </div>
                <p className="mt-1 text-xs text-amber-200/80 font-serif italic">
                  Select a regional drawer below to slide it open and view its velvet-lined specimen tray.
                </p>
              </div>

              {/* Stack of Realistic Antique Hardwood Drawer Planks */}
              <div className="grid grid-cols-1 gap-2 sm:gap-2.5">
                {drawers.map((drawer) => {
                  const isHovered = hoveredDrawerId === drawer.id;
                  const isMaster = drawer.id === "drawer-all";

                  return (
                    <motion.div
                      key={drawer.id}
                      onHoverStart={() => setHoveredDrawerId(drawer.id)}
                      onHoverEnd={() => setHoveredDrawerId(null)}
                      whileHover={{ scale: 1.006, y: -1 }}
                      whileTap={{ scale: 0.994 }}
                      onClick={() => onSelectDrawer(drawer.id)}
                      className={`relative group cursor-pointer rounded-lg p-3 sm:p-4 drawer-face-plank border ${
                        isMaster
                          ? "border-amber-400/70 bg-gradient-to-r from-[#6b3012] via-[#52220b] to-[#6b3012]"
                          : "border-[#85401b]/60"
                      } transition-all duration-200 select-none shadow-md`}
                      role="button"
                      tabIndex={0}
                      aria-label={`Open ${drawer.title}`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onSelectDrawer(drawer.id);
                        }
                      }}
                    >
                      {/* Realistic Wooden Joinery Shadow Channels (Left & Right) */}
                      <div className="absolute left-2 top-2 bottom-2 w-1.5 rounded-sm bg-black/60 border-r border-amber-300/10 pointer-events-none" />
                      <div className="absolute right-2 top-2 bottom-2 w-1.5 rounded-sm bg-black/60 border-l border-amber-300/10 pointer-events-none" />

                      {/* 3-Column Symmetrical Layout: Left Detail, Centered Brass Hardware, Right Pill */}
                      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 items-center justify-between gap-3 px-3 sm:px-6">
                        {/* Left Wing: Regional Subtitle & Reference Stamp */}
                        <div className="hidden md:block text-left">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400/80 block">
                            {isMaster ? "MASTER CATALOG" : `SECTION · ${drawer.romanNumeral.replace("DRAWER ", "REG-")}`}
                          </span>
                          <span className="text-xs text-amber-200/70 font-serif italic line-clamp-1">
                            {drawer.subtitle}
                          </span>
                        </div>

                        {/* Center Column: EVEN & CENTERED BRASS CARD HOLDER + BRASS CUP HANDLE */}
                        <div className="flex flex-col items-center justify-center gap-1.5 text-center mx-auto w-full max-w-[340px]">
                          {/* Authentic Antique Brass Card-Catalog Label Frame */}
                          <div className="brass-card-holder-frame w-full p-[3px] rounded-[5px] shadow-lg relative">
                            {/* Four Corner Brass Screws */}
                            <div className="absolute top-[3px] left-[3px]">
                              <div className="brass-screw-head" />
                            </div>
                            <div className="absolute top-[3px] right-[3px]">
                              <div className="brass-screw-head" />
                            </div>
                            <div className="absolute bottom-[3px] left-[3px]">
                              <div className="brass-screw-head" />
                            </div>
                            <div className="absolute bottom-[3px] right-[3px]">
                              <div className="brass-screw-head" />
                            </div>

                            {/* Aged Parchment Card Insert */}
                            <div className="parchment-index-card px-4 py-1.5 rounded-[3px] text-center border border-amber-900/30">
                              <span className="block text-[10px] font-mono font-bold tracking-widest text-amber-950 uppercase mb-0.5">
                                {drawer.romanNumeral}
                              </span>
                              <h3 className="font-serif font-bold text-xs sm:text-sm text-stone-900 leading-tight">
                                {drawer.title}
                              </h3>
                            </div>
                          </div>

                          {/* Authentic 3D Sculpted Antique Brass Cup Pull Handle with Screws */}
                          <div className="flex items-center justify-center gap-1.5 mt-0.5">
                            {/* Left Wing Screw */}
                            <div className="brass-screw-head shrink-0" />

                            {/* Sculpted Brass Cup Pull (Even & Middle) */}
                            <div
                              className="brass-cup-handle-sculpted w-24 sm:w-28 h-6 sm:h-7 rounded-t-full rounded-b-sm flex items-center justify-center shadow-lg group-hover:brightness-110 transition-all cursor-pointer"
                              title="Pull Drawer"
                            />

                            {/* Right Wing Screw */}
                            <div className="brass-screw-head shrink-0" />
                          </div>
                        </div>

                        {/* Right Wing: Specimen Counter Pill Badge */}
                        <div className="flex items-center justify-center md:justify-end gap-2 text-right">
                          <div className="px-3 py-1.5 rounded-full bg-black/60 border border-amber-400/40 text-amber-200 text-xs font-mono font-medium flex items-center gap-1.5 shadow-inner">
                            <Layers className="w-3.5 h-3.5 text-amber-400" />
                            <span>{drawer.count} {drawer.count === 1 ? "Specimen" : "Specimens"}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            /* Open Drawer State: Realistic Wooden Slide Out & Interior Specimen Tray */
            <motion.div
              key={`open-drawer-${activeDrawer?.id || "unknown"}`}
              variants={drawerSlideVariants}
              initial="closed"
              animate="open"
              exit="exit"
              className="space-y-4"
            >
              {/* Active Drawer Top Brass Control & Navigation Plaque */}
              <div className="relative p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-amber-950 via-[#4e220c] to-amber-950 border border-amber-400/60 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => onSelectDrawer(null)}
                    aria-label="Push Drawer In"
                    className="brass-button px-3.5 py-1.5 rounded-lg text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md shrink-0 hover:scale-105 active:scale-95 transition-transform"
                    title="Slide drawer back into cabinet"
                  >
                    <ChevronLeft className="w-4 h-4 text-amber-950" />
                    <span>Push Drawer In</span>
                  </button>

                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                        {activeDrawer?.romanNumeral}:
                      </span>
                      <h3 className="font-serif font-bold text-base sm:text-lg text-amber-100">
                        {activeDrawer?.title}
                      </h3>
                    </div>
                    <p className="text-xs text-amber-200/80 font-serif italic">
                      {activeDrawer?.subtitle} · ({activeDrawer?.count} {activeDrawer?.count === 1 ? "Specimen" : "Specimens"})
                    </p>
                  </div>
                </div>

                {/* Regional Quick Drawer Switcher Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none">
                  {drawers.map((d) => {
                    const isCurrent = d.id === activeDrawer?.id;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => onSelectDrawer(d.id)}
                        className={`px-3 py-1.5 rounded-md text-[11px] font-serif transition-colors whitespace-nowrap cursor-pointer border ${
                          isCurrent
                            ? "bg-amber-400 text-stone-950 font-bold border-amber-300 shadow-md"
                            : "bg-black/50 text-amber-200/80 hover:text-amber-100 hover:bg-black/70 border-amber-500/25"
                        }`}
                        title={d.title}
                      >
                        {d.romanNumeral.replace("DRAWER ", "DR. ")} ({d.count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* The 2D Velvet Specimen Tray for the Open Drawer */}
              {activeDrawer && (
                <SpecimenTray
                  bookmarks={activeDrawer.bookmarks}
                  currentPage={1}
                  direction={1}
                  onInspect={onInspectBookmark}
                  onShuffle={onShuffle}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
