"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookstoreWithDetails, BookmarkWithDetails } from "@/lib/db/queries";
import { BookstoreLocation } from "@/db/schema";
import { BookmarkInspector } from "@/components/exhibit/BookmarkInspector";
import { ClippingLightbox } from "@/components/exhibit/ClippingLightbox";
import {
  Building2,
  MapPin,
  Calendar,
  Bookmark as BookmarkIcon,
  Newspaper,
  Image as ImageIcon,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Users,
  Sparkles,
  Store,
  Layers,
  FileText,
  Clock,
  CheckCircle2,
  Navigation,
} from "lucide-react";
import { marked } from "marked";

export interface BookstoreDetailViewProps {
  bookstore: BookstoreWithDetails;
}

export function BookstoreDetailView({ bookstore }: BookstoreDetailViewProps) {
  const [selectedBookmark, setSelectedBookmark] = useState<BookmarkWithDetails | null>(null);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
  const [mediaFilter, setMediaFilter] = useState<"all" | "newspaper" | "photo" | "ephemera">("all");

  // Parse locations array or fallback to single street address
  let parsedLocations: BookstoreLocation[] = [];
  if (bookstore.locations) {
    try {
      parsedLocations = JSON.parse(bookstore.locations);
    } catch {}
  }

  if (parsedLocations.length === 0 && bookstore.streetAddress) {
    parsedLocations = [
      {
        id: "loc-default",
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

  // Find Storefront Hero Photo
  const storefrontMedia =
    bookstore.archivalMedia.find((m) => m.isStorefront) ||
    bookstore.archivalMedia.find((m) => m.mediaType === "photo") ||
    null;

  // Filtered media items
  const filteredMedia = bookstore.archivalMedia.filter((m) => {
    if (mediaFilter === "all") return true;
    return m.mediaType === mediaFilter;
  });

  return (
    <div className="space-y-10">
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

      {/* Hero Storefront Banner */}
      <section className="relative rounded-3xl overflow-hidden bg-stone-900 border border-parchment-border shadow-md text-white">
        {storefrontMedia ? (
          <div className="relative w-full aspect-[21/9] min-h-[260px] max-h-[440px] bg-stone-950">
            <Image
              src={storefrontMedia.imageUrl}
              alt={`${bookstore.name} Storefront`}
              fill
              unoptimized
              priority
              className="object-cover object-center filter brightness-90 contrast-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

            {/* Storefront Badge */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/95 text-stone-950 text-xs font-mono font-bold shadow-md">
                <Store className="w-3.5 h-3.5" />
                <span>HISTORIC STOREFRONT</span>
              </span>
            </div>

            {/* Caption on Hero Banner */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-8 space-y-2">
              <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight drop-shadow-md">
                {bookstore.name}
              </h1>
              <p className="text-xs sm:text-sm font-serif text-stone-200 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {bookstore.city}
                    {bookstore.stateProvince ? `, ${bookstore.stateProvince}` : ""},{" "}
                    {bookstore.country}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {bookstore.yearOpened}–{bookstore.isStillOperating ? "Present" : bookstore.yearClosed || "Closed"}
                  </span>
                </span>
                {storefrontMedia.caption && (
                  <span className="italic text-stone-300 hidden md:inline">
                    · {storefrontMedia.caption}
                  </span>
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-8 sm:p-12 text-center space-y-3 bg-gradient-to-b from-stone-900 to-stone-950">
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-amber-100">
              {bookstore.name}
            </h1>
            <p className="font-serif text-sm text-stone-300 flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>
                {bookstore.city}
                {bookstore.stateProvince ? `, ${bookstore.stateProvince}` : ""}, {bookstore.country}
              </span>
              <span>·</span>
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>
                {bookstore.yearOpened}–{bookstore.isStillOperating ? "Present" : bookstore.yearClosed || "Closed"}
              </span>
            </p>
          </div>
        )}
      </section>

      {/* Main Content Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): History, Relocation Timeline & Media */}
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

              {/* Aesthetic Vertical/Horizontal Relocation Flow */}
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
                  return (
                    <div
                      key={media.id || `media-${idx}`}
                      onClick={() => setSelectedMediaIndex(originalIndex >= 0 ? originalIndex : idx)}
                      className="group cursor-pointer rounded-xl border border-parchment-border bg-parchment/30 hover:bg-parchment-light overflow-hidden transition-all shadow-2xs hover:shadow-xs"
                    >
                      <div className="relative w-full aspect-[16/10] bg-stone-100 overflow-hidden border-b border-parchment-border">
                        <Image
                          src={media.imageUrl}
                          alt={media.caption}
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
                          {media.caption}
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
                  <div
                    key={bm.id}
                    onClick={() =>
                      setSelectedBookmark({
                        ...bm,
                        bookstore: {
                          ...bookstore,
                          archivalMedia: bookstore.archivalMedia,
                        },
                      })
                    }
                    className="group cursor-pointer rounded-xl border border-parchment-border bg-parchment-light hover:border-archival-amber p-2 flex flex-col items-center justify-between text-center transition-all shadow-2xs hover:shadow-xs"
                  >
                    <div className="relative w-full aspect-[1/2.8] max-w-[100px] mb-2">
                      <Image
                        src={bm.frontImageUrl}
                        alt={bm.title}
                        fill
                        unoptimized
                        className="object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <p className="font-serif text-[11px] font-bold text-ink line-clamp-2">
                      {bm.title}
                    </p>
                    {bm.yearProduced && (
                      <p className="font-mono text-[10px] text-ink-muted">c. {bm.yearProduced}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Curatorial Details Card */}
          <section className="p-6 rounded-2xl bg-white border border-parchment-border shadow-xs space-y-4 text-xs font-serif">
            <h3 className="font-serif text-sm font-bold text-ink border-b border-parchment-border pb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-archival-oxblood" />
              <span>Curatorial Metadata</span>
            </h3>

            {bookstore.founders && (
              <div className="space-y-0.5">
                <span className="font-mono text-[10px] text-ink-muted block uppercase">Founders / Proprietors</span>
                <p className="font-semibold text-ink">{bookstore.founders}</p>
              </div>
            )}

            {specialties.length > 0 && (
              <div className="space-y-1">
                <span className="font-mono text-[10px] text-ink-muted block uppercase">Specialties</span>
                <div className="flex flex-wrap gap-1">
                  {specialties.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded bg-parchment-light text-ink border border-parchment-border text-[10px]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {trivia.length > 0 && (
              <div className="space-y-1 pt-2 border-t border-parchment-border/60">
                <span className="font-mono text-[10px] text-ink-muted block uppercase">Notable Lore &amp; Patrons</span>
                <ul className="space-y-1 list-disc pl-4 text-ink-light text-[11px]">
                  {trivia.map((t, idx) => (
                    <li key={idx}>{t}</li>
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
