"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/ui/Header";
import { CuratorPageToolbar } from "@/components/admin/CuratorPageToolbar";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { VisualTextarea } from "@/components/ui/VisualTextarea";
import {
  Mail,
  Send,
  Heart,
  Instagram,
  Sparkles,
  BookOpen,
  Edit3,
} from "lucide-react";

const DEFAULT_CONTENT = {
  hero_subtitle:
    "Have a rare bookstore bookmark in your collection? Know a forgotten detail about a shop’s history? We welcome your submissions and stories.",
  card1_title: "Donate a Bookstore Bookmark",
  card1_body:
    "If you have some bookstore bookmarks you'd like to donate, you can mail them to us at the archive. Every donated specimen is photographed, cataloged and researched. We will also add a note attributing you for the donation of the bookmark.",
  card1_process_title: "Mailing & Donation Process:",
  card1_process_body:
    "Reach out to us via email to request the curatorial mailing address.",
  card2_title: "Share Stories & Corrections",
  card2_body:
    "Did you work at one of these legendary bookstores? Do you remember visiting? Do you have a photograph you'd like to share? We love hearing personal memories and receiving factual corrections. If we add your story, quote, or photograph to our archive, you will be attributed for your contribution.",
  card2_process_title: "Instagram Community:",
  card2_process_body:
    "Connect directly with the curator on Instagram at @bookstorebookmarks.",
  cta_title: "Get in Touch with the Curator",
  cta_subtitle:
    "Send an inquiry directly or drop a message via Instagram.",
};

