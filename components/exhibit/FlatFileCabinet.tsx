"use client";

import React, { useState } from "react";
import { PopulatedDrawer } from "@/lib/utils/geographic-drawers";
import { BookmarkWithDetails } from "@/lib/db/queries";
import { SpecimenTray } from "./SpecimenTray";
import { BrassCardPull } from "./BrassCardPull";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";

export interface FlatFileCabinetProps {
  drawers: PopulatedDrawer[];
  activeDrawerId: string | null;
  onSelectDrawer: (drawerId: string | null) => void;
  onInspectBookmark: (bookmark: BookmarkWithDetails) => void;
  onShuffle?: () => void;
}

// 12 Distinct Natural Hardwood Aging & Grain Profiles for Individual Drawer Planks
const WOOD_AGING_PROFILES = [
  {
    filter: "brightness(1.02) contrast(1.03) sepia(0.04)",
    backgroundPosition: "center 15%",
    backgroundSize: "100% 100%, 104% auto",
  },
  {
    filter: "brightness(0.96) contrast(1.08) hue-rotate(-3deg)",
    backgroundPosition: "center 45%",
    backgroundSize: "100% 100%, 108% auto",
  },
  {
    filter: "brightness(1.04) contrast(1.02) sepia(0.12) hue-rotate(4deg)",
    backgroundPosition: "center 75%",
    backgroundSize: "100% 100%, 102% auto",
  },
  {
    filter: "brightness(0.98) contrast(1.06) saturate(1.08)",
    backgroundPosition: "center 30%",
    backgroundSize: "100% 100%, 106% auto",
  },
  {
    filter: "brightness(1.01) contrast(1.05) sepia(0.08)",
    backgroundPosition: "center 60%",
    backgroundSize: "100% 100%, 100% auto",
  },
  {
    filter: "brightness(0.94) contrast(1.10) hue-rotate(-5deg)",
    backgroundPosition: "center 90%",
    backgroundSize: "100% 100%, 105% auto",
  },
  {
    filter: "brightness(1.03) contrast(1.04) saturate(1.12) hue-rotate(2deg)",
    backgroundPosition: "center 20%",
    backgroundSize: "100% 100%, 103% auto",
  },
  {
    filter: "brightness(0.97) contrast(1.07) sepia(0.06)",
    backgroundPosition: "center 50%",
    backgroundSize: "100% 100%, 107% auto",
  },
  {
    filter: "brightness(1.02) contrast(1.02) hue-rotate(3deg)",
    backgroundPosition: "center 80%",
    backgroundSize: "100% 100%, 101% auto",
  },
  {
    filter: "brightness(0.95) contrast(1.09) saturate(0.98)",
    backgroundPosition: "center 35%",
    backgroundSize: "100% 100%, 109% auto",
  },
  {
    filter: "brightness(1.05) contrast(1.04) sepia(0.10)",
    backgroundPosition: "center 65%",
    backgroundSize: "100% 100%, 103% auto",
  },
  {
    filter: "brightness(0.99) contrast(1.08) hue-rotate(-2deg)",
    backgroundPosition: "center 10%",
    backgroundSize: "100% 100%, 105% auto",
  },
];

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

  // Realistic 3D Drawer Pull & Forward Sliding Animation Variants
  const drawerSlideVariants = {
    closed: {
      opacity: 0,
      y: -50,
      scale: 0.94,
      rotateX: 5,
      transition: { duration: 0.25, ease: "easeIn" },
    },
    open: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 180,
        damping: 20,
        mass: 1.05,
      },
    },
    exit: {
      opacity: 0,
      y: -40,
      scale: 0.95,
      transition: { duration: 0.2, ease: "easeInOut" },
    },
  };

  return (
    <div className="w-full max-w-[1680px] mx-auto py-2 sm:py-4 px-2 sm:px-4 lg:px-6 drawer-sliding-chamber">
      {/* Full-Screen Antique Hardwood Flat-File Cabinet Housing */}
      <div className="relative w-full rounded-2xl cabinet-antique-housing p-3 sm:p-6 lg:p-8 border-[10px] sm:border-[18px] border-[#381605] shadow-[0_45px_90px_-15px_rgba(0,0,0,0.95)] overflow-hidden">
        {/* Mitered Brass Corner Protectors with Slotted Rivets */}
        <div className="absolute top-2.5 left-2.5 w-7 h-7 border-t-2 border-l-2 border-amber-400/90 pointer-events-none flex items-start justify-start p-0.5">
          <div className="brass-screw-head" />
        </div>
        <div className="absolute top-2.5 right-2.5 w-7 h-7 border-t-2 border-r-2 border-amber-400/90 pointer-events-none flex items-start justify-end p-0.5">
          <div className="brass-screw-head" />
        </div>
        <div className="absolute bottom-2.5 left-2.5 w-7 h-7 border-b-2 border-l-2 border-amber-400/90 pointer-events-none flex items-end justify-start p-0.5">
          <div className="brass-screw-head" />
        </div>
        <div className="absolute bottom-2.5 right-2.5 w-7 h-7 border-b-2 border-r-2 border-amber-400/90 pointer-events-none flex items-end justify-end p-0.5">
          <div className="brass-screw-head" />
        </div>

        {/* Closed Cabinet State: 4-Column Grid of Antique Hardwood Drawers */}
        <AnimatePresence>
          {isClosed ? (
            <motion.div
              key="closed-cabinet-stack"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full"
            >
              {/* 4 Columns Wide Antique Hardwood Drawers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
                {drawers.map((drawer, index) => {
                  const isMaster = drawer.id === "drawer-all";
                  const agingStyle = WOOD_AGING_PROFILES[index % WOOD_AGING_PROFILES.length];

                  return (
                    <motion.div
                      key={drawer.id}
                      onHoverStart={() => setHoveredDrawerId(drawer.id)}
                      onHoverEnd={() => setHoveredDrawerId(null)}
                      whileHover={{
                        scale: 1.018,
                        y: -3,
                        boxShadow: "0 18px 30px -4px rgba(0, 0, 0, 0.85)",
                        transition: { duration: 0.18 },
                      }}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => onSelectDrawer(drawer.id)}
                      style={{
                        filter: agingStyle.filter,
                        backgroundPosition: agingStyle.backgroundPosition,
                        backgroundSize: agingStyle.backgroundSize,
                      }}
                      className={`relative group cursor-pointer rounded-lg py-2.5 px-2 drawer-face-plank border ${
                        isMaster ? "border-[#874e17]" : "border-[#361605]"
                      } transition-all duration-200 select-none shadow-md flex items-center justify-center`}
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
                      {/* 
                        Centered Brass Card-Catalog Pull Handle Fixture 
                        50% smaller, delicate, centered on solid aged wood plank.
                      */}
                      <BrassCardPull
                        romanNumeral={drawer.romanNumeral}
                        title={drawer.title}
                        subtitle={drawer.subtitle}
                        count={drawer.count}
                        isMaster={isMaster}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            /* Open Drawer State: Realistic 3D Wooden Slide Out & Interior Specimen Tray */
            <motion.div
              key={`open-drawer-${activeDrawer?.id || "unknown"}`}
              variants={drawerSlideVariants}
              initial="closed"
              animate="open"
              exit="exit"
              className="space-y-4 relative"
            >
              {/* Sliding Drawer Box Outer Frame with Dovetail Wooden Sidewalls */}
              <div className="relative rounded-2xl p-2 sm:p-4 bg-[#230d03] border-4 border-[#4d2208] shadow-[0_30px_60px_-10px_rgba(0,0,0,0.9)] overflow-hidden">
                {/* Left Dovetailed Wood Sidewall */}
                <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-3.5 drawer-dovetail-side border-r border-[#1a0802] shadow-inner pointer-events-none" />

                {/* Right Dovetailed Wood Sidewall */}
                <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-3.5 drawer-dovetail-side border-l border-[#1a0802] shadow-inner pointer-events-none" />

                {/* Active Drawer Top Brass Control & Navigation Plaque */}
                <div className="relative z-10 p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-amber-950 via-[#4e220c] to-amber-950 border border-amber-400/60 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-3 mx-1 sm:mx-3">
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                      type="button"
                      onClick={() => onSelectDrawer(null)}
                      aria-label="Push Drawer In"
                      className="brass-button px-4 py-1.5 rounded-lg text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md shrink-0 hover:scale-105 active:scale-95 transition-transform"
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
                          {d.title} ({d.count})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* The 2D Velvet Specimen Tray Sliding Inside the Pulled Drawer */}
                {activeDrawer && (
                  <div className="mt-3 px-1 sm:px-3">
                    <SpecimenTray
                      bookmarks={activeDrawer.bookmarks}
                      currentPage={1}
                      direction={1}
                      onInspect={onInspectBookmark}
                      onShuffle={onShuffle}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
