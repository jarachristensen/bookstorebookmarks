import React from "react";
import Link from "next/link";
import { Header } from "@/components/ui/Header";
import {
  HeartHandshake,
  BookOpen,
  Building2,
  Sparkles,
  ArrowRight,
  Instagram,
  Mail,
  ShieldCheck,
  Gift,
  Library,
} from "lucide-react";

export const metadata = {
  title: "Partners & Donors | The Bookstore Bookmark Archive",
  description: "Honoring the bookstores, collectors, historians, and friends whose donations and support sustain the Bookstore Bookmark Archive.",
};

export default function PartnersPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* 1. Page Header / Hero Banner */}
        <section className="text-center space-y-3 pb-6 border-b border-parchment-border">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-archival-oxblood text-xs font-mono font-semibold tracking-wider uppercase mb-1">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Community Honor Roll</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-ink tracking-tight">
            Partners &amp; Donors
          </h1>
          <p className="font-serif text-base sm:text-lg text-ink-light max-w-2xl mx-auto italic leading-relaxed">
            The Bookstore Bookmark Archive exists thanks to the generosity of collectors, booksellers, historians, and readers worldwide who share their physical bookmarks and stories with us.
          </p>
        </section>

        {/* 2. Curator's Letter of Appreciation */}
        <section className="bg-white p-6 sm:p-10 rounded-2xl border border-parchment-border shadow-xs space-y-5 font-serif text-ink-light leading-relaxed text-sm sm:text-base">
          <div className="flex items-center gap-2.5 border-b border-parchment-border pb-3">
            <Sparkles className="w-5 h-5 text-archival-amber" />
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink">
              With Deep Gratitude from the Curator
            </h2>
          </div>

          <p>
            Every physical bookmark cataloged in this archive began its life between the pages of a purchased book. Over decades, many were saved in desk drawers, pressed into personal collections, or passed down from bibliophiles who loved their neighborhood bookshops.
          </p>

          <p>
            When you donate physical bookmarks or share historical photographs and newspaper clippings with us, you help ensure that these fragile paper specimens and the cultural legacies of the shops that printed them remain preserved and freely accessible for future generations of book lovers.
          </p>

          <div className="p-4 rounded-xl bg-parchment/60 border-l-4 border-archival-oxblood italic text-ink text-xs sm:text-sm">
            “Part of this project is organizing, cataloging, and physically protecting each bookmark in archival sleeves to ensure they remain preserved for decades to come.”
          </div>
        </section>

        {/* 3. Partner & Donor Recognition Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Booksellers & Bookstores */}
          <div className="p-6 rounded-2xl bg-white border border-parchment-border shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-archival-oxblood">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-ink">
                Bookstore Partners &amp; Booksellers
              </h3>
              <p className="font-serif text-xs text-ink-light leading-relaxed">
                Operating and legacy independent bookstores who provide historical bookmarks, store ephemera, and photographs from their archives.
              </p>
            </div>

            <div className="pt-3 border-t border-parchment-border/60">
              <span className="text-[11px] font-mono font-medium text-archival-oxblood">
                ✦ Supporting shop legacies
              </span>
            </div>
          </div>

          {/* Card 2: Individual Donors & Collectors */}
          <div className="p-6 rounded-2xl bg-white border border-parchment-border shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-archival-amber">
                <Gift className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-ink">
                Collectors &amp; Donors
              </h3>
              <p className="font-serif text-xs text-ink-light leading-relaxed">
                Generous readers and ephemera collectors who mail original bookmarks and share family memories of visiting historic bookshops.
              </p>
            </div>

            <div className="pt-3 border-t border-parchment-border/60">
              <span className="text-[11px] font-mono font-medium text-archival-amber">
                ✦ Individual donor attribution
              </span>
            </div>
          </div>

          {/* Card 3: Libraries & Cultural Archives */}
          <div className="p-6 rounded-2xl bg-white border border-parchment-border shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-archival-spruce">
                <Library className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-ink">
                Libraries &amp; Archives
              </h3>
              <p className="font-serif text-xs text-ink-light leading-relaxed">
                Special collections, historical societies, and local libraries that assist with clipping verification and historical research.
              </p>
            </div>

            <div className="pt-3 border-t border-parchment-border/60">
              <span className="text-[11px] font-mono font-medium text-archival-spruce">
                ✦ Historical preservation
              </span>
            </div>
          </div>
        </div>

        {/* 4. Curatorial Preservation Promise */}
        <section className="p-6 sm:p-8 rounded-2xl bg-[#F4EFE6] border border-parchment-border space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-archival-oxblood" />
            <h3 className="font-serif text-lg font-bold text-ink">
              Our Donor Recognition &amp; Archival Care Promise
            </h3>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm font-serif text-ink-light">
            <li className="flex items-start gap-2">
              <span className="text-archival-oxblood font-bold mt-0.5">✦</span>
              <span><strong>Permanent Physical Care:</strong> Every donated bookmark is stored in acid-free archival sleeves.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-archival-oxblood font-bold mt-0.5">✦</span>
              <span><strong>Curatorial Attribution:</strong> Donors are credited directly on the catalog specimen record and acquisition dossier.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-archival-oxblood font-bold mt-0.5">✦</span>
              <span><strong>True-Scale Digitization:</strong> High-resolution front &amp; back scans capture every detail of typography and printing.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-archival-oxblood font-bold mt-0.5">✦</span>
              <span><strong>Non-Commercial Mission:</strong> The archive is a free, public educational resource for book and history lovers.</span>
            </li>
          </ul>
        </section>

        {/* 5. Call to Action: Donate or Get in Touch */}
        <section className="p-8 sm:p-10 rounded-2xl bg-stone-900 text-white shadow-lg text-center space-y-6">
          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100">
              Have Bookmarks to Donate or Want to Partner?
            </h2>
            <p className="font-serif text-xs sm:text-sm text-stone-300 italic">
              We welcome bookstore bookmarks of any era, condition, and country, as well as future library bookmarks.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-archival-oxblood hover:bg-rose-900 text-white text-xs sm:text-sm font-serif font-bold shadow-md transition-all group"
            >
              <span>Donate Bookmarks &amp; Contact Us</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <a
              href="https://www.instagram.com/bookstorebookmarks"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 border border-white/20 text-xs sm:text-sm font-serif transition-all"
            >
              <Instagram className="w-4 h-4 text-pink-400" />
              <span>Message on Instagram</span>
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-parchment-border py-8 bg-[#F4EFE6] text-center text-xs font-serif text-ink-muted">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-serif text-ink-light">
            <Link href="/" className="hover:text-archival-oxblood hover:underline">
              Archive Tray
            </Link>
            <span>·</span>
            <Link href="/bookstores" className="hover:text-archival-oxblood hover:underline">
              Bookstores
            </Link>
            <span>·</span>
            <Link href="/partners" className="hover:text-archival-oxblood hover:underline font-bold text-archival-oxblood">
              Partners &amp; Donors
            </Link>
            <span>·</span>
            <Link href="/about" className="hover:text-archival-oxblood hover:underline">
              About Archive
            </Link>
            <span>·</span>
            <Link href="/contact" className="hover:text-archival-oxblood hover:underline">
              Contact &amp; Submissions
            </Link>
          </div>

          <p className="italic pt-2 text-ink-muted">
            Dedicated to the memory of independent booksellers and the community that keeps their memory alive.
          </p>
        </div>
      </footer>
    </div>
  );
}
