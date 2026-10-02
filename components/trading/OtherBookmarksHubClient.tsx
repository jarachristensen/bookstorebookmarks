"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { NonBookstoreBookmark } from "@/db/schema";
import { parseDimensions } from "@/lib/utils/dimensions";
import { Header } from "@/components/ui/Header";
import { FormattedText } from "@/components/ui/FormattedText";
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
  Mail,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Tag,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface OtherBookmarksHubClientProps {
  initialBookmarks: NonBookstoreBookmark[];
  initialContent?: Record<string, string>;
}

export interface FAQItem {
  question: string;
  answer: string;
}

const DEFAULT_FAQS: FAQItem[] = [
  {
    question: "What kind of non-bookstore bookmarks are in this exchange?",
    answer:
      "This unlisted exchange contains special paper ephemera bookmarks from libraries, publishers, authors, art galleries, museums, and vintage advertising campaigns that we have duplicate copies of.",
  },
  {
    question: "What condition are these bookmarks in?",
    answer:
      "All specimens are in collectible, authentic condition (Very Good to Mint) and stored in protective archival sleeves.",
  },
  {
    question: "How do we complete the swap?",
    answer:
      "Select the bookmarks you'd like, describe what ephemera you have to trade, and submit your proposal. The curator will review it and reply directly by email to confirm the swap!",
  },
];

