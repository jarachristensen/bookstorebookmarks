import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BookmarkPaperSpread } from "@/components/home/BookmarkPaperSpread";
import { BookmarkWithDetails } from "@/lib/db/queries";

describe("BookmarkPaperSpread Component", () => {
  const mockBookmarks: BookmarkWithDetails[] = [
    {
      id: "bm-1",
      bookstoreId: "store-1",
      title: "Gotham Bookmark",
      accessionNo: "BM-001",
      frontImageUrl: "/test.jpg",
      backImageUrl: null,
      yearProduced: 1982,
      material: "Paper",
      dimensions: '2" × 7"',
      condition: "Good",
      acquisitionDate: null,
      acquisitionNotes: null,
      isFeatured: false,
      displayOrder: 1,
      accentColor: null,
      createdAt: "",
      updatedAt: "",
      bookstore: {
        id: "store-1",
        name: "Gotham Book Mart",
        city: "New York",
        stateProvince: "NY",
        country: "United States",
        streetAddress: "41 W 47th St",
        yearOpened: 1920,
        yearClosed: 2007,
        isStillOperating: false,
        founders: "Frances Steloff",
        specialties: "[]",
        historicalBlurb: "",
        notablePatronsTrivia: "[]",
        websiteUrl: null,
        createdAt: "",
        updatedAt: "",
        archivalMedia: [],
      },
    },
  ];

  it("renders bookmarks floating on paper canvas and triggers inspect on click", () => {
    const handleInspect = vi.fn();

    render(
      <BookmarkPaperSpread
        bookmarks={mockBookmarks}
        onInspectBookmark={handleInspect}
      />
    );

    const bookmarkBtn = screen.getByRole("button", { name: /gotham bookmark/i });
    expect(bookmarkBtn).toBeDefined();

    fireEvent.click(bookmarkBtn);
    expect(handleInspect).toHaveBeenCalledWith(mockBookmarks[0]);
  });

  it("renders empty state when bookmarks list is empty", () => {
    const handleReset = vi.fn();

    render(
      <BookmarkPaperSpread
        bookmarks={[]}
        onInspectBookmark={vi.fn()}
        onResetFilters={handleReset}
      />
    );

    expect(screen.getByText(/no bookmarks found/i)).toBeDefined();
    const resetBtn = screen.getByRole("button", { name: /reset all filters/i });
    fireEvent.click(resetBtn);
    expect(handleReset).toHaveBeenCalled();
  });
});
