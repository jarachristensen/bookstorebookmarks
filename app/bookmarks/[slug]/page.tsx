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
    <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-serif text-ink-muted hover:text-ink transition-colors"
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
    </div>
  );
}
