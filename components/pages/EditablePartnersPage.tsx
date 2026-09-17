"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/ui/Header";
import { CuratorPageToolbar } from "@/components/admin/CuratorPageToolbar";
import { VisualTextarea } from "@/components/ui/VisualTextarea";
import { FormattedText } from "@/components/ui/FormattedText";
import {
  ArrowRight,
  Instagram,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  MapPin,
  Mail,
} from "lucide-react";

export type DonorType = "bookstore" | "individual" | "library";

export interface DonorEntry {
  id: string;
  type: DonorType;
  name: string;
  cityState: string;
  contactName?: string;
  bookmarksDonated: number | string;
}

const DEFAULT_DONORS: DonorEntry[] = [
  {
    id: "donor-1",
    type: "bookstore",
    name: "City Lights Booksellers & Publishers",
    cityState: "San Francisco, CA",
    contactName: "Paul Yamazaki",
    bookmarksDonated: 12,
  },
  {
    id: "donor-2",
    type: "bookstore",
    name: "Strand Book Store",
    cityState: "New York, NY",
    contactName: "",
    bookmarksDonated: 8,
  },
  {
    id: "donor-3",
    type: "individual",
    name: "Elena Rostova",
    cityState: "Portland, OR",
    contactName: "",
    bookmarksDonated: 6,
  },
  {
    id: "donor-4",
    type: "library",
    name: "San Francisco Public Library (Special Collections)",
    cityState: "San Francisco, CA",
    contactName: "Historical Archives Dept.",
    bookmarksDonated: 24,
  },
];

