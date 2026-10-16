"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookstoreWithDetails } from "@/lib/db/queries";
import {
  resolveStorefrontImage,
  DEFAULT_STOREFRONT_IMAGE,
} from "@/lib/utils/storefront";
import { compareBookstoresAlphabetically } from "@/lib/utils/sorting";
import { Building2 } from "lucide-react";

import { BookstoreCard } from "./BookstoreCard";

export interface BookstoresDirectoryClientProps {
  bookstores: BookstoreWithDetails[];
  availableStorefronts?: string[];
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

  // The flagship store and 1st location are the same place; filter out duplicate 1st location branch records
  const displayBookstores = useMemo(() => {
    return bookstores.filter((s) => {
      if (s.flagshipId) {
        if (s.branchLabel && /1st\s*location|first\s*location|original\s*location|flagship/i.test(s.branchLabel)) {
          return false;
        }
        if (/1st\s*location|first\s*location|original\s*location/i.test(s.name)) {
          return false;
        }
        if (s.id.includes("1st-location")) {
          return false;
        }
      }
      return true;
    });
  }, [bookstores]);

  const countries = useMemo(() => {
    const set = new Set<string>();
    displayBookstores.forEach((s) => {
      if (s.country) set.add(s.country);
    });
    return Array.from(set).sort();
  }, [displayBookstores]);

  const states = useMemo(() => {
    const set = new Set<string>();
    displayBookstores.forEach((s) => {
      if (selectedCountry === "all" || s.country?.toLowerCase() === selectedCountry.toLowerCase()) {
        if (s.stateProvince) set.add(s.stateProvince);
      }
    });
    return Array.from(set).sort();
  }, [displayBookstores, selectedCountry]);

  const cities = useMemo(() => {
    const set = new Set<string>();
    displayBookstores.forEach((s) => {
      const matchCountry =
        selectedCountry === "all" || s.country?.toLowerCase() === selectedCountry.toLowerCase();
      const matchState =
        selectedState === "all" || s.stateProvince?.toLowerCase() === selectedState.toLowerCase();

      if (matchCountry && matchState && s.city) {
        set.add(s.city);
      }
    });
    return Array.from(set).sort();
  }, [displayBookstores, selectedCountry, selectedState]);

  const filteredBookstores = useMemo(() => {
    return displayBookstores.filter((store) => {
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
    }).sort(compareBookstoresAlphabetically);
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
          {filteredBookstores.map((store, idx) => (
            <BookstoreCard
              key={store.id}
              store={store}
              availableStorefronts={availableStorefronts}
              priority={idx < 6}
            />
          ))}
        </div>
      )}
    </div>
  );
}

