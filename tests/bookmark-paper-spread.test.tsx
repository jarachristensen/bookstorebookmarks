import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  BookmarkPaperSpread,
  groupBookmarksForSpread,
} from "@/components/home/BookmarkPaperSpread";
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
    {
      id: "bm-2",
      bookstoreId: "store-1",
      title: "Gotham Horizontal Strip Bookmark",
      accessionNo: "BM-002",
      frontImageUrl: "/test-h1.jpg",
      backImageUrl: null,
      yearProduced: 1975,
      material: "Paper",
      dimensions: '7.5" × 2.25"',
      condition: "Good",
      acquisitionDate: null,
      acquisitionNotes: null,
      isFeatured: false,
      displayOrder: 2,
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
    {
      id: "bm-3",
      bookstoreId: "store-1",
      title: "Gotham Second Horizontal Bookmark",
      accessionNo: "BM-003",
      frontImageUrl: "/test-h2.jpg",
      backImageUrl: null,
      yearProduced: 1978,
      material: "Paper",
      dimensions: '8.0" × 2.5"',
      condition: "Good",
      acquisitionDate: null,
      acquisitionNotes: null,
      isFeatured: false,
      displayOrder: 3,
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

  it("pairs and stacks horizontal landscape bookmarks together into multi-column units", () => {
    const slots = groupBookmarksForSpread(mockBookmarks);
    expect(slots).toHaveLength(2);
    expect(slots[0].type).toBe("portrait");
    expect(slots[1].type).toBe("landscape-stack");
    if (slots[1].type === "landscape-stack") {
      expect(slots[1].bookmarks).toHaveLength(2);
      expect(slots[1].bookmarks[0].id).toBe("bm-2");
      expect(slots[1].bookmarks[1].id).toBe("bm-3");
    }

    const handleInspect = vi.fn();
    render(
      <BookmarkPaperSpread
        bookmarks={mockBookmarks}
        onInspectBookmark={handleInspect}
      />
    );

    const h1Btn = screen.getByRole("button", { name: /gotham horizontal strip bookmark/i });
    const h2Btn = screen.getByRole("button", { name: /gotham second horizontal bookmark/i });
    expect(h1Btn).toBeDefined();
    expect(h2Btn).toBeDefined();

    fireEvent.click(h1Btn);
    expect(handleInspect).toHaveBeenCalledWith(mockBookmarks[1]);

    fireEvent.click(h2Btn);
    expect(handleInspect).toHaveBeenCalledWith(mockBookmarks[2]);
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

