import React from "react";
import Link from "next/link";
import { initDb } from "@/db";
import { seedDatabase } from "@/db/seed";
import { getBookmarksWithBookstores, getFilterOptions } from "@/lib/db/queries";
import { Header } from "@/components/ui/Header";
import { ExhibitGalleryClient } from "@/components/exhibit/ExhibitGalleryClient";
import { db } from "@/db";
import { bookmarks as bookmarksTable } from "@/db/schema";
import { BookOpen, Compass, Lock, Instagram, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

const defaultFilterOptions = {
  cities: [] as string[],
  eras: [
    { label: "All Eras", value: "all" },
    { label: "Early Century (Pre-1940)", value: "pre-1940" },
    { label: "Mid-Century & Post-War (1940–1960)", value: "1940-1960" },
    { label: "Late 20th Century (Post-1960)", value: "post-1960" },
  ],
  specialties: [] as string[],
};

export default async function HomePage() {
  try {
    await initDb();

    // Auto-seed if database has no bookmarks yet
    const count = await db.select().from(bookmarksTable);
    if (count.length === 0) {
      await seedDatabase();
    }
  } catch (err) {
    console.error("Database initialization warning:", err);
  }

  const bookmarks = await getBookmarksWithBookstores().catch(() => []);
  const filterOptions = await getFilterOptions().catch(() => defaultFilterOptions);

  const totalBookstores = new Set(bookmarks.map((b) => b.bookstoreId)).size;

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Curatorial Archive Stats & Curator Cabinet Action Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          {/* Stats Boxes (Matching Curator's Cabinet styling) */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/bookstores"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm rounded-md bg-white border border-parchment-border text-ink-light hover:text-archival-oxblood hover:border-archival-oxblood shadow-2xs font-medium transition-all group"
              title="Browse all historic bookstores"
            >
              <BookOpen className="w-3.5 h-3.5 text-archival-oxblood" />
              <span>
                <strong className="text-ink font-semibold group-hover:text-archival-oxblood">{totalBookstores}</strong> Historic Bookstores ↗
              </span>
            </Link>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm rounded-md bg-white border border-parchment-border text-ink-light shadow-2xs font-medium">
              <Compass className="w-3.5 h-3.5 text-archival-spruce" />
              <span>
                <strong className="text-ink font-semibold">{bookmarks.length}</strong> Cataloged Bookmarks
              </span>
            </div>
          </div>

          {/* Curator's Cabinet Button */}
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm rounded-md bg-white border border-parchment-border text-ink-light hover:text-ink hover:border-ink shadow-2xs hover:shadow-xs transition-all font-medium"
          >
            <Lock className="w-3.5 h-3.5 text-ink-muted" />
            <span>Curator's Cabinet</span>
          </Link>
        </div>

        <ExhibitGalleryClient
          initialBookmarks={bookmarks}
          filterOptions={filterOptions}
        />
      </main>

      <footer className="border-t border-parchment-border py-8 bg-[#F4EFE6] text-center text-xs font-serif text-ink-muted">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <div className="flex items-center justify-center gap-4 text-xs font-serif text-ink-light">
            <Link href="/bookstores" className="hover:text-archival-oxblood hover:underline">
              Bookstores
            </Link>
            <span>·</span>
            <Link href="/about" className="hover:text-archival-oxblood hover:underline">
              About Archive
            </Link>
            <span>·</span>
            <Link href="/contact" className="hover:text-archival-oxblood hover:underline">
              Donate &amp; Submissions
            </Link>
            <span>·</span>
            <a
              href="https://www.instagram.com/bookstorebookmarks"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-rose-700 hover:underline"
            >
              <Instagram className="w-3.5 h-3.5 text-pink-600" />
              <span>@bookstorebookmarks</span>
            </a>
          </div>

          <p className="font-semibold text-ink">
            Bookstore Bookmark Archive &amp; Historical Research Dossier
          </p>
          <p className="italic">
            Dedicated to the memory of independent booksellers, radical presses, and the ephemera that marks our reading journeys.
          </p>
          <p className="font-mono text-[10px] text-ink-muted/80">
            Archival Specimen System v1.0 · SQLite &amp; Next.js App
          </p>
        </div>
      </footer>
    </div>
  );
}
