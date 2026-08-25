import { describe, it, expect, beforeAll } from "vitest";
import { seedDatabase } from "@/db/seed";
import {
  getBookmarksWithBookstores,
  getBookmarkBySlug,
  getAllBookstores,
  getBookstoreById,
  getFilterOptions,
} from "@/lib/db/queries";

describe("Data Access Queries", () => {
  beforeAll(async () => {
    await seedDatabase();
  });

  it("should fetch all seeded bookmarks with joined bookstore data and media", async () => {
    const bookmarks = await getBookmarksWithBookstores();
    expect(bookmarks.length).toBeGreaterThanOrEqual(4);

    const gotham = bookmarks.find((b) => b.id === "gotham-wise-men-fish-here");
    expect(gotham).toBeDefined();
    expect(gotham?.bookstore?.name).toBe("Gotham Book Mart");
    expect(gotham?.bookstore?.archivalMedia.length).toBeGreaterThanOrEqual(1);
  });

  it("should filter bookmarks by search query, city, and status", async () => {
    const parisResults = await getBookmarksWithBookstores({ city: "Paris" });
    expect(parisResults.length).toBeGreaterThanOrEqual(1);
    expect(parisResults[0].bookstore?.city).toBe("Paris");

    const searchResults = await getBookmarksWithBookstores({ search: "Ferlinghetti" });
    expect(searchResults.length).toBe(1);
    expect(searchResults[0].bookstore?.name).toBe("City Lights Booksellers & Publishers");
  });

  it("should fetch single bookmark by slug with full dossier", async () => {
    const bookmark = await getBookmarkBySlug("shakespeare-kilometre-zero");
    expect(bookmark).toBeDefined();
    expect(bookmark?.bookstore?.name).toBe("Shakespeare and Company");
    expect(bookmark?.bookstore?.city).toBe("Paris");
    expect(bookmark?.bookstore?.archivalMedia.length).toBeGreaterThanOrEqual(1);
  });

  it("should extract distinct filter options", async () => {
    const options = await getFilterOptions();
    expect(options.cities).toContain("New York");
    expect(options.cities).toContain("Paris");
    expect(options.eras.length).toBeGreaterThan(0);
  });
});
