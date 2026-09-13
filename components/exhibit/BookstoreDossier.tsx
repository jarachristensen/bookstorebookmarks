"use client";

import React, { useState } from "react";
import Image from "next/image";
import { BookmarkWithDetails } from "@/lib/db/queries";
import { ArchivalMedia } from "@/db/schema";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { ClippingLightbox } from "./ClippingLightbox";
import {
  X,
  MapPin,
  Calendar,
  User,
  Tags,
  BookOpen,
  Newspaper,
  Sparkles,
  ExternalLink,
  Layers,
  ArrowLeft,
} from "lucide-react";
import { motion } from "framer-motion";

export interface BookstoreDossierProps {
  bookmark: BookmarkWithDetails;
  allBookmarks?: BookmarkWithDetails[];
  onClose: () => void;
  onSelectBookmark?: (bm: BookmarkWithDetails) => void;
}

export function BookstoreDossier({
  bookmark,
  allBookmarks = [],
  onClose,
  onSelectBookmark,
}: BookstoreDossierProps) {
  const [activeBookmark, setActiveBookmark] = useState<BookmarkWithDetails>(bookmark);
  const [selectedMedia, setSelectedMedia] = useState<ArchivalMedia | null>(null);

  const store = activeBookmark.bookstore || bookmark.bookstore;
  if (!store) return null;

  // Filter all bookmarks that belong to this specific bookstore
  const storeBookmarks = allBookmarks.filter((b) => b.bookstoreId === store.id);
  const displayedBookmarks = storeBookmarks.length > 0 ? storeBookmarks : [activeBookmark];

  // Parse JSON fields safely
  let specialties: string[] = [];
  try {
    if (store.specialties) specialties = JSON.parse(store.specialties);
  } catch {}

  let trivia: string[] = [];
  try {
    if (store.notablePatronsTrivia) trivia = JSON.parse(store.notablePatronsTrivia);
  } catch {}

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-stone-950/70 backdrop-blur-sm p-3 sm:p-6 lg:p-10 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="relative w-full max-w-5xl bg-[#FAF8F5] border border-[#E8E2D5] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Top Action Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-[#E8E2D5] bg-[#FAF8F5]/95 backdrop-blur-md">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs font-serif font-medium text-stone-500 hover:text-[#2563EB] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Exhibit</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              aria-label="Close Dossier"
              className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer ml-1 bg-white border border-[#E8E2D5]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 space-y-10">
          {/* Header Banner */}
          <div className="space-y-4 border-b border-[#E8E2D5] pb-8">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant={store.isStillOperating ? "spruce" : "oxblood"}>
                {store.isStillOperating
                  ? `Still Operating (Opened ${store.yearOpened})`
                  : `Years Open: ${store.yearOpened}–${store.yearClosed || "Closed"}`}
              </Badge>
              <span className="text-xs font-mono text-stone-500">
                {store.country}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight">
              {store.name}
            </h1>

            {/* Core Info Row */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-stone-600 font-serif">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${store.name}, ${store.streetAddress || ""}, ${store.city}, ${store.country}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-[#F43F7A] hover:underline font-semibold"
                title="View on Google Maps"
              >
                <MapPin className="w-4 h-4" />
                <span>
                  {store.streetAddress ? `${store.streetAddress}, ` : ""}
                  {store.city}, {store.stateProvince || store.country}
                </span>
                <ExternalLink className="w-3 h-3 text-stone-400" />
              </a>

              {store.founders && (
                <div className="flex items-center gap-1.5 text-stone-500">
                  <User className="w-4 h-4 text-[#F59E0B]" />
                  <span>Founders: <strong className="text-stone-900 font-medium">{store.founders}</strong></span>
                </div>
              )}

              {store.websiteUrl && (
                <a
                  href={store.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-mono text-[#2563EB] hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Archive Record</span>
                </a>
              )}
            </div>

            {/* Specialties Tags */}
            {specialties.length > 0 && (
              <div className="pt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-mono text-stone-500 flex items-center gap-1 mr-1">
                  <Tags className="w-3 h-3 text-[#F59E0B]" />
                  <span>Specialties:</span>
                </span>
                {specialties.map((s) => (
                  <Badge key={s} variant="default" size="sm">
                    {s}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Grid Layout: Bookmark & Research Narrative */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Bookmark Artifact Preview & Multiple Bookmark Selector */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs space-y-4">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-[#F43F7A] uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Active Specimen</span>
                </span>
                <span>c. {activeBookmark.yearProduced}</span>
              </div>

              <div className="relative w-full aspect-[1/2.8] max-w-[200px] mx-auto rounded-lg overflow-hidden border border-[#E8E2D5] shadow-md bg-white">
                <Image
                  src={activeBookmark.frontImageUrl}
                  alt={activeBookmark.title}
                  fill
                  className="object-cover object-top"
                />
              </div>

              <div className="pt-2 space-y-1.5 text-xs text-stone-600">
                <p className="font-serif font-bold text-stone-900 text-sm">{activeBookmark.title}</p>
                <p><span className="text-stone-500">Material:</span> {activeBookmark.material}</p>
                <p><span className="text-stone-500">Dimensions:</span> {activeBookmark.dimensions}</p>
                <p><span className="text-stone-500">Condition:</span> {activeBookmark.condition}</p>
                {activeBookmark.acquisitionNotes && (
                  <p className="pt-2 italic text-stone-500 border-t border-[#E8E2D5]">
                    "{activeBookmark.acquisitionNotes}"
                  </p>
                )}
              </div>

              {/* Multi-Bookmark Edition Switcher */}
              {displayedBookmarks.length > 1 && (
                <div className="pt-4 border-t border-[#E8E2D5] space-y-2">
                  <p className="text-xs font-mono font-bold text-stone-500 uppercase">
                    All Bookmarks from this Bookstore ({displayedBookmarks.length})
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {displayedBookmarks.map((bm) => (
                      <button
                        key={bm.id}
                        type="button"
                        onClick={() => {
                          setActiveBookmark(bm);
                          if (onSelectBookmark) onSelectBookmark(bm);
                        }}
                        className={`p-1.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          activeBookmark.id === bm.id
                            ? "bg-white border-[#F43F7A] ring-2 ring-[#F43F7A]/20 shadow-xs"
                            : "bg-[#FAF8F5] border-[#E8E2D5] hover:bg-white"
                        }`}
                      >
                        <div className="relative w-8 h-16 rounded overflow-hidden bg-stone-900 border border-[#E8E2D5]">
                          <Image
                            src={bm.frontImageUrl}
                            alt={bm.title}
                            fill
                            className="object-cover object-top"
                          />
                        </div>
                        <span className="text-[10px] font-mono text-stone-600 truncate w-full text-center">
                          {bm.yearProduced ? `c. ${bm.yearProduced}` : "Edition"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Research Narrative & History Blurb */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E2D5] shadow-xs">
                <h2 className="text-xs font-mono font-bold text-[#F59E0B] tracking-wider uppercase mb-4 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Curator's Historical Research &amp; Narrative</span>
                </h2>
                <MarkdownRenderer content={store.historicalBlurb} />
              </div>

              {/* Notable Patrons & Anecdotes / Trivia */}
              {trivia.length > 0 && (
                <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#E8E2D5] space-y-3">
                  <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                    <span>Notable Literary Lore &amp; Anecdotes</span>
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm font-serif text-stone-600">
                    {trivia.map((t, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="text-[#F43F7A] font-bold mt-0.5">✦</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Historical Media & Newspaper Clippings Section */}
          {store.archivalMedia && store.archivalMedia.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-[#E8E2D5]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-stone-900">
                    Archival Photos &amp; Newspaper Clippings
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500 font-serif italic">
                    Click any historical article or photograph to open deep zoom and view full transcriptions.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                {store.archivalMedia.map((media) => (
                  <div
                    key={media.id}
                    onClick={() => setSelectedMedia(media)}
                    className="group cursor-pointer rounded-xl bg-white border border-[#E8E2D5] hover:border-[#F43F7A] shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
                  >
                    <div className="relative w-full aspect-[4/3] bg-stone-900 overflow-hidden">
                      <Image
                        src={media.imageUrl}
                        alt={media.caption}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[10px] font-mono text-white">
                        {media.mediaType.toUpperCase()}
                      </div>
                    </div>

                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <h4 className="font-serif text-sm font-bold text-stone-900 group-hover:text-[#F43F7A] transition-colors line-clamp-2">
                          {media.caption}
                        </h4>
                        <p className="text-xs font-mono text-stone-500">
                          {media.sourcePublication} · {media.publicationDate}
                        </p>
                      </div>

                      <span className="text-[11px] font-serif font-medium text-[#F43F7A] group-hover:underline pt-2 block">
                        Examine clipping &amp; transcription →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Lightbox for Selected Clipping */}
      {selectedMedia && (
        <ClippingLightbox
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
        />
      )}
    </div>
  );
}
