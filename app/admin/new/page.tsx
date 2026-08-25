import React from "react";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllBookstores } from "@/lib/db/queries";
import { BookmarkForm } from "@/components/admin/BookmarkForm";

export const dynamic = "force-dynamic";

export default async function AdminNewBookmarkPage() {
  const isAuth = await getAdminSession();
  if (!isAuth) {
    redirect("/admin/login");
  }

  const bookstores = await getAllBookstores();

  return (
    <div className="min-h-screen bg-[#FBF9F5] p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-ink">Catalog New Bookmark</h1>
          <p className="text-xs text-ink-muted font-serif italic">
            Upload scans, enter physical ephemera measurements, and link to an existing bookstore or create a new dossier.
          </p>
        </div>

        <BookmarkForm existingBookstores={bookstores} />
      </div>
    </div>
  );
}
