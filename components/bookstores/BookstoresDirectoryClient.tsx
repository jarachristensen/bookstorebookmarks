"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookstoreWithDetails } from "@/lib/db/queries";
import {
  Building2,
  MapPin,
  Calendar,
  Bookmark,
  Newspaper,
  Search,
  ArrowUpRight,
  Sparkles,
  Store,
} from "lucide-react";

export interface BookstoresDirectoryClientProps {
  bookstores: BookstoreWithDetails[];
}

export function BookstoresDirectoryClient({ bookstores }: BookstoresDirectoryClientProps) {
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const cities = useMemo(() => {
    const set = new Set<string>();
    bookstores.forEach((s) => {
      if (s.city) set.add(s.city);
    });
    return Array.from(set).sort();
  }, [bookstores]);

  const filteredBookstores = useMemo(() => {
    return bookstores.filter((store) => {
      if (selectedCity !== "all" && store.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }
      if (selectedStatus === "open" && !store.isStillOperating) {
        return false;
      }
      if (selectedStatus === "historic" && store.isStillOperating) {
        return false;
      }
      if (search.trim() !== "") {
        const q = search.toLowerCase();
        const matchesName = store.name.toLowerCase().includes(q);
        const matchesCity = store.city.toLowerCase().includes(q);
        const matchesBlurb = store.historicalBlurb.toLowerCase().includes(q);
        const matchesFounders = store.founders?.toLowerCase().includes(q);
        return matchesName || matchesCity || matchesBlurb || matchesFounders;
      }
      return true;
    });
  }, [bookstores, search, selectedCity, selectedStatus]);

  return (
    <div className="space-y-8">
      {/* Search and Filters Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-parchment-border shadow-xs flex flex-col md:flex-row items-center gap-4">
        {/* Search Input */}
        <div className="relative w-full md:flex-1">
          <input
            type="text"
            placeholder="Search bookstores by name, city, founders, or history..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 text-sm bg-parchment-light border border-parchment-border rounded-xl text-ink font-serif focus:outline-none focus:border-archival-oxblood placeholder:text-ink-muted/70"
          />
        </div>

        {/* City Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full md:w-auto px-3 py-2 text-xs font-serif bg-white border border-parchment-border rounded-xl text-ink focus:outline-none"
          >
            <option value="all">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full md:w-auto px-3 py-2 text-xs font-serif bg-white border border-parchment-border rounded-xl text-ink focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="open">Still Open</option>
            <option value="historic">Closed Bookstores</option>
          </select>
        </div>
      </div>

      {/* Grid of Bookstore Cards */}
      {filteredBookstores.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-parchment-border space-y-3">
          <Building2 className="w-10 h-10 text-ink-muted/50 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-ink">No historic bookstores found</h3>
          <p className="font-serif text-xs text-ink-muted">
            Try adjusting your search terms or clearing your city filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookstores.map((store) => {
            // Find storefront photo, or fallback to first photo or first bookmark front
            const storefrontMedia =
              store.archivalMedia.find((m) => m.isStorefront) ||
              store.archivalMedia.find((m) => m.mediaType === "photo") ||
              store.archivalMedia[0];

            const heroImage =
              storefrontMedia?.imageUrl ||
              store.bookmarks[0]?.frontImageUrl ||
              "/seed-images/gotham-front.svg";

            let parsedSpecialties: string[] = [];
            try {
              if (store.specialties) parsedSpecialties = JSON.parse(store.specialties);
            } catch {}

            return (
              <Link
                key={store.id}
                href={`/bookstores/${store.id}`}
                className="group flex flex-col rounded-2xl bg-white border border-parchment-border hover:border-archival-amber overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200"
              >
                {/* Storefront Hero Thumbnail Banner */}
                <div className="relative w-full aspect-[16/9] bg-stone-100 overflow-hidden border-b border-parchment-border">
                  <Image
                    src={heroImage}
                    alt={store.name}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                  {/* Badges on Hero Banner */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    {store.isStillOperating ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-600 text-white shadow-xs">
                        STILL OPEN
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-stone-900/90 text-stone-200 shadow-xs">
                        {store.yearClosed ? `CLOSED (${store.yearClosed})` : "CLOSED"}
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                    <h3 className="font-serif text-lg font-bold truncate drop-shadow-sm group-hover:text-amber-200 transition-colors">
                      {store.name}
                    </h3>
                    <p className="text-xs font-serif flex items-center gap-1 text-stone-200 drop-shadow-xs">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      <span>
                        {store.city}
                        {store.stateProvince ? `, ${store.stateProvince}` : ""},{" "}
                        {store.country}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  {/* Years and Metrics */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-serif text-ink-muted">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-archival-oxblood" />
                        <span>
                          {store.yearOpened}–{store.isStillOperating ? "Present" : store.yearClosed || "Closed"}
                        </span>
                      </span>

                      <div className="flex items-center gap-2">
                        <span
                          className="inline-flex items-center gap-1 text-[11px] font-mono text-archival-oxblood bg-rose-50 px-2 py-0.5 rounded border border-rose-200"
                          title="Cataloged Bookmarks"
                        >
                          <Bookmark className="w-3 h-3" />
                          <span>{store.bookmarks.length}</span>
                        </span>

                        {store.archivalMedia.length > 0 && (
                          <span
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-archival-spruce bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                            title="Archival Photos & Press Clippings"
                          >
                            <Newspaper className="w-3 h-3" />
                            <span>{store.archivalMedia.length}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Blurb Snippet */}
                    <p className="font-serif text-xs text-ink-light line-clamp-3 leading-relaxed">
                      {store.historicalBlurb.replace(/^#+\s+/gm, "").slice(0, 140)}...
                    </p>
                  </div>

                  {/* Footer Specialties & CTA */}
                  <div className="pt-3 border-t border-parchment-border/60 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {parsedSpecialties.slice(0, 2).map((s) => (
                        <span
                          key={s}
                          className="text-[10px] font-serif bg-parchment-light text-ink-light px-2 py-0.5 rounded border border-parchment-border"
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-serif font-bold text-archival-oxblood group-hover:underline shrink-0">
                      <span>View Dossier</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
