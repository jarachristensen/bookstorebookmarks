"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Lock, Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-parchment-border bg-parchment/95 backdrop-blur-md transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-5 relative">
        {/* Top Right Quick Navigation */}
        <div className="absolute right-4 top-3.5 sm:right-6 sm:top-4 flex items-center gap-2 sm:gap-3 z-10">
          <Link
            href="/"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-serif font-medium text-ink-light hover:text-ink transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-archival-amber" />
            <span>Exhibit</span>
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm rounded-md bg-white border border-parchment-border text-ink-light hover:text-ink hover:border-ink shadow-sm transition-all font-medium"
          >
            <Lock className="w-3.5 h-3.5 text-ink-muted" />
            <span>Curator's Cabinet</span>
          </Link>
        </div>

        {/* Center Hero Banner: Twice-as-Big Bookmark Logo Masthead */}
        <div className="flex items-center justify-center pt-6 sm:pt-1 pb-1">
          <Link href="/" className="group inline-flex items-center justify-center max-w-full">
            <h1 className="sr-only">The Bookstore Bookmark Archive</h1>
            <div className="relative w-full max-w-[340px] xs:max-w-[460px] sm:max-w-[620px] md:max-w-[760px] lg:max-w-[860px] filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.12)] group-hover:drop-shadow-[0_8px_24px_rgba(0,0,0,0.22)] group-hover:scale-[1.015] transition-all duration-200">
              <Image
                src="/logo.png"
                alt="The Bookstore Bookmark Archive — Keep Your Place in Literary History"
                width={1024}
                height={372}
                className="w-full h-auto object-contain rounded-xs"
                priority
              />
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
