import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { getAllBookstores } from "@/lib/db/queries";
import { BookstoresDirectoryClient } from "@/components/bookstores/BookstoresDirectoryClient";
import { getAvailableStorefrontFiles } from "@/lib/utils/storefront-server";
import { Building2, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Historic Bookstores Directory | The Bookstore Bookmark Archive",
  description: "Explore the legendary independent bookstores represented in our bookmark archive.",
};

export default async function BookstoresPage() {
  const bookstores = await getAllBookstores().catch(() => []);
  const availableStorefronts = getAvailableStorefrontFiles();

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
        <BookstoresDirectoryClient
          bookstores={bookstores}
          availableStorefronts={availableStorefronts}
        />
      </main>

      <Footer />
    </div>
  );
}
