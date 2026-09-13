"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookstoreWithDetails } from "@/lib/db/queries";
import {
  resolveStorefrontImage,
  DEFAULT_STOREFRONT_IMAGE,
} from "@/lib/utils/storefront";
import { Building2 } from "lucide-react";

export interface BookstoresDirectoryClientProps {
  bookstores: BookstoreWithDetails[];
  availableStorefronts?: string[];
}

interface BookstoreCardProps {
  store: BookstoreWithDetails;
  availableStorefronts?: string[];
}

function BookstoreCard({ store, availableStorefronts }: BookstoreCardProps) {
  const initialImage = resolveStorefrontImage(store, availableStorefronts);
  const [imgSrc, setImgSrc] = useState(initialImage);
  const [hasError, setHasError] = useState(false);

  const isFiller = imgSrc === DEFAULT_STOREFRONT_IMAGE || hasError;

  const locationString = useMemo(() => {
    const parts = [store.city, store.stateProvince, store.country].filter(Boolean);
    return parts.join(", ");
  }, [store.city, store.stateProvince, store.country]);

  const yearsString = useMemo(() => {
    const opened = store.yearOpened || "1900";
    const closed = store.isStillOperating ? "Present" : store.yearClosed || "Closed";
    return `${opened}–${closed}`;
  }, [store.yearOpened, store.yearClosed, store.isStillOperating]);

  return (
    <Link
      href={`/bookstores/${store.id}`}
      className="group flex flex-col pt-2 focus:outline-none"
    >
      {/* Diecut Storefront Cutout Image (Overlapping White Box) */}
      <div className="relative w-full h-52 sm:h-64 z-10 px-3 -mb-5 sm:-mb-6 flex items-end justify-center pointer-events-none">
        <div
          className={`relative w-full transition-all duration-300 ${
            isFiller
              ? "max-w-[250px] sm:max-w-[270px] h-[80%]"
              : "max-w-[320px] sm:max-w-[340px] h-full"
          }`}
        >
          <Image
            src={isFiller ? DEFAULT_STOREFRONT_IMAGE : imgSrc}
            alt={`${store.name} Storefront`}
            fill
            unoptimized
            onError={() => {
              setHasError(true);
              setImgSrc(DEFAULT_STOREFRONT_IMAGE);
            }}
            className="object-contain object-bottom drop-shadow-xl group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-300"
          />
        </div>
      </div>

      {/* Condensed White Box */}
      <div className="relative z-0 rounded-2xl bg-white border border-[#E8E2D5] p-4 sm:p-5 pt-6 sm:pt-7 shadow-xs group-hover:shadow-md group-hover:border-[#F43F7A]/50 transition-all duration-200 flex flex-col justify-between space-y-2.5">
        {/* Title & Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900 leading-snug line-clamp-2 group-hover:text-[#F43F7A] transition-colors">
              {store.name}
            </h3>
            {store.isFlagship && (
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20">
                Flagship Store
              </span>
            )}
            {store.branchLabel && !store.isFlagship && (
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase bg-amber-100 text-amber-900 border border-amber-200">
                {store.branchLabel}
              </span>
            )}
          </div>
          <div className="shrink-0 pt-0.5">
            {store.isStillOperating ? (
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-[#10B981] text-white">
                STILL OPERATING
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-[#F43F7A] text-white">
                {store.yearClosed ? `CLOSED (${store.yearClosed})` : "CLOSED"}
              </span>
            )}
          </div>
        </div>

        {/* Location & Active Years */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs text-stone-500 pt-1.5 border-t border-stone-100">
          <span className="truncate">{locationString}</span>
          <span className="font-mono text-stone-600 shrink-0">{yearsString}</span>
        </div>
      </div>
    </Link>
  );
}

export function BookstoresDirectoryClient({
  bookstores,
  availableStorefronts,
}: BookstoresDirectoryClientProps) {
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const countries = useMemo(() => {
    const set = new Set<string>();
    bookstores.forEach((s) => {
      if (s.country) set.add(s.country);
    });
    return Array.from(set).sort();
  }, [bookstores]);

  const states = useMemo(() => {
    const set = new Set<string>();
    bookstores.forEach((s) => {
      if (selectedCountry === "all" || s.country?.toLowerCase() === selectedCountry.toLowerCase()) {
        if (s.stateProvince) set.add(s.stateProvince);
      }
    });
    return Array.from(set).sort();
  }, [bookstores, selectedCountry]);

  const cities = useMemo(() => {
    const set = new Set<string>();
    bookstores.forEach((s) => {
      const matchCountry =
        selectedCountry === "all" || s.country?.toLowerCase() === selectedCountry.toLowerCase();
      const matchState =
        selectedState === "all" || s.stateProvince?.toLowerCase() === selectedState.toLowerCase();

      if (matchCountry && matchState && s.city) {
        set.add(s.city);
      }
    });
    return Array.from(set).sort();
  }, [bookstores, selectedCountry, selectedState]);

  const filteredBookstores = useMemo(() => {
    return bookstores.filter((store) => {
      if (selectedCountry !== "all" && store.country?.toLowerCase() !== selectedCountry.toLowerCase()) {
        return false;
      }
      if (selectedState !== "all" && store.stateProvince?.toLowerCase() !== selectedState.toLowerCase()) {
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
        const matchesState = store.stateProvince?.toLowerCase().includes(q);
        const matchesCountry = store.country?.toLowerCase().includes(q);
        const matchesBlurb = store.historicalBlurb.toLowerCase().includes(q);
        const matchesFounders = store.founders?.toLowerCase().includes(q);
        const matchesChain = store.chainName?.toLowerCase().includes(q);
        const matchesBranch = store.branchLabel?.toLowerCase().includes(q);
        return (
          matchesName ||
          matchesCity ||
          matchesState ||
          matchesCountry ||
          matchesBlurb ||
          matchesFounders ||
          matchesChain ||
          matchesBranch
        );
      }
      return true;
    });
  }, [bookstores, search, selectedCountry, selectedState, selectedCity, selectedStatus]);

  return (
    <div className="space-y-8">
      {/* Search and Filters Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs flex flex-col md:flex-row items-center gap-4">
        {/* Search Input */}
        <div className="relative w-full md:flex-1">
          <input
            type="text"
            placeholder="Search bookstores by name, city, state, country, founders, or history..."
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
                setSelectedState("all");
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

          {/* State Filter */}
          <select
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedCity("all");
            }}
            className="px-3 py-2 text-xs font-sans bg-white border border-[#E8E2D5] rounded-xl text-stone-700 focus:outline-none focus:border-[#2563EB] cursor-pointer hover:border-stone-400"
          >
            <option value="all">All States</option>
            {states.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          {/* Dynamic City Filter (Visible when a State is selected) */}
          {selectedState !== "all" && cities.length > 0 && (
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-3 py-2 text-xs font-sans bg-white border border-[#2563EB]/40 rounded-xl text-stone-700 focus:outline-none focus:border-[#2563EB] cursor-pointer hover:border-[#2563EB] animate-in fade-in duration-200"
            >
              <option value="all">All Cities in {selectedState}</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          )}

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
          {filteredBookstores.map((store) => (
            <BookstoreCard
              key={store.id}
              store={store}
              availableStorefronts={availableStorefronts}
            />
          ))}
        </div>
      )}
    </div>
  );
}

