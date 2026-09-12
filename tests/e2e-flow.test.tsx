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

  it("should render the flat-file cabinet closed, pull open a drawer, inspect a bookmark in 3D, and navigate to bookstore page", () => {
    render(
      <ExhibitGalleryClient
        initialBookmarks={initialBookmarks}
        filterOptions={filterOptions}
      />
    );

    // Verify cabinet is closed with state drawer buttons
    expect(screen.getAllByText(/New York/i).length).toBeGreaterThanOrEqual(1);

    // Pull open the New York state drawer
    const nyDrawer = screen.getByRole("button", { name: /open new york/i });
    fireEvent.click(nyDrawer);

    // Verify drawer opened with bookmarks rendered
    const gothamButtons = screen.getAllByRole("button", { name: /gotham book mart/i });
    expect(gothamButtons.length).toBeGreaterThanOrEqual(1);

    // Click on Gotham bookmark to inspect
    fireEvent.click(gothamButtons[0]);

    // Verify inspector opened with flip button
    expect(screen.getByRole("button", { name: /flip to verso/i })).toBeDefined();

    // Verify bookstore page link in inspector
    const bookstoreLink = screen.getByRole("link", { name: /view bookstore page & history/i });
    expect(bookstoreLink).toBeDefined();
    expect(bookstoreLink.getAttribute("href")).toBe("/bookstores/gotham-book-mart");

    // Close inspector
    const closeBtn = screen.getByRole("button", { name: /close inspector/i });
    fireEvent.click(closeBtn);

    // Push drawer back in / close cabinet
    const pushInBtn = screen.getByRole("button", { name: /push drawer in/i });
    fireEvent.click(pushInBtn);

    // Verify back in closed cabinet state
    expect(screen.getByRole("button", { name: /open new york/i })).toBeDefined();
  });
});
