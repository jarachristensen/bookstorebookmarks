"use client";

import React from "react";
import Link from "next/link";
import { Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#E8E2D5] py-8 bg-[#FAF8F5] text-center text-xs text-stone-600">
      <div className="max-w-7xl mx-auto px-4 space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-stone-700 font-medium">
          <Link href="/bookstores" className="hover:text-[#F43F7A] hover:underline">
            Bookstores
          </Link>
          <span>·</span>
          <Link href="/partners" className="hover:text-[#F43F7A] hover:underline">
            Partners &amp; Donors
          </Link>
          <span>·</span>
          <Link href="/about" className="hover:text-[#F43F7A] hover:underline">
            About Archive
          </Link>
          <span>·</span>
          <Link href="/contact" className="hover:text-[#F43F7A] hover:underline">
            Donate &amp; Submissions
          </Link>
          <span>·</span>
          <Link
            href="/releases"
            className="hover:text-[#F43F7A] hover:underline font-semibold text-stone-800"
          >
            Release Notes
          </Link>
          <span>·</span>
          <a
            href="https://www.instagram.com/bookstorebookmarks"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#F43F7A] hover:underline"
          >
            <Instagram className="w-3.5 h-3.5" />
            <span>@bookstorebookmarks</span>
          </a>
        </div>

        <p className="font-serif font-bold text-stone-900 text-sm">
          <span className="text-[#F43F7A]">The</span>{" "}
          <span className="text-[#2563EB]">Bookstore</span>{" "}
          <span className="text-[#F43F7A]">Bookmark</span>{" "}
          <span className="text-[#2563EB]">Archive</span>
        </p>
        <p className="italic font-serif text-stone-700 max-w-xl mx-auto">
          &ldquo;They saved our place; now, let’s save theirs.&rdquo;
        </p>
        <p className="font-mono text-[10px] text-stone-400">
          A Living Digital Archive of Independent &amp; Historic Bookseller Ephemera
        </p>
      </div>
    </footer>
  );
}
