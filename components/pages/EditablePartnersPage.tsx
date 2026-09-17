"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/ui/Header";
import { CuratorPageToolbar } from "@/components/admin/CuratorPageToolbar";
import { VisualTextarea } from "@/components/ui/VisualTextarea";
import {
  HeartHandshake,
  BookOpen,
  Building2,
  Sparkles,
  ArrowRight,
  Instagram,
  ShieldCheck,
  Gift,
  Library,
  Edit3,
} from "lucide-react";

const DEFAULT_CONTENT = {
  hero_subtitle:
    "The Bookstore Bookmark Archive began as a personal collection, but can continue to grow on a larger scale with the help of used booksellers and collectors alike! This page is dedicated to those who have contributed to our library.",
  letter_title: "With Deep Gratitude from the Curator",
  letter_p1:
    "Every physical bookmark cataloged in this archive began its life between the pages of a purchased book. Over decades, many were saved in desk drawers, pressed into personal collections, or passed down from bibliophiles who loved their neighborhood bookshops.",
  letter_p2:
    "When you donate physical bookmarks or share historical photographs and newspaper clippings with us, you help ensure that these fragile paper specimens and the cultural legacies of the shops that printed them remain preserved and freely accessible for future generations of book lovers.",
  letter_quote:
    "“Part of this project is organizing, cataloging, and physically protecting each bookmark in archival sleeves to ensure they remain preserved for decades to come.”",
  card1_title: "Bookstore Partners & Booksellers",
  card1_desc:
    "Operating and legacy independent bookstores who provide historical bookmarks, store ephemera, and photographs from their archives.",
  card2_title: "Collectors & Donors",
  card2_desc:
    "Generous readers and ephemera collectors who mail original bookmarks and share family memories of visiting historic bookshops.",
  card3_title: "Libraries & Archives",
  card3_desc:
    "Special collections, historical societies, and local libraries that assist with clipping verification and historical research.",
  cta_title: "Have Bookmarks to Donate or Want to Partner?",
  cta_desc:
    "We welcome bookstore bookmarks of any era, condition, and country, as well as future library bookmarks.",
};

