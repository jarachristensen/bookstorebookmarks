"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookmarkWithDetails } from "@/lib/db/queries";
import { parseDimensions } from "@/lib/utils/dimensions";
import { Button } from "@/components/ui/Button";
import {
  RotateCw,
  X,
  BookOpen,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

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
  const [naturalAspect, setNaturalAspect] = useState<number | null>(null);
  const store = bookmark.bookstore;
  const parsedDim = parseDimensions(bookmark.dimensions);

  // Determine if bookmark is landscape either from parsed dimensions or natural image ratio
  const isLandscape = parsedDim.isLandscape || (naturalAspect !== null && naturalAspect > 1.15);

  // Effective aspect ratio for 3D flip canvas
  const effectiveAspectRatio = isLandscape
    ? (parsedDim.isLandscape && parsedDim.aspectRatio > 1
        ? parsedDim.aspectRatio
        : naturalAspect && naturalAspect > 1
        ? naturalAspect
        : 3.2)
    : (parsedDim.aspectRatio < 1
        ? parsedDim.aspectRatio
        : naturalAspect && naturalAspect < 1
        ? naturalAspect
        : 1 / 3.1);

  return (
    <div className="relative w-full max-w-5xl bg-[#FAF8F5] border border-[#E8E2D5] rounded-2xl shadow-2xl overflow-hidden p-4 sm:p-8 lg:p-10">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-4 sm:pb-6 border-b border-[#E8E2D5]">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="p-1.5 sm:p-2 rounded-lg bg-[#F43F7A]/10 text-[#F43F7A] border border-[#F43F7A]/20">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            {store ? (
              <Link
                href={`/bookstores/${store.id}`}
                onClick={onClose}
                className="font-serif text-base sm:text-xl font-bold text-stone-900 hover:text-[#2563EB] hover:underline transition-colors line-clamp-1"
              >
                {store.name}
              </Link>
            ) : (
              <h2 className="font-serif text-base sm:text-xl font-bold text-stone-900 line-clamp-1">
                Bookstore Archive
              </h2>
            )}
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-stone-500">
              {store && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#F43F7A] shrink-0" />
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
            className="p-1.5 sm:p-2 rounded-full hover:bg-stone-200 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer bg-white border border-[#E8E2D5]"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* --- RENDER HORIZONTAL LAYOUT (Bookmark on Top, Information Below) --- */}
      {isLandscape ? (
        <div className="pt-4 sm:pt-6 space-y-6">
          {/* Top: Wide Horizontal 3D Paper Stage */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div
              className="w-full flex items-center justify-center p-2 sm:p-4 h-[180px] xs:h-[220px] sm:h-[280px] lg:h-[320px]"
              style={{ perspective: 1200 }}
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                style={{
                  transformStyle: "preserve-3d",
                  aspectRatio: `${effectiveAspectRatio}`,
                }}
                onClick={() => setIsFlipped(!isFlipped)}
                className="relative cursor-pointer select-none group w-full max-w-[640px] sm:max-w-[760px] h-auto max-h-[300px]"
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
                      onLoad={(e) => {
                        const target = e.currentTarget;
                        if (target.naturalWidth && target.naturalHeight) {
                          setNaturalAspect(target.naturalWidth / target.naturalHeight);
                        }
                      }}
                      className="object-contain object-center filter contrast-[1.02]"
                      sizes="(max-width: 640px) 300px, 760px"
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
                        sizes="(max-width: 640px) 300px, 760px"
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
                (or tap bookmark)
              </span>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-parchment-border" />

          {/* Bottom: Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Sub-Column: Title, Bookstore, and Provenance */}
            <div className="md:col-span-5 space-y-2.5 text-center md:text-left">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink tracking-tight">
                {bookmark.title}
              </h2>
              {store && (
                <Link
                  href={`/bookstores/${store.id}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 font-serif text-xs sm:text-sm text-archival-oxblood hover:underline font-semibold"
                >
                  <span>{store.name}</span>
                  <span>·</span>
                  <span>{store.city}, {store.country}</span>
                </Link>
              )}
              {bookmark.acquisitionNotes && (
                <div className="pt-2 text-xs font-serif text-ink-light bg-white/70 p-3 rounded-lg border border-parchment-border/60 text-left">
                  <span className="text-ink-muted block text-[10px] font-mono mb-0.5 uppercase tracking-wider">
                    Curator's Provenance
                  </span>
                  <p className="italic">"{bookmark.acquisitionNotes}"</p>
                </div>
              )}
            </div>

            {/* Right Sub-Column: Physical Specimen Specifications Card & View Bookstore Page Button */}
            <div className="md:col-span-7 space-y-4">
              <div className="bg-white/80 p-4 sm:p-5 rounded-xl border border-parchment-border shadow-xs space-y-2.5 sm:space-y-3">
                <h4 className="font-mono text-[11px] sm:text-xs font-bold text-archival-amber uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Physical Specimen Specifications</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2 sm:gap-y-3 gap-x-3 sm:gap-x-4 text-xs font-serif pt-1">
                  <div>
                    <span className="text-ink-muted block text-[10px] sm:text-[11px] font-mono">DIMENSIONS</span>
                    <span className="font-bold text-ink">{bookmark.dimensions}</span>
                  </div>
                  <div>
                    <span className="text-ink-muted block text-[10px] sm:text-[11px] font-mono">MATERIAL</span>
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
              </div>

              {/* Action to open Bookstore Page */}
              {store && (
                <div className="pt-1">
                  <Link
                    href={`/bookstores/${store.id}`}
                    onClick={() => {
                      if (onClose) onClose();
                      if (onOpenDossier) onOpenDossier();
                    }}
                    className="w-full flex items-center justify-center gap-2 font-serif text-xs sm:text-sm py-2.5 sm:py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 shrink-0" />
                    <span className="truncate">View Bookstore Page &amp; History →</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* --- RENDER PORTRAIT LAYOUT (Side-by-Side Grid) --- */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 pt-4 sm:pt-8 items-center">
          {/* 3D Paper Turn Canvas (Left Column) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center space-y-4 sm:space-y-6">
            <div
              className="w-full flex items-center justify-center p-2 sm:p-4 h-[320px] xs:h-[360px] sm:h-[480px] lg:h-[520px] max-h-[50vh] sm:max-h-none"
              style={{ perspective: 1200 }}
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                style={{
                  transformStyle: "preserve-3d",
                  aspectRatio: `${effectiveAspectRatio}`,
                }}
                onClick={() => setIsFlipped(!isFlipped)}
                className="relative cursor-pointer select-none group h-full max-w-[280px] w-auto"
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
                      onLoad={(e) => {
                        const target = e.currentTarget;
                        if (target.naturalWidth && target.naturalHeight) {
                          setNaturalAspect(target.naturalWidth / target.naturalHeight);
                        }
                      }}
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
                <Link
                  href={`/bookstores/${store.id}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 font-serif text-xs sm:text-sm text-archival-oxblood hover:underline font-semibold"
                >
                  <span>{store.name}</span>
                  <span>·</span>
                  <span>{store.city}, {store.country}</span>
                </Link>
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

            {/* Action to open Bookstore Page */}
            {store && (
              <div className="pt-1 sm:pt-2">
                <Link
                  href={`/bookstores/${store.id}`}
                  onClick={() => {
                    if (onClose) onClose();
                    if (onOpenDossier) onOpenDossier();
                  }}
                  className="w-full flex items-center justify-center gap-2 font-serif text-xs sm:text-sm py-2.5 sm:py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 shrink-0" />
                  <span className="truncate">View Bookstore Page &amp; History →</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
