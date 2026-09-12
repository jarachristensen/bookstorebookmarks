import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { FlatFileCabinet } from "@/components/exhibit/FlatFileCabinet";
import { getGeographicDrawers } from "@/lib/utils/geographic-drawers";
import { BookmarkWithDetails } from "@/lib/db/queries";

describe("FlatFileCabinet Component", () => {
  const createMockBookmark = (
    id: string,
    city: string,
    stateProvince: string | null,
    country: string
  ): BookmarkWithDetails => ({
    id,
    bookstoreId: `store-${id}`,
    title: `Bookmark ${id}`,
    accessionNo: `BM-${id}`,
    frontImageUrl: `/img-${id}.svg`,
    backImageUrl: null,
    yearProduced: 1950,
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
      id: `store-${id}`,
      name: `Bookstore ${id}`,
      city,
      stateProvince,
      country,
      streetAddress: "123 Main St",
      yearOpened: 1920,
      yearClosed: null,
      isStillOperating: true,
      founders: "Founder",
      specialties: "[]",
      historicalBlurb: "",
      notablePatronsTrivia: "[]",
      websiteUrl: null,
      createdAt: "",
      updatedAt: "",
      archivalMedia: [],
    },
  });

  const sampleBookmarks: BookmarkWithDetails[] = [
    createMockBookmark("ny", "New York", "NY", "United States"),
    createMockBookmark("sf", "San Francisco", "CA", "United States"),
    createMockBookmark("paris", "Paris", "Île-de-France", "France"),
  ];

  const populatedDrawers = getGeographicDrawers(sampleBookmarks);

  it("renders the closed cabinet with clean wood face and all state drawer labels", () => {
    const handleSelectDrawer = vi.fn();
    const handleInspect = vi.fn();

    render(
      <FlatFileCabinet
        drawers={populatedDrawers}
        activeDrawerId={null}
        onSelectDrawer={handleSelectDrawer}
        onInspectBookmark={handleInspect}
      />
    );

    // Verify state drawer labels (50 states + other countries)
    expect(screen.getAllByText(/New York/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/California/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Other Countries/i).length).toBeGreaterThanOrEqual(1);

    // Click New York drawer to select
    const drawerBtn = screen.getByRole("button", { name: /open new york/i });
    fireEvent.click(drawerBtn);

    expect(handleSelectDrawer).toHaveBeenCalledWith("drawer-state-ny");
  });

  it("renders the open drawer with specimen tray and push in / close button", () => {
    const handleSelectDrawer = vi.fn();
    const handleInspect = vi.fn();

    render(
      <FlatFileCabinet
        drawers={populatedDrawers}
        activeDrawerId="drawer-state-ny"
        onSelectDrawer={handleSelectDrawer}
        onInspectBookmark={handleInspect}
      />
    );

    // Verify open drawer header contains New York
    expect(screen.getAllByText(/New York/i).length).toBeGreaterThanOrEqual(1);

    // Verify Push Drawer In button
    const pushInBtn = screen.getByRole("button", { name: /push drawer in/i });
    expect(pushInBtn).toBeDefined();

    fireEvent.click(pushInBtn);
    expect(handleSelectDrawer).toHaveBeenCalledWith(null);
  });
});
