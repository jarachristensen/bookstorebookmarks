"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookmarkWithDetails, BookstoreWithDetails } from "@/lib/db/queries";
import { TradeProposal, NonBookstoreBookmark } from "@/db/schema";
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
  Tag,
  Upload,
  FileSpreadsheet,
  Layers,
  Sliders,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { OtherBookmarksBulkUploaderModal } from "@/components/admin/OtherBookmarksBulkUploaderModal";
import { TagManagerModal } from "@/components/admin/TagManagerModal";
import { EditOtherBookmarkModal } from "@/components/admin/EditOtherBookmarkModal";

export interface AdminTableClientProps {
  initialBookmarks: BookmarkWithDetails[];
  initialBookstores: BookstoreWithDetails[];
  initialTradeProposals?: TradeProposal[];
  initialOtherBookmarks?: NonBookstoreBookmark[];
  initialOtherBookmarkTags?: string[];
}

export function AdminTableClient({
  initialBookmarks = [],
  initialBookstores = [],
  initialTradeProposals = [],
  initialOtherBookmarks = [],
  initialOtherBookmarkTags = [],
}: AdminTableClientProps) {
  const [activeTab, setActiveTab] = useState<
    "bookmarks" | "bookstores" | "other" | "trades"
  >("bookmarks");
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [bookstores, setBookstores] = useState(initialBookstores);
  const [otherBookmarks, setOtherBookmarks] = useState<NonBookstoreBookmark[]>(
    initialOtherBookmarks
  );
  const [otherBookmarkTags, setOtherBookmarkTags] = useState<string[]>(
    initialOtherBookmarkTags && initialOtherBookmarkTags.length > 0
      ? initialOtherBookmarkTags
      : ["Libraries", "Publishers", "Authors", "Art & Illustration", "Vintage Advertising"]
  );
  const [tradeProposals, setTradeProposals] = useState<TradeProposal[]>(
    initialTradeProposals
  );
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingTradeId, setUpdatingTradeId] = useState<string | null>(null);
  const [tradeSuccessMsg, setTradeSuccessMsg] = useState("");
  const [tradeErrorMsg, setTradeErrorMsg] = useState("");

  // Bulk Edit States for Bookstore Bookmarks
  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const [bulkEdits, setBulkEdits] = useState<
    Record<string, { title: string; dimensions: string }>
  >({});
  const [isSavingBulk, setIsSavingBulk] = useState(false);
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState("");
  const [bulkErrorMsg, setBulkErrorMsg] = useState("");

  // Other Bookmarks Modal States
  const [isBulkImageUploaderOpen, setIsBulkImageUploaderOpen] = useState(false);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [editingOtherBookmark, setEditingOtherBookmark] =
    useState<NonBookstoreBookmark | null>(null);
  const [isAddingOther, setIsAddingOther] = useState(false);
  const [newOtherTitle, setNewOtherTitle] = useState("");
  const [newOtherCategory, setNewOtherCategory] = useState("Libraries");
  const [newOtherTags, setNewOtherTags] = useState<string[]>(["Libraries"]);
  const [newOtherFrontImage, setNewOtherFrontImage] = useState("");
  const [newOtherBackImage, setNewOtherBackImage] = useState("");
  const [newOtherQuantity, setNewOtherQuantity] = useState(1);
  const [isSubmittingOther, setIsSubmittingOther] = useState(false);

  // Spreadsheet Importer Modal State
  const [isSpreadsheetModal, setIsSpreadsheetModal] = useState(false);
  const [spreadsheetText, setSpreadsheetText] = useState("");
  const [isImportingSpreadsheet, setIsImportingSpreadsheet] = useState(false);
  const [importResultMsg, setImportResultMsg] = useState("");
  const [importErrorMsg, setImportErrorMsg] = useState("");

  const router = useRouter();

  const pendingTradesCount = tradeProposals.filter(
    (t) => t.status === "pending"
  ).length;

  const handleAcceptTrade = async (proposal: TradeProposal) => {
    if (
      !confirm(
        `Accept this trade from ${proposal.collectorName}? This will automatically deduct 1 copy from the duplicate inventory for each requested bookmark.`
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

      // Decrement inventory in local otherBookmarks state as well
      setOtherBookmarks((prev) =>
        prev.map((obm) => {
          if (reqIds.includes(obm.id)) {
            return {
              ...obm,
              tradeQuantity: Math.max(0, (obm.tradeQuantity || 1) - 1),
            };
          }
          return obm;
        })
      );

      // Update local tradeProposals state
      setTradeProposals((prev) =>
        prev.map((t) =>
          t.id === proposal.id ? { ...t, status: "accepted" } : t
        )
      );

      setTradeSuccessMsg(
        `Trade accepted! 1 duplicate copy was deducted for ${reqIds.length} requested bookmark${
          reqIds.length === 1 ? "" : "s"
        }.`
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
    if (
      !confirm(`Decline trade proposal from ${proposal.collectorName}?`)
    ) {
      return;
    }

    setUpdatingTradeId(proposal.id);
    try {
      const res = await fetch(`/api/trades/${proposal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "declined" }),
      });

      if (!res.ok) throw new Error("Failed to decline proposal.");

      setTradeProposals((prev) =>
        prev.map((t) =>
          t.id === proposal.id ? { ...t, status: "declined" } : t
        )
      );
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Error declining proposal");
    } finally {
      setUpdatingTradeId(null);
    }
  };

  const handleDeleteTrade = async (id: string) => {
    if (!confirm("Are you sure you want to delete this trade proposal?")) return;

    setUpdatingTradeId(id);
    try {
      const res = await fetch(`/api/trades/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete proposal.");

      setTradeProposals((prev) => prev.filter((t) => t.id !== id));
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Error deleting proposal");
    } finally {
      setUpdatingTradeId(null);
    }
  };

  const handleStartBulkEdit = () => {
    const initialValues: Record<string, { title: string; dimensions: string }> =
      {};
    bookmarks.forEach((b) => {
      initialValues[b.id] = {
        title: b.title,
        dimensions: b.dimensions,
      };
    });
    setBulkEdits(initialValues);
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
        dimensions:
          prev[id]?.dimensions ??
          bookmarks.find((b) => b.id === id)?.dimensions ??
          "",
      },
    }));
  };

  const handleBulkDimensionsChange = (id: string, newDims: string) => {
    setBulkEdits((prev) => ({
      ...prev,
      [id]: {
        title:
          prev[id]?.title ??
          bookmarks.find((b) => b.id === id)?.title ??
          "",
        dimensions: newDims,
      },
    }));
  };

  const modifiedItems = Object.entries(bulkEdits).filter(([id, values]) => {
    const original = bookmarks.find((b) => b.id === id);
    if (!original) return false;
    return (
      values.title !== original.title || values.dimensions !== original.dimensions
    );
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
      setBulkSuccessMsg(
        `Successfully updated ${updates.length} bookmark${
          updates.length === 1 ? "" : "s"
        }.`
      );
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

  // Other Bookmarks Actions
  const handleCreateOtherBookmark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOtherTitle.trim() || !newOtherFrontImage.trim()) {
      alert("Title and Front Image URL are required.");
      return;
    }

    setIsSubmittingOther(true);
    try {
      const selectedTags = newOtherTags.length > 0 ? newOtherTags : ["General Ephemera"];
      const primaryCategory = selectedTags[0] || "General Ephemera";

      const res = await fetch("/api/other-bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newOtherTitle.trim(),
          category: primaryCategory,
          tags: selectedTags,
          frontImageUrl: newOtherFrontImage.trim(),
          backImageUrl: newOtherBackImage.trim() || null,
          tradeQuantity: Number(newOtherQuantity) || 1,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create bookmark");

      const newItem: NonBookstoreBookmark = {
        id: data.id,
        title: newOtherTitle.trim(),
        category: primaryCategory,
        tags: JSON.stringify(selectedTags),
        frontImageUrl: newOtherFrontImage.trim(),
        backImageUrl: newOtherBackImage.trim() || null,
        tradeQuantity: Number(newOtherQuantity) || 1,
        dimensions: '2" × 7"',
        material: "Printed Cardstock",
        condition: "Collectible",
        notes: null,
        displayOrder: otherBookmarks.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setOtherBookmarks((prev) => [newItem, ...prev]);
      setIsAddingOther(false);
      setNewOtherTitle("");
      setNewOtherFrontImage("");
      setNewOtherBackImage("");
      setNewOtherQuantity(1);
      setNewOtherTags(["Libraries"]);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Error creating bookmark");
    } finally {
      setIsSubmittingOther(false);
    }
  };

  const handleDeleteOtherBookmark = async (id: string, title: string) => {
    if (!confirm(`Delete other bookmark "${title}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/other-bookmarks/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setOtherBookmarks((prev) => prev.filter((b) => b.id !== id));
      router.refresh();
    } catch {
      alert("Failed to delete bookmark.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateOtherQuantity = async (id: string, newQty: number) => {
    const clamped = Math.max(0, newQty);
    setOtherBookmarks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, tradeQuantity: clamped } : b))
    );

    try {
      await fetch(`/api/other-bookmarks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tradeQuantity: clamped }),
      });
      router.refresh();
    } catch (err) {
      console.error("Failed to update trade quantity:", err);
    }
  };

  // Bulk Spreadsheet Importer
  const handleImportSpreadsheet = async () => {
    if (!spreadsheetText.trim()) {
      setImportErrorMsg("Please paste spreadsheet rows or CSV data.");
      return;
    }

    setIsImportingSpreadsheet(true);
    setImportErrorMsg("");
    setImportResultMsg("");

    try {
      const rawLines = spreadsheetText.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (rawLines.length === 0) throw new Error("No data found.");

      // Parse lines (support tab-separated, comma-separated, or pipe-separated)
      const parsedRows: Array<{
        title: string;
        frontImageUrl: string;
        backImageUrl?: string | null;
        category?: string;
        tradeQuantity?: number;
      }> = [];

      for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i].trim();
        // Skip header if it contains words like 'title' or 'front'
        if (
          i === 0 &&
          (line.toLowerCase().includes("title") ||
            line.toLowerCase().includes("preview") ||
            line.toLowerCase().includes("category"))
        ) {
          continue;
        }

        let parts = line.split("\t");
        if (parts.length < 2) {
          parts = line.split(",");
        }
        if (parts.length < 2) {
          parts = line.split("|");
        }

        const title = parts[0]?.replace(/^["']|["']$/g, "").trim();
        const front = parts[1]?.replace(/^["']|["']$/g, "").trim();
        const back = parts[2]?.replace(/^["']|["']$/g, "").trim() || null;
        const cat = parts[3]?.replace(/^["']|["']$/g, "").trim() || "General Ephemera";
        const qtyStr = parts[4]?.replace(/^["']|["']$/g, "").trim();
        const qty = qtyStr ? parseInt(qtyStr, 10) || 1 : 1;

        if (title && front) {
          parsedRows.push({
            title,
            frontImageUrl: front,
            backImageUrl: back && back !== "-" ? back : null,
            category: cat,
            tradeQuantity: qty,
          });
        }
      }

      if (parsedRows.length === 0) {
        throw new Error(
          "Could not parse valid bookmark rows. Ensure each line has at least Title and Front Image URL."
        );
      }

      const res = await fetch("/api/other-bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedRows),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed.");

      setImportResultMsg(
        `Successfully imported ${data.inserted || parsedRows.length} bookmarks into the Ephemera Bazaar!`
      );
      setSpreadsheetText("");

      // Fetch fresh list
      const freshRes = await fetch("/api/other-bookmarks");
      if (freshRes.ok) {
        const freshData = await freshRes.json();
        setOtherBookmarks(freshData);
      }

      router.refresh();
      setTimeout(() => {
        setIsSpreadsheetModal(false);
        setImportResultMsg("");
      }, 2500);
    } catch (err: any) {
      setImportErrorMsg(err.message || "Failed to process spreadsheet.");
    } finally {
      setIsImportingSpreadsheet(false);
    }
  };

  const filteredBookmarks = bookmarks.filter((b) => {
    const q = search.toLowerCase();
    const currentTitle =
      isBulkEditing && bulkEdits[b.id] ? bulkEdits[b.id].title : b.title;
    return (
      (currentTitle && currentTitle.toLowerCase().includes(q)) ||
      (b.bookstore?.name && b.bookstore.name.toLowerCase().includes(q)) ||
      (b.bookstore?.city && b.bookstore.city.toLowerCase().includes(q))
    );
  });

  const filteredBookstores = bookstores.filter((s) => {
    const q = search.toLowerCase();
    return (
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.city && s.city.toLowerCase().includes(q)) ||
      (s.historicalBlurb && s.historicalBlurb.toLowerCase().includes(q))
    );
  });

  const filteredOtherBookmarks = otherBookmarks.filter((b) => {
    const q = search.toLowerCase();
    return (
      (b.title && b.title.toLowerCase().includes(q)) ||
      (b.category && b.category.toLowerCase().includes(q))
    );
  });

  const filteredTrades = tradeProposals.filter((t) => {
    const q = search.toLowerCase();
    return (
      (t.collectorName && t.collectorName.toLowerCase().includes(q)) ||
      (t.collectorEmail && t.collectorEmail.toLowerCase().includes(q)) ||
      (t.offeredItems && t.offeredItems.toLowerCase().includes(q)) ||
      (t.status && t.status.toLowerCase().includes(q))
    );
  });

  const handleDeleteBookmark = async (id: string, title: string) => {
    if (
      !confirm(
        `Are you sure you want to delete bookmark "${title}"? This cannot be undone.`
      )
    ) {
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
        <div className="inline-flex rounded-lg border border-[#E8E2D5] p-0.5 bg-[#FAF8F5] text-xs font-serif overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveTab("bookmarks")}
            className={`px-3.5 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "bookmarks"
                ? "bg-white text-[#F43F7A] font-bold shadow-xs border border-[#E8E2D5]"
                : "text-stone-500 hover:text-stone-900"
            }`}
          >
            <BookmarkIcon className="w-3.5 h-3.5 text-[#F43F7A]" />
            <span>Bookstore Bookmarks ({bookmarks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("other")}
            className={`px-3.5 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "other"
                ? "bg-white text-purple-600 font-bold shadow-xs border border-[#E8E2D5]"
                : "text-stone-500 hover:text-stone-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Other Bookmarks ({otherBookmarks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("bookstores")}
            className={`px-3.5 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
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
            className={`px-3.5 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
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

        {/* Right side controls */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {activeTab === "other" && (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsTagManagerOpen(true)}
                className="text-xs font-serif flex items-center gap-1.5 bg-white border-stone-300 text-stone-700 hover:bg-stone-50 shadow-2xs cursor-pointer"
              >
                <Tag className="w-3.5 h-3.5 text-purple-600" />
                <span>Manage Tags ({otherBookmarkTags.length})</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsSpreadsheetModal(true)}
                className="text-xs font-serif flex items-center gap-1.5 bg-white border-purple-200 text-purple-700 hover:bg-purple-50 shadow-2xs cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Spreadsheet Paste</span>
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={() => setIsBulkImageUploaderOpen(true)}
                className="text-xs font-serif flex items-center gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white shadow-xs cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Bulk Image Uploader</span>
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={() => setIsAddingOther(true)}
                className="text-xs font-serif flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Single</span>
              </Button>
            </div>
          )}

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
                  : activeTab === "other"
                  ? "Filter other bookmarks..."
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
            <span>
              Edit bookmark names and measurements directly below, then click{" "}
              <strong>"Save Changes"</strong>.
            </span>
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

      {/* 1. BOOKMARKS TABLE */}
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
                  <td
                    colSpan={8}
                    className="py-8 text-center text-stone-500 font-serif italic"
                  >
                    No bookmarks match your search query.
                  </td>
                </tr>
              ) : (
                filteredBookmarks.map((b) => {
                  const isModified =
                    bulkEdits[b.id] &&
                    (bulkEdits[b.id].title !== b.title ||
                      bulkEdits[b.id].dimensions !== b.dimensions);

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
                              onChange={(e) =>
                                handleBulkTitleChange(b.id, e.target.value)
                              }
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
                              <span className="font-serif font-bold">
                                {b.title}
                              </span>
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
                      <td className="py-3 px-4">
                        {b.bookstore ? (
                          <Link
                            href={`/admin/bookstores/${b.bookstore.id}`}
                            className="text-[#2563EB] hover:underline font-serif font-medium"
                          >
                            {b.bookstore.name}
                          </Link>
                        ) : (
                          <span className="text-stone-400 italic">None</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-serif text-stone-600">
                        {b.bookstore ? (
                          <span>
                            {b.bookstore.city}
                            {b.bookstore.stateProvince
                              ? `, ${b.bookstore.stateProvince}`
                              : ""}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-mono font-bold text-xs px-2 py-0.5 rounded-full border ${
                            b.tradeQuantity > 0
                              ? "bg-amber-50 text-amber-800 border-amber-300"
                              : "bg-stone-50 text-stone-400 border-stone-200"
                          }`}
                        >
                          {b.tradeQuantity} in bazaar
                        </span>
                      </td>
                      <td className="py-3 px-4 font-serif text-stone-600">
                        {isBulkEditing ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={bulkEdits[b.id]?.dimensions ?? b.dimensions}
                              onChange={(e) =>
                                handleBulkDimensionsChange(b.id, e.target.value)
                              }
                              className="w-full px-2 py-1 text-xs font-mono text-stone-800 bg-white border border-[#2563EB]/40 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] rounded-md outline-none shadow-2xs"
                              placeholder='e.g. 2.25" × 7.5"'
                            />
                            <span className="text-[10px] text-stone-400 block truncate">
                              {b.material}
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="font-mono text-[11px] block text-stone-700">
                              {b.dimensions}
                            </span>
                            <span className="text-[11px] text-stone-400 block truncate max-w-[140px]">
                              {b.material}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] text-stone-500">
                          {b.bookstore?.archivalMedia?.length || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/bookmarks/${b.id}`}
                            target="_blank"
                            className="p-1.5 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                            title="View Public Exhibit"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/admin/edit/${b.id}`}
                            className="p-1.5 rounded-md text-stone-600 hover:text-[#F43F7A] hover:bg-[#F43F7A]/10"
                            title="Edit Bookmark Dossier"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteBookmark(b.id, b.title)}
                            disabled={deletingId === b.id}
                            className="p-1.5 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-50"
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

      {/* 2. OTHER BOOKMARKS TAB */}
      {activeTab === "other" && (
        <div className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-purple-50/60 border border-purple-200 rounded-xl text-xs font-serif text-purple-950">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
              <span>
                These bookmarks power your unlisted{" "}
                <Link
                  href="/otherbookmarks"
                  target="_blank"
                  className="font-bold underline text-purple-700 hover:text-purple-900"
                >
                  /otherbookmarks
                </Link>{" "}
                trading page. They are kept completely separate from the main bookstore archive.
              </span>
            </div>
            <Link
              href="/otherbookmarks"
              target="_blank"
              className="inline-flex items-center gap-1 font-bold text-purple-700 hover:underline shrink-0"
            >
              <span>Preview Live Page</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#E8E2D5] font-mono uppercase text-stone-500 text-[11px]">
                <tr>
                  <th className="py-3 px-4">Preview</th>
                  <th className="py-3 px-4 min-w-[240px]">Bookmark Title</th>
                  <th className="py-3 px-4">Tags</th>
                  <th className="py-3 px-4">Available Trade Copies</th>
                  <th className="py-3 px-4">Back Preview</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D5]">
                {filteredOtherBookmarks.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-stone-500 font-serif space-y-3"
                    >
                      <Layers className="w-8 h-8 text-stone-300 mx-auto" />
                      <p className="font-bold text-stone-700">
                        No Other Bookmarks Added Yet
                      </p>
                      <p className="text-xs text-stone-500 max-w-sm mx-auto">
                        Use the "Bulk Image Uploader" or "Spreadsheet Paste" buttons above to add bookmarks to your bazaar.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredOtherBookmarks.map((obm) => {
                    let itemTags: string[] = [];
                    if (obm.tags) {
                      try {
                        const parsed = JSON.parse(obm.tags);
                        if (Array.isArray(parsed) && parsed.length > 0) itemTags = parsed;
                      } catch {}
                    }
                    if (itemTags.length === 0) itemTags = [obm.category || "General Ephemera"];

                    return (
                      <tr key={obm.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="relative w-9 h-20 rounded bg-[#FAF8F5] overflow-hidden border border-[#E8E2D5] shadow-2xs">
                            <Image
                              src={obm.frontImageUrl}
                              alt={obm.title}
                              fill
                              unoptimized
                              className="object-cover object-top"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-stone-900">
                          <div className="font-serif font-bold text-sm">
                            {obm.title}
                          </div>
                          <span className="font-mono text-[10px] text-stone-400">
                            ID: {obm.id}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap items-center gap-1 max-w-[240px]">
                            {itemTags.map((t) => (
                              <span
                                key={t}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-serif font-bold bg-purple-100 text-purple-800 border border-purple-200"
                              >
                                <Tag className="w-2.5 h-2.5 text-purple-600" />
                                <span>{t}</span>
                              </span>
                            ))}
                          </div>
                        </td>
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center gap-1.5 border border-[#E8E2D5] rounded-lg p-1 bg-white">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateOtherQuantity(
                                obm.id,
                                (obm.tradeQuantity || 1) - 1
                              )
                            }
                            className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center cursor-pointer text-xs"
                          >
                            -
                          </button>
                          <span className="font-mono font-bold text-xs px-2 min-w-[24px] text-center">
                            {obm.tradeQuantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateOtherQuantity(
                                obm.id,
                                (obm.tradeQuantity || 0) + 1
                              )
                            }
                            className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center cursor-pointer text-xs"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-serif text-stone-600">
                        {obm.backImageUrl ? (
                          <div className="relative w-8 h-16 rounded bg-stone-100 overflow-hidden border border-stone-200">
                            <Image
                              src={obm.backImageUrl}
                              alt="Back Preview"
                              fill
                              unoptimized
                              className="object-cover object-top"
                            />
                          </div>
                        ) : (
                          <span className="text-stone-400 italic">No back</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingOtherBookmark(obm)}
                            className="p-1.5 rounded-md text-stone-500 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                            title="Edit Bookmark Details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteOtherBookmark(obm.id, obm.title)
                            }
                            disabled={deletingId === obm.id}
                            className="p-1.5 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-50 cursor-pointer"
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
        </div>
      )}

      {/* 3. BOOKSTORES TABLE */}
      {activeTab === "bookstores" && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-[#E8E2D5] font-mono uppercase text-stone-500 text-[11px]">
              <tr>
                <th className="py-3 px-4 min-w-[220px]">Bookstore Name</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Status &amp; Era</th>
                <th className="py-3 px-4">Branches</th>
                <th className="py-3 px-4">Bookmarks</th>
                <th className="py-3 px-4">Clippings</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D5]">
              {filteredBookstores.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-stone-500 font-serif italic"
                  >
                    No bookstores match your search query.
                  </td>
                </tr>
              ) : (
                filteredBookstores.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-[#FAF8F5]/60 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/admin/bookstores/${s.id}`}
                            className="font-serif font-bold text-stone-900 hover:text-[#2563EB]"
                          >
                            {s.name}
                          </Link>
                          {s.isFlagship && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#2563EB]/15 text-[#2563EB] border border-[#2563EB]/30">
                              FLAGSHIP
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[10px] text-stone-400 block">
                          Slug: {s.id}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-serif text-stone-600">
                      <span>
                        {s.city}
                        {s.stateProvince ? `, ${s.stateProvince}` : ""}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {s.isStillOperating ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Active (est. {s.yearOpened})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-stone-100 text-stone-600 border border-stone-200">
                          {s.yearOpened}–{s.yearClosed || "Closed"}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-serif text-stone-600">
                      {s.branches && s.branches.length > 0 ? (
                        <span className="font-mono font-bold text-[11px] text-[#2563EB] bg-[#2563EB]/10 px-2 py-0.5 rounded">
                          {s.branches.length} branches
                        </span>
                      ) : (
                        <span className="text-stone-400 text-[11px]">Single store</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] font-bold text-stone-800">
                        {s.bookmarks?.length || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] text-stone-500">
                        {s.archivalMedia?.length || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/bookstores/${s.id}`}
                          target="_blank"
                          className="p-1.5 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                          title="View Public Dossier"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/admin/bookstores/${s.id}`}
                          className="p-1.5 rounded-md text-stone-600 hover:text-[#2563EB] hover:bg-[#2563EB]/10"
                          title="Edit Bookstore Dossier &amp; Locations"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteBookstore(s.id, s.name)}
                          disabled={deletingId === s.id}
                          className="p-1.5 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                          title="Delete Bookstore"
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

      {/* 4. TRADE PROPOSALS TAB */}
      {activeTab === "trades" && (
        <div className="p-4 space-y-4">
          {filteredTrades.length === 0 ? (
            <div className="py-12 text-center text-stone-500 font-serif space-y-2">
              <Inbox className="w-8 h-8 text-stone-300 mx-auto" />
              <p className="font-bold text-stone-700">No Trade Proposals Found</p>
              <p className="text-xs text-stone-500">
                When visitors submit trade proposals on the Bookmark Bazaar or Other Bookmarks exchange, they will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTrades.map((proposal) => {
                const isUpdating = updatingTradeId === proposal.id;
                let snapshot: Array<{
                  id: string;
                  title: string;
                  bookstoreName?: string;
                  category?: string;
                  accessionNo?: string;
                  frontImageUrl?: string;
                  type?: string;
                }> = [];

                try {
                  snapshot = JSON.parse(proposal.requestedBookmarksSnapshot);
                } catch {}

                return (
                  <div
                    key={proposal.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      proposal.status === "pending"
                        ? "bg-white border-amber-300 shadow-sm"
                        : proposal.status === "accepted"
                        ? "bg-white border-emerald-200"
                        : "bg-stone-50/70 border-stone-200 opacity-80"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E2D5] pb-3.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
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
                          <span className="font-mono text-[11px]" suppressHydrationWarning>
                            Submitted:{" "}
                            {new Date(proposal.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
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
                      {/* Requested Bookmarks */}
                      <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D5] space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider font-bold">
                            Requested Bookmarks ({snapshot.length})
                          </span>
                          <span className="text-[10px] text-stone-400 font-sans">
                            (1 copy deducted on accept)
                          </span>
                        </div>

                        <div className="space-y-2">
                          {snapshot.map((item) => {
                            const liveBm = bookmarks.find((b) => b.id === item.id);
                            const liveOther = otherBookmarks.find((b) => b.id === item.id);
                            const currentQty =
                              liveBm?.tradeQuantity ??
                              liveOther?.tradeQuantity ??
                              0;

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
                                    {item.bookstoreName || item.category || "Ephemera"}
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="font-mono text-[10px] text-stone-600 font-semibold">
                                      Live Stock: {currentQty}{" "}
                                      {currentQty === 1 ? "copy" : "copies"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Offered Ephemera Description */}
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

      {/* MODAL: ADD SINGLE OTHER BOOKMARK */}
      {isAddingOther && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white border border-[#E8E2D5] rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-3">
              <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Add Other Bookmark</span>
              </h3>
              <button
                onClick={() => setIsAddingOther(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOtherBookmark} className="space-y-3">
              <div>
                <label className="block text-xs font-serif font-bold text-stone-700 mb-1">
                  Bookmark Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vintage Library Dewey Decimal Slip"
                  value={newOtherTitle}
                  onChange={(e) => setNewOtherTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-[#E8E2D5] rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-serif"
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-stone-700 mb-1.5">
                  Select Tags (Multi-select)
                </label>
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  {otherBookmarkTags.map((tag) => {
                    const isSelected = newOtherTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() =>
                          setNewOtherTags((prev) =>
                            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                          )
                        }
                        className={`px-2.5 py-1 rounded-lg text-xs font-serif transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[#2563EB] text-white font-bold shadow-xs"
                            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                        }`}
                      >
                        {tag} {isSelected && "✓"}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-stone-700 mb-1">
                  Available Copies
                </label>
                <input
                  type="number"
                  min="0"
                  value={newOtherQuantity}
                  onChange={(e) => setNewOtherQuantity(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 text-xs border border-[#E8E2D5] rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-stone-700 mb-1">
                  Front Image URL *
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://... or /seed-images/..."
                  value={newOtherFrontImage}
                  onChange={(e) => setNewOtherFrontImage(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-[#E8E2D5] rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-stone-700 mb-1">
                  Back Image URL (optional)
                </label>
                <input
                  type="text"
                  placeholder="https://... or /seed-images/..."
                  value={newOtherBackImage}
                  onChange={(e) => setNewOtherBackImage(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-[#E8E2D5] rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E2D5]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingOther(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmittingOther}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isSubmittingOther ? "Saving..." : "Save Bookmark"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BULK SPREADSHEET IMPORTER */}
      {isSpreadsheetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white border border-[#E8E2D5] rounded-2xl shadow-2xl p-6 space-y-4 my-8">
            <div className="flex items-start justify-between border-b border-[#E8E2D5] pb-3">
              <div>
                <span className="text-[10px] font-mono text-purple-600 uppercase font-bold tracking-wider">
                  Bulk Data Loader
                </span>
                <h3 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-purple-600" />
                  <span>Import Spreadsheet of Bookmarks</span>
                </h3>
              </div>
              <button
                onClick={() => setIsSpreadsheetModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-serif text-stone-600 leading-relaxed bg-[#FAF8F5] p-3 rounded-xl border border-[#E8E2D5]">
              <p className="font-bold text-stone-900">
                How to format your spreadsheet:
              </p>
              <p>
                Copy and paste your spreadsheet rows directly from Google Sheets, Excel, or CSV. Each line should contain:
              </p>
              <div className="font-mono text-[11px] bg-white p-2 rounded border border-stone-200 text-stone-800">
                <strong>Title</strong> [tab or comma] <strong>Front Image URL</strong> [tab or comma] <strong>Back Image URL</strong> [tab or comma] <strong>Category</strong> [tab or comma] <strong>Quantity</strong>
              </div>
              <p className="text-[11px] text-stone-500 italic">
                * Header rows (Title, Category, etc.) are automatically skipped if detected.
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-serif font-bold text-stone-700">
                Paste Spreadsheet Rows or CSV:
              </label>
              <textarea
                rows={8}
                value={spreadsheetText}
                onChange={(e) => setSpreadsheetText(e.target.value)}
                placeholder={`1950s Public Library Card\thttps://example.com/front1.jpg\thttps://example.com/back1.jpg\tLibrary\t3\nPenguin Classics Publisher Promo\thttps://example.com/front2.jpg\t-\tPublisher\t2`}
                className="w-full p-3 font-mono text-xs bg-stone-50 border border-[#E8E2D5] rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            {importErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-serif">
                {importErrorMsg}
              </div>
            )}

            {importResultMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-serif flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{importResultMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-[#E8E2D5]">
              <span className="text-[11px] font-mono text-stone-400">
                {spreadsheetText.split(/\r?\n/).filter((l) => l.trim().length > 0).length} lines entered
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSpreadsheetModal(false)}
                  disabled={isImportingSpreadsheet}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={isImportingSpreadsheet || !spreadsheetText.trim()}
                  onClick={handleImportSpreadsheet}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  {isImportingSpreadsheet ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      <span>Importing...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5 mr-1.5" />
                      <span>Import All Bookmarks</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BULK IMAGE UPLOADER & TAG STUDIO */}
      <OtherBookmarksBulkUploaderModal
        isOpen={isBulkImageUploaderOpen}
        onClose={() => setIsBulkImageUploaderOpen(false)}
        availableTags={otherBookmarkTags}
        onTagsUpdated={(newTags) => setOtherBookmarkTags(newTags)}
        onSuccess={async () => {
          const res = await fetch("/api/other-bookmarks");
          if (res.ok) {
            const data = await res.json();
            setOtherBookmarks(data);
          }
          const tagsRes = await fetch("/api/other-bookmarks/tags");
          if (tagsRes.ok) {
            const tagsData = await tagsRes.json();
            if (tagsData.tags) setOtherBookmarkTags(tagsData.tags);
          }
          router.refresh();
        }}
      />

      {/* MODAL: MANAGE TAGS */}
      <TagManagerModal
        isOpen={isTagManagerOpen}
        onClose={() => setIsTagManagerOpen(false)}
        tags={otherBookmarkTags}
        onTagsUpdated={(newTags) => setOtherBookmarkTags(newTags)}
      />

      {/* MODAL: EDIT OTHER BOOKMARK */}
      <EditOtherBookmarkModal
        isOpen={!!editingOtherBookmark}
        onClose={() => setEditingOtherBookmark(null)}
        bookmark={editingOtherBookmark}
        availableTags={otherBookmarkTags}
        onTagsUpdated={(newTags) => setOtherBookmarkTags(newTags)}
        onSuccess={(updated) => {
          setOtherBookmarks((prev) =>
            prev.map((b) => (b.id === updated.id ? updated : b))
          );
          router.refresh();
        }}
      />
    </div>
  );
}
