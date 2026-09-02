import React from "react";
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
    <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BookstoreDetailView bookstore={bookstore} />
      </main>

      <footer className="border-t border-parchment-border py-8 bg-[#F4EFE6] text-center text-xs font-serif text-ink-muted mt-12">
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
