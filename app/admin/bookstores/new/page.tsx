import React from "react";
import { Header } from "@/components/ui/Header";
import { BookstoreDetailEditor } from "@/components/admin/BookstoreDetailEditor";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "New Bookstore Dossier | Curator's Cabinet",
};

export default function NewBookstorePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-bold text-ink">
            Create Historic Bookstore Dossier
          </h1>
          <p className="text-xs font-serif text-ink-muted italic">
            Add a new bookstore with multi-location history, storefront photos, and archival research.
          </p>
        </div>

        <BookstoreDetailEditor isEditing={false} />
      </main>
    </div>
  );
}
