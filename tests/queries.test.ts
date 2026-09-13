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

  it("should filter bookmarks by search query, city, country, and status", async () => {
    const parisResults = await getBookmarksWithBookstores({ city: "Paris" });
    expect(parisResults.length).toBeGreaterThanOrEqual(1);
    expect(parisResults[0].bookstore?.city).toBe("Paris");

    const franceResults = await getBookmarksWithBookstores({ country: "France" });
    expect(franceResults.length).toBeGreaterThanOrEqual(1);
    expect(franceResults[0].bookstore?.country).toBe("France");

    const caResults = await getBookmarksWithBookstores({ state: "CA" });
    expect(caResults.length).toBeGreaterThanOrEqual(1);
    expect(caResults[0].bookstore?.stateProvince).toBe("CA");

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

  it("should extract distinct filter options including countries and states", async () => {
    const options = await getFilterOptions();
    expect(options.cities).toContain("New York");
    expect(options.cities).toContain("Paris");
    expect(options.states).toContain("CA");
    expect(options.states).toContain("NY");
    expect(options.countries).toContain("United States");
    expect(options.countries).toContain("France");
    expect(options.eras.length).toBeGreaterThan(0);
  });
});
