"use client";

import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";
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
    // If customEvents prop is explicitly provided, ALWAYS respect it (even if empty)!
    const sourceList =
      customEvents !== undefined
        ? customEvents
        : storedCustomEvents && storedCustomEvents.length > 0
        ? storedCustomEvents
        : null;

    if (sourceList !== null) {
      return sourceList
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

  const containerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [svgPath, setSvgPath] = useState<string>("");

  const updateSvgPath = useCallback(() => {
    if (!containerRef.current) return;
    const contRect = containerRef.current.getBoundingClientRect();
    const contWidth = contRect.width || 800;

    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;

    const dots: { x: number; y: number }[] = [];
    const rows: { top: number; bottom: number }[] = [];

    for (let i = 0; i < timelineEvents.length; i++) {
      const dotEl = dotRefs.current[i];
      const rowEl = rowRefs.current[i];

      if (dotEl && contRect.width > 0) {
        const dRect = dotEl.getBoundingClientRect();
        dots.push({
          x: dRect.left + dRect.width / 2 - contRect.left,
          y: dRect.top + dRect.height / 2 - contRect.top,
        });
      } else {
        const defaultX = isDesktop
          ? i % 2 === 0
            ? contWidth * 0.6
            : contWidth * 0.4
          : 24;
        dots.push({ x: defaultX, y: 70 + i * 260 });
      }

      if (rowEl && contRect.width > 0) {
        const rRect = rowEl.getBoundingClientRect();
        rows.push({
          top: rRect.top - contRect.top,
          bottom: rRect.bottom - contRect.top,
        });
      } else {
        rows.push({
          top: 30 + i * 260,
          bottom: 230 + i * 260,
        });
      }
    }

    if (dots.length === 0) {
      setSvgPath("");
      return;
    }

    // Top vertical entry from 0 down to first dot
    let d = `M ${dots[0].x} 0 L ${dots[0].x} ${dots[0].y}`;

    for (let i = 0; i < dots.length - 1; i++) {
      const p1 = dots[i];
      const p2 = dots[i + 1];

      if (Math.abs(p1.x - p2.x) < 8) {
        // Straight line down (mobile or same column)
        d += ` L ${p2.x} ${p2.y}`;
      } else {
        // Serpentine zig-zag S-curve
        const rowBottom = rows[i]?.bottom ?? p1.y + 60;
        const nextRowTop = rows[i + 1]?.top ?? p2.y - 60;
        const midY = (rowBottom + nextRowTop) / 2;
        const yTurn = Math.max(p1.y + 24, Math.min(p2.y - 24, midY));

        const dir = p2.x > p1.x ? 1 : -1;
        const maxR = Math.min(
          24,
          Math.abs(p2.x - p1.x) / 2,
          Math.abs(yTurn - p1.y) / 2,
          Math.abs(p2.y - yTurn) / 2
        );
        const R = Math.max(6, maxR);

        // Vertical down to corner 1
        d += ` L ${p1.x} ${yTurn - R}`;
        // Corner 1: curve from vertical to horizontal
        d += ` Q ${p1.x} ${yTurn}, ${p1.x + dir * R} ${yTurn}`;
        // Horizontal cross-over
        d += ` L ${p2.x - dir * R} ${yTurn}`;
        // Corner 2: curve from horizontal to vertical down
        d += ` Q ${p2.x} ${yTurn}, ${p2.x} ${yTurn + R}`;
        // Vertical down to next dot
        d += ` L ${p2.x} ${p2.y}`;
      }
    }

    // Terminate past the last event
    const lastDot = dots[dots.length - 1];
    const lastRow = rows[rows.length - 1];
    const endY = Math.max(lastDot.y + 40, (lastRow?.bottom ?? lastDot.y) + 24);
    d += ` L ${lastDot.x} ${endY}`;

    setSvgPath(d);
  }, [timelineEvents]);

  useEffect(() => {
    updateSvgPath();

    const handleResize = () => {
      updateSvgPath();
    };

    window.addEventListener("resize", handleResize);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && containerRef.current) {
      observer = new ResizeObserver(() => {
        updateSvgPath();
      });
      observer.observe(containerRef.current);
    }

    const timer = setTimeout(updateSvgPath, 150);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (observer) observer.disconnect();
      clearTimeout(timer);
    };
  }, [updateSvgPath]);

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
      <div ref={containerRef} className="relative max-w-4xl mx-auto px-4 pb-8">
        {/* Continuous Serpentine SVG Line */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          data-testid="serpentine-svg"
        >
          <path
            d={svgPath}
            fill="none"
            stroke="#292524"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {timelineEvents.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-[#E8E2D5] rounded-xl text-center space-y-2 bg-[#FAF8F5]">
            <Calendar className="w-8 h-8 text-stone-400 mx-auto" />
            <div className="font-serif font-bold text-stone-800 text-sm">
              No Timeline Milestones
            </div>
            <p className="text-xs font-serif text-stone-500 max-w-sm mx-auto">
              No milestones currently on the timeline. Click &ldquo;Add an Event&rdquo; above or check &ldquo;Add to Timeline&rdquo; on any archival clipping to add milestones.
            </p>
          </div>
        ) : (
          <div className="space-y-12 md:space-y-20 relative z-10">
          {timelineEvents.map((event, index) => {
            const isEven = index % 2 === 0;
            const hasMedia = Boolean(event.media && event.media.imageUrl);

            return (
              <div
                key={event.id}
                ref={(el) => {
                  rowRefs.current[index] = el;
                }}
                className="relative pl-12 md:pl-0"
              >
                {/* Milestone Node Dot */}
                <div
                  ref={(el) => {
                    dotRefs.current[index] = el;
                  }}
                  className={`absolute top-6 z-20 flex items-center justify-center -translate-x-1/2 left-6 ${
                    isEven ? "md:left-[60%]" : "md:left-[40%]"
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-stone-900 border-2 border-[#FAF8F5] shadow-xs flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FAF8F5]" />
                  </div>
                </div>

                {hasMedia ? (
                  isEven ? (
                    /* Even Index (Event 1, 3, 5...): Dot at 60%, Text on Left (54%), Media on Right (38%) */
                    <div className="flex flex-col md:flex-row items-start justify-between gap-6 md:gap-0">
                      {/* Left: Text Card */}
                      <div className="w-full md:w-[54%] md:pr-8">
                        <EventCardContent
                          event={event}
                          align="right"
                          isEditable={isEditable}
                          onEditEvent={onEditEvent}
                          onDeleteEvent={onDeleteEvent}
                          getTypeIcon={getTypeIcon}
                        />
                      </div>

                      {/* Right: Media Thumbnail */}
                      <div className="w-full md:w-[38%] md:ml-auto">
                        <EventThumbnail
                          media={event.media!}
                          eventLabel={event.label}
                          onClick={() => handleMediaClick(event.media!)}
                        />
                      </div>
                    </div>
                  ) : (
                    /* Odd Index (Event 2, 4, 6...): Dot at 40%, Media on Left (38%), Text on Right (54%) */
                    <div className="flex flex-col-reverse md:flex-row items-start justify-between gap-6 md:gap-0">
                      {/* Left: Media Thumbnail */}
                      <div className="w-full md:w-[38%]">
                        <EventThumbnail
                          media={event.media!}
                          eventLabel={event.label}
                          onClick={() => handleMediaClick(event.media!)}
                        />
                      </div>

                      {/* Right: Text Card */}
                      <div className="w-full md:w-[54%] md:ml-auto md:pl-8">
                        <EventCardContent
                          event={event}
                          align="left"
                          isEditable={isEditable}
                          onEditEvent={onEditEvent}
                          onDeleteEvent={onDeleteEvent}
                          getTypeIcon={getTypeIcon}
                        />
                      </div>
                    </div>
                  )
                ) : (
                  /* Event Without Media */
                  <div
                    className={`w-full ${
                      isEven
                        ? "md:w-[54%] md:pr-8"
                        : "md:w-[54%] md:ml-auto md:pl-8"
                    }`}
                  >
                    <EventCardContent
                      event={event}
                      align={isEven ? "right" : "left"}
                      isEditable={isEditable}
                      onEditEvent={onEditEvent}
                      onDeleteEvent={onDeleteEvent}
                      getTypeIcon={getTypeIcon}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        )}

        {/* Antique Broadside Bottom Rule */}
        <div className="border-b-2 border-stone-800 mt-14 max-w-4xl mx-auto" />
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
