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
    <div className="relative w-full max-w-5xl bg-[#FAF8F3] border border-parchment-border rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 lg:p-10">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-6 border-b border-parchment-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-archival-oxblood/10 text-archival-oxblood border border-archival-oxblood/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-ink">
              {store?.name || "Bookstore Archive"}
            </h2>
            <div className="flex items-center gap-2 text-xs text-ink-muted">
              {store && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-archival-oxblood" />
                  <span>{store.city}, {store.country}</span>
                </span>
              )}
              {bookmark.yearProduced && (
                <>
                  <span>·</span>
                  <span className="font-serif italic">c. {bookmark.yearProduced}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            aria-label="Close Inspector"
            className="p-2 rounded-full hover:bg-parchment-muted text-ink-muted hover:text-ink transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-8 items-center">
        {/* 3D Paper Turn Canvas (Left Column) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center space-y-6">
          {/* 3D Flip Container with True Transparent Specimen */}
          <div
            className="w-full flex items-center justify-center p-4 h-[480px] sm:h-[540px]"
            style={{ perspective: 1200 }}
          >
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
              style={{
                transformStyle: "preserve-3d",
                height: "100%",
                aspectRatio: `${parsedDim.aspectRatio}`,
              }}
              onClick={() => setIsFlipped(!isFlipped)}
              className="relative cursor-pointer select-none group filter drop-shadow-[0_16px_32px_rgba(0,0,0,0.25)]"
            >
              {/* FRONT SIDE (Recto) */}
              <div
                className="absolute inset-0 w-full h-full backface-hidden flex items-center justify-center"
                style={{ backfaceVisibility: "hidden" }}
              >
                <Image
                  src={bookmark.frontImageUrl}
                  alt={`${bookmark.title} - Recto (Front)`}
                  fill
                  className="object-contain object-center filter contrast-[1.02]"
                  sizes="400px"
                  priority
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-mono text-white shadow-sm z-20">
                  RECTO (FRONT)
                </div>
              </div>

              {/* BACK SIDE (Verso) */}
              <div
                className="absolute inset-0 w-full h-full backface-hidden flex items-center justify-center"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                {bookmark.backImageUrl ? (
                  <Image
                    src={bookmark.backImageUrl}
                    alt={`${bookmark.title} - Verso (Back)`}
                    fill
                    className="object-contain object-center filter contrast-[1.02]"
                    sizes="400px"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-ink-muted bg-[#F5EFE6] rounded-[6px] border border-parchment-border shadow-inner">
                    <Layers className="w-8 h-8 opacity-40 mb-2 text-archival-oxblood" />
                    <p className="font-serif italic text-sm text-ink">Blank Verso (Plain Back)</p>
                    <p className="text-xs text-ink-muted mt-1 font-serif">Original blank paper stock without advertising imprint.</p>
                  </div>
                )}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-mono text-white shadow-sm z-20">
                  VERSO (BACK)
                </div>
              </div>
            </motion.div>
          </div>

          {/* Interactive Flip Trigger Button */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsFlipped(!isFlipped)}
              className="flex items-center gap-2 font-serif text-xs sm:text-sm bg-white"
            >
              <RotateCw className="w-4 h-4 text-archival-amber transition-transform group-hover:rotate-180" />
              <span>{isFlipped ? "Flip to Recto (Front)" : "Flip to Verso (Back)"}</span>
            </Button>
            <span className="text-xs font-mono text-ink-muted hidden sm:inline">
              (or click paper directly to rotate)
            </span>
          </div>
        </div>

        {/* Physical Specimen Details (Right Column) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink tracking-tight">
              {bookmark.title}
            </h2>
            {store && (
              <p className="font-serif text-sm text-archival-oxblood font-semibold">
                {store.name} · {store.city}, {store.country}
              </p>
            )}
          </div>

          {/* Physical Specimen Properties Card */}
          <div className="bg-white/80 p-5 rounded-xl border border-parchment-border shadow-xs space-y-3">
            <h4 className="font-mono text-xs font-bold text-archival-amber uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Physical Specimen Specifications</span>
            </h4>

            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-serif pt-1">
              <div>
                <span className="text-ink-muted block text-[11px] font-mono">DIMENSIONS</span>
                <span className="font-bold text-ink">{bookmark.dimensions}</span>
              </div>
              <div>
                <span className="text-ink-muted block text-[11px] font-mono">MATERIAL STOCK</span>
                <span className="font-bold text-ink">{bookmark.material}</span>
              </div>
              <div>
                <span className="text-ink-muted block text-[11px] font-mono">CONDITION</span>
                <span className="font-bold text-ink">{bookmark.condition}</span>
              </div>
              <div>
                <span className="text-ink-muted block text-[11px] font-mono">ESTIMATED ERA</span>
                <span className="font-bold text-ink">
                  {bookmark.yearProduced ? `c. ${bookmark.yearProduced}` : "Mid 20th Century"}
                </span>
              </div>
            </div>

            {bookmark.acquisitionNotes && (
              <div className="pt-3 border-t border-parchment-border/60 text-xs font-serif text-ink-light">
                <span className="text-ink-muted block text-[11px] font-mono mb-0.5">
                  CURATOR'S PROVENANCE
                </span>
                <p className="italic">"{bookmark.acquisitionNotes}"</p>
              </div>
            )}
          </div>

          {/* Action to open Bookstore Dossier */}
          {store && onOpenDossier && (
            <div className="pt-2">
              <Button
                variant="oxblood"
                size="lg"
                onClick={onOpenDossier}
                className="w-full flex items-center justify-center gap-2 font-serif text-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Read Full Bookstore Dossier &amp; Historical Clippings →</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
