import React from "react";
import { getBookstoreById } from "@/lib/db/queries";
import { notFound } from "next/navigation";
import { Header } from "@/components/ui/Header";
import { BookstoreDetailEditor } from "@/components/admin/BookstoreDetailEditor";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit Bookstore Dossier | Curator's Cabinet",
};

export default async function EditBookstorePage({
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
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-bold text-ink">
            Edit Bookstore Dossier: {bookstore.name}
          </h1>
          <p className="text-xs font-serif text-ink-muted italic">
            Update historic locations, addresses, relocations, storefront photos, and cultural blurb.
          </p>
        </div>

        <BookstoreDetailEditor initialData={bookstore} isEditing={true} />
      </main>
    </div>
  );
}
