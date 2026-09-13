import React from "react";
import Link from "next/link";
import { Header } from "@/components/ui/Header";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { BookOpen, ArrowRight, Instagram } from "lucide-react";

export const metadata = {
  title: "About the Archive & FAQ | The Bookstore Bookmark Archive",
  description: "Preserving the fleeting paper ephemera of historic independent bookstores.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-3 pb-6 border-b border-[#E8E2D5]">
          <h1 className="font-serif font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight">
            <span className="text-[#F43F7A]">Keeping Our Place</span> in{" "}
            <span className="text-[#2563EB]">Literary History</span>
          </h1>
          <p className="font-serif text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
            A digital sanctuary dedicated to the often overlooked artistry and history of bookstore bookmarks, and the bookstores that created them.
          </p>
        </section>

        {/* Story & Essay */}
        <section className="space-y-6 font-serif text-stone-700 leading-relaxed text-sm sm:text-base bg-white p-6 sm:p-10 rounded-2xl border border-[#E8E2D5] shadow-xs">
          <h2 className="font-serif text-2xl font-bold text-stone-900 flex items-center gap-2 border-b border-[#E8E2D5] pb-3">
            <BookOpen className="w-5 h-5 text-[#F43F7A]" />
            <span>The Ephemera of Reading</span>
          </h2>

          <p>
            A universal experience. You hand the clerk your money, but before the bookseller hands over your stack of books, they quietly slip a small piece of cardstock between the pages. The bookstore bookmark. It's free, utilitarian, and easily forgotten and discarded.
          </p>

          <p>
            Yet these humble slips of paper—printed on cardstock, or even just printer paper, adorned with illustrations, stamped with opening hours and poetic slogans—became tangible relics of literary communities. They marked not only our place in a novel, but a specific moment in time and geography.
          </p>

          <p>
            A bookmark is the quietest ambassador of a bookstore. Decades after the OPEN has dimmed and the lease has expired, the bookmark remains. Often inside a forgotten volume.
          </p>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border-l-4 border-[#F43F7A] my-6 font-serif text-stone-800">
            “A bit like viewing gravestones, they underscore the often-fleeting nature of success” — Larry Hoefling, Owner of the (now closed) McHuston's Bookstore in Broken Arrow, OK.
          </div>

          <div className="pt-4 border-t border-[#E8E2D5]/70 space-y-3">
            <h3 className="font-serif text-xl font-bold text-stone-900">Our Archival Mission:</h3>
            <p>
              The Bookstore Bookmark Archive was established to preserve, catalog, and research these ephemeral pieces of history and learn about the bookstores that distributed them.
            </p>
          </div>

          <div className="pt-6 border-t border-[#E8E2D5] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/bookstorebookmarks"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-900 text-white hover:bg-stone-800 text-xs font-sans font-medium transition-all shadow-xs"
              >
                <Instagram className="w-4 h-4 text-[#F43F7A]" />
                <span>Follow @bookstorebookmarks</span>
              </a>
            </div>

            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 text-xs font-serif font-bold text-[#F43F7A] hover:underline"
            >
              <span>Have a bookmark to donate or a story to share?</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* Interactive FAQ Section */}
        <FAQAccordion />
      </main>

      <footer className="border-t border-[#E8E2D5] py-8 bg-[#FAF8F5] text-center text-xs text-stone-600">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-stone-700 font-medium">
            <Link href="/" className="hover:text-[#F43F7A] hover:underline">
              Archive
            </Link>
            <span>·</span>
            <Link href="/bookstores" className="hover:text-[#F43F7A] hover:underline">
              Bookstores
            </Link>
            <span>·</span>
            <Link href="/partners" className="hover:text-[#F43F7A] hover:underline">
              Partners &amp; Donors
            </Link>
            <span>·</span>
            <Link href="/about" className="hover:text-[#F43F7A] hover:underline font-bold text-[#F43F7A]">
              About Archive
            </Link>
            <span>·</span>
            <Link href="/contact" className="hover:text-[#F43F7A] hover:underline">
              Donate &amp; Submissions
            </Link>
          </div>

          <p className="font-serif font-bold text-stone-900 text-sm">
            <span className="text-[#F43F7A]">The</span> <span className="text-[#2563EB]">Bookstore</span> <span className="text-[#F43F7A]">Bookmark</span> <span className="text-[#2563EB]">Archive</span>
          </p>
          <p className="italic font-serif text-stone-700 max-w-xl mx-auto">
            "They saved our place; now, let’s save theirs."
          </p>
        </div>
      </footer>
    </div>
  );
}
