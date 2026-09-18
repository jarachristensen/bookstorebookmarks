import { describe, it, expect, beforeAll } from "vitest";
import { seedDatabase } from "@/db/seed";
import { bulkUpdateBookmarks, saveBookmarkAndBookstore } from "@/lib/db/mutations";
import { getBookmarkBySlug } from "@/lib/db/queries";
import { PUT } from "@/app/api/bookmarks/bulk/route";
import { NextRequest } from "next/server";

describe("Bulk Edit Bookmarks", () => {
  beforeAll(async () => {
    await seedDatabase();
  });

  it("should update titles and dimensions for multiple bookmarks in batch", async () => {
    const bm1Id = `test-bulk-bm1-${Date.now()}`;
    const bm2Id = `test-bulk-bm2-${Date.now()}`;

    await saveBookmarkAndBookstore({
      bookmark: {
        id: bm1Id,
        title: "Original Title 1",
        dimensions: '2.0" × 6.0"',
        frontImageUrl: "/seed-images/gotham-front.svg",
        material: "Paper",
        condition: "Good",
      },
      bookstore: {
        name: "Test Bulk Bookstore 1",
        city: "Seattle",
        country: "United States",
        yearOpened: 1980,
        historicalBlurb: "Test blurb",
      },
    });

    await saveBookmarkAndBookstore({
      bookmark: {
        id: bm2Id,
        title: "Original Title 2",
        dimensions: '2.5" × 7.0"',
        frontImageUrl: "/seed-images/gotham-front.svg",
        material: "Cardstock",
        condition: "Fine",
      },
      bookstore: {
        name: "Test Bulk Bookstore 2",
        city: "Portland",
        country: "United States",
        yearOpened: 1990,
        historicalBlurb: "Test blurb",
      },
    });

    const updatedCount = await bulkUpdateBookmarks([
      { id: bm1Id, title: "Renamed Title 1", dimensions: '2.25" × 7.5"' },
      { id: bm2Id, title: "Renamed Title 2", dimensions: '7.0" × 2.0"' },
    ]);

    expect(updatedCount).toBe(2);

    const b1 = await getBookmarkBySlug(bm1Id);
    expect(b1?.title).toBe("Renamed Title 1");
    expect(b1?.dimensions).toBe('2.25" × 7.5"');

    const b2 = await getBookmarkBySlug(bm2Id);
    expect(b2?.title).toBe("Renamed Title 2");
    expect(b2?.dimensions).toBe('7.0" × 2.0"');
  });

  it("should handle empty or whitespace values gracefully", async () => {
    const bmId = `test-bulk-bm3-${Date.now()}`;

    await saveBookmarkAndBookstore({
      bookmark: {
        id: bmId,
        title: "Original Title 3",
        dimensions: '2.0" × 5.0"',
        frontImageUrl: "/seed-images/gotham-front.svg",
        material: "Paper",
        condition: "Good",
      },
      bookstore: {
        name: "Test Bookstore 3",
        city: "Austin",
        country: "United States",
        yearOpened: 2000,
        historicalBlurb: "Test blurb",
      },
    });

    // Only update dimensions, leave title empty string
    const updatedCount = await bulkUpdateBookmarks([
      { id: bmId, title: "   ", dimensions: '3.0" × 8.0"' },
    ]);

    expect(updatedCount).toBe(1);

    const b = await getBookmarkBySlug(bmId);
    expect(b?.title).toBe("Original Title 3"); // title unmodified
    expect(b?.dimensions).toBe('3.0" × 8.0"');
  });

  it("should respond with 401 on bulk route if unauthorized", async () => {
    const req = new NextRequest("http://localhost:3000/api/bookmarks/bulk", {
      method: "PUT",
      body: JSON.stringify({ updates: [] }),
    });

    const res = await PUT(req);
    expect(res.status).toBe(401);
  });
});
