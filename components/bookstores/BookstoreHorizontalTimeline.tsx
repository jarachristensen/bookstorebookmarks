"use client";

import React, { useMemo } from "react";
import { BookstoreWithDetails } from "@/lib/db/queries";
import { BookstoreLocation, ArchivalMedia, CustomTimelineEvent } from "@/db/schema";
import {
  Store,
  Sparkles,
  MapPin,
  Newspaper,
  Camera,
  Calendar,
  Pencil,
  Trash2,
} from "lucide-react";

export interface TimelineEvent {
  id: string;
  year: number;
  label: string;
  description: string;
  type: "opening" | "relocation" | "closure" | "press" | "milestone";
  media?: ArchivalMedia | null;
  mediaId?: string;
  mediaUrl?: string;
}

export interface BookstoreHorizontalTimelineProps {
  bookstore: BookstoreWithDetails;
  onSelectMedia?: (media: ArchivalMedia) => void;
  customEvents?: CustomTimelineEvent[];
  isEditable?: boolean;
  onEditEvent?: (event: TimelineEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
}

export function BookstoreHorizontalTimeline({
  bookstore,
  onSelectMedia,
  customEvents,
  isEditable = false,
  onEditEvent,
  onDeleteEvent,
}: BookstoreHorizontalTimelineProps) {
  // Parse locations
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
        label: "1st Location",
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

  // Parse trivia
  let triviaList: string[] = [];
  try {
    if (bookstore.notablePatronsTrivia) {
      triviaList = JSON.parse(bookstore.notablePatronsTrivia);
    }
  } catch {}

  // Parse stored custom timeline events if not explicitly passed as prop
  let storedCustomEvents: CustomTimelineEvent[] | null = null;
  if (customEvents) {
    storedCustomEvents = customEvents;
  } else if (bookstore.timelineEvents) {
    try {
      storedCustomEvents = JSON.parse(bookstore.timelineEvents);
    } catch {}
  }

  // Find primary storefront image for Grand Opening link
  const storefrontMedia =
    bookstore.archivalMedia.find((m) => m.isStorefront) ||
    bookstore.archivalMedia.find((m) => m.mediaType === "photo") ||
    bookstore.archivalMedia[0] ||
    null;

  // Build timeline events dynamically
  const timelineEvents = useMemo(() => {
    // If custom events exist, use them!
    if (storedCustomEvents && storedCustomEvents.length > 0) {
      return storedCustomEvents
        .map((ev) => {
          let attachedMedia: ArchivalMedia | null = null;
          if (ev.mediaId) {
            attachedMedia = bookstore.archivalMedia.find((m) => m.id === ev.mediaId) || null;
          } else if (ev.mediaUrl) {
            attachedMedia = {
              id: `custom-media-${ev.id}`,
              bookstoreId: bookstore.id,
              mediaType: "photo",
              imageUrl: ev.mediaUrl,
              caption: ev.mediaCaption || ev.description || ev.label,
              sourcePublication: null,
              publicationDate: String(ev.year),
              transcriptionText: null,
              isStorefront: false,
              mediaTag: null,
              displayOrder: 0,
              createdAt: new Date().toISOString(),
            };
          } else if (ev.type === "opening" && storefrontMedia) {
            attachedMedia = storefrontMedia;
          }

          return {
            id: ev.id,
            year: Number(ev.year),
            label: ev.label,
            description: ev.description,
            type: ev.type || "milestone",
            media: attachedMedia,
            mediaId: ev.mediaId,
            mediaUrl: ev.mediaUrl,
          };
        })
        .sort((a, b) => a.year - b.year);
    }

    // Default dynamic compilation:
    const events: TimelineEvent[] = [];

    // 1. Grand Opening / Founding Event
    const primaryAddress = parsedLocations[0]?.streetAddress || bookstore.streetAddress || "";
    events.push({
      id: "ev-founding",
      year: bookstore.yearOpened,
      label: "Grand Opening",
      description: primaryAddress
        ? `${primaryAddress}, ${bookstore.city}`
        : `Established in ${bookstore.city}`,
      type: "opening",
      media: storefrontMedia,
    });

    // 2. Multi-Location / Relocation Events
    parsedLocations.forEach((loc, idx) => {
      if (idx === 0) return; // already counted in founding

      const yearMatch = loc.yearsActive?.match(/\b(18\d{2}|19\d{2}|20\d{2})\b/);
      const year = yearMatch ? parseInt(yearMatch[0], 10) : bookstore.yearOpened + idx * 5;

      const isBranch =
        loc.label.toLowerCase().includes("branch") ||
        loc.label.toLowerCase().includes("new location");
      const label = isBranch ? "New Branch Opened" : `Relocated (${loc.label})`;

      const matchingMedia = bookstore.archivalMedia.find((m) => {
        const pubDateMatch = m.publicationDate?.includes(String(year));
        const captionMatch =
          loc.streetAddress &&
          m.caption.toLowerCase().includes(loc.streetAddress.toLowerCase());
        return pubDateMatch || captionMatch;
      });

      events.push({
        id: `ev-loc-${loc.id || idx}`,
        year: year,
        label: label,
        description: loc.streetAddress ? `${loc.streetAddress}` : loc.label,
        type: "relocation",
        media: matchingMedia || null,
      });

      if (loc.isMovedFrom && loc.yearsActive) {
        const endYearMatch = loc.yearsActive.match(/–\s*(\d{4})/);
        if (endYearMatch) {
          events.push({
            id: `ev-loc-moved-${loc.id || idx}`,
            year: parseInt(endYearMatch[1], 10),
            label: "Location Closed / Moved",
            description: `${loc.streetAddress || loc.label} address vacated`,
            type: "relocation",
            media: null,
          });
        }
      }
    });

    // 3. Archival Media & Press Events
    bookstore.archivalMedia.forEach((media, idx) => {
      if (media.publicationDate) {
        const yearMatch = media.publicationDate.match(/\b(18\d{2}|19\d{2}|20\d{2})\b/);
        if (yearMatch) {
          const year = parseInt(yearMatch[0], 10);
          const pub = media.sourcePublication || (media.mediaType === "newspaper" ? "Press Clipping" : "Historic Photo");
          const desc =
            media.caption &&
            !media.caption.toLowerCase().startsWith("untitled") &&
            !media.caption.toLowerCase().startsWith("media-")
              ? media.caption
              : `Featured in ${pub}`;

          events.push({
            id: `ev-media-${media.id || idx}`,
            year: year,
            label: pub,
            description: desc,
            type: "press",
            media: media,
          });
        }
      }
    });

    // 4. Trivia Milestones with Dates
    triviaList.forEach((t, idx) => {
      const yearMatch = t.match(/\b(18\d{2}|19\d{2}|20\d{2})\b/);
      if (yearMatch) {
        const year = parseInt(yearMatch[0], 10);
        const matchingMedia = bookstore.archivalMedia.find((m) =>
          m.publicationDate?.includes(String(year))
        );

        events.push({
          id: `ev-trivia-${idx}`,
          year: year,
          label: "Historical Milestone",
          description: t.replace(/\b(18\d{2}|19\d{2}|20\d{2})\b[:\s-]*/, "").trim(),
          type: "milestone",
          media: matchingMedia || null,
        });
      }
    });

    // 5. Final Closure Event (if bookstore is closed)
    if (!bookstore.isStillOperating && bookstore.yearClosed) {
      events.push({
        id: "ev-closure",
        year: bookstore.yearClosed,
        label: "Bookstore Closed",
        description: `Closed doors after ${bookstore.yearClosed - bookstore.yearOpened} years`,
        type: "closure",
        media: null,
      });
    }

    return events.sort((a, b) => a.year - b.year);
  }, [bookstore, parsedLocations, triviaList, storedCustomEvents, storefrontMedia]);

  // Founding location string
  const grandOpeningAddress =
    parsedLocations[0]?.streetAddress ||
    bookstore.streetAddress ||
    `${bookstore.city}, ${bookstore.country}`;

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-white border border-parchment-border shadow-xs overflow-hidden">
      <div className="overflow-x-auto pb-4 pt-2">
        <div className="min-w-[760px] flex items-center gap-6 py-6 px-4">
          {/* Left Anchor: Grand Opening Stamp */}
          {storefrontMedia && onSelectMedia && !isEditable ? (
            <button
              type="button"
              onClick={() => onSelectMedia(storefrontMedia)}
              title="Click to view storefront photo & clipping"
              className="shrink-0 group flex flex-col items-center justify-center text-center p-4 rounded-xl border-2 border-dashed border-stone-800 hover:border-archival-oxblood bg-[#FAF7F0] hover:bg-amber-50/70 shadow-xs hover:shadow-md rotate-[-2.5deg] hover:rotate-0 transition-all duration-200 cursor-pointer max-w-[185px]"
            >
              <div className="font-serif font-black text-xs sm:text-sm tracking-wider uppercase text-archival-oxblood group-hover:text-rose-900 border-b border-stone-400 group-hover:border-archival-oxblood pb-1 w-full flex items-center justify-center gap-1">
                <span>GRAND OPENING!</span>
              </div>
              <div className="font-serif font-bold text-2xl text-stone-900 group-hover:text-archival-oxblood mt-1">
                {bookstore.yearOpened}
              </div>
              <p className="font-serif text-[11px] text-stone-700 leading-tight mt-1 line-clamp-2">
                {grandOpeningAddress}
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-archival-oxblood font-bold mt-2 pt-1 border-t border-stone-300 w-full justify-center group-hover:underline">
                <Camera className="w-3 h-3" />
                <span>View Photo ↗</span>
              </span>
            </button>
          ) : (
            <div className="shrink-0 flex flex-col items-center justify-center text-center p-4 rounded-xl border-2 border-dashed border-stone-800 bg-[#FAF7F0] shadow-xs rotate-[-2.5deg] max-w-[175px]">
              <div className="font-serif font-black text-xs sm:text-sm tracking-wider uppercase text-archival-oxblood border-b border-stone-400 pb-1 w-full">
                GRAND OPENING!
              </div>
              <div className="font-serif font-bold text-2xl text-stone-900 mt-1">
                {bookstore.yearOpened}
              </div>
              <p className="font-serif text-[11px] text-stone-700 leading-tight mt-1 line-clamp-2">
                {grandOpeningAddress}
              </p>
            </div>
          )}

          {/* Horizontal Timeline Rail with Alternating Stalks */}
          <div className="flex-1 relative flex items-center min-h-[220px]">
            {/* Center Axis Line */}
            <div className="absolute left-0 right-0 h-[3px] bg-stone-900 rounded-full top-1/2 -translate-y-1/2 z-0" />

            {/* Milestones Track */}
            <div className="relative z-10 w-full flex items-center justify-between gap-4">
              {timelineEvents.map((ev, index) => {
                const isTop = index % 2 === 0;
                const hasMedia = Boolean(ev.media);
                const isClickable = hasMedia && Boolean(onSelectMedia) && !isEditable;

                return (
                  <div
                    key={ev.id}
                    className="flex-1 flex flex-col items-center relative text-center min-w-[110px] max-w-[150px]"
                  >
                    {/* Top Content (Even Index) */}
                    {isTop ? (
                      <div className="mb-2 flex flex-col items-center justify-end h-[84px]">
                        {isEditable ? (
                          <div className="flex flex-col items-center gap-1">
                            <p className="font-serif text-[11px] text-stone-900 font-bold leading-tight line-clamp-2">
                              {ev.description || ev.label}
                            </p>
                            <div className="flex items-center gap-1">
                              {onEditEvent && (
                                <button
                                  type="button"
                                  onClick={() => onEditEvent(ev)}
                                  className="p-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-archival-oxblood transition-colors cursor-pointer"
                                  title="Edit Event"
                                >
                                  <Pencil className="w-2.5 h-2.5" />
                                </button>
                              )}
                              {onDeleteEvent && (
                                <button
                                  type="button"
                                  onClick={() => onDeleteEvent(ev.id)}
                                  className="p-1 rounded bg-stone-100 hover:bg-rose-100 text-stone-700 hover:text-rose-700 transition-colors cursor-pointer"
                                  title="Delete Event"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ) : isClickable ? (
                          <button
                            type="button"
                            onClick={() => onSelectMedia!(ev.media!)}
                            title={`Click to view clipping/photo: ${ev.description || ev.label}`}
                            className="group flex flex-col items-center cursor-pointer focus:outline-none"
                          >
                            <p className="font-serif text-[11px] text-stone-900 group-hover:text-archival-oxblood font-bold leading-tight line-clamp-2 group-hover:underline transition-colors">
                              {ev.description || ev.label}
                            </p>
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-mono text-archival-oxblood mt-0.5 opacity-80 group-hover:opacity-100 font-semibold">
                              {ev.media?.mediaType === "newspaper" ? (
                                <>
                                  <Newspaper className="w-2.5 h-2.5" />
                                  <span>Clipping</span>
                                </>
                              ) : (
                                <>
                                  <Camera className="w-2.5 h-2.5" />
                                  <span>Photo</span>
                                </>
                              )}
                            </span>
                          </button>
                        ) : (
                          <p className="font-serif text-[11px] text-stone-900 font-semibold leading-tight line-clamp-2">
                            {ev.description || ev.label}
                          </p>
                        )}
                        {/* Stalk down to axis */}
                        <div className="w-[2px] h-3.5 bg-stone-900 mt-1" />
                      </div>
                    ) : (
                      <div className="h-[84px]" />
                    )}

                    {/* Milestone Node on Center Rail */}
                    <div className="flex flex-col items-center justify-center my-[-4px]">
                      {isEditable && onEditEvent ? (
                        <button
                          type="button"
                          onClick={() => onEditEvent(ev)}
                          title="Click to edit milestone"
                          className="group focus:outline-none flex flex-col items-center cursor-pointer"
                        >
                          <div className="w-4 h-4 rounded-full bg-stone-900 group-hover:bg-archival-oxblood group-hover:scale-125 border-2 border-white shadow-xs transition-transform duration-150" />
                          <span className="font-serif font-bold text-xs text-stone-900 group-hover:text-archival-oxblood mt-1 tracking-tight underline transition-colors">
                            {ev.year}
                          </span>
                        </button>
                      ) : isClickable ? (
                        <button
                          type="button"
                          onClick={() => onSelectMedia!(ev.media!)}
                          title="View attached archival clipping/photo"
                          className="group focus:outline-none flex flex-col items-center cursor-pointer"
                        >
                          <div className="w-4 h-4 rounded-full bg-stone-900 group-hover:bg-archival-oxblood group-hover:scale-125 border-2 border-white shadow-xs transition-transform duration-150" />
                          <span className="font-serif font-bold text-xs text-stone-900 group-hover:text-archival-oxblood mt-1 tracking-tight group-hover:underline transition-colors">
                            {ev.year}
                          </span>
                        </button>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="w-3.5 h-3.5 rounded-full bg-stone-900 border-2 border-white shadow-xs" />
                          <span className="font-serif font-bold text-xs text-stone-900 mt-1 tracking-tight">
                            {ev.year}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Content (Odd Index) */}
                    {!isTop ? (
                      <div className="mt-2 flex flex-col items-center justify-start h-[84px]">
                        {/* Stalk up to axis */}
                        <div className="w-[2px] h-3.5 bg-stone-900 mb-1" />
                        {isEditable ? (
                          <div className="flex flex-col items-center gap-1">
                            <p className="font-serif text-[11px] text-stone-900 font-bold leading-tight line-clamp-2">
                              {ev.description || ev.label}
                            </p>
                            <div className="flex items-center gap-1">
                              {onEditEvent && (
                                <button
                                  type="button"
                                  onClick={() => onEditEvent(ev)}
                                  className="p-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-archival-oxblood transition-colors cursor-pointer"
                                  title="Edit Event"
                                >
                                  <Pencil className="w-2.5 h-2.5" />
                                </button>
                              )}
                              {onDeleteEvent && (
                                <button
                                  type="button"
                                  onClick={() => onDeleteEvent(ev.id)}
                                  className="p-1 rounded bg-stone-100 hover:bg-rose-100 text-stone-700 hover:text-rose-700 transition-colors cursor-pointer"
                                  title="Delete Event"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ) : isClickable ? (
                          <button
                            type="button"
                            onClick={() => onSelectMedia!(ev.media!)}
                            title={`Click to view clipping/photo: ${ev.description || ev.label}`}
                            className="group flex flex-col items-center cursor-pointer focus:outline-none"
                          >
                            <p className="font-serif text-[11px] text-stone-900 group-hover:text-archival-oxblood font-bold leading-tight line-clamp-2 group-hover:underline transition-colors">
                              {ev.description || ev.label}
                            </p>
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-mono text-archival-oxblood mt-0.5 opacity-80 group-hover:opacity-100 font-semibold">
                              {ev.media?.mediaType === "newspaper" ? (
                                <>
                                  <Newspaper className="w-2.5 h-2.5" />
                                  <span>Clipping</span>
                                </>
                              ) : (
                                <>
                                  <Camera className="w-2.5 h-2.5" />
                                  <span>Photo</span>
                                </>
                              )}
                            </span>
                          </button>
                        ) : (
                          <p className="font-serif text-[11px] text-stone-900 font-semibold leading-tight line-clamp-2">
                            {ev.description || ev.label}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="h-[84px]" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
