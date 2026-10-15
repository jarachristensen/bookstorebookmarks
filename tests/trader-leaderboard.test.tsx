import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import {
  formatCollectorInitials,
  computeTraderLeaderboard,
} from "@/lib/utils/trader-leaderboard";
import { TraderLeaderboard } from "@/components/trading/TraderLeaderboard";

describe("Trader Extraordinaires Leaderboard Utilities & Component", () => {
  describe("formatCollectorInitials", () => {
    it("formats single names to first initial with dot", () => {
      expect(formatCollectorInitials("Alice")).toBe("A.");
    });

    it("formats two-part names to first and last initials with dots", () => {
      expect(formatCollectorInitials("Jane Doe")).toBe("J. D.");
    });

    it("formats multi-word names using first and last token", () => {
      expect(formatCollectorInitials("Mary Jane Watson")).toBe("M. W.");
      expect(formatCollectorInitials("Jean-Luc Picard")).toBe("J. P.");
    });

    it("handles empty or blank names safely", () => {
      expect(formatCollectorInitials("")).toBe("?");
      expect(formatCollectorInitials("   ")).toBe("?");
    });
  });

  describe("computeTraderLeaderboard", () => {
    const mockProposals = [
      {
        id: "p1",
        collectorName: "Jane Doe",
        status: "accepted",
        requestedBookmarksSnapshot: JSON.stringify([
          { id: "bm1", quantity: 2 },
          { id: "bm2", quantity: 1 },
        ]),
      },
      {
        id: "p2",
        collectorName: "Jane Doe",
        status: "completed",
        requestedBookmarksSnapshot: JSON.stringify([
          { id: "bm3", quantity: 3 },
        ]),
      },
      {
        id: "p3",
        collectorName: "Alice Smith",
        status: "accepted",
        requestedBookmarksSnapshot: JSON.stringify([
          { id: "bm4", quantity: 4 },
        ]),
      },
      {
        id: "p4",
        collectorName: "Pending Bob",
        status: "pending", // should be ignored
        requestedBookmarksSnapshot: JSON.stringify([
          { id: "bm5", quantity: 10 },
        ]),
      },
      {
        id: "p5",
        collectorName: "Rejected Charlie",
        status: "rejected", // should be ignored
        requestedBookmarksSnapshot: JSON.stringify([
          { id: "bm6", quantity: 5 },
        ]),
      },
    ];

    it("aggregates accepted and completed proposals, summing quantities and sorting descending", () => {
      const leaderboard = computeTraderLeaderboard(mockProposals);

      expect(leaderboard).toHaveLength(2);
      // Jane Doe: 3 + 3 = 6 bookmarks across 2 trades
      expect(leaderboard[0].collectorInitials).toBe("J. D.");
      expect(leaderboard[0].totalBookmarksTraded).toBe(6);
      expect(leaderboard[0].tradesCount).toBe(2);

      // Alice Smith: 4 bookmarks across 1 trade
      expect(leaderboard[1].collectorInitials).toBe("A. S.");
      expect(leaderboard[1].totalBookmarksTraded).toBe(4);
      expect(leaderboard[1].tradesCount).toBe(1);
    });

    it("returns empty array when proposals list is empty", () => {
      expect(computeTraderLeaderboard([])).toEqual([]);
    });

    it("groups proposals case-insensitively to prevent split entries", () => {
      const proposals = [
        {
          id: "p1",
          collectorName: "Jane Doe",
          status: "accepted",
          requestedBookmarksSnapshot: JSON.stringify([{ id: "bm1", quantity: 2 }]),
        },
        {
          id: "p2",
          collectorName: "jane doe",
          status: "completed",
          requestedBookmarksSnapshot: JSON.stringify([{ id: "bm2", quantity: 3 }]),
        },
      ];

      const leaderboard = computeTraderLeaderboard(proposals);
      expect(leaderboard).toHaveLength(1);
      expect(leaderboard[0].collectorInitials).toBe("J. D.");
      expect(leaderboard[0].totalBookmarksTraded).toBe(5);
      expect(leaderboard[0].tradesCount).toBe(2);
    });
  });

  describe("<TraderLeaderboard />", () => {
    it("renders ranked collectors, initials, and trade volumes", () => {
      const mockEntries = [
        {
          collectorInitials: "J. D.",
          totalBookmarksTraded: 6,
          tradesCount: 2,
        },
        {
          collectorInitials: "A. S.",
          totalBookmarksTraded: 4,
          tradesCount: 1,
        },
      ];

      render(<TraderLeaderboard entries={mockEntries} />);

      expect(screen.getByText(/trader extraordinaires/i)).toBeDefined();
      expect(screen.getByText(/collector j\. d\./i)).toBeDefined();
      expect(screen.getByText(/collector a\. s\./i)).toBeDefined();
      expect(screen.getByText("6")).toBeDefined();
      expect(screen.getByText("4")).toBeDefined();
      expect(screen.getByText(/2 swaps completed/i)).toBeDefined();
    });

    it("renders empty state when there are no entries", () => {
      render(<TraderLeaderboard entries={[]} />);
      expect(screen.getByText(/no completed swaps recorded yet/i)).toBeDefined();
    });
  });
});
