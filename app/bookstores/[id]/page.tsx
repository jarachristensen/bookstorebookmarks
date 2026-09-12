import React from "react";
import Link from "next/link";
import { getBookstoreById } from "@/lib/db/queries";
import { notFound } from "next/navigation";
import { Header } from "@/components/ui/Header";
import { BookstoreDetailView } from "@/components/bookstores/BookstoreDetailView";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const store = await getBookstoreById(params.id);
  if (!store) return { title: "Bookstore Not Found" };
  return {
    title: `${store.name} — Historic Research Dossier | The Bookstore Bookmark Archive`,
    description: `Historical timeline, addresses, archival press clippings, and cataloged bookmarks for ${store.name}.`,
  };
}

export default async function SingleBookstorePage({
  params,
}: {
  params: { id: string };
}) {
  const bookstore = await getBookstoreById(params.id);
  if (!bookstore) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BookstoreDetailView bookstore={bookstore} />
      </main>

      <footer className="border-t border-[#E8E2D5] py-8 bg-[#FAF8F5] text-center text-xs text-stone-600 mt-12">
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
          <p className="font-serif text-stone-700 max-w-xl mx-auto">
            "They saved our place, now there is a place to save them."
          </p>
        </div>
      </footer>
    </div>
  );
}
