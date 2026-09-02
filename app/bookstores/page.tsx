import React from "react";
import { Header } from "@/components/ui/Header";
import { getAllBookstores } from "@/lib/db/queries";
import { BookstoresDirectoryClient } from "@/components/bookstores/BookstoresDirectoryClient";
import { Building2, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Historic Bookstores Directory | The Bookstore Bookmark Archive",
  description: "Explore the legendary independent bookstores represented in our bookmark archive.",
};

export default async function BookstoresPage() {
  const bookstores = await getAllBookstores().catch(() => []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Page Title & Intro */}
        <section className="text-center space-y-3 pb-6 border-b border-parchment-border">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-300 text-amber-900 text-xs font-mono font-bold tracking-wide uppercase">
            <Building2 className="w-3.5 h-3.5 text-archival-oxblood" />
            <span>Curated Heritage Directory</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-ink tracking-tight">
            Historic Bookstores &amp; Booksellers
          </h1>
          <p className="font-serif text-base sm:text-lg text-ink-light max-w-2xl mx-auto italic leading-relaxed">
            Browse the historic institutions, radical booksellers, and neighborhood shops that issued each specimen in our archive.
          </p>
        </section>

        {/* Interactive Directory List */}
        <BookstoresDirectoryClient bookstores={bookstores} />
      </main>

      <footer className="border-t border-parchment-border py-8 bg-[#F4EFE6] text-center text-xs font-serif text-ink-muted">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-ink">
            Bookstore Bookmark Archive &amp; Historical Research Dossier
          </p>
          <p className="italic">
            Dedicated to the memory of independent booksellers and the bookmarks that mark our reading journeys.
          </p>
        </div>
      </footer>
    </div>
  );
}
