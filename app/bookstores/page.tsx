import React from "react";
import Link from "next/link";
import Image from "next/image";
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
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Page Banner Artwork */}
        <section className="w-full flex flex-col items-center pb-2 border-b border-[#E8E2D5]">
          <h1 className="sr-only">Historic Bookstores &amp; Booksellers</h1>
          <div className="relative w-full max-w-5xl aspect-[1995/250] select-none">
            <Image
              src="/images/bookstore-banner.png"
              alt="Historic Bookstores & Booksellers"
              fill
              unoptimized
              priority
              className="object-contain object-center w-full h-full"
            />
          </div>
        </section>

        {/* Interactive Directory List */}
        <BookstoresDirectoryClient bookstores={bookstores} />
      </main>

      <footer className="border-t border-[#E8E2D5] py-8 bg-[#FAF8F5] text-center text-xs text-stone-600">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-stone-700 font-medium">
            <Link href="/" className="hover:text-[#F43F7A] hover:underline">
              Archive
            </Link>
            <span>·</span>
            <Link href="/bookstores" className="hover:text-[#F43F7A] hover:underline font-bold text-[#F43F7A]">
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
          </div>

          <p className="font-serif font-bold text-stone-900 text-sm">
            <span className="text-[#F43F7A]">The</span> <span className="text-[#2563EB]">Bookstore</span> <span className="text-[#F43F7A]">Bookmark</span> <span className="text-[#2563EB]">Archive</span>
          </p>
          <p className="italic font-serif text-stone-700 max-w-xl mx-auto">
            "They saved our place; now, let’s save theirs."
          </p>
          <p className="font-mono text-[10px] text-stone-400">
            A Living Digital Archive of Independent &amp; Historic Bookseller Ephemera
          </p>
        </div>
      </footer>
    </div>
  );
}
