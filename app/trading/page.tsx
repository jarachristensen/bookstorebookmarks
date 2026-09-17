import React, { Suspense } from "react";
import { getPageContent } from "@/lib/db/page-content";
import { getTradeBookmarks } from "@/lib/db/queries";
import { TradingHubClient } from "@/components/trading/TradingHubClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bookmark Bazaar | The Bookstore Bookmark Archive",
  description:
    "Browse available duplicate bookmarks in the archive and propose trades for bookstore ephemera.",
};

export default async function TradingPage() {
  const [content, tradeBookmarks] = await Promise.all([
    getPageContent("trading"),
    getTradeBookmarks(),
  ]);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
          <p className="font-serif text-sm text-stone-500 animate-pulse">
            Loading Bookmark Bazaar...
          </p>
        </div>
      }
    >
      <TradingHubClient
        initialBookmarks={tradeBookmarks}
        initialContent={content}
      />
    </Suspense>
  );
}
