"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookstoreWithDetails } from "@/lib/db/queries";
import { getMostRecentStorefrontMedia } from "@/lib/utils/clipping-parser";
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
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const countries = useMemo(() => {
    const set = new Set<string>();
    bookstores.forEach((s) => {
      if (s.country) set.add(s.country);
    });
    return Array.from(set).sort();
  }, [bookstores]);

  const cities = useMemo(() => {
    const set = new Set<string>();
    bookstores.forEach((s) => {
      if (selectedCountry === "all" || s.country?.toLowerCase() === selectedCountry.toLowerCase()) {
        if (s.city) set.add(s.city);
      }
    });
    return Array.from(set).sort();
  }, [bookstores, selectedCountry]);

  const filteredBookstores = useMemo(() => {
    return bookstores.filter((store) => {
      if (selectedCountry !== "all" && store.country?.toLowerCase() !== selectedCountry.toLowerCase()) {
        return false;
      }
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
        const matchesCountry = store.country?.toLowerCase().includes(q);
        const matchesBlurb = store.historicalBlurb.toLowerCase().includes(q);
        const matchesFounders = store.founders?.toLowerCase().includes(q);
        return matchesName || matchesCity || matchesCountry || matchesBlurb || matchesFounders;
      }
      return true;
    });
  }, [bookstores, search, selectedCountry, selectedCity, selectedStatus]);

  return (
    <div className="space-y-8">
      {/* Search and Filters Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs flex flex-col md:flex-row items-center gap-4">
        {/* Search Input */}
        <div className="relative w-full md:flex-1">
          <input
            type="text"
            placeholder="Search bookstores by name, city, country, founders, or history..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-[#FAF8F5] border border-[#E8E2D5] rounded-xl text-stone-900 font-sans focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 placeholder:text-stone-400 transition-all"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Country Filter */}
          {countries.length > 0 && (
            <select
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setSelectedCity("all");
              }}
              className="px-3 py-2 text-xs font-sans bg-white border border-[#E8E2D5] rounded-xl text-stone-700 focus:outline-none focus:border-[#2563EB] cursor-pointer hover:border-stone-400"
            >
              <option value="all">All Countries</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          )}

          {/* City Filter */}
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-3 py-2 text-xs font-sans bg-white border border-[#E8E2D5] rounded-xl text-stone-700 focus:outline-none focus:border-[#2563EB] cursor-pointer hover:border-stone-400"
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
            className="px-3 py-2 text-xs font-sans bg-white border border-[#E8E2D5] rounded-xl text-stone-700 focus:outline-none focus:border-[#2563EB] cursor-pointer hover:border-stone-400"
          >
            <option value="all">All Statuses</option>
            <option value="open">Still Operating</option>
            <option value="historic">Permanently Closed</option>
          </select>
        </div>
      </div>

      {/* Grid of Bookstore Cards */}
      {filteredBookstores.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#E8E2D5] space-y-3">
          <Building2 className="w-10 h-10 text-stone-400 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-stone-900">No historic bookstores found</h3>
          <p className="font-sans text-xs text-stone-600">
            Try adjusting your search terms or clearing your filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookstores.map((store) => {
            // Find most recent storefront photo, or fallback to first media or first bookmark front
            const storefrontMedia = getMostRecentStorefrontMedia(store.archivalMedia);

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
                className="group flex flex-col rounded-2xl bg-white border border-[#E8E2D5] hover:border-[#F43F7A]/60 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200"
              >
                {/* Storefront Hero Thumbnail Banner */}
                <div className="relative w-full aspect-[16/9] bg-stone-100 overflow-hidden border-b border-[#E8E2D5]">
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
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#10B981] text-white shadow-xs">
                        STILL OPERATING
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F43F7A] text-white shadow-xs">
                        {store.yearClosed ? `CLOSED (${store.yearClosed})` : "CLOSED"}
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                    <h3 className="font-serif text-lg font-bold truncate drop-shadow-sm group-hover:text-amber-200 transition-colors">
                      {store.name}
                    </h3>
                    <p className="text-xs font-sans flex items-center gap-1 text-stone-200 drop-shadow-xs">
                      <MapPin className="w-3 h-3 text-[#F59E0B]" />
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
                    <div className="flex items-center justify-between text-xs font-sans text-stone-600">
                      <span className="flex items-center gap-1 font-serif">
                        <Calendar className="w-3.5 h-3.5 text-[#F43F7A]" />
                        <span>
                          {store.yearOpened}–{store.isStillOperating ? "Present" : store.yearClosed || "Closed"}
                        </span>
                      </span>

                      <div className="flex items-center gap-2">
                        <span
                          className="inline-flex items-center gap-1 text-[11px] font-mono text-[#F43F7A] bg-[#F43F7A]/10 px-2 py-0.5 rounded border border-[#F43F7A]/20"
                          title="Cataloged Bookmarks"
                        >
                          <Bookmark className="w-3 h-3" />
                          <span>{store.bookmarks.length}</span>
                        </span>

                        {store.archivalMedia.length > 0 && (
                          <span
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-[#2563EB] bg-[#2563EB]/10 px-2 py-0.5 rounded border border-[#2563EB]/20"
                            title="Archival Photos & Press Clippings"
                          >
                            <Newspaper className="w-3 h-3" />
                            <span>{store.archivalMedia.length}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Blurb Snippet */}
                    <p className="font-sans text-xs text-stone-600 line-clamp-3 leading-relaxed">
                      {store.historicalBlurb.replace(/^#+\s+/gm, "").slice(0, 140)}...
                    </p>
                  </div>

                  {/* Footer Specialties & CTA */}
                  <div className="pt-3 border-t border-[#E8E2D5]/70 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {parsedSpecialties.slice(0, 2).map((s) => (
                        <span
                          key={s}
                          className="text-[10px] font-sans bg-[#FAF8F5] text-stone-700 px-2 py-0.5 rounded border border-[#E8E2D5]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-serif font-bold text-[#F43F7A] group-hover:underline shrink-0">
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
