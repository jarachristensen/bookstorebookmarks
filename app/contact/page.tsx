import React from "react";
import Link from "next/link";
import { Header } from "@/components/ui/Header";
import { Mail, Send, Heart, MapPin, Instagram, Sparkles, AlertCircle, BookOpen } from "lucide-react";

export const metadata = {
  title: "Submissions & Contact | The Bookstore Bookmark Archive",
  description: "Submit bookstore stories, historical corrections, or donate physical bookmarks to the archive.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Hero Section */}
        <section className="text-center space-y-3 pb-6 border-b border-parchment-border">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-300 text-amber-900 text-xs font-mono font-bold tracking-wide uppercase">
            <Mail className="w-3.5 h-3.5 text-archival-oxblood" />
            <span>Curatorial Inquiries &amp; Contributions</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-ink tracking-tight">
            Contribute to the Archive
          </h1>
          <p className="font-serif text-base sm:text-lg text-ink-light max-w-2xl mx-auto italic leading-relaxed">
            Have a rare bookstore bookmark in your collection? Know a forgotten detail about a shop’s history? We welcome your submissions and stories.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Donate Physical Bookmarks */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-parchment-border shadow-xs space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-archival-oxblood">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2 className="font-serif text-xl font-bold text-ink">
                Donate a Bookstore Bookmark
              </h2>
              <p className="font-serif text-xs sm:text-sm text-ink-light leading-relaxed">
                If you have vintage bookstore bookmarks tucked inside old books, in shoe boxes, or inherited from family, you can mail them to the archive. Every donated specimen is scanned at 1200 DPI archival resolution, cataloged with physical dimensions, and permanently attributed to your contribution.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-parchment/60 border border-parchment-border space-y-2">
              <p className="font-mono text-xs font-bold text-archival-oxblood uppercase tracking-wide">
                Mailing &amp; Donation Process:
              </p>
              <p className="font-serif text-xs text-ink-light">
                Reach out to us via email or Instagram DM to request the curatorial mailing address and packaging tips for safe transit.
              </p>
            </div>
          </div>

          {/* Card 2: Stories & Corrections */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-parchment-border shadow-xs space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-archival-oxblood">
                <Heart className="w-5 h-5" />
              </div>
              <h2 className="font-serif text-xl font-bold text-ink">
                Share Stories &amp; Corrections
              </h2>
              <p className="font-serif text-xs sm:text-sm text-ink-light leading-relaxed">
                Did you work at one of these legendary bookstores? Do you know the exact year a store relocated to a new address, or have a photograph of the original storefront? We love hearing personal memories and receiving factual corrections.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-parchment/60 border border-parchment-border space-y-2">
              <p className="font-mono text-xs font-bold text-archival-oxblood uppercase tracking-wide">
                Instagram Community:
              </p>
              <p className="font-serif text-xs text-ink-light">
                Connect directly with the curator on Instagram at{" "}
                <a
                  href="https://www.instagram.com/bookstorebookmarks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-rose-700 hover:underline font-mono"
                >
                  @bookstorebookmarks
                </a>.
              </p>
            </div>
          </div>
        </div>

        {/* Direct Contact Form / Email Strip */}
        <section className="p-6 sm:p-10 rounded-2xl bg-stone-900 text-white shadow-md space-y-6">
          <div className="space-y-2 text-center">
            <h3 className="font-serif text-2xl font-bold text-amber-100">
              Get in Touch with the Curator
            </h3>
            <p className="font-serif text-xs sm:text-sm text-stone-300 max-w-lg mx-auto italic">
              Send an inquiry directly or drop a message via Instagram.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="https://www.instagram.com/bookstorebookmarks"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 text-white font-serif text-xs font-semibold shadow-md hover:opacity-95 transition-all"
            >
              <Instagram className="w-4 h-4" />
              <span>Message on Instagram @bookstorebookmarks</span>
            </a>

            <a
              href="mailto:curator@bookstorebookmarks.com"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-serif text-xs transition-all"
            >
              <Mail className="w-4 h-4 text-amber-400" />
              <span>Email the Archive</span>
            </a>
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
