import React, { Suspense } from "react";
import { getPageContent } from "@/lib/db/page-content";
import { EditableAboutPage } from "@/components/pages/EditableAboutPage";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "About the Archive & FAQ | The Bookstore Bookmark Archive",
  description:
    "Preserving the fleeting paper ephemera of historic independent bookstores.",
};

export default async function AboutPage() {
  const content = await getPageContent("about");

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
          <p className="font-serif text-sm text-stone-500 animate-pulse">
            Loading About Archive...
          </p>
        </div>
      }
    >
      <EditableAboutPage initialContent={content} />
    </Suspense>
  );
}
