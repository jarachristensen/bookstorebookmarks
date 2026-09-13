"use client";

import React from "react";
import Image from "next/image";
import { Search, Shuffle, X } from "lucide-react";
import { motion } from "framer-motion";

export interface RisographHeroProps {
  totalBookstores: number;
  totalBookmarks: number;
  search: string;
  onSearchChange: (val: string) => void;
  country: string;
  onCountryChange: (val: string) => void;
  countries: string[];
  state: string;
  onStateChange: (val: string) => void;
  states: string[];
  city: string;
  onCityChange: (val: string) => void;
  cities: string[];
  era?: string;
  onEraChange?: (val: string) => void;
  eras?: { label: string; value: string }[];
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
  state,
  onStateChange,
  states,
  city,
  onCityChange,
  cities,
  era = "all",
  onEraChange,
  eras = [],
  status,
  onStatusChange,
  onShuffle,
}: RisographHeroProps) {
  const hasActiveFilters =
    search !== "" ||
    country !== "all" ||
    state !== "all" ||
    city !== "all" ||
    status !== "all";

  const handleResetFilters = () => {
    onSearchChange("");
    onCountryChange("all");
    onStateChange("all");
    onCityChange("all");
    if (onEraChange) onEraChange("all");
    onStatusChange("all");
  };

  return (
    <section className="relative w-full pt-2 sm:pt-4 pb-1 space-y-3 sm:space-y-4">
      {/* 1. Header Banner Illustration (Responsive: Mobile-specific square, Desktop panoramic) */}
      <div className="w-full flex flex-col items-center">
        <h1 className="sr-only">The Bookstore Bookmark Archive</h1>
        
        {/* Mobile Banner (< sm screens) */}
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative w-full max-w-[340px] xs:max-w-[400px] aspect-square select-none sm:hidden"
        >
          <Image
            src="/images/risograph-banner-mobile.png"
            alt="The Bookstore Bookmark Archive — Illustrated bookmarks and archive masthead"
            fill
            unoptimized
            priority
            className="object-contain object-center w-full h-full"
          />
        </motion.div>

        {/* Desktop & Tablet Panoramic Banner (sm+ screens) */}
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative w-full aspect-[6249/1838] select-none hidden sm:block"
        >
          <Image
            src="/images/risograph-banner.png"
            alt="The Bookstore Bookmark Archive — Illustrated bookmarks and archive masthead"
            fill
            unoptimized
            priority
            className="object-contain object-center w-full h-full"
          />
        </motion.div>

        {/* Tagline (All the way to the left & staggered in sans-serif) */}
        <div className="w-full px-1 sm:px-2 pt-2 text-left font-sans text-[#2563EB]">
          <p className="text-sm sm:text-base md:text-lg font-medium tracking-tight text-[#2563EB]">
            They saved our place -
          </p>
          <p className="text-sm sm:text-base md:text-lg font-medium tracking-tight text-[#2563EB] pl-8 sm:pl-16 md:pl-24 italic">
            now, let's save theirs.
          </p>
        </div>
      </div>

      {/* 2. Search & Filter Controls Toolbar */}
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center space-y-3 pt-1">
        {/* Search Input Bar */}
        <div className="relative flex items-center w-full max-w-2xl bg-white rounded-xl border-2 border-[#2563EB]/40 shadow-xs focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/20 transition-all overflow-hidden">
          <div className="pl-3.5 pr-2 flex items-center pointer-events-none text-[#2563EB]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search archive by bookstore, city, or state..."
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
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-1 w-full text-xs">
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
              Permanently Closed
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

          {/* State Select Filter */}
          {states.length > 0 && (
            <select
              value={state}
              onChange={(e) => onStateChange(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-700 font-medium text-xs cursor-pointer hover:border-[#2563EB] outline-none"
              aria-label="Filter by state"
            >
              <option value="all">All States</option>
              {states.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          )}

          {/* Dynamic City Select Filter (shown when a state is selected) */}
          {state !== "all" && cities.length > 0 && (
            <select
              value={city}
              onChange={(e) => onCityChange(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-[#2563EB]/40 text-stone-700 font-medium text-xs cursor-pointer hover:border-[#2563EB] outline-none animate-in fade-in duration-200"
              aria-label="Filter by city"
            >
              <option value="all">All Cities in {state}</option>
              {cities.map((ct) => (
                <option key={ct} value={ct}>
                  {ct}
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

        {/* Shuffle Spread Button (Underneath dropdowns, above bookmarks) */}
        <div className="pt-1">
          <button
            type="button"
            onClick={onShuffle}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#E8E2D5] text-xs sm:text-sm font-medium text-stone-800 hover:bg-[#FAF8F5] hover:border-[#F43F7A] hover:text-[#F43F7A] shadow-xs transition-all cursor-pointer active:scale-95 group"
            title="Shuffle the bookmark spread"
            aria-label="Shuffle Spread"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#F59E0B] group-hover:rotate-45 transition-transform" />
            <span>Shuffle Spread</span>
          </button>
        </div>
      </div>
    </section>
  );
}
