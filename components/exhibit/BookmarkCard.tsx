"use client";

import React from "react";
import Image from "next/image";
import { BookmarkWithDetails } from "@/lib/db/queries";
import { Badge } from "@/components/ui/Badge";
import { MapPin, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export interface BookmarkCardProps {
  bookmark: BookmarkWithDetails;
  index: number;
  onInspect: (bookmark: BookmarkWithDetails) => void;
}

export function BookmarkCard({ bookmark, index, onInspect }: BookmarkCardProps) {
  // Pre-calculated subtle rotation angles for tactile specimen placement
  const naturalRotations = [-1.5, 0.8, -0.6, 1.2, -1.0, 1.4, -0.5, 1.0];
  const rot = naturalRotations[index % naturalRotations.length];

  const store = bookmark.bookstore;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotate: rot }}
      animate={{ opacity: 1, y: 0, rotate: rot }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{
        y: -10,
        rotate: 0,
        scale: 1.03,
        transition: { duration: 0.2, ease: "easeOut" },
      }}
      className="relative group cursor-pointer select-none flex flex-col items-center"
      onClick={() => onInspect(bookmark)}
    >
      {/* Specimen Bookmark Object Container */}
      <button
        type="button"
        aria-label={`Inspect ${bookmark.title}`}
        className="w-full max-w-[220px] aspect-[1/3.1] rounded-[6px] overflow-hidden bg-parchment-light border border-parchment-border shadow-archival group-hover:shadow-archival-lift group-hover:border-archival-amber transition-all duration-300 relative flex flex-col focus:outline-none focus:ring-2 focus:ring-amber-700/40"
      >
        {/* Paper texture overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/[0.02] to-black/[0.06] pointer-events-none z-10" />

        {/* Featured Ribbon Badge */}
        {bookmark.isFeatured && (
          <div className="absolute top-2 right-2 z-20">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/90 text-stone-900 shadow-sm">
              <Sparkles className="w-2.5 h-2.5" />
              <span>KEY</span>
            </span>
          </div>
        )}

        {/* Bookmark Graphic Image */}
        <div className="relative w-full h-full bg-[#FAF6EE] flex items-center justify-center overflow-hidden">
          <Image
            src={bookmark.frontImageUrl}
            alt={bookmark.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 220px"
            className="object-cover object-top filter contrast-[1.02]"
            priority={index < 4}
          />
        </div>

        {/* Hover Lift Indicator Pill */}
        <div className="absolute bottom-3 inset-x-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-ink/90 backdrop-blur-sm text-parchment-light py-1.5 px-2 rounded text-center text-xs font-serif font-medium shadow-md">
          Inspect Dossier &amp; 3D Flip ↗
        </div>
      </button>

      {/* Curator Specimen Accession Label (under card) */}
      <div className="mt-3 text-center max-w-[200px] space-y-1">
        <div className="flex items-center justify-center gap-1.5">
          <Badge variant="mono" size="sm" className="text-[10px] font-mono tracking-widest">
            {bookmark.accessionNo}
          </Badge>
          {bookmark.yearProduced && (
            <span className="text-[11px] font-serif text-ink-muted italic">
              c. {bookmark.yearProduced}
            </span>
          )}
        </div>
        <h3 className="font-serif text-sm font-bold text-ink group-hover:text-archival-oxblood transition-colors line-clamp-1">
          {store?.name || bookmark.title}
        </h3>
        {store && (
          <div className="flex items-center justify-center gap-1 text-[11px] text-ink-muted">
            <MapPin className="w-3 h-3 text-archival-oxblood/70" />
            <span>{store.city}, {store.country === "United States" ? store.stateProvince : store.country}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
