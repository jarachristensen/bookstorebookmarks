import { describe, it, expect, beforeAll } from "vitest";
import { seedDatabase } from "@/db/seed";
import {
  getBookmarksWithBookstores,
  getBookmarkBySlug,
  getAllBookstores,
  getFilterOptions,
} from "@/lib/db/queries";

describe("Data Access Queries", () => {
  beforeAll(async () => {
    await seedDatabase();
  });

  it("should fetch all bookmarks with their joined bookstore and media records", async () => {
    const results = await getBookmarksWithBookstores();
    expect(results.length).toBeGreaterThanOrEqual(4);

    const gothamBm = results.find((b) => b.id === "gotham-wise-men-fish-here");
    expect(gothamBm).toBeDefined();
    expect(gothamBm?.bookstore).toBeDefined();
    expect(gothamBm?.bookstore?.name).toBe("Gotham Book Mart");
    expect(gothamBm?.bookstore?.archivalMedia?.length).toBeGreaterThanOrEqual(1);
  });

  it("should filter bookmarks by search query, city, and status", async () => {
    const parisResults = await getBookmarksWithBookstores({ city: "Paris" });
    expect(parisResults.length).toBe(1);
    expect(parisResults[0].bookstore?.city).toBe("Paris");

    const searchResults = await getBookmarksWithBookstores({ search: "Ferlinghetti" });
    expect(searchResults.length).toBe(1);
    expect(searchResults[0].bookstore?.name).toBe("City Lights Booksellers & Publishers");

    const openOnly = await getBookmarksWithBookstores({ status: "open" });
    expect(openOnly.every((b) => b.bookstore?.isStillOperating)).toBe(true);
  });

  it("should fetch a single bookmark by slug", async () => {
    const bookmark = await getBookmarkBySlug("gotham-wise-men-fish-here");
    expect(bookmark).toBeDefined();
    expect(bookmark?.title).toContain("Wise Men Fish Here");
    expect(bookmark?.bookstore?.name).toBe("Gotham Book Mart");
  });

  it("should return distinct filter options for the catalog controls", async () => {
    const filters = await getFilterOptions();
    expect(filters.cities).toContain("New York");
    expect(filters.cities).toContain("Paris");
    expect(filters.cities).toContain("San Francisco");
    expect(filters.cities).toContain("Chicago");
    expect(filters.specialties.length).toBeGreaterThan(0);
  });
});
