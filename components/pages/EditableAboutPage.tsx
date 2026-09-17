"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/ui/Header";
import { CuratorPageToolbar } from "@/components/admin/CuratorPageToolbar";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { VisualTextarea } from "@/components/ui/VisualTextarea";
import { BookOpen, ArrowRight, Instagram, Edit3 } from "lucide-react";

const DEFAULT_CONTENT = {
  hero_subtitle:
    "A digital sanctuary dedicated to the often overlooked artistry and history of bookstore bookmarks, and the bookstores that created them.",
  essay_title: "The Ephemera of Reading",
  essay_p1:
    "A universal experience. You hand the clerk your money, but before the bookseller hands over your stack of books, they quietly slip a small piece of cardstock between the pages. The bookstore bookmark. It's free, utilitarian, and easily forgotten and discarded.",
  essay_p2:
    "Yet these humble slips of paper—printed on cardstock, or even just printer paper, adorned with illustrations, stamped with opening hours and poetic slogans—became tangible relics of literary communities. They marked not only our place in a novel, but a specific moment in time and geography.",
  essay_p3:
    "A bookmark is the quietest ambassador of a bookstore. Decades after the OPEN has dimmed and the lease has expired, the bookmark remains. Often inside a forgotten volume.",
  quote_callout:
    "“A bit like viewing gravestones, they underscore the often-fleeting nature of success” — Larry Hoefling, Owner of the (now closed) McHuston's Bookstore in Broken Arrow, OK.",
  mission_title: "Our Archival Mission:",
  mission_body:
    "The Bookstore Bookmark Archive was established to preserve, catalog, and research these ephemeral pieces of history and learn about the bookstores that distributed them.",
  mission_p1:
    "This archive exists to preserve the physical slips of cardstock that bookstores produced to guide our reading and anchor us to their shelves.",
  mission_p2:
    "Independent bookstores are vital community anchors. As bookshops navigate shifting economic headwinds, their bookmarks preserve the addresses, graphic designs, telephone numbers, and cultural histories of brick-and-mortar booksellers across the globe.",
  contribute_title: "Help Us Preserve More Bookmarks",
  contribute_desc:
    "Do you have vintage bookstore bookmarks tucked away in your personal library? We welcome contributions from readers, collectors, and booksellers.",
};

