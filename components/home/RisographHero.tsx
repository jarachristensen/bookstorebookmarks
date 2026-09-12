"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Shuffle, BookOpen, Compass, X, Sparkles, Filter } from "lucide-react";
import { motion } from "framer-motion";

export interface RisographHeroProps {
  totalBookstores: number;
  totalBookmarks: number;
  search: string;
  onSearchChange: (val: string) => void;
  country: string;
  onCountryChange: (val: string) => void;
  countries: string[];
  city: string;
  onCityChange: (val: string) => void;
  cities: string[];
  era: string;
  onEraChange: (val: string) => void;
  eras: { label: string; value: string }[];
  status: "all" | "open" | "historic";
  onStatusChange: (val: "all" | "open" | "historic") => void;
  onShuffle: () => void;
}

export function RisographHero({
  totalBookstores,
  totalBookmarks,
  search,
  onSearchChange,
  country,
  onCountryChange,
  countries,
  city,
  onCityChange,
  cities,
  era,
  onEraChange,
  eras,
  status,
  onStatusChange,
  onShuffle,
}: RisographHeroProps) {
  const hasActiveFilters = search !== "" || country !== "all" || city !== "all" || era !== "all" || status !== "all";

  const handleResetFilters = () => {
    onSearchChange("");
    onCountryChange("all");
    onCityChange("all");
    onEraChange("all");
    onStatusChange("all");
  };

  return (
    <section className="relative w-full py-4 sm:py-6 lg:py-8">
      {/* 2-Column Split Hero Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-12 items-center">
        
        {/* Left Column: Bold Duotone Typography, Tagline, Stats & Search/Filter Controls */}
        <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-center space-y-4 sm:space-y-5">
          
          {/* Duotone Masthead Heading */}
          <div className="space-y-1 sm:space-y-2">
            <h1 className="font-serif font-black text-3xl sm:text-5xl md:text-6xl tracking-tight leading-[1.08] select-none">
              <span className="text-[#F43F7A] drop-shadow-[0_1px_1px_rgba(244,63,122,0.25)]">The</span>{" "}
              <span className="text-[#2563EB] drop-shadow-[0_1px_1px_rgba(37,99,235,0.25)]">Bookstore</span>{" "}
              <br className="hidden sm:inline" />
              <span className="text-[#F43F7A] drop-shadow-[0_1px_1px_rgba(244,63,122,0.25)]">Bookmark</span>{" "}
              <span className="text-[#2563EB] drop-shadow-[0_1px_1px_rgba(37,99,235,0.25)]">Archive</span>
            </h1>

            <p className="font-serif italic text-base sm:text-lg md:text-xl text-[#2563EB] max-w-xl font-medium pt-1">
              They saved our place, now there is a place to save them.
            </p>
          </div>

          {/* Curatorial Stats Strip */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1">
            <Link
              href="/bookstores"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E8E2D5] text-xs sm:text-sm font-medium text-stone-700 hover:text-[#F43F7A] hover:border-[#F43F7A] shadow-xs transition-all group"
              title="Browse all cataloged bookstores"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#F43F7A]" />
              <span>
                <strong className="text-stone-900 font-bold group-hover:text-[#F43F7A]">{totalBookstores}</strong> Historic Bookstores ↗
              </span>
            </Link>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E8E2D5] text-xs sm:text-sm font-medium text-stone-700 shadow-xs">
              <Compass className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>
                <strong className="text-stone-900 font-bold">{totalBookmarks}</strong> Cataloged Bookmarks
              </span>
            </div>

            <button
              type="button"
              onClick={onShuffle}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#E8E2D5] text-xs sm:text-sm font-medium text-stone-800 hover:bg-[#FAF8F5] hover:border-[#F43F7A] hover:text-[#F43F7A] shadow-xs transition-all cursor-pointer active:scale-95 ml-auto sm:ml-0"
              title="Shuffle the bookmark spread"
              aria-label="Shuffle Spread"
            >
              <Shuffle className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Shuffle Spread</span>
            </button>
          </div>

          {/* Risograph Search & Filter Toolbar */}
          <div className="space-y-3 pt-2">
            {/* Search Input Bar */}
            <div className="relative flex items-center w-full max-w-2xl bg-white rounded-xl border-2 border-[#2563EB]/40 shadow-xs focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/20 transition-all overflow-hidden">
              <div className="pl-3.5 pr-2 flex items-center pointer-events-none text-[#2563EB]">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search archive by bookstore, city, state, or era..."
                aria-label="Search archive"
                className="w-full py-2.5 sm:py-3 pr-3 text-xs sm:text-sm bg-transparent outline-none placeholder:text-stone-400 text-stone-900 font-sans"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="px-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Filter Tag Pills Strip */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1 max-w-3xl text-xs">
              {/* Operating Status Tabs */}
              <div className="inline-flex items-center p-0.5 rounded-lg bg-stone-100/90 border border-stone-200">
                <button
                  type="button"
                  onClick={() => onStatusChange("all")}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium ${
                    status === "all"
                      ? "bg-white text-[#2563EB] font-bold shadow-xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  All Status
                </button>
                <button
                  type="button"
                  onClick={() => onStatusChange("open")}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium ${
                    status === "open"
                      ? "bg-[#10B981] text-white font-bold shadow-xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  Still Open
                </button>
                <button
                  type="button"
                  onClick={() => onStatusChange("historic")}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium ${
                    status === "historic"
                      ? "bg-[#F43F7A] text-white font-bold shadow-xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  Historic Only
                </button>
              </div>

              {/* Country Select Filter */}
              {countries.length > 0 && (
                <select
                  value={country}
                  onChange={(e) => onCountryChange(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-700 font-medium text-xs cursor-pointer hover:border-[#2563EB] outline-none"
                  aria-label="Filter by country"
                >
                  <option value="all">All Countries</option>
                  {countries.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}

              {/* City Select Filter */}
              {cities.length > 0 && (
                <select
                  value={city}
                  onChange={(e) => onCityChange(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-700 font-medium text-xs cursor-pointer hover:border-[#2563EB] outline-none"
                  aria-label="Filter by city"
                >
                  <option value="all">All Cities</option>
                  {cities.map((ct) => (
                    <option key={ct} value={ct}>
                      {ct}
                    </option>
                  ))}
                </select>
              )}

              {/* Eras Filter Select */}
              {eras.length > 0 && (
                <select
                  value={era}
                  onChange={(e) => onEraChange(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-700 font-medium text-xs cursor-pointer hover:border-[#2563EB] outline-none"
                  aria-label="Filter by era"
                >
                  {eras.map((er) => (
                    <option key={er.value} value={er.value}>
                      {er.label}
                    </option>
                  ))}
                </select>
              )}

              {/* Clear All Filters Button */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-[#F43F7A] hover:bg-[#F43F7A]/10 border border-[#F43F7A]/30 transition-all cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Illustrated Hand Holding Fan of Bookmarks Artwork */}
        <div className="lg:col-span-5 xl:col-span-5 flex items-center justify-center lg:justify-end">
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.25 } }}
            className="relative w-full max-w-[270px] xs:max-w-[340px] sm:max-w-[380px] lg:max-w-[430px] xl:max-w-[500px] flex items-center justify-center select-none"
          >
            {/* Subtle Risograph Ambient Glow behind artwork */}
            <div className="absolute inset-2 bg-gradient-to-tr from-[#F43F7A]/20 via-[#F59E0B]/15 to-[#2563EB]/20 rounded-full blur-3xl pointer-events-none -z-10" />

            <div className="relative w-full aspect-[674/708] drop-shadow-[0_16px_36px_rgba(24,24,27,0.16)]">
              <Image
                src="/images/risograph-hero.png"
                alt="The Bookstore Bookmark Archive — Illustrated hand fanning colorful bookmarks"
                fill
                sizes="(max-width: 640px) 270px, (max-width: 1024px) 380px, 500px"
                className="object-contain"
                priority
              />
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
