import { describe, it, expect, beforeAll } from "vitest";
import { seedDatabase } from "@/db/seed";
import {
  generateUniqueBookstoreId,
  saveBookmarkAndBookstore,
  saveBookstoreDossier,
} from "@/lib/db/mutations";
import { getBookstoreById, getBookmarkBySlug } from "@/lib/db/queries";

describe("Bookstores with Same Name", () => {
  beforeAll(async () => {
    await seedDatabase();
  });

  it("should generate distinct unique slugs for stores with same name in different cities", async () => {
    const ts = Date.now();
    const storeName = `The Unique Shelf ${ts}`;
    const slug1 = await generateUniqueBookstoreId(storeName, "Cincinnati", "OH");
    expect(slug1).toContain("the-unique-shelf");
    expect(slug1).toContain("cincinnati-oh");

    // First save a store with this ID to the DB
    await saveBookstoreDossier({
      bookstore: {
        id: slug1,
        name: storeName,
        city: "Cincinnati",
        stateProvince: "OH",
        country: "United States",
        streetAddress: "7754 Camargo Rd",
        yearOpened: 1974,
        historicalBlurb: "Cincinnati location",
      },
    });

    // Generate for second store with same name in a different city
    const slug2 = await generateUniqueBookstoreId(storeName, "Bozeman", "MT");
    expect(slug2).toContain("the-unique-shelf");
    expect(slug2).toContain("bozeman-mt");
    expect(slug2).not.toBe(slug1);

    // Save second store
    await saveBookstoreDossier({
      bookstore: {
        id: slug2,
        name: storeName,
        city: "Bozeman",
        stateProvince: "MT",
        country: "United States",
        streetAddress: "123 Main Street",
        yearOpened: 1995,
        historicalBlurb: "Bozeman location",
      },
    });

    // Check both stores exist independently in database
    const store1 = await getBookstoreById(slug1);
    const store2 = await getBookstoreById(slug2);

    expect(store1).toBeDefined();
    expect(store1?.name).toBe(storeName);
    expect(store1?.city).toBe("Cincinnati");
    expect(store1?.streetAddress).toBe("7754 Camargo Rd");

    expect(store2).toBeDefined();
    expect(store2?.name).toBe(storeName);
    expect(store2?.city).toBe("Bozeman");
    expect(store2?.streetAddress).toBe("123 Main Street");
  });

  it("should not overwrite existing store address when creating a second store with identical name and city", async () => {
    const timestamp = Date.now();
    const storeName = `Corner Books ${timestamp}`;

    // Create 1st bookmark & bookstore
    const bm1Id = `bm-corner-1-${timestamp}`;
    await saveBookmarkAndBookstore({
      bookmark: {
        id: bm1Id,
        title: "Corner Books Branch 1 Bookmark",
        dimensions: '2.0" × 7.0"',
        frontImageUrl: "/seed-images/gotham-front.svg",
        material: "Paper",
        condition: "Good",
      },
      bookstore: {
        name: storeName,
        city: "Chicago",
        stateProvince: "IL",
        country: "United States",
        streetAddress: "100 North State St",
        yearOpened: 1960,
        historicalBlurb: "First store history",
      },
    });

    const bm1 = await getBookmarkBySlug(bm1Id);
    expect(bm1?.bookstore).toBeDefined();
    const firstStoreId = bm1!.bookstore!.id;
    expect(bm1?.bookstore?.streetAddress).toBe("100 North State St");

    // Create 2nd bookmark & bookstore with the same name and city, but different address and no bookstoreId passed (new bookstore)
    const bm2Id = `bm-corner-2-${timestamp}`;
    await saveBookmarkAndBookstore({
      bookmark: {
        id: bm2Id,
        title: "Corner Books Branch 2 Bookmark",
        dimensions: '2.25" × 7.5"',
        frontImageUrl: "/seed-images/gotham-front.svg",
        material: "Cardstock",
        condition: "Fine",
      },
      bookstore: {
        name: storeName,
        city: "Chicago",
        stateProvince: "IL",
        country: "United States",
        streetAddress: "500 South Michigan Ave",
        yearOpened: 1985,
        historicalBlurb: "Second store history",
      },
    });

    const bm2 = await getBookmarkBySlug(bm2Id);
    expect(bm2?.bookstore).toBeDefined();
    const secondStoreId = bm2!.bookstore!.id;

    // Must be two distinct bookstore IDs
    expect(secondStoreId).not.toBe(firstStoreId);

    // Verify first store's address was preserved and NOT overwritten
    const store1Refetch = await getBookstoreById(firstStoreId);
    expect(store1Refetch?.streetAddress).toBe("100 North State St");

    // Verify second store's address is correct
    const store2Refetch = await getBookstoreById(secondStoreId);
    expect(store2Refetch?.streetAddress).toBe("500 South Michigan Ave");
  });
});