export function EditableAboutPage({
  initialContent = {},
}: {
  initialContent?: Record<string, string>;
}) {
  const searchParams = useSearchParams();
  const isEditing = searchParams?.get("edit") === "true";

  const [content, setContent] = useState<Record<string, string>>({
    ...DEFAULT_CONTENT,
    ...initialContent,
  });

  const [savedSnapshot, setSavedSnapshot] = useState<Record<string, string>>({
    ...DEFAULT_CONTENT,
    ...initialContent,
  });

  // Restore draft from localStorage if available
  useEffect(() => {
    try {
      const draft = localStorage.getItem("draft_page_about");
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed && typeof parsed === "object") {
          setContent((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch {}
  }, []);

  const hasUnsavedChanges =
    JSON.stringify(content) !== JSON.stringify(savedSnapshot);

  const handleChange = (key: string, value: string) => {
    setContent((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem("draft_page_about", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleSave = async (): Promise<boolean | void> => {
    const res = await fetch("/api/pages/about", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sections: content }),
    });

    if (res.status === 401) {
      return false;
    }

    if (!res.ok) {
      throw new Error(`Failed to save: ${res.statusText}`);
    }

    const data = await res.json();
    if (data.success && data.content) {
      setSavedSnapshot({ ...DEFAULT_CONTENT, ...data.content });
      setContent({ ...DEFAULT_CONTENT, ...data.content });
      try {
        localStorage.removeItem("draft_page_about");
      } catch {}
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Hero Banner Artwork */}
        <section className="w-full flex flex-col items-center pb-6 border-b border-[#E8E2D5] space-y-4">
          <h1 className="sr-only">About the Archive — Keeping Our Place in Literary History</h1>
          <div className="relative w-full max-w-3xl aspect-[1606/267] select-none">
            <Image
              src="/images/about-banner.png"
              alt="About The Bookstore Bookmark Archive"
              fill
              unoptimized
              priority
              className="object-contain object-center w-full h-full"
            />
          </div>

          {isEditing ? (
            <div className="w-full max-w-2xl">
              <VisualTextarea
                label="Edit Hero Subtitle:"
                value={content.hero_subtitle}
                onChange={(val) => handleChange("hero_subtitle", val)}
                rows={3}
              />
            </div>
          ) : (
            <p className="font-serif text-base sm:text-lg text-stone-600 max-w-2xl text-center mx-auto leading-relaxed">
              {content.hero_subtitle}
            </p>
          )}
        </section>

        {/* Story & Essay */}
        <section className="space-y-6 font-serif text-stone-700 leading-relaxed text-sm sm:text-base bg-white p-6 sm:p-10 rounded-2xl border border-[#E8E2D5] shadow-xs">
          <div className="flex items-center gap-2 border-b border-[#E8E2D5] pb-3">
            <BookOpen className="w-5 h-5 text-[#F43F7A]" />
            {isEditing ? (
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-mono font-bold text-[#F43F7A] uppercase tracking-wider block">
                  Essay Title
                </label>
                <input
                  type="text"
                  value={content.essay_title}
                  onChange={(e) => handleChange("essay_title", e.target.value)}
                  className="w-full p-2 font-serif text-xl sm:text-2xl font-bold text-stone-900 bg-[#FAF8F5] border border-dashed border-[#F43F7A]/40 rounded-lg focus:border-[#2563EB] focus:outline-hidden"
                />
              </div>
            ) : (
              <h2 className="font-serif text-2xl font-bold text-stone-900">
                {content.essay_title}
              </h2>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <VisualTextarea
                label="Essay Paragraph 1:"
                value={content.essay_p1}
                onChange={(val) => handleChange("essay_p1", val)}
                rows={3}
              />

              <VisualTextarea
                label="Essay Paragraph 2:"
                value={content.essay_p2}
                onChange={(val) => handleChange("essay_p2", val)}
                rows={3}
              />

              <VisualTextarea
                label="Essay Paragraph 3:"
                value={content.essay_p3}
                onChange={(val) => handleChange("essay_p3", val)}
                rows={3}
              />

              <VisualTextarea
                label="Larry Hoefling Quote Callout:"
                value={content.quote_callout}
                onChange={(val) => handleChange("quote_callout", val)}
                rows={2}
              />

              <div className="pt-4 border-t border-[#E8E2D5] space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-stone-700 uppercase tracking-wider block">
                    Mission Section Title:
                  </label>
                  <input
                    type="text"
                    value={content.mission_title}
                    onChange={(e) => handleChange("mission_title", e.target.value)}
                    className="w-full p-2 font-serif text-lg font-bold text-stone-900 bg-[#FAF8F5] border border-dashed border-stone-300 rounded-lg"
                  />
                </div>
                <VisualTextarea
                  label="Mission Body:"
                  value={content.mission_body}
                  onChange={(val) => handleChange("mission_body", val)}
                  rows={2}
                />
              </div>
            </div>
          ) : (
            <>
              <p>{content.essay_p1}</p>
              <p>{content.essay_p2}</p>
              <p>{content.essay_p3}</p>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border-l-4 border-[#F43F7A] my-6 font-serif text-stone-800">
                {content.quote_callout}
              </div>

              <div className="pt-4 border-t border-[#E8E2D5]/70 space-y-3">
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  {content.mission_title}
                </h3>
                <p>{content.mission_body}</p>
              </div>
            </>
          )}

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

      {/* Floating Curator Toolbar in Edit Mode */}
      {isEditing && (
        <CuratorPageToolbar
          pageName="About Archive"
          hasUnsavedChanges={hasUnsavedChanges}
          onSave={handleSave}
        />
      )}

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
