"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BookmarkWithDetails } from "@/lib/db/queries";
import { parseDimensions } from "@/lib/utils/dimensions";
import { BookmarkInspector } from "@/components/exhibit/BookmarkInspector";
import { Header } from "@/components/ui/Header";
import { CuratorPageToolbar } from "@/components/admin/CuratorPageToolbar";
import { VisualTextarea } from "@/components/ui/VisualTextarea";
import {
  ArrowLeftRight,
  Search,
  Check,
  Plus,
  Trash2,
  Send,
  X,
  Layers,
  HelpCircle,
  Eye,
  BookOpen,
  Mail,
  CheckCircle2,
  Edit3,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface TradingHubClientProps {
  initialBookmarks: BookmarkWithDetails[];
  initialContent?: Record<string, string>;
}

export interface FAQItem {
  question: string;
  answer: string;
}

const DEFAULT_FAQS: FAQItem[] = [
  {
    question: "What kind of bookmarks can I offer in trade?",
    answer:
      "We trade duplicate bookstore bookmarks for other authentic indie bookstore bookmarks, antiquarian bookseller slips, or historic reading ephemera we don't already have in the archive.",
  },
  {
    question: "What condition are these duplicate bookmarks in?",
    answer:
      "Every duplicate specimen is in collectible, authentic condition (Very Good to Mint) and stored in an archival polyester sleeve.",
  },
  {
    question: "How do we complete the swap?",
    answer:
      "Once you submit your trade proposal with the items you're offering, the curator will follow up by email to confirm the swap and exchange mailing addresses.",
  },
];

const DEFAULT_CONTENT: Record<string, string> = {
  hero_subtitle:
    "A dedicated exchange for fellow bookmark collectors, ephemera archivists, and indie bookstore lovers to swap duplicate bookmarks.",
  intro_title: "The Collector's Duplicate Exchange",
  intro_p1:
    "Welcome to the Bookmark Bazaar! Over decades of browsing antiquarian bookshops, library sales, and paper ephemera fairs, I have gathered multiple copies of several cherished bookstore bookmarks.",
  intro_p2:
    "This page is dedicated to fellow collectors, archivist enthusiasts, and independent bookstore lovers who would like to swap duplicates.",
  how_it_works_title: "How Trades Work",
  step1_text:
    "Browse Available Duplicates: Every specimen below is an authentic bookstore bookmark with verified duplicate copies in the archive.",
  step2_text:
    "Select Bookmarks for Trade: Click '+ Add' on any bookmarks you would like to acquire.",
  step3_text:
    "Submit Your Offer: Open the floating swap drawer below to submit a proposal describing the bookmarks or historic ephemera you would like to offer in exchange!",
  faq_title: "Trading & Exchange FAQ",
  faqs_json: JSON.stringify(DEFAULT_FAQS),
};

export function TradingHubClient({
  initialBookmarks,
  initialContent = {},
}: TradingHubClientProps) {
  const searchParams = useSearchParams();
  const isEditing = searchParams?.get("edit") === "true";

  // Editable Page Content State
  const [content, setContent] = useState<Record<string, string>>({
    ...DEFAULT_CONTENT,
    ...initialContent,
  });

  const [savedSnapshot, setSavedSnapshot] = useState<Record<string, string>>({
    ...DEFAULT_CONTENT,
    ...initialContent,
  });

  // Restore draft from localStorage on initial load if available
  useEffect(() => {
    try {
      const localDraft = localStorage.getItem("draft_page_trading");
      if (localDraft) {
        const parsed = JSON.parse(localDraft);
        if (parsed && typeof parsed === "object") {
          setContent((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch {}
  }, []);

  const hasUnsavedChanges =
    JSON.stringify(content) !== JSON.stringify(savedSnapshot);

  const handleUpdateContent = (key: string, value: string) => {
    setContent((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem("draft_page_trading", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Structured FAQs Helper
  const currentFaqs: FAQItem[] = useMemo(() => {
    if (content.faqs_json) {
      try {
        const parsed = JSON.parse(content.faqs_json);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return DEFAULT_FAQS;
  }, [content.faqs_json]);

  const handleFaqChange = (index: number, field: "question" | "answer", value: string) => {
    const updated = [...currentFaqs];
    updated[index] = { ...updated[index], [field]: value };
    handleUpdateContent("faqs_json", JSON.stringify(updated));
  };

  const handleAddFaq = () => {
    const updated = [
      ...currentFaqs,
      { question: "New Question?", answer: "Write the answer here..." },
    ];
    handleUpdateContent("faqs_json", JSON.stringify(updated));
  };

  const handleRemoveFaq = (index: number) => {
    const updated = currentFaqs.filter((_, i) => i !== index);
    handleUpdateContent("faqs_json", JSON.stringify(updated));
  };

  const handleSave = async (): Promise<boolean | void> => {
    const res = await fetch("/api/pages/trading", {
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
        localStorage.removeItem("draft_page_trading");
      } catch {}
    }
  };

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBookstore, setSelectedBookstore] = useState("all");
  const [selectedCondition, setSelectedCondition] = useState("all");

  // Trade Proposal Basket State
  const [selectedBookmarks, setSelectedBookmarks] = useState<BookmarkWithDetails[]>([]);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [proposalSubmitted, setProposalSubmitted] = useState(false);
  const [collectorName, setCollectorName] = useState("");
  const [collectorEmail, setCollectorEmail] = useState("");
  const [offeredItemsText, setOfferedItemsText] = useState("");

  // Bookmark Inspector Modal
  const [inspectingBookmark, setInspectingBookmark] = useState<BookmarkWithDetails | null>(null);

  // Lock body scroll when modal or inspector is open
  useEffect(() => {
    if (inspectingBookmark || isProposalModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [inspectingBookmark, isProposalModalOpen]);

  // Unique bookstores represented in trade inventory
  const uniqueBookstores = useMemo(() => {
    const map = new Map<string, string>();
    initialBookmarks.forEach((bm) => {
      if (bm.bookstore) {
        map.set(bm.bookstore.id, bm.bookstore.name);
      }
    });
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [initialBookmarks]);

  // Filtered Bookmarks List
  const filteredBookmarks = useMemo(() => {
    return initialBookmarks.filter((bm) => {
      if (selectedBookstore !== "all" && bm.bookstoreId !== selectedBookstore) {
        return false;
      }
      if (selectedCondition !== "all" && !bm.condition.toLowerCase().includes(selectedCondition.toLowerCase())) {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = bm.title.toLowerCase().includes(q);
        const storeMatch = bm.bookstore?.name.toLowerCase().includes(q);
        const cityMatch = bm.bookstore?.city.toLowerCase().includes(q);
        const accMatch = bm.accessionNo.toLowerCase().includes(q);
        const matMatch = bm.material.toLowerCase().includes(q);
        return titleMatch || storeMatch || cityMatch || accMatch || matMatch;
      }
      return true;
    });
  }, [initialBookmarks, selectedBookstore, selectedCondition, searchQuery]);

  // Toggle selection for trade proposal
  const toggleBookmarkSelection = (bookmark: BookmarkWithDetails) => {
    setSelectedBookmarks((prev) => {
      const exists = prev.some((b) => b.id === bookmark.id);
      if (exists) {
        return prev.filter((b) => b.id !== bookmark.id);
      } else {
        return [...prev, bookmark];
      }
    });
  };

  const removeSelectedBookmark = (id: string) => {
    setSelectedBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const clearSelection = () => {
    setSelectedBookmarks([]);
  };

  // Generate Mailto Link / Form submission
  const handleSendProposal = (e: React.FormEvent) => {
    e.preventDefault();
    const itemsList = selectedBookmarks
      .map((b, i) => `${i + 1}. ${b.title} (${b.accessionNo}) - ${b.bookstore?.name || "Bookstore"}`)
      .join("\n");

    const subject = encodeURIComponent(
      `[Bookmark Trade Proposal] ${selectedBookmarks.length} Items Selected - from ${collectorName || "Collector"}`
    );

    const body = encodeURIComponent(
      `Hello Curator,\n\nI am interested in proposing a trade for the following bookmark duplicates from the Bookmark Bazaar:\n\n${itemsList}\n\n` +
      `Items I am offering in exchange:\n${offeredItemsText}\n\n` +
      `Collector Contact:\nName: ${collectorName}\nEmail: ${collectorEmail}\n\n` +
      `Best regards,\n${collectorName}`
    );

    window.location.href = `mailto:curator@bookstorebookmarks.com?subject=${subject}&body=${body}`;
    setProposalSubmitted(true);
  };

  // Pack bookmarks into alternating filled rows: 3 portraits per row, 2 landscapes per row
  const groupedRows = useMemo(() => {
    const portraits: BookmarkWithDetails[] = [];
    const landscapes: BookmarkWithDetails[] = [];

    for (const bm of filteredBookmarks) {
      const dim = parseDimensions(bm.dimensions);
      if (dim.isLandscape) {
        landscapes.push(bm);
      } else {
        portraits.push(bm);
      }
    }

    const rows: { type: "portrait" | "landscape"; items: BookmarkWithDetails[] }[] = [];
    let pIdx = 0;
    let lIdx = 0;

    while (pIdx < portraits.length || lIdx < landscapes.length) {
      // 1 full row of up to 3 portrait bookmarks
      if (pIdx < portraits.length) {
        const chunk = portraits.slice(pIdx, pIdx + 3);
        rows.push({ type: "portrait", items: chunk });
        pIdx += 3;
      }

      // 1 full row of up to 2 landscape bookmarks
      if (lIdx < landscapes.length) {
        const chunk = landscapes.slice(lIdx, lIdx + 2);
        rows.push({ type: "landscape", items: chunk });
        lIdx += 2;
      }
    }

    return rows;
  }, [filteredBookmarks]);

  // Card Renderers
  const renderPortraitCard = (bookmark: BookmarkWithDetails) => {
    const isSelected = selectedBookmarks.some((b) => b.id === bookmark.id);
    const qty = bookmark.tradeQuantity || 1;

    return (
      <div
        key={bookmark.id}
        className={`group relative rounded-2xl bg-white border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
          isSelected
            ? "border-[#2563EB] ring-2 ring-[#2563EB]/20 bg-blue-50/20"
            : "border-[#E8E2D5] hover:border-[#F43F7A]/50"
        }`}
      >
        {/* Duplicate Count Badge (Top-Left) */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-amber-500 text-white shadow-xs border border-amber-600">
            <span>✕ {qty}</span>
            <span className="hidden sm:inline font-sans text-[10px] normal-case font-normal">
              {qty === 1 ? "extra" : "extras"}
            </span>
          </span>
        </div>

        {/* Bookmark Visual Display Container */}
        <div
          onClick={() => setInspectingBookmark(bookmark)}
          className="relative w-full h-72 pt-10 pb-4 px-6 flex items-center justify-center cursor-pointer bg-[#FAF8F5]/80 hover:bg-[#FAF8F5] transition-colors group-hover:scale-[1.01]"
          title="Click to flip and inspect full specimen"
        >
          <div className="relative w-full h-full max-w-[160px] drop-shadow-md group-hover:drop-shadow-xl transition-all duration-300">
            <Image
              src={bookmark.frontImageUrl}
              alt={bookmark.title}
              fill
              unoptimized
              className="object-contain object-center"
            />
          </div>
        </div>

        {/* Bookmark Metadata & Centered Action Footer */}
        <div className="p-4 bg-white border-t border-[#E8E2D5] space-y-3 flex-1 flex flex-col justify-between">
          <div className="space-y-1 text-center">
            <h4
              onClick={() => setInspectingBookmark(bookmark)}
              className="font-serif text-sm font-bold text-stone-900 leading-snug line-clamp-2 hover:text-[#2563EB] cursor-pointer transition-colors"
              title="Click to inspect specimen"
            >
              {bookmark.title}
            </h4>
            {bookmark.bookstore && (
              <Link
                href={`/bookstores/${bookmark.bookstore.id}`}
                className="text-xs font-serif text-[#2563EB] hover:text-[#1D4ED8] hover:underline font-semibold block truncate"
              >
                {bookmark.bookstore.name}
              </Link>
            )}
          </div>

          {/* Small Centered Add Button */}
          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={() => toggleBookmarkSelection(bookmark)}
              className={`inline-flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-serif rounded-full transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold shadow-xs"
                  : "bg-white hover:bg-[#FAF8F5] text-stone-700 border border-[#E8E2D5] hover:border-[#F43F7A]/60 shadow-2xs"
              }`}
            >
              {isSelected ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 text-[#F43F7A]" />
                  <span>Add</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderLandscapeCard = (bookmark: BookmarkWithDetails) => {
    const isSelected = selectedBookmarks.some((b) => b.id === bookmark.id);
    const qty = bookmark.tradeQuantity || 1;

    return (
      <div
        key={bookmark.id}
        className={`group relative rounded-2xl bg-white border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
          isSelected
            ? "border-[#2563EB] ring-2 ring-[#2563EB]/20 bg-blue-50/20"
            : "border-[#E8E2D5] hover:border-[#F43F7A]/50"
        }`}
      >
        {/* Duplicate Count Badge (Top-Left) */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-amber-500 text-white shadow-xs border border-amber-600">
            <span>✕ {qty}</span>
            <span className="hidden sm:inline font-sans text-[10px] normal-case font-normal">
              {qty === 1 ? "extra" : "extras"}
            </span>
          </span>
        </div>

        {/* Bookmark Visual Display Container (Short and Wide) */}
        <div
          onClick={() => setInspectingBookmark(bookmark)}
          className="relative w-full h-48 sm:h-52 pt-8 pb-3 px-6 flex items-center justify-center cursor-pointer bg-[#FAF8F5]/80 hover:bg-[#FAF8F5] transition-colors group-hover:scale-[1.01]"
          title="Click to flip and inspect full specimen"
        >
          <div className="relative w-full h-full max-w-[420px] drop-shadow-md group-hover:drop-shadow-xl transition-all duration-300">
            <Image
              src={bookmark.frontImageUrl}
              alt={bookmark.title}
              fill
              unoptimized
              className="object-contain object-center"
            />
          </div>
        </div>

        {/* Bookmark Metadata & Centered Action Footer */}
        <div className="p-4 bg-white border-t border-[#E8E2D5] space-y-3 flex-1 flex flex-col justify-between">
          <div className="space-y-1 text-center">
            <h4
              onClick={() => setInspectingBookmark(bookmark)}
              className="font-serif text-sm font-bold text-stone-900 leading-snug line-clamp-2 hover:text-[#2563EB] cursor-pointer transition-colors"
              title="Click to inspect specimen"
            >
              {bookmark.title}
            </h4>
            {bookmark.bookstore && (
              <Link
                href={`/bookstores/${bookmark.bookstore.id}`}
                className="text-xs font-serif text-[#2563EB] hover:text-[#1D4ED8] hover:underline font-semibold block truncate"
              >
                {bookmark.bookstore.name}
              </Link>
            )}
          </div>

          {/* Small Centered Add Button */}
          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={() => toggleBookmarkSelection(bookmark)}
              className={`inline-flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-serif rounded-full transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold shadow-xs"
                  : "bg-white hover:bg-[#FAF8F5] text-stone-700 border border-[#E8E2D5] hover:border-[#F43F7A]/60 shadow-2xs"
              }`}
            >
              {isSelected ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 text-[#F43F7A]" />
                  <span>Add</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Header />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-32">
        {/* Top Header Banner Artwork */}
        <section className="w-full flex flex-col items-center pb-6 border-b border-[#E8E2D5] space-y-4">
          <h1 className="sr-only">Bookmark Bazaar — Collector's Duplicate Exchange</h1>
          <div className="relative w-full max-w-4xl aspect-[3750/1103] select-none mx-auto drop-shadow-xs">
            <Image
              src="/images/bookmark-bazaar-header.png"
              alt="Bookmark Bazaar"
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
                value={content.hero_subtitle || ""}
                onChange={(val) => handleUpdateContent("hero_subtitle", val)}
                rows={2}
                placeholder="Enter subtitle describing the duplicate exchange..."
              />
            </div>
          ) : (
            <p className="font-serif text-base sm:text-lg text-stone-600 max-w-2xl text-center mx-auto leading-relaxed">
              {content.hero_subtitle}
            </p>
          )}
        </section>

        {/* 1. Full-Width Welcome to Bookmark Bazaar & 3 Steps */}
        <section className="w-full bg-white rounded-3xl border border-[#E8E2D5] p-6 sm:p-8 shadow-xs space-y-5">
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-mono text-stone-600 uppercase font-semibold">
                  Section Headline
                </label>
                <input
                  type="text"
                  value={content.intro_title || ""}
                  onChange={(e) => handleUpdateContent("intro_title", e.target.value)}
                  className="w-full text-lg sm:text-xl font-serif font-bold text-stone-900 bg-[#FAF8F5] border border-[#E8E2D5] rounded-xl px-4 py-2"
                />
              </div>

              <VisualTextarea
                label="Welcome Message (Paragraph 1)"
                rows={3}
                value={content.intro_p1 || ""}
                onChange={(val) => handleUpdateContent("intro_p1", val)}
                placeholder="Welcome to the Bookmark Bazaar! Over decades of browsing..."
              />

              <VisualTextarea
                label="Welcome Message (Paragraph 2)"
                rows={2}
                value={content.intro_p2 || ""}
                onChange={(val) => handleUpdateContent("intro_p2", val)}
                placeholder="This page is dedicated to fellow collectors..."
              />

              <div className="pt-2 border-t border-[#E8E2D5] space-y-3">
                <label className="block text-xs font-mono text-stone-600 uppercase font-semibold">
                  How Trades Work (3 Easy Steps)
                </label>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={content.step1_text || ""}
                    onChange={(e) => handleUpdateContent("step1_text", e.target.value)}
                    placeholder="Step 1 description..."
                    className="w-full text-xs font-serif text-stone-800 bg-[#FAF8F5] border border-[#E8E2D5] rounded-xl px-3 py-2"
                  />
                  <input
                    type="text"
                    value={content.step2_text || ""}
                    onChange={(e) => handleUpdateContent("step2_text", e.target.value)}
                    placeholder="Step 2 description..."
                    className="w-full text-xs font-serif text-stone-800 bg-[#FAF8F5] border border-[#E8E2D5] rounded-xl px-3 py-2"
                  />
                  <input
                    type="text"
                    value={content.step3_text || ""}
                    onChange={(e) => handleUpdateContent("step3_text", e.target.value)}
                    placeholder="Step 3 description..."
                    className="w-full text-xs font-serif text-stone-800 bg-[#FAF8F5] border border-[#E8E2D5] rounded-xl px-3 py-2"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5 font-serif text-stone-700 leading-relaxed text-sm sm:text-base">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
                {content.intro_title}
              </h2>

              {content.intro_p1 && <p>{content.intro_p1}</p>}
              {content.intro_p2 && <p>{content.intro_p2}</p>}

              <div className="pt-3 border-t border-[#E8E2D5]/70 space-y-3">
                <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900">
                  {content.how_it_works_title || "How Trades Work"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs sm:text-sm text-stone-600">
                  {content.step1_text && (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2D5]">
                      <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                        1
                      </span>
                      <span>{content.step1_text}</span>
                    </div>
                  )}
                  {content.step2_text && (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2D5]">
                      <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                        2
                      </span>
                      <span>{content.step2_text}</span>
                    </div>
                  )}
                  {content.step3_text && (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2D5]">
                      <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                        3
                      </span>
                      <span>{content.step3_text}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 2. Interactive Search & Filter Bar */}
        <section className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Field */}
          <div className="relative w-full md:flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search duplicates by bookstore, accession #, city, or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2.5 text-xs sm:text-sm bg-[#FAF8F5] border border-[#E8E2D5] rounded-xl text-stone-900 font-sans focus:outline-hidden focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 placeholder:text-stone-400 transition-all"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {uniqueBookstores.length > 0 && (
              <select
                value={selectedBookstore}
                onChange={(e) => setSelectedBookstore(e.target.value)}
                className="px-3 py-2 text-xs font-sans bg-white border border-[#E8E2D5] rounded-xl text-stone-700 focus:outline-hidden focus:border-[#2563EB] cursor-pointer hover:border-stone-400"
              >
                <option value="all">All Bookstores ({initialBookmarks.length})</option>
                {uniqueBookstores.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            )}

            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="px-3 py-2 text-xs font-sans bg-white border border-[#E8E2D5] rounded-xl text-stone-700 focus:outline-hidden focus:border-[#2563EB] cursor-pointer hover:border-stone-400"
            >
              <option value="all">All Conditions</option>
              <option value="mint">Mint / Unused</option>
              <option value="fine">Fine</option>
              <option value="very good">Very Good</option>
              <option value="good">Good</option>
            </select>
          </div>
        </section>

        {/* 3. Main Body: Catalog on Left/Center + FAQ on Right Side Column */}
        <div className="flex flex-col lg:flex-row items-start gap-8 xl:gap-10 w-full">
          {/* Left Column: Bookmarks Grid filling all available middle space */}
          <section className="flex-1 min-w-0 w-full space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#F43F7A]" />
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Available Duplicates Catalog
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  {filteredBookmarks.length} {filteredBookmarks.length === 1 ? "Specimen" : "Specimens"}
                </span>
              </div>
              <span className="text-xs font-serif text-stone-500 italic hidden sm:inline">
                Click bookmark to inspect front &amp; back in high-resolution
              </span>
            </div>

            {filteredBookmarks.length === 0 ? (
              <div className="p-16 text-center bg-white rounded-3xl border border-[#E8E2D5] space-y-3">
                <HelpCircle className="w-10 h-10 text-stone-300 mx-auto" />
                <h4 className="font-serif text-lg font-bold text-stone-900">
                  No duplicate bookmarks match your search
                </h4>
                <p className="font-serif text-xs text-stone-500 max-w-md mx-auto">
                  Try adjusting your search terms or clearing your filters to see all available trade copies.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {groupedRows.map((row, rowIdx) => {
                  if (row.type === "landscape") {
                    return (
                      <div
                        key={`row-land-${rowIdx}`}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6"
                      >
                        {row.items.map((bookmark) => renderLandscapeCard(bookmark))}
                      </div>
                    );
                  } else {
                    return (
                      <div
                        key={`row-port-${rowIdx}`}
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6"
                      >
                        {row.items.map((bookmark) => renderPortraitCard(bookmark))}
                      </div>
                    );
                  }
                })}
              </div>
            )}
          </section>

          {/* Right Column: FAQ Questions (Clean side column pushed all the way to the right side) */}
          <aside className="w-full lg:w-72 xl:w-80 shrink-0 lg:sticky lg:top-24 space-y-4">
            {isEditing ? (
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border-2 border-dashed border-[#E8E2D5] space-y-4">
                <div className="space-y-3">
                  <label className="block text-xs font-mono text-stone-600 uppercase font-semibold">
                    Manage Questions &amp; Answers
                  </label>
                  {currentFaqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white border border-[#E8E2D5] shadow-2xs space-y-2.5 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold text-stone-600 uppercase">
                          Question {idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFaq(idx)}
                          className="text-stone-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                          title="Delete this question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => handleFaqChange(idx, "question", e.target.value)}
                        placeholder="Question..."
                        className="w-full px-3 py-1.5 text-xs font-serif font-bold text-stone-900 bg-[#FAF8F5] border border-[#E8E2D5] rounded-lg focus:outline-hidden focus:border-[#2563EB]"
                      />

                      <textarea
                        rows={3}
                        value={faq.answer}
                        onChange={(e) => handleFaqChange(idx, "answer", e.target.value)}
                        placeholder="Answer..."
                        className="w-full px-3 py-1.5 text-xs font-serif text-stone-700 bg-[#FAF8F5] border border-[#E8E2D5] rounded-lg focus:outline-hidden focus:border-[#2563EB] leading-relaxed"
                      />
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddFaq}
                    className="w-full py-2.5 px-3 rounded-xl border border-dashed border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-serif font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#F43F7A]" />
                    <span>Add Another Question</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {currentFaqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs space-y-1.5"
                  >
                    <h4 className="font-serif text-sm font-bold text-stone-900 leading-snug">
                      {faq.question}
                    </h4>
                    <p className="font-serif text-xs text-stone-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>

        {/* 4. Floating Bottom Swap Drawer (Slides up when 1+ bookmarks selected) */}
        {selectedBookmarks.length > 0 && (
          <div className="fixed bottom-4 inset-x-0 z-40 max-w-4xl mx-auto px-4 animate-in slide-in-from-bottom-8 duration-300">
            <div className="bg-stone-900 text-white rounded-2xl border border-stone-800 shadow-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md">
              {/* Left: Selected count & thumbnail strip */}
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-md">
                  <ArrowLeftRight className="w-5 h-5 text-amber-200" />
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-sm text-stone-100">
                      {selectedBookmarks.length} {selectedBookmarks.length === 1 ? "Bookmark" : "Bookmarks"} in Trade Tray
                    </span>
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="text-[11px] font-sans text-stone-400 hover:text-rose-400 underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>

                  {/* Thumbnail Strip */}
                  <div className="flex items-center gap-2 overflow-x-auto py-0.5 max-w-md">
                    {selectedBookmarks.map((b) => (
                      <div
                        key={b.id}
                        className="group/thumb relative inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-stone-800 border border-stone-700 text-xs font-serif text-stone-200 shrink-0"
                      >
                        <span className="truncate max-w-[120px] text-[11px]">{b.title}</span>
                        <button
                          type="button"
                          onClick={() => removeSelectedBookmark(b.id)}
                          className="text-stone-400 hover:text-rose-400 cursor-pointer"
                          title="Remove from tray"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Propose Trade Action Button */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  onClick={() => setIsProposalModalOpen(true)}
                  className="bg-[#F43F7A] hover:bg-[#E11D48] text-white font-serif text-xs font-bold gap-2 px-4 py-2.5 shadow-md cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Propose Trade ({selectedBookmarks.length})</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 5. Trade Proposal Modal */}
        {isProposalModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-white border border-[#E8E2D5] rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center">
                    <ArrowLeftRight className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-900">
                      Propose a Bookmark Trade
                    </h3>
                    <p className="text-xs font-serif text-stone-500">
                      Direct exchange with the archive curator
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsProposalModalOpen(false);
                    setProposalSubmitted(false);
                  }}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-900 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {proposalSubmitted ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif text-xl font-bold text-stone-900">
                    Trade Proposal Ready!
                  </h4>
                  <p className="text-xs font-serif text-stone-600 max-w-sm mx-auto leading-relaxed">
                    Your email client has been opened with your selected bookmarks list. Send the email and the curator will reply shortly!
                  </p>
                  <div className="pt-4">
                    <Button
                      type="button"
                      onClick={() => {
                        setIsProposalModalOpen(false);
                        setProposalSubmitted(false);
                        setSelectedBookmarks([]);
                      }}
                      className="bg-stone-900 text-white text-xs font-serif"
                    >
                      Back to Bookmark Bazaar
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSendProposal} className="space-y-4">
                  {/* Selected Bookmarks List Summary */}
                  <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D5] space-y-2">
                    <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block">
                      Bookmarks You Are Requesting ({selectedBookmarks.length})
                    </span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-xs font-serif text-stone-800">
                      {selectedBookmarks.map((b) => (
                        <div key={b.id} className="flex items-center justify-between gap-2 border-b border-stone-200/60 pb-1">
                          <span className="font-bold truncate">{b.title}</span>
                          <span className="font-mono text-[10px] text-stone-500 shrink-0">{b.accessionNo}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Form Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono text-stone-500 uppercase mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Jane Doe"
                        value={collectorName}
                        onChange={(e) => setCollectorName(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-serif bg-[#FAF8F5] border border-[#E8E2D5] rounded-xl text-stone-900 focus:outline-hidden focus:border-[#2563EB]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-stone-500 uppercase mb-1">
                        Your Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="collector@example.com"
                        value={collectorEmail}
                        onChange={(e) => setCollectorEmail(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-serif bg-[#FAF8F5] border border-[#E8E2D5] rounded-xl text-stone-900 focus:outline-hidden focus:border-[#2563EB]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-stone-500 uppercase mb-1">
                      Bookmarks or Ephemera You Are Offering in Exchange *
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Describe the bookstore bookmarks, duplicates, or photos you have available for swap (e.g. City Lights 1980s bookmark, Strand 1970s flyer)..."
                      value={offeredItemsText}
                      onChange={(e) => setOfferedItemsText(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-serif bg-[#FAF8F5] border border-[#E8E2D5] rounded-xl text-stone-900 focus:outline-hidden focus:border-[#2563EB] leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E2D5]">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsProposalModalOpen(false)}
                      className="border-[#E8E2D5] cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      className="bg-[#F43F7A] hover:bg-[#E11D48] text-white font-serif gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Proposal via Email</span>
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* 6. Bookmark Inspector Modal with 3D Flip */}
        <AnimatePresence>
          {inspectingBookmark && (
            <div
              className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-md p-2 sm:p-6 lg:p-8 flex items-start sm:items-center justify-center min-h-screen animate-in fade-in duration-200"
              onClick={(e) => {
                if (e.target === e.currentTarget) setInspectingBookmark(null);
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="w-full max-w-5xl my-auto py-4"
              >
                <BookmarkInspector
                  bookmark={inspectingBookmark}
                  onClose={() => setInspectingBookmark(null)}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Curator Toolbar in Edit Mode */}
      {isEditing && (
        <CuratorPageToolbar
          pageName="Bookmark Bazaar"
          hasUnsavedChanges={hasUnsavedChanges}
          onSave={handleSave}
        />
      )}

      {/* Footer */}
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
            <Link href="/about" className="hover:text-[#F43F7A] hover:underline">
              About Archive
            </Link>
            <span>·</span>
            <Link href="/trading" className="hover:text-[#F43F7A] hover:underline font-bold text-[#F43F7A]">
              Bookmark Bazaar
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
