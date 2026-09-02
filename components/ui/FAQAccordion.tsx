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
    question: "Who is behind the bookstore bookmark archive?",
    answer: (
      <p>
        My name is Jara. If it's not already obvious, I love ephemera, books, city histories and collecting things. Bookstore bookmarks neatly covers all of the above.
      </p>
    ),
  },
  {
    question: "What kind of bookmarks do you want?",
    answer: (
      <p>
        Any bookstore bookmark. New or old, modern or outdated. Eventually I will be adding a separate library for...well...libraries! So any library bookmarks are also welcome. Online bookstore bookmarks are welcome, as are author/publisher bookmarks.
      </p>
    ),
  },
  {
    question: "Can I just send you photographs of my bookmarks?",
    answer: (
      <p>
        Currently I am only cataloging items I have in my physical possession. Part of this project is organizing and protecting the bookmarks to ensure they are around for many decades to come.
      </p>
    ),
  },
  {
    question: "I have some, but they are in terrible condition, do you still want them?",
    answer: (
      <p>
        Anything you have a question about, you can send me a picture on instagram or through email. Don't be afraid to ask! I don't mind damaged bookmarks, especially if I don't have it in my collection.
      </p>
    ),
  },
  {
    question: "Will you buy the bookmarks from me? or pay for shipping?",
    answer: (
      <p>
        This is entirely possible, just send me an email letting me know how many you have/what you are asking. I would be happy to put forth some money to expand this collection.
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
