"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookstoreWithDetails } from "@/lib/db/queries";
import {
  resolveStorefrontImage,
  DEFAULT_STOREFRONT_IMAGE,
} from "@/lib/utils/storefront";

export interface BookstoreCardProps {
  store: BookstoreWithDetails;
  availableStorefronts?: string[];
  priority?: boolean;
}

export function BookstoreCard({ store, availableStorefronts, priority = false }: BookstoreCardProps) {
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
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
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
                1st Location (Flagship)
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
