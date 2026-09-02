"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import Link from "next/link";

export interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

const DEFAULT_FAQS: FAQItem[] = [
  {
    question: "What is the Bookstore Bookmark Archive?",
    answer: (
      <p>
        The Bookstore Bookmark Archive is an independent digital preservation project dedicated to scanning, cataloging, and researching bookstore bookmarks and the cultural history of the independent bookshops that created and distributed them.
      </p>
    ),
  },
  {
    question: "How can I donate bookmarks to the archive?",
    answer: (
      <p>
        We gladly accept physical bookmark donations! Every donated specimen is high-resolution photographed, cataloged with physical dimensions, and researched. We also add a permanent note attributing you for the donation. Please visit our{" "}
        <Link href="/contact" className="text-archival-oxblood font-semibold hover:underline">
          Contact page
        </Link>{" "}
        to request our curatorial mailing address.
      </p>
    ),
  },
  {
    question: "How do you research and construct bookstore timelines?",
    answer: (
      <p>
        We cross-examine primary historical sources including newspaper archives, grand opening announcements, vintage storefront advertisements, city directories, and first-hand accounts from former booksellers and patrons to reconstruct accurate dates, relocations, and lore.
      </p>
    ),
  },
  {
    question: "Why are bookmarks displayed to true physical scale?",
    answer: (
      <p>
        Unlike uniform thumbnail galleries, our Archival Specimen Tray renders bookmarks proportional to their exact physical inch measurements (e.g., 2.25″ × 7.5″) on a velvet collector's tray so you can experience the true physical format, proportions, and tactile feel of each piece.
      </p>
    ),
  },
  {
    question: "How are bookmarks scanned and digitized?",
    answer: (
      <p>
        Specimens are captured with archival precision, preserving delicate paper textures, deckled edges, letterpress ink impressions, and reverse-side stamps.
      </p>
    ),
  },
  {
    question: "Can I submit a correction, personal story, or historic shop photo?",
    answer: (
      <p>
        Yes! If you worked at one of these legendary bookstores, remember visiting, or have historic photographs or corrections to share, we would love to hear from you. Reach out via our{" "}
        <Link href="/contact" className="text-archival-oxblood font-semibold hover:underline">
          Contact page
        </Link>{" "}
        or on Instagram at{" "}
        <a
          href="https://www.instagram.com/bookstorebookmarks"
          target="_blank"
          rel="noopener noreferrer"
          className="text-archival-oxblood font-semibold hover:underline font-mono"
        >
          @bookstorebookmarks
        </a>
        .
      </p>
    ),
  },
];

export function FAQAccordion({ items = DEFAULT_FAQS }: { items?: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 border-b border-parchment-border pb-3">
        <HelpCircle className="w-5 h-5 text-archival-oxblood" />
        <h2 className="font-serif text-2xl font-bold text-ink">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="space-y-3 pt-2">
        {items.map((item, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div
              key={idx}
              className="rounded-xl bg-white border border-parchment-border shadow-2xs overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-parchment-light/60 transition-colors"
                aria-expanded={isOpen}
              >
                <span className="font-serif font-bold text-sm sm:text-base text-ink">
                  {item.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-archival-oxblood shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 font-serif text-xs sm:text-sm text-ink-light leading-relaxed border-t border-parchment-border/40 bg-parchment/20">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
