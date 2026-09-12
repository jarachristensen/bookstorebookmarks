import React from "react";
import { getBookmarkBySlug } from "@/lib/db/queries";
import { notFound } from "next/navigation";
import { Header } from "@/components/ui/Header";
import { BookstoreDossier } from "@/components/exhibit/BookstoreDossier";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BookmarkInspector } from "@/components/exhibit/BookmarkInspector";

export const dynamic = "force-dynamic";

export default async function SingleBookmarkPage({
  params,
}: {
  params: { slug: string };
}) {
  const bookmark = await getBookmarkBySlug(params.slug);
  if (!bookmark) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-serif text-stone-500 hover:text-[#2563EB] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Exhibit Tray</span>
          </Link>
        </div>

        <BookmarkInspector
          bookmark={bookmark}
          onClose={() => {}}
        />

        {bookmark.bookstore && (
          <div className="pt-8">
            <BookstoreDossier
              bookmark={bookmark}
              onClose={() => {}}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8E2D5] py-8 bg-[#FAF8F5] text-center text-xs font-serif text-stone-500">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-serif text-stone-600">
            <Link href="/" className="hover:text-[#F43F7A] hover:underline">
              Archive
            </Link>
            <span>·</span>
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
              Contact
            </Link>
          </div>

          <p className="font-serif font-bold text-stone-800">
            <span className="text-[#F43F7A]">The</span> <span className="text-[#2563EB]">Bookstore</span> <span className="text-[#F43F7A]">Bookmark</span> <span className="text-[#2563EB]">Archive</span>
          </p>
          <p className="text-stone-500">
            Dedicated to preserving independent bookstore ephemera, history, and physical papercraft.
          </p>
        </div>
      </footer>
    </div>
  );
}
