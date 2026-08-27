"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Lock, Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-parchment-border bg-parchment/95 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2.5 sm:py-3.5">
          {/* Left Spacer (Balances right navigation for optical centering) */}
          <div className="w-auto sm:w-1/4 hidden sm:block" />

          {/* Center Column: Big Prominent Hero Bookmark Logo Title */}
          <div className="flex-1 flex items-center justify-center px-2">
            <Link href="/" className="group inline-flex items-center justify-center">
              <h1 className="sr-only">The Bookstore Bookmark Archive</h1>
              <div className="relative h-14 sm:h-20 md:h-24 lg:h-26 w-auto filter drop-shadow-[0_3px_10px_rgba(0,0,0,0.10)] group-hover:drop-shadow-[0_6px_18px_rgba(0,0,0,0.18)] group-hover:scale-[1.02] transition-all duration-200">
                <Image
                  src="/logo.png"
                  alt="The Bookstore Bookmark Archive — Keep Your Place in Literary History"
                  width={520}
                  height={190}
                  className="h-14 sm:h-20 md:h-24 lg:h-26 w-auto object-contain rounded-xs"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Right Column: Navigation Links */}
          <div className="w-auto sm:w-1/4 flex items-center justify-end gap-2.5 sm:gap-3">
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-serif font-medium text-ink-light hover:text-ink transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-archival-amber" />
              <span>Exhibit</span>
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm rounded-md bg-white border border-parchment-border text-ink-light hover:text-ink hover:border-ink shadow-sm transition-all font-medium"
            >
              <Lock className="w-3.5 h-3.5 text-ink-muted" />
              <span>Curator's Cabinet</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
