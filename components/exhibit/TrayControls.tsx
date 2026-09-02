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
  city: string;
  onCityChange: (val: string) => void;
  cities: string[];
  era: string;
  onEraChange: (val: string) => void;
  eras: { label: string; value: string }[];
  status: "all" | "open" | "historic";
  onStatusChange: (val: "all" | "open" | "historic") => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onShuffle?: () => void;
}

export function TrayControls({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  search,
  onSearchChange,
  city,
  onCityChange,
  cities,
  era,
  onEraChange,
  eras,
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
    for (const [val, letter] of romanMap) {
      while (num >= val) {
        result += letter;
        num -= val;
      }
    }
    return result || "I";
  };

  const hasActiveFilters =
    search !== "" || city !== "all" || era !== "all" || status !== "all";

  const clearFilters = () => {
    onSearchChange("");
    onCityChange("all");
    onEraChange("all");
    onStatusChange("all");
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-3.5 rounded-xl bg-white/80 backdrop-blur-md border border-parchment-border shadow-sm">
        {/* Search Input without magnifying glass icon */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search bookmark, bookstore, city..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-parchment-light border border-parchment-border rounded-lg text-ink placeholder:text-ink-muted/60 focus:outline-none focus:ring-2 focus:ring-amber-700/30 focus:border-amber-800 transition-all font-serif"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-muted hover:text-ink"
            >
              ✕
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* City Filter */}
          <select
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm bg-parchment-light border border-parchment-border rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-amber-700/30 cursor-pointer font-serif"
          >
            <option value="all">All Cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Era Filter */}
          <select
            value={era}
            onChange={(e) => onEraChange(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm bg-parchment-light border border-parchment-border rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-amber-700/30 cursor-pointer font-serif"
          >
            {eras.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>

          {/* Status Buttons */}
          <div className="inline-flex rounded-lg border border-parchment-border p-0.5 bg-parchment-muted text-xs font-serif">
            <button
              type="button"
              onClick={() => onStatusChange("all")}
              className={`px-2.5 py-1.5 rounded-md transition-all ${
                status === "all"
                  ? "bg-white text-ink font-semibold shadow-xs"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => onStatusChange("open")}
              className={`px-2.5 py-1.5 rounded-md transition-all ${
                status === "open"
                  ? "bg-emerald-900/10 text-archival-spruce font-semibold shadow-xs"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Open
            </button>
            <button
              type="button"
              onClick={() => onStatusChange("historic")}
              className={`px-2.5 py-1.5 rounded-md transition-all ${
                status === "historic"
                  ? "bg-rose-900/10 text-archival-oxblood font-semibold shadow-xs"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Closed
            </button>
          </div>

          {/* Clear Filters Reset Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-archival-oxblood hover:underline font-serif cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Tray Turning Pagination Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-1">
        <div className="flex items-center gap-2">
          <span className="font-serif font-bold text-lg text-ink">
            Tray {toRoman(currentPage)} of {toRoman(Math.max(totalPages, 1))}
          </span>
          <span className="text-xs font-mono text-ink-muted">
            ({totalItems} {totalItems === 1 ? "specimen" : "specimens"} in archive)
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
              className="flex items-center gap-1.5 text-xs text-archival-oxblood border-archival-oxblood/30 hover:bg-rose-50"
            >
              <Dices className="w-3.5 h-3.5 text-archival-oxblood" />
              <span>Randomize Tray</span>
            </Button>
          )}

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrevPage}
              disabled={currentPage <= 1}
              aria-label="Previous Tray"
              className="flex items-center gap-1 text-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev</span>
            </Button>

            <span className="text-xs font-mono px-2.5 py-1.5 rounded-lg bg-white border border-parchment-border text-ink font-semibold shadow-2xs">
              {currentPage} / {Math.max(totalPages, 1)}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={onNextPage}
              disabled={currentPage >= totalPages}
              aria-label="Next Tray"
              className="flex items-center gap-1 text-xs"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
