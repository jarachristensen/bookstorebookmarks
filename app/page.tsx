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
  countries: [] as string[],
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
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Header />

      <main className="flex-1 max-w-[1680px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-1 sm:py-2">
        <ExhibitGalleryClient
          initialBookmarks={bookmarks}
          filterOptions={filterOptions}
        />
      </main>

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
            <span className="text-[#F43F7A]">The</span> <span className="text-[#2563EB]">Bookstore</span> <span className="text-[#F43F7A]">Bookmark</span> <span className="text-[#2563EB]">Archive</span>
          </p>
          <p className="italic font-serif text-stone-700 max-w-xl mx-auto">
            "They saved our place, now there is a place to save them."
          </p>
          <p className="font-mono text-[10px] text-stone-400">
            A Living Digital Archive of Independent &amp; Historic Bookseller Ephemera
          </p>
        </div>
      </footer>
    </div>
  );
}
