"use client";

import React from "react";
import { Trophy, Award, Medal, Sparkles, BookOpen } from "lucide-react";
import { TraderLeaderboardEntry } from "@/lib/utils/trader-leaderboard";

export interface TraderLeaderboardProps {
  entries: TraderLeaderboardEntry[];
}

export function TraderLeaderboard({ entries }: TraderLeaderboardProps) {
  return (
    <div className="w-full bg-white rounded-3xl border border-[#E8E2D5] p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3 border-b border-[#E8E2D5] pb-3">
        <div className="w-9 h-9 rounded-xl bg-amber-100/80 text-amber-800 flex items-center justify-center shrink-0 shadow-2xs border border-amber-200">
          <Trophy className="w-5 h-5 text-amber-700" />
        </div>
        <div>
          <h3 className="font-serif font-black text-lg text-stone-900 tracking-tight flex items-center gap-1.5">
            <span>Trader Extraordinaires</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500 inline-block" />
          </h3>
          <p className="text-xs font-serif text-stone-500">
            Most active collectors by accepted trade volume
          </p>
        </div>
      </div>

      {/* Leaderboard Table / List */}
      {entries.length === 0 ? (
        <div className="py-6 px-4 text-center space-y-2 rounded-2xl bg-[#FAF8F5] border border-dashed border-[#E8E2D5]">
          <BookOpen className="w-6 h-6 mx-auto text-stone-400" />
          <p className="text-xs font-serif text-stone-600">
            No completed swaps recorded yet.
          </p>
          <p className="text-[11px] font-sans text-stone-400">
            Propose an exchange above to be crowned our first Trader Extraordinaire!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) => {
            const rank = index + 1;
            let rankBadgeClass = "bg-stone-100 text-stone-700 border-stone-200";
            let Icon = null;

            if (rank === 1) {
              rankBadgeClass = "bg-amber-100 text-amber-900 border-amber-300 font-black";
              Icon = Award;
            } else if (rank === 2) {
              rankBadgeClass = "bg-slate-200 text-slate-800 border-slate-300 font-bold";
              Icon = Medal;
            } else if (rank === 3) {
              rankBadgeClass = "bg-amber-50 text-amber-800 border-amber-200 font-bold";
              Icon = Medal;
            }

            return (
              <div
                key={`${entry.collectorInitials}-${rank}`}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D5]/80 hover:border-[#2563EB]/40 transition-colors text-xs font-serif"
              >
                {/* Left: Rank & Initials */}
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono border ${rankBadgeClass}`}
                  >
                    {rank}
                  </div>
                  <div>
                    <span className="font-bold text-stone-900 tracking-wide">
                      Collector {entry.collectorInitials}
                    </span>
                    <span className="block text-[10px] text-stone-500 font-sans">
                      {entry.tradesCount} {entry.tradesCount === 1 ? "swap" : "swaps"} completed
                    </span>
                  </div>
                </div>

                {/* Right: Quantity */}
                <div className="text-right">
                  <span className="font-mono font-bold text-xs text-[#2563EB]">
                    {entry.totalBookmarksTraded}
                  </span>
                  <span className="block text-[10px] text-stone-500 font-serif">
                    {entry.totalBookmarksTraded === 1 ? "bookmark" : "bookmarks"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
