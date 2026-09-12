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
  ArrowRight,
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
      <div className="relative w-full rounded-2xl cabinet-antique-housing p-3 sm:p-6 lg:p-8 border-[8px] sm:border-[14px] border-[#381605] shadow-2xl overflow-hidden">
        {/* Brass Corner Brackets */}
        <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-amber-400/60 pointer-events-none" />
        <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-amber-400/60 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-amber-400/60 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-amber-400/60 pointer-events-none" />

        {/* Cabinet Top Brass Engraved Header Bar */}
        <div className="relative z-10 mb-4 sm:mb-6 pb-3 border-b border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-amber-900/60 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
              <FolderArchive className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif tracking-widest uppercase text-xs sm:text-sm font-bold text-amber-200 text-shadow">
                Archival Flat-File Specimen Cabinet
              </h2>
              <p className="text-[11px] text-amber-200/60 font-serif italic">
                Hardwood Card Catalog · Organized by Regional Geographic Provenance
              </p>
            </div>
          </div>

          {/* Quick status badge / Close button when drawer is pulled */}
          {!isClosed ? (
            <button
              type="button"
              onClick={() => onSelectDrawer(null)}
              aria-label="Close Cabinet"
              className="brass-button px-3.5 py-1.5 rounded-lg text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-md"
              title="Close active drawer and return to full cabinet"
            >
              <ChevronLeft className="w-4 h-4 text-amber-950" />
              <span>Close Cabinet</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-serif italic">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>All 7 Drawers Indexed & Ready</span>
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
              <div className="relative p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-amber-950/80 via-amber-900/60 to-amber-950/80 border border-amber-400/40 text-center shadow-lg">
                <div className="flex items-center justify-center gap-2 text-amber-300 font-serif font-bold text-sm sm:text-base tracking-wide">
                  <Compass className="w-4 h-4 text-amber-400 animate-spin-slow" />
                  <span>✦ Pull Any Brass Drawer to Inspect Specimens ✦</span>
                  <Compass className="w-4 h-4 text-amber-400 animate-spin-slow" />
                </div>
                <p className="mt-1 text-xs text-amber-200/75 font-serif italic">
                  Select a regional drawer below to slide it open and view its velvet-lined specimen tray.
                </p>
              </div>

              {/* Stack of Antique Hardwood Drawer Fronts */}
              <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
                {drawers.map((drawer) => {
                  const isMaster = drawer.id === "drawer-all";

                  return (
                    <motion.div
                      key={drawer.id}
                      onHoverStart={() => setHoveredDrawerId(drawer.id)}
                      onHoverEnd={() => setHoveredDrawerId(null)}
                      whileHover={{ scale: 1.008, x: 3 }}
                      whileTap={{ scale: 0.992 }}
                      onClick={() => onSelectDrawer(drawer.id)}
                      className={`relative group cursor-pointer rounded-xl p-3 sm:p-4 drawer-face-antique border ${
                        isMaster
                          ? "border-amber-400/60 bg-gradient-to-r from-[#5a250c] via-[#481c08] to-[#361305]"
                          : "border-[#783918]/60"
                      } transition-all duration-200 select-none`}
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
                      {/* Drawer Side Wood Grooves */}
                      <div className="absolute left-1.5 top-2 bottom-2 w-1 rounded-sm bg-black/40 border-r border-white/10 pointer-events-none" />
                      <div className="absolute right-1.5 top-2 bottom-2 w-1 rounded-sm bg-black/40 border-l border-white/10 pointer-events-none" />

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pl-3 pr-2">
                        {/* Left: Brass Index Card Holder Frame */}
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <div className="brass-label-holder p-1 sm:p-1.5 rounded-md shadow-md shrink-0">
                            <div className="bg-[#fcf7ee] text-stone-900 px-2.5 py-1 rounded-[3px] border border-amber-900/30 text-center min-w-[90px] sm:min-w-[110px] shadow-inner">
                              <span className="block text-[10px] sm:text-[11px] font-mono font-bold tracking-wider text-amber-950 uppercase">
                                {drawer.romanNumeral}
                              </span>
                            </div>
                          </div>

                          <div className="text-left">
                            <div className="flex items-center gap-2">
                              <h3 className="font-serif font-bold text-sm sm:text-base text-amber-100 group-hover:text-amber-300 transition-colors">
                                {drawer.title}
                              </h3>
                              {isMaster && (
                                <span className="text-[10px] font-mono uppercase bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded">
                                  Master Archive
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-amber-200/70 font-serif italic line-clamp-1">
                              {drawer.subtitle} · {drawer.description}
                            </p>
                          </div>
                        </div>

                        {/* Middle/Right: Polished Brass Pull Handle & Specimen Count Pill */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto mt-1 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-amber-900/40">
                          {/* Skeuomorphic Brass Pull Handle */}
                          <div
                            className="brass-cup-pull w-14 sm:w-16 h-5 sm:h-6 rounded-t-xl rounded-b-sm mx-auto sm:mx-0 flex items-center justify-center shadow-md group-hover:brightness-110 transition-all"
                            title="Pull Drawer"
                          >
                            <div className="w-8 h-1 rounded-full bg-amber-950/40" />
                          </div>

                          {/* Specimen Count Badge */}
                          <div className="flex items-center gap-2">
                            <div className="px-2.5 py-1 rounded-full bg-black/40 border border-amber-400/30 text-amber-200 text-xs font-mono font-medium flex items-center gap-1.5 shrink-0">
                              <Layers className="w-3 h-3 text-amber-400" />
                              <span>{drawer.count} {drawer.count === 1 ? "Specimen" : "Specimens"}</span>
                            </div>

                            {/* Pull Drawer Action Indicator */}
                            <div className="hidden md:flex items-center gap-1 text-xs font-serif italic text-amber-300/80 group-hover:text-amber-300 group-hover:translate-x-1 transition-all">
                              <span>Pull Drawer</span>
                              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                            </div>
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
              <div className="relative p-3 sm:p-4 rounded-xl bg-gradient-to-r from-amber-950 via-[#4e220c] to-amber-950 border border-amber-400/50 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => onSelectDrawer(null)}
                    aria-label="Push Drawer In"
                    className="brass-button px-3 py-1.5 rounded-lg text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md shrink-0 hover:scale-105 active:scale-95 transition-transform"
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
                    <p className="text-xs text-amber-200/75 font-serif italic">
                      {activeDrawer?.subtitle} ({activeDrawer?.count} {activeDrawer?.count === 1 ? "Specimen" : "Specimens"})
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
                        className={`px-2.5 py-1 rounded-md text-[11px] font-serif transition-colors whitespace-nowrap cursor-pointer border ${
                          isCurrent
                            ? "bg-amber-400 text-stone-950 font-bold border-amber-300 shadow-sm"
                            : "bg-black/40 text-amber-200/80 hover:text-amber-100 hover:bg-black/60 border-amber-500/20"
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
