"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { BookmarkWithDetails } from "@/lib/db/queries";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RotateCw, X, Sparkles, MapPin, Calendar, Info, Layers, Maximize2 } from "lucide-react";
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

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const store = bookmark.bookstore;

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-8 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 bg-white/95 backdrop-blur-xl rounded-2xl border border-parchment-border shadow-2xl">
      {/* Left: 3D Flippable Bookmark Display */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center">
        {/* Interaction hint */}
        <div className="mb-3 text-center">
          <span className="text-xs font-mono text-ink-muted flex items-center justify-center gap-1">
            <RotateCw className="w-3 h-3 text-archival-amber" />
            <span>Click bookmark or button below to flip 3D view</span>
          </span>
        </div>

        {/* 3D Perspective Paper Canvas */}
        <div className="perspective-1000 w-full max-w-[260px] aspect-[1/3.1] relative">
          <motion.div
            className="w-full h-full relative preserve-3d cursor-pointer rounded-[8px] transition-transform duration-700 select-none shadow-2xl"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {/* Front Side */}
            <div className="absolute inset-0 w-full h-full backface-hidden rounded-[8px] overflow-hidden bg-[#FAF6EE] border-2 border-stone-800 shadow-paper-depth flex items-center justify-center">
              <Image
                src={bookmark.frontImageUrl}
                alt={`${bookmark.title} (Front)`}
                fill
                sizes="300px"
                className="object-cover object-top"
                priority
              />
              {/* Front Label Pill */}
              <div className="absolute bottom-2 left-2 z-10 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[10px] font-mono text-white tracking-widest uppercase">
                Front Scan
              </div>
            </div>

            {/* Back Side (180deg rotated) */}
            <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-[8px] overflow-hidden bg-[#F5EFE4] border-2 border-stone-800 shadow-paper-depth flex items-center justify-center">
              {bookmark.backImageUrl ? (
                <Image
                  src={bookmark.backImageUrl}
                  alt={`${bookmark.title} (Back)`}
                  fill
                  sizes="300px"
                  className="object-cover object-top"
                  priority
                />
              ) : (
                <div className="p-6 text-center text-ink-muted font-serif italic text-sm">
                  Blank verso / plain backing paper.
                </div>
              )}
              {/* Back Label Pill */}
              <div className="absolute bottom-2 left-2 z-10 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[10px] font-mono text-white tracking-widest uppercase">
                Verso / Back Scan
              </div>
            </div>
          </motion.div>
        </div>

        {/* Flip Action Button */}
        <div className="mt-4 flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFlipped(!isFlipped)}
            aria-label="Flip Bookmark"
            className="flex items-center gap-1.5 font-serif text-xs"
          >
            <RotateCw className="w-3.5 h-3.5 text-archival-amber" />
            <span>{isFlipped ? "Show Front Side" : "Flip to Verso (Back)"}</span>
          </Button>
        </div>
      </div>

      {/* Right: Archival Specifications & Curator Summary */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between space-y-6">
        {/* Header with Close */}
        <div>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="mono">{bookmark.accessionNo}</Badge>
                {bookmark.isFeatured && (
                  <Badge variant="amber" size="sm">
                    <Sparkles className="w-3 h-3" />
                    Key Collection Piece
                  </Badge>
                )}
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink tracking-tight mt-2">
                {bookmark.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded-full hover:bg-parchment-muted text-ink-muted hover:text-ink transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {store && (
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-ink-light font-serif">
              <div className="flex items-center gap-1 text-archival-oxblood font-semibold">
                <MapPin className="w-4 h-4" />
                <span>{store.name} · {store.city}, {store.country}</span>
              </div>
              <span className="text-parchment-border">|</span>
              <div className="flex items-center gap-1 text-ink-muted">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {store.yearOpened} – {store.yearClosed ? store.yearClosed : "Present"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Physical Ephemera Specifications Box */}
        <div className="p-4 rounded-xl bg-parchment-light border border-parchment-border space-y-3">
          <h4 className="text-xs font-mono font-bold text-archival-amber tracking-wider uppercase flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>Physical Specimen Properties</span>
          </h4>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-ink-muted block text-[11px]">Material &amp; Stock</span>
              <strong className="text-ink font-medium">{bookmark.material}</strong>
            </div>
            <div>
              <span className="text-ink-muted block text-[11px]">Dimensions</span>
              <strong className="text-ink font-medium font-mono">{bookmark.dimensions}</strong>
            </div>
            <div>
              <span className="text-ink-muted block text-[11px]">Condition Grade</span>
              <strong className="text-ink font-medium">{bookmark.condition}</strong>
            </div>
            <div>
              <span className="text-ink-muted block text-[11px]">Estimated Era</span>
              <strong className="text-ink font-medium">
                {bookmark.yearProduced ? `circa ${bookmark.yearProduced}` : "Unknown era"}
              </strong>
            </div>
          </div>

          {bookmark.acquisitionNotes && (
            <div className="pt-2 border-t border-parchment-border/60">
              <span className="text-ink-muted block text-[11px]">Curator's Provenance Note</span>
              <p className="text-xs text-ink-light font-serif italic mt-0.5">
                "{bookmark.acquisitionNotes}"
              </p>
            </div>
          )}
        </div>

        {/* Action Button: Open Complete Bookstore Dossier */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          {onOpenDossier && (
            <Button
              variant="oxblood"
              size="md"
              onClick={onOpenDossier}
              className="w-full sm:w-auto font-serif flex items-center justify-center gap-2"
            >
              <Info className="w-4 h-4" />
              <span>Read Full Bookstore Dossier &amp; Clippings →</span>
            </Button>
          )}

          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
            className="w-full sm:w-auto font-serif"
          >
            Return to Exhibit Tray
          </Button>
        </div>
      </div>
    </div>
  );
}
