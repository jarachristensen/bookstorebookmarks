import React from "react";
import { getBookmarksWithBookstores } from "@/lib/db/queries";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { BooksellerTicketsGalleryClient } from "@/components/tickets/BooksellerTicketsGalleryClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bookseller Tickets | The Bookstore Bookmark Archive",
  description:
    "Explore rare 18th and 19th-century bookseller and binder tickets pasted inside historic volumes.",
};

export default async function BooksellerTicketsPage() {
  const allBookmarks = await getBookmarksWithBookstores().catch(() => []);
  const tickets = allBookmarks.filter((b) => Boolean(b.isBooksellerTicket));

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Header />
      <main className="flex-1 max-w-[1680px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <BooksellerTicketsGalleryClient tickets={tickets} />
      </main>
      <Footer />
    </div>
  );
}
