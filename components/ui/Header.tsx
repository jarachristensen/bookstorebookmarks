"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Compass, Bookmark as BookmarkIcon, Lock, Sparkles } from "lucide-react";

export interface HeaderProps {
  totalBookmarks?: number;
  totalBookstores?: number;
}

export function Header({ totalBookmarks = 4, totalBookstores = 4 }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-parchment-border bg-parchment/90 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Title */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-lg bg-ink flex items-center justify-center text-parchment-light shadow-md border border-ink group-hover:scale-105 transition-transform">
              <BookmarkIcon className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-ink group-hover:text-archival-oxblood transition-colors">
                  Bookstore Bookmark Archive
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-archival-oxblood/10 text-archival-oxblood border border-archival-oxblood/20">
                  EST. 2026
                </span>
              </div>
              <p className="text-xs text-ink-muted hidden sm:block font-serif italic">
                A Curated Exhibition &amp; Historical Research Dossier
              </p>
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
