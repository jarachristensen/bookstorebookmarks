"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookmarkWithDetails, BookstoreWithDetails } from "@/lib/db/queries";
import { Badge } from "@/components/ui/Badge";
import {
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Sparkles,
  MapPin,
  Bookmark as BookmarkIcon,
  Building2,
  Plus,
  Navigation,
  Newspaper,
  Calendar,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export interface AdminTableClientProps {
  initialBookmarks: BookmarkWithDetails[];
  initialBookstores: BookstoreWithDetails[];
}

export function AdminTableClient({
  initialBookmarks,
  initialBookstores,
}: AdminTableClientProps) {
  const [activeTab, setActiveTab] = useState<"bookmarks" | "bookstores">("bookmarks");
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [bookstores, setBookstores] = useState(initialBookstores);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const filteredBookmarks = bookmarks.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.title.toLowerCase().includes(q) ||
      b.bookstore?.name.toLowerCase().includes(q) ||
      b.bookstore?.city.toLowerCase().includes(q)
    );
  });

  const filteredBookstores = bookstores.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q) ||
      s.historicalBlurb.toLowerCase().includes(q)
    );
  });

  const handleDeleteBookmark = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete bookmark "${title}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/bookmarks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
      router.refresh();
    } catch {
      alert("Failed to delete bookmark.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteBookstore = async (id: string, name: string) => {
    if (
      !confirm(
        `Are you sure you want to delete bookstore "${name}"? This will also remove its associated bookmarks and media.`
      )
    ) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/bookstores/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setBookstores((prev) => prev.filter((s) => s.id !== id));
      setBookmarks((prev) => prev.filter((b) => b.bookstoreId !== id));
      router.refresh();
    } catch {
      alert("Failed to delete bookstore.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white border border-[#E8E2D5] rounded-2xl shadow-xs overflow-hidden space-y-4">
      {/* Top Segmented Tabs & Action Strip */}
      <div className="p-4 border-b border-[#E8E2D5] bg-[#FAF8F5]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tab switchers */}
        <div className="inline-flex rounded-lg border border-[#E8E2D5] p-0.5 bg-[#FAF8F5] text-xs font-serif">
          <button
            type="button"
            onClick={() => setActiveTab("bookmarks")}
            className={`px-3.5 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "bookmarks"
                ? "bg-white text-[#F43F7A] font-bold shadow-xs border border-[#E8E2D5]"
                : "text-stone-500 hover:text-stone-900"
            }`}
          >
            <BookmarkIcon className="w-3.5 h-3.5 text-[#F43F7A]" />
            <span>Bookmarks ({bookmarks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("bookstores")}
            className={`px-3.5 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "bookstores"
                ? "bg-white text-[#2563EB] font-bold shadow-xs border border-[#E8E2D5]"
                : "text-stone-500 hover:text-stone-900"
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Bookstores &amp; Dossiers ({bookstores.length})</span>
          </button>
        </div>

        {/* Search filter input */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              activeTab === "bookmarks"
                ? "Filter bookmarks..."
                : "Filter bookstores & cities..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9.5 pr-4 py-1.5 text-xs bg-white border border-[#E8E2D5] rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 font-serif"
          />
        </div>
      </div>

      {/* BOOKMARKS TABLE */}
      {activeTab === "bookmarks" && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-[#E8E2D5] font-mono uppercase text-stone-500 text-[11px]">
              <tr>
                <th className="py-3 px-4">Scan</th>
                <th className="py-3 px-4">Bookmark Title</th>
                <th className="py-3 px-4">Historic Bookstore</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Physical Specs</th>
                <th className="py-3 px-4">Clippings</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D5]">
              {filteredBookmarks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-500 font-serif italic">
                    No bookmarks match your search query.
                  </td>
                </tr>
              ) : (
                filteredBookmarks.map((b) => (
                  <tr key={b.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="relative w-9 h-20 rounded bg-[#FAF8F5] overflow-hidden border border-[#E8E2D5] shadow-2xs">
                        <Image
                          src={b.frontImageUrl}
                          alt={b.title}
                          fill
                          unoptimized
                          className="object-cover object-top"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-stone-900">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-serif font-bold">{b.title}</span>
                          {b.isFeatured && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30">
                              KEY
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[10px] text-stone-400 block">
                          Accession: {b.accessionNo}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-serif text-stone-700">
                      {b.bookstore ? (
                        <Link
                          href={`/bookstores/${b.bookstore.id}`}
                          className="hover:text-[#F43F7A] hover:underline font-bold"
                        >
                          {b.bookstore.name}
                        </Link>
                      ) : (
                        <span className="text-stone-400 italic">Unattached</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-serif text-stone-600">
                      {b.bookstore?.city}
                      {b.bookstore?.stateProvince ? `, ${b.bookstore.stateProvince}` : ""}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-stone-500">
                      <div>{b.dimensions}</div>
                      <div className="text-[10px] text-stone-400">{b.material}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-stone-500">
                      {b.bookstore?.archivalMedia.length || 0} media
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/edit/${b.id}`}
                          className="p-1.5 rounded-md hover:bg-stone-100 text-stone-600 hover:text-stone-900 transition-colors"
                          title="Edit Bookmark"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteBookmark(b.id, b.title)}
                          disabled={deletingId === b.id}
                          className="p-1.5 rounded-md hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete Bookmark"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* BOOKSTORES TABLE */}
      {activeTab === "bookstores" && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-[#E8E2D5] font-mono uppercase text-stone-500 text-[11px]">
              <tr>
                <th className="py-3 px-4">Storefront</th>
                <th className="py-3 px-4">Bookstore Name</th>
                <th className="py-3 px-4">Location &amp; Addresses</th>
                <th className="py-3 px-4">Era Active</th>
                <th className="py-3 px-4">Bookmarks</th>
                <th className="py-3 px-4">Media</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D5]">
              {filteredBookstores.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-500 font-serif italic">
                    No bookstores match your search query.
                  </td>
                </tr>
              ) : (
                filteredBookstores.map((s) => {
                  const storefront =
                    s.archivalMedia.find((m) => m.isStorefront) ||
                    s.archivalMedia.find((m) => m.mediaType === "photo") ||
                    null;

                  let parsedLocs = 0;
                  try {
                    if (s.locations) parsedLocs = JSON.parse(s.locations).length;
                  } catch {}

                  return (
                    <tr key={s.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="relative w-14 h-10 rounded bg-stone-100 overflow-hidden border border-[#E8E2D5] shadow-2xs">
                          {storefront ? (
                            <Image
                              src={storefront.imageUrl}
                              alt={s.name}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400 bg-stone-100">
                              <Building2 className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-stone-900">
                        <div className="space-y-0.5">
                          <Link
                            href={`/bookstores/${s.id}`}
                            className="font-serif font-bold text-stone-900 hover:text-[#F43F7A] hover:underline flex items-center gap-1"
                          >
                            <span>{s.name}</span>
                            <ExternalLink className="w-3 h-3 text-stone-400" />
                          </Link>
                          {s.isStillOperating ? (
                            <span className="inline-flex px-1.5 py-0.2 rounded text-[9px] font-mono bg-[#10B981]/15 text-[#10B981] font-bold border border-[#10B981]/25">
                              OPERATING
                            </span>
                          ) : (
                            <span className="inline-flex px-1.5 py-0.2 rounded text-[9px] font-mono bg-[#F43F7A]/10 text-[#F43F7A] font-bold border border-[#F43F7A]/20">
                              {s.yearClosed ? `CLOSED (${s.yearClosed})` : "CLOSED"}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-serif text-stone-700">
                        <div className="space-y-0.5">
                          <div>
                            {s.city}
                            {s.stateProvince ? `, ${s.stateProvince}` : ""}, {s.country}
                          </div>
                          {parsedLocs > 1 && (
                            <span className="font-mono text-[10px] text-[#F43F7A] font-semibold">
                              {parsedLocs} Historic Addresses (Relocated)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-stone-500">
                        {s.yearOpened}–{s.isStillOperating ? "Present" : s.yearClosed || "Closed"}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-stone-500">
                        {s.bookmarks.length} bookmarks
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-stone-500">
                        {s.archivalMedia.length} items
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/bookstores/${s.id}`}
                            className="p-1.5 rounded-md hover:bg-stone-100 text-stone-700 hover:text-[#2563EB] transition-colors inline-flex items-center gap-1 font-serif text-xs"
                            title="Edit In-Depth Bookstore Dossier"
                          >
                            <Edit className="w-3.5 h-3.5 text-[#2563EB]" />
                            <span className="hidden sm:inline">Edit Dossier</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteBookstore(s.id, s.name)}
                            disabled={deletingId === s.id}
                            className="p-1.5 rounded-md hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete Bookstore"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
