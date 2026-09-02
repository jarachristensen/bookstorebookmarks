import React from "react";
import { getBookstoreById } from "@/lib/db/queries";
import { notFound } from "next/navigation";
import { Header } from "@/components/ui/Header";
import { BookstoreVisualEditor } from "@/components/admin/BookstoreVisualEditor";

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
        <BookstoreVisualEditor initialData={bookstore} />
      </main>
    </div>
  );
}
