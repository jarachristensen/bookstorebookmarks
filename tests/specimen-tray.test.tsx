import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BookmarkCard } from "@/components/exhibit/BookmarkCard";
import { TrayControls } from "@/components/exhibit/TrayControls";
import { BookmarkWithDetails } from "@/lib/db/queries";

const mockBookmark: BookmarkWithDetails = {
  id: "gotham-wise-men-fish-here",
  bookstoreId: "gotham-book-mart",
  title: "Gotham Book Mart “Wise Men Fish Here”",
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

describe("Specimen Tray Components", () => {
  it("should render BookmarkCard with title, location, and dimensions", () => {
    let inspectedId = "";
    render(
      <BookmarkCard
        bookmark={mockBookmark}
        index={0}
        onInspect={(bm) => (inspectedId = bm.id)}
      />
    );

    expect(screen.getByText(/Gotham Book Mart/i)).toBeDefined();
    expect(screen.getByText("2.25\" × 7.75\"")).toBeDefined();

    const card = screen.getByRole("button", { name: /gotham book mart/i });
    card.click();
    expect(inspectedId).toBe("gotham-wise-men-fish-here");
  });

  it("should render TrayControls with pagination and filter triggers", () => {
    let pageChange = 0;
    render(
      <TrayControls
        currentPage={1}
        totalPages={3}
        totalItems={18}
        pageSize={6}
        search=""
        onSearchChange={() => {}}
        city="all"
        onCityChange={() => {}}
        cities={["New York", "Paris"]}
        era="all"
        onEraChange={() => {}}
        eras={[
          { label: "All Eras", value: "all" },
          { label: "Pre-1940", value: "pre-1940" },
        ]}
        status="all"
        onStatusChange={() => {}}
        onPrevPage={() => (pageChange = -1)}
        onNextPage={() => (pageChange = 1)}
      />
    );

    expect(screen.getByText(/Tray I of III/i)).toBeDefined();
    const nextBtn = screen.getByRole("button", { name: /next tray/i });
    fireEvent.click(nextBtn);
    expect(pageChange).toBe(1);
  });
});
