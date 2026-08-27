import React from "react";
import { initDb } from "@/db";
import { seedDatabase } from "@/db/seed";
import { getBookmarksWithBookstores, getFilterOptions } from "@/lib/db/queries";
import { Header } from "@/components/ui/Header";
import { ExhibitGalleryClient } from "@/components/exhibit/ExhibitGalleryClient";
import { db } from "@/db";
import { bookmarks as bookmarksTable } from "@/db/schema";
import { BookOpen, Compass } from "lucide-react";

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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Curatorial Archive Stats Strip (Centered below Header) */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-4 sm:gap-6 px-4 sm:px-6 py-2 rounded-full bg-white/85 backdrop-blur-md border border-parchment-border text-xs sm:text-sm font-mono text-ink-muted shadow-2xs">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-archival-oxblood" />
              <span>
                <strong className="text-ink font-semibold">{totalBookstores}</strong> Historic Bookstores
              </span>
            </div>
            <span className="text-parchment-border">|</span>
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-archival-spruce" />
              <span>
                <strong className="text-ink font-semibold">{bookmarks.length}</strong> Cataloged Bookmarks
              </span>
            </div>
          </div>
        </div>

        <ExhibitGalleryClient
          initialBookmarks={bookmarks}
          filterOptions={filterOptions}
        />
      </main>

      <footer className="border-t border-parchment-border py-8 bg-[#F4EFE6] text-center text-xs font-serif text-ink-muted">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
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
