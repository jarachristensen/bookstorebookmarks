import React from "react";
import Link from "next/link";
import { Header } from "@/components/ui/Header";
import { BookOpen, Sparkles, Heart, Compass, Mail, ArrowRight, Instagram } from "lucide-react";

export const metadata = {
  title: "About the Archive | The Bookstore Bookmark Archive",
  description: "Preserving the fleeting paper ephemera of historic independent bookstores.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Hero Section */}
        <section className="text-center space-y-4 pb-6 border-b border-parchment-border">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-300 text-amber-900 text-xs font-mono font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-archival-oxblood" />
            <span>Curatorial Statement &amp; Mission</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-ink tracking-tight">
            Keeping Our Place in Literary History
          </h1>
          <p className="font-serif text-base sm:text-lg text-ink-light max-w-2xl mx-auto italic leading-relaxed">
            A digital sanctuary dedicated to the artistry, history, and radical spirit of independent bookstore bookmarks.
          </p>
        </section>

        {/* Story & Essay */}
        <section className="space-y-6 font-serif text-ink-light leading-relaxed text-sm sm:text-base bg-white p-6 sm:p-10 rounded-2xl border border-parchment-border shadow-xs">
          <h2 className="font-serif text-2xl font-bold text-ink flex items-center gap-2 border-b border-parchment-border pb-3">
            <BookOpen className="w-5 h-5 text-archival-oxblood" />
            <span>The Ephemera of Reading</span>
          </h2>

          <p>
            When you bought a paperback from a secondhand bookshop in Greenwich Village in 1948, or picked up a poetry chapbook along the Seine in 1965, the bookseller slipped a small slip of cardstock between the pages. It was free, utilitarian, and easily discarded.
          </p>

          <p>
            Yet these humble slips of paper—printed on letterpress cream cardstock, adorned with woodcut illustrations, stamped with opening hours and poetic slogans—became tangible relics of literary communities. They marked not only our place in a novel, but a specific moment in time and geography.
          </p>

          <div className="p-4 rounded-xl bg-parchment/60 border-l-4 border-archival-oxblood my-6 font-serif italic text-ink">
            “A bookmark is the quietest ambassador of a bookstore. Decades after the neon sign has dimmed and the lease has expired, the bookmark remains inside a forgotten volume on a library shelf.”
          </div>

          <h3 className="font-serif text-xl font-bold text-ink pt-4">Our Archival Mission</h3>
          <p>
            <strong>The Bookstore Bookmark Archive</strong> was established to catalog, scan, and preserve these physical specimens at true archival fidelity. We document:
          </p>

          <ul className="space-y-2 list-disc pl-5 font-serif text-sm">
            <li>
              <strong>Physical Specimen Analysis:</strong> Precise measurements, paper stock composition, letterpress impressions, and condition grades.
            </li>
            <li>
              <strong>Bookstore Heritage Dossiers:</strong> Founding dates, addresses, relocation journeys, and notable patron lore.
            </li>
            <li>
              <strong>Primary Press Clippings:</strong> Faded newsprint articles, grand opening announcements, and historic shop photographs.
            </li>
          </ul>

          <div className="pt-6 border-t border-parchment-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/bookstorebookmarks"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-900 text-white hover:bg-stone-800 text-xs font-serif transition-all"
              >
                <Instagram className="w-4 h-4 text-pink-400" />
                <span>Follow @bookstorebookmarks</span>
              </a>
            </div>

            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 text-xs font-serif font-bold text-archival-oxblood hover:underline"
            >
              <span>Have a bookmark to donate or a story to share?</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-parchment-border py-8 bg-[#F4EFE6] text-center text-xs font-serif text-ink-muted">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-ink">
            Bookstore Bookmark Archive &amp; Historical Research Dossier
          </p>
          <p className="italic">
            Dedicated to the memory of independent booksellers and the bookmarks that mark our reading journeys.
          </p>
        </div>
      </footer>
    </div>
  );
}
