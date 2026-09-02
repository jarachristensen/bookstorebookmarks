"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  Building2,
  Info,
  Mail,
  Instagram,
  Lock,
  Menu,
  X,
  Compass,
} from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Archive Tray", icon: Bookmark },
    { href: "/bookstores", label: "Bookstores", icon: Building2 },
    { href: "/about", label: "About Archive", icon: Info },
    { href: "/contact", label: "Contact", icon: Mail },
  ];

  return (
    <header className="relative z-30 border-b border-parchment-border bg-parchment transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        {/* Center Hero Banner: Crisp Bookmark Logo Masthead */}
        <div className="flex items-center justify-center">
          <Link href="/" className="group inline-flex items-center justify-center max-w-full">
            <h1 className="sr-only">The Bookstore Bookmark Archive</h1>
            <div className="relative w-full max-w-[240px] xs:max-w-[320px] sm:max-w-[420px] md:max-w-[500px] lg:max-w-[560px] filter drop-shadow-[0_3px_12px_rgba(0,0,0,0.10)] group-hover:drop-shadow-[0_6px_18px_rgba(0,0,0,0.20)] group-hover:scale-[1.012] transition-all duration-200">
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

        {/* Archival Navigation Menu & Socials Strip */}
        <div className="mt-2.5 pt-2 border-t border-parchment-border/60 flex items-center justify-between">
          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === "/"
                  ? (pathname === "/" || pathname === "")
                  : (pathname || "").startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-serif transition-all ${
                    isActive
                      ? "bg-white text-archival-oxblood font-bold shadow-2xs border border-parchment-border"
                      : "text-ink-light hover:text-ink hover:bg-white/60"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive ? "text-archival-oxblood" : "text-ink-muted"
                    }`}
                  />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-serif bg-white border border-parchment-border text-ink-light hover:text-ink"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span>Menu</span>
          </button>

          {/* Right Actions: Instagram & Curator Portal */}
          <div className="flex items-center gap-2">
            {/* Official Instagram Link */}
            <a
              href="https://www.instagram.com/bookstorebookmarks"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-serif bg-white border border-parchment-border text-ink-light hover:text-rose-700 hover:border-rose-300 shadow-2xs transition-all group"
              title="Follow @bookstorebookmarks on Instagram"
            >
              <Instagram className="w-3.5 h-3.5 text-pink-600 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline font-mono text-[11px]">@bookstorebookmarks</span>
            </a>

            {/* Curator's Cabinet Button */}
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-serif bg-white border border-parchment-border text-ink-light hover:text-ink hover:border-ink shadow-2xs transition-all"
            >
              <Lock className="w-3.5 h-3.5 text-ink-muted" />
              <span className="hidden sm:inline">Curator's Cabinet</span>
            </Link>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 pt-2 pb-1 border-t border-parchment-border space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === "/"
                  ? (pathname === "/" || pathname === "")
                  : (pathname || "").startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-serif ${
                    isActive
                      ? "bg-white text-archival-oxblood font-bold border border-parchment-border"
                      : "text-ink-light hover:bg-white/60"
                  }`}
                >
                  <Icon className="w-4 h-4 text-archival-oxblood" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
