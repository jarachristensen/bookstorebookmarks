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
} from "lucide-react";

const DEFAULT_RELEASE_CONTENT: Record<string, string> = {
  release_date: "October 2026",
  release_title: "October 2026 Archive Release",
  release_notes: `### What's New & Enhancements
- **Timeline Photo & Newspaper Clippings**: Historical facts and newspaper articles on bookstore timelines now display interactive specimen thumbnails with full click-to-zoom inspection.
- **Storefront Archival Isolation**: Bookstore detail dossiers now exclusively showcase authentic historical interior and exterior photography, cleanly separating them from directory cutout images.
- **Streamlined Curator Cabinet**: Refined administrative counters, simplified data workflows, and modernized bookmark media uploaders.
- **Simplified Map Controls**: Streamlined location exploration for historic and multi-location bookshops.`,
};

export interface EditableReleasesPageProps {
  initialContent?: Record<string, string>;
}

export function EditableReleasesPage({
  initialContent = {},
}: EditableReleasesPageProps) {
  const [content, setContent] = useState<Record<string, string>>({
    ...DEFAULT_RELEASE_CONTENT,
    ...initialContent,
  });

  const [savedSnapshot, setSavedSnapshot] = useState<Record<string, string>>({
    ...DEFAULT_RELEASE_CONTENT,
    ...initialContent,
  });

  const [isEditing, setIsEditing] = useState(false);
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
        if (parsed && typeof parsed === "object") {
          setContent((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch {}
  }, []);

  const handleChange = (key: string, value: string) => {
    setContent((prev) => {
      const updated = { ...prev, [key]: value };
      try {
        localStorage.setItem("draft_page_releases", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleCancel = () => {
    setContent(savedSnapshot);
    try {
      localStorage.removeItem("draft_page_releases");
    } catch {}
    setIsEditing(false);
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

      const res = await fetch("/api/pages/releases", {
        method: "PUT",
        headers,
        body: JSON.stringify({ sections: content }),
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
        setSavedSnapshot({ ...DEFAULT_RELEASE_CONTENT, ...data.content });
        setContent({ ...DEFAULT_RELEASE_CONTENT, ...data.content });
        try {
          localStorage.removeItem("draft_page_releases");
        } catch {}
      }

      setSaveSuccess(true);
      setIsEditing(false);
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
                <span>{content.release_date}</span>
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
            {!isEditing ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
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

        {/* Content Section: View Mode vs Edit Mode */}
        {isEditing ? (
          <div className="bg-white border border-[#E8E2D5] rounded-2xl shadow-xs p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700">
                  Release Date:
                </label>
                <input
                  type="text"
                  value={content.release_date || ""}
                  onChange={(e) => handleChange("release_date", e.target.value)}
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
                  value={content.release_title || ""}
                  onChange={(e) => handleChange("release_title", e.target.value)}
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
                rows={14}
                value={content.release_notes || ""}
                onChange={(e) => handleChange("release_notes", e.target.value)}
                placeholder="Write release notes, list new features, improvements, and bug fixes..."
                className="w-full p-4 font-mono text-xs sm:text-sm leading-relaxed bg-stone-50 border border-[#E8E2D5] rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              />
              <p className="text-[11px] text-stone-400 italic">
                Tip: Use Markdown headers (### Header) and bullet points (- Feature) to organize release highlights.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#E8E2D5] rounded-2xl shadow-xs p-6 sm:p-10 space-y-6">
            <div className="border-b border-[#E8E2D5] pb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
                {content.release_title || "Archive Updates"}
              </h2>
              <p className="text-xs font-mono text-[#2563EB] mt-1 font-semibold">
                Published {content.release_date}
              </p>
            </div>

            <div className="text-stone-800 text-sm sm:text-base leading-relaxed">
              <FormattedText text={content.release_notes} />
            </div>
          </div>
        )}
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