const DEFAULT_CONTENT: Record<string, string> = {
  letter_p1:
    "You know what's unique about bookstore bookmarks?\nThere is really only one *reliable* source to find them: used books.\n\nWith that in mind, we are so thankful for every used bookstore, collector, bibliophile, and library that has contributed duplicates and ephemera to help preserve these pieces of literary history!",
  donors_json: JSON.stringify(DEFAULT_DONORS),
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

  // Structured Donors List
  const donorsList: DonorEntry[] = useMemo(() => {
    if (content.donors_json) {
      try {
        const parsed = JSON.parse(content.donors_json);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return DEFAULT_DONORS;
  }, [content.donors_json]);

  const updateDonorsList = (newList: DonorEntry[]) => {
    handleChange("donors_json", JSON.stringify(newList));
  };

  const handleAddDonor = (type: DonorType = "bookstore") => {
    const newEntry: DonorEntry = {
      id: `donor-${Date.now()}`,
      type,
      name: "",
      cityState: "",
      contactName: "",
      bookmarksDonated: 1,
    };
    updateDonorsList([...donorsList, newEntry]);
  };

  const handleUpdateDonor = (index: number, field: keyof DonorEntry, value: any) => {
    const updated = [...donorsList];
    updated[index] = { ...updated[index], [field]: value };
    updateDonorsList(updated);
  };

  const handleRemoveDonor = (index: number) => {
    const updated = donorsList.filter((_, i) => i !== index);
    updateDonorsList(updated);
  };

  const handleMoveDonor = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === donorsList.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...donorsList];
    const item = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = item;
    updateDonorsList(updated);
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

  const totalDonatedCount = useMemo(() => {
    return donorsList.reduce((sum, item) => {
      const num = parseInt(String(item.bookmarksDonated), 10);
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
  }, [donorsList]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* 1. Page Header / Hero Banner Artwork (No text underneath) */}
        <section className="w-full flex flex-col items-center pb-6 border-b border-[#E8E2D5]">
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
        </section>

        {/* 2. Curator's Intro Message (Single Clean Paragraph with Markdown Formatting Support) */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D5] shadow-xs space-y-4">
          {isEditing ? (
            <div className="space-y-2">
              <VisualTextarea
                label="Curator Note / Appreciation Message:"
                value={content.letter_p1 || ""}
                onChange={(val) => handleChange("letter_p1", val)}
                rows={4}
                placeholder="Write your note to partners and donors here (use *word* for italics, **word** for bold)..."
              />
            </div>
          ) : (
            <div className="font-serif text-stone-700 text-sm sm:text-base leading-relaxed">
              <FormattedText text={content.letter_p1} />
            </div>
          )}
        </section>

        {/* 3. Total Donated Bookmarks (Moved to top under text box, styled as a rectangle box with thin black outline) */}
        <div className="flex justify-center">
          <div className="border border-stone-900 bg-white px-5 py-2 text-xs font-mono font-bold text-stone-900 uppercase tracking-wider shadow-2xs">
            <span>{totalDonatedCount} Total Bookmarks Donated</span>
          </div>
        </div>

        {/* 4. Donors & Partners List Box */}
        <section className="bg-white rounded-3xl border border-[#E8E2D5] shadow-xs p-6 sm:p-8 space-y-6">
          {isEditing ? (
            /* Curator Edit Mode: Manage Donor List */
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5]">
                <label className="text-xs font-mono text-stone-700 uppercase font-bold">
                  Manage Directory ({donorsList.length})
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddDonor("bookstore")}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-serif font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Bookstore</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddDonor("individual")}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-serif font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Individual</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddDonor("library")}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F43F7A] hover:bg-[#E11D48] text-white text-xs font-serif font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Library</span>
                  </button>
                </div>
              </div>

              {donorsList.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-[#E8E2D5] rounded-2xl space-y-3">
                  <p className="font-serif text-sm text-stone-500">
                    No donors or partners listed yet. Click an Add button above to create your first entry.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {donorsList.map((entry, idx) => {
                    return (
                      <div
                        key={entry.id || idx}
                        className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D5] shadow-2xs space-y-3 relative group"
                      >
                        {/* Top bar with Type selector & Action buttons */}
                        <div className="flex items-center justify-between gap-3 pb-2 border-b border-stone-200/80">
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center text-xs font-mono font-bold">
                              {idx + 1}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <label className="text-[11px] font-mono font-bold text-stone-500 uppercase">
                                Type:
                              </label>
                              <select
                                value={entry.type}
                                onChange={(e) =>
                                  handleUpdateDonor(idx, "type", e.target.value as DonorType)
                                }
                                className="px-2.5 py-1 text-xs font-serif font-bold bg-white border border-[#E8E2D5] rounded-lg text-stone-800 focus:outline-hidden focus:border-[#2563EB]"
                              >
                                <option value="bookstore">Bookstore</option>
                                <option value="individual">Individual Collector</option>
                                <option value="library">Library / Cultural Archive</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveDonor(idx, "up")}
                              disabled={idx === 0}
                              className="p-1 text-stone-400 hover:text-stone-800 disabled:opacity-30 transition-colors"
                              title="Move Up"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveDonor(idx, "down")}
                              disabled={idx === donorsList.length - 1}
                              className="p-1 text-stone-400 hover:text-stone-800 disabled:opacity-30 transition-colors"
                              title="Move Down"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveDonor(idx)}
                              className="p-1 text-stone-400 hover:text-rose-500 transition-colors ml-1"
                              title="Delete Entry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Input Fields based on Type */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                          {/* Name Field */}
                          <div className="space-y-1 sm:col-span-2">
                            <label className="block text-[10px] font-mono font-bold text-stone-500 uppercase">
                              {entry.type === "bookstore"
                                ? "Bookstore Name *"
                                : entry.type === "library"
                                ? "Library / Institution Name *"
                                : "Individual Donor Name *"}
                            </label>
                            <input
                              type="text"
                              value={entry.name}
                              onChange={(e) => handleUpdateDonor(idx, "name", e.target.value)}
                              placeholder={
                                entry.type === "bookstore"
                                  ? "e.g. City Lights Books"
                                  : entry.type === "library"
                                  ? "e.g. Seattle Public Library"
                                  : "e.g. Jane Doe"
                              }
                              className="w-full px-3 py-1.5 text-xs font-serif font-bold text-stone-900 bg-white border border-[#E8E2D5] rounded-xl focus:outline-hidden focus:border-[#2563EB]"
                            />
                          </div>

                          {/* City and State */}
                          <div className="space-y-1">
                            <label className="block text-[10px] font-mono font-bold text-stone-500 uppercase">
                              City &amp; State *
                            </label>
                            <input
                              type="text"
                              value={entry.cityState}
                              onChange={(e) =>
                                handleUpdateDonor(idx, "cityState", e.target.value)
                              }
                              placeholder="e.g. San Francisco, CA"
                              className="w-full px-3 py-1.5 text-xs font-serif text-stone-900 bg-white border border-[#E8E2D5] rounded-xl focus:outline-hidden focus:border-[#2563EB]"
                            />
                          </div>

                          {/* Bookmarks Donated Count */}
                          <div className="space-y-1">
                            <label className="block text-[10px] font-mono font-bold text-stone-500 uppercase">
                              Bookmarks Donated *
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={entry.bookmarksDonated}
                              onChange={(e) =>
                                handleUpdateDonor(idx, "bookmarksDonated", e.target.value)
                              }
                              placeholder="e.g. 5"
                              className="w-full px-3 py-1.5 text-xs font-mono font-bold text-stone-900 bg-white border border-[#E8E2D5] rounded-xl focus:outline-hidden focus:border-[#2563EB]"
                            />
                          </div>

                          {/* Contact Person (For Bookstore or Library) */}
                          {entry.type !== "individual" && (
                            <div className="space-y-1 sm:col-span-2">
                              <label className="block text-[10px] font-mono font-bold text-stone-500 uppercase">
                                Contact Person (Optional)
                              </label>
                              <input
                                type="text"
                                value={entry.contactName || ""}
                                onChange={(e) =>
                                  handleUpdateDonor(idx, "contactName", e.target.value)
                                }
                                placeholder="e.g. Paul Yamazaki (Head Buyer)"
                                className="w-full px-3 py-1.5 text-xs font-serif text-stone-700 bg-white border border-[#E8E2D5] rounded-xl focus:outline-hidden focus:border-[#2563EB]"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Public View: Clean Directory List (No tabs, no search, no yellow badges, rectangle black-outline badges) */
            <div className="divide-y divide-[#E8E2D5] border border-[#E8E2D5] rounded-2xl overflow-hidden bg-white">
              {donorsList.length === 0 ? (
                <div className="p-12 text-center bg-[#FAF8F5] space-y-2">
                  <p className="font-serif text-sm font-bold text-stone-700">
                    No donors or partners listed yet.
                  </p>
                </div>
              ) : (
                donorsList.map((entry) => {
                  const count = parseInt(String(entry.bookmarksDonated), 10) || 1;
                  return (
                    <div
                      key={entry.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF8F5]/60 transition-colors"
                    >
                      {/* Left Info: Name, City & State, Contact Person */}
                      <div className="space-y-1 flex-1 min-w-0">
                        <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900 truncate">
                          {entry.name || "Anonymous Donor"}
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-serif text-stone-600">
                          {entry.cityState && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-stone-400" />
                              <span>{entry.cityState}</span>
                            </div>
                          )}
                          {entry.contactName && (
                            <div className="flex items-center gap-1 text-stone-500">
                              <span className="text-stone-300">·</span>
                              <span className="font-mono text-[11px] text-stone-500">
                                Contact:
                              </span>
                              <span className="italic">{entry.contactName}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Rectangle box with thin black outline */}
                      <div className="shrink-0 flex items-center">
                        <div className="border border-stone-900 bg-white px-3 py-1.5 text-xs font-mono font-medium text-stone-900">
                          <span>{count} {count === 1 ? "Bookmark Donated" : "Bookmarks Donated"}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
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
              href="mailto:bookstorebookmarks@gmail.com"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 border border-white/20 text-xs sm:text-sm font-serif transition-all"
            >
              <Mail className="w-4 h-4 text-[#F59E0B]" />
              <span>Email the Archive</span>
            </a>

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
            <Link href="/trading" className="hover:text-[#F43F7A] hover:underline">
              Bookmark Bazaar
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
