"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, KeyRound, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function AdminLoginPage() {
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid passphrase");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FBF9F5]">
      <div className="w-full max-w-md bg-white border border-parchment-border rounded-2xl p-8 shadow-xl space-y-6">
        {/* Header Icon */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-archival-oxblood/10 text-archival-oxblood flex items-center justify-center mx-auto border border-archival-oxblood/20 shadow-xs">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-ink">Curator's Cabinet</h1>
          <p className="text-xs text-ink-muted font-serif italic">
            Enter your curator passphrase to manage the bookmark archive and historical research files.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-serif">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-medium text-ink-light mb-1.5">
              PASSPHRASE
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="Enter curator passphrase..."
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                required
                className="w-full pl-9.5 pr-4 py-2.5 text-sm bg-parchment-light border border-parchment-border rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-amber-700/30 focus:border-amber-800 transition-all font-mono"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="oxblood"
            size="md"
            disabled={loading}
            className="w-full font-serif flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{loading ? "Verifying..." : "Unlock Curator Access"}</span>
          </Button>
        </form>

        <div className="pt-2 text-center border-t border-parchment-border/60">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink transition-colors font-serif"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Return to Public Exhibit</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
