import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { OtherBookmarksHubClient } from "@/components/trading/OtherBookmarksHubClient";
import { NonBookstoreBookmark } from "@/db/schema";

const mockOtherBookmarks: NonBookstoreBookmark[] = [
  {
    id: "spl-vintage-bookmark",
    title: "Seattle Public Library Vintage 1980s Bookmark",
    tags: JSON.stringify(["Libraries", "Pacific Northwest"]),
    category: "Libraries",
    frontImageUrl: "/images/other/spl-front.jpg",
    backImageUrl: "/images/other/spl-back.jpg",
    tradeQuantity: 3,
    dimensions: '2" × 6.5"',
    material: "Heavy Stock",
    condition: "Near Mint",
    notes: "Acquired from a library book sale in 1994",
    displayOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe("OtherBookmarksHubClient Zoom & Inspector", () => {
  it("renders bookmarks list and opens detail inspector modal", () => {
    render(<OtherBookmarksHubClient initialBookmarks={mockOtherBookmarks} />);

    expect(
      screen.getByText("Seattle Public Library Vintage 1980s Bookmark")
    ).toBeDefined();

    // Click on the bookmark title/card to open inspector
    const bookmarkTitle = screen.getByText("Seattle Public Library Vintage 1980s Bookmark");
    fireEvent.click(bookmarkTitle);

    // Curator notes should be visible
    expect(
      screen.getAllByText(/Acquired from a library book sale in 1994/i).length
    ).toBeGreaterThan(0);

    // Zoom specimen button should be visible
    const zoomBtns = screen.getAllByRole("button", { name: /zoom specimen|zoom/i });
    expect(zoomBtns.length).toBeGreaterThan(0);

    // Click zoom button to open full-screen zoom lightbox
    fireEvent.click(zoomBtns[0]);

    expect(screen.getByRole("button", { name: /close fullscreen zoom/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /zoom in/i })).toBeDefined();
  });
});
