import React from "react";
import Link from "next/link";
import { initDb } from "@/db";
import { seedDatabase } from "@/db/seed";
import { getBookmarksWithBookstores, getFilterOptions } from "@/lib/db/queries";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { ExhibitGalleryClient } from "@/components/exhibit/ExhibitGalleryClient";
import { db } from "@/db";
import { bookmarks as bookmarksTable } from "@/db/schema";
import { BookOpen, Compass, Lock, Instagram, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

const defaultFilterOptions = {
  cities: [] as string[],
  states: [] as string[],
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

  const allBookmarks = await getBookmarksWithBookstores().catch(() => []);
  const bookmarks = allBookmarks.filter((b) => !b.isBooksellerTicket);
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

      <Footer />
    </div>
  );
}
