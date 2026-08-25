import React from "react";
import { initDb } from "@/db";
import { seedDatabase } from "@/db/seed";
import { getBookmarksWithBookstores, getFilterOptions } from "@/lib/db/queries";
import { Header } from "@/components/ui/Header";
import { ExhibitGalleryClient } from "@/components/exhibit/ExhibitGalleryClient";
import { db } from "@/db";
import { bookmarks as bookmarksTable } from "@/db/schema";

export const dynamic = "force-dynamic";

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
  const filterOptions = await getFilterOptions().catch(() => ({ cities: [], eras: [] }));

  const totalBookstores = new Set(bookmarks.map((b) => b.bookstoreId)).size;

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
      <Header
        totalBookmarks={bookmarks.length}
        totalBookstores={totalBookstores}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
