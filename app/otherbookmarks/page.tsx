import React, { Suspense } from "react";
import { getTradeNonBookstoreBookmarks } from "@/lib/db/queries";
import { OtherBookmarksHubClient } from "@/components/trading/OtherBookmarksHubClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Other Bookmarks & Ephemera Bazaar | Bookstore Bookmark Archive",
  description:
    "An invite only trade page for all other bookmarks in the collection. Will trade for bookstore and other book related bookmarks.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OtherBookmarksPage() {
  const tradeBookmarks = await getTradeNonBookstoreBookmarks();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
          <p className="font-serif text-sm text-stone-500 animate-pulse">
            Loading Ephemera Bazaar...
          </p>
        </div>
      }
    >
      <OtherBookmarksHubClient initialBookmarks={tradeBookmarks} />
    </Suspense>
  );
}
