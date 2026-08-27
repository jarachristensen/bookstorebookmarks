"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Compass, Lock, Sparkles } from "lucide-react";

export interface HeaderProps {
  totalBookmarks?: number;
  totalBookstores?: number;
}

export function Header({ totalBookmarks = 4, totalBookstores = 4 }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-parchment-border bg-parchment/90 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2 sm:py-2.5 min-h-[5.5rem]">
          {/* Hero Enlarged Bookmark Logo acting as Webpage Title */}
          <Link href="/" className="flex items-center group">
            <h1 className="sr-only">The Bookstore Bookmark Archive</h1>
            <div className="relative h-14 sm:h-18 md:h-20 w-auto filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.10)] group-hover:drop-shadow-[0_6px_14px_rgba(0,0,0,0.18)] group-hover:scale-[1.02] transition-all duration-200">
              <Image
                src="/logo.jpg"
                alt="The Bookstore Bookmark Archive — Keep Your Place in Literary History"
                width={420}
                height={120}
                className="h-14 sm:h-18 md:h-20 w-auto object-contain rounded-xs"
                priority
              />
            </div>
          </Link>

          {/* Center Stats */}
          <div className="hidden lg:flex items-center gap-6 px-4 py-1.5 rounded-full bg-parchment-muted/60 border border-parchment-border text-xs font-mono text-ink-muted">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-archival-oxblood" />
              <span>
                <strong className="text-ink font-semibold">{totalBookstores}</strong> Historic Bookstores
              </span>
            </div>
            <span className="text-parchment-border">|</span>
            <div className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-archival-spruce" />
              <span>
                <strong className="text-ink font-semibold">{totalBookmarks}</strong> Cataloged Bookmarks
              </span>
            </div>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-3.5 py-1.5 text-xs sm:text-sm font-serif font-medium text-ink-light hover:text-ink transition-colors flex items-center gap-1.5"
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
