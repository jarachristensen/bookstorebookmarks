"use client";

import React, { useMemo } from "react";
import { BookstoreWithDetails } from "@/lib/db/queries";
import { BookstoreLocation } from "@/db/schema";
import { Store, Sparkles, MapPin, Newspaper, Trophy, Flag, AlertCircle } from "lucide-react";

export interface TimelineEvent {
  id: string;
  year: number;
  label: string;
  description: string;
  type: "opening" | "relocation" | "closure" | "press" | "milestone";
}

export interface BookstoreHorizontalTimelineProps {
  bookstore: BookstoreWithDetails;
}

export function BookstoreHorizontalTimeline({ bookstore }: BookstoreHorizontalTimelineProps) {
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

  // Build timeline events dynamically
  const timelineEvents = useMemo(() => {
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
    });

    // 2. Multi-Location / Relocation Events
    parsedLocations.forEach((loc, idx) => {
      if (idx === 0) return; // already counted in founding

      // Extract year from yearsActive e.g. "1956–1970" or "1968"
      const yearMatch = loc.yearsActive?.match(/\b(18\d{2}|19\d{2}|20\d{2})\b/);
      const year = yearMatch ? parseInt(yearMatch[0], 10) : bookstore.yearOpened + idx * 5;

      const isBranch = loc.label.toLowerCase().includes("branch") || loc.label.toLowerCase().includes("new location");
      const label = isBranch ? "New Branch Opened" : `Relocated (${loc.label})`;

      events.push({
        id: `ev-loc-${loc.id || idx}`,
        year: year,
        label: label,
        description: loc.streetAddress ? `${loc.streetAddress}` : loc.label,
        type: "relocation",
      });

      // If moved from previous location, record moving closure if end year is present
      if (loc.isMovedFrom && loc.yearsActive) {
        const endYearMatch = loc.yearsActive.match(/–\s*(\d{4})/);
        if (endYearMatch) {
          events.push({
            id: `ev-loc-moved-${loc.id || idx}`,
            year: parseInt(endYearMatch[1], 10),
            label: "Location Closed / Moved",
            description: `${loc.streetAddress || loc.label} address vacated`,
            type: "relocation",
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
          // Only add if not duplicate year with same description
          const pub = media.sourcePublication || "Press Clipping";
          const desc = media.caption && !media.caption.toLowerCase().startsWith("untitled")
            ? media.caption
            : `Featured in ${pub}`;

          events.push({
            id: `ev-media-${media.id || idx}`,
            year: year,
            label: pub,
            description: desc,
            type: "press",
          });
        }
      }
    });

    // 4. Trivia Milestones with Dates
    triviaList.forEach((t, idx) => {
      const yearMatch = t.match(/\b(18\d{2}|19\d{2}|20\d{2})\b/);
      if (yearMatch) {
        const year = parseInt(yearMatch[0], 10);
        events.push({
          id: `ev-trivia-${idx}`,
          year: year,
          label: "Historical Milestone",
          description: t.replace(/\b(18\d{2}|19\d{2}|20\d{2})\b[:\s-]*/, "").trim(),
          type: "milestone",
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
      });
    }

    // Sort chronologically by year
    return events.sort((a, b) => a.year - b.year);
  }, [bookstore, parsedLocations, triviaList]);

  // Founding location string
  const grandOpeningAddress =
    parsedLocations[0]?.streetAddress || bookstore.streetAddress || `${bookstore.city}, ${bookstore.country}`;

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-white border border-parchment-border shadow-xs overflow-hidden">
      <div className="overflow-x-auto pb-4 pt-2">
        <div className="min-w-[760px] flex items-center gap-6 py-6 px-4">
          {/* Left Anchor: Grand Opening Stamp */}
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

          {/* Horizontal Timeline Rail with Alternating Stalks */}
          <div className="flex-1 relative flex items-center min-h-[190px]">
            {/* Center Axis Line */}
            <div className="absolute left-0 right-0 h-[3px] bg-stone-900 rounded-full top-1/2 -translate-y-1/2 z-0" />

            {/* Milestones Track */}
            <div className="relative z-10 w-full flex items-center justify-between gap-4">
              {timelineEvents.map((ev, index) => {
                const isTop = index % 2 === 0;

                return (
                  <div
                    key={ev.id}
                    className="flex-1 flex flex-col items-center relative text-center min-w-[100px] max-w-[140px]"
                  >
                    {/* Top Content (Even Index) */}
                    {isTop ? (
                      <div className="mb-2 flex flex-col items-center justify-end h-[68px]">
                        <p className="font-serif text-[11px] text-stone-900 font-semibold leading-tight line-clamp-2">
                          {ev.description || ev.label}
                        </p>
                        {/* Stalk down to axis */}
                        <div className="w-[2px] h-4 bg-stone-900 mt-1" />
                      </div>
                    ) : (
                      <div className="h-[68px]" />
                    )}

                    {/* Milestone Node on Center Rail */}
                    <div className="flex flex-col items-center justify-center my-[-4px]">
                      <div className="w-3.5 h-3.5 rounded-full bg-stone-900 border-2 border-white shadow-xs" />
                      <span className="font-serif font-bold text-xs text-stone-900 mt-1 tracking-tight">
                        {ev.year}
                      </span>
                    </div>

                    {/* Bottom Content (Odd Index) */}
                    {!isTop ? (
                      <div className="mt-2 flex flex-col items-center justify-start h-[68px]">
                        {/* Stalk up to axis */}
                        <div className="w-[2px] h-4 bg-stone-900 mb-1" />
                        <p className="font-serif text-[11px] text-stone-900 font-semibold leading-tight line-clamp-2">
                          {ev.description || ev.label}
                        </p>
                      </div>
                    ) : (
                      <div className="h-[68px]" />
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
