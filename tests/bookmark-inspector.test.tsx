import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BookmarkInspector } from "@/components/exhibit/BookmarkInspector";
import { BookmarkWithDetails } from "@/lib/db/queries";

const mockBookmark: BookmarkWithDetails = {
  id: "gotham-wise-men-fish-here",
  bookstoreId: "gotham-book-mart",
  title: "Gotham Book Mart “Wise Men Fish Here” Letterpress Bookmark",
  accessionNo: "BM-1934-NY-01",
  frontImageUrl: "/seed-images/gotham-front.svg",
  backImageUrl: "/seed-images/gotham-back.svg",
  yearProduced: 1934,
  material: "Letterpress Cardstock",
  dimensions: "2.25\" × 7.75\"",
  condition: "Very Good",
  acquisitionDate: "1988-05-12",
  acquisitionNotes: "Acquired in NYC",
  isFeatured: true,
  displayOrder: 1,
  accentColor: "#881337",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  bookstore: {
    id: "gotham-book-mart",
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
    historicalBlurb: "Story",
    notablePatronsTrivia: "[]",
    websiteUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archivalMedia: [],
  },
};

describe("BookmarkInspector Component", () => {
  it("should render 3D flip inspection canvas and physical specs", () => {
    render(
      <BookmarkInspector
        bookmark={mockBookmark}
        onClose={() => {}}
        onOpenDossier={() => {}}
      />
    );

    expect(screen.getByText(/Letterpress Cardstock/i)).toBeDefined();
    expect(screen.getByText(/2.25" × 7.75"/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /flip to verso/i })).toBeDefined();

    const flipBtn = screen.getByRole("button", { name: /flip to verso/i });
    fireEvent.click(flipBtn);
    expect(screen.getByRole("button", { name: /flip to recto/i })).toBeDefined();
  });
});
