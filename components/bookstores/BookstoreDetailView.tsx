"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookstoreWithDetails, BookmarkWithDetails } from "@/lib/db/queries";
import { ArchivalMedia } from "@/db/schema";
import { sortMediaByMostRecent } from "@/lib/utils/clipping-parser";
import { BookmarkInspector } from "@/components/exhibit/BookmarkInspector";
import { ClippingLightbox } from "@/components/exhibit/ClippingLightbox";
import { BookstoreHorizontalTimeline } from "@/components/bookstores/BookstoreHorizontalTimeline";
import {
  MapPin,
  Calendar,
  ExternalLink,
  ArrowLeft,
  Newspaper,
  Camera,
  FileText,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Navigation,
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
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Split media into newspaper clippings and photos
  const newspaperClippings = React.useMemo(
    () =>
      bookstore.archivalMedia.filter(
        (m) =>
          m.mediaType === "newspaper" ||
          (!m.isStorefront && m.mediaType !== "photo" && m.mediaTag !== "interior" && m.mediaTag !== "storefront")
      ),
    [bookstore.archivalMedia]
  );
  const photosList = React.useMemo(
    () =>
      bookstore.archivalMedia.filter(
        (m) =>
          m.mediaType === "photo" ||
          Boolean(m.isStorefront) ||
          m.mediaTag === "interior" ||
          m.mediaTag === "storefront"
      ),
    [bookstore.archivalMedia]
  );

  const [activeMediaTab, setActiveMediaTab] = useState<"newspaper" | "photo">(() =>
    newspaperClippings.length > 0 ? "newspaper" : "photo"
  );

  // Parse locations if available
  let parsedLocations: any[] = [];
  try {
    if (bookstore.locations) parsedLocations = JSON.parse(bookstore.locations);
  } catch {}

  // Find all storefront / exterior / inside photos, sorted by most recent first
  const rawPhotos = bookstore.archivalMedia.filter(
    (m) =>
      Boolean(m.isStorefront) ||
      m.mediaType === "photo" ||
      m.mediaTag === "interior" ||
      m.mediaTag === "storefront"
  );
  const storefrontPhotos = React.useMemo(() => sortMediaByMostRecent(rawPhotos), [rawPhotos]);
  const currentPhoto = storefrontPhotos[activePhotoIdx] || storefrontPhotos[0] || null;

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
          className="inline-flex items-center gap-1.5 text-xs font-sans text-stone-600 hover:text-[#F43F7A] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Bookstores Directory</span>
        </Link>

        {bookstore.websiteUrl && (
          <a
            href={bookstore.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-sans text-[#2563EB] hover:text-[#1D4ED8] hover:underline font-semibold"
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
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-stone-900 tracking-tight">
              {bookstore.name}
            </h1>

            {bookstore.isStillOperating ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#10B981] text-white shadow-xs tracking-wider">
                STILL OPERATING
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F43F7A] text-white shadow-xs tracking-wider">
                {bookstore.yearClosed ? `CLOSED (${bookstore.yearClosed})` : "CLOSED"}
              </span>
            )}
          </div>

          {/* Location & Active Years */}
          <div className="flex items-center gap-4 text-xs font-sans text-stone-600 shrink-0">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>
                {bookstore.city}
                {bookstore.stateProvince ? `, ${bookstore.stateProvince}` : ""},{" "}
                {bookstore.country}
              </span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1 font-serif">
              <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>
                {bookstore.yearOpened}–{bookstore.isStillOperating ? "Present" : bookstore.yearClosed || "Closed"}
              </span>
            </span>

            {parsedLocations.length > 1 && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1 font-mono text-[11px] text-stone-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  <Navigation className="w-3 h-3 text-[#F43F7A]" />
                  <span>{parsedLocations.length} Historic Addresses</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Full-width divider */}
        <hr className="border-[#E8E2D5]" />
      </div>

      {/* 3. Upper Hero Showcase: Storefront Photo (Left) & Cataloged Bookmarks (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Storefront Photograph (~58% on desktop) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative w-full rounded-2xl bg-stone-900 border border-[#E8E2D5] overflow-hidden shadow-xs flex items-center justify-center p-2 sm:p-3">
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

                {/* Badge for Storefront vs Interior */}
                <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-xs border border-white/20 text-white font-mono text-[10px] font-bold tracking-wider uppercase pointer-events-none">
                  {currentPhoto.mediaTag === "interior" ? "Inside / Interior" : "Storefront Photo"}
                </div>

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
              <div className="w-full h-72 flex items-center justify-center text-xs font-sans text-stone-400 italic">
                No storefront photo cataloged
              </div>
            )}
          </div>

          {/* Photo Year / Caption below */}
          <div className="mt-2 text-center text-xs font-serif italic text-stone-500">
            {currentPhoto?.publicationDate || getCleanCaption(currentPhoto?.caption) || bookstore.yearOpened}
          </div>
        </div>

        {/* Right Column: Cataloged Bookmarks (~42% on desktop) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-2">
            <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#F43F7A]" />
              <span>Cataloged Bookmarks</span>
            </h2>
            <span className="text-xs font-mono text-stone-500">
              {bookstore.bookmarks.length} {bookstore.bookmarks.length === 1 ? "Specimen" : "Specimens"}
            </span>
          </div>

          {bookstore.bookmarks.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-white border border-[#E8E2D5] text-xs font-sans text-stone-500 italic">
              No bookmark specimens currently cataloged for this bookstore.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1">
              {bookstore.bookmarks.map((bm) => (
                <button
                  key={bm.id}
                  type="button"
                  onClick={() => setSelectedBookmark({ ...bm, bookstore })}
                  className="group flex flex-col items-center text-center cursor-pointer p-2 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#E8E2D5] hover:border-[#F43F7A]/50 shadow-xs hover:shadow-md transition-all"
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
                  <h4 className="font-serif text-xs font-bold text-stone-900 group-hover:text-[#F43F7A] transition-colors line-clamp-1 w-full">
                    {bm.title}
                  </h4>
                  <span className="font-mono text-[11px] text-stone-500 mt-0.5">
                    {bm.dimensions}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Middle Section: Horizontal Heritage & Relocation Timeline */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-sm font-mono font-bold uppercase tracking-wider text-[#F43F7A]">
            Timeline
          </h2>
          <span className="text-xs font-sans text-stone-500 italic hidden sm:inline">
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
          <section className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs space-y-4">
            <h2 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2 border-b border-[#E8E2D5] pb-3">
              <FileText className="w-5 h-5 text-[#F43F7A]" />
              <span>Bookstore History</span>
            </h2>

            <div
              className="font-serif text-sm sm:text-base text-stone-700 leading-relaxed prose prose-stone max-w-none"
              dangerouslySetInnerHTML={{
                __html: marked.parse(bookstore.historicalBlurb || "") as string,
              }}
            />
          </section>
        </div>

        {/* Archival Media: Newspaper Clippings & Photos Tabs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {bookstore.archivalMedia.length > 0 && (
            <section className="p-6 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-3">
                {/* Tabs */}
                <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-stone-100 text-xs font-sans">
                  <button
                    type="button"
                    onClick={() => setActiveMediaTab("newspaper")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                      activeMediaTab === "newspaper"
                        ? "bg-white font-bold text-[#F43F7A] shadow-xs"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    <Newspaper className="w-3.5 h-3.5" />
                    <span>Newspaper Clippings ({newspaperClippings.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMediaTab("photo")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                      activeMediaTab === "photo"
                        ? "bg-white font-bold text-[#F43F7A] shadow-xs"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Photos ({photosList.length})</span>
                  </button>
                </div>
              </div>

              {/* Tab Contents */}
              {activeMediaTab === "newspaper" ? (
                newspaperClippings.length === 0 ? (
                  <div className="p-6 text-center text-xs font-sans text-stone-500 italic">
                    No newspaper clippings attached yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {newspaperClippings.map((media, idx) => {
                      const displayCaption = getCleanCaption(media.caption) || "Archival Press Clipping";

                      return (
                        <div
                          key={media.id || `clipping-${idx}`}
                          onClick={() => setSelectedLightboxMedia(media)}
                          className="group cursor-pointer flex items-center gap-3 p-2.5 rounded-xl border border-[#E8E2D5] bg-[#FAF8F5] hover:bg-white transition-all shadow-2xs hover:shadow-xs"
                        >
                          <div className="relative w-16 h-16 rounded bg-stone-100 overflow-hidden shrink-0 border border-[#E8E2D5]">
                            <Image
                              src={media.imageUrl}
                              alt={displayCaption}
                              fill
                              unoptimized
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-serif text-xs font-bold text-stone-900 group-hover:text-[#F43F7A] transition-colors truncate">
                              {displayCaption}
                            </h4>
                            {media.sourcePublication && (
                              <p className="font-sans text-[11px] text-stone-500 italic truncate">
                                {media.sourcePublication}
                                {media.publicationDate ? ` (${media.publicationDate})` : ""}
                              </p>
                            )}
                            <span className="text-[10px] font-mono text-[#F43F7A] group-hover:underline block mt-0.5 font-semibold">
                              Read clipping &amp; transcription →
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                photosList.length === 0 ? (
                  <div className="p-6 text-center text-xs font-sans text-stone-500 italic">
                    No additional photographs cataloged.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {photosList.map((media, idx) => {
                      const displayCaption = getCleanCaption(media.caption) || `${bookstore.name} Photograph`;
                      const tagLabel =
                        media.mediaTag === "interior"
                          ? "Inside / Interior"
                          : media.isStorefront || media.mediaTag === "storefront"
                          ? "Storefront"
                          : "Historic Photo";

                      return (
                        <div
                          key={media.id || `photo-${idx}`}
                          onClick={() => setSelectedLightboxMedia(media)}
                          className="group cursor-pointer flex items-center gap-3 p-2.5 rounded-xl border border-[#E8E2D5] bg-[#FAF8F5] hover:bg-white transition-all shadow-2xs hover:shadow-xs"
                        >
                          <div className="relative w-16 h-16 rounded bg-stone-100 overflow-hidden shrink-0 border border-[#E8E2D5]">
                            <Image
                              src={media.imageUrl}
                              alt={displayCaption}
                              fill
                              unoptimized
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-stone-200 text-stone-800">
                                {tagLabel}
                              </span>
                              {media.publicationDate && (
                                <span className="text-[10px] font-mono text-stone-500">
                                  c. {media.publicationDate}
                                </span>
                              )}
                            </div>
                            <h4 className="font-serif text-xs font-bold text-stone-900 group-hover:text-[#F43F7A] transition-colors truncate mt-0.5">
                              {displayCaption}
                            </h4>
                            {media.sourcePublication && (
                              <p className="font-sans text-[11px] text-stone-500 italic truncate">
                                Credit: {media.sourcePublication}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}
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
