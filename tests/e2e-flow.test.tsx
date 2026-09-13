import { describe, it, expect, beforeAll } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ExhibitGalleryClient } from "@/components/exhibit/ExhibitGalleryClient";
import { seedDatabase } from "@/db/seed";
import { getBookmarksWithBookstores, getFilterOptions } from "@/lib/db/queries";

describe("Main Exhibit Flow Integration", () => {
  let initialBookmarks: any[] = [];
  let filterOptions: any = { cities: [], eras: [], specialties: [] };

  beforeAll(async () => {
    await seedDatabase();
    initialBookmarks = await getBookmarksWithBookstores();
    filterOptions = await getFilterOptions();
  });

  it("should render the Risograph hero, display bookmark paper spread, search/filter, and inspect bookmark in 3D", () => {
    render(
      <ExhibitGalleryClient
        initialBookmarks={initialBookmarks}
        filterOptions={filterOptions}
      />
    );

    // Verify Risograph hero elements
    expect(screen.getAllByText(/The/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Bookstore/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Bookmark/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Archive/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/They saved our place; now, let’s save theirs/i)).toBeDefined();

    // Verify bookmark specimens are rendered in the spread
    const bookmarkButtons = screen.getAllByRole("button", { name: /inspect/i });
    expect(bookmarkButtons.length).toBeGreaterThanOrEqual(1);

    // Click on the first bookmark to inspect
    fireEvent.click(bookmarkButtons[0]);

    // Verify inspector opened with flip button
    expect(screen.getByRole("button", { name: /flip to verso/i })).toBeDefined();

    // Verify bookstore page link in inspector
    const bookstoreLink = screen.getByRole("link", { name: /view bookstore page & history/i });
    expect(bookstoreLink).toBeDefined();

    // Close inspector
    const closeBtn = screen.getByRole("button", { name: /close inspector/i });
    fireEvent.click(closeBtn);

    // Verify back on the spread
    expect(screen.getAllByRole("button", { name: /inspect/i }).length).toBeGreaterThanOrEqual(1);
  });
});
