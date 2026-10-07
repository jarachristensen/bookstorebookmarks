import { describe, it, expect, beforeAll } from "vitest";
import { seedDatabase } from "@/db/seed";
import {
  createNonBookstoreBookmark,
  bulkUpdateNonBookstoreBookmarks,
} from "@/lib/db/mutations";
import { getNonBookstoreBookmarkById } from "@/lib/db/queries";
import { PUT } from "@/app/api/other-bookmarks/bulk/route";
import { NextRequest } from "next/server";

describe("Bulk Edit Other Bookmarks", () => {
  beforeAll(async () => {
    await seedDatabase();
  });

  it("should update titles, tags, and trade quantities for multiple non-bookstore bookmarks", async () => {
    const obm1Id = await createNonBookstoreBookmark({
      title: "Initial Other 1",
      category: "Libraries",
      tags: ["Libraries"],
      frontImageUrl: "/seed-images/other-1.png",
      tradeQuantity: 1,
    });

    const obm2Id = await createNonBookstoreBookmark({
      title: "Initial Other 2",
      category: "Publishers",
      tags: ["Publishers"],
      frontImageUrl: "/seed-images/other-2.png",
      tradeQuantity: 3,
    });

    const updatedCount = await bulkUpdateNonBookstoreBookmarks([
      {
        id: obm1Id,
        title: "Bulk Updated Title 1",
        category: "Authors",
        tags: ["Authors", "Vintage"],
        tradeQuantity: 5,
      },
      {
        id: obm2Id,
        title: "Bulk Updated Title 2",
        tradeQuantity: 0,
      },
    ]);

    expect(updatedCount).toBe(2);

    const item1 = await getNonBookstoreBookmarkById(obm1Id);
    expect(item1?.title).toBe("Bulk Updated Title 1");
    expect(item1?.category).toBe("Authors");
    expect(item1?.tradeQuantity).toBe(5);

    const item2 = await getNonBookstoreBookmarkById(obm2Id);
    expect(item2?.title).toBe("Bulk Updated Title 2");
    expect(item2?.tradeQuantity).toBe(0);
  });

  it("should handle empty or no-op bulk updates gracefully", async () => {
    const count = await bulkUpdateNonBookstoreBookmarks([]);
    expect(count).toBe(0);
  });

  it("rejects unauthorized API requests without curator session", async () => {
    const req = new NextRequest("http://localhost:3000/api/other-bookmarks/bulk", {
      method: "PUT",
      body: JSON.stringify({
        updates: [{ id: "fake-id", title: "Test" }],
      }),
    });

    const res = await PUT(req);
    expect(res.status).toBe(401);
  });
});