export function EditableContactPage({
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
      const draft = localStorage.getItem("draft_page_contact");
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
        localStorage.setItem("draft_page_contact", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleSave = async (): Promise<boolean | void> => {
    const res = await fetch("/api/pages/contact", {
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
        localStorage.removeItem("draft_page_contact");
      } catch {}
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Hero Section */}
        <section className="w-full flex flex-col items-center pb-6 border-b border-[#E8E2D5] space-y-4">
          <h1 className="sr-only">Contribute to the Archive — Submissions &amp; Contact</h1>
          <div className="relative w-full max-w-3xl aspect-[1975/267] select-none">
            <Image
              src="/images/contact-banner.png"
              alt="Contribute to the Archive"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Donate Physical Bookmarks */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs hover:border-[#F59E0B]/50 hover:shadow-md transition-all space-y-5 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center text-[#F59E0B]">
                <BookOpen className="w-5 h-5" />
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-[#F59E0B] uppercase tracking-wider block">
                      Card 1 Title:
                    </label>
                    <input
                      type="text"
                      value={content.card1_title}
                      onChange={(e) => handleChange("card1_title", e.target.value)}
                      className="w-full p-1.5 font-serif text-lg font-bold text-stone-900 bg-[#FAF8F5] border border-dashed border-[#F59E0B]/40 rounded"
                    />
                  </div>
                  <VisualTextarea
                    label="Card 1 Body:"
                    value={content.card1_body}
                    onChange={(val) => handleChange("card1_body", val)}
                    rows={4}
                  />
                </div>
              ) : (
                <>
                  <h2 className="font-serif text-xl font-bold text-stone-900 group-hover:text-[#F59E0B] transition-colors">
                    {content.card1_title}
                  </h2>
                  <p className="font-serif text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {content.card1_body}
                  </p>
                </>
              )}
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E2D5] space-y-2">
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={content.card1_process_title}
                    onChange={(e) => handleChange("card1_process_title", e.target.value)}
                    className="w-full p-1 font-mono text-xs font-bold text-[#F43F7A] bg-white border border-dashed border-[#F43F7A]/30 rounded uppercase tracking-wide"
                  />
                  <VisualTextarea
                    label="Process Description:"
                    value={content.card1_process_body}
                    onChange={(val) => handleChange("card1_process_body", val)}
                    rows={2}
                  />
                </div>
              ) : (
                <>
                  <p className="font-mono text-xs font-bold text-[#F43F7A] uppercase tracking-wide">
                    {content.card1_process_title}
                  </p>
                  <p className="font-serif text-xs text-stone-600">
                    {content.card1_process_body}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Card 2: Stories & Corrections */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs hover:border-[#F43F7A]/50 hover:shadow-md transition-all space-y-5 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#F43F7A]/10 border border-[#F43F7A]/20 flex items-center justify-center text-[#F43F7A]">
                <Heart className="w-5 h-5" />
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-[#F43F7A] uppercase tracking-wider block">
                      Card 2 Title:
                    </label>
                    <input
                      type="text"
                      value={content.card2_title}
                      onChange={(e) => handleChange("card2_title", e.target.value)}
                      className="w-full p-1.5 font-serif text-lg font-bold text-stone-900 bg-[#FAF8F5] border border-dashed border-[#F43F7A]/40 rounded"
                    />
                  </div>
                  <VisualTextarea
                    label="Card 2 Body:"
                    value={content.card2_body}
                    onChange={(val) => handleChange("card2_body", val)}
                    rows={4}
                  />
                </div>
              ) : (
                <>
                  <h2 className="font-serif text-xl font-bold text-stone-900 group-hover:text-[#F43F7A] transition-colors">
                    {content.card2_title}
                  </h2>
                  <p className="font-serif text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {content.card2_body}
                  </p>
                </>
              )}
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E2D5] space-y-2">
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={content.card2_process_title}
                    onChange={(e) => handleChange("card2_process_title", e.target.value)}
                    className="w-full p-1 font-mono text-xs font-bold text-[#F43F7A] bg-white border border-dashed border-[#F43F7A]/30 rounded uppercase tracking-wide"
                  />
                  <VisualTextarea
                    label="Process Description:"
                    value={content.card2_process_body}
                    onChange={(val) => handleChange("card2_process_body", val)}
                    rows={2}
                  />
                </div>
              ) : (
                <>
                  <p className="font-mono text-xs font-bold text-[#F43F7A] uppercase tracking-wide">
                    {content.card2_process_title}
                  </p>
                  <p className="font-serif text-xs text-stone-600">
                    Connect directly with the curator on Instagram at{" "}
                    <a
                      href="https://www.instagram.com/bookstorebookmarks"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-[#F43F7A] hover:underline font-mono"
                    >
                      @bookstorebookmarks
                    </a>.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Direct Contact Form / Email Strip */}
        <section className="p-6 sm:p-10 rounded-2xl bg-stone-900 text-white shadow-md space-y-6 border border-stone-800">
          <div className="space-y-2 text-center">
            {isEditing ? (
              <div className="space-y-2 max-w-lg mx-auto">
                <input
                  type="text"
                  value={content.cta_title}
                  onChange={(e) => handleChange("cta_title", e.target.value)}
                  className="w-full p-2 font-serif text-xl sm:text-2xl font-bold text-amber-100 bg-stone-800 border border-dashed border-amber-300/40 rounded-lg text-center"
                />
                <VisualTextarea
                  label="Subtitle:"
                  value={content.cta_subtitle}
                  onChange={(val) => handleChange("cta_subtitle", val)}
                  rows={2}
                />
              </div>
            ) : (
              <>
                <h3 className="font-serif text-2xl font-bold text-amber-100">
                  {content.cta_title}
                </h3>
                <p className="font-serif text-xs sm:text-sm text-stone-300 max-w-lg mx-auto">
                  {content.cta_subtitle}
                </p>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="https://www.instagram.com/bookstorebookmarks"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F43F7A] hover:bg-[#E11D48] text-white font-serif text-xs font-semibold shadow-md transition-all"
            >
              <Instagram className="w-4 h-4" />
              <span>Message on Instagram @bookstorebookmarks</span>
            </a>

            <a
              href="mailto:bookstorebookmarks@gmail.com"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-serif text-xs transition-all"
            >
              <Mail className="w-4 h-4 text-[#F59E0B]" />
              <span>Email the Archive</span>
            </a>
          </div>
        </section>

        {/* Interactive FAQ Section */}
        <FAQAccordion />
      </main>

      {/* Floating Curator Toolbar in Edit Mode */}
      {isEditing && (
        <CuratorPageToolbar
          pageName="Contact & Submissions"
          hasUnsavedChanges={hasUnsavedChanges}
          onSave={handleSave}
        />
      )}

      <footer className="border-t border-[#E8E2D5] py-8 bg-[#FAF8F5] text-center text-xs font-serif text-stone-500">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-serif text-stone-600">
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
            <Link href="/about" className="hover:text-[#F43F7A] hover:underline">
              About Archive
            </Link>
            <span>·</span>
            <Link href="/contact" className="text-[#F43F7A] font-bold hover:underline">
              Contact
            </Link>
          </div>

          <p className="font-serif font-bold text-stone-800">
            <span className="text-[#F43F7A]">The</span> <span className="text-[#2563EB]">Bookstore</span> <span className="text-[#F43F7A]">Bookmark</span> <span className="text-[#2563EB]">Archive</span>
          </p>
          <p className="text-stone-500">
            Dedicated to preserving independent bookstore ephemera, history, and physical papercraft.
          </p>
        </div>
      </footer>
    </div>
  );
}
