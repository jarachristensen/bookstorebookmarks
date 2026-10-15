"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
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
  ZoomIn,
} from "lucide-react";
import { ClippingLightbox } from "@/components/exhibit/ClippingLightbox";

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

export interface BookstoreVerticalTimelineProps {
  bookstore: BookstoreWithDetails;
  onSelectMedia?: (media: ArchivalMedia) => void;
  customEvents?: CustomTimelineEvent[];
  isEditable?: boolean;
  onEditEvent?: (event: TimelineEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
}

export function BookstoreVerticalTimeline({
  bookstore,
  onSelectMedia,
  customEvents,
  isEditable = false,
  onEditEvent,
  onDeleteEvent,
}: BookstoreVerticalTimelineProps) {
  const [localLightboxMedia, setLocalLightboxMedia] = useState<ArchivalMedia | null>(null);

  const handleMediaClick = (media: ArchivalMedia) => {
    if (onSelectMedia) {
      onSelectMedia(media);
    } else {
      setLocalLightboxMedia(media);
    }
  };

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
        yearsActive: `${bookstore.yearOpened}–${
          bookstore.isStillOperating ? "Present" : bookstore.yearClosed || ""
        }`,
        isMovedFrom: false,
        isCurrent: bookstore.isStillOperating,
      },
    ];
  }

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
    bookstore.archivalMedia?.find((m) => m.isStorefront) ||
    bookstore.archivalMedia?.find((m) => m.mediaType === "photo") ||
    bookstore.archivalMedia?.[0] ||
    null;

  // Build timeline events dynamically
  const timelineEvents: TimelineEvent[] = useMemo(() => {
    // If custom events exist, use them
    if (storedCustomEvents && storedCustomEvents.length > 0) {
      return storedCustomEvents
        .map((ev) => {
          let attachedMedia: ArchivalMedia | null = null;
          if (ev.mediaId) {
            attachedMedia = bookstore.archivalMedia?.find((m) => m.id === ev.mediaId) || null;
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
      if (idx === 0) return;

      const yearMatch = loc.yearsActive?.match(/\b(18\d{2}|19\d{2}|20\d{2})\b/);
      const year = yearMatch ? parseInt(yearMatch[0], 10) : bookstore.yearOpened + idx * 5;

      const isBranch =
        loc.label.toLowerCase().includes("branch") ||
        loc.label.toLowerCase().includes("new location");
      const label = isBranch ? "New Branch Opened" : `Relocated (${loc.label})`;

      const matchingMedia = bookstore.archivalMedia?.find((m) => {
        const pubDateMatch = m.publicationDate?.includes(String(year));
        const captionMatch =
          loc.streetAddress && m.caption?.toLowerCase().includes(loc.streetAddress.toLowerCase());
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
    bookstore.archivalMedia?.forEach((media, idx) => {
      if (media.publicationDate) {
        const yearMatch = media.publicationDate.match(/\b(18\d{2}|19\d{2}|20\d{2})\b/);
        if (yearMatch) {
          const year = parseInt(yearMatch[0], 10);
          if (year !== bookstore.yearOpened) {
            events.push({
              id: `ev-media-${media.id || idx}`,
              year: year,
              label: media.sourcePublication
                ? `${media.sourcePublication} Feature`
                : media.caption || "Archival Record",
              description:
                media.caption && media.caption !== media.sourcePublication
                  ? media.caption
                  : `Historic documentation from ${year}.`,
              type: "press",
              media: media,
            });
          }
        }
      }
    });

    // 4. Closure Event
    if (!bookstore.isStillOperating && bookstore.yearClosed) {
      events.push({
        id: "ev-closure",
        year: bookstore.yearClosed,
        label: "Store Closed",
        description: `Operations ceased after ${
          bookstore.yearClosed - bookstore.yearOpened
        } years serving readers in ${bookstore.city}.`,
        type: "closure",
        media: null,
      });
    }

    return events.sort((a, b) => a.year - b.year);
  }, [bookstore, storedCustomEvents, parsedLocations, storefrontMedia]);

  const getTypeIcon = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "opening":
        return <Store className="w-3.5 h-3.5 text-emerald-700" />;
      case "relocation":
        return <MapPin className="w-3.5 h-3.5 text-blue-700" />;
      case "press":
        return <Newspaper className="w-3.5 h-3.5 text-[#F43F7A]" />;
      case "closure":
        return <Calendar className="w-3.5 h-3.5 text-stone-600" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-amber-600" />;
    }
  };

  return (
    <div className="w-full my-8">
      {/* Antique Broadside Header */}
      <div className="relative border-y-2 border-double border-stone-800 py-3.5 mb-10 text-center bg-[#FAF8F5]">
        <div className="text-[10px] uppercase tracking-[0.25em] font-mono font-semibold text-stone-500 mb-0.5">
          Historical Chronicle &amp; Milestones
        </div>
        <h2 className="text-xl sm:text-2xl font-serif font-black tracking-[0.25em] text-stone-900">
          TIMELINE
        </h2>
        <div className="text-[11px] font-serif italic text-stone-600 mt-0.5">
          Annals of {bookstore.name} · {bookstore.city}
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative max-w-4xl mx-auto px-4">
        {/* Continuous Serpentine Background Track */}
        <div className="absolute left-6 md:left-1/2 top-4 bottom-4 -translate-x-1/2 w-0.5 bg-gradient-to-b from-stone-800 via-[#18181B] to-stone-400 pointer-events-none" />

        <div className="space-y-10 md:space-y-16">
          {timelineEvents.map((event, index) => {
            const isEven = index % 2 === 0;
            const hasMedia = Boolean(event.media && event.media.imageUrl);

            return (
              <div key={event.id} className="relative pl-10 md:pl-0">
                {/* Milestone Node Dot */}
                <div className="absolute left-6 md:left-1/2 top-5 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 z-10 flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full bg-stone-900 border-2 border-[#FAF8F5] shadow-xs flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FAF8F5]" />
                  </div>
                </div>

                {hasMedia ? (
                  <div
                    className={`flex flex-col md:flex-row items-center gap-6 md:gap-14 ${
                      isEven ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    {/* Text Card */}
                    <div className="w-full md:w-1/2">
                      <EventCardContent
                        event={event}
                        align={isEven ? "right" : "left"}
                        isEditable={isEditable}
                        onEditEvent={onEditEvent}
                        onDeleteEvent={onDeleteEvent}
                        getTypeIcon={getTypeIcon}
                      />
                    </div>

                    {/* Thumbnail Image */}
                    <div className="w-full md:w-1/2">
                      <EventThumbnail
                        media={event.media!}
                        eventLabel={event.label}
                        onClick={() => handleMediaClick(event.media!)}
                      />
                    </div>
                  </div>
                ) : (
                  /* Expanded Event Without Media - Expands across step */
                  <div className="w-full max-w-xl mx-auto">
                    <div className="p-5 rounded-xl border border-[#E8E2D5] bg-[#FAF8F5] shadow-xs text-center space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-stone-900 text-stone-100 shadow-2xs">
                          {getTypeIcon(event.type)}
                          <span>{event.year}</span>
                        </span>
                      </div>

                      <h3 className="text-base font-serif font-bold text-stone-900 uppercase tracking-wide">
                        {event.label}
                      </h3>

                      <p className="text-xs font-serif text-stone-700 leading-relaxed max-w-md mx-auto">
                        {event.description}
                      </p>

                      {isEditable && (
                        <div className="flex items-center justify-center gap-2 pt-2 border-t border-[#E8E2D5]">
                          {onEditEvent && (
                            <button
                              type="button"
                              onClick={() => onEditEvent(event)}
                              className="p-1 rounded text-stone-500 hover:text-stone-900"
                              title="Edit milestone"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onDeleteEvent && (
                            <button
                              type="button"
                              onClick={() => onDeleteEvent(event.id)}
                              className="p-1 rounded text-stone-500 hover:text-rose-700"
                              title="Delete milestone"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      {localLightboxMedia && (
        <ClippingLightbox
          media={localLightboxMedia}
          onClose={() => setLocalLightboxMedia(null)}
        />
      )}
    </div>
  );
}

function EventCardContent({
  event,
  align,
  isEditable,
  onEditEvent,
  onDeleteEvent,
  getTypeIcon,
}: {
  event: TimelineEvent;
  align: "left" | "right";
  isEditable?: boolean;
  onEditEvent?: (event: TimelineEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
  getTypeIcon: (type: TimelineEvent["type"]) => React.ReactNode;
}) {
  const isRight = align === "right";

  return (
    <div
      className={`p-5 rounded-xl border border-[#E8E2D5] bg-[#FAF8F5] shadow-xs space-y-2 text-left ${
        isRight ? "md:text-right" : "md:text-left"
      }`}
    >
      <div
        className={`flex items-center gap-2 justify-start ${
          isRight ? "md:justify-end" : "md:justify-start"
        }`}
      >
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-stone-900 text-stone-100 shadow-2xs">
          {getTypeIcon(event.type)}
          <span>{event.year}</span>
        </span>
      </div>

      <h3 className="text-base font-serif font-bold text-stone-900 uppercase tracking-wide">
        {event.label}
      </h3>

      <p className="text-xs font-serif text-stone-700 leading-relaxed">
        {event.description}
      </p>

      {isEditable && (
        <div
          className={`flex items-center gap-2 pt-2 border-t border-[#E8E2D5] justify-start ${
            isRight ? "md:justify-end" : "md:justify-start"
          }`}
        >
          {onEditEvent && (
            <button
              type="button"
              onClick={() => onEditEvent(event)}
              className="p-1 rounded text-stone-500 hover:text-stone-900"
              title="Edit milestone"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          {onDeleteEvent && (
            <button
              type="button"
              onClick={() => onDeleteEvent(event.id)}
              className="p-1 rounded text-stone-500 hover:text-rose-700"
              title="Delete milestone"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function EventThumbnail({
  media,
  eventLabel,
  onClick,
}: {
  media: ArchivalMedia;
  eventLabel: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={`Click to zoom ${media.mediaType === "newspaper" ? "clipping" : "photo"}`}
      className="group relative w-full h-48 sm:h-56 rounded-xl overflow-hidden border border-[#E8E2D5] bg-white cursor-pointer shadow-xs hover:shadow-md transition-all duration-200 block text-left"
    >
      <Image
        src={media.imageUrl}
        alt={media.caption || eventLabel}
        fill
        unoptimized
        className="object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-stone-950/20 group-hover:bg-stone-950/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
        <div className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-xs text-stone-900 text-xs font-serif font-semibold flex items-center gap-1.5 shadow-sm">
          <ZoomIn className="w-3.5 h-3.5 text-[#F43F7A]" />
          <span>Examine Scan</span>
        </div>
      </div>
      {media.caption && (
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-stone-900/80 via-stone-900/40 to-transparent p-2.5 text-[11px] font-serif text-white/95 truncate">
          {media.caption}
        </div>
      )}
    </button>
  );
}
