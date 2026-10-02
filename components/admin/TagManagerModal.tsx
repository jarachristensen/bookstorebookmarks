"use client";

import React, { useState } from "react";
import { Tag, Plus, Trash2, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface TagManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tags: string[];
  onTagsUpdated: (newTags: string[]) => void;
}

export function TagManagerModal({
  isOpen,
  onClose,
  tags,
  onTagsUpdated,
}: TagManagerModalProps) {
  const [newTagName, setNewTagName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTagName.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/other-bookmarks/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Failed to create tag" }));
        throw new Error(data.error || "Failed to create tag");
      }

      const data = await res.json();
      if (data.tags) {
        onTagsUpdated(data.tags);
      }
      setNewTagName("");
    } catch (err: any) {
      setError(err.message || "Failed to create tag");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTag = async (tagName: string) => {
    if (!confirm(`Are you sure you want to delete the tag "${tagName}"?`)) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/other-bookmarks/tags?name=${encodeURIComponent(tagName)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Failed to delete tag" }));
        throw new Error(data.error || "Failed to delete tag");
      }

      const data = await res.json();
      if (data.tags) {
        onTagsUpdated(data.tags);
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete tag");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#FAF8F5] border border-[#E8E2D5] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#E8E2D5]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#2563EB]/10 rounded-xl text-[#2563EB]">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-black text-lg text-stone-900">
                Manage Ephemera Tags
              </h2>
              <p className="font-serif text-xs text-stone-500">
                Create and organize tags used for filtering & organizing non-bookstore bookmarks.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Create Tag Form */}
          <form onSubmit={handleCreateTag} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Vintage 1970s, Literary Festivals, Art Prints..."
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-white border border-[#E8E2D5] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2563EB] font-serif"
            />
            <Button
              type="submit"
              disabled={loading || !newTagName.trim()}
              className="bg-[#18181B] text-white hover:bg-black font-serif text-xs px-4 flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Add Tag
            </Button>
          </form>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-serif flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Tags List */}
          <div className="space-y-2">
            <div className="font-serif text-xs font-bold text-stone-600 uppercase tracking-wider">
              Existing Tags ({tags.length})
            </div>

            <div className="divide-y divide-stone-100 bg-white border border-[#E8E2D5] rounded-2xl overflow-hidden">
              {tags.length === 0 ? (
                <div className="p-6 text-center text-xs font-serif text-stone-400">
                  No custom tags yet. Create one above!
                </div>
              ) : (
                tags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-stone-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                      <span className="font-serif text-xs font-bold text-stone-800">{tag}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteTag(tag)}
                      disabled={loading}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title={`Delete "${tag}"`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 bg-white border-t border-[#E8E2D5]">
          <Button variant="primary" onClick={onClose} className="bg-[#18181B] text-white hover:bg-black font-serif text-xs">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
