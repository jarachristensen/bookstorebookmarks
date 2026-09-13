"use client";

import React from "react";
import { Search, ChevronLeft, ChevronRight, Dices, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface TrayControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  search: string;
  onSearchChange: (val: string) => void;
  country?: string;
  onCountryChange?: (val: string) => void;
  countries?: string[];
  state?: string;
  onStateChange?: (val: string) => void;
  states?: string[];
  city: string;
  onCityChange: (val: string) => void;
  cities: string[];
  era?: string;
  onEraChange?: (val: string) => void;
  eras?: { label: string; value: string }[];
  status: "all" | "open" | "historic";
  onStatusChange: (val: "all" | "open" | "historic") => void;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  onShuffle?: () => void;
}

export function TrayControls({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  search,
  onSearchChange,
  country = "all",
  onCountryChange,
  countries = [],
  state = "all",
  onStateChange,
  states = [],
  city,
  onCityChange,
  cities,
  era = "all",
  onEraChange,
  eras = [],
  status,
  onStatusChange,
  onPrevPage,
  onNextPage,
  onShuffle,
}: TrayControlsProps) {
  // Convert integer to Roman Numeral for curator feel
  const toRoman = (num: number): string => {
    const romanMap: [number, string][] = [
      [10, "X"],
      [9, "IX"],
      [5, "V"],
      [4, "IV"],
      [1, "I"],
    ];
    let result = "";
    let n = num;
    for (const [val, letter] of romanMap) {
      while (n >= val) {
        result += letter;
        n -= val;
      }
    }
    return result || "I";
  };

  const hasActiveFilters =
    search !== "" ||
    (country !== "all" && onCountryChange) ||
    (state !== "all" && onStateChange) ||
    city !== "all" ||
    status !== "all";

  const clearFilters = () => {
    onSearchChange("");
    if (onCountryChange) onCountryChange("all");
    if (onStateChange) onStateChange("all");
    onCityChange("all");
    if (onEraChange) onEraChange("all");
    onStatusChange("all");
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-3.5 rounded-xl bg-white/90 backdrop-blur-md border border-[#E8E2D5] shadow-xs">
        {/* Search Input without magnifying glass icon */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search bookmark, bookstore, city, state, country..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-[#FAF8F5] border border-[#E8E2D5] rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all font-serif"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-900"
            >
              ✕
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Country Filter */}
          {countries.length > 0 && onCountryChange && (
            <select
              value={country}
              onChange={(e) => onCountryChange(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm bg-[#FAF8F5] border border-[#E8E2D5] rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] cursor-pointer font-serif"
            >
              <option value="all">All Countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          {/* State Filter */}
          {states.length > 0 && onStateChange && (
            <select
              value={state}
              onChange={(e) => onStateChange(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm bg-[#FAF8F5] border border-[#E8E2D5] rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] cursor-pointer font-serif"
            >
              <option value="all">All States</option>
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}

          {/* City Filter (shown when state is selected or when onStateChange is not used) */}
          {((state !== "all" && cities.length > 0) || !onStateChange) && (
            <select
              value={city}
              onChange={(e) => onCityChange(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm bg-[#FAF8F5] border border-[#2563EB]/40 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] cursor-pointer font-serif animate-in fade-in duration-200"
            >
              <option value="all">
                {state !== "all" ? `All Cities in ${state}` : "All Cities"}
              </option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          {/* Status Buttons */}
          <div className="inline-flex rounded-lg border border-[#E8E2D5] p-0.5 bg-[#FAF8F5] text-xs font-serif">
            <button
              type="button"
              onClick={() => onStatusChange("all")}
              className={`px-2.5 py-1.5 rounded-md transition-all ${
                status === "all"
                  ? "bg-white text-stone-900 font-semibold shadow-xs"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => onStatusChange("open")}
              className={`px-2.5 py-1.5 rounded-md transition-all ${
                status === "open"
                  ? "bg-[#10B981]/15 text-[#10B981] font-semibold shadow-xs"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              Operating
            </button>
            <button
              type="button"
              onClick={() => onStatusChange("historic")}
              className={`px-2.5 py-1.5 rounded-md transition-all ${
                status === "historic"
                  ? "bg-[#F43F7A]/15 text-[#F43F7A] font-semibold shadow-xs"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              Permanently Closed
            </button>
          </div>

          {/* Clear Filters Reset Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#F43F7A] hover:underline font-serif cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Archive Count & Randomize Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-1">
        <div className="flex items-center gap-2">
          {totalPages > 1 && (
            <span className="font-serif font-bold text-lg text-stone-900">
              Tray {toRoman(currentPage)} of {toRoman(Math.max(totalPages, 1))} ·{" "}
            </span>
          )}
          <span className="text-xs sm:text-sm font-serif text-stone-600">
            <span className="font-bold text-stone-900">{totalItems}</span> {totalItems === 1 ? "Specimen Bookmark" : "Specimen Bookmarks"} in Archive
          </span>
        </div>

        {/* Page Nav & Randomize Buttons */}
        <div className="flex items-center gap-2.5">
          {onShuffle && (
            <Button
              variant="outline"
              size="sm"
              onClick={onShuffle}
              aria-label="Randomize Tray"
              className="flex items-center gap-1.5 text-xs text-[#F43F7A] border-[#F43F7A]/30 hover:bg-[#F43F7A]/10"
            >
              <Dices className="w-3.5 h-3.5 text-[#F43F7A]" />
              <span>Randomize Order</span>
            </Button>
          )}

          {onPrevPage && onNextPage && totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={onPrevPage}
                disabled={currentPage <= 1}
                aria-label="Previous Tray"
                className="flex items-center gap-1 text-xs border-[#E8E2D5]"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Prev</span>
              </Button>

              <span className="text-xs font-mono px-2.5 py-1.5 rounded-lg bg-white border border-[#E8E2D5] text-stone-900 font-semibold shadow-2xs">
                {currentPage} / {Math.max(totalPages, 1)}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={onNextPage}
                disabled={currentPage >= totalPages}
                aria-label="Next Tray"
                className="flex items-center gap-1 text-xs border-[#E8E2D5]"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
