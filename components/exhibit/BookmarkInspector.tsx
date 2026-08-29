"use client";

import React, { useState } from "react";
import Image from "next/image";
import { BookmarkWithDetails } from "@/lib/db/queries";
import { parseDimensions } from "@/lib/utils/dimensions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  RotateCw,
  X,
  BookOpen,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  Info,
  Maximize2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface BookmarkInspectorProps {
  bookmark: BookmarkWithDetails;
  onClose: () => void;
  onOpenDossier?: () => void;
}

export function BookmarkInspector({
  bookmark,
  onClose,
  onOpenDossier,
}: BookmarkInspectorProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const store = bookmark.bookstore;
  const parsedDim = parseDimensions(bookmark.dimensions);

  return (
    <div className="relative w-full max-w-5xl bg-[#FAF8F3] border border-parchment-border rounded-2xl shadow-2xl overflow-hidden p-4 sm:p-8 lg:p-10">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-4 sm:pb-6 border-b border-parchment-border">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="p-1.5 sm:p-2 rounded-lg bg-archival-oxblood/10 text-archival-oxblood border border-archival-oxblood/20">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h2 className="font-serif text-base sm:text-xl font-bold text-ink line-clamp-1">
              {store?.name || "Bookstore Archive"}
            </h2>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-ink-muted">
              {store && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-archival-oxblood shrink-0" />
                  <span className="truncate">{store.city}, {store.country}</span>
                </span>
              )}
              {bookmark.yearProduced && (
                <>
                  <span>·</span>
                  <span className="font-serif italic shrink-0">c. {bookmark.yearProduced}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            aria-label="Close Inspector"
            className="p-1.5 sm:p-2 rounded-full hover:bg-parchment-muted text-ink-muted hover:text-ink transition-colors cursor-pointer bg-white/60 border border-parchment-border sm:border-transparent"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Main Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 pt-4 sm:pt-8 items-center">
        {/* 3D Paper Turn Canvas (Left Column) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center space-y-4 sm:space-y-6">
          {/* 3D Flip Container with Adaptive Mobile Height */}
          <div
            className="w-full flex items-center justify-center p-2 sm:p-4 h-[320px] xs:h-[360px] sm:h-[480px] lg:h-[520px] max-h-[50vh] sm:max-h-none"
            style={{ perspective: 1200 }}
          >
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              style={{
                transformStyle: "preserve-3d",
                aspectRatio: `${parsedDim.aspectRatio}`,
              }}
              onClick={() => setIsFlipped(!isFlipped)}
              className={`relative cursor-pointer select-none group ${
                parsedDim.isLandscape
                  ? "w-full max-w-[500px] h-auto max-h-[340px]"
                  : "h-full max-w-[280px] w-auto"
              }`}
            >
              {/* FRONT SIDE (Recto) */}
              <div
                className="absolute inset-0 w-full h-full flex items-center justify-center"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transformStyle: "preserve-3d",
                }}
              >
                <div className="relative w-full h-full flex items-center justify-center filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.22)]">
                  <Image
                    src={bookmark.frontImageUrl}
                    alt={`${bookmark.title} - Recto (Front)`}
                    fill
                    unoptimized
                    className="object-contain object-center filter contrast-[1.02]"
                    sizes="(max-width: 640px) 240px, 400px"
                    priority
                  />
                  <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 px-1.5 py-0.5 rounded bg-black/65 backdrop-blur-xs text-[9px] sm:text-[10px] font-mono text-white shadow-sm z-20">
                    RECTO (FRONT)
                  </div>
                </div>
              </div>

              {/* BACK SIDE (Verso) */}
              <div
                className="absolute inset-0 w-full h-full flex items-center justify-center"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transformStyle: "preserve-3d",
                  transform: "rotateY(180deg)",
                }}
              >
                <div className="relative w-full h-full flex items-center justify-center filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.22)]">
                  {bookmark.backImageUrl ? (
                    <Image
                      src={bookmark.backImageUrl}
                      alt={`${bookmark.title} - Verso (Back)`}
                      fill
                      unoptimized
                      className="object-contain object-center filter contrast-[1.02]"
                      sizes="(max-width: 640px) 240px, 400px"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 text-center text-ink-muted bg-[#F5EFE6] rounded-[6px] border border-parchment-border shadow-inner">
                      <Layers className="w-6 h-6 sm:w-8 sm:h-8 opacity-40 mb-1.5 sm:mb-2 text-archival-oxblood" />
                      <p className="font-serif italic text-xs sm:text-sm text-ink">Blank Verso (Plain Back)</p>
                      <p className="text-[11px] text-ink-muted mt-1 font-serif hidden xs:block">Original blank paper stock without advertising imprint.</p>
                    </div>
                  )}
                  <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 px-1.5 py-0.5 rounded bg-black/65 backdrop-blur-xs text-[9px] sm:text-[10px] font-mono text-white shadow-sm z-20">
                    VERSO (BACK)
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Interactive Flip Trigger Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFlipped(!isFlipped)}
              className="flex items-center gap-2 font-serif text-xs bg-white py-1.5 px-3"
            >
              <RotateCw className="w-3.5 h-3.5 text-archival-amber transition-transform group-hover:rotate-180" />
              <span>{isFlipped ? "Flip to Recto (Front)" : "Flip to Verso (Back)"}</span>
            </Button>
            <span className="text-[11px] font-mono text-ink-muted hidden xs:inline">
              (or tap paper)
            </span>
          </div>
        </div>

        {/* Physical Specimen Details (Right Column) */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6">
          <div className="space-y-1 sm:space-y-2 text-center lg:text-left">
            <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-ink tracking-tight">
              {bookmark.title}
            </h2>
            {store && (
              <p className="font-serif text-xs sm:text-sm text-archival-oxblood font-semibold">
                {store.name} · {store.city}, {store.country}
              </p>
            )}
          </div>

          {/* Physical Specimen Properties Card */}
          <div className="bg-white/80 p-4 sm:p-5 rounded-xl border border-parchment-border shadow-xs space-y-2.5 sm:space-y-3">
            <h4 className="font-mono text-[11px] sm:text-xs font-bold text-archival-amber uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Physical Specimen Specifications</span>
            </h4>

            <div className="grid grid-cols-2 gap-y-2 sm:gap-y-3 gap-x-3 sm:gap-x-4 text-xs font-serif pt-1">
              <div>
                <span className="text-ink-muted block text-[10px] sm:text-[11px] font-mono">DIMENSIONS</span>
                <span className="font-bold text-ink">{bookmark.dimensions}</span>
              </div>
              <div>
                <span className="text-ink-muted block text-[10px] sm:text-[11px] font-mono">MATERIAL STOCK</span>
                <span className="font-bold text-ink">{bookmark.material}</span>
              </div>
              <div>
                <span className="text-ink-muted block text-[10px] sm:text-[11px] font-mono">CONDITION</span>
                <span className="font-bold text-ink">{bookmark.condition}</span>
              </div>
              <div>
                <span className="text-ink-muted block text-[10px] sm:text-[11px] font-mono">ESTIMATED ERA</span>
                <span className="font-bold text-ink">
                  {bookmark.yearProduced ? `c. ${bookmark.yearProduced}` : "Mid 20th Century"}
                </span>
              </div>
            </div>

            {bookmark.acquisitionNotes && (
              <div className="pt-2 sm:pt-3 border-t border-parchment-border/60 text-xs font-serif text-ink-light">
                <span className="text-ink-muted block text-[10px] sm:text-[11px] font-mono mb-0.5">
                  CURATOR'S PROVENANCE
                </span>
                <p className="italic">"{bookmark.acquisitionNotes}"</p>
              </div>
            )}
          </div>

          {/* Action to open Bookstore Dossier */}
          {store && onOpenDossier && (
            <div className="pt-1 sm:pt-2">
              <Button
                variant="oxblood"
                size="md"
                aria-label="Read Full Bookstore Dossier"
                onClick={onOpenDossier}
                className="w-full flex items-center justify-center gap-2 font-serif text-xs sm:text-sm py-2.5 sm:py-3"
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 shrink-0" />
                <span className="truncate">Read Full Bookstore Dossier &amp; Clippings →</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