export function OtherBookmarksHubClient({
  initialBookmarks,
  initialContent = {},
}: OtherBookmarksHubClientProps) {
  const [bookmarks, setBookmarks] = useState<NonBookstoreBookmark[]>(initialBookmarks);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Selected for swap tray
  const [selectedBookmarkIds, setSelectedBookmarkIds] = useState<string[]>([]);
  const [isTrayOpen, setIsTrayOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);

  // Card Flip States: id -> boolean (true = showing back)
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  // Inspector Modal state
  const [inspectingBookmark, setInspectingBookmark] = useState<NonBookstoreBookmark | null>(null);
  const [inspectSide, setInspectSide] = useState<"front" | "back">("front");

  // Proposal Submission State
  const [collectorName, setCollectorName] = useState("");
  const [collectorEmail, setCollectorEmail] = useState("");
  const [offeredItems, setOfferedItems] = useState("");
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);
  const [proposalSuccess, setProposalSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Categories extraction
  const categories = useMemo(() => {
    const set = new Set<string>();
    bookmarks.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return Array.from(set).sort();
  }, [bookmarks]);

  // Filtered bookmarks
  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((bm) => {
      const matchesCategory =
        selectedCategory === "all" ||
        (bm.category && bm.category.toLowerCase() === selectedCategory.toLowerCase());

      const matchesSearch =
        !searchQuery.trim() ||
        bm.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (bm.category && bm.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (bm.notes && bm.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [bookmarks, selectedCategory, searchQuery]);

  // Selected bookmarks list
  const selectedBookmarks = useMemo(() => {
    return bookmarks.filter((bm) => selectedBookmarkIds.includes(bm.id));
  }, [bookmarks, selectedBookmarkIds]);

  const toggleSelectBookmark = (id: string) => {
    setSelectedBookmarkIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleFlip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenProposal = () => {
    setSubmitError("");
    setProposalSuccess(false);
    setIsProposalModalOpen(true);
  };

  const handleSendProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectorName.trim() || !collectorEmail.trim() || !offeredItems.trim()) {
      setSubmitError("Please fill out your name, email, and what items you are offering.");
      return;
    }
    if (selectedBookmarks.length === 0) {
      setSubmitError("Please select at least one bookmark for your trade proposal.");
      return;
    }

    setIsSubmittingProposal(true);
    setSubmitError("");

    try {
      const payload = {
        collectorName: collectorName.trim(),
        collectorEmail: collectorEmail.trim(),
        offeredItems: offeredItems.trim(),
        requestedBookmarkIds: selectedBookmarks.map((b) => b.id),
        requestedBookmarksSnapshot: selectedBookmarks.map((b) => ({
          id: b.id,
          title: b.title,
          category: b.category,
          frontImageUrl: b.frontImageUrl,
          backImageUrl: b.backImageUrl,
          tradeQuantity: b.tradeQuantity,
          type: "non-bookstore",
        })),
        notes: `Proposal from /otherbookmarks direct link`,
      };

      const res = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit trade proposal.");
      }

      setProposalSuccess(true);
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmittingProposal(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#18181B] font-sans selection:bg-[#F43F7A]/20 pb-32">
      {/* Direct link unlisted banner */}
      <div className="bg-amber-100/80 border-b border-amber-200 text-amber-950 px-4 py-1.5 text-xs text-center font-serif flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-700" />
        <span>
          <strong>Direct Access Link:</strong> Ephemera & Non-Bookstore Bookmark Exchange.
        </span>
      </div>

      <Header />

      {/* Hero Header */}
      <header className="relative pt-12 pb-10 px-4 sm:px-6 lg:px-8 border-b border-[#E8E2D5] bg-[#FAF8F5]">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-stone-900">
            Other Bookmarks & Ephemera Bazaar
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-stone-600 font-serif leading-relaxed">
            An invite only trade page for all other bookmarks in the collection. Will trade for bookstore and other book related bookmarks.
          </p>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border border-[#E8E2D5] bg-white shadow-2xs">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-serif transition-all cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-[#18181B] text-white font-bold shadow-xs"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              All Categories ({bookmarks.length})
            </button>
            {categories.map((cat) => {
              const count = bookmarks.filter((b) => b.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-serif transition-all cursor-pointer flex items-center gap-1 ${
                    selectedCategory === cat
                      ? "bg-[#2563EB] text-white font-bold shadow-xs"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  <Tag className="w-3 h-3" />
                  <span>{cat}</span>
                  <span className="opacity-75">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search bookmarks or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-[#E8E2D5] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:bg-white text-stone-800 placeholder-stone-400"
            />
          </div>
        </div>

        {/* Bookmarks Grid */}
        {filteredBookmarks.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#E8E2D5] rounded-3xl p-8 space-y-4 shadow-2xs">
            <Layers className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-stone-700">No bookmarks found</h3>
            <p className="font-serif text-xs text-stone-500 max-w-md mx-auto">
              No bookmarks matched your category or search query. Try choosing another category or clearing your search.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {filteredBookmarks.map((bm) => {
              const isSelected = selectedBookmarkIds.includes(bm.id);
              const isFlipped = Boolean(flippedCards[bm.id]);
              const currentImageUrl = isFlipped && bm.backImageUrl ? bm.backImageUrl : bm.frontImageUrl;
              const hasBack = Boolean(bm.backImageUrl);

              return (
                <div
                  key={bm.id}
                  className={`group relative flex flex-col bg-white border rounded-2xl overflow-hidden transition-all duration-200 ${
                    isSelected
                      ? "border-[#2563EB] ring-2 ring-[#2563EB]/20 shadow-md"
                      : "border-[#E8E2D5] hover:border-stone-400 hover:shadow-xs"
                  }`}
                >
                  {/* Top Badge Strip */}
                  <div className="p-2.5 bg-[#FAF8F5]/80 border-b border-[#E8E2D5] flex items-center justify-between gap-1 text-[10px] font-serif">
                    <span className="inline-flex items-center gap-1 font-semibold text-stone-700 bg-white px-2 py-0.5 rounded border border-[#E8E2D5] truncate max-w-[110px]">
                      <Tag className="w-2.5 h-2.5 text-[#2563EB]" />
                      <span className="truncate">{bm.category || "Ephemera"}</span>
                    </span>

                    <span className="text-stone-500 font-medium whitespace-nowrap">
                      {bm.tradeQuantity} avail
                    </span>
                  </div>

                  {/* Bookmark Image Preview Area */}
                  <div className="relative p-3 bg-stone-50/50 flex items-center justify-center min-h-[220px] max-h-[260px] overflow-hidden">
                    <div className="relative w-full h-[220px] flex items-center justify-center">
                      <Image
                        src={currentImageUrl}
                        alt={bm.title}
                        width={200}
                        height={300}
                        unoptimized
                        className="max-h-[200px] w-auto object-contain drop-shadow-sm transition-transform group-hover:scale-105"
                      />
                    </div>

                    {/* Quick Flip Button */}
                    {hasBack && (
                      <button
                        type="button"
                        onClick={(e) => toggleFlip(bm.id, e)}
                        className="absolute bottom-2 right-2 px-2 py-1 rounded bg-white/90 hover:bg-white text-[10px] font-serif text-stone-700 border border-[#E8E2D5] shadow-xs flex items-center gap-1 transition-all"
                        title="Flip between front and back"
                      >
                        <ArrowLeftRight className="w-2.5 h-2.5" />
                        <span>{isFlipped ? "Front" : "Back"}</span>
                      </button>
                    )}

                    {/* Zoom Inspect Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setInspectingBookmark(bm);
                        setInspectSide(isFlipped && bm.backImageUrl ? "back" : "front");
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-white text-stone-600 border border-[#E8E2D5] shadow-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Inspect full resolution"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card Info & Select Button */}
                  <div className="p-3 flex-1 flex flex-col justify-between space-y-3 bg-white">
                    <div>
                      <h4 className="font-serif font-bold text-xs text-stone-900 line-clamp-2 leading-snug">
                        {bm.title}
                      </h4>
                      {bm.dimensions && (
                        <p className="text-[10px] font-mono text-stone-500 mt-1">
                          {bm.dimensions}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleSelectBookmark(bm.id)}
                      className={`w-full py-1.5 px-3 rounded-lg text-xs font-serif font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? "bg-[#2563EB] text-white shadow-xs"
                          : "bg-stone-100 hover:bg-stone-200 text-stone-800"
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Selected</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Add to Swap</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* FAQ Section */}
        <section className="mt-16 pt-10 border-t border-[#E8E2D5] space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#E8E2D5] bg-white text-xs font-serif text-stone-600">
              <HelpCircle className="w-3.5 h-3.5 text-[#F43F7A]" />
              <span>Collector FAQ</span>
            </div>
            <h3 className="text-2xl font-serif font-bold text-stone-900">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="max-w-3xl mx-auto grid gap-4">
            {DEFAULT_FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#E8E2D5] rounded-2xl p-5 shadow-2xs space-y-2"
              >
                <h4 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-600 text-xs flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  {faq.question}
                </h4>
                <p className="font-serif text-xs sm:text-sm text-stone-600 pl-7 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Floating Selection Drawer / Swap Strip */}
      <AnimatePresence>
        {selectedBookmarkIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl"
          >
            <div className="bg-[#18181B] text-white p-4 rounded-2xl shadow-2xl border border-stone-700 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-serif font-bold">
                  {selectedBookmarkIds.length}
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm leading-tight">
                    {selectedBookmarkIds.length === 1
                      ? "1 Bookmark Selected"
                      : `${selectedBookmarkIds.length} Bookmarks Selected`}
                  </h4>
                  <p className="text-[11px] text-stone-400 font-serif">
                    Ready to propose an exchange
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedBookmarkIds([])}
                  className="px-3 py-2 rounded-xl text-xs font-serif text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={handleOpenProposal}
                  className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-serif font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Propose Trade</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trade Proposal Modal */}
      <AnimatePresence>
        {isProposalModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-xl bg-[#FAF8F5] border border-[#E8E2D5] rounded-3xl shadow-2xl overflow-hidden my-8"
            >
              {proposalSuccess ? (
                <div className="p-8 text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-serif font-black text-2xl text-stone-900">
                      Trade Proposal Received!
                    </h3>
                    <p className="font-serif text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                      Thank you, <strong>{collectorName}</strong>! Your proposal to exchange {selectedBookmarks.length} ephemera bookmarks has been securely recorded in the curator inbox.
                    </p>
                    <p className="font-serif text-xs text-stone-500">
                      The curator will follow up directly at <strong>{collectorEmail}</strong> to review your offer and confirm swap details.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setIsProposalModalOpen(false);
                      setSelectedBookmarkIds([]);
                      setProposalSuccess(false);
                    }}
                    className="bg-[#18181B] text-white px-6"
                  >
                    Done & Return to Bazaar
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSendProposal} className="p-6 sm:p-8 space-y-6">
                  {/* Modal Header */}
                  <div className="flex items-start justify-between gap-4 border-b border-[#E8E2D5] pb-4">
                    <div>
                      <span className="text-[10px] font-serif uppercase tracking-wider text-[#2563EB] font-bold">
                        Ephemera Exchange Proposal
                      </span>
                      <h3 className="font-serif font-black text-2xl text-stone-900">
                        Propose Bookmark Trade
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsProposalModalOpen(false)}
                      className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Selected Bookmarks Preview Strip */}
                  <div className="space-y-2">
                    <label className="block font-serif text-xs font-bold text-stone-700">
                      Requested Bookmarks ({selectedBookmarks.length})
                    </label>
                    <div className="max-h-36 overflow-y-auto space-y-2 p-2 rounded-xl bg-white border border-[#E8E2D5]">
                      {selectedBookmarks.map((bm) => (
                        <div
                          key={bm.id}
                          className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-stone-50 text-xs font-serif"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Image
                              src={bm.frontImageUrl}
                              alt={bm.title}
                              width={24}
                              height={36}
                              unoptimized
                              className="h-8 w-auto object-contain rounded"
                            />
                            <span className="font-semibold text-stone-900 truncate">
                              {bm.title}
                            </span>
                            <span className="text-[10px] text-stone-500 font-mono">
                              [{bm.category}]
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleSelectBookmark(bm.id)}
                            className="text-stone-400 hover:text-red-500 p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Form Inputs */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-serif text-xs font-bold text-stone-700 mb-1">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={collectorName}
                          onChange={(e) => setCollectorName(e.target.value)}
                          placeholder="e.g. Eleanor Vance"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8E2D5] text-xs font-serif focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                        />
                      </div>
                      <div>
                        <label className="block font-serif text-xs font-bold text-stone-700 mb-1">
                          Your Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={collectorEmail}
                          onChange={(e) => setCollectorEmail(e.target.value)}
                          placeholder="curator@example.com"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8E2D5] text-xs font-serif focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-serif text-xs font-bold text-stone-700 mb-1">
                        What bookmarks / paper ephemera are you offering in trade? *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={offeredItems}
                        onChange={(e) => setOfferedItems(e.target.value)}
                        placeholder="Please describe the bookmarks, library slips, vintage publisher cards, or ephemera items you would like to offer..."
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8E2D5] text-xs font-serif focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                      />
                    </div>
                  </div>

                  {submitError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-serif">
                      {submitError}
                    </div>
                  )}

                  {/* Modal Footer Actions */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsProposalModalOpen(false)}
                      disabled={isSubmittingProposal}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isSubmittingProposal}
                      className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold"
                    >
                      {isSubmittingProposal ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5 mr-1.5" />
                          <span>Send Trade Proposal</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full-Screen Inspector Modal */}
      <AnimatePresence>
        {inspectingBookmark && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setInspectingBookmark(null)}
          >
            <div
              className="relative max-w-3xl w-full bg-[#FAF8F5] border border-[#E8E2D5] rounded-3xl p-6 shadow-2xl flex flex-col items-center space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setInspectingBookmark(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white border border-[#E8E2D5] text-stone-600 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-1">
                <span className="text-xs font-serif text-[#2563EB] font-bold">
                  {inspectingBookmark.category}
                </span>
                <h3 className="font-serif font-black text-xl text-stone-900">
                  {inspectingBookmark.title}
                </h3>
              </div>

              {/* Image Container */}
              <div className="relative w-full max-h-[60vh] flex items-center justify-center p-4 bg-stone-100/50 rounded-2xl">
                <Image
                  src={
                    inspectSide === "back" && inspectingBookmark.backImageUrl
                      ? inspectingBookmark.backImageUrl
                      : inspectingBookmark.frontImageUrl
                  }
                  alt={inspectingBookmark.title}
                  width={500}
                  height={700}
                  unoptimized
                  className="max-h-[50vh] w-auto object-contain drop-shadow-md"
                />
              </div>

              {/* Toggle Sides */}
              {inspectingBookmark.backImageUrl && (
                <div className="inline-flex rounded-lg border border-[#E8E2D5] p-1 bg-white">
                  <button
                    onClick={() => setInspectSide("front")}
                    className={`px-3 py-1 rounded text-xs font-serif ${
                      inspectSide === "front"
                        ? "bg-[#18181B] text-white font-bold"
                        : "text-stone-600"
                    }`}
                  >
                    Front View
                  </button>
                  <button
                    onClick={() => setInspectSide("back")}
                    className={`px-3 py-1 rounded text-xs font-serif ${
                      inspectSide === "back"
                        ? "bg-[#18181B] text-white font-bold"
                        : "text-stone-600"
                    }`}
                  >
                    Back View
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
