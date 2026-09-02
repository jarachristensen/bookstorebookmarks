"use client";

import React, { useState } from "react";
import Image from "next/image";
import { BookmarkWithDetails } from "@/lib/db/queries";
import { PackedItem } from "@/lib/utils/bin-packing";
import { motion } from "framer-motion";

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
      {/* Specimen Bookmark Image with No Shadow at rest, Lifting with Deep Shadow on Hover */}
      <div className="relative w-full h-full filter drop-shadow-none group-hover:drop-shadow-[0_24px_38px_rgba(0,0,0,0.85)] transition-all duration-200">
        {bookmark.frontImageUrl ? (
          <Image
            src={bookmark.frontImageUrl}
            alt={bookmark.title}
            fill
            unoptimized
            sizes="(max-width: 640px) 200px, 350px"
            className="object-contain object-center filter contrast-[1.02]"
            priority={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-2 text-center text-xs font-serif text-ink-muted bg-parchment/60 rounded">
            {bookmark.title}
          </div>
        )}
      </div>

      {/* Screen Reader Accessible Details */}
      <span className="sr-only">{store?.name || bookmark.title}</span>
      <span className="sr-only">{bookmark.dimensions}</span>
      {store && <span className="sr-only">{store.city}</span>}
    </motion.button>
  );
}
