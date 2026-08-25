import { describe, it, expect } from "vitest";
import { seedDatabase } from "@/db/seed";
import { db } from "@/db";
import { bookmarks, bookstores, archivalMedia } from "@/db/schema";

describe("Seed Database", () => {
  it("should populate the database with initial curated historic bookstores, bookmarks, and clippings", async () => {
    await seedDatabase();

    const allBookstores = await db.select().from(bookstores);
    const allBookmarks = await db.select().from(bookmarks);
    const allMedia = await db.select().from(archivalMedia);

    expect(allBookstores.length).toBeGreaterThanOrEqual(4);
    expect(allBookmarks.length).toBeGreaterThanOrEqual(4);
    expect(allMedia.length).toBeGreaterThanOrEqual(4);

    // Verify Gotham Book Mart
    const gotham = allBookstores.find((b) => b.id === "gotham-book-mart");
    expect(gotham).toBeDefined();
    expect(gotham?.name).toBe("Gotham Book Mart");
    expect(gotham?.city).toBe("New York");
    expect(gotham?.historicalBlurb).toContain("Frances Steloff");

    // Verify City Lights
    const cityLights = allBookstores.find((b) => b.id === "city-lights-books");
    expect(cityLights).toBeDefined();
    expect(cityLights?.isStillOperating).toBe(true);

    // Verify Shakespeare and Company
    const shakespeare = allBookstores.find((b) => b.id === "shakespeare-and-company");
    expect(shakespeare).toBeDefined();

    // Verify Kroch's & Brentano's
    const krochs = allBookstores.find((b) => b.id === "krochs-and-brentanos");
    expect(krochs).toBeDefined();
    expect(krochs?.yearClosed).toBe(1995);
  });
});
