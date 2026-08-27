"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-parchment-border bg-parchment/95 backdrop-blur-md transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3.5">
        {/* Center Hero Banner: Crisp Bookmark Logo Masthead */}
        <div className="flex items-center justify-center">
          <Link href="/" className="group inline-flex items-center justify-center max-w-full">
            <h1 className="sr-only">The Bookstore Bookmark Archive</h1>
            <div className="relative w-full max-w-[240px] xs:max-w-[320px] sm:max-w-[440px] md:max-w-[530px] lg:max-w-[600px] filter drop-shadow-[0_3px_12px_rgba(0,0,0,0.10)] group-hover:drop-shadow-[0_6px_18px_rgba(0,0,0,0.20)] group-hover:scale-[1.015] transition-all duration-200">
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
