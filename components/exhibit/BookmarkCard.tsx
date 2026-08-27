"use client";

import React, { useState } from "react";
import Image from "next/image";
import { BookmarkWithDetails } from "@/lib/db/queries";
import { PackedItem } from "@/lib/utils/bin-packing";
import { MapPin, Sparkles, MoveUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface BookmarkCardProps {
  packedItem?: PackedItem<BookmarkWithDetails>;
  bookmark?: BookmarkWithDetails;
  index?: number;
  onInspect: (bookmark: BookmarkWithDetails) => void;
}

export function BookmarkCard({ packedItem, bookmark: propBookmark, onInspect }: BookmarkCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const bookmark = packedItem ? packedItem.item : propBookmark!;
  if (!bookmark) return null;

  const store = bookmark.bookstore;
  const rotation = packedItem ? packedItem.rotation : 0;
  const x = packedItem ? packedItem.x : 0;
  const y = packedItem ? packedItem.y : 0;
  const width = packedItem ? packedItem.width : 160;
  const height = packedItem ? packedItem.height : 420;

  return (
    <motion.button
      type="button"
      aria-label={`Inspect ${store?.name || bookmark.title}`}
      initial={{ opacity: 0, scale: 0.92, rotate: rotation }}
      animate={{
        opacity: 1,
        scale: isHovered ? 1.04 : 1,
        rotate: isHovered ? 0 : rotation,
        y: isHovered ? -8 : 0,
        zIndex: isHovered ? 40 : 10,
      }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onInspect(bookmark)}
      style={{
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
      className="cursor-pointer select-none group focus:outline-none text-left p-0 border-none bg-transparent"
    >
      {/* Specimen Bookmark Image with True Alpha Transparency & Photorealistic Drop Shadow */}
      <div className="relative w-full h-full filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.18)] group-hover:drop-shadow-[0_20px_35px_rgba(0,0,0,0.30)] transition-all duration-200">
        {/* Featured Key Badge */}
        {bookmark.isFeatured && (
          <div className="absolute top-1.5 right-1.5 z-20 pointer-events-none">
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/95 text-stone-900 shadow-md">
              <Sparkles className="w-2.5 h-2.5" />
              <span>KEY</span>
            </span>
          </div>
        )}

        <Image
          src={bookmark.frontImageUrl}
          alt={bookmark.title}
          fill
          sizes="(max-width: 640px) 200px, 350px"
          className="object-contain object-center filter contrast-[1.02]"
          priority={false}
        />
      </div>

      {/* Screen Reader & Accessible Spans */}
      <span className="sr-only">{store?.name || bookmark.title}</span>
      <span className="sr-only">{bookmark.dimensions}</span>
      {store && <span className="sr-only">{store.city}</span>}

      {/* Floating Curator's Archival Specimen Tag (Hover & Focus) */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute -bottom-14 left-1/2 -translate-x-1/2 z-50 pointer-events-none min-w-[200px] max-w-[260px] p-2.5 rounded-xl bg-ink/95 backdrop-blur-md text-white shadow-2xl border border-white/10 text-center space-y-0.5"
          >
            <div className="flex items-center justify-center gap-1">
              <h4 className="font-serif text-xs font-bold text-parchment-light truncate">
                {store?.name || bookmark.title}
              </h4>
              <MoveUpRight className="w-3 h-3 text-amber-300 shrink-0" />
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-300 font-serif">
              {bookmark.yearProduced ? (
                <span className="italic">c. {bookmark.yearProduced}</span>
              ) : (
                <span className="italic">Vintage</span>
              )}
              <span>·</span>
              <span className="font-mono text-stone-400">{bookmark.dimensions}</span>
            </div>

            {store && (
              <div className="flex items-center justify-center gap-1 text-[10px] text-stone-400">
                <MapPin className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                <span className="truncate">{store.city}, {store.country === "United States" ? store.stateProvince : store.country}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
