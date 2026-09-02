"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookstoreWithDetails, BookmarkWithDetails } from "@/lib/db/queries";
import { BookstoreLocation, ArchivalMedia } from "@/db/schema";
import { BookmarkInspector } from "@/components/exhibit/BookmarkInspector";
import { ClippingLightbox } from "@/components/exhibit/ClippingLightbox";
import { Button } from "@/components/ui/Button";
import {
  MapPin,
  Calendar,
  Building2,
  ExternalLink,
  ArrowLeft,
  Navigation,
  Sparkles,
  Newspaper,
  BookOpen,
  ArrowRight,
  Store,
  ChevronLeft,
  ChevronRight,
  FileText,
  Bookmark as BookmarkIcon,
} from "lucide-react";
import { marked } from "marked";

export interface BookstoreDetailViewProps {
  bookstore: BookstoreWithDetails;
}

/**
 * Filter out raw filenames or generic auto-generated strings from display captions.
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
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
  const [mediaFilter, setMediaFilter] = useState<"all" | "newspaper" | "photo">("all");
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Parse structured locations
  let parsedLocations: BookstoreLocation[] = [];
  try {
    if (bookstore.locations) {
      parsedLocations = JSON.parse(bookstore.locations);
    }
  } catch {}

  if (parsedLocations.length === 0 && bookstore.streetAddress) {
    parsedLocations = [
      {
        id: "loc-1",
        label: "Primary Location",
        streetAddress: bookstore.streetAddress,
        city: bookstore.city,
        stateProvince: bookstore.stateProvince || undefined,
        country: bookstore.country,
        yearsActive: `${bookstore.yearOpened}–${bookstore.isStillOperating ? "Present" : bookstore.yearClosed || ""}`,
        isMovedFrom: false,
        isCurrent: bookstore.isStillOperating,
      },
    ];
  }

  // Parse specialties and trivia
  let specialties: string[] = [];
  try {
    if (bookstore.specialties) specialties = JSON.parse(bookstore.specialties);
  } catch {}

  let trivia: string[] = [];
  try {
    if (bookstore.notablePatronsTrivia) trivia = JSON.parse(bookstore.notablePatronsTrivia);
  } catch {}

  // Find all storefront / photo items for carousel
  const storefrontPhotos = bookstore.archivalMedia.filter(
    (m) => m.isStorefront || m.mediaType === "photo"
  );
  const currentPhoto = storefrontPhotos[activePhotoIdx] || storefrontPhotos[0] || null;

  // Filtered media items for press gallery
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
    <div className="space-y-8">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/bookstores"
          className="inline-flex items-center gap-1.5 text-xs font-serif text-ink-light hover:text-archival-oxblood transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Bookstores Directory</span>
        </Link>

        {bookstore.websiteUrl && (
          <a
            href={bookstore.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-serif text-archival-oxblood hover:underline"
          >
            <span>Official Website</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Storefront Hero Showcase (Full Image, Uncropped, with Optional Carousel) */}
      <section className="rounded-2xl overflow-hidden bg-[#1c1917] border border-parchment-border shadow-sm text-white">
        {/* Header strip on showcase */}
        <div className="px-5 py-3.5 border-b border-white/10 bg-black/30 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-amber-100 tracking-tight">
              {bookstore.name}
            </h1>
            {bookstore.isStillOperating ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-600 text-white shadow-xs">
                STILL OPEN
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-stone-800 text-stone-300 border border-stone-700 shadow-xs">
                {bookstore.yearClosed ? `CLOSED (${bookstore.yearClosed})` : "CLOSED"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs font-serif text-stone-300">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {bookstore.city}
                {bookstore.stateProvince ? `, ${bookstore.stateProvince}` : ""}
              </span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {bookstore.yearOpened}–{bookstore.isStillOperating ? "Present" : bookstore.yearClosed || "Closed"}
              </span>
            </span>
          </div>
        </div>

        {/* Storefront Photo Display Area */}
        {currentPhoto ? (
          <div className="relative w-full bg-[#141211] p-3 sm:p-4 flex flex-col items-center justify-center">
            <div className="relative w-full h-[260px] sm:h-[320px] md:h-[360px] max-w-4xl mx-auto flex items-center justify-center">
              <Image
                src={currentPhoto.imageUrl}
                alt={getCleanCaption(currentPhoto.caption) || `${bookstore.name} Storefront`}
                fill
                unoptimized
                priority
                className="object-contain object-center drop-shadow-md"
              />

              {/* Carousel Navigation Arrows if multiple photos */}
              {storefrontPhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevPhoto}
                    aria-label="Previous storefront photograph"
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/85 text-white border border-white/20 transition-all cursor-pointer shadow-md"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={nextPhoto}
                    aria-label="Next storefront photograph"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/85 text-white border border-white/20 transition-all cursor-pointer shadow-md"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Photo Caption Strip (Only if human curatorial caption, NOT raw file name) */}
            <div className="w-full max-w-4xl mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-xs text-stone-300 font-serif">
              <div>
                {getCleanCaption(currentPhoto.caption) ? (
                  <span className="italic">{getCleanCaption(currentPhoto.caption)}</span>
                ) : (
                  <span className="text-stone-400">Historic Storefront &amp; Shop Exterior</span>
                )}
              </div>

              {storefrontPhotos.length > 1 && (
                <div className="flex items-center gap-2 font-mono text-[11px] text-stone-400">
                  <span>
                    {activePhotoIdx + 1} / {storefrontPhotos.length}
                  </span>
                  <div className="flex items-center gap-1">
                    {storefrontPhotos.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        type="button"
                        onClick={() => setActivePhotoIdx(dotIdx)}
                        aria-label={`Go to slide ${dotIdx + 1}`}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          dotIdx === activePhotoIdx ? "bg-amber-400 w-3" : "bg-stone-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center space-y-2 bg-stone-900">
            <p className="font-serif text-sm text-stone-400 italic">
              No storefront photograph cataloged for this bookstore yet.
            </p>
          </div>
        )}
      </section>

      {/* Main Content Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): History, Relocation Timeline & Press Gallery */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. Multi-Location & Relocation Timeline */}
          {parsedLocations.length > 0 && (
            <section className="p-6 sm:p-8 rounded-2xl bg-white border border-parchment-border shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-parchment-border pb-3">
                <h2 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-archival-oxblood" />
                  <span>Address &amp; Relocation Timeline</span>
                </h2>
                <span className="text-xs font-mono text-ink-muted">
                  {parsedLocations.length} {parsedLocations.length === 1 ? "Location" : "Historic Locations"}
                </span>
              </div>

              {/* Aesthetic Relocation Flow */}
              <div className="space-y-4">
                {parsedLocations.map((loc, idx) => (
                  <div
                    key={loc.id || `loc-${idx}`}
                    className="relative flex items-start gap-4 p-4 rounded-xl bg-parchment/40 border border-parchment-border"
                  >
                    {/* Step Number Badge */}
                    <div className="w-8 h-8 rounded-full bg-white border-2 border-archival-oxblood flex items-center justify-center text-xs font-mono font-bold text-archival-oxblood shrink-0 shadow-2xs">
                      #{idx + 1}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-serif text-sm font-bold text-ink">
                          {loc.label || `Location #${idx + 1}`}
                        </h3>
                        {loc.yearsActive && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-white border border-parchment-border text-ink-light font-medium">
                            {loc.yearsActive}
                          </span>
                        )}
                      </div>

                      <p className="font-serif text-xs sm:text-sm text-ink-light flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-archival-oxblood shrink-0" />
                        <span>
                          {loc.streetAddress}, {loc.city || bookstore.city}
                          {loc.stateProvince || bookstore.stateProvince ? `, ${loc.stateProvince || bookstore.stateProvince}` : ""}
                        </span>
                      </p>

                      {loc.notes && (
                        <p className="font-serif text-xs text-ink-muted italic pt-1">
                          {loc.notes}
                        </p>
                      )}

                      {/* Relocation indicator badge */}
                      {loc.isMovedFrom && (
                        <div className="pt-2">
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            <span>Relocated to next address</span>
                            <ArrowRight className="w-3 h-3 text-rose-700" />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 2. Historical Blurb & Cultural Heritage */}
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

          {/* 3. Archival Photos & Press Clippings Gallery */}
          {bookstore.archivalMedia.length > 0 && (
            <section className="p-6 sm:p-8 rounded-2xl bg-white border border-parchment-border shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-parchment-border pb-3">
                <h2 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-archival-oxblood" />
                  <span>Archival Press &amp; Photographs</span>
                </h2>

                {/* Filter tabs */}
                <div className="flex items-center gap-1 bg-parchment-light p-1 rounded-lg border border-parchment-border text-xs font-serif">
                  <button
                    type="button"
                    onClick={() => setMediaFilter("all")}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      mediaFilter === "all"
                        ? "bg-white text-ink font-bold shadow-2xs"
                        : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    All ({bookstore.archivalMedia.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaFilter("newspaper")}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      mediaFilter === "newspaper"
                        ? "bg-white text-ink font-bold shadow-2xs"
                        : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    Clippings
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaFilter("photo")}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      mediaFilter === "photo"
                        ? "bg-white text-ink font-bold shadow-2xs"
                        : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    Photos
                  </button>
                </div>
              </div>

              {/* Media Thumbnails Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredMedia.map((media, idx) => {
                  const originalIndex = bookstore.archivalMedia.findIndex((m) => m.id === media.id);
                  const displayCaption = getCleanCaption(media.caption) || (media.mediaType === "newspaper" ? "Press Clipping" : "Archival Photo");

                  return (
                    <div
                      key={media.id || `media-${idx}`}
                      onClick={() => setSelectedMediaIndex(originalIndex >= 0 ? originalIndex : idx)}
                      className="group cursor-pointer rounded-xl border border-parchment-border bg-parchment/30 hover:bg-parchment-light overflow-hidden transition-all shadow-2xs hover:shadow-xs"
                    >
                      <div className="relative w-full aspect-[16/10] bg-stone-100 overflow-hidden border-b border-parchment-border">
                        <Image
                          src={media.imageUrl}
                          alt={displayCaption}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[10px] font-mono text-white">
                          {media.mediaType === "newspaper" ? "PRESS CLIPPING" : "HISTORIC PHOTO"}
                        </div>
                      </div>

                      <div className="p-3 space-y-1">
                        <h4 className="font-serif text-xs font-bold text-ink group-hover:text-archival-oxblood transition-colors line-clamp-1">
                          {displayCaption}
                        </h4>
                        {media.sourcePublication && (
                          <p className="font-serif text-[11px] text-ink-muted italic">
                            {media.sourcePublication}
                            {media.publicationDate ? ` (${media.publicationDate})` : ""}
                          </p>
                        )}
                        {media.transcriptionText && (
                          <p className="font-mono text-[10px] text-archival-oxblood font-semibold">
                            ✓ Has Full Transcription
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

        {/* Right Column (1 Col): Bookmarks Tray & Metadata Sidebar */}
        <div className="space-y-8">
          {/* Bookmarks Issued by this Bookstore */}
          <section className="p-6 rounded-2xl bg-white border border-parchment-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-parchment-border pb-3">
              <h2 className="font-serif text-base font-bold text-ink flex items-center gap-2">
                <BookmarkIcon className="w-4 h-4 text-archival-oxblood" />
                <span>Cataloged Bookmarks</span>
              </h2>
              <span className="text-xs font-mono font-bold text-archival-oxblood bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                {bookstore.bookmarks.length}
              </span>
            </div>

            {bookstore.bookmarks.length === 0 ? (
              <p className="font-serif text-xs text-ink-muted italic">
                No bookmark specimens cataloged for this bookstore yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {bookstore.bookmarks.map((bm) => (
                  <button
                    key={bm.id}
                    type="button"
                    onClick={() => setSelectedBookmark({ ...bm, bookstore })}
                    className="group text-left p-2 rounded-xl border border-parchment-border bg-parchment/40 hover:bg-white hover:border-amber-700/50 transition-all shadow-2xs hover:shadow-xs flex flex-col items-center text-center cursor-pointer"
                  >
                    <div className="relative w-full h-36 rounded bg-stone-100 overflow-hidden border border-parchment-border mb-2">
                      <Image
                        src={bm.frontImageUrl}
                        alt={bm.title}
                        fill
                        unoptimized
                        className="object-contain p-1 group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <h4 className="font-serif text-xs font-bold text-ink group-hover:text-archival-oxblood transition-colors line-clamp-1 w-full">
                      {bm.title}
                    </h4>
                    <span className="font-mono text-[10px] text-ink-muted">
                      {bm.dimensions}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Archival Metadata Sidebar */}
          <section className="p-6 rounded-2xl bg-white border border-parchment-border shadow-xs space-y-4 text-xs font-serif">
            <h3 className="font-mono uppercase font-bold text-archival-oxblood text-xs tracking-wider border-b border-parchment-border pb-2">
              Bookstore Facts &amp; Heritage
            </h3>

            {bookstore.founders && (
              <div>
                <span className="font-mono text-ink-muted text-[11px] block uppercase">
                  Founders &amp; Proprietors
                </span>
                <span className="text-ink font-medium">{bookstore.founders}</span>
              </div>
            )}

            <div>
              <span className="font-mono text-ink-muted text-[11px] block uppercase">
                Operating Status
              </span>
              <span className="text-ink font-medium">
                {bookstore.isStillOperating
                  ? "Still Operating Today"
                  : bookstore.yearClosed
                  ? `Closed in ${bookstore.yearClosed}`
                  : "Closed"}
              </span>
            </div>

            {specialties.length > 0 && (
              <div>
                <span className="font-mono text-ink-muted text-[11px] block uppercase mb-1">
                  Literary Specialties
                </span>
                <div className="flex flex-wrap gap-1">
                  {specialties.map((spec, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-parchment border border-parchment-border text-ink-light text-[11px]"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {trivia.length > 0 && (
              <div>
                <span className="font-mono text-ink-muted text-[11px] block uppercase mb-1">
                  Notable Patrons &amp; Trivia
                </span>
                <ul className="space-y-1 list-disc list-inside text-ink-light">
                  {trivia.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Bookmark Inspector Modal */}
      {selectedBookmark && (
        <BookmarkInspector
          bookmark={selectedBookmark}
          onClose={() => setSelectedBookmark(null)}
        />
      )}

      {/* Press Clipping Lightbox */}
      {selectedMediaIndex !== null && bookstore.archivalMedia[selectedMediaIndex] && (
        <ClippingLightbox
          media={bookstore.archivalMedia[selectedMediaIndex]}
          onClose={() => setSelectedMediaIndex(null)}
        />
      )}
    </div>
  );
}
