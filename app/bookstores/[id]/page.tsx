import React from "react";
import Link from "next/link";
import { getBookstoreById } from "@/lib/db/queries";
import { notFound } from "next/navigation";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { BookstoreDetailView } from "@/components/bookstores/BookstoreDetailView";
import { getAvailableStorefrontFiles } from "@/lib/utils/storefront-server";

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
  const availableStorefronts = getAvailableStorefrontFiles();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BookstoreDetailView bookstore={bookstore} availableStorefronts={availableStorefronts} />
      </main>

      <Footer />
    </div>
  );
}
