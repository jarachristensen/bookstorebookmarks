"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Lock, Save, X, Check, Loader2, KeyRound } from "lucide-react";

interface CuratorPageToolbarProps {
  pageName: string;
  hasUnsavedChanges: boolean;
  onSave: () => Promise<boolean | void>;
  onReset?: () => void;
}

export function CuratorPageToolbar({
  pageName,
  hasUnsavedChanges,
  onSave,
  onReset,
}: CuratorPageToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [passphrase, setPassphrase] = useState("");
  const [authError, setAuthError] = useState("");
  const [authenticating, setAuthenticating] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await onSave();
      if (res === false) {
        // Needs authentication
        setShowAuthModal(true);
      } else {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err: any) {
      if (err?.message?.includes("401") || err?.status === 401) {
        setShowAuthModal(true);
      } else {
        alert("Failed to save changes. Please try again.");
      }
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

      // Authenticated successfully! Close modal and retry save
      setShowAuthModal(false);
      setPassphrase("");
      setAuthenticating(false);
      await handleSave();
    } catch (err: any) {
      setAuthError(err?.message || "Failed to authenticate.");
      setAuthenticating(false);
    }
  };

  const handleExit = () => {
    if (
      hasUnsavedChanges &&
      !window.confirm("You have unsaved changes. Are you sure you want to exit editing mode?")
    ) {
      return;
    }
    router.push(pathname || "/");
  };

  return (
    <>
      <div className="fixed bottom-6 inset-x-0 mx-auto max-w-xl z-50 px-4 pointer-events-none">
        <aside
          aria-label="Curator Editing Controls"
          className="pointer-events-auto flex items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-stone-900/95 backdrop-blur-md text-white border border-[#E8E2D5]/30 shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-4"
        >
          {/* Status info */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#F43F7A]/20 border border-[#F43F7A]/40 flex items-center justify-center shrink-0 text-[#F43F7A]">
              <Lock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-amber-100 truncate flex items-center gap-1.5 font-serif">
                <span>Curator Mode</span>
                <span className="text-stone-400 font-normal font-sans text-[11px] hidden sm:inline">
                  — Editing {pageName}
                </span>
              </p>
              <p className="text-[10px] font-mono text-stone-400 truncate">
                {saveSuccess ? (
                  <span className="text-[#10B981] font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Saved to archive database!
                  </span>
                ) : hasUnsavedChanges ? (
                  <span className="text-[#F59E0B]">● Unsaved changes</span>
                ) : (
                  <span>Click text fields to edit in-place</span>
                )}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-95 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : saveSuccess ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{saving ? "Saving..." : saveSuccess ? "Saved!" : "Save Changes"}</span>
            </button>

            <button
              type="button"
              onClick={handleExit}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition-all"
              title="Exit Editing Mode"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Curator Passphrase Modal if session required */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-[#E8E2D5] shadow-2xl p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#2563EB]" />
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Curator Authorization
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-serif text-stone-600 leading-relaxed">
              Enter your Curator Passphrase to save edits directly to the public archive database.
            </p>

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              <div>
                <input
                  type="password"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Curator Passphrase (default: curator123)"
                  autoFocus
                  required
                  className="w-full px-3 py-2 text-xs border border-[#E8E2D5] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] bg-[#FAF8F5]"
                />
              </div>

              {authError && (
                <p className="text-xs text-[#F43F7A] font-medium">{authError}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={authenticating || !passphrase.trim()}
                  className="px-4 py-1.5 text-xs bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg font-medium shadow-xs disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {authenticating ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  <span>Authorize &amp; Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
