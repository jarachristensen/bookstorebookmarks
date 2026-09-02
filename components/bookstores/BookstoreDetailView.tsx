"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookstoreWithDetails, BookmarkWithDetails } from "@/lib/db/queries";
import { ArchivalMedia } from "@/db/schema";
import { BookmarkInspector } from "@/components/exhibit/BookmarkInspector";
import { ClippingLightbox } from "@/components/exhibit/ClippingLightbox";
import { BookstoreHorizontalTimeline } from "@/components/bookstores/BookstoreHorizontalTimeline";
import {
  MapPin,
  Calendar,
  ExternalLink,
  ArrowLeft,
  Newspaper,
  FileText,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { marked } from "marked";

export interface BookstoreDetailViewProps {
  bookstore: BookstoreWithDetails;
}

/**
 * Filter out raw filenames from display captions.
 */
function getCleanCaption(caption?: string | null): string | null {
  if (!caption) return null;
  const trimmed = caption.trim();
  if (
    /\.(png|jpe?g|webp|gif|svg)$/i.test(trimmed) ||
    trimmed.startsWith("media-") ||
    trimmed.toLowerCase().startsWith("untitled") ||
    trimmed === "Archival Press Clipping" ||
    trimmed === "Historic Photo" ||
    trimmed === "Storefront Photo"
  ) {
    return null;
  }
  return trimmed;
}

export function BookstoreDetailView({ bookstore }: BookstoreDetailViewProps) {
  const [selectedBookmark, setSelectedBookmark] = useState<BookmarkWithDetails | null>(null);
  const [selectedLightboxMedia, setSelectedLightboxMedia] = useState<ArchivalMedia | null>(null);
  const [mediaFilter, setMediaFilter] = useState<"all" | "newspaper" | "photo">("all");
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Find all storefront / exterior photos
  const storefrontPhotos = bookstore.archivalMedia.filter(
    (m) => m.isStorefront || m.mediaType === "photo"
  );
  const currentPhoto = storefrontPhotos[activePhotoIdx] || storefrontPhotos[0] || null;

  // Filtered press media
  const filteredMedia = bookstore.archivalMedia.filter((m) => {
    if (mediaFilter === "all") return true;
    return m.mediaType === mediaFilter;
  });

  const nextPhoto = () => {
    if (storefrontPhotos.length > 1) {
      setActivePhotoIdx((prev) => (prev + 1) % storefrontPhotos.length);
    }
  };

  const prevPhoto = () => {
    if (storefrontPhotos.length > 1) {
      setActivePhotoIdx((prev) => (prev - 1 + storefrontPhotos.length) % storefrontPhotos.length);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/bookstores"
          className="inline-flex items-center gap-1.5 text-xs font-serif text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Bookstores Directory</span>
        </Link>

        {bookstore.websiteUrl && (
          <a
            href={bookstore.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-serif text-archival-oxblood hover:underline font-semibold"
          >
            <span>Official Website</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* 2. Clean Bookstore Header Title & Metadata */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
          {/* Bookstore Name & Status Badge */}
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-ink tracking-tight">
              {bookstore.name}
            </h1>

            {bookstore.isStillOperating ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0f766e] text-white shadow-xs tracking-wider">
                STILL OPERATING
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-stone-800 text-stone-200 border border-stone-700 shadow-xs tracking-wider">
                {bookstore.yearClosed ? `CLOSED (${bookstore.yearClosed})` : "CLOSED"}
              </span>
            )}
          </div>

          {/* Location & Active Years */}
          <div className="flex items-center gap-4 text-xs font-serif text-ink-muted shrink-0">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-archival-amber" />
              <span>
                {bookstore.city}
                {bookstore.stateProvince ? `, ${bookstore.stateProvince}` : ""},{" "}
                {bookstore.country}
              </span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-archival-spruce" />
              <span>
                {bookstore.yearOpened}–{bookstore.isStillOperating ? "Present" : bookstore.yearClosed || "Closed"}
              </span>
            </span>
          </div>
        </div>

        {/* Full-width divider */}
        <hr className="border-parchment-border" />
      </div>

      {/* 3. Upper Hero Showcase: Storefront Photo (Left) & Cataloged Bookmarks (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Storefront Photograph (~58% on desktop) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative w-full rounded-2xl bg-stone-900 border border-parchment-border overflow-hidden shadow-xs flex items-center justify-center p-2 sm:p-3">
            {currentPhoto ? (
              <div
                onClick={() => setSelectedLightboxMedia(currentPhoto)}
                className="relative w-full h-[320px] sm:h-[400px] flex items-center justify-center cursor-pointer group"
                title="Click to view full photo in high resolution"
              >
                <Image
                  src={currentPhoto.imageUrl}
                  alt={getCleanCaption(currentPhoto.caption) || `${bookstore.name} Storefront`}
                  fill
                  unoptimized
                  priority
                  className="object-contain object-center group-hover:scale-[1.01] transition-transform duration-200"
                />

                {/* Carousel navigation if multiple photos */}
                {storefrontPhotos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        prevPhoto();
                      }}
                      aria-label="Previous photo"
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition-all cursor-pointer shadow-md"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        nextPhoto();
                      }}
                      aria-label="Next photo"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition-all cursor-pointer shadow-md"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full h-72 flex items-center justify-center text-xs font-serif text-stone-400 italic">
                No storefront photo cataloged
              </div>
            )}
          </div>

          {/* Photo Year / Caption below */}
          <div className="mt-2 text-center text-xs font-serif italic text-ink-muted">
            {currentPhoto?.publicationDate || getCleanCaption(currentPhoto?.caption) || bookstore.yearOpened}
          </div>
        </div>

        {/* Right Column: Cataloged Bookmarks (~42% on desktop) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-parchment-border pb-2">
            <h2 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-archival-oxblood" />
              <span>Cataloged Bookmarks</span>
            </h2>
            <span className="text-xs font-mono text-ink-muted">
              {bookstore.bookmarks.length} {bookstore.bookmarks.length === 1 ? "Specimen" : "Specimens"}
            </span>
          </div>

          {bookstore.bookmarks.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-white border border-parchment-border text-xs font-serif text-ink-muted italic">
              No bookmark specimens currently cataloged for this bookstore.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1">
              {bookstore.bookmarks.map((bm) => (
                <button
                  key={bm.id}
                  type="button"
                  onClick={() => setSelectedBookmark({ ...bm, bookstore })}
                  className="group flex flex-col items-center text-center cursor-pointer p-2 rounded-xl bg-white hover:bg-parchment/60 border border-parchment-border hover:border-archival-oxblood/40 shadow-2xs hover:shadow-sm transition-all"
                >
                  <div className="relative w-full h-44 sm:h-52 mb-2 flex items-center justify-center overflow-hidden">
                    <Image
                      src={bm.frontImageUrl}
                      alt={bm.title}
                      fill
                      unoptimized
                      className="object-contain object-center group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <h4 className="font-serif text-xs font-bold text-ink group-hover:text-archival-oxblood transition-colors line-clamp-1 w-full">
                    {bm.title}
                  </h4>
                  <span className="font-mono text-[11px] text-ink-muted mt-0.5">
                    {bm.dimensions}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Middle Section: Horizontal Heritage & Relocation Timeline (Interactive & Clickable to Lightbox) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-sm font-mono font-bold uppercase tracking-wider text-archival-oxblood">
            Bookstore Timeline &amp; Relocations
          </h2>
          <span className="text-xs font-serif text-ink-muted italic hidden sm:inline">
            Click any milestone with a clipping or photo to inspect it
          </span>
        </div>

        <BookstoreHorizontalTimeline
          bookstore={bookstore}
          onSelectMedia={(media) => setSelectedLightboxMedia(media)}
        />
      </section>

      {/* 5. Lower Section: Historical Narrative & Archival Press Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Narrative Blurb (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <section className="p-6 sm:p-8 rounded-2xl bg-white border border-parchment-border shadow-xs space-y-4">
            <h2 className="font-serif text-xl font-bold text-ink flex items-center gap-2 border-b border-parchment-border pb-3">
              <FileText className="w-5 h-5 text-archival-oxblood" />
              <span>Bookstore Heritage &amp; History</span>
            </h2>

            <div
              className="font-serif text-sm sm:text-base text-ink-light leading-relaxed prose prose-stone max-w-none"
              dangerouslySetInnerHTML={{
                __html: marked.parse(bookstore.historicalBlurb || "") as string,
              }}
            />
          </section>
        </div>

        {/* Archival Press & Photos (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {bookstore.archivalMedia.length > 0 && (
            <section className="p-6 rounded-2xl bg-white border border-parchment-border shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-parchment-border pb-3">
                <h2 className="font-serif text-base font-bold text-ink flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-archival-oxblood" />
                  <span>Press &amp; Clippings</span>
                </h2>

                <div className="flex items-center gap-1 text-[11px] font-serif bg-parchment-light p-0.5 rounded border border-parchment-border">
                  <button
                    type="button"
                    onClick={() => setMediaFilter("all")}
                    className={`px-2 py-0.5 rounded ${
                      mediaFilter === "all" ? "bg-white font-bold text-ink shadow-2xs" : "text-ink-muted"
                    }`}
                  >
                    All ({bookstore.archivalMedia.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaFilter("newspaper")}
                    className={`px-2 py-0.5 rounded ${
                      mediaFilter === "newspaper" ? "bg-white font-bold text-ink shadow-2xs" : "text-ink-muted"
                    }`}
                  >
                    Clippings
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {filteredMedia.slice(0, 4).map((media, idx) => {
                  const displayCaption = getCleanCaption(media.caption) || "Archival Press Clipping";

                  return (
                    <div
                      key={media.id || `media-${idx}`}
                      onClick={() => setSelectedLightboxMedia(media)}
                      className="group cursor-pointer flex items-center gap-3 p-2.5 rounded-xl border border-parchment-border bg-parchment/30 hover:bg-parchment-light transition-all shadow-2xs"
                    >
                      <div className="relative w-16 h-16 rounded bg-stone-100 overflow-hidden shrink-0 border border-parchment-border">
                        <Image
                          src={media.imageUrl}
                          alt={displayCaption}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-xs font-bold text-ink group-hover:text-archival-oxblood transition-colors truncate">
                          {displayCaption}
                        </h4>
                        {media.sourcePublication && (
                          <p className="font-serif text-[11px] text-ink-muted italic truncate">
                            {media.sourcePublication}
                            {media.publicationDate ? ` (${media.publicationDate})` : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Bookmark Inspector Modal */}
      {selectedBookmark && (
        <BookmarkInspector
          bookmark={selectedBookmark}
          onClose={() => setSelectedBookmark(null)}
        />
      )}

      {/* Press Clipping / Photo Lightbox Popup */}
      {selectedLightboxMedia && (
        <ClippingLightbox
          media={selectedLightboxMedia}
          onClose={() => setSelectedLightboxMedia(null)}
        />
      )}
    </div>
  );
}
