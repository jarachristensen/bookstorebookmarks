"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookmarkWithDetails } from "@/lib/db/queries";
import { Badge } from "@/components/ui/Badge";
import { Search, Edit, Trash2, ExternalLink, Sparkles, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

export interface AdminTableClientProps {
  initialBookmarks: BookmarkWithDetails[];
}

export function AdminTableClient({ initialBookmarks }: AdminTableClientProps) {
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const filtered = bookmarks.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.title.toLowerCase().includes(q) ||
      b.accessionNo.toLowerCase().includes(q) ||
      b.bookstore?.name.toLowerCase().includes(q) ||
      b.bookstore?.city.toLowerCase().includes(q)
    );
  });

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
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

  return (
    <div className="bg-white border border-parchment-border rounded-2xl shadow-xs overflow-hidden space-y-4">
      {/* Search filter */}
      <div className="p-4 border-b border-parchment-border bg-parchment-light/60 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter cataloged items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 text-xs bg-white border border-parchment-border rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-amber-700/30 font-serif"
          />
        </div>
        <span className="text-xs font-mono text-ink-muted">
          Showing {filtered.length} of {bookmarks.length} records
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-parchment-muted/60 border-b border-parchment-border font-mono uppercase text-ink-muted text-[11px]">
            <tr>
              <th className="py-3 px-4">Scan</th>
              <th className="py-3 px-4">Accession</th>
              <th className="py-3 px-4">Bookmark Title</th>
              <th className="py-3 px-4">Historic Bookstore</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Clippings</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-parchment-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-ink-muted font-serif italic">
                  No bookmarks match your search query.
                </td>
              </tr>
            ) : (
              filtered.map((b) => (
                <tr key={b.id} className="hover:bg-parchment-light/40 transition-colors">
                  {/* Scan Thumbnail */}
                  <td className="py-3 px-4">
                    <div className="relative w-9 h-20 rounded bg-parchment-border/40 overflow-hidden border border-parchment-border shadow-2xs">
                      <Image
                        src={b.frontImageUrl}
                        alt={b.title}
                        fill
                        className="object-cover object-top"
                      />
                    </div>
                  </td>

                  {/* Accession */}
                  <td className="py-3 px-4 font-mono font-bold text-ink">
                    <Badge variant="mono" size="sm">
                      {b.accessionNo}
                    </Badge>
                  </td>

                  {/* Title & Badge */}
                  <td className="py-3 px-4 font-serif">
                    <div className="font-bold text-ink hover:text-archival-oxblood text-sm">
                      {b.title}
                    </div>
                    <div className="text-[11px] text-ink-muted italic">
                      {b.material} · {b.dimensions}
                    </div>
                  </td>

                  {/* Bookstore */}
                  <td className="py-3 px-4 font-serif">
                    {b.bookstore ? (
                      <div>
                        <span className="font-semibold text-ink">{b.bookstore.name}</span>
                        <div className="text-[11px] text-ink-muted">
                          {b.bookstore.yearOpened}–{b.bookstore.yearClosed || "Present"}
                        </div>
                      </div>
                    ) : (
                      <span className="text-ink-muted">—</span>
                    )}
                  </td>

                  {/* Location */}
                  <td className="py-3 px-4 text-ink-light">
                    {b.bookstore?.city}, {b.bookstore?.country}
                  </td>

                  {/* Clippings count */}
                  <td className="py-3 px-4 font-mono">
                    <span className="px-2 py-0.5 rounded bg-parchment-muted border border-parchment-border text-[11px]">
                      {b.bookstore?.archivalMedia.length || 0} items
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right space-x-2">
                    <Link
                      href={`/admin/edit/${b.id}`}
                      className="inline-flex items-center gap-1 p-1.5 rounded text-ink-light hover:text-ink hover:bg-parchment-muted transition-colors"
                      title="Edit this record"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>

                    <button
                      type="button"
                      disabled={deletingId === b.id}
                      onClick={() => handleDelete(b.id, b.title)}
                      className="inline-flex items-center gap-1 p-1.5 rounded text-rose-700 hover:text-rose-900 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
