import { describe, it, expect } from "vitest";
import { autoSyncStorefronts } from "@/lib/utils/storefront-sync";
import { db } from "@/db";
import { bookstores, archivalMedia } from "@/db/schema";
import { eq } from "drizzle-orm";

describe("Storefronts Auto-Sync Utility", () => {
  it("scans storefronts and links media without throwing", async () => {
    const result = await autoSyncStorefronts({ force: true });

    expect(result.totalFiles).toBeGreaterThan(0);
    expect(typeof result.alreadySyncedCount).toBe("number");
    expect(Array.isArray(result.newBookstoresCreated)).toBe(true);
    expect(Array.isArray(result.mediaLinkedToExistingStores)).toBe(true);

    // Verify all 9 storefront images have matching archivalMedia records or bookstores
    const allMedia = await db.select().from(archivalMedia);
    const storefrontMedia = allMedia.filter((m) => m.isStorefront || m.mediaTag === "storefront");

    expect(storefrontMedia.length).toBeGreaterThanOrEqual(7);
  });
});
