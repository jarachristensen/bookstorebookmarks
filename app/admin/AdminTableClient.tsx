"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookmarkWithDetails, BookstoreWithDetails } from "@/lib/db/queries";
import { TradeProposal } from "@/db/schema";
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
  Save,
  CheckCircle,
  X,
  Loader2,
  ArrowLeftRight,
  Mail,
  Check,
  Clock,
  Inbox,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export interface AdminTableClientProps {
  initialBookmarks: BookmarkWithDetails[];
  initialBookstores: BookstoreWithDetails[];
  initialTradeProposals?: TradeProposal[];
}

export function AdminTableClient({
  initialBookmarks,
  initialBookstores,
  initialTradeProposals = [],
}: AdminTableClientProps) {
  const [activeTab, setActiveTab] = useState<"bookmarks" | "bookstores" | "trades">("bookmarks");
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [bookstores, setBookstores] = useState(initialBookstores);
  const [tradeProposals, setTradeProposals] = useState<TradeProposal[]>(initialTradeProposals);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingTradeId, setUpdatingTradeId] = useState<string | null>(null);
  const [tradeSuccessMsg, setTradeSuccessMsg] = useState("");
  const [tradeErrorMsg, setTradeErrorMsg] = useState("");

  // Bulk Edit States
  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const [bulkEdits, setBulkEdits] = useState<Record<string, { title: string; dimensions: string }>>({});
  const [isSavingBulk, setIsSavingBulk] = useState(false);
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState("");
  const [bulkErrorMsg, setBulkErrorMsg] = useState("");
  const router = useRouter();

  const pendingTradesCount = tradeProposals.filter((t) => t.status === "pending").length;

  const handleAcceptTrade = async (proposal: TradeProposal) => {
    if (
      !confirm(
        `Accept this trade from ${proposal.collectorName}? This will automatically deduct 1 copy from the archive duplicate inventory for each requested bookmark.`
      )
    ) {
      return;
    }

    setUpdatingTradeId(proposal.id);
    setTradeSuccessMsg("");
    setTradeErrorMsg("");

    try {
      const res = await fetch(`/api/trades/${proposal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "accepted" }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to accept trade proposal.");
      }

      // Parse requested bookmark IDs to update local state immediately
      let reqIds: string[] = [];
      try {
        reqIds = JSON.parse(proposal.requestedBookmarkIds);
      } catch {}

      // Decrement inventory in local bookmarks state
      setBookmarks((prev) =>
        prev.map((bm) => {
          if (reqIds.includes(bm.id)) {
            return {
              ...bm,
              tradeQuantity: Math.max(0, (bm.tradeQuantity || 1) - 1),
            };
          }
          return bm;
        })
      );

      // Update local tradeProposals state
      setTradeProposals((prev) =>
        prev.map((t) => (t.id === proposal.id ? { ...t, status: "accepted" } : t))
      );

      setTradeSuccessMsg(
        `Trade accepted! 1 duplicate copy was deducted for ${reqIds.length} requested bookmark${reqIds.length === 1 ? "" : "s"}.`
      );
      router.refresh();

      setTimeout(() => setTradeSuccessMsg(""), 6000);
    } catch (err: any) {
      console.error("Accept trade error:", err);
      setTradeErrorMsg(err.message || "Failed to accept trade.");
    } finally {
      setUpdatingTradeId(null);
    }
  };

  const handleDeclineTrade = async (proposal: TradeProposal) => {
    if (!confirm(`Mark this trade proposal from ${proposal.collectorName} as declined?`)) {
      return;
    }

    setUpdatingTradeId(proposal.id);
    setTradeSuccessMsg("");
    setTradeErrorMsg("");

    try {
      const res = await fetch(`/api/trades/${proposal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "declined" }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update trade proposal.");
      }

      setTradeProposals((prev) =>
        prev.map((t) => (t.id === proposal.id ? { ...t, status: "declined" } : t))
      );

      setTradeSuccessMsg("Trade proposal marked as declined.");
      router.refresh();
      setTimeout(() => setTradeSuccessMsg(""), 5000);
    } catch (err: any) {
      setTradeErrorMsg(err.message || "Failed to update trade.");
    } finally {
      setUpdatingTradeId(null);
    }
  };

  const handleDeleteTrade = async (id: string) => {
    if (!confirm("Are you sure you want to delete this trade proposal? This cannot be undone.")) {
      return;
    }

    setUpdatingTradeId(id);
    try {
      const res = await fetch(`/api/trades/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setTradeProposals((prev) => prev.filter((t) => t.id !== id));
      router.refresh();
    } catch {
      alert("Failed to delete trade proposal.");
    } finally {
      setUpdatingTradeId(null);
    }
  };

  const handleStartBulkEdit = () => {
    const initialEdits: Record<string, { title: string; dimensions: string }> = {};
    bookmarks.forEach((b) => {
      initialEdits[b.id] = { title: b.title, dimensions: b.dimensions };
    });
    setBulkEdits(initialEdits);
    setIsBulkEditing(true);
    setBulkSuccessMsg("");
    setBulkErrorMsg("");
  };

  const handleCancelBulkEdit = () => {
    setIsBulkEditing(false);
    setBulkEdits({});
    setBulkErrorMsg("");
  };

  const handleBulkTitleChange = (id: string, newTitle: string) => {
    setBulkEdits((prev) => ({
      ...prev,
      [id]: {
        title: newTitle,
        dimensions: prev[id]?.dimensions ?? bookmarks.find((b) => b.id === id)?.dimensions ?? "",
      },
    }));
  };

  const handleBulkDimensionsChange = (id: string, newDims: string) => {
    setBulkEdits((prev) => ({
      ...prev,
      [id]: {
        title: prev[id]?.title ?? bookmarks.find((b) => b.id === id)?.title ?? "",
        dimensions: newDims,
      },
    }));
  };

  // Count modified items
  const modifiedItems = Object.entries(bulkEdits).filter(([id, values]) => {
    const original = bookmarks.find((b) => b.id === id);
    if (!original) return false;
    return values.title !== original.title || values.dimensions !== original.dimensions;
  });
  const modifiedCount = modifiedItems.length;

  const handleSaveBulkEdits = async () => {
    if (modifiedCount === 0) {
      setIsBulkEditing(false);
      return;
    }

    setIsSavingBulk(true);
    setBulkErrorMsg("");
    setBulkSuccessMsg("");

    try {
      const updates = modifiedItems.map(([id, values]) => ({
        id,
        title: values.title,
        dimensions: values.dimensions,
      }));

      const res = await fetch("/api/bookmarks/bulk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update bookmarks in bulk");
      }

      // Update local state
      setBookmarks((prev) =>
        prev.map((b) => {
          if (bulkEdits[b.id]) {
            return {
              ...b,
              title: bulkEdits[b.id].title,
              dimensions: bulkEdits[b.id].dimensions,
            };
          }
          return b;
        })
      );

      setIsBulkEditing(false);
      setBulkEdits({});
      setBulkSuccessMsg(`Successfully updated ${updates.length} bookmark${updates.length === 1 ? "" : "s"}.`);
      router.refresh();

      setTimeout(() => {
        setBulkSuccessMsg("");
      }, 5000);
    } catch (err: any) {
      console.error("Bulk save error:", err);
      setBulkErrorMsg(err.message || "Failed to save bulk changes.");
    } finally {
      setIsSavingBulk(false);
    }
  };

  const filteredBookmarks = bookmarks.filter((b) => {
    const q = search.toLowerCase();
    const currentTitle = isBulkEditing && bulkEdits[b.id] ? bulkEdits[b.id].title : b.title;
    return (
      currentTitle.toLowerCase().includes(q) ||
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

  const filteredTrades = tradeProposals.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.collectorName.toLowerCase().includes(q) ||
      t.collectorEmail.toLowerCase().includes(q) ||
      t.offeredItems.toLowerCase().includes(q) ||
      t.status.toLowerCase().includes(q)
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

          <button
            type="button"
            onClick={() => setActiveTab("trades")}
            className={`px-3.5 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "trades"
                ? "bg-white text-stone-900 font-bold shadow-xs border border-[#E8E2D5]"
                : "text-stone-500 hover:text-stone-900"
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Trade Proposals ({tradeProposals.length})</span>
            {pendingTradesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-amber-500 text-white animate-pulse">
                {pendingTradesCount}
              </span>
            )}
          </button>
        </div>

        {/* Right side controls: Search filter input + Bulk Edit Button */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {activeTab === "bookmarks" && (
            !isBulkEditing ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleStartBulkEdit}
                className="text-xs font-serif flex items-center gap-1.5 bg-white border-[#E8E2D5] text-stone-800 hover:text-[#F43F7A] shrink-0 cursor-pointer shadow-2xs"
              >
                <Edit className="w-3.5 h-3.5 text-[#F43F7A]" />
                <span>Bulk Edit</span>
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="oxblood"
                  size="sm"
                  onClick={handleSaveBulkEdits}
                  disabled={isSavingBulk || modifiedCount === 0}
                  className="text-xs font-serif flex items-center gap-1.5 bg-[#F43F7A] hover:bg-[#E11D48] text-white shrink-0 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSavingBulk ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-200" />
                  ) : (
                    <Save className="w-3.5 h-3.5 text-amber-200" />
                  )}
                  <span>
                    {isSavingBulk
                      ? "Saving..."
                      : modifiedCount > 0
                      ? `Save (${modifiedCount})`
                      : "Save Changes"}
                  </span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancelBulkEdit}
                  disabled={isSavingBulk}
                  className="text-xs font-serif flex items-center gap-1 bg-white border-stone-300 text-stone-600 hover:text-stone-900 shrink-0 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </Button>
              </div>
            )
          )}

          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                activeTab === "bookmarks"
                  ? "Filter bookmarks..."
                  : activeTab === "bookstores"
                  ? "Filter bookstores & cities..."
                  : "Filter proposals & collectors..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9.5 pr-4 py-1.5 text-xs bg-white border border-[#E8E2D5] rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 font-serif"
            />
          </div>
        </div>
      </div>

      {/* Trade Actions Notifications Banner */}
      {tradeSuccessMsg && (
        <div className="px-4 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-xs font-serif flex items-center gap-2 shadow-2xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{tradeSuccessMsg}</span>
        </div>
      )}

      {tradeErrorMsg && (
        <div className="px-4 py-2.5 bg-rose-50 border-b border-rose-200 text-rose-900 text-xs font-serif flex items-center gap-2 shadow-2xs">
          <X className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-medium">{tradeErrorMsg}</span>
        </div>
      )}

      {/* Bulk Edit Notifications Banner */}
      {isBulkEditing && (
        <div className="px-4 py-2.5 bg-amber-50/90 border-b border-amber-200 text-amber-900 text-xs font-serif flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span className="font-bold text-amber-950">Bulk Edit Mode:</span>
            <span>Edit bookmark names and measurements directly below, then click <strong>"Save Changes"</strong>.</span>
          </div>
          {modifiedCount > 0 && (
            <span className="font-mono font-bold text-[11px] bg-amber-200 text-amber-950 px-2 py-0.5 rounded border border-amber-300 shrink-0">
              {modifiedCount} modified
            </span>
          )}
        </div>
      )}

      {bulkSuccessMsg && (
        <div className="px-4 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-xs font-serif flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{bulkSuccessMsg}</span>
        </div>
      )}

      {bulkErrorMsg && (
        <div className="px-4 py-2.5 bg-rose-50 border-b border-rose-200 text-rose-900 text-xs font-serif flex items-center gap-2">
          <X className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-medium">{bulkErrorMsg}</span>
        </div>
      )}

      {/* BOOKMARKS TABLE */}
      {activeTab === "bookmarks" && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-[#E8E2D5] font-mono uppercase text-stone-500 text-[11px]">
              <tr>
                <th className="py-3 px-4">Scan</th>
                <th className="py-3 px-4 min-w-[240px]">Bookmark Title</th>
                <th className="py-3 px-4">Historic Bookstore</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Trade Extras</th>
                <th className="py-3 px-4 min-w-[160px]">Physical Specs</th>
                <th className="py-3 px-4">Clippings</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D5]">
              {filteredBookmarks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-500 font-serif italic">
                    No bookmarks match your search query.
                  </td>
                </tr>
              ) : (
                filteredBookmarks.map((b) => {
                  const isModified =
                    bulkEdits[b.id] &&
                    (bulkEdits[b.id].title !== b.title || bulkEdits[b.id].dimensions !== b.dimensions);

                  return (
                    <tr
                      key={b.id}
                      className={`transition-colors ${
                        isModified ? "bg-amber-50/50" : "hover:bg-[#FAF8F5]/60"
                      }`}
                    >
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
                        {isBulkEditing ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={bulkEdits[b.id]?.title ?? b.title}
                              onChange={(e) => handleBulkTitleChange(b.id, e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs font-serif font-bold text-stone-900 bg-white border border-[#2563EB]/40 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] rounded-md outline-none shadow-2xs"
                              placeholder="Bookmark title..."
                            />
                            <span className="font-mono text-[10px] text-stone-400 block">
                              Accession: {b.accessionNo}
                            </span>
                          </div>
                        ) : (
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
                        )}
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
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {(b.tradeQuantity || 0) > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            ✕ {b.tradeQuantity} {b.tradeQuantity === 1 ? "extra" : "extras"}
                          </span>
                        ) : (
                          <span className="text-stone-400 text-[10px]">0</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-stone-500">
                        {isBulkEditing ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={bulkEdits[b.id]?.dimensions ?? b.dimensions}
                              onChange={(e) => handleBulkDimensionsChange(b.id, e.target.value)}
                              placeholder='e.g. 2.25" × 7.5"'
                              className="w-full px-2 py-1 text-xs font-mono text-stone-900 bg-white border border-[#2563EB]/40 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] rounded-md outline-none shadow-2xs"
                            />
                            <div className="text-[10px] text-stone-400 truncate">{b.material}</div>
                          </div>
                        ) : (
                          <div>
                            <div>{b.dimensions}</div>
                            <div className="text-[10px] text-stone-400">{b.material}</div>
                          </div>
                        )}
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
                  );
                })
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

      {/* TRADE PROPOSALS VIEW */}
      {activeTab === "trades" && (
        <div className="p-4 sm:p-6 space-y-4">
          {filteredTrades.length === 0 ? (
            <div className="py-12 text-center text-stone-500 font-serif space-y-2">
              <Inbox className="w-8 h-8 text-stone-300 mx-auto" />
              <p className="italic text-sm">
                {search ? "No trade proposals match your search query." : "No trade proposals received yet."}
              </p>
              <p className="text-xs text-stone-400">
                Proposals submitted by visitors on the Bookmark Bazaar will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTrades.map((proposal) => {
                let snapshot: Array<{
                  id: string;
                  title: string;
                  accessionNo: string;
                  bookstoreName?: string;
                  frontImageUrl?: string;
                }> = [];
                try {
                  snapshot = JSON.parse(proposal.requestedBookmarksSnapshot);
                } catch {}

                const isUpdating = updatingTradeId === proposal.id;

                return (
                  <div
                    key={proposal.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      proposal.status === "pending"
                        ? "bg-amber-50/30 border-amber-200/80 shadow-xs"
                        : proposal.status === "accepted"
                        ? "bg-white border-emerald-200 shadow-2xs"
                        : "bg-white border-[#E8E2D5] opacity-80"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2D5]">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <h3 className="font-serif font-bold text-base text-stone-900">
                            {proposal.collectorName}
                          </h3>
                          {proposal.status === "pending" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                              <span>Pending Review</span>
                            </span>
                          ) : proposal.status === "accepted" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Trade Accepted &amp; Deducted</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-stone-100 text-stone-600 border border-stone-200">
                              <span>Declined</span>
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs font-serif text-stone-500">
                          <a
                            href={`mailto:${proposal.collectorEmail}?subject=${encodeURIComponent(
                              `Regarding your Bookmark Trade Proposal (${proposal.collectorName})`
                            )}`}
                            className="inline-flex items-center gap-1 text-[#2563EB] hover:underline font-mono text-[11px]"
                          >
                            <Mail className="w-3 h-3" />
                            <span>{proposal.collectorEmail}</span>
                          </a>
                          <span>•</span>
                          <span className="font-mono text-[11px]">
                            Submitted: {new Date(proposal.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={`mailto:${proposal.collectorEmail}?subject=${encodeURIComponent(
                            `Regarding your Bookmark Trade Proposal (${proposal.collectorName})`
                          )}`}
                          className="px-3 py-1.5 rounded-lg border border-[#E8E2D5] bg-white text-stone-700 hover:text-[#2563EB] hover:border-[#2563EB] text-xs font-serif inline-flex items-center gap-1.5 transition-colors shadow-2xs"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Reply via Email</span>
                        </a>

                        {proposal.status === "pending" && (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              disabled={isUpdating}
                              onClick={() => handleAcceptTrade(proposal)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-serif text-xs flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                            >
                              {isUpdating ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                              <span>Accept Trade &amp; Deduct</span>
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isUpdating}
                              onClick={() => handleDeclineTrade(proposal)}
                              className="border-stone-300 text-stone-600 hover:text-rose-600 text-xs font-serif cursor-pointer"
                            >
                              Decline
                            </Button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteTrade(proposal.id)}
                          disabled={isUpdating}
                          className="p-2 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Proposal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Grid with Requested Bookmarks & Offered Items */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      {/* 1. Requested Bookmarks */}
                      <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D5] space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider font-bold">
                            Requested Archive Bookmarks ({snapshot.length})
                          </span>
                          <span className="text-[10px] text-stone-400 font-sans">
                            (1 copy deducted on accept)
                          </span>
                        </div>

                        <div className="space-y-2">
                          {snapshot.map((item) => {
                            const liveBookmark = bookmarks.find((b) => b.id === item.id);
                            const currentQty = liveBookmark?.tradeQuantity ?? 0;

                            return (
                              <div
                                key={item.id}
                                className="flex items-center gap-3 p-2 bg-white rounded-lg border border-[#E8E2D5] shadow-2xs"
                              >
                                {item.frontImageUrl && (
                                  <div className="relative w-7 h-14 bg-stone-100 rounded overflow-hidden shrink-0 border border-stone-200">
                                    <Image
                                      src={item.frontImageUrl}
                                      alt={item.title}
                                      fill
                                      unoptimized
                                      className="object-cover object-top"
                                    />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="font-serif font-bold text-xs text-stone-900 truncate">
                                    {item.title}
                                  </div>
                                  <div className="text-[11px] font-serif text-[#2563EB] truncate">
                                    {item.bookstoreName}
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="font-mono text-[10px] text-stone-400">
                                      {item.accessionNo}
                                    </span>
                                    <span className="text-stone-300">•</span>
                                    <span className="font-mono text-[10px] text-stone-600 font-semibold">
                                      Live Archive Stock: {currentQty} {currentQty === 1 ? "copy" : "copies"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* 2. Offered Ephemera Description */}
                      <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D5] space-y-2 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider font-bold block mb-1">
                            Bookmarks &amp; Ephemera Offered in Exchange
                          </span>
                          <div className="p-3 bg-white rounded-lg border border-[#E8E2D5] text-xs font-serif text-stone-800 whitespace-pre-wrap leading-relaxed min-h-[90px]">
                            {proposal.offeredItems}
                          </div>
                        </div>

                        <div className="text-[11px] font-serif text-stone-500 italic pt-1">
                          Contact the collector directly via their email to finalize mailing logistics and physical exchange.
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