export function EditablePartnersPage({
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
      const draft = localStorage.getItem("draft_page_partners");
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
        localStorage.setItem("draft_page_partners", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleSave = async (): Promise<boolean | void> => {
    const res = await fetch("/api/pages/partners", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sections: content }),
    });

    if (res.status === 401) {
      return false; // Triggers auth modal in toolbar
    }

    if (!res.ok) {
      throw new Error(`Failed to save: ${res.statusText}`);
    }

    const data = await res.json();
    if (data.success && data.content) {
      setSavedSnapshot({ ...DEFAULT_CONTENT, ...data.content });
      setContent({ ...DEFAULT_CONTENT, ...data.content });
      try {
        localStorage.removeItem("draft_page_partners");
      } catch {}
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* 1. Page Header / Hero Banner Artwork */}
        <section className="w-full flex flex-col items-center pb-6 border-b border-[#E8E2D5] space-y-4">
          <h1 className="sr-only">Partners &amp; Donors — Community Honor Roll</h1>
          <div className="relative w-full max-w-4xl aspect-[1617/253] select-none">
            <Image
              src="/images/partners-banner.png"
              alt="Partners & Donors"
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

        {/* 2. Curator's Letter of Appreciation */}
        <section className="bg-white p-6 sm:p-10 rounded-2xl border border-[#E8E2D5] shadow-xs space-y-5 font-serif text-stone-600 leading-relaxed text-sm sm:text-base">
          <div className="flex items-center gap-2.5 border-b border-[#E8E2D5] pb-3">
            <Sparkles className="w-5 h-5 text-[#F59E0B]" />
            {isEditing ? (
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-mono font-bold text-[#F59E0B] uppercase tracking-wider block">
                  Curator Letter Title
                </label>
                <input
                  type="text"
                  value={content.letter_title}
                  onChange={(e) => handleChange("letter_title", e.target.value)}
                  className="w-full p-2 font-serif text-xl sm:text-2xl font-bold text-stone-900 bg-[#FAF8F5] border border-dashed border-[#F59E0B]/50 rounded-lg focus:border-[#2563EB] focus:outline-hidden"
                />
              </div>
            ) : (
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                {content.letter_title}
              </h2>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <VisualTextarea
                label="Letter Paragraph 1:"
                value={content.letter_p1}
                onChange={(val) => handleChange("letter_p1", val)}
                rows={3}
              />

              <VisualTextarea
                label="Letter Paragraph 2:"
                value={content.letter_p2}
                onChange={(val) => handleChange("letter_p2", val)}
                rows={3}
              />

              <VisualTextarea
                label="Callout Quote:"
                value={content.letter_quote}
                onChange={(val) => handleChange("letter_quote", val)}
                rows={2}
              />
            </div>
          ) : (
            <>
              <p>{content.letter_p1}</p>
              <p>{content.letter_p2}</p>
              <div className="p-4 rounded-xl bg-[#FAF8F5] border-l-4 border-[#F43F7A] border-y border-r border-[#E8E2D5] text-stone-800 text-xs sm:text-sm">
                {content.letter_quote}
              </div>
            </>
          )}
        </section>

        {/* 3. Partner & Donor Recognition Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Booksellers & Bookstores */}
          <div className="p-6 rounded-2xl bg-white border border-[#E8E2D5] hover:border-[#F43F7A]/50 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#F43F7A]/10 border border-[#F43F7A]/20 flex items-center justify-center text-[#F43F7A]">
                <Building2 className="w-5 h-5" />
              </div>
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={content.card1_title}
                    onChange={(e) => handleChange("card1_title", e.target.value)}
                    className="w-full p-1.5 font-serif text-base font-bold text-stone-900 bg-[#FAF8F5] border border-dashed border-[#F43F7A]/40 rounded"
                  />
                  <VisualTextarea
                    label="Description:"
                    value={content.card1_desc}
                    onChange={(val) => handleChange("card1_desc", val)}
                    rows={3}
                  />
                </div>
              ) : (
                <>
                  <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-[#F43F7A] transition-colors">
                    {content.card1_title}
                  </h3>
                  <p className="font-serif text-xs text-stone-600 leading-relaxed">
                    {content.card1_desc}
                  </p>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-[#E8E2D5]">
              <span className="text-[11px] font-mono font-medium text-[#F43F7A]">
                ✦ Supporting shop legacies
              </span>
            </div>
          </div>

          {/* Card 2: Individual Donors & Collectors */}
          <div className="p-6 rounded-2xl bg-white border border-[#E8E2D5] hover:border-[#F59E0B]/50 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center text-[#F59E0B]">
                <Gift className="w-5 h-5" />
              </div>
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={content.card2_title}
                    onChange={(e) => handleChange("card2_title", e.target.value)}
                    className="w-full p-1.5 font-serif text-base font-bold text-stone-900 bg-[#FAF8F5] border border-dashed border-[#F59E0B]/40 rounded"
                  />
                  <VisualTextarea
                    label="Description:"
                    value={content.card2_desc}
                    onChange={(val) => handleChange("card2_desc", val)}
                    rows={3}
                  />
                </div>
              ) : (
                <>
                  <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-[#F59E0B] transition-colors">
                    {content.card2_title}
                  </h3>
                  <p className="font-serif text-xs text-stone-600 leading-relaxed">
                    {content.card2_desc}
                  </p>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-[#E8E2D5]">
              <span className="text-[11px] font-mono font-medium text-[#F59E0B]">
                ✦ Individual donor attribution
              </span>
            </div>
          </div>

          {/* Card 3: Libraries & Cultural Archives */}
          <div className="p-6 rounded-2xl bg-white border border-[#E8E2D5] hover:border-[#10B981]/50 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981]">
                <Library className="w-5 h-5" />
              </div>
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={content.card3_title}
                    onChange={(e) => handleChange("card3_title", e.target.value)}
                    className="w-full p-1.5 font-serif text-base font-bold text-stone-900 bg-[#FAF8F5] border border-dashed border-[#10B981]/40 rounded"
                  />
                  <VisualTextarea
                    label="Description:"
                    value={content.card3_desc}
                    onChange={(val) => handleChange("card3_desc", val)}
                    rows={3}
                  />
                </div>
              ) : (
                <>
                  <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-[#10B981] transition-colors">
                    {content.card3_title}
                  </h3>
                  <p className="font-serif text-xs text-stone-600 leading-relaxed">
                    {content.card3_desc}
                  </p>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-[#E8E2D5]">
              <span className="text-[11px] font-mono font-medium text-[#10B981]">
                ✦ Historical preservation
              </span>
            </div>
          </div>
        </div>

        {/* 4. Curatorial Preservation Promise */}
        <section className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E8E2D5] space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#F43F7A]" />
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Our Donor Recognition &amp; Archival Care Promise
            </h3>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm font-serif text-stone-600">
            <li className="flex items-start gap-2">
              <span className="text-[#F43F7A] font-bold mt-0.5">✦</span>
              <span><strong>Permanent Physical Care:</strong> Every donated bookmark is stored in acid-free archival sleeves.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#F43F7A] font-bold mt-0.5">✦</span>
              <span><strong>Curatorial Attribution:</strong> Donors are credited directly on the catalog specimen record and acquisition dossier.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#F43F7A] font-bold mt-0.5">✦</span>
              <span><strong>True-Scale Digitization:</strong> High-resolution front &amp; back scans capture every detail of typography and printing.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#F43F7A] font-bold mt-0.5">✦</span>
              <span><strong>Non-Commercial Mission:</strong> The archive is a free, public educational resource for book and history lovers.</span>
            </li>
          </ul>
        </section>

        {/* 5. Call to Action: Donate or Get in Touch */}
        <section className="p-8 sm:p-10 rounded-2xl bg-stone-900 text-white shadow-lg text-center space-y-6 border border-stone-800">
          <div className="space-y-2 max-w-xl mx-auto">
            {isEditing ? (
              <div className="space-y-2 max-w-xl mx-auto">
                <input
                  type="text"
                  value={content.cta_title}
                  onChange={(e) => handleChange("cta_title", e.target.value)}
                  className="w-full p-2 font-serif text-xl sm:text-2xl font-bold text-amber-100 bg-stone-800 border border-dashed border-amber-300/40 rounded-lg text-center"
                />
                <VisualTextarea
                  label="Description:"
                  value={content.cta_desc}
                  onChange={(val) => handleChange("cta_desc", val)}
                  rows={2}
                />
              </div>
            ) : (
              <>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100">
                  {content.cta_title}
                </h2>
                <p className="font-serif text-xs sm:text-sm text-stone-300">
                  {content.cta_desc}
                </p>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F43F7A] hover:bg-[#E11D48] text-white text-xs sm:text-sm font-serif font-bold shadow-md transition-all group"
            >
              <span>Donate Bookmarks &amp; Contact Us</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <a
              href="https://www.instagram.com/bookstorebookmarks"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 border border-white/20 text-xs sm:text-sm font-serif transition-all"
            >
              <Instagram className="w-4 h-4 text-[#F43F7A]" />
              <span>Message on Instagram</span>
            </a>
          </div>
        </section>
      </main>

      {/* Floating Curator Toolbar in Edit Mode */}
      {isEditing && (
        <CuratorPageToolbar
          pageName="Partners & Donors"
          hasUnsavedChanges={hasUnsavedChanges}
          onSave={handleSave}
        />
      )}

      {/* Footer */}
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
            <Link href="/partners" className="text-[#F43F7A] font-bold hover:underline">
              Partners &amp; Donors
            </Link>
            <span>·</span>
            <Link href="/about" className="hover:text-[#F43F7A] hover:underline">
              About Archive
            </Link>
            <span>·</span>
            <Link href="/contact" className="hover:text-[#F43F7A] hover:underline">
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
