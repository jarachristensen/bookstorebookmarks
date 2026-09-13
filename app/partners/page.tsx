import React, { Suspense } from "react";
import { getPageContent } from "@/lib/db/page-content";
import { EditablePartnersPage } from "@/components/pages/EditablePartnersPage";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Partners & Donors | The Bookstore Bookmark Archive",
  description:
    "Honoring the bookstores, collectors, historians, and friends whose donations and support sustain the Bookstore Bookmark Archive.",
};

export default async function PartnersPage() {
  const content = await getPageContent("partners");

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
          <p className="font-serif text-sm text-stone-500 animate-pulse">
            Loading Partners &amp; Donors...
          </p>
        </div>
      }
    >
      <EditablePartnersPage initialContent={content} />
    </Suspense>
  );
}
