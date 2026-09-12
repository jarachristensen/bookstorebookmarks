"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  HeartHandshake,
} from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If on a bookstore detail page /bookstores/[id], link directly to its visual editor /admin/bookstores/[id]
  const bookstoreMatch = pathname?.match(/^\/bookstores\/([^/]+)$/);
  const curatorUrl = bookstoreMatch ? `/admin/bookstores/${bookstoreMatch[1]}` : "/admin";

  const navLinks = [
    { href: "/", label: "Archive", icon: Bookmark },
    { href: "/bookstores", label: "Bookstores", icon: Building2 },
    { href: "/partners", label: "Partners & Donors", icon: HeartHandshake },
    { href: "/about", label: "About Archive", icon: Info },
    { href: "/contact", label: "Contact", icon: Mail },
  ];

  return (
    <header className="relative z-30 border-b border-[#E8E2D5] bg-[#FAF8F5]/95 backdrop-blur-xs transition-all shadow-2xs sticky top-0">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand Masthead Logo Link */}
        <Link
          href="/"
          className="group inline-flex items-center gap-2 select-none shrink-0 p-1 rounded-lg hover:bg-white/80 transition-all"
          title="The Bookstore Bookmark Archive"
          aria-label="The Bookstore Bookmark Archive"
        >
          <div className="w-8 h-8 rounded-lg bg-white border border-[#E8E2D5] flex items-center justify-center text-[#F43F7A] group-hover:border-[#F43F7A] group-hover:text-[#F43F7A] transition-colors shadow-2xs">
            <Bookmark className="w-4 h-4" />
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-1.5">
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
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? "bg-white text-[#2563EB] font-bold shadow-xs border border-[#E8E2D5]"
                    : "text-stone-600 hover:text-stone-900 hover:bg-white/60"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? "text-[#2563EB]" : "text-stone-400"
                  }`}
                />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Instagram & Curator Portal */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Official Instagram Link */}
          <a
            href="https://www.instagram.com/bookstorebookmarks"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white border border-[#E8E2D5] text-xs font-medium text-stone-700 hover:text-[#F43F7A] hover:border-[#F43F7A]/40 shadow-xs transition-all group"
            title="Follow @bookstorebookmarks on Instagram"
          >
            <Instagram className="w-3.5 h-3.5 text-[#F43F7A] group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline font-mono text-[11px]">@bookstorebookmarks</span>
          </a>

          {/* Curator's Cabinet Button */}
          <Link
            href={curatorUrl}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white border border-[#E8E2D5] text-xs font-medium text-stone-700 hover:text-stone-900 hover:border-stone-400 shadow-xs transition-all"
            title={bookstoreMatch ? "Edit this Bookstore Dossier in Curator's Cabinet" : "Curator's Cabinet"}
          >
            <Lock className="w-3.5 h-3.5 text-stone-400" />
            <span className="hidden sm:inline">Curator's Cabinet</span>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium bg-white border border-[#E8E2D5] text-stone-700 hover:text-stone-900"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span>Menu</span>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-3 border-t border-[#E8E2D5] bg-[#FAF8F5] space-y-1">
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
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium ${
                  isActive
                    ? "bg-white text-[#2563EB] font-bold border border-[#E8E2D5]"
                    : "text-stone-600 hover:bg-white/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#2563EB]" : "text-stone-400"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
