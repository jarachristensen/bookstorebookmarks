"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { FormattedText } from "@/components/ui/FormattedText";
import { Button } from "@/components/ui/Button";
import {
  Calendar,
  Pencil,
  Save,
  X,
  CheckCircle,
  Loader2,
  Sparkles,
  KeyRound,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";

export interface ReleaseItem {
  id: string;
  date: string;
  title: string;
  notes: string;
}

export const DEFAULT_RELEASES: ReleaseItem[] = [
  {
    id: "release-october-2026",
    date: "October 2026",
    title: "October 2026 Archive Release",
    notes: `### What's New & Enhancements
- **Timeline Photo & Newspaper Clippings**: Historical facts and newspaper articles on bookstore timelines now display interactive specimen thumbnails with full click-to-zoom inspection.
- **Storefront Archival Isolation**: Bookstore detail dossiers now exclusively showcase authentic historical interior and exterior photography, cleanly separating them from directory cutout images.
- **Streamlined Curator Cabinet**: Refined administrative counters, simplified data workflows, and modernized bookmark media uploaders.
- **Simplified Map Controls**: Streamlined location exploration for historic and multi-location bookshops.`,
  },
];

export interface EditableReleasesPageProps {
  initialContent?: Record<string, string>;
}

function parseInitialReleases(initialContent: Record<string, string>): ReleaseItem[] {
  if (initialContent.releases_json) {
    try {
      const parsed = JSON.parse(initialContent.releases_json);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {}
  }

  if (initialContent.release_title || initialContent.release_date || initialContent.release_notes) {
    return [
      {
        id: "release-legacy-1",
        date: initialContent.release_date || DEFAULT_RELEASES[0].date,
        title: initialContent.release_title || DEFAULT_RELEASES[0].title,
        notes: initialContent.release_notes || DEFAULT_RELEASES[0].notes,
      },
    ];
  }

  return DEFAULT_RELEASES;
}

export function EditableReleasesPage({
  initialContent = {},
}: EditableReleasesPageProps) {
  const [releases, setReleases] = useState<ReleaseItem[]>(() =>
    parseInitialReleases(initialContent)
  );

  const [savedSnapshot, setSavedSnapshot] = useState<ReleaseItem[]>(() =>
    parseInitialReleases(initialContent)
  );

  const [isEditing, setIsEditing] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Passphrase auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [passphrase, setPassphrase] = useState("");
  const [authError, setAuthError] = useState("");
  const [authenticating, setAuthenticating] = useState(false);

  // Restore draft if saved locally
  useEffect(() => {
    try {
      const draft = localStorage.getItem("draft_page_releases");
      if (draft) {
        const parsed = JSON.parse(draft);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReleases(parsed);
        }
      }
    } catch {}
  }, []);

  // Sync draft to local storage while editing
  useEffect(() => {
    if (isEditing) {
      try {
        localStorage.setItem("draft_page_releases", JSON.stringify(releases));
      } catch {}
    }
  }, [releases, isEditing]);

  const handleAddRelease = () => {
    const newReleaseId = `release-${Date.now()}`;
    const now = new Date();
    const currentMonthYear = now.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    // Reference formatting based on the first release notes post
    const newPost: ReleaseItem = {
      id: newReleaseId,
      date: currentMonthYear,
      title: `${currentMonthYear} Archive Release`,
      notes: `### What's New & Enhancements
- **Feature Name**: Description of the new functionality or archival update.
- **Storefront & Ephemera**: Details on improvements and streamlined workflows.
- **Fixes & Polish**: Resolved layout issues, performance polish, and bug fixes.`,
    };

    setReleases((prev) => [newPost, ...prev]);
    setIsEditing(true);
    setEditingPostId(newReleaseId);
  };

  const handleChangeRelease = (
    id: string,
    field: keyof ReleaseItem,
    value: string
  ) => {
    setReleases((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleDeleteRelease = (id: string) => {
    if (releases.length <= 1) return;
    setReleases((prev) => prev.filter((r) => r.id !== id));
  };

  const handleCancel = () => {
    setReleases(savedSnapshot);
    setIsEditing(false);
    setEditingPostId(null);
    try {
      localStorage.removeItem("draft_page_releases");
    } catch {}
    setSaveError("");
  };

  const handleSave = async (overridePassphrase?: string) => {
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (overridePassphrase) {
        headers["x-curator-passphrase"] = overridePassphrase;
      }

      const sectionsPayload: Record<string, string> = {
        releases_json: JSON.stringify(releases),
        release_date: releases[0]?.date || "",
        release_title: releases[0]?.title || "",
        release_notes: releases[0]?.notes || "",
      };

      const res = await fetch("/api/pages/releases", {
        method: "PUT",
        headers,
        body: JSON.stringify({ sections: sectionsPayload }),
      });

      if (res.status === 401) {
        setShowAuthModal(true);
        setSaving(false);
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to save: ${res.statusText}`);
      }

      const data = await res.json();
      if (data.success && data.content) {
        const updated = parseInitialReleases(data.content);
        setSavedSnapshot(updated);
        setReleases(updated);
        try {
          localStorage.removeItem("draft_page_releases");
        } catch {}
      }

      setSaveSuccess(true);
      setIsEditing(false);
      setEditingPostId(null);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || "Failed to save release notes.");
    } finally {
      setSaving(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthenticating(true);
    setAuthError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setAuthError(data.error || "Invalid passphrase. Default is curator123");
        setAuthenticating(false);
        return;
      }

      setShowAuthModal(false);
      setAuthenticating(false);
      await handleSave(passphrase);
    } catch (err: any) {
      setAuthError(err.message || "Authentication failed");
      setAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-serif selection:bg-[#F43F7A]/20">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 sm:py-16 space-y-8">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D5] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#F43F7A] uppercase font-bold tracking-widest bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Archive Log
              </span>
              <div className="flex items-center gap-1.5 text-xs text-stone-500 font-mono">
                <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>{releases[0]?.date || "Current"}</span>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
              Release Notes
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 font-sans">
              Log of functions, enhancements, and improvements to the Bookstore Bookmark Archive.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Add Release Button */}
            <Button
              type="button"
              size="sm"
              onClick={handleAddRelease}
              className="text-xs font-serif flex items-center gap-1.5 bg-[#F43F7A] hover:bg-[#E11D48] text-white shadow-xs cursor-pointer font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Release</span>
            </Button>

            {!isEditing ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(true);
                  setEditingPostId(releases[0]?.id || null);
                }}
                className="text-xs font-serif flex items-center gap-1.5 bg-white border-stone-300 text-stone-700 hover:text-[#F43F7A] hover:border-[#F43F7A] shadow-2xs cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Notes</span>
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={saving}
                  className="text-xs font-serif text-stone-600 hover:text-stone-900"
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  <span>Cancel</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="text-xs font-serif bg-[#2563EB] hover:bg-blue-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5 mr-1.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Status Alerts */}
        {saveSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Release notes successfully saved to the archive!</span>
          </div>
        )}

        {saveError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {saveError}
          </div>
        )}

        {/* Chronological Release Notes Timeline / Feed */}
        <div className="space-y-8">
          {releases.map((rel, index) => {
            const isThisPostEditing = isEditing;

            if (isThisPostEditing) {
              return (
                <div
                  key={rel.id}
                  className="bg-white border-2 border-[#2563EB]/40 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6 relative"
                >
                  <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-3">
                    <span className="text-xs font-mono font-bold text-[#2563EB] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Release Post #{releases.length - index}</span>
                    </span>

                    {releases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteRelease(rel.id)}
                        className="text-xs text-stone-400 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Delete this release post"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-stone-700">
                        Release Date:
                      </label>
                      <input
                        type="text"
                        value={rel.date}
                        onChange={(e) =>
                          handleChangeRelease(rel.id, "date", e.target.value)
                        }
                        placeholder="e.g. October 2026"
                        className="w-full px-3 py-2 text-sm bg-stone-50 border border-[#E8E2D5] rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-stone-700">
                        Release Title / Version:
                      </label>
                      <input
                        type="text"
                        value={rel.title}
                        onChange={(e) =>
                          handleChangeRelease(rel.id, "title", e.target.value)
                        }
                        placeholder="e.g. Autumn 2026 Collection Release"
                        className="w-full px-3 py-2 text-sm bg-stone-50 border border-[#E8E2D5] rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-stone-700">
                      Release Notes (Markdown supported):
                    </label>
                    <textarea
                      rows={12}
                      value={rel.notes}
                      onChange={(e) =>
                        handleChangeRelease(rel.id, "notes", e.target.value)
                      }
                      placeholder="Write release notes, list new features, improvements, and bug fixes..."
                      className="w-full p-4 font-mono text-xs sm:text-sm leading-relaxed bg-stone-50 border border-[#E8E2D5] rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                    />
                    <p className="text-[11px] text-stone-400 italic">
                      Tip: Use Markdown headers (### Header) and bullet points (- Feature) to organize release highlights.
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={rel.id}
                className="bg-white border border-[#E8E2D5] rounded-2xl shadow-xs p-6 sm:p-10 space-y-6 relative group transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E2D5] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      {index === 0 && (
                        <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Latest Release
                        </span>
                      )}
                      <p className="text-xs font-mono text-[#2563EB] font-semibold">
                        Published {rel.date}
                      </p>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">
                      {rel.title || "Archive Updates"}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(true);
                        setEditingPostId(rel.id);
                      }}
                      className="text-xs font-serif opacity-0 group-hover:opacity-100 transition-opacity bg-stone-50 hover:bg-white border-stone-200 text-stone-600"
                    >
                      <Pencil className="w-3 h-3 mr-1 text-stone-400" />
                      <span>Edit</span>
                    </Button>
                  </div>
                </div>

                <div className="text-stone-800 text-sm sm:text-base leading-relaxed">
                  <FormattedText text={rel.notes} />
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Curator Passphrase Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-white border border-[#E8E2D5] rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-[#E8E2D5] pb-3">
              <div className="p-2 rounded-xl bg-rose-50 text-[#F43F7A]">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900">
                  Curator Authorization
                </h3>
                <p className="text-xs text-stone-500 font-sans">
                  Enter curator passphrase to publish notes
                </p>
              </div>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Curator Passphrase"
                autoFocus
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F43F7A]"
              />

              {authError && (
                <p className="text-xs text-rose-600 font-sans">{authError}</p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAuthModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={authenticating || !passphrase}
                  className="bg-[#F43F7A] hover:bg-[#E11D48] text-white font-bold"
                >
                  {authenticating ? "Verifying..." : "Authorize & Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
