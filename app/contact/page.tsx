import React, { Suspense } from "react";
import { getPageContent } from "@/lib/db/page-content";
import { EditableContactPage } from "@/components/pages/EditableContactPage";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Submissions & Contact | The Bookstore Bookmark Archive",
  description:
    "Submit bookstore stories, historical corrections, or donate physical bookmarks to the archive.",
};

export default async function ContactPage() {
  const content = await getPageContent("contact");

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
          <p className="font-serif text-sm text-stone-500 animate-pulse">
            Loading Submissions &amp; Contact...
          </p>
        </div>
      }
    >
      <EditableContactPage initialContent={content} />
    </Suspense>
  );
}
