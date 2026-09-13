"use client";

import React, { useState } from "react";
import { BookstoreLocation } from "@/db/schema";
import {
  MapPin,
  Navigation,
  ExternalLink,
  Copy,
  Check,
  Building2,
  Route,
} from "lucide-react";

export interface BookstoreGoogleMapProps {
  bookstore: {
    name: string;
    streetAddress?: string | null;
    city: string;
    stateProvince?: string | null;
    country: string;
    locations?: string | null;
  };
  className?: string;
}

export function BookstoreGoogleMap({ bookstore, className = "" }: BookstoreGoogleMapProps) {
  // Parse locations if stored in JSON format
  const parsedLocations: BookstoreLocation[] = React.useMemo(() => {
    if (bookstore.locations) {
      try {
        const list = JSON.parse(bookstore.locations);
        if (Array.isArray(list) && list.length > 0) {
          return list;
        }
      } catch (err) {
        console.error("Failed to parse bookstore locations:", err);
      }
    }

    // Default to single primary address
    return [
      {
        id: "primary",
        label: "Primary Historical Address",
        streetAddress: bookstore.streetAddress || "",
        city: bookstore.city,
        stateProvince: bookstore.stateProvince || undefined,
        country: bookstore.country,
        isCurrent: true,
      },
    ];
  }, [bookstore.locations, bookstore.streetAddress, bookstore.city, bookstore.stateProvince, bookstore.country]);

  const [activeLocationIdx, setActiveLocationIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const currentLocation = parsedLocations[activeLocationIdx] || parsedLocations[0];

  // Build formatted address string
  const addressParts = [
    currentLocation.streetAddress,
    currentLocation.city,
    currentLocation.stateProvince,
    currentLocation.country,
  ].filter(Boolean);

  const formattedAddress = addressParts.join(", ");

  // Google Maps URLs
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    currentLocation.streetAddress
      ? `${currentLocation.streetAddress}, ${currentLocation.city}, ${currentLocation.country}`
      : `${bookstore.name}, ${bookstore.city}, ${bookstore.country}`
  )}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  const externalMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    currentLocation.streetAddress
      ? `${bookstore.name}, ${formattedAddress}`
      : `${bookstore.name}, ${bookstore.city}, ${bookstore.country}`
  )}`;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    formattedAddress || `${bookstore.name}, ${bookstore.city}`
  )}`;

  const handleCopyAddress = () => {
    if (!formattedAddress) return;
    navigator.clipboard.writeText(formattedAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className={`p-6 sm:p-8 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs space-y-6 ${className}`}>
      {/* Header with Title & Action Links */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D5] pb-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#F43F7A]" />
            <span>Historic Location &amp; Map</span>
          </h2>
          <p className="text-xs font-serif text-stone-500 italic mt-0.5">
            Explore the physical neighborhood and historic street address on Google Maps
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-serif font-medium bg-[#FAF8F5] hover:bg-white text-stone-700 hover:text-stone-900 border border-[#E8E2D5] shadow-2xs transition-all"
            title="Get directions in Google Maps"
          >
            <Route className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Directions</span>
          </a>

          <a
            href={externalMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-serif font-medium bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-xs transition-all"
            title="Open in full Google Maps"
          >
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Multi-Location Switcher Tabs (if bookstore has multiple historic addresses) */}
      {parsedLocations.length > 1 && (
        <div className="space-y-2">
          <label className="block text-xs font-mono font-bold text-stone-700 uppercase tracking-wide">
            Historical Addresses &amp; Relocations ({parsedLocations.length}):
          </label>
          <div className="flex flex-wrap gap-2">
            {parsedLocations.map((loc, idx) => {
              const isActive = activeLocationIdx === idx;
              return (
                <button
                  key={loc.id || `loc-${idx}`}
                  type="button"
                  onClick={() => setActiveLocationIdx(idx)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-serif transition-all cursor-pointer border ${
                    isActive
                      ? "bg-[#F43F7A] text-white border-[#F43F7A] font-bold shadow-xs scale-[1.01]"
                      : "bg-[#FAF8F5] text-stone-700 border-[#E8E2D5] hover:bg-white hover:border-[#F43F7A]/40"
                  }`}
                >
                  <Navigation className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-[#F43F7A]"}`} />
                  <span>
                    {loc.label || `Location #${idx + 1}`}
                    {loc.yearsActive ? ` (${loc.yearsActive})` : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Address Metadata Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D5]">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center text-[#F59E0B] shrink-0 mt-0.5">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-serif text-sm font-bold text-stone-900">
                {currentLocation.streetAddress || `${bookstore.name} (${bookstore.city})`}
              </h4>
              {currentLocation.label && parsedLocations.length > 1 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20">
                  {currentLocation.label}
                </span>
              )}
              {currentLocation.yearsActive && (
                <span className="text-xs font-mono text-stone-500">
                  Active {currentLocation.yearsActive}
                </span>
              )}
            </div>
            <p className="text-xs font-serif text-stone-600 mt-0.5">
              {[currentLocation.city, currentLocation.stateProvince, currentLocation.country]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
        </div>

        {formattedAddress && (
          <button
            type="button"
            onClick={handleCopyAddress}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-serif text-stone-600 hover:text-stone-900 bg-white border border-[#E8E2D5] hover:border-stone-400 shadow-2xs transition-all cursor-pointer shrink-0 self-start sm:self-center"
            title="Copy address to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#10B981]" />
                <span className="text-[#10B981] font-medium">Copied Address</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-400" />
                <span>Copy Address</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Embedded Google Map Iframe */}
      <div className="relative w-full h-[300px] sm:h-[380px] rounded-xl overflow-hidden border border-[#E8E2D5] shadow-xs bg-[#FAF8F5]">
        <iframe
          title={`Google Map of ${bookstore.name}`}
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full grayscale-[15%] contrast-[105%]"
        />
      </div>
    </section>
  );
}
