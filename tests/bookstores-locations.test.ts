import { describe, it, expect, beforeAll } from "vitest";
import { db, initDb } from "@/db";
import { bookstores, BookstoreLocation } from "@/db/schema";
import { saveBookstoreDossier } from "@/lib/db/mutations";
import { getBookstoreById } from "@/lib/db/queries";
import { eq } from "drizzle-orm";

describe("Bookstore Multi-Location & Relocation Modeling", () => {
  beforeAll(async () => {
    await initDb();
  });

  it("should save and retrieve bookstore with multiple relocation addresses and storefront tags", async () => {
    const storeId = `fake-book-store-${Date.now()}`;
    const testLocations: BookstoreLocation[] = [
      {
        id: "loc-1",
        label: "1st Location",
        streetAddress: "123 Fake Street",
        city: "New York",
        stateProvince: "NY",
        country: "United States",
        yearsActive: "1950–1955",
        isMovedFrom: true,
        isCurrent: false,
      },
      {
        id: "loc-2",
        label: "2nd Location",
        streetAddress: "458 Faker Street",
        city: "New York",
        stateProvince: "NY",
        country: "United States",
        yearsActive: "1956–1970",
        isMovedFrom: false,
        isCurrent: true,
      },
      {
        id: "loc-3",
        label: "New Location / Branch",
        streetAddress: "888 Weirdo Street",
        city: "New York",
        stateProvince: "NY",
        country: "United States",
        yearsActive: "1968–Present",
        isMovedFrom: false,
        isCurrent: true,
      },
    ];

    await saveBookstoreDossier({
      bookstore: {
        id: storeId,
        name: "Fake Book Store",
        city: "New York",
        stateProvince: "NY",
        country: "United States",
        yearOpened: 1950,
        isStillOperating: true,
        locations: testLocations,
        historicalBlurb: "Historical research blurb for Fake Book Store.",
      },
      archivalMedia: [
        {
          id: `media-sf-${storeId}`,
          mediaType: "photo",
          imageUrl: "/uploads/storefront-test.jpg",
          caption: "Historic 1950 Storefront on Fake Street",
          isStorefront: true,
        },
      ],
    });

    const fetched = await getBookstoreById(storeId);
    expect(fetched).toBeDefined();
    expect(fetched?.name).toBe("Fake Book Store");
    expect(fetched?.locations).toBeDefined();

    const parsedLocs: BookstoreLocation[] = JSON.parse(fetched!.locations!);
    expect(parsedLocs.length).toBe(3);
    expect(parsedLocs[0].label).toBe("1st Location");
    expect(parsedLocs[0].isMovedFrom).toBe(true);
    expect(parsedLocs[1].streetAddress).toBe("458 Faker Street");
    expect(parsedLocs[2].label).toBe("New Location / Branch");

    // Verify storefront media item
    expect(fetched?.archivalMedia.length).toBe(1);
    expect(fetched?.archivalMedia[0].isStorefront).toBe(true);

    // Clean up
    await db.delete(bookstores).where(eq(bookstores.id, storeId));
  });
});
