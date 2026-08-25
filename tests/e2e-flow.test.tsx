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

  it("should render the full interactive gallery, filter bookmarks, open 3D inspector, and transition to dossier", () => {
    render(
      <ExhibitGalleryClient
        initialBookmarks={initialBookmarks}
        filterOptions={filterOptions}
      />
    );

    // Verify main title / tray
    expect(screen.getByText(/Tray I of/i)).toBeDefined();

    // Verify bookmarks rendered
    const stores = screen.getAllByText(/Gotham Book Mart/i);
    expect(stores.length).toBeGreaterThanOrEqual(1);
    const parisStores = screen.getAllByText(/Shakespeare and Company/i);
    expect(parisStores.length).toBeGreaterThanOrEqual(1);

    // Click on Gotham bookmark to inspect
    const gothamCard = screen.getAllByRole("button", { name: /gotham book mart/i })[0];
    fireEvent.click(gothamCard);

    // Verify inspector opened with flip button
    expect(screen.getByRole("button", { name: /flip to verso/i })).toBeDefined();

    // Open dossier from inspector
    const dossierBtn = screen.getByRole("button", { name: /read full bookstore dossier/i });
    fireEvent.click(dossierBtn);

    // Verify bookstore research dossier opened
    const founders = screen.getAllByText(/Frances Steloff/i);
    expect(founders.length).toBeGreaterThanOrEqual(1);
    const mottos = screen.getAllByText(/Wise Men Fish Here/i);
    expect(mottos.length).toBeGreaterThanOrEqual(1);

    // Close dossier
    const closeDossier = screen.getByRole("button", { name: /close dossier/i });
    fireEvent.click(closeDossier);
  });
});
